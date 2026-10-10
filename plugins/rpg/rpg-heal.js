import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './rpg-bank.js'
import { scaleDifficultyHealingCost } from '../../lib/rpgDifficulty.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'

global.healRequests = global.healRequests || {}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const wdb = loadDB()
  const action = (text || '').trim().toLowerCase()

  if (action === 'terima' || action === 'tolak') {
    const request = global.healRequests[m.sender]

    if (!request) {
      return m.reply(
        `╭─❏「 ❌ HEAL 」❏\n` +
        `│ ❌ *Tidak ada permintaan heal yang masuk.*\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    if (Date.now() > request.expire) {
      delete global.healRequests[m.sender]
      return m.reply(
        `╭─❏「 ❌ HEAL 」❏\n` +
        `│ ❌ *Permintaan heal sudah kedaluwarsa.*\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    if (action === 'tolak') {
      delete global.healRequests[m.sender]

      return m.reply(
        `╭─❏「 ❌ HEAL DITOLAK 」❏\n` +
        `│ ❌ *PERMINTAAN HEAL DITOLAK*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Permintaan heal dari @${request.from.split('@')[0]} ditolak.\n\n` +
        `─━━━━━━━━━━━━━━─`,
        null,
        { mentions: [request.from] }
      )
    }

    const user = getUserRPG(wdb, m.sender).rpg

    if (!user) {
      return m.reply(
        `╭─❏「 ❌ DATA RPG 」❏\n` +
        `│ ❌ *Kamu belum memiliki data RPG.*\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    if (!user.maxDarahBonus) user.maxDarahBonus = 0
    if (user.darah == null) user.darah = 100
    if (!user.riwayat) user.riwayat = []

    const maxHP = 100 + ((user.armor || 0) * 20) + user.maxDarahBonus
    const butuhHP = maxHP - user.darah

    if (butuhHP <= 0) {
      delete global.healRequests[m.sender]

      return m.reply(
        `╭─❏「 ❤️ HEAL 」❏\n` +
        `│ ❤️ *DARAH SUDAH PENUH*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Darahmu sudah penuh, permintaan heal dibatalkan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const biaya = scaleDifficultyHealingCost(user, butuhHP * 1000)
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

      return m.reply(
        `╭─❏「 ❌ HEAL GAGAL 」❏\n` +
        `│ ❌ *UANG TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Biaya : Rp ${biayaBayar.toLocaleString()}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    user.darah = maxHP
    delete global.healRequests[m.sender]
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🏥 HEAL BERHASIL 」❏\n` +
      `│ ❤️ *${user.darah}/${maxHP} HP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *DETAIL HEAL*\n` +
      `> ↳ 🏥 Menerima heal dari @${request.from.split('@')[0]}\n` +
      `> ↳ 💸 Biaya : Rp ${biayaBayar.toLocaleString()}\n` +
      `> ↳ ❤️ Status : Pulih penuh\n\n` +
      `─━━━━━━━━━━━━━━─`,
      null,
      { mentions: [m.sender, request.from] }
    )
  }

  const target = m.mentionedJid?.[0] || m.quoted?.sender

  if (target) {
    if (target === m.sender) {
      return m.reply(
        `╭─❏「 ❌ FORMAT HEAL 」❏\n` +
        `│ ❌ *Tidak bisa heal diri sendiri dengan tag/reply.*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Untuk heal diri sendiri, gunakan *${usedPrefix}heal* tanpa tag atau reply.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const targetUser = getUserRPG(wdb, target).rpg

    if (!targetUser) {
      return m.reply(
        `╭─❏「 ❌ DATA RPG 」❏\n` +
        `│ ❌ *Target belum memiliki data RPG.*\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    global.healRequests[target] = {
      from: m.sender,
      expire: Date.now() + RPG_CONFIRMATION_TTL
    }

    return m.reply(
      `╭─❏「 🏥 HEAL REQUEST 」❏\n` +
      `│ 🏥 *PERMINTAAN HEAL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `👤 *INFORMASI*\n` +
      `> ↳ ${'@' + m.sender.split('@')[0]} menawarkan heal kepada @${target.split('@')[0]}.\n\n` +

      `📌 *RESPON TARGET*\n` +
      `> ↳ Terima : *${usedPrefix}${command} terima*\n` +
      `> ↳ Tolak : *${usedPrefix}${command} tolak*\n` +
      `> ↳ Biaya akan dibayar target jika diterima.\n` +
      `> ↳ Permintaan berlaku 5 menit.\n\n` +

      `─━━━━━━━━━━━━━━─`,
      null,
      { mentions: [m.sender, target] }
    )
  }

  let user = getUserRPG(wdb, m.sender).rpg

  if (!user) {
    return m.reply(
      `╭─❏「 ❌ DATA RPG 」❏\n` +
      `│ ❌ *Kamu belum memiliki data RPG.*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

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