import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const now = new Date()
  let month = args[0] ? parseInt(args[0]) : (now.getMonth() + 1)
  let year = args[1] ? parseInt(args[1]) : now.getFullYear()

  if (isNaN(month) || month < 1 || month > 12) {
    month = now.getMonth() + 1
  }
  if (isNaN(year) || year < 1900 || year > 2100) {
    year = now.getFullYear()
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/image/calendar?month=${month}&year=${year}`, {
      responseType: 'arraybuffer',
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const buffer = Buffer.from(res.data)
    if (!buffer || buffer.length === 0) {
      throw new Error('Gagal merender lembar kalender.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ᴋᴀʟᴇɴᴅᴇʀ ʙᴜʟᴀɴᴀɴ ✧ ୨୧  ──*

*╭  〔 ◈ ɪ ɴ ꜰ ᴏ  ᴋ ᴀ ʟ ᴇ ɴ ᴅ ᴇ ʀ 〕*
*┆* ⟡ ʙᴜʟᴀɴ : *${MONTH_NAMES[month] || month}*
*┆* ◈ ᴛᴀʜᴜɴ : *${toSmallNum(year)}*
*┆* ⏱ ᴡᴀᴋᴛᴜ : *${toSmallNum(now.toLocaleTimeString('id-ID'))} WIB*
*╰───────────────*

> _Lembar kalender estetik bulanan Masehi._`.trim()

    return conn.sendMessage(m.chat, {
      image: buffer,
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat kalender: ${err.message}
*╰───────────────*`)
  }
}

handler.help = ['kalender [bulan] [tahun]', 'calendar [bulan] [tahun]']
handler.tags = ['tools']
handler.command = /^(kalender|calendar)$/i
handler.limit = true

export default handler
