import { sendRpgButtons, sendRpgConfirmButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, getUserRPG, sendRpgMsg, setRpgFeatureImage } from '../../lib/waifuHelper.js'
import { resolveLid } from '../../lib/simple.js'
import { AUCTION_BIDDER_NAMES, AUCTION_ITEMS, getAuctionItemRarity } from '../../lib/rpg-auctionData.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'
import {
  addRpgMoney,
  compareRpgMoney,
  formatRpgMoney as money,
  getRpgMoneySuffixGuide,
  maxRpgMoney,
  normalizeRpgMoney,
  parseRpgMoneyAmount,
  subtractRpgMoney
} from '../../lib/rpgMoney.js'

const AUCTION_DURATION = 5 * 60 * 60 * 1000
const AUCTION_ITEM_LIMIT = 5
const BID_CONFIRMATION_TTL = 2 * 60 * 1000
const AUCTION_HISTORY_LIMIT = 50
const AUCTION_NEWS_LIMIT = 10
const AUCTION_IMAGE = 'https://c.termai.cc/i101/cR27.webp'
const isValidAuctionAmount = amount =>
  compareRpgMoney(normalizeRpgMoney(amount), 0) > 0
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
  const normalized = jid.split(':')[0]
  const resolved = normalized.endsWith('@lid')
    ? resolveLid(normalized) || global.lids?.[normalized] || global.db?.data?.lids?.[normalized] || normalized
    : normalized
  return `${resolved.split('@')[0].split(':')[0]}${resolved.includes('@lid') ? '@lid' : '@s.whatsapp.net'}`
}

function makeAuctionSession(now = Date.now(), previousItemIds = []) {
  const items = shuffle(AUCTION_ITEMS)
  let selected = items.slice(0, AUCTION_ITEM_LIMIT)
  const previousSet = new Set(previousItemIds)
  if (selected.length === AUCTION_ITEM_LIMIT &&
    previousSet.size === AUCTION_ITEM_LIMIT &&
    selected.every(item => previousSet.has(item.id))) {
    const replacement = items.find(item => !previousSet.has(item.id))
    if (replacement) selected[AUCTION_ITEM_LIMIT - 1] = replacement
  }
  return {
    itemIds: selected.map(item => item.id),
    bids: {},
    pendingConfirmations: {},
    endsAt: now + AUCTION_DURATION,
    settled: false
  }
}

function belongsToAuctionSession(bid, session) {
  if (Number.isFinite(Number(bid?.endsAt)) && Number(bid.endsAt) === Number(session.endsAt)) return true
  const bidItemIds = Array.isArray(bid?.itemIds) ? bid.itemIds : []
  return bidItemIds.length === session.itemIds.length &&
    new Set(bidItemIds).size === session.itemIds.length &&
    session.itemIds.every(itemId => bidItemIds.includes(itemId))
}

function getAuctionBids(db, session, itemId) {
  const byJid = new Map()
  const bids = Array.isArray(session.bids?.[itemId]) ? session.bids[itemId] : []
  for (const bid of bids) {
    if (!bid?.jid || !isValidAuctionAmount(bid.amount)) continue
    const jid = normalizeJid(bid.jid)
    const current = byJid.get(jid)
    if (!current || compareRpgMoney(bid.amount, current.amount) > 0) byJid.set(jid, { ...bid, amount: normalizeRpgMoney(bid.amount), jid })
  }
  for (const [userJid, user] of Object.entries(db.data.users || {})) {
    const bid = user?.rpg?.auctionBids?.[itemId]
    if (!belongsToAuctionSession(bid, session) ||
      !isValidAuctionAmount(bid.amount)) continue
    const jid = normalizeJid(bid.jid || userJid)
    const current = byJid.get(jid)
    const snapshotBid = {
      jid,
      amount: normalizeRpgMoney(bid.amount),
      at: Number(bid.at) || 0,
      escrowed: bid.escrowed === true,
      historyRecorded: bid.historyRecorded === true,
      chatId: bid.chatId
    }
    if (!current ||
      compareRpgMoney(snapshotBid.amount, current.amount) > 0 ||
      (compareRpgMoney(snapshotBid.amount, current.amount) === 0 &&
        ((snapshotBid.escrowed && !current.escrowed) || (snapshotBid.chatId && !current.chatId)))) {
      byJid.set(jid, snapshotBid)
    }
  }
  return [...byJid.values()]
}

function getHighestBid(db, session, itemId) {
  const bids = getAuctionBids(db, session, itemId)
  return bids.reduce((highest, bid) =>
    !highest || compareRpgMoney(bid?.amount, highest?.amount) > 0 ? bid : highest, null
  )
}

