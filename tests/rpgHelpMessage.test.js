import test from 'node:test'
import assert from 'node:assert/strict'
import { getRpgHelpButtons, isRpgHelpRequest } from '../lib/rpgHelpMessage.js'

test('recognizes guide and command subcommands, including the RPG guide directory', () => {
  assert.equal(isRpgHelpRequest({ text: '.casino guide' }), true)
  assert.equal(isRpgHelpRequest({ text: '.guild command' }), true)
  assert.equal(isRpgHelpRequest({ text: '.guide pet' }), true)
  assert.equal(isRpgHelpRequest({ text: 'please read this guide' }), false)
  assert.equal(isRpgHelpRequest({ text: '.casino play' }), false)
})

test('extracts unique command buttons from help text and respects the limit', () => {
  assert.deepEqual(
    getRpgHelpButtons('Use *.casino games*, then *.casino guide*. Example: .casino <game> 10.', 2),
    [
      ['.casino games', '.casino games'],
      ['.casino guide', '.casino guide']
    ]
  )
})
