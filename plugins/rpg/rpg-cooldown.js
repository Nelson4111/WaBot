import { sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, getUserRPG } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { RPG_CRIME_ACTIONS } from '../../lib/rpgCrimeAction.js'
import { RPG_ILLEGAL_COOLDOWN_MULTIPLIER } from '../../lib/rpgIlegal.js'
import { getGroupTotemBuff } from '../../lib/rpg-totemData.js'

const COOLDOWN_TIMES = {
  kawin: 7 * 60 * 60 * 1000,
  mining: 2 * 60 * 1000,
  dungeon: 2 * 60 * 1000,
  fishing: 2 * 60 * 1000,
  adventure: 2 * 60 * 1000,
  kerja_rpg: 5 * 60 * 1000,
}

const LABELS = {
  kawin: 'Kawin ternak',
  mining: 'Mining',
  dungeon: 'Dungeon',
  fishing: 'Fishing',
  adventure: 'Adventure',
  kerja_rpg: 'Kerja RPG',
}

const formatRemaining = milliseconds => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (days) parts.push(`${days}hari`)
  if (hours) parts.push(`${hours}j`)
  if (minutes) parts.push(`${minutes}m`)
  if (!days && !hours && !minutes) parts.push(`${seconds}detik`)
  return parts.join(' ')
}

const normalizeTimestamp = timestamp => {
  const value = Number(timestamp) || 0
  return value > 0 && value < 1e12 ? value * 1000 : value
}

const getJakartaMidnight = timestamp => {
  const date = new Date(timestamp + 7 * 3600000)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1) - 7 * 3600000
}

const addCooldown = (list, label, timestamp, duration) => {
  const normalizedTimestamp = normalizeTimestamp(timestamp)
  const normalizedDuration = Number(duration) || 0
  if (!normalizedTimestamp || !normalizedDuration) return false
  const remaining = normalizedTimestamp + normalizedDuration - Date.now()
  if (remaining > 0) {
    list.push({ label, remaining })
    return true
  }
  return false
}

