import { isHasilTernakKey } from './rpg-libternakData.js'
import { INTERSTELLAR_ITEM_BY_ID } from './rpg-exploreData.js'
import { MOUNT_TRASH } from './mountData.js'
import { jenisMasakan } from './rpg-masakanData.js'
import { sendRpgButtons } from './rpgActionButtons.js'
import { getRpgWibDateKey } from './rpgTime.js'
import { isPremiumAccount } from './rpgPremium.js'
import { isRpgEventActive } from './rpgEvents.js'

export const RPG_STORAGE_BASE_CAPACITY = 100
export const RPG_STORAGE_CAPACITY_PER_LEVEL = 50
export const RPG_STORAGE_BYPASS_DURATION_MS = 60 * 60 * 1000
export const RPG_STORAGE_BYPASS_DAILY_LIMIT = 2

const storageTypes = {
  fish: { label: 'Aquarium', icon: '🐠' },
  ore: { label: 'Ore Tambang', icon: '⛏️' },
  item: { label: 'Item Adventure', icon: '⚔️' },
  stellar: { label: 'Hasil Interstellar', icon: '🌌' },
  food: { label: 'Makanan', icon: '🍽️' },
  drink: { label: 'Minuman', icon: '🥤' },
  garden: { label: 'Hasil Kebun', icon: '🌾' },
  karung: { label: 'Karung Sampah', icon: '🧺' },
  gudang: { label: 'Gudang Lainnya', icon: '📦' }
}

const storageAliases = {
  ikan: 'fish',
  aquarium: 'fish',
  tambang: 'ore',
  mining: 'ore',
  adventure: 'item',
  jelajah: 'stellar',
  interstellar: 'stellar',
  invst: 'stellar',
  masakan: 'food',
  kulkas: 'kulkas',
  minuman: 'drink',
  kebun: 'garden',
  panen: 'garden',
  sampah: 'karung',
  karung: 'karung',
  gudang: 'gudang'
}

const oreKeys = new Set([
  'stone', 'sand_stone', 'copper', 'iron', 'tin', 'silver', 'gold', 'mushroomite', 'platinum',
  'bananite', 'cardboardite', 'poopite', 'fillium', 'cobalt', 'titanium', 'obsidian', 'rivalite',
  'uranium', 'lightite', 'demonite', 'darkryte', 'iore', 'aite', 'blue_crystal', 'orange_crystal',
  'green_crystal', 'purple_crystal', 'red_crystal', 'arcane_crystal', 'grass', 'graphite', 'aetherite',
  'valtry', 'sanctis', 'snowite', 'voidar', 'galaxy', 'tungsten', 'sulfur', 'pumice', 'cuprite',
  'massacerit', 'ethereal_light', 'wood', 'diamond', 'coin', 'gemstone'
])

const adventureItemKeys = new Set([
  'tulang', 'kayu', 'batu', 'jamur', 'daun_kering', 'koin_tembaga', 'ramuan_kecil', 'tali',
  'kain_lusuh', 'koin_perak', 'ramuan_sedang', 'belati_karat', 'perisai_kayu', 'koin_emas',
  'ramuan_besar', 'pedang_baja', 'armor_kulit', 'permata_biru', 'permata_merah', 'permata_hijau',
  'peta_harta', 'pedang_legendaris', 'buku_sihir_kuno', 'armor_naga', 'mahkota_raja',
  'pecahan_bintang', 'air_mata_dewi', 'segel_dewa', 'jiwa_abadi', 'diamond', 'iron',
  ...MOUNT_TRASH.map(({ id }) => id)
])

const gardenKeys = new Set([
  'kacang', 'bawang_putih', 'padi', 'bawang_merah', 'wortel', 'timun', 'selada', 'kentang',
  'tomat', 'ubi', 'jagung', 'brokoli', 'terong', 'semangka', 'lemon', 'cabai', 'paprika',
  'stroberi', 'jeruk', 'bluberi', 'ceri', 'kastanye', 'zaitun', 'pisang', 'nanas', 'kiwi',
  'pir', 'persik', 'melon', 'anggur', 'mangga', 'apel_hijau', 'alpukat', 'apel_merah',
  'kelapa', 'durian', 'sawit', 'emas', 'berlian', 'apel', 'koin'
])

