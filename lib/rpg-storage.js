import { isHasilTernakKey } from './rpg-libternakData.js'
import { INTERSTELLAR_ITEM_BY_ID } from './rpg-exploreData.js'
import { MOUNT_TRASH } from './mountData.js'
import { jenisMasakan } from './rpg-masakanData.js'
import { isPremiumAccount } from './rpgPremium.js'
import { sendRpgQuickButton } from './rpgActionButtons.js'

export const RPG_STORAGE_BASE_CAPACITY = 100
export const RPG_STORAGE_CAPACITY_PER_LEVEL = 50

const storageTypes = {
  fish: { label: 'Aquarium', icon: '🐠' },
  ore: { label: 'Ore Tambang', icon: '⛏️' },
  item: { label: 'Item Adventure', icon: '⚔️' },
  stellar: { label: 'Hasil Interstellar', icon: '🌌' },
  food: { label: 'Makanan', icon: '🍽️' },
  drink: { label: 'Minuman', icon: '🥤' },
  garden: { label: 'Hasil Kebun', icon: '🌾' },
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

export function getRequiredStorageLevel(itemCount, currentLevel = 0) {
  const count = Math.max(0, Math.floor(Number(itemCount) || 0))
  const level = Math.max(0, Math.floor(Number(currentLevel) || 0))
  return Math.max(level, Math.floor((count - RPG_STORAGE_BASE_CAPACITY) / RPG_STORAGE_CAPACITY_PER_LEVEL) + 1)
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

  if (type === 'fish') {
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

export function getStorageCount(user, type) {
  return Object.values(getStorageEntries(user, type)).reduce((total, amount) => total + amount, 0)
}

export function isStorageFull(user, type) {
  return getStorageCount(user, type) >= getStorageCapacity(user)
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
  const text =
    `╭─❏「 ${storage.icon} PENYIMPANAN PENUH 」❏\n` +
    `│ ${storage.label}: ${count.toLocaleString()}/${capacity.toLocaleString()}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> Upgrade kapasitas dengan *${usedPrefix}inv up* atau kosongkan penyimpanan terlebih dahulu.\n` +
    `> Hasil aktivitas sebelumnya tetap utuh; coba lagi setelah kapasitas tersedia.`
  const account = global.db?.data?.users?.[m.sender]
  if (isPremiumAccount(account)) {
    return sendRpgQuickButton(conn, m, {
      title: '📦 PENYIMPANAN PENUH',
      text: `${text}\n\n👑 Premium: tingkatkan kapasitas secukupnya sekaligus.`,
      buttonText: '👑 Upgrade Slot Otomatis',
      command: `${usedPrefix}inv up max`
    })
  }
  return m.reply(text)
}
