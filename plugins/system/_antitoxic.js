let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiToxic) return
  if (isAdmin || isOwner) return
  if (!m.text) return

 const toxicWords = [
    'anjing','bangsat','kontol','memek','ngentot',
    'tolol','goblok','bajingan','asu','jancok',
    'fuck','shit','anj','mmk','babi','kontol','kntl','ngen','kon','tll','jancok','janco','jnck','ngntt','bgst','tai','taik','mmek'
  ]

  const regex = new RegExp(`(^|\\s)(${toxicWords.join('|')})(\\s|$)`, 'i')
  if (!regex.test(m.text)) return
  await conn.sendMessage(m.chat, {
    text: `⚠️ Kata toxic terdeteksi! Pesan kamu telah dihapus.`,
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

handler.before = handler
export default handler