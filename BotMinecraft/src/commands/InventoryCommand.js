'use strict';

const { formatInventory, formatItemName } = require('../utils/formatter');
const { sleep } = require('../utils/retry');

/**
 * !inventory — Tampilkan isi inventory bot saat ini.
 * Output dikelompokkan agar tidak terlalu panjang di chat.
 */
const InventoryCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   */
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    const inventoryManager = botManager.getModules().inventoryManager;

    if (!inventoryManager) {
      chatQueue.send('InventoryManager tidak tersedia');
      return;
    }

    const sum = inventoryManager.getSummary();
    if (!sum) {
      chatQueue.send('Inventory tidak tersedia');
      return;
    }

    chatQueue.send(`Inv: ${sum.pearlCount} Pearl, ${sum.foodCount} Food, ${sum.swordCount} Sword, ${sum.emptySlots} Slot Kosong`);
  },
};

module.exports = InventoryCommand;
