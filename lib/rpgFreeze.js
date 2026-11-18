import { getRpgWibDateKey } from './rpgTime.js'

const isHistoricalField = key => /^(?:history|logs?|transactions?|donations?)$/i.test(key)
const isTimestampField = key =>
  /(?:at|until|timestamp|deadline|expires|expiry|started|starttime|endtime|completetime)$/i.test(key) ||
  /^last[a-z]/i.test(key) ||
  /^(?:waktuTanam|selesai|lastkerja)$/i.test(key)

export function getRpgFreezeRecord(account) {
  const record = account?.rpgFreeze
  const startedAt = Number(record?.startedAt)
  return Number.isFinite(startedAt) && startedAt > 0 ? record : null
}

export function isRpgFrozen(account) {
  return Boolean(getRpgFreezeRecord(account))
}

export function findFrozenRpgAccount(jids, users = global.db?.data?.users || {}) {
  for (const jid of [...new Set(jids.filter(Boolean))]) {
    const account = users[jid]
    const record = getRpgFreezeRecord(account)
    if (record) return { jid, account, record }
  }
  return null
}

export function formatRpgFreezeDuration(milliseconds) {
  const seconds = Math.floor(Math.max(0, Number(milliseconds) || 0) / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  const parts = []
  if (days) parts.push(`${days} hari`)
  if (hours) parts.push(`${hours} jam`)
  if (minutes) parts.push(`${minutes} menit`)
  if (!parts.length) parts.push(`${remainingSeconds} detik`)
  return parts.join(' ')
}

export function getRpgFreezeNotice(account, now = Date.now()) {
  const record = getRpgFreezeRecord(account)
  if (!record) return null
  return `🧊 Akun RPG sedang dibekukan selama *${formatRpgFreezeDuration(now - Number(record.startedAt))}*.`
}

export async function rejectFrozenRpgAccounts(m, jids, users = global.db?.data?.users || {}) {
  const frozen = findFrozenRpgAccount(jids, users)
  if (!frozen) return false
  await m.reply(
    `${getRpgFreezeNotice(frozen.account)}\n> ↳ Aksi dibatalkan agar data RPG tetap dijeda.`,
    null,
    { mentions: [frozen.jid] }
  )
  return true
}

function shiftTimestamps(value, offset, seen = new WeakSet(), timerMap = false) {
  if (!value || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)

  for (const [key, nested] of Object.entries(value)) {
    if (isHistoricalField(key)) continue
    const isTimerMap = timerMap || /cooldown|timer|deadline|expiry/i.test(key)
    if (typeof nested === 'number' && Number.isFinite(nested) && nested >= 10000000000 &&
        (timerMap || isTimestampField(key))) {
      value[key] = nested + offset
    } else if (nested && typeof nested === 'object') {
      shiftTimestamps(nested, offset, seen, isTimerMap)
    }
  }
}

function shiftDailyDate(account, startedAt, now) {
  const freezeDate = getRpgWibDateKey(startedAt)
  const today = getRpgWibDateKey(now)
  const yesterday = getRpgWibDateKey(now - 86400000)
  for (const profile of [account, account.rpg]) {
    if (typeof profile?.dailyDate !== 'string') continue
    profile.dailyDate = profile.dailyDate >= freezeDate ? today : yesterday
  }
}

export function pauseRpgTimers(account, startedAt, now = Date.now()) {
  const offset = Math.max(0, now - Number(startedAt))
  if (!Number.isFinite(offset) || offset === 0) return
  const profile = account.rpg && typeof account.rpg === 'object' ? account.rpg : account
  shiftTimestamps(profile, offset)
  if (profile !== account) {
    for (const key of ['lastDaily', 'lastdaily', 'dailyCooldownAt']) {
      const timestamp = Number(account[key])
      if (Number.isFinite(timestamp) && timestamp >= 10000000000) account[key] = timestamp + offset
    }
  }
  shiftDailyDate(account, Number(startedAt), now)
}
