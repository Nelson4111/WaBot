'use strict';

const cron = require('node-cron');
const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');

const log = createModuleLogger('AntiAfk');

/** Gerakan kecil yang dilakukan untuk anti-AFK */
const ACTIONS = ['look', 'sneak', 'walk'];

/** Durasi walk singkat untuk gerakan anti-AFK (ticks) */
const WALK_DURATION_TICKS = 2;

/**
 * AntiAfk mencegah bot di-kick karena idle terlalu lama.
 * Setiap N detik, bot melakukan salah satu gerakan kecil acak:
 * - look: mengarahkan pandangan ke arah acak
 * - sneak: shift singkat
 * - walk: melangkah kecil ke salah satu arah
 *
 * AntiAfk otomatis pause saat farming atau berjalan ke waypoint
 * agar tidak mengganggu navigasi.
 */
class AntiAfk {
  /**
   * @param {import('mineflayer').Bot} bot
   */
  constructor(bot) {
    this.bot = bot;
    this.isActive = false;
    this._cronJob = null;
    this._isPaused = false;
  }

  /**
   * Mulai siklus anti-AFK.
   *
   * @returns {void}
   */
  start() {
    if (!config.antiAfk.enabled) {
      log.info('AntiAfk dinonaktifkan di config');
      return;
    }

    const intervalSecs = config.antiAfk.intervalSeconds;
    // Cron expression: setiap N detik
    const cronExpression = `*/${intervalSecs} * * * * *`;

    this._cronJob = cron.schedule(cronExpression, () => {
      this._performAction();
    });

    this.isActive = true;
    log.info(`AntiAfk aktif — aksi setiap ${intervalSecs} detik`);
  }

  /**
   * Pause anti-AFK sementara (digunakan saat farming/pathfinding aktif).
   *
   * @returns {void}
   */
  pause() {
    this._isPaused = true;
    log.debug('AntiAfk di-pause');
  }

  /**
   * Resume anti-AFK setelah di-pause.
   *
   * @returns {void}
   */
  resume() {
    this._isPaused = false;
    log.debug('AntiAfk di-resume');
  }

  /**
   * Lakukan salah satu aksi anti-AFK secara acak.
   *
   * @private
   */
  _performAction() {
    if (this._isPaused || !this.bot.entity) return;

    const allowedActions = config.antiAfk.actions.filter((a) => ACTIONS.includes(a));
    if (allowedActions.length === 0) return;

    const action = allowedActions[Math.floor(Math.random() * allowedActions.length)];

    try {
      switch (action) {
        case 'look':
          this._doLook();
          break;
        case 'sneak':
          this._doSneak();
          break;
        case 'walk':
          this._doWalk();
          break;
        default:
          break;
      }
    } catch (err) {
      log.debug(`Error saat aksi anti-AFK '${action}': ${err.message}`);
    }
  }

  /**
   * Arahkan pandangan bot ke arah acak (kiri/kanan, atas/bawah sedikit).
   *
   * @private
   */
  _doLook() {
    const yaw = this.bot.entity.yaw + (Math.random() - 0.5) * 0.5;
    const pitch = (Math.random() - 0.5) * 0.3;
    this.bot.look(yaw, pitch, false);
    log.debug('AntiAfk: look');
  }

  /**
   * Sneak sebentar lalu berdiri lagi.
   *
   * @private
   */
  _doSneak() {
    this.bot.setControlState('sneak', true);
    setTimeout(() => {
      if (this.bot.entity) {
        this.bot.setControlState('sneak', false);
      }
    }, 500);
    log.debug('AntiAfk: sneak');
  }

  /**
   * Melangkah ke arah acak untuk satu tick.
   *
   * @private
   */
  _doWalk() {
    const directions = ['forward', 'back', 'left', 'right'];
    const dir = directions[Math.floor(Math.random() * directions.length)];

    this.bot.setControlState(dir, true);
    setTimeout(() => {
      if (this.bot.entity) {
        this.bot.setControlState(dir, false);
      }
    }, WALK_DURATION_TICKS * 50); // 50ms per tick
    log.debug(`AntiAfk: walk ${dir}`);
  }

  /**
   * Hentikan anti-AFK dan bersihkan cron job.
   *
   * @returns {void}
   */
  stop() {
    if (this._cronJob) {
      this._cronJob.stop();
      this._cronJob = null;
    }
    this.isActive = false;
    this._isPaused = false;

    // Pastikan semua kontrol direset
    try {
      for (const dir of ['forward', 'back', 'left', 'right', 'sneak']) {
        this.bot.setControlState(dir, false);
      }
    } catch (_err) {
      // Abaikan jika bot sudah disconnect
    }

    log.info('AntiAfk dihentikan');
  }
}

module.exports = AntiAfk;
