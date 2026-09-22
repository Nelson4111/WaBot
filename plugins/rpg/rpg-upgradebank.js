import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { BANK_TIERS, getBankPrice, isPremiumUser } from './rpg-bank.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if (user.bankTier === undefined) user.bankTier = 0

  let args = text?.toLowerCase().split(' ') || []
  let action = args[0]
  let confirmArg = (args[1] || '').toLowerCase()
  const isPremium = isPremiumUser(m.sender, wdb)
  let currentTier = BANK_TIERS[user.bankTier]
  let currentTierPrice = getBankPrice(currentTier.price, m.sender, wdb)
  let currentTierNormalPrice = currentTier.price

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
      `> ↳ Tier kamu : ${user.bankTier} → ${user.bankTier + 1}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let tierBaru = BANK_TIERS[targetTier]
  let tierBaruPrice = getBankPrice(tierBaru.price, m.sender, wdb)
  let tierBaruNormalPrice = tierBaru.price
  let walletNow = wdb.money[m.sender] || 0
  let bankNow = user.bank || 0
  let payFromBank = Math.max(0, tierBaruPrice - walletNow)
  let confirmYes = ['yes', 'ya', 'ok', 'confirm'].includes(confirmArg)
  let confirmNo = ['no', 'tidak', 'batal', 'cancel', 'tolak'].includes(confirmArg)

  if (!confirmYes && !confirmNo) {
    if (walletNow >= tierBaruPrice) {
      return m.reply(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ⚠️ *KONFIRMASI UPGRADE*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Target : ${tierBaru.color} *${tierBaru.name}*\n` +
        `> ↳ Harga Normal : Rp ${tierBaruNormalPrice.toLocaleString()}\n` +
        `> ↳ Harga Premium : Rp ${tierBaruPrice.toLocaleString()}\n` +
        `> ↳ Uang Saku : Rp ${walletNow.toLocaleString()}\n` +
        `> ↳ Saldo Bank : Rp ${bankNow.toLocaleString()}\n\n` +
        `Ketik *.upgradebank ${targetTier} yes* untuk lanjut\n` +
        `atau *.upgradebank ${targetTier} no* untuk batal.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (bankNow >= payFromBank && payFromBank > 0) {
      return m.reply(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ⚠️ *KONFIRMASI PEMAKAIAN BANK*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Target : ${tierBaru.color} *${tierBaru.name}*\n` +
        `> ↳ Harga Normal : Rp ${tierBaruNormalPrice.toLocaleString()}\n` +
        `> ↳ Harga Premium : Rp ${tierBaruPrice.toLocaleString()}\n` +
        `> ↳ Uang Saku : Rp ${walletNow.toLocaleString()}\n` +
        `> ↳ Saldo Bank : Rp ${bankNow.toLocaleString()}\n` +
        `> ↳ Otomatis pakai bank : Rp ${payFromBank.toLocaleString()}\n\n` +
        `Ketik *.upgradebank ${targetTier} yes* untuk lanjut\n` +
        `atau *.upgradebank ${targetTier} no* untuk batal.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Harga Normal : Rp ${tierBaruNormalPrice.toLocaleString()}\n` +
      `> ↳ Harga Premium : Rp ${tierBaruPrice.toLocaleString()}\n` +
      `> ↳ Punya : Rp ${walletNow.toLocaleString()}\n` +
      `> ↳ Saldo Bank : Rp ${bankNow.toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (confirmNo) {
    return m.reply(`╭─❏「 💳 UPGRADE BANK 」❏\n│ ❌ *UPGRADE DIBATALKAN*\n╰─━━━━━━━━━━━━━━─`)
  }

  if (walletNow >= tierBaruPrice) {
    wdb.money[m.sender] -= tierBaruPrice
  } else {
    let bankNeed = tierBaruPrice - walletNow
    if (bankNow < bankNeed) {
      return m.reply(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Butuh : Rp ${tierBaruPrice.toLocaleString()}\n` +
        `> ↳ Uang Saku : Rp ${walletNow.toLocaleString()}\n` +
        `> ↳ Bank Tersedia : Rp ${bankNow.toLocaleString()}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    wdb.money[m.sender] = 0
    user.bank -= bankNeed
  }

  user.bankTier = targetTier
  user.kartuBeku = false
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🎉 UPGRADE BERHASIL 」❏\n` +
    `│ ${tierBaru.color} *${tierBaru.name}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Limit : Rp ${tierBaru.limit.toLocaleString()}\n` +
    `> ↳ Sisa Uang : Rp ${wdb.money[m.sender].toLocaleString()}\n` +
    `> ↳ Sisa Bank : Rp ${(user.bank || 0).toLocaleString()}\n\n` +
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
      `> ↳ Sudah tier tertinggi : *${currentTier.name}*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let nextTierPrice = getBankPrice(nextTier.price, m.sender, wdb)
  let nextTierNormalPrice = nextTier.price
  let walletNow = wdb.money[m.sender] || 0
  let bankNow = user.bank || 0
  let payFromBank = Math.max(0, nextTierPrice - walletNow)
  let confirmYes = ['yes', 'ya', 'ok', 'confirm'].includes(confirmArg)
  let confirmNo = ['no', 'tidak', 'batal', 'cancel', 'tolak'].includes(confirmArg)

  if (!confirmYes && !confirmNo) {
    if (walletNow >= nextTierPrice) {
      return m.reply(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ⚠️ *KONFIRMASI UPGRADE*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Target : ${nextTier.color} *${nextTier.name}*\n` +
        `> ↳ Harga Normal : Rp ${nextTierNormalPrice.toLocaleString()}\n` +
        `> ↳ Harga Premium : Rp ${nextTierPrice.toLocaleString()}\n` +
        `> ↳ Uang Saku : Rp ${walletNow.toLocaleString()}\n` +
        `> ↳ Saldo Bank : Rp ${bankNow.toLocaleString()}\n\n` +
        `Ketik *.upgradebank beli yes* untuk lanjut\n` +
        `atau *.upgradebank beli no* untuk batal.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (bankNow >= payFromBank && payFromBank > 0) {
      return m.reply(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ⚠️ *KONFIRMASI PEMAKAIAN BANK*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Target : ${nextTier.color} *${nextTier.name}*\n` +
        `> ↳ Harga Normal : Rp ${nextTierNormalPrice.toLocaleString()}\n` +
        `> ↳ Harga Premium : Rp ${nextTierPrice.toLocaleString()}\n` +
        `> ↳ Uang Saku : Rp ${walletNow.toLocaleString()}\n` +
        `> ↳ Saldo Bank : Rp ${bankNow.toLocaleString()}\n` +
        `> ↳ Otomatis pakai bank : Rp ${payFromBank.toLocaleString()}\n\n` +
        `Ketik *.upgradebank beli yes* untuk lanjut\n` +
        `atau *.upgradebank beli no* untuk batal.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Harga Normal : Rp ${nextTierNormalPrice.toLocaleString()}\n` +
      `> ↳ Harga Premium : Rp ${nextTierPrice.toLocaleString()}\n` +
      `> ↳ Punya : Rp ${walletNow.toLocaleString()}\n` +
      `> ↳ Saldo Bank : Rp ${bankNow.toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (confirmNo) {
    return m.reply(`╭─❏「 💳 UPGRADE BANK 」❏\n│ ❌ *UPGRADE DIBATALKAN*\n╰─━━━━━━━━━━━━━━─`)
  }

  if (walletNow >= nextTierPrice) {
    wdb.money[m.sender] -= nextTierPrice
  } else {
    let bankNeed = nextTierPrice - walletNow
    if (bankNow < bankNeed) {
      return m.reply(
        `╭─❏「 💳 UPGRADE BANK 」❏\n` +
        `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Butuh : Rp ${nextTierPrice.toLocaleString()}\n` +
        `> ↳ Uang Saku : Rp ${walletNow.toLocaleString()}\n` +
        `> ↳ Bank Tersedia : Rp ${bankNow.toLocaleString()}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    wdb.money[m.sender] = 0
    user.bank -= bankNeed
  }

  user.bankTier += 1
  user.kartuBeku = false
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🎉 UPGRADE BERHASIL 」❏\n` +
    `│ ${nextTier.color} *${nextTier.name}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Limit : Rp ${nextTier.limit.toLocaleString()}\n` +
    `> ↳ Sisa Uang : Rp ${wdb.money[m.sender].toLocaleString()}\n` +
    `> ↳ Sisa Bank : Rp ${(user.bank || 0).toLocaleString()}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

