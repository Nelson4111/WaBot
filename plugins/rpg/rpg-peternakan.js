import { sendRpgButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'
import { hewanList, getHasilDisplay, isHasilTernakKey, migrateHasilTernakInventory } from '../../lib/rpg-libternakData.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  const data = getUserRPG(wdb, m.sender)
  const user = data?.rpg || data
  if (!user) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG.')
  initLadang(user)
  user.ternak = user.ternak || {}
  user.inventory = user.inventory || {}
  const hasilMigration = migrateHasilTernakInventory(user.inventory)
  user.inventory = hasilMigration.inventory
  if (hasilMigration.changed) saveDB(wdb)

  if (['command', 'commands', 'cmd'].includes((text || '').trim().toLowerCase())) {
    const prefix = usedPrefix || '.'
    const fallbackText = `╭─❏「 📋 PETERNAKAN COMMAND 」❏\n\n📌 *PERINTAH UTAMA*\n> *.peternakan*\n> *.ternak kandang*\n> *.ternak list*\n> *.ternak hybrid*\n\n🛒 *TRANSAKSI & TERNAK*\n> *.ternak beli <hewan> <jumlah>*\n> *.ternak ambil <hewan>*\n> *.ternak sembelih <hewan> <jumlah>*\n> *.ternak jual <item> <jumlah>*\n\n🧬 *KAWIN & ICU*\n> *.kawin <hewan1> <hewan2>*\n> *.kawin ... asuransi*\n> *.kawin proses / batal*\n> *.icu* atau *.icu auto*\n╰─━━━━━━━━━━━━━━─`
    const sections = [
      {
        title: '🐄 Kandang & ternak',
        rows: [
          { title: '🏡 Ringkasan kandang', description: 'Lihat jumlah dan status hewan ternak', id: `${prefix}ternak kandang` },
          { title: '📋 Daftar hewan', description: 'Jelajahi hewan yang kamu miliki', id: `${prefix}ternak list` },
          { title: '🧬 Koleksi hybrid', description: 'Temukan hasil kawin silang yang unik', id: `${prefix}ternak hybrid` },
          { title: '🛒 Beli hewan', description: 'Tambahkan hewan baru ke kandang', id: `${prefix}ternak beli` },
          { title: '🥚 Ambil hasil', description: 'Kumpulkan hasil ternak yang siap', id: `${prefix}ternak ambil` }
        ]
      },
      {
        title: '🧰 Perawatan & transaksi',
        rows: [
          { title: '🔪 Sembelih hewan', description: 'Olah hewan menjadi hasil peternakan', id: `${prefix}ternak sembelih` },
          { title: '💰 Jual hasil ternak', description: 'Tukarkan hasil ternak menjadi uang', id: `${prefix}ternak jual` },
          { title: '💕 Kawinkan hewan', description: 'Pilih dua hewan untuk dikawinkan', id: `${prefix}kawin` },
          { title: '🏥 Rawat di ICU', description: 'Atur perawatan khusus untuk ternak', id: `${prefix}icu` },
          { title: '📋 Semua command', description: 'Buka panduan tombol peternakan lengkap', id: `${prefix}ternak command` }
        ]
      }
    ]
    return sendRpgButtons(conn, {
      chat: m.chat, message: m, quoted: m,
      title: '🐄 PETERNAKAN AVELIA',
      subtitle: 'Rawat kandang dan kembangkan koleksi ternak',
      text: 'Kumpulkan hasil, kawinkan hewan, dan temukan hybrid istimewa.',
      buttonText: '🐄 BUKA MENU PETERNAKAN',
      sections,
      fallbackText
    })
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
    return { nama: `${hasil.emoji} *${hasil.nama}* x${jumlah}` }
  })
  .map((hasil, index) => `${index + 1}. ${hasil.nama}`)

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