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
        users[who] = {}
    }

    let number = who.split('@')[0]

    if (users[who].isCoOwner) {
        return m.reply(`⚠️ Nomor tersebut sudah berstatus sebagai Co-Owner!`)
    }

    users[who].isCoOwner = true

    let pesan = `🎉 Berhasil mengangkat @${number} menjadi *Co-Owner* Bot!\nKini ia dapat mengakses mayoritas fitur owner.`

    return conn.sendMessage(m.chat, {
        text: pesan,
        mentions: [who]
    }, { quoted: m })
}

handler.help = ['addcoowner <nomor/reply/tag>']
handler.tags = ['owner']
handler.command = /^(addcoowner|addmoderator|setcoowner)$/i
handler.rowner = true 

export default handler
