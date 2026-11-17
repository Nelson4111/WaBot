import { sendRpgButtons, sendRpgConfirmButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB, sendRpgMsg, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS, formatBankLimit, formatBankTierFacility, getBankEffectiveSecurity, getBankPrice, isPremiumUser } from './rpg-bank.js'
import { applyBankTierRewards } from '../../lib/rpg-bankData.js'
import {
  compareRpgMoney,
  formatRpgMoney,
  maxRpgMoney,
  normalizeRpgMoney,
  subtractRpgMoney
} from '../../lib/rpgMoney.js'

export function formatUpgradeChanges(tier, tierLevel, previousTier) {
  const changedFacilities = tier.fasilitas
    .filter(facility => !previousTier.fasilitas.includes(facility))
    .map(facility => formatBankTierFacility(facility, tierLevel))
    .filter(facility => / (◆ NEW|▲ UP)$/.test(facility))
  return `📌 *FASILITAS BARU & PENINGKATAN*\n` +
    `> 🛡️ Keamanan Lv.${getBankEffectiveSecurity(tier)} ▲ UP\n` +
    `${changedFacilities.length ? changedFacilities.map(facility => `> • ${facility}`).join('\n') : '> • Tidak ada fasilitas baru pada tier ini.'}\n\n`
}

export function formatFullTierFacilities(tier, tierLevel) {
  return `🧩 *FASILITAS KARTU*\n` +
    `> 🛡️ Keamanan Lv.${getBankEffectiveSecurity(tier)}${tierLevel > 0 ? ' ▲ UP' : ''}\n` +
    `${tier.fasilitas.map(facility => `> • ${formatBankTierFacility(facility, tierLevel)}`).join('\n')}\n\n`
}

