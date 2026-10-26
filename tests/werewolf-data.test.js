import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ANTAGONIST_STORIES,
  GAME_CATEGORIES,
  HIDE_ACTIONS,
  HIDE_ANTAGONIST_STORIES,
  PROTAGONIST_WIN_STORIES,
  ROLE_DEATH_STORIES,
  getGameCategory,
  isAntagonistRole,
  normalizeGameCategory
} from '../lib/werewolfData.js'

test('game categories resolve aliases and alternative antagonists', () => {
  assert.equal(normalizeGameCategory('ww').id, 'werewolf')
  assert.equal(normalizeGameCategory('imposter').id, 'impostor')
  assert.equal(getGameCategory('unknown').id, 'werewolf')
  for (const category of Object.values(GAME_CATEGORIES)) {
    assert.equal(isAntagonistRole(category.id, category.antagonist), true)
    assert.equal(isAntagonistRole(category.id, 'sorcerer'), true)
    assert.equal(isAntagonistRole(category.id, 'seer'), false)
  }
})

test('editable action and attack narrative lists start with requested sizes', () => {
  assert.ok(HIDE_ACTIONS.length >= 10)
  assert.equal(ANTAGONIST_STORIES.length, 5)
  assert.equal(PROTAGONIST_WIN_STORIES.length, 5)
  assert.equal(HIDE_ANTAGONIST_STORIES.length, 5)
  assert.equal(ROLE_DEATH_STORIES.guardian.length, 5)
  assert.equal(ROLE_DEATH_STORIES.seer.length, 5)
  assert.ok(HIDE_ACTIONS.slice(0, 10).every((action) => action.length <= 25))
})
