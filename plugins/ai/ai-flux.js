import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan prompt deskripsi gambar:
> › *${usedPrefix + command}* <prompt_deskripsi>
>
> Contoh:
> › *${usedPrefix + command} anime girl white hair crying, cinematic lighting*
> › *${usedPrefix + command} futuristic cyberpunk city at midnight 8k*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/ai/flux-schnell?prompt=${encodeURIComponent(text.trim())}`, {
      responseType: 'arraybuffer',
      timeout: 45000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const buffer = Buffer.from(res.data)
    if (!buffer || buffer.length === 0) {
      throw new Error('Gagal menghasilkan gambar AI dari prompt.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ꜰʟᴜx ᴀɪ ɢᴇɴᴇʀᴀᴛᴏʀ ✧ ୨୧  ──*

*╭  〔 🎨 ɢ ᴇ ɴ ᴇ ʀ ᴀ ꜱ ɪ  ɢ ᴀ ᴍ ʙ ᴀ ʀ 〕*
*┆* ⟡ ᴍᴏᴅᴇʟ  : *Flux Schnell*
*┆* ⚙ ᴇɴɢɪɴᴇ : *Black Forest Labs*
*┆* ⏱ ᴡᴀᴋᴛᴜ  : *${toSmallNum(new Date().toLocaleTimeString('id-ID'))} WIB*
> ✦ ᴘʀᴏᴍᴘᴛ : ${text.trim()}
*╰───────────────*

> _Gambar visual artistik beresolusi tinggi di-generate otomatis oleh AI._`.trim()

    return conn.sendMessage(m.chat, {
      image: buffer,
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal generate gambar Flux AI: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['flux <prompt>', 'txt2img <prompt>']
handler.tags = ['ai']
handler.command = /^(flux|txt2img|fluxai)$/i
handler.limit = true

export default handler