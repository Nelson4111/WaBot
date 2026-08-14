let handler = async (m, { conn, text }) => {
    if (m.mentionedJid && m.mentionedJid[0]) {
        return conn.sendMessage(m.chat, { text: `Silakan *Reply* pesan target atau masukkan *Nomor* secara manual.` }, { quoted: m })
    }

    let who
    if (m.quoted) {
        who = m.quoted.sender
    } else if (text) {
        who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    } else return conn.sendMessage(m.chat, { text: `⚠️ Tag user, reply, atau masukkan nomor!` }, { quoted: m })

    if (!global.db.data.users[who]) {
        return conn.sendMessage(m.chat, { text: `❌ Gagal! User ${who.split('@')[0]} tidak ditemukan di database.` }, { quoted: m })
    }

    let user = global.db.data.users[who]
    user.role = 'Free user'
    user.premium = false
    user.premiumTime = 0

    await conn.sendMessage(m.chat, {
        text: `❌ Premium dihapus!\n\n👤 User: @${who.split('@')[0]}`,
        mentions: [who]
    }, { quoted: m })
}

handler.help = ['delprem']
handler.tags = ['owner']
handler.command = /^delprem$/i
handler.owner = true

export default handler