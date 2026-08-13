'use strict';

const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');
const { sleep } = require('../../utils/retry');

const log = createModuleLogger('AutoAuth');

/** Kata kunci yang menandakan server meminta login */
const LOGIN_TRIGGER_WORDS = config.auth.loginTriggerWords.map((w) => w.toLowerCase());

/**
 * AutoAuth secara otomatis mendeteksi prompt login dari server
 * (AuthMe-style) dan mengirimkan perintah /login.
 *
 * Fitur:
 * - Deteksi trigger words yang bisa dikonfigurasi
 * - Delay realistis sebelum kirim command (menghindari deteksi bot)
 * - Timeout jika server tidak pernah minta login (server mungkin tanpa AuthMe)
 * - Hanya login sekali per sesi (tidak spam)
 */
class AutoAuth {
  /**
   * @param {import('mineflayer').Bot} bot
   */
  constructor(bot) {
    this.bot = bot;
    this._hasLoggedIn = false;
    this._loginTimeout = null;
    this._messageListener = null;
  }

  /**
   * Mulai mendengarkan pesan login dari server.
   *
   * @returns {void}
   */
  start() {
    if (!config.auth.enabled) {
      log.info('AutoAuth dinonaktifkan di konfigurasi.');
      return;
    }

    if (!config.env.botPassword) {
      log.warn('BOT_PASSWORD tidak diset di .env. AutoAuth dinonaktifkan.');
      return;
    }

    this._hasLoggedIn = false;

    // Set timeout — jika server tidak minta login dalam X detik,
    // kita asumsikan server tidak menggunakan AuthMe
    this._loginTimeout = setTimeout(() => {
      if (!this._hasLoggedIn) {
        log.info('Timeout login — server tidak meminta autentikasi dalam waktu yang ditentukan');
      }
    }, config.auth.loginTimeoutMs);

    // Listener untuk pesan dari server
    this._messageListener = async (jsonMsg) => {
      if (this._hasLoggedIn) return;

      const text = jsonMsg.toString().toLowerCase();
      const isLoginPrompt = text.includes('login') || text.includes('masuk') || text.includes('log in');
      const isRegisterPrompt = text.includes('register') || text.includes('daftar') || text.includes('reg ');

      if (isRegisterPrompt) {
        log.info('Perintah register terdeteksi dari server');
        await this._doAuth('register');
      } else if (isLoginPrompt) {
        log.info('Perintah login terdeteksi dari server');
        await this._doAuth('login');
      }
    };

    this.bot.on('message', this._messageListener);
    log.info('AutoAuth aktif — menunggu prompt login/register dari server');
  }

  /**
   * Kirim perintah login atau register dengan delay realistis.
   * @param {'login'|'register'} type
   * @private
   */
  async _doAuth(type) {
    this._hasLoggedIn = true;
    clearTimeout(this._loginTimeout);

    if (this._messageListener) {
      this.bot.removeListener('message', this._messageListener);
    }

    await sleep(config.auth?.loginDelayMs || 1500);

    const password = config.env?.botPassword || 'bot123456';

    try {
      if (type === 'register') {
        this.bot.chat(`/register ${password} ${password}`);
        log.success('Perintah /register dikirim');
      } else {
        this.bot.chat(`/login ${password}`);
        log.success('Perintah /login dikirim');
      }
    } catch (err) {
      log.error(`Gagal mengirim perintah ${type}: ${err.message}`);
      this._hasLoggedIn = false;
    }
  }

  /**
   * Hentikan AutoAuth dan bersihkan listener.
   *
   * @returns {void}
   */
  stop() {
    clearTimeout(this._loginTimeout);
    if (this._messageListener) {
      this.bot.removeListener('message', this._messageListener);
      this._messageListener = null;
    }
    this._hasLoggedIn = false;
  }
}

module.exports = AutoAuth;
