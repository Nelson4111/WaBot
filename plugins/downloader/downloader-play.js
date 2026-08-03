import yts from 'yt-search'
import axios from 'axios'

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
        audioBitrate: '128',
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
  } catch (e) {
    console.error('Cnv.cx error:', e.message)
  }

  // Fallback API jika cnv.cx fail
  try {
    const res = await axios.get(`https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(videoUrl)}`, { timeout: 15000 })
    if (res.data?.status && res.data?.result?.dlink) {
      return { url: res.data.result.dlink, title: res.data.result.title }
    }
  } catch (e) {}

  throw new Error('Gagal mengambil audio MP3.')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🍭 *Contoh penggunaan: ${usedPrefix + command} Alan Walker Faded*`)

  await m.react('🍢')

  try {
    let search = await yts(text)
    let videos = search.videos
    if (!Array.isArray(videos) || videos.length === 0) 
      return m.reply(`🍰 *Maaf, tidak dapat menemukan lagu dengan kata "${text}"*`)

    let video = videos[0]

    let title = video.title || '-'
    let duration = video.timestamp || '-'
    let views = video.views ? formatNumber(video.views) : '-'
    let channel = video.author?.name || '-'
    let verified = video.author?.verified ? ' 🥇' : ''
    let uploaded = video.ago || '-'
    let thumbnail = video.thumbnail || ''

    let caption = `
🍙 *YOUTUBE PLAY*

📌 *Judul:* ${title}
🍜 *Durasi:* ${duration}
🍡 *Views:* ${views}
🍰 *Channel:* ${channel}${verified}
🍵 *Upload:* ${uploaded}

─────────────────
🔻 *Download Video (MP4):*
${usedPrefix}ytmp4 ${video.url}
─────────────────
🎵 *Sedang mengunduh audio...*
`.trim()

    // 1. Kirim kartu informasi video & petunjuk MP4
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: caption
    }, { quoted: m })

    // 2. Otomatis unduh & kirim file MP3 Audio
    let mp3Data = await getMp3Url(video.url)
    
    await conn.sendMessage(m.chat, {
      audio: { url: mp3Data.url },
      mimetype: 'audio/mp4',
      fileName: `${title}.mp3`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply('🍰 *Terjadi kesalahan saat mengunduh audio:* ' + (e.message || e))
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