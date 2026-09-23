import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

async function uploadToTermai(buffer) {
  const fileType = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' }
  const form = new FormData()
  form.append('file', buffer, `upload.${fileType.ext}`)

  const res = await axios.post('https://c.termai.cc/api/upload', form, {
    headers: form.getHeaders(),
    timeout: 20000
  })
  if (res.data?.status && res.data?.url) return res.data.url
  if (res.data?.url) return res.data.url
  throw new Error('Termai upload failed')
}

async function uploadToCatbox(buffer) {
  const fileType = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' }
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, `upload.${fileType.ext}`)

  const res = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    timeout: 20000
  })
  if (typeof res.data === 'string' && res.data.startsWith('http')) return res.data.trim()
  throw new Error('Catbox upload failed')
}

async function uploadImage(buffer) {
  try {
    return await uploadToTermai(buffer)
  } catch (e1) {
    return await uploadToCatbox(buffer)
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Kirim atau reply foto hitam putih:
> › *${usedPrefix + command}* (reply foto hitam putih)
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const imgBuffer = await q.download()
    if (!imgBuffer) throw new Error('Gagal mengunduh foto sumber.')

    const uploadedUrl = await uploadImage(imgBuffer)

    const res = await axios.get(`https://api.ryzumi.net/api/ai/colorize?url=${encodeURIComponent(uploadedUrl)}`, {
      responseType: 'arraybuffer',
      timeout: 45000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const resultBuffer = Buffer.from(res.data)
    if (!resultBuffer || resultBuffer.length === 0) {
      throw new Error('Gagal mewarnai foto.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ᴄᴏʟᴏʀɪᴢᴇ ᴀɪ ✧ ୨୧  ──*

*╭  〔 🎨 ᴘ ᴇ ᴡ ᴀ ʀ ɴ ᴀ ᴀ ɴ  ᴏ ᴛ ᴏ ᴍ ᴀ ᴛ ɪ ꜱ 〕*
*┆* ⟡ ᴍᴏᴅᴇʟ  : *Colorize Neural Network*
*┆* ⚙ ᴋᴏɴᴛᴇɴ : *Foto Hitam Putih / Lawas*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ : *Sukses Diwarnai*
*╰───────────────*

> _Foto lawas hitam putih berhasil diwarnai secara alami oleh AI._`.trim()

    return conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mewarnai foto: ${err.message}
*╰───────────────*`)
  }
}

handler.help = ['colorize', 'warnai']
handler.tags = ['ai', 'tools']
handler.command = /^(colorize|warnai)$/i
handler.limit = true

export default handler