function formatPriceOptions(label, normalPrice, premiumPrice, isPremium) {
  const normal = formatRpgMoney(normalPrice)
  if (!isPremium) return `> ↳ ${label}\n   ${normal}\n`
  return `> ↳ ${label} Normal\n   ${normal}\n> ↳ ${label} Premium\n   ${formatRpgMoney(premiumPrice)}\n`
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = getUserRPG(wdb, m.sender)?.rpg
  if (!user) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG.')
  if (user.bankTier === undefined) user.bankTier = 0

  let args = text?.toLowerCase().trim().split(/\s+/).filter(Boolean) || []
  let action = args[0] || 'beli'
  let confirmArg = (args[1] || '').toLowerCase()
  const isPremium = isPremiumUser(m.sender, wdb)
  let currentTier = BANK_TIERS[user.bankTier]
  const upgradeCommand = `${usedPrefix || '.'}${command === 'bank' ? 'bank upgrade' : 'upgradebank'}`
  const sendUpgradeConfirmation = (text, commandArgs, targetName) => sendRpgConfirmButtons(conn, m, {
    text,
    title: '💳 KONFIRMASI UPGRADE BANK',
    subtitle: `Lanjutkan peningkatan ke ${targetName}?`,
    acceptText: '✨ Upgrade Sekarang',
    acceptCommand: `${upgradeCommand} ${commandArgs} yes`,
    cancelText: '↩️ Batalkan Upgrade',
    cancelCommand: `${upgradeCommand} ${commandArgs} no`,
    footer: 'AVELIA • BANK UPGRADE',
    noThumbnail: true,
    noHeader: true
  })
  const sendUpgradeSuccess = text => BANK_TIERS[user.bankTier + 1]
    ? sendRpgButtons(conn, {
        chat: m.chat,
        message: m,
        text,
        title: '🎉 UPGRADE BANK BERHASIL',
        subtitle: 'Tier baru aktif — lanjutkan pengembangan bankmu',
        footer: 'AVELIA • BANK UPGRADE',
        buttons: [[
          '💳 Upgrade ke Tier Berikutnya',
          `${upgradeCommand} beli`
        ]],
        quoted: m,
        noThumbnail: true,
        noHeader: true,
        reply: fallbackText => m.reply(fallbackText)
      })
    : m.reply(text)

  // UPGRADE LANGSUNG PAKE ANGKA.upgradebank 5
if (!isNaN(action)) {
  let targetTier = parseInt(action)
  if (!BANK_TIERS[targetTier]) {
    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ ❌ *TIER TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tier ${targetTier} tidak ada\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (targetTier <= user.bankTier) {
    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ ❌ *TIER SUDAH TERCAPAI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu sudah di tier ${currentTier.name} atau lebih tinggi\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (targetTier > user.bankTier + 1) {
    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ ❌ *UPGRADE HARUS BERURUTAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tier kamu\n   ${user.bankTier} → ${user.bankTier + 1}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let tierBaru = BANK_TIERS[targetTier]
  let tierBaruPrice = getBankPrice(tierBaru.price, m.sender, wdb)
  let tierBaruNormalPrice = tierBaru.price
  let walletNow = normalizeRpgMoney(wdb.money[m.sender])
  let bankNow = normalizeRpgMoney(user.bank)
  let payFromBank = maxRpgMoney(0, subtractRpgMoney(tierBaruPrice, walletNow))
  let confirmYes = ['yes', 'ya', 'ok', 'confirm'].includes(confirmArg)
  let confirmNo = ['no', 'tidak', 'batal', 'cancel', 'tolak'].includes(confirmArg)

  if (!confirmYes && !confirmNo) {
    if (compareRpgMoney(walletNow, tierBaruPrice) >= 0) {
      return sendUpgradeConfirmation(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ⚠️ *KONFIRMASI UPGRADE*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Target\n   ${tierBaru.color} *${tierBaru.name}*\n` +
        formatUpgradeChanges(tierBaru, targetTier, currentTier) +
        formatPriceOptions('Harga', tierBaruNormalPrice, tierBaruPrice, isPremium) +
        `> ↳ Uang Saku\n   ${formatRpgMoney(walletNow)}\n` +
        `> ↳ Saldo Bank\n   ${formatRpgMoney(bankNow)}\n\n` +
        `Pastikan detail tier dan saldo sebelum melanjutkan.`,
        String(targetTier),
        tierBaru.name
      )
    }

    if (compareRpgMoney(bankNow, payFromBank) >= 0 && compareRpgMoney(payFromBank, 0) > 0) {
      return sendUpgradeConfirmation(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ⚠️ *KONFIRMASI PEMAKAIAN BANK*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Target\n   ${tierBaru.color} *${tierBaru.name}*\n` +
        formatUpgradeChanges(tierBaru, targetTier, currentTier) +
        formatPriceOptions('Harga', tierBaruNormalPrice, tierBaruPrice, isPremium) +
        `> ↳ Uang Saku\n   ${formatRpgMoney(walletNow)}\n` +
        `> ↳ Saldo Bank\n   ${formatRpgMoney(bankNow)}\n` +
        `> ↳ Otomatis pakai bank\n   ${formatRpgMoney(payFromBank)}\n\n` +
        `Pastikan detail tier dan sumber pembayaran sebelum melanjutkan.`,
        String(targetTier),
        tierBaru.name
      )
    }

    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      formatPriceOptions('Harga', tierBaruNormalPrice, tierBaruPrice, isPremium) +
      `> ↳ Punya\n   ${formatRpgMoney(walletNow)}\n` +
      `> ↳ Saldo Bank\n   ${formatRpgMoney(bankNow)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (confirmNo) {
    return m.reply(`╭─❏「 💳 UPGRADE BANK 」❏\n│ ❌ *UPGRADE DIBATALKAN*\n╰─━━━━━━━━━━━━━━─`)
  }

  if (compareRpgMoney(walletNow, tierBaruPrice) >= 0) {
    wdb.money[m.sender] = subtractRpgMoney(walletNow, tierBaruPrice)
  } else {
    let bankNeed = subtractRpgMoney(tierBaruPrice, walletNow)
    if (compareRpgMoney(bankNow, bankNeed) < 0) {
      return m.reply(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        formatPriceOptions('Harga', tierBaruNormalPrice, tierBaruPrice, isPremium) +
        `> ↳ Butuh\n   ${formatRpgMoney(tierBaruPrice)}\n` +
        `> ↳ Uang Saku\n   ${formatRpgMoney(walletNow)}\n` +
        `> ↳ Bank Tersedia\n   ${formatRpgMoney(bankNow)}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    wdb.money[m.sender] = 0
    user.bank = subtractRpgMoney(bankNow, bankNeed)
  }

  user.bankTier = targetTier
  user.kartuBeku = false
  applyBankTierRewards(user)
  await saveDB(wdb)

  return sendUpgradeSuccess(
    `╭─❏「 🎉 UPGRADE BERHASIL 」❏\n` +
    `│ ${tierBaru.color} *${tierBaru.name}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    formatFullTierFacilities(tierBaru, targetTier) +
    `> ↳ Limit\n   ${formatBankLimit(tierBaru.limit)}\n` +
    `> ↳ Sisa Uang\n   ${formatRpgMoney(wdb.money[m.sender] || 0)}\n` +
    `> ↳ Sisa Bank\n   ${formatRpgMoney(user.bank || 0)}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

// UPGRADE NEXT.upgradebank beli
if (action === 'beli') {
  let nextTier = BANK_TIERS[user.bankTier + 1]

  if (!nextTier) {
    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ 🏆 *TIER TERTINGGI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Sudah tier tertinggi\n   *${currentTier.name}*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let nextTierPrice = getBankPrice(nextTier.price, m.sender, wdb)
  let nextTierNormalPrice = nextTier.price
  let walletNow = normalizeRpgMoney(wdb.money[m.sender])
  let bankNow = normalizeRpgMoney(user.bank)
  let payFromBank = maxRpgMoney(0, subtractRpgMoney(nextTierPrice, walletNow))
  let confirmYes = ['yes', 'ya', 'ok', 'confirm'].includes(confirmArg)
  let confirmNo = ['no', 'tidak', 'batal', 'cancel', 'tolak'].includes(confirmArg)

  if (!confirmYes && !confirmNo) {
    if (compareRpgMoney(walletNow, nextTierPrice) >= 0) {
      return sendUpgradeConfirmation(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ⚠️ *KONFIRMASI UPGRADE*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Target\n   ${nextTier.color} *${nextTier.name}*\n` +
        formatUpgradeChanges(nextTier, user.bankTier + 1, currentTier) +
        formatPriceOptions('Harga', nextTierNormalPrice, nextTierPrice, isPremium) +
        `> ↳ Uang Saku\n   ${formatRpgMoney(walletNow)}\n` +
        `> ↳ Saldo Bank\n   ${formatRpgMoney(bankNow)}\n\n` +
        `Pastikan detail tier dan saldo sebelum melanjutkan.`,
        'beli',
        nextTier.name
      )
    }

    if (compareRpgMoney(bankNow, payFromBank) >= 0 && compareRpgMoney(payFromBank, 0) > 0) {
      return sendUpgradeConfirmation(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ⚠️ *KONFIRMASI PEMAKAIAN BANK*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Target\n   ${nextTier.color} *${nextTier.name}*\n` +
        formatUpgradeChanges(nextTier, user.bankTier + 1, currentTier) +
        formatPriceOptions('Harga', nextTierNormalPrice, nextTierPrice, isPremium) +
        `> ↳ Uang Saku\n   ${formatRpgMoney(walletNow)}\n` +
        `> ↳ Saldo Bank\n   ${formatRpgMoney(bankNow)}\n` +
        `> ↳ Otomatis pakai bank\n   ${formatRpgMoney(payFromBank)}\n\n` +
        `Pastikan detail tier dan sumber pembayaran sebelum melanjutkan.`,
        'beli',
        nextTier.name
      )
    }

    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      formatPriceOptions('Harga', nextTierNormalPrice, nextTierPrice, isPremium) +
      `> ↳ Punya\n   ${formatRpgMoney(walletNow)}\n` +
      `> ↳ Saldo Bank\n   ${formatRpgMoney(bankNow)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (confirmNo) {
    return m.reply(`╭─❏「 💳 UPGRADE BANK 」❏\n│ ❌ *UPGRADE DIBATALKAN*\n╰─━━━━━━━━━━━━━━─`)
  }

  if (compareRpgMoney(walletNow, nextTierPrice) >= 0) {
    wdb.money[m.sender] = subtractRpgMoney(walletNow, nextTierPrice)
  } else {
    let bankNeed = subtractRpgMoney(nextTierPrice, walletNow)
    if (compareRpgMoney(bankNow, bankNeed) < 0) {
      return m.reply(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        formatPriceOptions('Harga', nextTierNormalPrice, nextTierPrice, isPremium) +
        `> ↳ Butuh\n   ${formatRpgMoney(nextTierPrice)}\n` +
        `> ↳ Uang Saku\n   ${formatRpgMoney(walletNow)}\n` +
        `> ↳ Bank Tersedia\n   ${formatRpgMoney(bankNow)}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    wdb.money[m.sender] = 0
    user.bank = subtractRpgMoney(bankNow, bankNeed)
  }

  user.bankTier += 1
  user.kartuBeku = false
  applyBankTierRewards(user)
  await saveDB(wdb)

  return sendUpgradeSuccess(
    `╭─❏「 🎉 UPGRADE BERHASIL 」❏\n` +
    `│ ${nextTier.color} *${nextTier.name}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    formatFullTierFacilities(nextTier, user.bankTier + 1) +
    `> ↳ Limit\n   ${formatBankLimit(nextTier.limit)}\n` +
    `> ↳ Sisa Uang\n   ${formatRpgMoney(wdb.money[m.sender] || 0)}\n` +
    `> ↳ Sisa Bank\n   ${formatRpgMoney(user.bank || 0)}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

// MENU INFO
let nextTier = BANK_TIERS[user.bankTier + 1]
let cap = `╭─❏「 💳 UPGRADE BANK 」❏\n`
cap += `│ ${currentTier.color} *${currentTier.name}* [Lv.${user.bankTier}]\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📊 *INFORMASI BANK*\n`
cap += `> ↳ Status\n   ${isPremium ? '👑 Premium (Diskon 25%)' : '👤 User Biasa'}\n`
cap += `> ↳ Limit\n   ${formatBankLimit(currentTier.limit)}\n`
cap += `> ↳ Bunga\n   ${(currentTier.bunga * 100).toFixed(2)}%/minggu\n`
cap += `> ↳ Asuransi\n   ${(currentTier.asuransi * 100).toFixed(0)}%\n`
cap += formatPriceOptions('Biaya Bulanan', currentTier.biayaBulanan, getBankPrice(currentTier.biayaBulanan, m.sender, wdb), isPremium)
cap += `> ↳ Keamanan\n   Lv.${getBankEffectiveSecurity(currentTier)} (${currentTier.fasilitas.find(f => f.includes('Penjaga')) || 'Standar'})\n`
cap += `> ↳ Fasilitas :\n`

currentTier.fasilitas.forEach(f => {
  cap += `> • ${f}\n`
})

cap += `\n─━━━━━━━━━━━━━━─\n\n`

if (nextTier) {
  const nextTierDiscountedPrice = getBankPrice(nextTier.price, m.sender, wdb)
  const nextTierDiscountedFee = getBankPrice(nextTier.biayaBulanan, m.sender, wdb)
  cap += `⬆️ *NEXT TIER*\n`
  cap += `> ↳ Kartu berikutnya\n   ${nextTier.color} *${nextTier.name}* [Lv.${user.bankTier + 1}]\n`
  cap += formatPriceOptions('Harga', nextTier.price, nextTierDiscountedPrice, isPremium)
  cap += formatPriceOptions('Biaya/Bulan', nextTier.biayaBulanan, nextTierDiscountedFee, isPremium)
  cap += `\n`
  cap += `📌 *CARA UPGRADE*\n`
  cap += `> ↳ ${usedPrefix}upgradebank beli\n`
  cap += `> ↳ ${usedPrefix}upgradebank ${user.bankTier + 1}`
} else {
  cap += `🏆 *Kamu sudah di tier tertinggi: ${currentTier.name}*`
}

cap += `\n\n─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i187/11piK9')
}
handler.help = ['upgradebank [angka/beli]', 'bankupgrade', 'bankup', 'upbank']
handler.tags = ['rpg']
handler.command = ['upgradebank', 'bankupgrade', 'bankup', 'upbank']
handler.group = false
export default handler
