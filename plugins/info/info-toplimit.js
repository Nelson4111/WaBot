import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

let handler = async (m, { conn, usedPrefix, command, groupMetadata }) => {
  let users = filterLeaderboardUsers(Object.entries(global.db.data.users), conn, ([jid]) => jid)
    .map(([jid, data]) => ({ jid, limit: data.limit || 0 }))
    .sort((a, b) => b.limit - a.limit)
    .slice(0, 10) // top 10

  if (users.length === 0) {
    return m.reply(
      `╭─❏「 🎟️ TOP LIMIT 」❏\n` +
      `│ 🏆 *PERINGKAT LIMIT PENGGUNA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Data limit masih kosong.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let teks =
    `╭─❏「 🎟️ TOP LIMIT 」❏\n` +
    `│ 🏆 *PERINGKAT LIMIT PENGGUNA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🎟️ *TOP 10 LIMIT*\n\n`

  users.forEach((user, i) => {
    const identity = getLeaderboardUserIdentity(user.jid, {
      conn,
      groupMetadata,
      name: conn.getName(user.jid)
    })

    const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`

    teks += `${rank} *${identity.display}*\n`
    teks += `> ↳ Limit: *${user.limit}*\n\n`
  })

  teks += `─━━━━━━━━━━━━━━─`

  m.reply(teks)
}

handler.help = ['toplimit', 'limit top']
handler.tags = ['info']
handler.command = /^(toplimit)$/i
handler.limit = false

export default handler