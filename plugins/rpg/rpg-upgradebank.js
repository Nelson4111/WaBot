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

  if ((wdb.money[m.sender] || 0) < tierBaru.price) {
    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh : Rp ${tierBaru.price.toLocaleString()}\n` +
      `> ↳ Punya : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  wdb.money[m.sender] -= tierBaru.price
  user.bankTier = targetTier
  user.kartuBeku = false
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🎉 UPGRADE BERHASIL 」❏\n` +
    `│ ${tierBaru.color} *${tierBaru.name}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Limit : Rp ${tierBaru.limit.toLocaleString()}\n` +
    `> ↳ Sisa Uang : Rp ${wdb.money[m.sender].toLocaleString()}\n\n` +
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

  if ((wdb.money[m.sender] || 0) < nextTier.price) {
    return m.reply(
      `╭─❏「 💳 UPGRADE BANK 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh : Rp ${nextTier.price.toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  wdb.money[m.sender] -= nextTier.price
  user.bankTier += 1
  user.kartuBeku = false
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🎉 UPGRADE BERHASIL 」❏\n` +
    `│ ${nextTier.color} *${nextTier.name}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Limit : Rp ${nextTier.limit.toLocaleString()}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

// MENU INFO
let nextTier = BANK_TIERS[user.bankTier + 1]
let cap = `╭─❏「 💳 UPGRADE BANK 」❏\n`
cap += `│ ${currentTier.color} *${currentTier.name}* [Lv.${user.bankTier}]\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📊 *INFORMASI BANK*\n`
cap += `> ↳ Limit : Rp ${currentTier.limit.toLocaleString()}\n`
cap += `> ↳ Bunga : ${(currentTier.bunga * 100).toFixed(2)}%/minggu\n`
cap += `> ↳ Asuransi : ${(currentTier.asuransi * 100).toFixed(0)}%\n`
cap += `> ↳ Biaya Bulanan : Rp ${currentTier.biayaBulanan.toLocaleString()}\n`
cap += `> ↳ Keamanan : ${currentTier.fasilitas.find(f => f.includes('Penjaga'))}\n`
cap += `> ↳ Fasilitas :\n`

currentTier.fasilitas.forEach(f => {
  cap += `> • ${f}\n`
})

cap += `\n─━━━━━━━━━━━━━━─\n\n`

if (nextTier) {
  cap += `⬆️ *NEXT TIER*\n`
  cap += `> ↳ ${nextTier.color} *${nextTier.name}* [Lv.${user.bankTier + 1}]\n`
  cap += `> ↳ Harga : Rp ${nextTier.price.toLocaleString()}\n`
  cap += `> ↳ Biaya/Bulan : Rp ${nextTier.biayaBulanan.toLocaleString()}\n\n`
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
