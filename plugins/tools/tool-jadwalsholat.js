import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Gunakan:
> › *${usedPrefix + command}* <nama_kota>
>
> Contoh:
> › *${usedPrefix + command} Jakarta*
> › *${usedPrefix + command} Surabaya*
> › *${usedPrefix + command} Bandung*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/search/jadwal-sholat?kota=${encodeURIComponent(text.trim())}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const data = res.data
    const schedule = data?.schedules?.[0]
    if (!schedule || !schedule.jadwal) {
      throw new Error(`Kota "${text}" tidak ditemukan. Pastikan nama kota di Indonesia benar.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const j = schedule.jadwal
    const caption = `*──  ୨୧ ✧ ᴊᴀᴅᴡᴀʟ ꜱʜᴏʟᴀᴛ ✧ ୨୧  ──*

*╭  〔 ⏱ ᴊ ᴀ ᴅ ᴡ ᴀ ʟ  ꜱ ʜ ᴏ ʟ ᴀ ᴛ 〕*
*┆* ⟡ ʟᴏᴋᴀꜱɪ  : *${schedule.lokasi} (${schedule.daerah})*` + `
*┆* ◈ ᴛᴀɴɢɢᴀʟ : *${toSmallNum(j.tanggal)}*
*┆* ✧ ɪᴍꜱᴀᴋ   : *${toSmallNum(j.imsak)} WIB*
*┆* ✦ ꜱᴜʙᴜʜ   : *${toSmallNum(j.subuh)} WIB*
*┆* ⧗ ᴛᴇʀʙɪᴛ  : *${toSmallNum(j.terbit)} WIB*
*┆* ❖ ᴅʜᴜʜᴀ   : *${toSmallNum(j.dhuha)} WIB*
*┆* ⟡ ᴅᴢᴜʜᴜʀ  : *${toSmallNum(j.dzuhur)} WIB*
*┆* ✧ ᴀꜱʜᴀʀ   : *${toSmallNum(j.ashar)} WIB*
*┆* ✦ ᴍᴀɢʜʀɪʙ : *${toSmallNum(j.maghrib)} WIB*
*┆* ❖ ɪꜱʏᴀ    : *${toSmallNum(j.isya)} WIB*
*╰───────────────*

> _Waktu sholat resmi berdasarkan rujukan Kementerian Agama RI._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.error || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat jadwal sholat: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['jadwalsholat <kota>', 'sholat <kota>']
handler.tags = ['tools', 'islamic']
handler.command = /^(jadwalsholat|sholat)$/i
handler.limit = true

export default handler
