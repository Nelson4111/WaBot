import { addRpgMoney, compareRpgMoney, normalizeRpgMoney, subtractRpgMoney } from './rpgMoney.js'
import { isPremiumAccount } from './rpgPremium.js'
import { ensureTaxState, getTaxPeriod, recordTaxActivity } from './rpgTax.js'
import {
  CAFE_DIALOGUE,
  CAFE_BASE_MENU_LIMIT,
  CAFE_CCTV_COOLDOWN_MS,
  CAFE_DEFAULT_CAPACITY,
  CAFE_CCTV_STORIES,
  CAFE_INGREDIENT_CATALOG,
  CAFE_MENU_LIMIT_PER_LEVEL,
  CAFE_MAX_CUSTOMERS_PER_SHIFT,
  CAFE_MAX_VISITORS,
  CAFE_MENU_CATALOG,
  CAFE_NPCS,
  CAFE_OPERATING_COST_PER_SHIFT,
  CAFE_STARTER_MENU,
  CAFE_STAFF,
  CAFE_STAFF_DIALOGUE,
  CAFE_STAFF_NAMES,
  CAFE_THEMES,
  CAFE_VISIT_COOLDOWN_MS,
  CAFE_VISITOR_STAY_MS,
  CAFE_UPGRADES
} from './rpgCafeData.js'

const MONEY_KEYS = ['balance', 'income', 'expenses']

function getCafeUpgradeCapacity(cafe) {
  const capacityFromUpgrades = Object.entries(CAFE_UPGRADES).reduce((total, [id, upgrade]) =>
    total + (upgrade.capacityBonus || 0) * Math.max(0, Math.floor(Number(cafe.upgrades?.[id]) || 0)),
  Math.max(CAFE_DEFAULT_CAPACITY, Math.floor(Number(cafe.capacityBase) || CAFE_DEFAULT_CAPACITY)))
  const levelBonus = Math.floor(Math.max(0, Number(cafe.level) - 1) / 5) * 2
  return Math.min(CAFE_MAX_CUSTOMERS_PER_SHIFT, capacityFromUpgrades + levelBonus)
}

function isCafePremium(account) {
  return isPremiumAccount(account) || isPremiumAccount(account?.rpg)
}

export function getCafeMenuLimit(cafe) {
  return Math.min(
    Object.keys(CAFE_MENU_CATALOG).length,
    CAFE_BASE_MENU_LIMIT + (Math.max(1, Number(cafe?.level) || 1) - 1) * CAFE_MENU_LIMIT_PER_LEVEL
  )
}

export function getCafeThemePrice(cafe, themeId) {
  const basePrice = CAFE_THEMES[themeId]?.price
  if (basePrice === undefined) return null

  const base = BigInt(normalizeRpgMoney(basePrice, 0))
  const levelCount = BigInt(Math.max(1, Math.floor(Number(cafe?.level) || 1)) - 1)
  const menuCount = BigInt(Object.values(cafe?.menu || {}).filter(menu => menu?.enabled).length)
  const staffCount = BigInt(Object.keys(cafe?.staff || {}).length)
  const upgradeCount = BigInt(Object.values(cafe?.upgrades || {}).reduce((total, level) =>
    total + Math.max(0, Math.floor(Number(level) || 0)), 0))

  const levelSurcharge = base * levelCount * 10n / 100n
  const menuSurcharge = base * menuCount * 2n / 100n
  const staffSurcharge = base * staffCount * 5n / 100n
  const upgradeSurcharge = base * upgradeCount * 10n / 100n

  return {
    base: base.toString(),
    level: levelSurcharge.toString(),
    menu: menuSurcharge.toString(),
    staff: staffSurcharge.toString(),
    upgrades: upgradeSurcharge.toString(),
    total: (base + levelSurcharge + menuSurcharge + staffSurcharge + upgradeSurcharge).toString()
  }
}

export function getCafeStaffCapacity(cafe) {
  return Math.min(20, Math.max(1, Math.floor(Number(cafe?.level) || 1)))
}

export function getCafeStaffRole(employee) {
  return CAFE_STAFF[employee?.role] ? employee.role : null
}

