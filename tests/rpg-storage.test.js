import assert from 'node:assert/strict'
import test from 'node:test'
import {
  activateStorageBypass,
  getStorageCapacity,
  getStorageCount,
  getStorageItemType,
  getStorageUpgradeCost,
  isStorageBypassActive,
  isStorageFull
} from '../lib/rpg-storage.js'
import { findRpgEvent } from '../lib/rpgEvents.js'

test('each RPG storage starts at 100 slots and gains 50 slots per shared level', () => {
  assert.equal(getStorageCapacity({}), 100)
  assert.equal(getStorageCapacity({ inventoryLevel: 3 }), 250)
})

test('capacity checks allow an incoming batch below full but block the next action at full', () => {
  const user = { ikan: { lele: 99 } }
  assert.equal(isStorageFull(user, 'fish'), false)
  user.ikan.lele += 5
  assert.equal(getStorageCount(user, 'fish'), 104)
  assert.equal(isStorageFull(user, 'fish'), true)
})

test('active storage bypass allows over-capacity items in every bucket and expires after one hour', () => {
  const now = Date.UTC(2026, 0, 1, 12)
  const user = {
    inventoryBypassExpiresAt: now + 60 * 60 * 1000,
    ikan: { lele: 100 },
    ores: { copper: 100 },
    items: { ramuan_kecil: 100 },
    inventory: { stellar_credit: 100, wortel: 100, daging_sapi: 100 },
    masakan: { mie_goreng: 100, air_mineral: 100 }
  }

  for (const type of ['fish', 'ore', 'item', 'stellar', 'food', 'drink', 'garden', 'gudang']) {
    assert.equal(isStorageFull(user, type, now), false)
    assert.equal(isStorageFull(user, type, user.inventoryBypassExpiresAt), true)
  }
  assert.equal(isStorageBypassActive(user, now), true)
  assert.equal(isStorageBypassActive(user, user.inventoryBypassExpiresAt), false)
})

test('storage bypass allows two activations per WIB day and resets at midnight', () => {
  const beforeMidnight = Date.UTC(2026, 0, 1, 16, 59)
  const user = {}
  const first = activateStorageBypass(user, beforeMidnight)
  assert.equal(first.status, 'activated')
  assert.equal(first.uses, 1)

  const secondAt = beforeMidnight + 1000
  user.inventoryBypassExpiresAt = secondAt
  const second = activateStorageBypass(user, secondAt)
  assert.equal(second.status, 'activated')
  assert.equal(second.uses, 2)

  const thirdAt = secondAt + 1000
  user.inventoryBypassExpiresAt = thirdAt
  assert.equal(activateStorageBypass(user, thirdAt).status, 'limit')

  const nextWibDay = Date.UTC(2026, 0, 1, 17)
  user.inventoryBypassExpiresAt = nextWibDay
  const reset = activateStorageBypass(user, nextWibDay)
  assert.equal(reset.status, 'activated')
  assert.equal(reset.uses, 1)
})

test('Storage Freedom event globally bypasses capacity for every player', () => {
  const previousDb = global.db
  const now = Date.now()
  global.db = {
    data: {
      rpgEvents: {
        inventory_bypass: { expiresAt: now + 60_000 }
      }
    }
  }
  try {
    assert.equal(findRpgEvent('Storage Freedom')?.id, 'inventory_bypass')
    assert.equal(isStorageFull({ ikan: { lele: 100 } }, 'fish', now), false)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('inventory groups are counted independently for fishing, mining, adventure, stellar, cooking, and crops', () => {
  const user = {
    ikan: { lele: 7 },
    ores: { copper: 4 },
    items: { ramuan_kecil: 2 },
    inventory: { stellar_credit: 3, wortel: 5, daging_sapi: 6 },
    masakan: { mie_goreng: 8, air_mineral: 9, olahan_susu_sapi: 1 }
  }

  assert.equal(getStorageCount(user, 'fish'), 7)
  assert.equal(getStorageCount(user, 'ore'), 4)
  assert.equal(getStorageCount(user, 'item'), 2)
  assert.equal(getStorageCount(user, 'stellar'), 3)
  assert.equal(getStorageCount(user, 'food'), 9)
  assert.equal(getStorageCount(user, 'drink'), 9)
  assert.equal(getStorageCount(user, 'garden'), 5)
  assert.equal(getStorageCount(user, 'gudang'), 6)
  assert.equal(getStorageItemType('air_mineral'), 'drink')
  assert.equal(getStorageItemType('olahan_susu_sapi'), 'food')
})

test('inventory upgrade prices start at 5,000 times RPG level and double each level', () => {
  assert.equal(getStorageUpgradeCost(4, 0, 1), 20000n)
  assert.equal(getStorageUpgradeCost(4, 1, 2), 40000n)
  assert.equal(getStorageUpgradeCost(4, 0, 3), 140000n)
})
