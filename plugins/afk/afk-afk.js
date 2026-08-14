import moment from 'moment-timezone';

let handler = async (m, { conn, text }) => {
    let user = global.db.data.users[m.sender] || {};
    
    user.afk = +new Date();
    user.afkReason = text || 'Tanpa Alasan';
    global.db.data.users[m.sender] = user;

    let name = user.name || conn.getName(m.sender);
    let time = moment.tz('Asia/Jakarta').format('HH:mm:ss WIB');

    let caption = `
🏖️ *AFK MODE ACTIVATED* 🏖️

👤 *User:* @${m.sender.split('@')[0]}
📝 *Alasan:* _${user.afkReason}_
🕒 *Waktu:* ${time}

_Bot akan memberi tahu siapa saja yang men-tag kamu bahwa kamu sedang AFK._
`.trim();

    await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m });
}

handler.help = ['afk <alasan>'];
handler.tags = ['main'];
handler.command = /^afk$/i;

export default handler;