let handler = async (m, { conn, usedPrefix, command }) => {
  let users = Object.entries(global.db.data.users)
    .map(([jid, data]) => ({ jid, limit: data.limit || 0 }))
    .sort((a, b) => b.limit - a.limit)
    .slice(0, 10) // top 10

  if (users.length === 0) return m.reply('❌ Data limit kosong.')

  let teks = `🏆 *Top Limit User*\n\n`
  users.forEach((user, i) => {
    let name = (conn.getName ? conn.getName(user.jid) : user.jid) || user.jid
    teks += `${i + 1}. *${name}* — ${user.limit} limit\n`
  })

  m.reply(teks)
}

handler.help = ['toplimit', 'limit top']
handler.tags = ['info']
handler.command = /^(toplimit)$/i
handler.limit = false

export default handler