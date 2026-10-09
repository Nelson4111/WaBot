import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addUserLimit,
  claimPremiumDailyLimit,
  getJakartaDate,
  getLimitHistoryPage,
  grantFreeDailyLimit,
  setUserLimit,
  syncUserLimit
} from '../lib/userLimit.js'
import { buyLimit, formatLimitPriceList } from '../lib/limitShop.js'
import SupabaseRelationalAdapter from '../lib/supabaseRelationalAdapter.js'

test('keeps legacy and shared limit values synchronized', () => {
  const user = { limit: 100, rpg: { limit: 0 } }
  assert.equal(syncUserLimit(user), 100)
  assert.equal(user.rpg.limit, 100)
  assert.equal(setUserLimit(user, 25), 25)
  assert.equal(user.rpg.limit, 25)
  assert.equal(addUserLimit(user, 50), 75)
  assert.equal(user.limit, 75)
  assert.equal(user.rpg.limit, 75)
})

test('grants up to 20 free limits per Jakarta day, capped at 50', () => {
  const dayOne = Date.parse('2026-10-09T10:00:00+07:00')
  const user = { limit: 35, rpg: { limit: 35 } }

  assert.deepEqual(grantFreeDailyLimit(user, dayOne), { granted: true, amount: 15, limit: 50 })
  assert.deepEqual(grantFreeDailyLimit(user, dayOne + 60_000), { granted: false, amount: 0, limit: 50 })

  user.limit = 45
  assert.deepEqual(
    grantFreeDailyLimit(user, Date.parse('2026-10-10T00:00:00+07:00')),
    { granted: true, amount: 5, limit: 50 }
  )

  user.limit = 51
  assert.deepEqual(
    grantFreeDailyLimit(user, Date.parse('2026-10-11T00:00:00+07:00')),
    { granted: true, amount: 0, limit: 51 }
  )
  assert.equal(getJakartaDate(dayOne), '2026-10-09')
})

test('premium daily is available once per Jakarta day, regardless of 24 hours', () => {
  const user = { limit: 0 }
  const firstClaim = Date.parse('2026-10-09T23:55:00+07:00')
  assert.deepEqual(claimPremiumDailyLimit(user, firstClaim, 50), { claimed: true, amount: 50, limit: 50 })
  assert.equal(claimPremiumDailyLimit(user, firstClaim + 10 * 60_000, 50).claimed, false)
  assert.equal(
    claimPremiumDailyLimit(user, Date.parse('2026-10-10T00:01:00+07:00'), 50).claimed,
    true
  )
})

test('premium daily respects legacy timestamp claims for the current day', () => {
  const claimedAt = Date.parse('2026-10-09T01:00:00+07:00')
  const user = { limit: 0, premiumDailyAt: claimedAt }
  assert.equal(claimPremiumDailyLimit(user, Date.parse('2026-10-09T23:59:00+07:00')).claimed, false)
})

test('records limit spending newest-first and retains only five pages', () => {
  const user = { limit: 100 }
  for (let index = 0; index < 53; index += 1) {
    setUserLimit(user, user.limit - 1, `command-${index}`)
  }

  const firstPage = getLimitHistoryPage(user, 1)
  assert.equal(firstPage.total, 50)
  assert.equal(firstPage.entries.length, 10)
  assert.equal(firstPage.entries[0].reason, 'command-52')
  assert.equal(firstPage.entries[9].reason, 'command-43')
  assert.equal(getLimitHistoryPage(user, 5).entries.length, 10)
})

test('shows the regular and premium limit prices', () => {
  assert.match(formatLimitPriceList({ premium: false }), /1 limit \| 100 EXP \| Rp 100\.000/)
  assert.match(formatLimitPriceList({ premium: true }), /1 limit \| 80 EXP \| Rp 80\.000/)
})

test('buys one limit for Rp100,000 and synchronizes both balances', async () => {
  const replies = []
  const user = { limit: 100, rpg: { limit: 100 }, money: 100000 }
  let writes = 0
  const previousDb = global.db
  global.db = { write: async () => { writes += 1 } }
  try {
    await buyLimit({ reply: async text => replies.push(text) }, user, ['1', 'money'])
  } finally {
    global.db = previousDb
  }

  assert.equal(user.money, 0)
  assert.equal(user.limit, 101)
  assert.equal(user.rpg.limit, 101)
  assert.equal(writes, 1)
  assert.match(replies[0], /Rp 100\.000 terpakai/)
})

test('retains the premium discount and rejects insufficient funds', async () => {
  const replies = []
  const reply = async text => replies.push(text)
  const premiumUser = { limit: 0, rpg: { limit: 0 }, money: 80000, premium: true }
  await buyLimit({ reply }, premiumUser, ['1', 'money'])
  assert.equal(premiumUser.money, 0)
  assert.equal(premiumUser.limit, 1)
  assert.equal(premiumUser.rpg.limit, 1)

  const insufficientUser = { limit: 10, rpg: { limit: 10 }, money: 99999 }
  await buyLimit({ reply }, insufficientUser, ['1', 'money'])
  assert.equal(insufficientUser.money, 99999)
  assert.equal(insufficientUser.limit, 10)
  assert.equal(insufficientUser.rpg.limit, 10)
  assert.match(replies[1], /Saldo uang tidak cukup/)
})

test('preserves a zero limit when loading Supabase users', async () => {
  const adapter = new SupabaseRelationalAdapter({ url: 'https://example.supabase.co', key: 'test-key' })
  adapter._fetchAll = async table => {
    if (table !== 'users') return []
    return [{
      jid: 'zero-limit@s.whatsapp.net',
      limit_val: 0,
      raw_data: {
        limitHistory: [{ amount: 1, reason: '.sticker', timestamp: 1791514648000 }]
      },
      rpg: {}
    }]
  }
  adapter._saveLocalBackup = () => {}

  const data = await adapter.read()
  assert.equal(data.users['zero-limit@s.whatsapp.net'].limit, 0)
  assert.deepEqual(data.users['zero-limit@s.whatsapp.net'].limitHistory, [
    { amount: 1, reason: '.sticker', timestamp: 1791514648000 }
  ])
})
