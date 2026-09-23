import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan alamat email akun Alight Motion:
> › *${usedPrefix + command}* <email> [link_verifikasi]
>
> Contoh:
> › *${usedPrefix + command} user@gmail.com*
*╰───────────────*`)
  }

  const email = args[0].trim()
  const rawLink = args[1]?.trim() || ''

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let url = `https://api.ryzumi.net/api/tool/alight-activator?email=${encodeURIComponent(email)}`
    if (rawLink) url += `&rawLink=${encodeURIComponent(rawLink)}`

    const res = await axios.get(url, {
      timeout: 25000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const d = res.data
    if (!d || d.success === false || d.error) {
      throw new Error(d?.error || 'Gagal mengirim aktivasi Alight Motion.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ᴀʟɪɢʜᴛ ᴍᴏᴛɪᴏɴ ᴀᴄᴛɪᴠᴀᴛᴏʀ ✧ ୨୧  ──*

*╭  〔 🎬 ɪ ɴ ꜰ ᴏ  ᴀ ᴋ ᴛ ɪ ᴠ ᴀ ꜱ ɪ 〕*
*┆* ⟡ ᴇᴍᴀɪʟ   : *${email}*
*┆* ✧ ꜱᴛᴀᴛᴜꜱ  : *${d.premium ? 'Premium Aktif' : 'Magic Link Terkirim'}*
*┆* ◈ ᴅᴜʀᴀꜱɪ  : *${d.duration || '1 Tahun'}*
> ✦ ᴘᴇꜱᴀɴ : ${d.message || 'Cek kotak masuk email Anda untuk mengklik tautan verifikasi masuk.'}
*╰───────────────*

> _Buka email dari Alight Motion dan klik tautan untuk menyelesaikan aktivasi._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.error || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memproses aktivasi Alight Motion: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['alight <email>', 'alightactivator <email>']
handler.tags = ['tools']
handler.command = /^(alight|alightactivator)$/i
handler.limit = true

export default handler
