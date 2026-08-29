/**
 * PromptBuilder.js — NelBot-MD Memory System v2
 *
 * Merakit seluruh layer sistem prompt secara rapi, dinamis, dan terstruktur.
 */

export class PromptBuilder {
    constructor(knowledgeRetriever) {
        this.knowledge = knowledgeRetriever;
    }

    /**
     * Membangun string system prompt lengkap berdasarkan konteks yang sudah disiapkan.
     *
     * @param {object} m - Message object
     * @param {string} textPrompt - Pesan user
     * @param {object} contextData - Data dari ContextBuilder { summaryText, ltmContextText, knowledgeText }
     * @returns {string} systemPrompt
     */
    buildSystemPrompt(m, textPrompt, contextData = {}) {
        const persona = this.knowledge.getPersona(global.namebot || 'NelBot-MD');
        const promptLayers = [];

        // 1. Identitas & Aturan Utama
        promptLayers.push(`# IDENTITAS\n${persona.identity}`);
        promptLayers.push(`# ATURAN PENTING\n${persona.rules.map(r => '- ' + r).join('\n')}`);

        // 2. Daftar Fitur Executable (Command Execution)
        const execPrompt = this.knowledge.getExecutableCommandsPrompt();
        if (execPrompt) {
            promptLayers.push(execPrompt);
        }

        // 3. Konteks Lingkungan & Waktu
        let wibh = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false });
        let hourNum = parseInt(wibh, 10) || 12;
        let timeOfDay = hourNum >= 3 && hourNum < 11 ? 'Pagi' : hourNum >= 11 && hourNum < 15 ? 'Siang' : hourNum >= 15 && hourNum < 18 ? 'Sore' : 'Malam';

        const userName = m.pushName || m.name || 'Teman';
        const botName = global.namebot || 'NelBot-MD';
        const ownerName = global.author || 'Nenel';

        let contextLayer = `# KONTEKS SAAT INI\n` +
            `- Waktu lokal: ${timeOfDay} (WIB)\n` +
            `- Lingkungan: ${m.isGroup ? 'Grup WhatsApp' : 'Private Chat WhatsApp'}\n` +
            `- Nama user saat ini: ${userName}\n` +
            `- Nama bot: ${botName}\n` +
            `- Owner resmi bot: ${ownerName}`;
        promptLayers.push(contextLayer);

        // 4. Ringkasan Percakapan Sebelumnya (Summary)
        if (contextData.summaryText) {
            promptLayers.push(contextData.summaryText);
        }

        // 5. Long-Term Memory (Fakta Relevan User)
        if (contextData.ltmContextText) {
            promptLayers.push(contextData.ltmContextText);
        }

        // 6. Bot Knowledge Relevan (RAG)
        if (contextData.knowledgeText) {
            promptLayers.push(contextData.knowledgeText);
        }

        // 7. Few-Shot Examples (Tone & Style Guide)
        if (persona.few_shot_examples && Array.isArray(persona.few_shot_examples)) {
            let examples = persona.few_shot_examples
                .map(ex => `User: ${ex.user}\nAssistant: ${ex.assistant}`)
                .join('\n\n');
            promptLayers.push(`# CONTOH GAYA BICARA & RESPON\n${examples}`);
        }

        return promptLayers.join('\n\n');
    }
}
