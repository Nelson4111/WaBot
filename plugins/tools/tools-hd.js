import axios from 'axios'
import sharp from 'sharp'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'
import { status, toSmallNum } from '../../lib/style.js'

// ─── Temporary Uploader Helper ──────────────────────────────────────────────
async function uploadMedia(buffer) {
  const fileType = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' }

  // 1. Coba c.termai.cc
  try {
    const form = new FormData()
    form.append('file', buffer, { filename: `media.${fileType.ext}`, contentType: fileType.mime })
    const res = await axios.post('https://c.termai.cc/api/upload', form, {
      headers: form.getHeaders(),
      timeout: 20000
    })
    const url = res.data?.url || res.data?.data?.url
    if (url && url.startsWith('http')) return url
  } catch (e) {
    console.warn('[HD Upload c.termai.cc failed]:', e.message)
  }

  // 2. Fallback Deline
  try {
    const form = new FormData()
    form.append('file', buffer, { filename: `media.${fileType.ext}`, contentType: fileType.mime })
    const res = await axios.post('https://api.deline.web.id/uploader', form, {
      headers: form.getHeaders(),
      timeout: 20000
    })
    const url = res.data?.result?.url || res.data?.url
    if (url && url.startsWith('http')) return url
  } catch (e) {
    console.warn('[HD Upload Deline failed]:', e.message)
  }

  // 3. Fallback Catbox
  try {
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, { filename: `media.${fileType.ext}`, contentType: fileType.mime })
    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
      timeout: 20000
    })
    if (typeof res.data === 'string' && res.data.startsWith('http')) {
      return res.data.trim()
    }
  } catch (e) {
    console.warn('[HD Upload Catbox failed]:', e.message)
  }

  throw new Error('Gagal mengunggah gambar sementara untuk proses AI.')
}

async function enhanceWithRyzumi(imageUrl, isRemini = true) {
  const endpoint = isRemini
    ? `https://api.ryzumi.net/api/ai/remini?url=${encodeURIComponent(imageUrl)}`
    : `https://api.ryzumi.net/api/ai/upscaler?url=${encodeURIComponent(imageUrl)}`

  const res = await axios.get(endpoint, {
    responseType: 'arraybuffer',
    timeout: 35000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  if (res.status === 200 && res.data?.byteLength > 1000) {
    return Buffer.from(res.data)
  }
  throw new Error('Respons AI Remini kosong.')
}

async function enhanceWithSharp(buffer) {
  const image = sharp(buffer)
  const metadata = await image.metadata()
  const newWidth = Math.min((metadata.width || 1000) * 2, 4000)
  const newHeight = Math.min((metadata.height || 1000) * 2, 4000)

  return await image
    .resize(newWidth, newHeight, { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.5, m1: 0.5, m2: 2.0 })
    .toBuffer()
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png|webp)/i.test(mime)) {
    return m.reply(
      status.warning(
        `Kirim atau balas gambar dengan perintah:\n` +
        `> › *${usedPrefix + command}*`
      )
    )
  }

  await m.react('⏳')

  try {
    const media = await quoted.download()
    let resultBuffer = null
    let engine = 'Ryzumi Remini AI'

    // 1. Coba Ryzumi AI Remini / Upscaler
    try {
      const uploadedUrl = await uploadMedia(media)
      resultBuffer = await enhanceWithRyzumi(uploadedUrl, command.toLowerCase() === 'remini')
    } catch (e) {
      console.warn('[Ryzumi Remini failed, fallback to Sharp]:', e.message)
      resultBuffer = await enhanceWithSharp(media)
      engine = 'Sharp Lanczos3 Engine'
    }

    const caption = `*──  ୨୧ ✧ HD IMAGE ENHANCER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ɢ ᴀ ᴍ ʙ ᴀ ʀ 〕*
*┆* ⟡ ᴍᴇᴛᴏᴅᴇ   : *${engine}*
*┆* ◈ ᴋᴜᴀʟɪᴛᴀꜱ : *Ultra HD (Enhanced)*
*┆* ✧ ꜱᴛᴀᴛᴜꜱ   : *Berhasil Diperjelas ❖*
*╰───────────────*

> _Gambar berhasil ditingkatkan kualitasnya_`.trim()

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption
    }, { quoted: m })

    await m.react('✅')
  } catch (err) {
    console.error('[HD Error]:', err)
    await m.react('❌')
    m.reply(status.error(`Gagal meningkatkan resolusi gambar:\n> ${err.message || err}`))
  }
}

handler.help = ['hd', 'remini', 'upscale']
handler.tags = ['tools', 'ai']
handler.command = /^(hd|remini|upscale)$/i
handler.limit = true

export default handler