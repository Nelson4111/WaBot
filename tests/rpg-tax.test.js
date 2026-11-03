import test from 'node:test'
import assert from 'node:assert/strict'
import taxHandler from '../plugins/rpg/rpg-tax.js'
import {
  addCafePopularity,
  addCafeExpense,
  advanceCafeOperations,
  createCafe,
  createCafeStaffMember,
  ensureCafe,
  getCafeVisitCooldownRemaining,
  getCafeCctvCooldownRemaining,
  getCafeThemePrice,
  getCafeCctvStory,
  getCafeMenuLimit,
  getCafeStaffCapacity,
  getCafeStaffRole,
  getCafeStaffDialogue,
  getCafeVisitors,
  hasCafeStaffBeenTalkedTo,
  markCafeStaffTalkedTo,
  markCafeVisitorTalked,
  registerCafeVisit,
  registerCafeCctvView,
  refreshCafeVisitors
} from '../lib/rpgCafe.js'
import {
  CAFE_CCTV_STORIES,
  CAFE_CCTV_COOLDOWN_MS,
  CAFE_SHIFT_MS,
  CAFE_VISIT_COOLDOWN_MS,
  CAFE_VISITOR_STAY_MS,
  CAFE_NPCS,
  CAFE_MENU_CATALOG,
  CAFE_THEME_PAGE_SIZE,
  CAFE_THEMES
} from '../lib/rpgCafeData.js'
import {
  calculateProgressiveTax,
  calculatePlayerTaxSnapshot,
  calculateTaxItems,
  getBillAmounts,
  getTaxableWealth,
  getTaxPeriod,
  ensureTaxState,
  recordTaxActivity
} from '../lib/rpgTax.js'

const ownerJid = '628111111111@s.whatsapp.net'
const playerJid = '628222222222@s.whatsapp.net'

function makeDb() {
  return {
    data: {
      users: {
        [ownerJid]: { money: 0, rpg: { bank: 0 } },
        [playerJid]: { money: 1_000_000_000, rpg: { bank: 1_000_000_000 } }
      }
    },
    write: async () => {}
  }
}

function makeMessage(sender) {
  const replies = []
  return {
    replies,
    m: {
      sender,
      chat: '120363000000000000@g.us',
      reply(message) {
        replies.push(message)
        return message
      }
    }
  }
}

async function runCommand(sender, text, isOwner = false) {
  const { m, replies } = makeMessage(sender)
  await taxHandler(m, {
    command: 'tax',
    text,
    usedPrefix: '.',
    isOwner
  })
  return replies.at(-1)
}

test('tax calculations use progressive brackets and large integer-safe values', () => {
  assert.deepEqual(calculateProgressiveTax('2000000000').amount, '7500000')
  assert.equal(getTaxableWealth({
    money: '9007199254740993',
    rpg: { bank: '7' }
  }).toString(), '9007199254741000')
})

test('weekly tax period follows the ISO calendar', () => {
  assert.equal(getTaxPeriod(new Date('2026-11-02T00:00:00.000Z')), '2026-W45')
  assert.equal(getTaxPeriod(new Date('2026-01-01T00:00:00.000Z')), '2026-W01')
})

test('purchase activity is accumulated and assessed using the configured rate', () => {
  const data = makeDb().data
  const period = getTaxPeriod()
  const state = ensureTaxState(data)
  state.config.rates.purchase = 250
  recordTaxActivity(data, playerJid, 'purchase', '1000000', period)
  recordTaxActivity(data, playerJid.replace('@', ':12@'), 'purchase', '500000', period)

  const snapshot = calculatePlayerTaxSnapshot(data.users[playerJid], data, period, state)
  const { items } = calculateTaxItems(snapshot, state.config)
  assert.equal(snapshot.purchase, '1500000')
  assert.equal(items.purchase, '37500')

  state.config.enabled = false
  assert.equal(recordTaxActivity(data, playerJid, 'purchase', '100000', period), false)
  const disabledSnapshot = calculatePlayerTaxSnapshot(data.users[playerJid], data, period, state)
  assert.equal(disabledSnapshot.purchase, '1500000')
})

