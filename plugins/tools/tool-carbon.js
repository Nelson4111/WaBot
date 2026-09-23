import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const code = text || m.quoted?.text

  if (!code) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan kode atau reply pesan teks koding:
> › *${usedPrefix + command}* <kode_program>
>
> Contoh:
> › *${usedPrefix + command} console.log("Hello World")*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/carbon?code=${encodeURIComponent(code)}&theme=dracula&language=auto`, {
      responseType: 'arraybuffer',
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const buffer = Buffer.from(res.data)
    if (!buffer || buffer.length === 0) {
      throw new Error('Gagal merender gambar kode program.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ᴄᴀʀʙᴏɴ ᴄᴏᴅᴇ ✧ ୨୧  ──*

*╭  〔 💻 ᴄ ᴏ ᴅ ᴇ  ꜱ ɴ ɪ ᴘ ᴘ ᴇ ᴛ 〕*
*┆* ⟡ ᴛᴇᴍᴀ     : *Dracula*` + `
*┆* ⚙ ʟᴀɴɢᴜᴀɢᴇ : *Auto-Detect*
*┆* ✦ ᴘᴀɴᴊᴀɴɢ  : *${toSmallNum(code.length)} Karakter*
*╰───────────────*

> _Render visual kode indah dan estetik powered by Carbon._`.trim()

    return conn.sendMessage(m.chat, {
      image: buffer,
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal merender Carbon: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['carbon <kode>', 'carboncode']
handler.tags = ['tools']
handler.command = /^(carbon|carboncode)$/i
handler.limit = true

export default handler
