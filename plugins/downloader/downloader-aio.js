import axios from "axios"
import { status, toSmallNum } from '../../lib/style.js'

// ─── Ryzumi Primary ──────────────────────────────────────────────────────────
async function getAioViaRyzumi(url) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/downloader/all-in-one?url=${encodeURIComponent(url)}`,
    {
      timeout: 20000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (!data?.medias || !data.medias.length) {
    throw new Error('Tidak ada media yang ditemukan.')
  }

  return {
    source: data.source || 'Online',
    title: (data.title || 'Media').trim(),
    author: data.author?.name || data.author?.username || '',
    medias: data.medias
  }
}

// ─── Blackhole Fallback ──────────────────────────────────────────────────────
async function blackhole(url) {
  const apiUrl = `https://main.api.progmore.com/?url=${encodeURIComponent(url)}`
  try {
    const res = await axios.get(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 20000
    })
    if (res.data?.success && res.data.download_links?.length) {
      return {
        source: 'Progmore',
        title: 'Media Download',
        author: '',
        medias: res.data.download_links.map(l => ({ url: l, type: 'video' }))
      }
    }
  } catch (err) {
    console.warn('[AIO Blackhole failed]:', err.message)
  }
  return null
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (text || (m.quoted ? m.quoted.text : ''))?.trim()
  if (!input) {
    return m.reply(
      status.warning(
        `Masukkan tautan media!\n` +
        `> Contoh: *${usedPrefix + command} https://x.com/.../status/...*`
      )
    )
  }

  const match = input.match(/https?:\/\/[^\s]+/i)
  const url = match ? match[0] : input

  await m.react('⏳')

  try {
    let result = null
    try {
      result = await getAioViaRyzumi(url)
    } catch (e) {
      console.warn('[AIO Ryzumi failed]:', e.message)
      result = await blackhole(url)
    }

    if (!result || !result.medias?.length) {
      throw new Error('Semua provider gagal mengunduh media dari tautan ini.')
    }

    let cleanTitle = result.title || ''
    if (cleanTitle.length > 180) {
      cleanTitle = cleanTitle.substring(0, 177) + '...'
    }

    const total = result.medias.length
    for (let i = 0; i < total; i++) {
      const item = result.medias[i]
      const isVideo = item.type === 'video' || /\.mp4/i.test(item.url) || item.extension === 'mp4'

      const caption = `*──  ୨୧ ✧ ALL-IN-ONE DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
${cleanTitle ? `*┆* ⟡ ᴊᴜᴅᴜʟ    : *${cleanTitle}*\n` : ''}${result.author ? `*┆* ✧ ᴀᴜᴛʜᴏʀ   : *${result.author}*\n` : ''}*┆* ◈ ꜱᴜᴍʙᴇʀ   : *${result.source}*
*┆* ❖ ᴍᴇᴅɪᴀ    : *${toSmallNum(i + 1)} / ${toSmallNum(total)}*
*┆* ⌬ ᴛɪᴘᴇ     : *${isVideo ? 'Video MP4' : 'Foto / Gambar'}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

      if (isVideo) {
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
    m.reply(status.error(`Gagal memproses media All-in-One:\n> ${e?.message || e}`))
  }
}

handler.help = ['aio <url>']
handler.tags = ['downloader']
handler.command = /^aio$/i
handler.limit = true

export default handler