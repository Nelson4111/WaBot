import test from 'node:test'
import assert from 'node:assert/strict'
import healHandler from '../plugins/rpg/rpg-heal.js'

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
  return {
    buttons: [],
    decodeJid: jid => jid,
    async sendButton(...args) {
      this.buttons.push(args[4])
    }
  }
}

test('heal button command restores only the sender', async () => {
  const previousDb = global.db
  global.db = makeDb()
  const sender = global.db.data.users[senderJid]
  sender.rpg.darah = 50
  const { m, replies } = makeMessage(senderJid)

  try {
    await healHandler(m, { conn: makeConn(), usedPrefix: '.', text: '' })

    assert.equal(sender.rpg.darah, 100)
    assert.match(replies.at(-1), /HEAL SUCCESS/)
    assert.equal(global.db.data.users[targetJid].rpg.darah, 50)
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
    const buttons = conn.buttons.at(-1)
    assert.equal(buttons[0][0], '💖 Terima Heal')
    const [, command] = buttons[0]
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
    const buttons = conn.buttons.at(-1)
    const [, command] = buttons[1]
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
