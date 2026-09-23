import axios from "axios"
import { status, toSmallNum } from '../../lib/style.js'

// ─── Scraper Fallback ────────────────────────────────────────────────────────
async function getToken() {
  const url = "https://fbdownloader.to/id"
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    },
    timeout: 10000
  })

  const regex = /k_exp="(.*?)".*?k_token="(.*?)"/s
  const match = html.match(regex)
  if (!match) throw new Error("Token tidak ditemukan")

  return {
    k_exp: match[1],
    k_token: match[2]
  }
}

async function fbScraperFallback(fbUrl) {
  const { k_exp, k_token } = await getToken()
  const payload = new URLSearchParams({
    k_exp,
    k_token,
    p: "home",
    q: fbUrl,
    lang: "id",
    v: "v2",
    W: ""
  })

  const { data } = await axios.post("https://fbdownloader.to/api/ajaxSearch", payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "Mozilla/5.0",
      "X-Requested-With": "XMLHttpRequest",
      "Origin": "https://fbdownloader.to",
      "Referer": "https://fbdownloader.to/id"
    },
    timeout: 15000
  })

  if (!data?.data) throw new Error("Gagal mengambil data video Facebook.")
  const html = data.data
  const results = []
  const rowRegex = /<td class="video-quality">(.*?)<\/td>[\s\S]*?(?:href="(.*?)"|data-videourl="(.*?)")/g
  let match
  while ((match = rowRegex.exec(html)) !== null) {
    const quality = match[1].trim()
    const url = match[2] || match[3]
    if (quality && url) results.push({ quality, url })
  }
  if (!results.length) throw new Error("Video tidak ditemukan.")
  return {
    title: 'Facebook Video',
    videoUrl: results[0].url,
    quality: results[0].quality || 'HD'
  }
}

// ─── Ryzumi Primary ──────────────────────────────────────────────────────────
async function getFacebookViaRyzumi(url) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/downloader/facebook?url=${encodeURIComponent(url)}`,
    {
      timeout: 20000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (!data?.success || !data?.result) {
    throw new Error(data?.message || 'Gagal memproses Facebook melalui server Ryzumi')
  }

  const res = data.result
  const title = (res.title || res.caption || 'Facebook Video').trim()
  const videos = res.media?.videos || []
  let selected = videos.find(v => v.quality === 'HD') || videos.find(v => v.quality === 'SD') || videos[0]
  const videoUrl = selected?.url || res.url

  if (!videoUrl) throw new Error('URL video Facebook tidak ditemukan.')

  return {
    title,
    videoUrl,
    quality: selected?.quality || 'HD',
    cover: res.cover || null
  }
}

async function fbDownloader(fbUrl) {
  // 1. Coba Ryzumi API
  try {
    const rz = await getFacebookViaRyzumi(fbUrl)
    if (rz?.videoUrl) return rz
  } catch (e) {
    console.warn('[Facebook Ryzumi failed]:', e.message)
  }

  // 2. Fallback Scraper
  return await fbScraperFallback(fbUrl)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (text || (m.quoted ? m.quoted.text : ''))?.trim()
  if (!input) {
    return m.reply(
      status.warning(
        `Masukkan tautan video Facebook!\n` +
        `> Contoh: *${usedPrefix + command} https://www.facebook.com/...*`
      )
    )
  }

  const match = input.match(/https?:\/\/(www\.)?(facebook\.com|fb\.watch)\/[^\s]+/i)
  const url = match ? match[0] : input

  await m.react('⏳')

  try {
    const result = await fbDownloader(url)

    let cleanTitle = result.title || ''
    if (cleanTitle.length > 180) {
      cleanTitle = cleanTitle.substring(0, 177) + '...'
    }

    const caption = `*──  ୨୧ ✧ FACEBOOK DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
${cleanTitle ? `*┆* ⟡ ᴊᴜᴅᴜʟ    : *${cleanTitle}*\n` : ''}*┆* ◈ ᴋᴜᴀʟɪᴛᴀꜱ : *${toSmallNum(result.quality)}*
*┆* ✧ ꜰᴏʀᴍᴀᴛ   : *Video MP4*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

    await conn.sendMessage(m.chat, {
      video: { url: result.videoUrl },
      caption,
      mimetype: 'video/mp4',
      fileName: 'facebook.mp4'
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    m.reply(status.error(`Gagal mengunduh video Facebook:\n> ${e?.message || e}`))
  }
}

handler.help = ['facebook <link>', 'fb <link>']
handler.tags = ['downloader']
handler.command = /^fb|facebook$/i
handler.limit = true

export default handler