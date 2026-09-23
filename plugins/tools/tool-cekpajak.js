import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan nomor plat polisi:
> › *${usedPrefix + command}* <plat_nomor> [1:pribadi / 2:umum]
>
> Contoh:
> › *${usedPrefix + command} D1234ABC*
> › *${usedPrefix + command} B1234XYZ 1*
*╰───────────────*`)
  }

  const noPolisi = args[0].toUpperCase().replace(/\s+/g, '')
  const kdPlat = args[1] || '1'

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/cek-pajak/jabar?no_polisi=${encodeURIComponent(noPolisi)}&kd_plat=${encodeURIComponent(kdPlat)}`, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const d = res.data
    if (!d || d.success === false) {
      throw new Error(d?.message || d?.detail?.[0] || 'Nomor plat kendaraan tidak ditemukan atau belum terdaftar di SAMSAT.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const info = d.data || d
    const caption = `*──  ୨୧ ✧ ᴘᴀᴊᴀᴋ ᴋᴇɴᴅᴀʀᴀᴀɴ ꜱᴀᴍꜱᴀᴛ ✧ ୨୧  ──*

*╭  〔 🚗 ɪ ɴ ꜰ ᴏ  ᴋ ᴇ ɴ ᴅ ᴀ ʀ ᴀ ᴀ ɴ 〕*
*┆* ⟡ ɴᴏ. ᴘʟᴀᴛ   : *${noPolisi}*
*┆* ✧ ᴍᴇʀᴇᴋ / ᴛɪᴘᴇ: *${info.merek || info.tipe || '-'}*
*┆* ◈ ᴛᴀʜᴜɴ      : *${toSmallNum(info.tahun || '-')}*
*┆* ❖ ᴡᴀʀɴᴀ      : *${info.warna || '-'}*
*┆* ⏱ ᴊᴀᴛᴜʜ ᴛᴇᴍᴘᴏ: *${toSmallNum(info.tgl_pajak || info.jatuh_tempo || '-')}*
*┆* ✦ ᴛᴏᴛᴀʟ ᴘᴀᴊᴀᴋ: *Rp ${toSmallNum(Number(info.total_pkb || info.total || 0).toLocaleString('id-ID'))}*
*╰───────────────*

> _Informasi Pajak Kendaraan Bermotor (PKB) Bapenda SAMSAT._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memeriksa pajak kendaraan: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['cekpajak <plat>', 'pajak <plat>']
handler.tags = ['tools', 'info']
handler.command = /^(cekpajak|pajak)$/i
handler.limit = true

export default handler
