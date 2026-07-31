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

    if (!global.db.data.users[who]) {
        return conn.sendMessage(m.chat, { text: `❌ Gagal! User ${who.split('@')[0]} tidak ditemukan di database.` }, { quoted: m })
    }

    let number = who.split('@')[0]

    if (global.owner.find(([id]) => id === number)) {
        return conn.sendMessage(m.chat, { text: `⚠️ Nomor tersebut sudah menjadi owner!` }, { quoted: m })
    }

    global.owner.push([number, ''])

    let pesan = `@${number} sekarang adalah owner sementara`

    return conn.sendMessage(m.chat, {
        text: pesan,
        mentions: [who]
    }, { quoted: m })
}

handler.help = ['addowner']
handler.tags = ['owner']
handler.command = /^addowner$/i
handler.rowner = true

export default handler