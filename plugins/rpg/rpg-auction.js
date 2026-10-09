import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { AUCTION_ITEMS } from '../../lib/rpg-auctionData.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'

const money = value => `Rp ${Number(value).toLocaleString('id-ID')}`
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')

function findAuctionItem(input, items = AUCTION_ITEMS) {
  const query = normalize(input)
  if (!query) return null
  if (/^\d+$/.test(query)) return items[Number(query) - 1] || null
  return items.find(item => normalize(item.id) === query || normalize(item.name) === query)
    || items.find(item => normalize(item.name).includes(query))
}

let handler = async (m, { text = '', usedPrefix }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const rpg = account.rpg
  const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
  if (!tier.fasilitas.includes('Auction Pass')) {
    return m.reply(`❌ Akses lelang membutuhkan Auction Pass dari Cosmic Card. Upgrade kartu bank untuk membuka *.lelang*.`)
  }
  if (rpg.kartuBeku) return m.reply('❌ Kartu bank sedang beku. Lunasi tagihan bulanan sebelum melakukan penawaran.')

  if (!db.auctionStock || typeof db.auctionStock !== 'object') db.auctionStock = {}
  for (const item of AUCTION_ITEMS) {
    if (db.auctionStock[item.id] === undefined) db.auctionStock[item.id] = 1
  }
  if (!rpg.mallInventory || typeof rpg.mallInventory !== 'object') rpg.mallInventory = {}

  const tokens = String(text).trim().split(/\s+/).filter(Boolean)
  const mode = String(tokens[0] || '').toLowerCase()
  const prefix = usedPrefix || '.'

  if (!mode || mode === 'list' || mode === 'daftar') {
    const stockItems = AUCTION_ITEMS.filter(item => Number(db.auctionStock[item.id]) > 0)
    const page = Math.max(1, Number(tokens[1]) || 1)
    const pageSize = 10
    const pages = Math.max(1, Math.ceil(stockItems.length / pageSize))
    if (page > pages) return m.reply(`❌ Halaman tidak tersedia. Pilih halaman 1–${pages}.`)
    const offers = stockItems.slice((page - 1) * pageSize, page * pageSize)
    return m.reply(
      `╭─❏「 🔨 AUCTION HOUSE 」❏\n` +
      `│ 🔨 *LELANG ITEM EKSKLUSIF* • ${tier.color} ${tier.name}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${offers.length ? offers.map(item =>
        `*${AUCTION_ITEMS.indexOf(item) + 1}. ${item.emoji} ${item.name}*\n` +
        `> ↳ Harga penawaran : ${money(item.price)}`
      ).join('\n\n') : '> Semua penawaran sudah berakhir.'}\n\n` +
      `📌 *INFO*\n` +
      `> ↳ Stok yang tampil hanya satu item untuk setiap penawaran.\n` +
      `> ↳ Detail : ${prefix}lelang info <nomor/nama>\n` +
      `> ↳ Ambil penawaran : ${prefix}lelang beli <nomor/nama>\n` +
      `> ↳ Halaman ${page}/${pages}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'info') {
    const item = findAuctionItem(tokens.slice(1).join(' '))
    if (!item) return m.reply(`❌ Item lelang tidak ditemukan. Gunakan *${prefix}lelang list*.`)
    const stock = Number(db.auctionStock[item.id]) || 0
    return m.reply(
      `╭─❏「 🔎 DETAIL PENAWARAN 」❏\n` +
      `│ ${item.emoji} *${item.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Deskripsi : ${item.description}\n` +
      `> ↳ Penawaran : ${money(item.price)}\n` +
      `> ↳ Stok : ${stock ? '1 item tersedia' : 'Penawaran berakhir'}\n` +
      `> ↳ Perlindungan : Tidak dapat dijarah\n` +
      `> ↳ Penempatan : *.home pajang* atau *.cl list*\n\n` +
      `${stock ? `> ${prefix}lelang beli ${item.id}` : 'Item ini sudah tidak tersedia.'}\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'beli' || mode === 'ambil') {
    const item = findAuctionItem(tokens.slice(1).join(' '))
    if (!item) return m.reply(`❌ Item lelang tidak ditemukan. Gunakan *${prefix}lelang list*.`)
    if (!(Number(db.auctionStock[item.id]) > 0)) return m.reply(`❌ Penawaran ${item.name} sudah berakhir.`)
    if (Number(rpg.mallInventory[item.id]) > 0) return m.reply(`❌ Kamu sudah memiliki ${item.name}.`)
    const balance = Number(rpg.bank) || 0
    if (balance < item.price) {
      return m.reply(`❌ Saldo bank tidak cukup.\n> ↳ Harga : ${money(item.price)}\n> ↳ Saldo : ${money(balance)}`)
    }
    rpg.bank = balance - item.price
    rpg.mallInventory[item.id] = 1
    db.auctionStock[item.id] = 0
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

  return m.reply(`Gunakan *.lelang list*, *.lelang info <nomor/nama>*, atau *.lelang beli <nomor/nama> *.`)
}

handler.help = ['lelang', 'lelang list [halaman]', 'lelang info <nomor/nama>', 'lelang beli <nomor/nama>']
handler.tags = ['rpg']
handler.command = /^(lelang|auction)$/i
handler.group = true

export default handler
