import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const oreEmoji = {
  // MATERIAL BELI/JUAL
  'iron': '⛓️', 'gold': '✨', 'stone': '🪨', 'wood': '🪵', 'diamond': '💎',
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

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.inventory) user.inventory = {}
  if(!user.ores) user.ores = {}
  if(!user.items) user.items = {}

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1 // +10% pas jual
  const buyDiskon = isPrem? 0.8 : 1 // -20% pas beli

  // HARGA BELI = TOKO
  const hargaBeli = {
    'iron': { emoji: '⛓️', harga: 10000 },
    'gold': { emoji: '✨', harga: 100000 },
    'stone': { emoji: '🪨', harga: 5000 },
    'wood': { emoji: '🪵', harga: 8000 },
    'diamond': { emoji: '💎', harga: 500000 }
  }

  // HARGA JUAL = 50% DARI HARGA BELI + ITEM ADVENTURE + ORE DARI TAMBANG
  const hargaJual = {
    // MATERIAL DARI TOKO
    'iron': 5000, 'gold': 50000, 'stone': 2500, 'wood': 4000, 'diamond': 250000,
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
  jualKeys.forEach((k, i) => nomorKeItemJual[i+1] = k)

  function getItemByInput(input, map) {
    if(!isNaN(input)) return map[parseInt(input)] // kalau angka
    return input.replace(/ /g, '_') // kalau nama spasi -> _
  }

  let args = text.toLowerCase().split(' ').filter(v => v)
  let tipe = args[0]

  // MENU UTAMA
  if (!text) {
    let uang = wdb.money[m.sender] || 0
    let cap = `╭───「 ⛏️ TOKO MATERIAL 」───╮\n`
    cap += `│ 💰 Uang: Rp ${uang.toLocaleString()}\n`
    cap += `│ ${isPrem? '👑 Premium +10% Jual, -20% Beli' : '👤 User Biasa'}\n`
    cap += `╰─────────────────╯\n\n`
    cap += `📌 *CARA PAKAI*\n`
    cap += `├ Beli: *${usedPrefix}tokomaterial beli <no/nama> <jumlah>*\n`
    cap += `├ Jual: *${usedPrefix}tokomaterial jual <no/nama> <jumlah/all>*\n`
    cap += `└ Jual Semua: *${usedPrefix}tokomaterial jual all*\n\n`

    cap += `*🛒 MATERIAL TOKO*\n`
    materialKeys.forEach((k, i) => {
      let hBeli = Math.floor(hargaBeli[k].harga * buyDiskon)
      let hJual = Math.floor(hargaJual[k] * sellBonus)
      cap += `├ [${i+1}] ${hargaBeli[k].emoji} ${formatNama(k).padEnd(15)} Beli: Rp ${hBeli.toLocaleString()} | Jual: Rp ${hJual.toLocaleString()}\n`
    })

    cap += `\n*💰 HARGA JUAL ITEM & ORE*\n`
    let nomorMulai = materialKeys.length + 1
    jualKeys.slice(0,30).forEach((k, i) => {
      let nomor = nomorMulai + i
      let h = Math.floor(hargaJual[k] * sellBonus)
      cap += `├ [${nomor}] ${oreEmoji[k] || '📦'} ${formatNama(k).padEnd(18)} Rp ${h.toLocaleString()}\n`
    })
    if(jualKeys.length > 30) cap += `│...dan ${jualKeys.length - 30} item lainnya\n`
    cap += `━━━━━━━━━━━\n`
    cap += `💡 Tips: Hasil.tambang bisa dijual semua disini`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  // ===== SISTEM BELI =====
  if(tipe === 'beli'){
    let itemInput = args[1]
    let jumlah = parseInt(args[2]) || 1
    if(!itemInput) return m.reply(`❌ Contoh: *${usedPrefix}tokomaterial beli 1 10*`)

    let item = getItemByInput(itemInput, nomorKeItemBeli)
    if(!hargaBeli[item]) return m.reply('❌ Item ini tidak dijual di toko material.')

    let hargaSatuan = Math.floor(hargaBeli[item].harga * buyDiskon)
    let totalHarga = hargaSatuan * jumlah

    if((wdb.money[m.sender] || 0) < totalHarga) {
      return m.reply(`❌ Uang kamu tidak cukup!\nButuh: Rp ${totalHarga.toLocaleString()}`)
    }

    wdb.money[m.sender] -= totalHarga
    user.inventory[item] = (user.inventory[item] || 0) + jumlah
    saveDB(wdb)
    return m.reply(`╭──「 ⛏️ TOKO MATERIAL 」──╮\n\n✅ *BERHASIL BELI!*\n${hargaBeli[item].emoji} *${formatNama(item)}* x${jumlah}\n💸 -Rp ${totalHarga.toLocaleString()}\n\n━━━━━━━━━━━━━━`)
  }

  // ===== SISTEM JUAL =====
  if(tipe === 'jual'){
    // JUAL ALL
    if(args[1] === 'all'){
      let totalHasil = 0
      let listJual = []
      let semuaInv = {...user.inventory,...user.ores,...user.items}
      for(let item in semuaInv){
        if(hargaJual[item]){
          let jumlah = semuaInv[item]
          let hasil = Math.floor(hargaJual[item] * sellBonus) * jumlah
          totalHasil += hasil
          listJual.push(`${oreEmoji[item] || '📦'} ${formatNama(item)} x${jumlah}`)
          delete user.inventory[item]; delete user.ores[item]; delete user.items[item]
        }
      }
      if(totalHasil === 0) return m.reply('❌ Kamu tidak punya item yang bisa dijual.')
      wdb.money[m.sender] = (wdb.money[m.sender] || 0) + totalHasil
      saveDB(wdb)
      return m.reply(`╭──「 ⛏️ TOKO MATERIAL 」──╮\n\n✅ *BERHASIL JUAL SEMUA!*\n\n${listJual.join('\n')}\n\n💰 *Total:* +Rp ${totalHasil.toLocaleString()}\n\n━━━━━━━━━━━━━━`)
    }

    let itemInput = args[1]
    let amount = args[2] === 'all'? 'all' : (parseInt(args[2]) || 1)
    if(!itemInput) return m.reply(`❌ Contoh: *${usedPrefix}tokomaterial jual 10 5*`)

    let item = getItemByInput(itemInput, nomorKeItemJual)

    if (!hargaJual[item]) return m.reply(`❌ Item "${formatNama(itemInput)}" tidak bisa dijual di sini.`)

    let stok = user.inventory[item] || user.ores[item] || user.items[item] || 0
    if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(item)}`)
    let jual = amount === 'all'? stok : amount
    if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

    let hasil = Math.floor(hargaJual[item] * sellBonus) * jual

    if(user.inventory[item]) { user.inventory[item] -= jual; if(user.inventory[item] <= 0) delete user.inventory[item] }
    if(user.ores[item]) { user.ores[item] -= jual; if(user.ores[item] <= 0) delete user.ores[item] }
    if(user.items[item]) { user.items[item] -= jual; if(user.items[item] <= 0) delete user.items[item] }

    wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hasil
    saveDB(wdb)
    return m.reply(`╭──「 ⛏️ TOKO MATERIAL 」──╮\n\n✅ *BERHASIL JUAL!*\n${oreEmoji[item] || '📦'} *${formatNama(item)}* x${jual}\n💰 +Rp ${hasil.toLocaleString()}\n\n━━━━━━━━━━━`)
  }

  return m.reply(`❌ Tipe salah. Pakai: *beli* atau *jual*`)
}

handler.help = ['tokomaterial', 'tokomaterial beli <no/nama> <jml>', 'tokomaterial jual <no/nama> <jml/all>', 'tokomaterial jual all']
handler.tags = ['rpg']
handler.command = /^(tokomaterial|jualmaterial)$/i
handler.group = true
export default handler