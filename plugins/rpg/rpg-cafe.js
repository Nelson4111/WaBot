import { getUserRPG, loadDB, saveDB } from '../../lib/waifuHelper.js'
import {
  compareRpgMoney,
  formatRpgMoney,
  parseRpgMoneyAmount,
  subtractRpgMoney
} from '../../lib/rpgMoney.js'
import {
  addCafeExpense,
  advanceCafeOperations,
  createCafe,
  ensureCafe,
  transferCafeBalance
} from '../../lib/rpgCafe.js'
import {
  CAFE_DIALOGUE,
  CAFE_INGREDIENT_CATALOG,
  CAFE_INGREDIENT_PAGE_SIZE,
  CAFE_MENU_CATALOG,
  CAFE_MENU_PAGE_SIZE,
  CAFE_MENU_PRICE_MAX_BPS,
  CAFE_MENU_PRICE_MIN_BPS,
  CAFE_NPCS,
  CAFE_SETUP_COST,
  CAFE_STAFF,
  CAFE_THEMES,
  CAFE_UPGRADES
} from '../../lib/rpgCafeData.js'
import { ensureTaxState, getTaxPeriod, recordTaxActivity } from '../../lib/rpgTax.js'

const money = value => formatRpgMoney(value || '0')
const normalize = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[\s-]+/g, '_')
const MAX_QUANTITY = 1000

function normalizeJid(jid) {
  let normalized = String(jid || '')
  if (normalized.endsWith('@lid')) {
    normalized = global.lids?.[normalized] || global.db?.data?.lids?.[normalized] || normalized
  }
  if (!normalized.includes('@')) return normalized.split(':')[0]
  const [local, domain] = normalized.split('@')
  return `${local.split(':')[0]}@${domain}`
}

function findCatalogEntry(input, catalog) {
  const query = normalize(input)
  if (!query) return null
  const entries = Object.values(catalog)
  return entries.find(entry => normalize(entry.id) === query || normalize(entry.name) === query)
    || entries.find(entry => normalize(entry.name).includes(query))
    || null
}

function formatMenuRows(cafe, entries) {
  return entries.map(([id, choice]) => {
    const item = CAFE_MENU_CATALOG[id]
    return `> ↳ ${item.emoji} ${item.name} — ${money(choice.price)}`
  }).join('\n')
}

function getProfit(cafe) {
  return BigInt(cafe.finance.income) - BigInt(cafe.finance.expenses)
}

