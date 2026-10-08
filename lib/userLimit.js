function normalizeLimit(value) {
  if (value === null || value === undefined || value === '') return null
  const limit = Number(value)
  return Number.isFinite(limit) && limit >= 0
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(limit))
    : null
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
