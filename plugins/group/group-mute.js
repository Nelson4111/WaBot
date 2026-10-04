import { areJidsSameUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isOwner, isAdmin, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di grup.')
  if (!isAdmin && !isOwner) return m.reply('Perintah ini khusus admin grup.')

  const targets = [...new Set([
    ...(m.mentionedJid || []),
    ...(m.quoted?.sender ? [m.quoted.sender] : [])
  ])]
  if (!targets.length) return m.reply(`Tag atau reply pesan pengguna. Contoh: *${usedPrefix + command} @user*`)

  const metadata = await conn.groupMetadata(m.chat)
  const members = metadata.participants || []
  const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  chat.mutedUsers = Array.isArray(chat.mutedUsers) ? chat.mutedUsers : []
  const isMute = command.toLowerCase() === 'mute'
  const changed = []
  const protectedAdmins = []

  for (const target of targets) {
    const member = members.find(participant =>
      [participant.id, participant.jid, participant.lid, participant.phoneNumber]
        .filter(Boolean)
        .some(jid => areJidsSameUser(jid, target))
    )
    if (!member) continue
    if (isMute && isAdmin && ['admin', 'superadmin'].includes(member.admin)) {
      protectedAdmins.push(member.id || member.jid || target)
      continue
    }

    const identifiers = [member.id, member.jid, member.lid, member.phoneNumber]
      .filter(Boolean)
      .flatMap(jid => [jid, conn.decodeJid?.(jid)].filter(Boolean))
    const alreadyMuted = identifiers.some(jid => chat.mutedUsers.includes(jid))
    if (isMute && !alreadyMuted) {
      chat.mutedUsers.push(...identifiers)
      changed.push(member.id || member.jid || target)
    } else if (!isMute && alreadyMuted) {
      chat.mutedUsers = chat.mutedUsers.filter(jid => !identifiers.includes(jid))
      changed.push(member.id || member.jid || target)
    }
  }

  if (!changed.length) {
    if (protectedAdmins.length) return m.reply('❌ Admin tidak bisa saling mute.')
    return m.reply(isMute ? 'Tidak ada target baru yang berhasil di-mute.' : 'Tidak ada target yang sedang di-mute.')
  }
  const mentions = [...new Set(changed)]
  const label = isMute ? 'di-mute' : 'di-unmute'
  const protectedInfo = protectedAdmins.length
    ? `\n❌ Admin tidak bisa saling mute: ${[...new Set(protectedAdmins)].map(jid => `@${jid.split('@')[0]}`).join(', ')}.`
    : ''
  return conn.reply(m.chat, `✅ ${mentions.map(jid => `@${jid.split('@')[0]}`).join(', ')} berhasil ${label}.${protectedInfo}`, m, { mentions: [...mentions, ...protectedAdmins] })
}

handler.help = ['mute @user', 'unmute @user']
handler.tags = ['group']
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler