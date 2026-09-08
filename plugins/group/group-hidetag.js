let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
  const botJid = conn.decodeJid(conn.user.id || conn.user.jid)
  const users = (participants || [])
    .map(u => conn.decodeJid(u.id || u.jid))
    .filter(u => u && u !== botJid)

  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (m.quoted) {
    if (mime) {
      const media = await m.quoted.download()
      if (!media) return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal mengunduh media dari pesan yang dibalas.\n*╰───────────────*')

      const type = mime.split('/')[0]
      if (type === 'image') {
        await conn.sendMessage(m.chat, { image: media, caption: text || q.text || '', mentions: users }, { quoted: m })
      } else if (type === 'video') {
        await conn.sendMessage(m.chat, { video: media, caption: text || q.text || '', mentions: users }, { quoted: m })
      } else if (type === 'audio') {
        await conn.sendMessage(m.chat, { audio: media, mimetype: mime, ptt: true, mentions: users }, { quoted: m })
      } else if (mime.includes('webp') || q.mtype === 'stickerMessage') {
        await conn.sendMessage(m.chat, { sticker: media, mentions: users }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, { document: media, mimetype: mime, fileName: q.filename || 'hidetag', caption: text || '', mentions: users }, { quoted: m })
      }
    } else {
      await conn.sendMessage(m.chat, { text: text || q.text || '', mentions: users }, { quoted: m })
    }
  } else {
    if (!text) {
      return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Masukkan teks pengumuman atau balas (reply) media!\n> Contoh: *${usedPrefix + command} Pengumuman Penting*\n*╰───────────────*`)
    }
    await conn.sendMessage(m.chat, { text: text, mentions: users }, { quoted: m })
  }
}

handler.help = ['hidetag <pesan>']
handler.tags = ['group']
handler.command = /^(hidetag|htag|h)$/i
handler.group = true
handler.admin = true

export default handler