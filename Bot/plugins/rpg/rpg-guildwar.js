import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

global.warRequests = global.warRequests || {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()

  // HANDLE TERIMA / TOLAK
  if (action === 'terima' || action === 'tolak') {
    let req = global.warRequests[m.sender]
    if(!req) return m.reply('❌ Tidak ada permintaan war masuk.')
    if(Date.now() > req.expire) {
      delete global.warRequests[m.sender]
      return m.reply('❌ Permintaan war sudah kadaluarsa.')
    }
    if(action === 'tolak'){
      delete global.warRequests[m.sender]
      return conn.reply(req.from, `❌ Tantangan war ditolak oleh @${m.sender.split('@')[0]}`, m.chat, {mentions:[m.sender]})
    }

    // JALANKAN WAR
    delete global.warRequests[m.sender]
    let attackerGuild = wdb.guilds[req.myGuild]
    let defenderGuild = wdb.guilds[req.enemyGuild]
    if(!attackerGuild ||!defenderGuild) return m.reply('❌ Salah satu guild sudah tidak ada.')

    return executeWar(conn, m, wdb, attackerGuild, defenderGuild, false)
  }

  // LANJUTAN GUILDWAR BIASA
  let myGuild = Object.values(wdb.guilds || {}).find(g => g.members.includes(m.sender))
  if(!myGuild) return m.reply('❌ Kamu tidak punya guild')
  if(Date.now() < myGuild.warCooldown) return m.reply(`❌ Guild kamu sedang cooldown war.\nSisa: ${((myGuild.warCooldown - Date.now())/60000).toFixed(0)} menit`)

  let target = m.mentionedJid[0]
  let isRandom = text.toLowerCase().includes('acak')
  let enemyGuild

  if(!isRandom){
    if(!target) return m.reply(`⚔️ *GUILD WAR*\nTag player guild musuh!\n\n*Contoh:*\n${usedPrefix}${command} @tag\n${usedPrefix}${command} acak\n${usedPrefix}${command} terima`)

    enemyGuild = Object.values(wdb.guilds || {}).find(g => g.members.includes(target))
    if(!enemyGuild) return m.reply('❌ Player itu tidak punya guild')
    if(myGuild.name === enemyGuild.name) return m.reply('❌ Ga bisa war guild sendiri')
    if(Date.now() < enemyGuild.warCooldown) return m.reply(`❌ Guild *${enemyGuild.name}* sedang cooldown war`)

    // KIRIM TANTANGAN
    global.warRequests[target] = {
      from: m.sender,
      myGuild: myGuild.name,
      enemyGuild: enemyGuild.name,
      expire: Date.now() + 60000
    }

    let cap = `╭──「 ⚔️ TANTANGAN WAR 」──╮\n`
    cap += `│ 📛 *Penyerang:* ${myGuild.name}\n`
    cap += `│ 📛 *Target:* ${enemyGuild.name}\n`
    cap += `│\n`
    cap += `│ @${target.split('@')[0]}\n`
    cap += `│ Ketik *${usedPrefix}guildwar terima* untuk menerima\n`
    cap += `│ Ketik *${usedPrefix}guildwar tolak* untuk menolak\n`
    cap += `│ ⏰ Waktu: 60 detik\n`
    cap += `╰───────────────────╯`

    return conn.reply(m.chat, cap, m.chat, {mentions:[target]})
  }

  // WAR ACAK VS GUILD MISTERIUS
  let memberCount = myGuild.members.length
  let levelRand = myGuild.level + Math.floor(Math.random() * 6) - 3
  if(levelRand < 1) levelRand = 1

  enemyGuild = {
    name: `Guild Misterius Lv${levelRand}`,
    members: Array(memberCount).fill(0).map((_,i) => `rand_${Date.now()}_${i}@s.whatsapp.net`),
    level: levelRand, exp: 0,
    buffAttack: 0, buffDefense: 0, buffMagic: 0,
    warCooldown: 0,
    money: Math.floor(Math.random() * 5000000) + 1000000
  }

  await executeWar(conn, m, wdb, myGuild, enemyGuild, isRandom)
}

