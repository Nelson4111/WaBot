import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan nama mahasiswa atau NIM:
> › *${usedPrefix + command}* <nama_atau_nim>
>
> Contoh:
> › *${usedPrefix + command} Budi Santoso*
> › *${usedPrefix + command} 0101200008*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/search/mahasiswa?query=${encodeURIComponent(text.trim())}`, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const list = Array.isArray(res.data) ? res.data : []
    if (list.length === 0) {
      throw new Error(`Data mahasiswa untuk "${text}" tidak ditemukan di PDDikti.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const maxResults = Math.min(list.length, 5)
    const cards = []

    for (let i = 0; i < maxResults; i++) {
      const it = list[i]
      cards.push(`*╭  〔 🎓 ᴍ ᴀ ʜ ᴀ ꜱ ɪ ꜱ ᴡ ᴀ  [${toSmallNum(i + 1)}] 〕*
*┆* ⟡ ɴᴀᴍᴀ   : *${it.nama || '-'}*
*┆* ✧ ɴɪᴍ    : *${toSmallNum(it.nim || '-')}*
*┆* ✦ ᴋᴀᴍᴘᴜꜱ : *${it.nama_pt || '-'}*
*┆* ◈ ᴘʀᴏᴅɪ  : *${it.nama_prodi || '-'}*
*╰───────────────*`)
    }

    const caption = `*──  ୨୧ ✧ ᴅᴀᴛᴀ ᴍᴀʜᴀꜱɪꜱᴡᴀ ᴘᴅᴅɪᴋᴛɪ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Sumber data resmi Pangkalan Data Pendidikan Tinggi (PDDikti) Kemdikbud RI._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal mencari data mahasiswa: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['mahasiswa <nama/nim>', 'pddikti <nama/nim>']
handler.tags = ['search', 'info']
handler.command = /^(mahasiswa|pddikti)$/i
handler.limit = true

export default handler
