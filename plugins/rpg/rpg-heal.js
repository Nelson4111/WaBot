import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './rpg-bank.js'
import { getDifficultyDeathHealCooldownRemaining, scaleDifficultyHealingCost } from '../../lib/rpgDifficulty.js'
import { sendRpgConfirmButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'

const HEAL_OFFER_TTL = 5 * 60 * 1000

function getHealDetails(user) {
  if (!user.maxDarahBonus) user.maxDarahBonus = 0
  if (user.darah == null) user.darah = 100
  if (!Array.isArray(user.riwayat)) user.riwayat = []

  const maxHP = 100 + (Number(user.armor) || 0) * 20 + Number(user.maxDarahBonus || 0)
  const missingHP = Math.max(0, maxHP - Number(user.darah || 0))
  const cost = scaleDifficultyHealingCost(user, missingHP * 1000)
  return { maxHP, missingHP, cost }
}

function getHealPayment(payer, cost) {
  const tier = BANK_TIERS[Number(payer.bankTier)] || BANK_TIERS[0]
  const insurance = Number(tier.asuransi) || 0
  return {
    amount: Math.floor(cost * (1 - insurance)),
    insurance
  }
}

function applyHeal(db, payerJid, payer, target, details, payment) {
  const wallet = Number(db.money[payerJid]) || 0
  if (wallet >= payment.amount) {
    db.money[payerJid] = wallet - payment.amount
  } else if (Number(payer.bank) >= payment.amount && !payer.kartuBeku) {
    payer.bank -= payment.amount
    payer.riwayat ||= []
    payer.riwayat.unshift(`-Rp ${payment.amount.toLocaleString()} Biaya Heal`)
    payer.riwayat.length = Math.min(payer.riwayat.length, 20)
  } else {
    return false
  }

  target.darah = details.maxHP
  return true
}

function formatHealSuccess(details, payment) {
  return `╭─❏「 🏥 HEAL SUCCESS 」❏\n` +
    `│ ❤️ *PULIH TOTAL*\n` +
    `│ ❤️ HP : ${details.maxHP}/${details.maxHP}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📋 *DETAIL HEAL*\n` +
    `> ↳ 💰 Biaya Awal : Rp ${details.cost.toLocaleString()}\n` +
    `> ↳ 🛡️ Asuransi : ${(payment.insurance * 100).toFixed(0)}%\n` +
    `> ↳ 💸 Yang Dibayar : Rp ${payment.amount.toLocaleString()}\n\n` +
    `─━━━━━━━━━━━━━━─`
}

let handler = async (m, { conn, usedPrefix, text = '' }) => {
  const wdb = loadDB()
  const args = text.trim().split(/\s+/).filter(Boolean)
  const action = String(args[0] || '').toLowerCase()
  const selfOnly = ['me', 'self', 'diri'].includes(action)
  const prefix = usedPrefix || '.'
  const payer = getUserRPG(wdb, m.sender)?.rpg

  if (!payer) {
    return sendRpgRegistrationPrompt(conn, m, prefix, '❌ Kamu belum memiliki data RPG.')
  }

  if (action === 'accept' || action === 'decline') {
    const offerId = args[1]
    const target = payer
    const offers = target.pendingHealOffers
    const offer = offers?.[offerId]
    if (!offer || Number(offer.expiresAt) <= Date.now()) {
      if (offer && offers) {
        delete offers[offerId]
        await saveDB(wdb)
      }
      return m.reply('❌ Penawaran heal ini sudah tidak berlaku.')
    }

    delete offers[offerId]
    if (action === 'decline') {
      await saveDB(wdb)
      return m.reply('↩️ Penawaran heal berhasil ditolak.')
    }

    const payerJid = offer.payerJid
    const payerAccount = getUserRPG(wdb, payerJid)?.rpg
    if (!payerAccount) {
      await saveDB(wdb)
      return m.reply('❌ Pengirim penawaran sudah tidak memiliki data RPG.')
    }

    const healLock = getDifficultyDeathHealCooldownRemaining(target)
    if (healLock > 0) {
      await saveDB(wdb)
      return m.reply(`💀 Kamu perlu memulihkan diri dulu. Bisa di-heal lagi dalam *${Math.ceil(healLock / 60000)} menit*.`)
    }

    const details = getHealDetails(target)
    if (details.missingHP <= 0) {
      await saveDB(wdb)
      return m.reply(`❤️ HP kamu sudah penuh (${details.maxHP}/${details.maxHP}).`)
    }

    const payment = getHealPayment(payerAccount, details.cost)
    if (!applyHeal(wdb, payerJid, payerAccount, target, details, payment)) {
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 ❌ HEAL GAGAL 」❏\n` +
        `│ Pengirim tidak memiliki saldo yang cukup untuk membayar heal.\n` +
        `> ↳ Biaya : Rp ${payment.amount.toLocaleString()}\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    await saveDB(wdb)
    return m.reply(formatHealSuccess(details, payment))
  }

  const targetJid = selfOnly ? null : m.mentionedJid?.[0] || m.quoted?.sender
  const decodedSender = typeof conn.decodeJid === 'function' ? conn.decodeJid(m.sender) : m.sender
  const decodedTarget = targetJid
    ? (typeof conn.decodeJid === 'function' ? conn.decodeJid(targetJid) : targetJid)
    : null
  const botJid = conn.user?.jid || conn.user?.id
  const decodedBot = botJid
    ? (typeof conn.decodeJid === 'function' ? conn.decodeJid(botJid) : botJid)
    : null
  if (decodedTarget && decodedBot && decodedTarget === decodedBot) {
    return m.reply(`🤖 Bot tidak bisa menjadi target heal. Gunakan *${prefix}heal me* untuk memulihkan diri sendiri, atau tag/reply pengguna lain.`)
  }
  if (decodedTarget && decodedTarget !== decodedSender) {
    const target = getUserRPG(wdb, decodedTarget)?.rpg
    if (!target) return m.reply('❌ Target belum memiliki data RPG.')

    const healLock = getDifficultyDeathHealCooldownRemaining(target)
    if (healLock > 0) return m.reply(`💀 Target perlu memulihkan diri dulu. Bisa di-heal lagi dalam *${Math.ceil(healLock / 60000)} menit*.`)

    const details = getHealDetails(target)
    if (details.missingHP <= 0) return m.reply(`❤️ HP target sudah penuh (${details.maxHP}/${details.maxHP}).`)

    const payment = getHealPayment(payer, details.cost)
    const wallet = Number(wdb.money[m.sender]) || 0
    if (wallet < payment.amount && ((Number(payer.bank) || 0) < payment.amount || payer.kartuBeku)) {
      return m.reply(
        `❌ Saldo kamu tidak cukup untuk menawarkan heal.\n` +
        `> ↳ Biaya : Rp ${payment.amount.toLocaleString()}`
      )
    }

    if (!target.pendingHealOffers || typeof target.pendingHealOffers !== 'object') {
      target.pendingHealOffers = {}
    }
    for (const [id, offer] of Object.entries(target.pendingHealOffers)) {
      if (Number(offer?.expiresAt) <= Date.now() || offer?.payerJid === m.sender) {
        delete target.pendingHealOffers[id]
      }
    }
    const existingOffers = Object.entries(target.pendingHealOffers)
      .sort(([, first], [, second]) => Number(first?.expiresAt) - Number(second?.expiresAt))
    while (existingOffers.length >= 10) {
      const [oldestId] = existingOffers.shift()
      delete target.pendingHealOffers[oldestId]
    }
    const offerId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
    target.pendingHealOffers[offerId] = {
      payerJid: m.sender,
      expiresAt: Date.now() + HEAL_OFFER_TTL
    }
    await saveDB(wdb)
    return sendRpgConfirmButtons(conn, m, {
      text:
        `╭─❏「 💖 PENAWARAN HEAL 」❏\n` +
        `│ @${decodedTarget.split('@')[0]} ditawari pemulihan HP\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ HP saat ini : ${target.darah}/${details.maxHP}\n` +
        `> ↳ Biaya yang dibayar pengirim : Rp ${payment.amount.toLocaleString()}\n` +
        `> ↳ Penawaran berlaku 5 menit.\n\n` +
        `Pilih konfirmasi untuk menerima heal atau batalkan penawaran.`,
      title: '💖 TERIMA PENAWARAN HEAL',
      subtitle: 'Pengirim akan membayar biaya pemulihanmu',
      acceptText: '💖 Terima Heal',
      acceptCommand: `${prefix}heal accept ${offerId}`,
      cancelText: '↩️ Tolak Heal',
      cancelCommand: `${prefix}heal decline ${offerId}`,
      mentions: [decodedTarget],
      noThumbnail: true,
      noHeader: true
    })
  }

  if (!selfOnly && !targetJid) {
    return m.reply(
      `Untuk memulihkan diri sendiri, gunakan *${prefix}heal me*. Untuk menawarkan heal ke orang lain, tag atau reply pesannya.`
    )
  }

  const healLock = getDifficultyDeathHealCooldownRemaining(payer)
  if (healLock > 0) return m.reply(`💀 Kamu perlu memulihkan diri dulu. Bisa di-heal lagi dalam *${Math.ceil(healLock / 60000)} menit*.`)

  const details = getHealDetails(payer)
  if (details.missingHP <= 0) {
    return m.reply(
      `╭─❏「 ❤️ HEAL 」❏\n` +
      `│ ❤️ *DARAH SUDAH PENUH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ HP : *${payer.darah}/${details.maxHP} HP*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const payment = getHealPayment(payer, details.cost)
  if (!applyHeal(wdb, m.sender, payer, payer, details, payment)) {
    return m.reply(
      `╭─❏「 ❌ HEAL GAGAL 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP!*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📋 *DETAIL BIAYA*\n` +
      `> ↳ ❤️ Butuh : +${details.missingHP} HP\n` +
      `> ↳ 💰 Biaya : Rp ${details.cost.toLocaleString()}\n` +
      `> ↳ 🛡️ Asuransi : ${(payment.insurance * 100).toFixed(0)}%\n` +
      `> ↳ 💸 Bayar : Rp ${payment.amount.toLocaleString()}\n` +
      `> ↳ 💵 Uangmu : Rp ${(Number(wdb.money[m.sender]) || 0).toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  await saveDB(wdb)
  return m.reply(formatHealSuccess(details, payment))
}

handler.help = ['heal me', 'heal @tag', 'heal reply']
handler.tags = ['rpg']
handler.command = ['heal']
export default handler
