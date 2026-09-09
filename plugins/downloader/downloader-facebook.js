import axios from "axios"
import { status, toSmallNum } from '../../lib/style.js'

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

async function fbDownloader(fbUrl) {
  try {
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

    if (data?.data) {
      const html = data.data
      const results = []
      const rowRegex = /<td class="video-quality">(.*?)<\/td>[\s\S]*?(?:href="(.*?)"|data-videourl="(.*?)")/g
      let match
      while ((match = rowRegex.exec(html)) !== null) {
        const quality = match[1].trim()
        const url = match[2] || match[3]
        if (quality && url) results.push({ quality, url })
      }
      if (results.length > 0) return results
    }
  } catch (e) {
    console.warn('[FBDownloader.to failed]:', e.message)
  }

  // Fallback ke Ryzen Facebook API
  try {
    const rz = await axios.get(`https://api.ryzumi.net/api/downloader/facebook?url=${encodeURIComponent(fbUrl)}`, { timeout: 15000 })
    if (rz.data?.success && rz.data?.result?.url) {
      return [{
        quality: 'HD / SD',
        url: rz.data.result.url
      }]
    }
  } catch (e) {
    console.warn('[FB Ryzen Fallback failed]:', e.message)
  }

  throw new Error("Gagal mengambil data video Facebook.")
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan tautan video Facebook!\n> Contoh: *${usedPrefix + command} https://www.facebook.com/...*`))
  }

  await m.reply(status.wait('Sedang memproses tautan Facebook...'))

  try {
    const results = await fbDownloader(text)
    if (!results.length) throw new Error("Tidak ada video yang ditemukan.")

    const videoUrl = results[0].url
    const quality = results[0].quality || 'HD'

    const caption = `*──  ୨୧ ✧ FACEBOOK DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ◈ ᴋᴜᴀʟɪᴛᴀꜱ : *${toSmallNum(quality)}*
*┆* ⟡ ꜰᴏʀᴍᴀᴛ   : *Video MP4*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption
    }, { quoted: m })

  } catch (e) {
    m.reply(status.error(`Gagal mengunduh video Facebook:\n> ${e?.message || e}`))
  }
}

handler.help = ['facebook <link>', 'fb <link>']
handler.tags = ['downloader']
handler.command = /^fb|facebook$/i
handler.limit = true

export default handler