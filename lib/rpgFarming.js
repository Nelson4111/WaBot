import { addRpgMoney } from './rpgMoney.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome } from './rpgDifficulty.js'

export const CROP_HARVEST_GRACE_PERIOD = 5 * 60 * 60 * 1000

export function getCropReadyDuration(crop, info, fallbackDuration = Number(info?.waktu) || 0) {
  const storedDuration = Number(crop?.waktuPanen)
  if (Number.isFinite(storedDuration) && storedDuration > 0) return storedDuration
  return Number(fallbackDuration) || 0
}

export function isCropWilted(crop, info, now = Date.now(), fallbackDuration = Number(info?.waktu) || 0) {
  const plantedAt = Number(crop?.waktuTanam)
  if (!Number.isFinite(plantedAt) || plantedAt <= 0) return false

  const readyAfter = getCropReadyDuration(crop, info, fallbackDuration)
  if (readyAfter <= 0) return false
  return now - plantedAt > readyAfter + CROP_HARVEST_GRACE_PERIOD
}

export function removeWiltedCrops(user, wdb, userId, seeds, now = Date.now()) {
  const crops = []
  let baseAppreciation = 0

  for (let slot = 1; slot <= user.maxLadang; slot++) {
    const crop = user.ladang[slot]
    const info = seeds[crop?.jenis]
    if (!crop || !info || !isCropWilted(
      crop,
      info,
      now,
      scaleDifficultyCooldown(user, info.waktu)
    )) continue

    const cropAppreciation = Math.floor((Number(info.harga) || 0) / 2)
    crops.push({ jenis: crop.jenis, emoji: info.emoji, appreciation: cropAppreciation })
    baseAppreciation += cropAppreciation
    delete user.ladang[slot]
  }

  const appreciation = scaleDifficultyIncome(user, baseAppreciation)
  if (appreciation > 0) {
    wdb.money[userId] = addRpgMoney(wdb.money[userId], appreciation)
  }

  return { crops, appreciation }
}

export function formatCropWiltedAppreciation(crops, appreciation, formatName) {
  if (!crops.length) return ''

  const cropList = crops
    .map(crop => `> ${crop.emoji} ${formatName(crop.jenis)} - Rp ${crop.appreciation.toLocaleString()}`)
    .join('\n')
  return `─━━━━━━━━━━━━━━─\n` +
    `🥀 *TANAMAN LAYU*\n` +
    `${cropList}\n\n` +
    `💸 *Apresiasi Petani Avelia:* Rp ${appreciation.toLocaleString()}\n\n` +
    `📌 *PESAN*\n` +
    `> ↳ Panen tanaman maksimal 5 jam setelah siap.\n` +
    `─━━━━━━━━━━━━━━─`
}
