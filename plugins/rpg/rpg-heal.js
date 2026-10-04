import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './rpg-bank.js'

global.healRequests = global.healRequests || {}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const wdb = loadDB()
  const action = (text || '').trim().toLowerCase()

  if (action === 'terima' || action === 'tolak') {
    const request = global.healRequests[m.sender]
    if (!request) return m.reply('❌ Tidak ada permintaan heal yang masuk.')
    if (Date.now() > request.expire) {
      delete global.healRequests[m.sender]
      return m.reply('❌ Permintaan heal sudah kedaluwarsa.')
    }
    if (action === 'tolak') {
      delete global.healRequests[m.sender]
      return m.reply(`❌ Permintaan heal dari @${request.from.split('@')[0]} ditolak.`, null, { mentions: [request.from] })
    }

    const user = getUserRPG(wdb, m.sender).rpg
    if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
    if (!user.maxDarahBonus) user.maxDarahBonus = 0
    if (user.darah == null) user.darah = 100
    if (!user.riwayat) user.riwayat = []

    const maxHP = 100 + ((user.armor || 0) * 20) + user.maxDarahBonus
    const butuhHP = maxHP - user.darah
    if (butuhHP <= 0) {
      delete global.healRequests[m.sender]
      return m.reply('❤️ Darahmu sudah penuh, permintaan heal dibatalkan.')
    }

    const biaya = butuhHP * 1000
    const tier = BANK_TIERS[user.bankTier || 0] || BANK_TIERS[0]
    const asuransi = tier.asuransi || 0
    const biayaBayar = Math.floor(biaya * (1 - asuransi))

    if ((wdb.money[m.sender] || 0) >= biayaBayar) {
      wdb.money[m.sender] -= biayaBayar
    } else if (user.bank >= biayaBayar && !user.kartuBeku) {
      user.bank -= biayaBayar
      user.riwayat.unshift(`-Rp ${biayaBayar.toLocaleString()} Biaya Heal`)
    } else {
      delete global.healRequests[m.sender]
      return m.reply(`❌ Uangmu tidak cukup untuk menerima heal. Biaya: Rp ${biayaBayar.toLocaleString()}`)
    }

    user.darah = maxHP
    delete global.healRequests[m.sender]
    saveDB(wdb)
    return m.reply(`✅ @${m.sender.split('@')[0]} menerima heal dari @${request.from.split('@')[0]} dan pulih penuh (${user.darah}/${maxHP} HP).\n💸 Biaya: Rp ${biayaBayar.toLocaleString()}`, null, { mentions: [m.sender, request.from] })
  }

  const target = m.mentionedJid?.[0] || m.quoted?.sender
  if (target) {
    if (target === m.sender) return m.reply('❌ Untuk heal diri sendiri, gunakan *.heal* tanpa tag atau reply.')
    const targetUser = getUserRPG(wdb, target).rpg
    if (!targetUser) return m.reply('❌ Target belum memiliki data RPG.')

    global.healRequests[target] = {
      from: m.sender,
      expire: Date.now() + 60000
    }
    return m.reply(`🏥 @${m.sender.split('@')[0]} menawarkan heal kepada @${target.split('@')[0]}.\nTarget perlu mengetik *${usedPrefix}${command} terima* untuk menerima atau *${usedPrefix}${command} tolak* untuk menolak.\n⏰ Permintaan berlaku 60 detik. Biaya akan dibayar target jika diterima.`, null, { mentions: [m.sender, target] })
  }

  let user = getUserRPG(wdb, m.sender).rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')

  if(!user.maxDarahBonus) user.maxDarahBonus = 0
  if(user.darah == null) user.darah = 100
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

  let cap = `╭─❏「 🏥 HEAL SUCCESS 」❏\n`
cap += `│ ❤️ Status: *Pulih Total*\n`
cap += `│ ❤️ HP: ${user.darah}/${maxHP}\n`
cap += `│ 💰 Biaya Awal: Rp ${biaya.toLocaleString()}\n`
cap += `│ 🛡️ Asuransi: ${(asuransi * 100).toFixed(0)}%\n`
cap += `│ 💸 Yang Dibayar: Rp ${biayaBayar.toLocaleString()}\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`
cap += `📌 *STATUS*\n`
cap += `> ↳ Sekarang kamu siap masuk ke Dungeon lagi!`

return m.reply(cap)
}

handler.help = ['heal']
handler.tags = ['rpg']
handler.command = ['heal']
export default handler
