import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan tautan URL:
> › *${usedPrefix + command}* <link_url>
>
> Contoh:
> › *${usedPrefix}tinyurl https://google.com*
> › *${usedPrefix}bypassouo https://ouo.io/xxxx*
*╰───────────────*`)
  }

  let url = text.trim()
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  const isBypass = /^(bypassouo|ouobypass|ouo)$/i.test(command)

  try {
    let resultUrl = ''
    if (isBypass) {
      const res = await axios.get(`https://api.ryzumi.net/api/tool/ouo-bypass?url=${encodeURIComponent(url)}`, {
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      resultUrl = res.data?.result || res.data?.url || res.data?.shortUrl
      if (!resultUrl) throw new Error('Gagal membypass link ouo.io.')
    } else {
      const res = await axios.get(`https://api.ryzumi.net/api/tool/tinyurl?url=${encodeURIComponent(url)}`, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      resultUrl = res.data?.shortUrl
      if (!resultUrl) throw new Error('Gagal memperpendek link via TinyURL.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ${isBypass ? 'ʙʏᴘᴀꜱꜱ ᴏᴜᴏ' : 'ᴛɪɴʏᴜʀʟ ꜱʜᴏʀᴛᴇɴᴇʀ'} ✧ ୨୧  ──*

*╭  〔 🔗 ᴛ ᴀ ᴜ ᴛ ᴀ ɴ  ʜ ᴀ ꜱ ɪ ʟ 〕*
*┆* ⟡ ᴜʀʟ ᴀꜱᴀʟ : *${url}*
> ✦ ʜᴀꜱɪʟ : *${resultUrl}*
*╰───────────────*

> _Tautan berhasil diproses secara otomatis._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memproses URL: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['tinyurl <url>', 'bypassouo <url>']
handler.tags = ['tools']
handler.command = /^(tinyurl|shortlink|bypassouo|ouobypass|ouo)$/i
handler.limit = true

export default handler
