import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan judul video:
> › *${usedPrefix + command}* <query_video>
>
> Contoh:
> › *${usedPrefix + command} Rick Astley Never Gonna Give You Up*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/search/yt?query=${encodeURIComponent(text.trim())}`, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const videos = Array.isArray(res.data?.videos) ? res.data.videos : []
    if (videos.length === 0) {
      throw new Error(`Video YouTube untuk "${text}" tidak ditemukan.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const maxResults = Math.min(videos.length, 5)
    const cards = []

    for (let i = 0; i < maxResults; i++) {
      const v = videos[i]
      cards.push(`*╭  〔 🎬 ᴠ ɪ ᴅ ᴇ ᴏ  [${toSmallNum(i + 1)}] 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ   : *${v.title || '-'}*
*┆* ✧ ᴅᴜʀᴀꜱɪ  : *${toSmallNum(v.durationFormatted || '-')}*
*┆* ◈ ᴠɪᴇᴡꜱ   : *${toSmallNum(Number(v.views || 0).toLocaleString('id-ID'))}*
*┆* ⏱ ᴜᴘʟᴏᴀᴅ : *${toSmallNum(v.uploadedAt || '-')}*
> › 🔗 *${v.url || `https://youtube.com/watch?v=${v.id}`}*
*╰───────────────*`)
    }

    const caption = `*──  ୨୧ ✧ ʏᴏᴜᴛᴜʙᴇ ꜱᴇᴀʀᴄʜ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Ketik .ytmp3 <url> untuk audio atau .ytmp4 <url> untuk video._`.trim()

    const firstThumb = videos[0]?.thumbnail
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
> Gagal mencari video YouTube: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['ytsearch <query>', 'yts <query>']
handler.tags = ['search']
handler.command = /^(ytsearch|yts)$/i
handler.limit = true

export default handler