export function ensureCafe(rpg) {
  if (!rpg.cafe || typeof rpg.cafe !== 'object') return null
  const cafe = rpg.cafe
  cafe.name ||= 'Avelia Cafe'
  cafe.status = cafe.status === 'closed' ? 'closed' : 'open'
  cafe.level = Math.max(1, Math.floor(Number(cafe.level) || 1))
  cafe.reputation = Math.min(100, Math.max(0, Math.floor(Number(cafe.reputation) || 50)))
  cafe.popularity = Math.min(10000, Math.max(0, Math.floor(Number(cafe.popularity) || 0)))
  const previousCapacity = Math.max(
    CAFE_DEFAULT_CAPACITY,
    Math.floor(Number(cafe.capacity) || CAFE_DEFAULT_CAPACITY)
  )
  cafe.upgrades ||= {}
  if (!Number.isFinite(Number(cafe.capacityBase))) {
    const purchasedCapacity = Object.entries(CAFE_UPGRADES).reduce((total, [id, upgrade]) =>
      total + (upgrade.capacityBonus || 0) * Math.max(0, Math.floor(Number(cafe.upgrades[id]) || 0)),
    0)
    cafe.capacityBase = Math.max(CAFE_DEFAULT_CAPACITY, previousCapacity - purchasedCapacity)
  }
  cafe.capacityBase = Math.min(
    CAFE_MAX_CUSTOMERS_PER_SHIFT,
    Math.max(CAFE_DEFAULT_CAPACITY, Math.floor(Number(cafe.capacityBase) || CAFE_DEFAULT_CAPACITY))
  )
  cafe.capacity = getCafeUpgradeCapacity(cafe)
  cafe.menu ||= {}
  cafe.menu = Object.fromEntries(Object.entries(cafe.menu).filter(([id, choice]) =>
    CAFE_MENU_CATALOG[id] && choice && typeof choice === 'object'
  ))
  let activeMenuCount = 0
  for (const choice of Object.values(cafe.menu)) {
    if (!choice.enabled) continue
    activeMenuCount++
    if (activeMenuCount > getCafeMenuLimit(cafe)) choice.enabled = false
  }
  cafe.stock ||= {}
  cafe.staff ||= {}
  const legacyStaffIds = new Map()
  const normalizedStaff = {}
  const reservedStaffIds = new Set(Object.keys(cafe.staff).filter(key => !CAFE_STAFF[key]))
  let staffSequence = Math.max(0, Math.floor(Number(cafe.staffSequence) || 0))
  for (const [key, employee] of Object.entries(cafe.staff)) {
    if (!employee || typeof employee !== 'object') continue
    const role = CAFE_STAFF[employee.role] ? employee.role : CAFE_STAFF[key] ? key : null
    if (!role) continue
    let id = key
    if (CAFE_STAFF[key]) {
      const persistedId = /^staff-\d+$/.test(employee.id || '') ? employee.id : null
      if (persistedId && !normalizedStaff[persistedId] && !reservedStaffIds.has(persistedId)) {
        id = persistedId
        staffSequence = Math.max(staffSequence, Number(persistedId.slice(6)))
      } else {
        do {
          staffSequence++
          id = `staff-${String(staffSequence).padStart(4, '0')}`
        } while (normalizedStaff[id] || reservedStaffIds.has(id))
      }
      legacyStaffIds.set(key, id)
    } else {
      const sequenceMatch = /^staff-(\d+)$/.exec(key)
      if (sequenceMatch) staffSequence = Math.max(staffSequence, Number(sequenceMatch[1]))
    }
    employee.id = id
    employee.role = role
    employee.name ||= CAFE_STAFF_NAMES[role][0]
    employee.salaryMultiplier = Math.min(100, Math.max(1, Math.floor(Number(employee.salaryMultiplier) || 1)))
    employee.unpaidShifts = Math.max(0, Math.floor(Number(employee.unpaidShifts) || 0))
    normalizedStaff[id] = employee
  }
  cafe.staff = normalizedStaff
  cafe.staffSequence = staffSequence
  cafe.staffRotationCursor = Math.max(0, Math.floor(Number(cafe.staffRotationCursor) || 0))
  if (cafe.lastShift && typeof cafe.lastShift === 'object') {
    if (Array.isArray(cafe.lastShift.staffOnDuty)) {
      cafe.lastShift.staffOnDuty = cafe.lastShift.staffOnDuty.map(employee => {
        const role = CAFE_STAFF[employee?.role] ? employee.role : CAFE_STAFF[employee?.id] ? employee.id : null
        const id = legacyStaffIds.get(employee?.id) || employee?.id
        return role && normalizedStaff[id]
          ? { ...employee, id, role, name: employee.name || normalizedStaff[id].name }
          : employee
      })
    }
    if (Array.isArray(cafe.lastShift.talkedStaffIds)) {
      cafe.lastShift.talkedStaffIds = cafe.lastShift.talkedStaffIds.map(id => legacyStaffIds.get(id) || id)
    }
  }
  if (!Array.isArray(cafe.currentVisitors)) cafe.currentVisitors = []
  cafe.currentVisitors = cafe.currentVisitors.filter(visitor =>
    CAFE_NPCS.some(npc => npc.id === visitor?.id) && Number(visitor.expiresAt) > Date.now()
  )
  cafe.lastVisitAt = Math.max(0, Number(cafe.lastVisitAt) || 0)
  cafe.finance ||= {}
  for (const key of MONEY_KEYS) cafe.finance[key] = normalizeRpgMoney(cafe.finance[key] ?? '0')
  if (!Array.isArray(cafe.finance.transactions)) cafe.finance.transactions = []
  cafe.finance.totalCustomers = Math.max(0, Number(cafe.finance.totalCustomers) || 0)
  cafe.finance.totalOrders = Math.max(0, Number(cafe.finance.totalOrders) || 0)
  cafe.finance.satisfaction = Math.min(100, Math.max(0, Number(cafe.finance.satisfaction) || 80))
  cafe.finance.transactions = cafe.finance.transactions.slice(0, 100)
  cafe.theme = CAFE_THEMES[cafe.theme] ? cafe.theme : 'classic'
  cafe.autoRestock = cafe.autoRestock === true
  cafe.autoPay = cafe.autoPay === true
  cafe.lastCctvAt = Math.max(0, Number(cafe.lastCctvAt) || 0)
  if (!Number.isFinite(Number(cafe.lastOperatedAt)) || Number(cafe.lastOperatedAt) <= 0) {
    cafe.lastOperatedAt = Date.now()
  }
  cafe.taxLedger ||= {}
  cafe.sequence = Math.max(0, Math.floor(Number(cafe.sequence) || 0))
  if (cafe.lastShift && typeof cafe.lastShift === 'object') {
    if (!Array.isArray(cafe.lastShift.visitors)) cafe.lastShift.visitors = []
    if (!Array.isArray(cafe.lastShift.staffOnDuty)) cafe.lastShift.staffOnDuty = []
    if (!Array.isArray(cafe.lastShift.resigned)) cafe.lastShift.resigned = []
    if (!Array.isArray(cafe.lastShift.talkedStaffIds)) cafe.lastShift.talkedStaffIds = []
    if (!Array.isArray(cafe.lastShift.restocks)) cafe.lastShift.restocks = []
  }
  return cafe
}

