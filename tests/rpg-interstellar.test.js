import test from 'node:test'
import assert from 'node:assert/strict'
import interstellarHandler from '../plugins/rpg/rpg-interstellar.js'

const userJid = '628123456789@s.whatsapp.net'
const initialWallet = 1_250_000_000_000_000
const initialBank = 7_000_000_000_000_000

function makeDb() {
  return {
    data: {
      users: {
        [userJid]: {
          money: initialWallet,
          rpg: {
            bank: initialBank,
            stellarCredit: 3,
            inventory: {}
          }
        }
      }
    },
    write: async () => {}
  }
}

function makeMessage() {
  const replies = []
  return {
    replies,
    m: {
      sender: userJid,
      chat: '120363000000000000@g.us',
      reply: message => {
        replies.push(message)
        return message
      }
    }
  }
}

test('Interstellar exchange converts available wallet money with a no-thumbnail confirmation', async () => {
  const previousDb = global.db
  global.db = makeDb()
  const buttonCalls = []
  const { m } = makeMessage()
  const conn = {
    sendButton: async (...args) => {
      buttonCalls.push(args)
    }
  }

  try {
    await interstellarHandler(m, {
      conn,
      text: 'exchange all',
      command: 'int',
      usedPrefix: '.'
    })

    const account = global.db.data.users[userJid]
    assert.equal(account.money, initialWallet)
    assert.equal(account.rpg.stellarCredit, 3)
    assert.equal(account.rpg.pendingStellarExchange.moneyAmount, 1_000_000_000_000_000)
    assert.equal(account.rpg.pendingStellarExchange.creditAmount, 2)
    assert.equal(buttonCalls.length, 1)
    assert.equal(buttonCalls[0][3], null)
    assert.deepEqual(buttonCalls[0][4], [
      ['💠 Tukar Sekarang', '.int exchange confirm'],
      ['↩️ Batalkan', '.int exchange cancel']
    ])
    assert.match(buttonCalls[0][1], /500T = 1 SC/)
    assert.match(buttonCalls[0][1], /Sisa uang saku/)

    await interstellarHandler(m, {
      conn,
      text: 'exchange confirm',
      command: 'int',
      usedPrefix: '.'
    })

    assert.equal(account.money, 250_000_000_000_000)
    assert.equal(account.rpg.bank, initialBank)
    assert.equal(account.rpg.stellarCredit, 5)
    assert.equal(account.rpg.pendingStellarExchange, undefined)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})
