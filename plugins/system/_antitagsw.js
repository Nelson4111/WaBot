/**
 * Anti-Tag Status WhatsApp (SW Mention) System Plugin
 * Mendeteksi dan menindak status WA pribadi yang men-tag grup (groupStatusMentionMessage)
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

import { isGroupStatusMentionMessage } from '../../lib/statusHelper.js'

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  const isEnabled = chat?.antiTagSw || chat?.antitagsw?.status
  if (!isEnabled) return

  // Admin grup, Owner bot, dan bot sendiri dikecualikan
  if (isAdmin || isOwner || m.fromMe) return

  // Cek apakah pesan merupakan tag status WhatsApp (SW mention)
  if (!isGroupStatusMentionMessage(m)) return

  const sender = m.sender
  const userNumber = (sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

  // Inisialisasi hitungan pelanggaran
  if (!chat.antiTagSwCount || typeof chat.antiTagSwCount !== 'object') {
    chat.antiTagSwCount = {}
  }
  if (chat.antitagsw?.count && typeof chat.antitagsw.count === 'object') {
    chat.antiTagSwCount = { ...chat.antitagsw.count, ...chat.antiTagSwCount }
  }

  chat.antiTagSwCount[sender] = (chat.antiTagSwCount[sender] || 0) + 1
  const count = chat.antiTagSwCount[sender]

  // Hapus pesan mention dari grup jika bot admin
  if (isBotAdmin) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key })
    } catch (err) {
      console.error('[antiTagSw] Gagal menghapus pesan status mention:', err?.message || err)
    }
  }

  // Jika pelanggaran sudah 3x -> Beri pengumuman tindakan & kick
  if (count >= 3) {
    const kickText = `*──  ୨୧ ✧ ANTI TAG STATUS WA ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴇᴄᴜʀɪᴛʏ ᴀᴄᴛɪᴏɴ)
> Anggota @${userNumber} telah melanggar aturan Anti Tag Status WhatsApp (3/3 kali).
> ${isBotAdmin ? 'Pelaku telah dikeluarkan dari grup ✕' : 'Jadikan bot Admin untuk penindakan otomatis.'}

*╭  〔 ◈ ᴛ ɪ ɴ ᴅ ᴀ ᴋ ᴀ ɴ 〕*
*┆* ⟡ ᴘᴇʟᴀɴɢɢᴀʀ   : @${userNumber}
*┆* ✧ ᴘᴇʟᴀɴɢɢᴀʀᴀɴ : Mention Status WhatsApp (3/3)
*┆* ✦ ꜱᴛᴀᴛᴜꜱ      : ${isBotAdmin ? 'Dikeluarkan (Kicked) ✕' : 'Perlu Hak Admin Bot'}
*╰───────────────*`.trim()

    await conn.sendMessage(m.chat, {
      text: kickText,
      mentions: [sender]
    }).catch(() => null)

    if (isBotAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => null)
    }

    delete chat.antiTagSwCount[sender]
    if (chat.antitagsw?.count) delete chat.antitagsw.count[sender]
  } else {
    // Peringatan bertahap 1-2
    const warnText = `*──  ୨୧ ✧ ANTI TAG STATUS WA ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴇᴄᴜʀɪᴛʏ ᴡᴀʀɴɪɴɢ)
> Dilarang men-tag atau me-mention grup dalam Status WhatsApp pribadi!

*╭  〔 ◈ ᴘ ᴇ ʟ ᴀ ɴ ɢ ɢ ᴀ ʀ ᴀ ɴ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ     : @${userNumber}
*┆* ✧ ᴘᴇʀɪɴɢᴀᴛᴀɴ   : Peringatan ke-${count}/3
*┆* ✦ ᴛɪɴᴅᴀᴋᴀɴ     : ${isBotAdmin ? 'Pesan mention dihapus otomatis ✦' : 'Jadikan bot Admin untuk auto-delete.'}
*╰───────────────*
> _Catatan: Pelanggaran ke-3 kali akan otomatis dikeluarkan dari grup._`.trim()

    await conn.sendMessage(m.chat, {
      text: warnText,
      mentions: [sender]
    }).catch(() => null)
  }

  return true
}

handler.before = handler
export default handler
