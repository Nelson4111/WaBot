import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getCasinoLimitPurchaseCap,
  getCasinoLimitUnitPrice
} from '../plugins/rpg/rpg-casino.js'

test('casino limit pricing uses 5% of combined pocket and bank funds with a minimum', () => {
  assert.equal(getCasinoLimitUnitPrice(600_000, 400_000), 50_000)
  assert.equal(getCasinoLimitUnitPrice(5_000_000, 5_000_000), 500_000)
  assert.equal(getCasinoLimitUnitPrice(50_000, 0), 50_000)
  assert.equal(getCasinoLimitUnitPrice(9007199254740993n, 0), 450359962737050n)
  assert.equal(getCasinoLimitUnitPrice(0, 1_000_000_000_000_000_000), 50_000_000_000_000_000)
})

test('casino limit purchase caps differ for regular and Premium users', () => {
  assert.equal(getCasinoLimitPurchaseCap(false), 25)
  assert.equal(getCasinoLimitPurchaseCap(true), 50)
})
