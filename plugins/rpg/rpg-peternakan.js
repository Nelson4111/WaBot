import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'
import { hewanList, getHasilDisplay, isHasilTernakKey, migrateHasilTernakInventory } from '../../lib/rpg-libternakData.js'

let handler = async (m, { text }) => {
  const wdb = loadDB()
  const data = getUserRPG(wdb, m.sender)
  const user = data?.rpg || data
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  initLadang(user)
  user.ternak = user.ternak || {}
  user.inventory = user.inventory || {}
  const hasilMigration = migrateHasilTernakInventory(user.inventory)
  user.inventory = hasilMigration.inventory
  if (hasilMigration.changed) saveDB(wdb)

  if (['command', 'commands', 'cmd'].includes((text || '').trim().toLowerCase())) {
    return m.reply(`╭─❏「 📋 PETERNAKAN COMMAND 」❏\n\n📌 *PERINTAH UTAMA*\n> *.peternakan*\n> *.ternak kandang*\n> *.ternak list*\n> *.ternak hybrid*\n\n🛒 *TRANSAKSI & TERNAK*\n> *.ternak beli <hewan> <jumlah>*\n> *.ternak ambil <hewan>*\n> *.ternak sembelih <hewan> <jumlah>*\n> *.ternak jual <item> <jumlah>*\n\n🧬 *KAWIN & ICU*\n> *.kawin <hewan1> <hewan2>*\n> *.kawin ... asuransi*\n> *.kawin proses / batal*\n> *.icu* atau *.icu auto*\n╰─━━━━━━━━━━━━━━─`)
  }
  const totalHewan = Object.values(user.ternak).reduce((total, jumlah) => total + Number(jumlah || 0), 0)
  const jenisHewan = Object.keys(user.ternak).filter(key => user.ternak[key] > 0).length
  const hybridDimiliki = Object.keys(user.ternak).filter(key => !hewanList[key] && user.ternak[key] > 0).length
  const icu = global.icuTernak?.[m.sender]
  let cap = `╭─❏「 🏡 PETERNAKAN 」❏\n`
cap += `│ 🐄 *INFORMASI PETERNAKAN*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `🐄 *TOTAL HEWAN*\n`
cap += `> ↳ Total Hewan: ${totalHewan}\n`
cap += `> ↳ Jenis Hewan: ${jenisHewan}\n`
cap += `> ↳ Hybrid Dimiliki: ${hybridDimiliki}\n\n`

cap += `🏥 *STATUS ICU*\n`
cap += `> ↳ Status: ${icu ? 'Aktif' : 'Tidak aktif'}\n`

if (icu) {
  cap += `> ↳ ${icu.d1.nama} ${icu.d1.emoji} + ${icu.d2.nama} ${icu.d2.emoji}\n`
  cap += `> ↳ 💊 Biaya Obat: Rp ${icu.biayaObat.toLocaleString()}\n`
}

const hasilTernak = Object.entries(user.inventory)
  .filter(([key, jumlah]) => isHasilTernakKey(key) && Number(jumlah) > 0)
  .map(([key, jumlah]) => {
    const hasil = getHasilDisplay(key)
    return `${hasil.emoji} *${hasil.nama}* x${jumlah}`
  })

cap += `\n📦 *HASIL TERNAK TERKUMPUL*\n`
cap += hasilTernak.length ? hasilTernak.join('\n') + '\n' : `> ↳ Belum ada hasil ternak.\n`

cap += `\n─━━━━━━━━━━━━━━─\n\n`
cap += `💡 *INFO*\n`
cap += `> ↳ Ketik *.ternak command* untuk melihat semua perintah.\n\n`
cap += `─━━━━━━━━━━━━━━─`
  return m.reply(cap)
}

handler.help = ['peternakan', 'ternak command', 'ternak cmd']
handler.tags = ['rpg']
handler.command = /^(peternakan)$/i
handler.alias = ['peternakan']
handler.group = true
export default handler