'use strict';

/**
 * !storage — Memaksa bot melakukan rutinitas auto storage sekarang.
 */
const StorageCommand = {
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    const storageManager = botManager.getModules().storageManager;

    if (!storageManager) {
      chatQueue.send('StorageManager tidak tersedia.');
      return;
    }

    chatQueue.send('Memulai rutinitas storage...');
    await storageManager.storeItems();
  },
};

module.exports = StorageCommand;
