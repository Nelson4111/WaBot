import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'

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

  let senderKey = m.sender || ''
  if (senderKey.endsWith('@lid')) {
    const cleanLid = senderKey.split(':')[0].replace(/@.+/, '') + '@lid'
    senderKey = (global.lids?.[senderKey] || global.lids?.[cleanLid] || global.db?.data?.lids?.[senderKey] || global.db?.data?.lids?.[cleanLid] || senderKey)
  }
  if (senderKey.includes('@s.whatsapp.net')) {
    senderKey = senderKey.split('@')[0].split(':')[0] + '@s.whatsapp.net'
  }

  if (!wdb.users[senderKey]) wdb.users[senderKey] = {}
  if (!wdb.money) wdb.money = {}

  let user = wdb.users[senderKey]
  const now = Date.now()
  const today = getJakartaDate(now)
  const rpgUser = user.rpg || user

  // Hitung waktu tepat hingga pergantian hari (pukul 00:00:00 WIB)
  const getJakartaMidnightMs = (nowMs) => {
    const wibDate = new Date(nowMs + 7 * 3600000)
    const nextMidnightWib = new Date(Date.UTC(
      wibDate.getUTCFullYear(),
      wibDate.getUTCMonth(),
      wibDate.getUTCDate() + 1,
      0, 0, 0, 0
    ))
    return nextMidnightWib.getTime() - 7 * 3600000
  }

  if (user.lastDaily && user.dailyDate === today) {
    const msUntilReset = Math.max(0, getJakartaMidnightMs(now) - now)
    const sisaJam = Math.floor(msUntilReset / 3600000)
    const sisaMenit = Math.floor((msUntilReset % 3600000) / 60000)
    let cap = `╭─❏「 🎁 DAILY REWARD 」❏\n`
    cap += `│ ✅ *Status*: Cooldown daily aktif\n`
    cap += `│ ⏰ *Klaim lagi*: ${sisaJam} jam ${sisaMenit} menit\n`
    cap += `│ 🔥 *Streak*: ${Number(user.dailyStreak) || 0} hari\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `📌 *INFO*\n> ↳ Jeda klaim mengikuti difficulty RPG kamu.`
    return m.reply(cap)
  }

  if (user.lastDaily) {
    const savedCooldown = Number(user.dailyCooldownDuration || user.rpg?.dailyCooldownDuration) || 0
    const remaining = savedCooldown - (now - user.lastDaily)
    if (remaining > 0) {
      const sisaJam = Math.floor(remaining / 3600000)
      const sisaMenit = Math.floor((remaining % 3600000) / 60000)
      return m.reply(`⏳ Cooldown daily difficulty kamu masih aktif. Klaim lagi dalam *${sisaJam} jam ${sisaMenit} menit*.`)
    }
  }

  const previousClaimDate = user.dailyDate || (user.lastDaily ? getJakartaDate(user.lastDaily) : null)
  let streakInfo = ''

  if (previousClaimDate) {
    const prevMs = Date.parse(`${previousClaimDate}T00:00:00+07:00`)
    const todayMs = Date.parse(`${today}T00:00:00+07:00`)
    const diffDays = Math.round((todayMs - prevMs) / 86400000)

    if (diffDays === 1) {
      // Klaim berturut-turut di hari berikutnya
      user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
    } else if (diffDays === 2) {
      // Terlewat 1 hari - Cek Streak Freeze
      const freezeCount = Number(user.streakFreeze || user.inventory?.streak_freeze || 0)
      if (freezeCount > 0) {
        if ((Number(user.streakFreeze) || 0) > 0) {
          user.streakFreeze -= 1
        } else if (user.inventory?.streak_freeze > 0) {
          user.inventory.streak_freeze -= 1
        }
        user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
        streakInfo = `\n🛡️ *Streak Freeze Aktif*: Kamu terlewat 1 hari kemarin, tetapi 1 Streak Freeze digunakan untuk menyelamatkan streak-mu!`
      } else {
        user.dailyStreak = 1
        streakInfo = `\n⚠️ *Streak Terputus*: Terakhir klaim ${previousClaimDate} (terlewat 1 hari). Streak dimulai kembali dari 1.`
      }
    } else if (diffDays > 2) {
      user.dailyStreak = 1
      streakInfo = `\n⚠️ *Streak Terputus*: Terakhir klaim ${previousClaimDate} (terlewat ${diffDays - 1} hari). Streak dimulai kembali dari 1.`
    } else {
      user.dailyStreak = Number(user.dailyStreak) || 1
    }
  } else {
    user.dailyStreak = 1
  }

  user.dailyDate = today
  user.lastDaily = now
  user.dailyCooldownDuration = scaleDifficultyCooldown(rpgUser, getJakartaMidnightMs(now) - now)
  user.dailySavedAt = now
  if (user.rpg) {
    user.rpg.dailyStreak = user.dailyStreak
    user.rpg.dailyDate = today
    user.rpg.lastDaily = now
    user.rpg.dailyCooldownDuration = user.dailyCooldownDuration
  }

  let hadiah = scaleDifficultyIncome(rpgUser, 50000)
  let weekly = 0
  let monthly = 0

  wdb.money[senderKey] = (wdb.money[senderKey] || 0) + hadiah
  if (user.dailyStreak % 7 === 0) {
    weekly = scaleDifficultyIncome(rpgUser, 250000)
    wdb.money[senderKey] += weekly
  }
  if (user.dailyStreak % 30 === 0) {
    monthly = scaleDifficultyIncome(rpgUser, 1500000)
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

  cap += `╰─━━━━━━━━━━━━━━─${streakInfo}\n\n`
  cap += `📌 *INFO*\n`
  cap += `> ↳ Klaim berikutnya tersedia besok setelah pukul 00:00 WIB!`

  m.reply(cap)
}

handler.help = ['daily', 'claim']
handler.tags = ['rpg']
handler.command = ['daily', 'claim']
export default handler
