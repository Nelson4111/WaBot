let handler = async (m, { text }) => {
    if (!text) return m.reply('❌ Contoh:\nsetname shiro')

    let user = global.db.data.users[m.sender]
    user.name = text.trim()

    m.reply(`✅ Nama berhasil diubah!\n\n👤 Nama baru: *${user.name}*`)
}

handler.help = ['setname <nama>']
handler.tags = ['main']
handler.command = /^set(name|nama)$/i

export default handler