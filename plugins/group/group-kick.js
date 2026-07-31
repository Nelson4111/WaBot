import { areJidsSameUser } from '@adiwajshing/baileys'
import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

const delay = ms => new Promise(res => setTimeout(res, ms))

let handler = async (m, { conn }) => {
  let targets = []
  if (m.quoted) targets = [m.quoted.sender]
  else if (m.mentionedJid?.length) targets = m.mentionedJid
  else return

  targets = targets.filter(u => !areJidsSameUser(u, conn.user.id))
  if (!targets.length) return

  const metadata = await conn.groupMetadata(m.chat)
  const members = metadata.participants.map(p => p.id)

  for (let user of targets) {
    if (!members.includes(user)) continue
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      await delay(500)
    } catch {}
  }

  try {
    const res = await fetch('https://files.cloudkuimages.guru/images/530956c488bc.webp')
    const buffer = await res.buffer()
    const sticker = new Sticker(buffer, {
      pack: 'Group Admin',
      author: 'Bot',
      quality: 80
    })
    await conn.sendMessage(m.chat, { sticker: await sticker.toBuffer() }, { quoted: m })
  } catch {}
}

handler.help = ['kick @user']
handler.tags = ['group']
handler.command = /^(kick|dor)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler