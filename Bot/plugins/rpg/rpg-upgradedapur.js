import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.dapur) user.dapur = { slot: 1, antrian: [] }
  if(user.dapur.slot >= 10) return m.reply('❌ Dapur kamu sudah mentok level 10!')

  let harga = user.dapur.slot * 5000000
  let userMoney = wdb.money[m.sender] || 0
  if(userMoney < harga) return m.reply(`❌ Uang kurang! Upgrade ke slot ${user.dapur.slot + 1} butuh Rp ${harga.toLocaleString()}`)

  wdb.money[m.sender] -= harga
  user.dapur.slot += 1
  saveDB(wdb)

  let cap = `✅ *DAPUR DIUPGRADE!*\n\nSlot baru: ${user.dapur.slot}/10\nBiaya: Rp ${harga.toLocaleString()}\nUpgrade berikutnya: Rp ${(user.dapur.slot * 5000000).toLocaleString()}`
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}
handler.help = ['upgradedapur']
handler.tags = ['rpg']
handler.command = /^(upgradedapur)$/i
handler.group = true
export default handler