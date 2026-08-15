import { AIService } from '../../lib/ai/core/AIService.js';

const aiService = new AIService();



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
        let isReplyAI = m.quoted && global.aiMessages?.has(m.quoted.id);

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
            let isReplyAI = global.aiMessages?.has(m.quoted.id);
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
