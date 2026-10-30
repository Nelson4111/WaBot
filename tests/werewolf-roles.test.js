import test from 'node:test'
import assert from 'node:assert/strict'
import {
  assignFixerContracts,
  absorbWardenAttack,
  generateVoteCodeMap,
  getWerewolfPlayerFaction,
  getWinner,
  getNightProgress,
  roleGenerator,
  resolveSecretCodeAction,
  resolveNightActions,
  voteKill
} from '../lib/werewolf.js'

test('Warden armor absorbs one antagonist attack but not a vote execution', () => {
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
  const executed = voteKill('test', rooms)
  assert.equal(executed, warden)
  assert.equal(warden.isdead, true)
  assert.equal(warden.armor, true)
})

test('Hunter gets a final reaction after being selected by voting', () => {
  const hunter = { id: 'hunter', number: 1, role: 'hunter', isdead: false, vote: 2 }
  const villager = { id: 'villager', number: 2, role: 'warga', isdead: false, vote: 0 }
  const room = { room: 'test', player: [hunter, villager] }

  assert.equal(voteKill('test', { test: room }), hunter)
  assert.equal(hunter.isdead, true)
  assert.equal(hunter.pendingHunter, true)
  assert.equal(hunter.pendingExecution, true)
})

test('AI Guardian protection and AI Mayor vote weight use normal role mechanics', () => {
  const guardian = {
    id: 'ai-guardian',
    number: 1,
    role: 'guardian',
    isAiCitizen: true,
    isdead: false,
    nightDone: false,
    secretCodes: { GUARD: { type: 'guard', targetNumber: 3 } }
  }
  const mayor = {
    id: 'ai-mayor',
    number: 2,
    role: 'mayor',
    isAiCitizen: true,
    isdead: false,
    isvote: false,
    voteCodes: { VOTE: { type: 'vote', targetNumber: 3 } }
  }
  const target = { id: 'human', number: 3, role: 'warga', isdead: false, vote: 0 }
  const wolf = { id: 'wolf', number: 4, role: 'werewolf', isdead: false }
  const room = {
    room: 'ai-role-test',
    category: 'werewolf',
    player: [guardian, mayor, target, wolf],
    dead: [],
    guardian: [],
    nightTarget: 3
  }
  const rooms = { [room.room]: room }

  assert.equal(resolveSecretCodeAction(room.room, guardian.id, 'GUARD', rooms).ok, true)
  assert.equal(getNightProgress(room).total, 4)
  resolveNightActions(room.room, rooms)
  assert.equal(target.isdead, false)

  assert.deepEqual(resolveSecretCodeAction(room.room, mayor.id, 'VOTE', rooms, 'vote'), {
    ok: true,
    action: 'vote',
    targetNumber: 3,
    voteBoost: 2
  })
  assert.equal(target.vote, 2)
  assert.equal(target.voteCount, 1)

  const secondAiVoter = {
    id: 'ai-villager',
    number: 5,
    role: 'warga',
    isAiCitizen: true,
    isdead: false,
    isvote: false,
    voteCodes: { VOTE: { type: 'vote', targetNumber: 3 } }
  }
  room.player.push(secondAiVoter)
  assert.equal(resolveSecretCodeAction(room.room, secondAiVoter.id, 'VOTE', rooms, 'vote').ok, true)
  assert.equal(target.vote, 3)
  assert.equal(target.voteCount, 2)
})

