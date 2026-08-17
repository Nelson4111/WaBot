import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(ore) {
  return ore.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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

let secret = ['ethereal_light'];
let mythic = ['arcane_crystal', 'voidar', 'galaxy', 'tungsten', 'massacerit'];
let legendary = ['orange_crystal', 'purple_crystal', 'red_crystal', 'aetherite', 'valtry', 'sanctis', 'snowite'];
let epic = ['uranium', 'lightite', 'demonite', 'darkryte', 'iore', 'aite', 'blue_crystal', 'green_crystal'];
let rare = ['platinum', 'cobalt', 'titanium', 'obsidian', 'rivalite', 'bananite', 'fillium'];
let uncommon = ['iron', 'silver', 'gold', 'mushroomite', 'cardboardite', 'poopite', 'cuprite'];
let common = ['stone', 'sand_stone', 'grass', 'graphite', 'pumice', 'sulfur', 'copper', 'tin'];

function getTier(nama){
  if(secret.includes(nama)) return {name:'SECRET', icon:'🔮'}
  if(mythic.includes(nama)) return {name:'MYTHIC', icon:'🌌'}
  if(legendary.includes(nama)) return {name:'LEGENDARY', icon:'👑'}
  if(epic.includes(nama)) return {name:'EPIC', icon:'💎'}
  if(rare.includes(nama)) return {name:'RARE', icon:'✨'}
  if(uncommon.includes(nama)) return {name:'UNCOMMON', icon:'💙'}
  return {name:'COMMON', icon:'🤍'}
}

function rollOre(hance, bonus, pickLvl){
  let bisaSecret = pickLvl >= 25
  let bisaMythic = pickLvl >= 20
  let bisaLegend = pickLvl >= 15
  let bisaEpic = pickLvl >= 10
  let bisaRare = pickLvl >= 5

  if (bisaSecret && hance > (99.99 - bonus)) return {ore: secret[Math.floor(Math.random() * secret.length)], tier: 'SECRET', exp: 5000}
  if (bisaMythic && hance > (99.9 - bonus)) return {ore: mythic[Math.floor(Math.random() * mythic.length)], tier: 'MYTHIC', exp: 1000}
  if (bisaLegend && hance > (99 - bonus)) return {ore: legendary[Math.floor(Math.random() * legendary.length)], tier: 'LEGENDARY', exp: 500}
  if (bisaEpic && hance > (96 - bonus)) return {ore: epic[Math.floor(Math.random() * epic.length)], tier: 'EPIC', exp: 250}
  if (bisaRare && hance > (88 - bonus)) return {ore: rare[Math.floor(Math.random() * rare.length)], tier: 'RARE', exp: 120}
  if (hance > (65 - bonus)) return {ore: uncommon[Math.floor(Math.random() * uncommon.length)], tier: 'UNCOMMON', exp: 50}
  return {ore: common[Math.floor(Math.random() * common.length)], tier: 'COMMON', exp: 15}
}

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik #adventure dulu.')
  if (!user.ores) user.ores = {}
  if (user.pity_mining!== undefined) delete user.pity_mining

  // COOLDOWN
  let cooldown = 120000 // 2 menit
  if (Date.now() - (user.lastMining || 0) < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - user.lastMining)) / 1000)
    return m.reply(`┌───❏「 ⛏️ MINING 」❏\n│\n│ ⏰ LELAH\n│ Tunggu ${sisa} detik lagi agar energimu pulih.\n└───────────────────`)
  }

  let pickLvl = user.pickaxe || 0
  let bonus = Math.min(pickLvl * 1.5, 30)
  let jumlahJenisDrop = Math.min(Math.floor(pickLvl / 10) + 1, 5)

  let hasilTambang = {}
  let totalExp = 0
  let totalOreDidapat = 0
  let tierTertinggi = 'COMMON'

  for(let i = 0; i < jumlahJenisDrop; i++){
    let hance = Math.random() * 100
    let {ore, tier, exp} = rollOre(hance, bonus, pickLvl)
    let maxJumlah = Math.min(Math.floor(pickLvl / 15) + 2, 5)
    let jumlahPerOre = Math.floor(Math.random() * maxJumlah) + 1

    hasilTambang[ore] = (hasilTambang[ore] || 0) + jumlahPerOre
    totalExp += exp * jumlahPerOre
    totalOreDidapat += jumlahPerOre

    let urutanTier = ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC','SECRET']
    if(urutanTier.indexOf(tier) > urutanTier.indexOf(tierTertinggi)) tierTertinggi = tier
  }

  // Simpan hasil
  for(let ore in hasilTambang){
    user.ores[ore] = (user.ores[ore] || 0) + hasilTambang[ore]
  }

  let uangDidapat = (Math.floor(Math.random() * 3) + 1 + Math.floor(pickLvl / 2)) * totalOreDidapat
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + uangDidapat
  user.exp += totalExp
  user.lastMining = Date.now()
  if (user.exp >= user.level * 500) { user.level++; user.exp = 0 }
  saveDB(wdb)

  let pp = 'https://c.termai.cc/i140/srjE7x6'
  let tierData = {
    SECRET: {stars: '★★★★★★★', emoji: '🔮'},
    MYTHIC: {stars: '★★★★★★☆', emoji: '🌌'},
    LEGENDARY: {stars: '★★★★★☆☆', emoji: '👑'},
    EPIC: {stars: '★★★★☆☆☆', emoji: '💎'},
    RARE: {stars: '★★★☆☆☆☆', emoji: '✨'},
    UNCOMMON: {stars: '★★☆☆☆☆☆', emoji: '💙'},
    COMMON: {stars: '★☆☆☆☆☆☆', emoji: '🤍'}
  }


  let caption = `┌───❏「 ⛏️ MINING RESULT 」❏\n`
  caption += `│ ◈ Tier Tertinggi : ${tierData[tierTertinggi].stars} ${tierTertinggi} ${tierData[tierTertinggi].emoji}\n`
  caption += `│ 🏆 Hasil : ${jumlahJenisDrop} jenis | Total x${totalOreDidapat} ore\n`
  caption += `└───────────────────\n\n`

  let nomor = 1
  for(let ore in hasilTambang){
    caption += `│ ${nomor++}. ${oreEmoji[ore] || '🪨'} ${formatNama(ore)} x${hasilTambang[ore].toLocaleString()}\n`
  }

  caption += `\n│ ✨ Total XP : +${totalExp.toLocaleString()}\n`
  caption += `│ 💰 +Rp ${uangDidapat.toLocaleString()}\n`
  caption += `│ ◆ Level Pickaxe : ${pickLvl}\n`
  if(bonus > 0) caption += `│ ◆ Bonus Pick : +${bonus.toFixed(1)}%\n`
  if(pickLvl < 25) caption += `│ ◆ Secret : Buka di Pick Lvl 25\n`
  caption += `└───────────────────`

  return sendRpgMsg(conn, m, caption, 'https://c.termai.cc/i140/srjE7x6')
}

handler.help = ['mining', 'tambang']
handler.tags = ['rpg']
handler.command = /^(mining|tambang)$/i
handler.group = true
export default handler