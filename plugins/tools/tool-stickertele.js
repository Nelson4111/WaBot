import axios from 'axios'
import { Sticker } from 'wa-sticker-formatter'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('t.me/addstickers/')) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan URL stiker pack Telegram:
> › *${usedPrefix + command}* <link_sticker_tele>
>
> Contoh:
> › *${usedPrefix + command} https://t.me/addstickers/anime*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/image/sticker-tele?url=${encodeURIComponent(text.trim())}`, {
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const pack = res.data?.stickers
    const list = Array.isArray(pack?.stickers) ? pack.stickers : []
    if (!pack || list.length === 0) {
      throw new Error('Paket stiker Telegram tidak ditemukan atau kosong.')
    }

    const maxSend = Math.min(list.length, 5)

    const caption = `*──  ୨୧ ✧ ᴛᴇʟᴇɢʀᴀᴍ ꜱᴛɪᴄᴋᴇʀ ✧ ୨୧  ──*

*╭  〔 🎭 ɪ ɴ ꜰ ᴏ  ᴘ ᴀ ᴄ ᴋ 〕*
*┆* ⟡ ɴᴀᴍᴀ ᴘᴀᴄᴋ : *${pack.title || pack.name || 'Telegram Pack'}*
*┆* ✧ ᴛᴏᴛᴀʟ ᴀᴅᴀ : *${toSmallNum(list.length)} Stiker*
*┆* ✦ ᴅɪᴋɪʀɪᴍ   : *${toSmallNum(maxSend)} Stiker Pertama*
*╰───────────────*

> _Stiker sedang dikirimkan ke chat satu per satu..._`.trim()

    await m.reply(caption)

    for (let i = 0; i < maxSend; i++) {
      const item = list[i]
      if (!item.image_url) continue

      try {
        const imgRes = await axios.get(item.image_url, { responseType: 'arraybuffer', timeout: 15000 })
        const stiker = await (new Sticker(Buffer.from(imgRes.data), {
          type: 'crop',
          pack: global.stickpack || pack.title || 'Avelia Pack',
          author: global.stickauth || global.author || 'Nenel',
          quality: 30
        })).toBuffer()

        await conn.sendFile(m.chat, stiker, 'tele.webp', '', m)
      } catch (errSticker) {
        console.error('Error sending single sticker:', errSticker.message)
      }
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.error || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mengunduh stiker Telegram: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['stickertele <url>', 'telesticker <url>']
handler.tags = ['tools', 'sticker']
handler.command = /^(stickertele|telesticker|stickerg)$/i
handler.limit = true

export default handler