test('vehicle ownership and default tax rates are included in each player snapshot', () => {
  const data = makeDb().data
  const account = data.users[playerJid]
  account.rpg.home = { garage: { supercar: 2 } }
  const state = ensureTaxState(data)
  const snapshot = calculatePlayerTaxSnapshot(account, data, getTaxPeriod(), state)
  const { items } = calculateTaxItems(snapshot, state.config)

  assert.equal(snapshot.vehicle, '130000000')
  assert.equal(items.vehicle, '65000')
  assert.equal(state.config.rates.business, 500)
  assert.equal(state.config.familyPerDependent, '100000')
})

test('cafe shifts record customer sales and taxable net profit without double counting expenses', () => {
  const data = makeDb().data
  const now = Date.UTC(2026, 10, 2, 12)
  const cafe = createCafe('Test Cafe', now - 60 * 60 * 1000)
  cafe.finance.balance = '100000'
  cafe.stock.kopi = 1

  assert.equal(advanceCafeOperations(cafe, data, playerJid, now, () => 0), 1)
  const period = getTaxPeriod(new Date(now))
  assert.equal(cafe.lastShift.customers, 4)
  assert.equal(cafe.lastShift.served, 1)
  assert.equal(cafe.lastShift.visitors.every(visitor =>
    visitor.dialogue.length === 2 &&
    visitor.dialogue.every(turn => turn.speaker === visitor.name && turn.role === 'Pelanggan')
  ), true)
  assert.equal(cafe.finance.income, '18000')
  assert.equal(cafe.finance.expenses, '5000')
  assert.equal(data.users[playerJid].rpg.taxActivity[period].business, '13000')

  assert.equal(addCafeExpense(cafe, data, playerJid, 10000, period, 'Restock'), true)
  assert.equal(data.users[playerJid].rpg.taxActivity[period].business, '3000')
  assert.equal(calculatePlayerTaxSnapshot(data.users[playerJid], data, period).business, '3000')
})

test('cafe staff names are randomized and CCTV stories remain available without visitor transcripts', () => {
  const cafe = createCafe('Story Cafe')
  cafe.staff.cashier = createCafeStaffMember('cashier', 100, () => 0.25, cafe)

  assert.equal(cafe.staff.cashier.name, 'Niko')
  assert.equal(CAFE_CCTV_STORIES.length, 5)
  const stories = CAFE_CCTV_STORIES.map((_, index) =>
    getCafeCctvStory(cafe, () => index / CAFE_CCTV_STORIES.length)
  )
  assert.equal(new Set(stories.map(story => story.title)).size, 5)
  assert.match(stories[0].staff, /Niko/)
  assert.equal(stories[0].visitors, undefined)
})

test('cafe visit creates a timed NPC roster and staff dialogue comes from the library catalog', () => {
  const cafe = createCafe('Visit Cafe')
  const now = Date.UTC(2026, 10, 2, 12)
  const visitors = refreshCafeVisitors(cafe, now, () => 0)

  assert.equal(visitors.length, 2)
  assert.deepEqual(visitors.map(visitor => visitor.id), ['mika', 'raka'])
  assert.equal(registerCafeVisit(cafe, now), true)
  assert.equal(cafe.popularity, 1)
  assert.equal(getCafeVisitCooldownRemaining(cafe, now + 1), CAFE_VISIT_COOLDOWN_MS - 1)
  assert.equal(registerCafeVisit(cafe, now + 1), false)
  assert.equal(markCafeVisitorTalked(cafe, 'mika', now + 1), true)
  assert.equal(markCafeVisitorTalked(cafe, 'mika', now + 1), false)
  assert.equal(cafe.popularity, 2)
  assert.equal(refreshCafeVisitors(cafe, now + 1000, () => 0.9).length, 2)
  assert.deepEqual(getCafeVisitors(cafe, now + CAFE_VISITOR_STAY_MS), [])
  assert.equal(CAFE_NPCS.length >= 10, true)
  assert.equal(typeof getCafeStaffDialogue('barista', () => 0), 'string')

  cafe.status = 'closed'
  assert.deepEqual(refreshCafeVisitors(cafe, now + 2000, () => 0), [])
  assert.deepEqual(cafe.currentVisitors, [])
})

