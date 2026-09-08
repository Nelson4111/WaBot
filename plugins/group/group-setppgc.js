let handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (/image/.test(mime)) {
    const img = await q.download()
    if (!img) {
      return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal mengunduh gambar.\n*╰───────────────*')
    }
    await conn.updateProfilePicture(m.chat, img)
    return m.reply('*╭  〔 ❖ ᴘ ʀ ᴏ ꜰ ɪ ʟ  ɢ ʀ ᴜ ᴘ 〕*\n> Foto profil grup telah berhasil diperbarui ✦\n*╰───────────────*')
  } else {
    return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Kirim atau balas gambar dengan caption *${usedPrefix + command}*!\n*╰───────────────*`)
  }
}

handler.help = ['setppgc']
handler.tags = ['group']
handler.command = /^(setpp(gc|grup)?)$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
