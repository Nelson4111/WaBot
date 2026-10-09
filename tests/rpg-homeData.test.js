import test from 'node:test'
import assert from 'node:assert/strict'
import {
  HOME_LEVELS,
  HOME_MAX_UPGRADES,
  HOME_EAT_HARMONY,
  HOME_STORIES,
  getHomeComfort,
  getHomeLevel
} from '../lib/rpgHomeData.js'
import { MALL_CATEGORIES } from '../lib/rpgMallData.js'

test('home upgrades expose 10 named, increasingly expensive levels', () => {
  assert.equal(HOME_MAX_UPGRADES, 10)
  assert.equal(HOME_LEVELS.length, 11)
  assert.equal(getHomeLevel(0).name, 'Rumah Sederhana')
  assert.equal(getHomeLevel(10).name, 'Grand Palace')
  assert.ok(HOME_LEVELS.every((tier, index) =>
    index === 0 || tier.security > HOME_LEVELS[index - 1].security
  ))
  assert.ok(HOME_LEVELS.slice(1).every((tier, index, tiers) =>
    index === 0 || tier.cost > tiers[index - 1].cost
  ))
})

test('every home activity category has five story choices', () => {
  for (const [category, stories] of Object.entries(HOME_STORIES)) {
    assert.equal(stories.length, 5, `${category} story count`)
  }
})

test('eating at home grants harmony', () => {
  assert.equal(HOME_EAT_HARMONY, 8)
})

test('comfort continues counting all owned and installed mall furniture', () => {
  const furniture = MALL_CATEGORIES.furniture.items
  const inventory = { [furniture[0].id]: 2, [furniture[furniture.length - 1].id]: 1 }
  const result = getHomeComfort({ level: 2, furniture: [furniture[1].id] }, inventory)
  assert.equal(result.furnitureCount, 4)
  assert.equal(result.points, 14)
  assert.equal(result.level, 3)
})
