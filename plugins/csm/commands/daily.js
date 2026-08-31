/**
 * CSM Periodic Rewards: hourly, daily, weekly, monthly
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { header } from '../lib/utils.js'

export async function handleDaily(ctx) {
  const { m, csm, wdb, action } = ctx
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay

  let claimKey = ''
  let streakKey = ''
  let rewardBlood = 0
  let headerTitle = ''
  let cooldownTime = 0

  if (action === 'hourly') {
    claimKey = 'hourlyDate'
    streakKey = 'hourlyStreak'
    rewardBlood = 1500
    headerTitle = 'HOURLY REWARD (JAM-AN)'
    cooldownTime = oneHour
  } else if (action === 'daily') {
    claimKey = 'dailyDate'
    streakKey = 'dailyStreak'
    rewardBlood = 10000
    headerTitle = 'DAILY REWARD (HARIAN)'
    cooldownTime = oneDay
  } else if (action === 'weekly') {
    claimKey = 'weeklyDate'
    streakKey = 'weeklyStreak'
    rewardBlood = 75000
    headerTitle = 'WEEKLY REWARD (MINGGUAN)'
    cooldownTime = oneWeek
  } else if (action === 'monthly') {
    claimKey = 'monthlyDate'
    streakKey = 'monthlyStreak'
    rewardBlood = 350000
    headerTitle = 'MONTHLY REWARD (BULANAN)'
    cooldownTime = oneMonth
  }

  const lastClaim = Number(csm[claimKey] || 0)
  const timeLeft = cooldownTime - (now - lastClaim)

  if (timeLeft > 0) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    let timeString = ''
    if (hours > 0) timeString += `${hours} jam `
    if (minutes > 0 || hours > 0) timeString += `${minutes} menit `
    timeString += `${seconds} detik`

    return m.reply(
      header(`${headerTitle} - COOLDOWN`) +
      `Reward ini sudah diklaim sebelumnya.\n\n` +
      `> ⏳ Sisa waktu tunggu: ${timeString}\n` +
      `|━━━━━━━━━━━`
    )
  }

  csm[claimKey] = now
  csm[streakKey] = Number(csm[streakKey] || 0) + 1

  const finalReward = rewardBlood + (Math.min(20, csm[streakKey] - 1) * (rewardBlood * 0.05))
  csm.blood += Math.floor(finalReward)

  saveDB(wdb)

  return m.reply(
    header(headerTitle + ' DIAMBIL') +
    `> 🩸 +${Math.floor(finalReward).toLocaleString()} Blood\n` +
    `> 🔥 Streak: ${csm[streakKey]}x\n` +
    `> 📅 Klaim berikutnya setelah cooldown berakhir.\n` +
    `|━━━━━━━━━━━`
  )
}
