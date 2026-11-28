// Cache-buster v5 agar saat plugin ini di-reload oleh watcher main.js,
// modul AIService.js, PromptBuilder.js, KnowledgeRetriever.js, dan PluginKnowledgeIndex.js terbaru ikut dimuat ulang!
const MODULE_VERSION = Date.now();
let _aiServicePromise = null;

async function getAIService() {
    if (!_aiServicePromise) {
        _aiServicePromise = (async () => {
            const [
                { AIService },
                richMod,
                { PromptBuilder },
                { KnowledgeRetriever },
                { ContextBuilder }
            ] = await Promise.all([
                import(`../../lib/ai/core/AIService.js?v=${MODULE_VERSION}`),
                import(`../../lib/aiRichMessage.js?v=${MODULE_VERSION}`),
                import(`../../lib/ai/core/PromptBuilder.js?v=${MODULE_VERSION}`),
                import(`../../lib/ai/knowledge/KnowledgeRetriever.js?v=${MODULE_VERSION}`),
                import(`../../lib/ai/core/ContextBuilder.js?v=${MODULE_VERSION}`)
            ]);
            if (typeof richMod.ensureAIRichProto === 'function') {
                richMod.ensureAIRichProto();
            }
            const svc = new AIService({
                sendAIRichMessage: richMod.sendAIRichMessage,
                shouldUseAIRich: richMod.shouldUseAIRich
            });
            svc.knowledge = new KnowledgeRetriever();
            svc.contextBuilder = new ContextBuilder(svc.recentMemory, svc.ltMemory, svc.knowledge);
            svc.promptBuilder = new PromptBuilder(svc.knowledge);
            return svc;
        })();
    }
    return _aiServicePromise;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let qText = text || m.text;
    if (!qText) return m.reply(`Masukkan pertanyaan!\n\nContoh: *${usedPrefix + command} cara buat stiker suara* atau *${usedPrefix}aivn ceritakan lelucon*`);
    
    let isVN = /^(aivn|vnai)$/i.test(command) || text?.includes('--vn');
    let cleanPrompt = text?.replace(/--vn/gi, '').trim() || qText;
    
    const aiService = await getAIService();
    await aiService.processMessage(conn, m, cleanPrompt, isVN);
};

// Auto-reply presisi untuk Group (Hanya aktif bila men-tag bot / me-reply pesan AI di grup)
handler.all = async function (m) {
    if (!m.text || m.isBaileys || m.fromMe) return;
    if (!m.isGroup) return; // Mode Aman: Jangan auto-reply di Private Chat untuk mencegah Error 463 & Timelock

    let text = m.text.trim();

    let botJid = this.user?.id ? this.user.id.split('@')[0].split(':')[0] : (this.user?.jid ? this.user.jid.split('@')[0].split(':')[0] : '');
    let botLid = this.user?.lid ? this.user.lid.split('@')[0] : '';
    
    let isMentionBot = (m.mentionedJid || []).some(jid => 
        (botJid && jid.includes(botJid)) || 
        (botLid && jid.includes(botLid))
    );

    // Periksa apakah pesan yang di-reply adalah pesan respon AI sebelumnya
    let isReplyAI = m.quoted && global.aiMessages?.has(m.quoted.id);

    // Di Grup: Hanya respon bila men-tag BOT secara eksplisit ATAU me-reply pesan AI!
    if (!isMentionBot && !isReplyAI) return;

    // Bersihkan mention tag bot dari teks prompt
    if (botJid) text = text.replace(new RegExp(`@${botJid}`, 'gi'), '');
    if (botLid) text = text.replace(new RegExp(`@${botLid}`, 'gi'), '');
    text = text.replace(/@\d+/g, '').trim();

    if (!text) return; // Jika pesan kosong setelah dibersihkan

    let isVN = text.includes('--vn');
    let cleanPrompt = text.replace(/--vn/gi, '').trim();

    const aiService = await getAIService();
    await aiService.processMessage(this, m, cleanPrompt, isVN);
};

handler.help = ['ai <pertanyaan>', 'groq <pertanyaan>', 'aivn <pertanyaan>'];
handler.tags = ['ai'];
handler.desc = 'Asisten AI pintar Avelia yang memahami seluruh fitur bot secara otomatis sekaligus mampu menjawab pertanyaan umum, koding, dan voice note.';
handler.tutorial = [
    'Di grup: cukup tag @bot diikuti pertanyaanmu, atau reply pesan balasan AI',
    'Command langsung: ketik .ai <pertanyaan> (contoh: .ai gimana cara pakai fitur ssound?)',
    'Mode suara (Voice Note): ketik .aivn <pertanyaan> atau tambahkan --vn'
];
handler.command = /^(ai|groq|aiassistant|aivn|vnai)$/i;

export default handler;
