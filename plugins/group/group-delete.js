let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.quoted) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Balas (reply) pesan yang ingin kamu hapus!\n*╰───────────────*')
  }

  const { fromMe, id, sender } = m.quoted
  const key = {
    remoteJid: m.chat,
    fromMe: fromMe,
    id: id,
    participant: sender
  }

  if (m.isGroup) {
    if (!(isAdmin || isOwner)) {
      if (!fromMe) {
        return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Menghapus pesan anggota lain hanya dapat dilakukan oleh Administrator!\n> Kamu hanya dapat menghapus pesan yang dikirim oleh bot.\n*╰───────────────*')
      }
    }
  }

  return conn.sendMessage(m.chat, { delete: key })
}

handler.help = ['delete']
handler.tags = ['group']
handler.command = /^(del|delete|unsend?)$/i
handler.limit = false

export default handler