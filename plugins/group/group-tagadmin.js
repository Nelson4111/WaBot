let handler = async (m, { conn, participants, text }) => {
  if (!m.isGroup) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Perintah ini hanya dapat digunakan di dalam ruang grup.\n*╰───────────────*')
  }

  const admins = (participants || [])
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin || p.isSuperAdmin)
    .map(p => conn.decodeJid(p.id || p.jid))
    .filter(Boolean)

  if (!admins.length) {
    return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Tidak ada Administrator yang terdeteksi di grup ini.\n*╰───────────────*')
  }

  const adminList = admins.map((jid, idx) => `*┆* ⟡ @${jid.split('@')[0].replace(/\D/g, '')}`).join('\n')
  const note = text ? `\n> _"${text.trim()}"_` : ''

  const txt = `*──  ୨୧ ✧ PANGGILAN ADMINISTRATOR ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴀɴɢɢɪʟᴀɴ ᴘᴇɴɢᴜʀᴜꜱ)
> Panggilan darurat ditujukan kepada seluruh Administrator Grup:${note}

*╭  〔 ❖ ᴅ ᴇ ᴡ ᴀ ɴ  ᴀ ᴅ ᴍ ɪ ɴ ɪ ꜱ ᴛ ʀ ᴀ ᴛ ᴏ ʀ 〕*
${adminList}
*╰───────────────*

> ｡˚ ⊹ _Mohon periksa dan tanggapi laporan anggota dengan bijaksana_ ⊹ ˚ ｡`.trim()

  return conn.sendMessage(m.chat, {
    text: txt,
    mentions: admins
  }, { quoted: m })
}

handler.help = ['tagadmin [pesan]']
handler.tags = ['group']
handler.command = /^tagadmin$/i
handler.group = true

export default handler