'use strict';
require('dotenv').config();
const BotManager = require('./src/bot/BotManager');
const { winstonLogger } = require('./src/utils/Logger');

/**
 * index.js — Entry point BotMinecraft2.
 *
 * Menjalankan BotManager yang akan spawn semua bot dari config.js.
 */

process.on('uncaughtException', (err) => {
  winstonLogger.error('UNCAUGHT EXCEPTION', { error: err.message, stack: err.stack });
  // Jangan exit — biarkan reconnect berjalan
});

process.on('unhandledRejection', (reason) => {
  winstonLogger.error('UNHANDLED REJECTION', {
    error: reason?.message || String(reason),
  });
});

process.on('SIGINT', () => {
  winstonLogger.info('SIGINT received — shutting down gracefully');
  manager.stopAll();
  setTimeout(() => process.exit(0), 2000);
});

process.on('SIGTERM', () => {
  winstonLogger.info('SIGTERM received — shutting down gracefully');
  manager.stopAll();
  setTimeout(() => process.exit(0), 2000);
});

const manager = new BotManager();
manager.startAll().catch((err) => {
  winstonLogger.error('Failed to start BotManager', { error: err.message });
});
