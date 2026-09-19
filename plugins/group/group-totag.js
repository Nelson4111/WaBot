let handler = async (m, { conn, participants }) => {
  if (!m.quoted) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Balas (reply) pesan yang ingin diteruskan ke seluruh anggota grup!\n*╰───────────────*')
  }

  const botJid = conn.decodeJid(conn.user.id || conn.user.jid)
  const users = []
  for (const u of (participants || [])) {
    const jid = conn.decodeJid(u.id || u.jid)
    if (jid && jid !== botJid && !jid.endsWith('@g.us')) users.push(jid)
    const lid = u.lid || (u.id && typeof u.id === 'string' && u.id.endsWith('@lid') ? u.id : null)
    if (lid && !users.includes(lid)) users.push(lid)
  }

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