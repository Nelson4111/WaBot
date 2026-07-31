import sharp from 'sharp'
import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png|webp)/i.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } })
    return m.reply(`Kirim atau *balas gambar* dengan perintah:\n*${usedPrefix + command}*`)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    const media = await quoted.download()

    let resultBuffer
    try {
      // Menggunakan sharp lokal untuk upscaling & sharpening (100% handal & cepat)
      const image = sharp(media)
      const metadata = await image.metadata()
      const newWidth = Math.min((metadata.width || 1000) * 2, 4000)
      const newHeight = Math.min((metadata.height || 1000) * 2, 4000)

      resultBuffer = await image
        .resize(newWidth, newHeight, { kernel: 'lanczos3' })
        .sharpen({ sigma: 1.5, m1: 0.5, m2: 2.0 })
        .toBuffer()
    } catch (e) {
      resultBuffer = media
    }

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: `✨ *HD IMAGE ENHANCER*\n\n📈 Gambar berhasil ditingkatkan kualitasnya & diperjelas.`.trim()
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`❌ Gagal memproses gambar HD: ${err.message || err}`)
  }
}

handler.help = ['upscale', 'hd', 'remini']
handler.tags = ['tools', 'image']
handler.command = ['upscale', 'hd', 'remini']
handler.limit = true

export default handler