import { getChatData } from '../../lib/totalchat.js'
import { toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn }) => {
  const gid = m.chat
  const allChatData = getChatData()
  const groupData = allChatData[gid] || {}

  const data = Object.entries(groupData)
    .map(([jid, total]) => ({ jid: conn.decodeJid(jid), total }))
    .filter(v =>
      v.jid.endsWith('@s.whatsapp.net') &&
      !v.jid.includes(':') &&
      !v.jid.includes('lid') &&
      v.total > 0
    )
    .sort((a, b) => b.total - a.total)
    .slice(0, 100)

  if (data.length === 0) {
    return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Belum ada statistik aktivitas pesan yang tercatat di grup ini.\n*╰───────────────*')
  }

  let mentions = []
  const lines = data.map((v, i) => {
    const num = v.jid.split('@')[0].replace(/\D/g, '')
    mentions.push(v.jid)
    return `*┆*   ${toSmallNum(i + 1)}. @${num} › *${toSmallNum(v.total)} Pesan*`
  })

  const txt = `*──  ୨୧ ✧ KLASEMEN AKTIVITAS CHAT ✧ ୨୧  ──*

> *おしらせ!* (ᴛᴏᴘ 𝟷𝟶𝟶 ᴘᴇɴɢɪʀɪᴍ ᴘᴇꜱᴀɴ)
> Rekapitulasi anggota teraktif di dalam ruang percakapan grup:

*╭  〔 ❖ ᴛ ᴏ ᴘ  𝟷 𝟶 𝟶  ᴄ ʜ ᴀ ᴛ 〕*
${lines.join('\n')}
*╰───────────────*

> ｡˚ ⊹ _Semakin aktif berdiskusi, semakin hangat persahabatan kita_ ⊹ ˚ ｡`.trim()

  return conn.sendMessage(m.chat, {
    text: txt,
    mentions
  }, { quoted: m })
}

handler.help = ['totalchat']
handler.tags = ['group']
handler.command = /^(totalchat|gcstat)$/i
handler.group = true

export default handler