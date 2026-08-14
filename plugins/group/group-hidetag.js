let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    let users = participants.map(u => conn.decodeJid(u.id || u.jid)).filter(Boolean);
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (m.quoted) {
        if (mime) {
            let media = await m.quoted.download();
            let type = mime.split('/')[0];
            if (type === 'image') {
                await conn.sendMessage(m.chat, { image: media, caption: text || q.text || '', mentions: users }, { quoted: m });
            } else if (type === 'video') {
                await conn.sendMessage(m.chat, { video: media, caption: text || q.text || '', mentions: users }, { quoted: m });
            } else if (type === 'audio') {
                await conn.sendMessage(m.chat, { audio: media, mimetype: mime, ptt: true, mentions: users }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { document: media, mimetype: mime, fileName: q.filename || 'hidetag', caption: text || '', mentions: users }, { quoted: m });
            }
        } else {
            await conn.sendMessage(m.chat, { text: text || q.text || '', mentions: users }, { quoted: m });
        }
    } else {
        if (!text) return m.reply(`Masukan teks atau Reply pesan!\n\nContoh:\n*${usedPrefix + command} Selamat Pagi Semua!*`);
        await conn.sendMessage(m.chat, { text: text, mentions: users }, { quoted: m });
    }
}

handler.help = ['hidetag <pesan>']
handler.tags = ['group']
handler.command = /^(hidetag|htag|h)$/i
handler.group = true
handler.admin = true

export default handler