import assert from 'node:assert/strict'
import test from 'node:test'
import { addUserLimit, setUserLimit, syncUserLimit } from '../lib/userLimit.js'
import { buyLimit, formatLimitPriceList } from '../lib/limitShop.js'

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

test('shows the regular and premium limit prices', () => {
  assert.match(formatLimitPriceList({ premium: false }), /1 limit \| 100 EXP \| Rp 100\.000/)
  assert.match(formatLimitPriceList({ premium: true }), /1 limit \| 80 EXP \| Rp 80\.000/)
})

test('buys one limit for Rp100,000 and synchronizes both balances', async () => {
  const replies = []
  const user = { limit: 100, rpg: { limit: 100 }, money: 100000 }
  await buyLimit({ reply: async text => replies.push(text) }, user, ['1', 'money'])

  assert.equal(user.money, 0)
  assert.equal(user.limit, 101)
  assert.equal(user.rpg.limit, 101)
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
