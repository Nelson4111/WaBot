import test from 'node:test'
import assert from 'node:assert/strict'
import { formatRpgMoney, formatRpgNumber } from '../lib/rpgMoney.js'

test('large money and general amounts use RPG suffixes', () => {
  assert.equal(formatRpgMoney(1_500_000), 'Rp 1,5M')
  assert.equal(formatRpgNumber(1_234_567_890), '1,23B')
})

test('small and negative amounts retain their value when formatted', () => {
  assert.equal(formatRpgMoney(999), 'Rp 999')
  assert.equal(formatRpgNumber(-1_500), '-1,5K')
})
