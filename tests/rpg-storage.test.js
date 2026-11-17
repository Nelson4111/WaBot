import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getStorageCapacity,
  getStorageCount,
  getStorageItemType,
  getStorageUpgradeCost,
  isStorageFull
} from '../lib/rpg-storage.js'

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
