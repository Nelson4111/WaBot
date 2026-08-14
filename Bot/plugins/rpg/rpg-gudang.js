import { loadDB, sendRpgMsg, saveDB } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// 1. LIST EMOJI KEBUN
const bibit = {
  'padi': '🌾', 'jagung': '🌽', 'apel merah': '🍎', 'apel hijau': '🍏', 'pir': '🍐', 'jeruk': '🍊',
  'lemon': '🍋', 'pisang': '🍌', 'semangka': '🍉', 'anggur': '🍇', 'stroberi': '🍓', 'bluberi': '🫐',
  'melon': '🍈', 'ceri': '🍒', 'persik': '🍑', 'mangga': '🥭', 'brokoli': '🥦', 'terong': '🍆',
  'tomat': '🍅', 'alpukat': '🥑', 'kiwi': '🥝', 'kelapa': '🥥', 'nanas': '🍍', 'selada': '🥬',
  'timun': '🥒', 'wortel': '🥕', 'zaitun': '🫒', 'bawang putih': '🧄', 'bawang merah': '🧅', 'cabai': '🌶',
  'paprika': '🫑', 'kentang': '🥔', 'ubi': '🍠', 'kastanye': '🌰', 'kacang': '🥜', 'durian': '🌳',
  'uang': '💵', 'koin': '🪙', 'diamond': '💎', 'exp': '✨', 'emas': '⚜️'
}

// 2. LIST EMOJI IKAN - FULL DARI AQUARIUM
const ikanEmoji = {
  'poseidon': '🌊🔱', 'flying_dutchman': '👻⛵', 'aquaman': '🦸‍♂️🌊', 'godzilla': '🦖🌊',
  'zeus_laut': '⚡🌊', 'atlas_laut': '🏔️🌊', 'kitsune_laut': '🦊🌊', 'leviathan_primordial': '🐉🌊',
  'davy_jones': '🏴‍☠️🦑', 'caylpso': '🧜‍♀️🌊', 'ariel_little_mermaid': '🧜‍♀️❤️',
  'treasure_chest': '💎📦', 'ancient_relic': '🏺✨', 'pirate_gold': '💰🏴‍☠️', 'mermaid_tear': '💧🧜‍♀️',
  'kraken': '🦑🌊', 'megladon': '🦈👑', 'leviathan': '🐉🌊', 'sea_dragon': '🐲🌊',
  'phoenix_laut': '🔥🦅', 'hydra_laut': '🐍🌊', 'cerberus_laut': '🐺🌊', 'titan_kura': '🐢🏔️',
  'paus_putih': '🐋⚪', 'ikan_dewa': '🐟✨', 'naga_laut': '🐉🌊', 'raja_ubur': '🪼👑',
  'penjaga_karang': '🪸🛡️', 'putri_duyung': '🧜‍♀️👑', 'dewa_katak': '🐸⚡', 'kuda_laut_kristal': '🐴💎',
  'peti_karun': '💰', 'koin_emas_kuno': '🪙', 'mutiara_raja': '👑⚪', 'mahkota_karang': '👑🪸',
  'hiu_putih': '🦈⬜', 'hiu_harimau': '🦈🐅', 'hiu_martil': '🦈🔨', 'paus_orca': '🐋🖤',
  'paus_biru': '🐋💙', 'penyu_raksasa': '🐢🏞️', 'ikan_pari_manta': '🛸🌊', 'ikan_napoleon': '🐟👨‍⚖️',
  'kerapu_raksasa': '🐟🏰', 'marlin': '🐟🏹', 'tuna_sirip_biru': '🐟💙', 'pedang_laut': '⚔️🐟',
  'ikan_koi_emas': '🐟👑', 'lobster_raja': '🦞👑', 'kepiting_raksasa': '🦀🏰', 'gurita_raksasa': '🐙🏢',
  'sotong_raksasa': '🦑🏢', 'lionfish': '🐠🦁', 'ikan_badut': '🐠🤡', 'ikan_kupu': '🐠🦋',
  'ikan_malaikat': '🐠😇', 'ikan_diskus': '🐠💿', 'ikan_arwana': '🐟💎', 'ikan_arapaima': '🐟🏞️',
  'piranha': '🐟🩸', 'belut_listrik': '🐍⚡', 'ikan_duyung': '🧜‍♀️🐟', 'ubur_ubur_bulan': '🪼🌙',
  'bintang_laut': '⭐🌊', 'anemon_laut': '🌸🌊', 'karang_indah': '🪸✨', 'kerang_mutia': '🦪💎',
  'siput_laut': '🐌🌊', 'landak_laut': '🦔🌊',
  'peti_besi': '📦', 'koin_emas': '🪙', 'mutiara_hitam': '⚫', 'trisula_patah': '🔱',
  'hiu_hitam': '🦈⬛', 'hiu_biru': '🦈💙', 'lumba_lumba': '🐬🌊', 'paus_pembunuh': '🐋🔪',
  'penyu_hijau': '🐢💚', 'ikan_pari': '🛸🌊', 'kerapu': '🐟🏠', 'tuna': '🐟🥫', 'salmon': '🐟🍣',
  'barakuda': '🐟🗡️', 'ikan_todak': '🐟⚔️', 'ikan_terbang': '🐟✈️', 'ubur_ubur': '🪼🌊',
  'ubur_ubur_listrik': '🪼⚡', 'bintang_laut_ungu': '⭐💜', 'karang_keras': '🪸🪨', 'kerang': '🦪🐚',
  'siput': '🐌🐚', 'landak_laut_kecil': '🦔🌊', 'anemon': '🌸🌊', 'rumput_laut': '🌿🌊', 'karang': '🪸🪨',
  'peti_karat': '📦', 'koin_tembaga': '🪙', 'mutiara_retak': '🦪', 'cangkir_pecah': '🏺',
  'hiu_putih': '🦈⬜', 'hiu_harimau': '🦈🐅', 'hiu_martil': '🦈🔨', 'lumba_lumba': '🐬🌊',
  'kakap': '🐟🎣', 'kerapu_kecil': '🐟🏡', 'sarden': '🐟🥫', 'makarel': '🐟', 'kembung': '🐟🥫',
  'tongkol': '🐟🔨', 'cumi': '🦑🌊', 'gurita_kecil': '🐙', 'udang': '🦐🍤', 'kepiting': '🦀🍴',
  'lobster': '🦞🍽️', 'kerang_hijau': '🦪💚', 'kerang_darah': '🦪🩸', 'siput': '🐌🐚',
  'ikan_mas': '🐟🧡', 'ikan_nila': '🐟💙', 'ikan_lele': '🐟🐈', 'ikan_patin': '🐟🐷',
  'ikan_gurame': '🐟🍽️', 'ikan_mujair': '🐟😂', 'ikan_gabus': '🐟🔫', 'ikan_wader': '🐟🌾',
  'ikan_seluang': '🐟⚡', 'ikan_teri': '🐟📏', 'ikan_pepetek': '🐟👀', 'ikan_layang': '🐟🪁',
  'ikan_kembung_kecil': '🐟🥫', 'ikan_selar': '🐟🏃', 'ikan_tembang': '🐟🎵', 'ikan_julung': '🐟🪡',
  'sampah_plastik': '🗑️♻️', 'ban_bekas': '🛞🗑️', 'botol_kaca': '🍾🗑️', 'kaleng': '🥫🗑️',
  'kayu_hanyut': '🪵🌊', 'jaring_rusak': '🕸️💔', 'sepatu': '👟🗑️', 'botol': '🍶🗑️',
  'kantong_plastik': '🛍️🗑️', 'duri': '🌵🗑️', 'batu': '🪨🌊', 'rumput': '🌱🌊', 'lumpur': '🟤🌊',
  'daun': '🍃🌊', 'ranting': '🌿🌊', 'tali': '🪢🗑️', 'kawat': '🔩🗑️', 'pecahan_kaca': '💔🗑️',
  'kaos_kaki': '🧦', 'mie_instan': '🍜', 'pakaian_dalam': '🩲'
}

