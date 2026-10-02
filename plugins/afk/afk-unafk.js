import { resolveLid } from '../../lib/simple.js'
import { setAfk } from '../../lib/afkHelper.js'

function parseAfkDuration(value) {
    const match = String(value || '').toLowerCase().match(/^(\d+)\s*(s|detik|m|menit|h|jam|d|hari|w|minggu)$/)
    if (!match) return 0

    const amount = Number(match[1])
    const unit = match[2]
    const multiplier = ['s', 'detik'].includes(unit) ? 1000
        : ['m', 'menit'].includes(unit) ? 60000
            : ['h', 'jam'].includes(unit) ? 3600000
                : ['d', 'hari'].includes(unit) ? 86400000
                    : 604800000
    const duration = amount * multiplier
    return duration > 0 && duration <= 365 * 86400000 ? duration : 0
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let rawTarget = m.mentionedJid[0] || m.quoted?.sender;
    if (!rawTarget) {
        let warnMsg = `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Tag atau reply pesan member yang ingin dihapus status AFK-nya!\n> › *${usedPrefix + command}* @tag\n*╰───────────────*`;
        return m.reply(warnMsg);
    }
    
    let target = rawTarget.endsWith('@lid') ? (resolveLid(rawTarget) || rawTarget) : rawTarget
    let user = global.db.data.users[target] || global.db.data.users[rawTarget];

    if (command.toLowerCase() === 'setafk') {
        const values = String(text || '').replace(/@[\d+().-]+/g, ' ').trim().split(/\s+/).filter(Boolean)
        const duration = parseAfkDuration(values[0])
        if (!duration) return m.reply(`Format: *${usedPrefix + command} @tag/reply <durasi> [alasan]*\nContoh: *${usedPrefix + command} @user 2h Sedang istirahat* (maksimal 365 hari).`)
        if (!user) return m.reply('Pengguna tersebut belum memiliki data di database bot.')

        const reason = values.slice(1).join(' ') || 'Diatur oleh admin'
        setAfk(user, reason, Date.now() - duration)
        return conn.sendMessage(m.chat, {
            text: `✅ Status AFK @${rawTarget.split('@')[0]} diatur sejak ${values[0]} lalu.\n> Alasan: ${reason}`,
            mentions: [rawTarget]
        }, { quoted: m })
    }

    if (!user) {
        let errMsg = `*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Pengguna tidak ditemukan di database bot.\n*╰───────────────*`;
        return m.reply(errMsg);
    }
    
    if (user.afk < 0) {
        let infoMsg = `*╭  〔 ✦ ɪ ɴ ꜰ ᴏ ʀ ᴍ ᴀ ꜱ ɪ 〕*\n> Pengguna tersebut saat ini tidak sedang AFK.\n*╰───────────────*`;
        return m.reply(infoMsg);
    }
    
    user.afk = -1;
    user.lastAfk = Date.now();
    user.afkReason = '';
    
    let successMsg = `*──  ୨୧ ✧ ᴜ ɴ ᴀ ꜰ ᴋ ✧ ୨୧  ──*

*╭  〔 ✦ ʙ ᴇ ʀ ʜ ᴀ ꜱ ɪ ʟ 〕*
*┆* ⟡ ᴜꜱᴇʀ   : @${target.split('@')[0]}
*┆* ✧ ꜱᴛᴀᴛᴜꜱ : *AFK Dinonaktifkan*
*╰───────────────*

> _Status AFK pengguna berhasil dihapus oleh admin._`.trim();

    await conn.sendMessage(m.chat, { text: successMsg, mentions: [target] }, { quoted: m });
};

handler.help = ['removeafk @tag/reply', 'unafk @tag/reply', 'setafk @tag/reply <durasi> [alasan]'];
handler.tags = ['admin'];
handler.command = /^(removeafk|unafk|setafk)$/i;
handler.admin = true;
handler.group = true;

export default handler;
