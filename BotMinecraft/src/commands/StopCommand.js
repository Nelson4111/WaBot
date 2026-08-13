'use strict';

/**
 * !stop — Hentikan semua aktivitas bot (farm, guard, goto).
 * Bot akan kembali ke mode idle.
 */
const StopCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   */
  async handle(bot, botManager) {
    const modules = botManager.getModules();
    const stopped = [];

    if (modules.mobFarm?.isActive) {
      modules.mobFarm.stop();
      stopped.push('farm');
    }

    if (modules.guardMode?.isActive) {
      modules.guardMode.stop();
      stopped.push('guard');
    }

    if (modules.pathfinder?.isMoving) {
      modules.pathfinder.stop();
      stopped.push('goto');
    }

    if (stopped.length > 0) {
      botManager.getModules().chatQueue.send(`Dihentikan: ${stopped.join(', ')}`);
    } else {
      botManager.getModules().chatQueue.send('Tidak ada aktivitas yang sedang berjalan');
    }
  },
};

module.exports = StopCommand;