// 3. LIST EMOJI ORE - FULL DARI TAMBANG
const oreEmoji = {
  'stone': '🪨', 'sand_stone': '🏜️', 'copper': '🟠', 'iron': '⛓️', 'tin': '📎', 'silver': '⚪',
  'gold': '✨', 'mushroomite': '🍄', 'platinum': '💿', 'bananite': '🍌', 'cardboardite': '📦',
  'poopite': '💩', 'fillium': '🧪', 'cobalt': '🔵', 'titanium': '⚙️', 'obsidian': '🖤',
  'rivalite': '⚔️', 'uranium': '☢️', 'lightite': '💡', 'demonite': '😈', 'darkryte': '🌑',
  'iore': '🔷', 'aite': '🔶', 'blue_crystal': '🔹', 'orange_crystal': '🧡', 'green_crystal': '💚',
  'purple_crystal': '🟣', 'red_crystal': '🔴', 'arcane_crystal': '🔮', 'grass': '🌱', 'graphite': '✏️',
  'aetherite': '👻', 'valtry': '🛡️', 'sanctis': '✨', 'snowite': '❄️', 'voidar': '🌌',
  'galaxy': '🌠', 'tungsten': '🔩', 'sulfur': '💛', 'pumice': '🫧', 'cuprite': '🔺',
  'massacerit': '🩸', 'ethereal_light': '👼'
}

