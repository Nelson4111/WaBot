'use strict';

const { createModuleLogger } = require('../utils/logger');
const log = createModuleLogger('RetaliateHandler');

const lastHitTimes = new Map();
const lastChatReplyTimes = new Map();

/**
 * RetaliateHandler memantau ketika bot dipukul oleh player lain secara spesifik.
 * - Cooldown hit fisik: 1 detik (agar tidak spam attack tapi tetap membalas cepat)
 * - Cooldown pesan AI sinis: 15 detik (agar tidak spam chat jika dipukul berulang kali)
 */
class RetaliateHandler {
  /**
   * Attach listener ke bot instance.
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   */
  attach(bot, botManager) {
    bot.on('entityAttacked', async (victim, attacker) => {
      if (!victim || !attacker || !bot.entity) return;

      // Hanya proses jika korban serangan adalah bot ini sendiri
      if (victim.id !== bot.entity.id) return;

      // KETAT: Penyerang HARUS secara eksplisit berupa PLAYER (attacker.type === 'player')
      if (attacker.type !== 'player') return;

      const attackerName = attacker.username || attacker.displayName;
      if (!attackerName || attackerName === bot.username) return;

      const lowerAttacker = attackerName.toLowerCase();
      if (['me', 'server', 'console', 'system', bot.username.toLowerCase()].includes(lowerAttacker)) return;

      const now = Date.now();

      // 1. Cooldown Hit Fisik: 1 detik (1000ms)
      const lastHit = lastHitTimes.get(attackerName) || 0;
      if (now - lastHit < 1000) return;
      lastHitTimes.set(attackerName, now);

      log.info(`[Retaliate] Bot dipukul oleh player ${attackerName}! Membalas pukul 1x...`);

      try {
        // Equip senjata terbaik jika ada
        const items = bot.inventory ? bot.inventory.items() : [];
        const weapons = items.filter(i => i && (i.name.includes('sword') || i.name.includes('axe')));
        if (weapons.length > 0) {
          await bot.equip(weapons[0], 'hand').catch(() => {});
        }

        // Arahkan pandangan ke player yang memukul
        if (attacker.position) {
          const eyePos = attacker.position.offset(0, attacker.height ? attacker.height * 0.8 : 1.4, 0);
          await bot.lookAt(eyePos, true).catch(() => {});
        }

        // Pukul 1x (sekali saja)
        bot.attack(attacker);

        // 2. Cooldown Chat AI Sinis: 15 detik (15000ms) agar tidak spam chat saat dipukul berkali-kali
        const lastChat = lastChatReplyTimes.get(attackerName) || 0;
        if (now - lastChat >= 15000) {
          lastChatReplyTimes.set(attackerName, now);
          const GeminiService = require('../services/GeminiService');
          if (GeminiService.isEnabled()) {
            const prompt = `kamu baru saja dipukul oleh ${attackerName} di Minecraft, berikan balasan sinis pedes 1 kalimat ke dia!`;
            const reply = await GeminiService.generateReply(attackerName, prompt);
            const chatQueue = botManager.getModules()?.chatQueue;
            if (reply) {
              if (chatQueue) chatQueue.sendGlobal(reply);
              else bot.chat(reply);
            }
          }
        }
      } catch (err) {
        log.warn(`Gagal membalas pukulan ${attackerName}: ${err.message}`);
      }
    });

    log.info('RetaliateHandler aktif — hit delay 1s, AI chat delay 15s per player');
  }
}

module.exports = new RetaliateHandler();
