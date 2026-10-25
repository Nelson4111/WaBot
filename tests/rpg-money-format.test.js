import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addRpgMoney,
  compareRpgMoney,
  divideRpgMoney,
  formatRpgMoney,
  formatRpgNumber,
  multiplyRpgMoney,
  normalizeRpgMoney,
  normalizeRpgMoneyData,
  parseRpgMoneyAmount,
  serializeRpgBigInt
} from '../lib/rpgMoney.js'

test('large money and general amounts use RPG suffixes', () => {
  assert.equal(formatRpgMoney(1_500_000), 'Rp 1,5M')
  assert.equal(formatRpgNumber(1_234_567_890), '1,23B')
})

test('small and negative amounts retain their value when formatted', () => {
  assert.equal(formatRpgMoney(999), 'Rp 999')
  assert.equal(formatRpgNumber(-1_500), '-1,5K')
})

test('money parsing and arithmetic preserve arbitrary precision while keeping safe numbers', () => {
  const large = parseRpgMoneyAmount('9007199254740993')
  assert.equal(typeof large, 'bigint')
  assert.equal(large, 9007199254740993n)
  assert.equal(typeof parseRpgMoneyAmount('1.5M'), 'number')
  assert.equal(parseRpgMoneyAmount('1.5M'), 1_500_000)
  assert.equal(addRpgMoney(large, 7), 9007199254741000n)
  assert.equal(compareRpgMoney(large, Number.MAX_SAFE_INTEGER), 1)
  assert.equal(divideRpgMoney(large, 3), 3002399751580331n)
  assert.equal(multiplyRpgMoney(large, 1e-7), 900719925n)
  assert.equal(formatRpgMoney(large), 'Rp 9,01Qa')
})

test('BigInt values serialize as tagged decimal strings and normalize on currency load', () => {
  const serialized = JSON.stringify({ money: 9007199254740993n }, (_, value) =>
    typeof value === 'bigint' ? serializeRpgBigInt(value) : value
  )
  assert.equal(serialized, '{"money":"__RPG_BIGINT__:9007199254740993"}')

  const data = {
    users: {
      player: {
        money: '__RPG_BIGINT__:9007199254740993',
        rpg: {
          bank: '__RPG_BIGINT__:9007199254740994',
          casinoStats: {
            profit: '__RPG_BIGINT__:-9007199254740995',
            byGame: { slots: { profit: '__RPG_BIGINT__:9007199254740996' } }
          },
          level: '__RPG_BIGINT__:9007199254740997'
        }
      }
    }
  }
  normalizeRpgMoneyData(data)
  assert.equal(data.users.player.money, 9007199254740993n)
  assert.equal(data.users.player.rpg.bank, 9007199254740994n)
  assert.equal(data.users.player.rpg.casinoStats.profit, -9007199254740995n)
  assert.equal(data.users.player.rpg.casinoStats.byGame.slots.profit, 9007199254740996n)
  assert.equal(data.users.player.rpg.level, '__RPG_BIGINT__:9007199254740997')
  assert.equal(normalizeRpgMoney(42), 42)
})

test('normalizes large relationship gift and child-care offer amounts', () => {
  const amount = '__RPG_BIGINT__:43982362985705680000'
  const data = {
    users: {
      player: {
        rpg: {
          rshipGiftDraft: { kind: 'money', amount },
          pendingChildFosterOffer: { amount }
        }
      }
    }
  }

  normalizeRpgMoneyData(data)
  assert.equal(data.users.player.rpg.rshipGiftDraft.amount, 43982362985705680000n)
  assert.equal(data.users.player.rpg.pendingChildFosterOffer.amount, 43982362985705680000n)
})
