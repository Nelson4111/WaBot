import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan tautan video Douyin:
> › *${usedPrefix + command}* <link_douyin>
>
> Contoh:
> › *${usedPrefix + command} https://v.douyin.com/xxxx/*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/downloader/douyin?url=${encodeURIComponent(text.trim())}`, {
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const d = res.data
    const videoUrl = d?.video || d?.download || d?.url || d?.result?.video
    if (!d || !videoUrl) {
      throw new Error(d?.errors || 'Gagal mengekstrak video Douyin tanpa watermark.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const title = d.title || d.desc || 'Douyin Video'
    const author = d.author?.nickname || d.author || 'Douyin Creator'

    const caption = `*──  ୨୧ ✧ ᴅᴏᴜʏɪɴ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ✧ ୨୧  ──*

*╭  〔 🎬 ɪ ɴ ꜰ ᴏ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ   : *${title}*
*┆* ✧ ᴀᴜᴛʜᴏʀ  : *${author}*
*┆* ⚙ ᴡᴀᴛᴇʀᴍᴀʀᴋ: *Tanpa Watermark (No-WM)*
*╰───────────────*

> _Video Douyin HD berhasil diunduh._`.trim()

    return conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.errors || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mengunduh video Douyin: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['douyin <url>']
handler.tags = ['downloader']
handler.command = /^(douyin|douyindl)$/i
handler.limit = true

export default handler
