import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { prosesKawin, hitungBiayaKawin, hitungBiayaObat, peluangGagal, dapatkanHasil, getHewan, getHewanKey } from '../../lib/rpg-libternakData.js'

global.icuTernak = global.icuTernak || {}

let handler = async (m, { conn, args }) => {
  const wdb = loadDB()
  wdb.temp = wdb.temp || {}
  wdb.temp.kawin = wdb.temp.kawin || {}
  let userRPG = getUserRPG(wdb, m.sender)
  let user = userRPG?.rpg || userRPG
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
  if(needSave) saveDB(wdb)

  let sub = args[0]?.toLowerCase()
  let h1 = null, h2 = null, asuransi = false
  const resolveHewan = value => {
    if (!value) return null
    const number = Number(value)
    if (Number.isInteger(number) && number > 0) {
      const key = Object.keys(user.ternak).filter(key => user.ternak[key] > 0)[number - 1]
      if (key) return key
    }
    return getHewanKey(value) || value.toLowerCase()
  }

  if (sub === 'guide' || sub === 'tutorial' || sub === 'panduan') {
    return m.reply(
      `╭─❏「 🧬 PANDUAN KAWIN TERNAK 」❏\n` +
      `│ 🧬 *CARA KAWIN TERNAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `🐄 *KAWIN BIASA*\n` +
      `> ↳ Hewan sama, butuh 2 ekor, cooldown 2 jam.\n` +
      `> ↳ Hasil : Anak dari jenis hewan yang sama.\n\n` +

      `🧬 *KAWIN SILANG*\n` +
      `> ↳ Dua jenis berbeda, cooldown 7 jam.\n` +
      `> ↳ Hasil : Hybrid baru dengan evolusi lebih tinggi.\n\n` +

      `💰 *BIAYA*\n` +
      `> ↳ Mengikuti evolusi induk.\n` +
      `> ↳ Evolusi dasar Rp10.000, evolusi berikutnya semakin mahal.\n\n` +

      `📊 *RISIKO*\n` +
      `> ↳ Kawin silang memiliki peluang gagal lebih besar.\n` +
      `> ↳ Hasil gagal tetap memberi sebagian EXP.\n\n` +

      `🛡️ *ASURANSI*\n` +
      `> ↳ Tambahan biaya 2x biaya kawin.\n` +
      `> ↳ Jika gagal, hewan masuk ICU selama 30 menit.\n\n` +

      `🏥 *ICU*\n` +
      `> ↳ Bayar biaya obat untuk mengembalikan kedua induk.\n` +
      `> ↳ Gunakan *.icu* atau *.icu auto* sebelum waktu habis.\n\n` +

      `─━━━━━━━━━━━━━━─\n\n` +

      `📌 *CARA MENGGUNAKAN*\n` +
      `> ↳ Mulai : *.kawin ayam sapi*\n` +
      `> ↳ Asuransi : *.kawin ayam naga asuransi*\n` +
      `> ↳ Konfirmasi : *.kawin proses*\n` +
      `> ↳ Batal : *.kawin batal*\n` +
      `> ↳ Lihat hybrid : *.ternak hybrid*\n\n` +

      `💡 *TIPS*\n` +
      `> ↳ Pastikan stok kedua induk cukup dan uang tersedia.\n` +
      `> ↳ Gunakan asuransi untuk induk langka atau evolusi tinggi.\n` +
      `> ↳ Simpan hasil hybrid karena bisa dipakai kawin lagi.\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  if (sub === 'proses') {
    let data = wdb.temp.kawin[m.sender]
    if(!data) return m.reply(
      `╭─❏「 ❌ TIDAK ADA KONFIRMASI 」❏\n` +
      `│ Tidak ada kawin yg menunggu konfirmasi\n` +
      `╰─━━━━━━━━━━━━━━─`
    )

    if(Date.now() - data.waktu > 60000) {
      delete wdb.temp.kawin[m.sender]
      saveDB(wdb)
      return m.reply(
        `╭─❏「 ❌ KONFIRMASI KADALUARSA 」❏\n` +
        `│ Konfirmasi kadaluarsa. Ketik ulang .kawin\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    h1 = getHewanKey(data.h1) || data.h1
    h2 = getHewanKey(data.h2) || data.h2
    asuransi = data.asuransi
  } else if (sub === 'batal') {
    if(wdb.temp.kawin[m.sender]){
      delete wdb.temp.kawin[m.sender]
      saveDB(wdb)
      return m.reply(
        `╭─❏「 ❌ KAWIN DIBATALKAN 」❏\n` +
        `│ Kawin dibatalkan\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    } else return m.reply(
      `╭─❏「 ❌ TIDAK ADA KONFIRMASI 」❏\n` +
      `│ Tidak ada kawin yg menunggu konfirmasi\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  } else {
    h1 = resolveHewan(args[0])
    h2 = resolveHewan(args[1])
    asuransi = (args[2]?.toLowerCase() === 'asuransi') || (args[3]?.toLowerCase() === 'asuransi')
  }

  if(!h1 || !h2) return m.reply(
    `╭─❏「 📌 CONTOH PENGGUNAAN 」❏\n` +
    `│ 🐄 *.kawin ayam sapi*\n` +
    `│ 🛡️ *.kawin ayam naga asuransi*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  // CEK STOK DULU PAKE KEY LOWERCASE
  if (h1 === h2) {
    if ((user.ternak[h1] || 0) < 2) return m.reply(
      `╭─❏「 ❌ STOK TIDAK CUKUP 」❏\n` +
      `│ Kamu butuh minimal 2 ekor ${h1} untuk dikawinkan!\n` +
      `│ Stok kamu : ${user.ternak[h1] || 0}\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  } else {
    if (!user.ternak[h1] || !user.ternak[h2]) return m.reply(
      `╭─❏「 ❌ HEWAN TIDAK LENGKAP 」❏\n` +
      `│ Kamu tidak punya salah satu dari hewan tersebut\n` +
      `│ Punya : ${Object.keys(user.ternak).join(', ')}\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  let d1 = getHewan(h1)
  let d2 = getHewan(h2)
  if(!d1 ||!d2) return m.reply(
    `╭─❏「 ❌ HEWAN TIDAK DITEMUKAN 」❏\n` +
    `│ Hewan tidak ditemukan di database\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let sekarang = Date.now()
  let jenis = h1 === h2? 'biasa' : 'silang'
  let cd = jenis === 'biasa'? 2 * 60 * 60 * 1000 : 7 * 60 * 60 * 1000

  if(user.cooldown.kawin && sekarang - user.cooldown.kawin < cd) {
    let sisa = cd - (sekarang - user.cooldown.kawin)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)

    return m.reply(
      `╭─❏「 ⏰ MASIH COOLDOWN 」❏\n` +
      `│ ⏰ *Jenis* : Kawin ${jenis}\n` +
      `│ ⏳ *Sisa* : ${jam}j ${menit}m\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  let biaya = hitungBiayaKawin(d1, d2)
  let biayaAs = biaya * 2
  let biayaObat = hitungBiayaObat(d1, d2)
  let bayar = asuransi? biayaAs : biaya

  if((wdb.money[m.sender] || 0) < bayar) return m.reply(
    `╭─❏「 ❌ UANG TIDAK CUKUP 」❏\n` +
    `│ Butuh : Rp ${bayar.toLocaleString()}\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let eTertinggi = Math.max(d1.evolusi, d2.evolusi)
  let exp = (d1.exp + d2.exp) * (eTertinggi + 1) * 5 * (h1!==h2?2:1) * (eTertinggi >=7?3:1)

  if(h1!== h2 && sub!== 'proses') {
    wdb.temp.kawin[m.sender] = {h1, h2, asuransi, waktu: Date.now()}
    saveDB(wdb)

    let ket =
      `╭─❏「 ⚠️ PERINGATAN EVOLUSI 」❏\n` +
      `│ 🧬 ${d1.nama} ${d1.emoji} + ${d2.nama} ${d2.emoji}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 📊 Resiko Gagal : ${peluangGagal(d1,d2) * 100}%\n` +
      `> ↳ 🎯 Hasil : E${Math.min(eTertinggi + 1, 7)}\n` +
      `> ↳ ✨ Exp : ${Math.floor(exp)} / ${Math.floor(exp / 2)}\n` +
      `> ↳ 💰 Biaya Kawin : Rp ${biaya.toLocaleString()}\n`

    ket += asuransi
      ? `> ↳ 🛡️ Biaya Asuransi : Rp ${biayaAs.toLocaleString()}\n` +
        `> ↳ 🏥 Biaya ICU : Rp ${biayaObat.toLocaleString()}\n`
      : `> ↳ ⚠️ Tanpa Asuransi : Tidak bisa ICU\n`

    ket +=
      `\n🏥 *INFO ICU*\n` +
      `> ↳ ICU = Ruang penyelamatan. Jika gagal dan punya asuransi,\n` +
      `> ↳ hewan masuk ICU 30 menit. Ketik.icu untuk menyelamatkan\n\n` +
      `> ↳ ICU menyelamatkan hewan selama 30 menit jika gagal.\n` +
      `> ↳ Ketik *.kawin proses* untuk lanjut atau *.kawin batal* untuk batal.\n\n` +
      `─━━━━━━━━━━━━━━─`

    return m.reply(ket)
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

          conn.sendMessage(m.chat, {
            text:
              `╭─❏「 💀 WAKTU HABIS 」❏\n` +
              `│ 🧬 ${data.d1.nama} ${data.d1.emoji} + ${data.d2.nama} ${data.d2.emoji}\n` +
              `╰─━━━━━━━━━━━━━━─\n\n` +
              `> ↳ Status : Mati\n` +
              `> ↳ 🍖 Hasil : ${dapatkanHasil(data.d1).sembelih} x1 + ${dapatkanHasil(data.d2).sembelih} x1\n\n` +
              `─━━━━━━━━━━━━━━─`
          }, {quoted: m})
        }
      }, 30 * 60 * 1000)

      saveDB(wdb)

      return m.reply(
        `╭─❏「 🚑 DARURAT SEKARAT 」❏\n` +
        `│ 🧬 ${d1.nama} ${d1.emoji} + ${d2.nama} ${d2.emoji}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Status : Kritis\n` +
        `> ↳ 💰 Biaya Kawin : -Rp ${biayaAs.toLocaleString()}\n` +
        `> ↳ ✨ Exp : +${Math.floor(exp / 2)}\n` +
        `> ↳ 🏥 ICU : .icu -Rp ${biayaObat.toLocaleString()}\n` +
        `> ↳ 🍖 Abaikan : .abaikan untuk daging\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    } else {
      saveDB(wdb)

      return m.reply(
        `╭─❏「 💀 GAGAL TOTAL 」❏\n` +
        `│ 🧬 ${d1.nama} ${d1.emoji} + ${d2.nama} ${d2.emoji}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Status : Mati\n` +
        `> ↳ 💰 Biaya : -Rp ${biaya.toLocaleString()}\n` +
        `> ↳ ✨ Exp : +${Math.floor(exp / 2)}\n` +
        `> ↳ ⚠️ Catatan : Tanpa asuransi, tidak dapat apa-apa\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
  } else {
    let hasil = prosesKawin(h1,h2)
    if (!hasil?.hasil || !hasil.data) return m.reply(
      `╭─❏「 ❌ EVOLUSI GAGAL 」❏\n` +
      `│ Hasil kawin gagal dibuat. Coba ulangi lagi.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )

    let keyHasil = getHewanKey(hasil.hasil) || hasil.hasil.toLowerCase()
    user.ternak[keyHasil] = (user.ternak[keyHasil] || 0) + 1
    user.exp += Math.floor(exp)
    saveDB(wdb)

    let notif = hasil.baru? `\n✨ *HEWAN BARU TERDAFTAR!*` : ''
    let mentok = hasil.data.evolusi >= 7? `\n👑 *EVOLUSI TERTINGGI!*` : ''

    return m.reply(
      `╭─❏「 🎉 EVOLUSI BERHASIL 」❏\n` +
      `│ 🧬 ${d1.nama} ${d1.emoji} + ${d2.nama} ${d2.emoji}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🎁 *Lahir* : ${hasil.data.emoji} ${hasil.data.nama} E${hasil.data.evolusi} x1` +
      `${notif}${mentok}\n` +
      `✨ *Exp* : +${Math.floor(exp)}\n` +
      `💰 *Biaya* : -Rp ${bayar.toLocaleString()}\n` +
      `⏰ *Cooldown* : ${jenis === 'biasa' ? '2 jam' : '7 jam'}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
}
handler.help = ['kawin <h1> <h2> [asuransi]', 'kawin proses', 'kawin batal', 'kawin guide', 'kawin tutorial']
handler.tags = ['rpg']
handler.command = /^(kawin)$/i
handler.group = true
export default handler