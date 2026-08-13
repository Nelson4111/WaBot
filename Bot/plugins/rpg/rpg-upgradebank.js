import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './rpg-bank.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if (user.bankTier === undefined) user.bankTier = 0
  let currentTier = BANK_TIERS[user.bankTier]
  let nextTier = BANK_TIERS[user.bankTier + 1]
  let action = text?.toLowerCase().split(' ')[0]

  if (action === 'beli') {
    if (!nextTier) return m.reply(`🏆 Sudah tier tertinggi: *${currentTier.name}*`)
    if ((wdb.money[m.sender] || 0) < nextTier.price) return m.reply(`❌ Uang tidak cukup! Butuh Rp ${nextTier.price.toLocaleString()}`)
    wdb.money[m.sender] -= nextTier.price; user.bankTier += 1; user.kartuBeku = false; saveDB(wdb)
    return m.reply(`🎉 *UPGRADE BERHASIL!*\n${nextTier.color} *${nextTier.name}*\nLimit: Rp ${nextTier.limit.toLocaleString()}`)
  }

  let cap = `╭──「 💳 UPGRADE BANK 」──╮\n`
  cap += `│ ${currentTier.color} ${currentTier.name}\n`
  cap += `│ Limit: Rp ${currentTier.limit.toLocaleString()}\n`
  cap += `│ Bunga: ${currentTier.bunga}%/minggu\n`
  cap += `│ Asuransi: ${(currentTier.asuransi*100).toFixed(0)}%\n`
  cap += `│ Biaya Bulanan: Rp ${currentTier.biayaBulanan.toLocaleString()}\n`
  cap += `│ Keamanan: ${currentTier.fasilitas.find(f=>f.includes('Penjaga'))}\n`
  cap += `│ Fasilitas:\n`
  currentTier.fasilitas.forEach(f => cap += `│ • ${f}\n`)
  cap += `╰───────────────────╯\n\n`
  if(nextTier) cap += `*NEXT: ${nextTier.color} ${nextTier.name}*\nHarga: Rp ${nextTier.price.toLocaleString()}\nBiaya/Bulan: Rp ${nextTier.biayaBulanan.toLocaleString()}\nKetik *${usedPrefix}upgradebank beli*`
  else cap += `🏆 Kamu sudah di tier tertinggi`
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i187/11piK9')
}
handler.command = ['upgradebank']; export default handler