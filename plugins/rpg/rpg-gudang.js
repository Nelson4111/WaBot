import { loadDB, sendRpgMsg, saveDB } from '../../lib/waifuHelper.js'
import { getHasilDisplay, isHasilTernakKey, migrateHasilTernakInventory } from '../../lib/rpg-libternakData.js'
import { fishRenameMap, ikanEmoji, normalizeFishKey, migrateLegacyFishInventory } from '../../lib/rpg-fishCatalog.js'

const materialAlias = { kayu: 'wood', batu: 'stone', emas: 'gold', berlian: 'diamond' }
function normalizeMaterialKey(key) {
  const raw = String(key || '').trim().toLowerCase().replace(/\s+/g, '_')
  return materialAlias[raw] || raw
}
function normalizeUserMaterial(obj = {}) {
  const out = {}
  for (const key in obj) {
    const target = normalizeMaterialKey(key)
    out[target] = (out[target] || 0) + Number(obj[key] || 0)
  }
  return out
}

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

const bibit = {
  'padi': '🌾', 'jagung': '🌽', 'apel merah': '🍎', 'apel hijau': '🍏', 'pir': '🍐', 'jeruk': '🍊',
  'lemon': '🍋', 'pisang': '🍌', 'semangka': '🍉', 'anggur': '🍇', 'stroberi': '🍓', 'bluberi': '🫐',
  'melon': '🍈', 'ceri': '🍒', 'persik': '🍑', 'mangga': '🥭', 'brokoli': '🥦', 'terong': '🍆',
  'tomat': '🍅', 'alpukat': '🥑', 'kiwi': '🥝', 'kelapa': '🥥', 'sawit': '🌴', 'nanas': '🍍', 'selada': '🥬',
  'timun': '🥒', 'wortel': '🥕', 'zaitun': '🫒', 'bawang putih': '🧄', 'bawang merah': '🧅', 'cabai': '🌶',
  'paprika': '🫑', 'kentang': '🥔', 'ubi': '🍠', 'kastanye': '🌰', 'kacang': '🥜', 'durian': '🌳',
  'uang': '💵', 'koin': '🪙', 'diamond': '💎', 'exp': '✨', 'emas': '⚜️'
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

  user.inventory = normalizeUserMaterial(user.inventory || {})
  user.ikan = user.ikan || {}
  user.ores = normalizeUserMaterial(user.ores || {})
  user.items = normalizeUserMaterial(user.items || {})
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