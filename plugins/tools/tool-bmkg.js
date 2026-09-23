import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get('https://api.ryzumi.net/api/search/bmkg', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const auto = res.data?.autogempa
    if (!auto) {
      throw new Error('Data gempa terkini tidak ditemukan.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ɪɴꜰᴏ ɢᴇᴍᴘᴀ ʙᴍᴋɢ ✧ ୨୧  ──*

*╭  〔 ⚠ ɢ ᴇ ᴍ ᴘ ᴀ  ᴛ ᴇ ʀ ᴋ ɪ ɴ ɪ 〕*
*┆* ◈ ᴛᴀɴɢɢᴀʟ   : *${toSmallNum(auto.Tanggal)}*
*┆* ⏱ ᴡᴀᴋᴛᴜ     : *${toSmallNum(auto.Jam)}*
*┆* ❖ ᴍᴀɢɴɪᴛᴜᴅᴏ : *${toSmallNum(auto.Magnitude)} SR*
*┆* ⧗ ᴋᴇᴅᴀʟᴀᴍᴀɴ : *${toSmallNum(auto.Kedalaman)}*
*┆* ⟡ ᴋᴏᴏʀᴅɪɴᴀᴛ : *${toSmallNum(auto.Coordinates)} (${auto.Lintang}, ${auto.Bujur})*
> ✦ ʟᴏᴋᴀꜱɪ : ${auto.Wilayah}
> ✧ ᴘᴏᴛᴇɴꜱɪ : ${auto.Potensi}
> 𝜚 ᴅɪʀᴀꜱᴀᴋᴀɴ : ${auto.Dirasakan || 'Tidak ada laporan dirasakan'}
*╰───────────────*

> _Sumber data resmi Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) Indonesia._`.trim()

    const shakemapUrl = auto.Shakemap ? `https://data.bmkg.go.id/DataMKG/TEWS/${auto.Shakemap}` : null

    if (shakemapUrl) {
      return conn.sendMessage(m.chat, {
        image: { url: shakemapUrl },
        caption
      }, { quoted: m })
    }

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat info gempa BMKG: ${err.message}
*╰───────────────*`)
  }
}

handler.help = ['gempa', 'bmkg', 'infogempa']
handler.tags = ['tools', 'info']
handler.command = /^(gempa|bmkg|infogempa)$/i
handler.limit = true

export default handler
