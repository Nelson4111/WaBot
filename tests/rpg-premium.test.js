import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getPremiumProtectionRemaining,
  PREMIUM_PROTECTION_COOLDOWN,
  tryPremiumProtection
} from '../lib/rpgPremium.js'

test('Premium Protection triggers once and then respects its per-action cooldown', () => {
  const now = 1_700_000_000_000
  const account = { premium: true }
  global.db = { data: { users: { '123@s.whatsapp.net': account } } }

  assert.equal(tryPremiumProtection('123@s.whatsapp.net', 'copet', now), true)
  assert.equal(getPremiumProtectionRemaining(account, 'copet', now), PREMIUM_PROTECTION_COOLDOWN)
  assert.equal(tryPremiumProtection('123@s.whatsapp.net', 'copet', now + 1), false)
  assert.equal(tryPremiumProtection('123@s.whatsapp.net', 'rampok', now + 1), true)
  assert.equal(tryPremiumProtection('123@s.whatsapp.net', 'death', now + 1), true)
  assert.equal(tryPremiumProtection('123@s.whatsapp.net', 'death', now + 2), false)
  assert.equal(
    tryPremiumProtection('123@s.whatsapp.net', 'copet', now + PREMIUM_PROTECTION_COOLDOWN),
    true
  )
})

test('action cooldown map does not fall back to a stale legacy global timestamp', () => {
  const account = {
    premium: true,
    premiumProtectionAt: 1_700_000_000_000,
    premiumProtectionCooldowns: {}
  }
  assert.equal(getPremiumProtectionRemaining(account, 'copet', 1_700_000_000_000), 0)
})

test('legacy dungeon protection cooldown carries over to universal death protection', () => {
  const now = 1_700_000_000_000
  const account = {
    premium: true,
    premiumProtectionCooldowns: { dungeon: now }
  }
  assert.equal(getPremiumProtectionRemaining(account, 'death', now), PREMIUM_PROTECTION_COOLDOWN)
})
