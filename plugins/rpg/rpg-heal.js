import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
let handler = async (m, { conn, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')

  // LOGIKA MAX HP (Sesuai dengan level Armor)
  let armorLvl = user.armor || 0
  let maxHP = 100 + (armorLvl * 20)
  
  // Cek jika darah sudah penuh
  if (user.darah >= maxHP) {
    return m.reply(`❤️ Darahmu sudah penuh! (*${user.darah}/${maxHP} HP*)`)
  }

  // HITUNG BIAYA (Setiap 10 HP = 10k, artinya 1 HP = 1k)
  let butuhHP = maxHP - user.darah
  let biaya = butuhHP * 1000 

  // Validasi Uang
  if ((wdb.money[m.sender] || 0) < biaya) {
    return m.reply(`❌ Uang tidak cukup! \n❤️ Butuh: +${butuhHP} HP\n💰 Biaya: Rp ${biaya.toLocaleString()}\n💵 Uangmu: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}`)
  }

  // PROSES HEAL
  wdb.money[m.sender] -= biaya
  user.darah = maxHP // Langsung Set ke Max HP

  saveDB(wdb)

  let cap = `*───「 HEAL SUCCESS 」───*\n\n`
  cap += `🏥 *Status Kesehatan:* Pulih Total!\n`
  cap += `❤️ *HP Sekarang:* ${user.darah} / ${maxHP}\n`
  cap += `💰 *Biaya:* Rp ${biaya.toLocaleString()}\n\n`
  cap += `_Sekarang kamu siap untuk masuk ke Dungeon lagi!_`

  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')

  return sendRpgMsg(conn, m, cap, pp)
}

handler.help = ['heal']
handler.tags = ['rpg']
handler.command = ['heal']

export default handler