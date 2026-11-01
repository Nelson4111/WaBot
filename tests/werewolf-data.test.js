import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ANTAGONIST_STORIES,
  CUSTOM_ANTAGONIST_ROLES,
  GAME_CATEGORIES,
  HIDE_ACTIONS,
  HIDE_ANTAGONIST_STORIES,
  PROTAGONIST_WIN_STORIES,
  ROLE_DATA,
  ROLE_DEATH_STORIES,
  WARGA_AI_MESSAGES,
  getGameCategory,
  getRoleFaction,
  getRandomHideActions,
  getSorcererFaction,
  isAntagonistRole,
  isNeutralRole,
  isValidCipherMessage,
  normalizeGameCategory,
  validateCustomRoles
} from '../lib/werewolfData.js'

test('game categories resolve aliases and alternative antagonists', () => {
  assert.equal(normalizeGameCategory('ww').id, 'werewolf')
  assert.equal(normalizeGameCategory('imposter').id, 'impostor')
  assert.equal(normalizeGameCategory('alien').id, 'alien')
  assert.equal(normalizeGameCategory('parasite').id, 'parasite')
  assert.equal(normalizeGameCategory('vigilante').id, 'vigilante')
  assert.equal(normalizeGameCategory('mayhem').id, 'mayhem')
  assert.notEqual(normalizeGameCategory('vigilante').antagonist, 'vigilante')
  assert.equal(normalizeGameCategory('custom').id, 'custom')
  assert.equal(isAntagonistRole('parasite', 'parasite'), true)
  assert.equal(isAntagonistRole('vigilante', 'vigilante'), false)
  assert.equal(isAntagonistRole('vigilante', 'parasite'), true)
  assert.equal(isAntagonistRole('mayhem', 'mafia'), true)
  assert.equal(getGameCategory('unknown').id, 'werewolf')
  for (const category of Object.values(GAME_CATEGORIES)) {
    if (!['custom', 'mayhem', 'vigilante'].includes(category.id)) {
      assert.equal(isAntagonistRole(category.id, category.antagonist), true)
    }
    assert.equal(isAntagonistRole(category.id, 'sorcerer'), false)
    assert.equal(isAntagonistRole(category.id, 'seer'), false)
    assert.ok(category.description.length > 0)
  }
  assert.equal(new Set(Object.values(GAME_CATEGORIES).map((category) => category.location)).size, Object.keys(GAME_CATEGORIES).length)
  for (const role of ['werewolf', 'mafia', 'killer', 'assassin', 'impostor', 'alien', 'parasite']) {
    assert.equal(isAntagonistRole('custom', role), true)
  }
  assert.deepEqual(CUSTOM_ANTAGONIST_ROLES.includes('parasite'), true)
})

test('sorcerer faction follows potion choice but stays neutral without another antagonist', () => {
  assert.equal(getSorcererFaction('poison', true), 'antagonist')
  assert.equal(getSorcererFaction('revive', true), 'protagonist')
  assert.equal(getSorcererFaction('skip', true), 'neutral')
  assert.equal(getSorcererFaction('poison', false), 'neutral')
  assert.equal(getSorcererFaction('revive', false), 'antagonist')
})

test('Warden and Cipher roles are available with their intended protections and cipher rules', () => {
  assert.equal(ROLE_DATA.warden.title, 'Warden')
  assert.equal(ROLE_DATA.blacksmith, undefined)
  assert.equal(ROLE_DATA.cipher.title, 'Cipher')
  assert.equal(ROLE_DATA.parasite.title, 'Parasite')
  assert.equal(ROLE_DATA.fixer.title, 'Fixer')
  assert.equal(isNeutralRole('cipher'), true)
  assert.equal(isNeutralRole('jester'), true)
  assert.equal(isNeutralRole('fixer'), true)
  assert.equal(ROLE_DATA.vigilante.title, 'Vigilante')
  assert.equal(ROLE_DATA.ghost.title, 'Ghost')
  assert.equal(isValidCipherMessage('H41'), true)
  assert.equal(isValidCipherMessage('H'), false)
  assert.equal(isValidCipherMessage('Hai'), false)
  assert.equal(isValidCipherMessage('H4i'), false)
  assert.equal(validateCustomRoles(['werewolf', 'warden', 'cipher', 'warga']).valid, true)
})

