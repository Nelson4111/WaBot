import axios from 'axios'
import qs from 'querystring'
import { spawn } from 'child_process'
import { status } from '../../lib/style.js'

async function downloadBuffer(url, referer = 'https://www.instagram.com/') {
  const resp = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 60000,
    maxContentLength: 100 * 1024 * 1024,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
      'Referer': referer,
      'Accept': '*/*'
    }
  })
  return Buffer.from(resp.data)
}

function convertToMp3(input) {
  return new Promise(async (resolve, reject) => {
    try {
      let buf
      if (Buffer.isBuffer(input)) {
        buf = input
      } else if (typeof input === 'string' && input.startsWith('http')) {
        buf = await downloadBuffer(input)
      } else {
        return reject(new Error('Input audio tidak valid'))
      }

      const ffmpegProc = spawn('ffmpeg', [
        '-i', 'pipe:0',
        '-vn',
        '-c:a', 'libmp3lame',
        '-b:a', '128k',
        '-f', 'mp3',
        'pipe:1'
      ])

      const chunks = []
      let errLog = ''

      ffmpegProc.stdout.on('data', chunk => chunks.push(chunk))
      ffmpegProc.stderr.on('data', d => { errLog += d.toString() })
      ffmpegProc.on('error', reject)
      ffmpegProc.on('close', code => {
        if (code === 0 && chunks.length > 0) {
          resolve(Buffer.concat(chunks))
        } else {
          reject(new Error(`ffmpeg exit code ${code}: ${errLog.slice(-200)}`))
        }
      })

      ffmpegProc.stdin.on('error', () => {})
      ffmpegProc.stdin.write(buf)
      ffmpegProc.stdin.end()
    } catch (e) {
      reject(e)
    }
  })
}

// ─── Scraper Fallback SaveInsta ──────────────────────────────────────────────
async function scrapeSaveInstaAudio(url) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }

  const home = await axios.get('https://saveinsta.to/', { headers, timeout: 10000 })
  const k_token = home.data.match(/k_token\s*=\s*['"]([^'"]+)['"]/)?.[1]
  if (!k_token) throw new Error('Gagal mendapatkan token SaveInsta.')

  const verifyRes = await axios.post('https://saveinsta.to/api/userverify', qs.stringify({ url }), { headers, timeout: 10000 })
  const cftoken = verifyRes.data?.token
  if (!cftoken) throw new Error('Token verifikasi tidak ditemukan.')

  const payload = qs.stringify({
    k_exp: Math.floor(Date.now() / 1000) + 300,
    k_token,
    q: url,
    t: 'media',
    lang: 'en',
    v: 'v2',
    cftoken
  })

  const searchRes = await axios.post('https://saveinsta.to/api/ajaxSearch', payload, { headers, timeout: 15000 })
  const html = searchRes.data?.data
  if (!html) throw new Error('Tidak ada data yang ditemukan untuk audio ini.')

  const rawLink = html.match(/<a href="([^"]+)"[^>]*title="Download Audio"/)?.[1] || html.match(/href="([^"]+)"[^>]*>Download Audio/)?.[1]
  if (!rawLink) throw new Error('Link unduhan audio Instagram tidak ditemukan di SaveInsta.')

  return rawLink.startsWith('http') ? rawLink : 'https://mp3.videodropper.app/api?url=' + encodeURIComponent(rawLink)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(status.warning(`Masukkan URL audio/reels Instagram!\n> Contoh: *${usedPrefix + command} https://www.instagram.com/reel/DI8R3PxviMB/*`))
  }

  let url = args[0]
  if (!/^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\//i.test(url)) {
    return m.reply(status.warning('URL audio reels Instagram tidak valid.'))
  }

  await m.react('⏳')

  try {
    let audioSource = null
    let author = 'instagram'

    // 1. Coba Ryzumi API
    try {
      const { data } = await axios.get(
        `https://api.ryzumi.net/api/downloader/instagram?url=${encodeURIComponent(url)}`,
        { timeout: 25000, headers: { 'User-Agent': 'Mozilla/5.0' } }
      )
      if (data?.success && data?.result) {
        author = data.result.author?.username || 'instagram'
        if (Array.isArray(data.result.media?.audio) && data.result.media.audio.length > 0) {
          audioSource = data.result.media.audio[0]?.url
        } else if (Array.isArray(data.result.media?.videos) && data.result.media.videos.length > 0) {
          audioSource = data.result.media.videos[0]?.url
        }
      }
    } catch (e) {
      console.warn('[IG Audio Ryzumi Warn]:', e?.message || e)
    }

    // 2. Fallback SaveInsta jika Ryzumi belum dapat
    if (!audioSource) {
      audioSource = await scrapeSaveInstaAudio(url)
    }

    if (!audioSource) {
      throw new Error('Tidak dapat menemukan audio dari tautan Instagram tersebut.')
    }

    // 3. Konversi ke true MP3 buffer dengan ffmpeg
    const mp3Buf = await convertToMp3(audioSource)
    const safeName = author.replace(/[^\w\d_-]/g, '_')

    await conn.sendMessage(m.chat, {
      audio: mp3Buf,
      mimetype: 'audio/mpeg',
      fileName: `${safeName}_audio.mp3`,
      ptt: false
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply(status.error(`Gagal mengunduh audio Instagram:\n> ${e.message || e}`))
  }
}

handler.help = ['igaudio <url>']
handler.tags = ['downloader']
handler.command = /^(instaaudio|igaudio|inastagramaudio)$/i
handler.limit = true
handler.register = true

export default handler