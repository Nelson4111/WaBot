import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.masakan) user.masakan = {}

  const resep = {
    'roti tawar': { emoji: '🍞', jual: 8000, beli: 12000 },
    'mie goreng': { emoji: '🍜', jual: 18000, beli: 27000 },
    'sate ikan': { emoji: '🍢', jual: 35000, beli: 52500 },
    'salad buah': { emoji: '🥗', jual: 40000, beli: 60000 },
    'sup ikan': { emoji: '🍲', jual: 40000, beli: 60000 },
    'taco ikan': { emoji: '🌮', jual: 45000, beli: 67500 },
    'udang goreng': { emoji: '🍤', jual: 90000, beli: 135000 },
    'jus durian': { emoji: '🥛', jual: 100000, beli: 150000 },
    'cumi goreng': { emoji: '🦑', jual: 110000, beli: 165000 },
    'wine': { emoji: '🍷', jual: 120000, beli: 180000 },
    'kepiting rebus': { emoji: '🦀', jual: 120000, beli: 180000 },
    'sushi': { emoji: '🍣', jual: 400000, beli: 600000 },
    'sashimi': { emoji: '🍣', jual: 500000, beli: 750000 },
    'lobster bakar': { emoji: '🦞', jual: 600000, beli: 900000 },
    'tuna panggang': { emoji: '🐟', jual: 600000, beli: 900000 },
    'salmon asap': { emoji: '🐟', jual: 600000, beli: 900000 },
    'steak hiu': { emoji: '🦈', jual: 900000, beli: 1350000 },
    'pari bakar': { emoji: '🛸', jual: 1000000, beli: 1500000 },
    'penyu panggang': { emoji: '🐢', jual: 1200000, beli: 1800000 },
    'steak emas': { emoji: '🥩', jual: 1500000, beli: 2250000 },
    'diamond cake': { emoji: '🎂', jual: 3000000, beli: 4500000 },
    'sop kraken': { emoji: '🦑', jual: 2000000, beli: 3000000 },
    'sate megalodon': { emoji: '🦈', jual: 2500000, beli: 3750000 },
    'sup leviathan': { emoji: '🐉', jual: 3000000, beli: 4500000 },
    'sea dragon grill': { emoji: '🐲', jual: 3500000, beli: 5250000 },
    'hydra stew': { emoji: '🐍', jual: 4500000, beli: 6750000 },
    'kura titan soup': { emoji: '🐢', jual: 5000000, beli: 7500000 },
    'paus putih steak': { emoji: '🐋', jual: 6000000, beli: 9000000 },
    'naga laut bakar': { emoji: '🐉', jual: 8000000, beli: 12000000 },
    'raja ubur jelly': { emoji: '🪼', jual: 9000000, beli: 13500000 },
    'steak godzilla': { emoji: '🦖', jual: 15000000, beli: 22500000 }
  }

  let args = text.split(' ')
  let item = args[0]? args[0].toLowerCase() : ''
  let jumlah = parseInt(args[1]) || 1

  if(!item) {
    let list = Object.keys(resep).map(nama => {
      let r = resep[nama]
      return `${r.emoji} ${nama}\nBeli: Rp ${r.beli.toLocaleString()} | Jual: Rp ${r.jual.toLocaleString()}`
    }).join('\n\n')
    let cap = `┌───❏「 🛒 TOKO MASAKAN 」❏\n│\n│ Cara beli: *.belimasak nama jumlah*\n│ Contoh: *.belimasak sushi 3*\n│ Margin toko: +50% | Jual Kembali: 70%\n│\n│ ${list}\n└───────────────────`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  if(!resep[item]) return m.reply(`❌ Masakan ${item} tidak ada di toko`)
  if(jumlah < 1) return m.reply('❌ Jumlah minimal 1')

  let hargaTotal = resep[item].beli * jumlah
  let uang = wdb.money[m.sender] || 0
  if(uang < hargaTotal) return m.reply(`❌ Uang kamu kurang!\nButuh: Rp ${hargaTotal.toLocaleString()}\nPunya: Rp ${uang.toLocaleString()}`)

  wdb.money[m.sender] -= hargaTotal
  user.masakan[item] = (user.masakan[item] || 0) + jumlah
  saveDB(wdb)

  let cap = `┌───❏「 ✅ BERHASIL BELI 」❏\n│\n│ ${resep[item].emoji} ${item} x${jumlah}\n│ 💰 Harga Satuan: Rp ${resep[item].beli.toLocaleString()}\n│ 💸 Total Bayar: Rp ${hargaTotal.toLocaleString()}\n│\n│ Sisa Uang: Rp ${wdb.money[m.sender].toLocaleString()}\n│ Total ${item}: ${user.masakan[item]} pcs\n└───────────────────`
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [m.sender])
}
handler.help = ['belimasak <nama> <jumlah>']
handler.tags = ['rpg']
handler.command = /^(belimasak|beli)$/i
handler.group = true
export default handler