import test from 'node:test'
import assert from 'node:assert/strict'
import auctionHandler from '../plugins/rpg/rpg-auction.js'
import bankHandler from '../plugins/rpg/rpg-bank.js'
import { AUCTION_ITEMS } from '../lib/rpg-auctionData.js'
import { finishAuctionNow } from '../plugins/rpg/rpg-auction.js'

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

test('a bidder addressed by LID sees their active bid and leads by their real name', async () => {
  const previousDb = global.db
  const lid = '123456789012345@lid'
  global.db = makeDb()
  global.db.data.lids = { [lid]: firstJid }

  try {
    await runAuction(firstJid, 'list')
    const session = global.db.data.auctionHouse
    const item = AUCTION_ITEMS.find(entry => entry.id === session.itemIds[0])
    const amount = item.price + 500_000

    await runAuction(lid, `bid ${item.id} ${amount}`)
    await runAuction(lid, 'bid konfirmasi')

    const info = await runAuction(lid, 'info')
    assert.match(info, /Penawar Satu/)
    assert.doesNotMatch(info, /belum mengikuti bid aktif/i)
    const bidInfo = await runAuction(lid, 'bid')
    assert.match(bidInfo, /Bid kamu:/)
    assert.doesNotMatch(bidInfo, /belum mengikuti bid aktif/i)
    const listing = await runAuction(lid, 'list')
    assert.match(listing, new RegExp(`Bid Tertinggi : Rp ${amount.toLocaleString('id-ID')}\\n> ↳ Pemimpin Bid : Penawar Satu`))
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
    const firstAmount = item.price + 500_000
    const competingAmount = firstAmount + 500_000
    assert.match(await runAuction(secondJid, 'info'), /belum mengikuti bid aktif/i)
    assert.match(await runAuction(secondJid, 'bid'), /belum mengikuti bid aktif/i)
    const listing = await runAuction(firstJid, 'list')
    assert.match(listing, new RegExp(`Bid Minimum : Rp ${Math.floor(item.price / 2).toLocaleString('id-ID')}`))
    assert.match(listing, new RegExp(`Bid Tertinggi : Rp ${item.price.toLocaleString('id-ID')}`))
    const detail = await runAuction(firstJid, `info ${item.id}`)
    assert.match(detail, /Pemimpin bid: (Bruce Wayne|Tony Stark|Diana Prince|Clark Kent|Natasha Romanoff|Peter Parker|T’Challa|Selina Kyle)/)

    assert.match(await runAuction(firstJid, `bid ${item.id} ${item.price}`), /Bid harus lebih tinggi/)
    await runAuction(firstJid, `bid ${item.id}`)
    await runAuction(firstJid, 'konfirmasi')
    assert.equal(global.db.data.users[firstJid].rpg.bank, initialBalance - firstAmount)
    session.bids[item.id] = []
    assert.match(await runAuction(firstJid, 'info'), /BID AKTIF MILIKMU/)
    assert.doesNotMatch(await runAuction(firstJid, 'info'), /belum mengikuti bid aktif/i)
    assert.match(await runAuction(firstJid, `info ${item.id}`), /Bid tertinggi/)
    assert.match(await runAuction(firstJid, `info ${item.id}`), /Pemimpin bid: Penawar Satu/)
    const firstListing = await runAuction(firstJid, 'list')
    assert.match(firstListing, new RegExp(`Bid Tertinggi : Rp ${firstAmount.toLocaleString('id-ID')}\\n> ↳ Pemimpin Bid : Penawar Satu`))

    const depositMessage = makeMessage(firstJid)
    await bankHandler(depositMessage.m, { text: 'simpan 1000', usedPrefix: '.', command: 'bank' })
    assert.match(depositMessage.replies.at(-1), /TRANSAKSI BERHASIL/)

    const withdrawMessage = makeMessage(firstJid)
    await bankHandler(withdrawMessage.m, { text: 'tarik 1000', usedPrefix: '.', command: 'bank' })
    assert.match(withdrawMessage.replies.at(-1), /PENARIKAN DIBLOKIR/)

    assert.match(await runAuction(secondJid, `bid ${item.id} ${firstAmount}`), /Bid harus lebih tinggi/)
    await runAuction(secondJid, `bid ${item.id} ${competingAmount}`)
    await runAuction(secondJid, 'bid konfirmasi')
    assert.match(await runAuction(secondJid, 'info'), /Bid kamu:/)
    const leadingListing = await runAuction(secondJid, 'list')
    assert.match(leadingListing, new RegExp(`Bid Tertinggi : Rp ${competingAmount.toLocaleString('id-ID')}\\n> ↳ Pemimpin Bid : Penawar Dua`))
    const leadingInfo = await runAuction(secondJid, `info ${item.id}`)
    assert.match(leadingInfo, /Pemimpin bid: Penawar Dua/)
    assert.match(leadingInfo, new RegExp(`Bid Tertinggi : Rp ${competingAmount.toLocaleString('id-ID')}`))
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
    const amount = item.price + 500_000

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

test('owner finish action settles bids immediately and starts the next auction', async () => {
  const previousDb = global.db
  global.db = makeDb()

  try {
    await runAuction(firstJid, 'list')
    const currentSession = global.db.data.auctionHouse
    const item = AUCTION_ITEMS.find(entry => entry.id === currentSession.itemIds[0])
    const amount = item.price + 500_000

    await runAuction(firstJid, `bid ${item.id}`)
    await runAuction(firstJid, 'bid konfirmasi')
    currentSession.bids[item.id] = []
    const result = await finishAuctionNow()

    assert.equal(result.alreadyEnded, false)
    assert.equal(result.results.length, 1)
    assert.equal(result.results[0].jid, firstJid)
    assert.equal(global.db.data.users[firstJid].rpg.bank, initialBalance - amount)
    assert.equal(global.db.data.users[firstJid].rpg.auctionVault[item.id], 1)
    assert.ok(result.nextSession.endsAt > currentSession.endsAt)
    assert.equal(result.nextSession.bids[item.id], undefined)
    assert.notDeepEqual([...result.nextSession.itemIds].sort(), [...currentSession.itemIds].sort())

    const nextItem = AUCTION_ITEMS.find(entry => entry.id === result.nextSession.itemIds[0])
    const nextAmount = nextItem.price + 500_000
    await runAuction(secondJid, `bid ${nextItem.id} ${nextAmount}`)
    await runAuction(secondJid, 'bid konfirmasi')
    const nextResult = await finishAuctionNow()
    assert.equal(nextResult.results.length, 1)
    assert.equal(nextResult.results[0].jid, secondJid)
    assert.equal(global.db.data.users[secondJid].rpg.auctionVault[nextItem.id], 1)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})
