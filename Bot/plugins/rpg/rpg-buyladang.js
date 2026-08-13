import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)

  let currentLadang = user.maxLadang || 1
  if (currentLadang >= 10) return m.reply('❌ Kamu sudah mencapai batas maksimal 10 ladang.')

  let hargaSewa = currentLadang * 500000
  if ((wdb.money[m.sender] || 0) < hargaSewa) {
    return m.reply(`❌ Uang tidak cukup. Harga ladang ke-${currentLadang + 1} adalah Rp ${hargaSewa.toLocaleString()}`)
  }

  wdb.money[m.sender] -= hargaSewa
  user.maxLadang = currentLadang + 1
  saveDB(wdb)
  return m.reply(`✅ Berhasil membeli ladang baru!\nKapasitas sekarang: *${user.maxLadang} Slot*.\nHarga upgrade berikutnya: *Rp ${(user.maxLadang * 500000).toLocaleString()}*`)
}
handler.help = ['buyladang']
handler.tags = ['rpg']
handler.command = /^(buyladang)$/i
handler.group = true
export default handler