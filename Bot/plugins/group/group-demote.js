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
    throw '❌ Tag atau reply admin yang ingin didemote!'

  let sukses = 0

  for (let user of targets) {
    let jid = conn.decodeJid(user)

    let member = participants.find(p =>
      areJidsSameUser(conn.decodeJid(p.id), jid)
    )

    if (!member) continue
    if (!member.admin) continue

    await conn.groupParticipantsUpdate(m.chat, [jid], 'demote')
    await delay(1000)
    sukses++
  }

  if (sukses > 0) {
    await conn.reply(m.chat, '✨ *zeta berhasil demote*', m)
  } else {
    await conn.reply(m.chat, '❌ Tidak ada admin yang bisa didemote', m)
  }
}

handler.help = ['demote @tag']
handler.tags = ['group']
handler.command = /^demote$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

const delay = ms => new Promise(res => setTimeout(res, ms))