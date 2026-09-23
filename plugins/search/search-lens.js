import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

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
> Format input salah! Kirim atau reply gambar:
> › *${usedPrefix + command}* (reply gambar)
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const imgBuffer = await q.download()
    if (!imgBuffer) throw new Error('Gagal mengunduh gambar sumber.')

    const uploadedUrl = await uploadImage(imgBuffer)

    let results = []
    try {
      const res = await axios.get(`https://api.ryzumi.net/api/search/lens?url=${encodeURIComponent(uploadedUrl)}`, {
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      results = Array.isArray(res.data?.result) ? res.data.result : (Array.isArray(res.data) ? res.data : [])
    } catch (eRyzumi) {
      // Direct Lens Search Link fallback
      const lensWebUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(uploadedUrl)}`
      return m.reply(`*──  ୨୧ ✧ ɢᴏᴏɢʟᴇ ʟᴇɴꜱ ✧ ୨୧  ──*

*╭  〔 🔍 ᴘ ᴇ ɴ ᴄ ᴀ ʀ ɪ ᴀ ɴ  ᴠ ɪ ꜱ ᴜ ᴀ ʟ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Server Lens Sedang Sibuk*
> ✦ Buka tautan visual Google Lens langsung:
> › 🔗 *${lensWebUrl}*
*╰───────────────*`)
    }

    if (results.length === 0) {
      throw new Error('Tidak ditemukan objek yang cocok di Google Lens.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const maxResults = Math.min(results.length, 5)
    const cards = []

    for (let i = 0; i < maxResults; i++) {
      const it = results[i]
      cards.push(`*╭  〔 🔍 ʜ ᴀ ꜱ ɪ ʟ  [${toSmallNum(i + 1)}] 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ   : *${it.title || '-'}*
*┆* ✧ ꜱᴜᴍʙᴇʀ  : *${it.source || '-'}*
> › 🔗 *${it.link || it.url || '-'}*
*╰───────────────*`)
    }

    const caption = `*──  ୨୧ ✧ ɢᴏᴏɢʟᴇ ʟᴇɴꜱ ꜱᴇᴀʀᴄʜ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Hasil pencarian visual kemiripan gambar dari Google Lens._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memproses Google Lens: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['lens', 'googlelens']
handler.tags = ['search', 'tools']
handler.command = /^(lens|googlelens)$/i
handler.limit = true

export default handler
