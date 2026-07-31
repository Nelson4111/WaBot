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
    form.append('files[]', img, { filename: `file-${Date.now()}.${ext}`, contentType: mime })

    let { data } = await axios.post('https://uguu.se/upload.php', form, {
      headers: { ...form.getHeaders() }
    })

    let uploadedUrl = data.files[0].url

    if (!uploadedUrl) throw new Error('Gagal upload ke Uguu')

    let apiUrl = `https://api-faa.my.id/faa/tohijab?url=${encodeURIComponent(uploadedUrl)}`

    await conn.sendMessage(m.chat, { 
      image: { url: apiUrl }, 
      caption: '✅ Berhasil diubah mengunakan Hijab' 
    }, { quoted: m })
    
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ *Gagal:* ${e.message}`)
  }
}

handler.help = ['tohijab']
handler.tags = ['maker']
handler.command = /^(tohijab)$/i

export default handler