import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './rpg-bank.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if (user.bankTier === undefined) user.bankTier = 0

  let args = text?.toLowerCase().split(' ') || []
  let action = args[0]
  let currentTier = BANK_TIERS[user.bankTier]

  // UPGRADE LANGSUNG PAKE ANGKA.upgradebank 5
  if(!isNaN(action)) {
    let targetTier = parseInt(action)
    if(!BANK_TIERS[targetTier]) return m.reply(`❌ Tier ${targetTier} tidak ada`)
    if(targetTier <= user.bankTier) return m.reply(`❌ Kamu sudah di tier ${currentTier.name} atau lebih tinggi`)
    if(targetTier > user.bankTier + 1) return m.reply(`❌ Harus upgrade berurutan. Tier kamu: ${user.bankTier} → ${user.bankTier + 1}`)

    let tierBaru = BANK_TIERS[targetTier]
    if ((wdb.money[m.sender] || 0) < tierBaru.price)
      return m.reply(`❌ Uang tidak cukup!\nButuh: Rp ${tierBaru.price.toLocaleString()}\nPunya: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}`)

    wdb.money[m.sender] -= tierBaru.price
    user.bankTier = targetTier
    user.kartuBeku = false
    saveDB(wdb)
    return m.reply(`🎉 *UPGRADE BERHASIL!*\n${tierBaru.color} *${tierBaru.name}*\nLimit: Rp ${tierBaru.limit.toLocaleString()}\nSisa Uang: Rp ${wdb.money[m.sender].toLocaleString()}`)
  }

  // UPGRADE NEXT.upgradebank beli
  if (action === 'beli') {
    let nextTier = BANK_TIERS[user.bankTier + 1]
    if (!nextTier) return m.reply(`🏆 Sudah tier tertinggi: *${currentTier.name}*`)
    if ((wdb.money[m.sender] || 0) < nextTier.price)
      return m.reply(`❌ Uang tidak cukup! Butuh Rp ${nextTier.price.toLocaleString()}`)

    wdb.money[m.sender] -= nextTier.price
    user.bankTier += 1
    user.kartuBeku = false
    saveDB(wdb)
    return m.reply(`🎉 *UPGRADE BERHASIL!*\n${nextTier.color} *${nextTier.name}*\nLimit: Rp ${nextTier.limit.toLocaleString()}`)
  }

  // MENU INFO
  let nextTier = BANK_TIERS[user.bankTier + 1]
  let cap = `╭──「 💳 UPGRADE BANK 」──╮\n`
  cap += `│ ${currentTier.color} ${currentTier.name} [Lv.${user.bankTier}]\n`
  cap += `│ Limit: Rp ${currentTier.limit.toLocaleString()}\n`
  cap += `│ Bunga: ${(currentTier.bunga*100).toFixed(2)}%/minggu\n`
  cap += `│ Asuransi: ${(currentTier.asuransi*100).toFixed(0)}%\n`
  cap += `│ Biaya Bulanan: Rp ${currentTier.biayaBulanan.toLocaleString()}\n`
  cap += `│ Keamanan: ${currentTier.fasilitas.find(f=>f.includes('Penjaga'))}\n`
  cap += `│ Fasilitas:\n`
  currentTier.fasilitas.forEach(f => cap += `│ • ${f}\n`)
  cap += `╰───────────────────╯\n\n`

  if(nextTier) {
    cap += `*NEXT: ${nextTier.color} ${nextTier.name} [Lv.${user.bankTier + 1}]*\n`
    cap += `Harga: Rp ${nextTier.price.toLocaleString()}\n`
    cap += `Biaya/Bulan: Rp ${nextTier.biayaBulanan.toLocaleString()}\n\n`
    cap += `Ketik: *${usedPrefix}upgradebank beli*\n`
    cap += `Atau: *${usedPrefix}upgradebank ${user.bankTier + 1}*`
  } else {
    cap += `🏆 Kamu sudah di tier tertinggi: ${currentTier.name}`
  }
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i187/11piK9')
}
handler.help = ['upgradebank [angka/beli]']
handler.tags = ['rpg']
handler.command = ['upgradebank']
handler.group = false
export default handler