// 4. LIST EMOJI ADVENTURE - FULL
const itemEmoji = {
  'tulang': '🦴', 'kayu': '🪵', 'batu': '🪨', 'jamur': '🍄', 'daun_kering': '🍂',
  'koin_tembaga': '🪙', 'ramuan_kecil': '🧪', 'tali': '🪢', 'kain_lusuh': '👕', 'wood': '🪵',
  'koin_perak': '🪙', 'ramuan_sedang': '🧪', 'belati_karat': '🔪', 'perisai_kayu': '🛡️', 'iron': '⛓️',
  'koin_emas': '🪙', 'ramuan_besar': '🧪', 'pedang_baja': '⚔️', 'armor_kulit': '🥋', 'diamond': '💎',
  'permata_biru': '💎', 'permata_merah': '❤️', 'permata_hijau': '💚', 'peta_harta': '🗺️',
  'pedang_legendaris': '⚔️👑', 'buku_sihir_kuno': '📚', 'armor_naga': '🐉🛡️', 'mahkota_raja': '👑',
  'pecahan_bintang': '🌠', 'air_mata_dewi': '💧', 'segel_dewa': '📜', 'jiwa_abadi': '👻'
}

// 5. LIST EMOJI MASAKAN - FULL DARI DAPUR
const masakanEmoji = {
  'roti tawar': '🍞', 'mie goreng': '🍜', 'sate ikan': '🍢', 'salad buah': '🥗', 'sup ikan': '🍲',
  'taco ikan': '🌮', 'udang goreng': '🍤', 'cumi goreng': '🦑', 'kepiting rebus': '🦀',
  'jus durian': '🥛', 'wine': '🍷', 'sushi': '🍣', 'sashimi': '🍣', 'lobster bakar': '🦞',
  'tuna panggang': '🐟', 'salmon asap': '🐟', 'steak hiu': '🦈', 'pari bakar': '🛸',
  'penyu panggang': '🐢', 'steak emas': '🥩', 'diamond cake': '🎂', 'sop kraken': '🦑',
  'sate megalodon': '🦈', 'sup leviathan': '🐉', 'sea dragon grill': '🐲', 'hydra stew': '🐍',
  'kura titan soup': '🐢', 'paus putih steak': '🐋', 'naga laut bakar': '🐉', 'raja ubur jelly': '🦑',
  'steak godzilla': '🦖'
}

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if(!user) return m.reply('❌ Kamu belum punya data RPG')

  // INIT SEMUA DATA BIAR GA ERROR
  user.inventory = user.inventory || {}
  user.ikan = user.ikan || {}
  user.ores = user.ores || {}
  user.items = user.items || {}
  user.masakan = user.masakan || {}
  user.dapur = user.dapur || { slot: 1, antrian: [] }

  // MIGRASI DATA LAMA IKAN spasi -> _
  let adaMigrasi = false
  for(let ikanLama in user.ikan){
    if(ikanLama.includes(' ')){
      let ikanBaru = ikanLama.replace(/ /g, '_')
      user.ikan[ikanBaru] = (user.ikan[ikanBaru] || 0) + user.ikan[ikanLama]
      delete user.ikan[ikanLama]
      adaMigrasi = true
    }
  }
  if(adaMigrasi) saveDB(wdb)

  // GABUNGIN SEMUA INVENTORY JADI 1
  let allItems = {}

  // 1. KEBUN
  for(let item in user.inventory){
    if(user.inventory[item] > 0) allItems[item] = (allItems[item] || 0) + user.inventory[item]
  }
  // 2. IKAN
  for(let item in user.ikan){
    if(user.ikan[item] > 0) allItems[item] = (allItems[item] || 0) + user.ikan[item]
  }
  // 3. ORE
  for(let item in user.ores){
    if(user.ores[item] > 0) allItems[item] = (allItems[item] || 0) + user.ores[item]
  }
  // 4. ADVENTURE
  for(let item in user.items){
    if(user.items[item] > 0) allItems[item] = (allItems[item] || 0) + user.items[item]
  }
  // 5. MASAKAN
  for(let item in user.masakan){
    if(user.masakan[item] > 0) allItems[item] = (allItems[item] || 0) + user.masakan[item]
  }

  if(Object.keys(allItems).length === 0)
    return m.reply(`🏚️ *ISI GUDANG KOSONG*\n\nTanam, mancing, tambang, adventure, atau masak dulu`)

  // URUTIN DARI PALING BANYAK
  let sorted = Object.entries(allItems).sort((a,b) => b[1] - a[1])
  let total = sorted.reduce((a,[,b]) => a + b, 0)

  let cap = `*───「 📦 ISI GUDANG KAMU 」───*\n`
  cap += `Total Item: ${total.toLocaleString()} unit\n`

  sorted.forEach(([nama, jumlah]) => {
    let emoji = masakanEmoji[nama] || bibit[nama] || ikanEmoji[nama] || oreEmoji[nama] || itemEmoji[nama] || '📦'
    cap += `${emoji} ${formatNama(nama).padEnd(22)} x${jumlah.toLocaleString()}\n`
  })

  cap += `\n*PANDUAN:*\n`
  cap += `• Jual: *${usedPrefix}shop > jual [nama] [jml]*\n`
  cap += `• Masak: *${usedPrefix}masak [nama]*\n`
  cap += `• Ambil Masakan: *${usedPrefix}ambilmasak*`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}

handler.help = ['gudang', 'gudangku']
handler.tags = ['rpg']
handler.command = /^(gudang|gudangku)$/i
handler.group = true
export default handler