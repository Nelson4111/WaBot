import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(ore) { return ore.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }

const oreEmoji = {
  'stone': '🪨', 'sand_stone': '🏜️', 'copper': '🟠', 'iron': '⛓️', 'tin': '📎', 'silver': '⚪',
  'gold': '✨', 'mushroomite': '🍄', 'platinum': '💿', 'bananite': '🍌', 'cardboardite': '📦',
  'poopite': '💩', 'fillium': '🧪', 'cobalt': '🔵', 'titanium': '⚙️', 'obsidian': '🖤',
  'rivalite': '⚔️', 'uranium': '☢️', 'lightite': '💡', 'demonite': '😈', 'darkryte': '🌑',
  'iore': '🔷', 'aite': '🔶', 'blue_crystal': '🔹', 'orange_crystal': '🧡', 'green_crystal': '💚',
  'purple_crystal': '🟣', 'red_crystal': '🔴', 'arcane_crystal': '🔮', 'grass': '🌱', 'graphite': '✏️',
  'aetherite': '👻', 'valtry': '🛡️', 'sanctis': '✨', 'snowite': '❄️', 'voidar': '🌌',
  'galaxy': '🌠', 'tungsten': '🔩', 'sulfur': '💛', 'pumice': '🫧', 'cuprite': '🔺',
  'massacerit': '🩸', 'ethereal_light': '👼', 'wood': '🪵', 'diamond': '💎', 'emas': '⚜️'
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.inventory) user.inventory = {}
  if(!user.ores) user.ores = {}

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1

  const harga = {
    // MATERIAL BIASA
    'stone': 2000, 'wood': 4000, 'iron': 5000, 'gold': 50000, 'diamond': 250000, 'emas': 1500000,
    // ORE COMMON
    'sand_stone': 600, 'grass': 400, 'graphite': 700, 'pumice': 800, 'sulfur': 900, 'copper': 1200, 'tin': 1500,
    // ORE UNCOMMON
    'silver': 5000, 'mushroomite': 4000, 'cardboardite': 2000, 'poopite': 1000, 'cuprite': 3500,
    // ORE RARE
    'platinum': 25000, 'cobalt': 30000, 'titanium': 40000, 'obsidian': 35000, 'rivalite': 45000, 'bananite': 5000, 'fillium': 60000,
    // ORE EPIC
    'uranium': 120000, 'lightite': 100000, 'demonite': 150000, 'darkryte': 140000, 'iore': 110000, 'aite': 130000, 'blue_crystal': 160000, 'green_crystal': 170000,
    // ORE LEGENDARY
    'orange_crystal': 400000, 'purple_crystal': 450000, 'red_crystal': 500000, 'aetherite': 600000, 'valtry': 550000, 'sanctis': 650000, 'snowite': 480000,
    // ORE MYTHIC
    'arcane_crystal': 1500000, 'voidar': 2000000, 'galaxy': 1800000, 'tungsten': 1200000, 'massacerit': 2500000,
    // ORE SECRET
    'ethereal_light': 10000000
  }

  if (!text) {
    let cap = `*╭───「 ⛏️ JUAL MATERIAL & ORE 」───╮*\n`
    cap += `│ ${isPrem? '👑 Bonus +10%' : '👤 User'}\n`
    cap += `*╰─────────────────╯*\n\n`
    cap += `*💰 CARA:* ${usedPrefix}jualmaterial [nama] [jumlah/all]\n\n`
    cap += `*📦 MATERIAL*\n`
    ['stone','wood','iron','gold','diamond','emas'].forEach(k => {
      let h = Math.floor(harga[k] * sellBonus)
      cap += `├ ${oreEmoji[k]} ${k.toUpperCase()} : Rp ${h.toLocaleString()}\n`
    })
    cap += `\n*💎 ORE LANGKA*\n`
    ['platinum','titanium','uranium','arcane_crystal','ethereal_light'].forEach(k => {
      let h = Math.floor(harga[k] * sellBonus)
      cap += `├ ${oreEmoji[k]} ${formatNama(k)} : Rp ${h.toLocaleString()}\n`
    })
    cap += `└...dan ${Object.keys(harga).length - 11} item lainnya`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  let args = text.toLowerCase().split(' ')
  let item = args[0]
  let amount = args[1] === 'all'? 'all' : (parseInt(args[1]) || 1)
  if (!harga[item]) return m.reply('❌ Material/Ore tidak ada.')

  let stok = user.inventory[item] || user.ores[item] || 0
  if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(item)}`)
  let jual = amount === 'all'? stok : amount
  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

  let hasil = Math.floor(harga[item] * sellBonus) * jual

  if(user.inventory[item]) {
    user.inventory[item] -= jual
    if(user.inventory[item] <= 0) delete user.inventory[item]
  }
  if(user.ores[item]) {
    user.ores[item] -= jual
    if(user.ores[item] <= 0) delete user.ores[item]
  }

  wdb.money[m.sender] += hasil
  saveDB(wdb)
  return m.reply(`✅ *BERHASIL JUAL!*\n\n${oreEmoji[item] || '🪨'} ${formatNama(item)} x${jual}\n💰 +Rp ${hasil.toLocaleString()}`)
}

handler.help = ['jualmaterial <nama> <jumlah/all>']
handler.tags = ['rpg']
handler.command = /^(jualmaterial)$/i
handler.group = true
export default handler