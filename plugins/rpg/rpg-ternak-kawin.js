import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { prosesKawin, hitungBiayaKawin, hitungBiayaObat, peluangGagal, dapatkanHasil, getHewan } from '../../lib/rpg-libternakData.js'

global.icuTernak = global.icuTernak || {}

let handler = async (m, { conn, args }) => {
  const wdb = loadDB()
  wdb.temp = wdb.temp || {}
  wdb.temp.kawin = wdb.temp.kawin || {}
  let user = getUserRPG(wdb, m.sender).rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.ternak) user.ternak = {}
  if(!user.inventory) user.inventory = {}
  if(!user.cooldown) user.cooldown = {}

  // AUTO MIGRASI KEY LOWERCASE BUAT DATA LAMA
  let needSave = false
  for(let key in user.ternak){
    let keyLower = key.toLowerCase()
    if(key!== keyLower){
      user.ternak[keyLower] = (user.ternak[keyLower] || 0) + user.ternak[key]
      delete user.ternak[key]
      needSave = true
    }
  }
  if(needSave) saveDB(wdb) // save 1x pas migrasi

  let [sub, h1, h2, asuransi] = args
  h1 = h1?.toLowerCase(); h2 = h2?.toLowerCase()
  asuransi = asuransi === 'asuransi'

  if(sub === 'proses'){
    let data = wdb.temp.kawin[m.sender]
    if(!data) return m.reply('❌ Tidak ada kawin yg menunggu konfirmasi')
    if(Date.now() - data.waktu > 60000) {
      delete wdb.temp.kawin[m.sender]
      saveDB(wdb)
      return m.reply('❌ Konfirmasi kadaluarsa. Ketik ulang.kawin')
    }
    h1 = data.h1; h2 = data.h2; asuransi = data.asuransi
  }

  if(sub === 'batal'){
    if(wdb.temp.kawin[m.sender]){
      delete wdb.temp.kawin[m.sender]
      saveDB(wdb)
      return m.reply('❌ Kawin dibatalkan')
    } else return m.reply('❌ Tidak ada kawin yg menunggu konfirmasi')
  }

  if(!h1 ||!h2) return m.reply('Contoh:\n.kawin ayam sapi\n.kawin ayam naga asuransi')

  let d1 = getHewan(h1)
  let d2 = getHewan(h2)
  if(!d1 ||!d2) return m.reply('❌ Hewan tidak ditemukan')
  if(!user.ternak[h1] ||!user.ternak[h2]) return m.reply('❌ Kamu tidak punya 1 dari hewan tersebut')

  let sekarang = Date.now()
  let jenis = h1 === h2? 'biasa' : 'silang'
  let cd = jenis === 'biasa'? 2 * 60 * 60 * 1000 : 7 * 60 * 60 * 1000
  if(user.cooldown.kawin && sekarang - user.cooldown.kawin < cd) {
    let sisa = cd - (sekarang - user.cooldown.kawin)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    return m.reply(`┌───❏「 ⏰ MASIH COOLDOWN 」❏\n│\n│ Jenis: Kawin ${jenis}\n│ Sisa: ${jam}j ${menit}m\n└───────────────────`)
  }

  let biaya = hitungBiayaKawin(d1, d2)
  let biayaAs = biaya * 2
  let biayaObat = hitungBiayaObat(d1, d2)
  let bayar = asuransi? biayaAs : biaya
  if((wdb.money[m.sender] || 0) < bayar) return m.reply(`❌ Uang kurang: Rp ${bayar.toLocaleString()}`)

  let eTertinggi = Math.max(d1.evolusi, d2.evolusi)
  let exp = (d1.exp + d2.exp) * (eTertinggi + 1) * 5 * (h1!==h2?2:1) * (eTertinggi >=7?3:1)

  if(h1!== h2 && sub!== 'proses') {
    wdb.temp.kawin[m.sender] = {h1, h2, asuransi, waktu: Date.now()}
    saveDB(wdb)
    let ket = `┌───❏「 ⚠️ PERINGATAN EVOLUSI 」❏\n│\n│ ${d1.emoji} ${d1.nama} [E${d1.evolusi}] × ${d2.emoji} ${d2.nama} [E${d2.evolusi}]\n│\n│ 📊 Resiko Gagal : ${peluangGagal(d1,d2)*100}%\n│ 🎯 Hasil : E${Math.min(eTertinggi+1,7)}\n│ ✨ Exp : ${Math.floor(exp)} / ${Math.floor(exp/2)}\n│\n│ 💰 Biaya Kawin : Rp ${biaya.toLocaleString()}`
    ket += asuransi? `\n│ 🛡️ Biaya Asuransi: Rp ${biayaAs.toLocaleString()}\n│ 🏥 Biaya ICU : Rp ${biayaObat.toLocaleString()}` : `\n│ ⚠️ Tanpa Asuransi: Tidak bisa ICU`
    ket += `\n│\n│ ℹ️ ICU = Ruang penyelamatan. Jika gagal dan punya asuransi,\n│ hewan masuk ICU 30 menit. Ketik.icu untuk menyelamatkan`
    return m.reply(ket + `\n│\n│ Ketik *.kawin proses* untuk lanjut\n│ Ketik *.kawin batal* untuk batal\n│ ⏰ 1 menit\n└───────────────────`)
  }

  wdb.money[m.sender] -= bayar
  user.ternak[h1]--; if(user.ternak[h1] <= 0) delete user.ternak[h1]
  user.ternak[h2]--; if(user.ternak[h2] <= 0) delete user.ternak[h2]
  user.cooldown.kawin = sekarang
  delete wdb.temp.kawin[m.sender]

  let gagal = Math.random() < peluangGagal(d1,d2)
  if(gagal) {
    user.exp += Math.floor(exp/2)
    if(asuransi) {
      global.icuTernak[m.sender] = {h1, h2, d1, d2, biayaObat}
      setTimeout(() => {
        if(global.icuTernak[m.sender]) {
          const wdb2 = loadDB()
          let user2 = getUserRPG(wdb2, m.sender).rpg
          let data = global.icuTernak[m.sender]
          user2.inventory[dapatkanHasil(data.d1).sembelih] = (user2.inventory[dapatkanHasil(data.d1).sembelih] || 0) + 1
          user2.inventory[dapatkanHasil(data.d2).sembelih] = (user2.inventory[dapatkanHasil(data.d2).sembelih] || 0) + 1
          delete global.icuTernak[m.sender]
          saveDB(wdb2)
          conn.sendMessage(m.chat, {text: `┌───❏「 💀 WAKTU HABIS 」❏\n│\n│ ${data.d1.emoji} ${data.d1.nama} × ${data.d2.emoji} ${data.d2.nama}\n│ Status: MATI\n│\n│ 🍖 ${dapatkanHasil(data.d1).sembelih} x1\n│ 🍖 ${dapatkanHasil(data.d2).sembelih} x1\n└───────────────────`}, {quoted: m})
        }
      }, 30 * 60 * 1000)
      saveDB(wdb)
      return m.reply(`┌───❏「 🚑 DARURAT! SEKARAT 」❏\n│\n│ ${d1.emoji} ${d1.nama} × ${d2.emoji} ${d2.nama}\n│ Kondisi: KRITIS!\n│\n│ 💰 -Rp ${biayaAs.toLocaleString()}\n│ ✨ +${Math.floor(exp/2)} Exp\n│\n│ Pilih dalam 30 menit:\n│.icu → Obati Rp ${biayaObat.toLocaleString()}\n│.abaikan → Dapatkan daging\n└───────────────────`)
    } else {
      saveDB(wdb)
      return m.reply(`┌───❏「 💀 GAGAL TOTAL 」❏\n│\n│ ${d1.emoji} ${d1.nama} × ${d2.emoji} ${d2.nama}\n│ Status: MATI\n│\n│ 💰 -Rp ${biaya.toLocaleString()}\n│ ✨ +${Math.floor(exp/2)} Exp\n│ ⚠️ Tanpa asuransi. Tidak dapat apa-apa\n└───────────────────`)
    }
  } else {
    let hasil = prosesKawin(h1,h2)
    let keyHasil = hasil.data.nama.toLowerCase()
    user.ternak[keyHasil] = (user.ternak[keyHasil] || 0) + 1
    user.exp += Math.floor(exp)
    saveDB(wdb)
    let notif = hasil.baru? `\n│ ✨ HEWAN BARU TERDAFTAR!` : ''
    let mentok = hasil.data.evolusi >= 7? `\n│ 👑 EVOLUSI TERTINGGI!` : ''
    return m.reply(`┌───❏「 🎉 EVOLUSI BERHASIL 」❏\n│\n│ ${d1.emoji} ${d1.nama} × ${d2.emoji} ${d2.nama}\n│\n│ 🎁 Lahir: ${hasil.data.emoji} ${hasil.data.nama} [E${hasil.data.evolusi}] x1${notif}${mentok}\n│ ✨ +${Math.floor(exp)} Exp\n│ 💰 -Rp ${bayar.toLocaleString()}\n│ ⏰ Cooldown: ${jenis === 'biasa'? '2 jam' : '7 jam'}\n└───────────────────`)
  }
}
handler.help = ['kawin <h1> <h2> [asuransi]', 'kawin proses', 'kawin batal']
handler.tags = ['rpg']
handler.command = /^(kawin)$/i
handler.group = true
export default handler