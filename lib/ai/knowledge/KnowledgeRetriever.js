import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class KnowledgeRetriever {
    constructor() {
        this.commandsDB = this.loadJSON('commands.json');
        this.personaDB = this.loadJSON('persona.json');
        this.execCommandsDB = this.loadJSON('executable_commands.json');
    }

    loadJSON(filename) {
        try {
            const data = fs.readFileSync(path.join(__dirname, filename), 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error(`[KnowledgeRetriever] Failed to load ${filename}:`, e.message);
            return {};
        }
    }

    getPersona(botName) {
        const persona = JSON.parse(JSON.stringify(this.personaDB));
        if (persona.identity) {
            persona.identity = persona.identity.replace('{botName}', botName || global.namebot || 'NelBot-MD');
        }
        return persona;
    }

    getRelevantCommands(text) {
        if (!text) return '';
        const lowercaseText = text.toLowerCase();
        let relevantKnowledge = [];

        const ownerName = global.author || 'Nenel';
        const ownerNumber = global.nomorown || '6281242432747';

        for (const [category, data] of Object.entries(this.commandsDB)) {
            // Cek apakah ada keyword yang cocok
            const isRelevant = data.keywords.some(kw => {
                if (kw.includes(' ')) {
                    return lowercaseText.includes(kw);
                }
                const regex = new RegExp(`\\b${kw}\\b`, 'i');
                return regex.test(lowercaseText) || lowercaseText.includes(kw);
            });

            if (isRelevant) {
                let infoCmd = data.commands
                    .replace('{ownerName}', ownerName)
                    .replace('{ownerNumber}', ownerNumber);
                relevantKnowledge.push(`- Kategori ${category}: ${infoCmd} (Menu lengkap: ${data.menu})`);
            }
        }

        return relevantKnowledge.length > 0 
            ? `\n# INFORMASI RELEVAN DARI SISTEM:\n${relevantKnowledge.join('\n')}`
            : '';
    }

    getExecutableCommandsPrompt() {
        const cmds = this.execCommandsDB.commands;
        if (!cmds || !Array.isArray(cmds) || cmds.length === 0) return '';

        const list = cmds.map(c => `- .${c.name}: ${c.description} -> format: ${c.example}`).join('\n');
        return `\n# DAFTAR FITUR BOT YANG BISA KAMU JALANKAN SECARA OTOMATIS\nJika user meminta fitur di bawah, gunakan format [CMD:nama_command:argumen] di awal respons:\n${list}`;
    }
}
