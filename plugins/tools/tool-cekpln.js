import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan ID Pelanggan PLN:
> › *${usedPrefix + command}* <id_pelanggan>
>
> Contoh:
> › *${usedPrefix + command} 512345678901*
*╰───────────────*`)
  }

  const idPel = text.replace(/[^0-9]/g, '')
  if (!idPel) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> ID Pelanggan harus berupa deretan angka.\n*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/cek-pln?id=${encodeURIComponent(idPel)}`, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const d = res.data
    if (!d || d.success === false || d.error) {
      throw new Error(d?.error || 'ID Pelanggan tidak ditemukan atau tagihan belum terbit.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const nama = d.nama_pelanggan || d.name || d.nama || '-'
    const tarifDaya = d.tarif_daya || d.segment || d.tarif || '-'
    const periode = d.periode || d.period || '-'
    const tagihan = d.tagihan || d.total || d.amount || '0'
    const admin = d.admin || '0'
    const totalBayar = d.total_bayar || d.totalBayar || tagihan

    const caption = `*──  ୨୧ ✧ ᴛᴀɢɪʜᴀɴ ʟɪꜱᴛʀɪᴋ ᴘʟɴ ✧ ୨୧  ──*

*╭  〔 ⚡ ɪ ɴ ꜰ ᴏ  ᴘ ᴇ ʟ ᴀ ɴ ɢ ɢ ᴀ ɴ 〕*
*┆* ⟡ ɪᴅ ᴘᴇʟ     : *${toSmallNum(idPel)}*
*┆* ✧ ɴᴀᴍᴀ       : *${nama}*
*┆* ◈ ᴛᴀʀɪꜰ / ᴅᴀʏᴀ: *${tarifDaya}*
*┆* ⏱ ᴘᴇʀɪᴏᴅᴇ    : *${periode}*
*┆* ❖ ᴛᴀɢɪʜᴀɴ    : *Rp ${toSmallNum(Number(tagihan).toLocaleString('id-ID'))}*
*┆* ⚙ ʙɪᴀʏᴀ ᴀᴅᴍɪɴ: *Rp ${toSmallNum(Number(admin).toLocaleString('id-ID'))}*
*┆* ✦ ᴛᴏᴛᴀʟ ʙᴀʏᴀʀ: *Rp ${toSmallNum(Number(totalBayar).toLocaleString('id-ID'))}*
*╰───────────────*

> _Data resmi tagihan listrik PLN Pascabayar._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.error || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memeriksa tagihan PLN: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['cekpln <id_pelanggan>']
handler.tags = ['tools', 'info']
handler.command = /^(cekpln|pln)$/i
handler.limit = true

export default handler
