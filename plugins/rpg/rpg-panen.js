import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

// DATA BIBIT UNTUK TANAM & PANEN
const bibit = {
  'kacang': { emoji: '🥜', harga: 4500, waktu: 480000, exp: 110, hasil: { item: 'kacang', jumlah: 1 } },
  'bawang putih': { emoji: '🧄', harga: 5000, waktu: 500000, exp: 120, hasil: { item: 'bawang putih', jumlah: 1 } },
  'padi': { emoji: '🌾', harga: 5000, waktu: 180000, exp: 50, hasil: { item: 'padi', jumlah: 1 } },
  'bawang merah': { emoji: '🧅', harga: 5500, waktu: 520000, exp: 130, hasil: { item: 'bawang merah', jumlah: 1 } },
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
  'apel hijau': { emoji: '🍏', harga: 24000, waktu: 1450000, exp: 480, hasil: { item: 'apel hijau', jumlah: 1 } },
  'alpukat': { emoji: '🥑', harga: 24000, waktu: 1350000, exp: 420, hasil: { item: 'alpukat', jumlah: 1 } },
  'apel merah': { emoji: '🍎', harga: 25000, waktu: 1500000, exp: 500, hasil: { item: 'apel merah', jumlah: 1 } },
  'kelapa': { emoji: '🥥', harga: 25000, waktu: 1400000, exp: 450, hasil: { item: 'kelapa', jumlah: 1 } },
  'exp': { emoji: '✨', harga: 40000, waktu: 1600000, exp: 800, hasil: { item: 'exp', jumlah: 2000 } },
  'durian': { emoji: '🌳', harga: 50000, waktu: 1800000, exp: 800, hasil: { item: 'durian', jumlah: 1 } },
  'uang': { emoji: '💵', harga: 50000, waktu: 1800000, exp: 1000, hasil: { item: 'money', jumlah: 100000 } },
  'koin': { emoji: '🪙', harga: 60000, waktu: 2000000, exp: 1200, hasil: { item: 'koin', jumlah: 150 } },
  'emas': { emoji: '⚜️', harga: 200000, waktu: 3600000, exp: 3000, hasil: { item: 'emas', jumlah: 1 } },
  'diamond': { emoji: '💎', harga: 250000, waktu: 7200000, exp: 5000, hasil: { item: 'diamond', jumlah: 1 } }
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)
  if(!user.inventory) user.inventory = {}

  function addItem(user, item, jumlah) {
    if(item === 'money') wdb.money[m.sender] = (wdb.money[m.sender] || 0) + jumlah
    else if(item === 'exp') user.exp += jumlah
    else user.inventory[item] = (user.inventory[item] || 0) + jumlah
  }

  function cekLevelUp(user) {
    while(user.exp >= user.level * 500) {
      user.exp -= user.level * 500
      user.level++
    }
  }

  if (!text) {
    let cap = `*🏡 AREA PERKEBUNAN 🏡*\n`
    cap += `*──「 STATUS LADANG 」──*\n\n`
    for (let i = 1; i <= user.maxLadang; i++) {
      if (user.ladang[i]) {
        let l = user.ladang[i]
        let info = bibit[l.jenis]
        if(!info) continue
        let sisa = info.waktu - (Date.now() - l.waktuTanam)
        let ready = sisa <= 0
        cap += `╭───〔 *Ladang ${i}* 〕\n┊ Jenis: ${info.emoji} ${l.jenis.toUpperCase()}\n┊ Status: ${ready? '✅ Siap Panen' : `🌱 Tumbuh (${Math.ceil(sisa / 60000)}m)`}\n╰──────────────\n`
      } else {
        cap += `╭───〔 *LADANG ${i}* 〕\n┊ 🪾 Status: Kosong\n╰──────────────\n`
      }
    }
    cap += `\n*CARA PANEN:* \n- *${usedPrefix}panen all* → Panen semua yang siap\n- *${usedPrefix}panen [nomor]* → Panen 1 slot\n*TIP:* Tanam bibit dulu pake *${usedPrefix}tanam*`
    return m.reply(cap)
  }

  if (text.toLowerCase() === 'all') {
    let totalExp = 0
    let hasil = {}
    let count = 0
    for (let i = 1; i <= user.maxLadang; i++) {
      if (user.ladang[i]) {
        let l = user.ladang[i]
        let dataBibit = bibit[l.jenis]
        if(!dataBibit) continue
        let sisaWaktu = dataBibit.waktu - (Date.now() - l.waktuTanam)
        if (sisaWaktu <= 0) {
          let h = dataBibit.hasil
          addItem(user, h.item, h.jumlah)
          totalExp += dataBibit.exp
          hasil[l.jenis] = (hasil[l.jenis] || 0) + 1
          delete user.ladang[i]
          count++
        }
      }
    }
    if (count === 0) return m.reply('❌ Belum ada yang siap dipanen.')
    user.exp += totalExp
    cekLevelUp(user)
    let teks = `*🌾 PANEN MASSAL BERHASIL!*\n\n*Total:* ${count} Slot\n`
    Object.keys(hasil).forEach(key => teks += `• ${hasil[key]}x ${bibit[key].emoji} ${key.toUpperCase()}\n`)
    teks += `\n*Bonus:* +${totalExp} XP\n*Level:* ${user.level}`
    saveDB(wdb)
    return m.reply(teks)
  }

  let index = parseInt(text)
  if (isNaN(index) ||!user.ladang[index]) return m.reply(`❌ Ladang nomor *${index}* kosong.`)
  let l = user.ladang[index]
  let dataBibit = bibit[l.jenis]
  if(!dataBibit) return m.reply('❌ Data bibit tidak ditemukan')
  let sisaWaktu = dataBibit.waktu - (Date.now() - l.waktuTanam)

  if (sisaWaktu <= 0) {
    let h = dataBibit.hasil
    addItem(user, h.item, h.jumlah)
    user.exp += dataBibit.exp
    cekLevelUp(user)
    delete user.ladang[index]
    let teks = `*🌾 PANEN BERHASIL!*\n\n📍 *Slot:* ${index}\n☘️ *Hasil:* ${h.jumlah}x ${dataBibit.emoji} ${h.item.toUpperCase()}\n*Bonus:* +${dataBibit.exp} XP\n*Level:* ${user.level}`
    saveDB(wdb)
    return m.reply(teks)
  } else {
    let mnt = Math.floor(sisaWaktu / 60000)
    let dtk = Math.floor((sisaWaktu % 60000) / 1000)
    return m.reply(`⏳ *${l.jenis.toUpperCase()}* sisa waktu: *${mnt}m ${dtk}s*`)
  }
}
handler.help = ['panen']
handler.tags = ['rpg']
handler.command = /^(panen)$/i
handler.group = true
export default handler