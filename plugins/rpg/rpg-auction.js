import { loadDB, getUserRPG } from '../../lib/waifuHelper.js'
import { AUCTION_ITEMS } from '../../lib/rpg-auctionData.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

const AUCTION_DURATION = 5 * 60 * 60 * 1000
const AUCTION_ITEM_LIMIT = 5
const BID_CONFIRMATION_TTL = 2 * 60 * 1000
const AUCTION_HISTORY_LIMIT = 50
const AUCTION_NEWS_LIMIT = 10
const money = value => `Rp ${Number(value).toLocaleString('id-ID')}`
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')
let auctionTimer

async function persistAuctionDB() {
  if (!global.db || typeof global.db.write !== 'function') {
    throw new Error('[auction-house] Database tidak tersedia untuk menyimpan perubahan.')
  }
  await global.db.write()
}

function shuffle(items) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

function normalizeJid(jid) {
  if (!jid) return jid
  const resolved = jid.endsWith('@lid')
    ? global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
    : jid
  return `${resolved.split('@')[0].split(':')[0]}${resolved.includes('@lid') ? '@lid' : '@s.whatsapp.net'}`
}

function makeAuctionSession(now = Date.now()) {
  return {
    itemIds: shuffle(AUCTION_ITEMS).slice(0, AUCTION_ITEM_LIMIT).map(item => item.id),
    bids: {},
    pendingConfirmations: {},
    endsAt: now + AUCTION_DURATION
  }
}

function getHighestBid(session, itemId) {
  const bids = Array.isArray(session.bids?.[itemId]) ? session.bids[itemId] : []
  return bids.reduce((highest, bid) =>
    Number(bid?.amount) > Number(highest?.amount) ? bid : highest, null
  )
}

function getMinimumBid(item) {
  return Math.floor(Number(item.price) / 2)
}

function restoreAuctionBids(db, session) {
  let changed = false
  for (const [userJid, user] of Object.entries(db.data.users || {})) {
    const personalBids = user?.rpg?.auctionBids
    if (!personalBids || typeof personalBids !== 'object') continue
    for (const [itemId, bid] of Object.entries(personalBids)) {
      if (!session.itemIds.includes(itemId) || Number(bid?.endsAt) !== Number(session.endsAt)) continue
      if (!Number.isSafeInteger(Number(bid.amount)) || Number(bid.amount) <= 0) continue
      const jid = normalizeJid(userJid)
      const bids = Array.isArray(session.bids[itemId]) ? session.bids[itemId] : (session.bids[itemId] = [])
      if (bids.some(entry => normalizeJid(entry?.jid) === jid)) continue
      bids.push({ jid, amount: Number(bid.amount), at: Number(bid.at) || 0, escrowed: bid.escrowed === true })
      changed = true
    }
  }
  return changed
}

function recoverAuctionSession(db, previousSession, now) {
  const recoverable = new Map()
  for (const [userJid, user] of Object.entries(db.data.users || {})) {
    for (const [itemId, bid] of Object.entries(user?.rpg?.auctionBids || {})) {
      const endsAt = Number(bid?.endsAt)
      const itemIds = Array.isArray(bid?.itemIds) ? bid.itemIds : []
      if (!Number.isFinite(endsAt) || endsAt <= now || itemIds.length !== AUCTION_ITEM_LIMIT) continue
      if (new Set(itemIds).size !== AUCTION_ITEM_LIMIT ||
        !itemIds.includes(itemId) ||
        !itemIds.every(id => AUCTION_ITEMS.some(item => item.id === id))) continue
      let session = recoverable.get(endsAt)
      if (!session) {
        session = {
          itemIds: [...itemIds],
          bids: {},
          pendingConfirmations: {},
          endsAt,
          history: Array.isArray(previousSession?.history) ? previousSession.history : [],
          news: Array.isArray(previousSession?.news) ? previousSession.news : []
        }
        recoverable.set(endsAt, session)
      }
      if (!session.itemIds.includes(itemId) || !Number.isSafeInteger(Number(bid.amount))) continue
      if (!Array.isArray(session.bids[itemId])) session.bids[itemId] = []
      session.bids[itemId].push({
        jid: normalizeJid(userJid),
        amount: Number(bid.amount),
        at: Number(bid.at) || 0,
        escrowed: bid.escrowed === true
      })
    }
  }
  const candidates = [...recoverable.values()].sort((a, b) => b.endsAt - a.endsAt)
  return candidates[0] || null
}

