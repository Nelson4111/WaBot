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
    'roti tawar': { emoji: '🍞', jual: 8000, bahan: { 'padi': 3 }, biaya: 0, waktu: 60000, exp: 20 },
    'mie goreng': { emoji: '🍜', jual: 18000, bahan: { 'padi': 2, 'wortel': 1 }, biaya: 8000, waktu: 120000, exp: 40 },
    'sate ikan': { emoji: '🍢', jual: 35000, bahan: { 'ikan teri': 3, 'cabai': 1 }, biaya: 0, waktu: 180000, exp: 60 },
    'salad buah': { emoji: '🥗', jual: 40000, bahan: { 'apel merah': 1, 'jeruk': 1, 'anggur': 1, 'semangka': 1, 'stroberi': 1 }, biaya: 0, waktu: 180000, exp: 80 },
    'sup ikan': { emoji: '🍲', jual: 40000, bahan: { 'ikan nila': 1, 'wortel': 1, 'kentang': 1 }, biaya: 0, waktu: 240000, exp: 70 },
    'taco ikan': { emoji: '🌮', jual: 45000, bahan: { 'jagung': 2, 'ikan kembung': 1, 'tomat': 1 }, biaya: 0, waktu: 300000, exp: 65 },
    'udang goreng': { emoji: '🍤', jual: 90000, bahan: { 'udang': 3 }, biaya: 0, waktu: 360000, exp: 90 },
    'cumi goreng': { emoji: '🦑', jual: 110000, bahan: { 'cumi': 2 }, biaya: 0, waktu: 360000, exp: 100 },
    'kepiting rebus': { emoji: '🦀', jual: 120000, bahan: { 'kepiting': 2 }, biaya: 0, waktu: 420000, exp: 110 },
    'jus durian': { emoji: '🥛', jual: 100000, bahan: { 'durian': 1, 'kelapa': 1 }, biaya: 0, waktu: 600000, exp: 200 },
    'wine': { emoji: '🍷', jual: 120000, bahan: { 'anggur': 5 }, biaya: 0, waktu: 900000, exp: 150 },
    'sushi': { emoji: '🍣', jual: 400000, bahan: { 'padi': 2, 'salmon': 2 }, biaya: 0, waktu: 600000, exp: 130 },
    'sashimi': { emoji: '🍣', jual: 500000, bahan: { 'tuna': 2 }, biaya: 0, waktu: 600000, exp: 140 },
    'lobster bakar': { emoji: '🦞', jual: 600000, bahan: { 'lobster': 1 }, biaya: 0, waktu: 900000, exp: 150 },
    'tuna panggang': { emoji: '🐟', jual: 600000, bahan: { 'tuna': 2 }, biaya: 0, waktu: 900000, exp: 180 },
    'salmon asap': { emoji: '🐟', jual: 600000, bahan: { 'salmon': 2 }, biaya: 0, waktu: 1200000, exp: 185 },
    'steak hiu': { emoji: '🦈', jual: 900000, bahan: { 'hiu hitam': 1, 'hiu biru': 1 }, biaya: 20000, waktu: 1200000, exp: 200 },
    'pari bakar': { emoji: '🛸', jual: 1000000, bahan: { 'ikan pari': 1 }, biaya: 0, waktu: 1500000, exp: 210 },
    'penyu panggang': { emoji: '🐢', jual: 1200000, bahan: { 'penyu hijau': 1 }, biaya: 50000, waktu: 1800000, exp: 230 },
    'steak emas': { emoji: '🥩', jual: 1500000, bahan: { 'emas': 1 }, biaya: 100000, waktu: 1800000, exp: 500 },
    'diamond cake': { emoji: '🎂', jual: 3000000, bahan: { 'diamond': 1, 'apel merah': 3, 'stroberi': 3 }, biaya: 0, waktu: 3600000, exp: 1000 },
    'sop kraken': { emoji: '🦑', jual: 2000000, bahan: { 'kraken': 1, 'rumput laut': 3 }, biaya: 100000, waktu: 3600000, exp: 800 },
    'sate megalodon': { emoji: '🦈', jual: 2500000, bahan: { 'megalodon': 1 }, biaya: 150000, waktu: 4500000, exp: 900 },
    'sup leviathan': { emoji: '🐉', jual: 3000000, bahan: { 'leviathan': 1 }, biaya: 200000, waktu: 5400000, exp: 1000 },
    'sea dragon grill': { emoji: '🐲', jual: 3500000, bahan: { 'sea dragon': 1 }, biaya: 250000, waktu: 5400000, exp: 1100 },
    'hydra stew': { emoji: '🐍', jual: 4500000, bahan: { 'hydra laut': 1 }, biaya: 300000, waktu: 7200000, exp: 1300 },
    'kura titan soup': { emoji: '🐢', jual: 5000000, bahan: { 'titan kura': 1 }, biaya: 400000, waktu: 7200000, exp: 1500 },
    'paus putih steak': { emoji: '🐋', jual: 6000000, bahan: { 'paus putih': 1 }, biaya: 500000, waktu: 9000000, exp: 1600 },
    'naga laut bakar': { emoji: '🐉', jual: 8000000, bahan: { 'naga laut': 1 }, biaya: 700000, waktu: 9000000, exp: 1800 },
    'raja ubur jelly': { emoji: '🦑', jual: 9000000, bahan: { 'raja ubur': 1 }, biaya: 800000, waktu: 10800000, exp: 1900 },
    'steak godzilla': { emoji: '🦖', jual: 15000000, bahan: { 'godzilla': 1 }, biaya: 2000000, waktu: 14400000, exp: 15000 }
  }

  function punyaBahan(bahan) {
    for(let item in bahan) {
      let punya = user.inventory[item] || user.ikan[item] || 0
      if(punya < bahan[item]) return false
    }
    return true
  }
  function ambilBahan(bahan) {
    for(let item in bahan) {
      if(user.ikan[item]!== undefined) user.ikan[item] -= bahan[item]
      else user.inventory[item] -= bahan[item]
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
        cap += `${i+1}. ${item.emoji} *${item.nama}*\n └ ${status}\n`
      })
      cap += `\n📦 Ambil hasil : *${usedPrefix}ambilmasak*`
    }
    cap += `\n\n━━━━━━━━━━━\n📌.masak resep - Lihat semua resep\n📌.masak resep <nama> - Detail resep\n📌.masak <nama> - Masak`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  // LIAT SEMUA RESEP
  if(action === 'resep' &&!masakan){
    let cap = `╭──「 📖 ZETA RECIPE BOOK 」──╮\n\n`
    cap += `📌 Lihat detail : *.masak resep <nama>*\n`
    cap += `📌 Masak : *.masak <nama>*\n\n`

    cap += `🟢 *MAKANAN MURAH* < 100RB\n`
    Object.entries(resep).filter(([k,v]) => v.jual < 100000).forEach(([k,v]) => {
      cap += `${v.emoji} ${k}\n └ Rp ${v.jual.toLocaleString()} | ${formatWaktu(v.waktu)} | +${v.exp} exp\n`
    })

    cap += `\n🔵 *MAKANAN MAHAL* 100RB - 1JT\n`
    Object.entries(resep).filter(([k,v]) => v.jual >= 100000 && v.jual < 1000000).forEach(([k,v]) => {
      cap += `${v.emoji} ${k}\n └ Rp ${v.jual.toLocaleString()} | ${formatWaktu(v.waktu)} | +${v.exp} exp\n`
    })

    cap += `\n🔴 *MAKANAN LEGEND* > 1JT\n`
    Object.entries(resep).filter(([k,v]) => v.jual >= 1000000).forEach(([k,v]) => {
      cap += `${v.emoji} ${k}\n └ Rp ${v.jual.toLocaleString()} | ${formatWaktu(v.waktu)} | +${v.exp} exp\n`
    })
    cap += `━━━━━━━━━━━━━━━━━━━`
    return m.reply(cap)
  }

  // LIAT DETAIL 1 RESEP
  if(action === 'resep' && masakan){
    if(!resep[masakan]) return m.reply(`❌ Resep ${masakan} tidak ada\nLihat daftar: *${usedPrefix}masak resep*`)
    let r = resep[masakan]
    let cap = `╭──「 📖 DETAIL RESEP 」──╮\n\n`
    cap += `${r.emoji} *${masakan.toUpperCase()}*\n\n`
    cap += `💰 Harga Jual : Rp ${r.jual.toLocaleString()}\n`
    cap += `💸 Biaya Masak : Rp ${r.biaya.toLocaleString()}\n`
    cap += `⏰ Waktu Masak : ${formatWaktu(r.waktu)}\n`
    cap += `📈 Exp : +${r.exp}\n\n`
    cap += `📦 *BAHAN-BAHAN:*\n`
    Object.entries(r.bahan).forEach(([b,j]) => {
      let punya = user.inventory[b] || user.ikan[b] || 0
      let status = punya >= j? '✅' : '❌'
      cap += `${status} ${j}x ${b} [Punya: ${punya}]\n`
    })
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  // PROSES MASAK
  if(!resep[action]) return m.reply(`❌ Masakan ${action} tidak ada\nLihat daftar resep: *${usedPrefix}masak resep*`)
  let r = resep[action]
  if(user.dapur.antrian.length >= user.dapur.slot) return m.reply(`❌ Dapur penuh! Slot: ${user.dapur.antrian.length}/${user.dapur.slot}\nUpgrade dapur dulu dengan *${usedPrefix}upgradedapur*`)
  if(!punyaBahan(r.bahan)) {
    let kurang = []
    for(let item in r.bahan) {
      let punya = user.inventory[item] || user.ikan[item] || 0
      if(punya < r.bahan[item]) kurang.push(`${r.bahan[item] - punya}x ${item}`)
    }
    return m.reply(`❌ Bahan kurang!\nButuh: ${Object.entries(r.bahan).map(([b,j]) => `${j}x ${b}`).join(', ')}\nKurang: ${kurang.join(', ')}`)
  }
  let userMoney = wdb.money[m.sender] || 0
  if(userMoney < r.biaya) return m.reply(`❌ Uang kurang! Butuh biaya tambahan Rp ${r.biaya.toLocaleString()}`)

  ambilBahan(r.bahan)
  wdb.money[m.sender] -= r.biaya
  user.dapur.antrian.push({ nama: action, emoji: r.emoji, selesai: Date.now() + r.waktu, exp: r.exp, harga: r.jual })
  saveDB(wdb)
  return m.reply(`╭──「 👨‍🍳 ZETA KITCHEN 」──╮\n\n✅ *MASUK ANTRIAN!*\n${r.emoji} *${action.toUpperCase()}*\n⏰ Selesai : ${formatWaktu(r.waktu)}\n📦 Slot : ${user.dapur.antrian.length}/${user.dapur.slot}\n\n⚠️ Ingat ambil dalam 5 jam ya!\n━━━━━━━━━━━━━━━━━━━`)
}

handler.help = ['dapur', 'masak <nama>', 'masak resep']
handler.tags = ['rpg']
handler.command = /^(masak|dapur)$/i
handler.group = true
export default handler
