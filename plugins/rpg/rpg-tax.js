import { loadDB } from '../../lib/waifuHelper.js'
import {
  compareRpgMoney,
  formatRpgMoney,
  normalizeRpgMoney,
  parseRpgMoneyAmount,
  subtractRpgMoney
} from '../../lib/rpgMoney.js'
import {
  calculatePlayerTaxSnapshot,
  calculateTaxItems,
  ensureTaxState,
  formatTaxStatus,
  getBillAmounts,
  getOrCreateTaxpayer,
  getTaxCategory,
  getTaxDueAt,
  getTaxPeriod,
  parseTaxRateBps,
  TAX_CATEGORIES
} from '../../lib/rpgTax.js'
import { enforceOverdueTax } from '../../lib/rpgTaxEnforcement.js'

const formatMoney = value => formatRpgMoney(value)
const normalizeJid = jid => {
  let normalized = String(jid || '').split(':')[0]
  if (normalized.endsWith('@lid')) {
    normalized = global.lids?.[normalized] || global.db?.data?.lids?.[normalized] || normalized
  }
  return normalized
}

function getAccount(jid) {
  return global.db?.data?.users?.[normalizeJid(jid)] || null
}

function getTaxAccountSnapshot(account, period = getTaxPeriod(), state = ensureTaxState(global.db.data)) {
  return calculatePlayerTaxSnapshot(account, global.db.data, period, state)
}

function getTaxpayerById(state, identifier) {
  const normalized = String(identifier || '').toUpperCase()
  return Object.entries(state.taxpayers).find(([jid, taxpayer]) =>
    jid === normalizeJid(identifier) || taxpayer.taxId === normalized
  ) || null
}

function recordAudit(state, actor, action, detail, now = Date.now()) {
  state.audit.unshift({ actor, action, detail, at: now })
  state.audit.length = Math.min(state.audit.length, 200)
}

async function persist() {
  if (typeof global.db?.write === 'function') await global.db.write()
}

function getOpenBill(taxpayer, state, now = Date.now()) {
  return taxpayer?.bills?.find(bill =>
    !bill.waived &&
    compareRpgMoney(getBillAmounts(bill, now, state.config.penaltyTiers).total, 0) > 0
  ) || null
}

function formatBill(bill, state, now = Date.now()) {
  const amounts = getBillAmounts(bill, now, state.config.penaltyTiers)
  const lines = Object.entries(bill.items || {})
    .filter(([, amount]) => compareRpgMoney(amount, 0) > 0)
    .map(([id, amount]) => {
      const category = TAX_CATEGORIES.find(entry => entry.id === id)
      return `> ↳ ${category?.name || id}: ${formatMoney(amount)}`
    })
  return `╭─❏「 🧾 TAX BILL 」❏\n` +
    `│ Tax ID : ${bill.taxId}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📅 Periode : ${bill.period}\n` +
    `📋 Status : ${Date.now() >= bill.dueAt && compareRpgMoney(amounts.total, 0) > 0 ? 'Overdue' : compareRpgMoney(amounts.total, 0) > 0 ? 'Unpaid' : 'Paid'}\n\n` +
    `${lines.length ? lines.join('\n') : '> ↳ Tidak ada pajak terutang.'}\n\n` +
    `> ↳ Pokok tersisa : ${formatMoney(amounts.principal)}\n` +
    `> ↳ Denda berjalan : ${formatMoney(amounts.penalty)}\n` +
    `> ↳ Total tagihan : ${formatMoney(amounts.total)}\n` +
    `> ↳ Dibayar : ${formatMoney(bill.paidTotal || '0')}\n` +
    `⏳ Jatuh tempo : ${new Date(bill.dueAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\n` +
    `╰─━━━━━━━━━━━━━━─`
}

function makeTaxBill(state, data, taxpayer, period, account, now) {
  const snapshot = calculatePlayerTaxSnapshot(account, data, period, state)
  const { items, principal, wealthBreakdown } = calculateTaxItems(snapshot, state.config)
  taxpayer.snapshots.push({ period, at: now, ...snapshot })
  taxpayer.snapshots = taxpayer.snapshots.slice(-16)
  if (BigInt(principal) === 0n) return null

  const bill = {
    id: `${taxpayer.taxId}-${period}`,
    taxId: taxpayer.taxId,
    period,
    issuedAt: now,
    dueAt: getTaxDueAt(period),
    principal,
    paidPrincipal: '0',
    paidPenalty: '0',
    paidTotal: '0',
    items,
    wealthBreakdown,
    snapshot
  }
  taxpayer.bills.push(bill)
  return bill
}

