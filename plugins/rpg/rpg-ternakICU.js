import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m) => {
  if(!global.icuTernak ||!global.icuTernak[m.sender])
    return m.reply('❌ Kamu tidak punya hewan di ICU')

  let data = global.icuTernak[m.sender]
  const wdb = loadDB()
  let user = getUserRPG(wdb, m.sender).rpg

  if(!user.ternak) user.ternak = {} // init jaga2

  if((wdb.money[m.sender] || 0) < data.biayaObat)
    return m.reply(`❌ Uang kurang: Rp ${data.biayaObat.toLocaleString()}`)

  wdb.money[m.sender] -= data.biayaObat
  user.ternak[data.h1] = (user.ternak[data.h1] || 0) + 1
  user.ternak[data.h2] = (user.ternak[data.h2] || 0) + 1
  delete global.icuTernak[m.sender]
  saveDB(wdb)

  return m.reply(`┌───❏「 🏥 PENYELAMATAN BERHASIL 」❏\n│\n│ ${data.d1.emoji} ${data.d1.nama} + ${data.d2.emoji} ${data.d2.nama}\n│ Status: SEHAT KEMBALI\n│\n│ 💰 -Rp ${data.biayaObat.toLocaleString()}\n│\n│ Hewan sudah kembali ke kandang\n└───────────────────`)
}
handler.help = ['icu']
handler.tags = ['rpg']
handler.command = /^(icu|obati)$/i
handler.group = true
export default handler