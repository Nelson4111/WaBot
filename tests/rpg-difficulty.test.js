import assert from 'node:assert/strict'
import test from 'node:test'
import {
  adjustCrimeSuccessChance,
  adjustDifficultyFailureChance,
  applyProtectedCrimeAttemptPenalty,
  canReceiveRareActivityRewards,
  DIFFICULTY_CHANGES_PER_WEEK,
  getDifficultyChangesRemaining,
  getDifficultyWeekKey,
  getDifficultyDeathHealCooldownRemaining,
  getPremiumDifficultyChangesRemaining,
  getCrimeRestriction,
  getDifficulty,
  isPlayerDead,
  isDifficultyRanked,
  isProtectedCrimeTarget,
  normalizeDifficulty,
  markDifficultyDeath,
  recordDifficultyChange,
  PREMIUM_DIFFICULTY_CHANGES_PER_WEEK,
  scaleDifficultyCooldown,
  scaleDifficultyCrimeLoss,
  scaleDifficultyDamage,
  scaleDifficultyDropChance,
  scaleDifficultyIncome,
  scaleDifficultyXP
} from '../lib/rpgDifficulty.js'

test('difficulty names normalize and old users default to Normal', () => {
  assert.equal(normalizeDifficulty('Nighmare'), 'nightmare')
  assert.equal(normalizeDifficulty('hard'), 'hardcore')
  assert.equal(getDifficulty({}), 'normal')
})

test('each mode applies its requested income and cooldown multipliers', () => {
  assert.equal(scaleDifficultyIncome({ difficulty: 'peaceful' }, 100), 20)
  assert.equal(scaleDifficultyIncome({ difficulty: 'easy' }, 100), 50)
  assert.equal(scaleDifficultyIncome({ difficulty: 'normal' }, 100), 100)
  assert.equal(scaleDifficultyIncome({ difficulty: 'hard' }, 100), 100)
  assert.equal(scaleDifficultyIncome({ difficulty: 'nightmare' }, 100), 150)
  assert.equal(scaleDifficultyDropChance({ difficulty: 'peaceful' }, 10), 2)
  assert.equal(scaleDifficultyDropChance({ difficulty: 'easy' }, 10), 5)
  assert.equal(scaleDifficultyDropChance({ difficulty: 'normal' }, 10), 10)
  assert.equal(scaleDifficultyDropChance({ difficulty: 'hardcore' }, 10), 10)
  assert.equal(scaleDifficultyDropChance({ difficulty: 'nightmare' }, 10), 15)
  assert.equal(scaleDifficultyXP({ difficulty: 'hardcore' }, 100), 100)
  assert.equal(scaleDifficultyXP({ difficulty: 'nightmare' }, 100), 150)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'peaceful' }, 100), 20)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'easy' }, 100), 50)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'normal' }, 100), 100)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'hardcore' }, 100), 150)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'nightmare' }, 100), 250)
})

test('combat and crime modifiers remain difficulty-specific', () => {
  assert.equal(scaleDifficultyDamage({ difficulty: 'nightmare' }, 100), 200)
  assert.equal(scaleDifficultyDamage({ difficulty: 'peaceful' }, 100, 'dealt'), 150)
  assert.equal(scaleDifficultyDamage({ difficulty: 'easy' }, 100, 'dealt'), 120)
  assert.equal(scaleDifficultyDamage({ difficulty: 'hardcore' }, 100, 'dealt'), 50)
  assert.equal(scaleDifficultyDamage({ difficulty: 'nightmare' }, 100, 'dealt'), 20)
  assert.equal(scaleDifficultyCrimeLoss({ difficulty: 'peaceful' }, 100), 15)
  assert.equal(scaleDifficultyCrimeLoss({ difficulty: 'easy' }, 100), 50)
  assert.equal(scaleDifficultyCrimeLoss({ difficulty: 'normal' }, 100), 100)
  assert.equal(scaleDifficultyCrimeLoss({ difficulty: 'hardcore' }, 100), 200)
  assert.equal(scaleDifficultyCrimeLoss({ difficulty: 'nightmare' }, 100), 500)
  assert.equal(adjustDifficultyFailureChance({ difficulty: 'nightmare' }, 0.1), 0.5)
  assert.equal(adjustDifficultyFailureChance({ difficulty: 'nightmare' }, 0.3), 1)
  assert.equal(scaleDifficultyXP({ difficulty: 'easy' }, 100), 50)
  assert.equal(adjustCrimeSuccessChance({ difficulty: 'easy' }, 0.4), 0.4)
  assert.equal(adjustCrimeSuccessChance({ difficulty: 'nightmare' }, 0.4), 0.2)
})

test('Peaceful blocks crimes and is excluded from leaderboards', () => {
  const peaceful = { difficulty: 'peaceful', darah: 100 }
  assert.match(getCrimeRestriction(peaceful), /Peaceful/)
  assert.match(getCrimeRestriction(peaceful, { target: true }), /sasaran/)
  assert.equal(adjustCrimeSuccessChance(peaceful, 1), 0)
  assert.equal(isDifficultyRanked(peaceful), false)
})