test('cafe staff can be talked to once per shift and popularity remains capped', () => {
  const cafe = createCafe('Staff Talk Cafe')
  cafe.lastShift = {
    at: 1,
    staffOnDuty: [{ id: 'barista', name: 'Dara' }],
    talkedStaffIds: []
  }

  assert.equal(markCafeStaffTalkedTo(cafe, 'barista'), true)
  assert.equal(hasCafeStaffBeenTalkedTo(cafe, 'barista'), true)
  assert.equal(markCafeStaffTalkedTo(cafe, 'barista'), false)
  assert.equal(cafe.popularity, 1)
  cafe.popularity = 10000
  assert.equal(addCafePopularity(cafe), 0)
  assert.equal(cafe.popularity, 10000)
})

test('cafe level and popularity raise demand without exceeding upgraded capacity', () => {
  const data = makeDb().data
  const now = Date.UTC(2026, 10, 2, 12)
  const starterCafe = createCafe('Starter Cafe', now - CAFE_SHIFT_MS)
  starterCafe.finance.balance = '100000'
  assert.equal(advanceCafeOperations(starterCafe, data, playerJid, now, () => 0), 1)
  assert.equal(starterCafe.lastShift.customers, 4)

  const famousCafe = createCafe('Famous Cafe', now - CAFE_SHIFT_MS)
  famousCafe.finance.balance = '100000'
  famousCafe.level = 100
  famousCafe.popularity = 10000
  assert.equal(advanceCafeOperations(famousCafe, data, playerJid, now, () => 0), 1)
  assert.equal(famousCafe.lastShift.customers, 6)

  const cafe = createCafe('Busy Cafe', now - CAFE_SHIFT_MS)
  cafe.finance.balance = '100000'
  cafe.level = 100
  cafe.popularity = 10000
  cafe.upgrades.capacity = 11

  assert.equal(advanceCafeOperations(cafe, data, playerJid, now, () => 0), 1)
  assert.equal(cafe.lastShift.customers, 50)
  assert.equal(cafe.capacity, 50)
})

test('legacy cafe capacity is preserved and level adds capacity growth', () => {
  const legacyCafe = createCafe('Legacy Cafe')
  legacyCafe.capacity = 16
  legacyCafe.level = 6
  legacyCafe.upgrades.capacity = 1
  delete legacyCafe.capacityBase

  ensureCafe({ cafe: legacyCafe })
  assert.equal(legacyCafe.capacity, 18)
  assert.equal(legacyCafe.capacityBase, 12)
})

test('cafe level expands menu and staffing limits while same-role hires are supported', () => {
  const cafe = createCafe('Growing Cafe')
  const cashierOne = createCafeStaffMember('cashier', 100, () => 0, cafe)
  const cashierTwo = createCafeStaffMember('cashier', 101, () => 0, cafe)
  cafe.staff[cashierOne.id] = cashierOne
  cafe.staff[cashierTwo.id] = cashierTwo

  assert.notEqual(cashierOne.id, cashierTwo.id)
  assert.notEqual(cashierOne.name, cashierTwo.name)
  assert.equal(getCafeStaffRole(cashierOne), 'cashier')
  assert.equal(getCafeStaffCapacity(cafe), 1)
  assert.equal(getCafeMenuLimit(cafe), 8)

  const firstShift = Date.UTC(2026, 10, 2, 12)
  cafe.lastOperatedAt = firstShift - 1
  cafe.finance.balance = '1000000'
  assert.equal(advanceCafeOperations(cafe, makeDb().data, playerJid, firstShift, () => 0), 1)
  const firstWorker = cafe.lastShift.staffOnDuty[0].id
  assert.equal(advanceCafeOperations(cafe, makeDb().data, playerJid, firstShift + CAFE_SHIFT_MS, () => 0), 1)
  assert.notEqual(cafe.lastShift.staffOnDuty[0].id, firstWorker)

  cafe.level = 3
  assert.equal(getCafeStaffCapacity(cafe), 3)
  assert.equal(getCafeMenuLimit(cafe), 12)

  const legacyCafe = createCafe('Legacy Staff Cafe')
  legacyCafe.staff.cashier = { name: 'Alya', hiredAt: 1 }
  legacyCafe.lastShift = { staffOnDuty: [{ id: 'cashier', name: 'Alya' }], talkedStaffIds: ['cashier'] }
  ensureCafe({ cafe: legacyCafe })
  const [migratedId] = Object.keys(legacyCafe.staff)
  assert.equal(legacyCafe.staff[migratedId].role, 'cashier')
  assert.equal(legacyCafe.lastShift.staffOnDuty[0].id, migratedId)
  assert.deepEqual(legacyCafe.lastShift.talkedStaffIds, [migratedId])
})

