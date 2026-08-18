import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.inventory) user.inventory = {}

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1

  // HARGA BUFF HASIL PANEN
  const harga = {
    'kacang': { emoji: '🥜', harga: 6500 },
    'bawang_putih': { emoji: '🧄', harga: 7500 },
    'padi': { emoji: '🌾', harga: 7500 },
    'bawang_merah': { emoji: '🧅', harga: 8000 },
    'wortel': { emoji: '🥕', harga: 9000 },
    'timun': { emoji: '🥒', harga: 10000 },
    'selada': { emoji: '🥬', harga: 12000 },
    'kentang': { emoji: '🥔', harga: 12500 },
    'tomat': { emoji: '🍅', harga: 13500 },
    'ubi': { emoji: '🍠', harga: 13500 },
    'jagung': { emoji: '🌽', harga: 15000 },
    'brokoli': { emoji: '🥦', harga: 15000 },
    'terong': { emoji: '🍆', harga: 16500 },
    'semangka': { emoji: '🍉', harga: 18000 },
    'lemon': { emoji: '🍋', harga: 18000 },
    'cabai': { emoji: '🌶️', harga: 19500 },
    'paprika': { emoji: '🫑', harga: 19000 },
    'stroberi': { emoji: '🍓', harga: 21000 },
    'jeruk': { emoji: '🍊', harga: 22500 },
    'bluberi': { emoji: '🫐', harga: 22500 },
    'ceri': { emoji: '🍒', harga: 24000 },
    'kastanye': { emoji: '🌰', harga: 25000 },
    'zaitun': { emoji: '🫒', harga: 25500 },
    'pisang': { emoji: '🍌', harga: 27000 },
    'nanas': { emoji: '🍍', harga: 28500 },
    'kiwi': { emoji: '🥝', harga: 28500 },
    'pir': { emoji: '🍐', harga: 30000 },
    'persik': { emoji: '🍑', harga: 30000 },
    'melon': { emoji: '🍈', harga: 31500 },
    'anggur': { emoji: '🍇', harga: 33000 },
    'mangga': { emoji: '🥭', harga: 34500 },
    'apel_hijau': { emoji: '🍏', harga: 36000 },
    'alpukat': { emoji: '🥑', harga: 36000 },
    'apel_merah': { emoji: '🍎', harga: 37500 },
    'kelapa': { emoji: '🥥', harga: 37500 },
    'exp': { emoji: '✨', harga: 50000 },
    'durian': { emoji: '🌳', harga: 75000 },
    'uang': { emoji: '💵', harga: 75000 },
    'koin': { emoji: '🪙', harga: 90000 },
    'emas': { emoji: '⚜️', harga: 300000 },
    'berlian': { emoji: '💠', harga: 350000 } // DARI PERKEBUNAN
  }

  const keys = Object.keys(harga).sort((a,b) => harga[a].harga - harga[b].harga)
  const nomorKeItem = {}
  keys.forEach((k, i) => nomorKeItem[i+1] = k)

  function getItemByInput(input) {
    if(!isNaN(input)) return nomorKeItem[parseInt(input)]
    return input.replace(/ /g, '_') // spasi -> _
  }

  // MENU
  if (!text) {
    let cap = `╭───「 🏪 TOKO PANEN ZETA 」───╮\n`
    cap += `│ 💰 Uang: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `│ ${isPrem? '👑 Premium Bonus +10%' : '👤 User Biasa'}\n`
    cap += `╰─────────────────────╯\n`
    cap += `📌 *MENU JUAL*\n`
    cap += `├ Jual: *${usedPrefix}tokopanen jual <no/nama> <jumlah/all>*\n`
    cap += `├ Contoh: *${usedPrefix}tokopanen jual 5 10*\n`
    cap += `└ Jual Semua: *${usedPrefix}tokopanen jual all*\n\n`
    cap += `📌 *MAU BELI BIBIT?*\n`
    cap += `└ Ketik: *${usedPrefix}tanam* untuk beli & tanam bibit\n\n`
    cap += `*🌾 DAFTAR HARGA JUAL = HARGA BELI*\n`

    keys.forEach((k,i) => {
      let h = Math.floor(harga[k].harga * sellBonus)
      cap += `├ [${i+1}] ${harga[k].emoji} ${formatNama(k).padEnd(15)} Rp ${h.toLocaleString()}\n`
    })
    cap += `━━━━━━━━━━━\n`
    cap += `💡 *Catatan:* Harga jual = Harga beli. Profit dari EXP`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  let args = text.toLowerCase().split(' ').filter(v => v)
  let tipe = args[0]

  if(tipe!== 'jual') return m.reply(`❌ Pakai: *${usedPrefix}tokopanen jual <no/nama> <jumlah/all>*\n\nMau beli bibit? ketik *${usedPrefix}tanam*`)
  args = args.slice(1)

  // JUAL ALL
  if(args[0] === 'all' && args.length === 1){
    let totalHasil = 0, listJual = []
    for(let item in user.inventory){
      if(harga[item]){
        let jumlah = user.inventory[item]
        let hasil = Math.floor(harga[item].harga * sellBonus) * jumlah
        totalHasil += hasil
        listJual.push(`${harga[item].emoji} ${formatNama(item)} x${jumlah}`)
        delete user.inventory[item]
      }
    }
    if(totalHasil === 0) return m.reply(`❌ Kamu tidak punya item yang bisa dijual.\n\nMau nanem dulu? ketik *${usedPrefix}tanam*`)
    wdb.money[m.sender] += totalHasil
    saveDB(wdb)
    return m.reply(`╭──「 🏪 TOKO PANEN ZETA 」──╮\n\n✅ *BERHASIL JUAL SEMUA!*\n\n${listJual.join('\n')}\n\n💰 *Total:* +Rp ${totalHasil.toLocaleString()}\n\n━━━━━━━━━━━━━━`)
  }

  // PARSER
  let amount = 1, itemInput = ''
  if(!isNaN(parseInt(args[0]))){
    if(!isNaN(parseInt(args[1]))){ itemInput = getItemByInput(args[0]); amount = parseInt(args[1]) }
    else if(args[1] === 'all'){ itemInput = getItemByInput(args[0]); amount = 'all' }
    else { itemInput = getItemByInput(args[0]); amount = parseInt(args[1]) || 1 }
  }
  else if(!isNaN(parseInt(args[args.length-1]))){ amount = parseInt(args[args.length-1]); itemInput = getItemByInput(args.slice(0, -1).join(' ')) }
  else if(args[args.length-1] === 'all'){ amount = 'all'; itemInput = getItemByInput(args.slice(0, -1).join(' ')) }
  else { itemInput = getItemByInput(args.join(' ')) }

  if (!harga[itemInput]) return m.reply(`❌ Item "${formatNama(itemInput)}" tidak bisa dijual.\nLihat list: *${usedPrefix}tokopanen*`)

  let stok = user.inventory[itemInput] || 0
  if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(itemInput)}\n\nMau nanem dulu? ketik *${usedPrefix}tanam*`)
  let jual = amount === 'all'? stok : amount
  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

  let hasil = Math.floor(harga[itemInput].harga * sellBonus) * jual
  user.inventory[itemInput] -= jual
  if(user.inventory[itemInput] <= 0) delete user.inventory[itemInput]
  wdb.money[m.sender] += hasil
  saveDB(wdb)
  return m.reply(`╭──「 🏪 TOKO PANEN ZETA 」──╮\n\n✅ *BERHASIL JUAL!*\n${harga[itemInput].emoji} *${formatNama(itemInput)}* x${jual}\n💰 +Rp ${hasil.toLocaleString()}\n\n━━━━━━━━━━━━━━`)
}

handler.help = ['tokopanen', 'tokopanen jual <no/nama> <jumlah/all>', 'tokopanen jual all']
handler.tags = ['rpg']
handler.command = /^(tokopanen|jualpanen)$/i
handler.group = true
export default handler