function renderCafe(cafe, jid, prefix) {
  const enabledMenus = Object.entries(cafe.menu).filter(([, choice]) => choice.enabled)
  const activeStaff = Object.keys(cafe.staff).filter(id => CAFE_STAFF[id])
  const profit = getProfit(cafe)
  return `╭─❏「 ☕ CAFE MANAGEMENT 」❏\n` +
    `│ KELOLA BISNIS CAFE PRIBADIMU\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `☕ *INFORMASI CAFE*\n` +
    `> ↳ Nama : ${cafe.name}\n` +
    `> ↳ Owner : @${jid.split('@')[0]}\n` +
    `> ↳ Level : ${cafe.level} (${cafe.exp} EXP)\n` +
    `> ↳ Reputasi : ${cafe.reputation}/100\n` +
    `> ↳ Status : ${cafe.status === 'open' ? 'Open' : 'Closed'}\n\n` +
    `💰 *KEUANGAN BISNIS*\n` +
    `> ↳ Saldo : ${money(cafe.finance.balance)}\n` +
    `> ↳ Pendapatan : ${money(cafe.finance.income)}\n` +
    `> ↳ Pengeluaran : ${money(cafe.finance.expenses)}\n` +
    `> ↳ Keuntungan bersih : ${money(profit.toString())}\n\n` +
    `👥 *OPERASIONAL*\n` +
    `> ↳ Total pengunjung : ${cafe.finance.totalCustomers}\n` +
    `> ↳ Transaksi berhasil : ${cafe.finance.totalOrders}\n` +
    `> ↳ Kepuasan : ${cafe.finance.satisfaction}%\n` +
    `> ↳ Menu aktif : ${enabledMenus.length}\n` +
    `> ↳ Karyawan : ${activeStaff.length}\n\n` +
    `📌 Gunakan *${prefix}cafe guide* dan *${prefix}cafe command*.\n` +
    `╰─━━━━━━━━━━━━━━─`
}

function renderShift(cafe, shifts) {
  const shift = cafe.lastShift
  if (!shifts || !shift) {
    return `⏳ Belum ada shift baru. Operasional otomatis diproses setiap jam saat cafe buka.`
  }
  const visitors = shift.visitors.slice(0, 8)
  return `✅ Operasional cafe selesai.\n` +
    `> ↳ Shift diproses : ${shifts}\n` +
    `> ↳ Pengunjung shift terakhir : ${shift.customers}\n` +
    `> ↳ Berhasil dilayani : ${shift.served}\n` +
    `> ↳ Pendapatan shift terakhir : ${money(shift.revenue)}\n\n` +
    `${visitors.length ? visitors.map(visitor => `☕ *${visitor.name}:* ${visitor.message}`).join('\n') : CAFE_DIALOGUE.closed}`
}

let cafeSchedulerStarted = false
let cafeSchedulerRunning = false

async function runCafeScheduler() {
  if (cafeSchedulerRunning) return
  cafeSchedulerRunning = true
  try {
    const db = loadDB()
    const now = Date.now()
    let changed = false
    for (const [jid, account] of Object.entries(db.data.users || {})) {
      if (!account?.rpg?.cafe || account.rpg.cafe.status !== 'open') continue
      const cafe = ensureCafe(account.rpg)
      const previousLastShift = Number(cafe.lastShift?.at) || 0
      const previousStatus = cafe.status
      const shifts = advanceCafeOperations(cafe, db.data, jid, now)
      if (shifts || previousStatus !== cafe.status || previousLastShift !== Number(cafe.lastShift?.at || 0)) {
        changed = true
      }
    }
    if (changed) await saveDB(db)
  } finally {
    cafeSchedulerRunning = false
  }
}

function startCafeScheduler() {
  if (cafeSchedulerStarted) return
  cafeSchedulerStarted = true
  setInterval(() => {
    runCafeScheduler().catch(error => {
      console.error('[cafe] Automatic operations failed:', error)
    })
  }, 60 * 1000).unref?.()
}

let handler = async (m, { args = [], text = '', command = '', usedPrefix = '.' }) => {
  const root = String(command || '').toLowerCase()
  if (root !== 'cafe' && root !== 'kafe') return null
  const db = loadDB()
  const jid = normalizeJid(m.sender)
  const account = getUserRPG(db, jid)
  if (!account?.rpg) return m.reply('❌ Kamu belum memiliki data RPG yang terdaftar.')
  const prefix = usedPrefix || '.'
  const words = String(text || args.join(' ') || '').trim().split(/\s+/).filter(Boolean)
  const mode = normalize(words.shift() || '')
  let cafe = ensureCafe(account.rpg)

  let completedShifts = 0
  if (cafe?.status === 'open') {
    const previousStatus = cafe.status
    const previousLastOperatedAt = Number(cafe.lastOperatedAt)
    completedShifts = advanceCafeOperations(cafe, db.data, jid)
    if (completedShifts || previousStatus !== cafe.status || previousLastOperatedAt !== Number(cafe.lastOperatedAt)) {
      await saveDB(db)
    }
  }

  if (mode === 'buy' || mode === 'beli') {
    if (cafe) return m.reply('❌ Kamu sudah memiliki cafe. Gunakan *.cafe info* untuk melihat bisnis kamu.')
    if (compareRpgMoney(account.money || 0, CAFE_SETUP_COST) < 0) {
      return m.reply(`❌ Modal pendirian cafe ${money(CAFE_SETUP_COST)}. Saldo kamu ${money(account.money || 0)}.`)
    }
    account.money = subtractRpgMoney(account.money || 0, CAFE_SETUP_COST)
    cafe = createCafe(words.join(' '))
    account.rpg.cafe = cafe
    recordTaxActivity(db.data, jid, 'purchase', CAFE_SETUP_COST)
    await saveDB(db)
    return m.reply(`✅ Cafe berhasil didirikan.\n> ↳ Nama : ${cafe.name}\n> ↳ Biaya pendirian : ${money(CAFE_SETUP_COST)}\n> ↳ Modal awal bisnis : ${money(cafe.finance.balance)}\n\nSetor modal dengan *.cafe deposit <nominal>*, lalu beli bahan melalui *.cafe stock buy*.`)
  }

  if (mode === 'guide') {
    return m.reply(
      `╭─❏「 📖 CAFE GUIDE 」❏\n│ PANDUAN AVELIA CAFE\n╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Cafe menghasilkan transaksi NPC otomatis setiap jam saat berstatus Open.\n` +
      `> ↳ Pengunjung dibatasi kapasitas, menu aktif, dan stok bahan baku.\n` +
      `> ↳ Setor uang ke saldo bisnis sebelum membeli stok atau membayar biaya operasional.\n` +
      `> ↳ Pendapatan berasal dari penjualan; biaya stok, gaji, dan operasional mengurangi laba bersih.\n` +
      `> ↳ Business Tax dihitung dari laba bersih cafe, bukan omzet.\n` +
      `> ↳ Pembelian bahan, upgrade, dan gaji tercatat sebagai pengeluaran bisnis.\n\n` +
      `Gunakan *${prefix}cafe command* untuk melihat semua perintah.\n╰─━━━━━━━━━━━━━━─`
    )
  }
  if (mode === 'command' || mode === 'commands') {
    return m.reply(
      `☕ *CAFE COMMAND*\n` +
      `> ↳ info / profile / status / guide\n` +
      `> ↳ buy / name <nama> / open / close\n` +
      `> ↳ menu [list|catalog|add|remove|price]\n` +
      `> ↳ supplier [halaman] / stock [buy <bahan> <jumlah>]\n` +
      `> ↳ staff [list|hire|fire|salary]\n` +
      `> ↳ upgrade <capacity|kitchen|service>\n` +
      `> ↳ theme [nama] / talk [nama NPC]\n` +
      `> ↳ operate / customers / satisfaction / reputation\n` +
      `> ↳ balance / income / expense / profit / report / history / tax\n` +
      `> ↳ deposit <nominal> / withdraw <nominal>\n\n` +
      `Modal pendirian: ${money(CAFE_SETUP_COST)} · Alias: *.kafe*.`
    )
  }

  if (!cafe) {
    return m.reply(`Kamu belum memiliki cafe. Dirikan dengan *${prefix}cafe buy [nama]* seharga ${money(CAFE_SETUP_COST)}.`)
  }
  if (!mode) return m.reply(renderCafe(cafe, jid, prefix))

  if (mode === 'name' || mode === 'rename') {
    const name = words.join(' ').trim()
    if (name.length < 3 || name.length > 40) return m.reply('❌ Nama cafe harus terdiri dari 3–40 karakter.')
    cafe.name = name
    await saveDB(db)
    return m.reply(`✅ Nama cafe diubah menjadi *${name}*.`)
  }
  if (mode === 'close' || mode === 'tutup') {
    cafe.status = 'closed'
    await saveDB(db)
    return m.reply(`🔒 *${cafe.name}* ditutup. Cafe tidak menghasilkan transaksi selama tutup.`)
  }
  if (mode === 'open' || mode === 'buka') {
    cafe.status = 'open'
    cafe.lastOperatedAt = Date.now()
    await saveDB(db)
    return m.reply(`🔓 *${cafe.name}* kembali beroperasi. NPC akan datang otomatis setiap jam.`)
  }
  if (mode === 'menu') {
    const action = normalize(words[0] || 'list')
    if (action === 'catalog' || action === 'katalog') {
      const page = Math.max(1, Number(words.at(-1)) || 1)
      const catalog = Object.values(CAFE_MENU_CATALOG)
      const start = (page - 1) * CAFE_MENU_PAGE_SIZE
      const items = catalog.slice(start, start + CAFE_MENU_PAGE_SIZE)
      if (!items.length) return m.reply(`❌ Halaman katalog tidak tersedia. Total halaman: ${Math.ceil(catalog.length / CAFE_MENU_PAGE_SIZE)}.`)
      return m.reply(
        `📋 *KATALOG MENU CAFE* · Halaman ${page}/${Math.ceil(catalog.length / CAFE_MENU_PAGE_SIZE)}\n\n` +
        items.map(item => `> ${item.emoji} ${item.id} — ${money(item.basePrice)} (${item.category})`).join('\n') +
        `\n\nTambah menu: *${prefix}cafe menu add <id>*`
      )
    }
    if (action === 'add' || action === 'tambah') {
      const item = findCatalogEntry(words.slice(1).join(' '), CAFE_MENU_CATALOG)
      if (!item) return m.reply(`❌ Menu tidak ditemukan. Gunakan *${prefix}cafe menu catalog*.`)
      if (cafe.menu[item.id]?.enabled) return m.reply('Menu tersebut sudah aktif di cafe kamu.')
      cafe.menu[item.id] = { enabled: true, price: item.basePrice }
      await saveDB(db)
      return m.reply(`✅ ${item.emoji} *${item.name}* ditambahkan ke menu dengan harga ${money(item.basePrice)}.`)
    }
    if (action === 'remove' || action === 'hapus') {
      const item = findCatalogEntry(words.slice(1).join(' '), CAFE_MENU_CATALOG)
      if (!item || !cafe.menu[item.id]?.enabled) return m.reply('❌ Menu aktif tidak ditemukan.')
      cafe.menu[item.id].enabled = false
      await saveDB(db)
      return m.reply(`✅ ${item.name} dihapus dari menu penjualan.`)
    }
    if (action === 'price' || action === 'harga') {
      const item = findCatalogEntry(words[1], CAFE_MENU_CATALOG)
      const price = parseRpgMoneyAmount(words[2])
      if (!item || !cafe.menu[item.id]?.enabled || price === null || price === undefined) {
        return m.reply(`Format: *${prefix}cafe menu price <id> <harga>* untuk menu aktif.`)
      }
      const minPrice = Math.floor(item.basePrice * CAFE_MENU_PRICE_MIN_BPS / 10000)
      const maxPrice = Math.floor(item.basePrice * CAFE_MENU_PRICE_MAX_BPS / 10000)
      if (compareRpgMoney(price, minPrice) < 0 || compareRpgMoney(price, maxPrice) > 0) {
        return m.reply(`❌ Harga harus antara ${money(minPrice)}–${money(maxPrice)}.`)
      }
      cafe.menu[item.id].price = String(price)
      await saveDB(db)
      return m.reply(`✅ Harga ${item.name} diubah menjadi ${money(price)}.`)
    }
    const menus = Object.entries(cafe.menu).filter(([, choice]) => choice.enabled)
    return m.reply(
      `📋 *MENU ${cafe.name}*\n` +
      `${menus.length ? formatMenuRows(cafe, menus) : '> Belum ada menu aktif.'}\n\n` +
      `> ↳ Lihat katalog: ${prefix}cafe menu catalog\n` +
      `> ↳ Tambah/hapus menu: ${prefix}cafe menu add/remove <id>\n` +
      `> ↳ Atur harga: ${prefix}cafe menu price <id> <harga>`
    )
  }
  if (mode === 'supplier' || (mode === 'stock' && normalize(words[0]) === 'supplier')) {
    const page = Math.max(1, Number(words.at(-1)) || 1)
    const ingredients = Object.values(CAFE_INGREDIENT_CATALOG)
    const start = (page - 1) * CAFE_INGREDIENT_PAGE_SIZE
    const items = ingredients.slice(start, start + CAFE_INGREDIENT_PAGE_SIZE)
    return m.reply(
      `📦 *SUPPLIER BAHAN BAKU* · Halaman ${page}/${Math.max(1, Math.ceil(ingredients.length / CAFE_INGREDIENT_PAGE_SIZE))}\n\n` +
      `${items.map(item => `> ↳ ${item.id} — ${money(item.unitPrice)}/unit`).join('\n') || '> Halaman tidak tersedia.'}\n\n` +
      `Beli dengan: *${prefix}cafe stock buy <id> <jumlah>*`
    )
  }
  if (mode === 'stock' && normalize(words[0]) === 'buy') {
    const quantity = Number(words.at(-1))
    const item = findCatalogEntry(words.slice(1, -1).join(' '), CAFE_INGREDIENT_CATALOG)
    if (!item || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return m.reply(`Format: *${prefix}cafe stock buy <id-bahan> <jumlah 1-${MAX_QUANTITY}>*.`)
    }
    const total = item.unitPrice * quantity
    if (!addCafeExpense(cafe, db.data, jid, total, getTaxPeriod(), `${item.id} x${quantity}`)) {
      return m.reply(`❌ Saldo bisnis tidak cukup. Butuh ${money(total)}, saldo ${money(cafe.finance.balance)}. Setor dengan *.cafe deposit <nominal>*.`)
    }
    recordTaxActivity(db.data, jid, 'purchase', total)
    cafe.stock[item.id] = (Number(cafe.stock[item.id]) || 0) + quantity
    await saveDB(db)
    return m.reply(`✅ Stok ${item.name} x${quantity} dibeli.\n> ↳ Pengeluaran bisnis : ${money(total)}\n> ↳ Sisa saldo bisnis : ${money(cafe.finance.balance)}`)
  }
  if (mode === 'stock' || mode === 'inventory') {
    const entries = Object.entries(cafe.stock).filter(([, quantity]) => Number(quantity) > 0)
    return m.reply(
      `📦 *STOK CAFE*\n` +
      `${entries.length
        ? entries.map(([id, quantity]) => `> ↳ ${CAFE_INGREDIENT_CATALOG[id]?.name || id} x${quantity}`).join('\n')
        : '> Belum ada bahan baku.'}\n\n` +
      `> ↳ Supplier: ${prefix}cafe supplier`
    )
  }
  if (mode === 'staff') {
    const action = normalize(words[0] || 'list')
    if (action === 'hire' || action === 'rekrut') {
      const id = normalize(words[1])
      const staff = CAFE_STAFF[id]
      if (!staff) return m.reply(`Pilih staff: ${Object.entries(CAFE_STAFF).map(([key, item]) => `${key} (${item.name})`).join(', ')}.`)
      if (cafe.staff[id]) return m.reply('Karyawan tersebut sudah bekerja di cafe kamu.')
      if (!addCafeExpense(cafe, db.data, jid, staff.hiringCost, getTaxPeriod(), `Rekrut ${staff.name}`)) {
        return m.reply(`❌ Saldo bisnis tidak cukup untuk biaya rekrut ${money(staff.hiringCost)}.`)
      }
      recordTaxActivity(db.data, jid, 'purchase', staff.hiringCost)
      cafe.staff[id] = { hiredAt: Date.now() }
      await saveDB(db)
      return m.reply(`✅ ${staff.name} berhasil direkrut. Gaji per shift: ${money(staff.salary)}.`)
    }
    if (action === 'fire' || action === 'pecat') {
      const id = normalize(words[1])
      if (!cafe.staff[id]) return m.reply('❌ Karyawan tersebut tidak bekerja di cafe kamu.')
      const name = CAFE_STAFF[id]?.name || id
      delete cafe.staff[id]
      await saveDB(db)
      return m.reply(`✅ ${name} diberhentikan. Gaji tidak lagi dibebankan pada shift berikutnya.`)
    }
    const staff = Object.entries(CAFE_STAFF).map(([id, item]) =>
      `> ↳ ${item.name} (${id}) · ${cafe.staff[id] ? 'Aktif' : 'Belum direkrut'} · gaji ${money(item.salary)}/shift`
    )
    return m.reply(`👥 *KARYAWAN CAFE*\n${staff.join('\n')}\n\nRekrut: ${prefix}cafe staff hire <id> · Berhentikan: ${prefix}cafe staff fire <id>`)
  }
  if (mode === 'upgrade') {
    const id = normalize(words[0])
    const upgrade = CAFE_UPGRADES[id]
    if (!upgrade) {
      return m.reply(`⬆️ *UPGRADE CAFE*\n${Object.entries(CAFE_UPGRADES).map(([key, value]) => `> ↳ ${key} — ${value.name}, ${money(value.basePrice)} per level`).join('\n')}\n\nGunakan: ${prefix}cafe upgrade <kategori>`)
    }
    cafe.upgrades[id] = Number(cafe.upgrades[id]) || 0
    const cost = upgrade.basePrice * (cafe.upgrades[id] + 1)
    if (!addCafeExpense(cafe, db.data, jid, cost, getTaxPeriod(), `Upgrade ${upgrade.name}`)) return m.reply(`❌ Saldo bisnis tidak cukup. Upgrade membutuhkan ${money(cost)}.`)
    recordTaxActivity(db.data, jid, 'purchase', cost)
    cafe.upgrades[id]++
    if (upgrade.capacityBonus) cafe.capacity += upgrade.capacityBonus
    if (upgrade.reputationBonus) cafe.reputation = Math.min(100, cafe.reputation + upgrade.reputationBonus)
    await saveDB(db)
    return m.reply(`✅ Upgrade ${upgrade.name} mencapai level ${cafe.upgrades[id]}.\n> ↳ Kapasitas : ${cafe.capacity}\n> ↳ Saldo bisnis : ${money(cafe.finance.balance)}`)
  }
  if (mode === 'theme') {
    const themeId = normalize(words[0])
    if (!themeId) {
      return m.reply(`🎨 *TEMA CAFE*\n${Object.entries(CAFE_THEMES).map(([id, theme]) => `> ↳ ${id} — ${theme.name} (${money(theme.price)})${cafe.theme === id ? ' · aktif' : ''}`).join('\n')}\n\nUbah: ${prefix}cafe theme <nama>`)
    }
    const theme = CAFE_THEMES[themeId]
    if (!theme) return m.reply('❌ Tema tidak tersedia.')
    if (cafe.theme === themeId) return m.reply('Tema tersebut sudah digunakan cafe kamu.')
    if (theme.price && !addCafeExpense(cafe, db.data, jid, theme.price, getTaxPeriod(), `Tema ${theme.name}`)) {
      return m.reply(`❌ Saldo bisnis tidak cukup. Tema ini berharga ${money(theme.price)}.`)
    }
    if (theme.price) recordTaxActivity(db.data, jid, 'purchase', theme.price)
    cafe.theme = themeId
    await saveDB(db)
    return m.reply(`✅ Tema cafe diubah menjadi *${theme.name}*.`)
  }
  if (mode === 'talk' || mode === 'interact') {
    const npc = findCatalogEntry(words.join(' '), Object.fromEntries(CAFE_NPCS.map(item => [item.id, item])))
    if (!npc) return m.reply(`Pilih NPC: ${CAFE_NPCS.map(item => item.name).join(', ')}.`)
    return m.reply(`☕ *${npc.name}*\n> ${npc.greeting}\n> ${npc.thanks}`)
  }
  if (mode === 'deposit' || mode === 'setor' || mode === 'withdraw' || mode === 'tarik') {
    const amount = parseRpgMoneyAmount(words[0])
    if (amount === null || amount === undefined || compareRpgMoney(amount, 0) <= 0) {
      return m.reply(`Format: *${prefix}cafe ${mode === 'withdraw' || mode === 'tarik' ? 'withdraw' : 'deposit'} <nominal>*.`)
    }
    const direction = mode === 'deposit' || mode === 'setor' ? 'deposit' : 'withdraw'
    if (!transferCafeBalance(cafe, account, amount, direction)) {
      return m.reply(direction === 'deposit'
        ? `❌ Saldo tunai tidak cukup. Saldo: ${money(account.money || 0)}.`
        : `❌ Saldo cafe tidak cukup. Saldo bisnis: ${money(cafe.finance.balance)}.`)
    }
    await saveDB(db)
    return m.reply(`✅ ${direction === 'deposit' ? 'Modal disetor' : 'Dana ditarik'} sebesar ${money(amount)}.\n> ↳ Saldo tunai : ${money(account.money || 0)}\n> ↳ Saldo bisnis : ${money(cafe.finance.balance)}`)
  }
  if (mode === 'operate' || mode === 'operasional') {
    const shifts = completedShifts || advanceCafeOperations(cafe, db.data, jid)
    await saveDB(db)
    return m.reply(renderShift(cafe, shifts))
  }
  if (mode === 'tax') {
    const period = getTaxPeriod()
    const ledger = cafe.taxLedger[period] || { income: '0', expenses: '0' }
    const profit = BigInt(ledger.income) - BigInt(ledger.expenses)
    const taxableProfit = profit > 0n ? profit : 0n
    const state = ensureTaxState(db.data)
    const tax = taxableProfit * BigInt(state.config.rates.business || 0) / 10000n
    return m.reply(`🧾 *CAFE BUSINESS TAX* · ${period}\n> ↳ Pendapatan : ${money(ledger.income)}\n> ↳ Pengeluaran : ${money(ledger.expenses)}\n> ↳ Laba bersih kena pajak : ${money(taxableProfit.toString())}\n> ↳ Tarif Business Tax : ${state.config.rates.business / 100}%\n> ↳ Estimasi pajak : ${money(tax.toString())}\n\nPajak final tercantum pada tagihan mingguan *.tax bill*.`)
  }
  if (mode === 'history') {
    const history = cafe.finance.transactions.slice(0, 15)
    return m.reply(`📜 *RIWAYAT CAFE*\n${history.length
      ? history.map(item => `> ${item.id} · ${item.type} · ${money(item.amount)} · ${item.description || ''}`).join('\n')
      : '> Belum ada transaksi.'}`)
  }
  if (['balance', 'income', 'expense', 'expenses', 'profit', 'report', 'info', 'profile', 'status', 'customers', 'satisfaction', 'reputation', 'popularity', 'level', 'exp', 'achievement'].includes(mode)) {
    if (mode === 'balance') return m.reply(`💰 Saldo bisnis cafe: ${money(cafe.finance.balance)}.`)
    if (mode === 'income') return m.reply(`📥 Total pendapatan cafe: ${money(cafe.finance.income)}.`)
    if (mode === 'expense' || mode === 'expenses') return m.reply(`📤 Total pengeluaran cafe: ${money(cafe.finance.expenses)}.`)
    if (mode === 'profit') return m.reply(`💹 Keuntungan bersih cafe: ${money(getProfit(cafe).toString())}.`)
    if (mode === 'customers') return m.reply(`👥 Total pengunjung: ${cafe.finance.totalCustomers} · Transaksi berhasil: ${cafe.finance.totalOrders}.`)
    if (mode === 'satisfaction') return m.reply(`😊 Kepuasan pelanggan: ${cafe.finance.satisfaction}%.`)
    if (mode === 'reputation' || mode === 'popularity') return m.reply(`⭐ Reputasi cafe: ${cafe.reputation}/100.`)
    if (mode === 'level' || mode === 'exp') return m.reply(`📈 Cafe Level ${cafe.level} · EXP ${cafe.exp}/${cafe.level * 100}.`)
    if (mode === 'achievement') return m.reply(`🏅 Pencapaian cafe\n> ↳ Pengunjung : ${cafe.finance.totalCustomers}\n> ↳ Transaksi : ${cafe.finance.totalOrders}\n> ↳ Level : ${cafe.level}`)
    if (mode === 'report') {
      const period = getTaxPeriod()
      const ledger = cafe.taxLedger[period] || { income: '0', expenses: '0' }
      const periodProfit = BigInt(ledger.income) - BigInt(ledger.expenses)
      return m.reply(
        `📊 *LAPORAN KEUANGAN CAFE*\n\n` +
        `💰 *Keseluruhan*\n> ↳ Saldo : ${money(cafe.finance.balance)}\n> ↳ Pendapatan : ${money(cafe.finance.income)}\n> ↳ Pengeluaran : ${money(cafe.finance.expenses)}\n> ↳ Laba bersih : ${money(getProfit(cafe).toString())}\n\n` +
        `📅 *${period}*\n> ↳ Pendapatan : ${money(ledger.income)}\n> ↳ Pengeluaran : ${money(ledger.expenses)}\n> ↳ Laba kena pajak : ${money((periodProfit > 0n ? periodProfit : 0n).toString())}\n> ↳ Pengunjung : ${cafe.finance.totalCustomers}\n> ↳ Transaksi : ${cafe.finance.totalOrders}`
      )
    }
    return m.reply(renderCafe(cafe, jid, prefix))
  }
  return m.reply(`Command cafe tidak dikenal. Gunakan *${prefix}cafe command*.`)
}

handler.help = ['cafe', 'cafe buy', 'cafe menu', 'cafe stock', 'cafe report']
handler.tags = ['rpg', 'economy']
handler.command = /^(cafe|kafe)$/i
handler.before = async function () {
  startCafeScheduler()
}

export default handler
