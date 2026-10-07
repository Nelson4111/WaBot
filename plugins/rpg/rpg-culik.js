import { loadDB, getUserRPG } from '../../lib/waifuHelper.js'
import { RPG_CRIME_ACTIONS } from '../../lib/rpgCrimeData.js'
import { runRpgCrimeAction } from '../../lib/rpgCrimeAction.js'

let handler = async (m, { conn }) => {
  const db = loadDB()
  const user = getUserRPG(db, m.sender)
  if (!user?.rpg) return m.reply('❌ Kamu belum punya data RPG. Mulai dengan *.adventure*')

  return runRpgCrimeAction({
    m,
    conn,
    db,
    userRPG: user.rpg,
    targetJid: m.mentionedJid?.[0] || m.quoted?.sender,
    action: 'culik',
    config: RPG_CRIME_ACTIONS.culik
  })
}

handler.help = ['culik (reply)']
handler.tags = ['rpg']
handler.command = /^(culik)$/i
handler.alias = ['culik']
handler.group = true

export default handler
