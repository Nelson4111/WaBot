import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()

  let guildName = Object.keys(wdb.guilds || {}).find(name => wdb.guilds[name].members.includes(m.sender))
  if (!guildName) return m.reply('❌ Kamu bukan anggota Guild.')

  let myGuild = wdb.guilds[guildName]

  // init data biar ga error
  myGuild.level = myGuild.level || 1
  myGuild.exp = myGuild.exp || 0
  if (!myGuild.contribution) myGuild.contribution = {}
  if (!myGuild.lastParty) myGuild.lastParty = 0
  if (!myGuild.lastTrain) myGuild.lastTrain = 0
  if (!myGuild.buffSpeed) myGuild.buffSpeed = 0
  if (!myGuild.buffLuck) myGuild.buffLuck = 0
  if (!myGuild.buffMulti) myGuild.buffMulti = 0
  if (!myGuild.warCooldown) myGuild.warCooldown = 0
  if (!myGuild.missionCooldown) myGuild.missionCooldown = 0 // TAMBAH INI

  // COMMAND BARU
  if(command === 'pestaguild'){
    let cd = 10800000 // 3 jam
    if(Date.now() - myGuild.lastParty < cd) return m.reply(`⏳ Pesta guild masih cooldown.\nSisa: ${((cd - (Date.now() - myGuild.lastParty))/60000).toFixed(0)} menit`)
    let expGain = Date.now() < myGuild.buffMulti? 450 : 300
    myGuild.exp += expGain
    myGuild.lastParty = Date.now()
    saveDB(wdb)
    return m.reply(`🎉 *PESTA GUILD DIMULAI!*\nSemua anggota bersenang-senang bersama\n✨ +${expGain} Guild Exp${Date.now() < myGuild.buffMulti? ' 📈':''}`)
  }

  if(command === 'latihanguild'){
    let cd = 1800000 // 30 menit
    if(Date.now() - myGuild.lastTrain < cd) return m.reply(`⏳ Latihan guild masih cooldown.\nSisa: ${((cd - (Date.now() - myGuild.lastTrain))/60000).toFixed(0)} menit`)
    let expGain = Date.now() < myGuild.buffMulti? 150 : 100
    myGuild.exp += expGain
    myGuild.lastTrain = Date.now()
    saveDB(wdb)
    return m.reply(`⚔️ *LATIHAN GUILD SELESAI!*\nSemua anggota berlatih bersama\n✨ +${expGain} Guild Exp${Date.now() < myGuild.buffMulti? ' 📈':''}`)
  }

  if(Date.now() < myGuild.warCooldown) return m.reply('❌ Guild sedang cooldown war. Gabisa misi dulu 1 jam')

  // TAMBAHAN: COOLDOWN MISI 2 JAM SETELAH KALAH WAR
  if(Date.now() < myGuild.missionCooldown){
    let sisa = ((myGuild.missionCooldown - Date.now())/60000).toFixed(0)
    return m.reply(`❌ Guild sedang dalam pemulihan setelah kalah war.\nGabisa misi selama ${sisa} menit lagi`)
  }

  const missions = [
{ name: 'Pembersihan Selokan Kota', minLevel: 1, reward: { money: 20000, exp: 50, iron: 2 }, contrib: 10 },
{ name: 'Patroli Perbatasan', minLevel: 10, reward: { money: 45000, exp: 120, iron: 5 }, contrib: 25 },
{ name: 'Ekspedisi Tambang Tua', minLevel: 20, reward: { money: 80000, exp: 200, iron: 10, gold: 2 }, contrib: 50 },
{ name: 'Perburuan Orc Liar', minLevel: 30, reward: { money: 150000, exp: 450, gold: 8, stone: 15 }, contrib: 100 },
{ name: 'Penjajahan Benteng Goblin', minLevel: 40, reward: { money: 350000, exp: 1000, gold: 15, diamond: 3 }, contrib: 200 },
{ name: 'Slayer Sang Naga Purba', minLevel: 50, reward: { money: 750000, exp: 2500, gold: 30, diamond: 10, stone: 50 }, contrib: 500 },
{ name: 'Pemusnahan Kamp Ogre', minLevel: 60, reward: { money: 1200000, exp: 4000, gold: 45, diamond: 15, stone: 80 }, contrib: 750 },
{ name: 'Perburuan Kalajengking Raksasa', minLevel: 70, reward: { money: 1800000, exp: 6000, gold: 60, diamond: 20, stone: 100 }, contrib: 1000 },
{ name: 'Penaklukan Raja Lich', minLevel: 80, reward: { money: 2600000, exp: 8500, gold: 80, diamond: 30, emerald: 5 }, contrib: 1400 },
{ name: 'Invasi Kerajaan Mayat Hidup', minLevel: 90, reward: { money: 3600000, exp: 11500, gold: 105, diamond: 42, emerald: 8 }, contrib: 1900 },
{ name: 'Eksekusi Phoenix Kegelapan', minLevel: 100, reward: { money: 4800000, exp: 15000, gold: 135, diamond: 56, emerald: 12 }, contrib: 2500 },
{ name: 'Penjelajahan Gunung Neraka', minLevel: 120, reward: { money: 6200000, exp: 19000, gold: 170, diamond: 72, emerald: 17 }, contrib: 3200 },
{ name: 'Pembantaian Iblis', minLevel: 140, reward: { money: 7800000, exp: 23500, gold: 210, diamond: 90, emerald: 23 }, contrib: 4000 },
{ name: 'Perburuan Hydra Berkepala Sembilan', minLevel: 160, reward: { money: 9600000, exp: 28500, gold: 255, diamond: 110, emerald: 30 }, contrib: 4900 },
{ name: 'Ekspedisi Abyss Tanpa Dasar', minLevel: 180, reward: { money: 11600000, exp: 34000, gold: 305, diamond: 135, emerald: 40 }, contrib: 6000 },
{ name: 'Penaklukan Titan Petir', minLevel: 200, reward: { money: 13800000, exp: 40000, gold: 360, diamond: 165, emerald: 55 }, contrib: 7300 },
{ name: 'Pemburuan Leviathan Astral', minLevel: 230, reward: { money: 16200000, exp: 46500, gold: 420, diamond: 200, emerald: 75 }, contrib: 8800 },
{ name: 'Eksekusi Raja Iblis Azrael', minLevel: 260, reward: { money: 18800000, exp: 53500, gold: 485, diamond: 240, emerald: 100 }, contrib: 10500 },
{ name: 'Penumpasan Dewa Kekacauan', minLevel: 300, reward: { money: 21600000, exp: 61000, gold: 555, diamond: 285, emerald: 130 }, contrib: 12500 },
{ name: 'Serangan ke Istana Dewa Matahari', minLevel: 350, reward: { money: 24600000, exp: 69000, gold: 630, diamond: 335, emerald: 165 }, contrib: 14800 },
{ name: 'Perburuan Naga Astral Abadi', minLevel: 400, reward: { money: 30000000, exp: 85000, gold: 750, diamond: 420, emerald: 210 }, contrib: 18000 },
{ name: 'Penaklukan Penguasa Dimensi Void', minLevel: 450, reward: { money: 38000000, exp: 105000, gold: 900, diamond: 550, emerald: 280 }, contrib: 23000 },
{ name: 'Eksekusi Sang Pengamat Semesta', minLevel: 500, reward: { money: 48000000, exp: 130000, gold: 1100, diamond: 720, emerald: 370 }, contrib: 30000 },
{ name: 'Raid Istana Para Dewa', minLevel: 550, reward: { money: 60000000, exp: 160000, gold: 1350, diamond: 950, emerald: 480 }, contrib: 39000 },
{ name: 'Invasi Langit Ketujuh', minLevel: 600, reward: { money: 75000000, exp: 200000, gold: 1650, diamond: 1250, emerald: 620 }, contrib: 50000 },
{ name: 'Perburuan Dewa Petir', minLevel: 650, reward: { money: 95000000, exp: 250000, gold: 2000, diamond: 1650, emerald: 800 }, contrib: 65000 },
{ name: 'Penaklukan Kastil Waktu', minLevel: 700, reward: { money: 120000, exp: 310000, gold: 2400, diamond: 2200, emerald: 1050 }, contrib: 85000 },
{ name: 'Eksekusi Kaisar Void', minLevel: 800, reward: { money: 150000000, exp: 380000, gold: 2900, diamond: 2900, emerald: 1350 }, contrib: 110000 },
{ name: 'Pembantaian 9 Raja Iblis', minLevel: 900, reward: { money: 190000, exp: 470000, gold: 3500, diamond: 3800, emerald: 1750 }, contrib: 145000 },
{ name: 'Runtuhkan Menara Keabadian', minLevel: 1000, reward: { money: 240000, exp: 580000, gold: 4200, diamond: 5000, emerald: 2250 }, contrib: 190000 },
{ name: 'Perburuan Naga Kosmik', minLevel: 1100, reward: { money: 300000000, exp: 710000, gold: 5000, diamond: 6500, emerald: 2900 }, contrib: 250000 },
{ name: 'Penaklukan Armada Galaksi', minLevel: 1200, reward: { money: 380000, exp: 870000, gold: 6000, diamond: 8500, emerald: 3700 }, contrib: 330000 },
{ name: 'Eksekusi Penguasa Galaksi', minLevel: 1300, reward: { money: 480000000, exp: 1060000, gold: 7200, diamond: 11000, emerald: 4700 }, contrib: 430000 },
{ name: 'Raid Dimensi Paralel', minLevel: 1400, reward: { money: 600000000, exp: 1290000, gold: 8600, diamond: 14500, emerald: 6000 }, contrib: 560000 },
{ name: 'Pembantaian Dewa Primordial', minLevel: 1500, reward: { money: 750000, exp: 1570000, gold: 10200, diamond: 19000, emerald: 7600 }, contrib: 730000 },
{ name: 'Penaklukan Alam Semesta', minLevel: 1600, reward: { money: 950000000, exp: 1900000, gold: 12000, diamond: 25000, emerald: 9600 }, contrib: 950000 },
{ name: 'Eksekusi Sang Pencipta', minLevel: 1700, reward: { money: 1200000000, exp: 2300000, gold: 14000, diamond: 33000, emerald: 12000 }, contrib: 1250000 },
{ name: 'Runtuhkan Tahta Semesta', minLevel: 1800, reward: { money: 1500000, exp: 2800000, gold: 16500, diamond: 43000, emerald: 15000 }, contrib: 1650000 },
{ name: 'Perang Melawan Kehampaan', minLevel: 1900, reward: { money: 1900000, exp: 3400000, gold: 19500, diamond: 56000, emerald: 19000 }, contrib: 2200000 },
{ name: 'Ascensi Menjadi Dewa Tertinggi', minLevel: 2000, reward: { money: 2500000, exp: 4200000, gold: 23000, diamond: 75000, emerald: 25000 }, contrib: 3000000 }
  ]

  if (!text) {
    let list = `╭──「 📜 GUILD EXPEDITION 」──╮\n\n`
    missions.forEach((v, i) => {
      list += `│ ${i + 1}. *${v.name}*\n`
      list += `│ └ 📊 Syarat: Lv.${v.minLevel}\n`
      list += `│ └ 🏆 +${v.contrib} Pts | ✨ +${v.reward.exp} Exp\n`
    })
    list += `╰───────────────────╯\n*Cara Pilih:* ${usedPrefix}${command} [nomor]`

    return sendRpgMsg(conn, m, list, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg')
  }

  let index = parseInt(text) - 1
  if (!missions[index]) return m.reply('❌ Nomor misi tidak valid.')
  let msn = missions[index]

  let baseCooldown = 120000
  let cooldown = Date.now() < myGuild.buffSpeed? baseCooldown / 2 : baseCooldown

  if (Date.now() - (myGuild.lastMission || 0) < cooldown) {
    let sisa = ((cooldown - (Date.now() - myGuild.lastMission)) / 1000).toFixed(0)
    return m.reply(`⏳ Guild sedang cooldown. Sisa: ${sisa} detik lagi.`)
  }

  let user = wdb.users[m.sender]?.rpg || (getUserRPG(wdb, m.sender).rpg)
  if (user.level < msn.minLevel) return m.reply(`❌ Butuh Player Lv.${msn.minLevel} untuk misi ini.`)

  if (typeof myGuild.exp!== 'number') myGuild.exp = 0
  if (typeof myGuild.level!== 'number') myGuild.level = 1
  if (!myGuild.contribution) myGuild.contribution = {}

  let isLuck = Date.now() < myGuild.buffLuck
  let isMulti = Date.now() < myGuild.buffMulti
  let reward = {...msn.reward}
  let extraText = ''

  if(isLuck){
    let multiplier = 1 + (Math.random() * 0.5)
    reward.money = Math.floor(reward.money * multiplier)
    reward.exp = Math.floor(reward.exp * multiplier)
    extraText += `\n🍀 *LUCK BUFF:* Hadiah x${multiplier.toFixed(2)}`
  }
  if(isMulti){
    reward.exp = Math.floor(reward.exp * 1.5)
    extraText += `\n📈 *MULTIPLIER:* +50% Exp Guild`
  }

  myGuild.contribution[m.sender] = (myGuild.contribution[m.sender] || 0) + msn.contrib
  myGuild.exp += reward.exp
  myGuild.lastMission = Date.now()

  myGuild.members.forEach(jid => {
    let u = wdb.users[jid]?.rpg
    if (u) {
      wdb.money[jid] = (wdb.money[jid] || 0) + reward.money
      if (msn.reward.iron) u.iron = (u.iron || 0) + msn.reward.iron
      if (msn.reward.gold) u.gold = (u.gold || 0) + msn.reward.gold
      if (msn.reward.stone) u.stone = (u.stone || 0) + msn.reward.stone
      if (msn.reward.diamond) u.diamond = (u.diamond || 0) + msn.reward.diamond
      if (msn.reward.emerald) u.emerald = (u.emerald || 0) + msn.reward.emerald
    }
  })

  let nextExp = myGuild.level * 1000
  while (myGuild.exp >= nextExp) {
    myGuild.level += 1
    myGuild.exp -= nextExp
    nextExp = myGuild.level * 1000
    conn.reply(m.chat, `🎊 *GUILD LEVEL UP!* \nGuild *${myGuild.name}* sekarang mencapai Level *${myGuild.level}*!`, m)
  }

  wdb.guilds[guildName] = myGuild
  saveDB(wdb)

  let executorName = m.pushName || global.db.data.users[m.sender]?.name || conn.getName(m.sender) || 'Player'

  let cap = `╭──「 ✅ MISSION CLEAR 」──╮\n\n`
  cap += `│ 📜 *Misi:* ${msn.name}\n`
  cap += `│ 👤 *Eksekutor:* ${executorName}\n`
  cap += `│ ✨ *Guild Exp:* +${reward.exp}${extraText}\n`
  cap += `│ 🏆 *Kontribusi:* +${msn.contrib} Pts\n\n`
  cap += `│ 🎁 *HADIAH SEMUA MEMBER:* \n`
  cap += `│ • 💰 Rp ${reward.money.toLocaleString('id-ID')}\n`
  if (msn.reward.diamond) cap += `│ • 💎 ${msn.reward.diamond}\n`
  if (msn.reward.emerald) cap += `│ • 🟢 ${msn.reward.emerald}\n`
  cap += `╰───────────────────╯`

  return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg', { contextInfo: { mentionedJid: [m.sender] } })
}

handler.help = ['misiguild', 'pestaguild', 'latihanguild']
handler.tags = ['rpg']
handler.command = ['misiguild', 'pestaguild', 'latihanguild']

export default handler
