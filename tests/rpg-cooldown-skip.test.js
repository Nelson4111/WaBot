import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clearSkipCooldownEntries,
  getSkipCooldownEntries,
  resolveSkipCooldownTarget,
  selectSkipCooldownEntries,
  SKIPCD_COST_PER_MINUTE
} from '../lib/rpgCooldownSkip.js'

test('skip cooldown target aliases are limited to the supported activities', () => {
  assert.equal(resolveSkipCooldownTarget(' Mining '), 'mining')
  assert.equal(resolveSkipCooldownTarget('semua tindak kriminal'), 'kriminal')
  assert.equal(resolveSkipCooldownTarget('casino'), null)
})

test('skip price charges each started minute of remaining cooldown', () => {
  const now = 1_700_000_000_000
  const rpg = { premium: true, lastMining: now - 30_000 }
  const [mining] = selectSkipCooldownEntries(
    resolveSkipCooldownTarget('mining'),
    getSkipCooldownEntries(rpg, 0, now)
  )

  assert.equal(mining.remaining, 66_000)
  assert.equal(mining.cost, SKIPCD_COST_PER_MINUTE * 2)
})

test('criminal target aggregates active crime cooldowns and clears their timestamps', () => {
  const now = 1_700_000_000_000
  const rpg = {
    premium: false,
    lastcopet: now - 60_000,
    lastbegal: now - 60_000
  }
  const entries = selectSkipCooldownEntries(
    resolveSkipCooldownTarget('kriminal'),
    getSkipCooldownEntries(rpg, 0, now)
  )

  assert.deepEqual(entries.map(({ id }) => id), ['copet', 'begal'])
  clearSkipCooldownEntries(rpg, {}, '123@s.whatsapp.net', entries)
  assert.equal(rpg.lastcopet, 0)
  assert.equal(rpg.lastbegal, 0)
})

test('fitnah cooldown is read and cleared from the account-level fitnah map', () => {
  const now = 1_700_000_000_000
  const rpg = { premium: false }
  const db = { fitnah: { '123@s.whatsapp.net': now - 60_000 } }
  const entries = selectSkipCooldownEntries(
    'kriminal',
    getSkipCooldownEntries(rpg, db.fitnah['123@s.whatsapp.net'], now)
  )

  assert.equal(entries[0].id, 'fitnah')
  clearSkipCooldownEntries(rpg, db, '123@s.whatsapp.net', entries)
  assert.equal(db.fitnah['123@s.whatsapp.net'], 0)
})
