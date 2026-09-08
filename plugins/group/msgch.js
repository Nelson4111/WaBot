let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ◈ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ 〕*\n> Contoh: *${usedPrefix + command} Pengumuman Terkini*\n*╰───────────────*`)
  }

  let who = m.sender
  let url = await conn.profilePictureUrl(who, 'image').catch(() => null)
  let idch = '120363407318005025@newsletter'

  let username = await conn.getName(who)

  let q = m.quoted ? m.quoted : m
  let mime = q.mimetype || ''

  let content = { text }
  if (mime.includes('image')) {
    content = { image: await q.download(), caption: text }
  } else if (mime.includes('video')) {
    content = { video: await q.download(), caption: text }
  } else if (mime.includes('audio')) {
    content = { audio: await q.download(), mimetype: 'audio/mpeg', fileName: 'audio.mp3', ptt: true }
  }

  content.contextInfo = {
    externalAdReply: {
      body: `Pesan dari ${username}`,
      thumbnailUrl: url,
      sourceUrl: null,
      mediaType: 1,
      renderLargerThumbnail: false,
      showAdAttribution: false
    }
  }

  await conn.sendMessage(idch, content)
  return m.reply('*╭  〔 ❖ ꜱ ɪ ᴀ ʀ ᴀ ɴ  ꜱ ᴀ ʟ ᴜ ʀ ᴀ ɴ 〕*\n> Pesan telah berhasil disiarkan ke Saluran Resmi ✦\n*╰───────────────*')
}

handler.command = /^(msgch)$/i
handler.help = ['msgch <pesan>']
handler.tags = ['owner']
handler.premium = true
handler.mods = true

export default handler