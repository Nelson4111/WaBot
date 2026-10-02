import assert from 'node:assert/strict'
import test from 'node:test'
import {
  adjustCrimeSuccessChance,
  DIFFICULTY_COOLDOWN,
  getDifficultyCooldownRemaining,
  getCrimeRestriction,
  getDifficulty,
  isDifficultyRanked,
  normalizeDifficulty,
  scaleDifficultyCooldown,
  scaleDifficultyDamage,
  scaleDifficultyIncome,
  scaleDifficultyXP
} from '../lib/rpgDifficulty.js'

test('difficulty names normalize and old users default to Normal', () => {
  assert.equal(normalizeDifficulty('Nighmare'), 'nightmare')
  assert.equal(normalizeDifficulty('hard'), 'hardcore')
  assert.equal(getDifficulty({}), 'normal')
})

test('each mode applies its requested income and cooldown multipliers', () => {
  assert.equal(scaleDifficultyIncome({ difficulty: 'peaceful' }, 100), 30)
  assert.equal(scaleDifficultyIncome({ difficulty: 'easy' }, 100), 50)
  assert.equal(scaleDifficultyIncome({ difficulty: 'normal' }, 100), 100)
  assert.equal(scaleDifficultyIncome({ difficulty: 'hard' }, 100), 150)
  assert.equal(scaleDifficultyIncome({ difficulty: 'nightmare' }, 100), 170)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'peaceful' }, 100), 30)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'easy' }, 100), 50)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'normal' }, 100), 100)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'hardcore' }, 100), 150)
  assert.equal(scaleDifficultyCooldown({ difficulty: 'nightmare' }, 100), 170)
})

test('combat and crime modifiers remain difficulty-specific', () => {
  assert.equal(scaleDifficultyDamage({ difficulty: 'nightmare' }, 100), 200)
  assert.equal(scaleDifficultyDamage({ difficulty: 'hardcore' }, 100, 'dealt'), 110)
  assert.equal(scaleDifficultyXP({ difficulty: 'easy' }, 100), 50)
  assert.equal(adjustCrimeSuccessChance({ difficulty: 'easy' }, 0.4), 0.5)
  assert.equal(adjustCrimeSuccessChance({ difficulty: 'nightmare' }, 0.4), 0.2)
})

test('Peaceful blocks crimes and is excluded from leaderboards', () => {
  const peaceful = { difficulty: 'peaceful', darah: 100 }
  assert.match(getCrimeRestriction(peaceful), /Peaceful/)
  assert.match(getCrimeRestriction(peaceful, { target: true }), /sasaran/)
  assert.equal(adjustCrimeSuccessChance(peaceful, 1), 0)
  assert.equal(isDifficultyRanked(peaceful), false)
})

test('dead players cannot perform crimes', () => {
  assert.match(getCrimeRestriction({ difficulty: 'normal', darah: 0 }), /masih mati/)
})

test('difficulty changes have a seven-day cooldown', () => {
  const changedAt = 1000000
  const user = { difficultyChangedAt: changedAt }
  assert.equal(getDifficultyCooldownRemaining({}, changedAt), 0)
  assert.equal(getDifficultyCooldownRemaining(user, changedAt), DIFFICULTY_COOLDOWN)
  assert.equal(getDifficultyCooldownRemaining(user, changedAt + DIFFICULTY_COOLDOWN - 1), 1)
  assert.equal(getDifficultyCooldownRemaining(user, changedAt + DIFFICULTY_COOLDOWN), 0)
})