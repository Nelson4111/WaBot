import test from 'node:test'
import assert from 'node:assert/strict'
import auctionHandler from '../plugins/rpg/rpg-auction.js'
import bankHandler from '../plugins/rpg/rpg-bank.js'
import { AUCTION_ITEMS } from '../lib/rpg-auctionData.js'

const firstJid = '628123456789@s.whatsapp.net'
const secondJid = '628987654321@s.whatsapp.net'
const initialBalance = 200_000_000_000_000

function makeDb() {
  return {
    data: {
      users: {
        [firstJid]: {
          name: 'Penawar Satu',
          money: 5_000,
          rpg: { bank: initialBalance, bankTier: 19, kartuBeku: false }
        },
        [secondJid]: {
          name: 'Penawar Dua',
          money: 0,
          rpg: { bank: initialBalance, bankTier: 19, kartuBeku: false }
        }
      }
    },
    write: async () => {}
  }
}

function makeMessage(sender) {
  const replies = []
  return {
    replies,
    m: {
      sender,
      text: '',
      reply: message => {
        replies.push(message)
        return message
      }
    }
  }
}

async function runAuction(sender, text) {
  const { m, replies } = makeMessage(sender)
  await auctionHandler(m, { text, usedPrefix: '.' })
  return replies.at(-1)
}

test('auction command initializes its session and displays the command guide', async () => {
  const previousDb = global.db
  global.db = makeDb()

  try {
    const reply = await runAuction(firstJid, 'command')

    assert.equal(typeof global.db.data.auctionHouse.endsAt, 'number')
    assert.match(reply, /DAFTAR COMMAND LELANG/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('confirmed bids are shown, held in the bank, and settled with loser refunds', async () => {
  const previousDb = global.db
  global.db = makeDb()

  try {
    await runAuction(firstJid, 'list')
    let session = global.db.data.auctionHouse
    const item = AUCTION_ITEMS.find(entry => entry.id === session.itemIds[0])
    const firstAmount = Math.floor(item.price / 2)
    const competingAmount = firstAmount + 500_000

    await runAuction(firstJid, `bid ${item.id}`)
    await runAuction(firstJid, 'konfirmasi')
    assert.equal(global.db.data.users[firstJid].rpg.bank, initialBalance - firstAmount)
    session.bids[item.id] = []
    assert.match(await runAuction(firstJid, 'info'), /BID AKTIF MILIKMU/)
    assert.match(await runAuction(firstJid, `info ${item.id}`), /Bid tertinggi/)
    assert.match(await runAuction(firstJid, 'list'), new RegExp(`Rp ${firstAmount.toLocaleString('id-ID')}`))

    const depositMessage = makeMessage(firstJid)
    await bankHandler(depositMessage.m, { text: 'simpan 1000', usedPrefix: '.', command: 'bank' })
    assert.match(depositMessage.replies.at(-1), /TRANSAKSI BERHASIL/)

    const withdrawMessage = makeMessage(firstJid)
    await bankHandler(withdrawMessage.m, { text: 'tarik 1000', usedPrefix: '.', command: 'bank' })
    assert.match(withdrawMessage.replies.at(-1), /PENARIKAN DIBLOKIR/)

    await runAuction(secondJid, `bid ${item.id} ${competingAmount}`)
    await runAuction(secondJid, 'bid konfirmasi')
    session.endsAt = Date.now() - 1
    for (const jid of [firstJid, secondJid]) {
      global.db.data.users[jid].rpg.auctionBids[item.id].endsAt = session.endsAt
    }
    await runAuction(firstJid, 'list')

    assert.equal(global.db.data.users[firstJid].rpg.bank, initialBalance + 1_000)
    assert.equal(global.db.data.users[secondJid].rpg.bank, initialBalance - competingAmount)
    assert.equal(global.db.data.users[secondJid].rpg.auctionVault[item.id], 1)
    assert.match(await runAuction(firstJid, 'list'), /HASIL LELANG TERAKHIR/)
    assert.match(await runAuction(firstJid, 'list'), /Penawar Dua/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('a solo confirmed bidder wins when the auction expires', async () => {
  const previousDb = global.db
  global.db = makeDb()

  try {
    await runAuction(firstJid, 'list')
    const session = global.db.data.auctionHouse
    const item = AUCTION_ITEMS.find(entry => entry.id === session.itemIds[0])
    const amount = Math.floor(item.price / 2)

    await runAuction(firstJid, `bid ${item.id}`)
    await runAuction(firstJid, 'bid konfirmasi')
    global.db.data.auctionHouse = { history: [], news: [] }
    assert.match(await runAuction(firstJid, 'info'), /BID AKTIF MILIKMU/)
    assert.match(await runAuction(firstJid, 'list'), new RegExp(`Rp ${amount.toLocaleString('id-ID')}`))
    const recoveredSession = global.db.data.auctionHouse
    recoveredSession.endsAt = Date.now() - 1
    global.db.data.users[firstJid].rpg.auctionBids[item.id].endsAt = recoveredSession.endsAt

    await runAuction(firstJid, 'history')
    assert.equal(global.db.data.users[firstJid].rpg.bank, initialBalance - amount)
    assert.equal(global.db.data.users[firstJid].rpg.auctionVault[item.id], 1)
    assert.equal(global.db.data.users[firstJid].rpg.auctionHistory[0].amount, amount)
    assert.equal(global.db.data.users[firstJid].rpg.auctionBids[item.id], undefined)
    assert.match(await runAuction(firstJid, 'list'), /HASIL LELANG TERAKHIR/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})
