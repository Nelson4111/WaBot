import axios from "axios"
import * as cheerio from "cheerio"
import { status, toSmallNum } from '../../lib/style.js'

// ─── Ryzumi Primary ──────────────────────────────────────────────────────────
async function twitterRyzumi(url) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/downloader/twitter?url=${encodeURIComponent(url)}`,
    {
      timeout: 20000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (!data?.media || !data.media.length) {
    throw new Error('Media tidak ditemukan di respon Ryzumi.')
  }

  const text = (data.text || '').trim()
  const author = data.user?.name || data.user?.username || ''
  const likes = data.likes || 0
  const retweets = data.retweets || 0

  const items = data.media.map(m => ({
    type: m.type === 'video' || /\.mp4/i.test(m.url) ? 'video' : 'image',
    url: m.url
  }))

  return {
    source: 'Ryzumi',
    text,
    author,
    likes,
    retweets,
    items
  }
}

// ─── Scraper Fallback (X2Twitter) ───────────────────────────────────────────
async function twitterScraper(url) {
  const base_url = "https://x2twitter.com"
  const base_headers = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9,id;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "x-requested-with": "XMLHttpRequest",
    Referer: "https://x2twitter.com/en"
  }

  const tokenRes = await axios.post(
    `${base_url}/api/userverify`,
    new URLSearchParams({ url }).toString(),
    { headers: base_headers, timeout: 15000 }
  )
  const token = tokenRes.data?.token
  if (!token) throw new Error("Token verifikasi X2Twitter kosong.")

  const r = await axios.post(
    `${base_url}/api/ajaxSearch`,
    new URLSearchParams({ q: url, lang: "id", cftoken: token }).toString(),
    { headers: base_headers, timeout: 15000 }
  ).then(v => v.data)

  if (r.status !== "ok" || !r.data) throw new Error(r.msg || "Media tidak ditemukan.")
  const $ = cheerio.load(r.data)

  const items = []
  $(".dl-action p a").each((_, el) => {
    const href = $(el).attr("href")
    if (href) items.push({ type: 'video', url: href })
  })
  $("ul.download-box li a").each((_, el) => {
    const href = $(el).attr("href")
    if (href) items.push({ type: 'image', url: href })
  })

  if (!items.length) throw new Error("Tidak ada media.")

  return {
    source: 'X2Twitter',
    text: '',
    author: '',
    likes: 0,
    retweets: 0,
    items
  }
}

async function getTwitterMedia(url) {
  try {
    const rz = await twitterRyzumi(url)
    if (rz?.items?.length) return rz
  } catch (e) {
    console.warn('[Twitter Ryzumi failed]:', e.message)
  }
  return await twitterScraper(url)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (text || (m.quoted ? m.quoted.text : ''))?.trim()
  if (!input) {
    return m.reply(
      status.warning(
        `Masukkan URL X / Twitter yang valid!\n` +
        `> Contoh: *${usedPrefix + command} https://x.com/.../status/...*`
      )
    )
  }

  const match = input.match(/https?:\/\/(www\.)?(twitter\.com|x\.com)\/[^\s]+/i)
  const url = match ? match[0] : input

  await m.react('⏳')

  try {
    const res = await getTwitterMedia(url)
    const items = res.items
    if (!items?.length) throw new Error("Media tidak ditemukan pada postingan ini.")

    let cleanText = res.text || ''
    if (cleanText.length > 180) {
      cleanText = cleanText.substring(0, 177) + '...'
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const caption = `*──  ୨୧ ✧ X (TWITTER) DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
${cleanText ? `*┆* ⟡ ᴛᴇᴋꜱ    : *${cleanText}*\n` : ''}${res.author ? `*┆* ✧ ᴀᴜᴛʜᴏʀ  : *@${res.author}*\n` : ''}${res.likes ? `*┆* ᰔ ʟɪᴋᴇ    : *${toSmallNum(res.likes)}*\n` : ''}${res.retweets ? `*┆* ◈ ʀᴇᴛᴡᴇᴇᴛ : *${toSmallNum(res.retweets)}*\n` : ''}*┆* ❖ ꜱʟɪᴅᴇ   : *${toSmallNum(i + 1)} / ${toSmallNum(items.length)}*
*┆* ⌬ ᴛɪᴘᴇ    : *${item.type === 'video' ? 'Video MP4' : 'Foto / Gambar'}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

      if (item.type === 'video') {
        await conn.sendMessage(m.chat, {
          video: { url: item.url },
          caption,
          mimetype: 'video/mp4'
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          image: { url: item.url },
          caption
        }, { quoted: m })
      }
    }

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    m.reply(status.error(`Gagal memproses media Twitter / X:\n> ${e?.message || e}`))
  }
}

handler.help = ['twitter <url>', 'x <url>']
handler.tags = ['downloader']
handler.command = ['twitter', 'x']
handler.limit = true

export default handler