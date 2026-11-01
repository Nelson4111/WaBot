import { addRpgMoney, compareRpgMoney, normalizeRpgMoney, subtractRpgMoney } from './rpgMoney.js'
import { ensureTaxState, getTaxPeriod, recordTaxActivity } from './rpgTax.js'
import {
  CAFE_DIALOGUE,
  CAFE_DEFAULT_CAPACITY,
  CAFE_MENU_CATALOG,
  CAFE_NPCS,
  CAFE_OPERATING_COST_PER_SHIFT,
  CAFE_STARTER_MENU,
  CAFE_STAFF,
  CAFE_SHIFT_MS
} from './rpgCafeData.js'

const MONEY_KEYS = ['balance', 'income', 'expenses']

export function ensureCafe(rpg) {
  if (!rpg.cafe || typeof rpg.cafe !== 'object') return null
  const cafe = rpg.cafe
  cafe.name ||= 'Avelia Cafe'
  cafe.status = cafe.status === 'closed' ? 'closed' : 'open'
  cafe.level = Math.max(1, Math.floor(Number(cafe.level) || 1))
  cafe.reputation = Math.min(100, Math.max(0, Math.floor(Number(cafe.reputation) || 50)))
  cafe.capacity = Math.max(CAFE_DEFAULT_CAPACITY, Math.floor(Number(cafe.capacity) || CAFE_DEFAULT_CAPACITY))
  cafe.menu ||= {}
  cafe.stock ||= {}
  cafe.staff ||= {}
  cafe.finance ||= {}
  for (const key of MONEY_KEYS) cafe.finance[key] = normalizeRpgMoney(cafe.finance[key] ?? '0')
  cafe.finance.transactions ||= []
  cafe.finance.totalCustomers = Math.max(0, Number(cafe.finance.totalCustomers) || 0)
  cafe.finance.totalOrders = Math.max(0, Number(cafe.finance.totalOrders) || 0)
  cafe.finance.satisfaction = Math.min(100, Math.max(0, Number(cafe.finance.satisfaction) || 80))
  cafe.taxLedger ||= {}
  cafe.lastOperatedAt ||= Date.now()
  cafe.sequence = Math.max(0, Math.floor(Number(cafe.sequence) || 0))
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
    capacity: CAFE_DEFAULT_CAPACITY,
    theme: 'classic',
    menu,
    stock: {},
    staff: {},
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

function chooseRandom(items, random) {
  return items.length ? items[Math.floor(random() * items.length)] : null
}

function serveCustomer(cafe, data, jid, customer, period, random, now) {
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
  const price = BigInt(normalizeRpgMoney(selection.choice.price, selection.item.basePrice))
  recordCafeIncome(cafe, data, jid, price, period)
  cafe.finance.totalOrders++
  cafe.exp = (Number(cafe.exp) || 0) + 10
  if (cafe.exp >= cafe.level * 100) {
    cafe.exp -= cafe.level * 100
    cafe.level++
    cafe.capacity += 2
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
  const staff = Object.keys(cafe.staff).filter(id => CAFE_STAFF[id])
  const serviceCapacity = cafe.capacity + staff.reduce((total, id) => total + CAFE_STAFF[id].capacityBonus, 0)
  const customers = Math.min(serviceCapacity, 2 + Math.floor(random() * Math.max(1, cafe.level + 2)))
  const payroll = staff.reduce((total, id) => total + CAFE_STAFF[id].salary, 0)
  const shiftCost = CAFE_OPERATING_COST_PER_SHIFT + payroll
  const visitors = []
  let served = 0
  let revenue = 0n
  if (compareRpgMoney(cafe.finance.balance, shiftCost) < 0) {
    cafe.status = 'closed'
    cafe.lastShift = { at: now, customers: 0, served: 0, revenue: '0', visitors: [] }
    return false
  }

  addCafeExpense(cafe, data, jid, shiftCost, period)
  for (let index = 0; index < customers; index++) {
    const customer = chooseRandom(CAFE_NPCS, random)
    const order = serveCustomer(cafe, data, jid, customer, period, random, now)
    if (order.served) {
      served++
      revenue += BigInt(order.amount)
      visitors.push({ name: customer.name, message: `${order.dialogue} ${order.response}` })
    } else {
      visitors.push({ name: customer.name, message: `${customer.greeting} ${order.dialogue}` })
    }
  }
  cafe.finance.income = normalizeRpgMoney(cafe.finance.income)
  cafe.lastShift = { at: now, customers, served, revenue: revenue.toString(), visitors }
  cafe.finance.lastOperatingCost = String(shiftCost)
  cafe.taxLedger[period] = {
    ...ledger,
    income: ledger.income,
    expenses: ledger.expenses
  }
  return true
}

export function advanceCafeOperations(cafe, data, jid, now = Date.now(), random = Math.random) {
  if (!cafe || cafe.status !== 'open') return 0
  const elapsedShifts = Math.floor((now - Number(cafe.lastOperatedAt || now)) / CAFE_SHIFT_MS)
  const shifts = Math.min(24, Math.max(0, elapsedShifts))
  if (!shifts) return 0

  let completed = 0
  for (let index = 0; index < shifts; index++) {
    const shiftAt = Number(cafe.lastOperatedAt) + CAFE_SHIFT_MS
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
