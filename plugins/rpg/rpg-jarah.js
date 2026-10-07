import { loadDB, getUserRPG } from '../../lib/waifuHelper.js'
import { RPG_CRIME_ACTIONS } from '../../lib/rpgCrimeData.js'
import { runRpgCrimeAction } from '../../lib/rpgCrimeAction.js'

let handler = async (m, { conn, args = [] }) => {
  const db = loadDB()
  const user = getUserRPG(db, m.sender)
  if (!user?.rpg) return m.reply('❌ Kamu belum punya data RPG. Mulai dengan *.adventure*')

  return runRpgCrimeAction({
    m,
    conn,
    db,
    userRPG: user.rpg,
    targetJid: m.mentionedJid?.[0] || m.quoted?.sender,
    action: 'jarah',
    config: RPG_CRIME_ACTIONS.jarah,
    itemSelector: args.filter(argument => !String(argument).startsWith('@')).join(' ')
  })
}

handler.help = ['jarah @user [furniture]', 'jarah (reply) [furniture]']
handler.tags = ['rpg']
handler.command = /^(jarah)$/i
handler.alias = ['jarah']
handler.group = true

export default handler
