import { AIService } from '../../lib/ai/core/AIService.js';

const aiService = new AIService();

// Helper untuk mengecek apakah pesan yang di-reply berasal dari Game / Fitur Non-AI
function isNonAIMessage(m) {
    if (!m.quoted) return false;
    
    let text = (m.quoted.text || '').toLowerCase();
    
    // Kata kunci unik fitur bot non-AI (Game, RPG, Profile, Welcome, dll)
    let nonAiKeywords = [
        'tebak', 'fishing', 'mancing', 'asah otak', 'profile', 'user · profile',
        'welcome', 'goodbye', 'cak lontong', 'family 100', 'susun kata',
        'timeout', 'bonus:', 'hadiah:', 'ketik #', 'ketik .', 'waktu habis',
        'level pancingan', 'hasil cerdas cermat', 'registered :', 'menfess'
    ];

    if (nonAiKeywords.some(k => text.includes(k))) return true;

    return false;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let qText = text || m.text;
    if (!qText) return m.reply(`Masukkan pertanyaan!\n\nContoh: *${usedPrefix + command} cara buat stiker* atau *${usedPrefix}aivn ceritakan lelucon*`);
    
    let isVN = /^(aivn|vnai)$/i.test(command) || text?.includes('--vn');
    let cleanPrompt = text?.replace(/--vn/gi, '').trim() || qText;
    
    await aiService.processMessage(conn, m, cleanPrompt, isVN);
};

// Auto-reply presisi untuk Group & Private Chat
handler.all = async function (m) {
    if (!m.text || m.isBaileys || m.fromMe) return;

    // Jika pesan ini membalas game / non-AI bot message, JANGAN respon
    if (isNonAIMessage(m)) return;

    let text = m.text.trim();

    if (m.isGroup) {
        let botJid = this.user?.id ? this.user.id.split('@')[0].split(':')[0] : (this.user?.jid ? this.user.jid.split('@')[0].split(':')[0] : '');
        let botLid = this.user?.lid ? this.user.lid.split('@')[0] : '155834315214923';
        
        let isMentionBot = (m.mentionedJid || []).some(jid => 
            (botJid && jid.includes(botJid)) || 
            (botLid && jid.includes(botLid)) || 
            jid.includes('155834315214923')
        );

        // Periksa apakah pesan yang di-reply adalah pesan respon AI sebelumnya
        let isReplyAI = m.quoted && (global.aiMessages?.has(m.quoted.id) || (m.quoted.fromMe && !isNonAIMessage(m)));

        // Di Grup: Hanya respon bila men-tag BOT secara eksplisit ATAU me-reply pesan AI!
        if (!isMentionBot && !isReplyAI) return;

        // Bersihkan mention tag bot dari teks prompt
        text = text.replace(new RegExp(`@${botJid}`, 'gi'), '').replace(new RegExp(`@${botLid}`, 'gi'), '').replace(/@155834315214923/gi, '').replace(/@\d+/g, '').trim();
    } else {
        // Di Private Chat: Abaikan jika pesan diawali simbol command resmi (seperti . / ! # $)
        let isSymbolCommand = /^[\.\/!#\$%=>\+\-_~&\*]/.test(text);
        if (isSymbolCommand) return;
        
        // Di PC: Jangan respon AI jika user sedang dalam sesi Menfess
        if (this.menfess) {
            let mf = Object.values(this.menfess).find(v => v.status === false && v.penerima == m.sender);
            if (mf) return;
        }
        
        // Di PC: Jika pesan adalah reply, HANYA respon jika yang di-reply adalah pesan AI (bukan game/soal)
        if (m.quoted) {
            let isReplyAI = global.aiMessages?.has(m.quoted.id) || (m.quoted.fromMe && !isNonAIMessage(m));
            if (!isReplyAI) return;
        }
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
