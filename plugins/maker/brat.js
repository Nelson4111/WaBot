import { Sticker } from 'wa-sticker-formatter'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let content = text
  if (m.quoted && m.quoted.text) {
    content = m.quoted.text
  }

  if (!content) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan teks atau balas pesan:
> › *${usedPrefix + command}* <teks>
>
> Contoh:
> › *${usedPrefix + command} avelia bot*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let imgBuffer = null
    // 1. Primary: Ryzumi Brat API
    try {
      const res = await axios.get(`https://api.ryzumi.net/api/image/brat?text=${encodeURIComponent(content.trim())}`, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      imgBuffer = Buffer.from(res.data)
    } catch (e1) {
      // 2. Fallback: Aqul Brat HF Space
      const fallbackUrl = `https://aqul-brat.hf.space?text=${encodeURIComponent(content.trim())}`
      const resFallback = await axios.get(fallbackUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      imgBuffer = Buffer.from(resFallback.data)
    }

    if (!imgBuffer || imgBuffer.length === 0) {
      throw new Error('Gagal menghasilkan gambar Brat.')
    }

    const stiker = await createSticker(
      imgBuffer,
      null,
      global.stickpack || global.namebot || 'Avelia Pack',
      global.stickauth || global.author || 'Nenel',
      20
    )

    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'brat.webp', '', m)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } else {
      throw new Error('Gagal mengonversi ke stiker.')
    }
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal membuat stiker Brat: ${err.message}
*╰───────────────*`)
  }
}

handler.help = ['brat <teks>']
handler.tags = ['sticker', 'maker']
handler.command = /^(brat)$/i
handler.limit = true

export default handler

async function createSticker(img, url, packName, authorName, quality) {
  const stickerMetadata = {
    type: 'crop',
    pack: packName,
    author: authorName,
    quality
  }
  return (new Sticker(img || url, stickerMetadata)).toBuffer()
}