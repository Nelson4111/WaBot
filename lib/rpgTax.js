import { normalizeRpgMoney } from './rpgMoney.js'
import { AUCTION_ITEMS } from './rpg-auctionData.js'
import { BANK_SPECIAL_ITEMS, BANK_TIERS } from './rpg-bankData.js'
import { HOME_LEVELS } from './rpgHomeData.js'
import { MALL_CATEGORIES } from './rpgMallData.js'
import { pets as PET_TYPES } from './rpg-petData.js'
import { hewanList as LIVESTOCK_TYPES } from './rpg-libternakData.js'

export const TAX_CATEGORIES = [
  { id: 'income', name: 'Income Tax' },
  { id: 'wealth', name: 'Wealth Tax' },
  { id: 'financial', name: 'Financial Tax' },
  { id: 'property', name: 'Property Tax' },
  { id: 'vehicle', name: 'Vehicle Tax' },
  { id: 'luxury', name: 'Luxury Tax' },
  { id: 'auction', name: 'Auction Tax' },
  { id: 'family', name: 'Family Tax' },
  { id: 'pet', name: 'Pet Tax' },
  { id: 'livestock', name: 'Livestock Tax' },
  { id: 'business', name: 'Business Tax' },
  { id: 'purchase', name: 'Purchase Tax' },
  { id: 'transaction', name: 'Transaction Tax' },
  { id: 'interstellar', name: 'Interstellar Tax' }
]

export const DEFAULT_WEALTH_BRACKETS = [
  { limit: '1000000000', rateBps: 25 },
  { limit: '10000000000', rateBps: 50 },
  { limit: '100000000000', rateBps: 75 },
  { limit: '1000000000000', rateBps: 100 },
  { limit: null, rateBps: 125 }
]

export const DEFAULT_PET_RARITY_FACTORS = {
  COMMON: 10000,
  UNCOMMON: 12500,
  RARE: 15000,
  EPIC: 20000,
  LEGENDARY: 30000,
  MYTHIC: 50000,
  SECRET: 100000
}

export const DEFAULT_TAX_RATES = {
  income: 250,
  financial: 500,
  property: 5,
  vehicle: 5,
  luxury: 10,
  auction: 10,
  pet: 5,
  livestock: 5,
  business: 500,
  purchase: 50,
  transaction: 50,
  interstellar: 10
}

export const DEFAULT_FAMILY_TAX_PER_DEPENDENT = '100000'

export const DEFAULT_PENALTY_TIERS = [
  { days: 2, rateBps: 0 },
  { days: 5, rateBps: 500 },
  { days: 10, rateBps: 1000 },
  { days: 15, rateBps: 1500 },
  { days: null, rateBps: 2000 }
]

const DAY_MS = 24 * 60 * 60 * 1000
const ITEM_CATALOG = [
  ...Object.values(MALL_CATEGORIES).flatMap(category => category.items),
  ...AUCTION_ITEMS,
  ...BANK_SPECIAL_ITEMS
]
const ITEM_PRICES = new Map(ITEM_CATALOG.map(item => [item.id, item.price]))
const AUCTION_ITEM_IDS = new Set(AUCTION_ITEMS.map(item => item.id))
const VEHICLE_ITEM_IDS = new Set((MALL_CATEGORIES.kendaraan?.items || []).map(item => item.id))

function toBigInt(value) {
  const normalized = normalizeRpgMoney(value, 0)
  return BigInt(normalized)
}

function normalizeTaxJid(jid, data) {
  let normalized = String(jid || '')
  if (normalized.endsWith('@lid')) {
    const lid = `${normalized.split('@')[0].split(':')[0]}@lid`
    normalized = global.lids?.[lid] || data.lids?.[lid] || lid
  }
  if (!normalized.includes('@')) return normalized.split(':')[0]
  const [local, domain] = normalized.split('@')
  normalized = `${local.split(':')[0]}@${domain}`
  return normalized
}

export function getTaxPeriod(date = new Date()) {
  const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const weekday = current.getUTCDay() || 7
  current.setUTCDate(current.getUTCDate() + 4 - weekday)
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((current - yearStart) / DAY_MS) + 1) / 7)
  return `${current.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export function parseTaxRateBps(input) {
  const match = String(input ?? '').trim().match(/^(\d{1,3})(?:[.,](\d{1,2}))?%?$/)
  if (!match) return null
  const whole = Number(match[1])
  const fraction = Number((match[2] || '').padEnd(2, '0'))
  const bps = whole * 100 + fraction
  return bps <= 10000 ? bps : null
}

export function calculateProgressiveTax(amount, brackets = DEFAULT_WEALTH_BRACKETS) {
  let remaining = toBigInt(amount)
  if (remaining <= 0n) return { amount: '0', breakdown: [] }

  let previousLimit = 0n
  let total = 0n
  const breakdown = []

  for (const bracket of brackets) {
    const upperLimit = bracket.limit === null ? null : toBigInt(bracket.limit)
    const taxable = upperLimit === null
      ? remaining
      : remaining < upperLimit - previousLimit
        ? remaining
        : upperLimit - previousLimit
    if (taxable > 0n) {
      const tax = taxable * BigInt(bracket.rateBps) / 10000n
      total += tax
      breakdown.push({
        from: previousLimit.toString(),
        to: upperLimit?.toString() ?? null,
        rateBps: bracket.rateBps,
        taxable: taxable.toString(),
        amount: tax.toString()
      })
      remaining -= taxable
    }
    if (remaining <= 0n || upperLimit === null) break
    previousLimit = upperLimit
  }

  return { amount: total.toString(), breakdown }
}

export function getLatePenaltyRateBps(bill, now = Date.now(), tiers = DEFAULT_PENALTY_TIERS) {
  if (now <= Number(bill.dueAt || 0)) return 0
  const daysLate = Math.ceil((now - Number(bill.dueAt)) / DAY_MS)
  return tiers.find(tier => tier.days === null || daysLate <= tier.days)?.rateBps ?? tiers.at(-1)?.rateBps ?? 0
}

export function getBillAmounts(bill, now = Date.now(), tiers = DEFAULT_PENALTY_TIERS) {
  if (bill.waived) return { principal: '0', penalty: '0', total: '0' }

  const principal = toBigInt(bill.principal) - toBigInt(bill.paidPrincipal || '0')
  const penaltyAccrued = principal > 0n
    ? principal * BigInt(getLatePenaltyRateBps(bill, now, tiers)) / 10000n
    : 0n
  const penalty = penaltyAccrued > toBigInt(bill.paidPenalty || '0')
    ? penaltyAccrued - toBigInt(bill.paidPenalty || '0')
    : 0n
  const remainingPrincipal = principal > 0n ? principal : 0n
  return {
    principal: remainingPrincipal.toString(),
    penalty: penalty.toString(),
    total: (remainingPrincipal + penalty).toString()
  }
}

export function ensureTaxState(data) {
  if (!data.taxSystem || typeof data.taxSystem !== 'object') data.taxSystem = {}
  const state = data.taxSystem
  state.config = {
    enabled: true,
    dueDays: 2,
    wealthBrackets: DEFAULT_WEALTH_BRACKETS.map(bracket => ({ ...bracket })),
    penaltyTiers: DEFAULT_PENALTY_TIERS.map(tier => ({ ...tier })),
    rates: Object.fromEntries(TAX_CATEGORIES.map(category => [category.id, DEFAULT_TAX_RATES[category.id] || 0])),
    ...state.config
  }
  if (!state.config.rates || typeof state.config.rates !== 'object') {
    state.config.rates = Object.fromEntries(
      TAX_CATEGORIES.map(category => [category.id, DEFAULT_TAX_RATES[category.id] || 0])
    )
  }
  if ((Number(state.config.ratesVersion) || 0) < 1) {
    for (const [category, rate] of Object.entries(DEFAULT_TAX_RATES)) {
      if (!Number.isInteger(state.config.rates?.[category]) || state.config.rates[category] === 0) {
        state.config.rates[category] = rate
      }
    }
    if (!state.config.familyPerDependent || state.config.familyPerDependent === '0') {
      state.config.familyPerDependent = DEFAULT_FAMILY_TAX_PER_DEPENDENT
    }
    state.config.ratesVersion = 1
  }
  state.config.activatedPeriod ||= getTaxPeriod()
  state.config.familyPerDependent ||= DEFAULT_FAMILY_TAX_PER_DEPENDENT
  state.config.petRarityFactors = {
    ...DEFAULT_PET_RARITY_FACTORS,
    ...state.config.petRarityFactors
  }
  for (const category of TAX_CATEGORIES) {
    if (!Number.isInteger(state.config.rates[category.id])) state.config.rates[category.id] = 0
  }
  state.taxpayers ||= {}
  state.collections ||= {}
  state.audit ||= []
  state.nextTaxId ||= 1
  state.nextTransactionId ||= 1
  state.treasury ||= {}
  state.treasury.balance ||= '0'
  state.treasury.income ||= '0'
  state.treasury.expenses ||= '0'
  state.treasury.revenueByTax ||= {}
  state.treasury.transactions ||= []
  return state
}

export function getOrCreateTaxpayer(state, jid) {
  if (!state.taxpayers[jid]) {
    state.taxpayers[jid] = {
      taxId: `TX-${String(state.nextTaxId++).padStart(6, '0')}`,
      bills: [],
      payments: [],
      snapshots: []
    }
  }
  return state.taxpayers[jid]
}

export function getTaxableWealth(account) {
  const cash = toBigInt(account?.money || 0)
  const bank = toBigInt(account?.rpg?.bank ?? account?.bank ?? 0)
  const investment = toBigInt(account?.taxSnapshot?.investment || '0')
  const property = toBigInt(account?.taxSnapshot?.property || '0')
  const vehicle = toBigInt(account?.taxSnapshot?.vehicle || '0')
  const luxury = toBigInt(account?.taxSnapshot?.luxury || '0')
  const auction = toBigInt(account?.taxSnapshot?.auction || '0')
  const pet = toBigInt(account?.taxSnapshot?.pet || '0')
  const livestock = toBigInt(account?.taxSnapshot?.livestock || '0')
  const debt = toBigInt(account?.rpg?.pinjaman?.jumlah || 0)
  const gross = cash + bank + investment + property + vehicle + luxury + auction + pet + livestock
  return gross > debt ? gross - debt : 0n
}

function sumMoney(values) {
  return values.reduce((total, value) => total + toBigInt(value || 0), 0n)
}

function valueByQuantity(unitPrice, quantity) {
  const match = String(quantity ?? '').match(/^(\d+)(?:\.(\d+))?$/)
  if (!match || !unitPrice) return 0n
  const fraction = match[2] || ''
  const numerator = BigInt(`${match[1]}${fraction}`)
  return toBigInt(unitPrice) * numerator / (10n ** BigInt(fraction.length))
}

function valueInventory(inventory, {
  minimumPrice = 0,
  excludeAuction = false,
  excludeVehicles = false,
  includeOnly
} = {}) {
  let total = 0n
  for (const [itemId, quantity] of Object.entries(inventory || {})) {
    const price = ITEM_PRICES.get(itemId)
    if (!price || (includeOnly && !includeOnly.has(itemId)) || price < minimumPrice ||
        (excludeAuction && AUCTION_ITEM_IDS.has(itemId)) ||
        (excludeVehicles && VEHICLE_ITEM_IDS.has(itemId))) continue
    total += valueByQuantity(price, quantity)
  }
  return total
}

export function calculatePlayerTaxSnapshot(account, data, period = getTaxPeriod(), state = ensureTaxState(data)) {
  const rpg = account?.rpg || {}
  const activity = rpg.taxActivity?.[period] || {}
  const investments = Object.entries(rpg.invest?.portfolio || {}).map(([symbol, holding]) => {
    const price = data.invest?.prices?.[symbol]
    return valueByQuantity(price, holding?.qty)
  })
  const investment = sumMoney(investments)
  const homeLevel = Math.min(HOME_LEVELS.length - 1, Math.max(0, Math.floor(Number(rpg.home?.level) || 0)))
  const property = sumMoney(HOME_LEVELS.slice(1, homeLevel + 1).map(level => level.cost))
  const activePets = Array.isArray(rpg.pets) ? rpg.pets : []
  const petValue = activePets.reduce((total, pet) => {
    const type = PET_TYPES[pet?.tipe]
    if (!type) return total
    const rarityFactor = BigInt(state.config.petRarityFactors[type.rarity] || 10000)
    return total + toBigInt(type.harga) * rarityFactor / 10000n
  }, 0n)
  const livestock = Object.entries(rpg.ternak || {}).reduce((total, [type, quantity]) => {
    const animal = LIVESTOCK_TYPES[type]
    if (!animal || Number(quantity) <= 0) return total
    return total + valueByQuantity(animal.hargaBibit, quantity)
  }, 0n)
  const auction = valueInventory(rpg.auctionVault)
  const luxury = valueInventory(rpg.mallInventory, {
    minimumPrice: 100000000,
    excludeAuction: true,
    excludeVehicles: true
  })
  const vehicle = valueInventory(rpg.home?.garage) +
    valueInventory(rpg.mallInventory, { includeOnly: VEHICLE_ITEM_IDS })
  const wealth = getTaxableWealth({
    ...account,
    taxSnapshot: {
      investment: investment.toString(),
      property: property.toString(),
      vehicle: vehicle.toString(),
      luxury: luxury.toString(),
      auction: auction.toString(),
      pet: petValue.toString(),
      livestock: livestock.toString()
    }
  })
  const familyCount = (Array.isArray(rpg.kids) ? rpg.kids : []).filter(child =>
    child?.custody?.type !== 'orphaned' && Number(child?.umur || 0) < 18
  ).length
  const bankTier = Number(account?.bankTier ?? rpg.bankTier) || 0
  const hasInterstellar = Boolean(BANK_TIERS[bankTier]?.fasilitas.includes('Interstellar Gateway'))
  const interstellarValue = hasInterstellar
    ? toBigInt(state.config.interstellarValues?.[bankTier] ?? BANK_TIERS[bankTier].price)
    : 0n

  return {
    cash: asTaxMoney(account?.money || 0),
    bank: asTaxMoney(rpg.bank ?? account?.bank ?? 0),
    investment: investment.toString(),
    property: property.toString(),
    vehicle: vehicle.toString(),
    luxury: luxury.toString(),
    auction: auction.toString(),
    pet: petValue.toString(),
    livestock: livestock.toString(),
    wealth: wealth.toString(),
    income: asTaxMoney(activity.income || '0'),
    financial: asTaxMoney(activity.financial || '0'),
    purchase: asTaxMoney(activity.purchase || '0'),
    transaction: asTaxMoney(activity.transaction || '0'),
    business: asTaxMoney(activity.business || '0'),
    familyCount,
    interstellar: hasInterstellar,
    interstellarValue: interstellarValue.toString()
  }
}

export function calculateTaxItems(snapshot, config) {
  const wealth = calculateProgressiveTax(snapshot.wealth, config.wealthBrackets)
  const family = BigInt(snapshot.familyCount || 0) * toBigInt(config.familyPerDependent || '0')
  const taxableValues = {
    income: snapshot.income,
    financial: snapshot.financial,
    property: snapshot.property,
    vehicle: snapshot.vehicle,
    luxury: snapshot.luxury,
    auction: snapshot.auction,
    pet: snapshot.pet,
    livestock: snapshot.livestock,
    business: (toBigInt(snapshot.business) > 0n ? toBigInt(snapshot.business) : 0n).toString(),
    purchase: snapshot.purchase,
    transaction: snapshot.transaction,
    interstellar: snapshot.interstellarValue
  }
  const items = Object.fromEntries(TAX_CATEGORIES.map(category => [category.id, '0']))
  items.wealth = wealth.amount
  items.family = family.toString()
  for (const [category, base] of Object.entries(taxableValues)) {
    items[category] = (
      toBigInt(base) * BigInt(config.rates[category] || 0) / 10000n
    ).toString()
  }
  const principal = Object.values(items).reduce((total, amount) => total + BigInt(amount), 0n)
  return { items, principal: principal.toString(), wealthBreakdown: wealth.breakdown }
}

export function recordTaxActivity(data, jid, category, amount, period = getTaxPeriod()) {
  if (!['income', 'financial', 'purchase', 'transaction', 'business'].includes(category)) {
    throw new RangeError(`Kategori aktivitas pajak tidak dikenal: ${category}`)
  }
  const value = toBigInt(amount)
  if (value === 0n || (value < 0n && category !== 'business')) return false
  const state = ensureTaxState(data)
  if (!state.config.enabled) return false
  const user = data.users?.[normalizeTaxJid(jid, data)]
  if (!user?.rpg) return false
  user.rpg.taxActivity ||= {}
  user.rpg.taxActivity[period] ||= {}
  const periodActivity = user.rpg.taxActivity[period]
  const updated = toBigInt(periodActivity[category] || '0') + value
  periodActivity[category] = (category === 'business' && updated < 0n ? 0n : updated).toString()
  const periods = Object.keys(user.rpg.taxActivity).sort()
  for (const expired of periods.slice(0, -54)) delete user.rpg.taxActivity[expired]
  return true
}

export function formatTaxStatus(taxpayer, now = Date.now(), tiers) {
  if (!taxpayer?.bills?.length) return 'Clear'
  const bills = taxpayer.bills.map(bill => getBillAmounts(bill, now, tiers))
  if (bills.some((amount, index) => amount.total !== '0' && now > taxpayer.bills[index].dueAt)) return 'Overdue'
  return bills.some(amount => amount.total !== '0') ? 'Unpaid' : 'Clear'
}

export function getTaxCategory(input) {
  const normalized = String(input ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return TAX_CATEGORIES.find(category =>
    category.id === normalized ||
    category.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
  ) || null
}

export function asTaxMoney(value) {
  return toBigInt(value).toString()
}
