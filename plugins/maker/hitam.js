import axios from 'axios'
import FormData from 'form-data'
import sharp from 'sharp'

async function uploadCatbox(buffer) {
  try {
    let form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, { filename: `file-${Date.now()}.jpg`, contentType: 'image/jpeg' })
    let res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: { ...form.getHeaders() },
      timeout: 15000
    })
    if (res.data && typeof res.data === 'string' && res.data.startsWith('http')) {
      return res.data.trim()
    }
  } catch (e) {}
  return null
}

async function uploadTmpfiles(buffer) {
  try {
    let form = new FormData()
    form.append('file', buffer, { filename: `file-${Date.now()}.jpg`, contentType: 'image/jpeg' })
    let res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
      headers: { ...form.getHeaders() },
      timeout: 15000
    })
    if (res.data?.data?.url) {
      return res.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    }
  } catch (e) {}
  return null
}

async function fetchHitamApi(imageUrl) {
  let endpoints = [
    `https://api-faa.my.id/faa/tohitam?url=${encodeURIComponent(imageUrl)}`
  ]

  for (let url of endpoints) {
    try {
      let res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      })
      if (res.status === 200 && res.data && res.data.byteLength > 1000) {
        return Buffer.from(res.data)
      }
    } catch (e) {
      console.error(`Endpoint API error (${url}):`, e.response?.status || e.message)
    }
  }
  return null
}

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''

  if (!/image/.test(mime)) return m.reply(`Kirim atau balas gambar dengan perintah *${usedPrefix + command}*`)

  await m.react('🏿')

  try {
    let img = await q.download()
    if (!img) throw new Error('Gagal mengunduh gambar dari chat.')

    // Konversi gambar ke format JPEG murni terlebih dahulu (mencegah error 500 akibat format webp/sticker)
    let jpegBuffer
    try {
      jpegBuffer = await sharp(img).toFormat('jpeg').toBuffer()
    } catch (e) {
      jpegBuffer = img
    }
    
    // Upload gambar ke Catbox (Primary) atau Tmpfiles (Fallback)
    let uploadedUrl = await uploadCatbox(jpegBuffer)
    if (!uploadedUrl) {
      uploadedUrl = await uploadTmpfiles(jpegBuffer)
    }

    if (!uploadedUrl) throw new Error('Gagal mengunggah gambar ke server uploader.')

    // Ambil hasil filter dari API online secara aman
    let resultBuffer = await fetchHitamApi(uploadedUrl)
    
    // Coba ulang sekali jika request pertama mengalami timeout/glitch
    if (!resultBuffer) {
      await new Promise(r => setTimeout(r, 1500))
      resultBuffer = await fetchHitamApi(uploadedUrl)
    }

    if (!resultBuffer) {
      throw new Error('Server API tohitam sedang mengalami penumpukan antrean/down. Silakan coba beberapa saat lagi.')
    }

    await conn.sendMessage(m.chat, { 
      image: resultBuffer, 
      caption: 'Done 🏿' 
    }, { quoted: m })
    
    await m.react('✅')
  } catch (e) {
    console.error('Hitamkan API Error:', e)
    await m.react('❌')
    m.reply(`❌ *Gagal memproses gambar:* ${e.message || e}`)
  }
}

handler.help = ['hitamkan', 'tohitam']
handler.tags = ['maker']
handler.command = /^(hitamkan|tohitam)$/i
handler.limit = true

export default handler