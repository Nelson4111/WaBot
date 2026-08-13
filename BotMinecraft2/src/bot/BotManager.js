'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const PrimaryBot = require('./PrimaryBot');
const FarmBot = require('./FarmBot');

const log = createModuleLogger('BotManager', 'BotManager');

/**
 * BotManager.js — Orchestrator multi-bot.
 *
 * Spawn semua bot dari config.bots array.
 * Bot pertama dengan role 'primary' → PrimaryBot (full AI pipeline).
 * Bot sisanya dengan role 'farm' → FarmBot (passive farm loop).
 *
 * Stagger connect dengan delay agar tidak hit-rate server sekaligus.
 */
class BotManager {
  constructor() {
    this._bots = [];
  }

  /**
   * Start semua bot dari konfigurasi.
   */
  async startAll() {
    log.info('Starting BotManager', { botCount: config.bots.length });

    for (let i = 0; i < config.bots.length; i++) {
      const botConfig = config.bots[i];

      // Override username dari env var jika ada
      const usernames = process.env.BOT_USERNAMES?.split(',') || [];
      if (usernames[i]) botConfig.username = usernames[i].trim();

      const passwords = process.env.BOT_PASSWORDS?.split(',') || [];
      if (passwords[i]) botConfig.password = passwords[i].trim();

      let botInstance;
      if (botConfig.role === 'primary') {
        botInstance = new PrimaryBot(botConfig);
        log.info(`Spawning PRIMARY bot: ${botConfig.username}`);
      } else {
        botInstance = new FarmBot(botConfig);
        log.info(`Spawning FARM bot: ${botConfig.username}`);
      }

      this._bots.push(botInstance);

      // Stagger connect: 5 detik per bot untuk menghindari rate-limit
      if (i > 0) {
        await new Promise((r) => setTimeout(r, 5000));
      }

      botInstance.connect();
    }

    log.info('All bots initiated');
  }

  /**
   * Stop semua bot.
   */
  stopAll() {
    log.info('Stopping all bots');
    for (const bot of this._bots) {
      try {
        bot._cleanup?.();
        bot.bot?.quit('BotManager stopping');
      } catch (_) {}
    }
  }
}

module.exports = BotManager;
