/**
 * RecentMemory.js — NelBot-MD Memory System v2
 *
 * Menggantikan ShortTermMemory.js
 *
 * Prinsip: STORE MORE, SEND LESS.
 *   - Storage: max 20 pesan per session
 *   - Prompt: hanya kirim pesan yang muat di token budget (~350-500 token)
 *   - Isolasi: group memory per user (chat_sender), bukan per chat
 *   - Timestamp per pesan
 *   - Summary saat overflow (heuristic, tanpa LLM call)
 *   - Housekeeping: hapus session tidak aktif > 30 hari
 */

const RECENT_MAX_MESSAGES = 20;
const RECENT_PROMPT_TOKEN_BUDGET = 450; // Target token budget untuk recent messages di prompt
const SESSION_TTL_DAYS = 30;            // Hapus session tidak aktif > 30 hari
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export class RecentMemory {

    // ─── Session Key ──────────────────────────────────────────────────────────

    getSessionKey(m) {
        // Grup: isolasi per user dalam grup
        // PC: per sender
        return m.isGroup
            ? `${m.chat}_${m.sender}`
            : m.sender;
    }

    // ─── Session Access ───────────────────────────────────────────────────────

    getSession(m) {
        const key = this.getSessionKey(m);
        const db = global.db?.data;
        if (!db) return { messages: [], summary: null, lastActivity: Date.now() };

        if (!db.aiSessions) db.aiSessions = {};

        if (!db.aiSessions[key]) {
            // Coba migrasi data lama (PC saja — grup tidak dimigrasikan karena tercampur)
            db.aiSessions[key] = this._migrateOrCreate(m);
        }

        return db.aiSessions[key];
    }

    _migrateOrCreate(m) {
        const now = Date.now();
        const db = global.db?.data;

        // Migrasi PC: users[sender].aiHistory
        if (!m.isGroup && db?.users?.[m.sender]?.aiHistory) {
            const oldHistory = db.users[m.sender].aiHistory;
            delete db.users[m.sender].aiHistory;
            console.log(`[RecentMemory] Migrated ${oldHistory.length} messages from legacy aiHistory for ${m.sender}`);
            return {
                messages: oldHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    ts: now // Timestamp tidak ada di data lama, gunakan now
                })).slice(-RECENT_MAX_MESSAGES),
                summary: null,
                lastActivity: now
            };
        }

        // Baru
        return {
            messages: [],
            summary: null,
            lastActivity: now
        };
    }

    // ─── Get History (untuk prompt building) ─────────────────────────────────

    /**
     * Kembalikan array messages untuk dikirim ke model.
     * Hanya ambil pesan terbaru yang muat dalam token budget.
     * Urutan tetap chronological (terlama → terbaru).
     */
    getHistoryForPrompt(m) {
        const session = this.getSession(m);
        const messages = session.messages || [];

        if (messages.length === 0) return [];

        // Pilih dari belakang (paling baru) sampai budget habis
        let tokenCount = 0;
        let selectedCount = 0;

        for (let i = messages.length - 1; i >= 0; i--) {
            const tokenEst = this._estimateTokens(messages[i].content);
            if (tokenCount + tokenEst > RECENT_PROMPT_TOKEN_BUDGET) break;
            tokenCount += tokenEst;
            selectedCount++;
        }

        // Kembalikan dalam urutan chronological (bukan reversed)
        return messages.slice(-selectedCount).map(({ role, content }) => ({ role, content }));
    }

    /**
     * Kembalikan array messages mentah (untuk summary building, dll)
     */
    getRawMessages(m) {
        return this.getSession(m).messages || [];
    }

    /**
     * Kembalikan summary session saat ini (null jika belum ada)
     */
    getSummary(m) {
        return this.getSession(m).summary || null;
    }

    // ─── Add Message ──────────────────────────────────────────────────────────

    /**
     * Tambah pesan baru ke session.
     * Jangan menyimpan internal markers ke memory.
     *
     * @param {object} m - message object
     * @param {'user'|'assistant'} role
     * @param {string} content - teks BERSIH (tanpa [Sistem:] atau [CMD:...])
     */
    addMessage(m, role, content) {
        const cleanContent = this._cleanContent(role, content);
        if (!cleanContent) return; // Skip pesan kosong setelah cleaning

        const session = this.getSession(m);
        const now = Date.now();

        session.messages.push({ role, content: cleanContent, ts: now });
        session.lastActivity = now;

        // Overflow check: jika > 20, buat summary lalu prune
        if (session.messages.length > RECENT_MAX_MESSAGES) {
            this._pruneWithSummary(session);
        }
    }

    // ─── Content Cleaning ─────────────────────────────────────────────────────

    /**
     * Bersihkan marker internal dari konten sebelum disimpan.
     *
     * User: hapus [Sistem:...] dan tag sistem lain
     * Assistant: hapus [CMD:command:args] marker, simpan teks balasan saja
     */
    _cleanContent(role, content) {
        if (!content || typeof content !== 'string') return '';

        if (role === 'user') {
            // Hapus tag sistem yang mungkin diinjeksi
            return content
                .replace(/\[Sistem:[^\]]*\]/gi, '')
                .replace(/\[System:[^\]]*\]/gi, '')
                .replace(/<bot_hint>[^<]*<\/bot_hint>/gi, '')
                .replace(/<bot_context>[^<]*<\/bot_context>/gi, '')
                .trim();
        }

        if (role === 'assistant') {
            // Hapus [CMD:command:args] marker dari response AI
            // Yang disimpan hanya teks natural balasan
            return content
                .replace(/\[CMD:[^\]]*\]/g, '')
                .trim();
        }

        return content.trim();
    }

    // ─── Overflow + Summary ───────────────────────────────────────────────────

    /**
     * Ketika messages > 20:
     * 1. Ambil 10 pesan tertua
     * 2. Buat heuristic summary dari pesan tersebut
     * 3. Merge dengan summary yang sudah ada
     * 4. Hapus 10 pesan tertua
     */
    _pruneWithSummary(session) {
        const pruneCount = session.messages.length - RECENT_MAX_MESSAGES;
        const toSummarize = session.messages.splice(0, pruneCount);

        const newSummary = this._buildHeuristicSummary(toSummarize);
        session.summary = this._mergeSummary(session.summary, newSummary);

        console.log(`[RecentMemory] Pruned ${pruneCount} messages, summary updated.`);
    }

    /**
     * Buat summary dari pesan yang akan di-prune.
     * Gunakan heuristic — TANPA LLM call.
     *
     * @returns {{ topics: string[], importantFacts: string[], unresolved: string[], ts: number }}
     */
    _buildHeuristicSummary(messages) {
        const userMessages = messages
            .filter(m => m.role === 'user')
            .map(m => m.content.toLowerCase());

        const assistantMessages = messages
            .filter(m => m.role === 'assistant')
            .map(m => m.content);

        // ── Ekstrak topik dari kata kunci ──
        const TOPIC_KEYWORDS = {
            'download':   ['download', 'tiktok', 'youtube', 'spotify', 'ig', 'instagram', 'lagu', 'video'],
            'stiker':     ['stiker', 'sticker', 'meme', 'stikery'],
            'game':       ['game', 'tebak', 'family100', 'slot', 'blackjack', 'main'],
            'sewa bot':   ['sewa', 'harga', 'paket', 'bulanan', 'permanen', 'biaya'],
            'grup':       ['grup', 'group', 'admin', 'kick', 'add', 'welcome'],
            'musik':      ['lagu', 'musik', 'playlist', 'audio', 'sound', 'nyanyi'],
            'AI/bot':     ['ai', 'bot', 'groq', 'llm', 'model', 'memory', 'api'],
            'cosplay':    ['cosplay', 'cosrent', 'sewa cosplay', 'kostum'],
        };

        const topics = new Set();
        for (const msg of userMessages) {
            for (const [topic, kws] of Object.entries(TOPIC_KEYWORDS)) {
                if (kws.some(kw => msg.includes(kw))) {
                    topics.add(topic);
                }
            }
        }

        // ── Deteksi fakta penting dari pesan AI ──
        const importantFacts = [];
        const IMPORTANT_PATTERNS = [
            /owner.*?adalah\s+(\w+)/i,
            /harga.*?Rp[\s\d.,]+/i,
            /command[:\s]+(\.\w+)/i,
        ];
        for (const msg of assistantMessages) {
            for (const pattern of IMPORTANT_PATTERNS) {
                if (pattern.test(msg)) {
                    importantFacts.push(msg.slice(0, 100).trim());
                    break;
                }
            }
        }

        // ── Deteksi unresolved questions ──
        const unresolved = [];
        const lastUserMsg = userMessages[userMessages.length - 1] || '';
        if (lastUserMsg.includes('?') || /^(gimana|bagaimana|kenapa|kapan|apa)\s/i.test(lastUserMsg)) {
            unresolved.push(lastUserMsg.slice(0, 100).trim());
        }

        return {
            topics: [...topics],
            importantFacts: importantFacts.slice(0, 3),
            unresolved: unresolved.slice(0, 2),
            ts: Date.now()
        };
    }

    /**
     * Merge summary lama dengan summary baru.
     * Prioritaskan importantFacts dan unresolved.
     */
    _mergeSummary(existing, newSummary) {
        if (!existing) return newSummary;

        return {
            topics: [...new Set([...existing.topics, ...newSummary.topics])].slice(0, 8),
            importantFacts: [...new Set([...existing.importantFacts, ...newSummary.importantFacts])].slice(0, 5),
            unresolved: [...new Set([...existing.unresolved, ...newSummary.unresolved])].slice(0, 3),
            ts: Date.now()
        };
    }

    /**
     * Format summary menjadi string untuk system prompt.
     * Target: ~50-100 token
     */
    formatSummaryForPrompt(m) {
        const summary = this.getSummary(m);
        if (!summary) return '';

        const parts = [];
        if (summary.topics?.length > 0) {
            parts.push(`Topik sebelumnya: ${summary.topics.join(', ')}.`);
        }
        if (summary.importantFacts?.length > 0) {
            parts.push(`Info penting: ${summary.importantFacts.join(' | ')}`);
        }
        if (summary.unresolved?.length > 0) {
            parts.push(`Belum terjawab: ${summary.unresolved.join(' | ')}`);
        }

        return parts.length > 0
            ? `\n# RINGKASAN PERCAKAPAN SEBELUMNYA\n${parts.join('\n')}`
            : '';
    }

    // ─── Housekeeping ─────────────────────────────────────────────────────────

    /**
     * Hapus session yang tidak aktif > 30 hari.
     * Panggil sekali saat startup atau secara periodik.
     * TIDAK menghapus LTM (long-term memory).
     */
    runHousekeeping() {
        const db = global.db?.data;
        if (!db?.aiSessions) return;

        const now = Date.now();
        let cleaned = 0;

        for (const key of Object.keys(db.aiSessions)) {
            const session = db.aiSessions[key];
            const lastActivity = session.lastActivity || 0;

            if (now - lastActivity > SESSION_TTL_MS) {
                // Pertahankan summary (konteks lama berharga), hapus messages saja
                session.messages = [];
                // Jika tidak ada summary pun, hapus session sepenuhnya
                if (!session.summary || session.summary.topics?.length === 0) {
                    delete db.aiSessions[key];
                }
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`[RecentMemory] Housekeeping: cleaned ${cleaned} inactive sessions.`);
        }
    }

    // ─── Token Estimation ─────────────────────────────────────────────────────

    _estimateTokens(text) {
        if (!text) return 0;
        // Estimasi kasar: ~1.3 token per kata (cukup untuk budget planning)
        return Math.ceil(text.split(/\s+/).length * 1.3);
    }
}
