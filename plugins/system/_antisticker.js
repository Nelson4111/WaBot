/**
 * Anti-Sticker System Plugin
 * Mendeteksi dan menghapus stiker di dalam grup
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiSticker) return
  if (isAdmin || isOwner) return

  const isSticker = m.mtype === 'stickerMessage' || 
                    m.msg?.mtype === 'stickerMessage' || 
                    m.message?.stickerMessage

  if (!isSticker) return

  const userNumber = (m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

  const warnText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ꜱ ᴛ ɪ ᴋ ᴇ ʀ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ   : @${userNumber}
*┆* ✧ ᴘᴇʀɪɴɢᴀᴛᴀɴ : Pengiriman stiker dilarang di grup ini!
*┆* ✦ ᴛɪɴᴅᴀᴋᴀɴ   : ${isBotAdmin ? 'Stiker telah dihapus otomatis.' : 'Jadikan bot admin untuk auto-delete.'}
*╰───────────────*`.trim()

  await conn.sendMessage(m.chat, {
    text: warnText,
    mentions: [m.sender]
  }, { quoted: m }).catch(() => null)

  if (isBotAdmin) {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant || m.sender
      }
    }).catch(() => null)
  }

  return true
}

handler.before = handler
export default handler