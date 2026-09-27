import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BANK_FNB_REWARDS,
  BANK_TIERS,
  canUseBankBulkDeposit,
  calculateBankRobberyLoss,
  chargeBankMembership,
  exceedsBankLimit,
  formatBankLimit,
  getBankCsService,
  getBankGuardName,
  getBankRobberySuccessChance,
  BANK_CS_SERVICES,
  parseBankAssistantReminder,
  BANK_COMING_SOON_FACILITIES,
  canUseBankMoneyCommand,
  formatBankFacility,
  getBankTransactionCooldown,
  getBankTransactionCooldownRemaining
} from '../plugins/rpg/rpg-bank.js'
import { hargaBeli as RESTAURANT_MENU } from '../lib/rpg-masakanData.js'

test('bank security and insurance increase with every card tier', () => {
  for (let tier = 1; tier < Object.keys(BANK_TIERS).length; tier++) {
    assert.ok(BANK_TIERS[tier].keamanan > BANK_TIERS[tier - 1].keamanan)
    assert.ok(BANK_TIERS[tier].asuransi > BANK_TIERS[tier - 1].asuransi)
    assert.ok(getBankRobberySuccessChance(BANK_TIERS[tier]) < getBankRobberySuccessChance(BANK_TIERS[tier - 1]))
  }
})

test('insurance reduces robbery loss and full insurance protects the balance', () => {
  const balance = 1_000_000
  const percentage = 0.2

  assert.equal(calculateBankRobberyLoss(balance, percentage, BANK_TIERS[0]), 200_000)
  const lastTier = BANK_TIERS[Object.keys(BANK_TIERS).length - 1]
  assert.equal(calculateBankRobberyLoss(balance, percentage, lastTier), 0)
})

test('bulk deposits require Fast Track and guard names match each card tier', () => {
  assert.equal(canUseBankBulkDeposit(BANK_TIERS[4]), false)
  assert.equal(canUseBankBulkDeposit(BANK_TIERS[5]), true)
  assert.equal(getBankGuardName(BANK_TIERS[0]), 'Penjaga Biasa')
  assert.equal(getBankGuardName(BANK_TIERS[8]), 'Penjaga Robot Lv1')
  assert.equal(getBankGuardName(BANK_TIERS[15]), 'Pasukan Khusus')
})

test('the last bank tier has no deposit or loan limit', () => {
  const lastTier = BANK_TIERS[Object.keys(BANK_TIERS).length - 1]

  assert.equal(lastTier.limit, null)
  assert.equal(formatBankLimit(lastTier.limit), 'Tidak Terbatas')
  assert.equal(exceedsBankLimit(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, lastTier), false)
  assert.equal(exceedsBankLimit(9_000_000, 2_000_000, BANK_TIERS[0]), true)
})

test('membership is charged once per 30-day period, without accumulating missed fees', () => {
  const period = 2_592_000_000
  const userRPG = { bank: 1_000_000, lastMembership: 0, kartuBeku: false, riwayat: [] }

  assert.equal(chargeBankMembership(userRPG, 250_000, period - 1), 'not-due')
  assert.equal(chargeBankMembership(userRPG, 250_000, period), 'paid')
  assert.equal(userRPG.bank, 750_000)
  assert.equal(chargeBankMembership(userRPG, 250_000, period + 1), 'not-due')
  assert.equal(userRPG.bank, 750_000)
})

test('an unpaid due membership freezes the card without charging or stacking fees', () => {
  const period = 2_592_000_000
  const userRPG = { bank: 100_000, lastMembership: 0, kartuBeku: false, riwayat: [] }

  assert.equal(chargeBankMembership(userRPG, 250_000, period), 'insufficient')
  assert.equal(userRPG.kartuBeku, true)
  assert.equal(userRPG.bank, 100_000)
  assert.equal(userRPG.lastMembership, 0)
  assert.equal(chargeBankMembership(userRPG, 250_000, period + 1), 'insufficient')
  assert.equal(userRPG.bank, 100_000)

  userRPG.bank = 300_000
  assert.equal(chargeBankMembership(userRPG, 250_000, period + 1), 'paid')
  assert.equal(userRPG.bank, 50_000)
  assert.equal(userRPG.kartuBeku, false)
})

