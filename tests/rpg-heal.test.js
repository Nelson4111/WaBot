import test from 'node:test'
import assert from 'node:assert/strict'
import healHandler from '../plugins/rpg/rpg-heal.js'
import { sendRpgHealPrompt } from '../lib/rpgActionButtons.js'

const senderJid = '628123456789@s.whatsapp.net'
const targetJid = '628987654321@s.whatsapp.net'

function makeDb() {
  return {
    data: {
      users: {
        [senderJid]: {
          name: 'Pengirim',
          money: 200_000,
          rpg: { bank: 0, bankTier: 0, darah: 100, difficulty: 'normal' }
        },
        [targetJid]: {
          name: 'Target',
          money: 0,
          rpg: { bank: 0, bankTier: 0, darah: 50, difficulty: 'normal' }
        }
      }
    },
    write: async () => {}
  }
}

function makeMessage(sender, extra = {}) {
  const replies = []
  return {
    replies,
    m: {
      sender,
      chat: 'test@g.us',
      reply: message => {
        replies.push(message)
        return message
      },
      ...extra
    }
  }
}

function makeConn() {
  class ButtonV2 {
    constructor(conn) {
      this.conn = conn
      this.rawButtons = []
    }

    setBody(body) {
      this.body = body
    }

    setFooter(footer) {
      this.footer = footer
    }

    addRawButton(button) {
      this.rawButtons.push(button)
    }

    addButton(label, command) {
      this.rawButtons.push({ label, command })
    }

    async send(chat) {
      const sent = { chat, body: this.body, footer: this.footer, buttons: this.rawButtons }
      this.conn.buttons.push(sent)
      return sent
    }
  }

  return {
    buttons: [],
    ButtonV2,
    decodeJid: jid => jid,
  }
}

function getListRows(conn) {
  const listButton = conn.buttons.at(-1).buttons.find(button => button.nativeFlowInfo?.name === 'single_select')
  assert.ok(listButton, 'message should use a scrollable list')
  return JSON.parse(listButton.nativeFlowInfo.paramsJson).sections.flatMap(section => section.rows)
}

test('heal prompt button targets the sender with heal me', async () => {
  const calls = []
  const conn = {
    sendButtonV2: async (...args) => {
      calls.push(args)
      return args
    }
  }
  const { m } = makeMessage(senderJid)

  await sendRpgHealPrompt(conn, m, { text: 'Pulihkan diri.', usedPrefix: '.' })

  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0][1].buttons, [['💖 Heal Diriku Sendiri', '.heal me']])
  assert.equal(calls[0][1].noLocationHeader, true)
  assert.equal('image' in calls[0][1], false)
  assert.equal('buffer' in calls[0][1], false)
})

test('heal me command restores only the sender', async () => {
  const previousDb = global.db
  global.db = makeDb()
  const sender = global.db.data.users[senderJid]
  sender.rpg.darah = 50
  const { m, replies } = makeMessage(senderJid)

  try {
    await healHandler(m, { conn: makeConn(), usedPrefix: '.', text: 'me' })

    assert.equal(sender.rpg.darah, 100)
    assert.match(replies.at(-1), /HEAL SUCCESS/)
    assert.equal(global.db.data.users[targetJid].rpg.darah, 50)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('heal without a target or me argument does not heal the sender', async () => {
  const previousDb = global.db
  global.db = makeDb()
  const sender = global.db.data.users[senderJid]
  sender.rpg.darah = 50
  const { m, replies } = makeMessage(senderJid)

  try {
    await healHandler(m, { conn: makeConn(), usedPrefix: '.', text: '' })

    assert.equal(sender.rpg.darah, 50)
    assert.match(replies.at(-1), /\.heal me/)
    assert.match(replies.at(-1), /tag atau reply/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('healing another user requires that user to accept and charges the sender', async () => {
  const previousDb = global.db
  global.db = makeDb()
  const conn = makeConn()
  const initialMoney = global.db.data.users[senderJid].money

  try {
    const offer = makeMessage(senderJid, { mentionedJid: [targetJid] })
    await healHandler(offer.m, { conn, usedPrefix: '.', text: '' })

    assert.equal(global.db.data.users[targetJid].rpg.darah, 50)
    assert.equal(global.db.data.users[senderJid].money, initialMoney)
    assert.match(offer.replies.at(-1), /PENAWARAN HEAL/)
    const rows = getListRows(conn)
    assert.equal(rows[0].title, '💖 Terima Heal')
    const command = rows[0].id
    const offerId = command.split(/\s+/).at(-1)

    const acceptance = makeMessage(targetJid)
    await healHandler(acceptance.m, { conn, usedPrefix: '.', text: `accept ${offerId}` })

    assert.equal(global.db.data.users[targetJid].rpg.darah, 100)
    assert.ok(global.db.data.users[senderJid].money < initialMoney)
    assert.match(acceptance.replies.at(-1), /HEAL SUCCESS/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('a replied-to user can decline a heal offer without being healed or charged', async () => {
  const previousDb = global.db
  global.db = makeDb()
  const conn = makeConn()
  const initialMoney = global.db.data.users[senderJid].money

  try {
    await healHandler(makeMessage(senderJid, { quoted: { sender: targetJid } }).m, {
      conn,
      usedPrefix: '.',
      text: ''
    })
    const rows = getListRows(conn)
    const command = rows[1].id
    const offerId = command.split(/\s+/).at(-1)
    const decline = makeMessage(targetJid)

    await healHandler(decline.m, { conn, usedPrefix: '.', text: `decline ${offerId}` })

    assert.equal(global.db.data.users[targetJid].rpg.darah, 50)
    assert.equal(global.db.data.users[senderJid].money, initialMoney)
    assert.match(decline.replies.at(-1), /ditolak/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})
