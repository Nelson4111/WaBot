function normalizeLimit(value) {
  if (value === null || value === undefined || value === '') return null
  const limit = Number(value)
  return Number.isFinite(limit) && limit >= 0
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(limit))
    : null
}

const FREE_DAILY_LIMIT_REWARD = 20
const FREE_DAILY_LIMIT_CAP = 50

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

export function setUserLimit(user, value) {
  const limit = normalizeLimit(value) ?? 0
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
