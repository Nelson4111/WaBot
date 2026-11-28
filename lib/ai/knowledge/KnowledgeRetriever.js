import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pluginKnowledgeIndex } from './PluginKnowledgeIndex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class KnowledgeRetriever {
    constructor() {
        this.commandsDB = this.loadJSON('commands.json');
        this.personaDB = this.loadJSON('persona.json');
        this.execCommandsDB = this.loadJSON('executable_commands.json');
        this.pluginIndex = pluginKnowledgeIndex;
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
            persona.identity = persona.identity.replace('{botName}', botName || global.namebot || 'Avelia');
        }
        return persona;
    }

    /**
     * Mengambil pengetahuan fitur bot secara selektif (Selective RAG):
     * 1. Jika user bertanya di luar konteks bot (ngobrol umum, koding, pelajaran, curhat),
     *    kembalikan '' (0 token overhead) agar AI menjawab bebas & natural.
     * 2. Jika user bertanya tentang fitur/command bot, ambil Top 3-5 plugin yang paling mendekati
     *    langsung dari file plugin aslinya melalui PluginKnowledgeIndex, dilengkapi info kategori/owner jika relevan.
     */
    getRelevantCommands(text, { isOwner = false } = {}) {
        if (!text) return '';

        // Gate 1: Cek apakah pertanyaan user berkaitan dengan bot / fitur bot
        if (!this.pluginIndex.isBotFeatureQuery(text)) {
            return '';
        }

        const lowercaseText = text.toLowerCase();
        const sections = [];

        const ownerName = global.author || 'Nenel';
        const ownerNumber = global.nomorown || '79223679360';

        // 1. Ambil Top 3-5 Plugin paling mendekati langsung dari file plugin (Single Source of Truth)
        const dynamicPluginContext = this.pluginIndex.buildAIPluginContext(text, { isOwner });
        if (dynamicPluginContext) {
            sections.push(dynamicPluginContext.trim());
        }

        // 2. Tambahkan info kategori umum / info sewa & owner dari commands.json jika relevan
        const categoryMatches = [];
        for (const [category, data] of Object.entries(this.commandsDB)) {
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
                categoryMatches.push(`- Kategori ${category}: ${infoCmd} (Menu lengkap: ${data.menu})`);
            }
        }

        if (categoryMatches.length > 0) {
            sections.push(`# RINGKASAN KATEGORI TERKAIT:\n${categoryMatches.join('\n')}`);
        }

        return sections.length > 0 ? `\n${sections.join('\n\n')}` : '';
    }

    getExecutableCommandsPrompt() {
        const cmds = this.execCommandsDB.commands;
        if (!cmds || !Array.isArray(cmds) || cmds.length === 0) return '';

        const list = cmds.map(c => `- .${c.name}: ${c.description} -> format: ${c.example}`).join('\n');
        return `\n# DAFTAR FITUR BOT YANG BISA KAMU JALANKAN SECARA OTOMATIS\nJika user secara langsung meminta kamu menjalankan aksi di bawah (bukan sekadar bertanya cara pakai), gunakan format [CMD:nama_command:argumen] di awal respons:\n${list}`;
    }
}
