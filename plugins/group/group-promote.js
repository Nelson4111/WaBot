import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = ms => new Promise(res => setTimeout(res, ms))

let handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Perintah ini hanya dapat digunakan di dalam ruang grup.\n*╰───────────────*')
  }
  if (!isAdmin) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator grup.\n*╰───────────────*')
  }
  if (!isBotAdmin) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Bot harus menjadi Administrator terlebih dahulu.\n*╰───────────────*')
  }

  // Ambil target dari tag atau reply
  let targets = []
  if (m.mentionedJid && m.mentionedJid.length) {
    targets = m.mentionedJid
  } else if (m.quoted && m.quoted.sender) {
    targets = [m.quoted.sender]
  }

  if (!targets.length) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tandai (tag) atau balas (reply) pesan pengguna yang ingin diangkat menjadi Admin!\n*╰───────────────*')
  }

  let promoted = []

  for (let user of targets) {
    let jid = conn.decodeJid(user)

    let member = participants.find(p =>
      areJidsSameUser(conn.decodeJid(p.id || ''), jid) || 
      areJidsSameUser(conn.decodeJid(p.phoneNumber || ''), jid) ||
      areJidsSameUser(conn.decodeJid(p.jid || ''), jid)
    )

    if (!member) continue
    if (member.admin === 'admin' || member.admin === 'superadmin' || member.isAdmin || member.isSuperAdmin) continue

    try {
      await conn.groupParticipantsUpdate(m.chat, [jid], 'promote')
      promoted.push(jid)
      await delay(800)
    } catch (e) {
      console.error('Error promoting user:', e)
    }
  }

  if (promoted.length > 0) {
    const listLines = promoted.map(u => `*┆* ⟡ @${u.split('@')[0].replace(/\D/g, '')} › *Resmi Dilantik*`).join('\n')
    const txt = `*──  ୨୧ ✧ PELANTIKAN ADMINISTRATOR ✧ ୨୧  ──*

> Selamat! Pengguna berikut telah resmi dipromosikan menjadi Administrator Grup ♡

*╭  〔 ❖ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴀ ᴅ ᴍ ɪ ɴ  ʙ ᴀ ʀ ᴜ 〕*
${listLines}
*╰───────────────*

> ｡˚ ⊹ _Semoga amanah dalam menjaga ketertiban dan kenyamanan grup_ ⊹ ˚ ｡`.trim()

    return conn.sendMessage(m.chat, {
      text: txt,
      mentions: promoted
    }, { quoted: m })
  } else {
    return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Tidak ada anggota yang dapat dipromosikan (mungkin sudah berstatus Admin).\n*╰───────────────*')
  }
}

handler.help = ['promote @tag']
handler.tags = ['group']
handler.command = /^promote$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