function settleOrphanedAuctionBids(db, now) {
  const currentSession = db.data.auctionHouse
  const currentSessionItemIds = Array.isArray(currentSession?.itemIds) ? currentSession.itemIds : []
  const currentSessionValid = currentSessionItemIds.length === AUCTION_ITEM_LIMIT &&
    new Set(currentSessionItemIds).size === AUCTION_ITEM_LIMIT &&
    currentSessionItemIds.every(id => AUCTION_ITEMS.some(item => item.id === id))
  const currentSessionEndsAt = currentSessionValid ? Number(currentSession.endsAt) : NaN
  const orphaned = new Map()

  for (const [userJid, user] of Object.entries(db.data.users || {})) {
    for (const [itemId, bid] of Object.entries(user?.rpg?.auctionBids || {})) {
      const endsAt = Number(bid?.endsAt)
      if (!Number.isFinite(endsAt) || endsAt > now || endsAt === currentSessionEndsAt) continue
      if (!AUCTION_ITEMS.some(item => item.id === itemId)) continue
      if (!Number.isSafeInteger(Number(bid.amount)) || Number(bid.amount) <= 0) continue
      let session = orphaned.get(endsAt)
      if (!session) {
        session = { itemIds: [], bids: {}, pendingConfirmations: {}, endsAt }
        orphaned.set(endsAt, session)
      }
      if (!session.itemIds.includes(itemId)) session.itemIds.push(itemId)
      if (!Array.isArray(session.bids[itemId])) session.bids[itemId] = []
      session.bids[itemId].push({
        jid: normalizeJid(userJid),
        amount: Number(bid.amount),
        at: Number(bid.at) || 0,
        escrowed: bid.escrowed === true
      })
    }
  }

  for (const session of orphaned.values()) {
    settleAuctionSession(db, session, now, { replaceSession: false })
  }
  return orphaned.size > 0
}

function addAuctionHistory(state, entry) {
  state.history.unshift(entry)
  state.history.length = Math.min(state.history.length, AUCTION_HISTORY_LIMIT)
  state.news.unshift(entry)
  state.news.length = Math.min(state.news.length, AUCTION_NEWS_LIMIT)
}

function settleAuctionSession(db, session, now = Date.now(), { replaceSession = true } = {}) {
  const state = db.data.auctionHouse || (db.data.auctionHouse = { history: [], news: [] })
  if (session.settled) return
  if (!Array.isArray(state.history)) state.history = []
  if (!Array.isArray(state.news)) state.news = []
  session.settled = true

  for (const itemId of session.itemIds) {
    const item = AUCTION_ITEMS.find(entry => entry.id === itemId)
    const bids = Array.isArray(session.bids?.[itemId]) ? session.bids[itemId] : []
    const bestBidByUser = new Map()

    for (const bid of bids) {
      if (!bid?.jid || !Number.isSafeInteger(Number(bid.amount))) continue
      const jid = normalizeJid(bid.jid)
      const previous = bestBidByUser.get(jid)
      if (!previous || Number(bid.amount) > Number(previous.amount)) {
        bestBidByUser.set(jid, { ...bid, jid })
      }
    }

    const candidates = [...bestBidByUser.values()].sort((a, b) =>
      Number(b.amount) - Number(a.amount) || Number(a.at) - Number(b.at)
    )

    let winner = null
    for (const bid of candidates) {
      const account = getUserRPG(db, bid.jid)
      if (!account?.rpg) continue
      const balance = Number(account.rpg.bank) || 0
      if (!bid.escrowed && balance < bid.amount) continue
      winner = { bid, account }
      break
    }

    for (const [bidderJid, bid] of bestBidByUser) {
      if (winner && bidderJid === winner.bid.jid) continue
      if (!bid.escrowed) continue
      const account = getUserRPG(db, bidderJid)
      if (account?.rpg) {
        account.rpg.bank = (Number(account.rpg.bank) || 0) + Number(bid.amount)
        if (!Array.isArray(account.rpg.riwayat)) account.rpg.riwayat = []
        account.rpg.riwayat.unshift(`+${money(bid.amount)} Pengembalian bid ${item.name}`)
        account.rpg.riwayat.length = Math.min(account.rpg.riwayat.length, 20)
      }
    }

    if (!winner) continue

    const { bid, account } = winner
    if (!bid.escrowed) account.rpg.bank = (Number(account.rpg.bank) || 0) - Number(bid.amount)
    if (!account.rpg.auctionVault || typeof account.rpg.auctionVault !== 'object') {
      account.rpg.auctionVault = {}
    }
    account.rpg.auctionVault[itemId] = (Number(account.rpg.auctionVault[itemId]) || 0) + 1
    if (!Array.isArray(account.rpg.riwayat)) account.rpg.riwayat = []
    account.rpg.riwayat.unshift(`-${money(bid.amount)} Lelang ${item.name}`)
    account.rpg.riwayat.length = Math.min(account.rpg.riwayat.length, 20)

    const winnerName = db.data.users?.[bid.jid]?.name || bid.jid.split('@')[0]
    const historyEntry = {
      itemId,
      itemName: item.name,
      emoji: item.emoji,
      jid: bid.jid,
      winnerName,
      amount: bid.amount,
      endedAt: now
    }
    if (!Array.isArray(account.rpg.auctionHistory)) account.rpg.auctionHistory = []
    account.rpg.auctionHistory.unshift(historyEntry)
    account.rpg.auctionHistory.length = Math.min(account.rpg.auctionHistory.length, AUCTION_HISTORY_LIMIT)
    addAuctionHistory(state, historyEntry)
  }

  for (const user of Object.values(db.data.users || {})) {
    const personalBids = user?.rpg?.auctionBids
    if (!personalBids || typeof personalBids !== 'object') continue
    for (const [itemId, bid] of Object.entries(personalBids)) {
      if (Number(bid?.endsAt) === Number(session.endsAt)) delete personalBids[itemId]
    }
  }

  if (replaceSession) {
    db.data.auctionHouse = {
      ...state,
      ...makeAuctionSession(now),
      history: state.history,
      news: state.news
    }
  }
}

