'use strict';

const { createModuleLogger } = require('../utils/logger');
const { incrementStat, updateStats } = require('../services/DataService');


const log = createModuleLogger('DeathHandler');

/** Delay sebelum respawn otomatis (ms) */
const RESPAWN_DELAY_MS = 2000;

/**
 * DeathHandler menangani event kematian bot:
 * - Log alasan kematian
 * - Update statistik
 * - Trigger respawn otomatis (delegasi ke AutoRespawn module)
 */
const DeathHandler = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   */
  attach(bot, botManager) {
    bot.on('death', async () => {
      log.warn('Bot mati! Mencatat statistik kematian...');

      try {
        await incrementStat('totalDeaths');
        if (bot.entity?.position) {
          await updateStats({
            lastDeathPosition: {
              x: Math.floor(bot.entity.position.x),
              y: Math.floor(bot.entity.position.y),
              z: Math.floor(bot.entity.position.z),
            },
            lastDeathAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        log.error(`Gagal update stats kematian: ${err.message}`);
      }

      // Hentikan semua aktivitas farm saat mati
      const { mobFarm, guardMode } = botManager.getModules();
      if (mobFarm?.isActive) {
        mobFarm.stop();
        log.info('Farm mode dihentikan karena bot mati');
      }
      if (guardMode?.isActive) {
        guardMode.stop();
        log.info('Guard mode dihentikan karena bot mati');
      }

      // AutoRespawn module akan handle respawn actual
      // Di sini kita log saja
      log.info(`Respawn akan dilakukan dalam ${RESPAWN_DELAY_MS / 1000}s...`);
    });

    log.info('DeathHandler aktif');
  },
};

module.exports = DeathHandler;
