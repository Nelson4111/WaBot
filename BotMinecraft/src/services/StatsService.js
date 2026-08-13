'use strict';

const cron = require('node-cron');
const { createModuleLogger } = require('../utils/logger');
const { getStats, updateStats } = require('./DataService');
const config = require('../config');

const log = createModuleLogger('StatsService');

/**
 * StatsService menyimpan statistik bot secara berkala ke disk.
 * Ini memastikan data statistik tidak hilang jika bot crash atau restart.
 *
 * Data yang disimpan:
 * - Total waktu online (dihitung dari connectedAt)
 * - Total kematian, login, reconnect (di-increment di tempat lain)
 * - Posisi terakhir, last seen timestamp
 */
class StatsService {
  /**
   * @param {import('../core/BotManager')} botManager
   */
  constructor(botManager) {
    this.botManager = botManager;
    this._cronJob = null;
  }

  /**
   * Mulai auto-save statistik menggunakan cron job.
   *
   * @returns {void}
   */
  start() {
    const intervalMin = config.stats.saveIntervalMinutes;
    const cronExpression = `*/${intervalMin} * * * *`;

    this._cronJob = cron.schedule(cronExpression, async () => {
      await this._saveStats();
    });

    log.info(`StatsService aktif — simpan setiap ${intervalMin} menit`);
  }

  /**
   * Hentikan auto-save.
   *
   * @returns {void}
   */
  stop() {
    if (this._cronJob) {
      this._cronJob.stop();
      this._cronJob = null;
    }
    log.info('StatsService dihentikan');
  }

  /**
   * Ambil statistik terbaru (gabungan dari file + status bot live).
   *
   * @returns {Promise<object>}
   */
  async getFullStats() {
    const savedStats = await getStats();
    const botStatus = this.botManager.getStatus();

    return {
      ...savedStats,
      currentSession: {
        online: botStatus.online,
        connectedAt: botStatus.connectedAt,
        startedAt: botStatus.startedAt,
        health: botStatus.health,
        food: botStatus.food,
        position: botStatus.position,
        activeModes: botStatus.activeModes,
      },
    };
  }

  /**
   * Simpan statistik saat ini ke file.
   *
   * @private
   */
  async _saveStats() {
    try {
      const status = this.botManager.getStatus();
      if (!status.online) return;

      await updateStats({
        lastSeen: new Date().toISOString(),
        lastPosition: status.position,
      });

      log.debug('Statistik disimpan');
    } catch (err) {
      log.error(`Gagal menyimpan statistik: ${err.message}`);
    }
  }
}

module.exports = StatsService;
