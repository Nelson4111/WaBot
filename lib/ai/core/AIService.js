import { ModelManager } from '../providers/ModelManager.js';
import { PromptBuilder } from './PromptBuilder.js';
import { IntentDetector } from './IntentDetector.js';
import { KnowledgeRetriever } from '../knowledge/KnowledgeRetriever.js';
import { ShortTermMemory } from '../memory/ShortTermMemory.js';
import { LongTermMemory } from '../memory/LongTermMemory.js';

export class AIService {
    constructor() {
        this.modelManager = new ModelManager();
        this.knowledge = new KnowledgeRetriever();
        this.ltMemory = new LongTermMemory();
        this.stMemory = new ShortTermMemory(1500); // 1500 tokens max context
        this.promptBuilder = new PromptBuilder(this.knowledge, this.ltMemory);
        this.intentDetector = new IntentDetector();
    }

    async processMessage(conn, m, textPrompt, sendAsVN = false) {
        // 1. Intent Detection check
        if (this.intentDetector.isPureCommand(textPrompt)) {
            // It's a command like .play, don't run AI. Let Baileys handle it.
            return;
        }

        const suggestedCommand = this.intentDetector.getCommandSuggestion(textPrompt);
        if (suggestedCommand) {
            // Instead of answering lengthily, suggest the fast command
            textPrompt += `\n[Sistem: User sepertinya ingin menggunakan fitur ${suggestedCommand}. Sarankan command tersebut dengan singkat.]`;
        }

        await conn.sendPresenceUpdate('composing', m.chat).catch(() => {});

        // 2. Build Prompt
        const systemPrompt = this.promptBuilder.buildSystemPrompt(m, textPrompt);
        
        // 3. Prepare History Context
        const history = this.stMemory.getHistory(m);
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: textPrompt }
        ];

        try {
            // 4. Generate Response via ModelManager
            const replyText = await this.modelManager.generate(messages);

            // 5. Memory Update
            this.stMemory.addMessage(m, 'user', textPrompt);
            this.stMemory.addMessage(m, 'assistant', replyText);

            // 6. Send Response & Record AI Message ID
            let sentMsg;
            if (sendAsVN) {
                let cleanSpeechText = replyText.replace(/[*_~`#\-]/g, '').trim();
                let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanSpeechText.slice(0, 300))}&tl=id&client=tw-ob`;
                sentMsg = await conn.sendMessage(m.chat, {
                    audio: { url: ttsUrl },
                    mimetype: 'audio/mp4',
                    ptt: true
                }, { quoted: m });
            } else {
                sentMsg = await conn.sendMessage(m.chat, { text: replyText }, { quoted: m });
            }

            if (sentMsg?.key?.id) {
                global.aiMessages = global.aiMessages || new Set();
                if (global.aiMessages.size > 1000) {
                    const first = global.aiMessages.values().next().value;
                    global.aiMessages.delete(first);
                }
                global.aiMessages.add(sentMsg.key.id);
            }

        } catch (error) {
            console.error('AIService Error:', error);
            await conn.sendMessage(m.chat, { text: "Aduh maaf Kak, otakku lagi ngeblank dikit nih. Coba tanya lagi ya hehe 🙏" }, { quoted: m });
        }
    }
}