function collectTaxPeriod(state, data, period, now = Date.now()) {
  if (state.collections[period]) return { alreadyCollected: true, issued: 0, principal: '0' }

  let issued = 0
  let principal = 0n
  for (const [jid, account] of Object.entries(data.users)) {
    if (!account?.rpg) continue
    const taxpayer = getOrCreateTaxpayer(state, jid)
    const bill = makeTaxBill(state, data, taxpayer, period, account, now)
    if (bill) {
      issued++
      principal += BigInt(bill.principal)
    }
  }
  state.collections[period] = {
    at: now,
    issued,
    paid: 0,
    income: '0',
    principal: principal.toString()
  }
  return { alreadyCollected: false, issued, principal: principal.toString() }
}

function previousTaxPeriod(now = new Date()) {
  const previousWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7))
  return getTaxPeriod(previousWeek)
}

let taxSchedulerStarted = false

async function runAutomaticTaxCollection(now = new Date()) {
  if (!global.db?.data) return
  const state = ensureTaxState(global.db.data)
  const enforced = enforceOverdueTax(global.db.data, state, now.getTime())

  const period = previousTaxPeriod(now)
  if (!state.config.enabled || period < state.config.activatedPeriod || state.collections[period]) {
    if (enforced) await persist()
    return
  }

  const result = collectTaxPeriod(state, global.db.data, period, now.getTime())
  if (result.alreadyCollected) {
    if (enforced) await persist()
    return
  }
  recordAudit(state, 'system', 'tax-auto-collect', `${period}: ${result.issued} bills`)
  await persist()
}

function startTaxScheduler() {
  if (taxSchedulerStarted) return
  taxSchedulerStarted = true
  const run = () => runAutomaticTaxCollection().catch(error => {
    console.error('[tax] Automatic weekly collection failed:', error)
  })
  setTimeout(run, 5000).unref?.()
  setInterval(run, 60 * 1000).unref?.()
}

function sumPaymentHistory(payments) {
  return payments.reduce((total, payment) => total + BigInt(payment.amount || '0'), 0n).toString()
}

function hasOpenBalance(state, taxpayer, now = Date.now()) {
  return taxpayer.bills.some(bill =>
    compareRpgMoney(getBillAmounts(bill, now, state.config.penaltyTiers).total, 0) > 0
  )
}

