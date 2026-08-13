'use strict';

const { createModuleLogger } = require('../utils/logger');
const { sleep } = require('../utils/retry');

const log = createModuleLogger('PlayerJoinHandler');

/** Daftar pesan ucapan selamat datang gaya anak Gen Z */
const GENZ_GREETINGS = [
  'Wassup {user}! Welcome di server bang, minimal sapa dulu lah 🗿',
  'Halo {user}! Selamat datang bro, info server rame nih 🚀',
  'Welkom {user}! Jan lupa ngopi n santai ☕',
  'Wassup {user}! Gws buat yang baru login 🫡',
  'Bocil baru login nih, halo {user} 👋',
  'Halo {user}! Sepikan dlu ga sih 🔥',
  'Selamat datang {user}! Bawa ganjelan ga nih bro 🗿',
  'Halo {user}! Welcome back di server cuy 🎮'
];

/**
 * PlayerJoinHandler mendeteksi player baru yang join ke server
 * dan menyapanya dengan ucapan ramah / Gen-Z slang di public chat.
 */
class PlayerJoinHandler {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   */
  static attach(bot, botManager) {
    let isInitialSpawnDone = false;

    // Tunggu bot spawn penuh agar tidak menyapa player lama yang sudah ada dari awal login
    bot.once('spawn', () => {
      setTimeout(() => {
        isInitialSpawnDone = true;
      }, 5000);
    });

    bot.on('playerJoined', async (player) => {
      if (!isInitialSpawnDone) return;
      if (!player || !player.username) return;
      if (player.username === bot.username) return;

      // HANYA bot utama yang menyapa player baru di public chat
      const envUsernames = (process.env.BOT_USERNAME || 'Bot-Nenel11').split(',').map(u => u.trim());
      const primaryBotUsername = (envUsernames[0] || 'Bot-Nenel11').toLowerCase();
      const isPrimaryBot = (bot.username.toLowerCase() === primaryBotUsername);

      if (!isPrimaryBot) return;

      // Pilih kata-kata acak
      const randomGreeting = GENZ_GREETINGS[Math.floor(Math.random() * GENZ_GREETINGS.length)];
      const message = randomGreeting.replace('{user}', player.username);

      log.info(`Menyapa player baru join: ${player.username}`);

      await sleep(1500); // Jeda kecil agar terlihat alami
      try {
        bot.chat(message);
      } catch (err) {
        log.warn(`Gagal menyapa ${player.username}: ${err.message}`);
      }
    });

    log.info('PlayerJoinHandler aktif — menyapa player join otomatis (Gen Z style)');
  }
}

module.exports = PlayerJoinHandler;
