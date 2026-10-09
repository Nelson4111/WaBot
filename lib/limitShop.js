import { addUserLimit, syncUserLimit } from './userLimit.js'

const LIMIT_PRICE_EXP = 100
const LIMIT_PRICE_MONEY = 100000
const PREMIUM_DISCOUNT = 0.2
const PRICE_LIST_AMOUNTS = [1, 10, 50, 100, 500, 1000]

const money = value => `Rp ${Number(value).toLocaleString('id-ID')}`
const isPremium = user => Boolean(user.premium)
const unitPrice = user => {
  const discount = isPremium(user) ? 1 - PREMIUM_DISCOUNT : 1
  return {
    exp: Math.floor(LIMIT_PRICE_EXP * discount),
    money: Math.floor(LIMIT_PRICE_MONEY * discount)
  }
}

export function formatLimitPriceList(user, prefix = '.') {
  const price = unitPrice(user)
  return (
    `╭─❏「 🎟️ DAFTAR HARGA LIMIT 」❏\n` +
    `│ 🎟️ *LIMIT*${isPremium(user) ? ' (Premium - Diskon 20%)' : ''}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `💰 *HARGA LIMIT*\n` +
    `> Jumlah | EXP | Uang\n` +
    PRICE_LIST_AMOUNTS.map(amount =>
      `> ${amount.toLocaleString('id-ID')} limit | ${(amount * price.exp).toLocaleString('id-ID')} EXP | ${money(amount * price.money)}`
    ).join('\n') +
    `\n\n` +
    `📌 *PEMBELIAN*\n` +
    `> ↳ Beli jumlah lain: ${prefix}limit buy <jumlah> [money]\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

export function formatLimitGuide(prefix = '.') {
  return (
    `╭─❏「 📖 LIMIT GUIDE 」❏\n` +
    `│ 📖 *LIMIT GUIDE*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🎟️ *TENTANG LIMIT*\n` +
    `> ↳ Limit adalah kuota untuk menggunakan command tertentu yang memerlukan limit.\n` +
    `> ↳ Contohnya, .stickerly dan .tovideo memakai 2 limit, sedangkan .mimpi memakai 1 limit.\n` +
    `> ↳ Biaya tiap command mengikuti keterangan command tersebut; limit yang terpakai berkurang dari saldo.\n\n` +
    `📌 *MENU LIMIT*\n` +
    `> ↳ Cek saldo: ${prefix}limit\n` +
    `> ↳ Lihat nominal dan total harga: ${prefix}limit price\n` +
    `> ↳ Beli limit: ${prefix}limit buy <jumlah> [money]\n` +
    `> ↳ Beli semaksimal saldo: ${prefix}limit buy all [money]\n` +
    `> ↳ Lihat command limit: ${prefix}limit command\n\n` +
    `> ↳ Riwayat pengeluaran: ${prefix}limit history [halaman]\n` +
    `> ↳ Peringkat limit: ${prefix}limit top\n\n` +
    `💳 *PEMBAYARAN*\n` +
    `> ↳ Tanpa kata \`money\`, pembayaran memakai EXP.\n` +
    `> ↳ Premium mendapat diskon 20%.\n` +
    `> ↳ Pembelian lama tetap tersedia lewat .buylimit.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

export async function buyLimit(m, user, args, prefix = '.') {
  const values = args.map(value => String(value).toLowerCase())
  const paymentByMoney = values.some(value => ['money', 'uang'].includes(value))
  const quantityInput = values.find(value => !['money', 'uang'].includes(value))
  const usage =
    `Format: ${prefix}limit buy <jumlah|all> [money]\n` +
    `Contoh: ${prefix}limit buy 10\n` +
    `Contoh: ${prefix}limit buy 10 money\n` +
    `Contoh: ${prefix}limit buy all`

  if (!quantityInput) {
    return m.reply(
      `╭─❏「 🎟️ PEMBELIAN LIMIT 」❏\n` +
      `│ ❌ *FORMAT PEMBELIAN SALAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${usage.replace(/\n/g, '\n> ↳ ')}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const prices = unitPrice(user)
  const price = paymentByMoney ? prices.money : prices.exp

  syncUserLimit(user)

  const balanceKey = paymentByMoney ? 'money' : 'exp'
  const balance = paymentByMoney
    ? Math.max(0, Math.floor(Number(user.money) || 0))
    : Math.max(0, Math.floor(Number(user.exp) || 0))

  const quantity = quantityInput === 'all'
    ? Math.floor(balance / price)
    : /^\d+$/.test(quantityInput) ? Number(quantityInput) : 0

  if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(quantity * price)) {
    return m.reply(
      `╭─❏「 ❌ PEMBELIAN LIMIT 」❏\n` +
      `│ ❌ *JUMLAH LIMIT TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${usage.replace(/\n/g, '\n> ↳ ')}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const total = quantity * price

  if (balance < total) {
    const required = paymentByMoney ? money(total) : `${total.toLocaleString('id-ID')} EXP`
    const available = paymentByMoney ? money(balance) : `${balance.toLocaleString('id-ID')} EXP`

    return m.reply(
      `╭─❏「 ❌ SALDO TIDAK CUKUP 」❏\n` +
      `│ ❌ *SALDO TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Saldo ${paymentByMoney ? 'uang' : 'EXP'} tidak cukup.\n` +
      `> ↳ Butuh: ${required}\n` +
      `> ↳ Saldo: ${available}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  user[balanceKey] = balance - total
  const totalLimit = addUserLimit(user, quantity)
  if (typeof global.db?.write === 'function') await global.db.write()
  const spent = paymentByMoney ? money(total) : `${total.toLocaleString('id-ID')} EXP`

  return m.reply(
    `╭─❏「 ✅ PEMBELIAN LIMIT 」❏\n` +
    `│ ✅ *PEMBELIAN LIMIT BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🎟️ *HASIL PEMBELIAN*\n` +
    `> ↳ Status: ${isPremium(user) ? 'Premium (diskon 20%)' : 'User biasa'}\n` +
    `> ↳ Limit didapat: *+${quantity.toLocaleString('id-ID')}*\n` +
    `> ↳ ${paymentByMoney ? 'Uang' : 'EXP'} terpakai: ${spent}\n` +
    `> ↳ Sisa ${paymentByMoney ? 'uang' : 'EXP'}: ${paymentByMoney ? money(user[balanceKey]) : `${user[balanceKey].toLocaleString('id-ID')} EXP`}\n` +
    `> ↳ Total limit: *${totalLimit.toLocaleString('id-ID')}*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

export async function handleLimitSubcommand(m, text, prefix = '.') {
  const user = global.db?.data?.users?.[m.sender]
  if (!user) {
    return m.reply(
      `╭─❏「 ❌ DATA PENGGUNA 」❏\n` +
      `│ ❌ *DATA PENGGUNA TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Data pengguna tidak ditemukan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const [mode = '', ...args] = String(text || '').trim().split(/\s+/).filter(Boolean)
  const action = mode.toLowerCase()

  if (action === 'buy' || action === 'beli') {
    return buyLimit(m, user, args, prefix)
  }

  if (['price', 'pricelist', 'harga'].includes(action)) {
    return m.reply(formatLimitPriceList(user, prefix))
  }

  if (['guide', 'panduan'].includes(action)) {
    return m.reply(formatLimitGuide(prefix))
  }

  if (['command', 'commands', 'cmd'].includes(action)) {
    return m.reply(
      `╭─❏「 📋 LIMIT COMMAND 」❏\n` +
      `│ 📋 *LIMIT COMMAND*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🎟️ *COMMAND*\n` +
      `> ↳ ${prefix}limit — cek saldo limit\n` +
      `> ↳ ${prefix}limit buy <jumlah|all> [money] — beli memakai EXP atau uang\n` +
      `> ↳ ${prefix}limit price/pricelist — daftar nominal dan harga\n` +
      `> ↳ ${prefix}limit guide — panduan penggunaan limit\n` +
      `> ↳ ${prefix}buylimit <jumlah|all> [money] — format pembelian lama\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return false
}