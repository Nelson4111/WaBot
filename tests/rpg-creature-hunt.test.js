import assert from 'node:assert/strict'
import {
  getCreatureRarityDisplay,
  hasFailedCreatureCapture,
  recordFailedCreatureCapture,
  rollCreatureCaptureFailure
} from '../lib/rpgCreatureHunt.js'

assert.equal(getCreatureRarityDisplay('Common').stars, '★☆☆☆☆☆☆')
assert.equal(getCreatureRarityDisplay('Secret').stars, '★★★★★★★')
assert.equal(getCreatureRarityDisplay('Secret').icon, '🔮')
assert.equal(getCreatureRarityDisplay('Common').failureChance, 0)
assert.equal(rollCreatureCaptureFailure({ rarity: 'Rare' }, () => 0), false)
assert.equal(rollCreatureCaptureFailure({ rarity: 'Epic' }, () => 0.14), true)
assert.equal(rollCreatureCaptureFailure({ rarity: 'Epic' }, () => 0.15), false)
assert.equal(rollCreatureCaptureFailure({ rarity: 'Legendary' }, () => 0.24), true)
assert.equal(rollCreatureCaptureFailure({ rarity: 'Mythic' }, () => 0.34), true)
assert.equal(rollCreatureCaptureFailure({ rarity: 'Secret' }, () => 0.49), true)

const player = {}
const otherPlayer = {}
recordFailedCreatureCapture(player, 'pokemon', 'mewtwo')

assert.equal(hasFailedCreatureCapture(player, 'pokemon', 'mewtwo'), true)
assert.equal(hasFailedCreatureCapture(player, 'pokemon', 'pikachu'), false)
assert.equal(hasFailedCreatureCapture(player, 'ghost', 'mewtwo'), false)
assert.equal(hasFailedCreatureCapture(otherPlayer, 'pokemon', 'mewtwo'), false)

recordFailedCreatureCapture(player, 'ghost', 'mewtwo')
assert.equal(hasFailedCreatureCapture(player, 'ghost', 'mewtwo'), true)
