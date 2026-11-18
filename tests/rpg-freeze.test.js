import assert from 'node:assert/strict'
import {
  formatRpgFreezeDuration,
  getRpgFreezeRecord,
  isRpgFrozen,
  pauseRpgTimers
} from '../lib/rpgFreeze.js'
import { getRpgWibDateKey, getRpgWibWeekKey } from '../lib/rpgTime.js'
import freezeHandler from '../plugins/rpg/rpg-freeze.js'

const frozenAt = Date.parse('2026-11-16T10:00:00+07:00')
const unfrozenAt = Date.parse('2026-11-18T10:00:00+07:00')
const elapsed = unfrozenAt - frozenAt
assert.notEqual(
  getRpgWibWeekKey(Date.parse('2026-11-15T23:59:59+07:00')),
  getRpgWibWeekKey(Date.parse('2026-11-16T00:00:00+07:00'))
)
const account = {
  rpgFreeze: { startedAt: frozenAt },
  dailyDate: getRpgWibDateKey(frozenAt),
  lastDaily: frozenAt - 3600000,
  rpg: {
    cooldown: { adventure: frozenAt - 1000 },
    lastCareAt: frozenAt - 2000,
    history: [{ createdAt: frozenAt - 3000 }]
  }
}

assert.equal(getRpgFreezeRecord(account).startedAt, frozenAt)
assert.equal(getRpgFreezeRecord({ rpgFreeze: { startedAt: 0 } }), null)
assert.equal(isRpgFrozen(account), true)
assert.equal(isRpgFrozen({}), false)
assert.equal(formatRpgFreezeDuration(elapsed), '2 hari')

pauseRpgTimers(account, frozenAt, unfrozenAt)
assert.equal(account.lastDaily, frozenAt - 3600000 + elapsed)
assert.equal(account.rpg.cooldown.adventure, frozenAt - 1000 + elapsed)
assert.equal(account.rpg.lastCareAt, frozenAt - 2000 + elapsed)
assert.equal(account.rpg.history[0].createdAt, frozenAt - 3000)
assert.equal(account.dailyDate, getRpgWibDateKey(unfrozenAt))

const eligibleAtFreeze = {
  dailyDate: getRpgWibDateKey(frozenAt - 86400000),
  rpg: {}
}
pauseRpgTimers(eligibleAtFreeze, frozenAt, unfrozenAt)
assert.equal(eligibleAtFreeze.dailyDate, getRpgWibDateKey(unfrozenAt - 86400000))

const previousDb = global.db
const player = { name: 'Player', premium: true, rpg: {} }
global.db = { data: { users: { 'player@s.whatsapp.net': player } }, write: async () => {} }
const replies = []
const message = {
  sender: 'player@s.whatsapp.net',
  mentionedJid: [],
  reply: async (...args) => replies.push(args[0])
}
const context = { conn: { decodeJid: jid => jid }, usedPrefix: '.', isOwner: false }

try {
  await freezeHandler(message, { ...context, text: 'on' })
  assert.equal(isRpgFrozen(player), false)
  assert.match(replies.at(-1), /cooldown, timer, dan proses RPG terkait dijeda/)
  let token = Object.keys(global.db.data.rpgFreezeConfirmations)[0]
  assert.ok(token)
  await freezeHandler(message, { ...context, text: `cancel ${token}` })
  assert.equal(isRpgFrozen(player), false)
  assert.equal(player.rpgFreezeSelfUseWeek, undefined)

  await freezeHandler(message, { ...context, text: 'on' })
  token = Object.keys(global.db.data.rpgFreezeConfirmations)[0]
  await freezeHandler(message, { ...context, text: `confirm ${token}` })
  assert.equal(isRpgFrozen(player), true)
  assert.equal(player.rpgFreezeSelfUseWeek, getRpgWibWeekKey(Date.now()))
  player.rpgFreeze.startedAt = Date.now() - 60000
  await freezeHandler(message, { ...context, text: 'off' })
  assert.equal(isRpgFrozen(player), false)
  assert.match(replies.at(-1), /Lama dibekukan/)

  await freezeHandler(message, { ...context, text: 'on' })
  assert.equal(isRpgFrozen(player), false)
  assert.match(replies.at(-1), /Jatah freeze mandiri minggu ini/)

  player.rpgFreezeSelfUseWeek = getRpgWibWeekKey(Date.now() - 7 * 86400000)
  await freezeHandler(message, { ...context, text: 'on' })
  token = Object.keys(global.db.data.rpgFreezeConfirmations)[0]
  await freezeHandler(message, { ...context, text: `confirm ${token}` })
  assert.equal(isRpgFrozen(player), true)
  await freezeHandler(message, { ...context, text: 'off' })
  assert.equal(isRpgFrozen(player), false)

  player.premium = false
  await freezeHandler(message, { ...context, text: 'on' })
  assert.equal(isRpgFrozen(player), false)
  assert.match(replies.at(-1), /khusus pengguna Premium/)

  const ownerMessage = {
    ...message,
    sender: 'owner@s.whatsapp.net',
    mentionedJid: ['player@s.whatsapp.net']
  }
  const usedWeek = player.rpgFreezeSelfUseWeek
  await freezeHandler(ownerMessage, { ...context, text: 'on', isOwner: true })
  assert.equal(isRpgFrozen(player), false)
  token = Object.keys(global.db.data.rpgFreezeConfirmations)[0]
  await freezeHandler(ownerMessage, { ...context, text: `confirm ${token}`, isOwner: true })
  assert.equal(isRpgFrozen(player), true)
  assert.equal(player.rpgFreezeSelfUseWeek, usedWeek)
  await freezeHandler(ownerMessage, { ...context, text: 'off', isOwner: true })
  assert.equal(isRpgFrozen(player), false)

  player.rpgFreeze = { startedAt: Date.now() - 60000, frozenBy: 'owner@s.whatsapp.net' }
  await freezeHandler(message, { ...context, text: 'off' })
  assert.equal(isRpgFrozen(player), true)
  assert.match(replies.at(-1), /Hanya Owner\/Co-owner/)
  await freezeHandler(message, { ...context, text: 'off', isOwner: true })
  assert.equal(isRpgFrozen(player), false)
} finally {
  global.db = previousDb
}

console.log('rpg freeze tests passed')
