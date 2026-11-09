import test from 'node:test'
import assert from 'node:assert/strict'
import { sendGameRolesHeader } from '../lib/game-roles-message.js'

test('Game Roles headers send directly through ButtonV2 and preserve list choices', async () => {
  const sent = { id: 'header-sent' }
  const rawButtons = []
  class MockButtonV2 {
    constructor() {}
    setTitle() {}
    setSubtitle() {}
    setBody() {}
    setFooter() {}
    addRawButton(button) {
      rawButtons.push(button)
    }
    async send(jid) {
      assert.equal(jid, 'game@g.us')
      return sent
    }
  }
  const conn = {
    ButtonV2: MockButtonV2,
    sendButtonV2() {
      throw new Error('Wrapper should not be used')
    },
    sendMessage() {
      throw new Error('Text fallback should not be used')
    }
  }
  const options = {
    listButton: {
      id: 'vote',
      label: 'Pilih Vote',
      title: 'PILIH TARGET',
      sections: [{
        title: 'Kandidat',
        rows: [{ title: 'Pemain 1', description: 'Kode A1', id: '.ww A1' }]
      }]
    }
  }

  const result = await sendGameRolesHeader(conn, 'game@g.us', 'Pilih kandidat', null, null, options)

  assert.equal(result, sent)
  assert.equal(rawButtons.length, 1)
  assert.equal(rawButtons[0].nativeFlowInfo.name, 'single_select')
  assert.deepEqual(JSON.parse(rawButtons[0].nativeFlowInfo.paramsJson).sections[0].rows, options.listButton.sections[0].rows)
})
