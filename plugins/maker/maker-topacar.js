import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''

  if (!/image/.test(mime)) return m.reply(`Kirim atau balas gambar dengan perintah *${usedPrefix + command}*`)

  await m.reply('Sedang memproses, mohon tunggu...')

  try {
    let img = await q.download()
    let { ext } = await fileTypeFromBuffer(img)
    
    let form1 = new FormData()
    form1.append('file', img, { filename: `file-${Date.now()}.${ext}`, contentType: mime })

    let { data } = await axios.post('https://cloudkuimages.guru/upload.php', form1, {
      headers: {
        ...form1.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Referer': 'https://cloudkuimages.guru/'
      }
    })

    let uploadedUrl = data.url || data.link || (data.data && data.data.url) || (Array.isArray(data) && data[0].url)
    
    if (!uploadedUrl) {
        let match = JSON.stringify(data).match(/https?:\/\/[^" ]+/g)
        uploadedUrl = match ? match[0] : null
    }

    if (!uploadedUrl) throw new Error('Gagal mengunggah gambar ke server penyimpanan.')

    let apiUrl = `https://api-faa.my.id/faa/topacar?url=${encodeURIComponent(uploadedUrl)}`

    await conn.sendMessage(m.chat, { 
      image: { url: apiUrl }, 
      caption: '✅ Berhasil' 
    }, { quoted: m })
    
  } catch (e) {
    console.error(e)
    m.reply(`❌ *Gagal:* ${e.message}`)
  }
}

handler.help = ['topacar']
handler.tags = ['maker']
handler.command = /^(topacar)$/i
handler.premium = true

export default handler