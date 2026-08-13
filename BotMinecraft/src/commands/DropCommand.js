'use strict';

/**
 * !drop — Memaksa bot membuang semua item sampah sekarang.
 */
const DropCommand = {
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    const inventoryManager = botManager.getModules().inventoryManager;

    if (!inventoryManager) {
      chatQueue.send('InventoryManager tidak tersedia.');
      return;
    }

    chatQueue.send('Memeriksa dan membuang sampah...');
    await inventoryManager.dropTrash();
  },
};

module.exports = DropCommand;
