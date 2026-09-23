import axios from 'axios'
import crypto from 'crypto'
import { spawn } from 'child_process'
import * as cheerio from 'cheerio'
import qs from 'querystring'
import * as Baileys from '@whiskeysockets/baileys'
import * as Elaina from '@rexxhayanasi/elaina-baileys'
import { status, toSmallNum } from '../../lib/style.js'

const generateWAMessage = Elaina.generateWAMessage || Baileys.generateWAMessage
const generateWAMessageFromContent = Elaina.generateWAMessageFromContent || Baileys.generateWAMessageFromContent
const jidNormalizedUser = Elaina.jidNormalizedUser || Baileys.jidNormalizedUser

// ─── UTIL: Download Buffer ──────────────────────────────────────────────────
async function downloadBuffer(url, referer = 'https://www.instagram.com/') {
  const resp = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 60000,
    maxContentLength: 100 * 1024 * 1024, // max 100MB
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
      'Referer': referer,
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    }
  })
  return Buffer.from(resp.data)
}

// ─── UTIL: Convert to Playable MP3 Buffer ────────────────────────────────────
async function convertToMp3(input) {
  let buf
  if (Buffer.isBuffer(input)) {
    buf = input
  } else if (typeof input === 'string' && input.startsWith('http')) {
    buf = await downloadBuffer(input)
  } else {
    throw new Error('Input audio tidak valid')
  }

  return new Promise((resolve, reject) => {
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
  })
}

