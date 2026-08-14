function formatDuration(ms) {
    let seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const result = [];
    if (days) result.push(`${days} Hari`);
    if (hours) result.push(`${hours} Jam`);
    if (minutes) result.push(`${minutes} Menit`);
    if (seconds) result.push(`${seconds} Detik`);

    return result.join(' ') || 'beberapa detik';
}

let handler = m => m;

handler.before = async function (m, { conn }) {
    const DB = global.db?.data?.users || {};
    const user = DB[m.sender];

    // Restorasi / Berhenti AFK sekarang ditangani langsung di handler.js 
    // agar tidak terblokir oleh isBaileys / Anti-Spam

    // Peringatan saat member lain men-tag user AFK
    const jids = [...new Set([
        ...(m.mentionedJid || []),
        ...(m.quoted ? [m.quoted.sender] : [])
    ])];

    for (const jid of jids) {
        if (jid === m.sender) continue;
        
        // Jangan peringatkan kalau yang di-reply adalah Bot itu sendiri
        let botNumber = conn.user.id.split(':')[0].split('@')[0];
        if (jid.startsWith(botNumber)) continue;

        const taggedUser = DB[jid];
        if (!taggedUser || !(taggedUser.afk > -1)) continue;

        const duration = formatDuration(Date.now() - taggedUser.afk);
        const reason = taggedUser.afkReason || 'Tanpa Alasan';
        let name = (await conn.getName(jid)) || `@${jid.split('@')[0]}`;

        let warningCaption = `
⚠️ *SSTT... JANGAN TAG DIA!* ⚠️

Dia sedang *AFK*!
📝 *Alasan:* _${reason}_
⏱️ *Sejak:* ${duration} yang lalu.

_Harap tidak mengganggu sampai dia kembali online._
`.trim();
        await conn.sendMessage(m.chat, { text: warningCaption, mentions: [jid] }, { quoted: m });
    }

    return false;
};

export default handler;