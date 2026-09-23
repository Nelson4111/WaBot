import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan URL website:
> › *${usedPrefix + command}* <link_website>
>
> Contoh:
> › *${usedPrefix + command} https://github.com*
*╰───────────────*`)
  }

  let url = text.trim()
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/url-preview?url=${encodeURIComponent(url)}`, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const r = res.data?.result
    if (!r || !r.title) {
      throw new Error('Meta tag website tidak dapat dijangkau.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ᴜʀʟ ᴘʀᴇᴠɪᴇᴡ ✧ ୨୧  ──*

*╭  〔 🌐 ᴏ ᴘ ᴇ ɴ ɢ ʀ ᴀ ᴘ ʜ  ᴍ ᴇ ᴛ ᴀ 〕*
*┆* ⟡ ꜱɪᴛᴜꜱ     : *${r.siteName || '-'}*
*┆* ✧ ᴊᴜᴅᴜʟ     : *${r.title || '-'}*
> ✦ ᴅᴇꜱᴋʀɪᴘꜱɪ : ${r.description || 'Tidak ada deskripsi'}
> › 🔗 *${r.url || url}*
*╰───────────────*

> _Pratinjau metadata tautan website._`.trim()

    if (r.image) {
      return conn.sendMessage(m.chat, {
        image: { url: r.image },
        caption
      }, { quoted: m })
    }

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat pratinjau URL: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['urlpreview <url>', 'ogpreview <url>']
handler.tags = ['tools']
handler.command = /^(urlpreview|ogpreview|previewlink)$/i
handler.limit = true

export default handler
