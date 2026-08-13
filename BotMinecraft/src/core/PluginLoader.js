'use strict';

const { pathfinder } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const toolPlugin = require('mineflayer-tool').plugin;
const { createModuleLogger } = require('../utils/logger');

const log = createModuleLogger('PluginLoader');

// Safely require mineflayer-auto-eat without crashing if ESM
let autoEatPlugin = null;
try {
  autoEatPlugin = require('mineflayer-auto-eat').plugin;
} catch (_err) {
  log.warn('mineflayer-auto-eat (ESM) tidak dapat di-require secara CJS. AutoEat akan menggunakan fallback internal.');
}

/**
 * Muat semua plugin Mineflayer ke instance bot.
 * Setiap plugin dimuat dalam try-catch agar satu plugin gagal
 * tidak menghentikan proses load plugin lainnya.
 *
 * @param {import('mineflayer').Bot} bot - Instance bot Mineflayer
 * @returns {void}
 */
function loadPlugins(bot) {
  // Alias bridge: Alihkan listener physicTick (deprecated) bawaan plugin ke physicsTick agar konsol bersih
  const originalOn = bot.on.bind(bot);
  const originalAddListener = bot.addListener.bind(bot);

  bot.on = function (event, listener) {
    if (event === 'physicTick') {
      return originalOn('physicsTick', listener);
    }
    return originalOn(event, listener);
  };

  bot.addListener = function (event, listener) {
    if (event === 'physicTick') {
      return originalAddListener('physicsTick', listener);
    }
    return originalAddListener(event, listener);
  };

  const plugins = [
    { name: 'pathfinder', plugin: pathfinder },
    { name: 'pvp', plugin: pvp },
    { name: 'auto-eat', plugin: autoEatPlugin },
    { name: 'tool', plugin: toolPlugin },
  ];

  log.info(`Memuat plugin Mineflayer...`);

  for (const { name, plugin } of plugins) {
    if (!plugin) {
      log.warn(`Plugin '${name}' tidak tersedia. Skipping.`);
      continue;
    }
    try {
      bot.loadPlugin(plugin);
      log.success(`Plugin '${name}' berhasil dimuat`);
    } catch (err) {
      log.error(`Gagal memuat plugin '${name}': ${err.message}`);
      log.warn(`Bot akan berjalan tanpa plugin '${name}'. Beberapa fitur mungkin tidak berfungsi.`);
    }
  }
}

module.exports = { loadPlugins };
