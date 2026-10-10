import test from 'node:test'
import assert from 'node:assert/strict'
import auctionHandler from '../plugins/rpg/rpg-auction.js'

test('auction command initializes its session and displays the command guide', async () => {
  const previousDb = global.db
  global.db = {
    data: {
      users: {
        '628123456789@s.whatsapp.net': { rpg: {} }
      }
    },
    write: async () => {}
  }

  try {
    const replies = []
    await auctionHandler({
      sender: '628123456789@s.whatsapp.net',
      reply: message => {
        replies.push(message)
        return message
      }
    }, { text: 'command', usedPrefix: '.' })

    assert.equal(typeof global.db.data.auctionHouse.endsAt, 'number')
    assert.match(replies[0], /DAFTAR COMMAND LELANG/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})