export function createCafe(name, now = Date.now()) {
  const menu = Object.fromEntries(
    Object.entries(CAFE_MENU_CATALOG)
      .filter(([id]) => CAFE_STARTER_MENU.includes(id))
      .map(([id, item]) => [id, { enabled: true, price: item.basePrice }])
  )
  return {
    name: String(name || 'Avelia Cafe').trim().slice(0, 40),
    status: 'open',
    level: 1,
    exp: 0,
    reputation: 50,
    popularity: 0,
    capacity: CAFE_DEFAULT_CAPACITY,
    capacityBase: CAFE_DEFAULT_CAPACITY,
    theme: 'classic',
    menu,
    stock: {},
    staff: {},
    staffSequence: 0,
    staffRotationCursor: 0,
    autoRestock: false,
    autoPay: false,
    lastCctvAt: 0,
    currentVisitors: [],
    lastVisitAt: 0,
    upgrades: {},
    finance: {
      balance: '0',
      income: '0',
      expenses: '0',
      totalCustomers: 0,
      totalOrders: 0,
      satisfaction: 80,
      transactions: []
    },
    taxLedger: {},
    lastOperatedAt: now,
    sequence: 0,
    lastShift: null
  }
}

export function createCafeStaffMember(id, now = Date.now(), random = Math.random, cafe) {
  const names = CAFE_STAFF_NAMES[id]
  if (!names) return null
  const employedNames = new Set(Object.values(cafe?.staff || {}).map(employee => employee?.name).filter(Boolean))
  const availableNames = names.filter(name => !employedNames.has(name))
  const pool = availableNames.length ? availableNames : names
  const sequence = Math.max(0, Math.floor(Number(cafe?.staffSequence) || 0)) + 1
  if (cafe) cafe.staffSequence = sequence
  const baseName = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
  let name = baseName
  let suffix = 2
  while (employedNames.has(name)) name = `${baseName} ${suffix++}`
  return {
    id: `staff-${String(sequence).padStart(4, '0')}`,
    role: id,
    name,
    hiredAt: now,
    salaryMultiplier: 1,
    unpaidShifts: 0
  }
}

export function refreshCafeVisitors(cafe, now = Date.now(), random = Math.random) {
  if (!cafe || cafe.status !== 'open') {
    if (cafe) cafe.currentVisitors = []
    return []
  }
  const present = Array.isArray(cafe.currentVisitors)
    ? cafe.currentVisitors.filter(visitor =>
      CAFE_NPCS.some(npc => npc.id === visitor?.id) && Number(visitor.expiresAt) > now
    )
    : []
  if (present.length) {
    cafe.currentVisitors = present
    return present
  }

  const count = Math.min(
    CAFE_MAX_VISITORS,
    cafe.capacity,
    2 + Math.floor(Math.max(0, cafe.level - 1) / 5) + Math.floor(cafe.popularity / 100)
  )
  const available = [...CAFE_NPCS]
  const visitors = []
  while (visitors.length < count && available.length) {
    const index = Math.min(available.length - 1, Math.floor(random() * available.length))
    const [npc] = available.splice(index, 1)
    visitors.push({ id: npc.id, joinedAt: now, expiresAt: now + CAFE_VISITOR_STAY_MS })
  }
  cafe.currentVisitors = visitors
  return visitors
}

export function getCafeVisitors(cafe, now = Date.now()) {
  if (!cafe || cafe.status !== 'open' || !Array.isArray(cafe.currentVisitors)) return []
  cafe.currentVisitors = cafe.currentVisitors.filter(visitor =>
    CAFE_NPCS.some(npc => npc.id === visitor?.id) && Number(visitor.expiresAt) > now
  )
  return cafe.currentVisitors
}

export function addCafePopularity(cafe, points = 1) {
  if (!cafe) return 0
  const previous = Math.min(10000, Math.max(0, Math.floor(Number(cafe.popularity) || 0)))
  const increase = Math.max(0, Math.floor(Number(points) || 0))
  cafe.popularity = Math.min(10000, previous + increase)
  return cafe.popularity - previous
}

export function getCafeVisitCooldownRemaining(cafe, now = Date.now()) {
  return Math.max(0, Number(cafe?.lastVisitAt || 0) + CAFE_VISIT_COOLDOWN_MS - now)
}

export function registerCafeVisit(cafe, now = Date.now()) {
  if (!cafe || cafe.status !== 'open' || getCafeVisitCooldownRemaining(cafe, now) > 0) return false
  cafe.lastVisitAt = now
  addCafePopularity(cafe)
  return true
}

export function markCafeVisitorTalked(cafe, visitorId, now = Date.now()) {
  const visitor = getCafeVisitors(cafe, now).find(entry => entry.id === visitorId)
  if (!visitor || visitor.talked) return false
  visitor.talked = true
  addCafePopularity(cafe)
  return true
}

export function hasCafeStaffBeenTalkedTo(cafe, staffId) {
  return Boolean(cafe?.lastShift?.talkedStaffIds?.includes(staffId))
}

