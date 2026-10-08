import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  MALL_CATEGORIES,
  MALL_CATEGORY_ALIASES,
  MALL_DAILY_DISCOUNT,
  getMallRarity,
  MALL_PREMIUM_DISCOUNT,
  MALL_PREMIUM_SELL_BONUS
} from '../../lib/rpgMallData.js'

const money = value => `Rp ${(Number(value) || 0).toLocaleString('id-ID')}`
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')
const displayName = item => `${item.emoji} ${item.name}`
const allItems = Object.entries(MALL_CATEGORIES).flatMap(([category, data]) =>
  data.items.map(item => ({ ...item, category }))
)
const sortByPrice = (items, priceOf = item => item.price) =>
  [...items].sort((a, b) => priceOf(a) - priceOf(b) || a.name.localeCompare(b.name, 'id'))

function findItem(input, category, priceOf) {
  const key = normalize(input)
  if (!key) return null
  const candidates = sortByPrice(category
    ? (MALL_CATEGORIES[category]?.items.map(item => ({ ...item, category })) || [])
    : allItems, priceOf)
  if (/^\d+$/.test(key)) return candidates[Number(key) - 1] || null
  return candidates.find(item => normalize(item.id) === key || normalize(item.name) === key)
    || candidates.find(item => normalize(item.name).includes(key))
}

function normalizeJid(jid) {
  if (!jid) return jid
  const resolved = jid.endsWith('@lid')
    ? global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
    : jid
  if (!resolved.includes('@')) return resolved
  return `${resolved.split('@')[0].split(':')[0]}${resolved.includes('@lid') ? '@lid' : '@s.whatsapp.net'}`
}

function formatItemList(items, priceFor, sellPriceFor) {
  return items.map((item, index) => {
    const rarity = getMallRarity(item.price)
    return `*${item.listNumber || index + 1}. ${displayName(item)}*\n` +
      `> ${rarity.stars} ${rarity.name}\n` +
      `> Buy : ${money(priceFor(item))}\n` +
      `> Sell : ${money(sellPriceFor(item))}`
  }).join('\n\n')
}

