'use strict';

const mineflayer = require('mineflayer');
const { EventEmitter } = require('events');
const config = require('../config');
const { loadPlugins } = require('./PluginLoader');
const { createModuleLogger } = require('../utils/logger');
const { calculateBackoff } = require('../utils/retry');


const log = createModuleLogger('Connector');

/**
 * Connector mengelola siklus hidup koneksi bot:
 * connect → disconnect → reconnect dengan exponential backoff.
 *
 * Mewarisi EventEmitter agar modul lain bisa subscribe ke event koneksi.
 *
 * Events yang di-emit:
 * - 'connected'    : Bot berhasil join server (bot instance diberikan)
 * - 'disconnected' : Bot disconnect (alasan diberikan)
 * - 'reconnecting' : Sedang mencoba reconnect (attempt & delay diberikan)
 */
class Connector extends EventEmitter {
  constructor(customUsername = null) {
    super();
    this.username = customUsername || config.env.botUsername;

    /** @type {import('mineflayer').Bot|null} Instance bot aktif */
    this.bot = null;

    /** @type {boolean} Apakah sedang dalam proses reconnect */
    this._isReconnecting = false;

    /** @type {boolean} Apakah connector sengaja dihentikan (stop()) */
    this._isStopped = false;

    /** @type {number} Jumlah percobaan reconnect saat ini */
    this._reconnectAttempt = 0;

    /** @type {NodeJS.Timeout|null} Timer reconnect aktif */
    this._reconnectTimer = null;
  }

  /**
   * Buat dan connect instance bot Mineflayer baru.
   * Semua option diambil dari config.
   *
   * @returns {import('mineflayer').Bot} Instance bot yang dibuat
   */
  _createBot() {
    log.info(
      `Menghubungkan ke ${config.env.serverHost}:${config.env.serverPort} sebagai '${this.username}'...`
    );

    const botVersion =
      !config.bot.version ||
      config.bot.version === 'auto' ||
      config.bot.version === 'false' ||
      config.bot.version === false
        ? false
        : config.bot.version;

    // Per-bot Proxy Configuration (SOCKS5 / SOCKS4)
    const sanitizedName = this.username.replace(/[^a-zA-Z0-9]/g, '_');
    const proxyUrl = process.env[`PROXY_${sanitizedName}`] ||
                     process.env[`PROXY_${this.username}`] ||
                     process.env[`PROXY_${sanitizedName.toUpperCase()}`];

    let connectFn = undefined;

    if (proxyUrl) {
      log.info(`[Proxy Engine] Bot '${this.username}' menggunakan proxy: ${proxyUrl.replace(/:[^:@]+@/, ':***@')}`);
      try {
        const { SocksClient } = require('socks');
        const parsedUrl = new URL(proxyUrl);
        const type = parsedUrl.protocol.startsWith('socks4') ? 4 : 5;
        const host = parsedUrl.hostname;
        const port = parseInt(parsedUrl.port, 10) || 1080;
        const userId = parsedUrl.username ? decodeURIComponent(parsedUrl.username) : undefined;
        const password = parsedUrl.password ? decodeURIComponent(parsedUrl.password) : undefined;

        connectFn = (client) => {
          SocksClient.createConnection({
            proxy: {
              host,
              port,
              type,
              userId,
              password
            },
            command: 'connect',
            destination: {
              host: config.env.serverHost,
              port: config.env.serverPort
            }
          }, (err, info) => {
            if (err) {
              log.error(`[Proxy Error] Gagal koneksi SOCKS proxy untuk ${this.username}: ${err.message}`);
              client.emit('error', err);
              return;
            }
            client.setSocket(info.socket);
            client.emit('connect');
          });
        };
      } catch (e) {
        log.error(`[Proxy Config Error] Format Proxy URL tidak valid untuk ${this.username}: ${e.message}`);
      }
    }

    const botOptions = {
      host: config.env.serverHost,
      port: config.env.serverPort,
      username: this.username,
      version: botVersion,
      auth: 'offline', // Untuk server semi-vanilla / offline mode
      viewDistance: config.bot.viewDistance,
      physicsEnabled: config.bot.physicsEnabled,
      chatLengthLimit: config.bot.chatLengthLimit,
    };

    if (connectFn) {
      botOptions.connect = connectFn;
    }

    const bot = mineflayer.createBot(botOptions);

    // Load semua plugin
    loadPlugins(bot);

    return bot;
  }

  /**
   * Mulai koneksi pertama kali.
   * Dipanggil sekali dari BotManager saat aplikasi start.
   *
   * @returns {void}
   */
  connect() {
    if (this._isStopped) {
      log.warn('Connector sudah dihentikan. Panggil reset() terlebih dahulu.');
      return;
    }

    this._doConnect();
  }

  /**
   * Internal: lakukan koneksi dan setup event handler bot.
   *
   * @private
   */
  _doConnect() {
    try {
      this.bot = this._createBot();
      this._attachBotEvents(this.bot);
    } catch (err) {
      log.error(`Gagal membuat instance bot: ${err.message}`);
      this._scheduleReconnect('create_failed');
    }
  }

