/**
 * AIService.js — NelBot-MD Memory System v2
 *
 * Koordinator utama sistem AI NelBot-MD:
 *   - Cooldown management (rate-limit spam)
 *   - Sanitasi input (anti-prompt injection)
 *   - Context & token budgeting via ContextBuilder
 *   - Prompt composition via PromptBuilder
 *   - Model invocation (Groq + Pollinations fallback)
 *   - AI Command Execution via CommandExecutor
 *   - Clean memory storage (bebas internal markers)
 *   - Heuristic long-term fact extraction
 */

import { ModelManager } from '../providers/ModelManager.js';
import { PromptBuilder } from './PromptBuilder.js';
import { IntentDetector } from './IntentDetector.js';
import { KnowledgeRetriever } from '../knowledge/KnowledgeRetriever.js';
import { RecentMemory } from '../memory/RecentMemory.js';
import { LongTermMemory } from '../memory/LongTermMemory.js';
import { ContextBuilder } from './ContextBuilder.js';
import { CommandExecutor } from './CommandExecutor.js';

export class AIService {
    constructor() {
        this.modelManager = new ModelManager();
        this.knowledge = new KnowledgeRetriever();
        this.recentMemory = new RecentMemory();
        this.ltMemory = new LongTermMemory();
        this.contextBuilder = new ContextBuilder(this.recentMemory, this.ltMemory, this.knowledge);
        this.promptBuilder = new PromptBuilder(this.knowledge);
        this.intentDetector = new IntentDetector();
        this.commandExecutor = new CommandExecutor();

        this.cooldowns = new Map(); // sender -> timestamp
    }

    /**
     * Memproses pesan masuk dari WhatsApp.
     *
     * @param {object} conn - Baileys client instance
     * @param {object} m - Message object
     * @param {string} textPrompt - Teks mentah dari user
     * @param {boolean} sendAsVN - Kirim balasan sebagai audio voice note
     */
    async processMessage(conn, m, textPrompt, sendAsVN = false) {
        if (!textPrompt || typeof textPrompt !== 'string') return;

        // 1. Rate-Limit / Cooldown Check (3s PC, 5s Grup)
        const cooldownMs = m.isGroup ? 5000 : 3000;
        const now = Date.now();
        const lastTime = this.cooldowns.get(m.sender) || 0;
        if (now - lastTime < cooldownMs) {
            console.log(`[AIService] Cooldown active for ${m.sender} (${now - lastTime}ms < ${cooldownMs}ms)`);
            return;
        }
        this.cooldowns.set(m.sender, now);

        // 2. Pure Command Check (Abaikan jika command resmi agar Baileys yang proses)
        if (this.intentDetector.isPureCommand(textPrompt)) {
            return;
        }

        // 3. Sanitasi Input User (Hapus fake system tags dari user)
        const cleanUserText = this.sanitizeInput(textPrompt);
        if (!cleanUserText) return;

        await conn.sendPresenceUpdate('composing', m.chat).catch(() => {});

        // 4. Build Selective Context & Budgeting
        const contextData = this.contextBuilder.buildContext(m, cleanUserText);

        // 5. Build System Prompt
        const systemPrompt = this.promptBuilder.buildSystemPrompt(m, cleanUserText, contextData);

        // 6. Siapkan Payload User untuk Model (Injeksi hint kontekstual HANYA ke model, BUKAN ke memory)
        let modelUserPrompt = cleanUserText;
        const suggestion = this.intentDetector.getCommandSuggestion(cleanUserText);
        if (suggestion) {
            modelUserPrompt += `\n<bot_context>User mungkin ingin menggunakan fitur ${suggestion}</bot_context>`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...contextData.recentHistory,
            { role: 'user', content: modelUserPrompt }
        ];

        try {
            // 7. Panggil Model LLM (Groq / Fallback)
            const rawReply = await this.modelManager.generate(messages);

            // 8. Parse Command Execution Tag jika ada: [CMD:commandName:args]
            const { cleanReplyText, commandName, commandArgs } = this.parseCommandMarker(rawReply);

            // 9. Kirim Respon ke User
            let sentMsg;
            if (sendAsVN) {
                let cleanSpeechText = cleanReplyText.replace(/[*_~`#\-]/g, '').trim();
                let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanSpeechText.slice(0, 300))}&tl=id&client=tw-ob`;
                sentMsg = await conn.sendMessage(m.chat, {
                    audio: { url: ttsUrl },
                    mimetype: 'audio/mp4',
                    ptt: true
                }, { quoted: m });
            } else {
                sentMsg = await conn.sendMessage(m.chat, { text: cleanReplyText }, { quoted: m });
            }

            // Record ID pesan AI untuk fitur reply di grup
            if (sentMsg?.key?.id) {
                global.aiMessages = global.aiMessages || new Set();
                if (global.aiMessages.size > 1000) {
                    const first = global.aiMessages.values().next().value;
                    global.aiMessages.delete(first);
                }
                global.aiMessages.add(sentMsg.key.id);
            }

            // 10. Eksekusi Command jika AI memutuskan untuk menjalankan fitur bot
            if (commandName) {
                await this.commandExecutor.execute(conn, m, commandName, commandArgs);
            }

            // 11. Simpan ke Memory (HANYA teks bersih, bebas dari marker sistem)
            this.recentMemory.addMessage(m, 'user', cleanUserText);
            this.recentMemory.addMessage(m, 'assistant', cleanReplyText);

            // 12. Ekstrak Fakta Jangka Panjang (Heuristic extraction)
            this.ltMemory.extractFromInteraction(m, cleanUserText, cleanReplyText);

        } catch (error) {
            console.error('[AIService] Execution Error:', error);
            await conn.sendMessage(m.chat, { 
                text: "Aduh maaf, koneksi AI-ku lagi agak terganggu nih. Coba tanya lagi ya sebentar lagi 🙏" 
            }, { quoted: m });
        }
    }

    // ─── Utilities ────────────────────────────────────────────────────────────

    /**
     * Sanitasi teks input user untuk mencegah serangan manipulasi system tag
     */
    sanitizeInput(text) {
        if (!text || typeof text !== 'string') return '';
        return text
            .replace(/\[Sistem:[^\]]*\]/gi, '')
            .replace(/\[System:[^\]]*\]/gi, '')
            .replace(/<bot_hint>[^<]*<\/bot_hint>/gi, '')
            .replace(/<bot_context>[^<]*<\/bot_context>/gi, '')
            .replace(/\[CMD:[^\]]*\]/gi, '')
            .trim();
    }

    /**
     * Memisahkan tag [CMD:command:args] dari balasan natural AI
     */
    parseCommandMarker(replyText) {
        if (!replyText || typeof replyText !== 'string') {
            return { cleanReplyText: '', commandName: null, commandArgs: null };
        }

        const match = replyText.match(/\[CMD:([a-zA-Z0-9_\-]+):(.*?)\]/s);
        if (match) {
            const commandName = match[1].toLowerCase().trim();
            const commandArgs = match[2].trim();
            const cleanReplyText = replyText.replace(/\[CMD:[^\]]*\]/s, '').trim();
            return { cleanReplyText, commandName, commandArgs };
        }

        return { cleanReplyText: replyText.trim(), commandName: null, commandArgs: null };
    }
}
