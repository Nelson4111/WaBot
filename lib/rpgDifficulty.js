import { getEvonexusAbilityModifiers } from './rpg-evonexusData.js'

export const DIFFICULTY_COOLDOWN = 7 * 24 * 60 * 60 * 1000
export const PREMIUM_DIFFICULTY_CHANGES_PER_WEEK = 2

export function getDifficultyWeekKey(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(now))
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  const weekStart = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)))
  const daysSinceMonday = (weekStart.getUTCDay() + 6) % 7
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday)
  return weekStart.toISOString().slice(0, 10)
}

function getDifficultyChangesThisWeek(user, now = Date.now()) {
  const weekKey = getDifficultyWeekKey(now)
  if (user?.difficultyChangeWeek === weekKey) {
    return Math.max(0, Math.floor(Number(user.difficultyChangesThisWeek) || 0))
  }

  const changedAt = Number(user?.difficultyChangedAt) || 0
  return changedAt && getDifficultyWeekKey(changedAt) === weekKey ? 1 : 0
}

export function getPremiumDifficultyChangesRemaining(user, now = Date.now()) {
  return Math.max(0, PREMIUM_DIFFICULTY_CHANGES_PER_WEEK - getDifficultyChangesThisWeek(user, now))
}

export function recordDifficultyChange(user, now = Date.now()) {
  const weekKey = getDifficultyWeekKey(now)
  user.difficultyChangesThisWeek = getDifficultyChangesThisWeek(user, now) + 1
  user.difficultyChangeWeek = weekKey
  user.difficultyChangedAt = now
}

