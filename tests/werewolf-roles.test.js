import test from 'node:test'
import assert from 'node:assert/strict'
import {
  assignFixerContracts,
  absorbWardenAttack,
  autoAssignCustomRoles,
  buildRoleCodeMap,
  collapseZombieVampireInfections,
  formatFinalRoleRoster,
  formatWinnerTeamRoster,
  generateVoteCodeMap,
  getAntagonistCount,
  getWerewolfPlayerFaction,
  getWinner,
  getNightProgress,
  getVigilanteCount,
  pagii,
  roleAmount,
  roleGenerator,
  resolveSecretCodeAction,
  resolveNightActions,
  voteKill
} from '../lib/werewolf.js'
import {
  CUSTOM_ANTAGONIST_ROLES,
  MAYHEM_ATTACK_SUMMARY_STORIES,
  VIGILANTE_ATTACK_SUMMARY_STORIES,
  VIGILANTE_CAPTURE_SUMMARY_STORIES
} from '../lib/werewolfData.js'

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

test('Infected Cipher follows the infection faction instead of retaining neutral status', () => {
  const cipher = { id: 'cipher', number: 2, role: 'cipher', infectionType: 'zombie', isdead: false }
  const room = { category: 'zombie', player: [cipher] }

  assert.equal(getWerewolfPlayerFaction(room, cipher), 'antagonist')
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

  const runoffCodes = generateVoteCodeMap(room, players[0], new Set(), [3, 4])
  assert.deepEqual(
    new Set(Object.values(runoffCodes).map((choice) => choice.targetNumber)),
    new Set([3, 4])
  )
  assert.equal(Object.values(runoffCodes).some((choice) => choice.type === 'vote-skip'), false)
})

test('antagonist count scales with room size and additional antagonists can be AI players', () => {
  assert.deepEqual([5, 6, 7, 10, 11, 15].map(getAntagonistCount), [1, 1, 2, 2, 3, 3])
  for (const category of ['werewolf', 'mafia', 'killer', 'assassin', 'impostor', 'alien', 'parasite']) {
    for (const playerCount of [5, 6, 7, 10, 11, 15]) {
      const room = { room: `${category}-${playerCount}`, category, player: [] }
      const distribution = roleAmount(room.room, { [room.room]: room }, undefined, playerCount)
      const antagonistTotal = Object.entries(distribution)
        .filter(([role]) => role === category)
        .reduce((total, [, amount]) => total + amount, 0)
      assert.equal(antagonistTotal, getAntagonistCount(playerCount), `${category} with ${playerCount} players`)
    }
  }
  for (const category of ['zombie', 'vampire']) {
    for (const playerCount of [5, 6, 7, 10, 11, 15]) {
      const room = { room: `${category}-${playerCount}`, category, player: [] }
      const distribution = roleAmount(room.room, { [room.room]: room }, undefined, playerCount)
      assert.equal(distribution[category], Math.min(2, getAntagonistCount(playerCount)))
    }
  }
})

