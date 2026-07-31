import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''

  if (!/image/.test(mime)) return m.reply(`Kirim atau balas gambar dengan perintah *${usedPrefix + command} <nama artis>*`)
  if (!text) return m.reply(`Masukkan nama artisnya!\nContoh: *${usedPrefix + command} JKT48*`)

  await m.reply('⏳ Sedang memproses foto bersama...')

  try {
    let img = await q.download()
    let { ext } = await fileTypeFromBuffer(img)
    
    let form = new FormData()
    form.append('file', img, { filename: `file-${Date.now()}.${ext}`, contentType: mime })

    let { data: uploadRes } = await axios.post('https://cloudkuimages.guru/upload.php', form, {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    })

    let uploadedUrl = uploadRes.url || uploadRes.link || (uploadRes.data && uploadRes.data.url)
    if (!uploadedUrl) {
        let match = JSON.stringify(uploadRes).match(/https?:\/\/[^" ]+/g)
        uploadedUrl = match ? match[0] : null
    }

    if (!uploadedUrl) throw new Error('Gagal upload gambar.')

    // PERBAIKAN: Parameter disesuaikan menjadi nama-artis
    let apiUrl = `https://api-faa.my.id/faa/tobersama?url=${encodeURIComponent(uploadedUrl)}&nama-artis=${encodeURIComponent(text)}`

    await conn.sendMessage(m.chat, { 
      image: { url: apiUrl }, 
      caption: `✅ Berhasil foto bersama *${text}*` 
    }, { quoted: m })
    
  } catch (e) {
    console.error(e)
    m.reply(`❌ *Gagal:* ${e.message}`)
  }
}

handler.help = ['tobersama <nama artis>']
handler.tags = ['maker']
handler.command = /^(tobersama)$/i
handler.premium = true

export default handler