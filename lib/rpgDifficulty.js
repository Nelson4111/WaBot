export const DIFFICULTY_COOLDOWN = 7 * 24 * 60 * 60 * 1000

export const RPG_DIFFICULTIES = Object.freeze({
  peaceful: {
    name: 'Peaceful',
    income: 0.3,
    xp: 0.3,
    cooldown: 0.3,
    damageDealt: 0.75,
    damageReceived: 0.5,
    crimeSuccess: 0,
    leaderboard: false
  },
  easy: {
    name: 'Easy',
    income: 0.5,
    xp: 0.5,
    cooldown: 0.5,
    damageDealt: 1.05,
    damageReceived: 0.75,
    crimeSuccess: 0.1,
    leaderboard: true
  },
  normal: {
    name: 'Normal',
    income: 1,
    xp: 1,
    cooldown: 1,
    damageDealt: 1,
    damageReceived: 1,
    crimeSuccess: 0,
    leaderboard: true
  },
  hardcore: {
    name: 'Hardcore',
    income: 1.5,
    xp: 1.5,
    cooldown: 1.5,
    damageDealt: 1.1,
    damageReceived: 1.5,
    crimeSuccess: -0.1,
    leaderboard: true
  },
  nightmare: {
    name: 'Nightmare',
    income: 1.7,
    xp: 1.7,
    cooldown: 1.7,
    damageDealt: 1.25,
    damageReceived: 2,
    crimeSuccess: -0.2,
    leaderboard: true
  }
})

export function normalizeDifficulty(value) {
  const normalized = String(value || '').trim().toLowerCase()
  const key = normalized === 'hard'
    ? 'hardcore'
    : normalized === 'nighmare'
      ? 'nightmare'
      : normalized
  return Object.hasOwn(RPG_DIFFICULTIES, key) ? key : null
}

export function getDifficulty(user) {
  return normalizeDifficulty(user?.difficulty) || 'normal'
}

export function getDifficultyProfile(user) {
  return RPG_DIFFICULTIES[getDifficulty(user)]
}

export function getDifficultyCooldownRemaining(user, now = Date.now()) {
  const changedAt = Number(user?.difficultyChangedAt) || 0
  return changedAt ? Math.max(0, DIFFICULTY_COOLDOWN - (now - changedAt)) : 0
}

export function scaleDifficultyDamage(user, amount, direction = 'received') {
  const multiplier = direction === 'dealt'
    ? getDifficultyProfile(user).damageDealt
    : getDifficultyProfile(user).damageReceived
  return Math.max(0, Math.floor((Number(amount) || 0) * multiplier))
}

export function scaleDifficultyXP(user, amount) {
  return Math.max(0, Math.floor((Number(amount) || 0) * getDifficultyProfile(user).xp))
}

export function scaleDifficultyIncome(user, amount) {
  return Math.max(0, Math.floor((Number(amount) || 0) * getDifficultyProfile(user).income))
}

export function scaleDifficultyCooldown(user, duration) {
  const premiumMultiplier = user?.premium === true ? 0.8 : 1
  return Math.max(0, Math.floor((Number(duration) || 0) * getDifficultyProfile(user).cooldown * premiumMultiplier))
}

export function adjustCrimeSuccessChance(user, chance) {
  if (getDifficulty(user) === 'peaceful') return 0
  return Math.min(1, Math.max(0, (Number(chance) || 0) + getDifficultyProfile(user).crimeSuccess))
}

export function getCrimeRestriction(user, { target = false } = {}) {
  if (!user) return null
  if (!target && user.rehabilitation?.status === 'active') {
    return '🕊️ Kamu sedang menjalani rehabilitasi dan tidak bisa melakukan tindak kriminal.'
  }
  if (Number(user.darah) <= 0) {
    return target
      ? '💀 Target masih mati. Gunakan *.heal* terlebih dahulu.'
      : '💀 Kamu masih mati dan tidak bisa melakukan tindak kriminal. Gunakan *.heal* terlebih dahulu.'
  }
  if (getDifficulty(user) === 'peaceful') {
    return target
      ? '🕊️ Target memilih mode Peaceful dan tidak bisa menjadi sasaran tindak kriminal.'
      : '🕊️ Mode Peaceful tidak mengizinkan tindak kriminal.'
  }
  return null
}

export function isDifficultyRanked(user) {
  return getDifficultyProfile(user).leaderboard
}