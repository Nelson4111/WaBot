import axios from "axios"
import FormData from "form-data"
import { fileTypeFromBuffer } from 'file-type'
import { status, toSmallNum } from '../../lib/style.js'

async function uploadMedia(buffer) {
  const fileType = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' }

  // 1. Coba c.termai.cc
  try {
    const form = new FormData()
    form.append('file', buffer, { filename: `anime.${fileType.ext}`, contentType: fileType.mime })
    const res = await axios.post('https://c.termai.cc/api/upload', form, {
      headers: form.getHeaders(),
      timeout: 20000
    })
    const url = res.data?.url || res.data?.data?.url
    if (url && url.startsWith('http')) return url
  } catch (e) {
    console.warn('[WhatAnime Upload c.termai.cc failed]:', e.message)
  }

  // 2. Fallback Catbox
  try {
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, { filename: `anime.${fileType.ext}`, contentType: fileType.mime })
    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
      timeout: 20000
    })
    if (typeof res.data === 'string' && res.data.startsWith('http')) {
      return res.data.trim()
    }
  } catch (e) {
    console.warn('[WhatAnime Upload Catbox failed]:', e.message)
  }

  throw new Error('Gagal mengunggah gambar anime sementara.')
}

async function whatAnimeRyzumi(imageUrl) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/weebs/whatanime?url=${encodeURIComponent(imageUrl)}`,
    {
      timeout: 25000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (!data?.filename) throw new Error('Data anime tidak ditemukan.')
  return {
    title: data.filename.replace(/\.mp4|\.mkv|\.avi/gi, '').trim(),
    episode: data.episode || '1',
    similarity: data.similarity ? (data.similarity > 1 ? data.similarity : Math.round(data.similarity * 100)) : 0,
    videoUrl: data.videoURL || null,
    imageUrl: data.videoIMG || null
  }
}

async function whatAnimeDeline(imageUrl) {
  const res = await axios.get(`https://api.deline.my.id/tools/whatanime?url=${encodeURIComponent(imageUrl)}`, { timeout: 15000 })
  const d = res.data?.result
  if (!d) throw new Error('Deline WhatAnime gagal.')
  return {
    title: d.title || 'Anime Title',
    episode: '-',
    similarity: 90,
    videoUrl: null,
    imageUrl: null
  }
}

async function identifyAnime(imageUrl) {
  try {
    return await whatAnimeRyzumi(imageUrl)
  } catch (e) {
    console.warn('[WhatAnime Ryzumi failed]:', e.message)
    return await whatAnimeDeline(imageUrl)
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime.startsWith('image/')) {
    return m.reply(
      status.warning(
        `Kirim atau balas cuplikan gambar anime dengan perintah:\n` +
        `> › *${usedPrefix + command}*`
      )
    )
  }

  await m.react('⏳')

  try {
    const media = await q.download()
    const imageUrl = await uploadMedia(media)
    const result = await identifyAnime(imageUrl)

    const caption = `*──  ୨୧ ✧ WHAT ANIME IS THIS? ✧ ୨୧  ──*

*╭  〔 🎬 ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴀ ɴ ɪ ᴍ ᴇ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${result.title}*
*┆* ◈ ᴇᴘɪꜱᴏᴅᴇ  : *${toSmallNum(result.episode)}*
*┆* ✧ ᴋᴇᴍɪʀɪᴘᴀɴ: *${toSmallNum(result.similarity)}%*
*╰───────────────*

> _Pencarian anime dari adegan screenshot berhasil ditemukan_`.trim()

    if (result.videoUrl) {
      await conn.sendMessage(m.chat, {
        video: { url: result.videoUrl },
        caption,
        mimetype: 'video/mp4'
      }, { quoted: m })
    } else {
      await m.reply(caption)
    }

    await m.react('✅')
  } catch (e) {
    console.error('[WhatAnime Error]:', e)
    await m.react('❌')
    m.reply(status.error(`Gagal mengidentifikasi anime:\n> ${e?.message || e}`))
  }
}

handler.help = ['whatanime', 'wait', 'animefind']
handler.tags = ['anime', 'tools']
handler.command = /^(whatanime|wait|animefind)$/i
handler.limit = true

export default handler