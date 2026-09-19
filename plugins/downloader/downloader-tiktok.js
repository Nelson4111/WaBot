// downloader tiktok - fix: download buffer dulu untuk URL yg butuh headers khusus
import axios from 'axios'
import crypto from 'crypto'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'
import os from 'os'
import * as Baileys from '@whiskeysockets/baileys'
import * as Elaina from '@rexxhayanasi/elaina-baileys'
import { status, toSmallNum } from '../../lib/style.js'

const generateWAMessage = Elaina.generateWAMessage || Baileys.generateWAMessage
const generateWAMessageFromContent = Elaina.generateWAMessageFromContent || Baileys.generateWAMessageFromContent
const jidNormalizedUser = Elaina.jidNormalizedUser || Baileys.jidNormalizedUser

// ─── UTIL: Download video/audio sebagai Buffer ──────────────────────────────
async function downloadBuffer(url, referer = '') {
  const resp = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 60000,
    maxContentLength: 100 * 1024 * 1024, // max 100MB
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Referer': referer || 'https://www.tiktok.com/',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    }
  })
  return Buffer.from(resp.data)
}

// ─── UTIL: Optimasi Video TikTok untuk WhatsApp ────────────────────────────
/**
 * Memastikan video TikTok dapat diputar langsung di WhatsApp:
 * 1. Transcoding ke H.264 (yuv420p) + AAC bila codec HEVC/H.265 atau ukuran > 16MB.
 * 2. Mengatur moov atom di awal file (+faststart) agar bisa streaming di HP.
 * 3. Mengompresi video besar (> 20MB) dengan CRF 26 agar tidak melebihi batas WhatsApp.
 */
async function optimizeTikTokVideo(inputBuffer) {
  const tmpIn = join(os.tmpdir(), `tt_in_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`);
  const tmpOut = join(os.tmpdir(), `tt_out_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`);

  try {
    await fs.writeFile(tmpIn, inputBuffer);

    // Cek apakah video > 16MB atau menggunakan codec HEVC/H.265
    let needReencode = inputBuffer.length > 16 * 1024 * 1024;
    try {
      const probe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'stream=codec_name',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        tmpIn
      ]);
      let out = '';
      probe.stdout.on('data', d => out += d);
      await new Promise(r => probe.on('close', r));
      if (out.includes('hevc') || out.includes('h265') || out.includes('vp9') || out.includes('av1')) {
        needReencode = true;
      }
    } catch {}

    const ffmpegArgs = needReencode
      ? [
          '-y',
          '-i', tmpIn,
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-preset', 'fast',
          '-crf', '26',
          '-maxrate', '3M',
          '-bufsize', '6M',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-ar', '44100',
          '-movflags', '+faststart',
          tmpOut
        ]
      : [
          '-y',
          '-i', tmpIn,
          '-c', 'copy',
          '-movflags', '+faststart',
          tmpOut
        ];

    await new Promise((resolve) => {
      const proc = spawn('ffmpeg', ffmpegArgs);
      proc.on('close', resolve);
      proc.on('error', resolve);
    });

    if (await fs.access(tmpOut).then(() => true).catch(() => false)) {
      const optimized = await fs.readFile(tmpOut);
      await fs.unlink(tmpOut).catch(() => {});
      return optimized;
    }

    return inputBuffer;
  } catch (e) {
    console.warn('[TikTok] optimizeTikTokVideo error:', e?.message || e);
    return inputBuffer;
  } finally {
    await fs.unlink(tmpIn).catch(() => {});
  }
}

