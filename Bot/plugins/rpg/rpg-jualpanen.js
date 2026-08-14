import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) { return nama.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.inventory) user.inventory = {}

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1

  const harga = {
    'padi': { emoji: '🌾', harga: 150 }, 'jagung': { emoji: '🌽', harga: 300 }, 'semangka': { emoji: '🍉', harga: 500 },
    'jeruk': { emoji: '🍊', harga: 600 }, 'mangga': { emoji: '🥭', harga: 1200 }, 'apel merah': { emoji: '🍎', harga: 1500 },
    'apel hijau': { emoji: '🍏', harga: 1400 }, 'durian': { emoji: '🌳', harga: 5000 }, 'pisang': { emoji: '🍌', harga: 800 },
    'anggur': { emoji: '🍇', harga: 1100 }, 'stroberi': { emoji: '🍓', harga: 700 }, 'bluberi': { emoji: '🫐', harga: 750 },
    'melon': { emoji: '🍈', harga: 1000 }, 'ceri': { emoji: '🍒', harga: 850 }, 'persik': { emoji: '🍑', harga: 900 },
    'alpukat': { emoji: '🥑', harga: 1300 }, 'kiwi': { emoji: '🥝', harga: 950 }, 'kelapa': { emoji: '🥥', harga: 1400 },
    'nanas': { emoji: '🍍', harga: 1050 }, 'selada': { emoji: '🥬', harga: 400 }, 'timun': { emoji: '🥒', harga: 350 },
    'wortel': { emoji: '🥕', harga: 300 }, 'zaitun': { emoji: '🫒', harga: 900 }, 'bawang putih': { emoji: '🧄', harga: 250 },
    'bawang merah': { emoji: '🧅', harga: 280 }, 'cabai': { emoji: '🌶️', harga: 650 }, 'paprika': { emoji: '🫑', harga: 600 },
    'kentang': { emoji: '🥔', harga: 400 }, 'ubi': { emoji: '🍠', harga: 420 }, 'kastanye': { emoji: '🌰', harga: 800 },
    'kacang': { emoji: '🥜', harga: 200 }, 'brokoli': { emoji: '🥦', harga: 550 }, 'terong': { emoji: '🍆', harga: 580 },
    'tomat': { emoji: '🍅', harga: 450 }, 'pir': { emoji: '🍐', harga: 1000 }, 'lemon': { emoji: '🍋', harga: 650 }
  }

  if (!text) {
    let cap = `╭───「 🌾 ZETA PANEN MARKET 」───╮\n`
    cap += `│ ${isPrem? '👑 Premium Bonus +10%' : '👤 User Biasa'}\n`
    cap += `╰─────────────────╯\n\n`
    cap += `📌 Cara jual: *${usedPrefix}jualpanen <nama> <jumlah/all>*\n`
    cap += `💡 Bisa pake spasi atau _\n\n`
    cap += `*🌾 DAFTAR HARGA*\n`
    
    Object.entries(harga).forEach(([k,v]) => {
      let h = Math.floor(v.harga * sellBonus)
      cap += `├ ${v.emoji} ${formatNama(k).padEnd(15)} Rp ${h.toLocaleString()}\n`
    })
    cap += `━━━━━━━━━━━━━━━━━━━`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  let args = text.toLowerCase().split(' ')
  let amount = args[args.length-1] === 'all'? 'all' : (parseInt(args[args.length-1]) || 1)
  let itemInput = amount === 'all'? args.slice(0, -1).join(' ') : args.join(' ')

  // KUNCI: ubah _ jadi spasi biar support 2 versi
  let item = itemInput.replace(/_/g, ' ')

  if (!harga[item]) return m.reply(`❌ Hasil panen "${itemInput}" tidak ada.\nLihat list: *${usedPrefix}jualpanen*`)
  
  let stok = user.inventory[item] || 0
  if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(item)}`)
  let jual = amount === 'all'? stok : amount
  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

  let hasil = Math.floor(harga[item].harga * sellBonus) * jual
  user.inventory[item] -= jual
  if(user.inventory[item] <= 0) delete user.inventory[item]
  wdb.money[m.sender] += hasil
  saveDB(wdb)
  return m.reply(`╭──「 🌾 ZETA PANEN MARKET 」──╮\n\n✅ *BERHASIL JUAL!*\n${harga[item].emoji} *${formatNama(item)}* x${jual}\n💰 +Rp ${hasil.toLocaleString()}\n\n━━━━━━━━━━━━━━━━━━━`)
}

handler.help = ['jualpanen <nama> <jumlah/all>']
handler.tags = ['rpg']
handler.command = /^(jualpanen)$/i
handler.group = true
export default handler
