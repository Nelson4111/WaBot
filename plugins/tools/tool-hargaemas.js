import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get('https://api.ryzumi.net/api/search/harga-emas', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const data = res.data
    if (!data || !data.hargaUtama) {
      throw new Error('Data harga emas tidak tersedia.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    let detailRows = ''
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      // Sort or pick clean sizes (e.g. 1 gr, 2 gr, 5 gr, 10 gr, 25 gr, 50 gr, 100 gr)
      const list = [...data.detail].reverse() // smallest to largest
      detailRows = list.map(item => `*┆* ⟡ ${toSmallNum(item.ukuran.padEnd(8, ' '))} : *${toSmallNum(item.harga)}*`).join('\n')
    }

    const caption = `*──  ୨୧ ✧ ʜᴀʀɢᴀ ᴇᴍᴀꜱ ᴀɴᴛᴀᴍ ✧ ୨୧  ──*

*╭  〔 ❖ ʜ ᴀ ʀ ɢ ᴀ  ᴜ ᴛ ᴀ ᴍ ᴀ 〕*
*┆* ⟡ ᴘʀᴏᴅᴜᴋ     : *${data.title || 'Emas Batangan Antam'}*
*┆* ❖ ʜᴀʀɢᴀ 𝟷 ɢʀ : *${toSmallNum(data.hargaUtama)}*
*┆* ⧗ ᴘᴇʀᴜʙᴀʜᴀɴ  : *${data.perubahan || '𝟶'}*
*╰───────────────*

${detailRows ? `*╭  〔 ◈ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ʜ ᴀ ʀ ɢ ᴀ 〕*\n${detailRows}\n*╰───────────────*\n\n` : ''}> _Data harga resmi Logam Mulia Antam LM._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat info harga emas: ${err.message}
*╰───────────────*`)
  }
}

handler.help = ['hargaemas', 'emas']
handler.tags = ['tools', 'info']
handler.command = /^(hargaemas|emas)$/i
handler.limit = true

export default handler
