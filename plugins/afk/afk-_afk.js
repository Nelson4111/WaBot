import { botArbitrator } from '../../lib/botArbitrator.js'
import { resolveLid } from '../../lib/simple.js'

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
    // 1. Abaikan jika pesan dikirim oleh bot sendiri (Baileys) atau socket bot aktif
    if (m.fromMe || m.isBaileys || botArbitrator.isAnyBot(m.sender)) return false;

    const DB = global.db?.data?.users || {};
    
    // Resolusi sender jika dalam format LID
    const senderPhone = (m.sender && m.sender.endsWith('@lid') && typeof resolveLid === 'function')
        ? (resolveLid(m.sender) || m.sender)
        : (m.sender || '');
    const user = DB[senderPhone] || DB[m.sender];

    // 2. Otomatis selesai AFK saat user mengirim pesan
    if (user && user.afk > -1 && m.text && !m.text.startsWith('.afk')) {
        const duration = formatDuration(Date.now() - user.afk);
        user.lastAfk = Date.now();
        user.afk = -1;
        user.afkReason = '';
        let userName = user.name || (await conn.getName(senderPhone)) || senderPhone.split('@')[0];
        userName = String(userName).trim() || senderPhone.split('@')[0];

        const textReturn = `*──  ୨୧ ✧ ᴀꜰᴋ ꜱᴇʟᴇꜱᴀɪ ✧ ୨୧  ──*

*╭  〔 𝜚 ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ᴀ ꜰ ᴋ 〕*
*┆* ⟡ ᴜꜱᴇʀ   : *${userName}*
*┆* ⧗ ᴅᴜʀᴀꜱɪ : *${duration}*
*╰───────────────*

> _Selamat datang kembali!_`.trim();
        conn.sendMessage(m.chat, { text: textReturn }, { quoted: m }).catch(() => {});
    }

    // 3. Peringatan saat member lain men-tag atau me-reply user AFK
    const rawJids = [...new Set([
        ...(m.mentionedJid || []),
        ...(m.quoted ? [m.quoted.sender] : [])
    ])];

    // Jika member me-reply pesan kartu AFK buatan bot, ekstrak nama user yang tertera di kartu
    if (m.quoted && (m.quoted.fromMe || botArbitrator.isAnyBot(m.quoted.sender)) && m.quoted.text) {
        const matchName = m.quoted.text.match(/⟡ ᴜꜱᴇʀ\s*:\s*\*([^*]+)\*/i);
        if (matchName) {
            const targetName = matchName[1].trim().toLowerCase();
            const foundUser = Object.entries(DB).find(([k, v]) => v.name && v.name.toLowerCase() === targetName);
            if (foundUser) {
                rawJids.push(foundUser[0]);
            }
        }
    }

    for (const rawJid of rawJids) {
        if (!rawJid) continue;

        // Resolusi LID ke Phone JID agar akurat dengan database
        const jid = (rawJid.endsWith('@lid') && typeof resolveLid === 'function')
            ? (resolveLid(rawJid) || rawJid)
            : rawJid;

        if (jid === senderPhone || jid === m.sender) continue;
        
        // Jangan peringatkan jika yang di-tag/di-reply adalah Bot
        if (botArbitrator.isAnyBot(jid)) continue;

        const taggedUser = DB[jid] || DB[rawJid];
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