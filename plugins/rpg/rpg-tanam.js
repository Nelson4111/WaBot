import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

// DATA BIBIT UNTUK TANAM & PANEN
const bibit = {
  'kacang': { emoji: '🥜', harga: 4500, waktu: 480000, exp: 110, hasil: { item: 'kacang', jumlah: 1 } },
  'bawang_putih': { emoji: '🧄', harga: 5000, waktu: 500000, exp: 120, hasil: { item: 'bawang_putih', jumlah: 1 } },
  'padi': { emoji: '🌾', harga: 5000, waktu: 180000, exp: 50, hasil: { item: 'padi', jumlah: 1 } },
  'bawang_merah': { emoji: '🧅', harga: 5500, waktu: 520000, exp: 130, hasil: { item: 'bawang_merah', jumlah: 1 } },
  'wortel': { emoji: '🥕', harga: 6000, waktu: 550000, exp: 140, hasil: { item: 'wortel', jumlah: 1 } },
  'timun': { emoji: '🥒', harga: 7000, waktu: 600000, exp: 150, hasil: { item: 'timun', jumlah: 1 } },
  'selada': { emoji: '🥬', harga: 8000, waktu: 650000, exp: 160, hasil: { item: 'selada', jumlah: 1 } },
  'kentang': { emoji: '🥔', harga: 8500, waktu: 640000, exp: 160, hasil: { item: 'kentang', jumlah: 1 } },
  'tomat': { emoji: '🍅', harga: 9000, waktu: 680000, exp: 170, hasil: { item: 'tomat', jumlah: 1 } },
  'ubi': { emoji: '🍠', harga: 9000, waktu: 660000, exp: 170, hasil: { item: 'ubi', jumlah: 1 } },
  'jagung': { emoji: '🌽', harga: 10000, waktu: 300000, exp: 100, hasil: { item: 'jagung', jumlah: 1 } },
  'brokoli': { emoji: '🥦', harga: 10000, waktu: 700000, exp: 180, hasil: { item: 'brokoli', jumlah: 1 } },
  'terong': { emoji: '🍆', harga: 11000, waktu: 720000, exp: 190, hasil: { item: 'terong', jumlah: 1 } },
  'semangka': { emoji: '🍉', harga: 12000, waktu: 600000, exp: 150, hasil: { item: 'semangka', jumlah: 1 } },
  'lemon': { emoji: '🍋', harga: 12000, waktu: 800000, exp: 200, hasil: { item: 'lemon', jumlah: 1 } },
  'cabai': { emoji: '🌶', harga: 13000, waktu: 780000, exp: 210, hasil: { item: 'cabai', jumlah: 1 } },
  'paprika': { emoji: '🫑', harga: 12500, waktu: 750000, exp: 200, hasil: { item: 'paprika', jumlah: 1 } },
  'stroberi': { emoji: '🍓', harga: 14000, waktu: 850000, exp: 220, hasil: { item: 'stroberi', jumlah: 1 } },
  'jeruk': { emoji: '🍊', harga: 15000, waktu: 900000, exp: 250, hasil: { item: 'jeruk', jumlah: 1 } },
  'bluberi': { emoji: '🫐', harga: 15000, waktu: 870000, exp: 240, hasil: { item: 'bluberi', jumlah: 1 } },
  'ceri': { emoji: '🍒', harga: 16000, waktu: 900000, exp: 260, hasil: { item: 'ceri', jumlah: 1 } },
  'kastanye': { emoji: '🌰', harga: 16500, waktu: 920000, exp: 280, hasil: { item: 'kastanye', jumlah: 1 } },
  'zaitun': { emoji: '🫒', harga: 17000, waktu: 950000, exp: 300, hasil: { item: 'zaitun', jumlah: 1 } },
  'pisang': { emoji: '🍌', harga: 18000, waktu: 1000000, exp: 300, hasil: { item: 'pisang', jumlah: 1 } },
  'nanas': { emoji: '🍍', harga: 19000, waktu: 1100000, exp: 340, hasil: { item: 'nanas', jumlah: 1 } },
  'kiwi': { emoji: '🥝', harga: 19000, waktu: 1050000, exp: 320, hasil: { item: 'kiwi', jumlah: 1 } },
  'pir': { emoji: '🍐', harga: 20000, waktu: 1200000, exp: 350, hasil: { item: 'pir', jumlah: 1 } },
  'persik': { emoji: '🍑', harga: 20000, waktu: 1150000, exp: 360, hasil: { item: 'persik', jumlah: 1 } },
  'melon': { emoji: '🍈', harga: 21000, waktu: 1250000, exp: 380, hasil: { item: 'melon', jumlah: 1 } },
  'anggur': { emoji: '🍇', harga: 22000, waktu: 1300000, exp: 400, hasil: { item: 'anggur', jumlah: 1 } },
  'mangga': { emoji: '🥭', harga: 23000, waktu: 1200000, exp: 400, hasil: { item: 'mangga', jumlah: 1 } },
  'apel_hijau': { emoji: '🍏', harga: 24000, waktu: 1450000, exp: 480, hasil: { item: 'apel_hijau', jumlah: 1 } },
  'alpukat': { emoji: '🥑', harga: 24000, waktu: 1350000, exp: 420, hasil: { item: 'alpukat', jumlah: 1 } },
  'apel_merah': { emoji: '🍎', harga: 25000, waktu: 1500000, exp: 500, hasil: { item: 'apel_merah', jumlah: 1 } },
  'kelapa': { emoji: '🥥', harga: 25000, waktu: 1400000, exp: 450, hasil: { item: 'kelapa', jumlah: 1 } },
  'exp': { emoji: '✨', harga: 40000, waktu: 1600000, exp: 800, hasil: { item: 'exp', jumlah: 2000 } },
  'durian': { emoji: '🌳', harga: 50000, waktu: 1800000, exp: 800, hasil: { item: 'durian', jumlah: 1 } },
  'uang': { emoji: '💵', harga: 50000, waktu: 1800000, exp: 1000, hasil: { item: 'money', jumlah: 100000 } },
  'koin': { emoji: '🪙', harga: 60000, waktu: 2000000, exp: 1200, hasil: { item: 'koin', jumlah: 150 } },
  'emas': { emoji: '⚜️', harga: 200000, waktu: 3600000, exp: 3000, hasil: { item: 'emas', jumlah: 1 } },
  'berlian': { emoji: '💠', harga: 250000, waktu: 7200000, exp: 5000, hasil: { item: 'berlian', jumlah: 1 } } // GANTI DARI DIAMOND
}

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)

  const isPrem = global.db.data.users[m.sender]?.premium
  const buyDiscount = isPrem? 0.8 : 1

  let slotKosong = []
  for (let i = 1; i <= user.maxLadang; i++) {
    if (!user.ladang[i]) slotKosong.push(i)
  }
  if (slotKosong.length === 0) return m.reply(`❌ Semua ladang sudah penuh.`)

  if (!text) {
    let cap = `┌───❏「 🌱 DAFTAR BIBIT 」❏\n`
    cap += `│ ${isPrem? '👑 Premium - Diskon 20%' : '👤 User Normal'}\n`
    cap += `└───────────────────\n\n`

    cap += `*─── TERMURAH ───*\n`
    Object.entries(bibit).slice(0, 10).forEach(([name, info]) => {
      let hargaFinal = Math.floor(info.harga * buyDiscount)
      cap += `│ ${info.emoji} ${formatNama(name).padEnd(15)} Rp ${hargaFinal.toLocaleString()} | ${Math.floor(info.waktu/60000)}m\n`
    })
    cap += `\n*─── MENENGAH ───*\n`
    Object.entries(bibit).slice(10, 25).forEach(([name, info]) => {
      let hargaFinal = Math.floor(info.harga * buyDiscount)
      cap += `│ ${info.emoji} ${formatNama(name).padEnd(15)} Rp ${hargaFinal.toLocaleString()} | ${Math.floor(info.waktu/60000)}m\n`
    })
    cap += `\n*─── TERMAHAL ───*\n`
    Object.entries(bibit).slice(25).forEach(([name, info]) => {
      let hargaFinal = Math.floor(info.harga * buyDiscount)
      cap += `│ ${info.emoji} ${formatNama(name).padEnd(15)} Rp ${hargaFinal.toLocaleString()} | ${Math.floor(info.waktu/60000)}m\n`
    })
    cap += `\n📌 *CARA TANAM:*\n`
    cap += `├ Per slot: *${usedPrefix}tanam wortel*\n`
    cap += `├ Slot tertentu: *${usedPrefix}tanam berlian 1*\n`
    cap += `└ Semua slot: *${usedPrefix}tanam koin all*`
    return m.reply(cap)
  }

  let args = text.toLowerCase().split(' ')
  let jenis = args[0].replace(/ /g, '_') // langsung ganti spasi jadi _
  let slotTarget = args[args.length - 1]
  let isAll = slotTarget === 'all'

  if (!bibit[jenis]) return m.reply(`❌ Jenis bibit *${formatNama(jenis)}* tidak ada.\nKetik *${usedPrefix}tanam* untuk lihat daftar.`)

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
    return m.reply(`┌───❏「 🌱 TANAM MASSAL 」❏\n│ ${info.emoji} ${formatNama(jenis).toUpperCase()} x${count}\n│ 💸 Biaya: Rp ${totalBiaya.toLocaleString()}\n│ 💰 Sisa: Rp ${userMoney.toLocaleString()}\n└───────────────────`)
  }

  let slotNum = parseInt(slotTarget)
  let slotPilih =!isNaN(slotNum) && user.ladang[slotNum] === undefined? slotNum : slotKosong[0]
  if (!slotPilih) return m.reply(`❌ Slot ladang tidak tersedia.`)
  if (userMoney < hargaFinal) return m.reply(`❌ Uang tidak cukup. Butuh Rp ${hargaFinal.toLocaleString()}`)

  wdb.money[m.sender] -= hargaFinal
  user.ladang[slotPilih] = { jenis: jenis, waktuTanam: Date.now() }
  saveDB(wdb)
  return m.reply(`┌───❏「 🌱 BERHASIL TANAM 」❏\n│ ${info.emoji} ${formatNama(jenis).toUpperCase()}\n│ 📍 Ladang: ${slotPilih}\n│ 💸 Biaya: Rp ${hargaFinal.toLocaleString()}\n│ 💰 Sisa: Rp ${wdb.money[m.sender].toLocaleString()}\n└───────────────────`)
}
handler.help = ['tanam']
handler.tags = ['rpg']
handler.command = /^(tanam|berkebun)$/i
handler.group = true
export default handler