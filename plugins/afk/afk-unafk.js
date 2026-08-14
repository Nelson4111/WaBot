let handler = async (m, { conn, text, usedPrefix, command }) => {
    let target = m.mentionedJid[0] || m.quoted?.sender
    if (!target) return m.reply(`❌ Tag atau reply pesan orang yang mau dihapus status AFK-nya!\n\nContoh:\n*${usedPrefix}${command} @tag*`)
    
    let user = global.db.data.users[target]
    if (!user) return m.reply(`❌ User tidak ditemukan di database!`)
    
    if (user.afk < 0) return m.reply(`✅ User tersebut tidak sedang AFK.`)
    
    user.afk = -1
    user.afkReason = ''
    
    m.reply(`✅ Berhasil menghapus status AFK untuk @${target.split('@')[0]}!`, null, { mentions: [target] })
}

handler.help = ['unafk @tag/reply']
handler.tags = ['admin']
handler.command = /^unafk$/i
handler.admin = true
handler.group = true

export default handler
