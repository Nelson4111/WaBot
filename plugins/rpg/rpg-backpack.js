import { sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, sendRpgMsg, getUserRPG, saveDB } from '../../lib/waifuHelper.js'
import { migrateRpgCurrencies } from '../../lib/rpg-currency.js'
import { MOUNT_TRASH } from '../../lib/mountData.js'
import { getHasilDisplay, isHasilTernakKey, migrateHasilTernakInventory } from '../../lib/rpg-libternakData.js'
import { fishRenameMap, ikanEmoji, migrateLegacyFishInventory, normalizeFishKey } from '../../lib/rpg-fishCatalog.js'
import { INTERSTELLAR_ITEM_BY_ID } from '../../lib/rpg-exploreData.js'
import { bibit } from './rpg-panen.js'
import { adventureItemKeys } from './rpg-adventure.js'
import { formatRpgNumber } from '../../lib/rpgMoney.js'

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
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const oreEmoji = {
  // MATERIAL BELI/JUAL
  'iron': '⛓️', 'gold': '✨', 'stone': '🪨', 'wood': '🪵', 'diamond': '💎', 'coin': '🪙', 'gemstone': '💚',
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
  'pecahan_bintang': '🌠', 'air_mata_dewi': '💧', 'segel_dewa': '📜', 'jiwa_abadi': '👻',
  ...Object.fromEntries(MOUNT_TRASH.map(({ id, emoji }) => [id, emoji]))
}

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG.')

  user.inventory = user.inventory && typeof user.inventory === 'object' ? user.inventory : {}
  user.ores = normalizeUserMaterial(user.ores || {})
  user.items = normalizeUserMaterial(user.items || {})
  user.ikan = migrateLegacyFishInventory(user.ikan || {})
  user.masakan = user.masakan || {}
  const hasilMigration = migrateHasilTernakInventory(user.inventory)
  user.inventory = hasilMigration.inventory
  if (hasilMigration.changed) await saveDB(wdb)
  if (migrateRpgCurrencies(user)) await saveDB(wdb)

  const categoryOrder = ['HASIL PANEN', 'HASIL TERNAK', 'IKAN', 'MATERIAL TAMBANG', 'ITEM ADVENTURE', 'JELAJAH ANTARBINTANG', 'MASAKAN', 'LAINNYA']
  const grouped = Object.fromEntries(categoryOrder.map(category => [category, []]))
  const cropKeys = new Set(Object.values(bibit)
    .map(({ hasil }) => hasil.item)
    .filter(item => item !== 'money' && item !== 'exp'))
  const adventureKeys = new Set([...adventureItemKeys, ...MOUNT_TRASH.map(({ id }) => id)])
  const knownMaterialKeys = new Set([...Object.keys(oreEmoji), 'wood', 'iron', 'stone', 'gold', 'diamond', 'coin', 'gemstone'])
  let totalItem = 0
  let totalJenis = 0
  const addItem = (category, nama, emoji, amount) => {
    const quantity = Number(amount) || 0
    if (quantity <= 0) return
    const existing = grouped[category].find(item => item.nama === nama)
    if (existing) existing.jml += quantity
    else {
      grouped[category].push({ nama, emoji, jml: quantity })
      totalJenis++
    }
    totalItem += quantity
  }

  for (const [nama, amount] of Object.entries(user.inventory)) {
    const quantity = Number(amount) || 0
    if (quantity <= 0 || nama === 'money' || nama === 'exp') continue
    const interstellarItem = INTERSTELLAR_ITEM_BY_ID.get(nama)
    if (interstellarItem) {
      addItem('JELAJAH ANTARBINTANG', interstellarItem.name, interstellarItem.emoji, quantity)
    } else if (isHasilTernakKey(nama)) {
      const hasil = getHasilDisplay(nama)
      addItem('HASIL TERNAK', hasil.nama, hasil.emoji, quantity)
    } else if (cropKeys.has(nama)) {
      const crop = Object.values(bibit).find(({ hasil }) => hasil.item === nama)
      addItem('HASIL PANEN', formatNama(nama), crop?.emoji || '🌾', quantity)
    } else if (adventureKeys.has(nama)) {
      addItem('ITEM ADVENTURE', formatNama(nama), oreEmoji[nama] || '📦', quantity)
    } else if (knownMaterialKeys.has(nama)) {
      addItem('MATERIAL TAMBANG', formatNama(nama), oreEmoji[nama] || '⛏️', quantity)
    } else {
      addItem('LAINNYA', formatNama(nama), oreEmoji[nama] || '📦', quantity)
    }
  }

  for (const [nama, amount] of Object.entries(user.ores)) {
    addItem('MATERIAL TAMBANG', formatNama(nama), oreEmoji[nama] || '⛏️', amount)
  }
  for (const [nama, amount] of Object.entries(user.items)) {
    addItem('ITEM ADVENTURE', formatNama(nama), oreEmoji[nama] || '⚔️', amount)
  }
  for (const [rawNama, amount] of Object.entries(user.ikan)) {
    const nama = normalizeFishKey(rawNama)
    addItem('IKAN', formatNama(nama), ikanEmoji[nama] || ikanEmoji[`ikan_${nama}`] || ikanEmoji[fishRenameMap[rawNama]] || '🐟', amount)
  }
  for (const [nama, amount] of Object.entries(user.masakan)) {
    addItem('MASAKAN', formatNama(nama), '🍲', amount)
  }

  if(totalJenis === 0)
    return m.reply('╭─❏「 🎒 BACKPACK KOSONG 」❏\n│ Isi tasmu masih kosong.\n│ Mining atau Adventure dulu!\n╰─━━━━━━━━━━━━━━─')

  for (const items of Object.values(grouped)) {
    items.sort((a, b) => b.jml - a.jml)
  }

  let cap = `╭─❏「 🎒 BACKPACK 」❏\n`
cap += `│ 👤 Owner: ${conn.getName(m.sender)}\n`
cap += `│ 📦 Total: ${formatRpgNumber(totalItem)} Item\n`
cap += `│ 🧬 Jenis: ${totalJenis}\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

const categoryIcons = {
  'HASIL PANEN': '🌾',
  'HASIL TERNAK': '🐄',
  'IKAN': '🐠',
  'MATERIAL TAMBANG': '⛏️',
  'ITEM ADVENTURE': '⚔️',
  'JELAJAH ANTARBINTANG': '🌌',
  'MASAKAN': '🍲',
  'LAINNYA': '📦'
}
for (const category of categoryOrder) {
  if (grouped[category].length === 0) continue
  cap += `╭─❏「 ${categoryIcons[category]} ${category} 」❏\n`
  cap += `╰─━━━━━━━━━━━━━━─\n`
  grouped[category].forEach((item, index) => {
    cap += `> *${index + 1}. ${item.nama} ${item.emoji}* x${formatRpgNumber(item.jml)}\n`
  })
  cap += `\n`
}

  cap += `💡 Jual hasil panen: *${usedPrefix}koperasi* · Ikan/item: *${usedPrefix}pasar* · Material: *${usedPrefix}pabrik*`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}

handler.help = ['tas', 'backpack', 'bag']
handler.tags = ['rpg']
handler.command = /^(tas|backpack|bag)$/i
handler.alias = ['tas', 'backpack', 'bag']
handler.group = true
export default handler