export function markCafeStaffTalkedTo(cafe, staffId) {
  const shift = cafe?.lastShift
  if (!shift?.staffOnDuty?.some(employee => employee.id === staffId) ||
      hasCafeStaffBeenTalkedTo(cafe, staffId)) return false
  if (!Array.isArray(shift.talkedStaffIds)) shift.talkedStaffIds = []
  shift.talkedStaffIds.push(staffId)
  addCafePopularity(cafe)
  return true
}

export function getCafeStaffDialogue(staffId, random = Math.random) {
  const dialogue = CAFE_STAFF_DIALOGUE[staffId]
  if (!dialogue?.length) return null
  const index = Math.min(dialogue.length - 1, Math.floor(random() * dialogue.length))
  return dialogue[index]
}

export function getCafeCctvStory(cafe, random = Math.random) {
  const index = Math.min(CAFE_CCTV_STORIES.length - 1, Math.floor(random() * CAFE_CCTV_STORIES.length))
  const staff = Object.values(cafe?.staff || {})
    .map(employee => `${employee?.name || 'Staff'} (${CAFE_STAFF[getCafeStaffRole(employee)]?.name || 'Staff'})`)
  return {
    ...CAFE_CCTV_STORIES[index],
    staff: staff.length ? staff.join(', ') : 'Belum ada staff',
    status: cafe?.status === 'open' ? 'Buka' : 'Tutup'
  }
}

export function getCafeCctvCooldownRemaining(cafe, now = Date.now()) {
  return Math.max(0, Number(cafe?.lastCctvAt || 0) + CAFE_CCTV_COOLDOWN_MS - now)
}

export function registerCafeCctvView(cafe, now = Date.now()) {
  if (!cafe || getCafeCctvCooldownRemaining(cafe, now) > 0) return false
  cafe.lastCctvAt = now
  return true
}

function ensureTaxLedger(cafe, period) {
  cafe.taxLedger[period] ||= { income: '0', expenses: '0', reportedProfit: '0' }
  return cafe.taxLedger[period]
}

function updateBusinessTax(cafe, data, jid, period) {
  const ledger = ensureTaxLedger(cafe, period)
  const profit = BigInt(ledger.income) - BigInt(ledger.expenses)
  const taxableProfit = profit > 0n ? profit : 0n
  const previous = BigInt(ledger.reportedProfit || '0')
  const change = taxableProfit - previous
  if (change !== 0n) {
    const state = ensureTaxState(data)
    if (state.config.enabled) {
      recordTaxActivity(data, jid, 'business', change.toString(), period)
    }
  }
  ledger.reportedProfit = taxableProfit.toString()
}

export function addCafeExpense(cafe, data, jid, amount, period = getTaxPeriod(), description = 'Biaya bisnis') {
  const value = BigInt(normalizeRpgMoney(amount, 0))
  if (value <= 0n || compareRpgMoney(cafe.finance.balance, value) < 0) return false
  cafe.finance.balance = subtractRpgMoney(cafe.finance.balance, value)
  cafe.finance.expenses = addRpgMoney(cafe.finance.expenses, value)
  const ledger = ensureTaxLedger(cafe, period)
  ledger.expenses = addRpgMoney(ledger.expenses, value)
  updateBusinessTax(cafe, data, jid, period)
  cafe.sequence++
  cafe.finance.transactions.unshift({
    id: `CAFE-${String(cafe.sequence).padStart(8, '0')}`,
    type: 'expense',
    amount: value.toString(),
    description,
    at: Date.now()
  })
  cafe.finance.transactions.length = Math.min(cafe.finance.transactions.length, 100)
  return true
}

function recordCafeIncome(cafe, data, jid, amount, period = getTaxPeriod()) {
  const value = BigInt(normalizeRpgMoney(amount, 0))
  if (value <= 0n) return
  cafe.finance.balance = addRpgMoney(cafe.finance.balance, value)
  cafe.finance.income = addRpgMoney(cafe.finance.income, value)
  const ledger = ensureTaxLedger(cafe, period)
  ledger.income = addRpgMoney(ledger.income, value)
  updateBusinessTax(cafe, data, jid, period)
}

