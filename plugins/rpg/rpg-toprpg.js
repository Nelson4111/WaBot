import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { filterRpgPanelUsers, isValidRpgUserId } from '../../lib/rpgLeaderboard.js'
import { isDifficultyRanked } from '../../lib/rpgDifficulty.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

let handler = async (m, { conn, groupMetadata }) => {
  const wdb = loadDB()
  
  // Ambil semua ID user yang terdaftar
  let users = filterLeaderboardUsers(
    filterRpgPanelUsers(Object.keys(wdb.users)),
    conn
  )
    .filter(isValidRpgUserId)
    .filter(id => isDifficultyRanked(wdb.users[id]?.rpg))
  
  // Fungsi Helper untuk format Nama & Nomor
  const formatUser = (id) => {
    const identity = getLeaderboardUserIdentity(id, {
      conn,
      groupMetadata,
      name: conn.getName(id)
    })
    return identity.display
  }

  // 1. Leaderboard Berdasarkan LEVEL
  let topLevel = users
    .filter(id => wdb.users[id].rpg)
    .sort((a, b) => (wdb.users[b].rpg.level || 0) - (wdb.users[a].rpg.level || 0))
    .slice(0, 10)

  // 2. Leaderboard Berdasarkan MONEY
  let topMoney = [...users]
    .sort((a, b) => (wdb.money[b] || 0) - (wdb.money[a] || 0))
    .slice(0, 10)

  // 3. Leaderboard Berdasarkan DIAMOND
  let topDiamond = users
    .filter(id => wdb.users[id].rpg)
    .sort((a, b) => (wdb.users[b].rpg.diamond || 0) - (wdb.users[a].rpg.diamond || 0))
    .slice(0, 10)

  let text = `╭─❏「 🏆 AVELIA RPG LEADERBOARD 」❏\n`
  text += `│ 🏆 *PERINGKAT PEMAIN*\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`

  text += `🆙 *TOP 10 LEVEL*\n`
  topLevel.forEach((id, i) => {
    text += `🏆 *${i + 1}. ${formatUser(id)}*\n`
    text += `> ↳ 🆙 Level ${wdb.users[id].rpg.level}\n`
  })

  text += `\n💰 *TOP 10 KEKAYAAN*\n`
  topMoney.forEach((id, i) => {
    text += `💰 *${i + 1}. ${formatUser(id)}*\n`
    text += `> ↳ Rp ${(wdb.money[id] || 0).toLocaleString()}\n`
  })

  text += `\n💎 *TOP 10 COLLECTOR*\n`
  topDiamond.forEach((id, i) => {
    text += `💎 *${i + 1}. ${formatUser(id)}*\n`
    text += `> ↳ ${wdb.users[id].rpg.diamond || 0} Diamond\n`
  })

  text += `\n─━━━━━━━━━━━━━━─\n\n`
  text += `💡 Tingkatkan terus statusmu untuk menjadi nomor satu!`

  let pp = 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg'
  
  return sendRpgMsg(conn, m, text, 'https://files.cloudkuimages.guru/images/e0684787315c.jpeg')
}

handler.help = ['toprpg']
handler.tags = ['rpg']
handler.command = ['toprpg']

export default handler
