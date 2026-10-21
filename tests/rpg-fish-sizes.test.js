import assert from 'node:assert/strict'
import {
  addFishRecord,
  ensureFishDetails,
  getFishPriceMultiplier,
  getFishRecords,
  isTrashFish,
  removeFishRecords,
  rollFishSize,
  rollFishWeight,
  setFishRecordSize
} from '../lib/rpg-fishSizes.js'
import {
  getActiveGroupTotem,
  getActiveGroupTotemExpiry,
  getGroupTotemBuff,
  RPG_TOTEMS,
  RPG_TOTEM_DURATION
} from '../lib/rpg-totemData.js'

const originalRandom = Math.random
try {
  Math.random = () => 0
  const user = { ikan: { salmon: 2, sampah_plastik: 3 } }
  assert.equal(ensureFishDetails(user), true)
  assert.equal(user.fishDetails.salmon.length, 2)
  assert.equal(user.fishDetails.salmon.every(fish => fish.size === 'small'), true)
  assert.equal(user.fishDetails.sampah_plastik, undefined)
  assert.equal(ensureFishDetails(user), false)
  assert.equal(isTrashFish('sampah_plastik'), true)

  assert.equal(rollFishSize(), 'small')
  assert.equal(rollFishSize({ giantAllowed: false }), 'small')
  Math.random = () => 0.004
  assert.equal(rollFishSize({ giantAllowed: true, giantChance: 0.005 }), 'giant')
  assert.equal(rollFishWeight('giant') >= 50, true)
  assert.equal(rollFishWeight('giant') < 1000, true)

  const first = getFishRecords(user, 'salmon')[0]
  first.favorite = true
  const sold = removeFishRecords(user, 'salmon', 2)
  assert.equal(sold.length, 1)
  assert.equal(user.ikan.salmon, 1)
  assert.equal(user.fishDetails.salmon[0].favorite, true)

  const added = addFishRecord(user, 'tuna', 'big')
  assert.equal(added.size, 'big')
  assert.equal(setFishRecordSize(user, 'salmon', 1, 'medium', 4.25).weight, 4.25)
  assert.equal(setFishRecordSize(user, 'salmon', 1, 'small', 4.25).invalidWeight, true)
} finally {
  Math.random = originalRandom
}

assert.equal(getFishPriceMultiplier('small'), 0.4)
assert.equal(getFishPriceMultiplier('medium'), 1)
assert.equal(getFishPriceMultiplier('big'), 1.6)
assert.equal(getFishPriceMultiplier('giant'), getFishPriceMultiplier('big') * 2)

const groupData = {
  groupTotems: {
    'group@g.us': {
      id: 'luck',
      activatedAt: Date.now(),
      expiresAt: Date.now() + RPG_TOTEM_DURATION
    }
  }
}
assert.equal(getGroupTotemBuff(groupData, 'group@g.us', 'explore', 'rareChance'), 1.03)
assert.equal(getGroupTotemBuff(groupData, 'other@g.us', 'explore', 'rareChance'), 1)
assert.equal(getGroupTotemBuff(groupData, 'group@g.us', 'mining', 'yield'), 1)

const casinoTotems = RPG_TOTEMS.filter(totem => totem.activity === 'casino')
assert.equal(casinoTotems.length, 5)
assert.equal(RPG_TOTEMS.length, 60)
assert.equal(getGroupTotemBuff(
  {
    groupTotems: {
      group: {
        id: casinoTotems[0].id,
        activatedAt: Date.now(),
        expiresAt: Date.now() + RPG_TOTEM_DURATION
      }
    }
  },
  'group',
  'casino',
  'income'
), 1.1)

const negativeAllTotems = RPG_TOTEMS.filter(totem =>
  totem.activity === 'all' && Object.values(totem.buffs).some(value => value < 1)
)
assert.equal(negativeAllTotems.length, 5)
for (const totem of negativeAllTotems) {
  const stat = Object.keys(totem.buffs)[0]
  assert.equal(getGroupTotemBuff({
    groupTotems: {
      group: {
        id: totem.id,
        activatedAt: Date.now(),
        expiresAt: Date.now() + RPG_TOTEM_DURATION
      }
    }
  }, 'group', 'casino', stat), totem.buffs[stat])
}

const activeData = {
  groupTotems: {
    group: {
      id: casinoTotems[0].id,
      activatedAt: Date.now(),
      expiresAt: Date.now() + RPG_TOTEM_DURATION
    }
  }
}
assert.equal(getActiveGroupTotem(activeData, 'group').id, casinoTotems[0].id)
assert.ok(getActiveGroupTotemExpiry(activeData, 'group') > Date.now())
activeData.groupTotems.group.expiresAt = Date.now() - 1
assert.equal(getActiveGroupTotem(activeData, 'group'), null)
assert.equal(getGroupTotemBuff(activeData, 'group', 'casino', 'income'), 1)

console.log('rpg fish size and totem tests passed')