test('cafe operates on Jakarta 07:00 and 19:00 boundaries', () => {
  const data = makeDb().data
  const morningStart = Date.UTC(2026, 10, 2, 0)
  const cafe = createCafe('Round-the-clock Cafe', morningStart - 1)
  cafe.finance.balance = '100000'

  assert.equal(CAFE_SHIFT_MS, 12 * 60 * 60 * 1000)
  assert.equal(advanceCafeOperations(cafe, data, playerJid, morningStart, () => 0), 1)
  assert.equal(cafe.lastShift.at, morningStart)
  const eveningStart = morningStart + CAFE_SHIFT_MS
  assert.equal(advanceCafeOperations(cafe, data, playerJid, eveningStart, () => 0), 1)
  assert.equal(cafe.lastShift.at, eveningStart)
})

test('Premium cafe auto-restock and auto-pay use the correct balances', () => {
  const data = makeDb().data
  const owner = data.users[playerJid]
  owner.premium = true
  const now = Date.UTC(2026, 10, 2, 12)
  const restockCafe = createCafe('Auto Stock Cafe', now - 1)
  restockCafe.finance.balance = '1000000'
  restockCafe.autoRestock = true
  assert.equal(advanceCafeOperations(restockCafe, data, playerJid, now, () => 0), 1)
  assert.equal(restockCafe.lastShift.restocks.length > 0, true)
  assert.equal(BigInt(restockCafe.finance.expenses) > 5000n, true)

  const payrollCafe = createCafe('Auto Pay Cafe', now - 1)
  payrollCafe.finance.balance = '5000'
  payrollCafe.autoPay = true
  const employee = createCafeStaffMember('cashier', now - 1, () => 0, payrollCafe)
  payrollCafe.staff[employee.id] = employee
  const previousMoney = BigInt(owner.money)
  assert.equal(advanceCafeOperations(payrollCafe, data, playerJid, now, () => 0), 1)
  assert.equal(BigInt(owner.money), previousMoney - 75000n)
  assert.equal(payrollCafe.lastShift.staffOnDuty[0].name, employee.name)
  assert.equal(payrollCafe.finance.expenses, '80000')
})

test('99 paid cafe themes rise by five times and scale with cafe level and assets', () => {
  const emptyCafe = createCafe('Empty Cafe')
  emptyCafe.menu = {}

  assert.equal(CAFE_THEMES.garden.price, 2500000n)
  assert.equal(CAFE_THEMES.modern.price, 12500000n)
  assert.equal(CAFE_THEMES.rustic.price, 62500000n)
  assert.equal(CAFE_THEMES.grandPalace.price, 500000n * 5n ** 99n)
  assert.equal(Object.keys(CAFE_THEMES).length, 100)
  assert.equal(CAFE_THEME_PAGE_SIZE, 7)
  assert.deepEqual(getCafeThemePrice(emptyCafe, 'modern'), {
    base: '12500000',
    level: '0',
    menu: '0',
    staff: '0',
    upgrades: '0',
    total: '12500000'
  })

  const developedCafe = createCafe('Developed Cafe')
  developedCafe.level = 5
  developedCafe.menu = { coffee: { enabled: true }, tea: { enabled: true } }
  developedCafe.staff = { 'staff-0001': {}, 'staff-0002': {} }
  developedCafe.upgrades = { capacity: 2, kitchen: 1 }
  assert.deepEqual(getCafeThemePrice(developedCafe, 'modern'), {
    base: '12500000',
    level: '5000000',
    menu: '500000',
    staff: '1250000',
    upgrades: '3750000',
    total: '23000000'
  })
})

test('CCTV is rate-limited and cafe themes include benefits and drawbacks', () => {
  const cafe = createCafe('CCTV Cafe')
  const now = Date.UTC(2026, 10, 2, 12)

  assert.equal(registerCafeCctvView(cafe, now), true)
  assert.equal(getCafeCctvCooldownRemaining(cafe, now + 1), CAFE_CCTV_COOLDOWN_MS - 1)
  assert.equal(registerCafeCctvView(cafe, now + 1), false)
  assert.equal(Object.keys(CAFE_THEMES).length, 100)
  assert.equal(Object.values(CAFE_THEMES).every(theme => theme.benefit && theme.drawback), true)
  assert.equal(Object.keys(CAFE_MENU_CATALOG).length > 0, true)
})

