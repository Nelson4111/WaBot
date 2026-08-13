'use strict';

const { createModuleLogger } = require('../utils/logger');

const log = createModuleLogger('GotoCommand');

/**
 * !goto <x> <z> [y] — Perintahkan bot navigasi ke koordinat tertentu.
 *
 * Usage:
 *   !goto 100 -200       → goto X:100 Z:-200 (Y otomatis)
 *   !goto 100 -200 64    → goto X:100 Y:64 Z:-200
 */
const GotoCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   * @param {string[]} args
   */
  async handle(bot, botManager, args) {
    if (args.length < 2) {
      botManager.getModules().chatQueue.send('Usage: !goto <x> <z> [y]');
      return;
    }

    const x = parseInt(args[0], 10);
    const z = parseInt(args[1], 10);
    const y = args[2] !== undefined ? parseInt(args[2], 10) : null;

    if (isNaN(x) || isNaN(z) || (args[2] !== undefined && isNaN(y))) {
      botManager.getModules().chatQueue.send('Koordinat harus berupa angka. Contoh: !goto 100 -200');
      return;
    }

    const { pathfinder } = botManager.getModules();
    if (!pathfinder) {
      botManager.getModules().chatQueue.send('Pathfinder tidak tersedia');
      return;
    }

    botManager.getModules().chatQueue.send(`Menuju X:${x} Y:${y ?? 'auto'} Z:${z}...`);

    try {
      await pathfinder.goto(x, z, y);
      botManager.getModules().chatQueue.send(`Sampai di X:${x} Z:${z}!`);
    } catch (err) {
      log.warn(`Gagal goto: ${err.message}`);
      botManager.getModules().chatQueue.send(`Gagal: ${err.message}`);
    }
  },
};

module.exports = GotoCommand;
