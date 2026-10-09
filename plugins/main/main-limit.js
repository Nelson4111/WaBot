import { handleLimitSubcommand } from '../../lib/limitShop.js'
import { getLimitHistoryPage, syncUserLimit } from '../../lib/userLimit.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

let handler = async (m, { conn, text, usedPrefix, groupMetadata }) => {
  const prefix = usedPrefix || '.'
  const [mode = '', ...params] = String(text || '').trim().split(/\s+/).filter(Boolean)
  if (mode.toLowerCase() === 'top') {
    const users = filterLeaderboardUsers(Object.entries(global.db.data.users), conn, ([jid]) => jid)
      .map(([jid, data]) => ({
        jid,
        limit: Math.max(Number(data?.limit) || 0, Number(data?.rpg?.limit) || 0)
      }))
      .filter(user => user.limit > 0)
      .sort((first, second) => second.limit - first.limit)
      .slice(0, 10)
    if (!users.length) {
      return m.reply(
        `╭─❏「 🏆 TOP LIMIT 」❏\n` +
        `│ Belum ada limit tersimpan.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }
    const body = users.map((user, index) => {
      const identity = getLeaderboardUserIdentity(user.jid, { conn, groupMetadata, name: conn.getName(user.jid) })
      return `> ${index + 1}. *${identity.display}* — ${user.limit.toLocaleString('id-ID')} limit`
    }).join('\n')
    return m.reply(
      `╭─❏「 🏆 TOP LIMIT 」❏\n` +
      `│ Top ${users.length} pengguna dengan limit terbanyak\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${body}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (['history', 'riwayat'].includes(mode.toLowerCase())) {
    if (params.length > 1) return m.reply(`Format: ${prefix}limit history [halaman]`)
    const page = params.length ? Number(params[0]) : 1
    if (!Number.isSafeInteger(page) || page < 1) {
      return m.reply(`Format: ${prefix}limit history [halaman]`)
    }
    const user = global.db.data.users[m.sender]
    const { entries, pageCount, total } = getLimitHistoryPage(user, page)
    if (page > pageCount) return m.reply(`Halaman tidak tersedia. Maksimal ${pageCount}.`)
    const body = entries.length
      ? entries.map((entry, index) => {
        const timestamp = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          dateStyle: 'short',
          timeStyle: 'short'
        }).format(new Date(Number(entry.timestamp)))
        return `> ${(page - 1) * 10 + index + 1}. *-${Number(entry.amount).toLocaleString('id-ID')} limit* — ${entry.reason}\n> ↳ ${timestamp} WIB`
      }).join('\n')
      : '> Belum ada limit yang digunakan.'
    return m.reply(
      `╭─❏「 📜 RIWAYAT LIMIT 」❏\n` +
      `│ Pengeluaran tersimpan: ${total}/50\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${body}\n\n` +
      `Halaman ${page}/${pageCount}\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

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

handler.help = ['limit', 'limit buy', 'limit price', 'limit pricelist', 'limit guide', 'limit command', 'limit history [halaman]', 'limit riwayat [halaman]', 'limit top', 'ceklimit']
handler.tags = ['info', 'main']
handler.command = /^(limit|ceklimit)$/i
handler.limit = false

export default handler