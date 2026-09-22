/**
 * Group Anti-SWGC Management Plugin
 * Mengaktifkan/menonaktifkan proteksi Status Grup di grup
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Perintah ini hanya dapat digunakan di grup!\n*╰───────────────*')
  if (!isAdmin && !isOwner) return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Perintah ini hanya dapat digunakan oleh Admin Grup!\n*╰───────────────*')

  let chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  let opt = (args[0] || '').toLowerCase()

  if (opt === 'on' || opt === 'enable' || opt === '1') {
    chat.antiSwgc = true
    const botAdminNotice = !isBotAdmin ? '\n> ⚠️ *Peringatan:* Bot belum menjadi Admin grup. Jadikan bot admin agar dapat menghapus status otomatis.' : ''
    return m.reply(
      `*──  ୨୧ ✧ ANTI STATUS GRUP ✧ ୨୧  ──*\n\n` +
      `> *おしらせ!* (ꜱʏꜱᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ)\n` +
      `> Fitur *Anti-SWGC* berhasil *DIAKTIFKAN* ✦\n\n` +
      `*╭  〔 ⚙ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ꜱ ɪ ꜱ ᴛ ᴇ ᴍ 〕*\n` +
      `*┆* ⟡ ᴍᴏᴅᴇ       : *Aktif (Enabled)*\n` +
      `*┆* ✧ ᴋᴇʙɪᴊᴀᴋᴀɴ   : Hanya Admin yang boleh upload SWGC\n` +
      `*┆* ✦ ᴀᴜᴛᴏ ᴅᴇʟᴇᴛᴇ : *${isBotAdmin ? 'Siap (Admin Aktif) ✦' : 'Perlu Hak Admin ✕'}*\n` +
      `*╰───────────────*` +
      botAdminNotice
    )
  }

  if (opt === 'off' || opt === 'disable' || opt === '0') {
    chat.antiSwgc = false
    return m.reply(
      `*──  ୨୧ ✧ ANTI STATUS GRUP ✧ ୨୧  ──*\n\n` +
      `> *おしらせ!* (ꜱʏꜱᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ)\n` +
      `> Fitur *Anti-SWGC* berhasil *DINONAKTIFKAN* ✕\n\n` +
      `*╭  〔 ⚙ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ꜱ ɪ ꜱ ᴛ ᴇ ᴍ 〕*\n` +
      `*┆* ⟡ ᴍᴏᴅᴇ     : *Nonaktif (Disabled)*\n` +
      `*┆* ✧ ᴋᴇʙɪᴊᴀᴋᴀɴ : Semua anggota dapat mengunggah SWGC\n` +
      `*╰───────────────*`
    )
  }

  const currentStatus = chat.antiSwgc ? '✓ ᴀᴋᴛɪꜰ' : '✕ ɴᴏɴᴀᴋᴛɪꜰ'
  return m.reply(
    `*──  ୨୧ ✧ ANTI STATUS GRUP ✧ ୨୧  ──*\n\n` +
    `> *おしらせ!* (ꜱᴛᴀᴛᴜꜱ ɢʀᴜᴘ ꜱᴇᴄᴜʀɪᴛʏ)\n` +
    `> Cegah anggota biasa mengunggah Status Grup (SWGC) tanpa izin admin.\n\n` +
    `*╭  〔 ⚙ ɪ ɴ ꜰ ᴏ ʀ ᴍ ᴀ ꜱ ɪ 〕*\n` +
    `*┆* ⟡ ꜱᴛᴀᴛᴜꜱ ꜱᴀᴀᴛ ɪɴɪ : *${currentStatus}*\n` +
    `*┆* ✧ ʙᴏᴛ ᴀᴅᴍɪɴ       : *${isBotAdmin ? 'Ya (Siap Hapus) ✦' : 'Tidak (Perlu Admin) ✕'}*\n` +
    `*╰───────────────*\n\n` +
    `*╭  〔 ◈ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
    `*┆* › Mengaktifkan : *${usedPrefix + command} on*\n` +
    `*┆* › Mematikan    : *${usedPrefix + command} off*\n` +
    `*╰───────────────*`
  )
}

handler.help = ['antiswgc on/off']
handler.tags = ['group']
handler.command = /^(antiswgc|antistatusgc)$/i
handler.group = true
handler.admin = true

export default handler
