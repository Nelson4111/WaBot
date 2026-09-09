import yts from 'yt-search'
import { downloadYouTubeMedia } from '../../lib/youtube.js'
import { getMenuThumbnail, toSmallNum, status } from '../../lib/style.js'

const handler = async (m, { conn, usedPrefix, text, command }) => {
  if (!text) {
    return m.reply(status.warning(`Ketikkan judul lagu yang ingin diputar!\n> Contoh: *${usedPrefix + command} Kau Masih Kekasihku*`))
  }

  await m.reply(status.wait('Sedang memproses permintaan lagu...'))

  try {
    const search = await yts(text)
    const videos = search.videos || []
    if (!videos.length) throw new Error(`Lagu "${text}" tidak ditemukan.`)

    const video = videos[0]
    const { title, author, timestamp: duration, url, thumbnail } = video
    const thumb = thumbnail || await getMenuThumbnail()

    const caption = `*──  ୨୧ ✧ YOUTUBE PLAY 2 ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ʟ ᴀ ɢ ᴜ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${title}*
*┆* ✧ ᴀᴜᴛʜᴏʀ   : *${author?.name || '-'}*
*┆* ⧗ ᴅᴜʀᴀꜱɪ   : *${toSmallNum(duration)}*
*╰───────────────*

> _Sedang mengunduh file audio ke ruang obrolan..._`.trim()

    const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

    const buttons = [
      ['📜 Menu Utama', `${usedPrefix}menu`]
    ]

    await conn.sendButtonV2(m.chat, {
      title: '⛩️ YOUTUBE AUDIO',
      subtitle: 'Avelia • Media Service',
      text: caption,
      footer,
      buffer: thumb,
      buttons
    }, m)

    const mp3 = await downloadYouTubeMedia(url, 'mp3')
    await conn.sendMessage(m.chat, {
      audio: mp3.buffer,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

  } catch (err) {
    m.reply(status.error(`Terjadi kesalahan:\n> ${err.message || err}`))
  }
}

handler.help = ['play2 <judul>']
handler.tags = ['downloader']
handler.command = ['play2']
handler.limit = true

export default handler