export async function finishAuctionNow() {
  const db = loadDB()
  const now = Date.now()
  const storedSession = db.data.auctionHouse
  const storedItemIds = Array.isArray(storedSession?.itemIds) ? storedSession.itemIds : []
  const storedSessionValid = storedItemIds.length === AUCTION_ITEM_LIMIT &&
    new Set(storedItemIds).size === AUCTION_ITEM_LIMIT &&
    storedItemIds.every(id => AUCTION_ITEMS.some(item => item.id === id))

  if (storedSessionValid && Number(storedSession.endsAt) <= now) {
    const nextSession = await getAuctionSession(db, now)
    return {
      alreadyEnded: true,
      results: nextSession.news.filter(entry => Number(entry.endedAt) === now),
      nextSession
    }
  }

  const session = await getAuctionSession(db, now)
  const endedAt = Date.now()

  restoreAuctionBids(db, session)
  settleAuctionSession(db, session, endedAt)
  scheduleAuctionClose(db.data.auctionHouse.endsAt)
  await persistAuctionDB()

  return {
    alreadyEnded: false,
    results: db.data.auctionHouse.news.filter(entry => Number(entry.endedAt) === endedAt),
    nextSession: db.data.auctionHouse
  }
}

function scheduleAuctionClose(endsAt) {
  if (auctionTimer) clearTimeout(auctionTimer)
  const delay = Math.max(0, Number(endsAt) - Date.now())
  auctionTimer = setTimeout(async () => {
    try {
      const db = loadDB()
      const session = db.data.auctionHouse
      if (session && Number(session.endsAt) <= Date.now()) {
        if (session.bids && typeof session.bids === 'object') restoreAuctionBids(db, session)
        settleAuctionSession(db, session)
        await persistAuctionDB()
      }
      if (db.data.auctionHouse?.endsAt) scheduleAuctionClose(db.data.auctionHouse.endsAt)
    } catch (error) {
      console.error('[auction-house] Gagal menyelesaikan lelang otomatis:', error)
      scheduleAuctionClose(Date.now() + 60_000)
    }
  }, delay)
  auctionTimer.unref?.()
}

async function getAuctionSession(db, now = Date.now()) {
  const data = db.data
  let session = data.auctionHouse
  const itemIds = Array.isArray(session?.itemIds) ? session.itemIds : []
  const hasValidItems = itemIds.length === AUCTION_ITEM_LIMIT &&
    new Set(itemIds).size === AUCTION_ITEM_LIMIT &&
    itemIds.every(id => AUCTION_ITEMS.some(item => item.id === id))
  let changed = false

  if (session && Number.isFinite(Number(session.endsAt)) && Number(session.endsAt) <= now && hasValidItems) {
    if (session.bids && typeof session.bids === 'object') restoreAuctionBids(db, session)
    settleAuctionSession(db, session, now)
    session = data.auctionHouse
    changed = true
  }
  if (settleOrphanedAuctionBids(db, now)) changed = true

  let currentItemIds = Array.isArray(session?.itemIds) ? session.itemIds : []
  const currentSessionValid = Number.isFinite(Number(session?.endsAt)) &&
    Number(session.endsAt) > now &&
    currentItemIds.length === AUCTION_ITEM_LIMIT &&
    new Set(currentItemIds).size === AUCTION_ITEM_LIMIT &&
    currentItemIds.every(id => AUCTION_ITEMS.some(item => item.id === id))

  if (!currentSessionValid) {
    const recovered = recoverAuctionSession(db, session, now)
    if (recovered) {
      session = recovered
      data.auctionHouse = session
      changed = true
      currentItemIds = session.itemIds
    }
  }

  const recoveredSessionValid = Number.isFinite(Number(session?.endsAt)) &&
    Number(session.endsAt) > now &&
    currentItemIds.length === AUCTION_ITEM_LIMIT &&
    new Set(currentItemIds).size === AUCTION_ITEM_LIMIT &&
    currentItemIds.every(id => AUCTION_ITEMS.some(item => item.id === id))

  if (!recoveredSessionValid) {
    const history = Array.isArray(session?.history) ? session.history : []
    const news = Array.isArray(session?.news) ? session.news : []
    session = { ...makeAuctionSession(now), history, news }
    data.auctionHouse = session
    changed = true
  }

  if (!session.bids || typeof session.bids !== 'object') {
    session.bids = {}
    changed = true
  }
  if (!session.pendingConfirmations || typeof session.pendingConfirmations !== 'object') {
    session.pendingConfirmations = {}
    changed = true
  }
  if (restoreAuctionBids(db, session)) changed = true
  if (!Array.isArray(session.history)) session.history = []
  if (!Array.isArray(session.news)) session.news = []

  scheduleAuctionClose(session.endsAt)
  if (changed) await persistAuctionDB()
  return session
}

