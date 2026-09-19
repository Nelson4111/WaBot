import axios from 'axios'
import * as cheerio from 'cheerio'
import qs from 'querystring'
import { status, toSmallNum } from '../../lib/style.js'

async function scrapeSaveInsta(url) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
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
  const results = []

  let list = $('.download-box > li')
  if (!list.length) list = $('.download-items')

  list.each((_, el) => {
    // 1. Prioritaskan tombol video
    const videoBtn = $(el).find('a[title*="Video"], a:contains("Download Video")').attr('href')
    // 2. Tombol foto / image
    const photoBtn = $(el).find('a[title*="Photo"], a[title*="Image"], a:contains("Download Photo"), a:contains("Download Image")').attr('href')
    // 3. Tombol download normal (bukan tombol thumbnail .dl-thumb)
    const normalBtn = $(el).find('.download-items__btn:not(.dl-thumb) a').attr('href')
    const anyBtn = $(el).find('a.download-items__btn, a.btn-download').attr('href')

    let dlUrl = videoBtn || photoBtn || normalBtn || anyBtn
    if (!dlUrl || !dlUrl.startsWith('http')) return

    let isVideo = false
    if (videoBtn) {
      isVideo = true
    } else if ($(el).find('.format-icon .icon-dlvideo').length > 0) {
      isVideo = true
    }

    // Decode JWT token snapcdn jika ada untuk mendapatkan direct URL Instagram CDN & deteksi tipe media akurat
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

    results.push({
      url: directUrl,
      type: isVideo ? 'video' : 'image'
    })
  })

  // Fallback direct scan jika list kosong
  if (!results.length) {
    $('a[href^="http"]').each((_, el) => {
      const href = $(el).attr('href')
      const text = $(el).text().trim()
      const title = $(el).attr('title') || ''
      if (/thumbnail/i.test(text) || /thumbnail/i.test(title) || /saveinsta app/i.test(text)) return
      if (href.includes('download') || /video|photo/i.test(text)) {
        const isVid = /video/i.test(text) || /video/i.test(title) || /\/reel(s)?\//i.test(url)
        results.push({ url: href, type: isVid ? 'video' : 'image' })
      }
    })
  }

  return results
}

async function getInstagramMedia(url) {
  // 1. Coba SaveInsta Scraper
  try {
    const res = await scrapeSaveInsta(url)
    if (res && res.length > 0) return res
  } catch (e) {
    console.warn('[Instagram SaveInsta Failed]:', e.message)
  }

  // 2. Fallback API FAA
  try {
    const faa = await axios.get(`https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`, { timeout: 15000 })
    if (faa.data?.status && faa.data?.result) {
      const res = faa.data.result
      const isVid = res.metadata?.isVideo ?? /\/reel(s)?\//i.test(url)
      const urls = res.url || []
      if (urls.length > 0) {
        return urls.map(u => ({
          url: u,
          type: isVid || /\.mp4/i.test(u) ? 'video' : 'image'
        }))
      }
    }
  } catch (e) {
    console.warn('[Instagram FAA Failed]:', e.message)
  }

  // 3. Fallback Ryzen API
  try {
    const rz = await axios.get(`https://api.ryzumi.net/api/downloader/instagram?url=${encodeURIComponent(url)}`, { timeout: 15000 })
    if (rz.data?.success && rz.data?.result) {
      const d = rz.data.result
      const list = Array.isArray(d) ? d : (d.url ? (Array.isArray(d.url) ? d.url : [d.url]) : [])
      if (list.length) {
        return list.map(item => {
          const dlUrl = typeof item === 'string' ? item : (item.url || item)
          const isVid = /video|\.mp4/i.test(dlUrl) || /\/reel(s)?\//i.test(url)
          return { url: dlUrl, type: isVid ? 'video' : 'image' }
        })
      }
    }
  } catch (e) {
    console.warn('[Instagram Ryzen Failed]:', e.message)
  }

  throw new Error('Gagal mengunduh media Instagram. Pastikan akun tidak diprivate dan tautan valid.')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan URL postingan/reel Instagram!\n> Contoh: *${usedPrefix + command} https://www.instagram.com/reel/...*`))
  }

  await m.reply(status.wait('Sedang memproses tautan Instagram...'))

  try {
    const mediaItems = await getInstagramMedia(text)
    if (!mediaItems || !mediaItems.length) throw new Error('Media tidak ditemukan.')

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i]
      const dlUrl = item.url || item
      const isVideo = item.type === 'video' || /\.mp4/i.test(dlUrl) || /video/i.test(dlUrl) || /\/reel(s)?\//i.test(text)

      const caption = `*──  ୨୧ ✧ INSTAGRAM DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
*┆* ⟡ ᴍᴇᴅɪᴀ   : *${toSmallNum(i + 1)} / ${toSmallNum(mediaItems.length)}*
*┆* ◈ ᴛɪᴘᴇ    : *${isVideo ? 'Video MP4' : 'Foto / Gambar'}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

      if (isVideo) {
        await conn.sendMessage(m.chat, {
          video: { url: dlUrl },
          mimetype: 'video/mp4',
          fileName: 'instagram.mp4',
          caption
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          image: { url: dlUrl },
          caption
        }, { quoted: m })
      }
    }
  } catch (e) {
    m.reply(status.error(`Gagal memproses media Instagram.\n> ${e?.message || e}`))
  }
}

handler.help = ['ig <url>', 'igdl <url>']
handler.tags = ['downloader']
handler.command = /^ig(dl)?$/i
handler.limit = true

export default handler