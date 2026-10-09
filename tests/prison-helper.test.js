import test from 'node:test'
import assert from 'node:assert/strict'

import { ensurePrisonCell, getRandomPrisonCell, hasExclusiveJailAccess } from '../lib/prisonHelper.js'

test('exclusive bank access assigns a distinct VIP prison cell', () => {
  const jid = 'premium@s.whatsapp.net'
  const wdb = {
    users: { [jid]: { rpg: { bankTier: 12, sel: 'A1' } } },
    penjara: [jid]
  }

  assert.equal(hasExclusiveJailAccess(wdb.users[jid].rpg), true)
  assert.match(ensurePrisonCell(wdb, jid), /^VIP[A-Z]+[1-9]$/)
  assert.equal(ensurePrisonCell(wdb, jid), wdb.users[jid].rpg.sel)
})

test('standard prison cells stay outside the reserved VIP block', () => {
  const standardJid = 'standard@s.whatsapp.net'
  const premiumJid = 'premium@s.whatsapp.net'
  const wdb = {
    users: {
      [standardJid]: { rpg: { bankTier: 11 } },
      [premiumJid]: { rpg: { bankTier: 12, sel: 'VIPA1' } }
    },
    penjara: [standardJid, premiumJid]
  }

  assert.equal(hasExclusiveJailAccess(wdb.users[standardJid].rpg), false)
  assert.doesNotMatch(getRandomPrisonCell(wdb, standardJid), /^VIP/)
  assert.match(getRandomPrisonCell(wdb, premiumJid), /^VIP[A-Z]+[1-9]$/)
})
