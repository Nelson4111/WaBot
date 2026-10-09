import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { AUCTION_ITEMS } from '../../lib/rpg-auctionData.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

const AUCTION_DURATION = 5 * 60 * 60 * 1000
const AUCTION_ITEM_LIMIT = 5
const money = value => `Rp ${Number(value).toLocaleString('id-ID')}`
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')

function shuffle(items) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

function getAuctionSession(now = Date.now()) {
  const data = global.db.data
  let session = data.auctionHouse
  const itemIds = Array.isArray(session?.itemIds) ? session.itemIds : []
  const hasValidItems = itemIds.length === AUCTION_ITEM_LIMIT &&
    new Set(itemIds).size === AUCTION_ITEM_LIMIT &&
    itemIds.every(id => AUCTION_ITEMS.some(item => item.id === id))

  if (!session || !Number.isFinite(Number(session.endsAt)) || Number(session.endsAt) <= now || !hasValidItems) {
    session = {
      itemIds: shuffle(AUCTION_ITEMS).slice(0, AUCTION_ITEM_LIMIT).map(item => item.id),
      soldItems: [],
      endsAt: now + AUCTION_DURATION
    }
    data.auctionHouse = session
    return { session, refreshed: true }
  }

  if (!Array.isArray(session.soldItems)) session.soldItems = []
  session.soldItems = session.soldItems.filter(id => itemIds.includes(id))
  return { session, refreshed: false }
}

function findAuctionItem(input, items) {
  const query = normalize(input)
  if (!query) return null
  if (/^\d+$/.test(query)) return items[Number(query) - 1] || null
  return items.find(item => normalize(item.id) === query || normalize(item.name) === query)
    || items.find(item => normalize(item.name).includes(query))
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
      return {
        ...entry,
        index,
        mention: identity.mention,
        display: identity.display
      }
    })
}

