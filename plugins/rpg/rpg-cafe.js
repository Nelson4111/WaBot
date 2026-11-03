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
  createCafeStaffMember,
  ensureCafe,
  getCafeCctvCooldownRemaining,
  getCafeMenuLimit,
  getCafeThemePrice,
  getCafeStaffCapacity,
  getCafeStaffRole,
  hasCafeStaffBeenTalkedTo,
  getCafeStaffDialogue,
  getCafeCctvStory,
  getCafeVisitCooldownRemaining,
  getCafeVisitors,
  markCafeStaffTalkedTo,
  markCafeVisitorTalked,
  registerCafeVisit,
  registerCafeCctvView,
  refreshCafeVisitors,
  transferCafeBalance
} from '../../lib/rpgCafe.js'
import { sendRpgButtons } from '../../lib/rpgActionButtons.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  CAFE_DIALOGUE,
  CAFE_CCTV_COOLDOWN_MS,
  CAFE_INGREDIENT_CATALOG,
  CAFE_INGREDIENT_PAGE_SIZE,
  CAFE_MENU_CATALOG,
  CAFE_MENU_PAGE_SIZE,
  CAFE_MENU_PRICE_MAX_BPS,
  CAFE_MENU_PRICE_MIN_BPS,
  CAFE_NPCS,
  CAFE_MAX_CUSTOMERS_PER_SHIFT,
  CAFE_MAX_STAFF_SALARY_MULTIPLIER,
  CAFE_SHIFT_MS,
  CAFE_SETUP_COST,
  CAFE_STAFF,
  CAFE_THEME_PAGE_SIZE,
  CAFE_VISIT_COOLDOWN_MS,
  CAFE_VISITOR_STAY_MS,
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
  const index = Number(query)
  if (Number.isSafeInteger(index) && index >= 1 && index <= entries.length) return entries[index - 1]
  return entries.find(entry => normalize(entry.name) === query)
    || entries.find(entry => normalize(entry.name).includes(query))
    || null
}

function formatMenuRows(entries) {
  return entries.map(([id, choice]) => {
    const item = CAFE_MENU_CATALOG[id]
    const number = Object.keys(CAFE_MENU_CATALOG).indexOf(id) + 1
    return `*${number}. ${item.name} ${item.emoji}*\n> Harga : ${money(choice.price)}`
  }).join('\n')
}

function findCafeEmployee(cafe, input) {
  const employees = Object.entries(cafe.staff)
  const query = normalize(input)
  if (!query) return null
  const index = Number(query)
  if (Number.isSafeInteger(index) && index >= 1 && index <= employees.length) return employees[index - 1]
  return employees.find(([, employee]) => normalize(employee.name) === query) ||
    employees.find(([, employee]) => normalize(CAFE_STAFF[getCafeStaffRole(employee)]?.name) === query)
}

function getCafeShiftLabel(timestamp) {
  const jakartaHour = (new Date(Number(timestamp) + 7 * 60 * 60 * 1000)).getUTCHours()
  return jakartaHour === 7 ? 'Pagi · 07.00–19.00' : 'Malam · 19.00–07.00'
}

function getProfit(cafe) {
  return BigInt(cafe.finance.income) - BigInt(cafe.finance.expenses)
}

function getWorkingStaff(cafe) {
  if (cafe.status !== 'open' ||
      Number(cafe.lastShift?.at || 0) < Number(cafe.lastOperatedAt || 0) ||
      Date.now() - Number(cafe.lastShift?.at || 0) > CAFE_SHIFT_MS) return []
  return cafe.lastShift?.staffOnDuty || []
}

