'use strict';

/**
 * !say <pesan> — Bot mengirim pesan ke chat server.
 * Berguna untuk berinteraksi dengan server atau player lain.
 */
const SayCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} _botManager
   * @param {string[]} args
   */
  async handle(bot, botManager, args) {
    if (args.length === 0) {
      botManager.getModules().chatQueue.send('Usage: !say <pesan>');
      return;
    }

    const message = args.join(' ');
    // Batasi panjang pesan sesuai config chatLengthLimit
    const maxLen = bot.settings?.chatLengthLimit ?? 256;
    const truncated = message.substring(0, maxLen);

    botManager.getModules().chatQueue.sendGlobal(truncated);
  },
};

module.exports = SayCommand;