function getVisibleHighestBid(db, session, item) {
  return getHighestBid(db, session, item.id) || { amount: normalizeRpgMoney(item.price), jid: null }
}

function getAuctionBidderName(db, jid) {
  if (!jid) return '-'
  const normalizedJid = normalizeJid(jid)
  const users = db?.data?.users || db?.users || global.db?.data?.users || {}
  const user = Object.entries(users)
    .find(([userJid]) => userJid === jid || normalizeJid(userJid) === normalizedJid)?.[1]
  return user?.name || normalizedJid.split('@')[0]
}

function getAuctionUserJids(db, jid, account) {
  const normalizedSenderJid = normalizeJid(jid)
  const users = db?.data?.users || db?.users || global.db?.data?.users || {}
  const accountJids = Object.entries(users)
    .filter(([userJid, user]) =>
      user?.rpg === account?.rpg || normalizeJid(userJid) === normalizedSenderJid
    )
    .map(([userJid]) => normalizeJid(userJid))
  return [...new Set([normalizedSenderJid, ...accountJids].filter(Boolean))]
}

function getAuctionRivalName(session, itemId) {
  const seed = `${session.endsAt}:${itemId}`
  const hash = [...seed].reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0)
  return AUCTION_BIDDER_NAMES[hash % AUCTION_BIDDER_NAMES.length]
}

function getActiveUserBid(db, session, itemId, jids, rpg) {
  const normalizedJids = new Set((Array.isArray(jids) ? jids : [jids]).map(normalizeJid))
  const matchingBids = getAuctionBids(db, session, itemId)
    .filter(bid => normalizedJids.has(normalizeJid(bid.jid)))
  const accountBid = rpg?.auctionBids?.[itemId]
  if (belongsToAuctionSession(accountBid, session) &&
    isValidAuctionAmount(accountBid.amount)) {
    const accountJid = normalizedJids.values().next().value
    matchingBids.push({
      jid: normalizeJid(accountJid || accountBid.jid),
      amount: normalizeRpgMoney(accountBid.amount),
      at: Number(accountBid.at) || 0,
      escrowed: accountBid.escrowed === true
    })
  }
  return matchingBids.reduce((highest, bid) =>
    !highest || compareRpgMoney(bid.amount, highest?.amount) > 0 ? bid : highest, null)
}

