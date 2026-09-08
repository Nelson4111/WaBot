let handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Perintah ini hanya dapat digunakan di dalam ruang grup.\n*╰───────────────*')
  }

  try {
    const inviteCode = await conn.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${inviteCode}`
    const groupName = await conn.getName(m.chat)

    const txt = `*──  ୨୧ ✧ TAUTAN UNDANGAN RESMI ✧ ୨୧  ──*

> *おしらせ!* (ᴛᴀᴜᴛᴀɴ ɢʀᴜᴘ)
> Tautan resmi untuk bergabung ke grup *${groupName}*

*╭  〔 ⟡ ᴛ ᴀ ᴜ ᴛ ᴀ ɴ  ᴜ ɴ ᴅ ᴀ ɴ ɢ ᴀ ɴ 〕*
*┆* › ${link}
*╰───────────────*

> ｡˚ ⊹ _Bagikan tautan ini kepada rekan atau sahabatmu_ ⊹ ˚ ｡`.trim()

    return m.reply(txt)
  } catch (err) {
    console.error('Error linkgrup:', err)
    return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal mengambil tautan grup. Pastikan bot adalah Administrator grup.\n*╰───────────────*')
  }
}

handler.help = ['linkgrup']
handler.tags = ['group']
handler.command = /^link(grup|gc)?$/i
handler.group = true
handler.botAdmin = true

export default handler