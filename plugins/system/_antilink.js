let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiLink) return
  if (isAdmin || isOwner) return
  
  let text = m.text || m.caption || (m.msg && m.msg.caption) || ''
  if (!text) return

  const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i
  
  if (linkRegex.test(text)) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ Link terdeteksi! Pesan kamu telah dihapus.`,
      mentions: [m.sender],
      quoted: m
    })

    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant
      }
    })
  }
}

handler.before = handler
export default handler