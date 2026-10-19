import test from 'node:test'
import assert from 'node:assert/strict'
import auctionHandler from '../plugins/rpg/rpg-auction.js'
import bankHandler from '../plugins/rpg/rpg-bank.js'
import { AUCTION_ITEMS, AUCTION_RARITIES, getAuctionItemRarity } from '../lib/rpg-auctionData.js'
import { finishAuctionNow } from '../plugins/rpg/rpg-auction.js'

const firstJid = '628123456789@s.whatsapp.net'
const secondJid = '628987654321@s.whatsapp.net'
const initialBalance = 200_000_000_000_000
const moneySuffixes = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

function compactMoney(value) {
  const amount = Number(value)
  if (amount < 1_000) return amount.toLocaleString('id-ID')
  const suffixIndex = Math.floor(Math.log10(amount) / 3)
  const scaledAmount = amount / 10 ** (suffixIndex * 3)
  return `${scaledAmount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}${moneySuffixes[suffixIndex - 1]}`
}

function makeDb() {
  return {
    data: {
      users: {
        [firstJid]: {
          name: 'Penawar Satu',
          money: 5_000,
          rpg: { bank: initialBalance, bankTier: 19, kartuBeku: false, lastBunga: Date.now() }
        },
        [secondJid]: {
          name: 'Penawar Dua',
          money: 0,
          rpg: { bank: initialBalance, bankTier: 19, kartuBeku: false, lastBunga: Date.now() }
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

test('auction list includes shortcuts for checking balance and money suffixes', async () => {
  const previousDb = global.db
  global.db = makeDb()

  try {
    const listing = await runAuction(firstJid, 'list')

    assert.match(listing, /> 💳 \.money — cek saldo/)
    assert.match(listing, /> 🔤 \.money suffix — cek daftar sufiks/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('auction rarity is evenly distributed by price and displayed only in item info', async () => {
  const rarityCounts = new Map(Object.keys(AUCTION_RARITIES).map(name => [name, 0]))
  const sortedItems = [...AUCTION_ITEMS].sort((first, second) => first.price - second.price)
  let previousRarityIndex = -1

  for (const item of sortedItems) {
    const rarity = getAuctionItemRarity(item)
    const rarityIndex = Object.keys(AUCTION_RARITIES).indexOf(rarity.name)
    assert.ok(rarityIndex >= previousRarityIndex)
    previousRarityIndex = rarityIndex
    rarityCounts.set(rarity.name, rarityCounts.get(rarity.name) + 1)
  }

  const counts = [...rarityCounts.values()]
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1)

  const previousDb = global.db
  global.db = makeDb()
  try {
    await runAuction(firstJid, 'list')
    const item = AUCTION_ITEMS.find(entry => entry.id === global.db.data.auctionHouse.itemIds[0])
    const rarity = getAuctionItemRarity(item)
    const details = await runAuction(firstJid, `info ${item.id}`)
    const listing = await runAuction(firstJid, 'list')

    assert.match(details, new RegExp(`Rarity: ${rarity.stars} ${rarity.name}`))
    assert.match(details, new RegExp(`${rarity.icon}`))
    assert.doesNotMatch(listing, /Rarity:/i)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('money suffix guide lists abbreviations through centillion', async () => {
  const previousDb = global.db
  global.db = makeDb()

  try {
    const guide = await runAuction(firstJid, 'money')

    assert.match(guide, /10\^3 = K — Ribu \(Thousand\)/)
    assert.match(guide, /10\^9 = B — Miliar \(Billion\)/)
    assert.match(guide, /10\^15 = Qa — Quadrillion/)
    assert.match(guide, /10\^63 = Vg — vigintillion/i)
    assert.match(guide, /10\^303 = Ce — Centillion/)
    assert.equal(guide.match(/> 10\^\d+ = /g).length, 101)

    const { m, replies } = makeMessage(firstJid)
    await bankHandler(m, { text: 'suffix', usedPrefix: '.', command: 'money' })
    assert.match(replies.at(-1), /10\^303 = Ce — Centillion/)
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('auction bids accept large suffixes and display compact amounts', async () => {
  const previousDb = global.db
  global.db = makeDb()
  global.db.data.users[firstJid].rpg.bank = 20_000_000_000_000_000

  try {
    await runAuction(firstJid, 'list')
    const session = global.db.data.auctionHouse
    const item = AUCTION_ITEMS.find(entry => entry.id === session.itemIds[0])

    const pending = await runAuction(firstJid, `bid ${item.id} 19Qa`)
    assert.match(pending, /Penawaran kamu: Rp 19Qa/)
    const confirmed = await runAuction(firstJid, 'bid konfirmasi')
    assert.match(confirmed, /Bid kamu: Rp 19Qa/)
    assert.equal(global.db.data.users[firstJid].rpg.bank, 1_000_000_000_000_000)
    assert.equal(session.bids[item.id][0].amount, 19_000_000_000_000_000)

    const tooLarge = await runAuction(secondJid, `bid ${item.id} 1Ce`)
    assert.match(tooLarge, /SALDO TIDAK CUKUP/)
    assert.match(tooLarge, /Nominal bid: \*Rp 1Ce\*/)
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
    assert.match(listing, new RegExp(`Bid Tertinggi : Rp ${compactMoney(amount)}\\n> ↳ Pemimpin Bid : Penawar Satu`))
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})

test('confirmed bids are recorded, deducted, and settled with loser refunds', async () => {
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
    assert.match(listing, new RegExp(`Bid Minimum : Rp ${compactMoney(Math.floor(item.price / 2))}`))
    assert.match(listing, new RegExp(`Bid Tertinggi : Rp ${compactMoney(item.price)}`))
    const detail = await runAuction(firstJid, `info ${item.id}`)
    assert.match(detail, /Pemimpin bid: .+/i)

    assert.match(await runAuction(firstJid, `bid ${item.id} ${item.price}`), /Bid harus lebih tinggi/)
    await runAuction(firstJid, `bid ${item.id}`)
    assert.match(await runAuction(firstJid, 'konfirmasi'), /Bid tertinggi: .* oleh Kamu/)
    assert.equal(global.db.data.users[firstJid].rpg.bank, initialBalance - firstAmount)
    assert.match(global.db.data.users[firstJid].rpg.riwayat[0], /Bid lelang/)
    assert.equal(session.bids[item.id][0].jid, firstJid)
    assert.equal(global.db.data.users[firstJid].rpg.auctionBids[item.id].amount, firstAmount)
    const confirmedInfo = await runAuction(firstJid, 'info')
    assert.match(confirmedInfo, new RegExp(`Bid kamu: Rp ${compactMoney(firstAmount)} • TERTINGGI`))
    const confirmedListing = await runAuction(firstJid, 'list')
    assert.match(confirmedListing, new RegExp(`Bid Tertinggi : Rp ${compactMoney(firstAmount)}\\n> ↳ Pemimpin Bid : Penawar Satu`))
    session.bids[item.id] = []
    assert.match(await runAuction(firstJid, 'info'), /BID AKTIF MILIKMU/)
    assert.doesNotMatch(await runAuction(firstJid, 'info'), /belum mengikuti bid aktif/i)
    assert.match(await runAuction(firstJid, `info ${item.id}`), /Bid tertinggi/i)
    assert.match(await runAuction(firstJid, `info ${item.id}`), /Pemimpin bid: Penawar Satu/)
    const firstListing = await runAuction(firstJid, 'list')
    assert.match(firstListing, new RegExp(`Bid Tertinggi : Rp ${compactMoney(firstAmount)}\\n> ↳ Pemimpin Bid : Penawar Satu`))

    const personalBid = global.db.data.users[firstJid].rpg.auctionBids[item.id]
    delete global.db.data.users[firstJid].rpg.auctionBids[item.id]
    assert.match(await runAuction(firstJid, 'info'), /Bid kamu:/)
    assert.match(await runAuction(firstJid, 'list'), new RegExp(`Bid Tertinggi : Rp ${compactMoney(firstAmount)}\\n> ↳ Pemimpin Bid : Penawar Satu`))
    global.db.data.users[firstJid].rpg.auctionBids[item.id] = personalBid

    const depositMessage = makeMessage(firstJid)
    await bankHandler(depositMessage.m, { text: 'simpan 1K', usedPrefix: '.', command: 'bank' })
    assert.match(depositMessage.replies.at(-1), /TRANSAKSI BERHASIL/)
    assert.match(depositMessage.replies.at(-1), /Jumlah : Rp 1K/)

    const withdrawMessage = makeMessage(firstJid)
    await bankHandler(withdrawMessage.m, { text: 'tarik 1K', usedPrefix: '.', command: 'bank' })
    assert.match(withdrawMessage.replies.at(-1), /TRANSAKSI BERHASIL/)
    assert.match(withdrawMessage.replies.at(-1), /Jumlah : Rp 1K/)
    assert.equal(global.db.data.users[firstJid].rpg.bank, initialBalance - firstAmount)
    assert.ok(global.db.data.users[firstJid].rpg.riwayat.some(entry => /Simpan/.test(entry)))
    assert.ok(global.db.data.users[firstJid].rpg.riwayat.some(entry => /Tarik/.test(entry)))
    const historyMessage = makeMessage(firstJid)
    await bankHandler(historyMessage.m, { text: 'riwayat', usedPrefix: '.', command: 'bank' })
    assert.match(historyMessage.replies.at(-1), /-Rp 1K Simpan/)
    assert.match(historyMessage.replies.at(-1), /\+Rp 1K Tarik/)

    assert.match(await runAuction(secondJid, `bid ${item.id} ${firstAmount}`), /Bid harus lebih tinggi/)
    await runAuction(secondJid, `bid ${item.id} ${competingAmount}`)
    await runAuction(secondJid, 'bid konfirmasi')
    assert.match(await runAuction(secondJid, 'info'), /Bid kamu:/)
    const leadingListing = await runAuction(secondJid, 'list')
    assert.match(leadingListing, new RegExp(`Bid Tertinggi : Rp ${compactMoney(competingAmount)}\\n> ↳ Pemimpin Bid : Penawar Dua`))
    const leadingInfo = await runAuction(secondJid, `info ${item.id}`)
    assert.match(leadingInfo, /Pemimpin bid: Penawar Dua/)
    assert.match(leadingInfo, new RegExp(`Bid Tertinggi : Rp ${compactMoney(competingAmount)}`))
    session.endsAt = Date.now() - 1
    for (const jid of [firstJid, secondJid]) {
      global.db.data.users[jid].rpg.auctionBids[item.id].endsAt = session.endsAt
    }
    await runAuction(firstJid, 'list')

    assert.equal(global.db.data.users[firstJid].rpg.bank, initialBalance + 1_000)
    assert.equal(global.db.data.users[secondJid].rpg.bank, initialBalance - competingAmount)
    assert.equal(global.db.data.users[secondJid].rpg.auctionVault[item.id], 1)
    assert.match(global.db.data.users[secondJid].rpg.riwayat[0], /Bid lelang/)
    assert.equal(global.db.data.users[secondJid].rpg.riwayat.filter(entry => /Bid lelang/.test(entry)).length, 1)
    assert.ok(global.db.data.users[firstJid].rpg.riwayat.some(entry => /Pengembalian bid/.test(entry)))
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
    assert.match(await runAuction(firstJid, 'list'), new RegExp(`Rp ${compactMoney(amount)}`))
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
    assert.ok(result.nextSession.endsAt >= currentSession.endsAt)
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
