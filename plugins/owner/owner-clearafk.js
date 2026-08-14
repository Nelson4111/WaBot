let handler = async (m, { conn }) => {
    let users = global.db.data.users
    let count = 0
    
    // Jika ada tag, bersihkan spesifik user tersebut
    let target = m.mentionedJid[0] || m.quoted?.sender
    if (target) {
        if (!users[target]) return m.reply('❌ User tidak ditemukan di database!')
        users[target].afk = -1
        users[target].afkReason = ''
        return m.reply(`✅ Berhasil membersihkan history AFK untuk @${target.split('@')[0]}!`, null, { mentions: [target] })
    }
    
    // Jika tidak ada tag, bersihkan semua
    for (let jid in users) {
        if (users[jid].afk > -1 || users[jid].afk === undefined) {
            users[jid].afk = -1
            users[jid].afkReason = ''
            count++
        }
    }
    
    m.reply(`✅ Berhasil membersihkan history AFK!\nTotal *${count}* user yang status AFK-nya nyangkut telah di-reset.`)
}

handler.help = ['clearafk']
handler.tags = ['owner']
handler.command = /^(clearafk|resetafk)$/i
handler.owner = true

export default handler
