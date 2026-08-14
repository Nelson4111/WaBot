let handler = async (m, { conn }) => {
    let users = global.db.data.users
    let count = 0
    
    for (let jid in users) {
        if (users[jid].afk > -1) {
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
