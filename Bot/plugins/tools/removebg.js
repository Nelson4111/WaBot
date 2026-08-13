import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''

  if (!/image/.test(mime))
    return m.reply(`Kirim atau balas gambar dengan *${usedPrefix + command}*`)

  await m.react('🕒')

  try {
    let img = await q.download()
    let { ext } = await fileTypeFromBuffer(img)

    let form = new FormData()
    form.append('files[]', img, { filename: `img.${ext}` })

    let up = await axios.post('https://uguu.se/upload.php', form, {
      headers: form.getHeaders()
    })

    let uploadedUrl = up.data?.files?.[0]?.url
    if (!uploadedUrl) throw 'Upload gagal'

    let api = `https://api-faa.my.id/faa/removebg?url=${encodeURIComponent(uploadedUrl)}`
    let res = await axios.get(api)

    if (!res.data?.status || !res.data?.url) throw 'Removebg gagal'

    await conn.sendMessage(
      m.chat,
      {
        image: { url: res.data.url },
        caption: '✅ Background berhasil dihapus'
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
  }
}

handler.help = ['removebg']
handler.tags = ['tools']
handler.command = /^removebg$/i

export default handler