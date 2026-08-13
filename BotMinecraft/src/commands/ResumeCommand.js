'use strict';

/**
 * !resume — Melanjutkan farming.
 */
const ResumeCommand = {
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    const mobFarm = botManager.getModules().mobFarm;

    if (!mobFarm) {
      chatQueue.send('MobFarm tidak tersedia.');
      return;
    }

    chatQueue.send('Melanjutkan farming...');
    await mobFarm.start();
  },
};

module.exports = ResumeCommand;