test('Sorcerer remains an antagonist after reviving someone with no other antagonist alive', () => {
  const sorcerer = {
    id: 'sorcerer',
    number: 1,
    role: 'sorcerer',
    isdead: false,
    nightDone: false,
    secretCodes: { REVIVE: { type: 'revive', targetNumber: 2 } }
  }
  const target = { id: 'target', number: 2, role: 'warga', isdead: true }
  const room = { room: 'test', category: 'werewolf', player: [sorcerer, target] }
  const rooms = { test: room }

  assert.equal(resolveSecretCodeAction('test', 'sorcerer', 'REVIVE', rooms).action, 'revive')
  assert.equal(room.sorcererFaction, 'antagonist')
  assert.equal(getWerewolfPlayerFaction(room, sorcerer), 'antagonist')
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

test('Warden armor absorbs one attack or Hunter shot, but not a vote', () => {
  const warden = { role: 'warden', armor: true }
  const voteRoom = {
    room: 'vote-test',
    player: [
      { id: 'warden', number: 1, role: 'warden', armor: true, isdead: false, vote: 2 },
      { id: 'other', number: 2, role: 'warga', isdead: false, vote: 0 }
    ]
  }
  assert.equal(voteKill('vote-test', { 'vote-test': voteRoom }), voteRoom.player[0])
  assert.equal(voteRoom.player[0].isdead, true)
  assert.equal(voteRoom.player[0].armor, true)

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

test('secret vote codes are private per player and resolve votes without revealing targets publicly', () => {
  const players = [
    { id: 'one', number: 1, role: 'warga', isdead: false, isvote: false, vote: 0 },
    { id: 'two', number: 2, role: 'mayor', isdead: false, isvote: false, vote: 0 },
    { id: 'three', number: 3, role: 'warga', isdead: false, isvote: false, vote: 0 },
    { id: 'four', number: 4, role: 'warga', isdead: false, isvote: false, vote: 0 }
  ]
  const room = {
    room: 'test',
    category: 'werewolf',
    time: 'voting',
    guardianVoteTarget: 4,
    player: players
  }
  const rooms = { test: room }
  const usedCodes = new Set()
  const oneCodes = generateVoteCodeMap(room, players[0], usedCodes)
  const twoCodes = generateVoteCodeMap(room, players[1], usedCodes)

  assert.equal(Object.values(oneCodes).some((choice) => choice.targetNumber === 4), true)
  assert.equal(Object.values(twoCodes).some((choice) => choice.targetNumber === 4), true)
  assert.equal(Object.keys(oneCodes).some((code) => Object.hasOwn(twoCodes, code)), false)

  const oneTargetCode = Object.keys(oneCodes).find((code) => oneCodes[code].targetNumber === 4)
  const voteResult = resolveSecretCodeAction('test', 'one', oneTargetCode, rooms, 'vote')
  assert.deepEqual(voteResult, { ok: true, action: 'vote', targetNumber: 4, voteBoost: 1 })
  assert.equal(players[3].vote, 1)
  assert.equal(players[3].voteCount, 1)
  assert.equal(players[0].isvote, true)

  const skipCode = Object.keys(twoCodes).find((code) => twoCodes[code].type === 'vote-skip')
  assert.deepEqual(resolveSecretCodeAction('test', 'two', skipCode, rooms, 'vote'), {
    ok: true,
    action: 'vote-skip'
  })
  assert.equal(players[1].isvote, true)
})

test('AI citizens receive protagonist roles and do not replace the required human player', () => {
  const players = [
    { id: 'human', number: 1, role: false, isdead: false },
    ...Array.from({ length: 4 }, (_, index) => ({
      id: `ai-${index}`,
      number: index + 2,
      role: false,
      isdead: false,
      isAiCitizen: true,
      displayName: `Warga ${index + 1}`
    }))
  ]
  const room = { room: 'test', category: 'werewolf', player: players, dead: [] }
  const rooms = { test: room }

  assert.equal(roleGenerator('test', rooms), true)
  assert.equal(players[0].role, 'werewolf')
  assert.equal(players.slice(1).every((player) =>
    ['warga', 'seer', 'guardian', 'hunter', 'mayor', 'warden'].includes(player.role)
  ), true)

  const aiOnlyRoom = {
    room: 'ai-only',
    category: 'werewolf',
    player: Array.from({ length: 5 }, (_, index) => ({
      id: `only-ai-${index}`,
      number: index + 1,
      isAiCitizen: true,
      role: false,
      isdead: false
    })),
    dead: []
  }
  assert.equal(roleGenerator('ai-only', { 'ai-only': aiOnlyRoom }), false)
})