// MENU INFO
let nextTier = BANK_TIERS[user.bankTier + 1]
let cap = `╭─❏「 💳 UPGRADE BANK 」❏\n`
cap += `│ ${currentTier.color} *${currentTier.name}* [Lv.${user.bankTier}]\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📊 *INFORMASI BANK*\n`
cap += `> ↳ Status : ${isPremium ? '👑 Premium (Diskon 25%)' : '👤 User Biasa'}\n`
cap += `> ↳ Limit : Rp ${currentTier.limit.toLocaleString()}\n`
cap += `> ↳ Bunga : ${(currentTier.bunga * 100).toFixed(2)}%/minggu\n`
cap += `> ↳ Asuransi : ${(currentTier.asuransi * 100).toFixed(0)}%\n`
cap += `> ↳ Biaya Bulanan Normal : Rp ${currentTier.biayaBulanan.toLocaleString()}\n`
cap += `> ↳ Biaya Bulanan Premium : Rp ${getBankPrice(currentTier.biayaBulanan, m.sender, wdb).toLocaleString()}\n`
cap += `> ↳ Keamanan : ${currentTier.fasilitas.find(f => f.includes('Penjaga'))}\n`
cap += `> ↳ Fasilitas :\n`

currentTier.fasilitas.forEach(f => {
  cap += `> • ${f}\n`
})

cap += `\n─━━━━━━━━━━━━━━─\n\n`

if (nextTier) {
  const nextTierDiscountedPrice = getBankPrice(nextTier.price, m.sender, wdb)
  const nextTierDiscountedFee = getBankPrice(nextTier.biayaBulanan, m.sender, wdb)
  cap += `⬆️ *NEXT TIER*\n`
  cap += `> ↳ ${nextTier.color} *${nextTier.name}* [Lv.${user.bankTier + 1}]\n`
  cap += `> ↳ Harga Normal : Rp ${nextTier.price.toLocaleString()}\n`
  cap += `> ↳ Harga Premium : Rp ${nextTierDiscountedPrice.toLocaleString()}\n`
  cap += `> ↳ Biaya/Bulan Normal : Rp ${nextTier.biayaBulanan.toLocaleString()}\n`
  cap += `> ↳ Biaya/Bulan Premium : Rp ${nextTierDiscountedFee.toLocaleString()}\n\n`
  cap += `📌 *CARA UPGRADE*\n`
  cap += `> ↳ ${usedPrefix}upgradebank beli\n`
  cap += `> ↳ ${usedPrefix}upgradebank ${user.bankTier + 1}`
} else {
  cap += `🏆 *Kamu sudah di tier tertinggi: ${currentTier.name}*`
}

cap += `\n\n─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i187/11piK9')
}
handler.help = ['upgradebank [angka/beli]']
handler.tags = ['rpg']
handler.command = ['upgradebank']
handler.group = false
export default handler
