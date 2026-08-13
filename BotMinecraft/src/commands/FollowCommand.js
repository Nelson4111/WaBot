'use strict';

/**
 * !follow
 */
const FollowCommand = {
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    const followManager = botManager.getModules().followManager;

    if (!followManager) {
      chatQueue.send('FollowManager tidak tersedia.');
      return;
    }

    followManager.startFollow(sender);
  },
};

module.exports = FollowCommand;
