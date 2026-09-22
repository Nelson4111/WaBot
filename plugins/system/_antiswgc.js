/**
 * Anti-SWGC (Status WhatsApp Group Chat) System Plugin
 * Mendeteksi dan menghapus Status Grup yang diunggah oleh bot anomali atau anggota biasa (non-admin)
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

import { isGroupStatusMessage, revokeGroupStatus } from '../../lib/statusHelper.js'
import { resolveLid } from '../../lib/simple.js'

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  const chatJid = m.chat || m.key?.remoteJid
  if (!chatJid) return
  const chat = global.db.data?.chats?.[chatJid]
  const isEnabled = chat?.antiSwgc || chat?.antiswgc
  if (!isEnabled) return

  // Admin grup, Owner bot, dan bot sendiri diperbolehkan mengunggah status grup
  if (isAdmin || isOwner || m.fromMe) return

  // Cek apakah pesan merupakan status grup / SWGC
  if (!isGroupStatusMessage(m) && !m.isGroupStatus) return

  const cleanSender = conn.decodeJid(m.sender || '')
  const phoneSender = (cleanSender.endsWith('@lid') && typeof resolveLid === 'function')
    ? (resolveLid(cleanSender) || cleanSender)
    : cleanSender
  const userNumber = phoneSender.split('@')[0].split(':')[0].replace(/\D/g, '')

  const warnText = `*──  ୨୧ ✧ ANTI STATUS GRUP ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴇᴄᴜʀɪᴛʏ ɴᴏᴛɪᴄᴇ)
> Fitur *Anti-SWGC (Hanya Admin)* aktif di grup ini.
> Bot anomali & anggota non-admin tidak diizinkan mengunggah Status Grup.

*╭  〔 ◈ ᴘ ᴇ ʟ ᴀ ɴ ɢ ɢ ᴀ ʀ ᴀ ɴ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ   : @${userNumber}
*┆* ✧ ᴘᴇʟᴀɴɢɢᴀʀ  : Mengunggah Status Grup (SWGC)
*┆* ✦ ᴛɪɴᴅᴀᴋᴀɴ   : ${isBotAdmin ? 'Status grup telah dihapus otomatis ✦' : 'Jadikan bot Admin untuk auto-delete status.'}
*╰───────────────*`.trim()

  // Kirim pesan peringatan ke grup
  await conn.sendMessage(chatJid, {
    text: warnText,
    mentions: [m.sender, phoneSender, cleanSender].filter(Boolean)
  }, { quoted: m }).catch(() => null)

  // Bersihkan dari cache riwayat lokal grup jika ada
  if (Array.isArray(chat.groupStatuses)) {
    chat.groupStatuses = chat.groupStatuses.filter(s => s.id !== m.key.id)
  }

  // Jika bot adalah admin grup, lakukan pencabutan status grup (Admin Revoke)
  if (isBotAdmin) {
    try {
      if (typeof m.delete === 'function') {
        await m.delete().catch(() => null)
      }
      await revokeGroupStatus(conn, chatJid, {
        id: m.key.id,
        fromMe: false,
        participant: m.key.participant || m.sender,
        alternateParticipant: m.sender
      })
    } catch (err) {
      console.error('[antiSwgc] Gagal menghapus status grup:', err?.message || err)
    }
  }

  return true
}

handler.before = handler
export default handler
