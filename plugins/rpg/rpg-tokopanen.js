import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  if (!nama || typeof nama !== 'string') return ''
  return nama.replace(/_/g, ' ').split(/\s+/).filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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
    'sawit': { emoji: '🌴', harga: 50000 },
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
    let cap = `╭─❏「 🏪 KOPERASI AVELIA 」❏\n`
    cap += `│ 💰 Uang: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `│ 👤 ${isPrem ? 'Premium +10% jual, -20% beli' : 'User biasa'}\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    cap += `📌 *MENU JUAL*\n`
    cap += `> ↳ Jual: *${usedPrefix}koperasi jual <no/nama> <jumlah/all>*\n`
    cap += `> ↳ Contoh: *${usedPrefix}koperasi jual 5 10*\n`
    cap += `> ↳ Jual Semua: *${usedPrefix}koperasi jual all*\n\n`

    cap += `📌 *MAU BELI BIBIT?*\n`
    cap += `> ↳ Ketik: *${usedPrefix}tanam* untuk beli & tanam bibit\n\n`

    cap += `🌾 *DAFTAR HARGA JUAL = HARGA BELI*\n`
    cap += `> ↳ Pilih nomor panen untuk menjual hasil kebun. Harga mengikuti nilai dasar panen.\n\n`

    keys.forEach((k,i) => {
      let h = Math.floor(harga[k].harga * sellBonus)
      const nama = formatNama(k)
      cap += `${harga[k].emoji || '📦'} *${i + 1}. ${nama}*\n`
      cap += `> ↳ Sell : Rp ${h.toLocaleString()}\n`
    })

    cap += `\n─━━━━━━━━━━━━━━─\n\n`
    cap += `💡 *Catatan:* Harga jual = Harga beli. Profit dari EXP`

    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  let args = text.toLowerCase().split(' ').filter(v => v)
  let tipe = args[0]

  if(tipe!== 'jual') return m.reply(
    `❌ Pakai: *${usedPrefix}koperasi jual <no/nama> <jumlah/all>*\n\n` +
    `Mau beli bibit? ketik *${usedPrefix}tanam*`
  )

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

    if(totalHasil === 0) return m.reply(
      `❌ Kamu tidak punya item yang bisa dijual.\n\n` +
      `Mau nanem dulu? ketik *${usedPrefix}tanam*`
    )

    wdb.money[m.sender] += totalHasil
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🏪 KOPERASI AVELIA 」❏\n` +
      `│ ✅ *BERHASIL JUAL SEMUA!*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🌾 *DAFTAR PANEN TERJUAL*\n` +
      `${listJual.map(v => `> ↳ ${v}`).join('\n')}\n\n` +
      `💰 *Total:* +Rp ${totalHasil.toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  // PARSER
  let amount = 1, itemInput = ''

  if(!isNaN(parseInt(args[0]))){
    if(!isNaN(parseInt(args[1]))){
      itemInput = getItemByInput(args[0])
      amount = parseInt(args[1])
    }
    else if(args[1] === 'all'){
      itemInput = getItemByInput(args[0])
      amount = 'all'
    }
    else {
      itemInput = getItemByInput(args[0])
      amount = parseInt(args[1]) || 1
    }
  }
  else if(!isNaN(parseInt(args[args.length-1]))){
    amount = parseInt(args[args.length-1])
    itemInput = getItemByInput(args.slice(0, -1).join(' '))
  }
  else if(args[args.length-1] === 'all'){
    amount = 'all'
    itemInput = getItemByInput(args.slice(0, -1).join(' '))
  }
  else {
    itemInput = getItemByInput(args.join(' '))
  }

  if (!harga[itemInput]) return m.reply(
    `❌ Item "${formatNama(itemInput)}" tidak bisa dijual.\n` +
    `Lihat list: *${usedPrefix}koperasi*`
  )

  let stok = user.inventory[itemInput] || 0

  if (stok <= 0) return m.reply(
    `❌ Kamu tidak punya ${formatNama(itemInput)}\n\n` +
    `Mau nanem dulu? ketik *${usedPrefix}tanam*`
  )

  let jual = amount === 'all'? stok : amount

  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

  let hasil = Math.floor(harga[itemInput].harga * sellBonus) * jual
  user.inventory[itemInput] -= jual
  if(user.inventory[itemInput] <= 0) delete user.inventory[itemInput]
  wdb.money[m.sender] += hasil
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🏪 KOPERASI AVELIA 」❏\n` +
    `│ ✅ *BERHASIL JUAL!*\n` +
    `│ ${harga[itemInput].emoji} *${formatNama(itemInput)}* x${jual}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ 💰 +Rp ${hasil.toLocaleString()}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['koperasi', 'koperasi jual <no/nama> <jumlah/all>', 'koperasi jual all', 'tokopanen']
handler.tags = ['rpg']
handler.command = /^(koperasi|tokopanen|jualpanen)$/i
handler.alias = ['koperasi', 'tokopanen', 'jualpanen']
handler.group = true
export default handler