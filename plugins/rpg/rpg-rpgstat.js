import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  
  // Ambil semua data user
  let users = Object.entries(wdb.users)
  let totalUsers = users.length
  
  // Variabel penampung statistik
  let totalMoney = 0
  let totalIron = 0
  let totalGold = 0
  let totalLevel = 0
  let highestLevel = 0
  let topPlayer = 'Tidak ada'

  // Hitung saldo global dari wdb.money
  const moneyDB = wdb.money || {}
  users.forEach(([jid, data]) => {
    totalMoney += Number(moneyDB[jid] ?? data.money ?? data.rpg?.money ?? 0)
  })

  // Hitung statistik material dan level
  users.forEach(([jid, data]) => {
    if (data.rpg) {
      totalIron += (data.rpg.iron || 0)
      totalGold += (data.rpg.gold || 0)
      totalLevel += (data.rpg.level || 1)
      
      if (data.rpg.level > highestLevel) {
        highestLevel = data.rpg.level
        topPlayer = data.name || jid.split('@')[0]
      }
    }
  })

  let avgLevel = (totalLevel / totalUsers).toFixed(1)
  let pp = await conn.profilePictureUrl(conn.user.jid, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')

  let cap = `╭─❏「 📊 RPG GLOBAL STATS 」❏\n`
cap += `│ 📊 *STATISTIK RPG GLOBAL*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `🌎 *DATA DUNIA*\n`
cap += `> 👥 *Jumlah Pemain*\n`
cap += `> ↳ ${totalUsers} User\n\n`
cap += `> 💰 *Uang Terkumpul*\n`
cap += `> ↳ Rp ${totalMoney.toLocaleString()}\n\n`
cap += `> ⛏️ *Iron Terkumpul*\n`
cap += `> ↳ ${totalIron.toLocaleString()}\n\n`
cap += `> ✨ *Gold Terkumpul*\n`
cap += `> ↳ ${totalGold.toLocaleString()}\n\n`

cap += `─━━━━━━━━━━━━━━─\n\n`

cap += `🏆 *WORLD RECORD*\n`
cap += `> ↳ 🏆 Pemain Terkuat: ${topPlayer}\n`
cap += `> ↳ 📈 Level Tertinggi: Lv.${highestLevel}\n`
cap += `> ↳ 📚 Rata-rata Level: Lv.${avgLevel}\n\n`

cap += `─━━━━━━━━━━━━━━─\n\n`
cap += `📌 *INFO*\n`
cap += `> ↳ Statistik dari database pusat AVELIA RPG.`

  return sendRpgMsg(conn, m, cap, pp)
}

handler.help = ['rpgstat']
handler.tags = ['rpg']
handler.command = ['rpgstat', 'rpgstats']

export default handler
