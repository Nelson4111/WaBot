import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.guilds) wdb.guilds = {}

  // Biar semua member bisa buka shop, bukan cuma leader
  let myGuild = Object.values(wdb.guilds).find(g => g.members && g.members.includes(m.sender))
  if (!myGuild) return m.reply('❌ Kamu belum punya Guild.')

  // Init biar aman
  if (!myGuild.contribution) myGuild.contribution = {}
  if (!myGuild.contribution[m.sender]) myGuild.contribution[m.sender] = 0

  let userContrib = myGuild.contribution[m.sender] || 0
  let durasi = 2 * 60 * 60 * 1000 // 2 jam

  if (!text) {
    let cap = `╭──「 🛍️ GUILD SHOP 」──╮\n`
    cap += `│ 📊 *Poin Pribadi:* ${userContrib.toLocaleString()} Pts\n╰───────────────────╯\n\n`
    cap += `╭──「 ITEM BUFF 2 JAM 」──╮\n`
    cap += `│ 1. ⚔️ *Attack* - 500 Pts\n`
    cap += `│ 2. 🛡️ *Defense* - 500 Pts\n`
    cap += `│ 3. 🔮 *Magic* - 500 Pts\n`
    cap += `│ 4. 💊 *Heal* - 700 Pts\n`
    cap += `│ 5. 📈 *Multiplier* - 800 Pts\n`
    cap += `│ 6. 🍀 *Luck* - 900 Pts\n`
    cap += `│ 7. ⚡ *Speed* - 900 Pts\n`
    cap += `╰───────────────────╯\n`
    cap += `_Gunakan ${usedPrefix}${command} [angka]_`

    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')
  }

  const buy = (cost, buff, msg) => {
    if (userContrib < cost) return m.reply(`❌ Poin tidak cukup. Butuh ${cost} Pts, kamu punya ${userContrib} Pts`)

    myGuild.contribution[m.sender] -= cost
    myGuild[buff] = Date.now() + durasi
    saveDB(wdb)
    return m.reply(msg)
  }

  if (text === '1') return buy(500, 'buffAttack', '✅ ⚔️ Buff Attack Aktif (2 Jam)!')
  if (text === '2') return buy(500, 'buffDefense', '✅ 🛡️ Buff Defense Aktif (2 Jam)!')
  if (text === '3') return buy(500, 'buffMagic', '✅ 🔮 Buff Magic Aktif (2 Jam)!')

  if (text === '4') {
    if (userContrib < 700) return m.reply('❌ Poin tidak cukup. Butuh 700 Pts')
    myGuild.contribution[m.sender] -= 700

    // Heal semua member
    myGuild.buffHeal = Date.now() + durasi
    myGuild.members.forEach(jid => {
      let u = wdb.users[jid]?.rpg
      if(u){
        if(!u.maxDarahBonus) u.maxDarahBonus = 0
        let maxHP = 100 + (u.armor || 0) * 20 + u.maxDarahBonus
        let heal = Math.floor(maxHP * 0.3)
        u.darah = Math.min(maxHP, (u.darah || 0) + heal)
      }
    })
    saveDB(wdb)
    return m.reply('✅ 💊 Buff Heal Aktif!\nSemua anggota +30% HP')
  }

  if (text === '5') return buy(800, 'buffMulti', '✅ 📈 Buff Multiplier Aktif (2 Jam)!')
  if (text === '6') return buy(900, 'buffLuck', '✅ 🍀 Buff Luck Aktif (2 Jam)!')
  if (text === '7') return buy(900, 'buffSpeed', '✅ ⚡ Buff Speed Aktif (2 Jam)!')

  return m.reply('❌ Pilihan tidak valid.')
}

handler.help = ['guildshop']
handler.tags = ['rpg']
handler.command = ['guildshop']
export default handler