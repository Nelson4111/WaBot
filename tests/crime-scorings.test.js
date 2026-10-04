import assert from 'node:assert/strict'
import { computeCrimeScore, getCrimeScoreSummary, getPatrolCaptureChance, getPatrolCapturePenalty, recordEscapeCrime } from '../lib/crimeHelper.js'
import { normalizeFishKey } from '../lib/rpg-fishCatalog.js'

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
assert.equal(getPatrolCaptureChance(0), 0)
assert.ok(Math.abs(getPatrolCaptureChance(4) - 0.15) < 1e-10)
assert.equal(getPatrolCaptureChance(100), 0.75)
assert.deepEqual(getPatrolCapturePenalty(10), { durationMs: 80 * 60 * 1000, ransom: 1500000 })
assert.deepEqual(getPatrolCapturePenalty(0), { durationMs: 30 * 60 * 1000, ransom: 500000 })

const crimeDB = { crime: {} }
recordEscapeCrime(crimeDB, 'user@s.whatsapp.net', 'kabur')
recordEscapeCrime(crimeDB, 'user@s.whatsapp.net', 'breakout')
assert.equal(crimeDB.crime['user@s.whatsapp.net'].total, 10)

assert.equal(normalizeFishKey('hiu putih'), 'hiu_putih')
assert.equal(normalizeFishKey('ikan hiu putih'), 'hiu_putih')

console.log('crime scoring tests passed')
