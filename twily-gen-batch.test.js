import test from 'node:test'
import assert from 'node:assert/strict'

import { parseTwilyBatchInput } from './lib/twilyGenData.js'

test('parseTwilyBatchInput can handle pipe-delimited names and a final generation', () => {
  assert.deepEqual(parseTwilyBatchInput(['Avelia|Nelchan|Elfaria', 'X']), {
    names: ['Avelia', 'Nelchan', 'Elfaria'],
    generation: 'X'
  })

  assert.deepEqual(parseTwilyBatchInput(['Avelia| Nelchan | Elfaria| Lucy', 'gen 1']), {
    names: ['Avelia', 'Nelchan', 'Elfaria', 'Lucy'],
    generation: 'I'
  })
})
