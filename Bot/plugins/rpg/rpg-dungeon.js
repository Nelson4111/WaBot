import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan.adventure')

  // INIT
  let armorLvl = user.armor || 0
  let swordLvl = user.sword || 0
  let pet = user.pet || { tipe: 'none', level: 0 }
  if(!user.maxDarahBonus) user.maxDarahBonus = 0
  if(!user.gold) user.gold = 0
  if(!user.diamond) user.diamond = 0
  if(!user.limit) user.limit = 0
  if(!user.darah) user.darah = 100

  // HITUNG MAX HP - SAMA KAYA GYM & HEAL
  let maxHP = 100 + (armorLvl * 20) + user.maxDarahBonus
  user.maxDarah = maxHP
  if (user.darah > maxHP) user.darah = maxHP

  // GUILD BUFF
  let bonusDmgGuild = 0
  let bonusDefGuild = 0
  let myGuild = Object.values(wdb.guilds || {}).find(g => g.members?.includes(m.sender))
  if (myGuild) {
    if (myGuild.buffAttack && Date.now() < myGuild.buffAttack) bonusDmgGuild = 200
    if (myGuild.buffDefense && Date.now() < myGuild.buffDefense) bonusDefGuild = 200
  }

  const dungeons = {
    'easy': { name: 'Goblin Scout Camp', enemy: 'Goblin Scout', minLevel: 1, minSword: 0, hpEnemy: 500, dmgEnemy: 20, reward: { exp: 500, money: 5000, gold: 1 }, cooldown: 120000 },
    'novice': { name: 'Goblin Fortress', enemy: 'Goblin Chief', minLevel: 3, minSword: 1, hpEnemy: 1000, dmgEnemy: 35, reward: { exp: 1000, money: 10000, gold: 3 }, cooldown: 120000 },
    'beginner': { name: 'Orc Outpost', enemy: 'Orc Warrior', minLevel: 5, minSword: 2, hpEnemy: 1800, dmgEnemy: 50, reward: { exp: 1800, money: 18000, gold: 5 }, cooldown: 120000 },
    'normal': { name: 'Wolf Territory', enemy: 'Alpha Wolf', minLevel: 8, minSword: 3, hpEnemy: 3000, dmgEnemy: 60, reward: { exp: 3000, money: 30000, gold: 10 }, cooldown: 120000 },
    'advanced': { name: 'Ogre Camp', enemy: 'Ogre Brute', minLevel: 12, minSword: 5, hpEnemy: 5000, dmgEnemy: 100, reward: { exp: 5000, money: 60000, gold: 20, diamond: 3 }, cooldown: 120000 },
    'elite': { name: 'Labyrinth of Minos', enemy: 'Minotaur', minLevel: 16, minSword: 7, hpEnemy: 8000, dmgEnemy: 150, reward: { exp: 8000, money: 90000, gold: 35, diamond: 6 }, cooldown: 120000 },
    'hard': { name: 'Sky Nest', enemy: 'Wyvern King', minLevel: 20, minSword: 10, hpEnemy: 12000, dmgEnemy: 220, reward: { exp: 12000, money: 150000, gold: 50, diamond: 10 }, cooldown: 120000 },
    'master': { name: 'Ancient Ruins', enemy: 'Ancient Golem', minLevel: 25, minSword: 13, hpEnemy: 18000, dmgEnemy: 320, reward: { exp: 18000, money: 250000, gold: 70, diamond: 15 }, cooldown: 120000 },
    'veteran': { name: 'Sea of Doom', enemy: 'Sea Leviathan', minLevel: 30, minSword: 16, hpEnemy: 25000, dmgEnemy: 450, reward: { exp: 25000, money: 350000, gold: 100, diamond: 22 }, cooldown: 120000 },
    'expert': { name: 'Dragon Lair', enemy: 'Ancient Dragon', minLevel: 40, minSword: 20, hpEnemy: 35000, dmgEnemy: 650, reward: { exp: 35000, money: 500000, gold: 150, diamond: 30 }, cooldown: 120000 },
    'nightmare': { name: 'Kingdom of Death', enemy: 'Lich King', minLevel: 55, minSword: 25, hpEnemy: 50000, dmgEnemy: 900, reward: { exp: 50000, money: 750000, gold: 220, diamond: 45 }, cooldown: 120000 },
    'hell': { name: 'Hell Gate', enemy: 'Demon General', minLevel: 70, minSword: 30, hpEnemy: 70000, dmgEnemy: 1300, reward: { exp: 70000, money: 1000000, gold: 300, diamond: 60 }, cooldown: 120000 },
    'abyss': { name: 'Burning Abyss', enemy: 'Phoenix of Ruin', minLevel: 90, minSword: 35, hpEnemy: 95000, dmgEnemy: 1800, reward: { exp: 95000, money: 1500000, gold: 420, diamond: 80 }, cooldown: 120000 },
    'chaos': { name: 'Hydra Swamp', enemy: 'Hydra', minLevel: 110, minSword: 40, hpEnemy: 130000, dmgEnemy: 2400, reward: { exp: 125000, money: 2200000, gold: 600, diamond: 110 }, cooldown: 120000 },
    'inferno': { name: 'Titan Valley', enemy: 'Titan Colossus', minLevel: 140, minSword: 45, hpEnemy: 180000, dmgEnemy: 3200, reward: { exp: 170000, money: 3000000, gold: 850, diamond: 150 }, cooldown: 120000 },
    'cataclysm': { name: 'Behemoth Nest', enemy: 'Behemoth', minLevel: 180, minSword: 50, hpEnemy: 250000, dmgEnemy: 4200, reward: { exp: 230000, money: 4500000, gold: 1200, diamond: 200 }, cooldown: 120000 },
    'mythic': { name: 'Void Dimension', enemy: 'Void Reaper', minLevel: 230, minSword: 60, hpEnemy: 350000, dmgEnemy: 5600, reward: { exp: 320000, money: 6500000, gold: 1700, diamond: 300 }, cooldown: 120000 },
    'legendary': { name: 'Sky Palace', enemy: 'Celestial Dragon', minLevel: 300, minSword: 70, hpEnemy: 500000, dmgEnemy: 7500, reward: { exp: 450000, money: 9000000, gold: 2400, diamond: 500 }, cooldown: 120000 },
    'godlike': { name: 'Temple of Time', enemy: 'Chronos', minLevel: 400, minSword: 80, hpEnemy: 700000, dmgEnemy: 9800, reward: { exp: 650000, money: 13000000, gold: 3500, diamond: 800 }, cooldown: 120000 },
    'divine': { name: 'End of the World', enemy: 'World Eater', minLevel: 550, minSword: 90, hpEnemy: 1000000, dmgEnemy: 13000, reward: { exp: 900000, money: 18000000, gold: 5000, diamond: 1200 }, cooldown: 120000 },
    'transcendent': { name: 'Astral Ocean', enemy: 'Astral Leviathan', minLevel: 750, minSword: 100, hpEnemy: 1500000, dmgEnemy: 18000, reward: { exp: 1300000, money: 25000000, gold: 7000, limit: 100 }, cooldown: 120000 },
    'eternity': { name: 'Heavenly Throne', enemy: 'The Fallen Seraph', minLevel: 1000, minSword: 120, hpEnemy: 2200000, dmgEnemy: 25000, reward: { exp: 1900000, money: 35000000, gold: 9500, limit: 250 }, cooldown: 120000 },
    'cosmic': { name: 'Cosmic Hell', enemy: 'Emperor of Hell', minLevel: 1400, minSword: 140, hpEnemy: 3200000, dmgEnemy: 35000, reward: { exp: 2700000, money: 50000000, gold: 13000, limit: 500 }, cooldown: 120000 },
    'apocalypse': { name: 'Void Kingdom', enemy: 'Void Emperor', minLevel: 1900, minSword: 170, hpEnemy: 4500000, dmgEnemy: 50000, reward: { exp: 4000000, money: 75000000, gold: 18000, limit: 1000 }, cooldown: 120000 },
    'final': { name: 'Genesis Realm', enemy: 'The Creator', minLevel: 2500, minSword: 200, hpEnemy: 7000000, dmgEnemy: 75000, reward: { exp: 6000000, money: 120000000, gold: 25000, limit: 2500 }, cooldown: 120000 }
  }

  let type = text?.toLowerCase() || ''
  if (!type ||!dungeons[type]) {
    let list = `*───「 RPG DUNGEON 」───*\n\n`
    for (let i in dungeons) {
      let d = dungeons[i]
      let reward = d.reward.diamond? `💎 ${d.reward.diamond}` : d.reward.limit? `🎫 ${d.reward.limit} Limit` : `🪙 ${d.reward.gold}`
      list += `💀 *${i.toUpperCase()}* (${d.enemy})\n`
      list += ` - 📊 Syarat: Player Lvl ${d.minLevel} & Sword Lv.${d.minSword}\n`
      list += ` - 🎁 Reward: ${reward}\n\n`
    }
    return m.reply(list + `*Cara Main:* ${usedPrefix}${command} easy`)
  }

  let selected = dungeons[type]

  if (user.level < selected.minLevel) return m.reply(`❌ Butuh Player Level ${selected.minLevel} untuk dungeon ini!`)
  if (swordLvl < selected.minSword) return m.reply(`❌ Butuh Sword Level ${selected.minSword} untuk dungeon ini!`)
  if (user.darah < (maxHP * 0.2)) return m.reply(`❌ Darah kritis (${user.darah}/${maxHP}). Gunakan.heal dulu!`)

  if (Date.now() - (user.lastDungeon || 0) < selected.cooldown) {
    let sisa = ((selected.cooldown - (Date.now() - user.lastDungeon)) / 1000).toFixed(0)
    return m.reply(`⏳ Tunggu ${sisa} detik lagi.`)
  }

  // DMG USER
  let userDmg = (user.level * 10) + (swordLvl * 100) + bonusDmgGuild
  if (pet.tipe === 'naga') userDmg += Math.floor(userDmg * (pet.level * 0.05))

  // DMG ENEMY
  let rounds = Math.ceil(selected.hpEnemy / userDmg)
  let totalEnemyDmg = rounds * selected.dmgEnemy

  // DEF USER
  let userDef = (armorLvl * 100) + bonusDefGuild
  if (pet.tipe === 'rubah') userDef += Math.floor(userDef * (pet.level * 0.03))
  let finalDamage = Math.max(10, totalEnemyDmg - userDef)

  // KALO MATI
  if (user.darah <= finalDamage) {
    user.darah = 0
    user.lastDungeon = Date.now()
    saveDB(wdb)
    return m.reply(`💀 *KAMU TEWAS!*\nBoss ${selected.enemy} menghancurkan pertahananmu.\nGunakan *.heal* untuk bangkit.`)
  }

  // REWARD
  let earnedExp = selected.reward.exp
  let earnedMoney = selected.reward.money
  let earnedGold = selected.reward.gold || 0
  let earnedDiamond = selected.reward.diamond || 0
  let earnedLimit = selected.reward.limit || 0

  if (pet.tipe === 'kucing') earnedExp += Math.floor(earnedExp * (pet.level * 0.10))
  if (pet.tipe === 'anjing') earnedMoney += Math.floor(earnedMoney * (pet.level * 0.10))

  user.darah -= Math.floor(finalDamage)
  user.exp += earnedExp
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + earnedMoney
  user.gold += earnedGold
  user.diamond += earnedDiamond
  user.limit += earnedLimit
  user.lastDungeon = Date.now()

  saveDB(wdb)

  let winMsg = `*───「 DUNGEON CLEAR 」───*\n\n`
  winMsg += `✅ Berhasil menaklukkan *${selected.name}*!\n`
  winMsg += `⚔️ *Total Damage:* ${userDmg.toLocaleString()} ${bonusDmgGuild > 0? '(🛡️ Guild Boost)' : ''}\n`
  winMsg += `🛡️ *Total Defense:* ${userDef.toLocaleString()} ${bonusDefGuild > 0? '(🛡️ Guild Boost)' : ''}\n`
  winMsg += `🩸 *HP Terkuras:* -${finalDamage.toLocaleString()}\n`
  winMsg += `❤️ *Sisa HP:* ${user.darah}/${maxHP}\n\n`
  winMsg += `🎁 *HADIAH:* \n`
  winMsg += `• 💰 Money: +Rp ${earnedMoney.toLocaleString()}\n`
  winMsg += `• 🌟 XP: +${earnedExp.toLocaleString()}\n`
  if (earnedGold > 0) winMsg += `• 🪙 Gold: +${earnedGold}\n`
  if (earnedDiamond > 0) winMsg += `• 💎 Diamond: +${earnedDiamond}\n`
  if (earnedLimit > 0) winMsg += `• 🎫 Limit: +${earnedLimit}\n`

  return sendRpgMsg(conn, m, winMsg, 'https://c.termai.cc/i187/iFxwQG')
}

handler.help = ['dungeon']
handler.tags = ['rpg']
handler.command = ['dungeon']
export default handler