/**
 * ContextBuilder.js — NelBot-MD Memory System v2
 *
 * Mengelola perakitan konteks AI secara selektif & efisien:
 *   1. Recent Conversation (terbaru, chronological)
 *   2. Summary percakapan lampau (jika ada)
 *   3. Long-Term Memory (relevance scoring + category boost)
 *   4. Bot Knowledge (keyword retrieval)
 *   5. Token Budgeting (~1,200 input tokens max)
 *   6. Debug logging
 */

export class ContextBuilder {
    constructor(recentMemory, longTermMemory, knowledgeRetriever) {
        this.recentMemory = recentMemory;
        this.longTermMemory = longTermMemory;
        this.knowledgeRetriever = knowledgeRetriever;
        this.debug = false; // Setel true untuk melihat rincian token & retrieval di console
    }

    /**
     * Membangun context lengkap yang sudah dibudget & difilter untuk model LLM.
     *
     * @param {object} m - Message object
     * @param {string} cleanUserText - Teks pesan user yang sudah disanitasi
     * @returns {object} { systemLayers, recentHistory, stats }
     */
    buildContext(m, cleanUserText) {
        const stats = {
            recentCount: 0,
            ltmCandidates: 0,
            ltmSelected: 0,
            hasSummary: false,
            hasKnowledge: false,
            estimatedTokens: 0
        };

        // 1. Ambil Recent Messages (sudah dibatasi ~450 tokens chronological)
        const recentHistory = this.recentMemory.getHistoryForPrompt(m);
        stats.recentCount = recentHistory.length;

        // 2. Ambil Summary Session (jika ada)
        const summaryText = this.recentMemory.formatSummaryForPrompt(m);
        stats.hasSummary = !!summaryText;

        // 3. Relevance Scoring & Filter untuk Long-Term Memory
        const activeFacts = this.longTermMemory.getActiveFacts(m);
        stats.ltmCandidates = activeFacts.length;

        const relevantFacts = this._selectRelevantFacts(cleanUserText, activeFacts);
        stats.ltmSelected = relevantFacts.length;

        const ltmContextText = this._formatLTMContext(relevantFacts);

        // 4. Ambil Bot Knowledge (RAG sederhana)
        const knowledgeText = this.knowledgeRetriever.getRelevantCommands(cleanUserText);
        stats.hasKnowledge = !!knowledgeText;

        // 5. Hitung Estimasi Total Token
        const baseSystemEst = 350; // Persona, rules, commands whitelist
        const summaryEst = this._estimateTokens(summaryText);
        const ltmEst = this._estimateTokens(ltmContextText);
        const knowledgeEst = this._estimateTokens(knowledgeText);
        const recentEst = recentHistory.reduce((acc, msg) => acc + this._estimateTokens(msg.content), 0);
        const userEst = this._estimateTokens(cleanUserText);

        stats.estimatedTokens = baseSystemEst + summaryEst + ltmEst + knowledgeEst + recentEst + userEst;

        if (this.debug) {
            console.log(`[AI Context] Session: ${this.recentMemory.getSessionKey(m)} | Recent: ${stats.recentCount} | LTM: ${stats.ltmSelected}/${stats.ltmCandidates} | Summary: ${stats.hasSummary ? 'Yes' : 'No'} | EstTokens: ${stats.estimatedTokens}`);
        }

        return {
            summaryText,
            ltmContextText,
            knowledgeText,
            recentHistory,
            stats
        };
    }

    // ─── Relevance Scoring Logic ──────────────────────────────────────────────

    /**
     * Menyaring fakta LTM berdasarkan kata kunci, sinonim, bobot kategori, dan recency.
     */
    _selectRelevantFacts(userText, facts) {
        if (!facts || facts.length === 0) return [];
        if (!userText) return facts.filter(f => f.category === 'preference');

        const scoredFacts = facts.map(fact => ({
            fact,
            score: this._scoreFact(userText, fact)
        }));

        // Saring fakta yang memenuhi ambang batas skor (>= 0.20)
        // Batasi maksimal 3 fakta paling relevan untuk menjaga prompt tetap ringkas
        return scoredFacts
            .filter(item => item.score >= 0.20)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.fact);
    }

    _scoreFact(userText, fact) {
        const textLower = userText.toLowerCase();
        const factLower = fact.text.toLowerCase();

        let score = 0;

        // 1. Category Boost (Preference diprioritaskan karena mendefinisikan panggilan/gaya)
        const categoryBoost = {
            preference: 0.35,
            context: 0.15,
            interest: 0.10,
            topic: 0.05
        };
        score += categoryBoost[fact.category] || 0.05;

        // 2. Exact keyword overlap
        const words = textLower.split(/\s+/).filter(w => w.length > 2);
        for (const w of words) {
            if (factLower.includes(w)) {
                score += 0.30;
            }
        }

        // 3. Semantic keyword cluster matching
        const SYNONYMS = {
            musik: ['lagu', 'audio', 'playlist', 'sound', 'nyanyi', 'denger', 'spotify', 'play', 'ytmp3', 'musik'],
            game: ['game', 'tebak', 'main', 'slot', 'blackjack', 'tebakgambar', 'family100'],
            coding: ['bot', 'coding', 'script', 'program', 'develop', 'javascript', 'api'],
            nama: ['siapa', 'namaku', 'namaku?', 'panggilan', 'kenal', 'ingat']
        };

        for (const [cluster, terms] of Object.entries(SYNONYMS)) {
            const matchesUser = terms.some(t => textLower.includes(t));
            const matchesFact = terms.some(t => factLower.includes(t));
            if (matchesUser && matchesFact) {
                score += 0.40;
                break;
            }
        }

        // 4. Confidence scaling
        score *= (fact.confidence || 0.80);

        return score;
    }

    _formatLTMContext(facts) {
        if (!facts || facts.length === 0) return '';
        const list = facts.map(f => `- ${f.text}`).join('\n');
        return `\n# MEMORI TENTANG PENGGUNA INI (LTM)\n${list}`;
    }

    _estimateTokens(text) {
        if (!text) return 0;
        return Math.ceil(text.split(/\s+/).length * 1.3);
    }
}
