import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(ore) { return ore.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }

const oreEmoji = {
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
  const sellBonus = isPrem? 1.1 : 1

  const harga = {
    // ORE
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

  // pisahin key ore dan item
  const oreKeys = ['grass','sand_stone','graphite','pumice','sulfur','poopite','copper','tin','cardboardite','silver','bananite','cuprite','mushroomite','platinum','cobalt','obsidian','titanium','rivalite','fillium','lightite','iore','uranium','aite','darkryte','demonite','blue_crystal','green_crystal','orange_crystal','snowite','purple_crystal','red_crystal','valtry','aetherite','sanctis','tungsten','arcane_crystal','galaxy','voidar','massacerit','ethereal_light']
  const itemKeys = ['tulang','batu','jamur','daun_kering','kain_lusuh','tali','koin_tembaga','ramuan_kecil','kayu','koin_perak','ramuan_sedang','belati_karat','perisai_kayu','koin_emas','ramuan_besar','pedang_baja','armor_kulit','peta_harta','permata_biru','permata_merah','permata_hijau','pedang_legendaris','buku_sihir_kuno','armor_naga','mahkota_raja','pecahan_bintang','air_mata_dewi','segel_dewa','jiwa_abadi']

  const sortedOre = oreKeys.sort((a, b) => harga[a] - harga[b])
  const sortedItem = itemKeys.sort((a, b) => harga[a] - harga[b])

  if (!text) {
    let cap = `╭───「 ⛏️ ZETA MARKET 」───╮\n`
    cap += `│ ${isPrem? '👑 Premium Bonus +10%' : '👤 User Biasa'}\n`
    cap += `╰─────────────────╯\n\n`
    cap += `📌 Cara jual: *${usedPrefix}jualmaterial <nama> <jumlah/all>*\n`
    cap += `💡 Bisa pake spasi atau _\n\n`

    cap += `*🪨 ORE*\n`
    sortedOre.forEach(k => {
      let h = Math.floor(harga[k] * sellBonus)
      cap += `├ ${oreEmoji[k]} ${formatNama(k).padEnd(18)} Rp ${h.toLocaleString()}\n`
    })

    cap += `\n*🎒 ITEM ADVENTURE*\n`
    sortedItem.forEach(k => {
      let h = Math.floor(harga[k] * sellBonus)
      cap += `├ ${oreEmoji[k]} ${formatNama(k).padEnd(18)} Rp ${h.toLocaleString()}\n`
    })

    cap += `━━━━━━━━━━━━━━━━━━━`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  let args = text.toLowerCase().split(' ')
  let itemInput = args[0]
  let amount = args[1] === 'all'? 'all' : (parseInt(args[1]) || 1)

  // support spasi dan _
  let item = itemInput.replace(/ /g, '_')

  if (!harga[item]) return m.reply(`❌ Item "${itemInput}" tidak ada.\nLihat list: *${usedPrefix}jualmaterial*`)

  // cek stok di 3 tempat: inventory, ores, items
  let stok = user.inventory[item] || user.ores[item] || user.items[item] || 0
  if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(item)}`)
  let jual = amount === 'all'? stok : amount
  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

  let hasil = Math.floor(harga[item] * sellBonus) * jual

  // kurangi stok di tempat yg ada
  if(user.inventory[item]) {
    user.inventory[item] -= jual
    if(user.inventory[item] <= 0) delete user.inventory[item]
  }
  if(user.ores[item]) {
    user.ores[item] -= jual
    if(user.ores[item] <= 0) delete user.ores[item]
  }
  if(user.items[item]) {
    user.items[item] -= jual
    if(user.items[item] <= 0) delete user.items[item]
  }

  wdb.money[m.sender] += hasil
  saveDB(wdb)
  return m.reply(`╭──「 ⛏️ ZETA MARKET 」──╮\n\n✅ *BERHASIL JUAL!*\n${oreEmoji[item] || '📦'} *${formatNama(item)}* x${jual}\n💰 +Rp ${hasil.toLocaleString()}\n\n━━━━━━━━━━━`)
}

handler.help = ['jualmaterial <nama> <jumlah/all>']
handler.tags = ['rpg']
handler.command = /^(jualmaterial)$/i
handler.group = true
export default handler
