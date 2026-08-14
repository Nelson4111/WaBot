import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''

  if (!/image/.test(mime)) return m.reply(`Kirim atau balas gambar dengan perintah *${usedPrefix + command}*`)

  await m.react('⏰')

  try {
    let img = await q.download()
    let { ext } = await fileTypeFromBuffer(img)
    
    let form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', img, { filename: `file-${Date.now()}.${ext}`, contentType: mime })

    let { data: uploadedUrl } = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: { ...form.getHeaders() }
    })

    if (!uploadedUrl || typeof uploadedUrl !== 'string') throw new Error('Gagal upload ke Catbox')

    let apiUrl = `https://api-faa.my.id/faa/tofigura?url=${encodeURIComponent(uploadedUrl.trim())}`

    await conn.sendMessage(m.chat, { 
      image: { url: apiUrl }, 
      caption: '✅ Berhasil diubah menjadi Figure' 
    }, { quoted: m })
    
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ *Gagal:* ${e.message}`)
  }
}

handler.help = ['tofigure']
handler.tags = ['maker']
handler.command = /^(tofigure)$/i

export default handler