import assert from 'node:assert/strict'
import test from 'node:test'
import { computeCrimeScore } from '../lib/crimeHelper.js'
import {
  getShelterRetrieveFee,
  LIVESTOCK_NEGLECT_TIMEOUT,
  processLivestockNeglect,
  processShelterCrime,
  resetShelterCrimeCounters,
  SHELTER_CRIME_DAILY_CAP,
  SHELTER_RETRIEVE_BASE_FEE,
  SHELTER_RETRIEVE_DAILY_FEE
} from '../lib/rpgShelter.js'

test('unattended livestock is moved out of the producing pen and into the shelter', () => {
  const now = Date.parse('2026-10-29T12:00:00+07:00')
  const user = {
    ternak: { AYAM: 3 },
    lastLivestockCareAt: { AYAM: now - LIVESTOCK_NEGLECT_TIMEOUT },
    lastLivestockHarvest: { AYAM: now - 1000 },
    shelterLivestock: []
  }

  const result = processLivestockNeglect(user, now)

  assert.equal(result.escapedLivestock.length, 1)
  assert.equal(user.ternak.ayam, undefined)
  assert.equal(user.shelterLivestock[0].count, 3)
  assert.equal(user.shelterLivestock[0].shelterStatus.reason, 'runaway')
  assert.equal(user.lastLivestockHarvest.ayam, undefined)
})

test('shelter crime adds two points daily per species and stops after 50 daily ticks', () => {
  const enteredAt = Date.parse('2026-10-20T12:00:00+07:00')
  const now = Date.parse('2026-10-21T12:00:00+07:00')
  const user = {
    shelterLivestock: [
      { type: 'ayam', count: 2, enteredAt, shelterCrimeDate: '2026-10-20', shelterCrimeTicks: 0 },
      { type: 'ayam', count: 1, enteredAt, shelterCrimeDate: '2026-10-20', shelterCrimeTicks: 0 }
    ]
  }
  const crimeDB = {}

  const firstDay = processShelterCrime(user, crimeDB, 'player', now)
  const duplicateCall = processShelterCrime(user, crimeDB, 'player', now + 60_000)
  const capReached = processShelterCrime(user, crimeDB, 'player', now + 100 * 86400000)

  assert.equal(firstDay.pointsAdded, 2)
  assert.equal(duplicateCall.pointsAdded, 0)
  assert.equal(capReached.pointsAdded, (SHELTER_CRIME_DAILY_CAP - 1) * 2)
  assert.equal(crimeDB.player.shelterNeglectPoints, SHELTER_CRIME_DAILY_CAP * 2)
  assert.equal(computeCrimeScore(crimeDB.player), SHELTER_CRIME_DAILY_CAP * 2)
})

test('shelter crime pauses during rehabilitation and counters reset for the next report cycle', () => {
  const enteredAt = Date.parse('2026-10-20T12:00:00+07:00')
  const rehabStart = Date.parse('2026-10-21T12:00:00+07:00')
  const user = {
    rehabilitation: { status: 'active' },
    shelterPets: [{ tipe: 'kucing', enteredAt, shelterCrimeDate: '2026-10-20', shelterCrimeTicks: 0 }]
  }
  const crimeDB = {}

  assert.equal(processShelterCrime(user, crimeDB, 'player', rehabStart).pointsAdded, 0)
  resetShelterCrimeCounters(user, rehabStart)
  user.rehabilitation.status = 'completed'
  assert.equal(processShelterCrime(user, crimeDB, 'player', rehabStart + 86400000).pointsAdded, 2)
  assert.equal(crimeDB.player.shelterNeglectPoints, 2)
})

test('shelter retrieval fees increase per day and scale by livestock headcount', () => {
  const now = Date.parse('2026-10-29T12:00:00+07:00')
  const enteredAt = now - 3 * 86400000

  assert.equal(
    getShelterRetrieveFee({ enteredAt }, now),
    SHELTER_RETRIEVE_BASE_FEE + 3 * SHELTER_RETRIEVE_DAILY_FEE
  )
  assert.equal(
    getShelterRetrieveFee({ enteredAt, count: 4 }, now, true),
    4 * (SHELTER_RETRIEVE_BASE_FEE + 3 * SHELTER_RETRIEVE_DAILY_FEE)
  )
})
