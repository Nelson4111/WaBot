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

  $('.download-box li, .download-items').each((_, el) => {
    const dlBtn = $(el).find('a[title*="Download"], a.download-items__btn, a.btn-download').attr('href')
    const thumb = $(el).find('img').attr('src')
    if (dlBtn && dlBtn.startsWith('http')) {
      results.push({ url: dlBtn, thumb })
    }
  })

  // Fallback direct anchor scan
  if (!results.length) {
    $('a[href^="http"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href.includes('download') || /video|photo/i.test($(el).text())) {
        results.push({ url: href })
      }
    })
  }

  return results
}

async function getInstagramMedia(url) {
  // 1. Coba SaveInsta Scraper
  try {
    const res = await scrapeSaveInsta(url)
    if (res && res.length > 0) return res.map(r => r.url)
  } catch (e) {
    console.warn('[Instagram SaveInsta Failed]:', e.message)
  }

  // 2. Fallback Ryzen API
  try {
    const rz = await axios.get(`https://api.ryzumi.net/api/downloader/instagram?url=${encodeURIComponent(url)}`, { timeout: 15000 })
    if (rz.data?.success && rz.data?.result) {
      const d = rz.data.result
      if (Array.isArray(d)) return d.map(x => x.url || x)
      if (d.url) return Array.isArray(d.url) ? d.url : [d.url]
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
    const mediaUrls = await getInstagramMedia(text)
    if (!mediaUrls || !mediaUrls.length) throw new Error('Media tidak ditemukan.')

    for (let i = 0; i < mediaUrls.length; i++) {
      const dlUrl = mediaUrls[i]
      const isVideo = /\.mp4/i.test(dlUrl) || dlUrl.includes('video')

      const caption = `*──  ୨୧ ✧ INSTAGRAM DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
*┆* ⟡ ᴍᴇᴅɪᴀ   : *${toSmallNum(i + 1)} / ${toSmallNum(mediaUrls.length)}*
*┆* ◈ ᴛɪᴘᴇ    : *${isVideo ? 'Video MP4' : 'Foto / Gambar'}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

      if (isVideo) {
        await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption }, { quoted: m })
      } else {
        await conn.sendButtonV2(m.chat, {
          title: '⛩️ INSTAGRAM MEDIA',
          subtitle: 'Avelia • Media Service',
          text: caption,
          footer: `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`,
          buffer: dlUrl,
          buttons: [
            ['📜 Menu Utama', `${usedPrefix}menu`]
          ]
        }, m)
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