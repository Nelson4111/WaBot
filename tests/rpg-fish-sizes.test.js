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
  getActiveGroupTotems,
  getActiveGroupTotemExpiry,
  getGroupTotemBuff,
  RPG_TOTEMS,
  RPG_TOTEM_DURATION
} from '../lib/rpg-totemData.js'
import {
  consumeRpgFishBait,
  findRpgFishBait,
  getActiveRpgFishBait,
  grantDailyNormalBait,
  rollRpgFishBaitReward,
  RPG_FISH_BAITS,
  RPG_FISH_TIERS
} from '../lib/rpg-fishCatalog.js'

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
    group: [
      {
        id: casinoTotems[0].id,
        owner: 'user-one',
        activatedAt: Date.now(),
        expiresAt: Date.now() + RPG_TOTEM_DURATION
      },
      {
        id: casinoTotems[1].id,
        owner: 'user-two',
        activatedAt: Date.now(),
        expiresAt: Date.now() + RPG_TOTEM_DURATION
      }
    ]
  }
}
assert.equal(getActiveGroupTotem(activeData, 'group').id, casinoTotems[0].id)
assert.equal(getActiveGroupTotems(activeData, 'group').length, 2)
assert.ok(getActiveGroupTotemExpiry(activeData, 'group') > Date.now())
assert.equal(getActiveGroupTotemExpiry(activeData, 'group', casinoTotems[0].id, 'user-one') > Date.now(), true)
assert.equal(getActiveGroupTotemExpiry(activeData, 'group', casinoTotems[0].id, 'user-two'), 0)
assert.equal(getGroupTotemBuff(activeData, 'group', 'casino', 'income'), 1.1 * 1.15)
activeData.groupTotems.group[0].expiresAt = Date.now() - 1
assert.equal(getActiveGroupTotems(activeData, 'group').length, 1)
assert.equal(getGroupTotemBuff(activeData, 'group', 'casino', 'income'), 1.15)

assert.ok(RPG_FISH_BAITS.length >= 10)
assert.ok(findRpgFishBait('Normal Bait'))
const baitSwitchUser = { fishBaits: { normal: 1, silver: 2 }, activeFishBait: 'normal' }
assert.equal(getActiveRpgFishBait(baitSwitchUser).id, 'normal')
assert.equal(consumeRpgFishBait(baitSwitchUser).id, 'normal')
assert.equal(baitSwitchUser.fishBaits.normal, 0)
assert.equal(getActiveRpgFishBait(baitSwitchUser).id, 'silver')
assert.equal(consumeRpgFishBait(baitSwitchUser).id, 'silver')
assert.equal(consumeRpgFishBait(baitSwitchUser).id, 'silver')
assert.equal(consumeRpgFishBait(baitSwitchUser), null)
assert.equal(baitSwitchUser.activeFishBait, null)
assert.equal(rollRpgFishBaitReward(() => 0.5).id, 'normal')
const nonNormalRewardRolls = [0, 0.9]
assert.notEqual(rollRpgFishBaitReward(() => nonNormalRewardRolls.shift()).id, 'normal')
assert.equal(rollRpgFishBaitReward(() => 0.5), null)
for (const tier of RPG_FISH_TIERS) {
  const bait = RPG_FISH_BAITS.find(item => item.effects.targetTier === tier.name)
  assert.ok(bait, `expected a targeted bait for ${tier.name}`)
}
const baitUser = { fishBaits: { normal: 0 } }
const dayOne = Date.parse('2026-10-22T12:00:00+07:00')
assert.equal(grantDailyNormalBait(baitUser, dayOne), 25)
assert.equal(grantDailyNormalBait(baitUser, dayOne + 1000), 0)
assert.equal(grantDailyNormalBait(baitUser, dayOne + 24 * 60 * 60 * 1000), 0)
baitUser.fishBaits.normal = 24
assert.equal(grantDailyNormalBait(baitUser, dayOne + 48 * 60 * 60 * 1000), 25)
assert.equal(baitUser.fishBaits.normal, 49)
assert.equal(RPG_FISH_TIERS.length, 8)

console.log('rpg fish size and totem tests passed')
