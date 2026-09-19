let handler = async (m, { conn }) => {
  const sender = typeof conn.decodeJid === 'function' ? conn.decodeJid(m.sender) : m.sender
  const number = sender.split('@')[0].split(':')[0]

  return conn.sendMessage(m.chat, {
    text: `@${number}`,
    mentions: [sender]
  }, { quoted: m })
}

handler.help = ['tagme']
handler.tags = ['group']
handler.command = /^tagme$/i
handler.group = true

export default handler