let handler = async (m, { text = '', usedPrefix, command }) => {
  const db = loadDB()
  const sender = normalizeJid(m.sender)
  const account = getUserRPG(db, sender)
  if (!account?.rpg) return m.reply('Kamu belum memiliki data RPG.')
  if (!db.money) db.money = {}

  const rpg = account.rpg
  const wallet = () => Number(db.money[sender]) || 0
  const setWallet = value => { db.money[sender] = Math.max(0, Math.floor(value)) }
  const premium = isPremiumAccount(global.db?.data?.users?.[sender])
  const tokens = String(text || '').trim().split(/\s+/).filter(Boolean)
  const root = String(command || '').toLowerCase()
  const prefix = usedPrefix || '.'
  const discountFactor = 1 - (premium ? MALL_PREMIUM_DISCOUNT : 0)
  const dailyItem = allItems[Math.floor(Date.now() / 86400000) % allItems.length]
  const dailyPrice = item => Math.floor(item.price * (1 - MALL_DAILY_DISCOUNT) * discountFactor)
  const priceFor = item => Math.floor(item.price * discountFactor * (item.id === dailyItem.id ? 1 - MALL_DAILY_DISCOUNT : 1))
  const sales = global.db.data.mallSales || (global.db.data.mallSales = {})

  if (!['mall', 'supermarket'].includes(root)) return null
  const mode = String(tokens[0] || '').toLowerCase()
  const category = MALL_CATEGORY_ALIASES[mode]

  if (!mode) {
  const itemCount = allItems.length
  return m.reply(
    `╭─❏「 🛍️ MALL / SUPERMARKET 」❏\n` +
    `│ 🛍️ *MALL / SUPERMARKET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tempat membeli dan menjual furniture, koleksi, kendaraan, fashion, elektronik, peralatan, dan dekorasi.\n` +
    `> ↳ Tersedia *${itemCount} barang* dalam ${Object.keys(MALL_CATEGORIES).length} kategori.\n` +
    `> ↳ Daftar barang diurutkan dari harga termurah ke termahal dan dilengkapi rarity bintang.\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ *${prefix}mall guide*\n` +
    `> ↳ *${prefix}mall command*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'guide') {
  return m.reply(
    `╭─❏「 📖 MALL GUIDE 」❏\n` +
    `│ 📖 *PANDUAN MALL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Mall adalah tempat untuk melihat, membeli, dan menjual barang RPG.\n` +
    `> ↳ Daftar di setiap kategori diurutkan dari harga beli termurah ke termahal.\n` +
    `> ↳ Rarity bintang mengikuti harga beli.\n` +
    `> ↳ Furniture dapat menambah kenyamanan rumah atau dipasang, sedangkan koleksi dikelola melalui .cl.\n\n` +
    `👑 *PREMIUM*\n` +
    `> ↳ Diskon beli : ${(MALL_PREMIUM_DISCOUNT * 100).toFixed(0)}%\n` +
    `> ↳ Bonus harga jual : ${(MALL_PREMIUM_SELL_BONUS * 100).toFixed(0)}%\n\n` +
    `📌 *INFORMASI*\n` +
    `> ↳ Lihat daftar perintah : *${prefix}mall command*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'command') {
  return m.reply(
    `╭─❏「 📋 MALL COMMAND 」❏\n` +
    `│ 📋 *DAFTAR COMMAND*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🗂️ *KATEGORI*\n` +
    `> ↳ ${prefix}mall kategori — daftar kategori\n` +
    `> ↳ ${prefix}mall <kategori> list [tier] [halaman] — maksimal 50 barang per halaman\n` +
    `> ↳ ${prefix}mall <kategori> info <nomor/nama> — detail barang\n` +
    `> ↳ ${prefix}mall <kategori> beli <nomor/nama> [jumlah] — membeli barang\n` +
    `> ↳ ${prefix}mall <kategori> jual <nomor/nama> [jumlah] — menjual barang\n\n` +
    `🏷️ *LAINNYA*\n` +
    `> ↳ ${prefix}mall diskon — barang pilihan dan diskon Premium\n` +
    `> ↳ ${prefix}mall harian — penawaran harian\n` +
    `> ↳ ${prefix}mall populer — barang populer\n\n` +
    `📌 *KATEGORI TERSEDIA*\n` +
    `> ↳ ${Object.keys(MALL_CATEGORIES).join(', ')}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'kategori') {
  return m.reply(
    `╭─❏「 🗂️ KATEGORI MALL 」❏\n` +
    `│ 🗂️ *DAFTAR KATEGORI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${Object.entries(MALL_CATEGORIES).map(([key, value]) =>
      `${value.emoji} *${value.label}*\n` +
      `> ↳ ${prefix}mall ${key} list`
    ).join('\n\n')}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'diskon') {
  const discounted = sortByPrice(allItems.filter(item => item.price >= 150000), priceFor).slice(0, 8)
  return m.reply(
    `╭─❏「 🏷️ DISKON MALL 」❏\n` +
    `│ 🏷️ *BARANG DISKON*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Diskon Premium : ${premium ? '20%' : 'khusus Premium'}\n\n` +
    `${formatItemList(discounted, priceFor, item => Math.floor(item.sellPrice * (premium ? 1 + MALL_PREMIUM_SELL_BONUS : 1)))}\n\n` +
    `📌 *INFORMASI*\n` +
    `> ↳ Gunakan *${prefix}mall info <item>* untuk detail.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'harian') {
  return m.reply(
    `╭─❏「 🎁 PENAWARAN HARIAN 」❏\n` +
    `│ 🎁 *PENAWARAN HARIAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🛍️ *${displayName(dailyItem)}*\n` +
    `> ↳ Harga normal : ${money(dailyItem.price)}\n` +
    `> ↳ Harga hari ini : ${money(dailyPrice(dailyItem))}\n\n` +
    `📌 *CARA MEMBELI*\n` +
    `> ↳ ${prefix}mall ${dailyItem.category} beli ${dailyItem.id}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'populer') {
  const popular = [...allItems].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0) || a.price - b.price).slice(0, 8)
  return m.reply(
    `╭─❏「 🔥 BARANG POPULER 」❏\n` +
    `│ 🔥 *BARANG POPULER*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${popular.map((item, index) =>
      `🔥 *${index + 1}. ${displayName(item)}*\n` +
      `> ↳ Terjual : ${sales[item.id] || 0}x`
    ).join('\n\n')}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'info') {
  const item = findItem(tokens.slice(1).join(' '), undefined, priceFor)
  if (!item) {
    return m.reply(
      `╭─❏「 🔎 INFO BARANG 」❏\n` +
      `│ ❌ *BARANG TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Periksa nama barang pada daftar Mall.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(
    `╭─❏「 🔎 INFO BARANG 」❏\n` +
    `│ 🔎 *${displayName(item)}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kategori : ${MALL_CATEGORIES[item.category].label}\n` +
    `> ↳ Harga : ${money(priceFor(item))}${premium ? ` (normal ${money(item.price)})` : ''}\n` +
    `> ↳ Harga jual kembali : ${money(Math.floor(item.sellPrice * (premium ? 1 + MALL_PREMIUM_SELL_BONUS : 1)))}\n\n` +
    `📌 *TRANSAKSI*\n` +
    `> ↳ Beli : ${prefix}mall ${item.category} beli ${item.id}\n` +
    `> ↳ Jual : ${prefix}mall ${item.category} jual ${item.id}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (!category) {
  return m.reply(
    `╭─❏「 🛍️ MALL 」❏\n` +
    `│ ❌ *KATEGORI TIDAK DIKENAL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Gunakan *${prefix}mall kategori* untuk melihat daftar kategori.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const action = String(tokens[1] || '').toLowerCase()
const rarityNames = ['TRASH', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'SECRET']

if (tokens.length === 1) {
  const items = sortByPrice(MALL_CATEGORIES[category].items.map(item => ({ ...item, category })), priceFor)
  const tierCounts = rarityNames
    .filter(tier => tier !== 'TRASH')
    .map(tier => `${tier}: ${items.filter(item => getMallRarity(item.price).name === tier).length}`)
    .join(' · ')
  return m.reply(
    `🛍️ *${MALL_CATEGORIES[category].label}*\n` +
    `> ↳ Total barang: *${items.length}*\n` +
    `> ↳ Tier: ${tierCounts}\n\n` +
    `Lihat daftar: *${prefix}mall ${category} list [tier] [halaman]*\n` +
    `Contoh: *${prefix}mall ${category} list 1* (maksimal 50 barang per halaman)\n` +
    `Halaman tersedia: *${Math.max(1, Math.ceil(items.length / 50))}*`
  )
}

if (!action || action === 'list' || rarityNames.includes(action.toUpperCase())) {
  const allCategoryItems = sortByPrice(
    MALL_CATEGORIES[category].items.map(item => ({ ...item, category })),
    priceFor
  ).map((item, index) => ({ ...item, listNumber: index + 1 }))
  const tierToken = action === 'list' ? String(tokens[2] || '').toUpperCase() : action.toUpperCase()
  const requestedTier = tierToken === 'ALL' || /^\d+$/.test(tierToken) ? '' : tierToken
  if (requestedTier && !rarityNames.includes(requestedTier)) {
    return m.reply(`Tier tidak dikenal. Pilihan: all, ${rarityNames.filter(tier => tier !== 'TRASH').join(', ')}.`)
  }
  const pageToken = action === 'list'
    ? (tokens[3] || (requestedTier ? '1' : (/^\d+$/.test(tokens[2] || '') ? tokens[2] : '1')))
    : (tokens[2] || '1')
  const items = requestedTier
    ? allCategoryItems.filter(item => getMallRarity(item.price).name === requestedTier)
    : allCategoryItems
  const page = Number(pageToken)
  if (!Number.isInteger(page) || page < 1) return m.reply('Nomor halaman harus berupa angka mulai dari 1.')
  const pageCount = Math.max(1, Math.ceil(items.length / 50))
  if (page > pageCount) return m.reply(`Halaman tidak tersedia. Maksimal ${pageCount} halaman untuk ${requestedTier || 'semua tier'}.`)
  const pageItems = items.slice((page - 1) * 50, page * 50)

  return m.reply(
    `╭─❏「 ${MALL_CATEGORIES[category].emoji} DAFTAR ${MALL_CATEGORIES[category].label.toUpperCase()} ${requestedTier || 'ALL'} 」❏\n` +
    `│ 📋 *DAFTAR BARANG*\n` +
    `│ Diurutkan dari harga termurah ke termahal.\n` +
    `│ Rarity bintang berdasarkan harga beli.\n` +
    `│ Total: ${items.length} barang • Halaman ${page}/${pageCount} • Maks. 50/halaman\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${formatItemList(pageItems, priceFor, item => Math.floor(item.sellPrice * (premium ? 1 + MALL_PREMIUM_SELL_BONUS : 1)))}\n\n` +
    `${page < pageCount ? `Halaman selanjutnya: *${prefix}mall ${category} list ${requestedTier ? `${requestedTier} ` : ''}${page + 1}*\n\n` : ''}` +
    `📌 *TRANSAKSI*\n` +
    `> ↳ Detail : ${prefix}mall ${category} info <nomor/nama>\n` +
    `> ↳ Beli : ${prefix}mall ${category} beli <nomor/nama> [jumlah]\n` +
    `> ↳ Jual : ${prefix}mall ${category} jual <nomor/nama> [jumlah]\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (!['info', 'beli', 'jual'].includes(action)) {
  return m.reply(
    `╭─❏「 🛍️ MALL 」❏\n` +
    `│ ❌ *COMMAND TIDAK VALID*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Gunakan *${prefix}mall ${category} list*.\n` +
    `> ↳ Gunakan *${prefix}mall ${category} info <item>*.\n` +
    `> ↳ Gunakan *${prefix}mall ${category} beli <item>*.\n` +
    `> ↳ Gunakan *${prefix}mall ${category} jual <item>*.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const itemTokens = tokens.slice(2)
const amountToken = ['beli', 'jual'].includes(action) && itemTokens.length > 1 && /^\d+$/.test(itemTokens.at(-1))
  ? itemTokens.pop()
  : null

const item = findItem(itemTokens.join(' '), category, priceFor)

if (!item) {
  return m.reply(
    `╭─❏「 🛍️ MALL 」❏\n` +
    `│ ❌ *BARANG TIDAK DITEMUKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Barang tidak ditemukan pada kategori ini.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const inventory = rpg.mallInventory || (rpg.mallInventory = {})
const amount = amountToken ? Number(amountToken) : 1

if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000) {
  return m.reply(
    `╭─❏「 🛍️ MALL 」❏\n` +
    `│ ❌ *JUMLAH TIDAK VALID*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Jumlah harus berupa angka dari 1 sampai 1000.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'info') {
  const rarity = getMallRarity(item.price)

  return m.reply(
    `╭─❏「 🔎 INFO BARANG 」❏\n` +
    `│ 🔎 *${displayName(item)}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kategori : ${MALL_CATEGORIES[category].label}\n` +
    `> ↳ Rarity : ${rarity.stars} ${rarity.name}\n` +
    `> ↳ Harga : ${money(priceFor(item))}\n` +
    `> ↳ Harga jual kembali : ${money(Math.floor(item.sellPrice * (premium ? 1 + MALL_PREMIUM_SELL_BONUS : 1)))}\n` +
    `${category === 'furniture' ? `> ↳ Furniture dapat dipasang di rumah dengan .home pasang <item> dan meningkatkan kenyamanan rumah.\n` : ''}\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'beli') {
  const total = priceFor(item) * amount

  if (wallet() < total) {
    return m.reply(
      `╭─❏「 ❌ PEMBELIAN GAGAL 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Harga : ${money(total)}\n` +
      `> ↳ Saldo kamu : ${money(wallet())}\n` +
      `> ↳ Kekurangan : ${money(total - wallet())}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  setWallet(wallet() - total)
  inventory[item.id] = (Number(inventory[item.id]) || 0) + amount
  sales[item.id] = (Number(sales[item.id]) || 0) + amount

  await saveDB(db)

  return m.reply(
    `╭─❏「 🛍️ PEMBELIAN BERHASIL 」❏\n` +
    `│ ✅ *PEMBELIAN BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Barang : ${displayName(item)}\n` +
    `> ↳ Jumlah : x${amount}\n` +
    `> ↳ Total : ${money(total)}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if ((Number(inventory[item.id]) || 0) < amount) {
  return m.reply(
    `╭─❏「 ❌ PENJUALAN GAGAL 」❏\n` +
    `│ ❌ *STOK TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Stok ${item.name} kamu tidak cukup.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const outfit = rpg.character?.outfit || {}
const isWornFashion = outfit.head === item.id || outfit.top === item.id || outfit.bottom === item.id ||
  outfit.feet === item.id || outfit.accessories?.includes(item.id)

if (isWornFashion && (Number(inventory[item.id]) || 0) - amount < 1) {
  return m.reply(
    `╭─❏「 👕 ITEM SEDANG DIPAKAI 」❏\n` +
    `│ ⚠️ *ITEM SEDANG DIPAKAI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${item.name} sedang dipakai.\n` +
    `> ↳ Lepas dari .wardrobe terlebih dahulu atau sisakan minimal 1 untuk outfit.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

inventory[item.id] -= amount
if (!inventory[item.id]) delete inventory[item.id]

const total = Math.floor(item.sellPrice * amount * (premium ? 1 + MALL_PREMIUM_SELL_BONUS : 1))

setWallet(wallet() + total)

await saveDB(db)

return m.reply(
  `╭─❏「 🛍️ PENJUALAN BERHASIL 」❏\n` +
  `│ ✅ *PENJUALAN BERHASIL*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Barang : ${displayName(item)}\n` +
  `> ↳ Jumlah : x${amount}\n` +
  `> ↳ Saldo bertambah : ${money(total)}\n\n` +
  `─━━━━━━━━━━━━━━─`
)
}

handler.help = ['mall', 'mall guide', 'mall command', 'mall kategori', 'mall <kategori>', 'mall <kategori> list [tier] [halaman]']
handler.alias = ['supermarket']
handler.tags = ['rpg']
handler.command = /^(mall|supermarket)$/i

export default handler