function isAuctionUser(bidJid, userJids) {
  const normalizedBidJid = normalizeJid(bidJid)
  return userJids.some(userJid => normalizeJid(userJid) === normalizedBidJid)
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
      if (!session.itemIds.includes(itemId) || !belongsToAuctionSession(bid, session)) continue
      if (!isValidAuctionAmount(bid.amount)) continue
      const jid = normalizeJid(userJid)
      const bids = Array.isArray(session.bids[itemId]) ? session.bids[itemId] : (session.bids[itemId] = [])
      const existingIndex = bids.findIndex(entry => normalizeJid(entry?.jid) === jid)
      const restoredBid = {
        jid,
        amount: normalizeRpgMoney(bid.amount),
        at: Number(bid.at) || 0,
        escrowed: bid.escrowed === true,
        historyRecorded: bid.historyRecorded === true,
        chatId: bid.chatId
      }
      if (existingIndex < 0) {
        bids.push(restoredBid)
        changed = true
      } else if (Number(bids[existingIndex].amount) < restoredBid.amount ||
        (Number(bids[existingIndex].amount) === restoredBid.amount &&
          ((restoredBid.escrowed && !bids[existingIndex].escrowed) ||
            (restoredBid.chatId && !bids[existingIndex].chatId)))) {
        bids[existingIndex] = restoredBid
        changed = true
      }
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
      if (!session.itemIds.includes(itemId) || !isValidAuctionAmount(bid.amount)) continue
      if (!Array.isArray(session.bids[itemId])) session.bids[itemId] = []
      session.bids[itemId].push({
        jid: normalizeJid(userJid),
        amount: normalizeRpgMoney(bid.amount),
        at: Number(bid.at) || 0,
        escrowed: bid.escrowed === true,
        historyRecorded: bid.historyRecorded === true,
        chatId: bid.chatId
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
      if (!isValidAuctionAmount(bid.amount)) continue
      let session = orphaned.get(endsAt)
      if (!session) {
        session = { itemIds: [], bids: {}, pendingConfirmations: {}, endsAt }
        orphaned.set(endsAt, session)
      }
      if (!session.itemIds.includes(itemId)) session.itemIds.push(itemId)
      if (!Array.isArray(session.bids[itemId])) session.bids[itemId] = []
      session.bids[itemId].push({
        jid: normalizeJid(userJid),
        amount: normalizeRpgMoney(bid.amount),
        at: Number(bid.at) || 0,
        escrowed: bid.escrowed === true,
        historyRecorded: bid.historyRecorded === true,
        chatId: bid.chatId
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
    const bids = getAuctionBids(db, session, itemId)
    const bestBidByUser = new Map()

    for (const bid of bids) {
      if (!bid?.jid || !isValidAuctionAmount(bid.amount)) continue
      const jid = normalizeJid(bid.jid)
      const previous = bestBidByUser.get(jid)
      if (!previous || compareRpgMoney(bid.amount, previous.amount) > 0) {
        bestBidByUser.set(jid, { ...bid, jid })
      }
    }

    for (const [bidderJid, bid] of bestBidByUser) {
      if (!bid.escrowed || bid.historyRecorded) continue
      const account = getUserRPG(db, bidderJid)
      if (!account?.rpg) continue
      if (!Array.isArray(account.rpg.riwayat)) account.rpg.riwayat = []
      account.rpg.riwayat.unshift(`-${money(bid.amount)} Bid lelang ${item.name}`)
      account.rpg.riwayat.length = Math.min(account.rpg.riwayat.length, 20)
    }

    const candidates = [...bestBidByUser.values()].sort((a, b) =>
      compareRpgMoney(b.amount, a.amount) || Number(a.at) - Number(b.at)
    )

    let winner = null
    for (const bid of candidates) {
      const account = getUserRPG(db, bid.jid)
      if (!account?.rpg) continue
      const balance = normalizeRpgMoney(account.rpg.bank)
      if (!bid.escrowed && compareRpgMoney(balance, bid.amount) < 0) continue
      winner = { bid, account }
      break
    }

    for (const [bidderJid, bid] of bestBidByUser) {
      if (winner && bidderJid === winner.bid.jid) continue
      if (!bid.escrowed) continue
      const account = getUserRPG(db, bidderJid)
      if (account?.rpg) {
        account.rpg.bank = addRpgMoney(account.rpg.bank, bid.amount)
        if (!Array.isArray(account.rpg.riwayat)) account.rpg.riwayat = []
        account.rpg.riwayat.unshift(`+${money(bid.amount)} Pengembalian bid ${item.name}`)
        account.rpg.riwayat.length = Math.min(account.rpg.riwayat.length, 20)
      }
    }

    if (!winner) continue

    const { bid, account } = winner
    if (!bid.escrowed) {
      account.rpg.bank = subtractRpgMoney(account.rpg.bank, bid.amount)
      if (!Array.isArray(account.rpg.riwayat)) account.rpg.riwayat = []
      account.rpg.riwayat.unshift(`-${money(bid.amount)} Bid lelang ${item.name}`)
    }
    if (!account.rpg.auctionVault || typeof account.rpg.auctionVault !== 'object') {
      account.rpg.auctionVault = {}
    }
    account.rpg.auctionVault[itemId] = (Number(account.rpg.auctionVault[itemId]) || 0) + 1
    if (!Array.isArray(account.rpg.riwayat)) account.rpg.riwayat = []
    account.rpg.riwayat.length = Math.min(account.rpg.riwayat.length, 20)

    const winnerName = getAuctionBidderName(db, bid.jid)
    const historyEntry = {
      itemId,
      itemName: item.name,
      emoji: item.emoji,
      jid: bid.jid,
      winnerName,
      amount: bid.amount,
      chatId: bid.chatId,
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
      ...makeAuctionSession(now, session.itemIds),
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
    session = { ...makeAuctionSession(now, currentItemIds), history, news }
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
  return parseRpgMoneyAmount(input)
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
  m = setRpgFeatureImage(conn, m, AUCTION_IMAGE)
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const rpg = account.rpg
  const userJids = getAuctionUserJids(db, m.sender, account)
  const jid = normalizeJid(m.sender)
  const tokens = String(text).trim().split(/\s+/).filter(Boolean)
  const mode = String(tokens[0] || '').toLowerCase()
  const prefix = usedPrefix || '.'
  const session = await getAuctionSession(db)
  const offers = session.itemIds.map(id => AUCTION_ITEMS.find(item => item.id === id))
  const groupAuctionNews = session.news.filter(entry => entry.chatId === m.chat)

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
    return sendRpgMsg(conn, m,
      `╭─❏「 📖 AUCTION HOUSE GUIDE 」❏\n` +
      `│ 📖 *PANDUAN LELANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pilih item dari tombol *PILIH ITEM / BID* pada *${prefix}ah*. Bot otomatis mengajukan bid Rp 500.000 di atas bid tertinggi, lalu meminta konfirmasi.\n` +
      `> ↳ Untuk bid manual, ketik *${prefix}ah bid <nomor/nama> <nominal>*. Contoh: *${prefix}ah bid 1 2M*.\n` +
      `> ↳ Daftar sufiks nominal: *${prefix}ah money*. Bid hanya dikirim setelah kamu menekan tombol konfirmasi; tekan batalkan jika tidak jadi.\n` +
      `> ↳ Saldo dipotong setelah konfirmasi. Dana bid dikembalikan jika kamu kalah; pemenang mengambil hadiah lewat *${prefix}ah vault* lalu *${prefix}ah claim <nomor/nama>*.\n` +
      `> ↳ Ikut bid membutuhkan *Auction Pass* dan kartu bank yang tidak beku. Lelang berlangsung 5 jam.\n\n` +
      `─━━━━━━━━━━━━━━─`, AUCTION_IMAGE)
  }

  if (mode === 'money') {
    return m.reply(
      `╭─❏「 💰 DAFTAR SUFIKS UANG 」❏\n` +
      `│ 💰 NOMINAL RINGKAS UNTUK TAMPILAN & BID\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Gunakan sufiks langsung setelah angka, contoh: *${prefix}ah bid 1 19Qa*.\n` +
      `Nominal bid dan saldo ditampilkan ringkas; nama di bawah menunjukkan nilai tiap sufiks.\n\n` +
      `${getRpgMoneySuffixGuide()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'command') {
    const fallbackText =
      `╭─❏「 📋 AUCTION HOUSE COMMAND 」❏\n` +
      `│ 📋 *DAFTAR COMMAND LELANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${prefix}ah — buka lelang bersama dan lihat waktu tersisa\n` +
      `> ↳ ${prefix}ah list — daftar item dan bid tertinggi\n` +
      `> ↳ ${prefix}ah info <nomor/nama> — detail item lelang\n` +
      `> ↳ ${prefix}ah bid <nomor/nama> [nominal] — ajukan bid, lalu konfirmasi\n` +
      `> ↳ ${prefix}ah bid — lihat bid aktif milikmu\n` +
      `> ↳ ${prefix}ah bid info — alias untuk melihat bid aktif\n` +
      `> ↳ ${prefix}ah bid konfirmasi — konfirmasi bid yang tertunda\n` +
      `> ↳ ${prefix}ah bid batal — batalkan bid yang menunggu konfirmasi\n` +
      `> ↳ ${prefix}ah konfirmasi — alias untuk konfirmasi bid\n` +
      `> ↳ ${prefix}ah info — lihat bid yang sedang kamu ikuti\n` +
      `> ↳ ${prefix}ah vault — lihat hadiah lelang yang bisa diklaim\n` +
      `> ↳ ${prefix}ah claim <nomor/nama> — klaim hadiah ke koleksi/rumah\n` +
      `> ↳ ${prefix}ah news — 10 berita lelang terbaru\n` +
      `> ↳ ${prefix}ah history/riwayat — pemenang lelang terakhir\n` +
      `> ↳ ${prefix}ah top — lihat kolektor item lelang terbanyak\n\n` +
      `> ↳ ${prefix}ah money — daftar sufiks nominal uang\n\n` +
      `> ↳ ${prefix}ah guide / command — panduan dan daftar perintah\n\n` +
      `> ↳ Alias lain: ${prefix}lelang dan ${prefix}auctionhouse\n\n` +
      `─━━━━━━━━━━━━━━─`
    return m.reply(fallbackText)
  }

  if (mode === 'news') {
    const rows = groupAuctionNews.map((entry, index) =>
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


  if ((mode === 'info' && !tokens[1]) ||
    (mode === 'bid' && (!tokens[1] || String(tokens[1]).toLowerCase() === 'info'))) {
    const myBids = offers.map((item, index) => ({
      item,
      index,
      bid: getActiveUserBid(db, session, item.id, userJids, rpg)
    })).filter(entry => entry.bid)

    return m.reply(
      `╭─❏「 🔎 BID YANG KAMU IKUTI 」❏\n` +
      `│ 📋 INFORMASI BID AKTIF\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${myBids.length ? myBids.map(({ item, index, bid }) => {
        const highest = getVisibleHighestBid(db, session, item)
        const leading = highest && compareRpgMoney(highest.amount, bid.amount) === 0 &&
          isAuctionUser(highest.jid, userJids)
        const leaderName = highest.jid ? getAuctionBidderName(db, highest.jid) : getAuctionRivalName(session, item.id)
        return `╭─❏「 ${item.emoji} BID ${index + 1} 」❏\n` +
          `│ 🏷️ ${item.name}\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> 💰 Bid kamu: *${money(bid.amount)}*${leading ? ' • TERTINGGI' : ''}\n` +
          `> 🏆 Bid tertinggi: *${money(highest.amount)}*\n` +
          `> 👤 Penawar tertinggi: ${leaderName}`
      }).join('\n\n') : '> ↳ Kamu belum mengikuti bid aktif.'}\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `⏳ Waktu tersisa: *${formatRemaining(session.endsAt - Date.now())}*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }




  if (!mode || mode === 'list' || mode === 'daftar') {
    const rows = offers.map((item, index) => {
      const highest = getVisibleHighestBid(db, session, item)
      return {
        title: `${index + 1}. ${item.emoji} ${item.name}`,
        description: `Tertinggi ${money(highest.amount)} • pilih untuk bid +Rp500K`,
        id: `${prefix}ah bid ${item.id}`
      }
    })
    const auctionText =
      `╭─❏「 🔨 AUCTION HOUSE 」❏\n` +
      `│ 🏛️ LELANG BERSAMA\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `💳 *Kartu Bank:* ${BANK_TIERS[Number(rpg.bankTier)]?.color || BANK_TIERS[0].color} ${BANK_TIERS[Number(rpg.bankTier)]?.name || BANK_TIERS[0].name}\n\n` +
      `Malam ini, lonceng balai lelang kembali berdentang. Lima artefak langka dibawa keluar dari peti kaca; para kolektor dari seluruh penjuru dunia berkumpul, saling menaikkan penawaran sebelum palu emas mengetuk untuk terakhir kalinya.\n\n` +
      `⏳ *Waktu tersisa:* ${formatRemaining(session.endsAt - Date.now())}\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `🔨 *DAFTAR ITEM LELANG*\n\n` +
      `${offers.map((item, index) => {
        const highest = getVisibleHighestBid(db, session, item)
        const leader = highest.jid
          ? getAuctionBidderName(db, highest.jid)
          : getAuctionRivalName(session, item.id)
        return `*${index + 1}. ${item.emoji} ${item.name}*\n` +
          `> ↳ Bid minimum: ${money(getMinimumBid(item))}\n` +
          `> ↳ Bid tertinggi: ${money(highest.amount)}\n` +
          `> ↳ Pemimpin bid: ${leader}`
      }).join('\n\n')}\n\n` +
      `${groupAuctionNews.length ? `─━━━━━━━━━━━━━━─\n` +
        `🏁 *HASIL LELANG TERAKHIR*\n\n` +
        `${groupAuctionNews.slice(0, AUCTION_ITEM_LIMIT).map(entry =>
          `> ${entry.emoji} ${entry.itemName}\n` +
          `> ↳ Bid akhir: ${money(entry.amount)}\n` +
          `> ↳ Pemenang: ${entry.winnerName}`
        ).join('\n')}\n\n` : ''}` +
      `─━━━━━━━━━━━━━━─\n` +
      `📌 *BID MANUAL*\n` +
      `> ${prefix}ah bid <nomor/nama> [nominal]\n` +
      `> Tanpa nominal, bid otomatis naik Rp 500.000 dari bid tertinggi.\n\n` +
      `─━━━━━━━━━━━━━━─`
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      footer: '',
      text: auctionText,
      buttonText: '📋 PILIH ITEM / BID',
      sections: [{ title: 'Pilih item yang akan dibid', rows }],
      buttons: [
        ['💳 Cek saldo', `${prefix}money`],
        ['🔤 Daftar sufiks uang', `${prefix}money suffix`]
      ],
      fallbackText: auctionText,
      image: AUCTION_IMAGE,
      noHeader: true,
      sendInteractive: typeof conn.sendInteractive === 'function'
        ? interactiveMessage => conn.sendInteractive(m.chat, interactiveMessage, { quoted: m })
        : undefined
    })
  }

  if (mode === 'bid' || ['confirm', 'konfirmasi', 'ya'].includes(mode)) {
    const action = mode === 'bid' ? String(tokens[1] || '').toLowerCase() : mode
    if (['batal', 'cancel', 'tidak'].includes(action)) {
      const pendingJid = userJids.find(userJid => session.pendingConfirmations[userJid])
      if (!pendingJid) return m.reply('Tidak ada penawaran yang menunggu konfirmasi.')
      for (const userJid of userJids) delete session.pendingConfirmations[userJid]
      await persistAuctionDB()
      return m.reply('↩️ Penawaran dibatalkan. Saldo bank kamu tetap aman.')
    }
    if (['confirm', 'konfirmasi', 'ya'].includes(action)) {
      const pendingJid = userJids.find(userJid => session.pendingConfirmations[userJid])
      const pending = pendingJid ? session.pendingConfirmations[pendingJid] : null
      if (!pending || pending.expiresAt <= Date.now()) {
        for (const userJid of userJids) delete session.pendingConfirmations[userJid]
        await persistAuctionDB()
        return m.reply(`╭─❏「 ❌ KONFIRMASI BID 」❏
│ ⚠️ KONFIRMASI KEDALUWARSA
╰─━━━━━━━━━━━━━━─

> ↳ Tidak ada konfirmasi bid yang aktif.
> ↳ Ajukan kembali dengan *${prefix}ah bid <nomor/nama> [nominal]*.`)
      }
      if (pending.endsAt !== session.endsAt || session.endsAt <= Date.now()) {
        for (const userJid of userJids) delete session.pendingConfirmations[userJid]
        await persistAuctionDB()
        return m.reply(`╭─❏「 ❌ LELANG BERAKHIR 」❏
│ ⏳ WAKTU LELANG HABIS
╰─━━━━━━━━━━━━━━─

> ↳ Waktu lelang sudah berakhir.
> ↳ Bid ini tidak dapat dikonfirmasi.`)
      }

      const item = AUCTION_ITEMS.find(entry => entry.id === pending.itemId)
      if (!item || !session.itemIds.includes(item.id)) {
        for (const userJid of userJids) delete session.pendingConfirmations[userJid]
        await persistAuctionDB()
        return m.reply(`╭─❏「 ❌ ITEM TIDAK TERSEDIA 」❏
│ 🔨 STATUS LELANG
╰─━━━━━━━━━━━━━━─

> ↳ Item lelang tidak lagi tersedia.
> ↳ Ajukan bid baru pada sesi lelang aktif.`)
      }
      const highest = getHighestBid(db, session, item.id)
      const currentFloor = maxRpgMoney(item.price, highest?.amount || 0)
      if (compareRpgMoney(pending.amount, currentFloor) <= 0) {
        for (const userJid of userJids) delete session.pendingConfirmations[userJid]
        await persistAuctionDB()
        return m.reply(
          `╭─❏「 ⚠️ BID BERUBAH 」❏\n` +
          `│ 📈 BID TERTINGGI DIPERBARUI\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Bid tertinggi sudah berubah.\n` +
          `> ↳ Bid minimum sekarang: *${money(addRpgMoney(currentFloor, 1))}*.\n\n` +
          `> ↳ Ajukan bid baru melalui *${prefix}ah bid ${item.id}*.\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
      if (!tier.fasilitas.includes('Auction Pass')) {
        return m.reply(`╭─❏「 🔒 AUCTION PASS 」❏
│ 💳 AKSES LELANG
╰─━━━━━━━━━━━━━━─

> ↳ Ikut lelang membutuhkan Auction Pass dari Cosmic Card.`)
      }
      if (rpg.kartuBeku) return m.reply(`╭─❏「 ❄️ KARTU BANK BEKU 」❏
│ 💳 STATUS KARTU BANK
╰─━━━━━━━━━━━━━━─

> ↳ Kartu bank sedang beku.
> ↳ Lunasi tagihan bulanan sebelum melakukan penawaran.`)
      const balance = normalizeRpgMoney(rpg.bank)
      const existingBids = Array.isArray(session.bids[item.id]) ? session.bids[item.id] : []
      const previousHeldAmount = getAuctionBids(db, session, item.id)
        .filter(bid => normalizeJid(bid?.jid) === jid && bid?.escrowed)
        .reduce((sum, bid) => addRpgMoney(sum, normalizeRpgMoney(bid.amount)), 0)
      if (compareRpgMoney(addRpgMoney(balance, previousHeldAmount), pending.amount) < 0) {
        for (const userJid of userJids) delete session.pendingConfirmations[userJid]
        await persistAuctionDB()
        return m.reply(
          `╭─❏「 ❌ SALDO TIDAK CUKUP 」❏\n` +
          `│ 💳 PEMBAYARAN BID\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Nominal bid: *${money(pending.amount)}*\n` +
          `> ↳ Saldo bank: *${money(balance)}*\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      rpg.bank = subtractRpgMoney(addRpgMoney(balance, previousHeldAmount), pending.amount)
      if (!Array.isArray(rpg.riwayat)) rpg.riwayat = []
      if (compareRpgMoney(previousHeldAmount, 0) > 0) {
        rpg.riwayat.unshift(`+${money(previousHeldAmount)} Pengembalian bid sebelumnya ${item.name}`)
      }
      rpg.riwayat.unshift(`-${money(pending.amount)} Bid lelang ${item.name}`)
      rpg.riwayat.length = Math.min(rpg.riwayat.length, 20)
      const confirmedAt = Date.now()
      session.bids[item.id] = existingBids.filter(bid => !isAuctionUser(bid?.jid, userJids))
      session.bids[item.id].push({
        jid,
        amount: pending.amount,
        at: confirmedAt,
        escrowed: true,
        historyRecorded: true,
        chatId: pending.chatId || m.chat
      })
      if (!rpg.auctionBids || typeof rpg.auctionBids !== 'object') rpg.auctionBids = {}
      rpg.auctionBids[item.id] = {
        jid,
        amount: pending.amount,
        at: confirmedAt,
        chatId: pending.chatId || m.chat,
        endsAt: session.endsAt,
        itemIds: [...session.itemIds],
        escrowed: true,
        historyRecorded: true
      }
      for (const userJid of userJids) delete session.pendingConfirmations[userJid]
      await persistAuctionDB()
      const visibleHighest = getVisibleHighestBid(db, session, item)
      const leading = isAuctionUser(visibleHighest.jid, userJids)
      return m.reply(
        `╭─❏「 ✅ BID DIKONFIRMASI 」❏\n` +
        `│ 🔨 HASIL PENAWARAN\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> 🏷️ Item: ${item.emoji} ${item.name}\n` +
        `> 💰 Bid kamu: ${money(pending.amount)}\n` +
        `> 🏆 Bid tertinggi: ${money(visibleHighest.amount)}\n` +
        `> 👤 Pemimpin bid: ${leading ? 'Kamu' : visibleHighest.jid ? getAuctionBidderName(db, visibleHighest.jid) : '-'}\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `💳 *INFORMASI DANA*\n` +
        `> ↳ Dana sudah dipotong dari saldo bank.\n` +
        `> ↳ Jika kalah, dana dikembalikan saat lelang berakhir.\n\n` +
        `> ↳ Cek status bid: *${prefix}ah info*\n` +
        `─━━━━━━━━━━━━━━─`
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
    if (!item) return m.reply(`╭─❏「 ❌ ITEM TIDAK DITEMUKAN 」❏
│ 🔨 INFORMASI LELANG
╰─━━━━━━━━━━━━━━─

> ↳ Item tidak ditemukan.
> ↳ Gunakan *${prefix}ah list* untuk melihat nomor item.`)

    const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
    if (!tier.fasilitas.includes('Auction Pass')) {
      return m.reply(`╭─❏「 🔒 AUCTION PASS 」❏
│ 💳 AKSES LELANG
╰─━━━━━━━━━━━━━━─

> ↳ Ikut lelang membutuhkan Auction Pass dari Cosmic Card.
> ↳ Upgrade kartu bank terlebih dahulu.`)
    }
    if (rpg.kartuBeku) return m.reply(`╭─❏「 ❄️ KARTU BANK BEKU 」❏
│ 💳 STATUS KARTU BANK
╰─━━━━━━━━━━━━━━─

> ↳ Kartu bank sedang beku.
> ↳ Lunasi tagihan bulanan sebelum melakukan penawaran.`)

    const highest = getHighestBid(db, session, item.id)
    const currentFloor = maxRpgMoney(item.price, highest?.amount || 0)
    if (amount === null) amount = addRpgMoney(currentFloor, 500_000)
    if (!isValidAuctionAmount(amount) || compareRpgMoney(amount, currentFloor) <= 0) {
      return m.reply(
        `╭─❏「 ❌ BID TIDAK VALID 」❏\n` +
        `│ 💰 SYARAT PENAWARAN\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Bid harus lebih tinggi dari bid tertinggi.\n` +
        `> ↳ Bid minimum saat ini: *${money(addRpgMoney(currentFloor, 1))}*.\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    const balance = normalizeRpgMoney(rpg.bank)
    const heldAmount = getAuctionBids(db, session, item.id)
      .filter(bid => normalizeJid(bid?.jid) === jid && bid?.escrowed)
      .reduce((sum, bid) => addRpgMoney(sum, normalizeRpgMoney(bid.amount)), 0)
    if (compareRpgMoney(addRpgMoney(balance, heldAmount), amount) < 0) {
      return m.reply(
        `╭─❏「 ❌ SALDO TIDAK CUKUP 」❏\n` +
        `│ 💳 PEMBAYARAN BID\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Nominal bid: *${money(amount)}*\n` +
        `> ↳ Saldo bank: *${money(balance)}*\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    session.pendingConfirmations[jid] = {
      itemId: item.id,
      amount,
      chatId: m.chat,
      endsAt: session.endsAt,
      expiresAt: Date.now() + BID_CONFIRMATION_TTL
    }
    await persistAuctionDB()
    return sendRpgConfirmButtons(conn, m, {
      text: `╭─❏「 ⚠️ KONFIRMASI BID 」❏\n` +
      `│ 🔨 DETAIL PENAWARAN\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> 🏷️ Item: ${item.emoji} ${item.name}\n` +
      `> 💰 Penawaran kamu: ${money(amount)}\n` +
      `> 🏆 Bid tertinggi saat ini: ${money(currentFloor)}\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `💳 *INFORMASI DANA*\n` +
      `> ↳ Saldo belum ditahan sebelum konfirmasi.\n` +
      `> ↳ Setelah dikonfirmasi, nominal langsung dipotong dan dikembalikan jika kamu kalah.\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `📌 *KONFIRMASI PENAWARAN*\n` +
      `> ↳ Ketik *${prefix}ah bid konfirmasi* dalam 2 menit untuk mengirim bid ini.\n` +
      `─━━━━━━━━━━━━━━─`,
      footer: '',
      acceptText: '🏆 Konfirmasi Bid',
      acceptCommand: `${prefix}ah bid konfirmasi`,
      cancelText: '↩️ Batalkan Bid',
      cancelCommand: `${prefix}ah bid batal`,
      image: AUCTION_IMAGE,
      noThumbnail: true,
      noHeader: true
    })
  }

  if (mode === 'info' && tokens[1]) {
    const item = findAuctionItem(tokens.slice(1).join(' '), offers)
    if (!item) return m.reply(`╭─❏「 ❌ ITEM TIDAK DITEMUKAN 」❏
│ 🔨 INFORMASI LELANG
╰─━━━━━━━━━━━━━━─

> ↳ Item tidak ada di sesi lelang ini.
> ↳ Gunakan *${prefix}ah list* atau *${prefix}ah info*.`)
    const highest = getVisibleHighestBid(db, session, item)
    const rarity = getAuctionItemRarity(item)
    return m.reply(
      `╭─❏「 🔎 DETAIL LELANG 」❏\n` +
      `│ 🏛️ INFORMASI ITEM\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🏷️ *${item.emoji} ${item.name}*\n\n` +
      `> ↳ Rarity: ${rarity.stars} ${rarity.name} ${rarity.icon}\n` +
      `> ↳ Deskripsi: ${item.description}\n` +
      `> ↳ Bid minimum: ${money(getMinimumBid(item))}\n` +
      `> ↳ Bid tertinggi: ${money(highest.amount)}\n` +
      `> ↳ Pemimpin bid: ${highest.jid ? getAuctionBidderName(db, highest.jid) : getAuctionRivalName(session, item.id)}\n` +
      `> ↳ Waktu tersisa: *${formatRemaining(session.endsAt - Date.now())}*\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `📌 *AJUKAN PENAWARAN*\n` +
      `> ↳ *${prefix}ah bid ${item.id} [nominal]*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(
    `╭─❏「 📌 AUCTION HOUSE 」❏\n` +
    `│ 🔨 DAFTAR COMMAND\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ *.ah list* — daftar item lelang\n` +
    `> ↳ *.ah bid <nomor/nama> [nominal]* — ajukan bid\n` +
    `> ↳ *.ah info* — lihat bid aktif\n` +
    `> ↳ *.ah vault* — lihat vault hadiah\n` +
    `> ↳ *.ah claim <item>* — klaim hadiah\n` +
    `> ↳ *.ah news* — berita lelang\n` +
    `> ↳ *.ah history* — riwayat lelang\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = [
  'ah',
  'ah list',
  'ah info [nomor/nama]',
  'ah bid <nomor/nama> [nominal/sufiks]',
  'ah bid konfirmasi',
  'ah money',
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
