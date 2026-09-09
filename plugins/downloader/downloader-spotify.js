import axios from 'axios'
import yts from 'yt-search'
import { downloadYouTubeMedia } from '../../lib/youtube.js'
import { getMenuThumbnail, toSmallNum, status } from '../../lib/style.js'

async function getSpotifyOembed(url) {
  try {
    const res = await axios.get(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`, { timeout: 10000 })
    if (res.data?.title) {
      return {
        title: res.data.title,
        thumbnail: res.data.thumbnail_url || null
      }
    }
  } catch (e) {
    console.warn('[Spotify oEmbed error]:', e.message)
  }
  return null
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan link atau judul lagu Spotify!\n> Contoh: *${usedPrefix + command} Alan Walker Faded*\n> Atau: *${usedPrefix + command} https://open.spotify.com/track/...*`))
  }

  await m.reply(status.wait('Sedang mencari dan memproses lagu Spotify...'))

  try {
    let query = text
    let thumb = null
    let trackTitle = ''

    if (text.includes('open.spotify.com/track/')) {
      const match = text.match(/(https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+)/)
      const trackUrl = match ? match[1] : text
      const oembed = await getSpotifyOembed(trackUrl)
      if (oembed) {
        query = oembed.title
        trackTitle = oembed.title
        thumb = oembed.thumbnail
      }
    }

    // Cari audio via YouTube
    const search = await yts(query)
    const video = search.videos?.[0]
    if (!video) throw new Error(`Lagu "${query}" tidak ditemukan.`)

    const displayTitle = trackTitle || video.title
    const displayAuthor = video.author?.name || 'Spotify Music'
    const displayDuration = video.timestamp || '-'
    const cover = thumb || video.thumbnail || await getMenuThumbnail()

    const caption = `*──  ୨୧ ✧ SPOTIFY DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ʟ ᴀ ɢ ᴜ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${displayTitle}*
*┆* ✧ ᴀʀᴛɪꜱ    : *${displayAuthor}*
*┆* ⧗ ᴅᴜʀᴀꜱɪ   : *${toSmallNum(displayDuration)}*
*╰───────────────*

> _Sedang mengunduh file audio ke ruang obrolan..._`.trim()

    const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

    const buttons = [
      ['📜 Menu Utama', `${usedPrefix}menu`]
    ]

    await conn.sendButtonV2(m.chat, {
      title: '⛩️ SPOTIFY MUSIC',
      subtitle: 'Avelia • High Quality Stream',
      text: caption,
      footer,
      buffer: cover,
      buttons
    }, m)

    // Unduh buffer audio YouTube dengan header referer aman
    const mp3 = await downloadYouTubeMedia(video.url, 'mp3')
    await conn.sendMessage(m.chat, {
      audio: mp3.buffer,
      mimetype: 'audio/mpeg',
      fileName: `${displayTitle}.mp3`
    }, { quoted: m })

  } catch (e) {
    m.reply(status.error(`Terjadi kesalahan saat memproses Spotify:\n> ${e?.message || e}`))
  }
}

handler.help = ['spotify <url/judul>', 'plays <judul>']
handler.tags = ['downloader']
handler.command = /^(spotify|plays)$/i
handler.limit = true

export default handler