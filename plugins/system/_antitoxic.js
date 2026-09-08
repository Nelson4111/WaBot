/**
 * Anti-Toxic System Plugin
 * Mendeteksi kata-kata kasar dan menghapus pesan di dalam grup
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiToxic) return
  if (isAdmin || isOwner) return
  if (!m.text) return

  const toxicWords = [
    'anjing', 'bangsat', 'kontol', 'memek', 'ngentot',
    'tolol', 'goblok', 'bajingan', 'asu', 'jancok',
    'fuck', 'shit', 'babi', 'kntl', 'ngntt', 'bgst',
    'tai', 'taik', 'mmk', 'pantek', 'puki'
  ]

  const regex = new RegExp(`(^|\\s)(${toxicWords.join('|')})(\\s|$)`, 'i')
  if (!regex.test(m.text)) return

  const userNumber = (m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

  const warnText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ   : @${userNumber}
*┆* ✧ ᴘᴇʀɪɴɢᴀᴛᴀɴ : Tutur kata kasar atau toxic dilarang di grup ini!
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