// ─── UTIL: Expand URL pendek (vt.tiktok.com → www.tiktok.com/...) ──────────
async function expandUrl(url) {
  if (/tiktok\.com\/@.+\/video\/\d+/.test(url)) return url
  try {
    const resp = await axios.get(url, {
      maxRedirects: 10,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/91.0.4472.120 Mobile Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      validateStatus: () => true
    })
    return resp.request?.res?.responseUrl || resp.config?.url || url
  } catch {
    try {
      let current = url
      for (let i = 0; i < 5; i++) {
        const r = await axios.head(current, {
          maxRedirects: 0,
          timeout: 8000,
          validateStatus: s => true,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        if (r.status >= 300 && r.status < 400 && r.headers?.location) {
          current = r.headers.location
        } else break
      }
      return current
    } catch {
      return url
    }
  }
}

// ─── API 0: Ryzumi API ───────────────────────────────────────────────────────
async function getTikTokViaRyzumi(url) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/downloader/tiktok?url=${encodeURIComponent(url)}`,
    {
      timeout: 20000,
      headers: {
        'accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    }
  )

  if (!data) throw new Error('ryzumi: no response data')
  if (data.status === false || data.success === false || data.code === 400 || data.code === 500) {
    const errMsg = data.message || data.msg || data.error || data.err || 'request failed'
    throw new Error(`ryzumi: ${errMsg}`)
  }

  // Probe potential data structures
  const candidates = [
    data.data?.result,
    data.result?.data,
    data.data,
    data.result,
    data
  ].filter(Boolean)

  let title = null
  let play = null
  let music = null
  let images = null

  for (const d of candidates) {
    if (typeof d === 'string' && /^https?:\/\//i.test(d)) {
      play = play || d
      continue
    }

    if (typeof d !== 'object') continue

    // Title
    title = title || d.title || d.caption || d.desc || d.description || d.text

    // Video play link
    if (!play) {
      const videoKeys = [
        d.play, d.video, d.hdplay, d.nowm, d.no_watermark, d.nowatermark,
        d.url, d.video_url, d.videoUrl, d.play_url, d.playUrl, d.link,
        d.download, d.media, d.hd, d.video_hd
      ]
      for (const k of videoKeys) {
        if (typeof k === 'string' && /^https?:\/\//i.test(k)) {
          play = k
          break
        }
      }
    }

    // Music/Audio link
    if (!music) {
      const musicKeys = [
        d.music, d.audio, d.sound, d.music_info?.url, d.audio_url,
        d.audioUrl, d.music_url, d.musicUrl, d.sound_url
      ]
      for (const k of musicKeys) {
        if (typeof k === 'string' && /^https?:\/\//i.test(k)) {
          music = k
          break
        }
      }
    }

    // Images / Slides
    if (!images) {
      const imgLists = [d.images, d.slides, d.photo, d.photos, d.slide]
      for (const list of imgLists) {
        if (Array.isArray(list) && list.length > 0) {
          images = list.map(img => typeof img === 'string' ? img : (img?.url || img?.link || img?.src)).filter(Boolean)
          if (images.length > 0) break
        }
      }
    }
  }

  if (!play && (!images || images.length === 0)) {
    const msg = data.message || data.msg || data.error
    if (msg) throw new Error(`ryzumi: ${msg}`)
    throw new Error('ryzumi: no video or images found in response')
  }

  return {
    title: title || 'TikTok Video',
    play: play || null,
    playUrl: play || null,
    music: music || null,
    images: images || null,
    needBuffer: false
  }
}

// ─── API 1: tikwm.com via POST form-data ─────────────────────────────────────
async function getTikTokViaWM(url) {
  const { data } = await axios.post(
    'https://www.tikwm.com/api/',
    new URLSearchParams({ url, hd: '1' }),
    {
      timeout: 20000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.tikwm.com/',
        'Accept': 'application/json'
      }
    }
  )
  if (!data || data.code !== 0 || !data.data) {
    throw new Error(`tikwm: ${data?.msg || 'unknown error'}`)
  }
  const d = data.data
  return {
    title: d.title || 'TikTok Video',
    play: d.hdplay || d.play || null,
    playUrl: d.hdplay || d.play || null, // simpan URL asli juga
    music: d.music || null,
    images: Array.isArray(d.images) && d.images.length > 0 ? d.images : null,
    needBuffer: false  // tikwm URL bisa langsung dipakai
  }
}

// ─── API 2: SnapTik ───────────────────────────────────────────────────────────
async function getTikTokViaSnapTik(url) {
  const page = await axios.get('https://snaptik.app/id', {
    timeout: 12000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const tokenMatch = page.data.match(/name="token"\s+value="([^"]+)"/)
  if (!tokenMatch) throw new Error('snaptik: token not found')
  const token = tokenMatch[1]

  const resp = await axios.post('https://snaptik.app/abc2.php',
    new URLSearchParams({ url, token }),
    {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://snaptik.app/'
      }
    }
  )

  // Cari link MP4 atau link download (bisa encoded)
  let videoUrl = null
  const mp4Match = resp.data.match(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/i)
  if (mp4Match) videoUrl = mp4Match[1]

  // Cari download link biasa jika tidak ada .mp4
  if (!videoUrl) {
    const dlMatch = resp.data.match(/href="(https?:\/\/[^"]+)"[^>]*>\s*(?:Download|Unduh|HD)/i)
    if (dlMatch) videoUrl = dlMatch[1]
  }

  if (!videoUrl) throw new Error('snaptik: no video link found')

  return {
    title: 'TikTok Video',
    play: videoUrl.replace(/&amp;/g, '&'),
    music: null,
    images: null,
    needBuffer: true,  // snaptik perlu download buffer
    referer: 'https://snaptik.app/'
  }
}

// ─── API 3: SSSTik ───────────────────────────────────────────────────────────
async function getTikTokViaSSST(url) {
  const { data } = await axios.post(
    'https://ssstik.io/abc?url=dl',
    new URLSearchParams({ id: url, locale: 'id', tt: 'NUd3U0Nr' }),
    {
      timeout: 20000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://ssstik.io/',
        'Origin': 'https://ssstik.io'
      }
    }
  )

  if (!data || typeof data !== 'string') throw new Error('ssstik: no response')

  // Cari semua link download dari HTML response
  // Priority: no-watermark (biasanya link pertama dengan "download")
  const allLinks = [...data.matchAll(/href="(https?:\/\/[^"]+)"[^>]*(?:download|dl)[^>]*/gi)]
  const cleanLinks = allLinks
    .map(m => m[1].replace(/&amp;/g, '&'))
    .filter(l => !l.includes('ssstik.io') && !l.includes('javascript'))

  if (!cleanLinks.length) {
    // Coba cari link apapun yang mengandung tiktok CDN
    const cdnMatch = data.match(/https?:\/\/[^"'\s]+(?:cdn-cf|v19|v26|v29|muscdn|tiktok)[^"'\s]+/i)
    if (cdnMatch) {
      return {
        title: 'TikTok Video',
        play: cdnMatch[0].replace(/&amp;/g, '&'),
        music: null,
        images: null,
        needBuffer: true,
        referer: 'https://ssstik.io/'
      }
    }
    throw new Error('ssstik: no link found in response')
  }

  return {
    title: 'TikTok Video',
    play: cleanLinks[0],
    music: null,
    images: null,
    needBuffer: true,  // WAJIB download buffer dulu
    referer: 'https://ssstik.io/'
  }
}

// ─── API 4: MusicalDown ───────────────────────────────────────────────────────
async function getTikTokViaMDown(url) {
  const page = await axios.get('https://musicaldown.com/id', {
    timeout: 12000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const inputs = [...page.data.matchAll(/<input[^>]+name="([^"]+)"[^>]+value="([^"]*)"/gi)]
  const formData = new URLSearchParams()
  for (const [, name, value] of inputs) formData.append(name, value)

  // Set URL ke field yang tepat
  let urlFieldSet = false
  for (const [, name] of inputs) {
    if (['link', 'url', 'q', 'query', 'video_url', 'tiktok_url'].includes(name.toLowerCase())) {
      formData.set(name, url)
      urlFieldSet = true
      break
    }
  }
  if (!urlFieldSet) formData.set('link', url)

  const resp = await axios.post('https://musicaldown.com/download', formData, {
    timeout: 20000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://musicaldown.com/id'
    }
  })

  // Cari link MP4
  const videoMatch = resp.data.match(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/i)
    || resp.data.match(/href="(https?:\/\/[^"]+)"[^>]*download[^>]*>\s*(?:HD|MP4|Download)/i)
  if (!videoMatch) throw new Error('musicaldown: no link found')

  return {
    title: 'TikTok Video',
    play: videoMatch[1].replace(/&amp;/g, '&'),
    music: null,
    images: null,
    needBuffer: true,
    referer: 'https://musicaldown.com/'
  }
}

// ─── Wrapper utama: expand URL → coba API satu per satu ─────────────────────
async function getTikTok(inputUrl) {
  let url = inputUrl
  if (/vm\.tiktok|vt\.tiktok|bit\.ly|tiktok\.com\/t\//.test(inputUrl)) {
    try {
      url = await expandUrl(inputUrl)
      console.log(`[TikTok] URL expanded: ${url}`)
    } catch {
      url = inputUrl
    }
  }

  const apis = [
    { name: 'ryzumi', fn: () => getTikTokViaRyzumi(url) },
    { name: 'ryzumi-original', fn: () => getTikTokViaRyzumi(inputUrl) },
    { name: 'tikwm (POST)', fn: () => getTikTokViaWM(url) },
    { name: 'tikwm-original', fn: () => getTikTokViaWM(inputUrl) },
    { name: 'snaptik', fn: () => getTikTokViaSnapTik(url) },
    { name: 'ssstik', fn: () => getTikTokViaSSST(url) },
    { name: 'musicaldown', fn: () => getTikTokViaMDown(url) },
  ]

  let lastMsg = ''
  for (const api of apis) {
    try {
      const result = await api.fn()
      if (result && (result.play || result.images)) {
        console.log(`[TikTok] ✅ Berhasil via ${api.name}`)
        return result
      }
      console.log(`[TikTok] ⚠️ ${api.name}: respons kosong`)
    } catch (e) {
      lastMsg = e.message || String(e)
      console.log(`[TikTok] ❌ ${api.name}: ${lastMsg}`)
    }
  }

  throw new Error(
    `❌ Semua server download TikTok sedang bermasalah.\n` +
    `Coba lagi nanti atau gunakan URL langsung dari aplikasi TikTok.\n` +
    `*(Error: ${lastMsg})*`
  )
}

// ─── Search TikTok ────────────────────────────────────────────────────────────
async function searchTikTok(query) {
  try {
    const { data } = await axios.post(
      'https://www.tikwm.com/api/feed/search',
      new URLSearchParams({ keywords: query, count: 1, cursor: 0, web: 1 }),
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.tikwm.com/'
        }
      }
    )
    if (data?.code === 0 && data?.data?.videos?.length) {
      const v = data.data.videos[0]
      return `https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`
    }
  } catch { /* lanjut */ }

  try {
    const { data } = await axios.get('https://www.tikwm.com/api/feed/search', {
      params: { keywords: query, count: 1 },
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    if (data?.code === 0 && data?.data?.videos?.length) {
      const v = data.data.videos[0]
      return `https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`
    }
  } catch { /* lanjut */ }

  throw new Error('Pencarian TikTok tidak ditemukan. Coba kirim link langsung.')
}

// ─── HANDLER UTAMA ────────────────────────────────────────────────────────────
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (m.quoted ? m.quoted.text : text)?.trim()
  if (!input) {
    return m.reply(status.warning(`Masukkan tautan atau kata kunci TikTok!\n> Contoh:\n> › *${usedPrefix + command} https://vt.tiktok.com/...*\n> › *${usedPrefix + command} elaina edit amv*`))
  }

  await m.react('⏳')

  try {
    let url = input
    if (!/^https?:\/\//i.test(input)) {
      await m.reply(status.wait(`Mencari video TikTok untuk *"${input}"*...`))
      url = await searchTikTok(input)
    }

    const res = await getTikTok(url)

    // ── Slide / Image Post (WhatsApp Native Album) ──────────────────
    if (Array.isArray(res.images) && res.images.length > 0) {
      await m.reply(status.wait(`Ditemukan ${toSmallNum(res.images.length)} slide gambar, sedang mengunduh & menyiapkan album...`))

      const mediaList = (await Promise.all(
        res.images.map(async (imgUrl, i) => {
          try {
            const buf = await downloadBuffer(imgUrl, res.referer || 'https://www.tiktok.com/')
            const caption = `*──  ୨୧ ✧ TIKTOK SLIDE ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ɢ ᴀ ᴍ ʙ ᴀ ʀ 〕*
> ⟡ ᴊᴜᴅᴜʟ : *${res.title || '-'}*
> ◈ ꜱʟɪᴅᴇ : *${toSmallNum(i + 1)} / ${toSmallNum(res.images.length)}*
*╰───────────────*`.trim()
            return { image: buf, caption }
          } catch (err) {
            console.error(`[TikTok Slide Download Error ${i}]`, err?.message || err)
            return null
          }
        })
      )).filter(Boolean)

      if (!mediaList.length) {
        return m.reply(status.error('Gagal mengunduh slide gambar TikTok.'))
      }

      let sentAlbum = false
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
            userJid: jidNormalizedUser(conn.user.id),
            quoted: m,
            upload: conn.waUploadToServer
          }
        )

        await conn.relayMessage(opener.key.remoteJid, opener.message, {
          messageId: opener.key.id
        })

        for (const content of mediaList) {
          const msg = await generateWAMessage(opener.key.remoteJid, content, {
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
        console.error('[TikTok Album Error]', albumErr)
      }

      // Fallback jika albumMessage gagal: kirim gambar biasa tanpa button
      if (!sentAlbum) {
        for (const content of mediaList) {
          await conn.sendMessage(m.chat, content, { quoted: m })
          await new Promise(r => setTimeout(r, 700))
        }
      }

      if (res.music) {
        await conn.sendMessage(m.chat, {
          audio: { url: res.music },
          mimetype: 'audio/mpeg'
        }, { quoted: m })
      }
      await m.react('✅')
      return
    }

    // ── Video Post ──────────────────────────────────────────────────
    if (res.play) {
      let videoData

      // Selalu unduh buffer video untuk memeriksa ukuran, codec, dan mengoptimalkan untuk WhatsApp
      try {
        console.log(`[TikTok] Downloading video buffer from: ${res.play.substring(0, 80)}...`)
        videoData = await downloadBuffer(res.play, res.referer)
        console.log(`[TikTok] Raw video size: ${(videoData.length / 1024 / 1024).toFixed(2)} MB`)

        // Optimasi video: H.264 + YUV420P + AAC + faststart + kompresi bila > 16MB agar selalu bisa diputar di WhatsApp
        videoData = await optimizeTikTokVideo(videoData)
        console.log(`[TikTok] Optimized video size: ${(videoData.length / 1024 / 1024).toFixed(2)} MB`)
      } catch (e) {
        console.warn(`[TikTok] Buffer download/optimize failed: ${e.message}, fallback to direct URL...`)
        videoData = null
      }

      const caption = `*──  ୨୧ ✧ TIKTOK DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
> ⟡ ᴊᴜᴅᴜʟ : *${res.title || '-'}*
> ◈ ᴛɪᴘᴇ  : *Video MP4 (No Watermark)*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

      if (videoData) {
        await conn.sendMessage(m.chat, {
          video: videoData,
          caption,
          mimetype: 'video/mp4'
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: res.play },
          caption
        }, { quoted: m })
      }
    }

    if (res.music && !res.needBuffer) {
      await conn.sendMessage(m.chat, {
        audio: { url: res.music },
        mimetype: 'audio/mpeg'
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    console.error('[TikTok Handler]', e)
    m.reply(status.error(`Gagal memproses video TikTok:\n> ${e?.message || e}`))
  }
}


handler.help = ['tt <link/kata kunci>', 'tiktok <link>', 'ttsearch <kata kunci>']
handler.tags = ['downloader']
handler.command = /^(tt|tiktok|ttsearch)$/i
handler.limit = true
handler.register = true

export default handler