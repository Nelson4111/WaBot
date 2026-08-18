import moment from 'moment-timezone';

let handler = async (m, { conn, text }) => {
    let user = global.db.data.users[m.sender] || {};
    
    // Cooldown setelah selesai AFK (60 detik)
    const cooldown = 60000;
    if (user.lastAfk && (Date.now() - user.lastAfk < cooldown)) {
        let sisa = Math.ceil((cooldown - (Date.now() - user.lastAfk)) / 1000);
        return m.reply(`⏳ Kamu baru saja selesai AFK. Tunggu *${sisa} detik* lagi sebelum bisa mengaktifkan AFK kembali.`);
    }

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