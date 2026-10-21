import { normalizeFishKey, migrateLegacyFishInventory } from './rpg-fishCatalog.js'

export const FISH_SIZE_RANGES = Object.freeze({
  small: Object.freeze([0.1, 0.99]),
  medium: Object.freeze([1, 9.99]),
  big: Object.freeze([10, 49.99]),
  giant: Object.freeze([50, 999.99])
})

export const TRASH_FISH_KEYS = new Set([
  'sampah_plastik', 'ban_bekas', 'botol_kaca', 'kaleng', 'kayu_hanyut',
  'jaring_rusak', 'sepatu', 'botol', 'kantong_plastik', 'duri', 'batu',
  'rumput', 'lumpur', 'daun', 'ranting', 'tali', 'kawat', 'pecahan_kaca',
  'kaos_kaki', 'mie_instan', 'pakaian_dalam', 'gelas_plastik', 'sedotan',
  'sumpit', 'piring', 'stik_es', 'serabut', 'cangkang', 'sandal',
  'kapal_mainan', 'sisir_kayu', 'topi', 'tutup_botol'
])

let nextFishId = 0

export function isTrashFish(name) {
  return TRASH_FISH_KEYS.has(normalizeFishKey(name))
}

export function rollFishSize({ giantAllowed = false, giantChance = 0.005 } = {}) {
  const roll = Math.random()
  if (giantAllowed && roll < giantChance) return 'giant'
  const adjustedRoll = giantAllowed
    ? (roll - giantChance) / (1 - giantChance)
    : roll
  if (adjustedRoll < 0.47) return 'small'
  if (adjustedRoll < 0.92) return 'medium'
  return 'big'
}

export function rollFishWeight(size) {
  const [minimum, maximum] = FISH_SIZE_RANGES[size] || FISH_SIZE_RANGES.medium
  return Number((minimum + Math.random() * (maximum - minimum)).toFixed(2))
}

function createFishRecord(size = 'medium', options = {}) {
  return {
    id: `fish-${Date.now().toString(36)}-${(++nextFishId).toString(36)}`,
    size,
    weight: Number.isFinite(Number(options.weight))
      ? Number(Number(options.weight).toFixed(2))
      : rollFishWeight(size),
    favorite: Boolean(options.favorite)
  }
}

export function ensureFishDetails(user) {
  if (!user || typeof user !== 'object') return false
  let changed = false
  const normalizedInventory = migrateLegacyFishInventory(user.ikan || {})
  if (JSON.stringify(normalizedInventory) !== JSON.stringify(user.ikan || {})) {
    user.ikan = normalizedInventory
    changed = true
  }
  if (!user.ikan || typeof user.ikan !== 'object') {
    user.ikan = {}
    changed = true
  }
  if (!user.fishDetails || typeof user.fishDetails !== 'object' || Array.isArray(user.fishDetails)) {
    user.fishDetails = {}
    changed = true
  }

  const details = {}
  for (const [rawKey, records] of Object.entries(user.fishDetails)) {
    const key = normalizeFishKey(rawKey)
    if (isTrashFish(key) || !Array.isArray(records)) continue
    details[key] = [...(details[key] || []), ...records.filter(record =>
      record && typeof record === 'object' &&
      ['small', 'medium', 'big', 'giant'].includes(record.size) &&
      Number.isFinite(Number(record.weight))
    ).map(record => ({
      id: String(record.id || `fish-${Date.now().toString(36)}-${(++nextFishId).toString(36)}`),
      size: record.size,
      weight: Number(Number(record.weight).toFixed(2)),
      favorite: Boolean(record.favorite)
    }))]
  }
  if (JSON.stringify(details) !== JSON.stringify(user.fishDetails)) {
    user.fishDetails = details
    changed = true
  }

  for (const [key, amountValue] of Object.entries(user.ikan)) {
    const amount = Math.max(0, Math.floor(Number(amountValue) || 0))
    if (amount !== amountValue) {
      user.ikan[key] = amount
      changed = true
    }
    if (isTrashFish(key) || amount === 0) continue
    const records = user.fishDetails[key] || (user.fishDetails[key] = [])
    while (records.length < amount) {
      records.push(createFishRecord(rollFishSize()))
      changed = true
    }
    if (records.length > amount) {
      const removable = records.filter(record => !record.favorite)
      while (records.length > amount && removable.length) {
        const record = removable.pop()
        records.splice(records.indexOf(record), 1)
        changed = true
      }
    }
  }

  for (const key of Object.keys(user.fishDetails)) {
    if (!user.ikan[key] || isTrashFish(key)) {
      delete user.fishDetails[key]
      changed = true
    }
  }
  return changed
}

export function migrateAllFishDetails(wdb) {
  let changed = false
  for (const account of Object.values(wdb?.users || {})) {
    const user = account?.rpg
    if (user && ensureFishDetails(user)) changed = true
  }
  return changed
}

export function addFishRecord(user, name, size) {
  const key = normalizeFishKey(name)
  if (!user || isTrashFish(key)) return null
  ensureFishDetails(user)
  const record = createFishRecord(size)
  user.ikan[key] = (Number(user.ikan[key]) || 0) + 1
  user.fishDetails[key] ||= []
  user.fishDetails[key].push(record)
  return record
}

export function getFishRecords(user, name) {
  if (!user) return []
  ensureFishDetails(user)
  return user.fishDetails[normalizeFishKey(name)] || []
}

export function removeFishRecords(user, name, amount, { includeFavorites = false, ids } = {}) {
  const key = normalizeFishKey(name)
  if (!user || isTrashFish(key)) return []
  ensureFishDetails(user)
  const records = user.fishDetails[key] || []
  const selectedIds = ids ? new Set(ids.map(String)) : null
  const selected = records.filter(record =>
    (selectedIds ? selectedIds.has(record.id) : true) &&
    (includeFavorites || !record.favorite)
  ).slice(0, selectedIds ? selectedIds.size : Math.max(0, Math.floor(Number(amount) || 0)))
  if (!selected.length) return []

  const selectedIdSet = new Set(selected.map(record => record.id))
  user.fishDetails[key] = records.filter(record => !selectedIdSet.has(record.id))
  user.ikan[key] = Math.max(0, (Number(user.ikan[key]) || 0) - selected.length)
  if (user.ikan[key] === 0) {
    delete user.ikan[key]
    delete user.fishDetails[key]
  }
  return selected
}

export function getFishPriceMultiplier(size) {
  return ({ small: 0.4, medium: 1, big: 1.6, giant: 3.2 })[size] || 1
}

export function getAllFishRecords(user) {
  if (!user) return []
  ensureFishDetails(user)
  return Object.entries(user.fishDetails)
    .flatMap(([name, records]) => records.map(record => ({ name, ...record })))
    .sort((a, b) => b.weight - a.weight)
}

export function setFishRecordSize(user, name, index, size, weight) {
  const records = [...getFishRecords(user, name)].sort((a, b) => b.weight - a.weight)
  if (!['small', 'medium', 'big', 'giant'].includes(size)) return null
  const record = records[index - 1]
  if (!record) return null
  const range = FISH_SIZE_RANGES[size]
  const nextWeight = weight === undefined ? rollFishWeight(size) : Number(weight)
  if (!Number.isFinite(nextWeight) || nextWeight < range[0] || nextWeight > range[1]) {
    return { invalidWeight: true, range }
  }
  record.size = size
  record.weight = Number(nextWeight.toFixed(2))
  return record
}
