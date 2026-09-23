import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan judul video / anime:
> › *${usedPrefix + command}* <query>
>
> Contoh:
> › *${usedPrefix + command} Frieren episode 1*
> › *${usedPrefix + command} Genshin Impact AMV*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/search/bilibili?query=${encodeURIComponent(text.trim())}`, {
      timeout: 20000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const list = Array.isArray(res.data) ? res.data : []
    if (list.length === 0) {
      throw new Error(`Video untuk "${text}" tidak ditemukan di Bilibili.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const maxResults = Math.min(list.length, 5)
    const cards = []

    for (let i = 0; i < maxResults; i++) {
      const it = list[i]
      cards.push(`*╭  〔 🎬 ᴠ ɪ ᴅ ᴇ ᴏ  [${toSmallNum(i + 1)}] 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ   : *${it.title || '-'}*
*┆* ✧ ᴜᴘʟᴏᴀᴅᴇʀ: *${it.uploader || '-'}*
*┆* ◈ ᴅᴜʀᴀꜱɪ  : *${toSmallNum(it.duration || '-')}*
*┆* ⏱ ᴠɪᴇᴡꜱ   : *${toSmallNum(it.views || '-')}*
> › 🔗 *Link:* ${it.url || '-'}
*╰───────────────*`)
    }

    const caption = `*──  ୨୧ ✧ ʙɪʟɪʙɪʟɪ ꜱᴇᴀʀᴄʜ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Ketik .bilibili <link> untuk mengunduh videonya._`.trim()

    const firstThumb = list[0]?.thumbnail
    if (firstThumb) {
      return conn.sendMessage(m.chat, {
        image: { url: firstThumb },
        caption
      }, { quoted: m })
    }

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mencari video Bilibili: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['bilibilisearch <query>', 'bstation <query>']
handler.tags = ['search', 'anime']
handler.command = /^(bilibilisearch|bstation|bilibilis)$/i
handler.limit = true

export default handler
