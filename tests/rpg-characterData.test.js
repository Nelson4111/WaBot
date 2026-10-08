import assert from 'node:assert/strict'
import {
  BLOODLINES,
  BLOODLINE_ASCEND_COSTS,
  BLOODLINE_RARITY_TIERS,
  getBloodlineRarity
} from '../lib/rpgCharacterData.js'

const tierCounts = Object.fromEntries(
  Object.keys(BLOODLINE_RARITY_TIERS).map(tier => [tier, 0])
)

for (const id of Object.keys(BLOODLINES)) {
  const tier = getBloodlineRarity({ bloodline: id })
  assert.ok(Object.hasOwn(tierCounts, tier), `${id} must use a supported tier`)
  tierCounts[tier] += 1
}

assert.equal(Object.keys(BLOODLINES).length, 150)
assert.ok(Object.values(tierCounts).every(count => count >= 21 && count <= 22))
assert.equal(getBloodlineRarity({ bloodline: 'winion' }), 'UNCOMMON')
assert.ok(!Object.hasOwn(BLOODLINE_RARITY_TIERS, 'TRASH'))
assert.equal(BLOODLINE_ASCEND_COSTS.SECRET, 5000)
assert.ok(
  Object.entries(BLOODLINE_ASCEND_COSTS)
    .filter(([tier]) => tier !== 'SECRET')
    .every(([, cost]) => cost > 0 && cost < 5000)
)

for (const id of ['animal', 'halfblood', 'dinosaur', 'plant', 'artificialIntelligence', 'cartoon', 'divergent', 'dragonHybrid', 'celestialHybrid', 'originHybrid']) {
  assert.ok(Object.hasOwn(BLOODLINES, id), `${id} must be available`)
  const words = BLOODLINES[id].name.trim().split(/\s+/)
  assert.ok(words.length <= 2, `${id} must have at most two name words`)
}
assert.equal(BLOODLINES.artificialIntelligence.name, 'Artificial Intelligence')

console.log('bloodline data tests passed')
