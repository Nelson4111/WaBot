'use strict';

/**
 * !eat — Paksa bot makan sekarang (tanpa menunggu food level turun).
 */
const EatCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   */
  async handle(bot, botManager) {
    const { autoEat } = botManager.getModules();

    if (!autoEat) {
      botManager.getModules().chatQueue.send('Modul auto-eat tidak tersedia');
      return;
    }

    const currentFood = Math.round(bot.food ?? 0);
    if (currentFood >= 20) {
      botManager.getModules().chatQueue.send(`Food sudah penuh (${currentFood}/20)`);
      return;
    }

    botManager.getModules().chatQueue.send(`Makan... (food: ${currentFood}/20)`);
    await autoEat.forceEat();
  },
};

module.exports = EatCommand;
