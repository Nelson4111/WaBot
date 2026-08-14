let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.quoted) return m.reply('Reply pesan yang ingin dihapus!')

    let { chat, fromMe, id, sender } = m.quoted
    let key = {
        remoteJid: m.chat,
        fromMe: fromMe,
        id: id,
        participant: sender
    }

    if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
            return m.reply('*Hanya Admin menggunakan perintah ini!*')
        }
    }

    return conn.sendMessage(m.chat, { delete: key })
}

handler.help = ['delete']
handler.tags = ['info']
handler.command = /^(del|delete|unsend?)$/i
handler.limit = false

export default handler