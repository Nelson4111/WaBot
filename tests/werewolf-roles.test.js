import test from 'node:test'
import assert from 'node:assert/strict'
import {
  assignFixerContracts,
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

test('Parasite is an antagonist and Fixer contract is assigned to another living player', () => {
  const fixer = { id: 'fixer', number: 1, role: 'fixer', isdead: false }
  const target = { id: 'target', number: 2, role: 'warga', isdead: false }
  const dead = { id: 'dead', number: 3, role: 'warga', isdead: true }
  const room = { category: 'parasite', player: [fixer, target, dead] }

  assert.equal(getWerewolfPlayerFaction(room, { role: 'parasite' }), 'antagonist')
  assert.equal(assignFixerContracts(room, () => 0), true)
  assert.equal(fixer.contractTargetId, 'target')
  assert.equal(fixer.contractTargetNumber, 2)
  assert.notEqual(getWinner('test', { test: room }).status, 'fixer')
})

test('Fixer wins only when its target is dead and the Fixer is alive', () => {
  const fixer = {
    id: 'fixer',
    role: 'fixer',
    isdead: false,
    contractTargetId: 'target'
  }
  const target = { id: 'target', role: 'warga', isdead: true }
  const room = {
    room: 'test',
    category: 'werewolf',
    player: [fixer, target],
    voting: false
  }

  assert.deepEqual(getWinner('test', { test: room }), {
    voting: false,
    status: 'fixer',
    winnerId: 'fixer'
  })

  fixer.isdead = true
  delete room.fixerWinnerId
  assert.notEqual(getWinner('test', { test: room }).status, 'fixer')
})