async function payBill(m, state, taxpayer, account, text) {
  const now = Date.now()
  const bills = taxpayer.bills.filter(bill =>
    !bill.waived &&
    compareRpgMoney(getBillAmounts(bill, now, state.config.penaltyTiers).total, 0) > 0
  )
  if (!bills.length) return m.reply('✅ Kamu tidak memiliki tagihan pajak yang perlu dibayar.')
  const totalDue = bills.reduce((total, bill) =>
    total + BigInt(getBillAmounts(bill, now, state.config.penaltyTiers).total), 0n
  )
  const requested = String(text || '').trim().toLowerCase()
  if (!requested) {
    return m.reply(`Gunakan *.tax pay <nominal>* atau *.tax pay all*.\nSisa seluruh tagihan: ${formatMoney(totalDue.toString())}`)
  }

  const amount = requested === 'all' ? normalizeRpgMoney(totalDue.toString()) : parseRpgMoneyAmount(requested)
  if (amount === null || amount === undefined || compareRpgMoney(amount, 0) <= 0) {
    return m.reply('❌ Nominal pembayaran tidak valid. Contoh: *.tax pay 500rb* atau *.tax pay all*.')
  }
  if (compareRpgMoney(amount, totalDue.toString()) > 0) {
    return m.reply(`❌ Pembayaran melebihi seluruh sisa tagihan ${formatMoney(totalDue.toString())}.`)
  }
  if (compareRpgMoney(account.money || 0, amount) < 0) {
    return m.reply(`❌ Uang tunai tidak cukup. Saldo tunai: ${formatMoney(account.money || 0)}.`)
  }

  const previousMoney = account.money
  const previousBills = bills.map(bill => ({
    bill,
    snapshot: JSON.parse(JSON.stringify(bill))
  }))
  const previousCollections = new Map()
  for (const bill of bills) {
    const collection = state.collections[bill.period]
    if (collection && !previousCollections.has(bill.period)) {
      previousCollections.set(bill.period, { ...collection })
    }
  }
  const previousTreasury = {
    balance: state.treasury.balance,
    income: state.treasury.income,
    revenueByTax: { ...state.treasury.revenueByTax },
    transactions: state.treasury.transactions.slice()
  }
  const previousPayments = taxpayer.payments.slice()
  const paid = BigInt(amount)
  account.money = subtractRpgMoney(account.money || 0, amount)
  let remaining = paid
  let totalPenaltyPaid = 0n
  let totalPrincipalPaid = 0n
  const transactionIds = []
  for (const bill of bills) {
    if (remaining <= 0n) break
    const amounts = getBillAmounts(bill, now, state.config.penaltyTiers)
    const billDue = BigInt(amounts.total)
    const billPayment = remaining < billDue ? remaining : billDue
    let billRemaining = billPayment
    const penaltyPaid = billRemaining < BigInt(amounts.penalty) ? billRemaining : BigInt(amounts.penalty)
    billRemaining -= penaltyPaid
    const principalPaid = billRemaining < BigInt(amounts.principal) ? billRemaining : BigInt(amounts.principal)
    bill.paidPenalty = (BigInt(bill.paidPenalty || '0') + penaltyPaid).toString()
    bill.paidPrincipal = (BigInt(bill.paidPrincipal || '0') + principalPaid).toString()
    bill.paidTotal = (BigInt(bill.paidTotal || '0') + billPayment).toString()
    totalPenaltyPaid += penaltyPaid
    totalPrincipalPaid += principalPaid

    const revenueByTax = {}
    let unallocatedPrincipal = principalPaid
    for (const category of TAX_CATEGORIES) {
      const categoryBalance = BigInt(bill.items?.[category.id] || '0')
      const previousPaid = BigInt(bill.paidByCategory?.[category.id] || '0')
      const outstanding = categoryBalance - previousPaid
      const allocation = unallocatedPrincipal < outstanding ? unallocatedPrincipal : outstanding
      if (allocation > 0n) {
        revenueByTax[category.id] = allocation.toString()
        bill.paidByCategory ||= {}
        bill.paidByCategory[category.id] = (previousPaid + allocation).toString()
        unallocatedPrincipal -= allocation
      }
      if (unallocatedPrincipal <= 0n) break
    }

    const transactionId = `GT-${String(state.nextTransactionId++).padStart(8, '0')}`
    transactionIds.push(transactionId)
    const transaction = {
      id: transactionId,
      jid: m.sender,
      taxId: taxpayer.taxId,
      billId: bill.id,
      period: bill.period,
      amount: billPayment.toString(),
      principal: principalPaid.toString(),
      penalty: penaltyPaid.toString(),
      revenueByTax,
      at: now
    }
    state.treasury.transactions.unshift(transaction)
    taxpayer.payments.unshift(transaction)
    state.treasury.revenueByTax.lateFees = (
      BigInt(state.treasury.revenueByTax.lateFees || '0') + penaltyPaid
    ).toString()
    for (const [category, categoryAmount] of Object.entries(revenueByTax)) {
      state.treasury.revenueByTax[category] = (
        BigInt(state.treasury.revenueByTax[category] || '0') + BigInt(categoryAmount)
      ).toString()
    }
    const collection = state.collections[bill.period]
    if (collection) {
      collection.income = (BigInt(collection.income || '0') + billPayment).toString()
      if (!bill.completedAt && getBillAmounts(bill, now, state.config.penaltyTiers).total === '0') {
        collection.paid = (Number(collection.paid) || 0) + 1
        bill.completedAt = now
      }
    }
    remaining -= billPayment
  }

  state.treasury.balance = (BigInt(state.treasury.balance) + paid).toString()
  state.treasury.income = (BigInt(state.treasury.income) + paid).toString()
  state.treasury.transactions.length = Math.min(state.treasury.transactions.length, 500)

  try {
    await persist()
  } catch (error) {
    account.money = previousMoney
    for (const { bill, snapshot } of previousBills) {
      for (const key of Object.keys(bill)) delete bill[key]
      Object.assign(bill, snapshot)
    }
    state.treasury.balance = previousTreasury.balance
    state.treasury.income = previousTreasury.income
    state.treasury.revenueByTax = previousTreasury.revenueByTax
    state.treasury.transactions = previousTreasury.transactions
    taxpayer.payments = previousPayments
    for (const [period, snapshot] of previousCollections) {
      Object.assign(state.collections[period], snapshot)
    }
    throw error
  }

  return m.reply(`✅ Pembayaran pajak berhasil.\n\n🧾 Tax ID : ${taxpayer.taxId}\n🪪 Transaksi : ${transactionIds.join(', ')}\n💰 Dibayar : ${formatMoney(paid)}\n> ↳ Pokok : ${formatMoney(totalPrincipalPaid.toString())}\n> ↳ Denda : ${formatMoney(totalPenaltyPaid.toString())}\n🏛️ Government Treasury menerima pembayaran ini.`)
}

