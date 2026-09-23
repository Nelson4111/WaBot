import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get('https://api.ryzumi.net/api/search/kurs-bca', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const list = Array.isArray(res.data) ? res.data : []
    if (list.length === 0) {
      throw new Error('Data kurs Bank BCA tidak tersedia saat ini.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const rows = list.map(it => {
      return `*┆* ⟡ *${it.currency.padEnd(4, ' ')}* : ʙᴇʟɪ: *${toSmallNum(it.beli)}* | ᴊᴜᴀʟ: *${toSmallNum(it.jual)}*`
    }).join('\n')

    const caption = `*──  ୨୧ ✧ ᴋᴜʀꜱ ᴠᴀʟᴀꜱ ʙᴀɴᴋ ʙᴄᴀ ✧ ୨୧  ──*

*╭  〔 ❖ ɴ ɪ ʟ ᴀ ɪ  ᴛ ᴜ ᴋ ᴀ ʀ  (ɪᴅʀ) 〕*
${rows}
*╰───────────────*

> _Nilai kurs e-Rate resmi PT Bank Central Asia Tbk (BCA) real-time._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat data kurs BCA: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['kursbca']
handler.tags = ['tools', 'info']
handler.command = /^(kursbca)$/i
handler.limit = true

export default handler
