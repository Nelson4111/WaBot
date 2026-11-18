import { MOUNT_TRASH } from './mountData.js'
import { ikanEmoji, normalizeFishKey, RPG_FISH_TIERS } from './rpg-fishCatalog.js'

export const ADVENTURE_TRASH_ITEMS = Object.freeze([
  { id: 'tulang', name: 'Tulang', emoji: '🦴' },
  { id: 'batu', name: 'Batu', emoji: '🪨' },
  { id: 'jamur', name: 'Jamur', emoji: '🍄' },
  { id: 'daun_kering', name: 'Daun Kering', emoji: '🍂' },
  { id: 'kain_lusuh', name: 'Kain Lusuh', emoji: '👕' },
  { id: 'nebula_dust', name: 'Nebula Dust', emoji: '🌌' },
  { id: 'lunar_alloy', name: 'Lunar Alloy', emoji: '🌙' },
  { id: 'comet_ice', name: 'Comet Ice', emoji: '☄️' },
  { id: 'starwood', name: 'Starwood', emoji: '🌟' },
  { id: 'stellar_credit', name: 'Stellar Credit', emoji: '🌠' }
])

function formatTrashName(id) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

const itemsById = new Map()
const addItem = item => {
  if (!itemsById.has(item.id)) {
    itemsById.set(item.id, {
      id: item.id,
      name: item.name || formatTrashName(item.id),
      emoji: item.emoji || '🗑️',
      price: Number(item.price) || 5000
    })
  }
}

for (const item of MOUNT_TRASH) addItem(item)

const fishTrash = RPG_FISH_TIERS.find(tier => tier.name === 'TRASH')?.fish || []
const fishTrashIds = new Set(fishTrash.map(rawId => normalizeFishKey(rawId)))
for (const rawId of fishTrash) {
  const id = normalizeFishKey(rawId)
  addItem({ id, emoji: ikanEmoji[id] || ikanEmoji[`ikan_${id}`] || '🗑️' })
}

for (const item of ADVENTURE_TRASH_ITEMS) addItem(item)

export const RPG_KARUNG_ITEMS = Object.freeze([...itemsById.values()])
export const RPG_KARUNG_ITEM_BY_ID = new Map(RPG_KARUNG_ITEMS.map(item => [item.id, item]))
export const RPG_KARUNG_ITEM_IDS = new Set(RPG_KARUNG_ITEM_BY_ID.keys())
export const ADVENTURE_TRASH_IDS = new Set(ADVENTURE_TRASH_ITEMS.map(item => item.id))
const inventoryTrashIds = new Set([
  ...MOUNT_TRASH.map(({ id }) => id),
  ...ADVENTURE_TRASH_IDS
])

export function isRpgTrashItem(itemId) {
  return RPG_KARUNG_ITEM_IDS.has(String(itemId || '').trim().toLowerCase().replace(/\s+/g, '_'))
}

export function addRpgTrashToKarung(user, itemId, amount = 1) {
  const id = String(itemId || '').trim().toLowerCase().replace(/\s+/g, '_')
  if (!RPG_KARUNG_ITEM_BY_ID.has(id)) throw new RangeError(`Unknown RPG trash item: ${id}`)
  const quantity = Number(amount)
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new RangeError('RPG trash quantity must be a positive safe integer.')
  }
  if (!user.karung || typeof user.karung !== 'object' || Array.isArray(user.karung)) user.karung = {}
  user.karung[id] = (Number(user.karung[id]) || 0) + quantity
  return user.karung[id]
}

export function migrateRpgTrashToKarung(user) {
  if (!user || typeof user !== 'object') return false
  if (!user.karung || typeof user.karung !== 'object' || Array.isArray(user.karung)) user.karung = {}

  let changed = false
  for (const [source, normalize, allowedIds] of [
    [user.ikan, normalizeFishKey, fishTrashIds],
    [user.inventory, item => String(item || '').trim().toLowerCase().replace(/\s+/g, '_'), inventoryTrashIds]
  ]) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) continue
    for (const [rawId, rawAmount] of Object.entries(source)) {
      const id = normalize(rawId)
      const amount = Number(rawAmount)
      if (!allowedIds.has(id) || !RPG_KARUNG_ITEM_BY_ID.has(id) || !Number.isSafeInteger(amount) || amount <= 0) continue
      user.karung[id] = (Number(user.karung[id]) || 0) + amount
      delete source[rawId]
      changed = true
    }
  }
  return changed
}
