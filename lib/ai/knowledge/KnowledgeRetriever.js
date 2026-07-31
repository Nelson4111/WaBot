import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class KnowledgeRetriever {
    constructor() {
        this.commandsDB = this.loadJSON('commands.json');
        this.personaDB = this.loadJSON('persona.json');
    }

    loadJSON(filename) {
        try {
            const data = fs.readFileSync(path.join(__dirname, filename), 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error(`Failed to load ${filename}:`, e);
            return {};
        }
    }

    getPersona(botName) {
        const persona = { ...this.personaDB };
        if (persona.identity) {
            persona.identity = persona.identity.replace('{botName}', botName || 'NelBot-MD');
        }
        return persona;
    }

    getRelevantCommands(text) {
        if (!text) return '';
        const lowercaseText = text.toLowerCase();
        let relevantKnowledge = [];

        for (const [category, data] of Object.entries(this.commandsDB)) {
            const isRelevant = data.keywords.some(kw => lowercaseText.includes(kw));
            if (isRelevant) {
                relevantKnowledge.push(`- Jika pengguna bertanya tentang ${category}, sampaikan: ${data.commands} (Lebih lengkap arahkan ke: ${data.menu})`);
            }
        }

        return relevantKnowledge.length > 0 
            ? `\n# INFORMASI RELEVAN UNTUK PERTANYAAN INI:\n${relevantKnowledge.join('\n')}`
            : '';
    }
}
