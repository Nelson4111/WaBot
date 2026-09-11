import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { hewanList, dapatkanHasil, getHasilDisplay, migrateHasilTernakInventory } from '../../lib/rpg-libternakData.js'
import {
  hargaBeli as sharedHargaBeli,
  masakanResep,
  normalizeMasakanKey,
  formatMasakanNama,
  resepEmoji as sharedResepEmoji,
  deskripsiMakanan as sharedDeskripsiMakanan
} from '../../lib/rpg-masakanData.js'

function formatNama(nama) {
  if (!nama || typeof nama !== 'string') return ''
  return nama.replace(/_/g, ' ').split(/\s+/).filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const resepEmoji = { ...sharedResepEmoji }
const deskripsiMakanan = { ...sharedDeskripsiMakanan }

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.masakan) user.masakan = {}
  if(!user.inventory) user.inventory = {}
  if(!user.paketKonfirmasi) user.paketKonfirmasi = {}

  const hasilMigration = migrateHasilTernakInventory(user.inventory)
  user.inventory = hasilMigration.inventory

  // MIGRASI
  let isChanged = false
  let masakanBaru = {}
  for(let nama in user.masakan){
    let keyBaru = nama.replace(/ /g, '_')
    if(user.masakan[nama] > 0){
      masakanBaru[keyBaru] = (masakanBaru[keyBaru] || 0) + user.masakan[nama]
      if(keyBaru!== nama) isChanged = true
    }
  }
  if(isChanged){ user.masakan = masakanBaru; saveDB(wdb) }

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1
  const buyDiskon = isPrem? 0.8 : 1

const hargaBeli = { ...sharedHargaBeli }
  for (const [animalKey, animal] of Object.entries(hewanList)) {
    const recipeKey = `olahan_${animalKey}`
    if (!hargaBeli[recipeKey]) hargaBeli[recipeKey] = { emoji: '🍲', harga: Math.max(10000, Math.floor(animal.hargaJual * 0.8)) }
  }
  const hargaJual = {}
  for(let k in hargaBeli){ hargaJual[k] = Math.floor(hargaBeli[k].harga * 0.7) }
  const hargaJualHasilTernak = {}
  for (const animal of Object.values(hewanList)) {
    for (const hasil of [animal.hasil, animal.hasilTelur, animal.hasilDaging]) {
      if (!hasil) continue
      const key = getHasilDisplay(hasil).key
      hargaJualHasilTernak[key] = Math.max(hargaJualHasilTernak[key] || 0, animal.hargaJual)
    }
  }
  if (hasilMigration.changed) saveDB(wdb)

