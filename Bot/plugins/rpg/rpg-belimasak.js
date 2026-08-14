import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.masakan) user.masakan = {}

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

  let args = text.trim().split(' ')
  let action = args[0]?.toLowerCase()

  // 1. LIST TOKO
  if(!action || action === 'list' || action === 'toko') {
    let list = Object.keys(resep).map(key => {
      let r = resep[key]
      return `${r.emoji} ${r.nama}\nBeli: Rp ${r.beli.toLocaleString()} | Jual: Rp ${r.jual.toLocaleString()}`
    }).join('\n\n')
    let cap = `┌───❏「 🛒 TOKO MASAKAN 」❏\n│\n│ Cara beli: *.belimasak beli nama_jumlah*\n│ Contoh: *.belimasak beli sushi_3*\n│ Cara jual: *.belimasak jual nama_jumlah*\n│ Format cepat: *.belimasak sushi_3*\n│ Margin toko: +50% | Jual Kembali: 70%\n│\n│ ${list}\n└───────────────────`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  // 2. BELI
  if(action === 'beli') {
    let item = args[1]?.toLowerCase()
    let jumlah = parseInt(args[2]) || 1

    if(!item) return m.reply('❌ Format: *.belimasak beli nama_jumlah*\nContoh: *.belimasak beli sushi_3*')
    if(!resep[item]) return m.reply(`❌ Masakan *${item}* tidak ada di toko\nKetik *.belimasak* buat liat list\nNote: pake _ ya. Ex: roti_tawar`)
    if(jumlah < 1) return m.reply('❌ Jumlah minimal 1')

    let hargaTotal = resep[item].beli * jumlah
    let uang = wdb.money[m.sender] || 0
    if(uang < hargaTotal) return m.reply(`❌ Uang kamu kurang!\nButuh: Rp ${hargaTotal.toLocaleString()}\nPunya: Rp ${uang.toLocaleString()}`)

    wdb.money[m.sender] -= hargaTotal
    user.masakan[item] = (user.masakan[item] || 0) + jumlah
    saveDB(wdb)

    let cap = `┌───❏「 ✅ BERHASIL BELI 」❏\n│\n│ ${resep[item].emoji} ${resep[item].nama} x${jumlah}\n│ 💰 Harga Satuan: Rp ${resep[item].beli.toLocaleString()}\n│ 💸 Total Bayar: Rp ${hargaTotal.toLocaleString()}\n│\n│ Sisa Uang: Rp ${wdb.money[m.sender].toLocaleString()}\n│ Total ${resep[item].nama}: ${user.masakan[item]} pcs\n└───────────────────`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [m.sender])
  }

  // 3. JUAL
  if(action === 'jual') {
    let item = args[1]?.toLowerCase()
    let jumlah = parseInt(args[2]) || 1

    if(!item) return m.reply('❌ Format: *.belimasak jual nama_jumlah*\nContoh: *.belimasak jual sushi_2*')
    if(!resep[item]) return m.reply(`❌ Masakan *${item}* tidak ada`)
    if(!user.masakan[item] || user.masakan[item] < jumlah) return m.reply(`❌ Kamu cuma punya ${user.masakan[item] || 0} ${resep[item].nama}`)
    if(jumlah < 1) return m.reply('❌ Jumlah minimal 1')

    let hargaJual = Math.floor(resep[item].jual * 0.7) // jual balik 70% biar sama kaya.jualmasak
    let totalDapat = hargaJual * jumlah

    user.masakan[item] -= jumlah
    if(user.masakan[item] <= 0) delete user.masakan[item]
    wdb.money[m.sender] = (wdb.money[m.sender] || 0) + totalDapat
    saveDB(wdb)

    let cap = `┌───❏「 💰 BERHASIL JUAL 」❏\n│\n│ ${resep[item].emoji} ${resep[item].nama} x${jumlah}\n│ 💰 Harga Jual: Rp ${hargaJual.toLocaleString()}/pcs\n│ 💸 Total Dapat: Rp ${totalDapat.toLocaleString()}\n│\n│ Sisa Uang: Rp ${wdb.money[m.sender].toLocaleString()}\n│ Sisa ${resep[item].nama}: ${user.masakan[item] || 0} pcs\n└───────────────────`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [m.sender])
  }

  // 4. FORMAT CEPAT:.belimasak sushi_3
  if(action.includes('_')) {
    let split = action.split('_')
    let jumlah = parseInt(split.pop()) || 1
    let item = split.join('_')

    if(!resep[item]) return m.reply(`❌ Masakan *${item}* tidak ada di toko`)

    let hargaTotal = resep[item].beli * jumlah
    let uang = wdb.money[m.sender] || 0
    if(uang < hargaTotal) return m.reply(`❌ Uang kamu kurang!\nButuh: Rp ${hargaTotal.toLocaleString()}\nPunya: Rp ${uang.toLocaleString()}`)

    wdb.money[m.sender] -= hargaTotal
    user.masakan[item] = (user.masakan[item] || 0) + jumlah
    saveDB(wdb)

    let cap = `┌───❏「 ✅ BERHASIL BELI 」❏\n│\n│ ${resep[item].emoji} ${resep[item].nama} x${jumlah}\n│ 💰 Harga Satuan: Rp ${resep[item].beli.toLocaleString()}\n│ 💸 Total Bayar: Rp ${hargaTotal.toLocaleString()}\n│\n│ Sisa Uang: Rp ${wdb.money[m.sender].toLocaleString()}\n│ Total ${resep[item].nama}: ${user.masakan[item]} pcs\n└───────────────────`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [m.sender])
  }

  return m.reply(`❌ Command tidak dikenali\n*.belimasak* → Lihat toko\n*.belimasak beli sushi_3* → Beli\n*.belimasak jual sushi_2* → Jual\n*.belimasak sushi_3* → Beli cepat`)
}

handler.help = ['belimasak', 'belimasak beli <nama_jumlah>', 'belimasak jual <nama_jumlah>']
handler.tags = ['rpg']
handler.command = /^(belimasak)$/i // UDAH DIHAPUS 'beli'
handler.group = true
export default handler