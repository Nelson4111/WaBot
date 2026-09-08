let handler = async (m, { conn, text, usedPrefix, command }) => {
    let target = m.mentionedJid[0] || m.quoted?.sender;
    if (!target) {
        let warnMsg = `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Tag atau reply pesan member yang ingin dihapus status AFK-nya!\n> › *${usedPrefix + command}* @tag\n*╰───────────────*`;
        return m.reply(warnMsg);
    }
    
    let user = global.db.data.users[target];
    if (!user) {
        let errMsg = `*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Pengguna tidak ditemukan di database bot.\n*╰───────────────*`;
        return m.reply(errMsg);
    }
    
    if (user.afk < 0) {
        let infoMsg = `*╭  〔 ✦ ɪ ɴ ꜰ ᴏ ʀ ᴍ ᴀ ꜱ ɪ 〕*\n> Pengguna tersebut saat ini tidak sedang AFK.\n*╰───────────────*`;
        return m.reply(infoMsg);
    }
    
    user.afk = -1;
    user.afkReason = '';
    
    let successMsg = `*──  ୨୧ ✧ ᴜ ɴ ᴀ ꜰ ᴋ ✧ ୨୧  ──*

*╭  〔 ✦ ʙ ᴇ ʀ ʜ ᴀ ꜱ ɪ ʟ 〕*
*┆* ⟡ ᴜꜱᴇʀ   : @${target.split('@')[0]}
*┆* ✧ ꜱᴛᴀᴛᴜꜱ : *AFK Dinonaktifkan*
*╰───────────────*

> _Status AFK pengguna berhasil dihapus oleh admin._`.trim();

    await conn.sendMessage(m.chat, { text: successMsg, mentions: [target] }, { quoted: m });
};

handler.help = ['unafk @tag/reply'];
handler.tags = ['admin'];
handler.command = /^unafk$/i;
handler.admin = true;
handler.group = true;

export default handler;