// ─── API 1: Ryzumi Instagram Downloader ───────────────────────────────────────
async function getInstagramViaRyzumi(url) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/downloader/instagram?url=${encodeURIComponent(url)}`,
    {
      timeout: 25000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
      }
    }
  )

  if (!data || !data.success || !data.result) {
    const errMsg = data?.message || data?.msg || 'Ryzumi: respon tidak valid'
    throw new Error(errMsg)
  }

  const res = data.result
  const title = (res.title || '').trim()
  const author = res.author?.username || ''
  const likes = typeof res.likes === 'number' ? res.likes : 0
  const views = typeof res.views === 'number' ? res.views : 0

  const videos = []
  if (Array.isArray(res.media?.videos)) {
    for (const v of res.media.videos) {
      if (v?.url) videos.push(v.url)
    }
  }

  const images = []
  if (Array.isArray(res.media?.images)) {
    for (const img of res.media.images) {
      const u = typeof img === 'string' ? img : (img?.url || img?.link)
      if (u) images.push(u)
    }
  }

  let audio = null
  if (Array.isArray(res.media?.audio) && res.media.audio.length > 0) {
    audio = res.media.audio[0]?.url || null
  }

  // Fallback to media.all if videos/images arrays are empty
  if (!videos.length && !images.length && Array.isArray(res.media?.all)) {
    for (const item of res.media.all) {
      if (item.type === 'video' || item.mimetype?.includes('video') || /\.mp4/i.test(item.url)) {
        if (!item.isAudio && item.url) videos.push(item.url)
      } else if (item.type === 'image' || item.mimetype?.includes('image')) {
        if (item.url) images.push(item.url)
      } else if (item.isAudio || item.type === 'audio') {
        if (!audio && item.url) audio = item.url
      }
    }
  }

  // Fallback to legacy res.url
  if (!videos.length && !images.length) {
    if (typeof res.url === 'string') {
      if (/\.mp4/i.test(res.url)) videos.push(res.url)
      else images.push(res.url)
    } else if (Array.isArray(res.url)) {
      for (const u of res.url) {
        if (/\.mp4/i.test(u)) videos.push(u)
        else images.push(u)
      }
    }
  }

  if (!videos.length && !images.length) {
    throw new Error('Tidak ada media video maupun foto yang ditemukan.')
  }

  return {
    source: 'ryzumi',
    title,
    author,
    likes,
    views,
    videos,
    images,
    audio,
    cover: res.cover || null
  }
}

// ─── API 2: SaveInsta Scraper (Fallback) ─────────────────────────────────────
async function scrapeSaveInsta(url) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
  }

  const home = await axios.get('https://saveinsta.to/', { headers, timeout: 10000 })
  const k_token = home.data.match(/k_token\s*=\s*['"]([^'"]+)['"]/)?.[1]
  if (!k_token) throw new Error('Token saveinsta tidak ditemukan.')

  const verifyRes = await axios.post('https://saveinsta.to/api/userverify', qs.stringify({ url }), { headers, timeout: 10000 })
  const cftoken = verifyRes.data?.token

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
  if (!html) {
    if (searchRes.data?.mess) throw new Error(searchRes.data.mess.replace(/<[^>]+>/g, ''))
    throw new Error('Tidak ada respon data media dari SaveInsta.')
  }

  const $ = cheerio.load(html)
  const videos = []
  const images = []
  let audio = null

  let list = $('.download-box > li')
  if (!list.length) list = $('.download-items')

  list.each((_, el) => {
    const videoBtn = $(el).find('a[title*="Video"], a:contains("Download Video")').attr('href')
    const photoBtn = $(el).find('a[title*="Photo"], a[title*="Image"], a:contains("Download Photo"), a:contains("Download Image")').attr('href')
    const normalBtn = $(el).find('.download-items__btn:not(.dl-thumb) a').attr('href')
    const anyBtn = $(el).find('a.download-items__btn, a.btn-download').attr('href')

    let dlUrl = videoBtn || photoBtn || normalBtn || anyBtn
    if (!dlUrl || !dlUrl.startsWith('http')) return

    let isVideo = false
    if (videoBtn || $(el).find('.format-icon .icon-dlvideo').length > 0) isVideo = true

    let directUrl = dlUrl
    try {
      const token = dlUrl.match(/token=([^&]+)/)?.[1]
      if (token) {
        const jwtPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'))
        if (jwtPayload.url) directUrl = jwtPayload.url
        if (jwtPayload.filename) {
          if (/\.mp4/i.test(jwtPayload.filename)) isVideo = true
          else if (/\.(jpe?g|png|webp)/i.test(jwtPayload.filename)) isVideo = false
        }
        if (jwtPayload.url && (/\.mp4/i.test(jwtPayload.url) || /video/i.test(jwtPayload.url))) {
          isVideo = true
        }
      }
    } catch {}

    if (!isVideo && (/\/reel(s)?\//i.test(url) || /\.mp4/i.test(directUrl) || /video/i.test(directUrl))) {
      isVideo = true
    }

    if (isVideo) videos.push(directUrl)
    else images.push(directUrl)
  })

  // Try extracting audio link from SaveInsta if available
  const rawAudio = html.match(/<a href="([^"]+)"[^>]*title="Download Audio"/)?.[1] || html.match(/href="([^"]+)"[^>]*>Download Audio/)?.[1]
  if (rawAudio) {
    audio = rawAudio.startsWith('http') ? rawAudio : 'https://mp3.videodropper.app/api?url=' + encodeURIComponent(rawAudio)
  }

  return {
    source: 'saveinsta',
    title: '',
    author: '',
    likes: 0,
    views: 0,
    videos,
    images,
    audio,
    cover: null
  }
}

// ─── API 3: FAA API (Fallback) ───────────────────────────────────────────────
async function getInstagramViaFAA(url) {
  const faa = await axios.get(`https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`, { timeout: 15000 })
  if (!faa.data?.status || !faa.data?.result) throw new Error('FAA: data tidak ditemukan')

  const res = faa.data.result
  const isVid = res.metadata?.isVideo ?? /\/reel(s)?\//i.test(url)
  const urls = res.url || []
  const videos = []
  const images = []

  for (const u of urls) {
    if (isVid || /\.mp4/i.test(u)) videos.push(u)
    else images.push(u)
  }

  return {
    source: 'faa',
    title: res.metadata?.caption || '',
    author: res.metadata?.username || '',
    likes: 0,
    views: 0,
    videos,
    images,
    audio: null,
    cover: null
  }
}

// ─── Master Downloader ──────────────────────────────────────────────────────
async function getInstagram(url) {
  const apis = [
    { name: 'Ryzumi', fn: () => getInstagramViaRyzumi(url) },
    { name: 'SaveInsta', fn: () => scrapeSaveInsta(url) },
    { name: 'FAA', fn: () => getInstagramViaFAA(url) }
  ]

  let lastErr = ''
  for (const api of apis) {
    try {
      const res = await api.fn()
      if (res && (res.videos.length > 0 || res.images.length > 0)) {
        console.log(`[Instagram] ✅ Berhasil via ${api.name}`)
        return res
      }
    } catch (e) {
      lastErr = e.message || String(e)
      console.warn(`[Instagram] ⚠️ ${api.name} gagal: ${lastErr}`)
    }
  }

  throw new Error(`Gagal mengunduh media Instagram.\n> (${lastErr || 'Semua server tidak merespon'})`)
}

// ─── HANDLER UTAMA ──────────────────────────────────────────────────────────
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (text || (m.quoted ? m.quoted.text : ''))?.trim()
  if (!input) {
    return m.reply(
      status.warning(
        `Masukkan URL postingan atau reel Instagram!\n` +
        `> Contoh: *${usedPrefix + command} https://www.instagram.com/reel/DI8R3PxviMB/*`
      )
    )
  }

  const match = input.match(/https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/[^\s]+/i)
  const url = match ? match[0] : input

  if (!/^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\//i.test(url)) {
    return m.reply(status.warning('Tautan Instagram tidak valid! Pastikan tautan berasal dari instagram.com.'))
  }

  await m.react('⏳')

  try {
    const res = await getInstagram(url)

    let cleanTitle = res.title || ''
    if (cleanTitle.length > 200) {
      cleanTitle = cleanTitle.substring(0, 197) + '...'
    }

    // ── 1. Jika ada Post Gambar / Slide Carousel ────────────────────────────
    if (res.images.length > 0 && res.videos.length === 0) {
      if (res.images.length === 1) {
        // Single Image
        const caption = `*──  ୨୧ ✧ INSTAGRAM DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ɢ ᴀ ᴍ ʙ ᴀ ʀ 〕*
${cleanTitle ? `> ⟡ ᴊᴜᴅᴜʟ   : *${cleanTitle}*\n` : ''}${res.author ? `> ⟡ ᴀᴜᴛʜᴏʀ  : *@${res.author}*\n` : ''}${res.likes ? `> ◈ ʟɪᴋᴇ    : *${toSmallNum(res.likes)}*\n` : ''}> ◈ ᴛɪᴘᴇ    : *Foto / Gambar*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

        let imgBuf
        try {
          imgBuf = await downloadBuffer(res.images[0])
        } catch {
          imgBuf = null
        }

        if (imgBuf) {
          await conn.sendMessage(m.chat, { image: imgBuf, caption }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, { image: { url: res.images[0] }, caption }, { quoted: m })
        }

      } else {
        // Multi-image Slide (WhatsApp Native Album)
        await m.reply(status.wait(`Ditemukan ${toSmallNum(res.images.length)} slide gambar, sedang mengunduh & menyiapkan album...`))

        const mediaList = (await Promise.all(
          res.images.map(async (imgUrl, i) => {
            try {
              const buf = await downloadBuffer(imgUrl)
              const caption = `*──  ୨୧ ✧ INSTAGRAM SLIDE ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ɢ ᴀ ᴍ ʙ ᴀ ʀ 〕*
${cleanTitle ? `> ⟡ ᴊᴜᴅᴜʟ : *${cleanTitle}*\n` : ''}${res.author ? `> ⟡ ᴀᴜᴛʜᴏʀ : *@${res.author}*\n` : ''}> ◈ ꜱʟɪᴅᴇ : *${toSmallNum(i + 1)} / ${toSmallNum(res.images.length)}*
*╰───────────────*`.trim()
              return { image: buf, caption }
            } catch (err) {
              console.error(`[Instagram Slide Error ${i}]:`, err?.message || err)
              return null
            }
          })
        )).filter(Boolean)

        if (!mediaList.length) {
          throw new Error('Gagal mengunduh gambar slide Instagram.')
        }

        let sentAlbum = false
        const userJid = jidNormalizedUser(conn.user.id)
        try {
          const opener = generateWAMessageFromContent(
            m.chat,
            {
              messageContextInfo: { messageSecret: crypto.randomBytes(32) },
              albumMessage: {
                expectedImageCount: mediaList.length,
                expectedVideoCount: 0
              }
            },
            {
              userJid,
              quoted: m.message ? m : undefined,
              upload: conn.waUploadToServer
            }
          )

          await conn.relayMessage(opener.key.remoteJid, opener.message, {
            messageId: opener.key.id
          })

          for (const content of mediaList) {
            const msg = await generateWAMessage(opener.key.remoteJid, content, {
              userJid,
              upload: conn.waUploadToServer
            })

            msg.message.messageContextInfo = {
              messageSecret: crypto.randomBytes(32),
              messageAssociation: {
                associationType: 1,
                parentMessageKey: opener.key
              }
            }

            await conn.relayMessage(msg.key.remoteJid, msg.message, {
              messageId: msg.key.id
            })
          }
          sentAlbum = true
        } catch (albumErr) {
          console.error('[Instagram Album Error]:', albumErr?.message || albumErr)
        }

        // Fallback jika album relay gagal
        if (!sentAlbum) {
          for (const content of mediaList) {
            await conn.sendMessage(m.chat, content, { quoted: m })
            await new Promise(r => setTimeout(r, 600))
          }
        }
      }

      // Kirim Audio jika ada
      if (res.audio) {
        try {
          const mp3Buf = await convertToMp3(res.audio)
          const safeName = (res.author || 'instagram').replace(/[^\w\d_-]/g, '_')
          await conn.sendMessage(m.chat, {
            audio: mp3Buf,
            mimetype: 'audio/mpeg',
            fileName: `${safeName}_audio.mp3`,
            ptt: false
          }, { quoted: m })
        } catch (audErr) {
          console.warn('[Instagram Slide Audio Convert Error]:', audErr?.message || audErr)
        }
      }

      await m.react('✅')
      return
    }

    // ── 2. Jika ada Post Video (Reels / Video Post) ──────────────────────────
    if (res.videos.length > 0) {
      for (let i = 0; i < res.videos.length; i++) {
        const videoUrl = res.videos[i]
        const isMultiple = res.videos.length > 1

        const caption = `*──  ୨୧ ✧ INSTAGRAM DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
${cleanTitle ? `> ⟡ ᴊᴜᴅᴜʟ   : *${cleanTitle}*\n` : ''}${res.author ? `> ⟡ ᴀᴜᴛʜᴏʀ  : *@${res.author}*\n` : ''}${res.likes ? `> ◈ ʟɪᴋᴇ    : *${toSmallNum(res.likes)}*\n` : ''}${res.views ? `> ◈ ᴠɪᴇᴡ    : *${toSmallNum(res.views)}*\n` : ''}> ◈ ᴛɪᴘᴇ    : *Video MP4*${isMultiple ? ` (${toSmallNum(i + 1)}/${toSmallNum(res.videos.length)})` : ''}
*╰───────────────*

> _Media berhasil diunduh_`.trim()

        let videoBuf = null
        try {
          videoBuf = await downloadBuffer(videoUrl)
        } catch (e) {
          console.warn('[Instagram Video Buffer Error]:', e?.message || e)
        }

        if (videoBuf) {
          await conn.sendMessage(m.chat, {
            video: videoBuf,
            caption,
            mimetype: 'video/mp4',
            fileName: 'instagram.mp4'
          }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption,
            mimetype: 'video/mp4',
            fileName: 'instagram.mp4'
          }, { quoted: m })
        }
      }

      // Kirim Audio pengiring (seperti TikTok downloader)
      const audioSource = res.audio || videoBuf
      if (audioSource) {
        try {
          const mp3Buf = await convertToMp3(audioSource)
          const safeName = (res.author || 'instagram').replace(/[^\w\d_-]/g, '_')
          await conn.sendMessage(m.chat, {
            audio: mp3Buf,
            mimetype: 'audio/mpeg',
            fileName: `${safeName}_audio.mp3`,
            ptt: false
          }, { quoted: m })
        } catch (audErr) {
          console.warn('[Instagram Video Audio Convert Error]:', audErr?.message || audErr)
        }
      }

      await m.react('✅')
      return
    }

  } catch (e) {
    await m.react('❌')
    console.error('[Instagram Handler Error]:', e)
    m.reply(status.error(`Gagal memproses media Instagram:\n> ${e?.message || e}`))
  }
}

handler.help = ['ig <link>', 'igdl <link>', 'instagram <link>', 'reels <link>']
handler.tags = ['downloader']
handler.command = /^(ig(dl)?|instagram(dl)?|reels?)$/i
handler.limit = true
handler.register = true

export default handler