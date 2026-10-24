import test from 'node:test'
import assert from 'node:assert/strict'
import { sendRpgButtons } from '../lib/rpgActionButtons.js'

function makeConn() {
  return {
    sends: [],
    async sendButtonV2(chat, options) {
      this.sends.push({ chat, options })
      return this.sends.at(-1)
    },
    async sendMessage(chat, content) {
      this.sends.push({ chat, content })
      return this.sends.at(-1)
    },
    async sendInteractive(chat, content) {
      this.sends.push({ chat, content })
      return this.sends.at(-1)
    }
  }
}

test('a single RPG action stays a regular button and never sends a thumbnail', async () => {
  const conn = makeConn()

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Pilih aksi.',
    title: 'Aksi tunggal',
    thumbnailUrl: 'https://example.invalid/location-thumbnail.jpg',
    buttons: [['🎯 Tangkap', '.pokemon catch abc']],
    preferV2: true
  })

  assert.equal(conn.sends.length, 1)
  assert.deepEqual(conn.sends[0].options.buttons, [['🎯 Tangkap', '.pokemon catch abc']])
  assert.equal(conn.sends[0].options.noLocationHeader, true)
  assert.equal('image' in conn.sends[0].options, false)
  assert.equal('buffer' in conn.sends[0].options, false)
})

test('one-row sections collapse to a regular action button', async () => {
  const conn = makeConn()

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Pilih aksi.',
    sections: [{
      title: 'Pilihan',
      rows: [{ title: '🎯 Tangkap Pokémon', id: '.pokemon catch abc' }]
    }]
  })

  assert.equal(conn.sends.length, 1)
  assert.deepEqual(conn.sends[0].options.buttons, [['🎯 Tangkap Pokémon', '.pokemon catch abc']])
})

test('two RPG actions stay as regular clickable buttons', async () => {
  const conn = makeConn()

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Pilih aksi.',
    buttons: [
      ['✅ Terima', '.pokemon accept'],
      ['↩️ Tolak', '.pokemon reject']
    ]
  })

  assert.equal(conn.sends.length, 1)
  assert.deepEqual(conn.sends[0].options.buttons, [
    ['✅ Terima', '.pokemon accept'],
    ['↩️ Tolak', '.pokemon reject']
  ])
  assert.equal(conn.sends[0].options.noLocationHeader, true)
})

test('more than two RPG actions use a scrollable list', async () => {
  const conn = makeConn()

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Pilih aksi.',
    buttons: [
      ['✅ Terima', '.pokemon accept'],
      ['↩️ Tolak', '.pokemon reject'],
      ['ℹ️ Detail', '.pokemon info']
    ],
    sendInteractive: async content => {
      conn.sends.push({ content })
      return content
    }
  })

  const list = conn.sends[0].content.interactiveMessage.nativeFlowMessage.buttons[0]
  assert.equal(list.name, 'single_select')
  const sections = JSON.parse(list.buttonParamsJson).sections
  assert.deepEqual(sections[0].rows.map(row => row.id), [
    '.pokemon accept',
    '.pokemon reject',
    '.pokemon info'
  ])
})

test('lists use the connection interactive sender without a location header', async () => {
  const conn = makeConn()

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Pilih aksi.',
    sections: [{
      title: 'Pilihan',
      rows: [
        { title: 'Pilih satu', id: '.rpg one' },
        { title: 'Pilih dua', id: '.rpg two' },
        { title: 'Pilih tiga', id: '.rpg three' }
      ]
    }]
  })

  const sent = conn.sends[0].content.interactiveMessage
  assert.equal('header' in sent, false)
  assert.equal(sent.nativeFlowMessage.buttons[0].name, 'single_select')
})

test('auction art is sent as media and not as a location thumbnail', async () => {
  const conn = makeConn()
  const auctionImage = 'https://example.invalid/auction.webp'

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Balai lelang dibuka.',
    image: auctionImage,
    buttons: [['🔨 Buka lelang', '.ah']],
    preferV2: true
  })

  assert.equal(conn.sends[0].options.image, auctionImage)
  assert.equal(conn.sends[0].options.noLocationHeader, true)
})
