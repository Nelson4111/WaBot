import test from 'node:test'
import assert from 'node:assert/strict'

import { getCasinoLimitUnitPrice } from '../plugins/rpg/rpg-casino.js'

test('casino limit pricing uses 20% of combined pocket and bank funds with a high minimum', () => {
  assert.equal(getCasinoLimitUnitPrice(600_000, 400_000), 200_000)
  assert.equal(getCasinoLimitUnitPrice(5_000_000, 5_000_000), 2_000_000)
  assert.equal(getCasinoLimitUnitPrice(50_000, 0), 200_000)
  assert.equal(getCasinoLimitUnitPrice(9007199254740993n, 0), 1801439850948199n)
})
