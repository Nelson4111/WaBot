import axios from 'axios'
import FormData from 'form-data'
import fetch from 'node-fetch'

let handler = async (m, { conn, command, usedPrefix }) => {
  try {
    await m.react('😡')
    let q = m.quoted
    let mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) return m.reply(`Reply gambar dengan caption *${usedPrefix + command}*`)

    let media = await q.download()
    let form = new FormData()
    form.append('files[]', media, { filename: 'upload.' + mime.split('/')[1] })
    let upload = await axios.post('https://uguu.se/upload.php', form, { headers: form.getHeaders() })
    let imageUrl = upload.data.files[0].url
    if (!imageUrl) throw 'Gagal upload ke Uguu!'

    let apiUrl = `https://api-faa.my.id/faa/tohitam?url=${encodeURIComponent(imageUrl)}`
    let res = await fetch(apiUrl)
    if (!res.ok) throw 'Gagal menghubungi API!'
    let buffer = await res.arrayBuffer()

    await conn.sendFile(m.chat, Buffer.from(buffer), 'hitamkan.jpg', 'Done 😹', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan!')
  }
}

handler.help = ['hitamkan']
handler.tags = ['ai', 'maker']
handler.command = /^(hitamkan)$/i
handler.limit = true
export default handler