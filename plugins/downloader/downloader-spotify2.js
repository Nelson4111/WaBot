import axios from "axios"
import yts from "yt-search"
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
    console.warn('[Spotify2 oEmbed error]:', e.message)
  }
  return null
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(status.warning(`Masukkan tautan lagu Spotify!\n> Contoh: *${usedPrefix + command} https://open.spotify.com/track/...*`))
  }

  await m.reply(status.wait('Sedang memproses tautan lagu Spotify...'))

  try {
    const inputUrl = args[0]
    let query = inputUrl
    let thumb = null
    let trackTitle = ''

    if (inputUrl.includes('open.spotify.com/track/')) {
      const match = inputUrl.match(/(https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+)/)
      const trackUrl = match ? match[1] : inputUrl
      const oembed = await getSpotifyOembed(trackUrl)
      if (oembed) {
        query = oembed.title
        trackTitle = oembed.title
        thumb = oembed.thumbnail
      }
    }

    const search = await yts(query)
    const video = search.videos?.[0]
    if (!video) throw new Error(`Lagu "${query}" tidak ditemukan.`)

    const displayTitle = trackTitle || video.title
    const displayAuthor = video.author?.name || 'Spotify Artist'
    const displayDuration = video.timestamp || '-'
    const cover = thumb || video.thumbnail || await getMenuThumbnail()

    const caption = `*──  ୨୧ ✧ SPOTIFY DOWNLOADER 2 ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ʟ ᴀ ɢ ᴜ 〕*
> ⟡ ᴊᴜᴅᴜʟ    : *${displayTitle}*
> ✧ ᴀʀᴛɪꜱ    : *${displayAuthor}*
> ⧗ ᴅᴜʀᴀꜱɪ   : *${toSmallNum(displayDuration)}*
*╰───────────────*

> _Sedang mengirimkan file audio ke ruang obrolan..._`.trim()

    const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

    const buttons = [
      ['📜 Menu Utama', `${usedPrefix}menu`]
    ]

    await conn.sendButtonV2(m.chat, {
      title: '⛩️ SPOTIFY STREAM',
      subtitle: 'Avelia • SpotiSong Downloader',
      text: caption,
      footer,
      buffer: cover,
      buttons
    }, m)

    const mp3 = await downloadYouTubeMedia(video.url, 'mp3')
    await conn.sendMessage(m.chat, {
      audio: mp3.buffer,
      mimetype: 'audio/mpeg',
      fileName: `${displayTitle}.mp3`
    }, { quoted: m })

  } catch (e) {
    m.reply(status.error(`Gagal memproses Spotify:\n> ${e?.message || e}`))
  }
}

handler.help = ['spotify2 <url>']
handler.command = ['spotify2']
handler.tags = ['downloader']
handler.limit = true

export default handler