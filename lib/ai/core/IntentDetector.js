/**
 * IntentDetector.js — NelBot-MD Memory System v2
 *
 * Mendeteksi intent user untuk memisahkan:
 *   1. Pure commands (diawali prefix . / ! dsb yang terdaftar di global.plugins) -> Abaikan untuk Baileys
 *   2. Natural suggestions (pertanyaan tentang fitur)
 */

export class IntentDetector {

    isPureCommand(text) {
        if (!text || typeof text !== 'string') return false;

        const cleaned = text.trim();
        const hasPrefix = /^[\.\/!#\$%=>\+\-_~&\*]/.test(cleaned);
        if (!hasPrefix) return false;

        const cmdName = cleaned.slice(1).split(/\s+/)[0].toLowerCase();
        if (!cmdName) return false;

        // Cek secara dinamis di global.plugins jika tersedia
        if (global.plugins) {
            for (const plugin of Object.values(global.plugins)) {
                if (!plugin || plugin.disabled) continue;
                const cmd = plugin.command;
                if (cmd instanceof RegExp && cmd.test(cmdName)) return true;
                if (Array.isArray(cmd) && cmd.some(c => c instanceof RegExp ? c.test(cmdName) : c === cmdName)) return true;
                if (typeof cmd === 'string' && cmd === cmdName) return true;
            }
        }

        // Fallback check ke command umum
        const fallbackCommands = [
            'menu', 'help', 'owner', 'play', 'tiktok', 'tt', 'ig', 'ytmp3', 'ytmp4',
            'spotify', 'fbdl', 'capcut', 'pindl', 'stiker', 's', 'smeme', 'toimg',
            'tebakgambar', 'family100', 'blackjack', 'slot', 'cosrent'
        ];

        return fallbackCommands.includes(cmdName);
    }

    getCommandSuggestion(text) {
        if (!text) return null;
        const cleaned = text.trim().toLowerCase();

        // Natural language intent detection
        if (cleaned.includes('download lagu') || cleaned.includes('putar lagu') || cleaned.includes('play lagu')) return '.play';
        if (cleaned.includes('download tiktok') || cleaned.includes('video tiktok')) return '.tiktok';
        if (cleaned.includes('bikin stiker') || cleaned.includes('buat stiker') || cleaned.includes('jadikan stiker')) return '.s';
        if (cleaned.includes('siapa owner') || cleaned.includes('nomor owner') || cleaned.includes('sewa bot')) return '.owner';
        if (cleaned.includes('menu bot') || cleaned.includes('list command') || cleaned.includes('daftar menu')) return '.menu';

        return null;
    }
}
