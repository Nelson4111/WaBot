import axios from 'axios'
import { status, toSmallNum } from '../../lib/style.js'

async function getVideyUrl(url) {
  // 1. Ryzumi API
  try {
    const res = await axios.get(`https://api.ryzumi.net/api/downloader/videy?url=${encodeURIComponent(url)}`, { timeout: 15000 })
    if (res.data?.directUrl) {
      return res.data.directUrl
    }
  } catch (e) {
    console.warn('[Videy Ryzumi failed]:', e.message)
  }

  // 2. Direct Fallback
  const parsed = new URL(url)
  const id = parsed.searchParams.get('id') || parsed.pathname.replace(/^\//, '')
  if (id) {
    return `https://cdn.videy.co/${id}.mp4`
  }

  throw new Error('Gagal mendapatkan URL video Videy.')
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (text || (m.quoted ? m.quoted.text : ''))?.trim()
  if (!input) {
    return m.reply(
      status.warning(
        `Masukkan tautan Videy yang valid!\n` +
        `> Contoh: *${usedPrefix + command} https://videy.co/v?id=4F2uO7k21*`
      )
    )
  }

  const match = input.match(/https?:\/\/(www\.)?videy\.co\/[^\s]+/i)
  const url = match ? match[0] : input

  await m.react('⏳')

  try {
    const videoUrl = await getVideyUrl(url)

    const caption = `*──  ୨୧ ✧ VIDEY DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ⟡ ꜱᴜᴍʙᴇʀ : *Videy.co*
*┆* ◈ ᴛɪᴘᴇ   : *Video MP4*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption,
      mimetype: 'video/mp4',
      fileName: 'videy.mp4'
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    m.reply(status.error(`Gagal mengunduh media Videy:\n> ${e?.message || e}`))
  }
}

handler.help = ['videy <url>', 'videydl <url>']
handler.tags = ['downloader']
handler.command = ['videy', 'videydl']
handler.limit = true

export default handler