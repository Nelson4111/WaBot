import assert from 'node:assert/strict'
import { computeCrimeScore, ensurePatrolReleaseProtection, getActiveCrimeScore, getCrimeScoreSummary, getPatrolCaptureChance, getPatrolCapturePenalty, getPatrolProtectionRemaining, markPatrolRelease, PATROL_CAPTURE_PROTECTION_MS, PATROL_CRIME_PROTECTION_MS, PATROL_PRISON_PROTECTION_MS, recordEscapeCrime, setActiveCrimeScore, syncAllEscapeCrimeCounts, syncEscapeCrimeCounts } from '../lib/crimeHelper.js'
import { normalizeFishKey } from '../lib/rpg-fishCatalog.js'
import { PATROL_RESTRICTED_RSHIP_ACTIONS } from '../lib/patrolHelper.js'

assert.equal(computeCrimeScore({ rampok: 2, bunuh: 1, begal: 3, copet: 4 }), 2 * 4 + 1 * 3 + 3 * 2 + 4 * 1)
assert.deepEqual(getCrimeScoreSummary({ rampok: 2, bunuh: 1, begal: 3, copet: 4 }), {
  rampok: 2,
  bunuh: 1,
  begal: 3,
  copet: 4,
  kabur: 0,
  breakout: 0,
  total: 17,
  weight: { rampok: 4, bunuh: 3, begal: 2, copet: 1, kabur: 5, breakout: 5 }
})
assert.equal(computeCrimeScore({ kabur: 1, breakout: 2 }), 15)
const adjustableCrime = { rampok: 2, pardonedScore: 4 }
assert.equal(getActiveCrimeScore(adjustableCrime), 4)
assert.equal(setActiveCrimeScore(adjustableCrime, 0), 0)
adjustableCrime.copet = 3
assert.equal(getActiveCrimeScore(adjustableCrime), 3)
assert.equal(setActiveCrimeScore(adjustableCrime, 8), 8)
assert.throws(() => setActiveCrimeScore(adjustableCrime, -1), RangeError)
assert.throws(() => setActiveCrimeScore(adjustableCrime, 1.5), RangeError)
assert.equal(getPatrolCaptureChance(0), 0)
assert.ok(Math.abs(getPatrolCaptureChance(4) - 0.003) < 1e-10)
assert.ok(Math.abs(getPatrolCaptureChance(10) - 0.006) < 1e-10)
assert.equal(getPatrolCaptureChance(100), 0.05)
assert.deepEqual(getPatrolCapturePenalty(10), { durationMs: 80 * 60 * 1000, ransom: 1500000 })
assert.deepEqual(getPatrolCapturePenalty(0), { durationMs: 30 * 60 * 1000, ransom: 500000 })
assert.equal(PATROL_CRIME_PROTECTION_MS, 15 * 60 * 1000)
assert.equal(PATROL_PRISON_PROTECTION_MS, 30 * 60 * 1000)
assert.equal(PATROL_CAPTURE_PROTECTION_MS, 2 * 60 * 60 * 1000)
assert.equal(PATROL_RESTRICTED_RSHIP_ACTIONS.has('rampok'), false)

const releasedRPG = { patrolCaughtAt: 1000 }
assert.equal(markPatrolRelease(releasedRPG, 5000), true)
assert.equal(releasedRPG.patrolCrimeProtectionUntil, 5000 + PATROL_CRIME_PROTECTION_MS)
assert.equal(releasedRPG.patrolPrisonProtectionUntil, 5000 + PATROL_PRISON_PROTECTION_MS)
assert.equal(releasedRPG.patrolCaptureProtectionUntil, 5000 + PATROL_CAPTURE_PROTECTION_MS)
assert.equal(getPatrolProtectionRemaining(releasedRPG, 'crime', 5000), PATROL_CRIME_PROTECTION_MS)
assert.equal(getPatrolProtectionRemaining(releasedRPG, 'prison', 5000), PATROL_PRISON_PROTECTION_MS)
assert.equal(getPatrolProtectionRemaining(releasedRPG, 'capture', 5000), PATROL_CAPTURE_PROTECTION_MS)
assert.equal(getPatrolProtectionRemaining({ patrolProtectionUntil: 9000 }, 'capture', 5000), 4000)
assert.equal('patrolCaughtAt' in releasedRPG, false)
assert.equal(markPatrolRelease(releasedRPG, 6000), false)

const overdueReleaseRPG = { patrolCaughtAt: 1000, penjara: 1000, lamaPenjara: 1000 }
assert.equal(ensurePatrolReleaseProtection(overdueReleaseRPG, 5000), true)
assert.equal(overdueReleaseRPG.patrolCaptureProtectionUntil, 1000 + PATROL_CAPTURE_PROTECTION_MS)
const activePatrolPrisoner = { patrolCaughtAt: 1000, penjara: 2000, lamaPenjara: 5000 }
assert.equal(ensurePatrolReleaseProtection(activePatrolPrisoner, 3000), false)
assert.equal('patrolCaughtAt' in activePatrolPrisoner, true)

const crimeDB = { crime: {} }
recordEscapeCrime(crimeDB, 'user@s.whatsapp.net', 'kabur')
recordEscapeCrime(crimeDB, 'user@s.whatsapp.net', 'breakout')
assert.equal(crimeDB.crime['user@s.whatsapp.net'].total, 10)
assert.equal(crimeDB.prisonStats['user@s.whatsapp.net'].escapeCount, 2)
assert.deepEqual(syncEscapeCrimeCounts(crimeDB, 'user@s.whatsapp.net'), { kabur: 1, breakout: 1, total: 2 })

const legacyCrimeDB = {
  crime: { 'legacy@s.whatsapp.net': { copet: 0, rampok: 0, begal: 0, bunuh: 0, kabur: 1, breakout: 0 } },
  prisonStats: { 'legacy@s.whatsapp.net': { escapeCount: 3 } }
}
assert.deepEqual(syncEscapeCrimeCounts(legacyCrimeDB, 'legacy@s.whatsapp.net'), { kabur: 3, breakout: 0, total: 3 })
const missingCrimeDB = { crime: {}, prisonStats: { 'escaped@s.whatsapp.net': { escapeCount: 2, breakoutCount: 1 } } }
syncAllEscapeCrimeCounts(missingCrimeDB)
assert.deepEqual(syncEscapeCrimeCounts(missingCrimeDB, 'escaped@s.whatsapp.net'), { kabur: 1, breakout: 1, total: 2 })

assert.equal(normalizeFishKey('hiu putih'), 'hiu_putih')
assert.equal(normalizeFishKey('ikan hiu putih'), 'hiu_putih')

console.log('crime scoring tests passed')