function renderCafe(cafe, jid, prefix) {
  const enabledMenus = Object.entries(cafe.menu).filter(([, choice]) => choice.enabled)
  const activeStaff = Object.keys(cafe.staff)
  const workingStaff = getWorkingStaff(cafe)
  const profit = getProfit(cafe)
  return `╭─❏「 ☕ CAFE MANAGEMENT 」❏\n` +
    `│ KELOLA BISNIS CAFE PRIBADIMU\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `☕ *INFORMASI CAFE*\n` +
    `> ↳ Nama : ${cafe.name}\n` +
    `> ↳ Owner : @${jid.split('@')[0]}\n` +
    `> ↳ Level : ${cafe.level} (${cafe.exp} EXP)\n` +
    `> ↳ Tema : ${CAFE_THEMES[cafe.theme]?.name || 'Klasik Hangat'}\n` +
    `> ↳ Popularitas : ${cafe.popularity.toLocaleString('id-ID')} poin\n` +
    `> ↳ Reputasi : ${cafe.reputation}/100\n` +
    `> ↳ Kapasitas : ${cafe.capacity}/${CAFE_MAX_CUSTOMERS_PER_SHIFT} pengunjung/shift\n` +
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
    `> ↳ Menu aktif : ${enabledMenus.length}/${getCafeMenuLimit(cafe)}\n` +
    `> ↳ Karyawan : ${activeStaff.length}\n` +
    `> ↳ Bertugas shift ini : ${workingStaff.length}/${getCafeStaffCapacity(cafe)}\n` +
    `> ↳ Nama staff : ${workingStaff.map(employee => employee.name).join(', ') || 'Belum ada staff bertugas'}\n` +
    `> ↳ Auto-restock : ${cafe.autoRestock ? 'Aktif' : 'Mati'} · Auto-pay : ${cafe.autoPay ? 'Aktif' : 'Mati'}\n\n` +
    `📌 Gunakan *${prefix}cafe guide* dan *${prefix}cafe command*.\n` +
    `╰─━━━━━━━━━━━━━━─`
}

function sendCafePage(conn, m, text, buttons = [], fallbackText) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    text,
    footer: '☕ AVELIA CAFE • RPG',
    buttons,
    fallbackText,
    reply: content => m.reply(content),
    noHeader: true
  })
}

function renderShift(cafe, shifts) {
  const shift = cafe.lastShift
  if (!shifts || !shift) {
    return `╭─❏「 ⏳ OPERASIONAL CAFE 」❏\n│ Belum ada shift baru\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Shift berjalan pukul 07.00–19.00 dan 19.00–07.00 WIB.`
  }
  const visitors = shift.visitors.slice(0, 8)
  const dialogueRows = visitors.flatMap(visitor => Array.isArray(visitor.dialogue)
    ? visitor.dialogue.map(turn => `> ↳ ☕ *${turn.speaker} (${turn.role}):* “${turn.text}”`)
    : [`> ↳ ☕ *${visitor.name} (Pelanggan):* “${visitor.message}”`])
  return `╭─❏「 ✅ OPERASIONAL CAFE 」❏\n│ Laporan shift terbaru\n╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ 🕐 Shift : ${getCafeShiftLabel(shift.at)} · ${shifts} shift diproses\n` +
    `> ↳ 👥 Pengunjung : ${shift.customers} · Dilayani : ${shift.served}\n` +
    `> ↳ 💰 Pendapatan : ${money(shift.revenue)}\n` +
    `> ↳ 👤 Staff bertugas : ${shift.staffOnDuty?.map(employee => employee.name).join(', ') || 'Tidak ada'}\n` +
    `${shift.resigned?.length ? `> ↳ 👋 Resign : ${shift.resigned.join(', ')} (gaji tak terbayar)\n` : ''}\n` +
    `${shift.restocks?.length ? `> ↳ 📦 Auto-restock : ${shift.restocks.join(', ')}\n` : ''}\n` +
    `${dialogueRows.length
      ? `💬 *DIALOG PELANGGAN*\n${dialogueRows.join('\n')}`
      : '> ↳ Belum ada dialog pelanggan pada shift ini.'}`
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

let handler = async (m, { args = [], text = '', command = '', usedPrefix = '.', conn }) => {
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
  const premium = isPremiumAccount(account) || isPremiumAccount(account.rpg)

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
    const action = normalize(words[0] || '')
    if (action === 'cancel' || action === 'batal') {
      delete account.rpg.pendingCafePurchase
      await saveDB(db)
      return m.reply('🧾 Konfirmasi pendirian cafe dibatalkan. Saldo kamu tidak berubah.')
    }
    if (action === 'confirm' || action === 'konfirmasi') {
      const pending = account.rpg.pendingCafePurchase
      if (!pending || typeof pending.name !== 'string' || pending.name.trim().length < 3 ||
          pending.name.trim().length > 40 || Date.now() - Number(pending.requestedAt) > 5 * 60 * 1000) {
        delete account.rpg.pendingCafePurchase
        await saveDB(db)
        return m.reply(`⌛ Konfirmasi tidak ditemukan atau sudah kedaluwarsa. Mulai lagi dengan *${prefix}cafe buy <nama cafe> *.`)
      }
      if (compareRpgMoney(account.money || 0, CAFE_SETUP_COST) < 0) {
        return m.reply(`💸 Saldo belum cukup untuk mendirikan cafe. Modal ${money(CAFE_SETUP_COST)}, saldo kamu ${money(account.money || 0)}.`)
      }
      account.money = subtractRpgMoney(account.money || 0, CAFE_SETUP_COST)
      cafe = createCafe(pending.name)
      account.rpg.cafe = cafe
      delete account.rpg.pendingCafePurchase
      recordTaxActivity(db.data, jid, 'purchase', CAFE_SETUP_COST)
      await saveDB(db)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 🎉 CAFE RESMI DIBUKA 」❏\n│ *${cafe.name}* siap jadi destinasi favorit Avelia!\n╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ 🧾 Biaya pendirian : ${money(CAFE_SETUP_COST)}\n` +
        `> ↳ 🏦 Saldo bisnis : ${money(cafe.finance.balance)}\n` +
        `> ↳ 🪑 Kapasitas awal : ${cafe.capacity} pengunjung/shift\n\n` +
        `💡 Setorkan modal bisnis, isi stok, lalu buka cafe agar operasional dimulai.`,
        [
          ['📦 Kelola stok', `${prefix}cafe stock`],
          ['💰 Setor modal', `${prefix}cafe deposit`],
          ['🏠 Lihat cafe', `${prefix}cafe`]
        ]
      )
    }

    const name = words.join(' ').trim()
    if (name.length < 3 || name.length > 40) {
      return sendCafePage(
        conn,
        m,
        `╭─❏「 🏗️ DIRIKAN CAFE 」❏\n│ Tentukan nama bisnis impianmu\n╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Format : *${prefix}cafe buy <nama cafe>*\n` +
        `> ↳ Nama : 3–40 karakter\n` +
        `> ↳ Modal : ${money(CAFE_SETUP_COST)}\n` +
        `> ↳ Pembelian selalu meminta konfirmasi terlebih dahulu.\n\n` +
        `Contoh: *${prefix}cafe buy Senja di Avelia*`,
        [['📖 Panduan Cafe', `${prefix}cafe guide`]]
      )
    }
    if (compareRpgMoney(account.money || 0, CAFE_SETUP_COST) < 0) {
      return m.reply(`💸 Saldo belum cukup untuk mendirikan cafe. Modal ${money(CAFE_SETUP_COST)}, saldo kamu ${money(account.money || 0)}.`)
    }
    account.rpg.pendingCafePurchase = { name, requestedAt: Date.now() }
    await saveDB(db)
    return sendCafePage(
      conn,
      m,
      `╭─❏「 🧾 KONFIRMASI PENDIRIAN 」❏\n│ Periksa detail sebelum membayar\n╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Nama cafe : *${name}*\n` +
      `> ↳ Biaya : *${money(CAFE_SETUP_COST)}*\n` +
      `> ↳ Saldo setelah transaksi : *${money(subtractRpgMoney(account.money, CAFE_SETUP_COST))}*\n\n` +
      `Dana hanya dipotong setelah kamu memilih konfirmasi. Permintaan berlaku 5 menit.`,
      [
        ['✅ Konfirmasi & dirikan', `${prefix}cafe buy confirm`],
        ['❌ Batalkan', `${prefix}cafe buy cancel`]
      ]
    )
  }

  if (mode === 'guide') {
    return sendCafePage(
      conn,
      m,
      `╭─❏「 📖 PANDUAN LENGKAP CAFE 」❏\n│ Cara memulai, melayani tamu, dan mengembangkan bisnis\n╰─━━━━━━━━━━━━━━─\n\n` +
      `🏗️ *1. MEMILIKI CAFE*\n` +
      `> ↳ Gunakan *${prefix}cafe buy <nama>* untuk memilih nama Cafe.\n` +
      `> ↳ Bot menampilkan biaya dan saldo akhir; dana hanya dipotong setelah konfirmasi.\n` +
      `> ↳ Setelah berdiri, setorkan modal dengan *${prefix}cafe deposit <nominal>*.\n\n` +
      `🚪 *2. BUKA, KUNJUNGI, DAN BICARA*\n` +
      `> ↳ *${prefix}cafe open* membuka bisnis; *${prefix}cafe close* menghentikan operasional.\n` +
      `> ↳ *${prefix}cafe visit* menampilkan NPC roleplay dan staff yang sedang bertugas.\n` +
      `> ↳ Visit menambah 1 popularitas dan memiliki cooldown ${Math.ceil(CAFE_VISIT_COOLDOWN_MS / 60000)} menit.\n` +
      `> ↳ NPC hadir maksimal 30 menit; setiap NPC hanya bisa diajak bicara sekali per kunjungan.\n` +
      `> ↳ Staff hanya bisa diajak bicara sekali per shift; Cafe tutup tidak menerima pengunjung.\n` +
      `> ↳ NPC pelanggan bertransaksi otomatis pada shift pagi dan malam saat Cafe buka.\n` +
      `> ↳ Pilih tombol dialog di halaman Visit atau gunakan *${prefix}cafe talk npc <nama>*.\n` +
      `> ↳ Bicara dengan staff yang sedang bertugas melalui *${prefix}cafe talk staff <nama>*.\n` +
      `> ↳ Talk menambah 1 popularitas. Dialog langsung tampil di balasan *talk* dengan label Kamu dan nama lawan bicara.\n` +
      `> ↳ Dialog pesanan otomatis tercatat di laporan *${prefix}cafe operate* dan CCTV; nama pelanggan ditampilkan sebagai pembicara.\n\n` +
      `🍽️ *3. MENU, BAHAN, DAN SHIFT*\n` +
      `> ↳ *${prefix}cafe menu catalog* menampilkan katalog restoran. Pilih menu dengan nomor atau nama.\n` +
      `> ↳ *${prefix}cafe menu add <nomor/nama>* menambah menu; *menu price <nomor/nama> <harga>* mengatur harga.\n` +
      `> ↳ Jumlah menu aktif dibatasi level Cafe dan bertambah saat level naik.\n` +
      `> ↳ *${prefix}cafe supplier* melihat bahan; *${prefix}cafe stock buy <nomor/nama> <jumlah>* membeli bahan.\n` +
      `> ↳ Premium bisa memakai *${prefix}cafe auto restock on/off* untuk stok otomatis.\n` +
      `> ↳ NPC bertransaksi otomatis tiap shift, pukul 07.00–19.00 dan 19.00–07.00 WIB.\n` +
      `> ↳ Gunakan *${prefix}cafe operate* untuk memproses dan membaca shift yang sudah jatuh tempo.\n\n` +
      `👥 *4. STAFF DAN KINERJA*\n` +
      `> ↳ *${prefix}cafe staff* melihat nama, posisi, gaji, dan status staff.\n` +
      `> ↳ *${prefix}cafe staff hire <nama/nomor posisi>* merekrut staff; posisi sama boleh direkrut berkali-kali.\n` +
      `> ↳ Level Cafe menentukan jumlah staff yang bisa bertugas dan akan merotasi tim tiap shift.\n` +
      `> ↳ *${prefix}cafe staff salary <nama/nomor> 2x* menaikkan gaji per shift hingga 100x.\n` +
      `> ↳ Gaji dihitung per shift 12 jam; Premium dapat mengaktifkan *${prefix}cafe auto pay on/off*.\n` +
      `> ↳ *${prefix}cafe staff working* atau *${prefix}cafe cctv* melihat staff yang sedang bekerja.\n\n` +
      `📈 *5. LEVEL, POPULARITAS, DAN KAPASITAS*\n` +
      `> ↳ Transaksi berhasil memberi EXP; EXP yang cukup menaikkan level Cafe.\n` +
      `> ↳ Pengunjung yang terlayani menaikkan popularitas; layanan gagal dapat menurunkannya.\n` +
      `> ↳ Level dan popularitas meningkatkan permintaan NPC, tetapi tidak melewati kapasitas.\n` +
      `> ↳ Kapasitas bertambah hanya lewat *${prefix}cafe upgrade capacity/kitchen* dan dibatasi maksimum 50 tamu per shift.\n\n` +
      `💰 *6. KEUANGAN DAN PAJAK*\n` +
      `> ↳ *${prefix}cafe report*, *balance*, *income*, *expense*, dan *history* untuk memeriksa kas.\n` +
      `> ↳ *${prefix}cafe withdraw <nominal>* menarik saldo bisnis ke uang tunai.\n` +
      `> ↳ Laba Business Tax adalah pendapatan dikurangi stok, rekrut, gaji, upgrade, tema, dan biaya operasional.\n` +
      `> ↳ *${prefix}cafe tax* menampilkan estimasi pajak mingguan; tagihan final ada di *${prefix}tax bill*.\n\n` +
      `📹 *7. FITUR TAMBAHAN*\n` +
      `> ↳ *${prefix}cafe cctv* menampilkan kondisi Cafe dengan cooldown ${Math.ceil(CAFE_CCTV_COOLDOWN_MS / 60000)} menit.\n` +
      `> ↳ *${prefix}cafe theme* menyediakan 10 tema dengan efek baik dan konsekuensi masing-masing.\n` +
      `> ↳ *${prefix}cafe name <nama>* mengganti nama Cafe.\n` +
      `> ↳ Gunakan *${prefix}cafe command* untuk daftar command satu per baris.`,
      [
        ['📋 Semua command', `${prefix}cafe command`],
        ['🚶 Kunjungi Cafe', `${prefix}cafe visit`],
        ['👥 Kelola staff', `${prefix}cafe staff`],
        ['📹 Pantau CCTV', `${prefix}cafe cctv`]
      ]
    )
  }
  if (mode === 'command' || mode === 'commands') {
    return sendCafePage(
      conn,
      m,
      `╭─❏「 🎛️ DAFTAR COMMAND CAFE 」❏\n│ Semua perintah tersusun ke bawah\n╰─━━━━━━━━━━━━━━─\n\n` +
      `🏗️ *PENDIRIAN & PANDUAN*\n` +
      `> ↳ ${prefix}cafe\n` +
      `> ↳ ${prefix}cafe guide\n` +
      `> ↳ ${prefix}cafe buy <nama>\n` +
      `> ↳ ${prefix}cafe buy confirm\n` +
      `> ↳ ${prefix}cafe buy cancel\n` +
      `> ↳ ${prefix}cafe name <nama>\n\n` +
      `🚪 *KUNJUNGAN & OPERASIONAL*\n` +
      `> ↳ ${prefix}cafe open\n` +
      `> ↳ ${prefix}cafe close\n` +
      `> ↳ ${prefix}cafe visit\n` +
      `> ↳ ${prefix}cafe talk npc <nama>\n` +
      `> ↳ ${prefix}cafe talk staff <nama>\n` +
      `> ↳ ${prefix}cafe operate\n` +
      `> ↳ ${prefix}cafe cctv\n\n` +
      `🍽️ *MENU & BAHAN*\n` +
      `> ↳ ${prefix}cafe menu\n` +
      `> ↳ ${prefix}cafe menu catalog [halaman]\n` +
      `> ↳ ${prefix}cafe menu add <nomor/nama>\n` +
      `> ↳ ${prefix}cafe menu remove <nomor/nama>\n` +
      `> ↳ ${prefix}cafe menu price <nomor/nama> <harga>\n` +
      `> ↳ ${prefix}cafe supplier [halaman]\n` +
      `> ↳ ${prefix}cafe stock\n` +
      `> ↳ ${prefix}cafe stock buy <nomor/nama> <jumlah>\n` +
      `> ↳ ${prefix}cafe auto restock <on/off> (Premium)\n\n` +
      `👥 *STAFF & PENGEMBANGAN*\n` +
      `> ↳ ${prefix}cafe staff\n` +
      `> ↳ ${prefix}cafe staff hire <nama/nomor posisi>\n` +
      `> ↳ ${prefix}cafe staff hire all (Premium)\n` +
      `> ↳ ${prefix}cafe staff salary <nama/nomor staff> <kali>x\n` +
      `> ↳ ${prefix}cafe staff fire <nama/nomor staff>\n` +
      `> ↳ ${prefix}cafe staff working\n` +
      `> ↳ ${prefix}cafe auto pay <on/off> (Premium)\n` +
      `> ↳ ${prefix}cafe upgrade\n` +
      `> ↳ ${prefix}cafe upgrade capacity\n` +
      `> ↳ ${prefix}cafe upgrade kitchen\n` +
      `> ↳ ${prefix}cafe upgrade service\n` +
      `> ↳ ${prefix}cafe theme [nama]\n\n` +
      `💰 *KEUANGAN & PAJAK*\n` +
      `> ↳ ${prefix}cafe deposit <nominal>\n` +
      `> ↳ ${prefix}cafe withdraw <nominal>\n` +
      `> ↳ ${prefix}cafe balance\n` +
      `> ↳ ${prefix}cafe income\n` +
      `> ↳ ${prefix}cafe expense\n` +
      `> ↳ ${prefix}cafe profit\n` +
      `> ↳ ${prefix}cafe report\n` +
      `> ↳ ${prefix}cafe history\n` +
      `> ↳ ${prefix}cafe tax\n\n` +
      `📊 *STATISTIK*\n` +
      `> ↳ ${prefix}cafe customers\n` +
      `> ↳ ${prefix}cafe satisfaction\n` +
      `> ↳ ${prefix}cafe reputation\n` +
      `> ↳ ${prefix}cafe popularity\n` +
      `> ↳ ${prefix}cafe level\n` +
      `> ↳ ${prefix}cafe achievement\n\n` +
      `💡 Gunakan tombol di bawah untuk membuka bagian Cafe.`,
      [
        ['📊 Ringkasan', `${prefix}cafe`],
        ['🚶 Visit Cafe', `${prefix}cafe visit`],
        ['👥 Kelola staff', `${prefix}cafe staff`],
        ['⬆️ Upgrade kapasitas', `${prefix}cafe upgrade`],
        ['📹 Lihat CCTV', `${prefix}cafe cctv`],
        ['📦 Menu & stok', `${prefix}cafe menu`],
        ['💹 Laporan bisnis', `${prefix}cafe report`]
      ]
    )
  }

  if (!cafe) {
    return sendCafePage(
      conn,
      m,
      `╭─❏「 ☕ AVELIA CAFE 」❏\n│ Wujudkan bisnis kuliner milikmu\n╰─━━━━━━━━━━━━━━─\n\n` +
      `Belum punya cafe? Pilih nama bisnis dan konfirmasi pendirian sebelum dana dipotong.\n\n` +
      `> ↳ 🧾 Modal pendirian : ${money(CAFE_SETUP_COST)}\n` +
      `> ↳ 🏗️ Nama cafe : wajib ditentukan\n` +
      `> ↳ 🕹️ Perintah : *${prefix}cafe buy <nama cafe>*`,
      [
        ['🏗️ Cara mendirikan', `${prefix}cafe buy`],
        ['📖 Baca panduan', `${prefix}cafe guide`],
        ['📋 Lihat fitur', `${prefix}cafe command`]
      ]
    )
  }
  if (!mode || mode === 'info' || mode === 'profile' || mode === 'status') {
    return sendCafePage(conn, m, renderCafe(cafe, jid, prefix), [
      ['📋 Menu & stok', `${prefix}cafe menu`],
      ['👥 Tim cafe', `${prefix}cafe staff`],
      ['📹 CCTV', `${prefix}cafe cctv`],
      ['⬆️ Upgrade', `${prefix}cafe upgrade`],
      ['📊 Laporan', `${prefix}cafe report`],
      [cafe.status === 'open' ? '🔒 Tutup cafe' : '🔓 Buka cafe', `${prefix}cafe ${cafe.status === 'open' ? 'close' : 'open'}`]
    ])
  }

  if (mode === 'visit' || mode === 'kunjungi') {
    const now = Date.now()
    if (cafe.status !== 'open') {
      return m.reply(`🔒 *${cafe.name}* sedang tutup. Buka Cafe dengan *${prefix}cafe open* sebelum berkunjung.`)
    }
    const remainingCooldown = getCafeVisitCooldownRemaining(cafe, now)
    if (remainingCooldown > 0) {
      const remainingMinutes = Math.ceil(remainingCooldown / 60000)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 ⏳ WAKTU KUNJUNGAN 」❏\n│ Kunjungan berikutnya belum tersedia\n╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kamu bisa berkunjung lagi dalam *${remainingMinutes} menit*.\n` +
        `> ↳ Popularitas tidak bertambah selama cooldown.\n` +
        `> ↳ Sambil menunggu, kamu masih bisa bicara dengan NPC/staff yang belum diajak bicara.`,
        [
          ['💬 Pilih teman bicara', `${prefix}cafe talk`],
          ['☕ Ringkasan Cafe', `${prefix}cafe`]
        ]
      )
    }
    const visitors = refreshCafeVisitors(cafe, now)
      .map(visitor => CAFE_NPCS.find(npc => npc.id === visitor.id))
      .filter(Boolean)
    const working = getWorkingStaff(cafe)
    if (!registerCafeVisit(cafe, now)) {
      return m.reply(`⏳ Tunggu sebelum berkunjung lagi. Gunakan *${prefix}cafe talk* untuk melanjutkan interaksi yang tersedia.`)
    }
    await saveDB(db)
    const visitorRows = visitors.length
      ? visitors.map(npc => {
        const visitor = cafe.currentVisitors.find(entry => entry.id === npc.id)
        const remainingMinutes = Math.min(
          Math.ceil(CAFE_VISITOR_STAY_MS / 60000),
          Math.max(1, Math.ceil((Number(visitor?.expiresAt) - now) / 60000))
        )
        return `> ↳ ☕ *${npc.name}* · ${visitor?.talked ? 'sudah diajak bicara' : `suka ${npc.preference}`} · di sini ${remainingMinutes} menit lagi`
      }).join('\n')
      : `> ↳ ${cafe.status === 'open' ? 'Belum ada pengunjung.' : 'Cafe sedang tutup; NPC tidak berkunjung.'}`
    const staffRows = working.length
      ? working.map(employee =>
        `> ↳ 🧑‍🍳 *${employee.name}*\n   ${CAFE_STAFF[employee.role]?.name || 'Staff'} · ${hasCafeStaffBeenTalkedTo(cafe, employee.id) ? 'sudah diajak bicara' : 'sedang bertugas'}`
      ).join('\n')
      : '> ↳ Belum ada staff yang sedang bertugas.'
    const talkButtons = [
      ...visitors
        .filter(npc => !cafe.currentVisitors.find(entry => entry.id === npc.id)?.talked)
        .map(npc => [`💬 Bicara dengan ${npc.name}`, `${prefix}cafe talk npc ${npc.id}`]),
      ...working
        .filter(employee => !hasCafeStaffBeenTalkedTo(cafe, employee.id))
        .map(employee => [`🧑‍🍳 Bicara dengan ${employee.name}`, `${prefix}cafe talk staff ${employee.name}`]),
      ['📖 Cara kerja Cafe', `${prefix}cafe guide`],
      ['📹 Pantau CCTV', `${prefix}cafe cctv`]
    ]
    return sendCafePage(
      conn,
      m,
      `╭─❏「 🚶 KUNJUNGAN AVELIA CAFE 」❏\n│ ${cafe.name} · ${cafe.status === 'open' ? '🟢 Buka' : '🔴 Tutup'}\n╰─━━━━━━━━━━━━━━─\n\n` +
      `☕ *NPC YANG SEDANG BERKUNJUNG*\n${visitorRows}\n\n` +
      `👥 *STAFF YANG SEDANG BEKERJA*\n${staffRows}\n\n` +
      `> ↳ Pengunjung Cafe dibuat saat Visit dan bertahan maksimal 30 menit.\n` +
      `> ↳ Shift pagi 07.00–19.00 dan shift malam 19.00–07.00 WIB.\n` +
      `> ↳ Popularitas +1 · cooldown Visit ${Math.ceil(CAFE_VISIT_COOLDOWN_MS / 60000)} menit.\n` +
      `> ↳ Pilih tombol dialog, atau gunakan *${prefix}cafe talk npc/staff <nama>*.`,
      talkButtons
    )
  }

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
    cafe.lastOperatedAt = Date.now() - 1
    await saveDB(db)
    return m.reply(`🔓 *${cafe.name}* kembali beroperasi. Shift berikutnya dimulai pukul 07.00 atau 19.00 WIB.`)
  }
  if (mode === 'menu') {
    const action = normalize(words[0] || 'list')
    if (action === 'catalog' || action === 'katalog') {
      const page = Math.max(1, Number(words.at(-1)) || 1)
      const catalog = Object.values(CAFE_MENU_CATALOG)
      const start = (page - 1) * CAFE_MENU_PAGE_SIZE
      const items = catalog.slice(start, start + CAFE_MENU_PAGE_SIZE)
      if (!items.length) return m.reply(`❌ Halaman katalog tidak tersedia. Total halaman: ${Math.ceil(catalog.length / CAFE_MENU_PAGE_SIZE)}.`)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 📋 KATALOG MENU CAFE 」❏\n│ Halaman ${page}/${Math.ceil(catalog.length / CAFE_MENU_PAGE_SIZE)}\n╰─━━━━━━━━━━━━━━─\n\n` +
        items.map((item, index) => {
          const number = start + index + 1
          const active = cafe.menu[item.id]?.enabled ? '\n> Status : ✅ Aktif' : ''
          return `*${number}. ${item.name} ${item.emoji}*\n> Harga : ${money(item.basePrice)}${active}`
        }).join('\n') +
        `\n\n> ↳ Menu aktif : ${Object.values(cafe.menu).filter(choice => choice.enabled).length}/${getCafeMenuLimit(cafe)}\n` +
        `> ↳ Tambahkan: *${prefix}cafe menu add <nomor/nama>*`,
        [
          ['🧾 Menu aktif', `${prefix}cafe menu`],
          ['📦 Kelola stok', `${prefix}cafe stock`],
          ['🏠 Cafe', `${prefix}cafe`]
        ]
      )
    }
    if (action === 'add' || action === 'tambah') {
      const item = findCatalogEntry(words.slice(1).join(' '), CAFE_MENU_CATALOG)
      if (!item) return m.reply(`❌ Menu tidak ditemukan. Gunakan *${prefix}cafe menu catalog*.`)
      if (cafe.menu[item.id]?.enabled) return m.reply('Menu tersebut sudah aktif di cafe kamu.')
      const activeMenus = Object.values(cafe.menu).filter(choice => choice.enabled).length
      if (activeMenus >= getCafeMenuLimit(cafe)) {
        return m.reply(`📋 Batas menu level ${cafe.level} sudah penuh (${activeMenus}/${getCafeMenuLimit(cafe)}). Naikkan level Cafe untuk membuka slot menu.`)
      }
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
      const item = findCatalogEntry(words.slice(1, -1).join(' '), CAFE_MENU_CATALOG)
      const price = parseRpgMoneyAmount(words.at(-1))
      if (!item || !cafe.menu[item.id]?.enabled || price === null || price === undefined) {
        return m.reply(`Format: *${prefix}cafe menu price <nomor/nama> <harga>* untuk menu aktif.`)
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
    return sendCafePage(
      conn,
      m,
      `╭─❏「 📋 MENU ${cafe.name} 」❏\n│ Menu yang siap disajikan\n╰─━━━━━━━━━━━━━━─\n\n` +
      `${menus.length ? formatMenuRows(menus) : '> Belum ada menu aktif.'}\n\n` +
      `> ↳ Kapasitas menu : ${menus.length}/${getCafeMenuLimit(cafe)}\n` +
      `> ↳ Lihat katalog: ${prefix}cafe menu catalog\n` +
      `> ↳ Tambah/hapus menu: ${prefix}cafe menu add/remove <nomor/nama>\n` +
      `> ↳ Atur harga: ${prefix}cafe menu price <nomor/nama> <harga>`,
      [
        ['✨ Jelajahi katalog', `${prefix}cafe menu catalog`],
        ['📦 Periksa stok', `${prefix}cafe stock`],
        ['📊 Ringkasan cafe', `${prefix}cafe`]
      ]
    )
  }
  if (mode === 'supplier' || (mode === 'stock' && normalize(words[0]) === 'supplier')) {
    const page = Math.max(1, Number(words.at(-1)) || 1)
    const ingredients = Object.values(CAFE_INGREDIENT_CATALOG)
    const start = (page - 1) * CAFE_INGREDIENT_PAGE_SIZE
    const items = ingredients.slice(start, start + CAFE_INGREDIENT_PAGE_SIZE)
    return sendCafePage(
      conn,
      m,
      `╭─❏「 📦 SUPPLIER BAHAN BAKU 」❏\n│ Halaman ${page}/${Math.max(1, Math.ceil(ingredients.length / CAFE_INGREDIENT_PAGE_SIZE))}\n╰─━━━━━━━━━━━━━━─\n\n` +
      `${items.map((item, index) => `*${start + index + 1}. ${item.name} 🧺*\n> Harga : ${money(item.unitPrice)}/unit`).join('\n') || '> Halaman tidak tersedia.'}\n\n` +
      `🛒 Beli dengan: *${prefix}cafe stock buy <nomor/nama> <jumlah>*`,
      [
        ['📦 Lihat stok', `${prefix}cafe stock`],
        ['📋 Lihat menu', `${prefix}cafe menu`],
        ['🏠 Cafe', `${prefix}cafe`]
      ]
    )
  }
  if (mode === 'stock' && normalize(words[0]) === 'buy') {
    const quantity = Number(words.at(-1))
    const item = findCatalogEntry(words.slice(1, -1).join(' '), CAFE_INGREDIENT_CATALOG)
    if (!item || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return m.reply(`Format: *${prefix}cafe stock buy <nomor/nama-bahan> <jumlah 1-${MAX_QUANTITY}>*.`)
    }
    const total = item.unitPrice * quantity
    if (!addCafeExpense(cafe, db.data, jid, total, getTaxPeriod(), `${item.name} x${quantity}`)) {
      return m.reply(`❌ Saldo bisnis tidak cukup. Butuh ${money(total)}, saldo ${money(cafe.finance.balance)}. Setor dengan *.cafe deposit <nominal>*.`)
    }
    recordTaxActivity(db.data, jid, 'purchase', total)
    cafe.stock[item.id] = (Number(cafe.stock[item.id]) || 0) + quantity
    await saveDB(db)
    return m.reply(`✅ Stok ${item.name} x${quantity} dibeli.\n> ↳ Pengeluaran bisnis : ${money(total)}\n> ↳ Sisa saldo bisnis : ${money(cafe.finance.balance)}`)
  }
  if (mode === 'stock' || mode === 'inventory') {
    const entries = Object.entries(cafe.stock).filter(([, quantity]) => Number(quantity) > 0)
    return sendCafePage(
      conn,
      m,
      `╭─❏「 📦 INVENTARIS CAFE 」❏\n│ Bahan baku dan persediaan aktif\n╰─━━━━━━━━━━━━━━─\n\n` +
      `${entries.length
        ? entries.map(([id, quantity]) => `> ↳ ${CAFE_INGREDIENT_CATALOG[id]?.name || id} x${quantity}`).join('\n')
        : '> Belum ada bahan baku.'}\n\n` +
      `> ↳ Supplier: ${prefix}cafe supplier`,
      [
        ['🛒 Beli bahan', `${prefix}cafe supplier`],
        ['🍽️ Atur menu', `${prefix}cafe menu`],
        ['👥 Lihat staff', `${prefix}cafe staff`]
      ]
    )
  }
  if (mode === 'staff') {
    const action = normalize(words[0] || 'list')
    if (action === 'hire' || action === 'rekrut') {
      const requestedRole = words.slice(1).join(' ')
      const hireAll = normalize(requestedRole) === 'all'
      if (hireAll && !premium) {
        return m.reply(`👑 Rekrut semua posisi khusus Premium. Kamu tetap bisa merekrut beberapa staff pada posisi yang sama dengan nama posisi.`)
      }
      const roleEntries = Object.entries(CAFE_STAFF)
      const selectedRole = !hireAll && requestedRole
        ? roleEntries.find(([, item]) => normalize(item.name) === normalize(requestedRole))
          || roleEntries.find(([, item]) => normalize(item.name).includes(normalize(requestedRole)))
          || (Number.isSafeInteger(Number(requestedRole)) && Number(requestedRole) >= 1
            ? roleEntries[Number(requestedRole) - 1]
            : null)
        : null
      if (!hireAll && requestedRole && !selectedRole) {
        return m.reply(`❌ Posisi tidak ditemukan. Pilih nama/nomor posisi dari *${prefix}cafe staff hire*.`)
      }
      if (!hireAll && !requestedRole) {
        return sendCafePage(
          conn,
          m,
          `╭─❏「 ✨ REKRUT TIM CAFE 」❏\n│ Pilih posisi untuk memperkuat layanan\n╰─━━━━━━━━━━━━━━─\n\n` +
          roleEntries.map(([, item], index) =>
            `> ${index + 1}. ${item.name}\n   💸 Rekrut ${money(item.hiringCost)} · Gaji ${money(item.salary)}/shift`
          ).join('\n') +
          `\n\nRekrut posisi yang sama berkali-kali. Staff yang belum bertugas akan masuk rotasi shift.`,
          [
            ...roleEntries.map(([, item]) => [`✨ ${item.name}`, `${prefix}cafe staff hire ${item.name}`]),
            ...(premium ? [['👑 Rekrut semua posisi', `${prefix}cafe staff hire all`]] : []),
            ['👥 Lihat tim', `${prefix}cafe staff`]
          ]
        )
      }
      const toHire = hireAll ? roleEntries : [selectedRole]
      const hiringCost = toHire.reduce((sum, [, staff]) => sum + BigInt(staff.hiringCost), 0n)
      const description = hireAll ? 'Rekrut seluruh posisi' : `Rekrut ${selectedRole[1].name}`
      if (!addCafeExpense(cafe, db.data, jid, hiringCost, getTaxPeriod(), description)) {
        return m.reply(`❌ Saldo bisnis tidak cukup untuk biaya rekrut ${money(hiringCost.toString())}.`)
      }
      const hired = toHire.map(([role]) => {
        const employee = createCafeStaffMember(role, Date.now(), Math.random, cafe)
        cafe.staff[employee.id] = employee
        return employee
      })
      recordTaxActivity(db.data, jid, 'purchase', hiringCost)
      await saveDB(db)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 ✨ STAFF BERGABUNG 」❏\n│ ${hired.length} staff siap masuk rotasi\n╰─━━━━━━━━━━━━━━─\n\n` +
        hired.map((employee, index) =>
          `> ${index + 1}. ${employee.name}\n   🧑‍🍳 ${CAFE_STAFF[employee.role].name} · ${money(CAFE_STAFF[employee.role].salary)}/shift`
        ).join('\n') +
        `\n\n> ↳ 💸 Biaya rekrut : ${money(hiringCost.toString())}\n> ↳ Staff langsung masuk jadwal; jumlah yang bertugas mengikuti level Cafe.`,
        [
          ['👥 Lihat semua staff', `${prefix}cafe staff`],
          ['📹 CCTV cafe', `${prefix}cafe cctv`]
        ]
      )
    }
    if (action === 'fire' || action === 'pecat') {
      const selected = findCafeEmployee(cafe, words.slice(1).join(' '))
      if (!selected) return m.reply(`❌ Staff tidak ditemukan. Gunakan nama atau nomor pada *${prefix}cafe staff*.`)
      const [id, employee] = selected
      const role = getCafeStaffRole(employee)
      const name = employee.name || CAFE_STAFF[role].name
      delete cafe.staff[id]
      await saveDB(db)
      return m.reply(`👋 *${name}* (${CAFE_STAFF[role].name}) sudah diberhentikan. Gaji berhenti pada shift berikutnya.`)
    }
    if (action === 'salary' || action === 'upah' || action === 'gaji') {
      const multiplierWords = words.slice(-1)
      const selected = findCafeEmployee(cafe, words.slice(1, -1).join(' '))
      const employee = selected?.[1]
      const role = getCafeStaffRole(employee)
      const rawMultiplier = String(multiplierWords[0] || '').toLowerCase().replace(/x$/, '')
      const multiplier = Number(rawMultiplier)
      if (!employee || !role) {
        return m.reply(`Format: *${prefix}cafe staff salary <nama/nomor staff> <kali>x*.`)
      }
      if (!Number.isSafeInteger(multiplier) || multiplier < 1 || multiplier > CAFE_MAX_STAFF_SALARY_MULTIPLIER) {
        return m.reply(`⚠️ Nilai upah harus berupa kelipatan 1x–${CAFE_MAX_STAFF_SALARY_MULTIPLIER}x.`)
      }
      if (multiplier < Number(employee.salaryMultiplier || 1)) {
        return m.reply('📉 Gaji hanya dapat dinaikkan. Untuk menurunkan kembali, rekrut ulang setelah memberhentikan staff.')
      }
      employee.salaryMultiplier = multiplier
      await saveDB(db)
      const salary = BigInt(CAFE_STAFF[role].salary) * BigInt(multiplier)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 💵 PENYESUAIAN GAJI 」❏\n│ Kinerja meningkat seiring apresiasi\n╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ 👤 ${employee.name} · ${CAFE_STAFF[role].name}\n` +
        `> ↳ 💸 Upah baru : ${money(salary.toString())}/shift (${multiplier}x)\n` +
        `> ↳ ⚡ Dampak : kinerja layanan dan pertumbuhan popularitas meningkat\n` +
        `> ↳ 🧾 Gaji dibayarkan dari saldo cafe setiap shift.`,
        [
          ['👥 Daftar tim', `${prefix}cafe staff`],
          ['📹 CCTV', `${prefix}cafe cctv`]
        ]
      )
    }
    if (action === 'working' || action === 'bertugas') {
      const working = getWorkingStaff(cafe)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 🕒 JADWAL STAFF 」❏\n│ Siapa yang sedang bertugas?\n╰─━━━━━━━━━━━━━━─\n\n` +
        `${working.length
          ? working.map((employee, index) => `> ${index + 1}. ${employee.name}\n   🧑‍🍳 ${CAFE_STAFF[employee.role]?.name || 'Staff'}`).join('\n')
          : '> ↳ Belum ada catatan shift terbaru.'}\n\n` +
        `> ↳ Shift : ${cafe.lastShift ? getCafeShiftLabel(cafe.lastShift.at) : 'Menunggu jadwal'}\n` +
        `> ↳ Status cafe : ${cafe.status === 'open' ? '🟢 Buka' : '🔴 Tutup'}\n` +
        `> ↳ Kapasitas level ${cafe.level} : ${getCafeStaffCapacity(cafe)} staff/shift.`,
        [['📹 Buka CCTV', `${prefix}cafe cctv`], ['👥 Daftar staff', `${prefix}cafe staff`]]
      )
    }
    const working = new Set(getWorkingStaff(cafe).map(employee => employee.id))
    const employees = Object.entries(cafe.staff)
    const staffRows = employees.map(([id, employee], index) => {
      const role = getCafeStaffRole(employee)
      const item = CAFE_STAFF[role]
      const multiplier = Number(employee.salaryMultiplier) || 1
      const salary = BigInt(item.salary) * BigInt(multiplier)
      return `> ${index + 1}. ${working.has(id) ? '🟢' : '🟡'} *${employee.name}*\n` +
        `   🧑‍🍳 Posisi : ${item.name}\n` +
        `   🕒 Status : ${working.has(id) ? 'Bertugas' : 'Menunggu giliran'}\n` +
        `   💵 Gaji : ${money(salary.toString())}/shift (${multiplier}x)\n` +
        `   📌 Tunggakan : ${employee.unpaidShifts || 0}/2 shift`
    })
    return sendCafePage(
      conn,
      m,
      `╭─❏「 👥 TIM AVELIA CAFE 」❏\n│ Daftar staff tersusun rapi\n╰─━━━━━━━━━━━━━━─\n\n` +
      `${staffRows.length ? staffRows.join('\n\n') : '> Belum ada staff yang direkrut.'}` +
      `\n\n> ↳ Jumlah staff : ${employees.length}\n` +
      `> ↳ Kapasitas shift : ${getCafeStaffCapacity(cafe)} staff · Rotasi otomatis\n` +
      `> ↳ Rekrut : *${prefix}cafe staff hire <nama posisi>*\n` +
      `> ↳ Naikkan upah : *${prefix}cafe staff salary <nama/nomor> 2x*\n` +
      `> ↳ Premium : *${prefix}cafe auto pay on/off*\n` +
      `> ↳ Yang bertugas : *${prefix}cafe staff working*\n` +
      `> ↳ Karyawan bisa direkrut dalam jumlah banyak, termasuk posisi yang sama.`,
      [
        ['✨ Rekrut staff', `${prefix}cafe staff hire`],
        ['🕒 Lihat yang bertugas', `${prefix}cafe staff working`],
        ['📹 Pantau CCTV', `${prefix}cafe cctv`]
      ]
    )
  }
  if (mode === 'upgrade') {
    const id = normalize(words[0])
    const upgrade = CAFE_UPGRADES[id]
    if (!upgrade) {
      return sendCafePage(
        conn,
        m,
        `╭─❏「 ⬆️ KEMBANGKAN CAFE 」❏\n│ Tingkatkan kapasitas untuk menerima lebih banyak tamu\n╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ 🪑 Kapasitas saat ini : ${cafe.capacity}/${CAFE_MAX_CUSTOMERS_PER_SHIFT} tamu per shift\n` +
        `> ↳ 📋 Slot menu : ${Object.values(cafe.menu).filter(choice => choice.enabled).length}/${getCafeMenuLimit(cafe)} · 👥 Staff/shift : ${getCafeStaffCapacity(cafe)}\n` +
        `> ↳ ⭐ Level : ${cafe.level} · Popularitas : ${cafe.popularity.toLocaleString('id-ID')} poin\n\n` +
        Object.entries(CAFE_UPGRADES).map(([key, value]) =>
          `> ↳ ${key === 'capacity' ? '🪑' : key === 'kitchen' ? '🍳' : '✨'} ${value.name} — ${money(value.basePrice)} per level${value.capacityBonus ? ` · +${value.capacityBonus} kapasitas` : ''}`
        ).join('\n') +
        `\n\nLevel Cafe juga menambah slot menu, staff yang bertugas, dan kapasitas layanan.\n` +
        `Gunakan *${prefix}cafe upgrade <capacity|kitchen|service>* untuk upgrade khusus.`,
        [
          ['🪑 Upgrade kapasitas', `${prefix}cafe upgrade capacity`],
          ['🍳 Upgrade dapur', `${prefix}cafe upgrade kitchen`],
          ['✨ Upgrade layanan', `${prefix}cafe upgrade service`]
        ]
      )
    }
    cafe.upgrades[id] = Number(cafe.upgrades[id]) || 0
    const cost = upgrade.basePrice * (cafe.upgrades[id] + 1)
    if (upgrade.capacityBonus && cafe.capacity >= CAFE_MAX_CUSTOMERS_PER_SHIFT) {
      return m.reply(`🏆 Kapasitas cafe sudah mencapai batas ${CAFE_MAX_CUSTOMERS_PER_SHIFT} pengunjung per shift.`)
    }
    if (!addCafeExpense(cafe, db.data, jid, cost, getTaxPeriod(), `Upgrade ${upgrade.name}`)) return m.reply(`❌ Saldo bisnis tidak cukup. Upgrade membutuhkan ${money(cost)}.`)
    recordTaxActivity(db.data, jid, 'purchase', cost)
    cafe.upgrades[id]++
    if (upgrade.capacityBonus) cafe.capacity = Math.min(CAFE_MAX_CUSTOMERS_PER_SHIFT, cafe.capacity + upgrade.capacityBonus)
    if (upgrade.reputationBonus) cafe.reputation = Math.min(100, cafe.reputation + upgrade.reputationBonus)
    await saveDB(db)
    return sendCafePage(
      conn,
      m,
      `╭─❏「 ✅ UPGRADE BERHASIL 」❏\n│ ${upgrade.name} kini level ${cafe.upgrades[id]}\n╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 🪑 Kapasitas : ${cafe.capacity}/${CAFE_MAX_CUSTOMERS_PER_SHIFT} pengunjung/shift\n` +
      `> ↳ 💰 Saldo bisnis : ${money(cafe.finance.balance)}\n` +
      `> ↳ ⭐ Level cafe : ${cafe.level} · Popularitas : ${cafe.popularity.toLocaleString('id-ID')} poin`,
      [
        ['⬆️ Upgrade lagi', `${prefix}cafe upgrade`],
        ['📹 Pantau CCTV', `${prefix}cafe cctv`],
        ['📊 Lihat cafe', `${prefix}cafe`]
      ]
    )
  }
  if (mode === 'auto' || mode === 'autopay' || mode === 'restock') {
    const target = mode === 'autopay' ? 'pay' : mode === 'restock' ? 'restock' : normalize(words[0] || '')
    const state = normalize(mode === 'auto' ? words[1] || '' : words[0] || '')
    if (!premium) return m.reply('👑 Auto-restock dan auto-pay khusus akun Premium.')
    if (target !== 'pay' && target !== 'restock') {
      return m.reply(`Format: *${prefix}cafe auto <restock/pay> <on/off>*.`)
    }
    if (state !== 'on' && state !== 'off' && state !== 'aktif' && state !== 'mati') {
      return m.reply(`Format: *${prefix}cafe auto ${target} <on/off>*.`)
    }
    const enabled = state === 'on' || state === 'aktif'
    if (target === 'pay') cafe.autoPay = enabled
    else cafe.autoRestock = enabled
    await saveDB(db)
    const label = target === 'pay' ? 'Auto-pay gaji staff' : 'Auto-restock bahan'
    return m.reply(`${enabled ? '✅' : '🔕'} ${label} ${enabled ? 'diaktifkan' : 'dimatikan'}${target === 'pay'
      ? enabled ? '. Jika saldo Cafe kurang, gaji diambil dari saldo tunai.' : '.'
      : enabled ? '. Bahan menu aktif dibeli otomatis dari saldo Cafe setiap shift.' : '.'}`)
  }
  if (mode === 'theme') {
    const themeEntries = Object.entries(CAFE_THEMES)
    const isPageRequest = normalize(words[0]) === 'page'
    const requestedTheme = isPageRequest ? '' : words.join(' ')
    if (!requestedTheme || isPageRequest) {
      const page = isPageRequest ? Math.max(1, Math.floor(Number(words[1]) || 1)) : 1
      const start = (page - 1) * CAFE_THEME_PAGE_SIZE
      const themes = themeEntries.slice(start, start + CAFE_THEME_PAGE_SIZE)
      const totalPages = Math.ceil(themeEntries.length / CAFE_THEME_PAGE_SIZE)
      if (!themes.length) return m.reply(`❌ Halaman tema tidak tersedia. Total halaman: ${totalPages}.`)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 🎨 TEMA AVELIA CAFE 」❏\n│ Halaman ${page}/${totalPages}\n╰─━━━━━━━━━━━━━━─\n\n` +
        themes.map(([id, theme], index) =>
          `> ${start + index + 1}. ${cafe.theme === id ? '✅' : '🎨'} ${theme.name} · ${money(getCafeThemePrice(cafe, id).total)}\n` +
          `   ✨ ${theme.benefit}\n   ⚠️ ${theme.drawback}`
        ).join('\n') +
        `\n\nHarga menyesuaikan level, menu aktif, staff, dan upgrade cafe kamu.\nPilih tema dengan nomor atau nama. Efek tema berlaku selama digunakan.`,
        [
          ...themes.map(([, theme]) => [`🎨 ${theme.name}`, `${prefix}cafe theme ${theme.name}`]),
          ...(page > 1 ? [['⬅️ Sebelumnya', `${prefix}cafe theme page ${page - 1}`]] : []),
          ...(page < totalPages ? [['➡️ Berikutnya', `${prefix}cafe theme page ${page + 1}`]] : []),
          ['🏠 Cafe', `${prefix}cafe`]
        ]
      )
    }
    const themeIndex = Number(normalize(requestedTheme))
    const selectedTheme = Number.isSafeInteger(themeIndex) && themeIndex >= 1 && themeIndex <= themeEntries.length
      ? themeEntries[themeIndex - 1]
      : themeEntries.find(([, theme]) => normalize(theme.name) === normalize(requestedTheme))
        || themeEntries.find(([, theme]) => normalize(theme.name).includes(normalize(requestedTheme)))
    if (!selectedTheme) return m.reply('❌ Tema tidak tersedia. Gunakan nomor atau nama pada *cafe theme*.')
    const [themeId, theme] = selectedTheme
    if (cafe.theme === themeId) return m.reply('Tema tersebut sudah digunakan cafe kamu.')
    const price = getCafeThemePrice(cafe, themeId)
    if (BigInt(price.total) > 0n && !addCafeExpense(cafe, db.data, jid, price.total, getTaxPeriod(), `Tema ${theme.name}`)) {
      return m.reply(`❌ Saldo bisnis tidak cukup. Tema ini berharga ${money(price.total)}.`)
    }
    if (BigInt(price.total) > 0n) recordTaxActivity(db.data, jid, 'purchase', price.total)
    cafe.theme = themeId
    await saveDB(db)
    return sendCafePage(
      conn,
      m,
      `╭─❏「 🎨 TEMA CAFE DIPERBARUI 」❏\n│ ${theme.name}\n╰─━━━━━━━━━━━━━━─\n\n` +
      `✨ Keuntungan : ${theme.benefit}\n` +
      `⚠️ Konsekuensi : ${theme.drawback}\n` +
      `💸 Harga dasar (cafe kosong, level 1) : ${money(price.base)}\n` +
      `📈 Tambahan level (+10%/level) : ${money(price.level)}\n` +
      `🍽️ Menu aktif (+2%/menu) : ${money(price.menu)}\n` +
      `👥 Staff (+5%/orang) : ${money(price.staff)}\n` +
      `🛠️ Upgrade (+10%/level) : ${money(price.upgrades)}\n` +
      `💰 Total dibayar : ${money(price.total)}\n\n` +
      `Efek berlaku untuk shift berikutnya.`,
      [['🎨 Lihat tema lain', `${prefix}cafe theme`], ['🏠 Cafe', `${prefix}cafe`]]
    )
  }
  if (mode === 'cctv' || mode === 'camera' || mode === 'kamera') {
    const now = Date.now()
    const cooldown = getCafeCctvCooldownRemaining(cafe, now)
    if (cooldown > 0) {
      return m.reply(`⏳ CCTV masih cooldown. Coba lagi dalam ${Math.ceil(cooldown / 60000)} menit.`)
    }
    if (!registerCafeCctvView(cafe, now)) {
      return m.reply(`⏳ CCTV belum siap. Coba lagi dalam ${Math.ceil(CAFE_CCTV_COOLDOWN_MS / 60000)} menit.`)
    }
    const story = getCafeCctvStory(cafe)
    const working = getWorkingStaff(cafe)
    await saveDB(db)
    return sendCafePage(
      conn,
      m,
      `╭─❏「 📹 CCTV AVELIA CAFE 」❏\n│ Pantauan kondisi cafe\n╰─━━━━━━━━━━━━━━─\n\n` +
      `🎞️ Adegan : ${story.title}\n` +
      `> ${story.story}\n\n` +
      `🚦 Status : ${story.status}\n` +
      `🕒 Shift : ${cafe.lastShift ? getCafeShiftLabel(cafe.lastShift.at) : 'Menunggu jadwal'}\n` +
      `👥 Sedang bertugas : ${working.length ? working.map(employee => employee.name).join(', ') : 'Belum ada staff'}\n` +
      `🪑 Pengunjung shift ini : ${cafe.lastShift?.customers || 0}\n` +
      `⭐ Level Cafe : ${cafe.level}\n\n` +
      `Pantauan berikutnya tersedia dalam ${Math.ceil(CAFE_CCTV_COOLDOWN_MS / 60000)} menit.`,
      [
        ['👥 Jadwal staff', `${prefix}cafe staff working`],
        ['📊 Ringkasan', `${prefix}cafe`]
      ]
    )
  }
  if (mode === 'talk' || mode === 'interact') {
    const currentVisitorEntries = getCafeVisitors(cafe)
    const currentVisitors = currentVisitorEntries
      .map(visitor => CAFE_NPCS.find(npc => npc.id === visitor.id))
      .filter(Boolean)
    const working = getWorkingStaff(cafe)
    const targetType = normalize(words[0] || '')
    const isNpcTarget = targetType === 'npc' || targetType === 'pengunjung'
    const isStaffTarget = targetType === 'staff' || targetType === 'karyawan'
    const targetName = (isNpcTarget || isStaffTarget ? words.slice(1) : words).join(' ')
    if (!targetName) {
      const buttons = [
        ...currentVisitors
          .filter(npc => !currentVisitorEntries.find(entry => entry.id === npc.id)?.talked)
          .map(npc => [`💬 ${npc.name}`, `${prefix}cafe talk npc ${npc.id}`]),
        ...working
          .filter(employee => !hasCafeStaffBeenTalkedTo(cafe, employee.id))
          .map(employee => [`🧑‍🍳 ${employee.name}`, `${prefix}cafe talk staff ${employee.name}`]),
        ['🚶 Lihat yang ada di Cafe', `${prefix}cafe visit`]
      ]
      return sendCafePage(
        conn,
        m,
        `╭─❏「 💬 TEMAN NGOBROL CAFE 」❏\n│ Pilih pengunjung atau staff yang hadir\n╰─━━━━━━━━━━━━━━─\n\n` +
        `☕ *PENGUNJUNG*\n${currentVisitors.length
          ? currentVisitors.map(npc => {
            const visitor = currentVisitorEntries.find(entry => entry.id === npc.id)
            return `> ↳ ${visitor?.talked ? '✅ Sudah diajak bicara' : '💬 Siap ngobrol'} · ${npc.name} · ${npc.preference}`
          }).join('\n')
          : '> ↳ Belum ada NPC di Cafe. Gunakan .cafe visit.'}\n\n` +
        `👥 *STAFF BERTUGAS*\n${working.length
          ? working.map(employee =>
            `> ↳ ${hasCafeStaffBeenTalkedTo(cafe, employee.id) ? '✅ Sudah diajak bicara' : '💬 Siap ngobrol'} · ${employee.name} · ${CAFE_STAFF[employee.role]?.name || 'Staff'}`
          ).join('\n')
          : '> ↳ Belum ada staff bertugas saat ini.'}\n\n` +
        `Setiap NPC hanya bisa diajak bicara sekali selama kunjungannya; staff sekali per shift.`,
        buttons
      )
    }

    const normalizedName = normalize(targetName)
    const npc = !isStaffTarget
      ? currentVisitors.find(character =>
        normalize(character.id) === normalizedName || normalize(character.name) === normalizedName
      )
      : null
    const employee = !isNpcTarget
      ? (() => {
        const index = Number(normalizedName)
        if (Number.isSafeInteger(index) && index >= 1) return working[index - 1] || null
        return working.find(member =>
          normalize(member.name) === normalizedName ||
          normalize(CAFE_STAFF[member.role]?.name) === normalizedName
        ) || null
      })()
      : null
    if (npc) {
      const visitor = currentVisitorEntries.find(entry => entry.id === npc.id)
      if (visitor?.talked) {
        return m.reply(`💬 Kamu sudah mengobrol dengan *${npc.name}* pada kunjungan ini. Coba NPC lain atau tunggu kunjungan berikutnya.`)
      }
      const dialogueIndex = Math.min(npc.talk.length - 1, Math.floor(Math.random() * npc.talk.length))
      if (!markCafeVisitorTalked(cafe, npc.id)) {
        return m.reply(`👀 *${npc.name}* sudah tidak tersedia untuk diajak bicara. Gunakan *${prefix}cafe visit* untuk melihat pengunjung.`)
      }
      await saveDB(db)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 💬 DIALOG CAFE 」❏\n│ Percakapan langsung dengan ${npc.name}\n╰─━━━━━━━━━━━━━━─\n\n` +
        `🙋 *Kamu (Pemilik Cafe):*\n“${CAFE_DIALOGUE.npcTalkPrompt.replace('{name}', npc.name)}”\n\n` +
        `☕ *${npc.name} (Pengunjung):*\n“${npc.talk[dialogueIndex]}”\n\n` +
        `⭐ Popularitas Cafe *+1* · Total ${cafe.popularity.toLocaleString('id-ID')} poin\n` +
        `> ↳ Dialog ditampilkan di pesan ini. ${npc.name} hanya bisa diajak bicara sekali selama kunjungan ini.`,
        [
          ['💬 Teman ngobrol lain', `${prefix}cafe talk`],
          ['🏠 Ringkasan Cafe', `${prefix}cafe`]
        ]
      )
    }
    if (employee) {
      if (hasCafeStaffBeenTalkedTo(cafe, employee.id)) {
        return m.reply(`💬 Kamu sudah mengobrol dengan *${employee.name}* pada shift ini. Staff bisa diajak bicara lagi setelah shift berikutnya.`)
      }
      const dialogue = getCafeStaffDialogue(employee.role)
      if (!dialogue) return m.reply(`❌ Dialog untuk staff ${CAFE_STAFF[employee.role]?.name || 'staff'} belum tersedia.`)
      if (!markCafeStaffTalkedTo(cafe, employee.id)) {
        return m.reply(`👀 *${employee.name}* sudah tidak bertugas. Gunakan *${prefix}cafe visit* untuk melihat keadaan Cafe.`)
      }
      await saveDB(db)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 💬 DIALOG CAFE 」❏\n│ Percakapan langsung dengan ${employee.name}\n╰─━━━━━━━━━━━━━━─\n\n` +
        `🙋 *Kamu (Pemilik Cafe):*\n“${CAFE_DIALOGUE.staffTalkPrompt.replace('{name}', employee.name)}”\n\n` +
        `🧑‍🍳 *${employee.name} (${CAFE_STAFF[employee.role].name}):*\n“${dialogue}”\n\n` +
        `⭐ Popularitas Cafe *+1* · Total ${cafe.popularity.toLocaleString('id-ID')} poin\n` +
        `> ↳ Dialog ditampilkan di pesan ini. Staff hanya bisa diajak bicara sekali selama shift ini.`,
        [
          ['💬 Teman ngobrol lain', `${prefix}cafe talk`],
          ['🏠 Ringkasan Cafe', `${prefix}cafe`]
        ]
      )
    }
    const locationHint = isStaffTarget
      ? 'Staff hanya bisa diajak bicara saat sedang bertugas.'
      : isNpcTarget
        ? 'NPC hanya bisa diajak bicara selama masih berada di Cafe.'
        : 'Nama tersebut bukan NPC yang hadir atau staff yang sedang bertugas.'
    return m.reply(`👀 ${locationHint} Gunakan *${prefix}cafe visit* untuk melihat siapa yang ada di Cafe.`)
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
    return sendCafePage(
      conn,
      m,
      `╭─❏「 ${direction === 'deposit' ? '✅ MODAL DISETOR' : '✅ DANA DITARIK'} 」❏\n│ Keuangan cafe berhasil diperbarui\n╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 💸 Transaksi : ${money(amount)}\n` +
      `> ↳ 👛 Saldo tunai : ${money(account.money || 0)}\n` +
      `> ↳ 🏦 Saldo bisnis : ${money(cafe.finance.balance)}`,
      [
        ['💰 Setor modal', `${prefix}cafe deposit`],
        ['📊 Laporan', `${prefix}cafe report`],
        ['🏠 Ringkasan', `${prefix}cafe`]
      ]
    )
  }
  if (mode === 'operate' || mode === 'operasional') {
    const shifts = completedShifts || advanceCafeOperations(cafe, db.data, jid)
    await saveDB(db)
    return sendCafePage(conn, m, renderShift(cafe, shifts), [
      ['📹 Lihat CCTV', `${prefix}cafe cctv`],
      ['👥 Jadwal staff', `${prefix}cafe staff working`],
      ['📊 Laporan', `${prefix}cafe report`]
    ])
  }
  if (mode === 'tax') {
    const period = getTaxPeriod()
    const ledger = cafe.taxLedger[period] || { income: '0', expenses: '0' }
    const profit = BigInt(ledger.income) - BigInt(ledger.expenses)
    const taxableProfit = profit > 0n ? profit : 0n
    const state = ensureTaxState(db.data)
    const tax = taxableProfit * BigInt(state.config.rates.business || 0) / 10000n
    return sendCafePage(
      conn,
      m,
      `╭─❏「 🧾 CAFE BUSINESS TAX 」❏\n│ Estimasi pajak laba bersih · ${period}\n╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 📥 Pendapatan : ${money(ledger.income)}\n` +
      `> ↳ 📤 Pengeluaran : ${money(ledger.expenses)}\n` +
      `> ↳ 💹 Laba kena pajak : ${money(taxableProfit.toString())}\n` +
      `> ↳ 📊 Tarif : ${state.config.rates.business / 100}%\n` +
      `> ↳ 💰 Estimasi pajak : ${money(tax.toString())}\n\n` +
      `Pajak final tercantum pada tagihan mingguan.`,
      [['🧾 Lihat tagihan', `${prefix}tax bill`], ['📊 Laporan bisnis', `${prefix}cafe report`]]
    )
  }
  if (mode === 'history') {
    const history = cafe.finance.transactions.slice(0, 15)
    return sendCafePage(
      conn,
      m,
      `╭─❏「 📜 RIWAYAT CAFE 」❏\n│ 15 transaksi terakhir\n╰─━━━━━━━━━━━━━━─\n\n` +
      `${history.length
        ? history.map(item => `> ↳ ${item.type === 'sale' ? '🛍️' : '💸'} ${item.id} · ${item.type} · ${money(item.amount)} · ${item.description || ''}`).join('\n')
        : '> ↳ Belum ada transaksi.'}`,
      [['💹 Laporan', `${prefix}cafe report`], ['🏠 Ringkasan cafe', `${prefix}cafe`]]
    )
  }
  if (['balance', 'income', 'expense', 'expenses', 'profit', 'report', 'info', 'profile', 'status', 'customers', 'satisfaction', 'reputation', 'popularity', 'level', 'exp', 'achievement'].includes(mode)) {
    if (mode === 'balance') return sendCafePage(conn, m, `╭─❏「 🏦 SALDO BISNIS 」❏\n│ ${cafe.name}\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Saldo cafe : *${money(cafe.finance.balance)}*`, [['💸 Setor modal', `${prefix}cafe deposit`], ['📊 Laporan', `${prefix}cafe report`]])
    if (mode === 'income') return sendCafePage(conn, m, `╭─❏「 📥 PENDAPATAN CAFE 」❏\n│ Akumulasi seluruh penjualan\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Pendapatan : *${money(cafe.finance.income)}*`, [['📜 Riwayat', `${prefix}cafe history`], ['📊 Laporan', `${prefix}cafe report`]])
    if (mode === 'expense' || mode === 'expenses') return sendCafePage(conn, m, `╭─❏「 📤 PENGELUARAN CAFE 」❏\n│ Operasional, stok, dan gaji\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Total pengeluaran : *${money(cafe.finance.expenses)}*`, [['📜 Riwayat', `${prefix}cafe history`], ['👥 Kelola staff', `${prefix}cafe staff`]])
    if (mode === 'profit') return sendCafePage(conn, m, `╭─❏「 💹 LABA BERSIH CAFE 」❏\n│ Pendapatan dikurangi seluruh biaya\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Laba bersih : *${money(getProfit(cafe).toString())}*`, [['🧾 Estimasi pajak', `${prefix}cafe tax`], ['📊 Laporan', `${prefix}cafe report`]])
    if (mode === 'customers') return sendCafePage(conn, m, `╭─❏「 👥 PENGUNJUNG CAFE 」❏\n│ Statistik layanan\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Total pengunjung : *${cafe.finance.totalCustomers}*\n> ↳ Transaksi berhasil : *${cafe.finance.totalOrders}*\n> ↳ Batas per shift : *${cafe.capacity}/${CAFE_MAX_CUSTOMERS_PER_SHIFT}*`, [['⬆️ Upgrade kapasitas', `${prefix}cafe upgrade`], ['📹 CCTV', `${prefix}cafe cctv`]])
    if (mode === 'satisfaction') return sendCafePage(conn, m, `╭─❏「 😊 KEPUASAN PELANGGAN 」❏\n│ Pengalaman pengunjung Cafe\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Kepuasan : *${cafe.finance.satisfaction}%*\n> ↳ Reputasi : *${cafe.reputation}/100*`, [['📹 Pantau CCTV', `${prefix}cafe cctv`], ['👥 Kelola staff', `${prefix}cafe staff`]])
    if (mode === 'reputation') return sendCafePage(conn, m, `╭─❏「 ⭐ REPUTASI CAFE 」❏\n│ Kepercayaan pengunjung\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Reputasi : *${cafe.reputation}/100*`, [['✨ Upgrade layanan', `${prefix}cafe upgrade service`], ['📹 CCTV', `${prefix}cafe cctv`]])
    if (mode === 'popularity') return sendCafePage(conn, m, `╭─❏「 📣 POPULARITAS CAFE 」❏\n│ Poin popularitas mendatangkan pengunjung\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Popularitas : *${cafe.popularity.toLocaleString('id-ID')} poin*\n> ↳ Kapasitas : *${cafe.capacity}/${CAFE_MAX_CUSTOMERS_PER_SHIFT} tamu/shift*`, [['⬆️ Tambah kapasitas', `${prefix}cafe upgrade capacity`], ['📊 Ringkasan cafe', `${prefix}cafe`]])
    if (mode === 'level' || mode === 'exp') return sendCafePage(conn, m, `╭─❏「 📈 LEVEL CAFE 」❏\n│ Tumbuh melalui transaksi yang berhasil\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Level : *${cafe.level}*\n> ↳ EXP : *${cafe.exp}/${cafe.level * 100}*\n> ↳ Popularitas : *${cafe.popularity.toLocaleString('id-ID')} poin*`, [['⬆️ Upgrade cafe', `${prefix}cafe upgrade`], ['📊 Laporan', `${prefix}cafe report`]])
    if (mode === 'achievement') return sendCafePage(conn, m, `╭─❏「 🏅 PENCAPAIAN CAFE 」❏\n│ Perjalanan bisnis kulinermu\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Pengunjung : *${cafe.finance.totalCustomers}*\n> ↳ Transaksi : *${cafe.finance.totalOrders}*\n> ↳ Level : *${cafe.level}*\n> ↳ Popularitas : *${cafe.popularity.toLocaleString('id-ID')} poin*`, [['📹 CCTV', `${prefix}cafe cctv`], ['📊 Laporan', `${prefix}cafe report`]])
    if (mode === 'report') {
      const period = getTaxPeriod()
      const ledger = cafe.taxLedger[period] || { income: '0', expenses: '0' }
      const periodProfit = BigInt(ledger.income) - BigInt(ledger.expenses)
      return sendCafePage(
        conn,
        m,
        `╭─❏「 📊 LAPORAN KEUANGAN CAFE 」❏\n│ Ringkasan bisnis dan periode ${period}\n╰─━━━━━━━━━━━━━━─\n\n` +
        `💰 *KESELURUHAN*\n> ↳ Saldo : ${money(cafe.finance.balance)}\n> ↳ Pendapatan : ${money(cafe.finance.income)}\n> ↳ Pengeluaran : ${money(cafe.finance.expenses)}\n> ↳ Laba bersih : ${money(getProfit(cafe).toString())}\n\n` +
        `📅 *PERIODE INI*\n> ↳ Pendapatan : ${money(ledger.income)}\n> ↳ Pengeluaran : ${money(ledger.expenses)}\n> ↳ Laba kena pajak : ${money((periodProfit > 0n ? periodProfit : 0n).toString())}\n> ↳ Pengunjung : ${cafe.finance.totalCustomers}\n> ↳ Transaksi : ${cafe.finance.totalOrders}`,
        [
          ['🧾 Estimasi pajak', `${prefix}cafe tax`],
          ['📜 Riwayat', `${prefix}cafe history`],
          ['🏠 Ringkasan cafe', `${prefix}cafe`]
        ]
      )
    }
    return m.reply(renderCafe(cafe, jid, prefix))
  }
  return m.reply(`Command cafe tidak dikenal. Gunakan *${prefix}cafe command*.`)
}

handler.help = [
  'cafe',
  'cafe buy <nama>',
  'cafe staff',
  'cafe staff hire <nama/nomor posisi>',
  'cafe staff salary <nama/nomor staff> <kali>x',
  'cafe staff fire <nama/nomor staff>',
  'cafe auto restock <on/off>',
  'cafe auto pay <on/off>',
  'cafe menu add <nama/nomor>',
  'cafe stock buy <nama/nomor> <jumlah>',
  'cafe cctv',
  'cafe visit',
  'cafe talk npc <nama>',
  'cafe talk staff <nama>',
  'cafe upgrade',
  'cafe menu',
  'cafe stock',
  'cafe report'
]
handler.tags = ['rpg', 'economy']
handler.command = /^(cafe|kafe)$/i
handler.before = async function () {
  startCafeScheduler()
}

export default handler