function renderTaxList() {
  return `╭─❏「 📋 TAX CATEGORIES 」❏\n│ DAFTAR JENIS PERPAJAKAN\n╰─━━━━━━━━━━━━━━─\n\n` +
    TAX_CATEGORIES.map((category, index) => `${index + 1}. ${category.name}`).join('\n') +
    `\n\n─━━━━━━━━━━━━━━─\n\n> ↳ Gunakan *.tax list <angka/nama>* untuk detail.\n╰─━━━━━━━━━━━━━━─`
}

function renderTaxIntro(prefix) {
  return `╭─❏「 🏛️ TAX DEPARTMENT 」❏\n│ SISTEM PERPAJAKAN AVELIA\n╰─━━━━━━━━━━━━━━─\n\n` +
    `🏛️ TAX SYSTEM\n\n> ↳ Periode pajak mengikuti kalender Senin–Minggu, dengan batas pembayaran setiap Senin.\n\n📅 Periode : Senin–Minggu (WIB)\n📋 Jenis Pajak : ${TAX_CATEGORIES.length} Kategori\n\n` +
    `─━━━━━━━━━━━━━━─\n\n💰 TAX CATEGORIES\n\n` +
    TAX_CATEGORIES.map((category, index) => `> ↳ ${index + 1}. ${category.name}`).join('\n') +
    `\n\n─━━━━━━━━━━━━━━─\n\n📌 Gunakan *${prefix}tax guide* untuk panduan lengkap.\n╰─━━━━━━━━━━━━━━─`
}

