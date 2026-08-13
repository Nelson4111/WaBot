'use strict';

/**
 * !come
 */
const ComeCommand = {
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    const followManager = botManager.getModules().followManager;

    if (!followManager) {
      chatQueue.send('FollowManager tidak tersedia.');
      return;
    }

    followManager.comeTo(sender);
  },
};

module.exports = ComeCommand;
