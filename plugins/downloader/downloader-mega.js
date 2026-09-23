import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('mega.nz/')) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan link file Mega.nz:
> › *${usedPrefix + command}* <link_mega>
>
> Contoh:
> › *${usedPrefix + command} https://mega.nz/file/xxxx#yyyy*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/downloader/mega?url=${encodeURIComponent(text.trim())}`, {
      timeout: 35000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const d = res.data
    const dlUrl = d?.download_url || d?.url || d?.link
    if (!d || !dlUrl) {
      throw new Error(d?.error || 'Gagal mengekstrak direct link file Mega.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const fileName = d.filename || d.name || 'mega_file'
    const size = d.filesize || d.size || '-'

    const caption = `*──  ୨୧ ✧ ᴍᴇɢᴀ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ✧ ୨୧  ──*

*╭  〔 📦 ɪ ɴ ꜰ ᴏ  ꜰ ɪ ʟ ᴇ 〕*
*┆* ⟡ ɴᴀᴍᴀ ꜰɪʟᴇ : *${fileName}*
*┆* ◈ ᴜᴋᴜʀᴀɴ    : *${toSmallNum(size)}*
> › 🔗 *Direct Download:* ${dlUrl}
*╰───────────────*

> _File cloud storage Mega.nz._`.trim()

    return conn.sendMessage(m.chat, {
      document: { url: dlUrl },
      fileName,
      mimetype: 'application/octet-stream',
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.error || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mengunduh file Mega: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['megadl <url>', 'mega <url>']
handler.tags = ['downloader']
handler.command = /^(megadl|mega)$/i
handler.limit = true

export default handler
