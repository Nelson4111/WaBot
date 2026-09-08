import { loadDB, sendRpgMsg, saveDB } from '../../lib/waifuHelper.js'
import { getHasilDisplay, isHasilTernakKey, migrateHasilTernakInventory } from '../../lib/rpg-libternakData.js'

function formatNama(nama) {
  if (!nama) return ''
  return String(nama)
    .replace(/^ikan[_\s]+/i, '')
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const fishRenameMap = {
  poseidon: 'poseidon',
  flying_dutchman: 'flying_dutchman',
  aquaman: 'aquaman',
  godzilla: 'godzilla',
  zeus_laut: 'thunderfish',
  atlas_laut: 'atlas',
  kitsune_laut: 'rubah_laut',
  leviathan_primordial: 'leviathan_primordial',
  davy_jones: 'davy_jones',
  caylpso: 'ikan_paradise',
  worm_fish: 'worm_fish',
  zombie_shark: 'zombie_shark',
  skeleton_shark: 'skeleton_shark',
  ariel_little_mermaid: 'putri_laut',
  treasure_chest: 'peti_harta',
  ancient_relic: 'artefak_laut',
  pirate_gold: 'emas_pirate',
  mermaid_tear: 'air_mata_putri',
  kraken: 'kraken',
  megladon: 'megalodon',
  leviathan: 'leviathan',
  sea_dragon: 'naga_laut',
  phoenix_laut: 'ikan_phoenix',
  hydra_laut: 'hydra',
  cerberus_laut: 'cerberus',
  titan_kura: 'kura_raksasa',
  paus_putih: 'paus_putih',
  ikan_dewa: 'dewa_laut',
  naga_laut: 'naga_laut_biru',
  raja_ubur: 'ubur_utama',
  penjaga_karang: 'penjaga_karang',
  putri_duyung: 'putri_duyung',
  dewa_katak: 'katak_berkilau',
  kuda_laut_kristal: 'kuda_kristal',
  peti_karun: 'peti_karun',
  koin_emas_kuno: 'koin_emas_kuno',
  mutiara_raja: 'mutiara_raja',
  mahkota_karang: 'mahkota_karang',
  hiu_putih: 'hiu_putih',
  hiu_harimau: 'hiu_macan',
  hiu_martil: 'hiu_palu',
  paus_orca: 'paus_orca',
  paus_biru: 'paus_biru',
  penyu_raksasa: 'penyu_raksasa',
  ikan_pari_manta: 'pari_manta',
  ikan_napoleon: 'napoleon',
  kerapu_raksasa: 'kerapu_raksasa',
  marlin: 'marlin',
  tuna_sirip_biru: 'tuna_biru',
  pedang_laut: 'pedang_laut',
  ikan_koi_emas: 'koi_emas',
  lobster_raja: 'lobster_raja',
  kepiting_raksasa: 'kepiting_raksasa',
  gurita_raksasa: 'gurita_raksasa',
  sotong_raksasa: 'sotong_raksasa',
  lionfish: 'lionfish',
  ikan_badut: 'ikan_badut',
  ikan_kupu: 'ikan_kupu',
  ikan_malaikat: 'ikan_malaikat',
  ikan_diskus: 'ikan_diskus',
  ikan_arwana: 'ikan_arwana',
  ikan_arapaima: 'ikan_arapaima',
  piranha: 'piranha',
  belut_listrik: 'belut_listrik',
  ikan_duyung: 'ikan_duyung',
  ubur_ubur_bulan: 'ubur_bulan',
  bintang_laut: 'bintang_laut',
  anemon_laut: 'anemon',
  karang_indah: 'karang_indah',
  kerang_mutia: 'kerang_mutia',
  siput_laut: 'siput_laut',
  landak_laut: 'landak_laut',
  peti_besi: 'peti_besi',
  koin_emas: 'koin_emas',
  mutiara_hitam: 'mutiara_hitam',
  trisula_patah: 'trisula_patah',
  hiu_hitam: 'hiu_hitam',
  hiu_biru: 'hiu_biru',
  lumba_lumba: 'lumba_lumba',
  paus_pembunuh: 'paus_pembunuh',
  penyu_hijau: 'penyu_hijau',
  ikan_pari: 'pari',
  kerapu: 'kerapu',
  tuna: 'tuna',
  salmon: 'salmon',
  barakuda: 'barakuda',
  ikan_todak: 'ikan_todak',
  ikan_terbang: 'ikan_terbang',
  ubur_ubur: 'ubur_ubur',
  ubur_ubur_listrik: 'ubur_listrik',
  bintang_laut_ungu: 'bintang_ungu',
  karang_keras: 'karang_keras',
  kerang: 'kerang',
  peti_kayu: 'peti_kayu',
  koin_perak: 'koin_perak',
  mutiara_biasa: 'mutiara_biasa',
  karang_antik: 'karang_antik',
  kaiju: 'kaiju',
  kadita: 'kadita'
}

const unsafeEmojiPattern = /🪨|🪵|🪙|🪢|🪡|🛞|🪼|🪸|🌊|🌙|✨|🫐|🫒|🧄|🧅/u
function safeEmoji(value, fallback = '❓') {
  if (typeof value !== 'string') return fallback
  return unsafeEmojiPattern.test(value) ? fallback : (value || fallback)
}

function normalizeFishKey(name) {
  const key = String(name || '').trim().toLowerCase().replace(/\s+/g, '_')
  const normalized = fishRenameMap[key] || key
  const keepIkanPrefix = new Set(['ikan_badut', 'ikan_kupu', 'ikan_malaikat', 'ikan_diskus', 'ikan_arwana', 'ikan_arapaima', 'ikan_todak', 'ikan_terbang', 'ikan_duyung', 'ikan_paradise'])
  return keepIkanPrefix.has(normalized) ? normalized : normalized.replace(/^ikan_/, '')
}

function migrateLegacyFishInventory(ikanObj = {}) {
  const migrated = {}
  for (const key in ikanObj) {
    const targetKey = normalizeFishKey(key)
    migrated[targetKey] = (migrated[targetKey] || 0) + Number(ikanObj[key] || 0)
  }
  return migrated
}

const bibit = {
  'padi': '🌾', 'jagung': '🌽', 'apel merah': '🍎', 'apel hijau': '🍏', 'pir': '🍐', 'jeruk': '🍊',
  'lemon': '🍋', 'pisang': '🍌', 'semangka': '🍉', 'anggur': '🍇', 'stroberi': '🍓', 'bluberi': '🫐',
  'melon': '🍈', 'ceri': '🍒', 'persik': '🍑', 'mangga': '🥭', 'brokoli': '🥦', 'terong': '🍆',
  'tomat': '🍅', 'alpukat': '🥑', 'kiwi': '🥝', 'kelapa': '🥥', 'sawit': '🌴', 'nanas': '🍍', 'selada': '🥬',
  'timun': '🥒', 'wortel': '🥕', 'zaitun': '🫒', 'bawang putih': '🧄', 'bawang merah': '🧅', 'cabai': '🌶',
  'paprika': '🫑', 'kentang': '🥔', 'ubi': '🍠', 'kastanye': '🌰', 'kacang': '🥜', 'durian': '🌳',
  'uang': '💵', 'koin': '🪙', 'diamond': '💎', 'exp': '✨', 'emas': '⚜️'
}

const ikanEmoji = {
  ikan_aurora: '🌊', ikan_kapal_hantu: '⚓', ikan_pahlawan: '🛡️', ikan_kaiju: '🐉', ikan_petir: '⚡',
  ikan_puncak: '🏔️', ikan_rubah_laut: '🦊', ikan_leviathan_primordial: '🐉', ikan_kapten_hitam: '🦑',
  ikan_laut_biru: '💧', ikan_putri_laut: '🌊', peti_harta: '💎', artefak_laut: '🏺', emas_pirate: '💰',
  air_mata_putri: '💧', ikan_kraken: '🦑', ikan_megalodon: '🦈', ikan_leviathan: '🐉', ikan_naga_laut: '🐲',
  ikan_berapi: '🔥', ikan_hidra: '🐍', ikan_cerberus: '🐺', ikan_kura_raksasa: '🐢', ikan_paus_putih: '🐋',
  ikan_dewa_laut: '✨', ikan_naga_laut_biru: '🐉', ikan_ubur_utama: '👑', ikan_penjaga_karang: '🪸',
  ikan_putri_duyung: '💎', ikan_katak_berkilau: '🐸', ikan_kuda_kristal: '🐴', peti_karun: '💰',
  koin_emas_kuno: '🪙', mutiara_raja: '👑', mahkota_karang: '👑', ikan_hiu_putih: '🦈',
  ikan_hiu_macan: '🦈', ikan_hiu_palu: '🦈', ikan_paus_orca: '🐋', ikan_paus_biru: '🐋',
  ikan_penyu_raksasa: '🐢', ikan_pari_manta: '🪼', ikan_napoleon: '🐟', ikan_kerapu_raksasa: '🐟',
  ikan_marlin: '🐟', ikan_tuna_biru: '🐟', ikan_pedang_laut: '⚔️', ikan_koi_emas: '🐟', lobster_raja: '🦞',
  kepiting_raksasa: '🦀', gurita_raksasa: '🐙', sotong_raksasa: '🦑', ikan_lionfish: '🐠', ikan_badut: '🐠',
  ikan_kupu: '🐠', ikan_malaikat: '🐠', ikan_diskus: '🐠', ikan_arwana: '🐟', ikan_arapaima: '🐟',
  ikan_piranha: '🐟', ikan_belut_listrik: '🐍', ikan_ubur_bulan: '🌙', ikan_bintang_laut: '⭐', ikan_anemon: '🌸',
  karang_indah: '🪸', kerang_mutia: '🐚', ikan_siput_laut: '🐌', ikan_landak_laut: '🦔', peti_besi: '📦',
  koin_emas: '🪙', mutiara_hitam: '⚫', trisula_patah: '🔱', ikan_hiu_hitam: '🦈', ikan_hiu_biru: '🦈',
  ikan_lumba_lumba: '🐬', ikan_paus_pembunuh: '🐋', ikan_penyu_hijau: '🐢', ikan_pari: '🪼', ikan_kerapu: '🐟',
  ikan_tuna: '🐟', ikan_salmon: '🐟', ikan_barakuda: '🐟', ikan_todak: '🐟', ikan_terbang: '🐟', ikan_ubur: '🪼',
  ikan_ubur_listrik: '⚡', ikan_bintang_ungu: '⭐', karang_keras: '🪸', kerang: '🐚', peti_kayu: '🪵',
  koin_perak: '🪙', mutiara_biasa: '⚪', karang_antik: '🪸', kakap: '🐟', kerapu_kecil: '🐟', sarden: '🐟',
  makarel: '🐟', kembung: '🐟', tongkol: '🐟', cumi: '🦑', gurita_kecil: '🐙', udang: '🦐', kepiting: '🦀',
  lobster: '🦞', kerang_hijau: '🐚', kerang_darah: '🐚', siput: '🐌', landak_laut_kecil: '🦔', anemon: '🌸',
  rumput_laut: '🌿', karang: '🪸', peti_karat: '📦', koin_tembaga: '🪙', mutiara_retak: '🐚', cangkir_pecah: '🏺',
  ikan_mas: '🐟', ikan_nila: '🐟', ikan_lele: '🐟', ikan_patin: '🐟', ikan_gurame: '🐟', ikan_mujair: '🐟',
  ikan_gabus: '🐟', ikan_wader: '🐟', ikan_seluang: '🐟', ikan_teri: '🐟', ikan_pepetek: '🐟', ikan_layang: '🐟',
  ikan_kembung_kecil: '🐟', ikan_selar: '🐟', ikan_tembang: '🐟', ikan_julung: '🐟', sampah_plastik: '🗑️',
  ban_bekas: '🛞', botol_kaca: '🍶', kaleng: '🥫', kayu_hanyut: '🪵', jaring_rusak: '🕸️', sepatu: '👟',
  botol: '🍶', kantong_plastik: '🛍️', duri: '🌵', batu: '🪨', rumput: '🌿', lumpur: '🟤', daun: '🍃',
  ranting: '🌿', tali: '🪢', kawat: '🔩', pecahan_kaca: '💔', kaos_kaki: '🧦', mie_instan: '🍜', pakaian_dalam: '🩲'
}

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

const itemEmoji = {
  'tulang': '🦴', 'kayu': '🪵', 'batu': '🪨', 'jamur': '🍄', 'daun_kering': '🍂',
  'koin_tembaga': '🪙', 'ramuan_kecil': '🧪', 'tali': '🪢', 'kain_lusuh': '👕', 'wood': '🪵',
  'koin_perak': '🪙', 'ramuan_sedang': '🧪', 'belati_karat': '🔪', 'perisai_kayu': '🛡️', 'iron': '⛓️',
  'koin_emas': '🪙', 'ramuan_besar': '🧪', 'pedang_baja': '⚔️', 'armor_kulit': '🥋', 'diamond': '💎',
  'permata_biru': '💎', 'permata_merah': '❤️', 'permata_hijau': '💚', 'peta_harta': '🗺️',
  'pedang_legendaris': '⚔️', 'buku_sihir_kuno': '📚', 'armor_naga': '🐉', 'mahkota_raja': '👑',
  'pecahan_bintang': '🌠', 'air_mata_dewi': '💧', 'segel_dewa': '📜', 'jiwa_abadi': '👻'
}

const masakanEmoji = {
  'roti tawar': '🍞', 'mie goreng': '🍜', 'sate ikan': '🍢', 'salad buah': '🥗', 'sup ikan': '🍲',
  'taco ikan': '🌮', 'udang goreng': '🍤', 'cumi goreng': '🦑', 'kepiting rebus': '🦀',
  'jus durian': '🥛', 'wine': '🍷', 'sushi': '🍣', 'sashimi': '🍣', 'lobster bakar': '🦞',
  'tuna panggang': '🐟', 'salmon asap': '🐟', 'steak hiu': '🦈', 'pari bakar': '🪼',
  'penyu panggang': '🐢', 'steak emas': '🥩', 'diamond cake': '🎂', 'sop kraken': '🦑',
  'sate megalodon': '🦈', 'sup leviathan': '🐉', 'sea dragon grill': '🐲', 'hydra stew': '🐍',
  'kura titan soup': '🐢', 'paus putih steak': '🐋', 'naga laut bakar': '🐉', 'raja ubur jelly': '🌊',
  'steak godzilla': '🦖', 'telur_dadar': '🍳', 'telur_bebek_asin': '🥚', 'susu_madu': '🥛',
  'daging_kelinci_bakar': '🍖', 'daging_babi_panggang': '🍖', 'sup_susu_sapi': '🍲', 'minyak_sawit': '🫗'
}

let handler = async (m, { conn, usedPrefix, args }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum punya data RPG')

  user.inventory = user.inventory || {}
  user.ikan = user.ikan || {}
  user.ores = user.ores || {}
  user.items = user.items || {}
  user.masakan = user.masakan || {}
  user.dapur = user.dapur || { slot: 1, antrian: [] }

  const hasilMigration = migrateHasilTernakInventory(user.inventory)
  user.inventory = hasilMigration.inventory
  if (hasilMigration.changed) saveDB(wdb)

  user.ikan = migrateLegacyFishInventory(user.ikan)
  let adaMigrasi = Object.keys(user.ikan).some(item => item.includes(' '))
  if (adaMigrasi) saveDB(wdb)

  let grouped = {
    'HASIL PANEN': { icon: '🌾', list: [] },
    'HASIL TERNAK': { icon: '🐄', list: [] },
    'IKAN': { icon: '🐠', list: [] },
    'MATERIAL': { icon: '⛏️', list: [] },
    'MASAKAN': { icon: '🍳', list: [] }
  }
  let totalItem = 0
  let totalJenis = 0

  for (let item in user.inventory) {
    if (user.inventory[item] > 0) {
      totalItem += user.inventory[item]
      totalJenis++
      const hasil = getHasilDisplay(item)
      let emoji = isHasilTernakKey(item) ? hasil.emoji : (bibit[item] || '📦')
      const kategori = isHasilTernakKey(item) ? 'HASIL TERNAK' : 'HASIL PANEN'
      grouped[kategori].list.push({ nama: isHasilTernakKey(item) ? hasil.nama : item, emoji, jml: user.inventory[item] })
    }
  }

  for (let item in user.ikan) {
    if (user.ikan[item] > 0) {
      totalItem += user.ikan[item]
      totalJenis++
      let emoji = ikanEmoji[item] || '🐟'
      grouped['IKAN'].list.push({ nama: item, emoji, jml: user.ikan[item] })
    }
  }

  for (let item in user.ores) {
    if (user.ores[item] > 0) {
      totalItem += user.ores[item]
      totalJenis++
      let emoji = oreEmoji[item] || '🪨'
      grouped['MATERIAL'].list.push({ nama: item, emoji, jml: user.ores[item] })
    }
  }
  for (let item in user.items) {
    if (user.items[item] > 0) {
      totalItem += user.items[item]
      totalJenis++
      let emoji = itemEmoji[item] || '⚔️'
      grouped['MATERIAL'].list.push({ nama: item, emoji, jml: user.items[item] })
    }
  }

  for (let item in user.masakan) {
    if (user.masakan[item] > 0) {
      totalItem += user.masakan[item]
      totalJenis++
      let emoji = masakanEmoji[item] || '🍲'
      grouped['MASAKAN'].list.push({ nama: item, emoji, jml: user.masakan[item] })
    }
  }

  if (totalJenis === 0) return m.reply(`╭─❏「 📦 GUDANG KOSONG 」❏\n│ Tanam, mancing, tambang, adventure, atau masak dulu\n╰─━━━━━━━━━━━━━━─`)

  for (let kat in grouped) {
    grouped[kat].list.sort((a, b) => b.jml - a.jml)
  }

    const urutan = ['HASIL PANEN', 'HASIL TERNAK', 'IKAN', 'MATERIAL', 'MASAKAN']
    const categoryAliases = {
      panen: 'HASIL PANEN',
      ternak: 'HASIL TERNAK',
      ikan: 'IKAN',
      material: 'MATERIAL',
      masakan: 'MASAKAN'
    }
    const requestedCategory = args[0]?.toLowerCase()
    if (!requestedCategory || requestedCategory === 'list') {
      return m.reply(
        `╭─❏「 📦 GUDANG KAMU 」❏\n` +
        `│ Pilih kategori stok yang ingin dilihat.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> *${usedPrefix}gudang panen*\n` +
        `> *${usedPrefix}gudang ternak*\n` +
        `> *${usedPrefix}gudang ikan*\n` +
        `> *${usedPrefix}gudang material*\n` +
        `> *${usedPrefix}gudang masakan*\n` +
        `> *${usedPrefix}gudang all*`
      )
    }
    if (requestedCategory !== 'all' && !categoryAliases[requestedCategory]) return m.reply('❌ Kategori tidak tersedia. Pilih panen, ternak, ikan, material, masakan, atau all.')
    const selectedCategories = requestedCategory === 'all' ? urutan : [categoryAliases[requestedCategory]]

    let cap = `╭─❏「 📦 GUDANG KAMU 」❏\n`
cap += `│ 👤 Owner: ${conn.getName(m.sender)}\n`
cap += `│ 📦 Total: ${totalItem.toLocaleString()} Item\n`
cap += `│ 🧬 Jenis: ${totalJenis}\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

for (let t of selectedCategories) {
  if (grouped[t].list.length > 0) {
    cap += `╭─❏「 ${grouped[t].icon} ${t} 」❏\n`
    cap += `╰─━━━━━━━━━━━━━━─\n`

    grouped[t].list.forEach((v, i) => {
      cap += `> *${i + 1}. ${formatNama(v.nama)} ${v.emoji}* x${v.jml.toLocaleString()}\n`
    })

    cap += `\n─━━━━━━━━━━━━━━─\n`
  }
}

cap += `📌 *PANDUAN*\n`
cap += `> ↳ Jual: *.shop jual <nama> <jumlah>*\n`
cap += `> ↳ Masak: *.masak <nama>*\n`
cap += `> ↳ Ambil Masakan: *.ambilmasak*`

return sendRpgMsg(
  conn,
  m,
  cap,
  'https://c.termai.cc/i108/l3q'
)
}

handler.help = ['gudang', 'gudang list', 'gudang <kategori>', 'gudangku']
handler.tags = ['rpg']
handler.command = /^(gudang|gudangku)$/i
handler.group = true
export default handler