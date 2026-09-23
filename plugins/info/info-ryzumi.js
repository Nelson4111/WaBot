import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get('https://api.ryzumi.net/api/misc/server-info', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const d = res.data
    if (!d || !d.os) throw new Error('Data server info tidak tersedia.')

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ʀʏᴢᴜᴍɪ ꜱᴇʀᴠᴇʀ ꜱᴛᴀᴛᴜꜱ ✧ ୨୧  ──*

*╭  〔 ⚙ ꜱ ᴘ ᴇ ꜱ ɪ ꜰ ɪ ᴋ ᴀ ꜱ ɪ  ꜱ ᴇ ʀ ᴠ ᴇ ʀ 〕*
*┆* ⟡ ᴏꜱ ꜱʏꜱᴛᴇᴍ : *${d.os.type || 'Linux'} (${d.os.platform || 'linux'})*
*┆* ⚙ ᴄᴘᴜ ᴍᴏᴅᴇʟ : *${d.cpu?.model || 'AMD EPYC'}*
*┆* ◈ ᴄᴘᴜ ᴄᴏʀᴇꜱ : *${toSmallNum(d.cpu?.cores || 16)} Cores*
*┆* ❖ ᴛᴏᴛᴀʟ ʀᴀᴍ : *${toSmallNum(d.ram?.totalMemory || '64 GB')}*
*┆* ✦ ʀᴀᴍ ᴛᴇʀᴘᴀᴋᴀɪ: *${toSmallNum(d.ram?.usedMemory || '-')}*
*┆* ⧗ ʀᴀᴍ ꜰʀᴇᴇ   : *${toSmallNum(d.ram?.freeMemory || '-')}*
*╰───────────────*

> _Status telemetri server infrastruktur Ryzumi Rest API._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memeriksa status server Ryzumi: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['apistatus', 'ryzumiserver']
handler.tags = ['info']
handler.command = /^(apistatus|ryzumiserver|serverapi)$/i
handler.limit = true

export default handler