function findAuctionItem(input, items) {
  const query = normalize(input)
  if (!query) return null
  if (/^\d+$/.test(query)) return items[Number(query) - 1] || null
  return items.find(item => normalize(item.id) === query || normalize(item.name) === query)
    || items.find(item => normalize(item.name).includes(query))
}

function findVaultItem(input, contents) {
  const query = normalize(input)
  if (!query) return null
  if (/^\d+$/.test(query)) return contents[Number(query) - 1] || null
  return contents.find(({ item }) =>
    normalize(item.id) === query || normalize(item.name) === query
  ) || contents.find(({ item }) => normalize(item.name).includes(query))
}

function parseBidAmount(input) {
  const value = String(input || '').replace(/^rp/i, '').replace(/\s/g, '')
  const shorthand = value.match(/^(\d+(?:[.,]\d+)?)([km])$/i)
  let amount
  if (shorthand) {
    const multiplier = shorthand[2].toLowerCase() === 'k' ? 1_000 : 1_000_000
    amount = Number(shorthand[1].replace(',', '.')) * multiplier
  } else if (/^\d[\d.,]*$/.test(value)) {
    amount = Number(value.replace(/[.,]/g, ''))
  }
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null
}

function formatRemaining(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours} jam ${minutes} menit ${seconds} detik`
}

function getAuctionLeaderboard(db, conn, groupMetadata) {
  return filterLeaderboardUsers(Object.entries(db.users || {}), conn, ([jid]) => jid)
    .filter(([, user]) => user?.rpg)
    .map(([jid, user]) => ({
      jid,
      name: user.name || '',
      count: AUCTION_ITEMS.reduce((sum, item) =>
        sum + Math.max(0, Number(user.rpg.mallInventory?.[item.id]) || 0), 0
      )
    }))
    .filter(user => user.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((entry, index) => {
      const identity = getLeaderboardUserIdentity(entry.jid, {
        conn,
        groupMetadata,
        name: entry.name
      })
      return { ...entry, index, mention: identity.mention, display: identity.display }
    })
}

function getVaultContents(rpg) {
  const vault = rpg.auctionVault && typeof rpg.auctionVault === 'object' ? rpg.auctionVault : {}
  return Object.entries(vault)
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([itemId, quantity]) => ({
      item: AUCTION_ITEMS.find(entry => entry.id === itemId),
      itemId,
      quantity: Number(quantity)
    }))
    .filter(entry => entry.item)
}

let handler = async (m, { text = '', usedPrefix, conn, groupMetadata }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const rpg = account.rpg
  const jid = normalizeJid(m.sender)
  const tokens = String(text).trim().split(/\s+/).filter(Boolean)
  const mode = String(tokens[0] || '').toLowerCase()
  const prefix = usedPrefix || '.'
  const session = await getAuctionSession(db)
  const offers = session.itemIds.map(id => AUCTION_ITEMS.find(item => item.id === id))

  if (mode === 'top') {
    const ranked = getAuctionLeaderboard(db, conn, groupMetadata)
    const mentions = ranked.map(user => user.mention).filter(Boolean)
    const rows = ranked.map(user =>
      `🏆 *${user.index + 1}. ${user.display}*\n> ↳ Koleksi lelang : ${user.count}`
    ).join('\n\n')
    return m.reply(
      `╭─❏「 🏆 TOP KOLEKTOR LELANG 」❏\n` +
      `│ 🏆 *KOLEKTOR ITEM LELANG TERBANYAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${rows || '> ↳ Belum ada koleksi lelang.'}\n\n` +
      `─━━━━━━━━━━━━━━─`,
      { mentions }
    )
  }

  if (mode === 'guide') {
    return m.reply(
      `╭─❏「 📖 AUCTION HOUSE GUIDE 」❏\n` +
      `│ 📖 *PANDUAN LELANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Lima item koleksi dilelang bersama selama 5 jam dan daftar ini sama di semua grup.\n` +
      `> ↳ Bid minimum pembuka adalah setengah harga asli item. Bid perlu dikonfirmasi; bid berikutnya tanpa nominal naik Rp 500.000 dari bid tertinggi.\n` +
      `> ↳ Saldo bid ditahan saat konfirmasi. Jika kamu kalah, dana dikembalikan saat lelang selesai; pemenang mendapat item di Auction Vault.\n` +
      `> ↳ Ikut bid membutuhkan *Auction Pass* dan kartu bank yang tidak beku.\n\n` +
      `📌 *INFORMASI*\n` +
      `> ↳ Daftar perintah : *${prefix}ah command*\n` +
      `> ↳ Peringkat kolektor : *${prefix}ah top*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'command') {
    return m.reply(
      `╭─❏「 📋 AUCTION HOUSE COMMAND 」❏\n` +
      `│ 📋 *DAFTAR COMMAND LELANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${prefix}ah — buka lelang bersama dan lihat waktu tersisa\n` +
      `> ↳ ${prefix}ah list — daftar item dan bid tertinggi\n` +
      `> ↳ ${prefix}ah info <nomor/nama> — detail item lelang\n` +
      `> ↳ ${prefix}ah bid <nomor/nama> [nominal] — ajukan bid, lalu konfirmasi\n` +
      `> ↳ ${prefix}ah bid konfirmasi — konfirmasi bid yang tertunda\n` +
      `> ↳ ${prefix}ah konfirmasi — alias untuk konfirmasi bid\n` +
      `> ↳ ${prefix}ah info — lihat bid yang sedang kamu ikuti\n` +
      `> ↳ ${prefix}ah vault — lihat hadiah lelang yang bisa diklaim\n` +
      `> ↳ ${prefix}ah claim <nomor/nama> — klaim hadiah ke koleksi/rumah\n` +
      `> ↳ ${prefix}ah news — 10 berita lelang terbaru\n` +
      `> ↳ ${prefix}ah history/riwayat — pemenang lelang terakhir\n` +
      `> ↳ ${prefix}ah top — lihat kolektor item lelang terbanyak\n\n` +
      `> ↳ Alias lain: ${prefix}lelang dan ${prefix}auctionhouse\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'news') {
    const rows = session.news.map((entry, index) =>
      `*${index + 1}. ${entry.emoji} ${entry.itemName}*\n` +
      `> ↳ ${entry.winnerName} memenangkan lelang seharga ${money(entry.amount)}`
    ).join('\n\n')
    return m.reply(
      `╭─❏「 📰 AUCTION NEWS 」❏\n` +
      `│ 📰 *10 BERITA LELANG TERBARU*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${rows || '> ↳ Belum ada pemenang lelang.'}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'history' || mode === 'riwayat') {
    const personalHistory = Array.isArray(rpg.auctionHistory)
      ? rpg.auctionHistory
      : session.history.filter(entry => normalizeJid(entry.jid) === jid)
    const rows = personalHistory.slice(0, 10).map((entry, index) =>
      `*${index + 1}. ${entry.emoji} ${entry.itemName}*\n` +
      `> ↳ Kamu memenangkan item ini seharga ${money(entry.amount)}`
    ).join('\n\n')
    return m.reply(
      `╭─❏「 🎁 RIWAYAT LELANG 」❏\n` +
      `│ 🎁 *ITEM YANG KAMU DAPATKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${rows || '> ↳ Kamu belum pernah memenangkan item lelang.'}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'vault') {
    const contents = getVaultContents(rpg)
    return m.reply(
      `╭─❏「 📦 AUCTION VAULT 」❏\n` +
      `│ 📦 *HADIAH LELANG MILIKMU*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${contents.length ? contents.map(({ item, quantity }, index) =>
        `*${index + 1}. ${item.emoji} ${item.name}* ×${quantity}`
      ).join('\n') : '> ↳ Vault lelang masih kosong.'}\n\n` +
      `> ↳ Klaim hadiah: *${prefix}ah claim <nomor/nama>*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (['claim', 'collect', 'take', 'ambil'].includes(mode)) {
    const contents = getVaultContents(rpg)
    const selected = findVaultItem(tokens.slice(1).join(' '), contents)
    if (!selected) return m.reply(`❌ Hadiah tidak ada di Auction Vault. Gunakan *${prefix}ah vault* untuk melihat daftarnya.`)

    if (!rpg.mallInventory || typeof rpg.mallInventory !== 'object') rpg.mallInventory = {}
    rpg.auctionVault[selected.itemId] -= 1
    rpg.mallInventory[selected.itemId] = (Number(rpg.mallInventory[selected.itemId]) || 0) + 1
    await persistAuctionDB()
    return m.reply(
      `╭─❏「 ✅ HADIAH DIKLAIM 」❏\n` +
      `│ ${selected.item.emoji} *${selected.item.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Hadiah sudah dikirim ke koleksi rumahmu.\n` +
      `> ↳ Lihat koleksi: *${prefix}cl list*\n` +
      `> ↳ Pajang di rumah: *${prefix}home pajang ${selected.itemId}*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'info' && !tokens[1]) {
    const myBids = offers.map((item, index) => ({
      item,
      index,
      bid: (session.bids[item.id] || []).filter(entry => normalizeJid(entry.jid) === jid)
        .reduce((highest, entry) => Number(entry.amount) > Number(highest?.amount) ? entry : highest, null)
    })).filter(entry => entry.bid)

    return m.reply(
      `╭─❏「 🔎 BID YANG KAMU IKUTI 」❏\n` +
      `│ 🔎 *BID AKTIF MILIKMU*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${myBids.length ? myBids.map(({ item, index, bid }) => {
        const highest = getHighestBid(session, item.id)
        const leading = highest && Number(highest.amount) === Number(bid.amount) && normalizeJid(highest.jid) === jid
        return `*${index + 1}. ${item.emoji} ${item.name}*\n` +
          `> ↳ Bid kamu: ${money(bid.amount)}${leading ? ' • TERTINGGI' : ''}\n` +
          `> ↳ Bid tertinggi: ${highest ? `${money(highest.amount)} oleh ${db.data.users?.[normalizeJid(highest.jid)]?.name || highest.jid.split('@')[0]}` : 'Belum ada bid'}`
      }).join('\n\n') : '> ↳ Kamu belum mengikuti bid aktif.'}\n\n` +
      `⏳ Waktu tersisa: *${formatRemaining(session.endsAt - Date.now())}*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!mode || mode === 'list' || mode === 'daftar') {
    return m.reply(
      `╭─❏「 🔨 AUCTION HOUSE 」❏\n` +
      `│ 🔨 *LELANG BERSAMA* • ${BANK_TIERS[Number(rpg.bankTier)]?.color || BANK_TIERS[0].color} ${BANK_TIERS[Number(rpg.bankTier)]?.name || BANK_TIERS[0].name}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `Malam ini, lonceng balai lelang kembali berdentang. Lima artefak langka dibawa keluar dari peti kaca; para kolektor dari seluruh penjuru dunia berkumpul, saling menaikkan penawaran sebelum palu emas mengetuk untuk terakhir kalinya.\n\n` +
      `${offers.map((item, index) => {
        const highest = getHighestBid(session, item.id)
        const leader = highest
          ? `${money(highest.amount)} • ${db.data.users?.[normalizeJid(highest.jid)]?.name || highest.jid.split('@')[0]}`
          : 'Belum ada bid'
        return `*${index + 1}. ${item.emoji} ${item.name}*\n` +
          `> ↳ Bid minimum: ${money(getMinimumBid(item))}\n` +
          `> ↳ Tertinggi: ${leader}`
      }).join('\n\n')}\n\n` +
      `${session.news.length ? `🏁 *HASIL LELANG TERAKHIR*\n` +
        `${session.news.slice(0, AUCTION_ITEM_LIMIT).map(entry =>
          `> ${entry.emoji} ${entry.itemName} — ${entry.winnerName} (${money(entry.amount)})`
        ).join('\n')}\n\n` : ''}` +
      `⏳ Lelang berakhir dalam: *${formatRemaining(session.endsAt - Date.now())}*\n\n` +
      `📌 *INFO*\n` +
      `> ↳ Bid: ${prefix}ah bid <nomor/nama> [nominal]\n` +
      `> ↳ Bid aktifmu: ${prefix}ah info\n` +
      `> ↳ Vault hadiah: ${prefix}ah vault • News: ${prefix}ah news\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'bid' || ['confirm', 'konfirmasi', 'ya'].includes(mode)) {
    const action = mode === 'bid' ? String(tokens[1] || '').toLowerCase() : mode
    if (action === 'info') {
      const myBids = offers.map((item, index) => ({
        item,
        index,
        bid: (session.bids[item.id] || []).filter(entry => normalizeJid(entry.jid) === jid)
          .reduce((highest, entry) => Number(entry.amount) > Number(highest?.amount) ? entry : highest, null)
      })).filter(entry => entry.bid)

      return m.reply(
        `╭─❏「 🔎 BID YANG KAMU IKUTI 」❏\n` +
        `│ 🔎 *BID AKTIF MILIKMU*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${myBids.length ? myBids.map(({ item, index, bid }) => {
          const highest = getHighestBid(session, item.id)
          const leading = highest && Number(highest.amount) === Number(bid.amount) && normalizeJid(highest.jid) === jid
          return `*${index + 1}. ${item.emoji} ${item.name}*\n` +
            `> ↳ Bid kamu: ${money(bid.amount)}${leading ? ' • TERTINGGI' : ''}\n` +
            `> ↳ Bid tertinggi: ${highest ? `${money(highest.amount)} oleh ${db.data.users?.[normalizeJid(highest.jid)]?.name || highest.jid.split('@')[0]}` : 'Belum ada bid'}`
        }).join('\n\n') : '> ↳ Kamu belum mengikuti bid aktif.'}\n\n` +
        `⏳ Waktu tersisa: *${formatRemaining(session.endsAt - Date.now())}*\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    if (['confirm', 'konfirmasi', 'ya'].includes(action)) {
      const pending = session.pendingConfirmations[jid]
      if (!pending || pending.expiresAt <= Date.now()) {
        delete session.pendingConfirmations[jid]
        await persistAuctionDB()
        return m.reply(`❌ Tidak ada konfirmasi bid yang aktif. Ajukan lagi dengan *${prefix}ah bid <nomor/nama> [nominal]*.`)
      }
      if (pending.endsAt !== session.endsAt || session.endsAt <= Date.now()) {
        delete session.pendingConfirmations[jid]
        await persistAuctionDB()
        return m.reply('❌ Waktu lelang sudah berakhir. Bid ini tidak dapat dikonfirmasi.')
      }

      const item = AUCTION_ITEMS.find(entry => entry.id === pending.itemId)
      if (!item || !session.itemIds.includes(item.id)) {
        delete session.pendingConfirmations[jid]
        await persistAuctionDB()
        return m.reply('❌ Item lelang tidak lagi tersedia. Ajukan bid baru pada sesi aktif.')
      }
      const highest = getHighestBid(session, item.id)
      const minimumBid = getMinimumBid(item)
      const currentFloor = Math.max(minimumBid, Number(highest?.amount) || 0)
      if (pending.amount < minimumBid || pending.amount <= Number(highest?.amount || 0)) {
        delete session.pendingConfirmations[jid]
        await persistAuctionDB()
        return m.reply(
          `❌ Bid tertinggi sudah berubah. Bid minimum sekarang *${money(currentFloor)}*.\n` +
          `Ajukan bid baru melalui *${prefix}ah bid ${item.id}*.`
        )
      }

      const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
      if (!tier.fasilitas.includes('Auction Pass')) {
        return m.reply('❌ Ikut lelang membutuhkan Auction Pass dari Cosmic Card.')
      }
      if (rpg.kartuBeku) return m.reply('❌ Kartu bank sedang beku. Lunasi tagihan bulanan sebelum melakukan penawaran.')
      const balance = Number(rpg.bank) || 0
      const existingBids = Array.isArray(session.bids[item.id]) ? session.bids[item.id] : []
      const previousHeldAmount = existingBids
        .filter(bid => normalizeJid(bid?.jid) === jid && bid?.escrowed)
        .reduce((sum, bid) => sum + (Number(bid.amount) || 0), 0)
      if (balance + previousHeldAmount < pending.amount) {
        delete session.pendingConfirmations[jid]
        await persistAuctionDB()
        return m.reply(`❌ Saldo bank tidak cukup untuk bid ${money(pending.amount)}. Saldo saat ini: ${money(balance)}.`)
      }

      rpg.bank = balance + previousHeldAmount - pending.amount
      session.bids[item.id] = existingBids.filter(bid => normalizeJid(bid?.jid) !== jid)
      session.bids[item.id].push({ jid, amount: pending.amount, at: Date.now(), escrowed: true })
      if (!rpg.auctionBids || typeof rpg.auctionBids !== 'object') rpg.auctionBids = {}
      rpg.auctionBids[item.id] = {
        amount: pending.amount,
        at: Date.now(),
        endsAt: session.endsAt,
        itemIds: [...session.itemIds],
        escrowed: true
      }
      delete session.pendingConfirmations[jid]
      await persistAuctionDB()
      return m.reply(
        `✅ *BID DIKONFIRMASI*\n` +
        `> ↳ Item: ${item.emoji} ${item.name}\n` +
        `> ↳ Bid kamu: ${money(pending.amount)}\n` +
        `> ↳ Dana sudah ditahan dari saldo bank. Jika kalah, dana dikembalikan saat lelang berakhir.\n` +
        `> ↳ Cek status: *${prefix}ah info*`
      )
    }

    const bidTokens = tokens.slice(1)
    let amount = null
    if (bidTokens.length > 1) {
      const parsedAmount = parseBidAmount(bidTokens[bidTokens.length - 1])
      if (parsedAmount !== null) amount = parsedAmount
    }
    const itemInput = (amount === null ? bidTokens : bidTokens.slice(0, -1)).join(' ')
    const item = findAuctionItem(itemInput, offers)
    if (!item) return m.reply(`❌ Item tidak ditemukan. Gunakan *${prefix}ah list* untuk melihat nomor item.`)

    const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
    if (!tier.fasilitas.includes('Auction Pass')) {
      return m.reply('❌ Ikut lelang membutuhkan Auction Pass dari Cosmic Card. Upgrade kartu bank terlebih dahulu.')
    }
    if (rpg.kartuBeku) return m.reply('❌ Kartu bank sedang beku. Lunasi tagihan bulanan sebelum melakukan penawaran.')

    const highest = getHighestBid(session, item.id)
    const minimumBid = getMinimumBid(item)
    const currentFloor = Math.max(minimumBid, Number(highest?.amount) || 0)
    if (amount === null) amount = highest ? currentFloor + 500_000 : minimumBid
    if (!Number.isSafeInteger(amount) || amount < minimumBid || amount <= Number(highest?.amount || 0)) {
      return m.reply(`❌ Bid harus minimal ${money(minimumBid)} dan lebih tinggi dari bid tertinggi. Bid minimum saat ini: ${money(Math.max(minimumBid, currentFloor + (highest ? 1 : 0)))}.`)
    }
    const balance = Number(rpg.bank) || 0
    const heldAmount = (Array.isArray(session.bids[item.id]) ? session.bids[item.id] : [])
      .filter(bid => normalizeJid(bid?.jid) === jid && bid?.escrowed)
      .reduce((sum, bid) => sum + (Number(bid.amount) || 0), 0)
    if (balance + heldAmount < amount) {
      return m.reply(`❌ Saldo bank tidak cukup.\n> ↳ Bid: ${money(amount)}\n> ↳ Saldo: ${money(balance)}`)
    }

    session.pendingConfirmations[jid] = {
      itemId: item.id,
      amount,
      endsAt: session.endsAt,
      expiresAt: Date.now() + BID_CONFIRMATION_TTL
    }
    await persistAuctionDB()
    return m.reply(
      `⚠️ *KONFIRMASI BID*\n` +
      `> ↳ Item: ${item.emoji} ${item.name}\n` +
      `> ↳ Penawaran: ${money(amount)}\n` +
      `> ↳ Bid tertinggi saat ini: ${highest ? money(highest.amount) : 'Belum ada bid'}\n` +
      `> ↳ Saldo belum ditahan sebelum konfirmasi. Setelah dikonfirmasi, saldo ditahan dan dikembalikan jika kamu kalah.\n\n` +
      `Ketik *${prefix}ah bid konfirmasi* dalam 2 menit untuk mengirim bid ini.`
    )
  }

  if (mode === 'info' && tokens[1]) {
    const item = findAuctionItem(tokens.slice(1).join(' '), offers)
    if (!item) return m.reply(`❌ Item tidak ada di sesi lelang ini. Gunakan *${prefix}ah list* atau *${prefix}ah info*.`)
    const highest = getHighestBid(session, item.id)
    return m.reply(
      `╭─❏「 🔎 DETAIL LELANG 」❏\n` +
      `│ ${item.emoji} *${item.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Deskripsi: ${item.description}\n` +
      `> ↳ Bid minimum: ${money(getMinimumBid(item))}\n` +
      `> ↳ Bid tertinggi: ${highest ? money(highest.amount) : 'Belum ada bid'}\n` +
      `> ↳ Pemimpin bid: ${highest ? db.data.users?.[normalizeJid(highest.jid)]?.name || highest.jid.split('@')[0] : '-'}\n` +
      `> ↳ Waktu tersisa: *${formatRemaining(session.endsAt - Date.now())}*\n\n` +
      `> ↳ Ajukan bid: *${prefix}ah bid ${item.id} [nominal]*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(
    `Gunakan *.ah list*, *.ah bid <nomor/nama> [nominal]*, *.ah info*, *.ah vault*, *.ah claim <item>*, *.ah news*, atau *.ah history*.`
  )
}

handler.help = [
  'ah',
  'ah list',
  'ah info [nomor/nama]',
  'ah bid <nomor/nama> [nominal]',
  'ah bid konfirmasi',
  'ah vault',
  'ah claim <nomor/nama>',
  'ah news',
  'ah history',
  'ah top',
  'ah guide',
  'ah command'
]
handler.tags = ['rpg']
handler.alias = ['auction', 'auctionhouse', 'ah']
handler.command = /^(lelang|auction|auctionhouse|ah)$/i
handler.group = true

export default handler
