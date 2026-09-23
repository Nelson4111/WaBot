import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan nama domain:
> › *${usedPrefix + command}* <domain>
>
> Contoh:
> › *${usedPrefix + command} whatsapp.com*
*╰───────────────*`)
  }

  const domain = text.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '')

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/whois?domain=${encodeURIComponent(domain)}`, {
      timeout: 20000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const w = res.data?.whois
    if (!w) throw new Error('Informasi WHOIS domain tidak ditemukan.')

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const isAvailable = w.available === true
    const caption = `*──  ୨୧ ✧ ᴡʜᴏɪꜱ ᴅᴏᴍᴀɪɴ ✧ ୨୧  ──*

*╭  〔 🌐 ɪ ɴ ꜰ ᴏ  ᴅ ᴏ ᴍ ᴀ ɪ ɴ 〕*
*┆* ⟡ ᴅᴏᴍᴀɪɴ   : *${w.domain || domain}*
*┆* ✧ ᴠᴀʟɪᴅ    : *${w.valid ? 'Valid' : 'Tidak Valid'}*
*┆* ◈ ꜱᴛᴀᴛᴜꜱ   : *${isAvailable ? 'Tersedia / Belum Dibeli' : 'Terdaftar / Sudah Aktif'}*
> ✦ ʀɪɴᴄɪᴀɴ : ${w.data !== 'No data' ? w.data : (isAvailable ? 'Domain belum didaftarkan dan dapat dibeli di registrar.' : 'Domain telah aktif digunakan.')}
*╰───────────────*

> _Informasi pencarian ketersediaan nama domain internet._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memeriksa WHOIS: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['whois <domain>']
handler.tags = ['tools']
handler.command = /^(whois|whoisdomain)$/i
handler.limit = true

export default handler