// 25 PAKET - SEMUA MENU MASUK
  const paket = {
    'gratis': { nama: 'Paket Gratis', diskon: 1, isi: { 'roti_tawar': 3, 'kerupuk_merdeka': 10, 'es_teh_jumbo': 3 } },
    
    'anak': { nama: 'Paket Anak', diskon: 0.25, isi: { 'roti_tawar': 5, 'susu_stroberi': 3, 'diamond_cake': 1, 'taiyaki': 2, 'dango': 3, 'dorayaki': 2 } },
    'pemula': { nama: 'Paket Pemula', diskon: 0.15, isi: { 'roti_tawar': 10, 'mie_goreng': 5, 'seblak': 3, 'boba_milktea': 3, 'onigiri': 5, 'es_jeruk': 5 } },
    'hemat': { nama: 'Paket Hemat', diskon: 0.12, isi: { 'nasi_uduk': 5, 'bubur_ayam': 5, 'tahu_telur': 5, 'ayam_goreng': 3, 'gado_gado': 3 } },

    'merdeka': { nama: 'Paket Kemerdekaan', diskon: 0.17, isi: { 'nasi_tumpeng': 1, 'sate_kambing': 3, 'ayam_goreng': 3, 'rendang': 2, 'kerupuk_merdeka': 20, 'es_teh_jumbo': 10, 'sate_ayam': 5 } },
    'indo': { nama: 'Paket Nusantara', diskon: 0.15, isi: { 'rendang': 3, 'sate_ayam': 5, 'gado_gado': 3, 'es_jeruk': 5, 'seblak': 3, 'tahu_telur': 3 } },

    'jepang': { nama: 'Paket Jepang', diskon: 0.08, isi: { 'ramen_ichiraku': 5, 'onigiri': 10, 'dango': 10, 'matcha_latte': 5, 'sushi': 3, 'sashimi': 2, 'takoyaki': 5, 'dorayaki': 3 } },
    'anime': { nama: 'Paket Anime Lover', diskon: 0.12, isi: { 'steak_makima': 1, 'pancake_polites': 2, 'jari_sukuna': 1, 'omurice': 3, 'hati_pochita': 1, 'ramen_ichiraku': 3 } },
    'shonen': { nama: 'Paket Shonen OP', diskon: 0.07, isi: { 'rambut_all_might': 1, 'chakra_fruit': 3, 'cairan_tulang_belakang_titan': 1, 'sel_bersel': 1, 'elixir_of_life': 2 } },

    'genshin': { nama: 'Paket Genshin', diskon: 0.10, isi: { 'sakura_mochi': 5, 'jade_parcel': 5, 'sweet_madame': 3, 'mora_meat': 2, 'stewed_matsutake': 3, 'mondstadt_hash_brown': 3 } },
    'hsr': { nama: 'Paket Honkai Star Rail', diskon: 0.10, isi: { 'interastral_peace': 3, 'stellar_jade_smoothie': 3, 'trailblaze_burger': 3, 'pom_pom_parfait': 2, 'soulglad': 5, 'ice_soulglad': 3 } },
    'wuwa': { nama: 'Paket Wuthering Waves', diskon: 0.10, isi: { 'tacetite_cake': 3, 'echo_pudding': 3, 'resonant_soup': 2 } },

    'seafood': { nama: 'Paket Seafood', diskon: 0.10, isi: { 'sushi': 5, 'takoyaki': 10, 'sate_ikan': 5, 'kepiting_rebus': 3, 'udang_goreng': 5, 'cumi_goreng': 3, 'lobster_bakar': 2, 'tuna_panggang': 2, 'salmon_asap': 2 } },
    'monster': { nama: 'Paket Monster Laut', diskon: 0.06, isi: { 'sop_kraken': 2, 'sate_megalodon': 2, 'sup_leviathan': 1, 'sea_dragon_grill': 1, 'hydra_stew': 1, 'kura_titan_soup': 1, 'paus_putih_steak': 1, 'naga_laut_bakar': 1, 'raja_ubur_jelly': 1, 'steak_godzilla': 1, 'steak_hiu': 2, 'pari_bakar': 2, 'penyu_panggang': 1 } },

    'paramecia': { nama: 'Paket Paramecia', diskon: 0.08, isi: { 'gomu_gomu_no_mi': 1, 'gura_gura_no_mi': 1, 'ope_ope_no_mi': 1, 'mochi_mochi_no_mi': 1, 'hana_hana_no_mi': 1, 'ito_ito_no_mi': 1, 'sube_sube_no_mi': 1, 'nikyu_nikyu_no_mi': 1, 'doku_doku_no_mi': 1, 'soru_soru_no_mi': 1 } },
    'zoan': { nama: 'Paket Zoan', diskon: 0.08, isi: { 'uo_uo_no_mi': 1, 'tori_tori_no_mi': 1, 'hito_hito_no_mi': 1, 'inu_inu_no_mi': 1, 'neko_neko_no_mi': 1, 'zou_zou_no_mi': 1, 'ryu_ryu_no_mi': 1, 'hebi_hebi_no_mi': 1 } },
    'logia': { nama: 'Paket Logia', diskon: 0.06, isi: { 'yami_yami_no_mi': 1, 'goro_goro_no_mi': 1, 'mera_mera_no_mi': 1, 'magu_magu_no_mi': 1, 'hie_hie_no_mi': 1, 'pika_pika_no_mi': 1, 'suna_suna_no_mi': 1, 'moku_moku_no_mi': 1, 'yuki_yuki_no_mi': 1, 'gasu_gasu_no_mi': 1 } },
    'devil_fruit': { nama: 'Paket Buah Iblis Langka', diskon: 0.05, isi: { 'gomu_gomu_no_mi': 1, 'mera_mera_no_mi': 1, 'ope_ope_no_mi': 1, 'yami_yami_no_mi': 1, 'gura_gura_no_mi': 1, 'magu_magu_no_mi': 1 } },

    // INI PAKET BARU UDAH GW UPDATE + BUFF
    'minuman': { nama: 'Paket Minuman Lengkap', diskon: 0.18, isi: { 
        'boba_milktea': 5, 'matcha_latte': 3, 'es_jeruk': 5, 'soda_gula': 3, 'kopi_hitams': 3, 'susu_stroberi': 3, 'jus_durian': 2,
        'teh_manis': 5, 'es_teh_tawar': 5, 'es_kelapa': 3, 'es_cendol': 3, 'es_dawet': 3, 'es_bubur_sum_sum': 2,
        'jus_alpukat': 2, 'jus_mangga': 2, 'jus_semangka': 2, 'jus_naga': 2, 'jus_stroberi': 2, 'jus_anggur': 2,
        'es_coklat': 2, 'hot_chocolate': 2, 'green_tea': 2, 'black_tea': 2, 'red_tea': 2, 'milk_tea': 2, 'tarik_tea': 2,
        'red_bull': 3, 'energy_drink': 3, 'cola': 3, 'fanta': 3, 'sprite': 3, 'air_mineral': 10, 'air_kelapa': 3,
        'susu_coklat': 3, 'susu_murni': 3, 'yogurt': 2, 'smoothie_berry': 2,
        // TAMBAHAN BARU
        'melon_soda_float': 3, 'ramune': 3, 'susu_kotak_strawberry': 5, 'oolong_tea': 3, 'earl_grey': 2, 'apple_cider': 2,
        'pocari_sweat': 5, 'jamu': 3, 'wedang_jahe': 3, 'stmj': 2, 'es_susu_putih': 3, 'freshmilk': 3, 'yakult': 5,
        'soulglad': 3, 'ice_soulglad': 3
    } },
    'sultan': { nama: 'Paket Sultan', diskon: 0.05, isi: { 'steak_emas': 5, 'diamond_cake': 3, 'steak_godzilla': 2, 'paus_putih_steak': 2, 'naga_laut_bakar': 2, 'lobster_bakar': 5 } }, // buff + hapus item yg ke-block
    'event_halloween': { nama: 'Paket Halloween', diskon: 0.25, isi: { 'jari_sukuna': 5, 'hati_pochita': 3, 'doku_doku_no_mi': 2, 'soru_soru_no_mi': 2 } }, // buff

    'super_borong': { nama: 'Paket Super Borong', diskon: 0.22, isi: Object.fromEntries(Object.keys(hargaBeli).map(k => [k, 2])) }
}

  // PISAH NOMOR MENU MAKAN + MINUMAN
  const makananKeys = Object.keys(masakanResep).filter(k => k in sharedHargaBeli).sort((a, b) => sharedHargaBeli[a].harga - sharedHargaBeli[b].harga)
  const minumanKeys = Object.keys(sharedHargaBeli).filter(k => !(k in masakanResep)).sort((a, b) => sharedHargaBeli[a].harga - sharedHargaBeli[b].harga)
  const beliKeys = [...makananKeys, ...minumanKeys]
  const nomorKeItemBeli = {}
  beliKeys.forEach((k, i) => nomorKeItemBeli[i+1] = k)

  let args = text? text.toLowerCase().split(' ').filter(v => v) : []
  let tipe = args[0] // <-- TAMBAHIN INI

  // MENU UTAMA
  if (!text) {
    let cap = `╭─❏「 🍽️ RESTORAN AVELIA 」❏\n`
    cap += `│ Makanan: ${makananKeys.length} | Minuman: ${minumanKeys.length}\n`
    cap += `│ Total Paket: ${Object.keys(paket).length}\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `📌 *CARA PAKAI*\n`
    cap += `> *${usedPrefix}restoran menu*\n`
    cap += `> *${usedPrefix}restoran info <no/nama>*\n`
    cap += `> *${usedPrefix}restoran paket list*\n`
    cap += `> *${usedPrefix}restoran beli <no> <jumlah>*\n`
    cap += `─━━━━━━━━━━━━━━─`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  // INFO DETAIL MAKAN
  if (tipe === 'info') {
    let itemInput = args[1]
    if(!itemInput) return m.reply(`❌ Contoh: *${usedPrefix}restoran info 45*`)
    let item =!isNaN(itemInput)? nomorKeItemBeli[parseInt(itemInput)] : itemInput.replace(/ /g, '_')
    if(!hargaBeli[item]) return m.reply('❌ Menu tidak ada.')
    let hBeli = Math.floor(hargaBeli[item].harga * buyDiskon)
    let hJual = Math.floor(hargaJual[item] * sellBonus)
    let desc = deskripsiMakanan[item] || `Makanan lezat dari Restoran Avelia. Bisa dijual ke restoran.`
    let cap = `╭─❏「 📖 DETAIL MENU 」❏\n`
    cap += ` ${hargaBeli[item].emoji} *${formatNama(item)}*\n`
    cap += `> Buy: Rp ${hBeli.toLocaleString()}\n`
    cap += `> Sell: Rp ${hJual.toLocaleString()}\n`
    cap += `─━━━━━━━━━━━━━━─\n\n📝 *Deskripsi:*\n${desc}`
    return m.reply(cap)
  }

// MENU SEMUA
  if (tipe === 'menu') {
    let cap = `╭─❏「 📋 DAFTAR MENU ${beliKeys.length} 」❏\n`
    cap += `│ Cara cek detail: *${usedPrefix}restoran info <no/nama>*\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n🍖 *MAKANAN ${makananKeys.length}*\n`
    cap += `Pilih nomor menu untuk membeli. Gunakan info untuk melihat detail hidangan.\n\n`

    makananKeys.forEach((k, i) => {
      let hBeli = Math.floor(hargaBeli[k].harga * buyDiskon)
      cap += `*${i + 1}. ${formatNama(k)} ${hargaBeli[k].emoji}*\n`
      cap += `> Buy: Rp ${hBeli.toLocaleString()}\n`
      cap += `> Sell: Rp ${Math.floor(hargaJual[k] * sellBonus).toLocaleString()}\n`
    })

    cap += `\n─━━━━━━━━━━━━━━─\n\n🥤 *MINUMAN ${minumanKeys.length}*\n`
    cap += `Pilih nomor minuman untuk membeli. Cek detail sebelum membeli menu premium.\n\n`
    minumanKeys.forEach((k, i) => {
      let hBeli = Math.floor(hargaBeli[k].harga * buyDiskon)
      let no = makananKeys.length + i + 1
      cap += `*${no}. ${formatNama(k)} ${hargaBeli[k].emoji}*\n`
      cap += `> Buy: Rp ${hBeli.toLocaleString()}\n`
      cap += `> Sell: Rp ${Math.floor(hargaJual[k] * sellBonus).toLocaleString()}\n`
    })
    cap += `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  // LIST PAKET
  if(tipe === 'paket' && args[1] === 'list'){
    let cap = `╭─❏「 🎁 DAFTAR ${Object.keys(paket).length} PAKET 」❏\n`
    cap += `│ Paket berisi beberapa menu dengan harga lebih hemat. Pilih nama paket untuk melihat detailnya.\n`
    cap += `╰─━━━━━━━━━━━━━━─\n`
    for(let p in paket){
      let dataPaket = paket[p]
      let totalNormal = 0
      for(let item in dataPaket.isi){
        const menu = hargaBeli[item]
        if (menu) totalNormal += menu.harga * dataPaket.isi[item]
      }
      let hargaPaket = Math.floor(totalNormal * (1 - dataPaket.diskon) * buyDiskon)
      let hemat = totalNormal - hargaPaket
      cap += `*🎁 ${dataPaket.nama}*\n`
      cap += `> Kode: ${p}\n`
      cap += `> Harga: Rp ${hargaPaket.toLocaleString()}\n`
      cap += `> Hemat: Rp ${hemat.toLocaleString()}\n\n`
    }
    cap += `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  // KONFIRMASI PAKET
  if(tipe === 'paket'){
    let namaPaket = args[1]
    if(args[1] === 'ya'){
      let dataKonfirmasi = user.paketKonfirmasi[m.sender]
      if(!dataKonfirmasi) return m.reply('❌ Tidak ada paket yang menunggu konfirmasi.')
      let dataPaket = paket[dataKonfirmasi.paket]
      if((wdb.money[m.sender] || 0) < dataKonfirmasi.harga) return m.reply(`❌ Uang tidak cukup!`)
      wdb.money[m.sender] -= dataKonfirmasi.harga
      let listDapat = []
      for(let item in dataPaket.isi){
        let jumlah = dataPaket.isi[item]
        user.masakan[item] = (user.masakan[item] || 0) + jumlah
        listDapat.push(`${resepEmoji[item] || hargaBeli[item]?.emoji || '🍽️'} ${formatNama(item)} x${jumlah}`)
      }
      delete user.paketKonfirmasi[m.sender]; saveDB(wdb)
let cap = `╭─❏「 🛍️ TRANSAKSI SUKSES 」❏\n`
cap += `│ 📦 *${dataPaket.nama}*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `💰 *PEMBAYARAN*\n`
cap += `> ↳ Bayar : -Rp ${dataKonfirmasi.harga.toLocaleString()}\n\n`

cap += `📦 *${listDapat.length} ITEM*\n`
cap += `> ↳ Isi paket yang masuk ke gudang masakan:\n`
cap += `${listDapat.slice(0, 10).map(item => `> • ${item}`).join('\n')}\n\n`

cap += `Selamat menikmati! 😋\n`
cap += `💵 Sisa : Rp ${wdb.money[m.sender].toLocaleString()}\n\n`
cap += `─━━━━━━━━━━━━━━─`

return m.reply(cap)
    }
    if(!namaPaket ||!paket[namaPaket]) return m.reply(`❌ Paket tidak ada.\nLihat: *${usedPrefix}restoran paket list*`)
    let dataPaket = paket[namaPaket]
    let totalNormal = 0
    for(let item in dataPaket.isi){
      const menu = hargaBeli[item]
      if (menu) totalNormal += menu.harga * dataPaket.isi[item]
    }
    let hargaPaket = Math.floor(totalNormal * (1 - dataPaket.diskon) * buyDiskon)
    let hemat = totalNormal - hargaPaket
    user.paketKonfirmasi[m.sender] = { paket: namaPaket, harga: hargaPaket }; saveDB(wdb)
    let listIsi = []
    for(let item in dataPaket.isi){
      const menu = hargaBeli[item]
      listIsi.push(`${resepEmoji[item] || menu?.emoji || '🍽️'} ${formatNama(item)} x${dataPaket.isi[item]}${menu ? '' : ' (menu belum tersedia)'}`)
    }
let cap = `╭─❏「 🎁 DETAIL PAKET 」❏\n`
cap += `│ 🎁 *${dataPaket.nama}*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `💰 *HARGA PAKET*\n`
cap += `> ↳ Harga Normal : Rp ${totalNormal.toLocaleString()}\n`
cap += `> ↳ Harga Paket : Rp ${hargaPaket.toLocaleString()}\n`
cap += `> ↳ Hemat : Rp ${hemat.toLocaleString()} ✨\n\n`

cap += `📦 *ISI PAKET*\n`
cap += `> ↳ Daftar menu dan jumlah item yang akan kamu dapatkan.\n`
cap += `${listIsi.map(item => `> • ${item}`).join('\n')}\n\n`

cap += `⚠️ INPO: Lebih murah Rp ${hemat.toLocaleString()}!\n\n`
cap += `Ketik *${usedPrefix}restoran paket ya* untuk beli\n\n`
cap += `─━━━━━━━━━━━━━━─`

return m.reply(cap)
  }

  // SISTEM BELI
  if(tipe === 'beli'){
    let itemInput = args[1]
    let jumlah = parseInt(args[2]) || 1
    if(!itemInput) return m.reply(`❌ Contoh: *${usedPrefix}restoran beli 1 10*`)
    let item =!isNaN(itemInput)? nomorKeItemBeli[parseInt(itemInput)] : itemInput.replace(/ /g, '_')
    if(!hargaBeli[item]) return m.reply('❌ Menu tidak ada.')
    let hargaSatuan = Math.floor(hargaBeli[item].harga * buyDiskon)
    let totalHarga = hargaSatuan * jumlah
    if((wdb.money[m.sender] || 0) < totalHarga) return m.reply(`❌ Uang tidak cukup! Butuh: Rp ${totalHarga.toLocaleString()}`)
    wdb.money[m.sender] -= totalHarga
    user.masakan[item] = (user.masakan[item] || 0) + jumlah
    saveDB(wdb)
let cap = `╭─❏「 🛍️ TRANSAKSI SUKSES 」❏\n`
cap += `│ 🛍️ *${hargaBeli[item].emoji} ${formatNama(item)}*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📦 *DETAIL TRANSAKSI*\n`
cap += `> ↳ Jumlah : ${jumlah}\n`
cap += `> ↳ Bayar : -Rp ${totalHarga.toLocaleString()}\n\n`

cap += `Silakan dinikmati! 😋\n`
cap += `💵 Sisa : Rp ${wdb.money[m.sender].toLocaleString()}\n\n`
cap += `─━━━━━━━━━━━━━━─`

return m.reply(cap)
  }

  // SISTEM JUAL
  if(tipe === 'jual'){
    if(args[1] === 'all'){
      let totalHasil = 0, listJual = []
      for(let item in user.masakan){
        if(hargaJual[item] && user.masakan[item] > 0){
          let jumlah = user.masakan[item]
          let hasil = Math.floor(hargaJual[item] * sellBonus) * jumlah
          totalHasil += hasil
          listJual.push(`${resepEmoji[item] || '🍽️'} ${formatNama(item)} x${jumlah}`)
          delete user.masakan[item]
        }
      }
      for(let item in user.inventory){
        if(hargaJualHasilTernak[item] && user.inventory[item] > 0){
          let jumlah = user.inventory[item]
          let hasil = Math.floor(hargaJualHasilTernak[item] * sellBonus) * jumlah
          totalHasil += hasil
          listJual.push(`${getHasilDisplay(item).emoji} ${getHasilDisplay(item).nama} x${jumlah}`)
          delete user.inventory[item]
        }
      }
      if(totalHasil === 0) return m.reply('❌ Dapur kosong!')
      wdb.money[m.sender] += totalHasil; saveDB(wdb)
      let cap = `╭─❏「 💼 PENYETORAN KE RESTORAN 」❏\n│ Koki : ${m.pushName}\n╰─━━━━━━━━━━━━━━─\n\n📤 *${listJual.length} Masakan Disetor*\n\n💰 +Rp ${totalHasil.toLocaleString()}\n💵 Total: Rp ${wdb.money[m.sender].toLocaleString()}\n\n_“Terima kasih sudah memasak untuk pelanggan!”_`
      return m.reply(cap)
    }
    let itemInput = args[1]
    let amount = args[2] === 'all'? 'all' : (parseInt(args[2]) || 1)
    let itemMenu =!isNaN(itemInput)? nomorKeItemBeli[parseInt(itemInput)] : itemInput.replace(/ /g, '_')
    let itemHasil = getHasilDisplay(itemInput).key
    let item = hargaJual[itemMenu] ? itemMenu : itemHasil
    let stok = hargaJual[item] ? (user.masakan[item] || 0) : (user.inventory[item] || 0)
    if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(item)}`)
    let jual = amount === 'all'? stok : amount
    if (jual > stok) return m.reply(`❌ Stok tidak cukup! Punya: ${stok}`)
    const harga = hargaJual[item] || hargaJualHasilTernak[item]
    let hasil = Math.floor(harga * sellBonus) * jual
    if (hargaJual[item]) {
      user.masakan[item] -= jual; if(user.masakan[item] <= 0) delete user.masakan[item]
    } else {
      user.inventory[item] -= jual; if(user.inventory[item] <= 0) delete user.inventory[item]
    }
    wdb.money[m.sender] += hasil; saveDB(wdb)
    const display = hargaJual[item] ? `${resepEmoji[item] || '🍽️'} ${formatNama(item)}` : `${getHasilDisplay(item).emoji} ${getHasilDisplay(item).nama}`
let cap = `╭─❏「 💼 PENYETORAN KE RESTORAN 」❏\n`
cap += `│ 🍽️ *Menu : ${display}*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📦 *DETAIL PENYETORAN*\n`
cap += `> ↳ Jumlah : ${jual}\n\n`

cap += `💰 +Rp ${hasil.toLocaleString()}\n`
cap += `💵 Total : Rp ${wdb.money[m.sender].toLocaleString()}\n\n`
cap += `─━━━━━━━━━━━━━━─`

return m.reply(cap)
  }
}

handler.help = ['restoran', 'restoran menu', 'restoran info <no/nama>', 'restoran beli <no/nama> <jml>', 'restoran paket <nama>', 'restoran paket list', 'restoran jual <no/nama> <jml/all>', 'jualmasak']
handler.tags = ['rpg']
handler.command = /^(restoran|tokomasak|jualmasak)$/i
handler.alias = ['restoran', 'tokomasak', 'jualmasak']
handler.group = true
export default handler


