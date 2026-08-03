import { loadDB, saveDB, getUserRPG, initLadang, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)

  const isPrem = global.db.data.users[m.sender]?.premium
  const buyDiscount = isPrem ? 0.8 : 1
  const sellBonus = isPrem ? 1.1 : 1

  const market = {
    'iron': { emoji: '⛓️', harga: 5000 },
    'gold': { emoji: '✨', harga: 50000 },
    'stone': { emoji: '🪨', harga: 2000 },
    'diamond': { emoji: '💎', harga: 250000 },
    'lele': { emoji: '🐟', harga: 10000 },
    'nila': { emoji: '🐠', harga: 15000 },
    'bawal': { emoji: '🐡', harga: 25000 },
    'hiu': { emoji: '🦈', harga: 150000 },
    'padi': { emoji: '🌾', harga: 20000 },
    'jagung': { emoji: '🌽', harga: 40000 },
    'semangka': { emoji: '🍉', harga: 70000 },
    'jeruk': { emoji: '🍊', harga: 110000 }, 
    'mangga': { emoji: '🥭', harga: 160000 },
    'apel': { emoji: '🍎', harga: 200000 },
    'durian': { emoji: '🌳', harga: 350000 },
    'emas': { emoji: '⚜️', harga: 1500000 }
  }

  const hargaBeli = {
    'iron': { emoji: '⛓️', harga: 10000 },
    'gold': { emoji: '✨', harga: 100000 },
    'stone': { emoji: '🪨', harga: 5000 },
    'diamond': { emoji: '💎', harga: 500000 }
  }

  if (!text || command === 'shop') {
    let cap = `*───「 ZETA MARKET 」───*\n\n`
    cap += `Status: ${isPrem ? '👑 Premium' : '👤 User'}\n\n`
    cap += `*🛒 CARA BELI:* ${usedPrefix}beli [item] [jumlah]\n`
    cap += `*💰 CARA JUAL:* ${usedPrefix}jual [item] [jumlah]\n\n`
    
    cap += `*📦 MATERIAL (BELI):*\n`
    for (let i in hargaBeli) {
      let harga = Math.floor(hargaBeli[i].harga * buyDiscount)
      cap += `${hargaBeli[i].emoji} ${i.toUpperCase()}: Rp ${harga.toLocaleString()}\n`
    }
    
    cap += `\n*💎 DAFTAR HARGA JUAL:*\n`
    let listJual = Object.keys(market).map(v => {
      let harga = Math.floor(market[v].harga * sellBonus)
      return `${market[v].emoji} ${v.toUpperCase()}: Rp ${harga.toLocaleString()}`
    }).join('\n')
    cap += listJual

    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  let args = text.toLowerCase().split(' ')
  let item = args[0]
  let amount = args[1] === 'all' ? 'all' : (parseInt(args[1]) || 1)

  if (command === 'beli' || command === 'buy') {
    if (amount === 'all') return m.reply('❌ Tidak bisa membeli "all".')
    if (amount <= 0) return m.reply('❌ Jumlah minimal 1.')
    if (!hargaBeli[item]) return m.reply('❌ Barang tidak tersedia.')
    
    let hargaItem = Math.floor(hargaBeli[item].harga * buyDiscount)
    let totalHarga = hargaItem * amount
    let money = wdb.money[m.sender] || 0

    if (money < totalHarga) return m.reply(`❌ Uang tidak cukup!`)

    wdb.money[m.sender] -= totalHarga
    user[item] = (user[item] || 0) + amount
    saveDB(wdb)

    return m.reply(`✅ Membeli ${amount} ${hargaBeli[item].emoji} ${item}\n💸 Total: Rp ${totalHarga.toLocaleString()}`)
  }

  if (command === 'jual' || command === 'sell') {
    if (!market[item]) return m.reply('❌ Barang tidak bisa dijual.')
    
    let lokasi = ""
    let stok = 0

    if (user[item] !== undefined) {
      stok = user[item]; lokasi = "rpg"
    } else if (user.ikan && user.ikan[item] !== undefined) {
      stok = user.ikan[item]; lokasi = "ikan"
    } else if (user.hasilKebun && user.hasilKebun[item] !== undefined) {
      stok = user.hasilKebun[item]; lokasi = "kebun"
    }

    if (stok <= 0) return m.reply(`❌ Kamu tidak memiliki stok.`)
    
    let jumlahJual = (amount === 'all') ? stok : amount
    if (jumlahJual > stok) return m.reply(`❌ Stok tidak cukup!`)
    if (jumlahJual <= 0) return m.reply('❌ Jumlah minimal 1.')

    let hargaJual = Math.floor(market[item].harga * sellBonus)
    let totalHasil = hargaJual * jumlahJual
    
    if (lokasi === "rpg") user[item] -= jumlahJual
    else if (lokasi === "ikan") user.ikan[item] -= jumlahJual
    else if (lokasi === "kebun") user.hasilKebun[item] -= jumlahJual

    wdb.money[m.sender] = (wdb.money[m.sender] || 0) + totalHasil
    saveDB(wdb)

    return m.reply(`✅ Menjual ${jumlahJual} ${market[item].emoji} ${item}\n💰 Mendapatkan: Rp ${totalHasil.toLocaleString()}`)
  }
}

handler.help = ['jual', 'beli', 'shop']
handler.tags = ['rpg']
handler.command = /^(jual|shop|sell|beli|buy)$/i
handler.group = true

export default handler