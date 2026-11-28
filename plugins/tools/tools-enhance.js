// • Feature : Enhance Image
// • Type   : Plugins ESM 
// • Source  : https://api.nekolabs.my.id
// • Author  : Hilman
import fetch from 'node-fetch'
import FormData from 'form-data'

async function uploadImageToCatbox(buffer) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, 'file.jpg')

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })

  const url = await res.text()
  if (!url.startsWith('http')) throw new Error('🍬 Gagal upload ke Catbox')
  return url.trim()
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    let url
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (/^https?:\/\//i.test(text)) {
      url = text
    } else if (mime && mime.startsWith('image/')) {
      m.reply('🍡 Lagi enhance fotonya, sabar ya...')
      let img = await q.download?.()
      if (!img) throw '🍬 Gagal download gambar.'
      url = await uploadImageToCatbox(img)
    } else {
      return m.reply(`🍢 Reply/kirim foto atau kasih link gambar dengan caption *${usedPrefix + command}*`)
    }

    const apiUrl = `https://api.nekolabs.my.id/tools/pxpic/enhance?imageUrl=${encodeURIComponent(url)}`
    const resApi = await fetch(apiUrl)
    if (!resApi.ok) throw '🍬 Gagal menghubungi server.'
    const json = await resApi.json()
    if (!json.status) throw '🍬 Gagal memproses gambar.'

    const hasil = json.result
    await conn.sendFile(m.chat, hasil, 'enhance.png', '🍭 Nih hasil fotonya udah lebih tajem!', m)
  } catch (e) {
    console.error(e)
    m.reply('🍬 Terjadi kesalahan saat enhance gambar.')
  }
}

handler.help = ['enhance']
handler.tags = ['tools']
handler.command = /^enhance$/i
handler.limit = false

handler.desc = 'Alat utilitas praktis untuk memproses enhance.'
handler.tutorial = [
  '.enhance <input>',
  'Ketik .enhance diikuti input yang diperlukan atau balas pesan target'
]

export default handler