function canMake(menu, stock) {
  return Object.entries(menu.ingredients).every(([ingredient, quantity]) =>
    Number(stock[ingredient]) >= Number(quantity)
  )
}

function getCafeShiftBoundary(timestamp) {
  const jakartaTimestamp = timestamp + 7 * 60 * 60 * 1000
  const date = new Date(jakartaTimestamp)
  const hour = date.getUTCHours()
  const boundaryHour = hour < 7 ? 7 : hour < 19 ? 19 : 7
  const dayOffset = hour < 7 || hour < 19 ? 0 : 1
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + dayOffset, boundaryHour) -
    7 * 60 * 60 * 1000
}

function chooseShiftStaff(cafe) {
  const staff = Object.entries(cafe.staff)
    .filter(([, employee]) => getCafeStaffRole(employee))
    .sort(([, left], [, right]) => Number(left.hiredAt) - Number(right.hiredAt) || left.id.localeCompare(right.id))
  if (!staff.length) return []
  const capacity = Math.min(getCafeStaffCapacity(cafe), staff.length)
  const start = cafe.staffRotationCursor % staff.length
  const selected = Array.from({ length: capacity }, (_, index) => staff[(start + index) % staff.length])
  cafe.staffRotationCursor = (start + capacity) % staff.length
  return selected
}

function autoRestockCafe(cafe, data, jid, period) {
  const menuCount = Math.max(1, Object.values(cafe.menu).filter(choice => choice.enabled).length)
  const coverage = Math.max(2, Math.ceil(cafe.capacity / menuCount))
  const targetStock = {}
  for (const [id, choice] of Object.entries(cafe.menu)) {
    if (!choice.enabled || !CAFE_MENU_CATALOG[id]) continue
    for (const [ingredient, amount] of Object.entries(CAFE_MENU_CATALOG[id].ingredients)) {
      targetStock[ingredient] = (targetStock[ingredient] || 0) + Number(amount) * coverage
    }
  }
  const restocks = Object.entries(targetStock)
    .map(([id, target]) => {
      const item = CAFE_INGREDIENT_CATALOG[id]
      const quantity = Math.max(0, target - (Number(cafe.stock[id]) || 0))
      return item && quantity ? { id, item, quantity, cost: item.unitPrice * quantity } : null
    })
    .filter(Boolean)
  const total = restocks.reduce((sum, item) => sum + item.cost, 0)
  if (!total) return { purchased: [], error: null }
  if (compareRpgMoney(cafe.finance.balance, total) < 0) {
    return { purchased: [], error: `Dana auto-restock kurang; perlu ${total} koin.` }
  }
  for (const restock of restocks) {
    if (!addCafeExpense(cafe, data, jid, restock.cost, period, `Auto-restock ${restock.item.name} x${restock.quantity}`)) {
      throw new Error(`Cafe auto-restock balance changed during purchase of ${restock.item.name}`)
    }
    recordTaxActivity(data, jid, 'purchase', restock.cost, period)
    cafe.stock[restock.id] = (Number(cafe.stock[restock.id]) || 0) + restock.quantity
  }
  return { purchased: restocks.map(({ item, quantity }) => `${item.name} x${quantity}`), error: null }
}

function chooseRandom(items, random) {
  return items.length ? items[Math.floor(random() * items.length)] : null
}

