import assert from 'node:assert/strict'
import test from 'node:test'

import {
  BANKRUPT_PROTECTION_RATE,
  claimBankruptProtection,
  recordBankruptFunds
} from '../lib/rpgBankruptProtection.js'
import { getRpgWibDateKey, getRpgWibWeekKey } from '../lib/rpgTime.js'

test('RPG calendar keys use WIB and roll weekly protection over on Monday', () => {
  assert.equal(getRpgWibDateKey(Date.parse('2026-10-20T16:59:59Z')), '2026-10-20')
  assert.equal(getRpgWibDateKey(Date.parse('2026-10-20T17:00:00Z')), '2026-10-21')
  assert.equal(getRpgWibWeekKey(Date.parse('2026-10-18T16:59:59Z')), '2026-10-12')
  assert.equal(getRpgWibWeekKey(Date.parse('2026-10-18T17:00:00Z')), '2026-10-19')
})

test('bankrupt protection returns half the recorded funds only when wallet and bank are empty', () => {
  const rpg = { bank: 0 }
  assert.equal(recordBankruptFunds(rpg, 1_000_001, 100), true)
  assert.equal(BANKRUPT_PROTECTION_RATE, 0.5)
  assert.equal(claimBankruptProtection(rpg, 1, Date.parse('2026-10-19T00:00:00Z')).status, 'not-bankrupt')

  const result = claimBankruptProtection(rpg, 0, Date.parse('2026-10-19T00:00:00Z'))
  assert.deepEqual(result, {
    status: 'claimed',
    amount: 500_000,
    funds: 1_000_001,
    weekKey: '2026-10-19'
  })
  assert.equal(claimBankruptProtection(rpg, 0, Date.parse('2026-10-24T00:00:00Z')).status, 'already-claimed')
  assert.equal(claimBankruptProtection(rpg, 0, Date.parse('2026-10-26T00:00:00Z')).status, 'no-recorded-bankruptcy')
})

test('multiple bankrupt events accumulate until the weekly claim is used', () => {
  const rpg = { bank: 0 }
  recordBankruptFunds(rpg, 1000)
  recordBankruptFunds(rpg, 3000)

  assert.equal(claimBankruptProtection(rpg, 0, Date.parse('2026-10-19T00:00:00Z')).amount, 2000)
})