test('Peaceful and Easy cannot receive rare activity rewards', () => {
  assert.equal(canReceiveRareActivityRewards({ difficulty: 'peaceful' }), false)
  assert.equal(canReceiveRareActivityRewards({ difficulty: 'easy' }), false)
  assert.equal(canReceiveRareActivityRewards({ difficulty: 'normal' }), true)
  assert.equal(canReceiveRareActivityRewards({ difficulty: 'hardcore' }), true)
})

test('owner and co-owner crime targets are hidden, guaranteed to fail, and transfer a heavy penalty', () => {
  const previousOwner = global.owner
  const previousHiddenOwner = global.hiddenowner
  const previousDb = global.db
  try {
    global.owner = [['6281111111111', 'Owner', true]]
    global.hiddenowner = ['6282222222222']
    global.db = {
      data: {
        lids: { '12345@lid': '6282222222222@s.whatsapp.net' },
        users: { '6283333333333@s.whatsapp.net': { isCoOwner: true } }
      }
    }

    assert.equal(isProtectedCrimeTarget('6281111111111@s.whatsapp.net'), true)
    assert.equal(isProtectedCrimeTarget('12345@lid'), true)
    assert.equal(isProtectedCrimeTarget('6283333333333@s.whatsapp.net'), true)
    assert.equal(isProtectedCrimeTarget('6284444444444@s.whatsapp.net'), false)
    assert.equal(adjustCrimeSuccessChance({ difficulty: 'normal' }, 1, '6281111111111@s.whatsapp.net'), 0)

    const db = { money: { '6289999999999@s.whatsapp.net': 10000, '6281111111111@s.whatsapp.net': 0 } }
    assert.equal(applyProtectedCrimeAttemptPenalty(db, '6289999999999@s.whatsapp.net', '6281111111111@s.whatsapp.net'), 7500)
    assert.equal(db.money['6289999999999@s.whatsapp.net'], 2500)
    assert.equal(db.money['6281111111111@s.whatsapp.net'], 7500)
  } finally {
    global.owner = previousOwner
    global.hiddenowner = previousHiddenOwner
    global.db = previousDb
  }
})

test('dead players cannot perform crimes', () => {
  assert.match(getCrimeRestriction({ difficulty: 'normal', darah: 0 }), /masih mati/)
  assert.equal(isPlayerDead({ darah: 0 }), true)
  assert.equal(isPlayerDead({ darah: 1 }), false)
  assert.equal(isPlayerDead({}), false)
})

test('non-premium difficulty changes are limited once per Jakarta week and reset on Monday', () => {
  const monday = Date.parse('2024-01-01T00:00:00+07:00')
  const sunday = monday + 6 * 24 * 60 * 60 * 1000
  const nextMonday = monday + 7 * 24 * 60 * 60 * 1000
  const user = {}

  assert.equal(getDifficultyChangesRemaining(user, DIFFICULTY_CHANGES_PER_WEEK, monday), 1)
  recordDifficultyChange(user, monday)
  assert.equal(getDifficultyChangesRemaining(user, DIFFICULTY_CHANGES_PER_WEEK, monday), 0)
  assert.equal(getDifficultyChangesRemaining(user, DIFFICULTY_CHANGES_PER_WEEK, sunday), 0)
  assert.equal(getDifficultyChangesRemaining(user, DIFFICULTY_CHANGES_PER_WEEK, nextMonday), 1)

  recordDifficultyChange(user, nextMonday)
  assert.equal(getDifficultyChangesRemaining(user, DIFFICULTY_CHANGES_PER_WEEK, nextMonday), 0)
})

test('premium difficulty changes are limited to twice per Jakarta week and reset on Monday', () => {
  const monday = Date.parse('2024-01-01T00:00:00+07:00')
  const sundayBefore = monday - 1
  const nextMonday = monday + 7 * 24 * 60 * 60 * 1000
  const user = {}

  assert.equal(getDifficultyWeekKey(sundayBefore), '2023-12-25')
  assert.equal(getDifficultyWeekKey(monday), '2024-01-01')
  assert.equal(getPremiumDifficultyChangesRemaining(user, monday), PREMIUM_DIFFICULTY_CHANGES_PER_WEEK)

  recordDifficultyChange(user, monday)
  assert.equal(getPremiumDifficultyChangesRemaining(user, monday), 1)
  recordDifficultyChange(user, monday + 1)
  assert.equal(getPremiumDifficultyChangesRemaining(user, monday + 1), 0)
  assert.equal(getPremiumDifficultyChangesRemaining(user, nextMonday), PREMIUM_DIFFICULTY_CHANGES_PER_WEEK)
})

test('death healing cooldown differs for Hardcore and Nightmare', () => {
  const now = 1000000
  const user = { difficulty: 'hardcore', darah: 0 }
  markDifficultyDeath(user, now)
  assert.equal(getDifficultyDeathHealCooldownRemaining(user, now), 30 * 60 * 1000)
  assert.equal(getDifficultyDeathHealCooldownRemaining(user, now + 30 * 60 * 1000), 0)
  user.difficulty = 'nightmare'
  assert.equal(getDifficultyDeathHealCooldownRemaining(user, now), 30 * 60 * 1000)
  markDifficultyDeath(user, now)
  assert.equal(getDifficultyDeathHealCooldownRemaining(user, now), 2 * 60 * 60 * 1000)
  assert.equal(getDifficultyDeathHealCooldownRemaining({ difficulty: 'normal', darah: 0, difficultyDeathAt: now }, now), 0)
})