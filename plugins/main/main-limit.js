import { handleLimitSubcommand } from '../../lib/limitShop.js'
import { syncUserLimit } from '../../lib/userLimit.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const subcommandResult = await handleLimitSubcommand(m, text, prefix)
  if (subcommandResult !== false) return subcommandResult

  let rawNumber = text ? text.replace(/[^0-9]/g, '') : ''
  const botJid = conn.decodeJid(conn.user?.id || conn.user?.jid || '')
  let who
  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0]
  } else if (rawNumber && rawNumber.length >= 10) {
    who = rawNumber + '@s.whatsapp.net'
  } else if (m.quoted && m.quoted.sender && !m.quoted.fromMe && conn.decodeJid(m.quoted.sender) !== botJid) {
    who = m.quoted.sender
  } else {
    who = m.fromMe ? conn.user.jid : m.sender
  }
  who = conn.decodeJid(who)

  let user = global.db.data.users[who] || {}
  let limit = syncUserLimit(user)
  let isSelf = who === m.sender

 let caption =
  `╭─❏「 🎟️ AVELIA LIMIT 」❏\n` +
  `│ 🎟️ *LIMIT KAMU*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `👤 *USER*\n` +
  `> ↳ User: @${who.split('@')[0]}\n` +
  `> ↳ Sisa Limit: *${limit}* Limit\n\n` +
  `📌 *INFORMASI*\n` +
  `> ↳ ${isSelf ? `Gunakan ${prefix}limit buy untuk membeli limit.` : 'Pengguna ini memiliki ' + limit + ' limit.'}\n` +
  `${isSelf ? `> ↳ Fitur sticker, maker, dan downloader memakai 1 limit per penggunaan, termasuk untuk Premium.\n> ↳ Gunakan ${prefix}limit guide untuk panduan.\n` : ''}\n` +
  `─━━━━━━━━━━━━━━─`
  await conn.reply(m.chat, caption, m, { mentions: [who] })
}

handler.help = ['limit', 'limit buy', 'limit price', 'limit pricelist', 'limit guide', 'limit command', 'ceklimit']
handler.tags = ['info', 'main']
handler.command = /^(limit|ceklimit)$/i
handler.limit = false

export default handler