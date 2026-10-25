import assert from 'node:assert/strict'
import { resolveRpgPanelTarget } from '../lib/rpgPanelTarget.js'

const users = {
  '6282228638623@s.whatsapp.net': { rpg: {} }
}
const conn = { decodeJid: jid => jid }

const splitPhoneTarget = resolveRpgPanelTarget(
  ['62', '822-2863-8623', '12345'],
  { sender: 'owner@s.whatsapp.net' },
  conn,
  users
)
assert.equal(splitPhoneTarget.target, '6282228638623@s.whatsapp.net')
assert.deepEqual(splitPhoneTarget.consumedIndexes, [0, 1])

const phoneWithoutGroupAccount = resolveRpgPanelTarget(
  ['62', '822-2863-8623', '12345'],
  { sender: 'owner@s.whatsapp.net' },
  conn,
  {}
)
assert.equal(phoneWithoutGroupAccount.target, '6282228638623@s.whatsapp.net')

const localPhoneTarget = resolveRpgPanelTarget(
  ['0822-2863-8623', '12345'],
  { sender: 'owner@s.whatsapp.net' },
  conn,
  users
)
assert.equal(localPhoneTarget.target, '6282228638623@s.whatsapp.net')
assert.deepEqual(localPhoneTarget.consumedIndexes, [0])

const targetOnlyPhone = resolveRpgPanelTarget(
  ['822-2863-8623'],
  { sender: 'owner@s.whatsapp.net' },
  conn,
  users
)
assert.equal(targetOnlyPhone.target, '6282228638623@s.whatsapp.net')
assert.deepEqual(targetOnlyPhone.consumedIndexes, [0])

const replyTarget = resolveRpgPanelTarget(
  ['12345'],
  { sender: 'owner@s.whatsapp.net', quoted: { sender: '6281111111111@s.whatsapp.net' } },
  conn,
  users
)
assert.equal(replyTarget.target, '6281111111111@s.whatsapp.net')
assert.deepEqual(replyTarget.consumedIndexes, [])

const mentionTarget = resolveRpgPanelTarget(
  ['@6282228638623', '12345'],
  {
    sender: 'owner@s.whatsapp.net',
    mentionedJid: ['6282228638623@s.whatsapp.net']
  },
  conn,
  users
)
assert.equal(mentionTarget.target, '6282228638623@s.whatsapp.net')
assert.deepEqual(mentionTarget.consumedIndexes, [0])

console.log('RPG panel target tests passed')
