const storageAliases = {
  inv: 'inventory',
  bag: 'inventory',
  backpack: 'inventory',
  aquarium: 'ikan',
  fish: 'ikan',
  ore: 'ores',
  material: 'ores',
  adventure: 'items',
  kulkas: 'masakan',
  cooking: 'masakan',
  panen_lama: 'hasilKebun',
  saldo: 'balance'
}

const storageFields = ['inventory', 'ikan', 'ores', 'items', 'masakan', 'hasilKebun']
const balanceFields = ['diamond', 'gold', 'iron', 'stone', 'wood', 'limit']

function normalize(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '_')
}

function getBucket(user, bucket) {
  if (bucket === 'money') return { money: true }
  if (bucket === 'balance') return { balance: true }
  if (bucket === 'bank' || balanceFields.includes(bucket)) return { field: bucket }
  const field = storageAliases[bucket] || bucket
  return storageFields.includes(field) ? { field } : null
}

export function findTransferItems(user, itemInput) {
  const input = normalize(itemInput)
  if (!input || !user) return []

  let requestedBucket = null
  let item = input
  const separator = input.indexOf(':')
  if (separator !== -1) {
    requestedBucket = getBucket(user, input.slice(0, separator))
    item = input.slice(separator + 1)
    if (!requestedBucket || !item) return []
  }

  if (item === 'money' || item === 'bank') {
    if (requestedBucket && (requestedBucket.money || requestedBucket.field !== item)) return []
    const bucket = item === 'money' ? { money: true } : { field: 'bank' }
    return [{ ...bucket, item, label: item }]
  }

  const matches = []
  for (const field of storageFields) {
    if ((!requestedBucket || (!requestedBucket.balance && requestedBucket.field === field)) && Number(user[field]?.[item]) > 0) {
      matches.push({ field, item, label: `${item} (${field})` })
    }
  }
  for (const field of balanceFields) {
    if ((!requestedBucket || requestedBucket.balance || requestedBucket.field === field) && Number(user[field]) > 0 && field === item) {
      matches.push({ field: 'balance', item: field, balanceField: field, label: `${item} (saldo RPG)` })
    }
  }
  return matches
}

export function parseTransferReference(reference) {
  const separator = String(reference || '').indexOf(':')
  if (separator <= 0) return null
  const bucket = String(reference).slice(0, separator)
  const item = String(reference).slice(separator + 1)
  if (bucket === 'money') return item === 'money' ? { money: true, item, label: item } : null
  if (bucket === 'bank') return item === 'bank' ? { field: 'bank', item, label: item } : null
  if (bucket === 'balance') {
    return balanceFields.includes(item) ? { field: 'balance', balanceField: item, item, label: `${item} (saldo RPG)` } : null
  }
  const resolvedBucket = getBucket(null, bucket)
  if (!resolvedBucket?.field || !storageFields.includes(resolvedBucket.field) || !item) return null
  return { field: resolvedBucket.field, item, label: `${item} (${resolvedBucket.field})` }
}

export function getTransferBalance(user, reference) {
  if (!user || !reference) return 0
  if (reference.money) return 0
  if (reference.field === 'balance') return Number(user[reference.balanceField]) || 0
  if (reference.field === 'bank') return Number(user.bank) || 0
  return Number(user[reference.field]?.[reference.item]) || 0
}

export function changeTransferBalance(user, reference, amount) {
  if (!user || !reference || !Number.isSafeInteger(amount)) return false
  if (reference.money) return false
  if (reference.field === 'balance') {
    user[reference.balanceField] = Math.max(0, (Number(user[reference.balanceField]) || 0) + amount)
    return true
  }
  if (reference.field === 'bank') {
    user.bank = Math.max(0, (Number(user.bank) || 0) + amount)
    return true
  }
  if (!user[reference.field] || typeof user[reference.field] !== 'object') user[reference.field] = {}
  const current = Number(user[reference.field][reference.item]) || 0
  user[reference.field][reference.item] = Math.max(0, current + amount)
  if (user[reference.field][reference.item] === 0) delete user[reference.field][reference.item]
  return true
}

export function makeTransferKey(reference) {
  if (reference.money) return 'money:money'
  if (reference.field === 'bank') return 'bank:bank'
  if (reference.field === 'balance') return `balance:${reference.balanceField}`
  return `${reference.field}:${reference.item}`
}
