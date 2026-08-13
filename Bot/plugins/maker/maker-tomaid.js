import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''

  if (!/image/.test(mime)) return m.reply(`Kirim atau balas gambar dengan perintah *${usedPrefix + command}*`)

  await m.reply('⏳ Mohon tunggu...')

  try {
    let img = await q.download()
    let { ext } = await fileTypeFromBuffer(img)
    
    let form = new FormData()
    form.append('file', img, { filename: `file-${Date.now()}.${ext}`, contentType: mime })

    let { data: uploadRes } = await axios.post('https://cloudkuimages.guru/upload.php', form, {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Referer': 'https://cloudkuimages.guru/'
      }
    })

    let uploadedUrl = uploadRes.url || uploadRes.link || (uploadRes.data && uploadRes.data.url)
    
    if (!uploadedUrl) {
        let match = JSON.stringify(uploadRes).match(/https?:\/\/[^" ]+/g)
        uploadedUrl = match ? match[0] : null
    }

    if (!uploadedUrl) throw new Error('Gagal upload gambar.')

    let apiUrl = `https://api-faa.my.id/faa/tomaid?url=${encodeURIComponent(uploadedUrl)}`

    await conn.sendMessage(m.chat, { 
      image: { url: apiUrl }, 
      caption: '✅ Berhasil diubah menjadi Maid!' 
    }, { quoted: m })
    
  } catch (e) {
    console.error(e)
    m.reply(`❌ *Gagal:* ${e.message}`)
  }
}

handler.help = ['tomaid']
handler.tags = ['maker']
handler.command = /^(tomaid)$/i
handler.premium = true

export default handler