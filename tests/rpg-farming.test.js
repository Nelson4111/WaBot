import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CROP_HARVEST_GRACE_PERIOD,
  formatCropWiltedAppreciation,
  getCropReadyDuration,
  isCropWilted,
  removeWiltedCrops
} from '../lib/rpgFarming.js'

const plantedAt = 1_000_000
const seedInfo = { waktu: 10 * 60 * 1000 }

test('crops wilt only after five hours have passed since they were ready', () => {
  const crop = { waktuTanam: plantedAt, waktuPanen: seedInfo.waktu }
  const wiltAt = plantedAt + seedInfo.waktu + CROP_HARVEST_GRACE_PERIOD

  assert.equal(isCropWilted(crop, seedInfo, wiltAt), false)
  assert.equal(isCropWilted(crop, seedInfo, wiltAt + 1), true)
})

test('saved planting duration determines when the harvest window starts', () => {
  const crop = { waktuTanam: plantedAt, waktuPanen: 2 * seedInfo.waktu }
  const wiltAt = plantedAt + crop.waktuPanen + CROP_HARVEST_GRACE_PERIOD

  assert.equal(getCropReadyDuration(crop, seedInfo), crop.waktuPanen)
  assert.equal(isCropWilted(crop, seedInfo, wiltAt), false)
  assert.equal(isCropWilted(crop, seedInfo, wiltAt + 1), true)
})

test('legacy crops use the supplied fallback duration and unknown crops are preserved', () => {
  const crop = { waktuTanam: plantedAt }
  const fallbackDuration = 30 * 60 * 1000
  const wiltAt = plantedAt + fallbackDuration + CROP_HARVEST_GRACE_PERIOD

  assert.equal(getCropReadyDuration(crop, seedInfo, fallbackDuration), fallbackDuration)
  assert.equal(isCropWilted(crop, seedInfo, wiltAt, fallbackDuration), false)
  assert.equal(isCropWilted(crop, null, wiltAt + 1, 0), false)
})

test('wilted crops are removed and grant half-price appreciation', () => {
  const user = {
    maxLadang: 2,
    ladang: {
      1: { jenis: 'wortel', waktuTanam: plantedAt, waktuPanen: seedInfo.waktu },
      2: { jenis: 'wortel', waktuTanam: plantedAt, waktuPanen: 24 * 60 * 60 * 1000 }
    }
  }
  const wdb = { money: { farmer: 100 } }
  const wiltAt = plantedAt + seedInfo.waktu + CROP_HARVEST_GRACE_PERIOD + 1
  const seeds = { wortel: { ...seedInfo, emoji: '🥕', harga: 4500 } }

  const result = removeWiltedCrops(user, wdb, 'farmer', seeds, wiltAt)
  const appreciationText = formatCropWiltedAppreciation(result.crops, result.appreciation, name => name)

  assert.deepEqual(result.crops, [{ jenis: 'wortel', emoji: '🥕', appreciation: 2250 }])
  assert.equal(result.appreciation, 2250)
  assert.equal(wdb.money.farmer, 2350)
  assert.equal(user.ladang[1], undefined)
  assert.ok(user.ladang[2])
  assert.match(appreciationText, /Apresiasi Petani Avelia/)
  assert.ok(appreciationText.includes(`Rp ${result.appreciation.toLocaleString()}`))
})
