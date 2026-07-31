import { areJidsSameUser } from '@adiwajshing/baileys'

let handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) throw '❌ Perintah ini hanya untuk grup!'
  if (!isAdmin) throw '❌ Khusus admin grup!'
  if (!isBotAdmin) throw '❌ Bot bukan admin!'

  // Ambil target dari tag atau reply
  let targets = []

  if (m.mentionedJid.length) {
    targets = m.mentionedJid
  } else if (m.quoted) {
    targets = [m.quoted.sender]
  }

  if (!targets.length)
    throw '❌ Tag atau reply user yang ingin dipromote!'

  let sukses = 0

  for (let user of targets) {
    let jid = conn.decodeJid(user)

    let member = participants.find(p =>
      areJidsSameUser(conn.decodeJid(p.id), jid)
    )

    if (!member) continue
    if (member.admin) continue

    await conn.groupParticipantsUpdate(m.chat, [jid], 'promote')
    await delay(1000)
    sukses++
  }

  if (sukses > 0) {
    await conn.reply(m.chat, '🎀 *yeyy,zeta berhasil promote user tersebut*', m)
  } else {
    await conn.reply(m.chat, '❌ Tidak ada user yang bisa dipromote', m)
  }
}

handler.help = ['promote @tag']
handler.tags = ['group']
handler.command = /^promote$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

const delay = ms => new Promise(res => setTimeout(res, ms))