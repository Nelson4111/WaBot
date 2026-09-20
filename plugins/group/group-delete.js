let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.quoted) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Balas (reply) pesan yang ingin kamu hapus!\n*╰───────────────*')
  }

  const { fromMe, id, sender } = m.quoted
  const rawPart = m.msg?.contextInfo?.participant || m.quoted.vM?.key?.participant || ''
  const primaryPart = (m.isGroup && !fromMe) ? (rawPart || sender) : undefined
  const altPart = (m.isGroup && !fromMe && rawPart && sender && rawPart !== sender) ? sender : undefined

  if (m.isGroup) {
    if (!(isAdmin || isOwner)) {
      if (!fromMe) {
        return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Menghapus pesan anggota lain hanya dapat dilakukan oleh Administrator!\n> Kamu hanya dapat menghapus pesan yang dikirim oleh bot.\n*╰───────────────*')
      }
    }
  }

  // 1. Coba hapus langsung dengan m.quoted.delete()
  if (typeof m.quoted.delete === 'function') {
    await m.quoted.delete().catch(() => {})
  }

  // 2. Kirim delete dengan raw LID
  const key = {
    remoteJid: m.chat,
    fromMe: fromMe,
    id: id,
    ...(primaryPart ? { participant: primaryPart } : {})
  }
  await conn.sendMessage(m.chat, { delete: key }).catch(() => {})

  // 3. Cadangan jika WhatsApp membutuhkan format Phone JID
  if (altPart) {
    await conn.sendMessage(m.chat, { delete: { ...key, participant: altPart } }).catch(() => {})
  }
}

handler.help = ['delete']
handler.tags = ['group']
handler.command = /^(del|delete|unsend?)$/i
handler.limit = false

export default handler