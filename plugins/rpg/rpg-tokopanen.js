import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { bibit } from './rpg-tanam.js'
import { scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'

function formatNama(nama) {
  if (!nama || typeof nama !== 'string') return ''
  return nama.replace(/_/g, ' ').split(/\s+/).filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.inventory) user.inventory = {}

  const isPrem = global.db.data.users[m.sender]?.premium === true
  const sellBonus = isPrem ? 1.1 : 1

  let legacyMigrated = false
  for (const key of ['uang', 'money']) {
    const amount = Number(user.inventory[key]) || 0
    if (amount > 0) {
      wdb.money[m.sender] = (Number(wdb.money[m.sender]) || 0) + amount
      delete user.inventory[key]
      legacyMigrated = true
    }
  }
  const legacyExp = Number(user.inventory.exp) || 0
  if (legacyExp > 0) {
    user.exp = (Number(user.exp) || 0) + legacyExp
    delete user.inventory.exp
    user.level = Number(user.level) || 1
    while (user.exp >= user.level * 500) {
      user.exp -= user.level * 500
      user.level++
    }
    legacyMigrated = true
  }
  if (legacyMigrated) await saveDB(wdb)

  // Harga panen mengikuti harga dasar bibit di rpg-tanam.js.
  const hargaLegacy = {
    'kacang': { emoji: '🥜', harga: 6500 },
    'bawang_putih': { emoji: '🧄', harga: 7500 },
    'padi': { emoji: '🌾', harga: 7500 },
    'bawang_merah': { emoji: '🧅', harga: 8000 },
    'wortel': { emoji: '🥕', harga: 9000 },
    'timun': { emoji: '🥒', harga: 10000 },
    'selada': { emoji: '🥬', harga: 12000 },
    'kentang': { emoji: '🥔', harga: 12500 },
    'tomat': { emoji: '🍅', harga: 13500 },
    'ubi': { emoji: '🍠', harga: 13500 },
    'jagung': { emoji: '🌽', harga: 15000 },
    'brokoli': { emoji: '🥦', harga: 15000 },
    'terong': { emoji: '🍆', harga: 16500 },
    'semangka': { emoji: '🍉', harga: 18000 },
    'lemon': { emoji: '🍋', harga: 18000 },
    'cabai': { emoji: '🌶️', harga: 19500 },
    'paprika': { emoji: '🫑', harga: 19000 },
    'stroberi': { emoji: '🍓', harga: 21000 },
    'jeruk': { emoji: '🍊', harga: 22500 },
    'bluberi': { emoji: '🫐', harga: 22500 },
    'ceri': { emoji: '🍒', harga: 24000 },
    'kastanye': { emoji: '🌰', harga: 25000 },
    'zaitun': { emoji: '🫒', harga: 25500 },
    'pisang': { emoji: '🍌', harga: 27000 },
    'nanas': { emoji: '🍍', harga: 28500 },
    'kiwi': { emoji: '🥝', harga: 28500 },
    'pir': { emoji: '🍐', harga: 30000 },
    'persik': { emoji: '🍑', harga: 30000 },
    'melon': { emoji: '🍈', harga: 31500 },
    'anggur': { emoji: '🍇', harga: 33000 },
    'mangga': { emoji: '🥭', harga: 34500 },
    'apel_hijau': { emoji: '🍏', harga: 36000 },
    'alpukat': { emoji: '🥑', harga: 36000 },
    'apel_merah': { emoji: '🍎', harga: 37500 },
    'kelapa': { emoji: '🥥', harga: 37500 },
    'sawit': { emoji: '🌴', harga: 50000 },
    'exp': { emoji: '✨', harga: 50000 },
    'durian': { emoji: '🌳', harga: 75000 },
    'uang': { emoji: '💵', harga: 75000 },
    'koin': { emoji: '🪙', harga: 90000 },
    'emas': { emoji: '⚜️', harga: 300000 },
    'berlian': { emoji: '💠', harga: 350000 } // DARI PERKEBUNAN
  }

  const harga = Object.fromEntries(Object.entries(bibit).filter(([item]) => !['uang', 'exp'].includes(item)).map(([item, info]) => [item, {
    emoji: info.emoji,
    harga: info.harga
  }]))

  void hargaLegacy

  const keys = Object.keys(harga).sort((a,b) => harga[a].harga - harga[b].harga)
  const nomorKeItem = {}
  keys.forEach((k, i) => nomorKeItem[i+1] = k)

  function getItemByInput(input) {
    if(!isNaN(input)) return nomorKeItem[parseInt(input)]
    return input.replace(/ /g, '_') // spasi -> _
  }

  let args = typeof text === 'string' ? text.trim().toLowerCase().split(/\s+/).filter(Boolean) : []
  let tipe = args[0]

  if (!args.length) {
    const cap = `╭─❏「 🌾 KOPERASI AVELIA 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Koperasi adalah tempat menjual hasil panen dari kebun dan pertanian.\n\n` +
      `> ↳ Lihat daftar command: *${usedPrefix}koperasi command*\n` +
      `> ↳ Baca panduan/tutorial: *${usedPrefix}koperasi guide*\n\n` +
      `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  if (tipe === 'command') {
    const cap = `╭─❏「 📋 COMMAND KOPERASI 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ${usedPrefix}koperasi list\n` +
      `> ${usedPrefix}koperasi jual <no/nama> <jumlah/all>\n` +
      `> ${usedPrefix}koperasi jual all\n` +
      `> ${usedPrefix}koperasi guide\n\n` +
      `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  if (tipe === 'guide') {
    const cap = `╭─❏「 🧭 PANDUAN KOPERASI 」❏\n` +
      `│ 🌾 Jual hasil panen dari kebun dan pertanian.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Lihat daftar hasil panen dan harga: *${usedPrefix}koperasi list*\n` +
      `> ↳ Jual panen: *${usedPrefix}koperasi jual <no/nama> <jumlah/all>*\n` +
      `> ↳ Jual semua panen: *${usedPrefix}koperasi jual all*\n` +
      `> ↳ Beli dan tanam bibit: *${usedPrefix}tanam*\n\n` +
      `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  // MENU DAFTAR HARGA
  if (tipe === 'list') {
    let cap = `╭─❏「 🏪 KOPERASI AVELIA 」❏\n`
    cap += `│ 💰 Uang: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `│ 👤 ${isPrem ? 'Premium +10% jual, -20% beli' : 'User Normal'}\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    cap += `📌 *MENU JUAL*\n`
    cap += `> ↳ Jual: *${usedPrefix}koperasi jual <no/nama> <jumlah/all>*\n`
    cap += `> ↳ Contoh: *${usedPrefix}koperasi jual 5 10*\n`
    cap += `> ↳ Jual Semua: *${usedPrefix}koperasi jual all*\n\n`

    cap += `📌 *MAU BELI BIBIT?*\n`
    cap += `> ↳ Ketik: *${usedPrefix}tanam* untuk beli & tanam bibit\n\n`

    cap += `🌾 *DAFTAR HARGA JUAL = HARGA BELI*\n`
    cap += `> ↳ Pilih nomor panen untuk menjual hasil kebun. Harga mengikuti nilai dasar panen.\n\n`

    keys.forEach((k,i) => {
      let h = Math.floor(harga[k].harga * sellBonus)
      const nama = formatNama(k)
      cap += `*${i + 1}. ${nama} ${harga[k].emoji || '📦'}*\n`
      cap += `> Buy : -\n`
      cap += `> Sell : Rp ${h.toLocaleString()}\n\n`
    })

    cap += `\n─━━━━━━━━━━━━━━─\n\n`
    cap += `💡 *Catatan:* Harga jual = Harga beli. Profit dari EXP`

    return m.reply(cap)
  }

  if(tipe!== 'jual') return m.reply(
    `❌ Pakai: *${usedPrefix}koperasi jual <no/nama> <jumlah/all>*\n\n` +
    `Mau beli bibit? ketik *${usedPrefix}tanam*`
  )

  args = args.slice(1)

  if (['ya', 'yes', 'batal', 'no'].includes(args[0])) {
    const pending = user.pendingKoperasiSell
    if (!pending || Date.now() > pending.expiresAt) {
      delete user.pendingKoperasiSell
      saveDB(wdb)
      return m.reply('❌ Konfirmasi jual koperasi tidak ada atau sudah kedaluwarsa. Ulangi perintah jual.')
    }
    if (['batal', 'no'].includes(args[0])) {
      delete user.pendingKoperasiSell
      saveDB(wdb)
      return m.reply('✅ Penjualan koperasi dibatalkan. Stok dan saldo tidak berubah.')
    }
    if (pending.entries.some(entry => (Number(user.inventory[entry.item]) || 0) < entry.quantity)) {
      delete user.pendingKoperasiSell
      saveDB(wdb)
      return m.reply('❌ Stok berubah sejak konfirmasi dibuat. Penjualan dibatalkan; buat konfirmasi baru.')
    }
    for (const entry of pending.entries) {
      user.inventory[entry.item] -= entry.quantity
      if (user.inventory[entry.item] <= 0) delete user.inventory[entry.item]
    }
    wdb.money[m.sender] = (Number(wdb.money[m.sender]) || 0) + pending.total
    delete user.pendingKoperasiSell
    saveDB(wdb)
    return m.reply(
      `╭─❏「 🌾 PENJUALAN KOPERASI BERHASIL 」❏\n` +
      `│ ✅ ${pending.entries.length} jenis panen terjual\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 💰 Diterima: +Rp ${pending.total.toLocaleString()}\n` +
      `> ↳ 💵 Saldo: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (['uang', 'money', 'exp'].includes(args[0])) {
    return m.reply(
      `ℹ️ *HASIL PANEN OTOMATIS*\n\n` +
      (args[0] === 'exp'
        ? `EXP hasil panen langsung masuk ke EXP RPG dan tidak bisa dijual.`
        : `Uang hasil panen langsung masuk ke uang saku dan tidak bisa dijual.`)
    )
  }

  // JUAL ALL
  if(args[0] === 'all' && args.length === 1){
    const entries = Object.entries(user.inventory)
      .filter(([item, quantity]) => harga[item] && Number.isSafeInteger(Number(quantity)) && Number(quantity) > 0)
      .map(([item, quantity]) => ({ item, quantity: Number(quantity) }))
    if (!entries.length) return m.reply(
      `❌ Kamu tidak punya item yang bisa dijual.\n\n` +
      `Mau nanem dulu? ketik *${usedPrefix}tanam*`
    )
    const baseTotal = entries.reduce((total, entry) => total + Math.floor(harga[entry.item].harga * sellBonus) * entry.quantity, 0)
    const total = scaleDifficultyIncome(user, baseTotal)
    user.pendingKoperasiSell = { entries, total, expiresAt: Date.now() + RPG_CONFIRMATION_TTL }
    saveDB(wdb)
    const list = entries.map(({ item, quantity }) => `> ↳ ${harga[item].emoji} ${formatNama(item)} x${quantity}`).join('\n')
    return m.reply(
      `╭─❏「 ⚠️ KONFIRMASI JUAL KOPERASI 」❏\n` +
      `│ 🌾 ${entries.length} jenis panen akan dijual\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${list}\n\n` +
      `> ↳ Perkiraan diterima: Rp ${total.toLocaleString()}\n\n` +
      `✅ Ketik *${usedPrefix}koperasi jual ya* untuk lanjut\n` +
      `❌ Ketik *${usedPrefix}koperasi jual batal* untuk membatalkan\n` +
      `⏳ Konfirmasi berlaku 5 menit.\n\n─━━━━━━━━━━━━━━─`
    )
  }

  // PARSER
  let amount = 1, itemInput = ''

  if(!isNaN(parseInt(args[0]))){
    if(!isNaN(parseInt(args[1]))){
      itemInput = getItemByInput(args[0])
      amount = parseInt(args[1])
    }
    else if(args[1] === 'all'){
      itemInput = getItemByInput(args[0])
      amount = 'all'
    }
    else {
      itemInput = getItemByInput(args[0])
      amount = parseInt(args[1]) || 1
    }
  }
  else if(!isNaN(parseInt(args[args.length-1]))){
    amount = parseInt(args[args.length-1])
    itemInput = getItemByInput(args.slice(0, -1).join(' '))
  }
  else if(args[args.length-1] === 'all'){
    amount = 'all'
    itemInput = getItemByInput(args.slice(0, -1).join(' '))
  }
  else {
    itemInput = getItemByInput(args.join(' '))
  }

  if (!harga[itemInput]) return m.reply(
    `❌ Item "${formatNama(itemInput)}" tidak bisa dijual.\n` +
    `Lihat list: *${usedPrefix}koperasi*`
  )

  let stok = user.inventory[itemInput] || 0

  if (stok <= 0) return m.reply(
    `❌ Kamu tidak punya ${formatNama(itemInput)}\n\n` +
    `Mau nanem dulu? ketik *${usedPrefix}tanam*`
  )

  let jual = amount === 'all'? stok : amount

  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

if (amount === 'all') {
  const total = scaleDifficultyIncome(user, Math.floor(harga[itemInput].harga * sellBonus) * jual)

  user.pendingKoperasiSell = {
    entries: [{ item: itemInput, quantity: jual }],
    total,
    expiresAt: Date.now() + RPG_CONFIRMATION_TTL
  }

  saveDB(wdb)

  return m.reply(
    `╭─❏「 🏪 KONFIRMASI JUAL 」❏\n` +
    `│ 🏪 *JUAL DI KOPERASI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Item : ${formatNama(itemInput)}\n` +
    `> ↳ Jumlah : x${jual}\n` +
    `> ↳ Total : Rp ${total.toLocaleString()}\n` +
    `> ↳ Konfirmasi berlaku 5 menit.\n\n` +
    `📌 *KONFIRMASI*\n` +
    `> ↳ Ketik *${usedPrefix}koperasi jual ya* untuk lanjut.\n` +
    `> ↳ Ketik *${usedPrefix}koperasi jual batal* untuk membatalkan.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  let hasil = Math.floor(harga[itemInput].harga * sellBonus) * jual
  user.inventory[itemInput] -= jual
  if(user.inventory[itemInput] <= 0) delete user.inventory[itemInput]
  hasil = scaleDifficultyIncome(user, hasil)
  wdb.money[m.sender] += hasil
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🏪 KOPERASI AVELIA 」❏\n` +
    `│ ✅ *BERHASIL JUAL!*\n` +
    `│ ${harga[itemInput].emoji} *${formatNama(itemInput)}* x${jual}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ 💰 +Rp ${hasil.toLocaleString()}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['koperasi', 'koperasi command', 'koperasi list', 'koperasi guide', 'koperasi jual <no/nama> <jumlah/all>', 'koperasi jual all', 'tokopanen']
handler.tags = ['rpg']
handler.command = /^(koperasi|tokopanen|jualpanen)$/i
handler.alias = ['koperasi', 'tokopanen', 'jualpanen']
handler.group = true
export default handler