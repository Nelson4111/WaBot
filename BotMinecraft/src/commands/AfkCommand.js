'use strict';

const { createModuleLogger } = require('../utils/logger');

const log = createModuleLogger('AfkCommand');

/**
 * !afk — Toggle mode AFK murni.
 * Saat AFK mode aktif:
 * - Anti-AFK tetap berjalan (agar tidak di-kick)
 * - Farm dan guard dinonaktifkan
 * - Bot hanya diam dengan gerakan minimal
 */
const AfkCommand = {
  /** @type {boolean} State AFK mode global */
  _afkMode: false,

  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   */
  async handle(bot, botManager) {
    const modules = botManager.getModules();
    AfkCommand._afkMode = !AfkCommand._afkMode;

    if (AfkCommand._afkMode) {
      // Stop semua aktivitas aktif
      if (modules.mobFarm?.isActive) modules.mobFarm.stop();
      if (modules.guardMode?.isActive) modules.guardMode.stop();
      if (modules.pathfinder?.isMoving) modules.pathfinder.stop();

      // AntiAfk tetap jalan
      log.info('AFK mode diaktifkan');
      botManager.getModules().chatQueue.send('AFK mode: ON — Semua aktivitas dihentikan. Anti-AFK tetap aktif.');
    } else {
      log.info('AFK mode dinonaktifkan');
      botManager.getModules().chatQueue.send('AFK mode: OFF — Siap menerima perintah.');
    }
  },
};

module.exports = AfkCommand;
