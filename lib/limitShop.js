const LIMIT_PRICE_EXP = 100
const LIMIT_PRICE_MONEY = 10000
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
    `🎟️ *DAFTAR HARGA LIMIT*${isPremium(user) ? ' (Premium - Diskon 20%)' : ''}\n\n` +
    `Jumlah | EXP | Uang\n` +
    PRICE_LIST_AMOUNTS.map(amount =>
      `${amount.toLocaleString('id-ID')} limit | ${(amount * price.exp).toLocaleString('id-ID')} EXP | ${money(amount * price.money)}`
    ).join('\n') +
    `\n\nBeli jumlah lain: ${prefix}limit buy <jumlah> [money]`
  )
}

export function formatLimitGuide(prefix = '.') {
  return (
    `📖 *LIMIT GUIDE*\n` +
    `Limit adalah kuota untuk menggunakan command tertentu yang memerlukan limit. Contohnya, .stickerly dan .tovideo memakai 2 limit, sedangkan .mimpi memakai 1 limit. Biaya tiap command mengikuti keterangan command tersebut; limit yang terpakai berkurang dari saldo.\n\n` +
    `• Cek saldo: ${prefix}limit\n` +
    `• Lihat nominal dan total harga: ${prefix}limit price\n` +
    `• Beli limit: ${prefix}limit buy <jumlah> [money]\n` +
    `• Beli semaksimal saldo: ${prefix}limit buy all [money]\n` +
    `• Lihat command limit: ${prefix}limit command\n\n` +
    `Tanpa kata \`money\`, pembayaran memakai EXP. Premium mendapat diskon 20%. Pembelian lama tetap tersedia lewat .buylimit.`
  )
}

export async function buyLimit(m, user, args, prefix = '.') {
  const values = args.map(value => String(value).toLowerCase())
  const paymentByMoney = values.some(value => ['money', 'uang'].includes(value))
  const quantityInput = values.find(value => !['money', 'uang'].includes(value))
  const usage = `Format: ${prefix}limit buy <jumlah|all> [money]\nContoh: ${prefix}limit buy 10, ${prefix}limit buy 10 money, ${prefix}limit buy all`
  if (!quantityInput) return m.reply(usage)

  const prices = unitPrice(user)
  const price = paymentByMoney ? prices.money : prices.exp
  const balanceKey = paymentByMoney ? 'money' : 'exp'
  const balance = Math.max(0, Math.floor(Number(user[balanceKey]) || 0))
  const quantity = quantityInput === 'all'
    ? Math.floor(balance / price)
    : /^\d+$/.test(quantityInput) ? Number(quantityInput) : 0

  if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(quantity * price)) {
    return m.reply(`Jumlah limit tidak valid.\n${usage}`)
  }
  const total = quantity * price
  if (balance < total) {
    const required = paymentByMoney ? money(total) : `${total.toLocaleString('id-ID')} EXP`
    const available = paymentByMoney ? money(balance) : `${balance.toLocaleString('id-ID')} EXP`
    return m.reply(`Saldo ${paymentByMoney ? 'uang' : 'EXP'} tidak cukup.\nButuh: ${required}\nSaldo: ${available}`)
  }

  user[balanceKey] = balance - total
  user.limit = Math.max(0, Math.floor(Number(user.limit) || 0)) + quantity
  const spent = paymentByMoney ? money(total) : `${total.toLocaleString('id-ID')} EXP`
  return m.reply(
    `✅ *PEMBELIAN LIMIT BERHASIL*\n\n` +
    `Status: ${isPremium(user) ? 'Premium (diskon 20%)' : 'User biasa'}\n` +
    `Limit didapat: +${quantity.toLocaleString('id-ID')}\n` +
    `${paymentByMoney ? 'Uang' : 'EXP'} terpakai: ${spent}\n` +
    `Sisa ${paymentByMoney ? 'uang' : 'EXP'}: ${paymentByMoney ? money(user[balanceKey]) : `${user[balanceKey].toLocaleString('id-ID')} EXP`}\n` +
    `Total limit: ${user.limit.toLocaleString('id-ID')}`
  )
}

export async function handleLimitSubcommand(m, text, prefix = '.') {
  const user = global.db?.data?.users?.[m.sender]
  if (!user) return m.reply('Data pengguna tidak ditemukan.')
  const [mode = '', ...args] = String(text || '').trim().split(/\s+/).filter(Boolean)
  const action = mode.toLowerCase()
  if (action === 'buy' || action === 'beli') return buyLimit(m, user, args, prefix)
  if (['price', 'pricelist', 'harga'].includes(action)) return m.reply(formatLimitPriceList(user, prefix))
  if (['guide', 'panduan'].includes(action)) return m.reply(formatLimitGuide(prefix))
  if (['command', 'commands', 'cmd'].includes(action)) {
    return m.reply(
      `📋 *LIMIT COMMAND*\n` +
      `• ${prefix}limit — cek saldo limit\n` +
      `• ${prefix}limit buy <jumlah|all> [money] — beli memakai EXP atau uang\n` +
      `• ${prefix}limit price/pricelist — daftar nominal dan harga\n` +
      `• ${prefix}limit guide — panduan penggunaan limit\n` +
      `• ${prefix}buylimit <jumlah|all> [money] — format pembelian lama`
    )
  }
  return false
}
