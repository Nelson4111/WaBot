import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const content = text || m.quoted?.text
  if (!content) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan pesan atau reply teks:
> › *${usedPrefix + command}* <pesan>
>
> Contoh:
> › *${usedPrefix + command} Selamat pagi semuanya*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let buffer = null
    // 1. Primary: Ryzumi iPhone Quotly API
    try {
      const res = await axios.get(`https://api.ryzumi.net/api/image/iqc?text=${encodeURIComponent(content.trim())}`, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      buffer = Buffer.from(res.data)
    } catch (e1) {
      // 2. Fallback: Siputzx iPhone Quoted
      const time = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date())

      const fallbackUrl = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&batteryPercentage=85&carrierName=INDOSAT&messageText=${encodeURIComponent(content.trim())}&emojiStyle=apple`
      const resFallback = await axios.get(fallbackUrl, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      buffer = Buffer.from(resFallback.data)
    }

    if (!buffer || buffer.length === 0) {
      throw new Error('Gagal menghasilkan tampilan iPhone Quotly.')
    }

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `*──  ୨୧ ✧ ɪᴘʜᴏɴᴇ Qᴜᴏᴛʟʏ ✧ ୨୧  ──*\n\n> _Tampilan bubble chat elegan khas iOS iPhone._`
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal membuat iPhone Quotly: ${err.message}
*╰───────────────*`)
  }
}

handler.help = ['iqc <pesan>', 'iphoneqc <pesan>']
handler.tags = ['maker']
handler.command = /^(iqc|iphoneqc)$/i
handler.limit = true

export default handler