const handler = async (m, { usedPrefix }) => {
  const wdb = loadDB()
  const userData = getUserRPG(wdb, m.sender)
  const user = userData?.rpg || userData
  const account = wdb.users?.[m.sender] || {}
  const now = Date.now()
  if (!user) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Data RPG kamu belum tersedia.')

  const cooldowns = user.cooldown || {}
  const activeCooldowns = []
  const expiredKeys = new Set()

  const seen = new Set()
  for (const [key, duration] of Object.entries(COOLDOWN_TIMES)) {
    for (const [cooldownKey, timestamp] of Object.entries(cooldowns)) {
      if (cooldownKey === key || cooldownKey.startsWith(key)) {
        const id = `${cooldownKey}:${timestamp}`
        if (seen.has(id)) continue
        seen.add(id)
        const suffix = cooldownKey.slice(key.length)
        const label = suffix ? `${LABELS[key]} ${Number(suffix) + 1 || suffix}` : LABELS[key]
        if (!addCooldown(activeCooldowns, label, timestamp, scaleDifficultyCooldown(user, duration))) expiredKeys.add(cooldownKey)
      }
    }
  }

  const lastDaily = normalizeTimestamp(account.lastDaily || user.lastDaily)
  const dailyRemaining = lastDaily ? getJakartaMidnight(lastDaily) - now : 0
  if (dailyRemaining > 0) activeCooldowns.push({ label: 'Daily', remaining: dailyRemaining })
  const appliedJobs = Array.isArray(user.appliedJobs) ? user.appliedJobs : []
  const activeJobs = Array.isArray(user.activeJobNames)
    ? user.activeJobNames
    : [user.currentJobName].filter(jobName => appliedJobs.includes(jobName))
  const jobReadyAt = user.jobWorkCooldowns && typeof user.jobWorkCooldowns === 'object'
    ? user.jobWorkCooldowns
    : null
  let jobCooldownRemaining = []
  if (jobReadyAt) {
    jobCooldownRemaining = activeJobs
      .map(jobName => Math.max(0, (Number(jobReadyAt[jobName]) || 0) - now))
      .filter(remaining => remaining > 0)
  } else if (Number(user.lastkerja)) {
    const legacyRemaining = Math.max(
      0,
      Number(user.lastkerja) +
        scaleDifficultyCooldown(
          user,
          COOLDOWN_TIMES.kerja_rpg * Math.max(1, Number(user.lastkerjaJobCount) || 1)
        ) -
        now
    )
    if (legacyRemaining > 0) jobCooldownRemaining = [legacyRemaining]
  }
  if (jobCooldownRemaining.length) {
    activeCooldowns.push({
      label: 'Kerja RPG',
      remaining: Math.min(...jobCooldownRemaining)
    })
  }
  addCooldown(activeCooldowns, 'Adventure', user.lastAdventure, scaleDifficultyCooldown(user, COOLDOWN_TIMES.adventure))
  addCooldown(activeCooldowns, 'Mining', user.lastMining, scaleDifficultyCooldown(user, COOLDOWN_TIMES.mining))
  addCooldown(activeCooldowns, 'Dungeon', user.lastDungeon, scaleDifficultyCooldown(user, COOLDOWN_TIMES.dungeon))
  addCooldown(activeCooldowns, 'Fishing', user.lastFishing || user.lastMancing, scaleDifficultyCooldown(user, COOLDOWN_TIMES.fishing))
  const illegalActivities = {
    Adventure: { label: 'Adventure', duration: COOLDOWN_TIMES.adventure, totem: 'adventure' },
    Mining: { label: 'Mining', duration: COOLDOWN_TIMES.mining, totem: 'mining' },
    Fishing: { label: 'Fishing', duration: COOLDOWN_TIMES.fishing, totem: 'fishing' },
    Diving: { label: 'Diving', duration: 2 * 60 * 1000, totem: 'fishing' },
    Logging: { label: 'Logging', duration: 2 * 60 * 1000, totem: 'mining' },
    Explore: { label: 'Explore', duration: 15 * 60 * 1000, totem: 'explore' },
    Farming: { label: 'Farming', duration: 2 * 60 * 1000, totem: 'livestock' }
  }
  for (const [activity, config] of Object.entries(illegalActivities)) {
    addCooldown(
      activeCooldowns,
      `Usaha ilegal ${config.label}`,
      user[`lastIllegal${activity}`] || user[`lastShortcut${activity}`],
      scaleDifficultyCooldown(user, config.duration) *
        getGroupTotemBuff(wdb.data, m.chat, config.totem, 'cooldown') *
        RPG_ILLEGAL_COOLDOWN_MULTIPLIER
    )
  }
  for (const [action, config] of Object.entries(RPG_CRIME_ACTIONS)) {
    addCooldown(
      activeCooldowns,
      config.label,
      user[`last${action}`],
      scaleDifficultyCooldown(user, config.cooldown)
    )
  }

  for (const key of expiredKeys) delete cooldowns[key]
  if (expiredKeys.size) saveDB(wdb)

  const ready = [...Object.values(LABELS), ...Object.values(RPG_CRIME_ACTIONS).map(({ label }) => label), 'Daily']
    .filter(label => !activeCooldowns.some(item => item.label === label))

  activeCooldowns.sort((first, second) => first.remaining - second.remaining)
let message = `╭─❏「 ⏰ COOLDOWN RPG 」❏\n`
message += `│ 📋 *STATUS COOLDOWN*\n`
message += `╰─━━━━━━━━━━━━━━─\n\n`

if (activeCooldowns.length === 0) {
  message += `✅ *Tidak ada cooldown aktif.*\n`
} else {
  for (const cooldown of activeCooldowns) {
    message += `> ⏳ *${cooldown.label}*\n`
    message += `> ↳ ${formatRemaining(cooldown.remaining)}\n\n`
  }
}

message += `\n✅ *READY*\n> ↳ ${ready.length ? ready.join(', ') : 'Tidak ada'}\n`
message += `\n💕 Untuk cooldown relationship, gunakan *.rship cd*.\n`

const pendingBreeding = wdb.temp?.kawin?.[m.sender]

if (pendingBreeding) {
  message += `⚠️ *KAWIN*\n`
  message += `> ↳ Menunggu *.kawin proses*\n\n`
}

if (global.icuTernak?.[m.sender]) {
  message += `🏥 *ICU TERNAK*\n`
  message += `> ↳ Status: Aktif\n\n`
}

message += `─━━━━━━━━━━━━━━─`

return m.reply(message)
}

handler.help = ['cooldown', 'cd']
handler.tags = ['rpg']
handler.command = ['cooldown', 'cd']

export default handler