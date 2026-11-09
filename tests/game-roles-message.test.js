import test from 'node:test'
import assert from 'node:assert/strict'
import { sendGameRolesHeader } from '../lib/game-roles-message.js'

test('Game Roles headers send directly through ButtonV2 and preserve quick reply buttons', async () => {
  const sent = { id: 'header-sent' }
  const buttons = []
  class MockButtonV2 {
    constructor() {}
    setTitle() {}
    setSubtitle() {}
    setBody() {}
    setFooter() {}
    setRawThumbnail() {}
    addButton(label, id) {
      buttons.push([label, id])
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
    buttons: [['🔐 A1B2', '.ww action game@g.us A1B2']]
  }

  const result = await sendGameRolesHeader(conn, 'game@g.us', 'Pilih kandidat', Buffer.from('thumbnail'), null, options)

  assert.equal(result, sent)
  assert.deepEqual(buttons, options.buttons)
})

test('Game Roles headers without buttons send text instead of an invalid ButtonV2 card', async () => {
  const sent = { id: 'morning-sent' }
  const message = {
    text: 'Fajar telah tiba',
    mentions: ['player@s.whatsapp.net']
  }
  const quoted = { quoted: { key: { id: 'quoted-message' } } }
  const conn = {
    ButtonV2() {
      throw new Error('ButtonV2 should not be used without buttons')
    },
    sendMessage(jid, content, options) {
      assert.equal(jid, 'game@g.us')
      assert.deepEqual(content, message)
      assert.deepEqual(options, quoted)
      return sent
    }
  }

  const result = await sendGameRolesHeader(
    conn,
    'game@g.us',
    message.text,
    Buffer.from('scene'),
    quoted.quoted,
    { mentions: message.mentions }
  )

  assert.equal(result, sent)
})

test('Game Roles never falls back to sending a phase image as a standalone photo', async () => {
  let sendMessageCalled = false
  const conn = {
    sendMessage() {
      sendMessageCalled = true
    }
  }

  await assert.rejects(
    sendGameRolesHeader(conn, 'game@g.us', 'Pagi tiba', Buffer.from('scene'), null),
    /ButtonV2 tidak tersedia/
  )
  assert.equal(sendMessageCalled, false)
})

test('Game Roles never falls back to a standalone photo when ButtonV2 sending fails', async () => {
  let sendMessageCalled = false
  const originalError = console.error
  console.error = () => {}
  class FailingButtonV2 {
    constructor() {}
    setTitle() {}
    setBody() {}
    setFooter() {}
    setRawThumbnail() {}
    async send() {
      throw new Error('header send failed')
    }
  }
  const conn = {
    ButtonV2: FailingButtonV2,
    sendMessage() {
      sendMessageCalled = true
    }
  }

  try {
    await assert.rejects(
      sendGameRolesHeader(conn, 'game@g.us', 'Pagi tiba', Buffer.from('scene'), null),
      /header send failed/
    )
  } finally {
    console.error = originalError
  }
  assert.equal(sendMessageCalled, false)
})
