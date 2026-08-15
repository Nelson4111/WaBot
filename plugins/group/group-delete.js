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
            if (!fromMe) return m.reply('*Fitur hapus pesan member lain hanya untuk Admin!\nKamu hanya bisa menghapus pesan dari bot.*')
        }
    }

    return conn.sendMessage(m.chat, { delete: key })
}

handler.help = ['delete']
handler.tags = ['info']
handler.command = /^(del|delete|unsend?)$/i
handler.limit = false

export default handler