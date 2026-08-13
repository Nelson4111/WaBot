'use strict';

/**
 * !give pearl, !give all, !give item <name>
 */
/**
 * !give <item>, !empty, !minta <item>
 */
const GiveCommand = {
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    const inventoryManager = botManager.getModules().inventoryManager;
    const followManager = botManager.getModules().followManager;

    if (!inventoryManager || !followManager) {
      chatQueue.send('Modul yang dibutuhkan tidak tersedia.');
      return;
    }

    if (args.length === 0) {
      // Default !give tanpa argumen -> buang semua item ke owner
      await this.handleEmpty(bot, botManager, args, sender);
      return;
    }

    const sub = args[0].toLowerCase();

    if (sub === 'all' || sub === 'semua') {
      await this.handleEmpty(bot, botManager, args, sender);
      return;
    }

    const keyword = args.join(' ');
    await this.handleMinta(bot, botManager, [keyword], sender);
  },

  /**
   * Handle !empty / !dump / !kosongkan -> Lempar semua item di inventory ke owner (Nelson41111)
   */
  async handleEmpty(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    const inventoryManager = botManager.getModules().inventoryManager;
    const followManager = botManager.getModules().followManager;
    const { sleep } = require('../utils/retry');

    botManager.setBusy(true);

    try {
      chatQueue.send(`Mendekati ${sender} untuk mengosongkan isi inventory...`);
      const reached = await followManager.comeTo(sender, 2);

      if (!reached) {
        chatQueue.send(`Gagal mendekat ke ${sender}.`);
        return;
      }

      await sleep(1500); // Jeda konfirmasi posisi tepat di depan player
      const count = await inventoryManager.dropAll(true, sender);
      chatQueue.send(`Selesai! Mengosongkan ${count} item ke ${sender}.`);
      await sleep(2500); // Jeda agar player sempat mengambil barang
    } finally {
      if (botManager && typeof botManager.setBusy === 'function') {
        botManager.setBusy(false);
      }
      if (botManager && botManager.activeTask) {
        await botManager.resumeActiveTask();
      }
    }
  },

  /**
   * Handle !minta <item> -> Lempar item spesifik yang diminta ke owner
   */
  async handleMinta(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules().chatQueue;
    const inventoryManager = botManager.getModules().inventoryManager;
    const followManager = botManager.getModules().followManager;
    const { sleep } = require('../utils/retry');

    if (args.length === 0) {
      chatQueue.send('Usage: !minta <nama_item> (misal: !minta pearl, !minta makanan, !minta buku)');
      return;
    }

    const itemName = args.join(' ');
    if (botManager && typeof botManager.setBusy === 'function') {
      botManager.setBusy(true);
    }

    try {
      chatQueue.send(`Mendekati ${sender} untuk memberikan ${itemName}...`);
      const reached = await followManager.comeTo(sender, 2);

      if (!reached) {
        chatQueue.send(`Gagal mendekati ${sender}.`);
        return;
      }

      // 1. Jeda 1.5 detik setelah sampai di lokasi player agar posisi benar-benar di depan player
      await sleep(1500);

      // 2. Lempar seluruh stack barang yang diminta tepat ke arah sender
      const count = await inventoryManager.dropItemByName(itemName, sender);
      if (count > 0) {
        chatQueue.send(`Berhasil memberikan ${count}x ${itemName} ke ${sender}.`);
        // 3. Jeda 2.5 detik agar player sempat mengambil barang sebelum bot kembali ke tugasnya
        await sleep(2500);
      } else {
        chatQueue.send(`Tidak menemukan ${itemName} di inventory.`);
        await sleep(1000);
      }
    } finally {
      if (botManager && typeof botManager.setBusy === 'function') {
        botManager.setBusy(false);
      }
      // 4. Otomatis kembalikan bot ke tugas aktifnya (farm1 / farm2) jika ada!
      if (botManager && botManager.activeTask) {
        await botManager.resumeActiveTask();
      }
    }
  }
};

module.exports = GiveCommand;
