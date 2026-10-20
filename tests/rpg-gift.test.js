import test from 'node:test'
import assert from 'node:assert/strict'
import giftHandler from '../plugins/rpg/rpg-gift.js'

const senderJid = '628123456789@s.whatsapp.net'
const targetJid = '628987654321@s.whatsapp.net'

test('gift money accepts suffix amounts when the target tag appears between item and amount', async () => {
  const previousDb = global.db
  const previousFetch = global.fetch
  const messages = []
  global.fetch = async () => ({ ok: false })
  global.db = {
    data: {
      users: {
        [senderJid]: { money: 2_000_000_000_000, rpg: {} },
        [targetJid]: { money: 500, rpg: {} }
      }
    },
    write: async () => {}
  }

  try {
    await giftHandler({
      sender: senderJid,
      chat: 'test@g.us',
      mentionedJid: [targetJid],
      reply: message => messages.push(message)
    }, {
      conn: {
        sendMessage: async (_chat, content) => messages.push(content.text)
      },
      text: 'money @target 1T',
      usedPrefix: '.',
      command: 'gift'
    })

    assert.equal(global.db.data.users[senderJid].money, 1_000_000_000_000)
    assert.equal(global.db.data.users[targetJid].money, 1_000_000_000_500)
    assert.match(messages.at(-1), /Jumlah: Rp 1T/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
    global.fetch = previousFetch
  }
})

test('gift money accepts suffix amounts for a replied-to target', async () => {
  const previousDb = global.db
  const previousFetch = global.fetch
  const messages = []
  global.fetch = async () => ({ ok: false })
  global.db = {
    data: {
      users: {
        [senderJid]: { money: 2_000_000_000_000, rpg: {} },
        [targetJid]: { money: 500, rpg: {} }
      }
    },
    write: async () => {}
  }

  try {
    await giftHandler({
      sender: senderJid,
      chat: 'test@g.us',
      quoted: { sender: targetJid },
      reply: message => messages.push(message)
    }, {
      conn: {
        sendMessage: async (_chat, content) => messages.push(content.text)
      },
      text: 'money 1T',
      usedPrefix: '.',
      command: 'gift'
    })

    assert.equal(global.db.data.users[senderJid].money, 1_000_000_000_000)
    assert.equal(global.db.data.users[targetJid].money, 1_000_000_000_500)
    assert.match(messages.at(-1), /Jumlah: Rp 1T/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
    global.fetch = previousFetch
  }
})
