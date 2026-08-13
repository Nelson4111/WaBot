'use strict';

const cron = require('node-cron');
const { createModuleLogger } = require('../utils/logger');
const config = require('../config');

const log = createModuleLogger('HealthCheck');

/**
 * HealthCheck memantau status bot secara periodik.
 * Jika bot terdeteksi tidak online padahal seharusnya,
 * akan log warning dan bisa di-extend untuk trigger reconnect.
 *
 * Juga memantau:
 * - Health bot yang terlalu rendah (warning)
 * - Food yang terlalu rendah (warning)
 */
class HealthCheck {
  /**
   * @param {import('../core/BotManager')} botManager
   */
  constructor(botManager) {
    this.botManager = botManager;
    this._cronJob = null;
  }

  /**
   * Mulai health check periodik.
   *
   * @returns {void}
   */
  start() {
    const intervalMin = config.health.checkIntervalMinutes;
    const cronExpression = `*/${intervalMin} * * * *`;

    this._cronJob = cron.schedule(cronExpression, async () => {
      await this._check();
    });

    log.info(`HealthCheck aktif — cek setiap ${intervalMin} menit`);
  }

  /**
   * Hentikan health check.
   *
   * @returns {void}
   */
  stop() {
    if (this._cronJob) {
      this._cronJob.stop();
      this._cronJob = null;
    }
    log.info('HealthCheck dihentikan');
  }

  /**
   * Lakukan pemeriksaan health bot.
   *
   * @private
   */
  async _check() {
    const status = this.botManager.getStatus();

    if (!status.online) {
      log.warn('HealthCheck: Bot sedang offline (reconnect mungkin sedang berjalan)');
      return;
    }

    // Cek health rendah
    if (status.health <= config.health.lowHealthThreshold) {
      log.warn(`HealthCheck: HP bot sangat rendah! ${status.health}/20`);
    }

    // Cek food rendah
    if (status.food <= 6) {
      log.warn(`HealthCheck: Food bot rendah! ${status.food}/20`);
    }

    log.debug(
      `HealthCheck OK — HP: ${status.health}/20, Food: ${status.food}/20, Mode: ${status.activeModes.join(', ') || 'idle'}`
    );
  }
}

module.exports = HealthCheck;
