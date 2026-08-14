let handler = async (m, { conn, text, usedPrefix, command }) => {
    let who
    if (m.quoted) {
        who = m.quoted.sender
    } else if (text) {
        who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    } else if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0]
    }

    if (!who) return m.reply(`⚠️ Tag user, reply pesannya, atau masukkan nomor!\nContoh: *${usedPrefix + command}* 628xxx`)

    let users = global.db.data.users
    if (!users[who]) {
        return m.reply(`❌ Orang tersebut tidak ditemukan di database.`)
    }

    let number = who.split('@')[0]

    if (!users[who].isCoOwner) {
        return m.reply(`⚠️ Nomor tersebut memang bukan Co-Owner!`)
    }

    users[who].isCoOwner = false

    let pesan = `👋 Berhasil mencabut status *Co-Owner* dari @${number}.`

    return conn.sendMessage(m.chat, {
        text: pesan,
        mentions: [who]
    }, { quoted: m })
}

handler.help = ['delcoowner <nomor/reply/tag>']
handler.tags = ['owner']
handler.command = /^(delcoowner|delmoderator|removecoowner)$/i
handler.rowner = true 

export default handler
