import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  
  // Mencari nama guild (key) agar bisa diupdate langsung ke objek utama
  let guildName = Object.keys(wdb.guilds || {}).find(name => wdb.guilds[name].members.includes(m.sender))
  if (!guildName) return m.reply('❌ Kamu bukan anggota Guild.')

  let myGuild = wdb.guilds[guildName] // Referensi langsung ke database

  const missions = [
    { name: 'Pembersihan Selokan Kota', minLevel: 1, reward: { money: 20000, exp: 50, iron: 2 }, contrib: 10 },
    { name: 'Patroli Perbatasan', minLevel: 3, reward: { money: 45000, exp: 120, iron: 5 }, contrib: 25 },
    { name: 'Ekspedisi Tambang Tua', minLevel: 5, reward: { money: 80000, exp: 200, iron: 10, gold: 2 }, contrib: 50 },
    { name: 'Perburuan Orc Liar', minLevel: 10, reward: { money: 150000, exp: 450, gold: 8, stone: 15 }, contrib: 100 },
    { name: 'Penjajahan Benteng Goblin', minLevel: 15, reward: { money: 350000, exp: 1000, gold: 15, diamond: 3 }, contrib: 200 },
    { name: 'Slayer Sang Naga Purba', minLevel: 20, reward: { money: 750000, exp: 2500, gold: 30, diamond: 10, stone: 50 }, contrib: 500 }
  ]

  if (!text) {
    let list = `*───「 GUILD EXPEDITION LIST 」───*\n\n`
    missions.forEach((v, i) => {
      list += `${i + 1}. *${v.name}*\n`
      list += `   └ 📊 Syarat: Player Lv.${v.minLevel}\n`
      list += `   └ 🏆 Kontribusi: +${v.contrib} Pts | ✨ Guild Exp: +${v.reward.exp}\n\n`
    })
    list += `*Cara Pilih:* ${usedPrefix}${command} [nomor]`
    
    return sendRpgMsg(conn, m, list, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg')
  }

  let index = parseInt(text) - 1
  if (!missions[index]) return m.reply('❌ Nomor misi tidak valid.')
  let msn = missions[index]

  let cooldown = 120000 
  if (Date.now() - (myGuild.lastMission || 0) < cooldown) {
    let sisa = ((cooldown - (Date.now() - myGuild.lastMission)) / 1000).toFixed(0)
    return m.reply(`⏳ Guild sedang cooldown. Sisa: ${sisa} detik lagi.`)
  }

  let user = wdb.users[m.sender].rpg
  if (user.level < msn.minLevel) return m.reply(`❌ Butuh Player Lv.${msn.minLevel} untuk misi ini.`)

  // Inisialisasi jika data korup/null
  if (typeof myGuild.exp !== 'number') myGuild.exp = 0
  if (typeof myGuild.level !== 'number') myGuild.level = 1
  if (!myGuild.contribution) myGuild.contribution = {}

  // UPDATE DATA INTI
  myGuild.contribution[m.sender] = (myGuild.contribution[m.sender] || 0) + msn.contrib
  myGuild.exp += msn.reward.exp // Mengambil nilai exp dari reward misi
  myGuild.lastMission = Date.now()

  // Distribusi Hadiah
  myGuild.members.forEach(jid => {
    let u = wdb.users[jid]?.rpg
    if (u) {
      wdb.money[jid] = (wdb.money[jid] || 0) + msn.reward.money
      if (msn.reward.iron) u.iron = (u.iron || 0) + msn.reward.iron
      if (msn.reward.gold) u.gold = (u.gold || 0) + msn.reward.gold
      if (msn.reward.stone) u.stone = (u.stone || 0) + msn.reward.stone
      if (msn.reward.diamond) u.diamond = (u.diamond || 0) + msn.reward.diamond
    }
  })

  // LOGIKA LEVEL UP
  let nextExp = myGuild.level * 1000
  while (myGuild.exp >= nextExp) {
    myGuild.level += 1
    myGuild.exp -= nextExp
    nextExp = myGuild.level * 1000
    conn.reply(m.chat, `🎊 *GUILD LEVEL UP!* \nGuild *${myGuild.name}* sekarang mencapai Level *${myGuild.level}*!`, m)
  }

  // Simpan kembali ke database pusat
  wdb.guilds[guildName] = myGuild
  saveDB(wdb)

  let cap = `*───「 GUILD MISSION CLEAR 」───*\n\n`
  cap += `📜 *Misi:* ${msn.name}\n`
  cap += `👤 *Eksekutor:* @${m.sender.split('@')[0]}\n`
  cap += `✨ *Guild Exp:* +${msn.reward.exp}\n`
  cap += `🏆 *Kontribusi:* +${msn.contrib} Pts\n\n`
  cap += `🎁 *HADIAH SEMUA MEMBER:* \n`
  cap += `• 💰 Money: +Rp ${msn.reward.money.toLocaleString()}\n`
  if (msn.reward.diamond) cap += `• 💎 Diamond: +${msn.reward.diamond}`

  return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg', { contextInfo: { mentionedJid: [m.sender] } })
}

handler.help = ['misiguild']
handler.tags = ['rpg']
handler.command = ['misiguild']

export default handler