'use strict';

const { createModuleLogger } = require('../utils/logger');
const CommandRegistry = require('../commands/CommandRegistry');
const GeminiService = require('../services/GeminiService');

const log = createModuleLogger('ChatHandler');

/**
 * ChatHandler mendengarkan semua chat dari server dan
 * merouting pesan yang merupakan command ke CommandRegistry,
 * serta merespon panggilan 'Nenel' / 'bot' via Gemini AI.
 */
const ChatHandler = {
  /**
   * Attach chat listener ke bot.
   *
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   */
  attach(bot, botManager) {
    const config = require('../config');
    const lastGeminiTimes = new Map();
    const activeConversationWindows = new Map();
    const lastPlayerMessages = new Map();
    const activeGeneratingUsers = new Set();
    const globalRecentPrompts = new Map(); // Deduplikasi prompt global (15s)
    const aiQueue = [];
    let isProcessingAiQueue = false;

    /**
     * Proses antrean pertanyaan AI satu per satu (Sequential FIFO Queue)
     */
    const processAiQueue = async () => {
      if (isProcessingAiQueue || aiQueue.length === 0) return;
      isProcessingAiQueue = true;

      const { sleep } = require('../utils/retry');

      while (aiQueue.length > 0) {
        const item = aiQueue.shift();
        const { username, message, isWhisper, isWindowActive } = item;
        const lowerSender = username.toLowerCase();

        activeGeneratingUsers.add(lowerSender);

        try {
          log.info(`[GeminiAI Pipeline] Memproses pertanyaan (${aiQueue.length} tersisa di antrean) dari ${username}: "${message}"`);
          const rawReply = await GeminiService.generateReply(username, message);
          const chatQueue = botManager.getModules()?.chatQueue;

          if (rawReply) {
            activeConversationWindows.set(username, Date.now());

            // Pecah balasan panjang menjadi beberapa potongan kalimat (chunks)
            const chunks = GeminiService.splitReplyIntoChunks(rawReply);

            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i];
              if (isWhisper) {
                if (chatQueue) chatQueue.sendToPlayer(username, chunk);
                else bot.chat(`/msg ${username} ${chunk}`);
              } else {
                if (chatQueue) chatQueue.sendGlobal(chunk);
                else bot.chat(chunk);
              }

              // Jeda antar potongan kalimat agar tidak spam chat server
              if (i < chunks.length - 1) {
                await sleep(2200);
              }
            }
          }
        } catch (err) {
          log.warn(`Error generating Gemini reply untuk ${username}: ${err.message}`);
        } finally {
          activeGeneratingUsers.delete(lowerSender);
        }

        // Jeda 2.8 detik sebelum memproses pertanyaan player berikutnya di dalam antrean
        if (aiQueue.length > 0) {
          await sleep(2800);
        }
      }

      isProcessingAiQueue = false;
    };

    /**
     * Handler untuk pemicu AI Gemini saat player memanggil Nenel/bot
     */
    const tryGeminiReply = async (username, message, isWhisper = false) => {
      if (!GeminiService.isEnabled()) return;
      if (!username || !bot.username) return;

      // Filter Bot Self-Chat: Abaikan total chat dari bot ini sendiri atau bot sekunder
      const envUsernames = (process.env.BOT_USERNAME || 'Bot-Nenel11')
        .split(',')
        .flatMap(u => {
          const cleaned = u.trim().toLowerCase();
          const stripped = cleaned.replace(/^bot-?/i, '');
          return [cleaned, stripped, `bot-${stripped}`];
        });

      const senderClean = username.toLowerCase().trim().replace(/^bot-?/i, '');
      const currentBotClean = bot.username.toLowerCase().trim().replace(/^bot-?/i, '');

      if (senderClean === currentBotClean || envUsernames.includes(username.toLowerCase().trim()) || envUsernames.includes(senderClean)) {
        return; // ABAIKAN TOTAL CHAT DARI BOT SENDIRI ATAU BOT SEGUNDER
      }

      // Bot sekunder hanya berfungsi sebagai farm dan TIDAK merespon AI chat umum
      const primaryBotUsername = ((process.env.BOT_USERNAME || 'Bot-Nenel11').split(',')[0] || 'Bot-Nenel11').toLowerCase().trim();
      const isPrimaryBot = (bot.username.toLowerCase().trim() === primaryBotUsername);
      if (!isPrimaryBot) return;

      const lowerSender = username.toLowerCase();
      if (['me', 'server', 'console', 'system'].includes(lowerSender)) return;

      const lower = message.toLowerCase().trim();
      const prefix = config.commands.prefix.toLowerCase();

      // Abaikan command
      if (lower.startsWith(prefix)) return;

      const now = Date.now();
      const lastReplyTime = activeConversationWindows.get(username) || 0;
      const isWindowActive = (now - lastReplyTime < 10000); // Percakapan aktif jika < 10 detik dari balasan terakhir

      // Cek apakah dipanggil (ada kata 'nenel', 'bot', atau nama bot)
      const isMentioned =
        lower.includes('nenel') ||
        lower.includes('bot') ||
        lower.includes(bot.username.toLowerCase());

      // Jika tidak dipanggil DAN percakapan sudah > 10 detik, abaikan pesan ini
      if (!isMentioned && !isWindowActive) return;

      // 1. Filter Duplikat Global (Anti-Spam Mention Teks Sama 15s):
      // Jika teks pertanyaan yang persis sama dipanggil dalam 15 detik (walau oleh player berbeda), cukup proses 1x!
      const promptKey = lower;
      const lastGlobalTime = globalRecentPrompts.get(promptKey) || 0;
      if (now - lastGlobalTime < 15000) {
        log.debug(`Abaikan prompt duplikat/spam dari ${username}: "${message}"`);
        return;
      }
      globalRecentPrompts.set(promptKey, now);

      // 2. Filter Anti-Concurrent per Player: Cegah 2 proses AI bersamaan untuk player yang sama
      if (activeGeneratingUsers.has(lowerSender)) return;

      // 3. Masukkan ke Antrean FIFO AI dan jalankan pemrosesan berurutan
      aiQueue.push({ username, message, isWhisper, isWindowActive });
      log.info(`[GeminiAI Queue] Menambahkan pertanyaan dari ${username} ke antrean (Posisi #${aiQueue.length})`);
      processAiQueue().catch(() => {});
    };

    // Dengarkan semua chat (player chat)
    bot.on('chat', async (username, message) => {
      if (username === bot.username) return;

      log.debug(`[CHAT] <${username}> ${message}`);

      // Cek respon Gemini AI
      await tryGeminiReply(username, message, false).catch(() => {});

      // Jika dikonfigurasi untuk hanya menggunakan PM, abaikan chat global
      if (config.chat.usePrivateMessage) return;
      
      // Jika tidak menggunakan PM, pastikan hanya dari owner
      if (username !== config.chat.ownerUsername) return;

      // Cek apakah pesan adalah command
      await CommandRegistry.handleMessage(bot, botManager, username, message).catch((err) => {
        log.error(`Error saat handle command dari ${username}: ${err.message}`);
      });
    });

    // Dengarkan whisper (pesan privat)
    bot.on('whisper', async (username, message) => {
      if (username === bot.username) return;

      log.debug(`[WHISPER] <${username}> ${message}`);

      // Cek respon Gemini AI jika dipanggil
      await tryGeminiReply(username, message, true).catch(() => {});

      // Hanya proses command dari owner
      if (username !== config.chat.ownerUsername) {
        log.debug(`Mengabaikan PM dari ${username} (bukan owner)`);
        return;
      }

      const prefix = config.commands.prefix;
      const cmdMessage = message.startsWith(prefix) ? message : `${prefix}${message}`;

      await CommandRegistry.handleMessage(bot, botManager, username, cmdMessage, true).catch(
        (err) => {
          log.error(`Error saat handle whisper command dari ${username}: ${err.message}`);
        }
      );
    });

    // Log pesan sistem dari server & Auto-Accept TPA Request
    bot.on('messagestr', async (msg) => {
      if (!msg) return;
      const lower = msg.toLowerCase();

      // Cek apakah pesan berisi permintaan teleportasi / TPA
      const isTpaReq = lower.includes('has requested to teleport to you') ||
                       lower.includes('wants to teleport to you') ||
                       lower.includes('has requested that you teleport') ||
                       lower.includes('meminta untuk teleport') ||
                       lower.includes('ingin teleport ke') ||
                       lower.includes('/tpaccept');

      if (isTpaReq) {
        log.info(`[Auto TPA Engine] Menerima permintaan TPA: "${msg}". Mengirim /tpaccept...`);
        const chatQueue = botManager.getModules()?.chatQueue;
        const { sleep } = require('../utils/retry');
        await sleep(500);

        if (chatQueue) {
          chatQueue.sendGlobal('/tpaccept');
        } else {
          bot.chat('/tpaccept');
        }
      }
    });

    bot.on('message', (jsonMsg) => {
      const text = jsonMsg.toString();
      if (text && text.trim()) {
        log.debug(`[SERVER] ${text}`);
      }
    });

    log.info('ChatHandler aktif');
  },
};

module.exports = ChatHandler;
