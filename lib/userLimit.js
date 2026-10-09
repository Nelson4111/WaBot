function normalizeLimit(value) {
  if (value === null || value === undefined || value === '') return null
  const limit = Number(value)
  return Number.isFinite(limit) && limit >= 0
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(limit))
    : null
}

const FREE_DAILY_LIMIT_REWARD = 20
const FREE_DAILY_LIMIT_CAP = 50
const LIMIT_HISTORY_MAX_ENTRIES = 50

function recordLimitHistory(user, amount, reason, now = Date.now()) {
  if (amount <= 0) return
  if (!Array.isArray(user.limitHistory)) user.limitHistory = []
  user.limitHistory.push({
    amount,
    reason: String(reason || 'Penggunaan limit').slice(0, 100),
    timestamp: now
  })
  if (user.limitHistory.length > LIMIT_HISTORY_MAX_ENTRIES) {
    user.limitHistory.splice(0, user.limitHistory.length - LIMIT_HISTORY_MAX_ENTRIES)
  }
}

export function getJakartaDate(timestamp = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(timestamp))
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function setUserLimit(user, value, reason = 'Penggunaan limit') {
  const limit = normalizeLimit(value) ?? 0
  const previousLimit = Math.max(
    normalizeLimit(user.limit) ?? 0,
    normalizeLimit(user.rpg?.limit) ?? 0
  )
  recordLimitHistory(user, previousLimit - limit, reason)
  user.limit = limit
  if (user.rpg && typeof user.rpg === 'object') user.rpg.limit = limit
  return limit
}

export function syncUserLimit(user, fallback = 100) {
  if (!user || typeof user !== 'object') return normalizeLimit(fallback) ?? 0
  const rootLimit = normalizeLimit(user.limit)
  const rpgLimit = normalizeLimit(user.rpg?.limit)
  const limit = Math.max(rootLimit ?? normalizeLimit(fallback) ?? 0, rpgLimit ?? 0)
  return setUserLimit(user, limit)
}

export function addUserLimit(user, amount) {
  const increment = normalizeLimit(amount)
  if (increment === null) throw new TypeError('Jumlah limit harus berupa angka non-negatif yang valid.')
  return setUserLimit(user, syncUserLimit(user, 0) + increment)
}

export function grantFreeDailyLimit(user, now = Date.now()) {
  const today = getJakartaDate(now)
  if (user.freeDailyLimitDate === today) {
    return { granted: false, amount: 0, limit: syncUserLimit(user, 0) }
  }

  const currentLimit = syncUserLimit(user, 0)
  const amount = currentLimit >= FREE_DAILY_LIMIT_CAP
    ? 0
    : Math.min(FREE_DAILY_LIMIT_REWARD, FREE_DAILY_LIMIT_CAP - currentLimit)
  user.freeDailyLimitDate = today
  user.freeDailyLimitAmount = amount
  const limit = amount ? addUserLimit(user, amount) : currentLimit
  return { granted: true, amount, limit }
}

export function claimPremiumDailyLimit(user, now = Date.now(), reward = 50) {
  const today = getJakartaDate(now)
  const legacyDate = Number(user.premiumDailyAt) > 0
    ? getJakartaDate(Number(user.premiumDailyAt))
    : null
  if ((user.premiumDailyDate || legacyDate) === today) {
    return { claimed: false, amount: 0, limit: syncUserLimit(user, 0) }
  }

  user.premiumDailyDate = today
  user.premiumDailyAt = now
  return { claimed: true, amount: reward, limit: addUserLimit(user, reward) }
}

export function getLimitHistoryPage(user, page = 1) {
  const history = Array.isArray(user?.limitHistory) ? user.limitHistory : []
  const newestFirst = history.slice(-LIMIT_HISTORY_MAX_ENTRIES).reverse()
  const pageCount = Math.max(1, Math.ceil(newestFirst.length / 10))
  return {
    entries: newestFirst.slice((page - 1) * 10, page * 10),
    pageCount,
    total: newestFirst.length
  }
}
