'use strict';

const Vec3 = require('vec3').Vec3;

/**
 * !addchest [x] [y] [z] — Registrasi posisi chest penampungan hasil panen (CropFarm / Farm2).
 */
const AddChestCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   * @param {string[]} args
   */
  async handle(bot, botManager, args = []) {
    const { cropFarm, chatQueue } = botManager.getModules();

    if (!cropFarm) {
      if (chatQueue) chatQueue.send('Modul cropFarm tidak tersedia.');
      return;
    }

    let chestPos = null;

    if (args.length >= 3) {
      const x = parseFloat(args[0]);
      const y = parseFloat(args[1]);
      const z = parseFloat(args[2]);
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        chestPos = new Vec3(Math.floor(x), Math.floor(y), Math.floor(z));
      }
    }

    if (!chestPos) {
      // Cari chest/barrel/shulker terdekat di radius 6 blok dari bot
      const chestBlock = bot.findBlock({
        matching: (block) => {
          if (!block || !block.name) return false;
          const name = block.name.toLowerCase();
          return name.includes('chest') || name.includes('barrel') || name.includes('shulker_box');
        },
        maxDistance: 6
      });
      if (chestBlock) {
        chestPos = chestBlock.position;
      }
    }

    if (!chestPos) {
      if (chatQueue) chatQueue.send('⚠️ Tidak ada Chest/Barrel di dekat bot. Berdiri di dekat chest (radius 6m) lalu ketik !addchest');
      return;
    }

    const added = cropFarm.addChest(chestPos);
    if (added) {
      if (chatQueue) chatQueue.send(`✅ Chest penampungan hasil panen berhasil didaftarkan di ${chestPos.x}, ${chestPos.y}, ${chestPos.z}!`);
    } else {
      if (chatQueue) chatQueue.send(`⚠️ Chest di ${chestPos.x}, ${chestPos.y}, ${chestPos.z} sudah terdaftar sebelumnya.`);
    }
  }
};

module.exports = AddChestCommand;
