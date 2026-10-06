import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { migrateRpgCurrencies } from '../../lib/rpg-currency.js'
import { scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const oreEmoji = {
  // MATERIAL BELI/JUAL
  'iron': '⛓️', 'gold': '✨', 'stone': '🪨', 'wood': '🪵', 'diamond': '💎', 'emerald': '💚',
  // ORE
  'sand_stone': '🏜️', 'copper': '🟠', 'tin': '📎', 'silver': '⚪',
  'mushroomite': '🍄', 'platinum': '💿', 'bananite': '🍌', 'cardboardite': '📦',
  'poopite': '💩', 'fillium': '🧪', 'cobalt': '🔵', 'titanium': '⚙️', 'obsidian': '🖤',
  'rivalite': '⚔️', 'uranium': '☢️', 'lightite': '💡', 'demonite': '😈', 'darkryte': '🌑',
  'iore': '🔷', 'aite': '🔶', 'blue_crystal': '🔹', 'orange_crystal': '🧡', 'green_crystal': '💚',
  'purple_crystal': '🟣', 'red_crystal': '🔴', 'arcane_crystal': '🔮', 'grass': '🌱', 'graphite': '✏️',
  'aetherite': '👻', 'valtry': '🛡️', 'sanctis': '✨', 'snowite': '❄️', 'voidar': '🌌',
  'galaxy': '🌠', 'tungsten': '🔩', 'sulfur': '💛', 'pumice': '🫧', 'cuprite': '🔺',
  'massacerit': '🩸', 'ethereal_light': '👼',
  // ITEM ADVENTURE
  'tulang': '🦴', 'kayu': '🪵', 'batu': '🪨', 'jamur': '🍄', 'daun_kering': '🍂',
  'koin_tembaga': '🪙', 'ramuan_kecil': '🧪', 'tali': '🪢', 'kain_lusuh': '👕',
  'koin_perak': '🪙', 'ramuan_sedang': '🧪', 'belati_karat': '🔪', 'perisai_kayu': '🛡️',
  'koin_emas': '🪙', 'ramuan_besar': '🧪', 'pedang_baja': '⚔️', 'armor_kulit': '🥋',
  'permata_biru': '💎', 'permata_merah': '❤️', 'permata_hijau': '💚', 'peta_harta': '🗺️',
  'pedang_legendaris': '⚔️👑', 'buku_sihir_kuno': '📚', 'armor_naga': '🐉🛡️', 'mahkota_raja': '👑',
  'pecahan_bintang': '🌠', 'air_mata_dewi': '💧', 'segel_dewa': '📜', 'jiwa_abadi': '👻'
}

let handler = async (m, { text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.inventory) user.inventory = {}
  if(!user.ores) user.ores = {}
  if(!user.items) user.items = {}
  if (migrateRpgCurrencies(user)) saveDB(wdb)

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1 // +10% pas jual
  const buyDiskon = isPrem? 0.8 : 1 // -20% pas beli

  // HARGA BELI = TOKO
  const hargaBeli = {
    'iron': { emoji: '⛓️', harga: 10000 },
    'gold': { emoji: '✨', harga: 100000 },
    'stone': { emoji: '🪨', harga: 5000 },
    'wood': { emoji: '🪵', harga: 9000 },
    'diamond': { emoji: '💎', harga: 500000 },
    'kulit': { emoji: '👜', harga: 50000 },
    'sisik': { emoji: '🐉', harga: 75000 }
  }

  // HARGA JUAL = 50% DARI HARGA BELI + ITEM ADVENTURE + ORE DARI TAMBANG
  const hargaJual = {
    'gemstone': 100000, 'coin': 50000,
    // MATERIAL DARI TOKO
    'iron': 5000, 'gold': 50000, 'stone': 2500, 'wood': 4000, 'diamond': 250000,
    'kulit': 25000, 'sisik': 37500,
    // ORE DARI TAMBANG
    'grass': 400, 'sand_stone': 600, 'graphite': 700, 'pumice': 800, 'sulfur': 900,
    'poopite': 1000, 'copper': 1200, 'tin': 1500, 'cardboardite': 2000,
    'silver': 5000, 'bananite': 5000, 'cuprite': 3500, 'mushroomite': 4000, 'platinum': 25000,
    'cobalt': 30000, 'obsidian': 35000, 'titanium': 40000, 'rivalite': 45000, 'fillium': 60000,
    'lightite': 100000, 'iore': 110000, 'uranium': 120000, 'aite': 130000, 'darkryte': 140000,
    'demonite': 150000, 'blue_crystal': 160000, 'green_crystal': 170000, 'orange_crystal': 400000,
    'snowite': 480000, 'purple_crystal': 450000, 'red_crystal': 500000, 'valtry': 550000,
    'aetherite': 600000, 'sanctis': 650000, 'tungsten': 1200000, 'arcane_crystal': 1500000,
    'galaxy': 1800000, 'voidar': 2000000, 'massacerit': 2500000, 'ethereal_light': 10000000,
    // ITEM ADVENTURE
    'tulang': 500, 'batu': 500, 'jamur': 500, 'daun_kering': 500, 'kain_lusuh': 500,
    'tali': 800, 'koin_tembaga': 1000, 'ramuan_kecil': 2000, 'kayu': 4000, 'koin_perak': 5000,
    'ramuan_sedang': 8000, 'belati_karat': 10000, 'perisai_kayu': 12000, 'koin_emas': 25000,
    'ramuan_besar': 30000, 'pedang_baja': 50000, 'armor_kulit': 60000, 'peta_harta': 150000,
    'permata_biru': 200000, 'permata_merah': 200000, 'permata_hijau': 200000, 'pedang_legendaris': 1000000,
    'buku_sihir_kuno': 1200000, 'armor_naga': 1500000, 'mahkota_raja': 2000000, 'pecahan_bintang': 5000000,
    'air_mata_dewi': 8000000, 'segel_dewa': 15000000, 'jiwa_abadi': 25000000
  }

  const materialKeys = Object.keys(hargaBeli).sort((a, b) => hargaBeli[a].harga - hargaBeli[b].harga)
  const jualKeys = Object.keys(hargaJual).sort((a, b) => hargaJual[a] - hargaJual[b])

  // MAP NOMOR -> NAMA ITEM
  const nomorKeItemBeli = {}
  materialKeys.forEach((k, i) => nomorKeItemBeli[i+1] = k)

  const nomorKeItemJual = {}
  jualKeys.forEach((k, i) => nomorKeItemJual[materialKeys.length + i + 1] = k)

  function getItemByInput(input, map) {
    if(!isNaN(input)) return map[parseInt(input)] // kalau angka
    return input.replace(/ /g, '_') // kalau nama spasi -> _
  }

  let args = typeof text === 'string' ? text.trim().toLowerCase().split(/\s+/).filter(Boolean) : []
  let tipe = args[0]

  // MENU UTAMA
  if (!args.length) {
    let uang = wdb.money[m.sender] || 0
    let cap = `╭─❏「 ⛏️ PABRIK AVELIA 」❏\n`
    cap += `│ 💰 Uang: Rp ${uang.toLocaleString()}\n`
    cap += `│ 👤 ${isPrem ? 'Premium +10% jual, -20% beli' : 'User biasa'}\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `Pabrik adalah tempat membeli material dan menjual hasil tambang atau barang petualangan.\n\n`
    cap += `> ↳ Lihat daftar command: *${usedPrefix}pabrik command*\n`
    cap += `> ↳ Baca panduan/tutorial: *${usedPrefix}pabrik guide*\n\n`
    cap += `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  if (tipe === 'command') {
    const cap = `╭─❏「 📋 COMMAND PABRIK 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ${usedPrefix}pabrik list\n` +
      `> ${usedPrefix}pabrik beli <no/nama> <jumlah>\n` +
      `> ${usedPrefix}pabrik jual <no/nama> <jumlah/all>\n` +
      `> ${usedPrefix}pabrik jual all\n` +
      `> ${usedPrefix}pabrik guide\n\n` +
      `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  if (tipe === 'guide') {
    const cap = `╭─❏「 🧭 PANDUAN PABRIK 」❏\n` +
      `│ ⛏️ Jual material tambang dan barang petualangan.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Lihat harga: *${usedPrefix}pabrik list*\n` +
      `> ↳ Beli material toko: *${usedPrefix}pabrik beli <no/nama> <jumlah>*\n` +
      `> ↳ Jual stok: *${usedPrefix}pabrik jual <no/nama> <jumlah/all>*\n` +
      `> ↳ Jual semua stok: *${usedPrefix}pabrik jual all*\n\n` +
      `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  if (tipe === 'list') {
    let uang = wdb.money[m.sender] || 0
    let cap = `╭─❏「 ⛏️ DAFTAR PABRIK 」❏\n`
    cap += `│ 💰 Uang: Rp ${uang.toLocaleString()}\n`
    cap += `│ 👤 ${isPrem ? 'Premium +10% jual, -20% beli' : 'User biasa'}\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `🛒 *MATERIAL TOKO*\nPilih nomor item untuk membeli.\nHarga jual berlaku untuk item yang kamu punya.\n\n`
    materialKeys.forEach((k, i) => {
      let hBeli = Math.floor(hargaBeli[k].harga * buyDiskon)
      let hJual = Math.floor(hargaJual[k] * sellBonus)
      cap += `*${i + 1}. ${formatNama(k)} ${hargaBeli[k].emoji}*\n`
      cap += `> Buy : Rp ${hBeli.toLocaleString()}\n`
      cap += `> Sell : ${Number.isFinite(hJual) ? `Rp ${hJual.toLocaleString()}` : 'Bisa dijual'}\n\n`
    })
    cap += `\n─━━━━━━━━━━━━━━─\n\n`
    cap += `💰 *HARGA JUAL ITEM & ORE*\nDaftar item tambang dan barang petualangan yang bisa dijual.\n\n`
    let nomorMulai = materialKeys.length + 1
    jualKeys.forEach((k, i) => {
      let h = Math.floor(hargaJual[k] * sellBonus)
      cap += `*${nomorMulai + i}. ${formatNama(k)} ${oreEmoji[k] || '📦'}*\n`
      cap += `> Buy : -\n`
      cap += `> Sell : ${Number.isFinite(h) ? `Rp ${h.toLocaleString()}` : 'Bisa dijual'}\n\n`
    })
    cap += `\n─━━━━━━━━━━━━━━─\n💡 *Tips:* Hasil tambang bisa dijual semua di sini.`
    return m.reply(cap)
  }

  // ===== SISTEM BELI =====
  if(tipe === 'beli'){
    let itemInput = args[1]
    let jumlah = parseInt(args[2]) || 1

    if(!itemInput) return m.reply(
      `╭─❏「 ⛏️ PABRIK AVELIA 」❏\n` +
      `│ ❌ *FORMAT PEMBELIAN SALAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *${usedPrefix}pabrik beli <no/nama> <jumlah>*`
    )

    let item = getItemByInput(itemInput, nomorKeItemBeli)

    if(!hargaBeli[item]) return m.reply(
      `╭─❏「 ⛏️ PABRIK AVELIA 」❏\n` +
      `│ ❌ *ITEM TIDAK TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Item tidak tersedia di toko material.`
    )

    let hargaSatuan = Math.floor(hargaBeli[item].harga * buyDiskon)
    let totalHarga = hargaSatuan * jumlah

    if((wdb.money[m.sender] || 0) < totalHarga) {
      return m.reply(
        `╭─❏「 ⛏️ PABRIK AVELIA 」❏\n` +
        `│ ❌ *UANG TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Butuh : Rp ${totalHarga.toLocaleString()}\n` +
        `> ↳ Punya : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}`
      )
    }

    wdb.money[m.sender] -= totalHarga
    user.inventory[item] = (user.inventory[item] || 0) + jumlah
    saveDB(wdb)

    return m.reply(
      `╭─❏「 ⛏️ PEMBELIAN BERHASIL 」❏\n` +
      `│ ${hargaBeli[item].emoji} *${formatNama(item)}* x${jumlah}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 💸 Bayar : -Rp ${totalHarga.toLocaleString()}\n` +
      `> ↳ 💰 Sisa : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  // ===== SISTEM JUAL =====
  if(tipe === 'jual'){
    const collectEntries = itemFilter => {
      const entries = []
      for (const source of ['inventory', 'ores', 'items']) {
        for (const [item, rawQuantity] of Object.entries(user[source] || {})) {
          const quantity = Number(rawQuantity)
          if (hargaJual[item] && (!itemFilter || item === itemFilter) && Number.isSafeInteger(quantity) && quantity > 0) {
            entries.push({ source, item, quantity })
          }
        }
      }
      if ((!itemFilter || itemFilter === 'gold') && Number(user.gold) > 0) entries.push({ source: 'goldBalance', item: 'gold', quantity: Number(user.gold) })
      if ((!itemFilter || itemFilter === 'diamond') && Number(user.diamond) > 0) entries.push({ source: 'diamondBalance', item: 'diamond', quantity: Number(user.diamond) })
      return entries
    }
    const quote = entries => {
      const grouped = {}
      const baseTotal = entries.reduce((total, entry) => {
        grouped[entry.item] = (grouped[entry.item] || 0) + entry.quantity
        return total + Math.floor(hargaJual[entry.item] * sellBonus) * entry.quantity
      }, 0)
      return { grouped, total: scaleDifficultyIncome(user, baseTotal) }
    }
    const confirmAction = args[1] === 'all' ? args[2] : args[1]
    if (['ya', 'yes', 'batal', 'no'].includes(confirmAction)) {
      const pending = user.pendingPabrikSell
      if (!pending || Date.now() > pending.expiresAt) {
        delete user.pendingPabrikSell
        saveDB(wdb)
        return m.reply('❌ Konfirmasi jual pabrik tidak ada atau sudah kedaluwarsa. Ulangi perintah jual.')
      }
      if (['batal', 'no'].includes(confirmAction)) {
        delete user.pendingPabrikSell
        saveDB(wdb)
        return m.reply('✅ Penjualan pabrik dibatalkan. Stok dan saldo tidak berubah.')
      }
      const hasEnough = pending.entries.every(entry => {
        const current = entry.source === 'goldBalance' ? Number(user.gold) || 0
          : entry.source === 'diamondBalance' ? Number(user.diamond) || 0
            : Number(user[entry.source]?.[entry.item]) || 0
        return current >= entry.quantity
      })
      if (!hasEnough) {
        delete user.pendingPabrikSell
        saveDB(wdb)
        return m.reply('❌ Stok berubah sejak konfirmasi dibuat. Penjualan dibatalkan; buat konfirmasi baru.')
      }
      for (const entry of pending.entries) {
        if (entry.source === 'goldBalance') user.gold -= entry.quantity
        else if (entry.source === 'diamondBalance') user.diamond -= entry.quantity
        else {
          user[entry.source][entry.item] -= entry.quantity
          if (user[entry.source][entry.item] <= 0) delete user[entry.source][entry.item]
        }
      }
      wdb.money[m.sender] = (wdb.money[m.sender] || 0) + pending.total
      delete user.pendingPabrikSell
      saveDB(wdb)
      return m.reply(
        `╭─❏「 ⛏️ PENJUALAN PABRIK BERHASIL 」❏\n` +
        `│ ✅ ${pending.entries.length} jenis item terjual\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ 💰 Diterima: +Rp ${pending.total.toLocaleString()}\n` +
        `> ↳ 💵 Saldo: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    // JUAL ALL
    if(args[1] === 'all'){
      const entries = collectEntries()
      if (!entries.length) return m.reply('❌ Kamu tidak punya item pabrik yang bisa dijual.')
      const plan = quote(entries)
      user.pendingPabrikSell = { entries, ...plan, expiresAt: Date.now() + 60000 }
      saveDB(wdb)
      const list = Object.entries(plan.grouped)
        .map(([item, quantity]) => `> ↳ ${oreEmoji[item] || '📦'} ${formatNama(item)} x${quantity}`)
        .join('\n')
      return m.reply(
        `╭─❏「 ⚠️ KONFIRMASI JUAL PABRIK 」❏\n` +
        `│ 📦 ${entries.length} jenis item akan dijual\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${list}\n\n` +
        `> ↳ Perkiraan diterima: Rp ${plan.total.toLocaleString()}\n\n` +
        `✅ Ketik *${usedPrefix}pabrik jual ya* untuk lanjut\n` +
        `❌ Ketik *${usedPrefix}pabrik jual batal* untuk membatalkan\n` +
        `⏳ Konfirmasi berlaku 60 detik.\n\n─━━━━━━━━━━━━━━─`
      )

      let totalHasil = 0
      let listJual = []
      let semuaInv = {}
      for (const storage of [user.inventory, user.ores, user.items]) {
        for (const [item, jumlah] of Object.entries(storage || {})) {
          semuaInv[item] = (Number(semuaInv[item]) || 0) + (Number(jumlah) || 0)
        }
      }
      semuaInv.gold = (Number(semuaInv.gold) || 0) + (Number(user.gold) || 0)

      if (user.diamond > 0) semuaInv.diamond = (semuaInv.diamond || 0) + user.diamond
      if (user.inventory.gemstone > 0) semuaInv.gemstone = (semuaInv.gemstone || 0) + user.inventory.gemstone

      for(let item in semuaInv){
        if(hargaJual[item]){
          let jumlah = semuaInv[item]
          let hasil = Math.floor(hargaJual[item] * sellBonus) * jumlah
          totalHasil += hasil
          listJual.push(`${oreEmoji[item] || '📦'} ${formatNama(item)} x${jumlah}`)
          delete user.inventory[item]
          delete user.ores[item]
          delete user.items[item]

          if (item === 'gold') user.gold = 0
          if (item === 'diamond') user.diamond = 0
          if (item === 'gemstone' || item === 'coin') user.inventory[item] = 0
        }
      }

      if(totalHasil === 0) return m.reply(
        `╭─❏「 ⛏️ PABRIK AVELIA 」❏\n` +
        `│ ❌ *TIDAK ADA ITEM UNTUK DIJUAL*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kamu tidak punya item yang bisa dijual.`
      )

      totalHasil = scaleDifficultyIncome(user, totalHasil)
      wdb.money[m.sender] = (wdb.money[m.sender] || 0) + totalHasil
      saveDB(wdb)

      return m.reply(
        `╭─❏「 ⛏️ PENJUALAN BERHASIL 」❏\n` +
        `│ 💰 *DAFTAR ITEM TERJUAL*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${listJual.map(item => `> ↳ ${item}`).join('\n')}\n\n` +
        `> ↳ 💰 Total : +Rp ${totalHasil.toLocaleString()}\n` +
        `> ↳ 💵 Saldo : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    let itemInput = args[1]
    let amount = args[2] === 'all' ? 'all' : (parseInt(args[2]) || 1)

    if(!itemInput) return m.reply(
      `╭─❏「 ⛏️ PABRIK AVELIA 」❏\n` +
      `│ ❌ *FORMAT PENJUALAN SALAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *${usedPrefix}pabrik jual <no/nama> <jumlah/all>*`
    )

    let item = getItemByInput(itemInput, nomorKeItemJual)

    if (!hargaJual[item]) return m.reply(
      `╭─❏「 ⛏️ PABRIK AVELIA 」❏\n` +
      `│ ❌ *ITEM TIDAK BISA DIJUAL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Item "${formatNama(itemInput)}" tidak bisa dijual di sini.`
    )

if (amount === 'all') {
  const entries = collectEntries(item)
  if (!entries.length) {
    return m.reply(
      `╭─❏「 🏭 JUAL PABRIK 」❏\n` +
      `│ ❌ *BARANG TIDAK TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu tidak punya ${formatNama(item)} yang bisa dijual.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const plan = quote(entries)

  user.pendingPabrikSell = {
    entries,
    ...plan,
    expiresAt: Date.now() + 60000
  }

  saveDB(wdb)

  return m.reply(
    `╭─❏「 🏭 KONFIRMASI JUAL 」❏\n` +
    `│ 🏭 *JUAL HASIL PABRIK*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Item : ${formatNama(item)}\n` +
    `> ↳ Jumlah : x${Object.values(plan.grouped)[0]}\n` +
    `> ↳ Total : Rp ${plan.total.toLocaleString()}\n` +
    `> ↳ Konfirmasi berlaku 60 detik.\n\n` +
    `📌 *KONFIRMASI*\n` +
    `> ↳ Ketik *${usedPrefix}pabrik jual ya* untuk lanjut.\n` +
    `> ↳ Ketik *${usedPrefix}pabrik jual batal* untuk membatalkan.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

    let stok = item === 'diamond'
      ? (user.diamond || 0)
      : item === 'gemstone' || item === 'coin'
        ? (user.inventory[item] || 0)
        : item === 'gold'
          ? (Number(user.gold) || 0) + (Number(user.inventory.gold) || 0) + (Number(user.ores.gold) || 0) + (Number(user.items.gold) || 0)
          : (user.inventory[item] || user.ores[item] || user.items[item] || 0)

    if (stok <= 0) return m.reply(
      `╭─❏「 ⛏️ PABRIK AVELIA 」❏\n` +
      `│ ❌ *STOK TIDAK TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu tidak punya ${formatNama(item)}.`
    )

    let jual = amount

    if (jual > stok) return m.reply(
      `╭─❏「 ⛏️ PABRIK AVELIA 」❏\n` +
      `│ ❌ *STOK TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Punya : ${stok}`
    )

    let hasil = Math.floor(hargaJual[item] * sellBonus) * jual

    if (item === 'diamond' || item === 'gemstone' || item === 'coin') {
      if (item === 'gemstone' || item === 'coin') user.inventory[item] = Math.max(0, (user.inventory[item] || 0) - jual)
      else user[item] -= jual
      if (item === 'diamond' && user.diamond <= 0) user.diamond = 0
    }

    if (item === 'gold') {
      let sisaJual = jual
      const dariGold = Math.min(Number(user.gold) || 0, sisaJual)
      user.gold = (Number(user.gold) || 0) - dariGold
      sisaJual -= dariGold

      for (const storage of [user.inventory, user.ores, user.items]) {
        const tersedia = Number(storage.gold) || 0
        const dikurangi = Math.min(tersedia, sisaJual)
        storage.gold = tersedia - dikurangi
        sisaJual -= dikurangi
        if (storage.gold <= 0) delete storage.gold
      }
    }

    if(!['diamond', 'gemstone', 'coin', 'gold'].includes(item) && user.inventory[item]) {
      user.inventory[item] -= jual
      if(user.inventory[item] <= 0) delete user.inventory[item]
    }

    if(item !== 'gold' && user.ores[item]) {
      user.ores[item] -= jual
      if(user.ores[item] <= 0) delete user.ores[item]
    }

    if(item !== 'gold' && user.items[item]) {
      user.items[item] -= jual
      if(user.items[item] <= 0) delete user.items[item]
    }

    hasil = scaleDifficultyIncome(user, hasil)
    wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hasil
    saveDB(wdb)

    return m.reply(
      `╭─❏「 ⛏️ PENJUALAN BERHASIL 」❏\n` +
      `│ ${oreEmoji[item] || '📦'} *${formatNama(item)}* x${jual}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 💰 Terima : +Rp ${hasil.toLocaleString()}\n` +
      `> ↳ 💵 Saldo : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(`❌ Tipe salah. Pakai: *beli* atau *jual*`)
}

handler.help = ['pabrik', 'pabrik command', 'pabrik list', 'pabrik guide', 'pabrik beli <no/nama> <jml>', 'pabrik jual <no/nama> <jml/all>', 'pabrik jual all', 'tokomaterial']
handler.tags = ['rpg']
handler.command = /^(pabrik|tokomaterial|jualmaterial)$/i
handler.alias = ['pabrik', 'tokomaterial', 'jualmaterial']
handler.group = true
export default handler