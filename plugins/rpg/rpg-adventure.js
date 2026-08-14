import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(item) {
  return item.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const itemEmoji = {
  'tulang': '🦴', 'kayu': '🪵', 'batu': '🪨', 'jamur': '🍄', 'daun_kering': '🍂',
  'koin_tembaga': '🪙', 'ramuan_kecil': '🧪', 'tali': '🪢', 'kain_lusuh': '👕', 'wood': '🪵',
  'koin_perak': '🪙', 'ramuan_sedang': '🧪', 'belati_karat': '🔪', 'perisai_kayu': '🛡️', 'iron': '⛓️',
  'koin_emas': '🪙', 'ramuan_besar': '🧪', 'pedang_baja': '⚔️', 'armor_kulit': '🥋', 'diamond': '💎',
  'permata_biru': '💎', 'permata_merah': '❤️', 'permata_hijau': '💚', 'peta_harta': '🗺️',
  'pedang_legendaris': '⚔️👑', 'buku_sihir_kuno': '📚', 'armor_naga': '🐉🛡️', 'mahkota_raja': '👑',
  'pecahan_bintang': '🌠', 'air_mata_dewi': '💧', 'segel_dewa': '📜', 'jiwa_abadi': '👻'
}

let secret = ['jiwa_abadi', 'segel_dewa'];
let mythic = ['air_mata_dewi', 'pecahan_bintang'];
let legendary = ['armor_naga', 'buku_sihir_kuno', 'pedang_legendaris', 'mahkota_raja'];
let epic = ['permata_biru', 'permata_merah', 'permata_hijau', 'peta_harta'];
let rare = ['diamond', 'koin_emas', 'ramuan_besar', 'pedang_baja'];
let uncommon = ['iron', 'koin_perak', 'ramuan_sedang', 'belati_karat'];
let common = ['wood', 'koin_tembaga', 'ramuan_kecil', 'tali'];
let trash = ['tulang', 'batu', 'jamur', 'daun_kering', 'kain_lusuh'];

const tierInfo = {
  SECRET: {icon:'🔮', stars:'★★★★★★★'},
  MYTHIC: {icon:'🌌', stars:'★★★★★★☆'},
  LEGENDARY: {icon:'👑', stars:'★★★★★☆☆'},
  EPIC: {icon:'💎', stars:'★★★★☆☆☆'},
  RARE: {icon:'✨', stars:'★★★☆☆☆☆'},
  UNCOMMON: {icon:'💙', stars:'★★☆☆☆☆☆'},
  COMMON: {icon:'🤍', stars:'★☆☆☆☆☆☆'},
  TRASH: {icon:'🗑️', stars:'☆☆☆☆☆☆☆'}
}

function rollItem(hance, bonus, advLvl){
  let bisaSecret = advLvl >= 25
  let bisaMythic = advLvl >= 20
  let bisaLegend = advLvl >= 15
  let bisaEpic = advLvl >= 10
  let bisaRare = advLvl >= 5

  if (bisaSecret && hance > (99.99 - bonus)) return {item: secret[Math.floor(Math.random() * secret.length)], tier: 'SECRET', exp: 4000}
  if (bisaMythic && hance > (99.9 - bonus)) return {item: mythic[Math.floor(Math.random() * mythic.length)], tier: 'MYTHIC', exp: 1000}
  if (bisaLegend && hance > (99 - bonus)) return {item: legendary[Math.floor(Math.random() * legendary.length)], tier: 'LEGENDARY', exp: 500}
  if (bisaEpic && hance > (96 - bonus)) return {item: epic[Math.floor(Math.random() * epic.length)], tier: 'EPIC', exp: 250}
  if (bisaRare && hance > (86 - bonus)) return {item: rare[Math.floor(Math.random() * rare.length)], tier: 'RARE', exp: 120}
  if (hance > (61 - bonus)) return {item: uncommon[Math.floor(Math.random() * uncommon.length)], tier: 'UNCOMMON', exp: 50}
  if (hance > (21 - bonus)) return {item: common[Math.floor(Math.random() * common.length)], tier: 'COMMON', exp: 15}
  return {item: trash[Math.floor(Math.random() * trash.length)], tier: 'TRASH', exp: 5}
}

let handler = async (m, { conn, text, command }) => {
  const wdb = loadDB()

  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
  if (!wdb.users[m.sender].rpg) {
    wdb.users[m.sender].rpg = {
      level: 1, exp: 0, darah: 100, lastAdventure: 0, lastMining: 0, lastDungeon: 0,
      diamond: 0, gold: 0, iron: 0, stone: 0, wood: 0, inventory: {}, items: {},
      adventureLevel: 1, sword: 0, pickaxe: 0,
      pet: { tipe: 'none', level: 1, exp: 0, lastFeed: 0 }
    }
    if (wdb.money && typeof wdb.money[m.sender] === 'undefined') {
      wdb.money[m.sender] = 1000
    }
  }

  let user = wdb.users[m.sender].rpg

  // COMMAND LIAT INVENTORY ADVENTURE - PISAH TIER JUGA
  if(command === 'tasadv' || command === 'invadv'){
    if(!user.items || Object.keys(user.items).length === 0)
      return m.reply('🎒 Tas Adventure kosong\nMulai adventure dulu dengan *.adventure*')

    let grouped = {}
    let total = 0
    for(let nama in user.items){
      if(user.items[nama] > 0){
        let tier = 'TRASH'
        if(secret.includes(nama)) tier = 'SECRET'
        else if(mythic.includes(nama)) tier = 'MYTHIC'
        else if(legendary.includes(nama)) tier = 'LEGENDARY'
        else if(epic.includes(nama)) tier = 'EPIC'
        else if(rare.includes(nama)) tier = 'RARE'
        else if(uncommon.includes(nama)) tier = 'UNCOMMON'
        else if(common.includes(nama)) tier = 'COMMON'

        if(!grouped[tier]) grouped[tier] = {}
        grouped[tier][nama] = user.items[nama]
        total += user.items[nama]
      }
    }

    let cap = `*───「 🎒 TAS ADVENTURE 」───*\n`
    cap += `Total Item: ${total.toLocaleString()} unit\n`
    let urutan = ['SECRET','MYTHIC','LEGENDARY','EPIC','RARE','UNCOMMON','COMMON','TRASH']
    for(let t of urutan){
      if(grouped[t]){
        cap += `\n${tierInfo[t].icon} *${t}*\n`
        for(let nama in grouped[t]){
          cap += `${itemEmoji[nama] || '📦'} ${formatNama(nama).padEnd(20)} x${grouped[t][nama].toLocaleString()}\n`
        }
      }
    }
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
  }

  // COMMAND ADVENTURE
  let cooldown = 120000
  if (Date.now() - (user.lastAdventure || 0) < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - user.lastAdventure)) / 1000)
    return m.reply(`⏳ Tunggu ${sisa} detik lagi.`)
  }
  if (user.darah <= 10) return m.reply('❌ Darah terlalu rendah! Minum potion dulu')

  let advLvl = user.adventureLevel || 1
  let swordLvl = user.sword || 0
  let pickLvl = user.pickaxe || 0

  let bonus = Math.min(advLvl * 2 + swordLvl + Math.floor(pickLvl / 2), 60)
  let darahKurang = Math.floor(Math.random() * 15) + 5

  let baseExp = Math.floor(Math.random() * 150) + 50
  let baseMoney = Math.floor(Math.random() * 5000) + 1000
  let baseWood = Math.floor(Math.random() * 10) + 5
  let baseIron = Math.floor(Math.random() * 5) + 1

  let jumlahLoot = Math.min(1 + Math.floor(advLvl / 10) + Math.floor(swordLvl / 5) + Math.floor(pickLvl / 5), 6)

  let hasilLoot = {}
  let groupedLoot = {}
  let totalExp = baseExp
  let tierTertinggi = 'TRASH'

  for(let i = 0; i < jumlahLoot; i++){
    let hance = Math.random() * 100
    let {item, tier, exp} = rollItem(hance, bonus, advLvl)
    hasilLoot[item] = (hasilLoot[item] || 0) + 1
    if(!groupedLoot[tier]) groupedLoot[tier] = {}
    groupedLoot[tier][item] = (groupedLoot[tier][item] || 0) + 1
    totalExp += exp

    let urutanTier = ['TRASH','COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC','SECRET']
    if(urutanTier.indexOf(tier) > urutanTier.indexOf(tierTertinggi)) tierTertinggi = tier
  }

  if(!user.items) user.items = {}
  for(let item in hasilLoot){
    user.items[item] = (user.items[item] || 0) + hasilLoot[item]
    if(item === 'wood') user.wood = (user.wood || 0) + hasilLoot[item]
    if(item === 'iron') user.iron = (user.iron || 0) + hasilLoot[item]
    if(item === 'diamond') user.diamond = (user.diamond || 0) + hasilLoot[item]
  }

  let pickBonusWood = Math.floor(pickLvl / 3)
  let pickBonusIron = Math.floor(pickLvl / 4)
  user.wood = (user.wood || 0) + baseWood + pickBonusWood
  user.iron = (user.iron || 0) + baseIron + pickBonusIron
  hasilLoot['wood'] = (hasilLoot['wood'] || 0) + baseWood + pickBonusWood
  hasilLoot['iron'] = (hasilLoot['iron'] || 0) + baseIron + pickBonusIron

  let money = baseMoney + (advLvl * 100) + (swordLvl * 50) + (pickLvl * 30)
  user.exp += totalExp
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + money
  user.darah -= darahKurang
  user.lastAdventure = Date.now()

  if (user.exp >= user.level * 500) {
    user.level++
    user.exp = 0
  }
  if (user.exp >= advLvl * 300) {
    user.adventureLevel = advLvl + 1
  }

  saveDB(wdb)

  let cap = `*───「 🗺️ ADVENTURE 」───*\n\n`
  cap += `*Tier Tertinggi* : ${tierInfo[tierTertinggi].stars} ${tierTertinggi} ${tierInfo[tierTertinggi].icon}\n\n`
  cap += `🎒 *Hasil Penjelajahan x${jumlahLoot}* :\n`

  let urutan = ['SECRET','MYTHIC','LEGENDARY','EPIC','RARE','UNCOMMON','COMMON','TRASH']
  for(let t of urutan){
    if(groupedLoot[t]){
      cap += `\n${tierInfo[t].icon} *${t}*\n`
      for(let item in groupedLoot[t]){
        cap += `│ ${itemEmoji[item] || '📦'} ${formatNama(item)} x${groupedLoot[t][item]}\n`
      }
    }
  }

  cap += `\n│ 💰 Money : +Rp ${money.toLocaleString()}\n`
  cap += `└ 🌟 XP : +${totalExp}\n\n`
  cap += `❤️ *Sisa Darah* : ${user.darah}\n`
  cap += `🗺️ *Lvl* : ${advLvl} | ⚔️ *Sword* : ${swordLvl} | ⛏️ *Pick* : ${pickLvl}\n`
  if(bonus > 0) cap += `🍀 *Bonus* : +${bonus.toFixed(1)}%`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i166/r7V1')
}

handler.help = ['adventure', 'petualang', 'tasadv', 'invadv']
handler.tags = ['rpg']
handler.command = ['adventure', 'petualang', 'tasadv', 'invadv']
export default handler