function serveCustomer(cafe, data, jid, customer, period, random, now, theme) {
  cafe.finance.totalCustomers++
  const preference = customer.preference
  const availableMenus = Object.entries(cafe.menu)
    .filter(([id, choice]) => choice.enabled && CAFE_MENU_CATALOG[id])
    .map(([id, choice]) => ({ item: CAFE_MENU_CATALOG[id], choice }))
  const preferred = availableMenus.filter(({ item }) =>
    preference === 'bebas' || item.category === preference
  )
  const matchingStock = preferred.filter(({ item }) => canMake(item, cafe.stock))
  const anyStock = availableMenus.filter(({ item }) => canMake(item, cafe.stock))
  const selection = chooseRandom(matchingStock.length ? matchingStock : anyStock, random)
  if (!selection) {
    cafe.reputation = Math.max(0, cafe.reputation - 1)
    return {
      served: false,
      dialogue: availableMenus.length ? CAFE_DIALOGUE.soldOut : CAFE_DIALOGUE.noMenu
    }
  }

  for (const [ingredient, quantity] of Object.entries(selection.item.ingredients)) {
    cafe.stock[ingredient] = Number(cafe.stock[ingredient]) - Number(quantity)
  }
  const basePrice = BigInt(normalizeRpgMoney(selection.choice.price, selection.item.basePrice))
  const price = basePrice * BigInt(theme.revenueBps) / 10000n
  recordCafeIncome(cafe, data, jid, price, period)
  cafe.finance.totalOrders++
  cafe.exp = (Number(cafe.exp) || 0) + 10
  if (cafe.exp >= cafe.level * 100) {
    cafe.exp -= cafe.level * 100
    cafe.level++
  }
  cafe.reputation = Math.min(100, cafe.reputation + 1)
  cafe.finance.satisfaction = Math.min(100, Math.round((cafe.finance.satisfaction * 9 + 90) / 10))
  cafe.sequence++
  const transaction = {
    id: `CAFE-${String(cafe.sequence).padStart(8, '0')}`,
    type: 'sale',
    amount: price.toString(),
    item: selection.item.id,
    customer: customer.id,
    at: now
  }
  cafe.finance.transactions.unshift(transaction)
  cafe.finance.transactions.length = Math.min(cafe.finance.transactions.length, 100)
  return {
    served: true,
    menu: selection.item,
    dialogue: customer.order.replace('{menu}', selection.item.name),
    response: customer.thanks,
    amount: price.toString()
  }
}

