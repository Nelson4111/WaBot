import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ANTAGONIST_STORIES,
  GAME_CATEGORIES,
  HIDE_ACTIONS,
  HIDE_ANTAGONIST_STORIES,
  PROTAGONIST_WIN_STORIES,
  ROLE_DATA,
  ROLE_DEATH_STORIES,
  getGameCategory,
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
  assert.equal(normalizeGameCategory('custom').id, 'custom')
  assert.equal(getGameCategory('unknown').id, 'werewolf')
  for (const category of Object.values(GAME_CATEGORIES)) {
    if (category.id !== 'custom') {
      assert.equal(isAntagonistRole(category.id, category.antagonist), true)
    }
    assert.equal(isAntagonistRole(category.id, 'sorcerer'), false)
    assert.equal(isAntagonistRole(category.id, 'seer'), false)
    assert.ok(category.description.length > 0)
  }
  for (const role of ['werewolf', 'mafia', 'killer', 'assassin', 'impostor', 'alien']) {
    assert.equal(isAntagonistRole('custom', role), true)
  }
})

test('sorcerer faction follows potion choice but stays neutral without another antagonist', () => {
  assert.equal(getSorcererFaction('poison', true), 'antagonist')
  assert.equal(getSorcererFaction('revive', true), 'protagonist')
  assert.equal(getSorcererFaction('skip', true), 'neutral')
  assert.equal(getSorcererFaction('poison', false), 'neutral')
  assert.equal(getSorcererFaction('revive', false), 'neutral')
})

test('Warden and Cipher roles are available with their intended protections and cipher rules', () => {
  assert.equal(ROLE_DATA.warden.title, 'Warden')
  assert.equal(ROLE_DATA.blacksmith, undefined)
  assert.equal(ROLE_DATA.cipher.title, 'Cipher')
  assert.equal(isNeutralRole('cipher'), true)
  assert.equal(isNeutralRole('jester'), true)
  assert.equal(isValidCipherMessage('H41'), true)
  assert.equal(isValidCipherMessage('H'), false)
  assert.equal(isValidCipherMessage('Hai'), false)
  assert.equal(isValidCipherMessage('H4i'), false)
  assert.equal(validateCustomRoles(['werewolf', 'warden', 'cipher', 'warga']).valid, true)
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
  assert.equal(validateCustomRoles(['alien', 'seer', 'seer']).reason, 'duplicate-role')
  assert.equal(validateCustomRoles(['warga', 'seer'], { requireAntagonist: true }).reason, 'missing-antagonist')
  assert.equal(validateCustomRoles(['mafia', 'sorcerer', 'jester', 'cipher'], { requireAntagonist: true }).valid, true)
})