const drinkKeys = new Set(jenisMasakan.minuman)
const foodKeys = new Set(jenisMasakan.makanan)

function itemType(item) {
  if (INTERSTELLAR_ITEM_BY_ID.has(item)) return 'stellar'
  if (gardenKeys.has(item)) return 'garden'
  if (adventureItemKeys.has(item)) return 'item'
  if (oreKeys.has(item)) return 'ore'
  if (isHasilTernakKey(item)) return 'gudang'
  return 'gudang'
}

export function normalizeStorageType(value) {
  const type = String(value || '').trim().toLowerCase()
  if (type === 'bag') return 'bag'
  if (type === 'all' || type === 'level') return type
  return storageAliases[type] || (storageTypes[type] ? type : null)
}

export function getStorageLevel(user) {
  return Math.max(0, Math.floor(Number(user?.inventoryLevel) || 0))
}

export function getStorageCapacity(user) {
  return RPG_STORAGE_BASE_CAPACITY + getStorageLevel(user) * RPG_STORAGE_CAPACITY_PER_LEVEL
}

export function isStorageBypassActive(user, now = Date.now()) {
  return Number(user?.inventoryBypassExpiresAt) > now
}

export function getStorageBypassStatus(user, now = Date.now()) {
  const date = getRpgWibDateKey(now)
  const uses = user?.inventoryBypassDate === date
    ? Math.max(0, Math.floor(Number(user?.inventoryBypassUses) || 0))
    : 0
  const expiresAt = Number(user?.inventoryBypassExpiresAt) || 0
  return {
    date,
    uses,
    remainingUses: Math.max(0, RPG_STORAGE_BYPASS_DAILY_LIMIT - uses),
    expiresAt,
    active: expiresAt > now
  }
}

export function activateStorageBypass(user, now = Date.now()) {
  if (!user || typeof user !== 'object') throw new TypeError('An RPG user is required to activate storage bypass.')
  const current = getStorageBypassStatus(user, now)
  user.inventoryBypassDate = current.date
  user.inventoryBypassUses = current.uses

  if (current.active) return { ...current, status: 'active' }
  if (current.uses >= RPG_STORAGE_BYPASS_DAILY_LIMIT) return { ...current, status: 'limit' }

  user.inventoryBypassUses++
  user.inventoryBypassExpiresAt = now + RPG_STORAGE_BYPASS_DURATION_MS
  return {
    ...getStorageBypassStatus(user, now),
    status: 'activated'
  }
}

export function getStorageUpgradeCost(playerLevel, fromLevel, targetLevel) {
  const baseCost = BigInt(Math.max(1, Math.floor(Number(playerLevel) || 1))) * 5000n
  let total = 0n
  for (let nextLevel = Math.max(0, Math.floor(Number(fromLevel) || 0)); nextLevel < targetLevel; nextLevel++) {
    total += baseCost * (2n ** BigInt(nextLevel))
  }
  return total
}

export function getStorageDefinitions() {
  return storageTypes
}

export function getStorageEntries(user, type) {
  const result = {}
  const add = (name, amount) => {
    const quantity = Math.max(0, Math.floor(Number(amount) || 0))
    if (quantity > 0) result[name] = (result[name] || 0) + quantity
  }

  if (type === 'karung') {
    for (const [name, amount] of Object.entries(user?.karung || {})) add(name, amount)
  } else if (type === 'fish') {
    for (const [name, amount] of Object.entries(user?.ikan || {})) add(name, amount)
  } else if (type === 'ore' || type === 'item' || type === 'stellar' || type === 'garden' || type === 'gudang') {
    if (type === 'ore') {
      for (const [name, amount] of Object.entries(user?.ores || {})) add(name, amount)
    }
    if (type === 'item') {
      for (const [name, amount] of Object.entries(user?.items || {})) add(name, amount)
    }
    for (const [name, amount] of Object.entries(user?.inventory || {})) {
      if (itemType(name) === type) add(name, amount)
    }
  } else if (type === 'food' || type === 'drink') {
    for (const [name, amount] of Object.entries(user?.masakan || {})) {
      const normalized = String(name).replace(/\s+/g, '_').toLowerCase()
      if (type === 'drink' ? drinkKeys.has(normalized) : !drinkKeys.has(normalized)) add(normalized, amount)
    }
  }

  return result
}

