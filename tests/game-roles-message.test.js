import test from 'node:test'
import assert from 'node:assert/strict'
import { buildGameRolesHeaderMessage, sendGameRolesHeader } from '../lib/game-roles-message.js'

test('Game Roles list buttons expose every option without descriptions', async () => {
  let listButton
  class MockButtonV2 {
    constructor() {}
    setTitle() {}
    setSubtitle() {}
    setBody() {}
    setFooter() {}
    addRawButton(button) {
      listButton = button
    }
    build(jid) {
      assert.equal(jid, 'game@g.us')
      return { interactive: true }
    }
  }
  const rows = Array.from({ length: 15 }, (_, index) => ({
    title: `🔐 A${String(index).padStart(3, '0')}`,
    id: `.ww action game@g.us A${String(index).padStart(3, '0')}`
  }))

  const built = await buildGameRolesHeaderMessage(
    { ButtonV2: MockButtonV2 },
    'game@g.us',
    'Pilihan aksi dan keterangannya tetap ada di teks.',
    null,
    {
      list: { buttonText: '🔐', title: '🔐', rows }
    }
  )

  assert.deepEqual(built, { interactive: true })
  assert.equal(listButton.nativeFlowInfo.name, 'single_select')
  const list = JSON.parse(listButton.nativeFlowInfo.paramsJson)
  assert.deepEqual(list.sections[0].rows, rows)
  assert.ok(list.sections[0].rows.every((row) =>
    Object.keys(row).every((key) => ['title', 'id'].includes(key))
  ))
})

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
