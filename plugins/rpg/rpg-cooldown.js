import { loadDB, getUserRPG } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { RPG_CRIME_ACTIONS } from '../../lib/rpgCrimeData.js'

const COOLDOWN_TIMES = {
  kawin: 7 * 60 * 60 * 1000,
  mining: 2 * 60 * 1000,
  dungeon: 2 * 60 * 1000,
  fishing: 2 * 60 * 1000,
  adventure: 2 * 60 * 1000,
  kerja_rpg: 2 * 60 * 1000,
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

const getJakartaDate = timestamp => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(timestamp))
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
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
  if (!user) return m.reply('❌ Data RPG kamu belum tersedia.')

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

  const dailyDuration = Number(user.dailyCooldownDuration || user.rpg?.dailyCooldownDuration) || 24 * 60 * 60 * 1000
  if (account.lastDaily && account.dailyDate === getJakartaDate(now)) {
    activeCooldowns.push({ label: 'Daily', remaining: Math.max(0, getJakartaMidnight(now) - now) })
  } else {
    addCooldown(activeCooldowns, 'Daily', account.lastDaily, dailyDuration)
  }
  addCooldown(activeCooldowns, 'Kerja RPG', user.lastkerja, scaleDifficultyCooldown(user, COOLDOWN_TIMES.kerja_rpg))
  addCooldown(activeCooldowns, 'Adventure', user.lastAdventure, scaleDifficultyCooldown(user, COOLDOWN_TIMES.adventure))
  addCooldown(activeCooldowns, 'Mining', user.lastMining, scaleDifficultyCooldown(user, COOLDOWN_TIMES.mining))
  addCooldown(activeCooldowns, 'Dungeon', user.lastDungeon, scaleDifficultyCooldown(user, COOLDOWN_TIMES.dungeon))
  addCooldown(activeCooldowns, 'Fishing', user.lastFishing || user.lastMancing, scaleDifficultyCooldown(user, COOLDOWN_TIMES.fishing))
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