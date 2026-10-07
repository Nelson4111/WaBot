import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  MALL_CATEGORIES,
  MALL_CATEGORY_ALIASES,
  MALL_DAILY_DISCOUNT,
  MALL_PREMIUM_DISCOUNT,
  MALL_PREMIUM_SELL_BONUS
} from '../../lib/rpgMallData.js'

const money = value => `Rp ${(Number(value) || 0).toLocaleString('id-ID')}`
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')
const displayName = item => `${item.emoji} ${item.name}`
const allItems = Object.entries(MALL_CATEGORIES).flatMap(([category, data]) =>
  data.items.map(item => ({ ...item, category }))
)

function findItem(input, category) {
  const key = normalize(input)
  if (!key) return null
  const candidates = category ? (MALL_CATEGORIES[category]?.items.map(item => ({ ...item, category })) || []) : allItems
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

function formatItemList(items, priceFor) {
  return items.map((item, index) => `*${index + 1}. ${displayName(item)}*\n> ↳ ${money(priceFor(item))}`).join('\n')
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
    return m.reply(
      `🛍️ *MALL / SUPERMARKET*\n` +
      `Belanja furniture, koleksi, kendaraan, fashion, elektronik, peralatan, dan hadiah.\n\n` +
      `📂 ${Object.entries(MALL_CATEGORIES).map(([key, value]) => `${value.emoji} ${key}`).join(' · ')}\n` +
      `> ${prefix}mall kategori\n> ${prefix}mall <kategori> list\n> ${prefix}mall info <item>\n` +
      `> ${prefix}mall diskon | populer | harian\n\n` +
      `👑 Premium: diskon ${(MALL_PREMIUM_DISCOUNT * 100).toFixed(0)}% Mall, bonus jual ${(MALL_PREMIUM_SELL_BONUS * 100).toFixed(0)}%.`
    )
  }

  if (mode === 'kategori') {
    return m.reply(`🗂️ *KATEGORI MALL*\n\n${Object.entries(MALL_CATEGORIES).map(([key, value]) =>
      `${value.emoji} *${value.label}* — ${prefix}mall ${key} list`
    ).join('\n')}`)
  }

  if (mode === 'diskon') {
    const discounted = allItems.filter(item => item.price >= 150000).slice(0, 8)
    return m.reply(`🏷️ *DISKON MALL*\nDiskon Premium: ${premium ? '20%' : 'khusus Premium'}\n\n${formatItemList(discounted, priceFor)}\n\nGunakan ${prefix}mall info <item> untuk detail.`)
  }

  if (mode === 'harian') {
    return m.reply(`🎁 *PENAWARAN HARIAN*\n${displayName(dailyItem)}\nHarga normal: ${money(dailyItem.price)}\nHarga hari ini: ${money(dailyPrice(dailyItem))}\n\nBeli: ${prefix}mall ${dailyItem.category} beli ${dailyItem.id}`)
  }

  if (mode === 'populer') {
    const popular = [...allItems].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0) || a.price - b.price).slice(0, 8)
    return m.reply(`🔥 *BARANG POPULER*\n\n${popular.map((item, index) =>
      `${index + 1}. ${displayName(item)} — ${sales[item.id] || 0} terjual`
    ).join('\n')}`)
  }

  if (mode === 'info') {
    const item = findItem(tokens.slice(1).join(' '))
    if (!item) return m.reply('Barang tidak ditemukan. Periksa nama pada daftar Mall.')
    return m.reply(
      `🔎 *INFO BARANG*\n${displayName(item)}\nKategori: ${MALL_CATEGORIES[item.category].label}\n` +
      `Harga: ${money(priceFor(item))}${premium ? ` (normal ${money(item.price)})` : ''}\nHarga jual kembali: ${money(Math.floor(item.sellPrice * (premium ? 1 + MALL_PREMIUM_SELL_BONUS : 1)))}\n\n` +
      `Beli: ${prefix}mall ${item.category} beli ${item.id}\nJual: ${prefix}mall ${item.category} jual ${item.id}`
    )
  }

  if (mode === 'hadiah' && tokens.length === 1) {
    return m.reply(`🎁 *MENU HADIAH*\n\n${formatItemList(MALL_CATEGORIES.hadiah.items, priceFor)}\n\nDetail: ${prefix}mall hadiah info <item>`)
  }

  if (mode === 'hadiah' && tokens[1] === 'info') {
    const item = findItem(tokens.slice(2).join(' '), 'hadiah')
    if (!item) return m.reply('Barang hadiah tidak ditemukan.')
    return m.reply(`🔎 *${displayName(item)}*\nKategori: Hadiah\nHarga: ${money(priceFor(item))}\nHarga jual kembali: ${money(item.sellPrice)}\nBeli: ${prefix}mall hadiah beli ${item.id}`)
  }

  if (!category) return m.reply(`Kategori tidak dikenal. Gunakan ${prefix}mall kategori.`)

  const action = String(tokens[1] || '').toLowerCase()
  if (!action || action === 'list') {
    return m.reply(
      `${MALL_CATEGORIES[category].emoji} *MALL ${MALL_CATEGORIES[category].label.toUpperCase()}*\n` +
      `Diskon Premium: ${premium ? '20%' : '0%'}\n\n${formatItemList(MALL_CATEGORIES[category].items, priceFor)}\n\n` +
      `${prefix}mall ${category} info <item>\n${prefix}mall ${category} beli <item>\n${prefix}mall ${category} jual <item>`
    )
  }

  if (!['info', 'beli', 'jual'].includes(action)) {
    return m.reply(`Gunakan ${prefix}mall ${category} list|info|beli|jual <item>.`)
  }

  const itemTokens = tokens.slice(2)
  const amountToken = ['beli', 'jual'].includes(action) && /^\d+$/.test(itemTokens.at(-1))
    ? itemTokens.pop()
    : null
  const item = findItem(itemTokens.join(' '), category)
  if (!item) return m.reply('Barang tidak ditemukan pada kategori ini.')

  const inventory = rpg.mallInventory || (rpg.mallInventory = {})
  const amount = amountToken ? Number(amountToken) : 1
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000) return m.reply('Jumlah harus berupa angka dari 1 sampai 1000.')

  if (action === 'info') {
    return m.reply(`🔎 *${displayName(item)}*\nKategori: ${MALL_CATEGORIES[category].label}\nHarga: ${money(priceFor(item))}\nHarga jual kembali: ${money(item.sellPrice)}\n${category === 'furniture' ? 'Furniture dapat dipasang di rumah dengan .home pasang <item>.' : ''}`)
  }

  if (action === 'beli') {
    const total = priceFor(item) * amount
    if (wallet() < total) return m.reply(`Uang tidak cukup. Butuh ${money(total)}, saldo kamu ${money(wallet())}.`)
    setWallet(wallet() - total)
    inventory[item.id] = (Number(inventory[item.id]) || 0) + amount
    sales[item.id] = (Number(sales[item.id]) || 0) + amount
    await saveDB(db)
    return m.reply(`✅ Membeli ${displayName(item)} x${amount} seharga ${money(total)}.`)
  }

  if ((Number(inventory[item.id]) || 0) < amount) return m.reply(`Stok ${item.name} kamu tidak cukup.`)
  inventory[item.id] -= amount
  if (!inventory[item.id]) delete inventory[item.id]
  const total = Math.floor(item.sellPrice * amount * (premium ? 1 + MALL_PREMIUM_SELL_BONUS : 1))
  setWallet(wallet() + total)
  await saveDB(db)
  return m.reply(`✅ Menjual ${displayName(item)} x${amount}. Saldo bertambah ${money(total)}.`)
}

handler.help = ['mall', 'supermarket', 'mall kategori', 'mall furniture|koleksi|kendaraan|fashion|elektronik|peralatan|hadiah']
handler.alias = ['supermarket']
handler.tags = ['rpg']
handler.command = /^(mall|supermarket)$/i

export default handler
