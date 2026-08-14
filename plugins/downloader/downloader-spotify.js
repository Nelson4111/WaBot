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

// Download audio dari URL yang diproteksi (browser-like headers untuk bypass CF)
async function downloadBuffer(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'audio/*,*/*;q=0.9',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://spotidown.app/',
      'Origin': 'https://spotidown.app'
    }
  })
  return Buffer.from(res.data)
}

// Fallback jika Ryzumi API atau Spotify link tidak bisa diambil audionya langsung
async function getFallbackMp3Url(videoUrl) {
  try {
    const idMatch = videoUrl.match(/(?:youtu\.be\/|v=|\/v\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)
    const id = idMatch ? idMatch[1] : ''
    const keyRes = await axios.get(`https://cnv.cx/v2/sanity/key?id=${id}`, { headers, timeout: 10000 })
    const key = keyRes.data?.key
    if (!key) throw new Error('No key')

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

  try {
    const res = await axios.get(`https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(videoUrl)}`, { timeout: 15000 })
    if (res.data?.status && res.data?.result?.dlink) {
      return { url: res.data.result.dlink, title: res.data.result.title }
    }
  } catch (e) {}

  throw new Error('Gagal mengambil file audio MP3.')
}

async function searchSpotifyTrackUrl(query) {
  // 1. Coba Ryzumi Search API terlebih dahulu
  try {
    const res = await axios.get(`https://api.ryzumi.net/api/search/spotify?query=${encodeURIComponent(query)}`, { timeout: 8000 })
    if (res.data) {
      let list = Array.isArray(res.data) ? res.data : (res.data.results || res.data.data)
      if (Array.isArray(list) && list.length > 0) {
        let trackUrl = list[0].link || list[0].url || list[0].external_urls?.spotify
        if (trackUrl) return trackUrl
      }
    }
  } catch (e) {}

  // 2. Fallback search Spotify track URL via DuckDuckGo search
  try {
    const res = await axios.get(`https://html.duckduckgo.com/html/?q=site%3Aopen.spotify.com%2Ftrack+${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000
    })
    const match = res.data.match(/https%3A%2F%2Fopen\.spotify\.com%2Ftrack%2F[a-zA-Z0-9]+/)
    if (match) return decodeURIComponent(match[0])
  } catch (e) {}

  return null
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🎧 *Contoh Penggunaan:*\n• ${usedPrefix + command} https://open.spotify.com/track/6LF44wAs3h0K67RitTAfr5\n• ${usedPrefix + command} duka`)

  await m.react('🎧')

  try {
    let trackUrl = ''

    // Cek apakah input berupa link Spotify
    if (text.includes('open.spotify.com/track/') || text.includes('spotify:track:')) {
      let match = text.match(/(https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+)/)
      trackUrl = match ? match[1] : text
    } else {
      // Jika berupa query pencarian, cari URL track Spotify
      trackUrl = await searchSpotifyTrackUrl(text)
    }

    // Jika berhasil mendapatkan trackUrl, coba downloader Ryzumi API
    if (trackUrl) {
      try {
        const ryzRes = await axios.get(`https://api.ryzumi.net/api/downloader/spotify?url=${encodeURIComponent(trackUrl)}`, { timeout: 20000 })
        const ryzData = ryzRes.data

        if (ryzData && ryzData.success && ryzData.link) {
          const meta = ryzData.metadata || {}
          const title = meta.title || 'Spotify Music'
          const artist = meta.artists || 'Spotify Artist'
          const album = meta.album || '-'
          const cover = meta.cover || ryzData.coverUrl || 'https://i.scdn.co/image/ab67616d0000b2730fe7814ce91a1b4e7b0d5881'
          const audioUrl = ryzData.link

          let caption = `
🎧 *SPOTIFY DOWNLOADER*

📌 *Judul:* ${title}
👤 *Artis:* ${artist}
💽 *Album:* ${album}
🔗 *Link:* ${trackUrl}

─────────────────
🎵 *Sedang mengunduh audio (320kbps MP3)...*
`.trim()

          await conn.sendMessage(m.chat, {
            image: { url: cover },
            caption: caption
          }, { quoted: m })

          // Download buffer dulu karena URL diproteksi Cloudflare
          const audioBuffer = await downloadBuffer(audioUrl)
          await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mp4',
            fileName: `${title} - ${artist}.mp3`
          }, { quoted: m })

          return await m.react('✅')
        }
      } catch (ryzErr) {
        console.error('Ryzumi Spotify Downloader failed, switching to YT fallback:', ryzErr?.message || ryzErr)
      }
    }

    // Fallback jika Ryzumi gagal / tidak mendapatkan trackUrl Spotify
    let search = await yts(text)
    let video = search.videos?.[0]

    if (!video) {
      return m.reply(`❌ *Lagu "${text}" tidak ditemukan.*`)
    }

    let caption = `
🎧 *SPOTIFY DOWNLOADER (FALLBACK)*

📌 *Judul:* ${video.title}
👤 *Artis:* ${video.author?.name || 'YouTube Music'}
🍜 *Durasi:* ${video.timestamp || '-'}
🔎 *Pencarian:* ${text}

─────────────────
🎵 *Sedang mengunduh audio (320kbps MP3)...*
`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: caption
    }, { quoted: m })

    let mp3Data = await getFallbackMp3Url(video.url)

    // Download buffer dulu agar Baileys tidak stream langsung (bypass CF block)
    const fallbackBuffer = await downloadBuffer(mp3Data.url)
    await conn.sendMessage(m.chat, {
      audio: fallbackBuffer,
      mimetype: 'audio/mp4',
      fileName: `${video.title}.mp3`
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