import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
let handler = async (m, { usedPrefix }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
  if (!wdb.money) wdb.money = {}

  let user = wdb.users[m.sender]
  const now = Date.now()
  const cooldown = 86400000

  if (user.lastDaily && now - user.lastDaily < cooldown) {
    const sisa = (cooldown - (now - user.lastDaily)) / 3600000
    return m.reply(`╭─❏「 🎁 DAILY 」❏\n├[ Status ] Sudah diklaim hari ini\n├[ ⏰ Sisa ] ${sisa.toFixed(1)} jam lagi\n╰─━━━━━━━━━━━━━━─`)
  }

  const today = new Date(now).toISOString().slice(0, 10)
  const previousDailyDate = user.dailyDate || null
  const previousClaimDate = user.lastDaily ? new Date(user.lastDaily).toISOString().slice(0, 10) : null

  if (previousClaimDate && previousClaimDate === new Date(now - cooldown).toISOString().slice(0, 10)) {
    user.dailyStreak = (user.dailyStreak || 1) + 1
  } else {
    user.dailyStreak = 1
  }

  user.dailyDate = today
  user.lastDaily = now
  user.dailySavedAt = now

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