async function executeWar(conn, m, wdb, myGuild, enemyGuild, isRandom) {
  let myBuff = 0
  if(Date.now() < myGuild.buffAttack) myBuff += 200
  if(Date.now() < myGuild.buffDefense) myBuff += 200
  if(Date.now() < myGuild.buffMagic) myBuff += 200

  let enemyBuff = 0
  if(Date.now() < enemyGuild.buffAttack) enemyBuff += 200
  if(Date.now() < enemyGuild.buffDefense) enemyBuff += 200
  if(Date.now() < enemyGuild.buffMagic) enemyBuff += 200

  let myPower = (myGuild.members.length * 20) + (myGuild.level * 100) + myBuff + Math.floor(Math.random() * 300)
  let enemyPower = (enemyGuild.members.length * 20) + (enemyGuild.level * 100) + enemyBuff + Math.floor(Math.random() * 300)

  let winner = myPower > enemyPower? myGuild : enemyGuild
  let loser = myPower > enemyPower? enemyGuild : myGuild

  let totalRampasan = 0
  let gugur = 0

  // PROSES PIHAK KALAH
  loser.members.forEach(jid => {
    let uang = enemyGuild.money || wdb.money[jid] || 0
    let rampas = Math.floor(uang * 0.1)
    if(!jid.startsWith('rand_')) wdb.money[jid] = Math.max(0, (wdb.money[jid] || 0) - rampas)
    totalRampasan += rampas

    let u = jid.startsWith('rand_')? {darah: 100} : wdb.users[jid]?.rpg
    if(u){
      u.darah = (u.darah || 100) - 50
      if(u.darah <= 0){
        if(Math.random() < 0.3){ u.darah = 1 } // 30% selamat
        else { u.darah = 0; gugur++ }
      }
      if(!jid.startsWith('rand_')) wdb.users[jid].rpg = u
    }
  })

  // PROSES PIHAK MENANG
  winner.members.forEach(jid => {
    let u = jid.startsWith('rand_')? {darah: 100} : wdb.users[jid]?.rpg
    if(u){
      u.darah = (u.darah || 100) - 30
      if(u.darah < 1) u.darah = 1
      if(!jid.startsWith('rand_')) wdb.users[jid].rpg = u
    }
  })

  // BAGI HADIAH
  let hadiah = Math.floor(totalRampasan * 0.5)
  let expGuild = 500

  winner.members.forEach(jid => {
    if(!jid.startsWith('rand_')){
      wdb.money[jid] = (wdb.money[jid] || 0) + Math.floor(hadiah / winner.members.length)
    }
  })

  // UPDATE EXP & COOLDOWN
  if(!isRandom){
    winner.exp += expGuild
    loser.exp += Math.floor(expGuild / 2)
    loser.warCooldown = Date.now() + 3600000 // 1 jam ga bisa war
    loser.missionCooldown = Date.now() + 7200000 // 2 jam ga bisa misi
  }
  myGuild.warCooldown = Date.now() + 3600000
  saveDB(wdb)

  // TAMPILAN RINGKAS
  let cap = `╭──「 💥 HASIL GUILD WAR 」──╮\n`
  cap += `│ ⚔️ ${myGuild.name} [${myPower}] vs [${enemyPower}] ${enemyGuild.name}\n`
  cap += `╰────────────────────────╯\n\n`
  cap += `🏆 *Pemenang:* ${winner.name}\n`
  cap += `💰 *Rampasan:* Rp ${totalRampasan.toLocaleString()}\n`
  cap += `✨ *Exp Guild:* +${expGuild} / +${Math.floor(expGuild/2)}\n`
  cap += `💀 *Korban Gugur:* ${gugur} orang\n`

  if(!isRandom){
    cap += `⚠️ *Kerugian ${loser.name}:*\n`
    cap += `├ Uang: -10%\n`
    cap += `├ HP: -50%\n`
    cap += `├ War CD: 1 Jam\n`
    cap += `└ Mission CD: 2 Jam`
  } else {
    cap += `⚔️ *Lawan Guild Misterius Lv${enemyGuild.level}*`
  }

  let allMembers = isRandom? myGuild.members : [...myGuild.members,...enemyGuild.members]
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', { contextInfo: { mentionedJid: allMembers.filter(j =>!j.startsWith('rand_')) } })
}

handler.help = ['guildwar @tag | acak | terima | tolak']
handler.tags = ['rpg']
handler.command = ['guildwar']
handler.group = true
export default handler