function runCafeShift(cafe, data, jid, random, now) {
  const period = getTaxPeriod(new Date(now))
  const ledger = ensureTaxLedger(cafe, period)
  const theme = CAFE_THEMES[cafe.theme] || CAFE_THEMES.classic
  cafe.capacity = getCafeUpgradeCapacity(cafe)
  const visitors = []
  const staffOnDuty = []
  const resigned = []
  const restocks = []
  let served = 0
  let revenue = 0n
  const operatingCost = Math.ceil(CAFE_OPERATING_COST_PER_SHIFT * theme.operatingCostBps / 10000)
  if (compareRpgMoney(cafe.finance.balance, operatingCost) < 0) {
    cafe.status = 'closed'
    cafe.lastShift = {
      at: now,
      customers: 0,
      served: 0,
      revenue: '0',
      visitors: [],
      staffOnDuty: [],
      talkedStaffIds: [],
      resigned: [],
      restocks: [],
      closureReason: 'Saldo operasional tidak cukup'
    }
    return false
  }

  const staff = chooseShiftStaff(cafe)
  addCafeExpense(cafe, data, jid, operatingCost, period, 'Biaya operasional shift')
  let shiftCost = BigInt(operatingCost)
  let staffPerformance = 0
  const ownerAccount = data.users?.[jid]
  for (const [id, employee] of staff) {
    const role = getCafeStaffRole(employee)
    const multiplier = Math.min(100, Math.max(1, Math.floor(Number(employee.salaryMultiplier) || 1)))
    const salary = BigInt(CAFE_STAFF[role].salary) * BigInt(multiplier)
    let salaryPaid = compareRpgMoney(cafe.finance.balance, salary) >= 0
    if (!salaryPaid && cafe.autoPay && isCafePremium(ownerAccount) &&
        compareRpgMoney(ownerAccount?.money || 0, salary) >= 0) {
      ownerAccount.money = subtractRpgMoney(ownerAccount.money || 0, salary)
      cafe.finance.balance = addRpgMoney(cafe.finance.balance, salary)
      salaryPaid = true
    }
    if (salaryPaid) {
      if (!addCafeExpense(cafe, data, jid, salary, period, `Gaji ${employee.name || CAFE_STAFF[role].name} (${multiplier}x)`)) {
        throw new Error(`Cafe salary payment failed for ${employee.name || id}`)
      }
      employee.unpaidShifts = 0
      shiftCost += salary
    } else {
      employee.unpaidShifts = (Number(employee.unpaidShifts) || 0) + 1
      if (employee.unpaidShifts >= 2) {
        resigned.push(employee.name || CAFE_STAFF[role].name)
        delete cafe.staff[id]
        continue
      }
    }
    staffOnDuty.push({ id, role, name: employee.name || CAFE_STAFF[role].name })
    staffPerformance += multiplier * (1 + CAFE_STAFF[role].serviceBonus / 4)
  }
  if (cafe.autoRestock && isCafePremium(ownerAccount)) {
    const result = autoRestockCafe(cafe, data, jid, period)
    restocks.push(...result.purchased)
    if (result.error) restocks.push(result.error)
  }
  const serviceCapacity = Math.min(CAFE_MAX_CUSTOMERS_PER_SHIFT, cafe.capacity)
  const demand = 4 + Math.floor(random() * 3) +
    Math.floor(Math.max(0, cafe.level - 1) / 2) +
    Math.min(10, Math.floor(cafe.popularity / 20)) +
    theme.demandBonus
  const customers = Math.min(serviceCapacity, demand)
  for (let index = 0; index < customers; index++) {
    const customer = chooseRandom(CAFE_NPCS, random)
    const order = serveCustomer(cafe, data, jid, customer, period, random, now, theme)
    if (order.served) {
      served++
      revenue += BigInt(order.amount)
      visitors.push({
        name: customer.name,
        message: `${order.dialogue} ${order.response}`,
        dialogue: [
          { speaker: customer.name, role: 'Pelanggan', text: order.dialogue },
          { speaker: customer.name, role: 'Pelanggan', text: order.response }
        ]
      })
    } else {
      visitors.push({
        name: customer.name,
        message: `${customer.greeting} ${order.dialogue}`,
        dialogue: [
          { speaker: customer.name, role: 'Pelanggan', text: customer.greeting },
          { speaker: customer.name, role: 'Pelanggan', text: order.dialogue }
        ]
      })
    }
  }
  if (served) {
    cafe.popularity = Math.min(10000, cafe.popularity + Math.max(1, Math.floor(served * (1 + staffPerformance / 10))))
  } else {
    cafe.popularity = Math.max(0, cafe.popularity - 1)
  }
  cafe.finance.income = normalizeRpgMoney(cafe.finance.income)
  cafe.lastShift = {
    at: now,
    customers,
    served,
    revenue: revenue.toString(),
    visitors,
    staffOnDuty,
    talkedStaffIds: [],
    resigned,
    restocks
  }
  cafe.finance.lastOperatingCost = shiftCost.toString()
  cafe.taxLedger[period] = {
    ...ledger,
    income: ledger.income,
    expenses: ledger.expenses
  }
  return true
}

export function advanceCafeOperations(cafe, data, jid, now = Date.now(), random = Math.random) {
  if (!cafe || cafe.status !== 'open') return 0
  ensureCafe({ cafe })
  let completed = 0
  for (let index = 0; index < 24; index++) {
    const shiftAt = getCafeShiftBoundary(Number(cafe.lastOperatedAt || now))
    if (shiftAt > now) break
    if (!runCafeShift(cafe, data, jid, random, shiftAt)) {
      cafe.lastOperatedAt = now
      break
    }
    cafe.lastOperatedAt = shiftAt
    completed++
  }
  return completed
}

export function transferCafeBalance(cafe, account, amount, direction) {
  const value = normalizeRpgMoney(amount, 0)
  if (compareRpgMoney(value, 0) <= 0) return false
  if (direction === 'deposit') {
    if (compareRpgMoney(account.money || 0, value) < 0) return false
    account.money = subtractRpgMoney(account.money || 0, value)
    cafe.finance.balance = addRpgMoney(cafe.finance.balance, value)
    return true
  }
  if (direction === 'withdraw') {
    if (compareRpgMoney(cafe.finance.balance, value) < 0) return false
    cafe.finance.balance = subtractRpgMoney(cafe.finance.balance, value)
    account.money = addRpgMoney(account.money || 0, value)
    return true
  }
  return false
}
