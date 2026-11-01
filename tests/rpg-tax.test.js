import test from 'node:test'
import assert from 'node:assert/strict'
import taxHandler from '../plugins/rpg/rpg-tax.js'
import { addCafeExpense, advanceCafeOperations, createCafe } from '../lib/rpgCafe.js'
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
  assert.equal(cafe.lastShift.customers, 2)
  assert.equal(cafe.lastShift.served, 1)
  assert.equal(cafe.finance.income, '18000')
  assert.equal(cafe.finance.expenses, '5000')
  assert.equal(data.users[playerJid].rpg.taxActivity[period].business, '13000')

  assert.equal(addCafeExpense(cafe, data, playerJid, 10000, period, 'Restock'), true)
  assert.equal(data.users[playerJid].rpg.taxActivity[period].business, '3000')
  assert.equal(calculatePlayerTaxSnapshot(data.users[playerJid], data, period).business, '3000')
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
