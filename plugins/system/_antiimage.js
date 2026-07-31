let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiImage) return
  if (isAdmin || isOwner) return

  const isImage = m.mtype === 'imageMessage' || m.msg?.mtype === 'imageMessage'

  if (isImage) {
    await conn.sendMessage(m.chat, {
      text: '🚫 Foto tidak diperbolehkan di grup ini!',
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