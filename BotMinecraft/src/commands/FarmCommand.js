'use strict';

const { createModuleLogger } = require('../utils/logger');
const { getBotRole, getWaypoint, getSavedChests } = require('../services/DataService');
const log = createModuleLogger('FarmCommand');

/**
 * !farm [farm1|farm2|farm3|stop] — Perintah toggle mode farming sesuai tugas bot.
 * - farm1: Crop Farm (Panen Tanaman)
 * - farm2: Mob Farm (Enderman / Mob Grinder)
 * - farm3: Stone Farm (AFK Stone & Cobblestone Miner)
 */
const FarmCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   * @param {string[]} args
   */
  async handle(bot, botManager, args = []) {
    const { mobFarm, cropFarm, stoneFarm, guardMode, chatQueue } = botManager.getModules();
    const mode = args && args[0] ? args[0].toLowerCase() : 'auto';

    if (mode === 'stop' || mode === 'off') {
      if (mobFarm) mobFarm.stop();
      if (cropFarm) cropFarm.stop();
      if (stoneFarm) stoneFarm.stop();
      if (guardMode) guardMode.stop();
      botManager.setActiveTask(null);
      if (chatQueue) chatQueue.send(`🛑 ${bot.username}: Mode farm dihentikan: OFF`);
      return;
    }

    // 1. Eksekusi spesifik farm3 (Stone AFK Miner)
    if (mode === 'farm3' || mode === 'stone' || mode === 'cobble') {
      if (mobFarm) mobFarm.stop();
      if (cropFarm) cropFarm.stop();
      if (guardMode) guardMode.stop();

      if (!stoneFarm) return;
      stoneFarm.start();
      botManager.setActiveTask('farm3');
      if (chatQueue) chatQueue.send(`⛏️ ${bot.username}: Farm3 (AFK Stone/Cobblestone Miner) ON! GuardMode dinonaktifkan.`);
      return;
    }

    // 2. Eksekusi spesifik farm2 (Mob Farm)
    if (mode === 'farm2' || mode === 'mob') {
      if (cropFarm) cropFarm.stop();
      if (stoneFarm) stoneFarm.stop();

      const wp2 = await getWaypoint('farm2');
      if (!wp2) {
        log.warn(`[Farm2 Error] Waypoint 'farm2' belum ada untuk ${bot.username}`);
        if (chatQueue) chatQueue.send(`⚠️ ${bot.username}: Waypoint 'farm2' belum ada! Berdiri di lokasi mob farm lalu ketik: !waypoint add farm2`);
        return;
      }

      if (!mobFarm) return;
      const isSuccess = await mobFarm.start();
      if (isSuccess && mobFarm.isActive) {
        botManager.setActiveTask('farm2');
        if (chatQueue) chatQueue.send(`✅ ${bot.username}: Farm2 (Mob Farm Enderman) ON — Menuju ke waypoint 'farm2'...`);
      }
      return;
    }

    // 3. Eksekusi spesifik farm1 (Crop Farm Tanaman)
    if (mode === 'farm1' || mode === 'crop') {
      if (mobFarm) mobFarm.stop();
      if (stoneFarm) stoneFarm.stop();

      if (!cropFarm) return;
      const savedChests = await getSavedChests();
      if (cropFarm.chestPositions.length === 0 && savedChests.length === 0) {
        log.warn(`[Farm1 Error] Chest penampungan belum terdaftar untuk ${bot.username}`);
        if (chatQueue) chatQueue.send(`⚠️ ${bot.username}: Chest penampungan panen ('farm1') belum ada! Berdiri di dekat chest lalu ketik !addchest`);
        return;
      }

      cropFarm.start();
      botManager.setActiveTask('farm1');
      if (chatQueue) chatQueue.send(`✅ ${bot.username}: Farm1 (Crop Farm Tanaman) ON! Memulai panen & simpan chest.`);
      return;
    }

    // 4. Mode AUTO (!farm tanpa argumen): Eksekusi otomatis berdasarkan peran bot di data/bot_roles.json
    const roleData = await getBotRole(bot.username);
    const assignedJob = roleData.autoFarm || 'none';

    log.info(`[Farm Auto] ${bot.username} mengeksekusi tugas otomatis '${assignedJob}'`);

    if (assignedJob === 'farm1') {
      if (mobFarm) mobFarm.stop();
      if (stoneFarm) stoneFarm.stop();

      if (!cropFarm) return;
      const savedChests = await getSavedChests();

      if (cropFarm.chestPositions.length === 0 && savedChests.length === 0) {
        log.warn(`[Farm Auto Error] Chest panen belum terdaftar untuk ${bot.username}`);
        if (chatQueue) chatQueue.send(`⚠️ ${bot.username}: Chest penampungan panen ('farm1') belum ada! Berdiri di dekat chest lalu ketik !addchest`);
        return;
      }

      cropFarm.start();
      botManager.setActiveTask('farm1');
      if (chatQueue) chatQueue.send(`✅ ${bot.username}: Farm1 (Crop Farm Tanaman) ON! Memulai pemanenan...`);
    } else if (assignedJob === 'farm2') {
      if (cropFarm) cropFarm.stop();
      if (stoneFarm) stoneFarm.stop();

      const wp2 = await getWaypoint('farm2');
      if (!wp2) {
        log.warn(`[Farm Auto Error] Waypoint 'farm2' belum ada untuk ${bot.username}`);
        if (chatQueue) chatQueue.send(`⚠️ ${bot.username}: Waypoint 'farm2' belum ada! Berdiri di lokasi mob farm lalu ketik: !waypoint add farm2`);
        return;
      }

      if (!mobFarm) return;
      const isSuccess = await mobFarm.start();
      if (isSuccess && mobFarm.isActive) {
        botManager.setActiveTask('farm2');
        if (chatQueue) chatQueue.send(`✅ ${bot.username}: Farm2 (Mob Farm) ON — Menuju ke waypoint 'farm2'...`);
      }
    } else if (assignedJob === 'farm3') {
      if (mobFarm) mobFarm.stop();
      if (cropFarm) cropFarm.stop();

      if (!stoneFarm) return;
      stoneFarm.start();
      botManager.setActiveTask('farm3');
      if (chatQueue) chatQueue.send(`⛏️ ${bot.username}: Farm3 (AFK Stone/Cobblestone Generator) ON!`);
    } else {
      if (chatQueue) chatQueue.send(`⚠️ ${bot.username}: Belum ada tugas farm ditugaskan. Ketik !role set ${bot.username} <farm1|farm2|farm3>`);
    }
  },
};

module.exports = FarmCommand;
