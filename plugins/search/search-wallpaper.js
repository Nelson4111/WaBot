import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan karakter / judul anime:
> › *${usedPrefix + command}* <query_anime>
>
> Contoh:
> › *${usedPrefix + command} Frieren*
> › *${usedPrefix + command} Cyberpunk Edgerunners*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/search/wallpaper-moe?query=${encodeURIComponent(text.trim())}`, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const list = Array.isArray(res.data?.result) ? res.data.result : []
    if (list.length === 0) {
      throw new Error(`Wallpaper untuk "${text}" tidak ditemukan.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const item = list[Math.floor(Math.random() * list.length)]

    const caption = `*──  ୨୧ ✧ ᴡᴀʟʟᴘᴀᴘᴇʀ ᴀɴɪᴍᴇ ✧ ୨୧  ──*

*╭  〔 🖼 ɪ ɴ ꜰ ᴏ  ᴡ ᴀ ʟ ʟ ᴘ ᴀ ᴘ ᴇ ʀ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ : *${item.title || text}*
*┆* ◈ ᴛᴏᴛᴀʟ : *${toSmallNum(list.length)} Hasil Tersedia*
> › 🔗 *${item.link || '-'}*
*╰───────────────*

> _Koleksi wallpaper anime resolusi tinggi dari MoeWalls._`.trim()

    return conn.sendMessage(m.chat, {
      image: { url: item.wallpaper },
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat wallpaper: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['wpmoe <query>', 'wallpaperanime <query>']
handler.tags = ['anime', 'search']
handler.command = /^(wpmoe|wallpaperanime|wpanime)$/i
handler.limit = true

export default handler
