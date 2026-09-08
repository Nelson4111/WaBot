let handler = async (m, { conn, participants }) => {
  if (!m.quoted) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Balas (reply) pesan yang ingin diteruskan ke seluruh anggota grup!\n*╰───────────────*')
  }

  const botJid = conn.decodeJid(conn.user.id || conn.user.jid)
  const users = (participants || [])
    .map(u => conn.decodeJid(u.id || u.jid))
    .filter(v => v && v !== botJid)

  await conn.sendMessage(m.chat, {
    forward: m.quoted.fakeObj,
    mentions: users
  })
}

handler.help = ['totag']
handler.tags = ['group']
handler.command = /^(totag|tag)$/i
handler.admin = true
handler.group = true

export default handler