import { botArbitrator } from '../../lib/botArbitrator.js'

const toSmallNum = (str) => {
    const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' };
    return String(str).replace(/[0-9]/g, d => map[d] || d);
};

function formatDuration(ms) {
    let seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const result = [];
    if (days) result.push(`${toSmallNum(days)} Hari`);
    if (hours) result.push(`${toSmallNum(hours)} Jam`);
    if (minutes) result.push(`${toSmallNum(minutes)} Menit`);
    if (seconds) result.push(`${toSmallNum(seconds)} Detik`);

    return result.join(' ') || 'beberapa detik';
}

let handler = m => m;

handler.before = async function (m, { conn }) {
    // 1. Abaikan pesan dari bot sendiri (Baileys), Bot Utama, atau JadiBot mana pun
    if (m.fromMe || m.isBaileys || botArbitrator.isAnyBot(m.sender)) return false;
    if (m.text && /──  ୨୧ ✧ (ᴜꜱᴇʀ ꜱᴇᴅᴀɴɢ ᴀꜰᴋ|ᴀꜰᴋ ꜱᴇʟᴇꜱᴀɪ) ✧ ୨୧  ──/i.test(m.text)) return false;

    const DB = global.db?.data?.users || {};
    const user = DB[m.sender];

    // 2. Otomatis selesai AFK saat user mengirim pesan
    if (user && user.afk > -1 && m.text && !m.text.startsWith('.afk')) {
        const duration = formatDuration(Date.now() - user.afk);
        user.lastAfk = Date.now();
        user.afk = -1;
        user.afkReason = '';
        let userName = user.name || (await conn.getName(m.sender)) || m.sender.split('@')[0];
        userName = String(userName).trim() || m.sender.split('@')[0];

        const textReturn = `*──  ୨୧ ✧ ᴀꜰᴋ ꜱᴇʟᴇꜱᴀɪ ✧ ୨୧  ──*

*╭  〔 𝜚 ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ᴀ ꜰ ᴋ 〕*
*┆* ⟡ ᴜꜱᴇʀ   : *${userName}*
*┆* ⧗ ᴅᴜʀᴀꜱɪ : *${duration}*
*╰───────────────*

> _Selamat datang kembali!_`.trim();
        conn.sendMessage(m.chat, { text: textReturn }, { quoted: m }).catch(() => {});
    }

    // 3. Peringatan saat member lain men-tag user AFK
    const jids = [...new Set([
        ...(m.mentionedJid || []),
        ...(m.quoted ? [m.quoted.sender] : [])
    ])];

    for (const jid of jids) {
        if (jid === m.sender) continue;
        
        // Jangan peringatkan kalau yang di-reply/di-tag adalah Bot
        if (botArbitrator.isAnyBot(jid)) continue;

        const taggedUser = DB[jid];
        if (!taggedUser || !(taggedUser.afk > -1)) continue;

        const duration = formatDuration(Date.now() - taggedUser.afk);
        const reason = taggedUser.afkReason || 'Tanpa Alasan';
        let userName = taggedUser.name || (await conn.getName(jid)) || jid.split('@')[0];
        userName = String(userName).trim() || jid.split('@')[0];

        let warningCaption = `*──  ୨୧ ✧ ᴜꜱᴇʀ ꜱᴇᴅᴀɴɢ ᴀꜰᴋ ✧ ୨୧  ──*

*╭  〔 ⚠ ɪ ɴ ꜰ ᴏ  ᴀ ꜰ ᴋ 〕*
*┆* ⟡ ᴜꜱᴇʀ   : *${userName}*
*┆* ✧ ᴀʟᴀꜱᴀɴ : _${reason}_
*┆* ⧗ ᴅᴜʀᴀꜱɪ : *${duration} yang lalu*
*╰───────────────*

> _Harap tidak mengganggu sampai dia kembali online._`.trim();

        // Mengirimkan peringatan tanpa array mentions agar tidak memicu notifikasi tag ke user AFK
        await conn.sendMessage(m.chat, { text: warningCaption }, { quoted: m });
    }

    return false;
};

export default handler;