test('staff multipliers increase payroll and repeated unpaid shifts trigger resignation', () => {
  const data = makeDb().data
  const now = Date.UTC(2026, 10, 2, 12)
  const paidCafe = createCafe('Well Paid Cafe', now - CAFE_SHIFT_MS)
  paidCafe.finance.balance = '200000'
  paidCafe.stock.kopi = 4
  paidCafe.level = 5
  paidCafe.staff.cashier = {
    name: 'Alya',
    hiredAt: now - 1000,
    salaryMultiplier: 2,
    unpaidShifts: 0
  }

  assert.equal(advanceCafeOperations(paidCafe, data, playerJid, now, () => 0), 1)
  assert.equal(paidCafe.finance.expenses, '155000')
  assert.equal(paidCafe.lastShift.staffOnDuty[0].name, 'Alya')
  assert.equal(paidCafe.lastShift.served, 4)
  assert.equal(paidCafe.popularity, 5)

  const baselineCafe = createCafe('Baseline Cafe', now - CAFE_SHIFT_MS)
  baselineCafe.finance.balance = '100000'
  baselineCafe.stock.kopi = 4
  baselineCafe.level = 5
  assert.equal(advanceCafeOperations(baselineCafe, makeDb().data, playerJid, now, () => 0), 1)
  assert.equal(baselineCafe.popularity, 4)

  const unpaidCafe = createCafe('Unpaid Cafe', now - CAFE_SHIFT_MS)
  unpaidCafe.finance.balance = '15000'
  unpaidCafe.staff.cashier = {
    name: 'Niko',
    hiredAt: now - 1000,
    salaryMultiplier: 1,
    unpaidShifts: 0
  }
  assert.equal(advanceCafeOperations(unpaidCafe, data, playerJid, now + CAFE_SHIFT_MS, () => 0), 2)
  assert.deepEqual(unpaidCafe.lastShift.resigned, ['Niko'])
  assert.equal(Object.keys(unpaidCafe.staff).length, 0)
})

test('reenabling taxation resets the automatic collection boundary', async () => {
  const previousDb = global.db
  global.db = makeDb()
  global.db.data.taxSystem = { config: { enabled: false, activatedPeriod: '2020-W01' } }
  try {
    assert.match(await runCommand(ownerJid, 'set on', true), /diaktifkan/)
    assert.equal(global.db.data.taxSystem.config.activatedPeriod, getTaxPeriod())
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('late fees are based on remaining principal and payment prevents repeat collection', async () => {
  const bill = {
    dueAt: 0,
    principal: '100000',
    paidPrincipal: '50000',
    paidPenalty: '0'
  }
  assert.deepEqual(getBillAmounts(bill, 3 * 24 * 60 * 60 * 1000), {
    principal: '50000',
    penalty: '2500',
    total: '52500'
  })

  const previousDb = global.db
  global.db = makeDb()
  try {
    assert.match(await runCommand(ownerJid, 'set on', true), /diaktifkan/)
    assert.match(await runCommand(ownerJid, 'collect', true), /Penerbitan tagihan/)

    const state = global.db.data.taxSystem
    const taxpayer = state.taxpayers[playerJid]
    assert.equal(taxpayer.bills[0].principal, '7500000')
    assert.match(await runCommand(ownerJid, 'collect', true), /sudah diterbitkan/)

    taxpayer.bills.unshift({
      id: `${taxpayer.taxId}-older-period`,
      taxId: taxpayer.taxId,
      period: '2026-W44',
      issuedAt: Date.now(),
      dueAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
      principal: '1000',
      paidPrincipal: '0',
      paidPenalty: '0',
      paidTotal: '0',
      items: { wealth: '1000' }
    })
    const receipt = await runCommand(playerJid, 'pay all')
    assert.match(receipt, /Pembayaran pajak berhasil/)
    assert.equal(global.db.data.users[playerJid].money, 992_499_000)
    assert.equal(state.treasury.balance, '7501000')
    assert.equal(state.treasury.revenueByTax.wealth, '7501000')
    assert.equal(state.treasury.transactions.length, 2)
    assert.ok(taxpayer.bills.every(bill => bill.paidTotal === bill.principal))
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})
