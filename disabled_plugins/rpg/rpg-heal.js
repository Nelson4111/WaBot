import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './rpg-bank.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = getUserRPG(wdb, m.sender).rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')

  if(!user.maxDarahBonus) user.maxDarahBonus = 0
  if(!user.darah) user.darah = 100
  if(!user.riwayat) user.riwayat = []

  let armorLvl = user.armor || 0
  let maxHP = 100 + (armorLvl * 20) + user.maxDarahBonus // SAMA KAYA GYM & DUNGEON

  if (user.darah >= maxHP) {
    return m.reply(`❤️ Darahmu sudah penuh! (*${user.darah}/${maxHP} HP*)`)
  }

  let butuhHP = maxHP - user.darah
  let biaya = butuhHP * 1000
  let tier = BANK_TIERS[user.bankTier || 0]
  let asuransi = tier.asuransi || 0
  let biayaBayar = Math.floor(biaya * (1 - asuransi))

  // Prioritas: uang saku dulu, baru bank
  if ((wdb.money[m.sender] || 0) >= biayaBayar) {
    wdb.money[m.sender] -= biayaBayar
  } else if (user.bank >= biayaBayar &&!user.kartuBeku) {
    user.bank -= biayaBayar
    user.riwayat.unshift(`-Rp ${biayaBayar.toLocaleString()} Biaya Heal`)
  } else {
    return m.reply(`❌ Uang tidak cukup! \n❤️ Butuh: +${butuhHP} HP\n💰 Biaya: Rp ${biaya.toLocaleString()}\n🛡️ Asuransi: ${(asuransi*100).toFixed(0)}%\n💸 Bayar: Rp ${biayaBayar.toLocaleString()}\n💵 Uangmu: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}`)
  }

  user.darah = maxHP
  saveDB(wdb)

  let cap = `*───「 HEAL SUCCESS 」───*\n\n`
  cap += `🏥 *Status Kesehatan:* Pulih Total!\n`
  cap += `❤️ *HP Sekarang:* ${user.darah} / ${maxHP}\n`
  cap += `💰 *Biaya Awal:* Rp ${biaya.toLocaleString()}\n`
  cap += `🛡️ *Asuransi:* ${(asuransi*100).toFixed(0)}%\n`
  cap += `💸 *Yang Dibayar:* Rp ${biayaBayar.toLocaleString()}\n\n`
  cap += `_Sekarang kamu siap untuk masuk ke Dungeon lagi!_`

  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')

  return sendRpgMsg(conn, m, cap, pp)
}

handler.help = ['heal']
handler.tags = ['rpg']
handler.command = ['heal']
export default handler
