import test from 'node:test'
import assert from 'node:assert/strict'
import { runRpgVault } from '../lib/rpgVault.js'
import { BANK_TIERS, BANK_CROWN_ITEM_ID } from '../lib/rpg-bankData.js'

const previousDb = global.db
global.db = { write: async () => {} }

test.after(() => {
  if (previousDb === undefined) delete global.db
  else global.db = previousDb
})

function makeMessage() {
  const replies = []
  return { replies, m: { reply: message => (replies.push(message), message) } }
}

test('vault stores Mall furniture safely and returns it to inventory', async () => {
  const rpg = { mallInventory: { sofa_minimalis: 2 }, bankVault: {} }
  const db = {}
  const { m, replies } = makeMessage()

  await runRpgVault({ m, db, rpg, tier: BANK_TIERS[10], args: ['simpan', 'sofa minimalis', '1'] })
  assert.equal(rpg.mallInventory.sofa_minimalis, 1)
  assert.equal(rpg.bankVault.sofa_minimalis, 1)
  assert.match(replies.at(-1), /disimpan ke Vault Pribadi/)

  await runRpgVault({ m, db, rpg, tier: BANK_TIERS[10], args: ['ambil', 'sofa minimalis'] })
  assert.equal(rpg.mallInventory.sofa_minimalis, 2)
  assert.equal(rpg.bankVault.sofa_minimalis, 0)
  assert.match(replies.at(-1), /diambil dari Vault Pribadi/)
})

test('vault accepts the Royal crown and blocks protected or unavailable actions', async () => {
  const rpg = {
    mallInventory: { [BANK_CROWN_ITEM_ID]: 1, sofa_minimalis: 1 },
    bankVault: {},
    home: { furniture: ['sofa_minimalis'] }
  }
  const { m, replies } = makeMessage()

  await runRpgVault({ m, db: {}, rpg, tier: BANK_TIERS[10], args: ['deposit', 'Mahkota Kehormatan'] })
  assert.equal(rpg.bankVault[BANK_CROWN_ITEM_ID], 1)
  assert.equal(rpg.mallInventory[BANK_CROWN_ITEM_ID], 0)

  await runRpgVault({ m, db: {}, rpg, tier: BANK_TIERS[10], args: ['simpan', 'sofa minimalis'] })
  assert.match(replies.at(-1), /sedang terpasang di rumah/)
  assert.equal(rpg.mallInventory.sofa_minimalis, 1)

  await runRpgVault({ m, db: {}, rpg, tier: BANK_TIERS[9], args: ['list'] })
  assert.match(replies.at(-1), /tersedia mulai Black Card/)
})