test('every role separates character flavor from its in-game effect', () => {
  for (const [role, data] of Object.entries(ROLE_DATA)) {
    assert.ok(data.description.length > 30, `${role} should explain the character`)
    assert.ok(data.effect.length > 20, `${role} should explain its in-game effect`)
  }
  assert.match(ROLE_DATA.cipher.effect, /A, I, E, O, B, L, S, Q, atau G/)
  assert.match(ROLE_DATA.warden.effect, /tidak melindungi dari voting/)
})

test('all roles map to one of the antagonist, protagonist, or neutral lists', () => {
  const factions = Object.fromEntries(
    Object.keys(ROLE_DATA).map((role) => [role, getRoleFaction(role)])
  )

  assert.deepEqual(new Set(Object.values(factions)), new Set(['antagonist', 'protagonist', 'neutral']))
  assert.deepEqual(
    Object.keys(factions).filter((role) => factions[role] === 'antagonist').sort(),
    [...CUSTOM_ANTAGONIST_ROLES].sort()
  )
  assert.deepEqual(
    Object.keys(factions).filter((role) => factions[role] === 'neutral').sort(),
    ['cipher', 'fixer', 'jester', 'sorcerer']
  )
  assert.equal(factions.vigilante, 'protagonist')
  assert.equal(factions.ghost, 'protagonist')
})

test('editable action and attack narrative lists start with requested sizes', () => {
  assert.ok(HIDE_ACTIONS.length >= 10)
  assert.ok(ANTAGONIST_STORIES.length >= 5)
  assert.ok(PROTAGONIST_WIN_STORIES.length >= 5)
  assert.ok(HIDE_ANTAGONIST_STORIES.length >= 5)
  assert.ok(ROLE_DEATH_STORIES.guardian.length >= 5)
  assert.ok(ROLE_DEATH_STORIES.seer.length >= 5)
  assert.ok(HIDE_ACTIONS.slice(0, 10).every((action) => action.length <= 25))
})

test('AI citizen conversation includes suspicion messages with a dynamic target', () => {
  assert.equal(WARGA_AI_MESSAGES.length, 10)
  assert.equal(WARGA_AI_MESSAGES.filter((message) => message.includes('{target}')).length, 5)
})

test('hide action choices are capped at five and exclude previously used actions', () => {
  const firstChoices = getRandomHideActions()
  assert.equal(firstChoices.actions.length, 5)
  assert.equal(new Set(firstChoices.actions).size, 5)
  assert.equal(firstChoices.reset, false)

  const remainingActions = HIDE_ACTIONS.slice(0, 3)
  const nextChoices = getRandomHideActions(HIDE_ACTIONS.filter((action) => !remainingActions.includes(action)))
  assert.deepEqual(new Set(nextChoices.actions), new Set(remainingActions))
  assert.equal(nextChoices.reset, false)

  const freshCycle = getRandomHideActions(HIDE_ACTIONS)
  assert.equal(freshCycle.actions.length, 5)
  assert.equal(freshCycle.reset, true)
})

test('custom roles allow only one main antagonist type and unique special roles', () => {
  assert.equal(validateCustomRoles(['mafia', 'mafia', 'warga', 'warga', 'seer']).valid, true)
  assert.equal(validateCustomRoles(['werewolf', 'mafia', 'warga']).reason, 'multiple-antagonists')
  assert.equal(validateCustomRoles(['parasite', 'werewolf', 'fixer']).reason, 'multiple-antagonists')
  assert.equal(validateCustomRoles(['alien', 'seer', 'seer']).reason, 'duplicate-role')
  assert.equal(validateCustomRoles(['warga', 'seer'], { requireAntagonist: true }).reason, 'missing-antagonist')
  assert.equal(validateCustomRoles(['mafia', 'sorcerer', 'jester', 'cipher'], { requireAntagonist: true }).valid, true)
  assert.equal(validateCustomRoles(['parasite', 'fixer', 'warga'], { requireAntagonist: true }).valid, true)
  assert.equal(validateCustomRoles(['parasite', 'fixer', 'fixer']).reason, 'duplicate-role')
})
