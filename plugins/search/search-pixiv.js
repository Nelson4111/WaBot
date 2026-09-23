import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Gunakan:
> › *${usedPrefix + command}* <query_pencarian>
>
> Contoh:
> › *${usedPrefix + command} Hatsune Miku*
> › *${usedPrefix + command} Furina Genshin*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/search/pixiv?query=${encodeURIComponent(text.trim())}`, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const d = res.data
    const media = Array.isArray(d?.Media) ? d.Media : []
    if (!d || media.length === 0) {
      throw new Error(`Ilustrasi untuk "${text}" tidak ditemukan di Pixiv.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const tagsStr = Array.isArray(d.tags) && d.tags.length > 0 ? d.tags.slice(0, 10).join(', ') : '-'

    const caption = `*──  ୨୧ ✧ ᴘɪxɪᴠ ɪʟʟᴜꜱᴛʀᴀᴛɪᴏɴ ✧ ୨୧  ──*

*╭  〔 🎨 ɪ ʟ ʟ ᴜ ꜱ ᴛ ʀ ᴀ ꜱ ɪ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${d.caption || text}*
*┆* ✧ ᴀʀᴛɪꜱ    : *${d.artist || 'Anonim'}*
*┆* ◈ ᴛᴏᴛᴀʟ ɢʙʀ : *${toSmallNum(media.length)} Gambar*
> ✦ ᴛᴀɢꜱ : ${tagsStr}
*╰───────────────*

> _Koleksi ilustrasi karya seni dari komunitas Pixiv._`.trim()

    // Send the first image with full caption
    await conn.sendMessage(m.chat, {
      image: { url: media[0] },
      caption
    }, { quoted: m })

    // Send additional images if available (up to 3 total)
    if (media.length > 1) {
      for (let i = 1; i < Math.min(media.length, 3); i++) {
        await conn.sendMessage(m.chat, {
          image: { url: media[i] },
          caption: `> 🎨 *${d.caption || text}* [${toSmallNum(i + 1)}/${toSmallNum(media.length)}]`
        }, { quoted: m })
      }
    }
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mencari ilustrasi Pixiv: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['pixiv <query>', 'pixivsearch <query>']
handler.tags = ['anime', 'search']
handler.command = /^(pixiv|pixivsearch)$/i
handler.limit = true

export default handler
