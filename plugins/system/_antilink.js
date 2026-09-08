/**
 * Anti-Link System Plugin
 * Mendeteksi dan menghapus tautan terlarang di dalam grup
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiLink) return
  if (isAdmin || isOwner) return
  
  let text = m.text || m.caption || (m.msg && m.msg.caption) || ''
  if (!text) return

  const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|wa\.me\/)/i
  if (!linkRegex.test(text)) return

  // Abaikan jika tautan adalah link undangan grup ini sendiri
  if (text.includes('chat.whatsapp.com')) {
    try {
      const inviteCode = await conn.groupInviteCode(m.chat).catch(() => null)
      if (inviteCode && text.includes(inviteCode)) return
    } catch { }
  }

  const userNumber = (m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

  const warnText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ʟ ɪ ɴ ᴋ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ   : @${userNumber}
*┆* ✧ ᴘᴇʀɪɴɢᴀᴛᴀɴ : Dilarang membagikan tautan di grup ini!
*┆* ✦ ᴛɪɴᴅᴀᴋᴀɴ   : ${isBotAdmin ? 'Pesan telah dihapus otomatis.' : 'Jadikan bot admin untuk auto-delete.'}
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