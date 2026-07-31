import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
let handler = async (m) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]
  
  let cooldown = 86400000 // 24 Jam
  if (Date.now() - (user.lastDaily || 0) < cooldown) {
    let sisa = (cooldown - (Date.now() - user.lastDaily)) / 3600000
    return m.reply(`Kamu sudah mengambil hadiah hari ini. Tunggu ${sisa.toFixed(1)} jam lagi.`)
  }

  let hadiah = 50000
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hadiah
  user.lastDaily = Date.now()
  
  saveDB(wdb)
  m.reply(`🎁 Hadiah harian diklaim! Kamu mendapatkan *Rp ${hadiah.toLocaleString()}*`)
}

handler.help = ['daily']
handler.tags = ['rpg']
handler.command = ['daily']
export default handler