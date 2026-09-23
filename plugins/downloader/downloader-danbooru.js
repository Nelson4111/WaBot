import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan URL postingan atau ID Danbooru:
> › *${usedPrefix + command}* <link_atau_id>
>
> Contoh:
> › *${usedPrefix + command} https://danbooru.donmai.us/posts/8000000*
> › *${usedPrefix + command} 8000000*
*╰───────────────*`)
  }

  let postUrl = text.trim()
  if (!postUrl.startsWith('http')) {
    postUrl = `https://danbooru.donmai.us/posts/${postUrl}`
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/downloader/danbooru?url=${encodeURIComponent(postUrl)}`, {
      timeout: 25000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const d = res.data
    const imgUrl = d?.url || d?.File?.url
    if (!d || !imgUrl) {
      throw new Error('Gagal mendapatkan gambar Danbooru.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ᴅᴀɴʙᴏᴏʀᴜ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ✧ ୨୧  ──*

*╭  〔 🎨 ɪ ɴ ꜰ ᴏ  ɪ ʟ ᴜ ꜱ ᴛ ʀ ᴀ ꜱ ɪ 〕*
*┆* ⟡ ɪᴅ ᴘᴏꜱᴛ   : *#${toSmallNum(d.ID || '-')}*
*┆* ✧ ᴜᴘʟᴏᴀᴅᴇʀ  : *${d.Uploader || '-'}*
*┆* ◈ ʀᴀᴛɪɴɢ    : *${d.Rating || '-'}*
*┆* ❖ ꜱᴄᴏʀᴇ     : *${toSmallNum(d.Score || '0')}*
*┆* ✦ ᴜᴋᴜʀᴀɴ    : *${toSmallNum(d.Size || '-')}*
> › 🔗 *Sumber:* ${d.Source || postUrl}
*╰───────────────*

> _Media ilustrasi seni anime dari Danbooru._`.trim()

    return conn.sendMessage(m.chat, {
      image: { url: imgUrl },
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mengunduh gambar Danbooru: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['danbooru <url/id>']
handler.tags = ['downloader', 'anime']
handler.command = /^(danbooru|danboorudl)$/i
handler.limit = true

export default handler
