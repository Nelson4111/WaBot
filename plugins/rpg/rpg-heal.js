import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './rpg-bank.js'
import { getDifficultyDeathHealCooldownRemaining, scaleDifficultyHealingCost } from '../../lib/rpgDifficulty.js'
import { sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'

let handler = async (m, { conn, usedPrefix, text }) => {
  const wdb = loadDB()
  const action = (text || '').trim().toLowerCase()

  if (action || m.mentionedJid?.length) {
    return m.reply(
      `💖 *Heal hanya berlaku untuk karakter kamu sendiri.*\n` +
      `Gunakan *${usedPrefix}heal* tanpa argumen atau tag untuk memulihkan HP-mu.`
    )
  }

  let user = getUserRPG(wdb, m.sender).rpg

  if (!user) {
    return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG.')
  }
  const healLock = getDifficultyDeathHealCooldownRemaining(user)
  if (healLock > 0) return m.reply(`💀 Kamu perlu memulihkan diri dulu. Bisa di-heal lagi dalam *${Math.ceil(healLock / 60000)} menit*.`)

  if (!user.maxDarahBonus) user.maxDarahBonus = 0
  if (user.darah == null) user.darah = 100
  if (!user.riwayat) user.riwayat = []

  let armorLvl = user.armor || 0
  let maxHP = 100 + (armorLvl * 20) + user.maxDarahBonus // SAMA KAYA GYM & DUNGEON

  if (user.darah >= maxHP) {
    return m.reply(
      `╭─❏「 ❤️ HEAL 」❏\n` +
      `│ ❤️ *DARAH SUDAH PENUH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ HP : *${user.darah}/${maxHP} HP*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let butuhHP = maxHP - user.darah
  let biaya = scaleDifficultyHealingCost(user, butuhHP * 1000)
  let tier = BANK_TIERS[user.bankTier || 0]
  let asuransi = tier.asuransi || 0
  let biayaBayar = Math.floor(biaya * (1 - asuransi))

  // Prioritas: uang saku dulu, baru bank
  if ((wdb.money[m.sender] || 0) >= biayaBayar) {
    wdb.money[m.sender] -= biayaBayar
  } else if (user.bank >= biayaBayar && !user.kartuBeku) {
    user.bank -= biayaBayar
    user.riwayat.unshift(`-Rp ${biayaBayar.toLocaleString()} Biaya Heal`)
  } else {
    return m.reply(
      `╭─❏「 ❌ HEAL GAGAL 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP!*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `📋 *DETAIL BIAYA*\n` +
      `> ↳ ❤️ Butuh : +${butuhHP} HP\n` +
      `> ↳ 💰 Biaya : Rp ${biaya.toLocaleString()}\n` +
      `> ↳ 🛡️ Asuransi : ${(asuransi * 100).toFixed(0)}%\n` +
      `> ↳ 💸 Bayar : Rp ${biayaBayar.toLocaleString()}\n` +
      `> ↳ 💵 Uangmu : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  user.darah = maxHP
  saveDB(wdb)

  let cap = `╭─❏「 🏥 HEAL SUCCESS 」❏\n`
  cap += `│ ❤️ *PULIH TOTAL*\n`
  cap += `│ ❤️ HP : ${user.darah}/${maxHP}\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `📋 *DETAIL HEAL*\n`
  cap += `> ↳ 💰 Biaya Awal : Rp ${biaya.toLocaleString()}\n`
  cap += `> ↳ 🛡️ Asuransi : ${(asuransi * 100).toFixed(0)}%\n`
  cap += `> ↳ 💸 Yang Dibayar : Rp ${biayaBayar.toLocaleString()}\n\n`

  cap += `📌 *STATUS*\n`
  cap += `> ↳ Sekarang kamu siap masuk ke Dungeon lagi!\n\n`

  cap += `─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}

handler.help = ['heal']
handler.tags = ['rpg']
handler.command = ['heal']
export default handler