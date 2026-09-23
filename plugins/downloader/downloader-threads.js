import axios from 'axios'
import { status, toSmallNum } from '../../lib/style.js'

async function getThreadsMedia(url) {
  // 1. Coba Ryzumi API (Utama)
  try {
    const res = await axios.get(
      `https://api.ryzumi.net/api/downloader/threads?url=${encodeURIComponent(url)}`,
      {
        timeout: 20000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )
    if (res.data?.success && res.data?.result) {
      const r = res.data.result
      const title = (r.title || r.caption || 'Threads Media').trim()
      const mediaList = Array.isArray(r.media) ? r.media : []
      if (mediaList.length) {
        return {
          title,
          cover: r.cover || null,
          items: mediaList.map(m => ({
            url: m.url,
            type: m.type === 'video' || /\.mp4/i.test(m.url) ? 'video' : 'image'
          }))
        }
      }
    }
  } catch (e) {
    console.warn('[Threads Ryzumi failed]:', e.message)
  }

  // 2. Fallback secondary API
  try {
    const res2 = await axios.get(`https://api.siputzx.my.id/api/d/threads?url=${encodeURIComponent(url)}`, { timeout: 15000 })
    if (res2.data?.status && res2.data?.data) {
      const data = res2.data.data
      const rawItems = Array.isArray(data) ? data : (data.media || data.urls || [data])
      const items = rawItems.map(item => {
        const u = typeof item === 'string' ? item : (item.video_url || item.image_url || item.url)
        return {
          url: u,
          type: (typeof item === 'object' && item.type === 'video') || /\.mp4/i.test(u) ? 'video' : 'image'
        }
      }).filter(it => it.url)

      if (items.length) {
        return {
          title: 'Threads Media',
          cover: null,
          items
        }
      }
    }
  } catch (e) {
    console.warn('[Threads Siputzx fallback failed]:', e.message)
  }

  throw new Error('Gagal mengambil media Threads. Pastikan tautan bersifat publik dan masih aktif.')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (text || (m.quoted ? m.quoted.text : ''))?.trim()
  if (!input) {
    return m.reply(
      status.warning(
        `Masukkan URL Threads yang valid!\n` +
        `> Contoh: *${usedPrefix + command} https://www.threads.net/@...*`
      )
    )
  }

  const match = input.match(/https?:\/\/(www\.)?threads\.net\/[^\s]+/i)
  const url = match ? match[0] : input

  await m.react('⏳')

  try {
    const data = await getThreadsMedia(url)
    const items = data.items
    if (!items.length) throw new Error('Tidak ada media yang berhasil diekstrak.')

    let cleanTitle = data.title || ''
    if (cleanTitle.length > 180) {
      cleanTitle = cleanTitle.substring(0, 177) + '...'
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const caption = `*──  ୨୧ ✧ THREADS DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
${cleanTitle ? `*┆* ⟡ ᴊᴜᴅᴜʟ : *${cleanTitle}*\n` : ''}*┆* ◈ ꜱʟɪᴅᴇ : *${toSmallNum(i + 1)} / ${toSmallNum(items.length)}*
*┆* ✧ ᴛɪᴘᴇ  : *${item.type === 'video' ? 'Video MP4' : 'Foto / Gambar'}*
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
    m.reply(status.error(`Gagal memproses Threads:\n> ${e?.message || e}`))
  }
}

handler.help = ['threads <url>']
handler.command = ['threads']
handler.tags = ['downloader']
handler.limit = true

export default handler