export class PromptBuilder {
    constructor(knowledgeRetriever, longTermMemory) {
        this.knowledge = knowledgeRetriever;
        this.ltMemory = longTermMemory;
    }

    buildSystemPrompt(m, textPrompt) {
        // 1. Identity & Rules
        let persona = this.knowledge.getPersona(global.namebot);
        let promptLayers = [];
        
        promptLayers.push(`# IDENTITAS\n${persona.identity}`);
        promptLayers.push(`# ATURAN\n${persona.rules.map(r => '- ' + r).join('\n')}`);

        // 2. Dynamic Context (Time & Environment)
        let wibHour = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false });
        let timeOfDay = wibHour >= 3 && wibHour < 11 ? 'Pagi' : wibHour >= 11 && wibHour < 15 ? 'Siang' : wibHour >= 15 && wibHour < 18 ? 'Sore' : 'Malam';
        
        let contextLayer = `\n# KONTEKS SAAT INI\nWaktu lokal: ${timeOfDay}\nLingkungan: ${m.isGroup ? 'Grup WA' : 'Private Chat WA'}`;
        promptLayers.push(contextLayer);

        // 3. User Data (Long Term Memory)
        let userProfile = this.ltMemory.getProfileContext(m);
        if (userProfile) promptLayers.push(userProfile);

        // 4. Relevant Knowledge (Retrieval-Augmented Generation)
        let relevantKnowledge = this.knowledge.getRelevantCommands(textPrompt);
        if (relevantKnowledge) promptLayers.push(relevantKnowledge);

        // 5. Few-Shot Examples (Tone adjustment)
        if (persona.few_shot_examples) {
            let examples = persona.few_shot_examples.map(ex => `User: ${ex.user}\nAssistant: ${ex.assistant}`).join('\n\n');
            promptLayers.push(`\n# CONTOH GAYA BICARA\n${examples}`);
        }

        return promptLayers.join('\n\n');
    }
}
