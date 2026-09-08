import moment from 'moment-timezone';

const toSmallNum = (str) => {
    const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' };
    return String(str).replace(/[0-9]/g, d => map[d] || d);
};

let handler = async (m, { conn, text }) => {
    let user = global.db.data.users[m.sender] || {};
    
    // Cooldown setelah selesai AFK (60 detik)
    const cooldown = 60000;
    if (user.lastAfk && (Date.now() - user.lastAfk < cooldown)) {
        let sisa = Math.ceil((cooldown - (Date.now() - user.lastAfk)) / 1000);
        let warnMsg = `*╭  〔 ⧗ ᴍ ᴏ ʜ ᴏ ɴ  ᴛ ᴜ ɴ ɢ ɢ ᴜ 〕*\n> Kamu baru saja selesai AFK.\n> Tunggu *${toSmallNum(sisa)} detik* lagi sebelum mengaktifkan AFK kembali.\n*╰───────────────*`;
        return m.reply(warnMsg);
    }

    user.afk = +new Date();
    user.afkReason = text || 'Tanpa Alasan';
    global.db.data.users[m.sender] = user;

    let time = moment.tz('Asia/Jakarta').format('HH:mm:ss');

    let caption = `*──  ୨୧ ✧ ᴀꜰᴋ ᴍᴏᴅᴇ ✧ ୨୧  ──*

*╭  〔 𝜚 ɪ ɴ ꜰ ᴏ  ᴀ ꜰ ᴋ 〕*
*┆* ⟡ ᴜꜱᴇʀ   : @${m.sender.split('@')[0]}
*┆* ✧ ᴀʟᴀꜱᴀɴ : _${user.afkReason}_
*┆* ⏱ ᴡᴀᴋᴛᴜ  : *${toSmallNum(time)} ᴡɪʙ*
*╰───────────────*

> _Bot akan memberi tahu siapa saja yang men-tag kamu bahwa kamu sedang AFK._`.trim();

    await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m });
};

handler.help = ['afk <alasan>'];
handler.tags = ['main'];
handler.command = /^afk$/i;

export default handler;