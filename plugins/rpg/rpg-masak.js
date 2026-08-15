import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan.adventure')
  if(!user.ikan) user.ikan = {}
  if(!user.inventory) user.inventory = {}
  if(!user.dapur) user.dapur = { slot: 1, antrian: [] }

  const resep = {
    // === MURAH ===
    'roti_tawar': { emoji: '🍞', jual: 8000, bahan: { 'padi': 3 }, biaya: 0, waktu: 60000, exp: 20 },
    'mie_goreng': { emoji: '🍜', jual: 18000, bahan: { 'padi': 2, 'wortel': 1 }, biaya: 8000, waktu: 120000, exp: 40 },
    'sate_ikan': { emoji: '🍢', jual: 35000, bahan: { 'ikan_teri': 3, 'cabai': 1 }, biaya: 0, waktu: 180000, exp: 60 },
    'salad_buah': { emoji: '🥗', jual: 40000, bahan: { 'apel_merah': 1, 'jeruk': 1, 'anggur': 1, 'semangka': 1, 'stroberi': 1 }, biaya: 0, waktu: 180000, exp: 80 },
    'sup_ikan': { emoji: '🍲', jual: 40000, bahan: { 'ikan_nila': 1, 'wortel': 1, 'kentang': 1 }, biaya: 0, waktu: 240000, exp: 70 },
    'taco_ikan': { emoji: '🌮', jual: 45000, bahan: { 'jagung': 2, 'ikan_kembung': 1, 'tomat': 1 }, biaya: 0, waktu: 300000, exp: 65 },
    'udang_goreng': { emoji: '🍤', jual: 90000, bahan: { 'udang': 3 }, biaya: 0, waktu: 360000, exp: 90 },
    'cumi_goreng': { emoji: '🦑', jual: 110000, bahan: { 'cumi': 2 }, biaya: 0, waktu: 360000, exp: 100 },
    'kepiting_rebus': { emoji: '🦀', jual: 120000, bahan: { 'kepiting': 2 }, biaya: 0, waktu: 420000, exp: 110 },

    // === MAHAL ===
    'jus_durian': { emoji: '🥛', jual: 100000, bahan: { 'durian': 1, 'kelapa': 1 }, biaya: 0, waktu: 600000, exp: 200 },
    'wine': { emoji: '🍷', jual: 120000, bahan: { 'anggur': 5 }, biaya: 0, waktu: 900000, exp: 150 },
    'sushi': { emoji: '🍣', jual: 400000, bahan: { 'padi': 2, 'salmon': 2 }, biaya: 0, waktu: 600000, exp: 130 },
    'sashimi': { emoji: '🍣', jual: 500000, bahan: { 'tuna': 2 }, biaya: 0, waktu: 600000, exp: 140 },
    'lobster_bakar': { emoji: '🦞', jual: 600000, bahan: { 'lobster': 1 }, biaya: 0, waktu: 900000, exp: 150 },
    'tuna_panggang': { emoji: '🐟', jual: 600000, bahan: { 'tuna': 2 }, biaya: 0, waktu: 900000, exp: 180 },
    'salmon_asap': { emoji: '🐟', jual: 600000, bahan: { 'salmon': 2 }, biaya: 0, waktu: 1200000, exp: 185 },
    'steak_hiu': { emoji: '🦈', jual: 900000, bahan: { 'hiu_hitam': 1, 'hiu_biru': 1 }, biaya: 20000, waktu: 1200000, exp: 200 },

    // === LEGEND ===
    'pari_bakar': { emoji: '🛸', jual: 1000000, bahan: { 'ikan_pari': 1 }, biaya: 0, waktu: 1500000, exp: 210 },
    'penyu_panggang': { emoji: '🐢', jual: 1200000, bahan: { 'penyu_hijau': 1 }, biaya: 50000, waktu: 1800000, exp: 230 },
    'steak_emas': { emoji: '🥩', jual: 1500000, bahan: { 'emas': 1 }, biaya: 100000, waktu: 1800000, exp: 500 },
    'diamond_cake': { emoji: '🎂', jual: 3000000, bahan: { 'diamond': 1, 'apel_merah': 3, 'stroberi': 3 }, biaya: 0, waktu: 3600000, exp: 1000 },
    'sop_kraken': { emoji: '🦑', jual: 2000000, bahan: { 'kraken': 1, 'rumput_laut': 3 }, biaya: 100000, waktu: 3600000, exp: 800 },
    'sate_megalodon': { emoji: '🦈', jual: 2500000, bahan: { 'megalodon': 1 }, biaya: 150000, waktu: 4500000, exp: 900 },
    'sup_leviathan': { emoji: '🐉', jual: 3000000, bahan: { 'leviathan': 1 }, biaya: 200000, waktu: 5400000, exp: 1000 },
    'sea_dragon_grill': { emoji: '🐲', jual: 3500000, bahan: { 'sea_dragon': 1 }, biaya: 250000, waktu: 5400000, exp: 1100 },
    'hydra_stew': { emoji: '🐍', jual: 4500000, bahan: { 'hydra_laut': 1 }, biaya: 300000, waktu: 7200000, exp: 1300 },
    'kura_titan_soup': { emoji: '🐢', jual: 5000000, bahan: { 'titan_kura': 1 }, biaya: 400000, waktu: 7200000, exp: 1500 },
    'paus_putih_steak': { emoji: '🐋', jual: 6000000, bahan: { 'paus_putih': 1 }, biaya: 500000, waktu: 9000000, exp: 1600 },
    'naga_laut_bakar': { emoji: '🐉', jual: 8000000, bahan: { 'naga_laut': 1 }, biaya: 700000, waktu: 9000000, exp: 1800 },
    'raja_ubur_jelly': { emoji: '🦑', jual: 9000000, bahan: { 'raja_ubur': 1 }, biaya: 800000, waktu: 10800000, exp: 1900 },
    'steak_godzilla': { emoji: '🦖', jual: 15000000, bahan: { 'godzilla': 1 }, biaya: 2000000, waktu: 14400000, exp: 15000 }
  }

  // MIGRASI TANDA
  if(!user.migrasi_dapur_v1){
    user.migrasi_dapur_v1 = true
    saveDB(wdb)
  }

  // HELPER
  const daftarResep = Object.keys(resep)
  const nomorKeResep = {}
  daftarResep.forEach((k, i) => nomorKeResep[i+1] = k)

  function formatNamaItem(nama){
    return nama.replace(/_/g, ' ')
  }
  function getItemCount(nama){
    nama = nama.replace(/ /g, '_')
    return user.inventory[nama] || user.ikan[nama] || 0
  }
  function kurangiItem(nama, jumlah){
    nama = nama.replace(/ /g, '_')
    if(user.ikan[nama]!== undefined) user.ikan[nama] -= jumlah
    else user.inventory[nama] -= jumlah
  }
  function punyaBahan(bahan) {
    for(let item in bahan) {
      if(getItemCount(item) < bahan[item]) return false
    }
    return true
  }
  function ambilBahan(bahan) {
    for(let item in bahan) {
      kurangiItem(item, bahan[item])
    }
  }
  function formatWaktu(ms) {
    let jam = Math.floor(ms / 3600000)
    let menit = Math.floor((ms % 3600000) / 60000)
    let detik = Math.floor((ms % 60000) / 1000)
    if(jam > 0) return `${jam}j ${menit}m`
    if(menit > 0) return `${menit}m ${detik}d`
    return `${detik}d`
  }

  let args = text? text.split(' ') : []
  let action = args[0]?.toLowerCase()
  let masakan = args.slice(1).join(' ').toLowerCase()

  // MENU UTAMA DAPUR
  if (!text || command === 'dapur') {
    let cap = `╭──「 👨‍🍳 ZETA KITCHEN 」──╮\n\n`
    cap += `⏰ Slot : ${user.dapur.antrian.length}/${user.dapur.slot}\n`
    cap += `⚠️ Ambil dalam 5 jam setelah matang\n\n`
    if(user.dapur.antrian.length === 0) cap += `_✨ Dapur masih kosong_\n_Masak sesuatu yuk!_`
    else {
      cap += `🍳 *ANTRIAN MASAKAN*\n`
      user.dapur.antrian.forEach((item, i) => {
        let sisa = item.selesai - Date.now()
        let status = sisa > 0? `⏳ ${formatWaktu(sisa)} lagi` : sisa > -18000000? `✅ Siap diambil!` : `🔥 Gosong ${formatWaktu(Math.abs(sisa))} lalu`
        cap += `${i+1}. ${item.emoji} *${formatNamaItem(item.nama)}*\n └ ${status}\n`
      })
      cap += `\n📦 Ambil hasil : *${usedPrefix}ambilmasak*`
    }
    cap += `\n\n━━━━━━━━━━━\n📌.masak resep - Lihat semua resep\n📌.masak resep <no/nama> - Detail resep\n📌.masak <no/nama> - Masak`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  // LIAT SEMUA RESEP
  if(action === 'resep' &&!masakan){
    let cap = `╭──「 📖 ZETA RECIPE BOOK 」──╮\n\n`
    cap += `📌 Lihat detail : *.masak resep <no/nama>*\n`
    cap += `📌 Masak : *.masak <no/nama>*\n\n`

    let no = 1
    cap += `🟢 *MAKANAN MURAH* < 100RB\n`
    Object.entries(resep).filter(([k,v]) => v.jual < 100000).forEach(([k,v]) => {
      cap += `[${no++}] ${v.emoji} ${formatNamaItem(k)}\n └ Rp ${v.jual.toLocaleString()} | ${formatWaktu(v.waktu)} | +${v.exp} exp\n`
    })

    cap += `\n🔵 *MAKANAN MAHAL* 100RB - 1JT\n`
    Object.entries(resep).filter(([k,v]) => v.jual >= 100000 && v.jual < 1000000).forEach(([k,v]) => {
      cap += `[${no++}] ${v.emoji} ${formatNamaItem(k)}\n └ Rp ${v.jual.toLocaleString()} | ${formatWaktu(v.waktu)} | +${v.exp} exp\n`
    })

    cap += `\n🔴 *MAKANAN LEGEND* > 1JT\n`
    Object.entries(resep).filter(([k,v]) => v.jual >= 1000000).forEach(([k,v]) => {
      cap += `[${no++}] ${v.emoji} ${formatNamaItem(k)}\n └ Rp ${v.jual.toLocaleString()} | ${formatWaktu(v.waktu)} | +${v.exp} exp\n`
    })
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
  }

  // LIAT DETAIL 1 RESEP
  if(action === 'resep' && masakan){
    let key =!isNaN(masakan)? nomorKeResep[parseInt(masakan)] : masakan.replace(/ /g, '_')
    if(!resep[key]) return m.reply(`❌ Resep ${masakan} tidak ada\nLihat daftar: *${usedPrefix}masak resep*`)
    let r = resep[key]
    let cap = `╭──「 📖 DETAIL RESEP 」──╮\n\n`
    cap += `${r.emoji} *${formatNamaItem(key).toUpperCase()}*\n\n`
    cap += `💰 Harga Jual : Rp ${r.jual.toLocaleString()}\n`
    cap += `💸 Biaya Masak : Rp ${r.biaya.toLocaleString()}\n`
    cap += `⏰ Waktu Masak : ${formatWaktu(r.waktu)}\n`
    cap += `📈 Exp : +${r.exp}\n\n`
    cap += `📦 *BAHAN-BAHAN:*\n`
    Object.entries(r.bahan).forEach(([b,j]) => {
      let punya = getItemCount(b)
      let status = punya >= j? '✅' : '❌'
      cap += `${status} ${j}x ${formatNamaItem(b)} [Punya: ${punya}]\n`
    })
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  // PROSES MASAK
  let keyMasak =!isNaN(action)? nomorKeResep[parseInt(action)] : action.replace(/ /g, '_')
  if(!resep[keyMasak]) return m.reply(`❌ Masakan ${action} tidak ada\nLihat daftar resep: *${usedPrefix}masak resep*`)
  let r = resep[keyMasak]

  if(user.dapur.antrian.length >= user.dapur.slot) return m.reply(`❌ Dapur penuh! Slot: ${user.dapur.antrian.length}/${user.dapur.slot}\nUpgrade dapur dulu dengan *${usedPrefix}upgradedapur*`)

  if(!punyaBahan(r.bahan)) {
    let kurang = []
    for(let item in r.bahan) {
      let punya = getItemCount(item)
      if(punya < r.bahan[item]) kurang.push(`${r.bahan[item] - punya}x ${formatNamaItem(item)}`)
    }
    return m.reply(`❌ Bahan kurang!\nButuh: ${Object.entries(r.bahan).map(([b,j]) => `${j}x ${formatNamaItem(b)}`).join(', ')}\nKurang: ${kurang.join(', ')}`)
  }

  let userMoney = wdb.money[m.sender] || 0
  if(userMoney < r.biaya) return m.reply(`❌ Uang kurang! Butuh biaya tambahan Rp ${r.biaya.toLocaleString()}`)

  ambilBahan(r.bahan)
  wdb.money[m.sender] -= r.biaya
  user.dapur.antrian.push({ nama: keyMasak, emoji: r.emoji, selesai: Date.now() + r.waktu, exp: r.exp, harga: r.jual })
  saveDB(wdb)
  return m.reply(`╭──「 👨‍🍳 ZETA KITCHEN 」──╮\n\n✅ *MASUK ANTRIAN!*\n${r.emoji} *${formatNamaItem(keyMasak).toUpperCase()}*\n⏰ Selesai : ${formatWaktu(r.waktu)}\n📦 Slot : ${user.dapur.antrian.length}/${user.dapur.slot}\n\n⚠️ Ingat ambil dalam 5 jam ya!\n━━━━━━━━━━━━━━━━━━━`)
}

handler.help = ['dapur', 'masak <nama/no>', 'masak resep']
handler.tags = ['rpg']
handler.command = /^(masak|dapur)$/i
handler.group = true
export default handler