import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clearSkipCooldownEntries,
  getSkipCooldownEntries,
  getSkipCooldownUsage,
  recordSkipCooldownUsage,
  resolveSkipCooldownTarget,
  selectSkipCooldownEntries,
  SKIPCD_COST_PER_SECOND,
  SKIPCD_HOURLY_LIMIT,
  SKIPCD_USAGE_WINDOW
} from '../lib/rpgCooldownSkip.js'

test('skip cooldown target aliases are limited to the supported activities', () => {
  assert.equal(resolveSkipCooldownTarget(' Mining '), 'mining')
  assert.equal(resolveSkipCooldownTarget('semua tindak kriminal'), 'kriminal')
  assert.equal(resolveSkipCooldownTarget('casino'), null)
})

test('skip price charges each started second of remaining cooldown', () => {
  const now = 1_700_000_000_000
  const rpg = { premium: true, lastMining: now - 30_000 }
  const [mining] = selectSkipCooldownEntries(
    resolveSkipCooldownTarget('mining'),
    getSkipCooldownEntries(rpg, 0, now)
  )

  assert.equal(mining.remaining, 66_000)
  assert.equal(mining.cost, SKIPCD_COST_PER_SECOND * 66)
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

test('skip cooldown usage is limited to ten successful uses in a rolling hour', () => {
  const now = 1_700_000_000_000
  let usage
  for (let count = 1; count <= SKIPCD_HOURLY_LIMIT; count++) {
    usage = recordSkipCooldownUsage(usage, now + count)
  }

  assert.equal(getSkipCooldownUsage(usage, now + 10).count, SKIPCD_HOURLY_LIMIT)
  const resetAt = usage.startedAt + SKIPCD_USAGE_WINDOW
  assert.equal(getSkipCooldownUsage(usage, resetAt - 1).count, SKIPCD_HOURLY_LIMIT)
  assert.equal(getSkipCooldownUsage(usage, resetAt).count, 0)
  assert.deepEqual(
    recordSkipCooldownUsage(usage, resetAt),
    { count: 1, startedAt: resetAt }
  )
})
