import axios from "axios"
import { status, toSmallNum } from '../../lib/style.js'

async function blackhole(url) {
  const apiUrl = `https://main.api.progmore.com/?url=${encodeURIComponent(url)}`
  try {
    const res = await axios.get(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 20000
    })
    return res.data
  } catch (err) {
    return { success: false, error_message: err.message }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan tautan media!\n> Contoh: *${usedPrefix + command} https://vt.tiktok.com/...*`))
  }

  await m.reply(status.wait('Sedang memproses tautan All-in-One...'))

  let result = await blackhole(text)
  if (!result?.success || !result.download_links || result.download_links.length === 0) {
    return m.reply(status.error(`Gagal mengunduh data.\n> ${result?.error_message || "Tidak ada media yang ditemukan."}`))
  }

  for (let i = 0; i < result.download_links.length; i++) {
    const url = result.download_links[i]
    const caption = `*──  ୨୧ ✧ AIO DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
*┆* ⟡ ᴍᴇᴅɪᴀ : *${toSmallNum(i + 1)} / ${toSmallNum(result.download_links.length)}*
*┆* ◈ ᴛɪᴘᴇ  : *Video MP4*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

    await conn.sendMessage(m.chat, {
      video: { url },
      caption
    }, { quoted: m })
  }
}

handler.help = ['aio <url>']
handler.tags = ['downloader']
handler.command = /^aio$/i
handler.limit = true

export default handler