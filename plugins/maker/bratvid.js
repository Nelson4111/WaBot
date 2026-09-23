import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan teks:
> › *${usedPrefix + command}* <teks>
>
> Contoh:
> › *${usedPrefix + command} avelia berjalan*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let buffer = null
    // 1. Primary: Ryzumi Animated Brat API
    try {
      const res = await axios.get(`https://api.ryzumi.net/api/image/brat/animated?text=${encodeURIComponent(text.trim())}`, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      buffer = Buffer.from(res.data)
    } catch (e1) {
      // 2. Fallback: Siputzx Animated Brat
      const url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(text.trim())}`
      const resFallback = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      buffer = Buffer.from(resFallback.data)
    }

    if (!buffer || buffer.length === 0) {
      throw new Error('Gagal menghasilkan animasi teks Brat.')
    }

    const stickerBuffer = await createSticker(buffer, {
      type: StickerTypes.FULL,
      pack: global.stickpack || global.namebot || 'Avelia Pack',
      author: global.stickauth || global.author || 'Nenel',
      categories: ['✨'],
      id: '.',
      quality: 70,
      background: null
    })

    await conn.sendFile(m.chat, stickerBuffer, 'bratvid.webp', '', m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal membuat stiker animasi Brat: ${e.message}
*╰───────────────*`)
  }
}

handler.help = ['bratvid <teks>', 'bratgif <teks>']
handler.tags = ['sticker', 'maker']
handler.command = /^(bratvid|bratgif)$/i
handler.limit = true

export default handler