test('bank F&B rewards are unique per card and each item is given once', () => {
  const eligibleTiers = Object.keys(BANK_TIERS)
    .map(Number)
    .filter(tier => BANK_TIERS[tier].fasilitas.includes('Gratis Makanan & Minuman'))
  const claimedItems = new Set()

  for (const tier of eligibleTiers) {
    const reward = BANK_FNB_REWARDS[tier]
    assert.ok(reward, `${BANK_TIERS[tier].name} should have an F&B reward`)
    assert.ok(Object.keys(reward).every(item => RESTAURANT_MENU[item]), `${BANK_TIERS[tier].name} has an item missing from the restaurant`)

    for (const [item, quantity] of Object.entries(reward)) {
      assert.equal(quantity, 1, `${BANK_TIERS[tier].name} should give exactly one ${item}`)
      assert.ok(!claimedItems.has(item), `${item} should not be given by multiple cards`)
      claimedItems.add(item)
    }
  }

  for (const [tier, card] of Object.entries(BANK_TIERS)) {
    if (!card.fasilitas.includes('Gratis Makanan & Minuman')) {
      assert.equal(BANK_FNB_REWARDS[tier], undefined, `${card.name} should not have F&B rewards without the facility`)
    }
  }
})

test('CS service levels match the capabilities assigned to each card tier', () => {
  assert.equal(getBankCsService(BANK_TIERS[2]), 'Chat CS')
  assert.equal(getBankCsService(BANK_TIERS[9]), 'Chat CS 24jam')
  assert.equal(getBankCsService(BANK_TIERS[13]), 'Chat CS AI')
  assert.equal(getBankCsService(BANK_TIERS[16]), 'Premium CS AI')
  assert.match(BANK_CS_SERVICES['Premium CS AI'], /layanan prioritas/)
  assert.equal(getBankCsService(BANK_TIERS[1]), null)
})

test('assistant reminders require a valid future local date and time', () => {
  const now = new Date(2099, 0, 1).getTime()
  const reminder = parseBankAssistantReminder('2099-02-28', '14:35', 'Bayar tagihan', now)

  assert.deepEqual(reminder, {
    waktu: new Date(2099, 1, 28, 14, 35).getTime(),
    judul: 'Bayar tagihan'
  })
  assert.equal(parseBankAssistantReminder('2099-02-30', '14:35', 'Tanggal tidak valid', now), null)
  assert.equal(parseBankAssistantReminder('2099-02-28', '25:00', 'Jam tidak valid', now), null)
  assert.equal(parseBankAssistantReminder('2098-02-28', '14:35', 'Sudah lewat', now), null)
})

test('money command access requires Digital Access', () => {
  assert.equal(canUseBankMoneyCommand(BANK_TIERS[6]), false)
  assert.equal(canUseBankMoneyCommand(BANK_TIERS[7]), true)
})

test('bank deposit and withdrawal cooldown follows transport facilities', () => {
  assert.equal(getBankTransactionCooldown(BANK_TIERS[6]), 30 * 60 * 1000)
  assert.equal(getBankTransactionCooldown(BANK_TIERS[8]), 15 * 60 * 1000)
  assert.equal(getBankTransactionCooldown(BANK_TIERS[14]), 0)

  const transaction = { lastBankTransaction: 1_000 }
  assert.equal(getBankTransactionCooldownRemaining(transaction, BANK_TIERS[6], 1_000), 30 * 60 * 1000)
  assert.equal(getBankTransactionCooldownRemaining(transaction, BANK_TIERS[6], 1_000 + 30 * 60 * 1000), 0)
})

test('unfinished bank facilities display a Coming Soon marker', () => {
  assert.ok(BANK_COMING_SOON_FACILITIES.has('Vault Pribadi'))
  assert.equal(formatBankFacility('Vault Pribadi'), 'Vault Pribadi (Coming Soon)')
  assert.equal(formatBankFacility('Digital Access'), 'Digital Access')
})