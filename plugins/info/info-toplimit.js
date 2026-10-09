import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

let handler = async (m, { conn, usedPrefix, command, groupMetadata }) => {
  let users = filterLeaderboardUsers(Object.entries(global.db.data.users), conn, ([jid]) => jid)
    .map(([jid, data]) => ({ jid, limit: data.limit || 0 }))
    .sort((a, b) => b.limit - a.limit)
    .slice(0, 10) // top 10

  if (users.length === 0) return m.reply('❌ Data limit kosong.')

  let teks = `🏆 *Top Limit User*\n\n`
  users.forEach((user, i) => {
    const identity = getLeaderboardUserIdentity(user.jid, { conn, groupMetadata, name: conn.getName(user.jid) })
    teks += `${i + 1}. *${identity.display}* — ${user.limit} limit\n`
  })

  m.reply(teks)
}

handler.help = ['toplimit', 'limit top']
handler.tags = ['info']
handler.command = /^(toplimit)$/i
handler.limit = false

export default handler