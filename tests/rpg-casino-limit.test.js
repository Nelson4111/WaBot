import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getCasinoGamesUsed,
  getCasinoLimitPurchaseCap,
  getCasinoLimitUnitPrice,
  getCasinoCarryLimit,
  getCasinoBlackoutChance,
  decayCasinoAttentionWarnings
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

test('buying one casino limit restores one used chance without raising the daily cap', () => {
  const stats = { dailyGames: 50, dailyLimitPurchased: 0 }

  stats.dailyLimitPurchased += 1
  assert.equal(getCasinoGamesUsed(stats), 49)
  assert.equal(getCasinoLimitPurchaseCap(true), 50)

  stats.dailyGames += 1
  assert.equal(getCasinoGamesUsed(stats), 50)
})

test('casino carry limit is four times the monthly bank fee', () => {
  assert.equal(getCasinoCarryLimit(0), 0)
  assert.equal(getCasinoCarryLimit(1), 500_000)
  assert.equal(getCasinoCarryLimit(19), 10_000_000_000_000)
})

test('casino blackout chance grows with carried money and repeated no-pause warnings', () => {
  const normal = getCasinoBlackoutChance(100_000_000, 5, 1)
  const wealthy = getCasinoBlackoutChance(1_000_000_000, 5, 1)
  const targeted = getCasinoBlackoutChance(1_000_000_000, 5, 5)

  assert.ok(wealthy >= normal)
  assert.ok(targeted > wealthy)
})

test('casino attention warning drops one star after a 30-minute pause', () => {
  const user = { casinoAttentionWarnings: 4, casinoAttentionRestAt: 1000 }

  assert.equal(decayCasinoAttentionWarnings(user, 1000 + (30 * 60 * 1000)), 3)
  assert.equal(decayCasinoAttentionWarnings(user, 1000 + (60 * 60 * 1000)), 3)
})
