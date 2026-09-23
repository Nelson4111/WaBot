import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('soundcloud.com/')) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan link lagu SoundCloud:
> › *${usedPrefix + command}* <link_soundcloud>
>
> Contoh:
> › *${usedPrefix + command} https://soundcloud.com/artist/track*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/downloader/soundcloud?url=${encodeURIComponent(text.trim())}`, {
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const d = res.data
    const audioUrl = d?.download_url || d?.url || d?.link
    if (!d || !audioUrl) {
      throw new Error('Gagal mengekstrak audio dari link SoundCloud.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const title = d.title || 'SoundCloud Audio'
    const size = d.filesize ? `${(d.filesize / (1024 * 1024)).toFixed(2)} MB` : '-'

    const caption = `*──  ୨୧ ✧ ꜱᴏᴜɴᴅᴄʟᴏᴜᴅ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ✧ ୨୧  ──*

*╭  〔 🎵 ɪ ɴ ꜰ ᴏ  ᴍ ᴜ ꜱ ɪ ᴋ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ   : *${title}*
*┆* ◈ ᴜᴋᴜʀᴀɴ  : *${toSmallNum(size)}*
*┆* ⚙ ꜰᴏʀᴍᴀᴛ  : *MP3 Audio*
*╰───────────────*

> _Musik sedang dikirimkan ke chat..._`.trim()

    await m.reply(caption)

    const cleanTitle = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim()
    return conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${cleanTitle}.mp3`
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mengunduh audio SoundCloud: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['soundcloud <url>', 'scdl <url>']
handler.tags = ['downloader']
handler.command = /^(soundcloud|scdl)$/i
handler.limit = true

export default handler
