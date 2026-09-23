import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, command }) => {
  const isEwallet = /^(listewallet|kodeewallet)$/i.test(command)

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const url = isEwallet ? 'https://api.ryzumi.net/api/misc/kode-ewallet' : 'https://api.ryzumi.net/api/misc/kode-bank'
    const res = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const list = Array.isArray(res.data) ? res.data : []
    if (list.length === 0) {
      throw new Error('Daftar kode tidak tersedia saat ini.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const maxItems = Math.min(list.length, 30)
    const rows = list.slice(0, maxItems).map(it => {
      return `*┆* ⟡ *${(it.name || '').padEnd(16, ' ')}* : *${toSmallNum(it.code || '-')}*`
    }).join('\n')

    const title = isEwallet ? 'ᴅᴀꜰᴛᴀʀ ᴋᴏᴅᴇ ᴇ-ᴡᴀʟʟᴇᴛ' : 'ᴅᴀꜰᴛᴀʀ ᴋᴏᴅᴇ ᴛʀᴀɴꜱꜰᴇʀ ʙᴀɴᴋ'
    const caption = `*──  ୨୧ ✧ ${title} ✧ ୨୧  ──*

*╭  〔 🏦 ɪ ɴ ꜰ ᴏ  ᴋ ᴏ ᴅ ᴇ  ᴛ ʀ ᴀ ɴ ꜱ ꜰ ᴇ ʀ 〕*
${rows}
*╰───────────────*

> _Gunakan kode ini untuk mengecek rekening dengan perintah .cekrek atau .cekewallet._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat daftar kode: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['listbank', 'listewallet']
handler.tags = ['tools', 'info']
handler.command = /^(listbank|kodebank|listewallet|kodeewallet)$/i
handler.limit = true

export default handler
