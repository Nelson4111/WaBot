import { addRpgMoney, subtractRpgMoney } from '../../lib/rpgMoney.js'
import { sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { dapatkanHasil } from '../../lib/rpg-libternakData.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if(!global.icuTernak || !global.icuTernak[m.sender])
    return m.reply(
      `╭─❏「 🏥 ICU TERNAK 」❏\n` +
      `│ ❌ *TIDAK ADA HEWAN DI ICU*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )

  let data = global.icuTernak[m.sender]
  const wdb = loadDB()
  let userData = getUserRPG(wdb, m.sender)
  let user = userData?.rpg || userData

  if (!user) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Data RPG tidak ditemukan.')

  if (data.timer) clearTimeout(data.timer)

  if (command === 'abaikan') {
    if (!user.inventory) user.inventory = {}
    const hasil1 = dapatkanHasil(data.d1).sembelih
    const hasil2 = dapatkanHasil(data.d2).sembelih
    user.inventory[hasil1] = (user.inventory[hasil1] || 0) + 1
    user.inventory[hasil2] = (user.inventory[hasil2] || 0) + 1
    delete global.icuTernak[m.sender]
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🍖 ABAIKAN ICU 」❏\n` +
      `│ 🧬 ${data.d1.nama} ${data.d1.emoji} + ${data.d2.nama} ${data.d2.emoji}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Hewan di ICU telah disembelih.\n` +
      `> ↳ 🍖 Hasil daging: ${hasil1} x1 + ${hasil2} x1 telah masuk ke inventaris.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if(!user.ternak) user.ternak = {} // init jaga2

  if((wdb.money[m.sender] || 0) < data.biayaObat)
    return m.reply(`❌ Uang kurang: Rp ${data.biayaObat.toLocaleString()}`)

  wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], data.biayaObat)
  user.ternak[data.h1] = (user.ternak[data.h1] || 0) + 1
  user.ternak[data.h2] = (user.ternak[data.h2] || 0) + 1
  delete global.icuTernak[m.sender]
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🏥 PENYELAMATAN BERHASIL 」❏\n` +
    `│ 🐄 *${data.d1.nama} ${data.d1.emoji} + ${data.d2.nama}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ 📋 Status : ${args?.[0] === 'auto' ? 'Auto ICU dibayar' : 'Sehat kembali'}\n` +
    `> ↳ 💰 Biaya : -Rp ${data.biayaObat.toLocaleString()}\n` +
    `> ↳ 🏡 Hewan sudah kembali ke kandang\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['icu', 'abaikan']
handler.tags = ['rpg']
handler.command = /^(icu|obati|abaikan)$/i
handler.group = true
export default handler