let handler = async (m, { args = [], text = '', usedPrefix = '.', isOwner = false }) => {
  loadDB()
  const state = ensureTaxState(global.db.data)
  const prefix = usedPrefix || '.'
  const words = String(text || args.join(' ') || '').trim().split(/\s+/).filter(Boolean)
  const mode = String(words.shift() || '').toLowerCase()
  const period = getTaxPeriod()
  const jid = normalizeJid(m.sender)
  const account = getAccount(jid)

  if (['', 'menu'].includes(mode)) return m.reply(renderTaxIntro(prefix))
  if (mode === 'guide') {
    return m.reply(`╭─❏「 📖 TAX GUIDE 」❏\n│ PANDUAN PERPAJAKAN AVELIA\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Periode pajak berjalan Senin–Minggu berdasarkan kalender WIB.\n> ↳ Tagihan minggu sebelumnya diterbitkan pada Senin; pembayaran jatuh tempo Senin berikutnya.\n> ↳ Periode sebelum sistem pertama kali aktif tidak ditagih.\n> ↳ Pembayaran menggunakan saldo tunai dan dapat dicicil.\n> ↳ Setelah lewat batas Senin, saldo tunai/bank dipotong, aset dapat disita, dan denda berjalan.\n    > ↳ Barang sitaan tersimpan di bank; gunakan *.bank sitaan* untuk melihat dan *.bank sitaan ambil <nomor|nama barang>* untuk menebusnya (biaya 110% nilai taksir).\n> ↳ Jika saldo dan aset yang dapat disita tidak cukup, pemain dinyatakan bangkrut dan sisa harta RPG dikosongkan.\n> ↳ Seluruh penerimaan tercatat di Government Treasury.\n> ↳ Wealth Tax menggunakan uang, bank, investasi, rumah, koleksi, pet, dan ternak yang tervaluasi.\n> ↳ Income, Financial, Purchase, dan Transaction Tax menggunakan aktivitas yang tercatat selama periode berjalan.\n> ↳ Tarif dapat diatur Owner; Family Tax memakai nominal per anak.\n\nGunakan *.tax bill*, *.tax pay*, dan *.tax status* untuk mengelola kewajiban.\n╰─━━━━━━━━━━━━━━─`)
  }
  if (mode === 'command' || mode === 'commands') {
    return m.reply(`╭─❏「 📋 TAX COMMAND 」❏\n│ DAFTAR COMMAND PERPAJAKAN\n╰─━━━━━━━━━━━━━━─\n\n👤 PEMAIN\n> ↳ .tax info / status / bill / assets\n> ↳ .tax pay <nominal|all>\n> ↳ .tax history / list / guide\n> ↳ .tax benefits / effects / leaderboard\n\n🏛️ OWNER\n> ↳ .tax set <on|off>\n> ↳ .tax rate [jenis] [tarif]\n> ↳ .tax collect (tagih periode minggu sebelumnya)\n> ↳ .tax waive <Tax ID|JID>\n> ↳ .tax config family <nominal>\n\nAlias: .pajak\n╰─━━━━━━━━━━━━━━─`)
  }
  if (mode === 'list') {
    const query = words.join(' ').trim()
    if (!query) return m.reply(renderTaxList())
    const category = /^\d+$/.test(query)
      ? TAX_CATEGORIES[Number(query) - 1]
      : getTaxCategory(query)
    if (!category) return m.reply('❌ Kategori tidak ditemukan. Gunakan *.tax list* untuk melihat seluruh kategori.')
    const explanations = {
      income: 'Penghasilan kerja yang tercatat selama periode pajak.',
      wealth: 'Dihitung progresif dari uang tunai, saldo bank, investasi, properti, koleksi, pet, dan ternak yang tervaluasi.',
      financial: 'Keuntungan investasi terealisasi yang tercatat selama periode pajak.',
      property: 'Nilai rumah berdasarkan level kepemilikan yang tercatat.',
      vehicle: 'Nilai kendaraan aktif yang disimpan di garasi rumah atau inventaris Mall.',
      luxury: 'Nilai item mewah di katalog Mall yang tercatat di inventaris.',
      auction: 'Nilai item pada Auction Vault.',
      family: 'Jumlah anak tanggungan di bawah 18 tahun; nominal per anak perlu dikonfigurasi.',
      pet: 'Jumlah dan rarity pet aktif yang tercatat.',
      livestock: 'Jumlah ternak aktif berdasarkan harga bibit.',
      business: 'Keuntungan bersih cafe berdasarkan pendapatan penjualan dikurangi pengeluaran usaha.',
      purchase: 'Total pembelian yang tercatat dari Shop, Mall, Restoran, adopsi pet, pembelian ternak, dan upgrade rumah.',
      transaction: 'Nilai transaksi lelang yang tercatat saat item diberikan kepada pemenang.',
      interstellar: 'Nilai fasilitas berdasarkan tier bank yang memberikan akses Interstellar.'
    }
    const explanation = explanations[category.id]
    const rate = category.id === 'wealth'
      ? 'Progresif (lihat .tax rate)'
      : category.id === 'family'
        ? `${formatMoney(state.config.familyPerDependent)} per tanggungan`
        : `${state.config.rates[category.id] / 100}%`
    return m.reply(`╭─❏「 📋 ${category.name.toUpperCase()} 」❏\n│ DETAIL JENIS PAJAK\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Nomor : ${TAX_CATEGORIES.indexOf(category) + 1}\n> ↳ Dasar : ${explanation}\n> ↳ Tarif : ${rate}\n╰─━━━━━━━━━━━━━━─`)
  }
  if (mode === 'benefits') return m.reply('✅ Membayar tagihan sebelum Senin mencegah denda, pemotongan saldo, penyitaan aset, dan risiko bangkrut.')
  if (mode === 'effects') return m.reply('⚠️ Jika tagihan belum lunas saat batas Senin: saldo tunai/bank dipotong, aset rumah/inventaris/lelang disita ke bank, dan denda berjalan. Jika tidak ada aset yang cukup, akun masuk kondisi bangkrut.')
  if (mode === 'set') {
    if (!isOwner) return m.reply('❌ Command administrasi Tax hanya dapat digunakan Owner.')
    const setting = String(words[0] || '').toLowerCase()
    if (!['on', 'off', 'aktif', 'nonaktif'].includes(setting)) return m.reply('Format: *.tax set <on|off>*')
    const wasEnabled = state.config.enabled
    state.config.enabled = ['on', 'aktif'].includes(setting)
    if (state.config.enabled && !wasEnabled) state.config.activatedPeriod = period
    recordAudit(state, jid, 'tax-set', `enabled=${state.config.enabled}`)
    await persist()
    return m.reply(`✅ Tax System ${state.config.enabled ? 'diaktifkan' : 'dinonaktifkan'}.`)
  }
  if (mode === 'rate') {
    if (words.length === 0) {
      const rows = TAX_CATEGORIES.map(category => {
        const rate = category.id === 'wealth'
          ? state.config.wealthBrackets.map(bracket => `${bracket.rateBps / 100}%`).join(' / ')
          : category.id === 'family'
            ? `${formatMoney(state.config.familyPerDependent)} / tanggungan`
            : `${state.config.rates[category.id] / 100}%`
        return `> ↳ ${category.name} : ${rate}`
      })
      return m.reply(`╭─❏「 ⚙️ TAX RATES 」❏\n│ TARIF PAJAK\n╰─━━━━━━━━━━━━━━─\n\n${rows.join('\n')}\n\nUbah dengan *.tax rate <jenis> <persen>*. Wealth: *.tax rate wealth <tingkat 1-5> <persen>*; Family: *.tax config family <nominal-per-anak>*.\n╰─━━━━━━━━━━━━━━─`)
    }
    if (!isOwner) return m.reply('❌ Pengaturan tarif hanya dapat digunakan Owner.')
    if (words[0].toLowerCase() === 'wealth') {
      const tier = Number(words[1])
      const rateBps = parseTaxRateBps(words[2])
      if (!Number.isInteger(tier) || tier < 1 || tier > state.config.wealthBrackets.length || rateBps === null) {
        return m.reply('Format: *.tax rate wealth <tingkat 1-5> <persen>* (contoh: *.tax rate wealth 1 0.25*)')
      }
      state.config.wealthBrackets[tier - 1].rateBps = rateBps
      recordAudit(state, jid, 'tax-rate', `wealth tier ${tier}=${rateBps} bps`)
      await persist()
      return m.reply(`✅ Tarif Wealth Tax tingkat ${tier} diubah menjadi ${rateBps / 100}%.`)
    }
    const rateBps = parseTaxRateBps(words.at(-1))
    const category = getTaxCategory(words.slice(0, -1).join(' '))
    if (!category || category.id === 'wealth' || category.id === 'family' || rateBps === null) {
      return m.reply('Format: *.tax rate <jenis> <persen>*. Wealth memakai tarif progresif; Family diatur dengan *.tax config family <nominal-per-anak>*.')
    }
    state.config.rates[category.id] = rateBps
    recordAudit(state, jid, 'tax-rate', `${category.id}=${rateBps} bps`)
    await persist()
    return m.reply(`✅ Tarif ${category.name} diubah menjadi ${rateBps / 100}%. Penghitungan memakai aktivitas dan aset yang tercatat pada periode pajak.`)
  }
  if (mode === 'config') {
    if (!isOwner) return m.reply('❌ Pengaturan pajak hanya dapat digunakan Owner.')
    if (words[0] === 'due') return m.reply('❌ Batas pajak selalu jatuh pada Senin (WIB), bukan hitungan 1–30 hari.')
    if (words[0] === 'family') {
      const amount = parseRpgMoneyAmount(words[1])
      if (amount === null || compareRpgMoney(amount, 0) < 0) return m.reply('Format: *.tax config family <nominal-per-anak>*')
      state.config.familyPerDependent = String(amount)
      recordAudit(state, jid, 'tax-config', `familyPerDependent=${amount}`)
      await persist()
    }
    return m.reply(`⚙️ Tax Configuration\n> ↳ Status : ${state.config.enabled ? 'Aktif' : 'Nonaktif'}\n> ↳ Periode : Senin–Minggu (WIB)\n> ↳ Jatuh tempo : Setiap Senin\n> ↳ Denda : 0%, 5%, 10%, 15%, 20%\n> ↳ Family Tax : ${formatMoney(state.config.familyPerDependent)} per anak\n\nGunakan *.tax config family <nominal>*.`)
  }
  if (mode === 'collect') {
    if (!isOwner) return m.reply('❌ Penerbitan tagihan hanya dapat dijalankan Owner.')
    if (!state.config.enabled) return m.reply('❌ Tax System sedang nonaktif. Aktifkan dengan *.tax set on*.')
    const now = Date.now()
    const closedPeriod = previousTaxPeriod(new Date(now))
    if (closedPeriod < state.config.activatedPeriod) {
      return m.reply(`❌ Periode ${closedPeriod} terjadi sebelum Tax System aktif dan tidak dapat ditagih.`)
    }
    if (state.collections[closedPeriod]) return m.reply(`❌ Tagihan periode ${closedPeriod} sudah diterbitkan; proses ulang diblokir agar tidak terjadi tagihan ganda.`)
    const result = collectTaxPeriod(state, global.db.data, closedPeriod, now)
    recordAudit(state, jid, 'tax-collect', `${closedPeriod}: ${result.issued} bills`)
    await persist()
    return m.reply(`✅ Penerbitan tagihan ${closedPeriod} selesai.\n> ↳ Tagihan diterbitkan : ${result.issued}\n> ↳ Total pokok : ${formatMoney(result.principal)}\n> ↳ Jatuh tempo : Senin, ${new Date(getTaxDueAt(closedPeriod)).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n> ↳ Pajak dihitung dari aktivitas dan kepemilikan yang sudah terintegrasi.`)
  }
  if (mode === 'waive') {
    if (!isOwner) return m.reply('❌ Penghapusan tagihan hanya dapat dilakukan Owner.')
    const target = words[0]
    if (!target) return m.reply('Format: *.tax waive <Tax ID|JID> [alasan]*')
    const entry = getTaxpayerById(state, target)
    if (!entry) return m.reply('❌ Taxpayer tidak ditemukan.')
    const [targetJid, taxpayer] = entry
    const bill = getOpenBill(taxpayer, state)
    if (!bill || compareRpgMoney(getBillAmounts(bill, Date.now(), state.config.penaltyTiers).total, 0) <= 0) {
      return m.reply('❌ Tidak ada tagihan aktif yang dapat dihapus.')
    }
    const detail = words.slice(1).join(' ') || 'Tidak dicantumkan'
    bill.waived = true
    bill.waivedAt = Date.now()
    bill.waivedBy = jid
    bill.waiverReason = detail
    recordAudit(state, jid, 'tax-waive', `${taxpayer.taxId} (${targetJid}): ${detail}`)
    await persist()
    return m.reply(`✅ Tagihan ${taxpayer.taxId} untuk periode ${bill.period} telah dihapus.\n> ↳ Alasan : ${detail}`)
  }
  if (mode === 'info' || mode === 'status' || mode === 'bill' || mode === 'assets' || mode === 'pay' || mode === 'history') {
    if (!account?.rpg) return m.reply('❌ Kamu belum memiliki data RPG yang terdaftar.')
    const taxpayer = getOrCreateTaxpayer(state, jid)
    await persist()
    if (mode === 'pay') return payBill(m, state, taxpayer, account, words.join(' '))
    if (mode === 'bill') {
      const bill = getOpenBill(taxpayer, state)
      return m.reply(bill ? formatBill(bill, state) : '✅ Kamu tidak memiliki tagihan pajak aktif.')
    }
    if (mode === 'status') {
      return m.reply(`🧾 TAX STATUS\n> ↳ Tax ID : ${taxpayer.taxId}\n> ↳ Status : ${formatTaxStatus(taxpayer, Date.now(), state.config.penaltyTiers)}\n> ↳ Tagihan terbuka : ${taxpayer.bills.filter(bill => hasOpenBalance(state, { bills: [bill] })).length}\n> ↳ Barang sitaan : ${account.rpg.taxSeizedAssets?.length || 0}\n> ↳ Kondisi : ${account.rpg.taxBankruptAt ? 'Bangkrut' : 'Normal'}`)
    }
    if (mode === 'assets') {
      const snapshot = getTaxAccountSnapshot(account)
      return m.reply(`╭─❏「 🏠 TAXABLE ASSETS 」❏\n│ SNAPSHOT KEKAYAAN\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Uang tunai : ${formatMoney(snapshot.cash)}\n> ↳ Saldo bank : ${formatMoney(snapshot.bank)}\n> ↳ Investasi : ${formatMoney(snapshot.investment)}\n> ↳ Properti : ${formatMoney(snapshot.property)}\n> ↳ Kendaraan : ${formatMoney(snapshot.vehicle)}\n> ↳ Item mewah : ${formatMoney(snapshot.luxury)}\n> ↳ Item lelang : ${formatMoney(snapshot.auction)}\n> ↳ Pet : ${formatMoney(snapshot.pet)}\n> ↳ Ternak : ${formatMoney(snapshot.livestock)}\n> ↳ Keuntungan bisnis kena pajak : ${formatMoney(snapshot.business)}\n> ↳ Kekayaan terukur : ${formatMoney(snapshot.wealth)}\n\n> ↳ Pajak dihitung per pemain dari saldo, aset, tanggungan, dan aktivitas yang tercatat.\n╰─━━━━━━━━━━━━━━─`)
    }
    if (mode === 'history') {
      const events = [
        ...taxpayer.bills.map(bill => ({ at: bill.issuedAt, text: `Tagihan ${bill.period} · ${formatMoney(bill.principal)}` })),
        ...taxpayer.payments.map(payment => ({ at: payment.at, text: `Pembayaran ${payment.id} · ${formatMoney(payment.amount)}` }))
      ].sort((a, b) => b.at - a.at).slice(0, 15)
      return m.reply(`╭─❏「 📜 TAX HISTORY 」❏\n│ RIWAYAT TAGIHAN & PEMBAYARAN\n╰─━━━━━━━━━━━━━━─\n\n${events.map(event => `> ${new Date(event.at).toLocaleString('id-ID')}\n> ↳ ${event.text}`).join('\n\n') || '> Belum ada riwayat pajak.'}\n╰─━━━━━━━━━━━━━━─`)
    }
    const bill = getOpenBill(taxpayer, state)
    const balances = taxpayer.bills.map(entry => getBillAmounts(entry, Date.now(), state.config.penaltyTiers))
    const billedTotal = taxpayer.bills.reduce((total, entry) => total + BigInt(entry.principal || '0'), 0n)
    const outstanding = balances.reduce((total, amounts) => total + BigInt(amounts.total), 0n)
    const penaltyTotal = balances.reduce((total, amounts) => total + BigInt(amounts.penalty), 0n)
    const snapshot = taxpayer.snapshots.at(-1) || getTaxAccountSnapshot(account)
    return m.reply(`╭─❏「 📊 TAX INFORMATION 」❏\n│ INFORMASI PERPAJAKAN PEMAIN\n╰─━━━━━━━━━━━━━━─\n\n👤 Taxpayer : @${jid.split('@')[0]}\n🧾 Tax ID : ${taxpayer.taxId}\n📋 Status : ${formatTaxStatus(taxpayer, Date.now(), state.config.penaltyTiers)}\n\n─━━━━━━━━━━━━━━─\n\n💰 TAX SUMMARY\n\n> ↳ Total Tagihan : ${formatMoney(billedTotal.toString())}\n> ↳ Total Dibayar : ${formatMoney(sumPaymentHistory(taxpayer.payments))}\n> ↳ Sisa Tunggakan : ${formatMoney(outstanding.toString())}\n> ↳ Total Denda : ${formatMoney(penaltyTotal.toString())}\n\n📅 Periode : ${bill?.period || period}\n⏳ Jatuh Tempo : ${bill ? new Date(bill.dueAt).toLocaleString('id-ID') : '-'}\n\n📋 OWNERSHIP SUMMARY\n\n> ↳ Kekayaan terukur : ${formatMoney(snapshot.wealth)}\n> ↳ Investasi / Properti : ${formatMoney(snapshot.investment)} / ${formatMoney(snapshot.property)}\n> ↳ Kendaraan : ${formatMoney(snapshot.vehicle)}\n> ↳ Pet / Ternak : ${formatMoney(snapshot.pet)} / ${formatMoney(snapshot.livestock)}\n> ↳ Anak tanggungan : ${snapshot.familyCount}\n> ↳ Barang mewah / lelang : ${formatMoney(snapshot.luxury)} / ${formatMoney(snapshot.auction)}\n> ↳ Keuntungan bisnis : ${formatMoney(snapshot.business)}\n> ↳ Interstellar : ${snapshot.interstellar ? 'Aktif' : 'Tidak aktif'}\n\n╰─━━━━━━━━━━━━━━─`)
  }
  if (mode === 'leaderboard') {
    const rows = Object.entries(state.taxpayers)
      .map(([userJid, taxpayer]) => ({
        jid: userJid,
        taxId: taxpayer.taxId,
        paid: BigInt(sumPaymentHistory(taxpayer.payments))
      }))
      .sort((a, b) => a.paid === b.paid ? 0 : a.paid > b.paid ? -1 : 1)
      .slice(0, 10)
    return m.reply(`╭─❏「 🏆 TAX LEADERBOARD 」❏\n│ PEMBAYAR PAJAK TERBANYAK\n╰─━━━━━━━━━━━━━━─\n\n${rows.map((row, index) => `${index + 1}. @${row.jid.split('@')[0]}\n> ↳ ${formatMoney(row.paid.toString())}`).join('\n\n') || '> Belum ada pembayaran pajak.'}\n╰─━━━━━━━━━━━━━━─`)
  }
  return m.reply(`Command tidak dikenal. Gunakan *.tax command*.\nContoh: *.tax info*, *.tax bill*, *.tax pay all*. Command government ada di plugin terpisah.`)
}

handler.help = ['tax', 'pajak']
handler.tags = ['rpg', 'economy']
handler.command = /^(tax|pajak)$/i
handler.before = async function () {
  startTaxScheduler()
}

export default handler
