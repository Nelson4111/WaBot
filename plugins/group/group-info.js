import axios from 'axios'
import { toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn, participants, groupMetadata }) => {
  const ppUrls = [
    'https://i.ibb.co/VVXTRv0/f8323e88975b4e8c15580fbb8daed698.jpg',
    'https://i.ibb.co/mvt0NPZ/31889221389613dd440c9909cd27771a.jpg',
    'https://i.ibb.co/jhCy322/f272360445283d8385c35afa697bdf43.jpg'
  ]

  let ppUrl = await conn.profilePictureUrl(m.chat, 'image').catch(() => null)
  if (!ppUrl) {
    ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)]
  }

  const ppBuffer = await axios.get(ppUrl, { responseType: 'arraybuffer' }).then(res => res.data).catch(() => null)

  const chat = global.db?.data?.chats?.[m.chat] || {}
  const groupAdmins = (participants || []).filter(p => p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin || p.isSuperAdmin)
  const listAdmin = groupAdmins.map((v, i) => `*┆*   ${toSmallNum(i + 1)}. @${conn.decodeJid(v.id || v.jid).split('@')[0].replace(/\D/g, '')}`).join('\n')
  
  const rawOwner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split('-')[0] + '@s.whatsapp.net'
  const ownerJid = conn.decodeJid(rawOwner)
  const ownerNum = ownerJid.split('@')[0].replace(/\D/g, '')

  const st = val => val ? '⟡ ᴀᴋᴛɪꜰ' : '◈ ɴᴏɴᴀᴋᴛɪꜰ'

  const descText = groupMetadata.desc?.toString()?.trim() || 'Tidak ada deskripsi.'

  const txt = `*──  ୨୧ ✧ INFORMASI METADATA GRUP ✧ ୨୧  ──*

> *おしらせ!* (ᴘʀᴏꜰɪʟ ɢʀᴜᴘ)
> Rincian data dan status sistem grup *${groupMetadata.subject}*

*╭  〔 ❖ ɪ ɴ ꜰ ᴏ ʀ ᴍ ᴀ ꜱ ɪ  ᴜ ᴛ ᴀ ᴍ ᴀ 〕*
*┆* ⟡ ɴᴀᴍᴀ ɢʀᴜᴘ    : *${groupMetadata.subject}*
*┆* ✧ ᴏᴡɴᴇʀ        : @${ownerNum}
*┆* ✦ ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀ : *${toSmallNum(participants.length)} Anggota*
*┆* ◈ ɪᴅ ɢʀᴜᴘ      : \`${groupMetadata.id}\`
*╰───────────────*

*╭  〔 ⟡ ᴅ ᴇ ᴡ ᴀ ɴ  ᴀ ᴅ ᴍ ɪ ɴ ɪ ꜱ ᴛ ʀ ᴀ ᴛ ᴏ ʀ 〕*
${listAdmin || '*┆* _(Tidak ada admin terdeteksi)_'}
*╰───────────────*

*╭  〔 ❖ ꜱ ᴇ ᴛ ᴇ ʟ ᴀ ɴ  ᴏ ᴛ ᴏ ᴍ ᴀ ᴛ ɪ ꜱ 〕*
*┆* ⟡ ᴡᴇʟᴄᴏᴍᴇ     : ${st(chat.welcome)}
*┆* ✧ ᴅᴇᴛᴇᴄᴛ      : ${st(chat.detect)}
*┆* ✦ ᴀɴᴛɪ ʟɪɴᴋ   : ${st(chat.antiLink)}
*┆* ◈ ᴀɴᴛɪ ᴅᴇʟᴇᴛᴇ : ${st(!chat.delete)}
*┆* ❖ ꜱᴛᴀᴛᴜꜱ ʙᴀɴ  : ${st(chat.isBanned)}
*╰───────────────*

*╭  〔 ᰔ ᴅ ᴇ ꜱ ᴋ ʀ ɪ ᴘ ꜱ ɪ 〕*
> ${descText.replace(/\n/g, '\n> ')}
*╰───────────────*

> ｡˚ ⊹ _Avelia Management & Security System_ ⊹ ˚ ｡`.trim()

  const mentions = [...groupAdmins.map(v => conn.decodeJid(v.id || v.jid)), ownerJid].filter(Boolean)

  if (ppBuffer) {
    return conn.sendFile(m.chat, Buffer.from(ppBuffer), 'ppgc.jpg', txt, m, false, { mentions })
  } else {
    return conn.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
  }
}

handler.help = ['infogc']
handler.tags = ['group']
handler.command = /^(gro?upinfo|info(gro?up|gc))$/i
handler.group = true

export default handler