import { loadDB, sendRpgMsg, getUserRPG } from '../../lib/waifuHelper.js'

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

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')

  user.inventory = normalizeUserMaterial(user.inventory || {})
  user.ores = normalizeUserMaterial(user.ores || {})
  user.items = normalizeUserMaterial(user.items || {})

  let totalItem = 0
  let totalJenis = 0
  let materialTambang = []
  let itemAdventure = []

  // 1. GABUNGIN ORE + MATERIAL DARI INVENTORY
  let gabungMaterial = {...user.ores,...user.inventory}
  for(let nama in gabungMaterial){
    if(gabungMaterial[nama] > 0){
      totalItem += gabungMaterial[nama]
      totalJenis++
      materialTambang.push({
        nama,
        emoji: oreEmoji[nama] || '📦',
        jml: gabungMaterial[nama]
      })
    }
  }

  // 2. ITEM ADVENTURE
  for(let nama in user.items){
    if(user.items[nama] > 0){
      totalItem += user.items[nama]
      totalJenis++
      itemAdventure.push({
        nama,
        emoji: oreEmoji[nama] || '📦',
        jml: user.items[nama]
      })
    }
  }

  if(totalJenis === 0)
    return m.reply('╭─❏「 🎒 BACKPACK KOSONG 」❏\n│ Isi tasmu masih kosong.\n│ Mining atau Adventure dulu!\n╰─━━━━━━━━━━━━━━─')

  // URUTIN DARI PALING BANYAK
  materialTambang.sort((a,b) => b.jml - a.jml)
  itemAdventure.sort((a,b) => b.jml - a.jml)

  let cap = `╭─❏「 🎒 BACKPACK 」❏\n`
cap += `│ 👤 Owner: ${conn.getName(m.sender)}\n`
cap += `│ 📦 Total: ${totalItem.toLocaleString()} Item\n`
cap += `│ 🧬 Jenis: ${totalJenis}\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

// 1. MATERIAL TAMBANG + MATERIAL TOKO
if (materialTambang.length > 0) {
  cap += `╭─❏「 ⛏️ MATERIAL TAMBANG 」❏\n`
  cap += `│ Item tambang dan material.\n`
  cap += `╰─━━━━━━━━━━━━━━─\n`

  materialTambang.forEach((v, i) => {
    cap += `> *${i + 1}. ${formatNama(v.nama)} ${v.emoji}* x${v.jml.toLocaleString()}\n`
  })

  cap += `\n`
}

// 2. ITEM ADVENTURE
if (itemAdventure.length > 0) {
  cap += `╭─❏「 ⚔️ ITEM ADVENTURE 」❏\n`
  cap += `│ Item dari adventure.\n`
  cap += `╰─━━━━━━━━━━━━━━─\n`

  itemAdventure.forEach((v, i) => {
    cap += `> *${i + 1}. ${formatNama(v.nama)} ${v.emoji}* x${v.jml.toLocaleString()}\n`
  })

  cap += `\n`
}

  cap += `💡 Mau jual? Ketik *${usedPrefix}pabrik*\n`
  cap += `Contoh: *${usedPrefix}pabrik jual stone 100*`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}

handler.help = ['tas', 'backpack', 'bag']
handler.tags = ['rpg']
handler.command = /^(tas|backpack|bag)$/i
handler.alias = ['tas', 'backpack', 'bag']
handler.group = true
export default handler