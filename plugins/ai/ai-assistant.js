import { AIService } from '../../lib/ai/core/AIService.js';

// Singleton instance agar memory & models tidak diinisialisasi ulang
const aiService = new AIService();

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let qText = text || m.text;
    if (!qText) return m.reply(`Masukkan pertanyaan!\n\nContoh: *${usedPrefix + command} cara buat stiker* atau *${usedPrefix}aivn ceritakan lelucon*`);
    
    let isVN = /^(aivn|vnai)$/i.test(command) || text?.includes('--vn');
    let cleanPrompt = text?.replace(/--vn/gi, '').trim() || qText;
    
    await aiService.processMessage(conn, m, cleanPrompt, isVN);
};

// Auto-reply untuk Group (harus diawali @) & Private Chat (semua pesan santai)
handler.all = async function (m) {
    if (!m.text || m.isBaileys || m.fromMe) return;

    let text = m.text.trim();

    // Di Grup: Hanya respon jika pesan diawali @ (tag bot atau sekedar karakter @)
    if (m.isGroup) {
        if (!text.startsWith('@')) return;
        text = text.substring(1).trim(); // Hapus @
    } else {
        // Di Private Chat: Abaikan jika pesan diawali simbol command resmi (seperti . / ! # $)
        let isSymbolCommand = /^[\.\/!#\$%=>\+\-_~&\*]/.test(text);
        if (isSymbolCommand) return;
    }

    if (!text) return; // Jika pesan kosong setelah dibersihkan

    let isVN = text.includes('--vn');
    let cleanPrompt = text.replace(/--vn/gi, '').trim();

    await aiService.processMessage(this, m, cleanPrompt, isVN);
};

handler.help = ['ai <pertanyaan>', 'groq <pertanyaan>', 'aivn <pertanyaan>'];
handler.tags = ['ai'];
handler.command = /^(ai|groq|aiassistant|aivn|vnai)$/i;

export default handler;
