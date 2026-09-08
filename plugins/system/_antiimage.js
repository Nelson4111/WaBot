/**
 * Anti-Image System Plugin
 * Mendeteksi dan menghapus foto/gambar di dalam grup
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiImage) return
  if (isAdmin || isOwner) return

  const isImage = m.mtype === 'imageMessage' || 
                  m.msg?.mtype === 'imageMessage' || 
                  m.message?.imageMessage ||
                  m.message?.viewOnceMessage?.message?.imageMessage ||
                  m.message?.viewOnceMessageV2?.message?.imageMessage

  if (!isImage) return

  const userNumber = (m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

  const warnText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ɪ ᴍ ᴀ ɢ ᴇ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ   : @${userNumber}
*┆* ✧ ᴘᴇʀɪɴɢᴀᴛᴀɴ : Pengiriman foto/gambar dilarang di grup ini!
*┆* ✦ ᴛɪɴᴅᴀᴋᴀɴ   : ${isBotAdmin ? 'Foto telah dihapus otomatis.' : 'Jadikan bot admin untuk auto-delete.'}
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