function normalizeFavoriteItem(item) {
  return String(item || '').trim().toLowerCase().replace(/\s+/g, '_')
}

export function isStorageFavorite(user, type, item) {
  const key = `${String(type || '').trim().toLowerCase()}:${normalizeFavoriteItem(item)}`
  return user?.inventoryFavorites?.[key] === true
}

export function setStorageFavorite(user, type, item, favorite = true) {
  if (!user || typeof user !== 'object') throw new TypeError('An RPG user is required to manage inventory favorites.')
  const normalizedType = String(type || '').trim().toLowerCase()
  const normalizedItem = normalizeFavoriteItem(item)
  if (!storageTypes[normalizedType] || !normalizedItem) {
    throw new RangeError('A valid storage type and item are required.')
  }
  if (!user.inventoryFavorites || typeof user.inventoryFavorites !== 'object' || Array.isArray(user.inventoryFavorites)) {
    user.inventoryFavorites = {}
  }
  const key = `${normalizedType}:${normalizedItem}`
  if (favorite) user.inventoryFavorites[key] = true
  else delete user.inventoryFavorites[key]
  return Boolean(favorite)
}

export function getStorageFavoriteCount(user, type) {
  return Object.entries(getStorageEntries(user, type))
    .reduce((total, [item, amount]) => total + (isStorageFavorite(user, type, item) ? amount : 0), 0)
}

export function getStorageCount(user, type) {
  return Object.values(getStorageEntries(user, type)).reduce((total, amount) => total + amount, 0)
}

export function isStorageFull(user, type, now = Date.now()) {
  if (isStorageBypassActive(user, now) || isRpgEventActive('inventory_bypass', now)) return false
  return getStorageCount(user, type) >= getStorageCapacity(user)
}

export function getStorageAvailableSpace(user, type, now = Date.now()) {
  if (isStorageBypassActive(user, now) || isRpgEventActive('inventory_bypass', now)) return Number.MAX_SAFE_INTEGER
  return Math.max(0, getStorageCapacity(user) - getStorageCount(user, type))
}

export function getStorageItemType(item) {
  const normalized = String(item || '').replace(/\s+/g, '_').toLowerCase()
  if (drinkKeys.has(normalized)) return 'drink'
  if (foodKeys.has(normalized) || normalized.startsWith('olahan_')) return 'food'
  return itemType(normalized)
}

export async function sendStorageFullNotice(conn, m, user, type, usedPrefix = '.') {
  const storage = storageTypes[type] || storageTypes.gudang
  const count = getStorageCount(user, type)
  const capacity = getStorageCapacity(user)
  const account = global.db?.data?.users?.[m.sender]
  const canBypass = isPremiumAccount(account)
  const sellCommand = type === 'karung'
    ? `${usedPrefix}pasar jual karung all`
    : `${usedPrefix}sell all`
  const text =
    `╭─❏「 ${storage.icon} PENYIMPANAN PENUH 」❏\n` +
    `│ ${storage.label}: ${count.toLocaleString()}/${capacity.toLocaleString()}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> Upgrade satu level: *${usedPrefix}inv up*\n` +
    `> Jual semua item: *${sellCommand}*\n` +
    (canBypass ? `> Premium: bypass semua batas selama 1 jam, maksimal 2 kali per hari dengan *${usedPrefix}inv bypass*.\n` : '') +
    `> Hasil aktivitas sebelumnya tetap utuh; pilih salah satu tindakan di bawah.`
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    reply: fallbackText => m.reply(fallbackText),
    title: '📦 PENYIMPANAN PENUH',
    text,
    buttons: [
      ['🆙 Upgrade Manual', `${usedPrefix}inv up`],
      ['💰 Jual Semua Item', sellCommand],
      ...(canBypass ? [['⏳ Bypass 1 Jam', `${usedPrefix}inv bypass`]] : [])
    ]
  })
}
