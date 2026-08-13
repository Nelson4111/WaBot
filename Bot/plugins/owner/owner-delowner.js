let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (m.mentionedJid && m.mentionedJid[0]) {
        return conn.sendMessage(m.chat, { text: `⚠️ Perintah ini tidak mendukung @tag!\nSilakan *Reply* pesan target atau masukkan *Nomor* secara manual.` }, { quoted: m })
    }

    let who
    if (m.quoted) {
        who = m.quoted.sender
    } else if (text) {
        who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }

    if (!who) return conn.sendMessage(m.chat, { text: `⚠️ Tag user, reply, atau masukkan nomor!\nContoh: *${usedPrefix + command}* 628xxx` }, { quoted: m })

    let number = who.split('@')[0]
    let index = global.owner.findIndex(([id]) => id === number)
    
    if (index === -1) {
        return conn.sendMessage(m.chat, { text: `❌ Gagal! Nomor ini bukan owner!` }, { quoted: m })
    }

    global.owner.splice(index, 1)

    return conn.sendMessage(m.chat, {
        text: `✅ @${number} sudah dihapus dari *owner*`,
        mentions: [who]
    }, { quoted: m })
}

handler.help = ['delowner']
handler.tags = ['owner']
handler.command = /^delowner$/i
handler.rowner = true

export default handler