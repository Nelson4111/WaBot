import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { hewanList, dapatkanHasil, listHybrid, getHewan, getHewanKey, normalizeHasilKey, migrateHasilTernakInventory, getHasilDisplay } from '../../lib/rpg-libternakData.js'

let handler = async (m, { conn, args, command }) => {
  const ternakImageUrl = 'https://c.termai.cc/i100/jTBPgZh.webp'
  const safeReply = (text, options = {}) => sendRpgMsg(conn, m, text, ternakImageUrl, options)

  const wdb = loadDB()
  let user = getUserRPG(wdb, m.sender).rpg
  if (!user) return safeReply('❌ Kamu belum memiliki data RPG.')
  if(!user.ternak) user.ternak = {}
  if(!user.inventory) user.inventory = {}

  const hasilMigration = migrateHasilTernakInventory(user.inventory)
  user.inventory = hasilMigration.inventory

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
  if(needSave || hasilMigration.changed) saveDB(wdb)

  if (command?.toLowerCase() === 'hybrid') return safeReply(listHybrid())

  let [sub, hewan1, jml] = args
  hewan1 = getHewanKey(hewan1) || hewan1?.toLowerCase() // PENTING: gunakan key canonical
  jml = parseInt(jml) || 1

  if (sub === 'command' || sub === 'commands' || sub === 'cmd') {
    return safeReply(
      `╭─❏「 📋 TERNAK COMMAND 」❏\n` +
      `│ 📌 *PERINTAH TERNAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `> ↳ *.peternakan*\n` +
      `> ↳ *.ternak kandang*\n` +
      `> ↳ *.ternak list*\n` +
      `> ↳ *.ternak hybrid*\n` +
      `> ↳ *.ternak beli <hewan> <jumlah>*\n` +
      `> ↳ *.ternak ambil <hewan>*\n` +
      `> ↳ *.ternak sembelih <hewan> <jumlah>*\n` +
      `> ↳ *.ternak jual <item> <jumlah>*\n\n` +

      `🧬 *KAWIN & ICU*\n` +
      `> ↳ *.kawin <hewan1> <hewan2>*\n` +
      `> ↳ *.kawin proses / batal*\n` +
      `> ↳ *.icu* atau *.icu auto*\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  if (sub === 'peternakan' || sub === 'status') {
    const totalHewan = Object.values(user.ternak).reduce((total, jumlah) => total + Number(jumlah || 0), 0)
    const jenisHewan = Object.keys(user.ternak).filter(key => user.ternak[key] > 0).length
    const hybridKeys = Object.keys(user.ternak).filter(key => !hewanList[key])
    const icu = global.icuTernak?.[m.sender]

    const cap =
      `╭─❏「 🏡 PETERNAKAN 」❏\n` +
      `│ 📊 *STATUS PETERNAKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 🐄 Total Hewan : ${totalHewan}\n` +
      `> ↳ 🧬 Jenis Hewan : ${jenisHewan}\n` +
      `> ↳ 🧪 Hybrid Dimiliki : ${hybridKeys.length}\n` +
      `> ↳ 🏥 ICU : ${icu ? `Aktif - ${icu.d1.nama} + ${icu.d2.nama}` : 'Tidak aktif'}\n\n` +
      `📌 *INFORMASI*\n` +
      `> ↳ Command lengkap : *.ternak command*\n` +
      `> ↳ Status kandang : *.ternak kandang*\n` +
      `> ↳ Status ladang tidak termasuk hitungan peternakan.\n\n` +
      `─━━━━━━━━━━━━━━─`

    return safeReply(cap)
  }

  if(!sub || sub === 'kandang') {
    if(Object.keys(user.ternak).length === 0) return safeReply(
      `╭─❏「 🏡 KANDANG KOSONG 」❏\n` +
      `│ 🏡 *KANDANG KOSONG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Belum punya ternak.\n` +
      `> ↳ Beli hewan lewat *.ternak list*`
    )

    let txt =
      `╭─❏「 🏡 KANDANG 」❏\n` +
      `│ 🐄 *TERNAK YANG DIMILIKI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n`

    for(let h in user.ternak) {
      let data = getHewan(h)
      if(data) {
        txt += `${data.emoji} *${data.nama}* E${data.evolusi} x${user.ternak[h]}\n`
      }
    }

    txt +=
      `\n💰 *STATUS PENGGUNA*\n` +
      `> ↳ 💵 Uang : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n` +
      `> ↳ ✨ Exp : ${user.exp || 0}\n\n` +
      `─━━━━━━━━━━━━━━─`

    return safeReply(txt)
  }

  if(sub === 'list') {
    const kategori = args[1]?.toLowerCase()
    const kategoriList = {
      dasar: animal => animal.evolusi === 0,
      langka: animal => animal.evolusi >= 1 && animal.evolusi <= 2,
      epik: animal => animal.evolusi >= 3 && animal.evolusi <= 4,
      legenda: animal => animal.evolusi >= 5,
      all: () => true
    }
    if (!kategori) return safeReply(
      `╭─❏「 🛒 PASAR TERNAK 」❏\n` +
      `│ Pilih kategori hewan yang ingin dilihat.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> *.ternak list dasar*\n` +
      `> *.ternak list langka*\n` +
      `> *.ternak list epik*\n` +
      `> *.ternak list legenda*\n` +
      `> *.ternak list all*`
    )
    if (!kategoriList[kategori]) return safeReply('❌ Kategori tidak tersedia. Pilih dasar, langka, epik, legenda, atau all.')

    let txt =
      `╭─❏「 🛒 PASAR TERNAK 」❏\n` +
      `│ 🐄 *DAFTAR HEWAN - ${kategori.toUpperCase()}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n`

    for(let k in hewanList) {
      let h = hewanList[k]
      if (!kategoriList[kategori](h)) continue
      let harga = h.hargaBibit === 0 ? 'Hasil Kawin' : `Rp ${h.hargaBibit.toLocaleString()}`

      txt +=
        `${h.emoji} *${h.nama}* E${h.evolusi}\n` +
        `> ↳ Buy : ${harga}\n` +
        `> ↳ Hasil kawin : ${h.hargaBibit === 0 ? 'Ya' : 'Tidak'}\n\n`
    }

    txt +=
      `📌 *KAWIN*\n` +
      `> ↳ *.kawin [hewan1] [hewan2]*\n\n` +
      `─━━━━━━━━━━━━━━─`

    return safeReply(txt)
  }

  if(sub === 'hybrid') return safeReply(listHybrid())

  if(sub === 'beli') {
    let h = getHewan(hewan1)
    if(!h) return safeReply('❌ Hewan tidak ada')
    if(h.hargaBibit === 0) return safeReply('❌ Hewan ini hanya bisa didapat dari kawin')
    let total = h.hargaBibit * jml
    if((wdb.money[m.sender] || 0) < total) return safeReply(`❌ Uang kurang: Rp ${total.toLocaleString()}`)

    wdb.money[m.sender] -= total
    let key = getHewanKey(hewan1) || hewan1
    user.ternak[key] = (user.ternak[key] || 0) + jml
    saveDB(wdb)

    return safeReply(
      `╭─❏「 🛒 PEMBELIAN BERHASIL 」❏\n` +
      `│ ✅ *${h.nama} ${h.emoji}* x${jml}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 💰 Harga : Rp ${total.toLocaleString()}\n` +
      `> ↳ 💵 Saldo : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if(sub === 'ambil') {
    if(!user.ternak[hewan1]) return safeReply('❌ Kamu tidak punya hewan itu') // cek dulu
    let h = getHewan(hewan1)
    if(!h) return safeReply('❌ Data hewan tidak ditemukan')
    let hasil = dapatkanHasil(h).ambil
    const hasilDisplay = getHasilDisplay(hasil)
    user.inventory[hasil] = (user.inventory[hasil] || 0) + user.ternak[hewan1]
    let exp = h.exp * user.ternak[hewan1]
    user.exp += exp
    saveDB(wdb)

    return safeReply(
      `╭─❏「 🌾 HASIL TERNAK 」❏\n` +
      `│ 🐄 *${h.nama} ${h.emoji}* x${user.ternak[hewan1]}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 🎁 Produk : ${hasilDisplay.emoji} ${hasilDisplay.nama} x${user.ternak[hewan1]}\n` +
      `> ↳ ✨ Exp : +${exp}\n` +
      `> ↳ 💚 Status : Hewan tetap hidup\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if(sub === 'sembelih') {
    if(!user.ternak[hewan1]) return safeReply('❌ Kamu tidak punya hewan itu') // cek dulu
    let h = getHewan(hewan1)
    if(!h) return safeReply('❌ Data hewan tidak ditemukan')
    let punya = user.ternak[hewan1]
    let sembelih = Math.min(jml, punya)
    let hasil = dapatkanHasil(h).sembelih
    const hasilDisplay = getHasilDisplay(hasil)
    user.inventory[hasil] = (user.inventory[hasil] || 0) + sembelih
    user.ternak[hewan1] -= sembelih
    if(user.ternak[hewan1] <= 0) delete user.ternak[hewan1]
    saveDB(wdb)

    return safeReply(
      `╭─❏「 🔪 PENYEMBELIHAN 」❏\n` +
      `│ 🐄 *${h.nama} ${h.emoji}* x${sembelih}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 🍖 Hasil : ${hasilDisplay.emoji} ${hasilDisplay.nama} x${sembelih}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if(sub === 'jual') {
    let item = normalizeHasilKey(hewan1)
    if(!user.inventory[item]) return safeReply('❌ Item tidak ada di inventory')
    let hargaItem = 1000
    let total = hargaItem * jml
    user.inventory[item] -= jml
    if(user.inventory[item] <= 0) delete user.inventory[item]
    wdb.money[m.sender] += total
    saveDB(wdb)

    return safeReply(
      `╭─❏「 💰 PENJUALAN 」❏\n` +
      `│ 📦 *${item}* x${jml}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 💵 Hasil : +Rp ${total.toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
}
handler.help = ['ternak', 'kandang', 'hybrid']
handler.tags = ['rpg']
handler.command = /^(ternak|kandang|hybrid)$/i
handler.group = true
export default handler