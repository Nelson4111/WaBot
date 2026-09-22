import assert from 'node:assert/strict'
import { computeCrimeScore, getCrimeScoreSummary } from '../lib/crimeHelper.js'
import { normalizeFishKey } from '../lib/rpg-fishCatalog.js'

assert.equal(computeCrimeScore({ rampok: 2, bunuh: 1, begal: 3, copet: 4 }), 2 * 4 + 1 * 3 + 3 * 2 + 4 * 1)
assert.deepEqual(getCrimeScoreSummary({ rampok: 2, bunuh: 1, begal: 3, copet: 4 }), {
  rampok: 2,
  bunuh: 1,
  begal: 3,
  copet: 4,
  total: 17,
  weight: { rampok: 4, bunuh: 3, begal: 2, copet: 1 }
})
assert.equal(normalizeFishKey('hiu putih'), 'hiu_putih')
assert.equal(normalizeFishKey('ikan hiu putih'), 'hiu_putih')

console.log('crime scoring tests passed')
