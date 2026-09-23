import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan nama domain:
> › *${usedPrefix + command}* <domain>
>
> Contoh:
> › *${usedPrefix + command} google.com*
> › *${usedPrefix + command} cloudflare.com*
*╰───────────────*`)
  }

  const domain = text.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '')

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/check-hosting?domain=${encodeURIComponent(domain)}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const r = res.data?.result
    if (!r || !r.domain) {
      throw new Error('Informasi hosting domain tidak dapat dideteksi.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const ipItem = r.web?.ips?.[0]
    const ipAddress = ipItem?.address || '-'
    const country = ipItem?.location?.country || ''
    const city = ipItem?.location?.city || ''
    const hostName = r.hosting?.name || 'Cloud / Private'
    const asn = r.hosting?.asn || '-'

    const caption = `*──  ୨୧ ✧ ʜᴏꜱᴛɪɴɢ ᴄʜᴇᴄᴋᴇʀ ✧ ୨୧  ──*

*╭  〔 🌐 ɪ ɴ ꜰ ᴏ  ʜ ᴏ ꜱ ᴛ ɪ ɴ ɢ 〕*
*┆* ⟡ ᴅᴏᴍᴀɪɴ   : *${r.domain.name || domain}*
*┆* ⚙ ᴘʀᴏᴠɪᴅᴇʀ : *${hostName}*
*┆* ◈ ᴀꜱɴ      : *${asn}*
*┆* ❖ ɪᴘ ꜱᴇʀᴠᴇʀ: *${ipAddress}*
*┆* ⟡ ʟᴏᴋᴀꜱɪ   : *${city ? city + ', ' : ''}${country}*
*┆* ⧗ ɪᴘᴠ𝟼     : *${r.domain.ipv6_support ? 'Didukung' : 'Tidak Didukung'}*` + `
*╰───────────────*

> _Informasi provider server infrastruktur dan DNS hosting._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memeriksa hosting domain: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['checkhost <domain>', 'hosting <domain>']
handler.tags = ['tools']
handler.command = /^(checkhost|hosting|cekhost)$/i
handler.limit = true

export default handler