  /**
   * Attach event listener ke instance bot yang baru dibuat.
   * Event handler didaftarkan di sini, bukan di Mineflayer secara global,
   * agar bisa di-cleanup saat bot diganti (reconnect).
   *
   * @param {import('mineflayer').Bot} bot
   * @private
   */
  _attachBotEvents(bot) {
    // Berhasil spawn di dunia
    bot.once('spawn', () => {
      this._reconnectAttempt = 0;
      this._isReconnecting = false;
      log.success(
        `Bot berhasil spawn di server ${config.env.serverHost}:${config.env.serverPort}`
      );
      this.emit('connected', bot);
    });

    // Bot di-kick dari server
    bot.on('kicked', (reason) => {
      const reasonText = this._parseKickReason(reason);
      log.warn(`Bot di-kick dari server. Alasan: ${reasonText}`);
      this.emit('disconnected', { reason: reasonText, type: 'kicked' });
      this._cleanup();
      this._scheduleReconnect('kicked');
    });

    // Error pada bot
    bot.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        log.warn(`Koneksi ditolak oleh server. Server mungkin offline.`);
      } else if (err.code === 'ENOTFOUND') {
        log.warn(`Host server tidak ditemukan: ${config.env.serverHost}`);
      } else if (err.code === 'ETIMEDOUT') {
        log.warn('Koneksi timeout. Internet mungkin bermasalah.');
      } else {
        log.error(`Error bot: ${err.message}`);
      }
      // Jangan reconnect di sini, biarkan 'end' event yang handle
    });

    // Koneksi terputus
    bot.on('end', (reason) => {
      log.warn(`Koneksi terputus. Alasan: ${reason || 'unknown'}`);
      this.emit('disconnected', { reason: reason || 'unknown', type: 'end' });
      this._cleanup();

      if (!this._isStopped && config.reconnect.enabled) {
        this._scheduleReconnect('end');
      }
    });
  }

  /**
   * Jadwalkan reconnect dengan exponential backoff.
   *
   * @param {string} reason - Alasan reconnect (untuk logging)
   * @private
   */
  _scheduleReconnect(reason) {
    if (this._isStopped || this._isReconnecting) return;

    this._isReconnecting = true;

    const delay = calculateBackoff(this._reconnectAttempt, {
      initialDelayMs: config.reconnect.initialDelayMs,
      maxDelayMs: config.reconnect.maxDelayMs,
      multiplier: config.reconnect.multiplier,
    });

    this._reconnectAttempt++;

    log.info(
      `Reconnect percobaan #${this._reconnectAttempt} dalam ${Math.round(delay / 1000)}s... (alasan: ${reason})`
    );

    this.emit('reconnecting', {
      attempt: this._reconnectAttempt,
      delayMs: delay,
      reason,
    });

    this._reconnectTimer = setTimeout(() => {
      this._isReconnecting = false;
      if (!this._isStopped) {
        this._doConnect();
      }
    }, delay);
  }

  /**
   * Bersihkan instance bot lama dan batalkan event listener.
   *
   * @private
   */
  _cleanup() {
    if (this.bot) {
      try {
        this.bot.removeAllListeners();
        // Coba end koneksi jika masih terbuka
        if (this.bot._client) {
          this.bot._client.end();
        }
      } catch (_err) {
        // Abaikan error saat cleanup
      }
      this.bot = null;
    }
  }

  /**
   * Hentikan connector secara permanen.
   * Setelah stop(), bot tidak akan reconnect lagi.
   *
   * @returns {void}
   */
  stop() {
    log.info('Connector dihentikan. Bot tidak akan reconnect.');
    this._isStopped = true;

    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }

    if (this.bot) {
      try {
        this.bot.quit('Bot disconnect');
      } catch (_err) {}
    }

    this._cleanup();
  }

  /**
   * Reset connector agar bisa digunakan kembali setelah stop().
   *
   * @returns {void}
   */
  reset() {
    this._isStopped = false;
    this._isReconnecting = false;
    this._reconnectAttempt = 0;
  }

  /**
   * Parse alasan kick dari Minecraft (bisa berupa JSON NBT/Chat Component atau string biasa).
   *
   * @param {string|object} reason - Raw kick reason
   * @returns {string} Teks yang bisa dibaca manusia
   * @private
   */
  _parseKickReason(reason) {
    if (!reason) return 'Unknown';

    let raw = reason;
    if (typeof reason === 'string') {
      try {
        raw = JSON.parse(reason);
      } catch {
        return reason;
      }
    }

    if (typeof raw === 'object' && raw !== null) {
      // Minecraft NBT / Chat Component parsing
      if (raw.value && raw.value.text && raw.value.text.value) {
        return raw.value.text.value;
      }
      if (raw.text) {
        return typeof raw.text === 'object' ? (raw.text.value || JSON.stringify(raw.text)) : raw.text;
      }
      if (raw.translate) return raw.translate;
    }

    const str = String(reason);
    if (str.includes('An internal error occurred in your connection')) {
      return 'Sesi bot sebelumnya masih menggantung di server (Ghost Session) — Menunggu server melepas sesi lama...';
    }
    return str;
  }
}

module.exports = Connector;
