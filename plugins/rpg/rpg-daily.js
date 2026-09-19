import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

const getJakartaDate = (timestamp) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(timestamp))
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

let handler = async (m, { usedPrefix }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}

  const senderKey = (m.sender || '').endsWith('@lid') ? (global.lids?.[m.sender] || m.sender) : m.sender
  if (!wdb.users[senderKey]) wdb.users[senderKey] = {}
  if (!wdb.money) wdb.money = {}

  let user = wdb.users[senderKey]
  const now = Date.now()
  const cooldown = 86400000
  const today = getJakartaDate(now)

  if (user.lastDaily && user.dailyDate === today) {
    const sisa = (cooldown - (now - user.lastDaily)) / 3600000
    let cap = `╭─❏「 🎁 DAILY REWARD 」❏\n`
    cap += `│ ✅ *Status*: Sudah diklaim hari ini\n`
    cap += `│ ⏰ *Sisa*: ${sisa.toFixed(1)} jam lagi\n`
    cap += `│ 🔥 *Streak*: ${Number(user.dailyStreak) || 0} hari\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `📌 *INFO*\n> ↳ Cek lagi besok dengan *.daily*`
    return m.reply(cap)
  }

  const previousClaimDate = user.lastDaily ? getJakartaDate(user.lastDaily) : null
  const yesterday = getJakartaDate(now - cooldown)

  if (previousClaimDate && previousClaimDate === yesterday) {
    user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
  } else {
    user.dailyStreak = 1
  }

  user.dailyDate = today
  user.lastDaily = now
  user.dailySavedAt = now

  let hadiah = 50000
  let weekly = 0
  let monthly = 0

  wdb.money[senderKey] = (wdb.money[senderKey] || 0) + hadiah
  if (user.dailyStreak % 7 === 0) {
    weekly = 250000
    wdb.money[senderKey] += weekly
  }
  if (user.dailyStreak % 30 === 0) {
    monthly = 1500000
    wdb.money[senderKey] += monthly
  }

  await saveDB(wdb)

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

handler.help = ['daily', 'claim']
handler.tags = ['rpg']
handler.command = ['daily', 'claim']
export default handler
