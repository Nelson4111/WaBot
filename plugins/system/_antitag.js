/**
 * Anti-Mass-Tag System Plugin
 * Mendeteksi dan menindak penandaan massal anggota (ghost mention spam)
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiTag) return
  if (isAdmin || isOwner) return

  const mentions = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  if (mentions.length < 15) return

  const userNumber = (m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

  const warnText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴀ ɢ  ᴍ ᴀ ꜱ ꜱ ᴀ ʟ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ   : @${userNumber}
*┆* ✧ ᴘᴇʀɪɴɢᴀᴛᴀɴ : Tag massal terdeteksi (${mentions.length} anggota)!
*┆* ✦ ᴛɪɴᴅᴀᴋᴀɴ   : ${isBotAdmin ? 'Pesan dihapus dan pelaku dikeluarkan dari grup.' : 'Jadikan bot admin untuk penindakan otomatis.'}
*╰───────────────*`.trim()

  await conn.sendMessage(m.chat, {
    text: warnText,
    mentions: [m.sender]
  }).catch(() => null)

  if (isBotAdmin) {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant || m.sender
      }
    }).catch(() => null)

    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => null)
  }

  return true
}

handler.before = handler
export default handler
