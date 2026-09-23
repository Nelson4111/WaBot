import axios from 'axios'
import { status } from '../../lib/style.js'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0] || !args[1]) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Gunakan:
> › *${usedPrefix + command}* <bank> <nomor_rekening>
>
> Contoh:
> › *${usedPrefix + command} BCA 1234567890*
>
> Bank Didukung:
> BCA, BRI, BNI, MANDIRI, CIMB, PERMATA, BSI, DANAMON, BTPN, JAGO, dll.
*╰───────────────*`)
  }

  const bank = args[0].toUpperCase()
  const number = args[1].replace(/[^0-9]/g, '')

  if (!number) {
    return m.reply(status.warning('Nomor rekening harus berupa angka.'))
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/cek-rekening?code=${encodeURIComponent(bank)}&number=${encodeURIComponent(number)}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const data = res.data
    if (data?.status === 'success' || data?.account_name) {
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      const caption = `*──  ୨୧ ✧ ᴠᴀʟɪᴅᴀꜱɪ ʀᴇᴋᴇɴɪɴɢ ✧ ୨୧  ──*

*╭  〔 ✦ ɪ ɴ ꜰ ᴏ  ʀ ᴇ ᴋ ᴇ ɴ ɪ ɴ ɢ 〕*
*┆* ⟡ ʙᴀɴᴋ         : *${bank}*
*┆* ✧ ɴᴏ. ʀᴇᴋᴇɴɪɴɢ  : *${toSmallNum(number)}*
*┆* ✦ ɴᴀᴍᴀ ᴘᴇᴍɪʟɪᴋ : *${data.account_name}*
*┆* ❖ ꜱᴛᴀᴛᴜꜱ        : *ᴛᴇʀᴅᴀꜰᴛᴀʀ / ᴠᴀʟɪᴅ*
*╰───────────────*

> _Pastikan nama pemilik sesuai sebelum melakukan transaksi transfer._`.trim()

      return m.reply(caption)
    }

    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = data?.message || 'Nomor rekening tidak ditemukan atau bank tidak didukung.'
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> ${msg}
*╰───────────────*`)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memvalidasi rekening: ${errorMsg}
*╰───────────────*`)
  }
}

handler.help = ['cekrek <bank> <nomor>', 'cekrekening <bank> <nomor>']
handler.tags = ['tools']
handler.command = /^(cekrek|cekrekening)$/i
handler.limit = true

export default handler
