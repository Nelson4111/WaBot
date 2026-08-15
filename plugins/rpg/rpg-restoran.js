import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.masakan) user.masakan = {}

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1

  // RESEP SAMA KAYAK PUNYA KAMU
  const resep = {
    'roti_tawar': { emoji: '🍞', nama: 'Roti Tawar', jual: 8000, beli: 12000 },
    'mie_goreng': { emoji: '🍜', nama: 'Mie Goreng', jual: 18000, beli: 27000 },
    'sate_ikan': { emoji: '🍢', nama: 'Sate Ikan', jual: 35000, beli: 52500 },
    'salad_buah': { emoji: '🥗', nama: 'Salad Buah', jual: 40000, beli: 60000 },
    'sup_ikan': { emoji: '🍲', nama: 'Sup Ikan', jual: 40000, beli: 60000 },
    'taco_ikan': { emoji: '🌮', nama: 'Taco Ikan', jual: 45000, beli: 67500 },
    'udang_goreng': { emoji: '🍤', nama: 'Udang Goreng', jual: 90000, beli: 135000 },
    'jus_durian': { emoji: '🥛', nama: 'Jus Durian', jual: 100000, beli: 150000 },
    'cumi_goreng': { emoji: '🦑', nama: 'Cumi Goreng', jual: 110000, beli: 165000 },
    'wine': { emoji: '🍷', nama: 'Wine', jual: 120000, beli: 180000 },
    'kepiting_rebus': { emoji: '🦀', nama: 'Kepiting Rebus', jual: 120000, beli: 180000 },
    'sushi': { emoji: '🍣', nama: 'Sushi', jual: 400000, beli: 600000 },
    'sashimi': { emoji: '🍣', nama: 'Sashimi', jual: 500000, beli: 750000 },
    'lobster_bakar': { emoji: '🦞', nama: 'Lobster Bakar', jual: 600000, beli: 900000 },
    'tuna_panggang': { emoji: '🐟', nama: 'Tuna Panggang', jual: 600000, beli: 900000 },
    'salmon_asap': { emoji: '🐟', nama: 'Salmon Asap', jual: 600000, beli: 900000 },
    'steak_hiu': { emoji: '🦈', nama: 'Steak Hiu', jual: 900000, beli: 1350000 },
    'pari_bakar': { emoji: '🛸', nama: 'Pari Bakar', jual: 1000000, beli: 1500000 },
    'penyu_panggang': { emoji: '🐢', nama: 'Penyu Panggang', jual: 1200000, beli: 1800000 },
    'steak_emas': { emoji: '🥩', nama: 'Steak Emas', jual: 1500000, beli: 2250000 },
    'diamond_cake': { emoji: '🎂', nama: 'Diamond Cake', jual: 3000000, beli: 4500000 },
    'sop_kraken': { emoji: '🦑', nama: 'Sop Kraken', jual: 2000000, beli: 3000000 },
    'sate_megalodon': { emoji: '🦈', nama: 'Sate Megalodon', jual: 2500000, beli: 3750000 },
    'sup_leviathan': { emoji: '🐉', nama: 'Sup Leviathan', jual: 3000000, beli: 4500000 },
    'sea_dragon_grill': { emoji: '🐲', nama: 'Sea Dragon Grill', jual: 3500000, beli: 5250000 },
    'hydra_stew': { emoji: '🐍', nama: 'Hydra Stew', jual: 4500000, beli: 6750000 },
    'kura_titan_soup': { emoji: '🐢', nama: 'Kura Titan Soup', jual: 5000000, beli: 7500000 },
    'paus_putih_steak': { emoji: '🐋', nama: 'Paus Putih Steak', jual: 6000000, beli: 9000000 },
    'naga_laut_bakar': { emoji: '🐉', nama: 'Naga Laut Bakar', jual: 8000000, beli: 12000000 },
    'raja_ubur_jelly': { emoji: '🦑', nama: 'Raja Ubur Jelly', jual: 9000000, beli: 13500000 },
    'steak_godzilla': { emoji: '🦖', nama: 'Steak Godzilla', jual: 15000000, beli: 22500000 }
  }

  const keys = Object.keys(resep).sort((a,b) => resep[a].beli - resep[b].beli)
  const nomorKeItem = {}
  keys.forEach((k, i) => nomorKeItem[i+1] = k)

  function getItemByInput(input) {
    if(!isNaN(input)) return nomorKeItem[parseInt(input)]
    return input.replace(/ /g, '_')
  }

  let args = text? text.toLowerCase().split(' ').filter(v => v) : []
  let action = args[0]

  // 1. MENU / LIST
  if (!action || action === 'list' || action === 'toko') {
    let cap = `╭───「 🍽️ RESTORAN ZETA 」───╮\n`
    cap += `│ 💰 Uang: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `│ ${isPrem? '👑 Premium Bonus +10% Jual' : '👤 User Biasa'}\n`
    cap += `╰─────────────────────╯\n`
    cap += `📌 *MENU*\n`
    cap += `├ Beli: *${usedPrefix}restoran beli <no/nama> <jumlah>*\n`
    cap += `├ Jual: *${usedPrefix}restoran jual <no/nama> <jumlah/all>*\n`
    cap += `└ Contoh: *${usedPrefix}restoran beli 5 2*\n\n`
    cap += `*📋 DAFTAR MENU*\n`

    keys.forEach((k,i) => {
      let r = resep[k]
      let hargaBeli = Math.floor(r.beli)
      let hargaJual = Math.floor(r.jual * 0.7 * sellBonus) // jual 70% + bonus prem
      cap += `├ [${i+1}] ${r.emoji} ${formatNama(k).padEnd(18)} Beli:Rp${hargaBeli.toLocaleString()}\n`
      cap += `│ Jual:Rp${hargaJual.toLocaleString()}\n`
    })
    cap += `━━━━━━━━━━━\n`
    cap += `💡 Catatan: Jual = 70% Harga Beli`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  // 2. BELI
  if(action === 'beli') {
    args = args.slice(1)
    let itemInput = getItemByInput(args[0])
    let jumlah = parseInt(args[1]) || 1

    if(!resep[itemInput]) return m.reply(`❌ Menu *${args[0]}* tidak ada.\nLihat list: *${usedPrefix}restoran*`)
    if(jumlah < 1) return m.reply('❌ Jumlah minimal 1')

    let hargaTotal = resep[itemInput].beli * jumlah
    let uang = wdb.money[m.sender] || 0
    if(uang < hargaTotal) return m.reply(`❌ Uang kamu kurang!\nButuh: Rp ${hargaTotal.toLocaleString()}`)

    wdb.money[m.sender] -= hargaTotal
    user.masakan[itemInput] = (user.masakan[itemInput] || 0) + jumlah
    saveDB(wdb)

    return m.reply(`╭──「 🍽️ RESTORAN ZETA 」──╮\n\n✅ *BERHASIL BELI!*\n${resep[itemInput].emoji} *${resep[itemInput].nama}* x${jumlah}\n💰 -Rp ${hargaTotal.toLocaleString()}\n\nSisa Uang: Rp ${wdb.money[m.sender].toLocaleString()}\n\n━━━━━━━━━━━━━━`)
  }

  // 3. JUAL
  if(action === 'jual') {
    args = args.slice(1)

    // JUAL ALL
    if(args[0] === 'all'){
      let totalHasil = 0, listJual = []
      for(let item in user.masakan){
        if(resep[item] && user.masakan[item] > 0){
          let jumlah = user.masakan[item]
          let hargaJual = Math.floor(resep[item].jual * 0.7 * sellBonus)
          let hasil = hargaJual * jumlah
          totalHasil += hasil
          listJual.push(`${resep[item].emoji} ${resep[item].nama} x${jumlah}`)
          delete user.masakan[item]
        }
      }
      if(totalHasil === 0) return m.reply(`❌ Kamu tidak punya masakan untuk dijual.`)
      wdb.money[m.sender] += totalHasil
      saveDB(wdb)
      return m.reply(`╭──「 🍽️ RESTORAN ZETA 」──╮\n\n✅ *BERHASIL JUAL SEMUA!*\n\n${listJual.join('\n')}\n\n💰 *Total:* +Rp ${totalHasil.toLocaleString()}\n\n━━━━━━━━━━━━━━`)
    }

    // JUAL 1 ITEM
    let itemInput = getItemByInput(args[0])
    let jumlah = args[1] === 'all'? 'all' : (parseInt(args[1]) || 1)

    if(!resep[itemInput]) return m.reply(`❌ Menu *${args[0]}* tidak ada.`)
    let stok = user.masakan[itemInput] || 0
    if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${resep[itemInput].nama}`)
    let jual = jumlah === 'all'? stok : jumlah
    if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

    let hargaJual = Math.floor(resep[itemInput].jual * 0.7 * sellBonus)
    let total = hargaJual * jual

    user.masakan[itemInput] -= jual
    if(user.masakan[itemInput] <= 0) delete user.masakan[itemInput]
    wdb.money[m.sender] += total
    saveDB(wdb)

    return m.reply(`╭──「 🍽️ RESTORAN ZETA 」──╮\n\n✅ *BERHASIL JUAL!*\n${resep[itemInput].emoji} *${resep[itemInput].nama}* x${jual}\n💰 +Rp ${total.toLocaleString()}\n\n━━━━━━━━━━━━━━`)
  }

  return m.reply(`❌ Command salah\n*.restoran* → Lihat toko\n*.restoran beli sushi 3*\n*.restoran jual sushi 2*\n*.restoran jual all*`)
}

handler.help = ['restoran', 'restoran beli <no/nama> <jml>', 'restoran jual <no/nama/all>']
handler.tags = ['rpg']
handler.command = /^(restoran|tokomasak)$/i
handler.group = true
export default handler