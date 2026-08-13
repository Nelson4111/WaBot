'use strict';

const { formatPosition, formatBar } = require('../utils/formatter');
const { getUptime, formatTimestamp } = require('../utils/time');
const { sleep } = require('../utils/retry');

/**
 * !status — Tampilkan status lengkap bot saat ini.
 * Output: health, food, posisi, uptime, mode aktif.
 */
const StatusCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   */
  async handle(bot, botManager) {
    const status = botManager.getStatus();
    const health = Math.round(bot.health ?? 0);
    const food = Math.round(bot.food ?? 0);
    const pos = formatPosition(bot.entity?.position);
    const uptime = getUptime(botManager.connectedAt);
    const activeModes = status.activeModes.length > 0 ? status.activeModes.join(', ') : 'idle';

    const healthBar = formatBar(health, 20);
    const foodBar = formatBar(food, 20);

    const xp = bot.experience ? bot.experience.level : 0;
    const ping = bot.player ? bot.player.ping : 0;
    
    let pearlCount = 0;
    const inventoryManager = botManager.getModules().inventoryManager;
    if (inventoryManager) {
        const sum = inventoryManager.getSummary();
        if (sum) pearlCount = sum.pearlCount;
    }

    let target = 'None';
    const guardMode = botManager.getModules().guardMode;
    const followManager = botManager.getModules().followManager;
    
    if (bot.pvp && bot.pvp.target) {
        target = bot.pvp.target.name || bot.pvp.target.username || 'Entity';
    } else if (followManager && followManager.isFollowing) {
        target = followManager.targetUsername;
    }

    const q = botManager.getModules().chatQueue;
    q.send(`=== Status Bot ===`);
    await sleep(150);
    q.send(`❤ HP: [${healthBar}] ${health}/20 | 🍖 Food: [${foodBar}] ${food}/20`);
    await sleep(150);
    q.send(`📍 Pos: ${pos} | ⏱ Uptime: ${uptime} | 🏓 Ping: ${ping}ms`);
    await sleep(150);
    q.send(`✨ XP Lvl: ${xp} | 🔮 Pearls: ${pearlCount}`);
    await sleep(150);
    q.send(`🔧 Mode: ${activeModes} | 🎯 Target: ${target}`);
  },
};

module.exports = StatusCommand;
