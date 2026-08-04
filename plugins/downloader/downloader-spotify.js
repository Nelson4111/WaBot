import axios from 'axios'
import yts from 'yt-search'

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Origin': 'https://iframe.y2meta-uk.com',
  'Referer': 'https://iframe.y2meta-uk.com/'
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function getMp3Url(videoUrl) {
  try {
    const keyRes = await axios.get('https://cnv.cx/v2/sanity/key', { headers, timeout: 10000 })
    const key = keyRes.data?.key
    if (!key) throw new Error('No key from cnv.cx')

    const convRes = await axios.post('https://cnv.cx/v2/converter',
      new URLSearchParams({
        link: videoUrl,
        format: 'mp3',
        audioBitrate: '320',
        videoQuality: '720',
        filenameStyle: 'pretty',
        vCodec: 'h264'
      }),
      { headers: { ...headers, key }, timeout: 15000 }
    )

    let job = convRes.data
    if (job.status === 'tunnel' && job.url) return { url: job.url, title: job.filename }
    if (job.status === 'processing' && job.jobId) {
      for (let i = 0; i < 20; i++) {
        await sleep(1500)
        const st = await axios.get(`https://cnv.cx/v2/status/${job.jobId}`, { headers, timeout: 10000 })
        if (st.data?.status === 'completed' && st.data?.url) {
          return { url: st.data.url, title: st.data.filename }
        }
      }
    }
  } catch (e) {}

  // Fallback API jika cnv.cx fail
  try {
    const res = await axios.get(`https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(videoUrl)}`, { timeout: 15000 })
    if (res.data?.status && res.data?.result?.dlink) {
      return { url: res.data.result.dlink, title: res.data.result.title }
    }
  } catch (e) {}

  throw new Error('Gagal mengambil file audio MP3.')
}

async function getSpotifyMeta(input) {
  // 1. Ekstrak ID Track jika input berupa Link Spotify
  let trackMatch = input.match(/track\/([a-zA-Z0-9]+)/i)
  if (trackMatch) {
    const trackId = trackMatch[1]
    const directTrackUrl = `https://open.spotify.com/track/${trackId}`
    try {
      const oe = await axios.get(`https://open.spotify.com/oembed?url=${encodeURIComponent(directTrackUrl)}`, { timeout: 8000 })
      if (oe.data?.title) {
        return {
          title: oe.data.title,
          cover: oe.data.thumbnail_url || '',
          url: directTrackUrl,
          isDirectTrack: true
        }
      }
    } catch (e) {}
    return {
      title: input,
      cover: '',
      url: directTrackUrl,
      isDirectTrack: true
    }
  } else {
    // 2. Jika input berupa Teks Judul Lagu, cari metadata & cover album musik HD
    try {
      const dz = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(input)}`, { timeout: 8000 })
      const t = dz.data?.data?.[0]
      if (t) {
        return {
          title: `${t.artist.name} - ${t.title}`,
          artist: t.artist.name,
          cover: t.album?.cover_xl || t.album?.cover_big || t.album?.cover_medium || '',
          url: '',
          isDirectTrack: false
        }
      }
    } catch (e) {}
    return {
      title: input,
      artist: 'Spotify Artist',
      cover: '',
      url: '',
      isDirectTrack: false
    }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🎧 *Contoh Penggunaan:*\n• ${usedPrefix + command} https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT\n• ${usedPrefix + command} Alan Walker Faded`)

  await m.react('🎧')

  try {
    // 1. Ambil Metadata & Sampul Album Asli dari Spotify / Music Metadata API
    let meta = await getSpotifyMeta(text)
    
    // 2. Pencarian Audio Stream
    let search = await yts(meta.title)
    let videos = search.videos

    if (!Array.isArray(videos) || videos.length === 0) {
      return m.reply(`❌ *Lagu "${text}" tidak ditemukan.*`)
    }

    let video = videos[0]
    let trackTitle = meta.title || video.title
    let coverArt = meta.cover || video.thumbnail
    let artist = meta.artist || video.author?.name || 'Spotify Music'
    let duration = video.timestamp || '-'

    // Format info link: Jika pengguna kirim link Spotify, tampilkan Direct Track Link. Jika teks pencarian, tampilkan info pencarian tanpa URL /search/
    let linkInfoLine = meta.isDirectTrack
      ? `🔗 *Link Spotify:* ${meta.url}`
      : `🔎 *Pencarian:* ${text}`

    let caption = `
🎧 *SPOTIFY DOWNLOADER*

📌 *Judul:* ${trackTitle}
👤 *Artis:* ${artist}
🍜 *Durasi:* ${duration}
${linkInfoLine}

─────────────────
🎵 *Sedang mengunduh audio (320kbps MP3)...*
`.trim()

    // 3. Kirim Kartu Gambar Album Asli Spotify / Musik HD
    await conn.sendMessage(m.chat, {
      image: { url: coverArt },
      caption: caption
    }, { quoted: m })

    // 4. Unduh & kirimkan file audio MP3 berkualitas tinggi di background
    let mp3Data = await getMp3Url(video.url)

    await conn.sendMessage(m.chat, {
      audio: { url: mp3Data.url },
      mimetype: 'audio/mp4',
      fileName: `${trackTitle}.mp3`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('Spotify Downloader Error:', e)
    await m.react('❌')
    m.reply('❌ *Terjadi kesalahan saat memproses Spotify:* ' + (e.message || e))
  }
}

handler.help = ['spotify <url/judul>', 'plays <judul>']
handler.tags = ['downloader']
handler.command = /^(spotify|plays)$/i
handler.limit = false

export default handler