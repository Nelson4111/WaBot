let handler = async (m, { conn, isOwner }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiSticker) return
  
  // Hanya owner yang kebal, admin tetap kena
  if (isOwner) return

  const isSticker = m.mtype === 'stickerMessage' || m.msg?.mtype === 'stickerMessage'

  if (isSticker) {
    await conn.sendMessage(m.chat, {
      text: `🚫 Sticker tidak diperbolehkan di grup ini!`,
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