test('AI citizens receive their share of scaled antagonist roles in mixed rooms', () => {
  const players = [
    { id: 'human', number: 1, role: false, isdead: false },
    ...Array.from({ length: 9 }, (_, index) => ({
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
  assert.equal(players.filter((player) =>
    getWerewolfPlayerFaction(room, player) === 'antagonist'
  ).length, 2)
  assert.equal(players.every((player) => Boolean(player.role)), true)

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
  assert.equal(roleGenerator('ai-only', { 'ai-only': aiOnlyRoom }), true)
  assert.equal(aiOnlyRoom.player.every((player) => Boolean(player.role)), true)
  assert.equal(aiOnlyRoom.player.some((player) =>
    getWerewolfPlayerFaction(aiOnlyRoom, player) === 'antagonist'
  ), true)
  assert.equal(aiOnlyRoom.player.filter((player) =>
    getWerewolfPlayerFaction(aiOnlyRoom, player) === 'antagonist'
  ).length, 1)
})

test('AI-only Mayhem and Custom rooms can receive playable role assignments', () => {
  const mayhemRoom = {
    room: 'ai-only-mayhem',
    category: 'mayhem',
    player: Array.from({ length: 5 }, (_, index) => ({
      id: `mayhem-ai-${index}`,
      number: index + 1,
      role: false,
      isAiCitizen: true,
      isdead: false
    })),
    dead: []
  }
  assert.equal(roleGenerator(mayhemRoom.room, { [mayhemRoom.room]: mayhemRoom }), true)
  assert.equal(mayhemRoom.player.some((player) =>
    getWerewolfPlayerFaction(mayhemRoom, player) === 'antagonist'
  ), true)

  const customRoom = {
    room: 'ai-only-custom',
    category: 'custom',
    player: Array.from({ length: 5 }, (_, index) => ({
      id: `custom-ai-${index}`,
      number: index + 1,
      role: 'warga',
      isAiCitizen: true,
      isdead: false
    })),
    dead: []
  }
  const customRooms = { [customRoom.room]: customRoom }
  assert.equal(autoAssignCustomRoles(customRoom.room, customRooms), true)
  assert.equal(roleGenerator(customRoom.room, customRooms), true)
  assert.equal(customRoom.player.some((player) =>
    getWerewolfPlayerFaction(customRoom, player) === 'antagonist'
  ), true)
})

test('Custom auto-assignment scales remaining antagonists without replacing manual assignments', () => {
  const players = Array.from({ length: 10 }, (_, index) => ({
    id: `custom-mixed-${index}`,
    number: index + 1,
    role: index === 0 ? 'mafia' : 'warga',
    isAiCitizen: index > 0,
    isdead: false
  }))
  const room = {
    room: 'custom-scaled-auto',
    category: 'custom',
    player: players,
    customRoles: { [players[0].id]: 'mafia' },
    dead: []
  }
  const rooms = { [room.room]: room }

  assert.equal(autoAssignCustomRoles(room.room, rooms), true)
  assert.equal(players.filter((player) => CUSTOM_ANTAGONIST_ROLES.includes(player.role)).length, 2)
  assert.equal(players[0].role, 'mafia')
  assert.equal(new Set(players.filter((player) => CUSTOM_ANTAGONIST_ROLES.includes(player.role))
    .map((player) => player.role)).size, 1)
})

test('All-AI Custom rooms preserve manually assigned roles for added citizens', () => {
  const players = Array.from({ length: 5 }, (_, index) => ({
    id: `custom-warga-${index}`,
    number: index + 1,
    role: index === 0 ? 'mafia' : 'warga',
    isAiCitizen: true,
    isdead: false
  }))
  const room = {
    room: 'custom-ai-warga',
    category: 'custom',
    player: players,
    customRoles: Object.fromEntries(players.map((player, index) => [
      player.id,
      index === 0 ? 'mafia' : 'warga'
    ])),
    dead: []
  }
  const rooms = { [room.room]: room }

  assert.equal(autoAssignCustomRoles(room.room, rooms), true)
  assert.equal(roleGenerator(room.room, rooms), true)
  assert.deepEqual(players.slice(1).map((player) => player.role), ['warga', 'warga', 'warga', 'warga'])
})

test('Zombie and Vampire antagonists win only after infecting every other living player', () => {
  for (const category of ['zombie', 'vampire']) {
    const room = {
      room: `infection-victory-${category}`,
      category,
      voting: false,
      player: [
        { id: 'original', number: 1, role: category, isdead: false },
        { id: 'infected-1', number: 2, role: 'seer', infectionType: category, isdead: false },
        { id: 'infected-2', number: 3, role: 'warga', infectionType: category, isdead: false },
        { id: 'uninfected', number: 4, role: 'guardian', isdead: false }
      ],
      dead: []
    }
    const rooms = { [room.room]: room }

    assert.equal(getWinner(room.room, rooms).status, null)
    room.player[3].isdead = true
    assert.equal(getWinner(room.room, rooms).status, false)
  }
})

test('Zombie and Vampire rooms assign their own antagonist roles', () => {
  for (const category of ['zombie', 'vampire']) {
    const room = {
      room: `ai-only-${category}`,
      category,
      player: Array.from({ length: 5 }, (_, index) => ({
        id: `${category}-ai-${index}`,
        number: index + 1,
        role: false,
        isAiCitizen: true,
        isdead: false
      })),
      dead: []
    }

    assert.equal(roleGenerator(room.room, { [room.room]: room }), true)
    assert.equal(room.player.some((player) => player.role === category), true)
    assert.equal(room.player.some((player) =>
      getWerewolfPlayerFaction(room, player) === 'antagonist'
    ), true)
  }
})

test('Zombie and Vampire infection keeps targets alive, anonymous at dawn, and limits them to hiding', () => {
  for (const category of ['zombie', 'vampire']) {
    const room = {
      room: `infection-${category}`,
      category,
      day: 1,
      player: [
        { id: `${category}-original`, number: 1, role: category, isdead: false },
        { id: `${category}-target`, number: 2, role: 'mayor', displayName: 'SecretTarget', isdead: false },
        { id: `${category}-other`, number: 3, role: 'warga', displayName: 'Other', isdead: false }
      ],
      dead: [],
      guardian: [],
      nightActions: {}
    }
    const rooms = { [room.room]: room }
    const actorCodes = buildRoleCodeMap(room, room.player[0])
    const infectionCode = Object.keys(actorCodes).find((code) => actorCodes[code].targetNumber === 2)

    assert.equal(actorCodes[infectionCode].type, 'infect')
    assert.equal(resolveSecretCodeAction(room.room, room.player[0].id, infectionCode, rooms).action, 'infect')
    assert.equal(resolveNightActions(room.room, rooms), true)
    assert.equal(room.player[1].isdead, false)
    assert.equal(room.player[1].infectionType, category)
    assert.equal(getWerewolfPlayerFaction(room, room.player[1]), 'antagonist')
    assert.equal(room.infectionsTonight, 1)
    assert.equal(getWinner(room.room, rooms).status, false)

    const infectedCodes = buildRoleCodeMap(room, room.player[1])
    assert.ok(Object.values(infectedCodes).every((choice) => choice.type === 'dummy'))
    const voteCodes = generateVoteCodeMap(room, room.player[1])
    const voteCode = Object.keys(voteCodes).find((code) => voteCodes[code].targetNumber === 3)
    const voteResult = resolveSecretCodeAction(room.room, room.player[1].id, voteCode, rooms, 'vote')
    assert.equal(voteResult.action, 'vote')
    assert.equal(voteResult.voteBoost, 1)
    const morning = pagii(room)
    assert.doesNotMatch(morning, /SecretTarget/)
    assert.match(morning, new RegExp(category === 'zombie' ? 'Kota Mati' : 'Kastil Nosferatu'))
  }
})

test('Zombie and Vampire infected players collapse after every original antagonist is eliminated', () => {
  for (const category of ['zombie', 'vampire']) {
    const room = {
      room: `collapse-${category}`,
      category,
      voting: false,
      player: [
        { id: `${category}-original`, number: 1, role: category, isdead: true, infectionType: null },
        { id: `${category}-infected`, number: 2, role: 'seer', isdead: false, infectionType: category },
        { id: `${category}-citizen`, number: 3, role: 'warga', isdead: false }
      ],
      dead: [1]
    }

    assert.equal(collapseZombieVampireInfections(room), 1)
    assert.equal(room.player[1].isdead, true)
    assert.equal(room.player[1].lastDeathCause, 'infection-collapse')
    assert.equal(getWinner(room.room, { [room.room]: room }).status, true)
  }
})

test('Zombie and Vampire votes collapse infected players as soon as the last original antagonist is eliminated', () => {
  for (const category of ['zombie', 'vampire']) {
    const room = {
      room: `vote-collapse-${category}`,
      category,
      voting: false,
      player: [
        { id: 'original-1', number: 1, role: category, isdead: true, vote: 0 },
        { id: 'original-2', number: 2, role: category, isdead: false, vote: 1 },
        { id: 'infected', number: 3, role: 'seer', infectionType: category, isdead: false, vote: 0 },
        { id: 'citizen', number: 4, role: 'warga', isdead: false, vote: 0 }
      ],
      dead: [1]
    }

    assert.equal(voteKill(room.room, { [room.room]: room }), room.player[1])
    assert.equal(room.player[2].isdead, true)
    assert.equal(room.player[2].lastDeathCause, 'infection-collapse')
    assert.equal(getWinner(room.room, { [room.room]: room }).status, true)
  }
})

test('Zombie and Vampire infections collapse after the last original antagonist is killed by a night action', () => {
  for (const category of ['zombie', 'vampire']) {
    const room = {
      room: `action-collapse-${category}`,
      category,
      player: [
        { id: 'sorcerer', number: 1, role: 'sorcerer', isdead: false },
        { id: 'original', number: 2, role: category, isdead: false },
        { id: 'infected', number: 3, role: 'warga', infectionType: category, isdead: false },
        { id: 'citizen', number: 4, role: 'warga', isdead: false }
      ],
      dead: [],
      nightActions: {
        sorcerer: { type: 'poison', targetNumber: 2 }
      },
      poisonTarget: 2
    }

    assert.equal(resolveNightActions(room.room, { [room.room]: room }), true)
    assert.equal(room.player[2].isdead, true)
    assert.equal(room.player[2].lastDeathCause, 'infection-collapse')
    assert.equal(getWinner(room.room, { [room.room]: room }).status, true)
  }
})

test('Final role roster keeps original roles and shows only infection or death markers', () => {
  const zombieRoster = formatFinalRoleRoster([
    { id: 'clear', number: 1, role: 'warga', displayName: 'Sari', isAiCitizen: true, isdead: false },
    { id: 'infected-zombie', number: 2, role: 'seer', displayName: 'Raka', isAiCitizen: true, infectionType: 'zombie', isdead: false },
    { id: 'dead-infected-zombie', number: 3, role: 'mayor', displayName: 'Mira', isAiCitizen: true, infectionType: 'zombie', isdead: true }
  ], 'zombie')

  assert.match(zombieRoster, /> 1\. Sari — \*Warga 👱‍♂️\*/)
  assert.match(zombieRoster, /> 2\. Raka — \*Seer 👳\* 🧟‍♂️/)
  assert.match(zombieRoster, /> 3\. Mira — \*Mayor 👑\* 💀/)
  assert.match(zombieRoster, /> 🧟‍♂️ Tertular · 💀 Mati/)
  assert.doesNotMatch(zombieRoster, /⚪|🟢|🔴|Vampire|🧛|Hidup|Infected/)

  const capturedRoster = formatFinalRoleRoster([
    { id: 'captured', number: 1, role: 'mafia', displayName: 'Kia', isAiCitizen: true, isdead: true, lastDeathCause: 'capture' }
  ], 'vigilante')
  assert.match(capturedRoster, /> 1\. Kia — \*Mafia 🕴️\* ⛓️/)
  assert.match(capturedRoster, /⛓️ Ditangkap · 💀 Mati/)

  const flexibleRoster = formatFinalRoleRoster([
    { id: 'infected-zombie', number: 1, role: 'warga', displayName: 'Ayu', isAiCitizen: true, infectionType: 'zombie', isdead: false },
    { id: 'infected-vampire', number: 2, role: 'warga', displayName: 'Raka', isAiCitizen: true, infectionType: 'vampire', isdead: false }
  ], 'mayhem')
  assert.match(flexibleRoster, /> 1\. Ayu — \*Warga 👱‍♂️\* 🧟‍♂️/)
  assert.match(flexibleRoster, /> 2\. Raka — \*Warga 👱‍♂️\* 🧛‍♂️/)
  assert.match(flexibleRoster, /🧟‍♂️ 🧛‍♂️ Tertular/)

  const vampireRoster = formatFinalRoleRoster([
    { id: 'infected-vampire', number: 1, role: 'mayor', displayName: 'Mira', isAiCitizen: true, infectionType: 'vampire', isdead: false }
  ], 'vampire')
  assert.match(vampireRoster, /> 1\. Mira — \*Mayor 👑\* 🧛‍♂️/)
  assert.match(vampireRoster, /> 🧛‍♂️ Tertular · 💀 Mati/)
  assert.doesNotMatch(vampireRoster, /Zombie|🧟|Hidup|Infected/)
})

test('Winner teams are grouped by role and infection source', () => {
  const roster = [
    { id: 'alien-1', number: 1, role: 'alien', displayName: 'Eza', isAiCitizen: true, isdead: false },
    { id: 'zombie-1', number: 2, role: 'warga', displayName: 'Vania', isAiCitizen: true, infectionType: 'zombie', isdead: false },
    { id: 'alien-2', number: 3, role: 'alien', displayName: 'Zahra', isAiCitizen: true, isdead: false }
  ]

  const output = formatWinnerTeamRoster(roster, 'mayhem', 'antagonist')
  assert.match(output, /\*Role\* : Alien 👽\n> Eza, Zahra/)
  assert.match(output, /\*Role\* : Zombie 🧟\n> Vania/)
})

test('Vigilante mode assigns more Vigilante protagonists while all others are antagonists', () => {
  const players = [
    { id: 'human', number: 1, role: false, isdead: false },
    ...Array.from({ length: 4 }, (_, index) => ({
      id: `ai-${index}`,
      number: index + 2,
      role: false,
      isdead: false,
      isAiCitizen: true
    }))
  ]
  const room = { room: 'vigilante-test', category: 'vigilante', player: players, dead: [] }
  const rooms = { [room.room]: room }

  assert.equal(roleGenerator(room.room, rooms), true)
  assert.equal(players.filter((player) => player.role === 'vigilante').length, 2)
  assert.equal(players.filter((player) =>
    getWerewolfPlayerFaction(room, player) === 'antagonist'
  ).length, 3)
  assert.equal(players.filter((player) =>
    getWerewolfPlayerFaction(room, player) === 'protagonist'
  ).length, 2)
  assert.equal(roleAmount(room.room, rooms, undefined, players.length).vigilante, 2)
})

test('Vigilante count scales with room size and all Vigilantes capture instead of attack', () => {
  assert.deepEqual([5, 7, 8, 10, 13, 15].map(getVigilanteCount), [2, 3, 3, 3, 4, 4])
  for (const playerCount of [8, 13]) {
    const room = {
      room: `vigilante-count-${playerCount}`,
      category: 'vigilante',
      player: Array.from({ length: playerCount }, (_, index) => ({
        id: `participant-${index}`,
        number: index + 1,
        isAiCitizen: index > 0,
        isdead: false
      }))
    }
    const roles = roleAmount(room.room, { [room.room]: room }, undefined, playerCount)
    assert.equal(roles.vigilante, getVigilanteCount(playerCount))
    assert.equal(
      Object.entries(roles)
        .filter(([role]) => CUSTOM_ANTAGONIST_ROLES.includes(role))
        .reduce((total, [, amount]) => total + amount, 0),
        playerCount - getVigilanteCount(playerCount)
    )
  }

  const scaledRoom = {
    room: 'vigilante-scaled-assignment',
    category: 'vigilante',
    player: Array.from({ length: 8 }, (_, index) => ({
      id: `scaled-${index}`,
      number: index + 1,
      role: false,
      isdead: false,
      isAiCitizen: index > 0
    })),
    dead: []
  }
  assert.equal(roleGenerator(scaledRoom.room, { [scaledRoom.room]: scaledRoom }), true)
  assert.equal(scaledRoom.player.filter((player) => player.role === 'vigilante').length, 3)

  const room = {
    room: 'capture-test',
    category: 'vigilante',
    player: [
      { id: 'vigilante', number: 1, role: 'vigilante', isdead: false },
      { id: 'antagonist', number: 2, role: 'mafia', isdead: false, effect: ['guardian'] }
    ],
    dead: [],
    guardian: [],
    nightActions: {}
  }
  const rooms = { [room.room]: room }
  const codes = buildRoleCodeMap(room, room.player[0])
  const captureCode = Object.keys(codes).find((code) => codes[code].targetNumber === 2)

  assert.equal(codes[captureCode].type, 'capture')
  assert.equal(resolveSecretCodeAction(room.room, 'vigilante', captureCode, rooms).action, 'capture')
  assert.equal(resolveNightActions(room.room, rooms), true)
  assert.equal(room.player[1].isdead, true)
  assert.equal(room.player[1].lastDeathCause, 'capture')
  assert.equal(room.activityLog[0].action, 'capture')
})

test('Vigilante dawn uses one story and a clean victim list for all deaths', () => {
  const data = {
    category: 'vigilante',
    day: 2,
    guardian: [],
    player: [
      { id: 'vigilante', number: 1, role: 'vigilante', displayName: 'Avelia', isAiCitizen: true },
      { id: 'captured', number: 2, role: 'mafia', displayName: 'Mika', isAiCitizen: true, lastDeathCause: 'capture', lastDeathActorId: 'vigilante' },
      { id: 'attacker', number: 3, role: 'killer', displayName: 'Rin', isAiCitizen: true },
      { id: 'victim', number: 4, role: 'assassin', displayName: 'Kia', isAiCitizen: true, lastDeathCause: 'werewolf', lastDeathActorId: 'attacker' },
      { id: 'attacker2', number: 5, role: 'alien', displayName: 'Zed', isAiCitizen: true },
      { id: 'victim2', number: 6, role: 'warga', displayName: 'Mona', isAiCitizen: true, lastDeathCause: 'werewolf', lastDeathActorId: 'attacker2' }
    ],
    dead: [2, 4, 6]
  }

  const morning = pagii(data)
  assert.equal((morning.match(/━━━━━━━━━━━━━━/g) || []).length, 3)
  assert.equal((morning.match(/> ↳/g) || []).length, 3)
  assert.match(morning, /Antagonis yang tertangkap/)
  assert.match(morning, /↳ Mika — \*Mafia 🕴️\*/)
  assert.match(morning, /Korban/)
  assert.match(morning, /↳ Kia — \*Assassin 🥷\*/)
  assert.match(morning, /Vigilante.*1 player/)
  assert.match(morning, /(?:2 player.*Killer, Alien|Killer, Alien.*2 player)/)
  assert.doesNotMatch(morning, /Vigilante 🎯|Killer 🔪|Alien 👽/)
  assert.doesNotMatch(morning, /Avelia|Rin|Zed/)
  assert.doesNotMatch(morning, /\{(?:captors|targets|attackers|victims|location)\}/)
  assert.equal(VIGILANTE_CAPTURE_SUMMARY_STORIES.length, 5)
  assert.equal(VIGILANTE_ATTACK_SUMMARY_STORIES.length, 5)
})

test('Mayhem dawn uses one story and lists the victim while identifying the attacker by role', () => {
  const morning = pagii({
    category: 'mayhem',
    day: 1,
    guardian: [],
    player: [
      { id: 'attacker', number: 1, role: 'killer', displayName: 'Rin', isAiCitizen: true },
      { id: 'victim', number: 2, role: 'warga', displayName: 'Kia', isAiCitizen: true, lastDeathCause: 'werewolf', lastDeathActorId: 'attacker' }
    ],
    dead: [2]
  })

  assert.equal((morning.match(/━━━━━━━━━━━━━━/g) || []).length, 2)
  assert.equal((morning.match(/> ↳/g) || []).length, 1)
  assert.match(morning, /Killer.*1 player/)
  assert.equal(MAYHEM_ATTACK_SUMMARY_STORIES.length, 5)
  assert.match(morning, /Kia/)
  assert.doesNotMatch(morning, /Rin/)
})

test('regular game dawn separates each death story and shows the victim role', () => {
  const morning = pagii({
    category: 'werewolf',
    day: 3,
    guardian: [],
    player: [
      { id: 'mika', number: 1, role: 'warga', displayName: 'Mika', isAiCitizen: true },
      { id: 'raka', number: 2, role: 'seer', displayName: 'Raka', isAiCitizen: true }
    ],
    dead: [1, 2]
  })

  assert.equal((morning.match(/━━━━━━━━━━━━━━/g) || []).length, 3)
  assert.equal((morning.match(/> ↳/g) || []).length, 2)
  assert.match(morning, /↳ Mika — \*Warga 👱‍♂️\*/)
  assert.match(morning, /↳ Raka — \*Seer 👳\*/)
  assert.doesNotMatch(morning, /\d+ player/)
})

test('dawn without deaths reports protected players in a separate section', () => {
  const morning = pagii({
    category: 'mafia',
    day: 1,
    guardian: [2],
    player: [
      { id: 'mafia', number: 1, role: 'mafia', displayName: 'Mika', isAiCitizen: true },
      { id: 'guarded', number: 2, role: 'warga', displayName: 'Raka', isAiCitizen: true }
    ],
    dead: []
  })

  assert.match(morning, /Guardian melindungi Raka/)
  assert.match(morning, /90 detik/)
  assert.doesNotMatch(morning, /tidak ada korban malam ini/)
})

test('Mayhem mode keeps protagonists ahead at setup and resolves each antagonist attack independently', () => {
  const players = Array.from({ length: 5 }, (_, index) => ({
    id: `player-${index}`,
    number: index + 1,
    role: false,
    isdead: false,
    isAiCitizen: index > 0
  }))
  const room = { room: 'mayhem-setup', category: 'mayhem', player: players, dead: [] }
  const rooms = { [room.room]: room }

  assert.equal(roleGenerator(room.room, rooms), true)
  const mayhemDistribution = roleAmount(room.room, rooms, undefined, players.length)
  assert.equal(
    Object.entries(mayhemDistribution)
      .filter(([role]) => CUSTOM_ANTAGONIST_ROLES.includes(role))
      .reduce((total, [, amount]) => total + amount, 0),
    getAntagonistCount(players.length)
  )
  assert.equal(Object.entries(mayhemDistribution)
    .filter(([role]) => role !== 'warga' && !CUSTOM_ANTAGONIST_ROLES.includes(role))
    .every(([, amount]) => amount === 1), true)
  const antagonists = players.filter((player) =>
    getWerewolfPlayerFaction(room, player) === 'antagonist'
  )
  const protagonists = players.filter((player) =>
    getWerewolfPlayerFaction(room, player) === 'protagonist'
  )
  assert.ok(antagonists.length > 0)
  assert.ok(protagonists.length > antagonists.length)

  const mayhemAi = {
    id: 'ai-antagonist',
    number: 6,
    role: 'mafia',
    isAiCitizen: true,
    isdead: false
  }
  const mayhemAiTarget = { id: 'target', number: 7, role: 'warga', isdead: false }
  const mayhemAiRoom = {
    room: 'mayhem-ai-skip',
    category: 'mayhem',
    player: [mayhemAi, mayhemAiTarget],
    dead: [],
    nightActions: {}
  }
  const aiCodes = buildRoleCodeMap(mayhemAiRoom, mayhemAi)
  assert.deepEqual(Object.values(aiCodes), [{ type: 'skip', label: 'Lewati Malam' }])
  const aiSkipCode = Object.keys(aiCodes)[0]
  assert.equal(resolveSecretCodeAction(mayhemAiRoom.room, mayhemAi.id, aiSkipCode, {
    [mayhemAiRoom.room]: mayhemAiRoom
  }).action, 'skip')
  assert.equal(resolveNightActions(mayhemAiRoom.room, { [mayhemAiRoom.room]: mayhemAiRoom }), true)
  assert.equal(mayhemAiTarget.isdead, false)
  assert.equal(mayhemAiRoom.activityLog.some((entry) => entry.action === 'kill'), false)

  const attackRoom = {
    room: 'mayhem-attacks',
    category: 'mayhem',
    player: [
      { id: 'wolf', number: 1, role: 'werewolf', isdead: false },
      { id: 'mafia', number: 2, role: 'mafia', isdead: false },
      { id: 'villager', number: 3, role: 'warga', isdead: false }
    ],
    dead: [],
    nightActions: {
      wolf: { type: 'kill', targetNumber: 2 },
      mafia: { type: 'kill', targetNumber: 3 },
      villager: { type: 'skip' }
    }
  }
  const attackRooms = { [attackRoom.room]: attackRoom }

  assert.equal(resolveNightActions(attackRoom.room, attackRooms), true)
  assert.equal(attackRoom.player[1].isdead, true)
  assert.equal(attackRoom.player[2].isdead, true)
  assert.equal(attackRoom.activityLog.filter((entry) => entry.action === 'kill').length, 2)
  assert.equal(attackRoom.activityLog.some((entry) => entry.action === 'skip'), false)
})

test('Mayhem antagonists can target one another while standard factions cannot', () => {
  const mayhem = {
    category: 'mayhem',
    player: [
      { id: 'wolf', number: 1, role: 'werewolf', isdead: false },
      { id: 'mafia', number: 2, role: 'mafia', isdead: false },
      { id: 'villager', number: 3, role: 'warga', isdead: false }
    ]
  }
  const mayhemCodes = Object.values(buildRoleCodeMap(mayhem, mayhem.player[0]))
    .filter((choice) => choice.type === 'kill')
  assert.deepEqual(new Set(mayhemCodes.map((choice) => choice.targetNumber)), new Set([2, 3]))

  const werewolf = {
    category: 'werewolf',
    player: [
      { id: 'wolf', number: 1, role: 'werewolf', isdead: false },
      { id: 'other-wolf', number: 2, role: 'werewolf', isdead: false },
      { id: 'villager', number: 3, role: 'warga', isdead: false }
    ]
  }
  const werewolfCodes = Object.values(buildRoleCodeMap(werewolf, werewolf.player[0]))
    .filter((choice) => choice.type === 'kill')
  assert.deepEqual(werewolfCodes.map((choice) => choice.targetNumber), [3])

  const mayhemVigilante = {
    category: 'mayhem',
    player: [
      { id: 'vigilante', number: 1, role: 'vigilante', isdead: false },
      { id: 'antagonist', number: 2, role: 'mafia', isdead: false },
      { id: 'protagonist', number: 3, role: 'warga', isdead: false }
    ]
  }
  const vigilanteCodes = Object.values(buildRoleCodeMap(mayhemVigilante, mayhemVigilante.player[0]))
    .filter((choice) => choice.type === 'kill')
  assert.equal(vigilanteCodes.length, 0)
})

test('Vigilante wins after eliminating all antagonists and loses if eliminated first', () => {
  const vigilante = { id: 'vigilante', number: 1, role: 'vigilante', isdead: false }
  const antagonist = { id: 'antagonist', number: 2, role: 'mafia', isdead: false }
  const room = {
    room: 'vigilante-winner',
    category: 'vigilante',
    player: [vigilante, antagonist],
    voting: false
  }
  const rooms = { [room.room]: room }

  assert.equal(getWinner(room.room, rooms).status, null)
  antagonist.isdead = true
  vigilante.isdead = true
  assert.equal(getWinner(room.room, rooms).status, true)

  antagonist.isdead = false
  assert.equal(getWinner(room.room, rooms).status, false)
})
