import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Gunakan:
> › *${usedPrefix + command}* <url>
>
> Shortcut:
> › *${usedPrefix}sspc* <url> (Desktop Mode)
> › *${usedPrefix}sshp* <url> (Mobile Mode)
>
> Contoh:
> › *${usedPrefix + command} https://google.com*
*╰───────────────*`)
  }

  let url = text.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  const mode = command.toLowerCase() === 'sshp' ? 'mobile' : 'desktop'

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/ssweb?url=${encodeURIComponent(url)}&mode=${mode}`, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const buffer = Buffer.from(res.data)
    if (!buffer || buffer.length === 0) {
      throw new Error('Gagal mengambil tangkapan layar website.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ꜱᴄʀᴇᴇɴꜱʜᴏᴛ ᴡᴇʙ ✧ ୨୧  ──*

*╭  〔 🌐 ᴡ ᴇ ʙ  ꜱ ɴ ᴀ ᴘ ꜱ ʜ ᴏ ᴛ 〕*
*┆* ⟡ ᴜʀʟ   : *${url}*
*┆* ⚙ ᴍᴏᴅᴇ  : *${mode === 'mobile' ? 'Mobile Smartphone' : 'Desktop PC'}*
*┆* ⏱ ᴡᴀᴋᴛᴜ : *${toSmallNum(new Date().toLocaleTimeString('id-ID'))} WIB*
*╰───────────────*

> _Tangkapan layar halaman web langsung dari browser engine._`.trim()

    return conn.sendMessage(m.chat, {
      image: buffer,
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mengambil tangkapan layar: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['ssweb <url>', 'sspc <url>', 'sshp <url>']
handler.tags = ['tools']
handler.command = /^(ssweb|sspc|sshp)$/i
handler.limit = true

export default handler
