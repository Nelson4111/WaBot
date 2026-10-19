import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { claimPremiumDailyLimit, getJakartaDate } from '../../lib/userLimit.js'
import { isPremiumAccount, PREMIUM_DAILY_MIN_DONATION, PREMIUM_DAILY_REWARD } from '../../lib/rpgPremium.js'
import { sendRpgButtons } from '../../lib/rpgActionButtons.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'
import { filterRpgPanelUsers, isValidRpgUserId } from '../../lib/rpgLeaderboard.js'

let handler = async (m, { conn, groupMetadata, usedPrefix, text = '' }) => {
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

  user.dailyStreak ??= rpgUser.dailyStreak
  user.dailyDate ??= rpgUser.dailyDate
  user.lastDaily ??= rpgUser.lastDaily
  user.dailyCooldownDuration ??= rpgUser.dailyCooldownDuration
  user.dailyBrokenStreak ??= rpgUser.dailyBrokenStreak
  user.dailyRestreakOfferDate ??= rpgUser.dailyRestreakOfferDate
  user.dailyRestreakDate ??= rpgUser.dailyRestreakDate

  const subcommand = String(text).trim().toLowerCase()
  if (subcommand === 'top') {
    const rankedUsers = filterLeaderboardUsers(
      filterRpgPanelUsers(Object.entries(wdb.users), ([jid]) => jid),
      conn,
      ([jid]) => jid
    )
      .filter(([jid]) => isValidRpgUserId(jid))
      .map(([jid, player]) => ({
        jid,
        streak: Number(player.dailyStreak ?? player.rpg?.dailyStreak) || 0
      }))
      .filter(player => player.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 10)

    const entries = rankedUsers.length
      ? rankedUsers.map((player, index) => {
        const identity = getLeaderboardUserIdentity(player.jid, {
          conn,
          groupMetadata,
          name: conn?.getName?.(player.jid)
        })
        return `🏆 *${index + 1}. ${identity.display}*\n` +
          `> ↳ 🔥 Streak: ${player.streak} hari`
      }).join('\n\n')
      : 'Belum ada pemain dengan streak daily.'

    return m.reply(
      `╭─❏「 🏆 DAILY STREAK TOP 」❏\n` +
      `│ 🔥 *TOP 10 STREAK DAILY*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${entries}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (subcommand === 'restreak') {
    const previousStreak = Math.max(0, Math.floor(Number(
      user.dailyBrokenStreak || user.rpg?.dailyBrokenStreak
    ) || 0))
    const offerDate = user.dailyRestreakOfferDate || user.rpg?.dailyRestreakOfferDate ||
      (user.dailyDate === today ? user.dailyDate : null)
    const offerAvailable = previousStreak > 0 && user.dailyDate === today && offerDate === today
    if (!offerAvailable) {
      if (previousStreak > 0 && offerDate !== today) {
        delete user.dailyBrokenStreak
        delete user.dailyRestreakOfferDate
        if (user.rpg) {
          delete user.rpg.dailyBrokenStreak
          delete user.rpg.dailyRestreakOfferDate
        }
        await saveDB(wdb)
      }
      return m.reply(
        `╭─❏「 🔥 DAILY RESTREAK 」❏\n` +
        `│ ⏳ *KESEMPATAN TELAH BERAKHIR*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Restreak hanya tersedia pada hari yang sama saat streak terputus.\n` +
        `> ↳ Klaim daily berikutnya akan menutup kesempatan pemulihan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const cost = scaleDifficultyIncome(rpgUser, 50000) * 2 * previousStreak
    const balance = Number(wdb.money[senderKey]) || 0
    if (balance < cost) {
      return m.reply(
        `╭─❏「 🔥 DAILY RESTREAK 」❏\n` +
        `│ ❌ *SALDO BELUM MENCUKUPI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pulihkan streak ${previousStreak} hari dengan biaya *Rp ${cost.toLocaleString('id-ID')}*.\n` +
        `> ↳ Restreak tidak memakai cooldown; kesempatan berlaku sampai hari ini berakhir.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    wdb.money[senderKey] = balance - cost
    user.dailyStreak = previousStreak
    delete user.dailyBrokenStreak
    delete user.dailyRestreakOfferDate
    if (user.rpg) {
      user.rpg.dailyStreak = previousStreak
      delete user.rpg.dailyBrokenStreak
      delete user.rpg.dailyRestreakOfferDate
    }
    await saveDB(wdb)
    const nextStep = 'Streak tersambung kembali. Klaim daily besok untuk melanjutkannya.'
    return m.reply(
      `╭─❏「 🔥 DAILY RESTREAK 」❏\n` +
      `│ ✅ *STREAK BERHASIL DIPULIHKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Streak kembali menjadi *${previousStreak} hari*.\n` +
      `> ↳ Biaya: -Rp ${cost.toLocaleString('id-ID')} (2× hadiah daily × ${previousStreak} hari streak).\n` +
      `> ↳ ${nextStep}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

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

  if (user.dailyRestreakOfferDate && user.dailyRestreakOfferDate !== today) {
    delete user.dailyBrokenStreak
    delete user.dailyRestreakOfferDate
    if (user.rpg) {
      delete user.rpg.dailyBrokenStreak
      delete user.rpg.dailyRestreakOfferDate
    }
    await saveDB(wdb)
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
      delete user.dailyBrokenStreak
    } else if (diffDays === 2) {
      // Terlewat 1 hari - Cek Streak Freeze
      const freezeCount = Number(user.streakFreeze || user.inventory?.streak_freeze || 0)
      if (user.dailyRestreakDate === today) {
        user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
        streakInfo = `\n✅ *Restreak Aktif*: streak lama berhasil dilanjutkan.`
      } else if (freezeCount > 0) {
        if ((Number(user.streakFreeze) || 0) > 0) {
          user.streakFreeze -= 1
        } else if (user.inventory?.streak_freeze > 0) {
          user.inventory.streak_freeze -= 1
        }
        user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
        streakInfo = `\n🛡️ *Streak Freeze Aktif*: Kamu terlewat 1 hari kemarin, tetapi 1 Streak Freeze digunakan untuk menyelamatkan streak-mu!`
      } else {
        user.dailyBrokenStreak = Number(user.dailyStreak) || 0
        user.dailyRestreakOfferDate = today
        user.dailyStreak = 1
        streakInfo = `\n⚠️ *Streak Terputus*: Terakhir klaim ${previousClaimDate} (terlewat 1 hari). Streak dimulai kembali dari 1.`
      }
    } else if (diffDays > 2) {
      if (user.dailyRestreakDate === today) {
        user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
        streakInfo = `\n✅ *Restreak Aktif*: streak lama berhasil dilanjutkan.`
      } else {
        user.dailyBrokenStreak = Number(user.dailyStreak) || 0
        user.dailyRestreakOfferDate = today
        user.dailyStreak = 1
        streakInfo = `\n⚠️ *Streak Terputus*: Terakhir klaim ${previousClaimDate} (terlewat ${diffDays - 1} hari). Streak dimulai kembali dari 1.`
      }
    } else {
      user.dailyStreak = Number(user.dailyStreak) || 1
      delete user.dailyBrokenStreak
      delete user.dailyRestreakOfferDate
    }
  } else {
    user.dailyStreak = 1
    delete user.dailyBrokenStreak
    delete user.dailyRestreakOfferDate
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
    user.rpg.dailyBrokenStreak = user.dailyBrokenStreak
    if (user.dailyRestreakOfferDate) user.rpg.dailyRestreakOfferDate = user.dailyRestreakOfferDate
    else delete user.rpg.dailyRestreakOfferDate
  }

  let hadiah = scaleDifficultyIncome(rpgUser, 50000)
  let weekly = 0
  let monthly = 0
  let premiumDailyReward = 0

  wdb.money[senderKey] = (wdb.money[senderKey] || 0) + hadiah
  if (user.dailyStreak % 7 === 0) {
    weekly = scaleDifficultyIncome(rpgUser, 250000)
    wdb.money[senderKey] += weekly
  }
  if (user.dailyStreak % 30 === 0) {
    monthly = scaleDifficultyIncome(rpgUser, 1500000)
    wdb.money[senderKey] += monthly
  }

  const account = global.db?.data?.users?.[senderKey] || global.db?.data?.users?.[m.sender]
  const freeDailyLimit = account?.freeDailyLimitDate === today
    ? Number(account.freeDailyLimitAmount) || 0
    : 0
  if (
    account &&
    isPremiumAccount(account, now) &&
    Number(account.totalDonasi) >= PREMIUM_DAILY_MIN_DONATION
  ) {
    const reward = claimPremiumDailyLimit(account, now, PREMIUM_DAILY_REWARD)
    if (reward.claimed) {
      premiumDailyReward = reward.amount
      if (typeof global.db.write === 'function') await global.db.write()
    }
  }

  await saveDB(wdb)

  let cap = `╭─❏「 🎁 DAILY REWARD 」❏\n`
  cap += `│ 💰 *Daily* +Rp ${hadiah.toLocaleString()}\n`
  if (freeDailyLimit) cap += `│ 🎁 *Limit Gratis* +${freeDailyLimit} limit\n`
  if (premiumDailyReward) cap += `│ 👑 *Premium Daily* +${premiumDailyReward} limit\n`
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

  if (user.dailyBrokenStreak && user.dailyRestreakOfferDate === today) {
    const restreakCost = scaleDifficultyIncome(rpgUser, 50000) * 2 * user.dailyBrokenStreak
    cap += `\n\n🔥 Pulihkan streak ${user.dailyBrokenStreak} hari hari ini seharga *Rp ${restreakCost.toLocaleString('id-ID')}*.\n` +
      `Kesempatan berakhir saat hari berganti.`
    return sendRpgButtons(conn, {
      chat: m.chat,
      quoted: m,
      title: '🔥 STREAK TERPUTUS',
      subtitle: 'Kesempatan pulih hanya berlaku hari ini',
      text: cap,
      buttons: [[
        '🔥 Pulihkan Streak',
        `${usedPrefix || '.'}daily restreak`
      ]],
      noThumbnail: true,
      reply: fallbackText => m.reply(fallbackText)
    })
  }
  return m.reply(cap)
}

handler.help = ['daily', 'daily restreak', 'daily top', 'claim']
handler.tags = ['rpg']
handler.command = ['daily', 'claim']
export default handler
