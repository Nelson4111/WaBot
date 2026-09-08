import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { args }) => {
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

  if (!user) return m.reply('❌ Data RPG tidak ditemukan.')

  if(!user.ternak) user.ternak = {} // init jaga2

  if((wdb.money[m.sender] || 0) < data.biayaObat)
    return m.reply(`❌ Uang kurang: Rp ${data.biayaObat.toLocaleString()}`)

  wdb.money[m.sender] -= data.biayaObat
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

handler.help = ['icu']
handler.tags = ['rpg']
handler.command = /^(icu|obati)$/i
handler.group = true
export default handler