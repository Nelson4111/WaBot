import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan .adventure')

  let armorLvl = user.armor || 0
  let swordLvl = user.sword || 0
  let pet = user.pet || { tipe: 'none', level: 0 }
  
  let maxHP = 100 + (armorLvl * 20)
  user.maxDarah = maxHP
  if (user.darah > maxHP) user.darah = maxHP

  let bonusDmgGuild = 0
  let bonusDefGuild = 0
  let myGuild = Object.values(wdb.guilds || {}).find(g => g.members.includes(m.sender))
  
  if (myGuild) {
    if (myGuild.buffAttack && Date.now() < myGuild.buffAttack) bonusDmgGuild = 200
    if (myGuild.buffDefense && Date.now() < myGuild.buffDefense) bonusDefGuild = 200
  }

  const dungeons = {
    'easy': {
      name: 'Goblin Nest', enemy: 'Goblin',
      minLevel: 1, minSword: 0,
      hpEnemy: 500, dmgEnemy: 20,
      reward: { exp: 500, money: 5000, gold: 1 },
      cooldown: 120000 
    },
    'normal': {
      name: 'Wolf Territory', enemy: 'Alpha Wolf',
      minLevel: 5, minSword: 2,
      hpEnemy: 3000, dmgEnemy: 60,
      reward: { exp: 1500, money: 15000, gold: 5 },
      cooldown: 120000 
    },
    'hard': {
      name: 'Dragon Lair', enemy: 'Ancient Dragon',
      minLevel: 10, minSword: 5,
      hpEnemy: 5000, dmgEnemy: 300,
      reward: { exp: 5000, money: 50000, gold: 15, diamond: 2 },
      cooldown: 120000 
    },
    'expert': {
      name: 'Hell Gate', enemy: 'Lord Satan',
      minLevel: 15, minSword: 10,
      hpEnemy: 10000, dmgEnemy: 500,
      reward: { exp: 20000, money: 200000, gold: 50, diamond: 10 },
      cooldown: 120000 
    }
  }

  let type = text ? text.toLowerCase() : ''
  if (!type || !dungeons[type]) {
    let list = `*───「 RPG DUNGEON 」───*\n\n`
    for (let i in dungeons) {
      let d = dungeons[i]
      list += `💀 *${i.toUpperCase()}* (${d.enemy})\n`
      list += `   - 📊 Syarat: Player Lvl ${d.minLevel} & Sword Lv.${d.minSword}\n`
      list += `   - 🎁 Reward: ${d.reward.diamond ? '💎' : '🪙'} ${d.reward.diamond || d.reward.gold}\n\n`
    }
    return m.reply(list + `*Cara Main:* ${usedPrefix}${command} easy`)
  }

  let selected = dungeons[type]

  if (user.level < selected.minLevel) return m.reply(`❌ Butuh Player Level ${selected.minLevel} untuk dungeon ini!`)
  if (swordLvl < selected.minSword) return m.reply(`❌ Butuh Sword Level ${selected.minSword} untuk dungeon ini!`)
  if (user.darah < (maxHP * 0.2)) return m.reply(`❌ Darah kritis (${user.darah}/${maxHP}). Gunakan .heal dulu!`)
  
  if (Date.now() - (user.lastDungeon || 0) < selected.cooldown) {
    let sisa = ((selected.cooldown - (Date.now() - user.lastDungeon)) / 1000).toFixed(0)
    return m.reply(`⏳ Tunggu ${sisa} detik lagi.`)
  }

  let userDmg = (user.level * 10) + (swordLvl * 100) + bonusDmgGuild
  
  if (pet.tipe === 'naga') {
    let bonusPet = Math.floor(userDmg * (pet.level * 0.05))
    userDmg += bonusPet
  }

  let rounds = Math.ceil(selected.hpEnemy / userDmg)
  let totalEnemyDmg = rounds * selected.dmgEnemy
  
  let userDef = (armorLvl * 100) + bonusDefGuild
  let finalDamage = Math.max(10, totalEnemyDmg - userDef)

  if (user.darah <= finalDamage) {
    user.darah = 0
    user.lastDungeon = Date.now()
    saveDB(wdb)
    return m.reply(`💀 *KAMU TEWAS!* \nBoss ${selected.enemy} menghancurkan pertahananmu.`)
  }

  let earnedExp = selected.reward.exp
  let earnedMoney = selected.reward.money

  if (pet.tipe === 'kucing') earnedExp += Math.floor(earnedExp * (pet.level * 0.10))
  if (pet.tipe === 'anjing') earnedMoney += Math.floor(earnedMoney * (pet.level * 0.10))

  user.darah -= Math.floor(finalDamage)
  user.exp += earnedExp
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + earnedMoney
  if (selected.reward.gold) user.gold = (user.gold || 0) + selected.reward.gold
  if (selected.reward.diamond) user.diamond = (user.diamond || 0) + selected.reward.diamond
  user.lastDungeon = Date.now()

  saveDB(wdb)

  let winMsg = `*───「 DUNGEON CLEAR 」───*\n\n`
  winMsg += `✅ Berhasil menaklukkan *${selected.name}*!\n`
  winMsg += `⚔️ *Total Damage:* ${userDmg.toLocaleString()} ${bonusDmgGuild > 0 ? '(🛡️ Guild Boost)' : ''}\n`
  winMsg += `🛡️ *Total Defense:* ${userDef.toLocaleString()} ${bonusDefGuild > 0 ? '(🛡️ Guild Boost)' : ''}\n`
  winMsg += `🩸 *HP Terkuras:* -${finalDamage.toFixed(0)}\n`
  winMsg += `❤️ *Sisa HP:* ${user.darah}/${maxHP}\n\n`
  winMsg += `🎁 *HADIAH:* \n`
  winMsg += `• 💰 Money: +Rp ${earnedMoney.toLocaleString()}\n`
  winMsg += `• 🌟 XP: +${earnedExp.toLocaleString()}\n`
  if (selected.reward.diamond) winMsg += `• 💎 Diamond: +${selected.reward.diamond}\n`

  return conn.sendMessage(m.chat, {
    text: winMsg,
    contextInfo: {
      externalAdReply: {
        title: "MISSION ACCOMPLISHED",
        body: `Guild: ${myGuild ? myGuild.name : 'No Guild'}`,
        thumbnailUrl: 'https://c.termai.cc/i187/iFxwQG',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['dungeon']
handler.tags = ['rpg']
handler.command = ['dungeon']

export default handler