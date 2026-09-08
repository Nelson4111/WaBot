import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
let handler = async (m, { usedPrefix }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
  if (!wdb.money) wdb.money = {}
  let user = wdb.users[m.sender]
  
  let cooldown = 86400000 // 24 Jam
  if (Date.now() - (user.lastDaily || 0) < cooldown) {
    let sisa = (cooldown - (Date.now() - user.lastDaily)) / 3600000
    return m.reply(`╭─❏「 🎁 DAILY 」❏\n├[ Status ] Sudah diklaim hari ini\n├[ ⏰ Sisa ] ${sisa.toFixed(1)} jam lagi\n╰─━━━━━━━━━━━━━━─`)
  }

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - cooldown).toISOString().slice(0, 10)
  user.dailyStreak = user.dailyDate === yesterday ? (user.dailyStreak || 0) + 1 : 1
  user.dailyDate = today
  let hadiah = 50000
  let weekly = 0
  let monthly = 0
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hadiah
  if (user.dailyStreak % 7 === 0) {
    weekly = 250000
    wdb.money[m.sender] += weekly
  }
  if (user.dailyStreak % 30 === 0) {
    monthly = 1500000
    wdb.money[m.sender] += monthly
  }
  user.lastDaily = Date.now()
  user.dailySavedAt = Date.now()
  saveDB(wdb)
let cap = `╭─❏「 🎁 DAILY REWARD 」❏\n`
cap += `│ 💰 *Daily* +Rp ${hadiah.toLocaleString()}\n`
cap += `│ 🔥 *Streak* ${user.dailyStreak} hari\n`

if (weekly) {
  cap += `│ 🏆 *Weekly* +Rp ${weekly.toLocaleString()}\n`
}

if (monthly) {
  cap += `│ 👑 *Monthly* +Rp ${monthly.toLocaleString()}\n`
}

cap += `╰─━━━━━━━━━━━━━━─\n\n`
cap += `📌 *INFO*\n`
cap += `> ↳ Cek lagi besok dengan *.daily*`

m.reply(cap)
}

handler.help = ['daily']
handler.tags = ['rpg']
handler.command = ['daily']
export default handler
