import test from 'node:test'
import assert from 'node:assert/strict'
import { sendRpgButtons, sendRpgQuickButton } from '../lib/rpgActionButtons.js'

function makeConn() {
  return {
    sends: [],
    async sendButtonV2() {
      throw new Error('RPG buttons must not use ButtonV2')
    },
    async sendButton() {
      throw new Error('RPG buttons must not use the legacy button sender')
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

test('a single RPG action uses a Native Flow quick reply without a location header', async () => {
  const conn = makeConn()

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Pilih aksi.',
    title: 'Aksi tunggal',
    buttons: [['🎯 Tangkap', '.pokemon catch abc']],
    preferV2: true
  })

  assert.equal(conn.sends.length, 1)
  const interactive = conn.sends[0].content.interactiveMessage
  assert.equal('header' in interactive, false)
  const button = interactive.nativeFlowMessage.buttons[0]
  assert.equal(button.name, 'quick_reply')
  assert.deepEqual(JSON.parse(button.buttonParamsJson), {
    display_text: '🎯 Tangkap',
    id: '.pokemon catch abc'
  })
})

test('image buffers are sent with the fallback action caption when Native Flow is unavailable', async () => {
  const conn = {
    sends: [],
    async sendMessage(chat, content, options) {
      this.sends.push({ chat, content, options })
      return this.sends.at(-1)
    }
  }
  const image = Buffer.from('fishing card')

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Hasil memancing.',
    buffer: image,
    buttons: [['🐠 Buka Aquarium', '.aquarium']],
    quoted: { key: 'quoted-message' },
    reply: async () => {
      throw new Error('image fallback must send the media message')
    }
  })

  assert.equal(conn.sends.length, 1)
  assert.deepEqual(conn.sends[0].content.image, image)
  assert.match(conn.sends[0].content.caption, /Hasil memancing\./)
  assert.match(conn.sends[0].content.caption, /\.aquarium/)
  assert.deepEqual(conn.sends[0].options, { quoted: { key: 'quoted-message' } })
})

test('thumbnail URLs are sent as media when Native Flow is unavailable', async () => {
  const conn = {
    sends: [],
    async sendMessage(chat, content) {
      this.sends.push({ chat, content })
      return this.sends.at(-1)
    }
  }

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Hasil mining.',
    thumbnailUrl: 'https://example.invalid/mining.jpg',
    buttons: [['🎒 Buka Tas', '.bag']]
  })

  assert.deepEqual(conn.sends[0].content.image, { url: 'https://example.invalid/mining.jpg' })
  assert.match(conn.sends[0].content.caption, /Hasil mining\./)
})

test('quick action helpers use Native Flow instead of ButtonV2', async () => {
  const conn = makeConn()
  const m = { chat: 'test@g.us', reply: async text => text }

  await sendRpgQuickButton(conn, m, {
    text: 'Hasil permainan.',
    title: 'Hasil',
    buttonText: 'Main lagi',
    command: '.casino retry',
    noThumbnail: true
  })

  assert.equal(conn.sends.length, 1)
  const button = conn.sends[0].content.interactiveMessage.nativeFlowMessage.buttons[0]
  assert.equal(button.name, 'quick_reply')
  assert.deepEqual(JSON.parse(button.buttonParamsJson), {
    display_text: 'Main lagi',
    id: '.casino retry'
  })
})

test('button failures fall back to text instead of the legacy location-header button sender', async () => {
  const sentMessages = []
  let legacyButtonCalls = 0
  const conn = {
    async sendButton() {
      legacyButtonCalls++
      throw new Error('legacy sender should not be used')
    },
    async sendMessage(chat, content) {
      sentMessages.push({ chat, content })
      return sentMessages.at(-1)
    }
  }

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Hasil permainan.',
    buttons: [['🎲 Main lagi', '.casino retry']]
  })

  assert.equal(legacyButtonCalls, 0)
  assert.match(sentMessages[0].content.text, /Main lagi/)
  assert.match(sentMessages[0].content.text, /\.casino retry/)
})

test('one-row sections collapse to a Native Flow quick reply', async () => {
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
  const button = conn.sends[0].content.interactiveMessage.nativeFlowMessage.buttons[0]
  assert.equal(button.name, 'quick_reply')
  assert.deepEqual(JSON.parse(button.buttonParamsJson), {
    display_text: '🎯 Tangkap Pokémon',
    id: '.pokemon catch abc'
  })
})

test('two RPG actions use Native Flow quick replies', async () => {
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
  assert.deepEqual(
    conn.sends[0].content.interactiveMessage.nativeFlowMessage.buttons.map(button =>
      JSON.parse(button.buttonParamsJson)
    ),
    [
      { display_text: '✅ Terima', id: '.pokemon accept' },
      { display_text: '↩️ Tolak', id: '.pokemon reject' }
    ]
  )
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

test('a text-only category list can keep two quick replies without adding a media header', async () => {
  const conn = makeConn()

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Profil pengguna.',
    sections: [{
      title: 'Kategori',
      rows: [{ title: 'Games', id: '.menugame' }]
    }],
    buttons: [
      ['Info Owner', '.owner'],
      ['Donasi', '.donasi']
    ],
    keepButtonsWithSections: true
  })

  const interactive = conn.sends[0].content.interactiveMessage
  assert.equal('header' in interactive, false)
  assert.deepEqual(
    interactive.nativeFlowMessage.buttons.map(button => button.name),
    ['single_select', 'quick_reply', 'quick_reply']
  )
  assert.deepEqual(
    interactive.nativeFlowMessage.buttons.slice(1).map(button =>
      JSON.parse(button.buttonParamsJson).id
    ),
    ['.owner', '.donasi']
  )
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

test('lists fall back to text rather than ButtonV2', async () => {
  const sentMessages = []
  let buttonV2Calls = 0
  const conn = {
    async sendButtonV2() {
      buttonV2Calls++
      throw new Error('ButtonV2 should not be used')
    },
    async sendMessage(chat, content) {
      sentMessages.push({ chat, content })
      return sentMessages.at(-1)
    }
  }

  await sendRpgButtons(conn, {
    chat: 'test@g.us',
    text: 'Pilih aksi.',
    sections: [{
      title: 'Pilihan',
      rows: [
        { title: 'Satu', id: '.rpg one' },
        { title: 'Dua', id: '.rpg two' },
        { title: 'Tiga', id: '.rpg three' }
      ]
    }]
  })

  assert.equal(buttonV2Calls, 0)
  assert.match(sentMessages[0].content.text, /\.rpg one/)
})
