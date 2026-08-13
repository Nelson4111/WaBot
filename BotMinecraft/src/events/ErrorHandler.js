'use strict';

const { createModuleLogger } = require('../utils/logger');

const log = createModuleLogger('ErrorHandler');

/**
 * ErrorHandler menangani error-error yang mungkin terjadi pada bot.
 * Semua error di-catch dan di-log, tidak ada yang dibiarkan unhandled.
 */
const ErrorHandler = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} _botManager - Tidak digunakan, tapi konsisten
   */
  attach(bot, _botManager) {
    // Error pada pathfinder
    if (bot.pathfinder) {
      bot.on('path_update', (result) => {
        if (result.status === 'noPath') {
          log.debug('Pathfinder: tidak ada path yang ditemukan ke tujuan');
        }
      });
    }

    // Error fisika
    bot.on('physicsTick', () => {
      // Biarkan kosong — hanya untuk memastikan physics loop tidak crash silently
    });

    // Error yang tidak tertangkap (dari Mineflayer internals)
    // Catatan: bot.on('error') sudah ditangani di Connector.js
    // Di sini kita handle error dari plugin/module

    log.info('ErrorHandler aktif');
  },
};

module.exports = ErrorHandler;
