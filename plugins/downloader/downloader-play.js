import yts from 'yt-search'
import { downloadYouTubeMedia } from '../../lib/youtube.js'
import { getMenuThumbnail, toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan judul lagu YouTube yang ingin diputar!\n> Contoh: *${usedPrefix + command} Alan Walker Faded*`))
  }

  await m.reply(status.wait('Sedang mencari dan menyiapkan audio...'))

  try {
    const search = await yts(text)
    const videos = search.videos || []
    if (!videos.length) throw new Error(`Lagu "${text}" tidak ditemukan.`)

    const video = videos[0]
    const title = video.title || '-'
    const duration = video.timestamp || '-'
    const views = video.views ? formatNumber(video.views) : '-'
    const channel = video.author?.name || '-'
    const thumbnail = video.thumbnail || await getMenuThumbnail()

    const caption = `*──  ୨୧ ✧ YOUTUBE AUDIO PLAYER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ʟ ᴀ ɢ ᴜ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${title}*
*┆* ✧ ᴄʜᴀɴɴᴇʟ  : *${channel}*
*┆* ⧗ ᴅᴜʀᴀꜱɪ   : *${toSmallNum(duration)}*
*┆* ◈ ᴠɪᴇᴡꜱ    : *${toSmallNum(views)}*
*╰───────────────*

> _Sedang mengunduh file audio ke ruang obrolan..._`.trim()

    const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

    const buttons = [
      ['📜 Menu Utama', `${usedPrefix}menu`]
    ]

    // Kirim kartu info interaktif dengan ButtonV2 (tesbutton 6)
    await conn.sendButtonV2(m.chat, {
      title: '⛩️ YOUTUBE MUSIC',
      subtitle: 'Avelia • High Quality Audio',
      text: caption,
      footer,
      buffer: thumbnail,
      buttons
    }, m)

    // Unduh & kirim buffer audio
    const mp3 = await downloadYouTubeMedia(video.url, 'mp3')
    await conn.sendMessage(m.chat, {
      audio: mp3.buffer,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

  } catch (e) {
    m.reply(status.error(`Terjadi kesalahan saat memproses audio:\n> ${e?.message || e}`))
  }
}

handler.help = ['play <judul>']
handler.tags = ['downloader']
handler.command = /^(play)$/i
handler.limit = false
handler.register = false

export default handler

function formatNumber(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toString()
}