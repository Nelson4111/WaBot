import test from 'node:test'
import assert from 'node:assert/strict'
import {
  absorbWardenAttack,
  getWerewolfPlayerFaction,
  getWinner,
  resolveNightActions,
  voteKill
} from '../lib/werewolf.js'

test('Warden armor absorbs one night attack and one vote execution', () => {
  const warden = { id: 'warden', number: 1, role: 'warden', armor: true, isdead: false, vote: 1 }
  const wolf = { id: 'wolf', number: 2, role: 'werewolf', isdead: false, vote: 0 }
  const room = {
    room: 'test',
    category: 'werewolf',
    player: [warden, wolf],
    dead: [],
    guardian: [],
    nightTarget: 1,
    voting: false
  }
  const rooms = { test: room }

  resolveNightActions('test', rooms)
  assert.equal(warden.isdead, false)
  assert.equal(warden.armor, false)
  assert.deepEqual(room.dead, [])

  warden.armor = true
  const protectedExecution = voteKill('test', rooms)
  assert.equal(protectedExecution.protected, true)
  assert.equal(warden.isdead, false)
  assert.equal(warden.armor, false)

  const executed = voteKill('test', rooms)
  assert.equal(executed.isdead, true)
})

test('Cipher is neutral and remains alive for either faction victory', () => {
  const cipher = { id: 'cipher', number: 2, role: 'cipher', isdead: false }
  const room = {
    room: 'test',
    category: 'werewolf',
    player: [
      { id: 'wolf', number: 1, role: 'werewolf', isdead: true },
      cipher,
      { id: 'villager', number: 3, role: 'warga', isdead: false }
    ],
    voting: false
  }

  assert.equal(getWerewolfPlayerFaction(room, cipher), 'neutral')
  assert.equal(getWinner('test', { test: room }).status, true)

  room.player[0].isdead = false
  room.player[2].isdead = true
  assert.equal(getWinner('test', { test: room }).status, false)
})

test('Warden armor helper only absorbs the first hit', () => {
  const warden = { role: 'warden', armor: true }
  assert.equal(absorbWardenAttack(warden), true)
  assert.equal(absorbWardenAttack(warden), false)
  assert.equal(absorbWardenAttack({ role: 'warga', armor: true }), false)
})
