/**
 * Group Anti-Tag Status WhatsApp Management Plugin
 * Mengaktifkan/menonaktifkan proteksi tag Status WhatsApp pribadi di grup
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Perintah ini hanya dapat digunakan di grup!\n*╰───────────────*')
  if (!isAdmin && !isOwner) return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Perintah ini hanya dapat digunakan oleh Admin Grup!\n*╰───────────────*')

  let chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  let opt = (args[0] || '').toLowerCase()

  if (opt === 'on' || opt === 'enable' || opt === '1') {
    chat.antiTagSw = true
    chat.antiTagSwCount = {}
    chat.antitagsw = { status: true, count: {} }

    const botAdminNotice = !isBotAdmin ? '\n> ⚠️ *Peringatan:* Bot belum menjadi Admin grup. Jadikan bot admin agar dapat menghapus pesan tag status otomatis.' : ''
    return m.reply(
      `*──  ୨୧ ✧ ANTI TAG STATUS WA ✧ ୨୧  ──*\n\n` +
      `> *おしらせ!* (ꜱʏꜱᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ)\n` +
      `> Fitur *Anti-Tag Status WA* berhasil *DIAKTIFKAN* ✦\n\n` +
      `*╭  〔 ⚙ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ꜱ ɪ ꜱ ᴛ ᴇ ᴍ 〕*\n` +
      `*┆* ⟡ ᴍᴏᴅᴇ       : *Aktif (Enabled)*\n` +
      `*┆* ✧ ᴋᴇʙɪᴊᴀᴋᴀɴ   : Dilarang men-tag grup di Status WA\n` +
      `*┆* ✦ ᴛᴏʟᴇʀᴀɴꜱɪ   : 3x Peringatan lalu Kick otomatis\n` +
      `*┆* ◈ ᴀᴜᴛᴏ ᴅᴇʟᴇᴛᴇ : *${isBotAdmin ? 'Siap (Admin Aktif) ✦' : 'Perlu Hak Admin ✕'}*\n` +
      `*╰───────────────*` +
      botAdminNotice
    )
  }

  if (opt === 'off' || opt === 'disable' || opt === '0') {
    chat.antiTagSw = false
    chat.antiTagSwCount = {}
    chat.antitagsw = { status: false, count: {} }

    return m.reply(
      `*──  ୨୧ ✧ ANTI TAG STATUS WA ✧ ୨୧  ──*\n\n` +
      `> *おしらせ!* (ꜱʏꜱᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ)\n` +
      `> Fitur *Anti-Tag Status WA* berhasil *DINONAKTIFKAN* ✕\n\n` +
      `*╭  〔 ⚙ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ꜱ ɪ ꜱ ᴛ ᴇ ᴍ 〕*\n` +
      `*┆* ⟡ ᴍᴏᴅᴇ     : *Nonaktif (Disabled)*\n` +
      `*┆* ✧ ᴋᴇʙɪᴊᴀᴋᴀɴ : Member bebas men-tag grup di Status WA\n` +
      `*╰───────────────*`
    )
  }

  const currentStatus = (chat.antiTagSw || chat.antitagsw?.status) ? '✓ ᴀᴋᴛɪꜰ' : '✕ ɴᴏɴᴀᴋᴛɪꜰ'
  return m.reply(
    `*──  ୨୧ ✧ ANTI TAG STATUS WA ✧ ୨୧  ──*\n\n` +
    `> *おしらせ!* (ꜱᴛᴀᴛᴜꜱ ᴍᴇɴᴛɪᴏɴ ꜱᴇᴄᴜʀɪᴛʏ)\n` +
    `> Cegah anggota men-tag/me-mention grup saat membuat status WhatsApp pribadi.\n\n` +
    `*╭  〔 ⚙ ɪ ɴ ꜰ ᴏ ʀ ᴍ ᴀ ꜱ ɪ 〕*\n` +
    `*┆* ⟡ ꜱᴛᴀᴛᴜꜱ ꜱᴀᴀᴛ ɪɴɪ : *${currentStatus}*\n` +
    `*┆* ✧ ʙᴏᴛ ᴀᴅᴍɪɴ       : *${isBotAdmin ? 'Ya (Siap Hapus & Kick) ✦' : 'Tidak (Perlu Admin) ✕'}*\n` +
    `*╰───────────────*\n\n` +
    `*╭  〔 ◈ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
    `*┆* › Mengaktifkan : *${usedPrefix + command} on*\n` +
    `*┆* › Mematikan    : *${usedPrefix + command} off*\n` +
    `*╰───────────────*`
  )
}

handler.help = ['antitagsw on/off']
handler.tags = ['group']
handler.command = /^(antitagsw|antisw)$/i
handler.group = true
handler.admin = true

export default handler
