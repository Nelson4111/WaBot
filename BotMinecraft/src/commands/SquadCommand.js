'use strict';

const { createModuleLogger } = require('../utils/logger');

const log = createModuleLogger('SquadCommand');

/**
 * Command !squad — Perintah serentak untuk seluruh squad bot
 * Usage:
 *   !squad farm1  -> Seluruh bot jalankan CropFarm (farm1: Wheat/Wortel/Kentang)
 *   !squad farm2  -> Seluruh bot jalankan MobFarm (farm2: Mob Grinder / Enderman)
 *   !squad stop   -> Hentikan seluruh bot
 *   !squad follow -> Seluruh bot ikuti player pengirim command
 */
const SquadCommand = {
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules()?.chatQueue;
    const action = (args[0] || 'status').toLowerCase();

    if (action === 'farm1' || action === 'crop') {
      const cropFarm = botManager.getModules()?.cropFarm;
      if (cropFarm) {
        botManager.setActiveTask('farm1');
        cropFarm.start();
        if (chatQueue) chatQueue.send(`${bot.username}: CropFarm (farm1: Tanaman) dimulai!`);
      }
      return;
    }

    if (action === 'farm2' || action === 'mob') {
      const mobFarm = botManager.getModules()?.mobFarm;
      if (mobFarm) {
        botManager.setActiveTask('farm2');
        mobFarm.start();
        if (chatQueue) chatQueue.send(`${bot.username}: MobFarm (farm2: Mob Grinder) dimulai!`);
      }
      return;
    }

    if (action === 'farm3' || action === 'stone' || action === 'cobble') {
      const stoneFarm = botManager.getModules()?.stoneFarm;
      if (stoneFarm) {
        botManager.setActiveTask('farm3');
        stoneFarm.start();
        if (chatQueue) chatQueue.send(`${bot.username}: StoneFarm (farm3: AFK Stone Miner) dimulai!`);
      }
      return;
    }

    if (action === 'stop') {
      const mobFarm = botManager.getModules()?.mobFarm;
      const cropFarm = botManager.getModules()?.cropFarm;
      const guardMode = botManager.getModules()?.guardMode;
      const followManager = botManager.getModules()?.followManager;

      if (mobFarm) mobFarm.stop();
      if (cropFarm) cropFarm.stop();
      if (guardMode) guardMode.stop();
      if (followManager) followManager.stop();

      botManager.setActiveTask(null);
      if (chatQueue) chatQueue.send(`${bot.username}: Seluruh aktivitas dihentikan.`);
      return;
    }

    if (action === 'follow') {
      const followManager = botManager.getModules()?.followManager;
      const targetPlayer = args[1] || sender;
      if (followManager && targetPlayer) {
        followManager.start(targetPlayer);
        if (chatQueue) chatQueue.send(`${bot.username}: Mengikuti ${targetPlayer}`);
      }
      return;
    }

    if (chatQueue) chatQueue.send('Perintah Squad: !squad farm1 (Crop) | !squad farm2 (Mob) | !squad stop | !squad follow <player>');
  }
};

module.exports = SquadCommand;
