/**
 * Anti-SWGC (Status WhatsApp Group Chat) System Plugin
 * Mendeteksi dan menghapus Status Grup yang diunggah oleh anggota biasa (non-admin)
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

import { isGroupStatusMessage, revokeGroupStatus } from '../../lib/statusHelper.js'

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiSwgc) return

  // Admin grup, Owner bot, dan bot sendiri diperbolehkan mengunggah status grup
  if (isAdmin || isOwner || m.fromMe) return

  // Cek apakah pesan merupakan status grup / SWGC
  if (!isGroupStatusMessage(m)) return

  const userNumber = (m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

  const warnText = `*──  ୨୧ ✧ ANTI STATUS GRUP ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴇᴄᴜʀɪᴛʏ ɴᴏᴛɪᴄᴇ)
> Fitur *Anti-SWGC* aktif di grup ini. Hanya Admin yang diizinkan mengunggah Status Grup.

*╭  〔 ◈ ᴘ ᴇ ʟ ᴀ ɴ ɢ ɢ ᴀ ʀ ᴀ ɴ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ   : @${userNumber}
*┆* ✧ ᴘᴇʟᴀɴɢɢᴀʀ  : Mengunggah Status Grup (SWGC)
*┆* ✦ ᴛɪɴᴅᴀᴋᴀɴ   : ${isBotAdmin ? 'Status grup telah dihapus otomatis ✦' : 'Jadikan bot Admin untuk auto-delete status.'}
*╰───────────────*`.trim()

  // Kirim pesan peringatan ke grup
  await conn.sendMessage(m.chat, {
    text: warnText,
    mentions: [m.sender]
  }, { quoted: m }).catch(() => null)

  // Jika bot adalah admin grup, lakukan pencabutan status grup (Admin Revoke)
  if (isBotAdmin) {
    try {
      await revokeGroupStatus(conn, m.chat, {
        id: m.key.id,
        fromMe: false,
        participant: m.key.participant || m.sender
      })
    } catch (err) {
      console.error('[antiSwgc] Gagal menghapus status grup:', err?.message || err)
    }
  }

  return true
}

handler.before = handler
export default handler
