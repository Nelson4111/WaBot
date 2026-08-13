import { loadDB, saveDB, getUserRPG, initLadang, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) { return nama.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)
  if(!user.inventory) user.inventory = {}
  if(!user.ikan) user.ikan = {}
  if(!user.ores) user.ores = {}
  if(!user.masakan) user.masakan = {}

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1
  const buyDiskon = isPrem? 0.8 : 1 // premium diskon 20%

  // HARGA BELI TERBATAS
  const hargaBeli = {
    'iron': { emoji: '⛓️', harga: 10000 },
    'gold': { emoji: '✨', harga: 100000 },
    'stone': { emoji: '🪨', harga: 5000 },
    'wood': { emoji: '🪵', harga: 8000 }, // DITURUNIN
    'diamond': { emoji: '💎', harga: 500000 }
  }

  let args = text? text.toLowerCase().split(' ') : []
  let cmd = args[0]

  function getAllItems() {
    let semuaItem = {}
    for(let i in user.inventory) if(user.inventory[i] > 0) semuaItem[i] = (semuaItem[i] || 0) + user.inventory[i]
    for(let i in user.ikan) if(user.ikan[i] > 0) semuaItem[i] = (semuaItem[i] || 0) + user.ikan[i]
    for(let i in user.ores) if(user.ores[i] > 0) semuaItem[i] = (semuaItem[i] || 0) + user.ores[i]
    for(let i in user.masakan) if(user.masakan[i] > 0) semuaItem[i] = (semuaItem[i] || 0) + user.masakan[i]
    return semuaItem
  }

  // 1. COMMAND BELI -.beli iron 10
  if(cmd === 'beli') {
    let item = args[1]
    let jumlah = parseInt(args[2]) || 1
    if(!item) {
      let cap = `*╭───「 🛒 TOKO TERBATAS 」───╮*\n`
      cap += `│ Diskon Premium: 20%\n`
      cap += `*╰─────────────────╯*\n\n`
      cap += `*📦 ITEM YG DIJUAL:*\n`
      Object.entries(hargaBeli).forEach(([k,v]) => {
        let h = Math.floor(v.harga * buyDiskon)
        cap += `├ ${v.emoji} ${k.toUpperCase()} : Rp ${h.toLocaleString()}\n`
      })
      cap += `\n*Cara:* ${usedPrefix}beli [item] [jumlah]`
      return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
    }

    if(!hargaBeli[item]) return m.reply('❌ Item ini tidak dijual di toko.')

    let hargaSatuan = Math.floor(hargaBeli[item].harga * buyDiskon)
    let totalHarga = hargaSatuan * jumlah

    if(wdb.money[m.sender] < totalHarga) {
      return m.reply(`❌ Uang kamu tidak cukup!\nButuh: Rp ${totalHarga.toLocaleString()}\nPunya: Rp ${wdb.money[m.sender].toLocaleString()}`)
    }

    wdb.money[m.sender] -= totalHarga
    user.inventory[item] = (user.inventory[item] || 0) + jumlah
    saveDB(wdb)
    return m.reply(`✅ *BERHASIL BELI!*\n\n${hargaBeli[item].emoji} ${formatNama(item)} x${jumlah}\n💸 -Rp ${totalHarga.toLocaleString()}`)
  }

  // 2. JUAL ALL
  if(cmd === 'jual' && args[1] === 'all') {
    let semuaItem = getAllItems()
    if(Object.keys(semuaItem).length === 0) return m.reply('❌ Kamu tidak punya item yg bisa dijual.')

    let cap = `*───「 ⚠️ KONFIRMASI JUAL SEMUA 」───*\n\n`
    cap += `Kamu akan menjual semua item yg ada.\n\n`
    Object.keys(semuaItem).forEach(nama => {
      cap += `• ${formatNama(nama)} x${semuaItem[nama].toLocaleString()}\n`
    })
    cap += `\nHarga dihitung sesuai harga di masing2 kategori.\nBonus Premium: ${isPrem? '+10%' : '0%'}\n\n`
    cap += `Ketik *${usedPrefix}jual ya* untuk konfirmasi\n`
    cap += `Ketik *${usedPrefix}jual tidak* untuk batal`

    user.jualAllConfirm = { items: semuaItem, time: Date.now() }
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  // 3. KONFIRMASI
  if(cmd === 'jual' && args[1] === 'ya') {
    if(!user.jualAllConfirm || Date.now() - user.jualAllConfirm.time > 60000) {
      return m.reply('❌ Konfirmasi kadaluarsa. Ketik `.jual all` lagi')
    }
    const { hargaJual: hargaMaterial } = await import('./rpg-jualmaterial.js').catch(() => ({hargaJual:{}}))
    const { hargaJual: hargaPanen } = await import('./rpg-jualpanen.js').catch(() => ({hargaJual:{}}))
    const { hargaJual: hargaIkan } = await import('./rpg-jualikan.js').catch(() => ({hargaJual:{}}))
    const { hargaJual: hargaMasak } = await import('./rpg-jualmasak.js').catch(() => ({hargaJual:{}}))
    const hargaGabung = {...hargaMaterial,...hargaPanen,...hargaIkan,...hargaMasak}

    let totalDapat = 0
    let terjual = 0
    for(let nama in user.jualAllConfirm.items) {
      let jumlah = user.jualAllConfirm.items[nama]
      let hrgSatuan = hargaGabung[nama] || 0
      if(hrgSatuan > 0) {
        totalDapat += Math.floor(hrgSatuan * sellBonus) * jumlah
        terjual++
      }
      delete user.inventory[nama]; delete user.ikan[nama]; delete user.ores[nama]; delete user.masakan[nama]
    }
    wdb.money[m.sender] += totalDapat
    user.jualAllConfirm = null
    saveDB(wdb)
    return m.reply(`✅ *BERHASIL JUAL ${terjual} JENIS ITEM!*\n\n💰 Mendapatkan: Rp ${totalDapat.toLocaleString()}`)
  }

  if(cmd === 'jual' && args[1] === 'tidak') {
    user.jualAllConfirm = null; saveDB(wdb)
    return m.reply('❌ Penjualan dibatalkan.')
  }

  // 4. MENU SHOP
  let cap = `*╭───「 🏪 ZETA MARKET 」───╮*\n`
  cap += `│ Status : ${isPrem? '👑 Premium +10% Jual, -20% Beli' : '👤 User'}\n`
  cap += `│ Uang : Rp ${wdb.money[m.sender].toLocaleString()}\n`
  cap += `*╰─────────────────╯*\n\n`
  cap += `*📦 PILIH KATEGORI JUAL:*\n`
  cap += `1. *${usedPrefix}jualmaterial* \n ⛏️ Material & Ore\n`
  cap += `2. *${usedPrefix}jualpanen* \n 🌾 Hasil Kebun\n`
  cap += `3. *${usedPrefix}jualikan* \n 🎣 Ikan\n`
  cap += `4. *${usedPrefix}jualmasak* \n 🍽️ Masakan\n\n`
  cap += `*⚡ INSTAN:* ${usedPrefix}jual all\n`
  cap += ` → Jual semua item sekaligus\n\n`
  cap += `*🛒 MAU BELI?* ${usedPrefix}beli\n`
  cap += `*📦 CEK GUDANG:* ${usedPrefix}gudang`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}

handler.help = ['shop', 'jual all', 'beli [item] [jumlah]']
handler.tags = ['rpg']
handler.command = /^(shop|jual|beli)$/i
handler.group = true
export default handler