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

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Kirim atau reply foto dengan pertanyaan:
> › *${usedPrefix + command}* <pertanyaan> (sambil reply foto)
>
> Contoh:
> › *${usedPrefix + command} Apa nama benda di gambar ini?*
> › *${usedPrefix + command} Jelaskan pakaian yang dipakai karakter ini*
*╰───────────────*`)
  }

  const query = text || 'Jelaskan gambar ini secara detail dan informatif.'

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const imgBuffer = await q.download()
    if (!imgBuffer) throw new Error('Gagal mengunduh gambar sumber.')

    const uploadedUrl = await uploadImage(imgBuffer)

    const res = await axios.get(`https://api.ryzumi.net/api/ai/vision-model?text=${encodeURIComponent(query)}&model=deepseek-v4-flash-vision-exp&image=${encodeURIComponent(uploadedUrl)}`, {
      timeout: 60000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const data = res.data
    if (!data?.success || !data?.result) {
      throw new Error(data?.message || 'Vision AI tidak dapat menganalisis gambar ini.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ᴠɪꜱɪᴏɴ ᴀɪ ✧ ୨୧  ──*

*╭  〔 👁 ᴀ ɴ ᴀ ʟ ɪ ꜱ ɪ ꜱ  ɢ ᴀ ᴍ ʙ ᴀ ʀ 〕*
*┆* ⟡ ᴍᴏᴅᴇʟ  : *DeepSeek Vision Multimodal*
*┆* ⚙ ꜱᴛᴀᴛᴜꜱ : *Analisis Berhasil*
*╰───────────────*

${data.result}`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal menganalisis gambar via Vision AI: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['vision <pertanyaan>', 'tanyafoto <pertanyaan>']
handler.tags = ['ai']
handler.command = /^(vision|tanyafoto|aivision)$/i
handler.limit = true

export default handler
