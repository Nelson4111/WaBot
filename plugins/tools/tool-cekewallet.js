import axios from 'axios'
import { status } from '../../lib/style.js'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let wallet = ''
  let number = ''

  const cmd = command.toLowerCase()
  if (cmd === 'cekdana') {
    wallet = 'DANA'
    number = args[0]
  } else if (cmd === 'cekgopay') {
    wallet = 'GOPAY'
    number = args[0]
  } else if (cmd === 'cekovo') {
    wallet = 'OVO'
    number = args[0]
  } else if (cmd === 'cekshopeepay') {
    wallet = 'SHOPEEPAY'
    number = args[0]
  } else {
    // cekewallet
    wallet = args[0]?.toUpperCase()
    number = args[1]
  }

  if (!wallet || !number) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Gunakan:
> › *${usedPrefix + command}* <wallet> <nomor_hp>
>
> Shortcut Tersedia:
> › *${usedPrefix}cekdana* <nomor>
> › *${usedPrefix}cekgopay* <nomor>
> › *${usedPrefix}cekovo* <nomor>
> › *${usedPrefix}cekshopeepay* <nomor>
>
> Contoh:
> › *${usedPrefix}cekdana 081234567890*
*╰───────────────*`)
  }

  number = number.replace(/[^0-9]/g, '')
  if (!number) {
    return m.reply(status.warning('Nomor tujuan harus berupa angka.'))
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/cek-ewallet?code=${encodeURIComponent(wallet)}&number=${encodeURIComponent(number)}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const data = res.data
    if (data?.status === 'success' || data?.account_name) {
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      const caption = `*──  ୨୧ ✧ ᴠᴀʟɪᴅᴀꜱɪ ᴇ-ᴡᴀʟʟᴇᴛ ✧ ୨୧  ──*

*╭  〔 ✦ ɪ ɴ ꜰ ᴏ  ᴇ - ᴡ ᴀ ʟ ʟ ᴇ ᴛ 〕*
*┆* ⟡ ᴇ-ᴡᴀʟʟᴇᴛ      : *${wallet}*
*┆* ✧ ɴᴏ. ʜᴘ / ɪᴅ   : *${toSmallNum(number)}*
*┆* ✦ ɴᴀᴍᴀ ᴀᴋᴜɴ    : *${data.account_name}*
*┆* ❖ ꜱᴛᴀᴛᴜꜱ        : *ᴛᴇʀᴅᴀꜰᴛᴀʀ / ᴠᴀʟɪᴅ*
*╰───────────────*

> _Pastikan nama akun penerima sudah tepat sebelum mengirim saldo._`.trim()

      return m.reply(caption)
    }

    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = data?.message || 'Nomor akun e-wallet tidak ditemukan atau layanan sedang maintenance.'
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> ${msg}
*╰───────────────*`)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memvalidasi e-wallet: ${errorMsg}
*╰───────────────*`)
  }
}

handler.help = ['cekewallet <wallet> <nomor>', 'cekdana <nomor>', 'cekgopay <nomor>', 'cekovo <nomor>', 'cekshopeepay <nomor>']
handler.tags = ['tools']
handler.command = /^(cekewallet|cekdana|cekgopay|cekovo|cekshopeepay)$/i
handler.limit = true

export default handler
