export class IntentDetector {
    constructor() {
        // Command murni yang seharusnya dieksekusi Baileys langsung, bukan direspon AI
        this.pureCommands = [
            'menu', 'help', 'owner', 'play', 'tiktok', 'tt', 'ig', 'igstory', 
            'ytmp3', 'ytmp4', 'spotify', 'fbdl', 'capcut', 'pindl', 
            'stiker', 's', 'smeme', 'toimg', 'tomp3', 'ocr', 'tr', 'rvo',
            'tebakgambar', 'family100', 'caklontong', 'susunkata', 'tebakangka', 'asahotak', 'tebakkata',
            'blackjack', 'slot', 'kick', 'add', 'setwelcome', 'hidetag', 'tagall',
            'absen', 'cekabsen', 'lamar', 'nikah', 'tembak', 'pasangan', 'cerai',
            'jodoh', 'cekisihati', 'bucin', 'pelet', 'waifu', 'loli', 'husbu', 'whatanime'
        ];
    }

    isPureCommand(text) {
        if (!text) return false;
        
        let cleaned = text.trim().toLowerCase();
        
        // Cek jika teks mengandung indikasi eksplisit ke fitur murni
        // Misal: "tolong download lagu ini .play blabla"
        const hasCommandPrefix = /^[\.\/!#\$%=>\+\-_~&\*]/.test(cleaned);
        
        if (hasCommandPrefix) {
            let cmdName = cleaned.split(' ')[0].substring(1);
            if (this.pureCommands.includes(cmdName)) {
                return true;
            }
        }
        
        return false;
    }

    getCommandSuggestion(text) {
        let cleaned = text.trim().toLowerCase();
        
        // Natural language intent detection
        if (cleaned.includes('download lagu') || cleaned.includes('putar lagu')) return '.play';
        if (cleaned.includes('download tiktok') || cleaned.includes('video tiktok')) return '.tiktok';
        if (cleaned.includes('bikin stiker') || cleaned.includes('buat stiker')) return '.s';
        if (cleaned.includes('siapa owner') || cleaned.includes('sewa bot')) return '.owner';
        if (cleaned.includes('menu bot') || cleaned.includes('list command')) return '.menu';
        
        return null;
    }
}
