import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)

  const isPrem = global.db.data.users[m.sender]?.premium
  const buyDiscount = isPrem? 0.8 : 1

  const bibit = {
    'kacang': { emoji: '🥜', harga: 4500, waktu: 480000 },
    'bawang putih': { emoji: '🧄', harga: 5000, waktu: 500000 },
    'padi': { emoji: '🌾', harga: 5000, waktu: 180000 },
    'bawang merah': { emoji: '🧅', harga: 5500, waktu: 520000 },
    'wortel': { emoji: '🥕', harga: 6000, waktu: 550000 },
    'timun': { emoji: '🥒', harga: 7000, waktu: 600000 },
    'selada': { emoji: '🥬', harga: 8000, waktu: 650000 },
    'kentang': { emoji: '🥔', harga: 8500, waktu: 640000 },
    'tomat': { emoji: '🍅', harga: 9000, waktu: 680000 },
    'ubi': { emoji: '🍠', harga: 9000, waktu: 660000 },
    'jagung': { emoji: '🌽', harga: 10000, waktu: 300000 },
    'brokoli': { emoji: '🥦', harga: 10000, waktu: 700000 },
    'terong': { emoji: '🍆', harga: 11000, waktu: 720000 },
    'semangka': { emoji: '🍉', harga: 12000, waktu: 600000 },
    'lemon': { emoji: '🍋', harga: 12000, waktu: 800000 },
    'cabai': { emoji: '🌶', harga: 13000, waktu: 780000 },
    'paprika': { emoji: '🫑', harga: 12500, waktu: 750000 },
    'stroberi': { emoji: '🍓', harga: 14000, waktu: 850000 },
    'jeruk': { emoji: '🍊', harga: 15000, waktu: 900000 },
    'bluberi': { emoji: '🫐', harga: 15000, waktu: 870000 },
    'ceri': { emoji: '🍒', harga: 16000, waktu: 900000 },
    'kastanye': { emoji: '🌰', harga: 16500, waktu: 920000 },
    'zaitun': { emoji: '🫒', harga: 17000, waktu: 950000 },
    'pisang': { emoji: '🍌', harga: 18000, waktu: 1000000 },
    'nanas': { emoji: '🍍', harga: 19000, waktu: 1100000 },
    'kiwi': { emoji: '🥝', harga: 19000, waktu: 1050000 },
    'pir': { emoji: '🍐', harga: 20000, waktu: 1200000 },
    'persik': { emoji: '🍑', harga: 20000, waktu: 1150000 },
    'melon': { emoji: '🍈', harga: 21000, waktu: 1250000 },
    'anggur': { emoji: '🍇', harga: 22000, waktu: 1300000 },
    'mangga': { emoji: '🥭', harga: 23000, waktu: 1200000 },
    'apel hijau': { emoji: '🍏', harga: 24000, waktu: 1450000 },
    'alpukat': { emoji: '🥑', harga: 24000, waktu: 1350000 },
    'apel merah': { emoji: '🍎', harga: 25000, waktu: 1500000 },
    'kelapa': { emoji: '🥥', harga: 25000, waktu: 1400000 },
    'exp': { emoji: '✨', harga: 40000, waktu: 1600000 },
    'durian': { emoji: '🌳', harga: 50000, waktu: 1800000 },
    'uang': { emoji: '💵', harga: 50000, waktu: 1800000 },
    'koin': { emoji: '🪙', harga: 60000, waktu: 2000000 },
    'emas': { emoji: '⚜️', harga: 200000, waktu: 3600000 },
    'diamond': { emoji: '💎', harga: 250000, waktu: 7200000 }
  }

  let slotKosong = []
  for (let i = 1; i <= user.maxLadang; i++) {
    if (!user.ladang[i]) slotKosong.push(i)
  }
  if (slotKosong.length === 0) return m.reply(`❌ Semua ladang sudah penuh.`)

  if (!text) {
    let cap = `🌱 *DAFTAR BIBIT ZETA*\n`
    cap += `Status: ${isPrem? '👑 Premium - Diskon 20%' : '👤 User Normal'}\n\n`
    cap += `*─── TERMURAH ───*\n`
    Object.entries(bibit).slice(0, 10).forEach(([name, info]) => {
      let hargaFinal = Math.floor(info.harga * buyDiscount)
      cap += `${info.emoji} ${name} - Rp ${hargaFinal.toLocaleString()}\n`
    })
    cap += `\n*─── MENENGAH ───*\n`
    Object.entries(bibit).slice(10, 25).forEach(([name, info]) => {
      let hargaFinal = Math.floor(info.harga * buyDiscount)
      cap += `${info.emoji} ${name} - Rp ${hargaFinal.toLocaleString()}\n`
    })
    cap += `\n*─── TERMAHAL ───*\n`
    Object.entries(bibit).slice(25).forEach(([name, info]) => {
      let hargaFinal = Math.floor(info.harga * buyDiscount)
      cap += `${info.emoji} ${name} - Rp ${hargaFinal.toLocaleString()}\n`
    })
    cap += `\n*CARA TANAM:* \n• Per slot: *${usedPrefix}tanam wortel*\n• Slot tertentu: *${usedPrefix}tanam diamond 1*\n• Semua slot: *${usedPrefix}tanam koin all*`
    return m.reply(cap)
  }

  let args = text.toLowerCase().split(' ')
  let jenis = args[0]
  if(bibit[args[0] + ' ' + args[1]]) jenis = args[0] + ' ' + args[1]
  let slotTarget = args[args.length - 1]
  let isAll = slotTarget === 'all'

  if (!bibit[jenis]) return m.reply(`❌ Jenis bibit *${jenis}* tidak ada.\nKetik *${usedPrefix}tanam* untuk lihat daftar.`)

  let info = bibit[jenis]
  let hargaFinal = Math.floor(info.harga * buyDiscount)
  let userMoney = wdb.money[m.sender] || 0

  if (isAll) {
    let count = 0
    let totalBiaya = 0
    for (let slot of slotKosong) {
      if (userMoney >= hargaFinal) {
        user.ladang[slot] = { jenis: jenis, waktuTanam: Date.now() }
        userMoney -= hargaFinal
        totalBiaya += hargaFinal
        count++
      } else break
    }
    if (count === 0) return m.reply(`❌ Uang tidak cukup. Butuh Rp ${hargaFinal.toLocaleString()}/bibit`)
    wdb.money[m.sender] = userMoney
    saveDB(wdb)
    return m.reply(`🌱 *TANAM MASSAL BERHASIL!*\n\n${info.emoji} ${jenis.toUpperCase()} x${count}\n💸 Biaya: Rp ${totalBiaya.toLocaleString()}\n💰 Sisa: Rp ${userMoney.toLocaleString()}`)
  }

  let slotNum = parseInt(slotTarget)
  let slotPilih =!isNaN(slotNum) && user.ladang[slotNum] === undefined? slotNum : slotKosong[0]
  if (!slotPilih) return m.reply(`❌ Slot ladang tidak tersedia.`)
  if (userMoney < hargaFinal) return m.reply(`❌ Uang tidak cukup. Butuh Rp ${hargaFinal.toLocaleString()}`)

  wdb.money[m.sender] -= hargaFinal
  user.ladang[slotPilih] = { jenis: jenis, waktuTanam: Date.now() }
  saveDB(wdb)
  return m.reply(`🌱 *BERHASIL TANAM!*\n\n${info.emoji} ${jenis.toUpperCase()}\n📍 *Ladang:* ${slotPilih}\n💸 *Biaya:* Rp ${hargaFinal.toLocaleString()}\n💰 *Sisa:* Rp ${wdb.money[m.sender].toLocaleString()}`)
}
handler.help = ['tanam']
handler.tags = ['rpg']
handler.command = /^(tanam|berkebun)$/i
handler.group = true
export default handler
