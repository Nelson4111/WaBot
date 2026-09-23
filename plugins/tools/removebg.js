import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'
import { status } from '../../lib/style.js'

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
    console.warn('[RemoveBG Upload c.termai.cc failed]:', e.message)
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
    console.warn('[RemoveBG Upload Deline failed]:', e.message)
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
    console.warn('[RemoveBG Upload Catbox failed]:', e.message)
  }

  throw new Error('Gagal mengunggah gambar sementara.')
}

async function removeBgRyzumi(imageUrl) {
  const res = await axios.get(`https://api.ryzumi.net/api/ai/removebg?url=${encodeURIComponent(imageUrl)}`, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  if (res.status === 200 && res.data?.byteLength > 1000) {
    return Buffer.from(res.data)
  }
  throw new Error('Respons RemoveBG Ryzumi kosong.')
}

async function removeBgFAA(imageUrl) {
  const res = await axios.get(`https://api-faa.my.id/faa/removebg?url=${encodeURIComponent(imageUrl)}`, { timeout: 20000 })
  if (res.data?.status && res.data?.url) {
    const imgRes = await axios.get(res.data.url, { responseType: 'arraybuffer', timeout: 20000 })
    return Buffer.from(imgRes.data)
  }
  throw new Error('Fallback FAA RemoveBG gagal.')
}

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''

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
    let img = await q.download()
    let uploadedUrl = await uploadMedia(img)

    let resultBuffer = null
    try {
      resultBuffer = await removeBgRyzumi(uploadedUrl)
    } catch (e) {
      console.warn('[RemoveBG Ryzumi failed]:', e.message)
      resultBuffer = await removeBgFAA(uploadedUrl)
    }

    const caption = `*──  ୨୧ ✧ REMOVE BACKGROUND ✧ ୨୧  ──*

*╭  〔 ✦ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ 〕*
*┆* ⟡ ᴍᴇᴛᴏᴅᴇ : *AI Background Remover*
*┆* ◈ ꜰᴏʀᴍᴀᴛ : *PNG Transparan*
*┆* ✧ ʜᴀꜱɪʟ  : *Berhasil Dihapus ❖*
*╰───────────────*

> _Latar belakang gambar berhasil dihapus_`.trim()

    await conn.sendMessage(
      m.chat,
      {
        image: resultBuffer,
        caption
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error('[RemoveBG Error]:', e)
    await m.react('❌')
    m.reply(status.error(`Gagal menghapus latar belakang gambar:\n> ${e?.message || e}`))
  }
}

handler.help = ['removebg', 'nobg']
handler.tags = ['tools', 'ai']
handler.command = /^(removebg|nobg)$/i
handler.limit = true

export default handler