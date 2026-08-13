'use strict';

/**
 * !guard — Toggle guard mode (serang mob hostile) on/off.
 */
const GuardCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   */
  async handle(bot, botManager) {
    const { guardMode } = botManager.getModules();

    if (!guardMode) {
      botManager.getModules().chatQueue.send('Modul guard tidak tersedia');
      return;
    }

    const newState = guardMode.toggle();
    botManager.getModules().chatQueue.send(`Guard mode: ${newState ? 'ON' : 'OFF'}`);
  },
};

module.exports = GuardCommand;
