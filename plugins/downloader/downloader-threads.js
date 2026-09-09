import axios from 'axios'
import { status, toSmallNum } from '../../lib/style.js'

async function getThreadsMedia(url) {
  // 1. Coba Ryzen API
  try {
    const res = await axios.get(`https://api.ryzumi.net/api/downloader/threads?url=${encodeURIComponent(url)}`, { timeout: 15000 })
    if (res.data?.success && res.data?.result) {
      return res.data.result
    }
    if (res.data?.data) {
      return res.data.data
    }
  } catch (e) {
    console.warn('[Threads Ryzen failed]:', e.message)
  }

  // 2. Fallback secondary API
  try {
    const res2 = await axios.get(`https://api.siputzx.my.id/api/d/threads?url=${encodeURIComponent(url)}`, { timeout: 15000 })
    if (res2.data?.status && res2.data?.data) {
      return res2.data.data
    }
  } catch {}

  throw new Error('Gagal mengambil media Threads. Pastikan tautan bersifat publik dan masih aktif.')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan URL Threads yang valid!\n> Contoh: *${usedPrefix + command} https://www.threads.net/@...*`))
  }

  await m.reply(status.wait('Sedang memproses tautan Threads...'))

  try {
    const data = await getThreadsMedia(text)

    // Handle array of media or single media
    const items = Array.isArray(data) ? data : (data.media || data.urls || [data])
    let sent = false

    for (let item of items) {
      const videoUrl = typeof item === 'string' ? (item.endsWith('.mp4') ? item : null) : (item.video_url || item.download_url || item.url)
      const imageUrl = typeof item === 'string' ? (!item.endsWith('.mp4') ? item : null) : (item.image_url || item.url)

      if (videoUrl && (item.type === 'video' || videoUrl.includes('.mp4') || !imageUrl)) {
        await conn.sendMessage(m.chat, {
          video: { url: videoUrl },
          caption: `*──  ୨୧ ✧ THREADS DOWNLOADER ✧ ୨୧  ──*\n\n> _Video berhasil diunduh_`
        }, { quoted: m })
        sent = true
      } else if (imageUrl) {
        await conn.sendButtonV2(m.chat, {
          title: '⛩️ THREADS DOWNLOADER',
          subtitle: 'Avelia • Media Service',
          text: `*──  ୨୧ ✧ THREADS DOWNLOADER ✧ ୨୧  ──*\n\n> _Gambar berhasil diunduh_`,
          footer: `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`,
          buffer: imageUrl,
          buttons: [
            ['📜 Menu Utama', `${usedPrefix}menu`]
          ]
        }, m)
        sent = true
      }
    }

    if (!sent) throw new Error('Tidak ada media yang berhasil diekstrak.')
  } catch (e) {
    m.reply(status.error(`Gagal memproses Threads.\n> ${e?.message || e}`))
  }
}

handler.help = ['threads <url>']
handler.command = ['threads']
handler.tags = ['downloader']
handler.limit = true

export default handler