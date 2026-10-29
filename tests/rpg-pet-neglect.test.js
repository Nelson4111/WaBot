import assert from 'node:assert/strict'
import test from 'node:test'
import { processPetNeglect } from '../lib/rpgPetNeglect.js'

test('pet needs decline in six-hour steps without dropping below their limits', () => {
  const now = 1_800_000_000_000
  const user = {
    pets: [{ tipe: 'kucing', energy: 100, happy: 50, dirty: 0, lastNeedsUpdateAt: now }],
    shelterPets: []
  }

  const result = processPetNeglect(user, now + 6 * 60 * 60 * 1000)

  assert.equal(result.changed, true)
  assert.deepEqual(result.escapedPets, [])
  assert.equal(user.pets[0].energy, 92)
  assert.equal(user.pets[0].happy, 44)
  assert.equal(user.pets[0].dirty, 8)
})

test('a pet that stays in poor condition for a day is moved to the shelter', () => {
  const now = 1_800_000_000_000
  const user = {
    pets: [{
      tipe: 'kucing',
      energy: 20,
      happy: 20,
      dirty: 80,
      lastNeedsUpdateAt: now,
      neglectStartedAt: now
    }],
    shelterPets: []
  }

  const result = processPetNeglect(user, now + 24 * 60 * 60 * 1000)

  assert.equal(result.changed, true)
  assert.equal(result.escapedPets.length, 1)
  assert.equal(user.pets.length, 0)
  assert.equal(user.shelterPets[0].shelterStatus.reason, 'runaway')
})

test('a long unattended period sends a pet to the shelter on its next check', () => {
  const now = 1_800_000_000_000
  const user = {
    pets: [{ tipe: 'kucing', energy: 100, happy: 50, dirty: 0, lastNeedsUpdateAt: now }],
    shelterPets: []
  }

  const result = processPetNeglect(user, now + 5 * 24 * 60 * 60 * 1000)

  assert.equal(result.escapedPets.length, 1)
  assert.equal(user.pets.length, 0)
  assert.equal(user.shelterPets[0].shelterStatus.reason, 'runaway')
})
