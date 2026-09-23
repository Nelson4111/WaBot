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

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  const nominal = args[0]?.replace(/[^0-9]/g, '')
  if (!nominal || parseInt(nominal) <= 0) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Kirim/reply gambar QRIS dengan nominal:
> › *${usedPrefix + command}* <nominal> (sambil reply foto QRIS)
>
> Contoh:
> › *${usedPrefix + command} 25000*
*╰───────────────*`)
  }

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Mohon reply gambar barcode/kode QRIS yang ingin diubah nominalnya.\n*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const imgBuffer = await q.download()
    if (!imgBuffer) throw new Error('Gagal mengunduh gambar QRIS.')

    const uploadedUrl = await uploadImage(imgBuffer)

    const res = await axios.get(`https://api.ryzumi.net/api/tool/qris-converter?url=${encodeURIComponent(uploadedUrl)}&nominal=${nominal}`, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const resultBuffer = Buffer.from(res.data)
    if (!resultBuffer || resultBuffer.length === 0) {
      throw new Error('Gagal memproses konversi QRIS dinamis.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ Qʀɪꜱ ᴅʏɴᴀᴍɪᴄ ᴄᴏɴᴠᴇʀᴛᴇʀ ✧ ୨୧  ──*

*╭  〔 💳 ɪ ɴ ꜰ ᴏ  ᴘ ᴇ ᴍ ʙ ᴀ ʏ ᴀ ʀ ᴀ ɴ 〕*
*┆* ⟡ ɴᴏᴍɪɴᴀʟ  : *Rp ${toSmallNum(Number(nominal).toLocaleString('id-ID'))}*
*┆* ⚙ ᴛɪᴘᴇ     : *QRIS Dinamis (Auto-Fill Nominal)*
*┆* ⏱ ᴡᴀᴋᴛᴜ    : *${toSmallNum(new Date().toLocaleTimeString('id-ID'))} WIB*
*╰───────────────*

> _Scan QR Code di atas menggunakan BCA, Mandiri, GoPay, DANA, OVO, ShopeePay, dll._`.trim()

    return conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.error || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mengonversi QRIS: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['qris <nominal>']
handler.tags = ['tools']
handler.command = /^(qris|qrisconvert|dynamicqris)$/i
handler.limit = true

export default handler
