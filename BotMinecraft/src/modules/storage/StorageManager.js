'use strict';

const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');
const { getWaypoint } = require('../../services/DataService');
const { sleep } = require('../../utils/retry');

const log = createModuleLogger('StorageManager');

/**
 * StorageManager bertanggung jawab untuk mencari chest (berdasarkan waypoint),
 * membuka chest, dan mendepositkan item-item yang bukan priority/protected.
 */
class StorageManager {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../movement/Pathfinder')} pathfinder
   * @param {import('../chat/ChatQueue')} chatQueue
   */
  constructor(bot, pathfinder, chatQueue) {
    this.bot = bot;
    this.pathfinder = pathfinder;
    this.chatQueue = chatQueue;
    this.isStoring = false;
  }

  /**
   * Melakukan proses auto storage.
   * Pergi ke waypoint storage, buka chest, store barang, dan tutup.
   */
  async storeItems() {
    if (!config.storage.enabled) {
        log.warn('Auto Storage dinonaktifkan di config.');
        return false;
    }

    if (this.isStoring) return true;
    this.isStoring = true;

    try {
      const wpName = config.storage.chestWaypoint || 'storage';
      const waypoint = await getWaypoint(wpName);

      if (!waypoint) {
        log.warn(`Waypoint chest '${wpName}' tidak ditemukan.`);
        if (this.chatQueue) this.chatQueue.send(`Gagal storage: Waypoint '${wpName}' belum diset.`);
        this.isStoring = false;
        return false;
      }

      if (this.chatQueue) this.chatQueue.send(`Menuju chest storage...`);

      // Pergi ke chest
      await this.pathfinder.goto(waypoint.x, waypoint.z, waypoint.y, 2);

      // Cari block chest di sekitar bot
      const chestBlock = this.bot.findBlock({
        matching: (block) => ['chest', 'trapped_chest', 'barrel'].includes(block.name),
        maxDistance: 4,
      });

      if (!chestBlock) {
        log.warn('Tidak menemukan block chest di sekitar waypoint.');
        if (this.chatQueue) this.chatQueue.send(`Gagal storage: Tidak ada chest di dekat sini.`);
        this.isStoring = false;
        return false;
      }

      log.info(`Membuka chest di ${chestBlock.position}...`);
      const chestWindow = await this.bot.openContainer(chestBlock);

      // Simpan barang
      let itemsStored = 0;
      const protectedKeywords = config.inventory.protectedItems || ['sword', 'armor', 'food', 'totem', 'diamond'];

      const inventoryItems = this.bot.inventory.items();
      for (const item of inventoryItems) {
        // Jangan deposit item protected
        const isProtected = protectedKeywords.some(kw => item.name.toLowerCase().includes(kw.toLowerCase()));
        if (isProtected) continue;

        try {
          // Deposit stack
          await chestWindow.deposit(item.type, null, item.count);
          itemsStored += item.count;
          await sleep(200);
        } catch (err) {
          log.warn(`Gagal deposit ${item.name}: ${err.message}`);
          // Mungkin chest penuh
          if (err.message.includes('full') || err.message.includes('Destination full')) {
            if (this.chatQueue) this.chatQueue.send(`Chest penuh! Menghentikan storage.`);
            break;
          }
        }
      }

      chestWindow.close();
      log.info(`Storage selesai. Menyimpan ${itemsStored} item.`);
      if (this.chatQueue) this.chatQueue.send(`Storage selesai. Menyimpan ${itemsStored} item.`);

      this.isStoring = false;
      return true;

    } catch (err) {
      log.error(`Error selama auto storage: ${err.message}`);
      if (this.chatQueue) this.chatQueue.send(`Error storage: ${err.message}`);
      this.isStoring = false;
      return false;
    }
  }
}

module.exports = StorageManager;
