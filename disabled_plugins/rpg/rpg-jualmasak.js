import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.masakan) return m.reply('❌ Kamu belum punya masakan apapun.')

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

  let item = text? text.toLowerCase() : 'all'
  let total = 0
  let list = []

  if(item === 'all') {
    let urut = Object.keys(user.masakan).sort((a,b) => (resep[a]?.jual || 0) - (resep[b]?.jual || 0))
    for(let nama of urut) {
      if(resep[nama] && user.masakan[nama] > 0) {
        let jumlah = user.masakan[nama]
        let hargaJual = Math.floor(resep[nama].jual * 0.7) // JUAL 70%
        let hasil = hargaJual * jumlah
        total += hasil
        list.push(`${resep[nama].emoji} ${resep[nama].nama} x${jumlah} = Rp ${hasil.toLocaleString()}`)
        user.masakan[nama] = 0
      }
    }
    if(total === 0) return m.reply('❌ Gaada masakan yang bisa dijual.')
  } else {
    if(!resep[item]) return m.reply(`❌ Masakan *${item}* tidak ada\nNote: pake _. Ex: roti_tawar`)
    if(!user.masakan[item] || user.masakan[item] <= 0) return m.reply(`❌ Kamu tidak punya masakan ${resep[item].nama}`)
    let jumlah = user.masakan[item]
    let hargaJual = Math.floor(resep[item].jual * 0.7) // JUAL 70%
    total = hargaJual * jumlah
    list.push(`${resep[item].emoji} ${resep[item].nama} x${jumlah} = Rp ${total.toLocaleString()}`)
    user.masakan[item] = 0
  }

  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + total
  saveDB(wdb)

  let cap = `✅ *BERHASIL JUAL MASAKAN!*\n\n${list.join('\n')}\n\n💰 Total: Rp ${total.toLocaleString()}\n\n⚠️ Catatan: Harga jual 70% dari harga toko`
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}
handler.help = ['jualmasak <nama/all>']
handler.tags = ['rpg']
handler.command = /^(jualmasak)$/i
handler.group = true
export default handler