export const RPG_DIFFICULTIES = Object.freeze({
  peaceful: {
    name: 'Peaceful',
    income: 0.2,
    xp: 0.2,
    dropRate: 0.2,
    cooldown: 0.2,
    damageDealt: 1.5,
    damageReceived: 0.5,
    crimeLoss: 0.15,
    activityFailure: 0.15,
    deathHealCooldown: 0,
    crimeSuccess: 0,
    leaderboard: false
  },
  easy: {
    name: 'Easy',
    income: 0.5,
    xp: 0.5,
    dropRate: 0.5,
    cooldown: 0.5,
    damageDealt: 1.2,
    damageReceived: 0.75,
    crimeLoss: 0.5,
    activityFailure: 0.5,
    deathHealCooldown: 0,
    crimeSuccess: 0,
    leaderboard: true
  },
  normal: {
    name: 'Normal',
    income: 1,
    xp: 1,
    dropRate: 1,
    cooldown: 1,
    damageDealt: 1,
    damageReceived: 1,
    crimeLoss: 1,
    activityFailure: 1,
    deathHealCooldown: 0,
    crimeSuccess: 0,
    leaderboard: true
  },
  hardcore: {
    name: 'Hardcore',
    income: 1,
    xp: 1,
    dropRate: 1,
    cooldown: 1.5,
    damageDealt: 0.5,
    damageReceived: 1.5,
    crimeLoss: 2,
    activityFailure: 2,
    deathHealCooldown: 30 * 60 * 1000,
    crimeSuccess: -0.1,
    leaderboard: true
  },
  nightmare: {
    name: 'Nightmare',
    income: 1.5,
    xp: 1.5,
    dropRate: 1.5,
    cooldown: 2.5,
    damageDealt: 0.2,
    damageReceived: 2,
    crimeLoss: 5,
    activityFailure: 5,
    deathHealCooldown: 2 * 60 * 60 * 1000,
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

export function canReceiveRareActivityRewards(user) {
  return !['peaceful', 'easy'].includes(getDifficulty(user))
}

export function getDifficultyCooldownRemaining(user, now = Date.now()) {
  const changedAt = Number(user?.difficultyChangedAt) || 0
  return changedAt ? Math.max(0, DIFFICULTY_COOLDOWN - (now - changedAt)) : 0
}

export function scaleDifficultyDamage(user, amount, direction = 'received') {
  const modifiers = getEvonexusAbilityModifiers(user)
  const multiplier = direction === 'dealt'
    ? getDifficultyProfile(user).damageDealt * (1 + modifiers.damageDealt)
    : getDifficultyProfile(user).damageReceived * (1 - modifiers.damageReduction)
  return Math.max(0, Math.floor((Number(amount) || 0) * multiplier))
}

export function scaleDifficultyXP(user, amount) {
  const bonus = getEvonexusAbilityModifiers(user).xp
  return Math.max(0, Math.floor((Number(amount) || 0) * getDifficultyProfile(user).xp * (1 + bonus)))
}

export function scaleDifficultyIncome(user, amount) {
  const bonus = getEvonexusAbilityModifiers(user).income
  return Math.max(0, Math.floor((Number(amount) || 0) * getDifficultyProfile(user).income * (1 + bonus)))
}

export function scaleDifficultyCooldown(user, duration) {
  const premiumMultiplier = user?.premium === true ? 0.8 : 1
  const cooldownReduction = getEvonexusAbilityModifiers(user).cooldownReduction
  return Math.max(0, Math.floor((Number(duration) || 0) * getDifficultyProfile(user).cooldown * premiumMultiplier * (1 - cooldownReduction)))
}

export function adjustCrimeSuccessChance(user, chance) {
  if (getDifficulty(user) === 'peaceful') return 0
  const abilityBonus = getEvonexusAbilityModifiers(user).crimeChance
  return Math.min(1, Math.max(0, (Number(chance) || 0) + getDifficultyProfile(user).crimeSuccess + abilityBonus))
}

export function isPlayerDead(user) {
  return Number(user?.darah) <= 0
}

export function scaleDifficultyHealingCost(user, amount) {
  const healingBonus = getEvonexusAbilityModifiers(user).healing
  return Math.max(0, Math.floor((Number(amount) || 0) * (1 - healingBonus)))
}

export function scaleDifficultyHarvest(user, amount) {
  const harvestBonus = getEvonexusAbilityModifiers(user).harvest
  return Math.max(0, Math.floor((Number(amount) || 0) * (1 + harvestBonus)))
}

export function adjustAbilityDropChance(user, chance) {
  const dropBonus = getEvonexusAbilityModifiers(user).dropChance
  return Math.min(1, Math.max(0, (Number(chance) || 0) + dropBonus))
}

export function getCrimeRestriction(user, { target = false } = {}) {
  if (!user) return null
  if (!target && user.rehabilitation?.status === 'active') {
    return '🕊️ Kamu sedang menjalani rehabilitasi dan tidak bisa melakukan tindak kriminal.'
  }
  if (isPlayerDead(user)) {
    return target
      ? '💀 Target masih mati.'
      : '💀 Kamu masih mati dan tidak bisa melakukan tindak kriminal. Gunakan *.heal me* terlebih dahulu.'
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

export function scaleDifficultyCrimeLoss(user, amount) {
  return Math.max(0, Math.floor((Number(amount) || 0) * getDifficultyProfile(user).crimeLoss))
}

export function adjustDifficultyFailureChance(user, chance) {
  return Math.min(1, Math.max(0, (Number(chance) || 0) * getDifficultyProfile(user).activityFailure))
}

export function markDifficultyDeath(user, now = Date.now()) {
  if (!user) return
  user.difficultyDeathAt = now
  user.difficultyDeathHealCooldown = getDifficultyProfile(user).deathHealCooldown
}

export function getDifficultyDeathHealCooldownRemaining(user, now = Date.now()) {
  const cooldown = user?.difficultyDeathHealCooldown == null
    ? getDifficultyProfile(user).deathHealCooldown
    : Number(user.difficultyDeathHealCooldown)
  const deathAt = Number(user?.difficultyDeathAt) || 0
  return Number(user?.darah) <= 0 && deathAt && cooldown
    ? Math.max(0, cooldown - (now - deathAt))
    : 0
}

export function scaleDifficultyDropChance(user, chance) {
  return Math.min(100, Math.max(0, (Number(chance) || 0) * getDifficultyProfile(user).dropRate))
}