let handler = async (m, { text = '', usedPrefix, conn, groupMetadata }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const rpg = account.rpg
  const tokens = String(text).trim().split(/\s+/).filter(Boolean)
  const mode = String(tokens[0] || '').toLowerCase()
  const prefix = usedPrefix || '.'

  if (mode === 'top') {
    const ranked = getAuctionLeaderboard(db, conn, groupMetadata)
    const mentions = ranked.map(user => user.mention).filter(Boolean)
    const rows = ranked.map(user =>
      `🏆 *${user.index + 1}. ${user.display}*\n> ↳ Koleksi lelang : ${user.count}`
    ).join('\n\n')
    return m.reply(
      `╭─❏「 🏆 TOP KOLEKTOR LELANG 」❏\n` +
      `│ 🏆 *PEMBELI DENGAN KOLEKSI LELANG TERBANYAK*\n` +
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
      `> ↳ Auction House menyediakan lima item koleksi acak dalam setiap sesi.\n` +
      `> ↳ Sesi lelang diperbarui setiap 5 jam. Item yang terjual tidak dapat dibeli lagi sampai sesi berikutnya.\n` +
      `> ↳ Pembelian menggunakan saldo bank dan membutuhkan *Auction Pass* dari Cosmic Card.\n` +
      `> ↳ Item yang dibeli masuk ke koleksi dan dapat dipajang di rumah.\n\n` +
      `📌 *INFORMASI*\n` +
      `> ↳ Lihat daftar perintah : *${prefix}ah command*\n` +
      `> ↳ Peringkat kolektor : *${prefix}ah top*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'command') {
    return m.reply(
      `╭─❏「 📋 AUCTION HOUSE COMMAND 」❏\n` +
      `│ 📋 *DAFTAR COMMAND LELANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${prefix}ah — lihat lima item yang sedang dilelang dan waktu tersisa\n` +
      `> ↳ ${prefix}ah list — lihat daftar item lelang\n` +
      `> ↳ ${prefix}ah info <nomor/nama> — detail item lelang\n` +
      `> ↳ ${prefix}ah beli <nomor/nama> — beli item dengan saldo bank\n` +
      `> ↳ ${prefix}ah top — lihat kolektor item lelang terbanyak\n` +
      `> ↳ ${prefix}ah guide — panduan Auction House\n\n` +
      `> ↳ Alias lain: ${prefix}lelang dan ${prefix}auctionhouse\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
  if (!tier.fasilitas.includes('Auction Pass')) {
    return m.reply(`❌ Akses lelang membutuhkan Auction Pass dari Cosmic Card. Upgrade kartu bank untuk membuka *.lelang*.`)
  }
  if (rpg.kartuBeku) return m.reply('❌ Kartu bank sedang beku. Lunasi tagihan bulanan sebelum melakukan penawaran.')

  const { session, refreshed } = getAuctionSession()
  if (refreshed) await saveDB(db)
  const offers = session.itemIds.map(id => AUCTION_ITEMS.find(item => item.id === id))
  if (!rpg.mallInventory || typeof rpg.mallInventory !== 'object') rpg.mallInventory = {}

  if (!mode || mode === 'list' || mode === 'daftar') {
    return m.reply(
      `╭─❏「 🔨 AUCTION HOUSE 」❏\n` +
      `│ 🔨 *LELANG ITEM EKSKLUSIF* • ${tier.color} ${tier.name}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${offers.map((item, index) =>
        `*${index + 1}. ${item.emoji} ${item.name}*${session.soldItems.includes(item.id) ? ' • TERJUAL' : ''}\n` +
        `> ↳ Harga penawaran : ${money(item.price)}`
      ).join('\n\n')}\n\n` +
      `⏳ Lelang berakhir dalam : *${formatRemaining(session.endsAt - Date.now())}*\n\n` +
      `📌 *INFO*\n` +
      `> ↳ Lima item acak baru tersedia setiap 5 jam.\n` +
      `> ↳ Detail : ${prefix}lelang info <nomor/nama>\n` +
      `> ↳ Beli : ${prefix}lelang beli <nomor/nama>\n` +
      `> ↳ Kolektor terbanyak : ${prefix}ah top\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'info') {
    const item = findAuctionItem(tokens.slice(1).join(' '), offers)
    if (!item) return m.reply(`❌ Item tidak ada di sesi lelang ini. Gunakan *${prefix}lelang list*.`)
    const available = !session.soldItems.includes(item.id)
    return m.reply(
      `╭─❏「 🔎 DETAIL PENAWARAN 」❏\n` +
      `│ ${item.emoji} *${item.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Deskripsi : ${item.description}\n` +
      `> ↳ Penawaran : ${money(item.price)}\n` +
      `> ↳ Status : ${available ? 'Tersedia' : 'Terjual'}\n` +
      `> ↳ Perlindungan : Tidak dapat dijarah\n` +
      `> ↳ Penempatan : *.home pajang* atau *.cl list*\n` +
      `> ↳ Waktu lelang tersisa : *${formatRemaining(session.endsAt - Date.now())}*\n\n` +
      `${available ? `> ${prefix}lelang beli ${item.id}` : 'Item ini sudah terjual.'}\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'beli' || mode === 'ambil') {
    const item = findAuctionItem(tokens.slice(1).join(' '), offers)
    if (!item) return m.reply(`❌ Item tidak ada di sesi lelang ini. Gunakan *${prefix}lelang list*.`)
    if (session.soldItems.includes(item.id)) return m.reply(`❌ Penawaran ${item.name} sudah terjual.`)
    if (Number(rpg.mallInventory[item.id]) > 0) return m.reply(`❌ Kamu sudah memiliki ${item.name}.`)
    const balance = Number(rpg.bank) || 0
    if (balance < item.price) {
      return m.reply(`❌ Saldo bank tidak cukup.\n> ↳ Harga : ${money(item.price)}\n> ↳ Saldo : ${money(balance)}`)
    }
    rpg.bank = balance - item.price
    rpg.mallInventory[item.id] = 1
    session.soldItems.push(item.id)
    if (!Array.isArray(rpg.riwayat)) rpg.riwayat = []
    rpg.riwayat.unshift(`-${money(item.price)} Lelang ${item.name}`)
    rpg.riwayat.length = Math.min(rpg.riwayat.length, 20)
    await saveDB(db)
    return m.reply(
      `╭─❏「 ✅ PENAWARAN DIMENANGKAN 」❏\n` +
      `│ ${item.emoji} *${item.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Dibayar dari saldo bank : ${money(item.price)}\n` +
      `> ↳ Saldo tersisa : ${money(rpg.bank)}\n` +
      `> ↳ Item masuk ke *${prefix}cl list* dan dapat dipajang lewat *${prefix}home pajang ${item.id}*.\n` +
      `> ↳ Item koleksi terlindungi dari penjarahan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(`Gunakan *.ah list*, *.ah info <nomor/nama>*, *.ah beli <nomor/nama>*, *.ah top*, *.ah guide*, atau *.ah command*.`)
}

handler.help = ['lelang', 'lelang list', 'lelang info <nomor/nama>', 'lelang beli <nomor/nama>', 'auctionhouse', 'ah top', 'ah guide', 'ah command']
handler.tags = ['rpg']
handler.alias = ['auction', 'auctionhouse', 'ah']
handler.command = /^(lelang|auction|auctionhouse|ah)$/i
handler.group = true

export default handler
