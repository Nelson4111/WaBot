import { loadDB, saveDB, getUserRPG, initLadang, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(item) {
  return item.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function getAdvTitle(lvl){
  if(lvl >= 250) return '👑 DEWA PENJELAJAH'
  if(lvl >= 200) return '🌌 MITOS HIDUP'
  if(lvl >= 150) return '⚔️ LEGENDA'
  if(lvl >= 100) return '💎 EPIC HERO'
  if(lvl >= 50) return '✨ PENJELAJAH ULUNG'
  if(lvl >= 25) return '💙 PETUALANG'
  if(lvl >= 10) return '🤍 PEMULA'
  return '🗑️ PENGEMBARA'
}

const itemEmoji = {
  'tulang': '🦴', 'kayu': '🪵', 'batu': '🪨', 'jamur': '🍄', 'daun_kering': '🍂',
  'koin_tembaga': '🪙', 'ramuan_kecil': '🧪', 'tali': '🪢', 'kain_lusuh': '👕',
  'koin_perak': '🪙', 'ramuan_sedang': '🧪', 'belati_karat': '🔪', 'perisai_kayu': '🛡️',
  'koin_emas': '🪙', 'ramuan_besar': '🧪', 'pedang_baja': '⚔️', 'armor_kulit': '🥋', 'diamond': '💎',
  'permata_biru': '💎', 'permata_merah': '❤️', 'permata_hijau': '💚', 'peta_harta': '🗺️',
  'pedang_legendaris': '⚔️👑', 'buku_sihir_kuno': '📚', 'armor_naga': '🐉🛡️', 'mahkota_raja': '👑',
  'pecahan_bintang': '🌠', 'air_mata_dewi': '💧', 'segel_dewa': '📜', 'jiwa_abadi': '👻',
  'iron': '⛓️'
}

let secret = ['jiwa_abadi', 'segel_dewa'];
let mythic = ['air_mata_dewi', 'pecahan_bintang'];
let legendary = ['armor_naga', 'buku_sihir_kuno', 'pedang_legendaris', 'mahkota_raja'];
let epic = ['permata_biru', 'permata_merah', 'permata_hijau', 'peta_harta'];
let rare = ['diamond', 'koin_emas', 'ramuan_besar', 'pedang_baja', 'armor_kulit'];
let uncommon = ['koin_perak', 'ramuan_sedang', 'belati_karat', 'perisai_kayu'];
let common = ['kayu', 'koin_tembaga', 'ramuan_kecil', 'tali'];
let trash = ['tulang', 'batu', 'jamur', 'daun_kering', 'kain_lusuh'];

const tierInfo = {
  SECRET: {icon:'🔮', stars:'★★★★★★★'}, MYTHIC: {icon:'🌌', stars:'★★★★★★☆'},
  LEGENDARY: {icon:'👑', stars:'★★★★★☆☆'}, EPIC: {icon:'💎', stars:'★★★★☆☆☆'},
  RARE: {icon:'✨', stars:'★★★☆☆☆☆'}, UNCOMMON: {icon:'💙', stars:'★★☆☆☆☆☆'},
  COMMON: {icon:'🤍', stars:'★☆☆☆☆☆☆'}, TRASH: {icon:'🗑️', stars:'☆☆☆☆☆☆'}
}

function rollItem(hance, bonus, advLvl, swordLvl, pickLvl){
  let bisaSecret = advLvl >= 250 && swordLvl >= 50 && pickLvl >= 50
  let bisaMythic = advLvl >= 200 && swordLvl >= 40 && pickLvl >= 40
  let bisaLegend = advLvl >= 150
  let bisaEpic = advLvl >= 100
  let bisaRare = advLvl >= 50
  let bisaUncommon = advLvl >= 25
  let bisaCommon = advLvl >= 10

  if (bisaSecret && hance > (99.999 - (bonus * 0.001))) return {item: secret[Math.floor(Math.random() * secret.length)], tier: 'SECRET', exp: 200000}
  if (bisaMythic && hance > (99.99 - (bonus * 0.002))) return {item: mythic[Math.floor(Math.random() * mythic.length)], tier: 'MYTHIC', exp: 50000}
  if (bisaLegend && hance > (99.9 - (bonus * 0.004))) return {item: legendary[Math.floor(Math.random() * legendary.length)], tier: 'LEGENDARY', exp: 15000}
  if (bisaEpic && hance > (99 - (bonus * 0.01))) return {item: epic[Math.floor(Math.random() * epic.length)], tier: 'EPIC', exp: 5000}
  if (bisaRare && hance > (92 - (bonus * 0.02))) return {item: rare[Math.floor(Math.random() * rare.length)], tier: 'RARE', exp: 1500}
  if (bisaUncommon && hance > (67 - (bonus * 0.04))) return {item: uncommon[Math.floor(Math.random() * uncommon.length)], tier: 'UNCOMMON', exp: 400}
  if (bisaCommon && hance > (17 - (bonus * 0.05))) return {item: common[Math.floor(Math.random() * common.length)], tier: 'COMMON', exp: 100}
  return {item: trash[Math.floor(Math.random() * trash.length)], tier: 'TRASH', exp: 20}
}

let handler = async (m, { conn, command }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)
  if(!user.inventory) user.inventory = {}
  if(!user.adventureLevel) user.adventureLevel = 1

  // COMMAND TAS / BACKPACK - baca dari user.inventory
  if(command === 'tas' || command === 'backpack'){
    if(Object.keys(user.inventory).length === 0) return m.reply('🎒 Tas kosong\nMulai adventure dulu dengan *.adventure*')

    let grouped = {}; let total = 0
    for(let nama in user.inventory){
      if(user.inventory[nama] > 0){
        let tier = 'TRASH'
        if(secret.includes(nama)) tier = 'SECRET'
        else if(mythic.includes(nama)) tier = 'MYTHIC'
        else if(legendary.includes(nama)) tier = 'LEGENDARY'
        else if(epic.includes(nama)) tier = 'EPIC'
        else if(rare.includes(nama)) tier = 'RARE'
        else if(uncommon.includes(nama)) tier = 'UNCOMMON'
        else if(common.includes(nama)) tier = 'COMMON'
        if(!grouped[tier]) grouped[tier] = {}
        grouped[tier][nama] = user.inventory[nama]
        total += user.inventory[nama]
      }
    }
    let cap = `*───「 🎒 BACKPACK 」───*\nTitle: ${getAdvTitle(user.adventureLevel)}\nTotal Item: ${total.toLocaleString()} unit\n`
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
  let oldTitle = getAdvTitle(advLvl)

  let bonus = Math.min(advLvl * 2 + swordLvl + Math.floor(pickLvl / 2), 60)
  let darahKurang = Math.floor(Math.random() * 15) + 5
  let baseExp = Math.floor(Math.random() * 150) + 50
  let baseMoney = Math.floor(Math.random() * 5000) + 1000
  let baseWood = Math.floor(Math.random() * 10) + 5
  let baseIron = Math.floor(Math.random() * 5) + 1
  let jumlahLoot = Math.min(1 + Math.floor(advLvl / 10) + Math.floor(swordLvl / 5) + Math.floor(pickLvl / 5), 8)

  let hasilLoot = {}; let groupedLoot = {}; let totalExp = baseExp; let tierTertinggi = 'TRASH'

  for(let i = 0; i < jumlahLoot; i++){
    let hance = Math.random() * 100
    let {item, tier, exp} = rollItem(hance, bonus, advLvl, swordLvl, pickLvl)
    hasilLoot[item] = (hasilLoot[item] || 0) + 1
    if(!groupedLoot[tier]) groupedLoot[tier] = {}
    groupedLoot[tier][item] = (groupedLoot[tier][item] || 0) + 1
    totalExp += exp
    let urutanTier = ['TRASH','COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC','SECRET']
    if(urutanTier.indexOf(tier) > urutanTier.indexOf(tierTertinggi)) tierTertinggi = tier
  }

  // === MIGRATE KE 2 TEMPAT ===
  // 1. Masuk inventory buat.tas
  for(let item in hasilLoot){ user.inventory[item] = (user.inventory[item] || 0) + hasilLoot[item] }
  user.inventory['kayu'] = (user.inventory['kayu'] || 0) + baseWood + Math.floor(pickLvl / 3)
  user.inventory['iron'] = (user.inventory['iron'] || 0) + baseIron + Math.floor(pickLvl / 4)

  // 2. Masuk user.diamond dll biar nongol di.inventory
  if(hasilLoot['diamond']) user.diamond = (user.diamond || 0) + hasilLoot['diamond']
  user.wood = (user.wood || 0) + baseWood + Math.floor(pickLvl / 3)
  user.iron = (user.iron || 0) + baseIron + Math.floor(pickLvl / 4)

  let money = baseMoney + (advLvl * 200) + (swordLvl * 100) + (pickLvl * 60)
  user.exp += totalExp
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + money
  user.darah -= darahKurang
  user.lastAdventure = Date.now()

  if (user.exp >= user.level * 500) { user.level++; user.exp = 0 }
  let needXP = advLvl * 1000
  let levelUpMsg = ''
  if (user.exp >= needXP) {
    user.adventureLevel = advLvl + 1
    user.exp = 0
    let newTitle = getAdvTitle(user.adventureLevel)
    if(newTitle!== oldTitle) levelUpMsg = `\n\n🎉 *NAIK TITLE!*\n${oldTitle} ➜ ${newTitle}`
  }

  saveDB(wdb)

  let cap = `*───「 🗺️ ADVENTURE 」───*\n\n`
  cap += `*Title* : ${getAdvTitle(user.adventureLevel)}\n`
  cap += `*Tier* : ${tierInfo[tierTertinggi].stars} ${tierTertinggi} ${tierInfo[tierTertinggi].icon}\n\n`
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
  cap += `\n│ 🪵 Kayu : +${baseWood + Math.floor(pickLvl / 3)}\n`
  cap += `│ ⛓️ Iron : +${baseIron + Math.floor(pickLvl / 4)}\n`
  cap += `│ 💰 Money : +Rp ${money.toLocaleString()}\n`
  cap += `└ 🌟 XP : +${totalExp}\n\n`
  cap += `❤️ *Sisa Darah* : ${user.darah}\n`
  cap += `🗺️ *AdvLvl* : ${user.adventureLevel} | ⚔️ *Sword* : ${swordLvl} | ⛏️ *Pick* : ${pickLvl}\n`
  if(bonus > 0) cap += `🍀 *Bonus* : +${bonus.toFixed(1)}%`
  cap += levelUpMsg

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i166/r7V1')
}

handler.help = ['adventure', 'petualang', 'tas', 'backpack']
handler.tags = ['rpg']
handler.command = /^(adventure|petualang|tas|backpack)$/i
handler.group = true
export default handler