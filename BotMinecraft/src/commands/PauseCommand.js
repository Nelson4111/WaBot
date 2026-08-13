'use strict';

/**
 * !pause — Menghentikan aktivitas farming/guarding/following sementara.
 */
const PauseCommand = {
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    
    // Stop all active routines
    if (botManager.getModules().mobFarm?.isActive) botManager.getModules().mobFarm.stop();
    if (botManager.getModules().guardMode?.isActive) botManager.getModules().guardMode.stop();
    if (botManager.getModules().followManager?.isFollowing) botManager.getModules().followManager.stopFollow();
    if (botManager.getModules().pathfinder?.isMoving) botManager.getModules().pathfinder.stop();
    
    chatQueue.send('Aktivitas di-pause.');
  },
};

module.exports = PauseCommand;
