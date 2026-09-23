import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan nama kota:
> › *${usedPrefix + command}* <nama_kota>
>
> Contoh:
> › *${usedPrefix + command} Jakarta*
> › *${usedPrefix + command} Tokyo*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/search/weather?city=${encodeURIComponent(text.trim())}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const d = res.data
    if (!d || !d.main) {
      throw new Error(`Informasi cuaca untuk kota "${text}" tidak ditemukan.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const temp = Math.round(d.main.temp)
    const feels = Math.round(d.main.feels_like)
    const condition = d.weather?.[0]?.description || d.weather?.[0]?.main || 'Cerah'
    const humidity = d.main.humidity || 0
    const pressure = d.main.pressure || 0
    const wind = d.wind?.speed || 0

    const caption = `*──  ୨୧ ✧ ɪɴꜰᴏ ᴘʀᴀᴋɪʀᴀᴀɴ ᴄᴜᴀᴄᴀ ✧ ୨୧  ──*

*╭  〔 ⛅ ᴋ ᴏ ɴ ᴅ ɪ ꜱ ɪ  ᴄ ᴜ ᴀ ᴄ ᴀ 〕*
*┆* ⟡ ʟᴏᴋᴀꜱɪ     : *${d.name || text}*
*┆* ◈ ᴋᴏɴᴅɪꜱɪ    : *${condition.toUpperCase()}*
*┆* ❖ ꜱᴜʜᴜ       : *${toSmallNum(temp)}°C (ᴛᴇʀᴀꜱᴀ ${toSmallNum(feels)}°C)*
*┆* ⧗ ᴋᴇʟᴇᴍʙᴀᴘᴀɴ : *${toSmallNum(humidity)}%*
*┆* ⚙ ᴛᴇᴋᴀɴᴀɴ    : *${toSmallNum(pressure)} hPa*
*┆* ✦ ᴋᴇᴄ. ᴀɴɢɪɴ : *${toSmallNum(wind)} m/s*
*╰───────────────*

> _Laporan meteorologi cuaca real-time global._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat info cuaca: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['cuaca <kota>', 'weather <city>']
handler.tags = ['search', 'info']
handler.command = /^(cuaca|weather)$/i
handler.limit = true

export default handler
