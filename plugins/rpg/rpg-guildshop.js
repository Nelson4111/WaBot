import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let myGuild = Object.values(wdb.guilds || {}).find(g => g.leader === m.sender)
  if (!myGuild) return m.reply('❌ Hanya Leader Guild yang bisa akses.')

  let totalPoints = Object.values(myGuild.contribution || {}).reduce((a, b) => a + b, 0)

  if (!text) {
    let cap = `*──「 GUILD SHOP 」──*\n\n`
    cap += `📊 *Total Poin Guild:* ${totalPoints} Pts\n\n`
    cap += `1. *Buff Attack* (500 Pts)\n2. *Buff Defense* (500 Pts)\n\n`
    cap += `_Gunakan ${usedPrefix}${command} [angka]_`
    
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')
  }

  if (totalPoints < 500) return m.reply('❌ Poin tidak cukup.')
  
  if (text === '1') {
    myGuild.contribution[m.sender] -= 500
    myGuild.buffAttack = Date.now() + 86400000
    saveDB(wdb)
    m.reply('✅ Buff Attack Aktif (24 Jam)!')
  } else if (text === '2') {
    myGuild.contribution[m.sender] -= 500
    myGuild.buffDefense = Date.now() + 86400000
    saveDB(wdb)
    m.reply('✅ Buff Defense Aktif (24 Jam)!')
  }
}

handler.help = ['guildshop']
handler.tags = ['rpg']
handler.command = ['guildshop']
export default handler