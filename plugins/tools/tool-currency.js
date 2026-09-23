import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Gunakan:
> › *${usedPrefix + command}* <jumlah> <mata_uang_asal> <mata_uang_tujuan>
>
> Contoh:
> › *${usedPrefix + command} 10 USD IDR*
> › *${usedPrefix + command} 50000 IDR USD*
> › *${usedPrefix + command} 100 JPY IDR*
*╰───────────────*`)
  }

  const amount = parseFloat(args[0].replace(/[^0-9.]/g, ''))
  if (isNaN(amount) || amount <= 0) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Jumlah harus berupa angka valid di atas 0.\n*╰───────────────*`)
  }

  let from = (args[1] || 'USD').toUpperCase()
  let to = (args[2] || 'IDR').toUpperCase()

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/currency-converter?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${amount}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const data = res.data
    if (!data || data.result === undefined) {
      throw new Error(data?.error || 'Mata uang tidak valid atau konversi gagal.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const rateStr = Number(data.rate).toLocaleString('id-ID')
    const resultStr = Number(data.result).toLocaleString('id-ID')
    const amountStr = Number(data.amount).toLocaleString('id-ID')

    const caption = `*──  ୨୧ ✧ ᴋᴏɴᴠᴇʀꜱɪ ᴍᴀᴛᴀ ᴜᴀɴɢ ✧ ୨୧  ──*

*╭  〔 ❖ ɴ ɪ ʟ ᴀ ɪ  ᴛ ᴜ ᴋ ᴀ ʀ 〕*
*┆* ⟡ ᴊᴜᴍʟᴀʜ ᴀꜱᴀʟ : *${toSmallNum(amountStr)} ${data.from}*
*┆* ✧ ᴋᴜʀꜱ ᴋᴏɴᴠᴇʀꜱɪ : *𝟷 ${data.from} = ${toSmallNum(rateStr)} ${data.to}*
*┆* ✦ ʜᴀꜱɪʟ ᴛᴏᴛᴀʟ  : *${toSmallNum(resultStr)} ${data.to}*
*┆* ⏱ ᴜᴘᴅᴀᴛᴇ ᴋᴜʀꜱ : *${toSmallNum(new Date(data.updateTime || Date.now()).toLocaleTimeString('id-ID'))} WIB*
*╰───────────────*

> _Nilai tukar mata uang valuta asing internasional real-time._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.error || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal melakukan konversi kurs: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['kurs <jumlah> <from> <to>', 'currency <jumlah> <from> <to>']
handler.tags = ['tools']
handler.command = /^(kurs|currency|konversiuang)$/i
handler.limit = true

export default handler
