import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply(`╭──「 ❌ ERROR 」──╮\n\nKetik.adventure dulu buat daftar RPG.\n━━━━━━━━━━━`)

  if (!user.harem) user.harem = []
  if (!user.ex) user.ex = []
  if (!user.kids) user.kids = []
  if (!user.cooldown) user.cooldown = {}
  if (!user.dateStats) user.dateStats = { totalDate: 0, totalNikah: 0, selingkuh: 0, kill: 0, duelWin: 0, urusAnak: 0, wohoo: 0 }

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()
  let jam = new Date().getHours()
  let waktu = jam >= 18 || jam < 6? '🌙 Malam' : '☀️ Siang'

  const getMaxSlot = () => {
    let slot = 1
    user.harem.forEach(p => { if((p.level || 1) >= 20) slot++ })
    return Math.min(slot, 10)
  }

  const bar = (val, len = 10) => '█'.repeat(Math.floor(val / (100/len))) + '░'.repeat(len - Math.floor(val / (100/len)))

  const getTitle = (lvl, custom) => {
    if(custom) return custom
    if(lvl >= 90) return '💎 Belahan Jiwa' 
    if(lvl >= 70) return '💖 Cinta Sejati' 
    if(lvl >= 50) return '👨‍👩‍👧‍👦 Keluarga'
    if(lvl >= 40) return '💍 Suami/Istri'
    if(lvl >= 27) return '💘 Pasangan' 
    if(lvl >= 20) return '💑 Pacar'
    if(lvl >= 10) return '🤝 Sahabat'
    if(lvl >= 5) return '😊 Teman Dekat'
    return '👋 Kenalan'
}
  
  // === DATABASE 50 HADIAH URUT DARI MURAH KE MAHAL ===
const GIFT_LIST = [
  {nama: 'bunga', desc: 'Bunga Mawar', harga: 10000, exp: 40, love: 10, emoji: '🌸'},
  {nama: 'eskrim', desc: 'Es Krim 2 Cup', harga: 30000, exp: 80, love: 12, emoji: '🍦'},
  {nama: 'sate', desc: 'Sate 10 Tusuk', harga: 50000, exp: 100, love: 11, emoji: '🍢'},
  {nama: 'coklat', desc: 'Coklat Import', harga: 50000, exp: 120, love: 15, emoji: '🍫'},
  {nama: 'buku', desc: 'Buku Novel', harga: 150000, exp: 300, love: 14, emoji: '📚'},
  {nama: 'pizza', desc: 'Pizza Jumbo', harga: 200000, exp: 250, love: 16, emoji: '🍕'},
  {nama: 'boneka', desc: 'Boneka Besar', harga: 250000, exp: 400, love: 25, emoji: '🧸'},
  {nama: 'baju', desc: 'Baju Branded', harga: 300000, exp: 650, love: 20, emoji: '👗'},
  {nama: 'kue', desc: 'Kue Ulang Tahun', harga: 500000, exp: 550, love: 22, emoji: '🎂'},
  {nama: 'make', desc: 'Make Up Set', harga: 500000, exp: 1000, love: 25, emoji: '💄'},
  {nama: 'topi', desc: 'Topi Branded', harga: 800000, exp: 700, love: 18, emoji: '🧢'},
  {nama: 'restoran', desc: 'Dinner Restoran Mewah', harga: 1000000, exp: 1500, love: 30, emoji: '🍽️'},
  {nama: 'spa', desc: 'Voucher Spa', harga: 1000000, exp: 1200, love: 28, emoji: '💆'},
  {nama: 'tas', desc: 'Tas Branded', harga: 2000000, exp: 2000, love: 40, emoji: '👜'},
  {nama: 'keyboard', desc: 'Keyboard RGB', harga: 2500000, exp: 2200, love: 33, emoji: '⌨️'},
  {nama: 'gitar', desc: 'Gitar Akustik', harga: 3000000, exp: 2800, love: 35, emoji: '🎸'},
  {nama: 'jaket', desc: 'Jaket Kulit', harga: 3500000, exp: 3000, love: 36, emoji: '🧥'},
  {nama: 'kacamata', desc: 'Kacamata Branded', harga: 4000000, exp: 3600, love: 38, emoji: '🕶️'},
  {nama: 'sepatu', desc: 'Sepatu Mahal', harga: 5000000, exp: 4000, love: 45, emoji: '👠'},
  {nama: 'ac', desc: 'AC 1 PK', harga: 5000000, exp: 3800, love: 39, emoji: '❄️'},
  {nama: 'tiket', desc: 'Tiket Pesawat', harga: 5000000, exp: 5000, love: 43, emoji: '✈️'},
  {nama: 'konser', desc: 'Tiket Konser VIP', harga: 5000000, exp: 7000, love: 50, emoji: '🎤'},
  {nama: 'mesin cuci', desc: 'Mesin Cuci', harga: 6000000, exp: 4200, love: 40, emoji: '🧺'},
  {nama: 'kulkas', desc: 'Kulkas 2 Pintu', harga: 7000000, exp: 4500, love: 41, emoji: '🧊'},
  {nama: 'gelang', desc: 'Gelang Emas', harga: 8000000, exp: 4800, love: 42, emoji: '📿'},
  {nama: 'jam', desc: 'Jam Tangan Mewah', harga: 10000000, exp: 6500, love: 48, emoji: '⌚'},
  {nama: 'kebun', desc: 'Kebun Bunga', harga: 10000000, exp: 5500, love: 44, emoji: '🌷'},
  {nama: 'ps', desc: 'PS5 + Game', harga: 12000000, exp: 8000, love: 47, emoji: '🎮'},
  {nama: 'anting', desc: 'Anting Berlian', harga: 12000000, exp: 7200, love: 46, emoji: '💎'},
  {nama: 'hp', desc: 'HP Flagship', harga: 15000000, exp: 12000, love: 50, emoji: '📱'},
  {nama: 'tv', desc: 'TV 65 Inch', harga: 15000000, exp: 10500, love: 49, emoji: '📺'},
  {nama: 'emas', desc: 'Emas 10 Gram', harga: 15000000, exp: 9000, love: 51, emoji: '🥇'},
  {nama: 'kalung', desc: 'Kalung Berlian', harga: 15000000, exp: 10000, love: 50, emoji: '📿'},
  {nama: 'cincin', desc: 'Cincin Emas', harga: 20000000, exp: 15000, love: 55, emoji: '💍'},
  {nama: 'liburan', desc: 'Paket Honeymoon', harga: 20000000, exp: 22000, love: 65, emoji: '🏖️'},
  {nama: 'kamera', desc: 'Kamera DSLR', harga: 20000000, exp: 13500, love: 52, emoji: '📷'},
  {nama: 'saham', desc: 'Saham 100 Lot', harga: 20000000, exp: 20000, love: 58, emoji: '📈'},
  {nama: 'laptop', desc: 'Laptop Gaming', harga: 25000000, exp: 16000, love: 55, emoji: '💻'},
  {nama: 'motor', desc: 'Motor Sport', harga: 30000000, exp: 25000, love: 60, emoji: '🏍️'},
  {nama: 'mobil', desc: 'Mobil Mewah', harga: 50000000, exp: 40000, love: 70, emoji: '🚗'},
  {nama: 'perhiasan', desc: 'Set Perhiasan Lengkap', harga: 100000000, exp: 70000, love: 78, emoji: '💎'},
  {nama: 'rumah', desc: 'Rumah Pribadi', harga: 500000000, exp: 150000, love: 80, emoji: '🏠'},
  {nama: 'apartemen', desc: 'Apartemen Mewah', harga: 1000000000, exp: 500000, love: 84, emoji: '🏙️'},
  {nama: 'villa', desc: 'Villa di Bali', harga: 5000000000, exp: 400000, love: 82, emoji: '🏡'},
  {nama: 'yacht', desc: 'Yacht Pribadi', harga: 2500000000, exp: 400000, love: 85, emoji: '🛥️'},
  {nama: 'jet', desc: 'Jet Pribadi', harga: 10000000000, exp: 800000, love: 90, emoji: '✈️'},
  {nama: 'hotel', desc: 'Hotel Bintang 5', harga: 50000000000, exp: 4000000, love: 95, emoji: '🏨'},
  {nama: 'pulau', desc: 'Pulau Pribadi', harga: 250000000000, exp: 15000000, love: 100, emoji: '🏝️'}
]

  const getMood = (love) => {
    if(love >= 90) return '🥰 Sangat Bahagia'
    if(love >= 70) return '😍 Jatuh Cinta'
    if(love >= 50) return '😊 Bahagia'
    if(love >= 30) return '🙂 Akrab'
    if(love >= 10) return '😐 Dingin'
    return '😠 Marah'
  }

  const getGenderEmoji = (g) => g === 'cowok'? '♂️' : g === 'cewek'? '♀️' : '❓'
  const getUmurAnak = (umur) => {
    if(umur < 1) return '👶 Bayi'
    if(umur < 3) return '🧒 Balita'
    if(umur < 12) return '👦 Anak'
    if(umur < 18) return '🧑 Remaja'
    return '🧑‍🎓 Dewasa'
  }

  const cekCD = (key, durasi) => {
    let last = user.cooldown[key] || 0
    let sisa = durasi - (Date.now() - last)
    return sisa > 0? Math.ceil(sisa / 1000) : 0
  }

  const addExp = (p, exp) => {
    p.exp = (p.exp || 0) + exp
    let need = (p.level || 1) * 200
    if(p.exp >= need){
      p.exp -= need
      p.level++
      p.love = Math.min(100, p.love + 5)
      p.waitTitleUp = true
      return true
    }
    return false
  }

  const cekLevel = (p, lvl, fitur) => {
    if((p.level || 1) < lvl) return `╭──「 ❌ LEVEL KURANG 」──╮\n\nButuh Lv.${lvl} ${getTitle(lvl)}.\nSekarang Lv.${p.level}\nFitur: ${fitur}\n━━━━━━━━━━━`
    return null
  }

// === MENU BERSIH + BANK ===
if (!action) {
    let maxSlot = getMaxSlot()
    let cap = `╭──「 💕 RELATIONSHIP 」──╮\n\n`
    cap += `💰 Bank : Rp${(user.bank || 0).toLocaleString('id-ID')}\n` 
    cap += `💵 Uang : Rp${(wdb.money[m.sender] || 0).toLocaleString('id-ID')}\n`
    cap += `⏰ ${waktu} | ${jam}:00 WIB\n`
    cap += `💞 Hubungan : ${user.harem.length}/${maxSlot}\n`
    cap += `👶 Anak : ${user.kids.length}\n\n` 
    cap += `━━━━━━━━━━━\n`
    if (user.harem.length > 0) {
      cap += `💑 DAFTAR PASANGAN\n`
      user.harem.forEach((p,i) => cap += ` ${i+1}. ${getGenderEmoji(p.gender)} *${p.name}* Lv.${p.level || 1} ${p.menikah? '💍' : ''}\n`)
      cap += `\n━━━━━━━━━━━\n`
      cap += `📋 COMMAND HARIAN\n`
      cap += `date <no> | talk <no> | makan <no>\n`
      cap += `peluk <no> | usil <no> | maaf <no>\n`
      cap += `mandi <no> | tidur <no> | nonton <no>\n`
      cap += `kiss <no> | swim <no> | wohoo <no>\n`
      cap += `\n📋 COMMAND LAIN\n`
      cap += `kerja <no> | belanja <no> | gift <no>\n`
      cap += `duel <no> | kill <no> | putus <no>\n`
      cap += `nikah <no> | anak <no> <nama>\n`
      cap += `urusanak <no> | belicincin <no>\n`
    } else cap += `💔 STATUS : JOMBLO\n`
    cap += `\n📌 UMUM\n`
    cap += `tembak <nama> <cowok/cewek> | harem\n`
    cap += `status <no> | detail <no> | fitur\n`
    cap += `gift list | anaklist\n`
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
}

  // === TEMBAK ===
  if (action === 'tembak') {
    let maxSlot = getMaxSlot()
    if (user.harem.length >= maxSlot) return m.reply(`╭──「 ❌ SLOT PENUH 」──╮\n\nSlot: ${user.harem.length}/${maxSlot}\nNaikin ke Lv.20 buat +1 slot\n━━━━━━━━━━━`)
    let nama = args[1]
    let gender = args[2]?.toLowerCase()
    if (!nama ||!gender) return m.reply(`╭──「 ❌ FORMAT 」──╮\n\nContoh:.rship tembak Rem cewek\n━━━━━━━━━━━`)
    if(gender!== 'cowok' && gender!== 'cewek') return m.reply(`╭──「 ❌ SALAH 」──╮\n\nGender: cowok / cewek\n━━━━━━━━━━━`)
    user.harem.push({ name: nama, gender: gender, love: 50, exp: 0, level: 1, menikah: false, cincin: null })
    saveDB(wdb)
    return m.reply(`╭──「 💕 JADIAN! 」──╮\n\n${getGenderEmoji(gender)} *${nama}* jadi pasanganmu!\n📊 Lv.1 ${getTitle(1)}\n━━━━━━━━━━━`)
  }

  // === HAREM ===
  if (action === 'harem') {
    if(user.harem.length === 0) return m.reply(`╭──「 💔 JOMBLO 」──╮\n━━━━━━━━━━━`)
    let maxSlot = getMaxSlot()
    let cap = `╭──「 💕 DAFTAR HAREM 」──╮\nSlot: ${user.harem.length}/${maxSlot}\n\n`
    user.harem.forEach((p,i) => {
      let need = (p.level || 1) * 200
      let title = getTitle(p.level, p.customTitle)
      cap += `${i+1}. ${getGenderEmoji(p.gender)} *${p.name}* ${p.menikah? '💍' : ''}\n`
      cap += ` ${title} | Mood: ${getMood(p.love)}\n`
      cap += ` 📈 EXP: ${bar((p.exp || 0) / need * 100)} ${p.exp || 0}/${need}\n`
      cap += ` 💌 Love: ${bar(p.love)} ${p.love}%\n`
      if(p.waitTitleUp) cap += ` ⚠️ Ketik.rship title ${i+1} buat pilih\n`
      else cap += `\n`
    })
    return m.reply(cap + `━━━━━━━━━━━`)
  }

  // === STATUS ===
  if (action === 'status') {
    let no = parseInt(args[1]) - 1
    if(isNaN(no) ||!user.harem[no]) return m.reply(`╭──「 ❌ SALAH 」──╮\n\nContoh:.rship status 1\n━━━━━━━━━━━`)
    let p = user.harem[no]
    let need = (p.level || 1) * 200
    let anakPasangan = user.kids.filter(k => k.ortu === p.name)
    let cap = `╭──「 💕 STATUS ${p.name.toUpperCase()} 」──╮\n\n`
    cap += `${getGenderEmoji(p.gender)} Nama : *${p.name}*\n`
    cap += `📊 Level : ${p.level} ${getTitle(p.level, p.customTitle)}\n`
    cap += `📈 EXP : ${p.exp || 0}/${need}\n`
    cap += `💍 Status : ${p.menikah? 'Menikah 💍' : 'Pacaran 💑'}\n`
    cap += `💌 Love : ${p.love}% ${bar(p.love)}\n`
    cap += `😊 Mood : ${getMood(p.love)}\n`
    if(p.waitTitleUp) cap += `\n⚠️ Ada pilihan naik title! Ketik.rship title ${no+1}\n`
    if(anakPasangan.length > 0){
      cap += `\n👶 Anak : ${anakPasangan.length}\n`
      anakPasangan.forEach((k,i) => cap += ` - ${k.nama} ${getUmurAnak(k.umur)}\n`)
    }
    return m.reply(cap + `━━━━━━━━━━━`)
  }

  // === PILIH TITLE ===
  if (action === 'title') {
    let no = parseInt(args[1]) - 1
    let pilih = args[2]?.toLowerCase()
    if(isNaN(no) ||!user.harem[no]) return m.reply(`╭──「 ❌ SALAH 」──╮\n\nContoh:.rship title 1 ya/tidak\n━━━━━━━━━━━`)
    let p = user.harem[no]
    if(!p.waitTitleUp) return m.reply(`╭──「 ❌ TIDAK BISA 」──╮\n\n${p.name} belum level up.\n━━━━━━━━━━━`)

    if(pilih === 'ya'){
      delete p.waitTitleUp
      delete p.customTitle
      saveDB(wdb)
      return m.reply(`╭──「 🎉 TITLE BARU 」──╮\n\n${p.name} naik jadi ${getTitle(p.level)}\n━━━━━━━━━━━`)
    } else if(pilih === 'tidak'){
      p.customTitle = getTitle(p.level - 1, p.customTitle)
      delete p.waitTitleUp
      saveDB(wdb)
      return m.reply(`╭──「 💕 STAY TITLE 」──╮\n\n${p.name} tetap ${getTitle(p.level, p.customTitle)}\n━━━━━━━━━━━`)
    } else {
      return m.reply(`╭──「 ❓ PILIHAN 」──╮\n\nNaikkan title ${p.name} ke ${getTitle(p.level)}?\n\n.rship title ${no+1} ya\n.rship title ${no+1} tidak\n━━━━━━━━━━━`)
    }
  }

  if (user.harem.length === 0) return m.reply(`╭──「 ❌ JOMBLO 」──╮\n━━━━━━━━━━━`)
  let no = parseInt(args[1]) - 1
  if(isNaN(no) ||!user.harem[no]) return m.reply(`╭──「 ❌ SALAH 」──╮\n\nPilih nomor dari.rship harem\n━━━━━━━━━━━`)
  let p = user.harem[no]

// === DATE LV1 ===
if (action === 'date') {
    if(cekCD('date'+no, 3600000) > 0) return m.reply(`╭──「 ⏰ SIBUK 」──╮\n\n${p.name} lagi sibuk\n━━━━━━━━━━━`)
    
    p.love = Math.min(100, p.love + 10)
    let up = addExp(p, 20)
    user.dateStats.totalDate++
    user.cooldown['date'+no] = Date.now()
    saveDB(wdb)

    const tempat = ['Cafe', 'Taman', 'Mall', 'Alun-alun', 'Pantai', 'Bioskop', 'Museum', 'Kebun Binatang', 'Warung', 'Gunung', 'Sawah', 'Dermaga']
    const judul = [
        '💑 KENCAN ROMANTIS', '☕ NGEDATE SANTAI', '🌆 JALAN SORE', '🎬 MOVIE DATE', '🍽️ MAKAN BARENG',
        '💑 DATE ROMANTIS', '🌃 KENCAN MALAM', '🥂 BERDUA AJA',
        '🎡 MAIN BARENG', '📸 HUNTING FOTO', '🛍️ SHOPPING DATE', '🎨 DATE KREATIF'
    ]
    const cerita = [
      `Kencan di ${tempat[Math.floor(Math.random()*tempat.length)]} bareng *${p.name}* ${waktu.toLowerCase()}\n│ Ngobrol banyak dan ketawa bareng`,
      `*${p.name}* ngajakin kamu jalan ke ${tempat[Math.floor(Math.random()*tempat.length)]}\n│ Suasananya tenang dan nyaman banget`,
      `Date sederhana tapi berkesan sama *${p.name}*\n│ Saling cerita tentang hari ini`,
      `Jalan sore bareng *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n│ Foto-foto dan jajan es krim`,
      `Makan malam bareng *${p.name}*\n│ Cerita sambil suap-suapan`,
      `Nonton di ${tempat[Math.floor(Math.random()*tempat.length)]} bareng *${p.name}* ${waktu.toLowerCase()}\n│ Komentar filmnya sampe ketawa ngak`,
      `Dinner candle light sama *${p.name}*\n│ Pesan menu favorit kalian berdua`,
      `Jalan malam berdua sama *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n│ Duduk sambil ngobrol sampai larut`,
      `Main ke ${tempat[Math.floor(Math.random()*tempat.length)]} bareng *${p.name}*\n│ Rebutan main game dan saling dukung`,
      `Hunting foto sama *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n│ Hasilnya bagus-bagus buat dipajang`,
      `Shopping date bareng *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n│ Saling pilihin baju yang cocok`,
      `Date kreatif bareng *${p.name}*\n│ Bikin kerajinan tangan sambil bercanda`
    ]

    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const ceritaRand = cerita[Math.floor(Math.random() * cerita.length)]

    let msg = `*╭─「 ${judulRand} 」─╮*\n│\n│ ${ceritaRand}\n│\n│ 💌 *Love* : +10\n│ 📈 *EXP* : +20`
    if(up) msg += `\n│ 🎉 *LEVEL UP!* Lv.${p.level}\n│ Ketik .rship title ${no+1} buat pilih`
    return m.reply(msg + `\n*╰───────────────────────╯*`)
}

  // === MAKAN LV5 ===
  if (action === 'makan') {
    let err = cekLevel(p, 1, 'Makan')
    if(err) return m.reply(err)
    
    if(cekCD('makan'+no, 7200000) > 0) return m.reply(`╭──「 ⏰ KENYANG 」──╮\n━━━━━━━━━━━`)
    
    let biaya = Math.floor(Math.random() * 10000) + 15000
    if ((wdb.money[m.sender] || 0) < biaya) return m.reply(`╭──「 ❌ UANG 」──╮\n\nButuh Rp ${biaya.toLocaleString()}\n━━━━━━━━━━━`)
    
    wdb.money[m.sender] -= biaya
    p.love = Math.min(100, p.love + 8)
    let up = addExp(p, 12)
    user.cooldown['makan'+no] = Date.now()
    saveDB(wdb)

    const judul = [
        '🍜 MAKAN BARENG','🥢 DINNER DATE','🍰 JAJAN BARENG',
        '🍽️ MAKAN BARENG', '😋 SUAP-SUAPAN', '💕 ROMANTIS'
    ]
    const isi = [
      `*${p.name}* traktir kamu makan ${waktu.toLowerCase()}\n│ Menunya enak banget, nambah 2x`,
      `Makan bareng *${p.name}* ${waktu.toLowerCase()}\n│ Sambil suap-suapan bercanda`,
      `*${p.name}* masakin kamu ${waktu.toLowerCase()}\n│ Rasanya bikin kangen rumah`,
      `Makan malam romantis sama *${p.name}* ${waktu.toLowerCase()}\n│ Saling suapin dan rebutan makanan`,
      `*${p.name}* pesen menu favorit kamu\n│ Katanya biar kamu tambah sayang`,
      `Date makan bareng *${p.name}*\n│ Duduk mepet sambil bisik-bisik`
    ]
    
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💰 *Uang* : -Rp ${biaya.toLocaleString()}\n│ 💌 *Love* : +8\n│ 📈 *EXP* : +12\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === PELUK LV1 ===
  if (action === 'peluk') {
      let err = cekLevel(p, 10, 'Peluk') 
if(err) return m.reply(err)
if (user.harem.length === 0) return m.reply(`╭──「 ❌ JOMBLO 」──╮\n\nPacaran dulu baru bisa peluk\n━━━━━━━━━━━`)
    if(cekCD('peluk'+no, 1800000) > 0) return m.reply(`╭──「 ⏰ MALU 」──╮\n━━━━━━━━━━━`)
    
    p.love = Math.min(100, p.love + 5)
    let up = addExp(p, 8)
    user.cooldown['peluk'+no] = Date.now()
    saveDB(wdb)

    const judul = [
        '🫂 PELUK HANGAT','🤗 HUG TIME','💞 DEKETAN', 
        '🫂 PELUKAN ERAT', '💞 MANJA', '😳 NEMPEL'     
    ]
    const isi = [
      `*${p.name}* ngasih peluk hangat ${waktu.toLowerCase()}\n│ Capek langsung ilang`,
      `Pelukan dari *${p.name}* paling nyaman\n│ Rasanya aman banget`,
      `*${p.name}* nyender di bahu kamu ${waktu.toLowerCase()}\n│ Diem aja udah bahagia`,
      `Kamu peluk *${p.name}* dari belakang ${waktu.toLowerCase()}\n│ Bisikin "kangen" di telinganya`,
      `*${p.name}* duduk di pangkuan kamu\n│ Pelukan yg lama banget lepasnya`,
      `Nempel terus sama *${p.name}*\n│ Katanya anget dan nyaman`
    ]
    
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💌 *Love* : +5\n│ 📈 *EXP*  : +8\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === MANDI LV40 ===
  if (action === 'mandi') {
    let err = cekLevel(p, 40, 'Mandi')
    if(err) return m.reply(err)
    if(cekCD('mandi'+no, 3600000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nBaru mandi\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 8)
    let up = addExp(p, 12)
    user.cooldown['mandi'+no] = Date.now()
    saveDB(wdb)

    const judul = [
        '🛁 WAKTU SANTAI','🚿 MANDI BARENG','🧼 QUALITY TIME',
        '🚿 MANDI BARENG', '🫧 SABUNAN', '😳 PRIVAT',
        '💦 BASAH-BASAHAN', '🛀 BERENDAM', '😉 MANJA'
    ]
    const isi = [
      `Mandi bareng *${p.name}* ${waktu.toLowerCase()}\n│ Sambil ngobrol santai`,
      `*${p.name}* siapin air hangat buat kamu\n│ Rasanya nyaman banget`,
      `Waktu santai bareng *${p.name}*\n│ Bercanda sambil cuci muka`,
      `Mandi bareng *${p.name}* ${waktu.toLowerCase()}\n│ Saling gosokin punggung sambil bercanda`,
      `*${p.name}* rebutan shower sama kamu\n│ Basah-basahan dan ketawa terus`,
      `Waktu privat berdua di kamar mandi *${p.name}*\n│ Bantuin keramas katanya`,
      `*${p.name}* narik kamu ke shower\n│ "Mandi bareng yuk" katanya sambil senyum nakal`,
      `Berendam di bathtub sama *${p.name}*\n│ Busanya banyak dan lampunya temaram`,
      `*${p.name}* nempel dari belakang pas kamu sabunan\n│ Bisik "jangan gerak dulu"`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💌 *Love* : +8\n│ 📈 *EXP* : +12\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === TIDUR LV40 ===
  if (action === 'tidur') {
    let err = cekLevel(p, 40, 'Tidur')
    if(err) return m.reply(err)
    if(cekCD('tidur'+no, 28800000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nBaru tidur\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 10)
    let up = addExp(p, 15)
    user.cooldown['tidur'+no] = Date.now()
    saveDB(wdb)

    const judul = [
        '😴 TIDUR BARENG','🛏️ MALAM NYAMAN','🌙 PELUKAN HANGAT',
        '😴 TIDUR NEMPEL', '🌙 GENDONGAN', '💤 PELUK SAMPE PAGI',
        '🫂 NEMPEL ERAT', '😳 SATU SELIMUT', '❤️‍🔥 MALAM PANAS'
    ]
    const isi = [
      `Tidur dipelukan *${p.name}* ${waktu.toLowerCase()}\n│ Mimpinya indah banget`,
      `*${p.name}* bisikin "selamat tidur"\n│ Terus kalian tidur sambil pegangan tangan`,
      `Malam ditemenin *${p.name}*\n│ Rasanya tenang dan aman`,
      `Tidur bareng *${p.name}* ${waktu.toLowerCase()}\n│ Nempel terus, ga mau lepas pelukannya`,
      `*${p.name}* minta digendong pas tidur\n│ Katanya gitu baru nyenyak`,
      `Semalaman pelukan sama *${p.name}*\n│ Bangun-bangun masih saling tatap`,
      `*${p.name}* tidurnya sambil tiduran di dada kamu\n│ Napasnya anget dan pelan`,
      `Berdua pake 1 selimut sama *${p.name}*\n│ Kaki saling nyari di bawah selimut`,
      `Malam ini *${p.name}* manja banget\n│ Dari tidur sampe bangun ga lepas pelukan`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💌 *Love* : +10\n│ 📈 *EXP* : +15\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === BELANJA LV10 ===
  if (action === 'belanja') {
    let err = cekLevel(p, 10, 'Belanja')
    if(err) return m.reply(err)
    if(cekCD('belanja'+no, 7200000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nDompet kosong\n━━━━━━━━━━━`)
    let biaya = Math.floor(Math.random() * 20000) + 10000
    if ((wdb.money[m.sender] || 0) < biaya) return m.reply(`╭──「 ❌ UANG 」──╮\n\nButuh Rp ${biaya.toLocaleString()}\n━━━━━━━━━━━`)
    wdb.money[m.sender] -= biaya
    p.love = Math.min(100, p.love + 10)
    let up = addExp(p, 15)
    saveDB(wdb)

    const judul = ['🛍️ BELANJA BARENG','🛒 JALAN KE MALL','🎁 SHOPPING TIME','🏬 MALL DATE','🛒 JAJAN BARENG']
    const isi = [
      `Belanja bareng *${p.name}* ${waktu.toLowerCase()}\n│ Nyoba baju terus saling kasih pendapat`,
      `*${p.name}* nemenin kamu cari barang\n│ Muter mall sampe capek tapi seru`,
      `Shopping bareng *${p.name}*\n│ Jajan es krim dulu biar semangat*\n│ Keliling toko sambil pilih barang lucu`,
      `*${p.name}* traktir kamu jajan\n│ Seneng banget bisa jalan bareng`,
      `Hunting barang sama *${p.name}*\n│ Dapat banyak diskon dan foto lucu`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💰 *Uang* : -Rp ${biaya.toLocaleString()}\n│ 💌 *Love* : +10\n│ 📈 *EXP* : +15\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === KERJA LV10 ===
  if (action === 'kerja') {
    let err = cekLevel(p, 40, 'Kerja')
if(err) return m.reply(err)
if (!p.menikah) return m.reply(`╭──「 ❌ NIKAH 」──╮\n\nHarus nikah dulu\n━━━━━━━━━━━`)
    if(cekCD('kerja'+no, 14400000) > 0) return m.reply(`╭──「 ⏰ CAPEK 」──╮\n\n${p.name} masih capek\n━━━━━━━━━━━`)
    let gaji = Math.floor(Math.random() * 30000) + 15000
    wdb.money[m.sender] += gaji
    p.love += 8
    let up = addExp(p, 15)
    user.cooldown['kerja'+no] = Date.now()
    saveDB(wdb)

    const judul = ['💼 KERJA BARENG','💰 CARI CUAN','👨‍💼 TIM KERJA']
    const isi = [
      `Kerja bareng *${p.name}* ${waktu.toLowerCase()}\n│ Kompak banget, bos sampe muji`,
      `*${p.name}* bantuin kamu lembur\n│ Pulang dibeliin makan enak`,
      `Satu tim sama *${p.name}*\n│ Kerjaan cepet beres karena kerja sama`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💰 *Uang* : +Rp ${gaji.toLocaleString()}\n│ 💌 *Love* : +8\n│ 📈 *EXP* : +15\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === GIFT HANDLER ===
if (action === 'gift') {
    let tipe = args[1]?.toLowerCase()

    // MODE LIST:.rship gift list
    if(tipe === 'list'){
      let cap = `╭──「 🎁 DAFTAR 50 HADIAH 」──╮\n\n`
      GIFT_LIST.forEach((g, i) => {
        cap += `${g.emoji} ${i+1}. ${g.desc}\n`
        cap += ` Harga: Rp ${g.harga.toLocaleString()} | EXP: ${g.exp.toLocaleString()}\n\n`
      })
      cap += `📌 Cara Pakai:\n`
      cap += `Item:.rship gift item 5 2\n`
      cap += `Nama:.rship gift item baju 1\n`
      cap += `Uang:.rship gift money 50000000\n`
      cap += `━━━━━━━━━━━`
      return m.reply(cap)
    }

    let p = user.harem[0] // ganti sesuai sistem pilih pasangan kamu
    if(!p) return m.reply(`╭──「 ❌ BELUM PUNYA PASANGAN 」──╮\n\nPacaran dulu lah\n━━━━━━━━━━━`)

    // MODE 1: GIFT MONEY
    if(tipe === 'money' || tipe === 'uang'){
      let jumlah = parseInt(args[2])
      if(!jumlah || jumlah <= 0) return m.reply(`╭──「 ❌ SALAH 」──╮\n\nContoh:.rship gift money 50000000\n━━━━━━━━━━━`)
      if ((user.bank || 0) < jumlah) return m.reply(`╭──「 ❌ BANK KOSONG 」──╮\n\nButuh Rp ${jumlah.toLocaleString()} di bank\n━━━━━━━━━━━`)

      let exp = Math.floor(jumlah / 1000)
      let love = Math.min(100, Math.floor(jumlah / 10000000))
      let cooldown = Math.min(86400000, Math.floor(jumlah / 100000) * 60000)

      user.bank -= jumlah
      p.love = Math.min(100, p.love + love)
      p.exp = (p.exp || 0) + exp
      let up = false
      let need = p.level * 500
      if(p.exp >= need){ p.exp -= need; p.level++; up = true }

      user.cooldown['gift_'+p.name] = Date.now()
      user.cooldown['gift_cd_'+p.name] = cooldown
      saveDB(wdb)

      let jam = Math.floor(cooldown / 3600000)
      let menit = Math.floor((cooldown % 3600000) / 60000)

      const judul = ['💵 KASIH UANG','💰 TRAKTIRAN','💸 ROYAL GIFT','💵 CASH MONEY','💳 TRANSFER SAYANG','💵 DUIT JAJAN','💰 HADIAH UANG','💸 TAJIR MENDADAK','💵 NGASIH DUIT']
      const isi = [`Kamu transfer Rp ${jumlah.toLocaleString()} ke *${p.name}* ${waktu.toLowerCase()}\n│ *${p.name}* : "Makasih banyak sayang!"`,`*${p.name}* kaget dikasih uang sebanyak itu\n│ Langsung peluk dan cium pipi kamu`,`Kamu traktir *${p.name}* Rp ${jumlah.toLocaleString()}\n│ "Buat jajan ya" katanya sambil senyum`,`*${p.name}* langsung belanja online abis dapet duit\n│ Kirim struknya ke kamu semua`,`Kasih uang ke *${p.name}* ${waktu.toLowerCase()}\n│ Dia bilang "Aku sayang kamu banget"`,`*${p.name}* nabung uang dari kamu\n│ Katanya buat masa depan kalian berdua`,`Transfer dadakan ke *${p.name}*\n│ Dibales "Ini buat apa? Banyak amat"`,`*${p.name}* happy banget dapet uang\n│ Mood dia langsung naik 100%`,`Kamu kasih uang ke *${p.name}*\n│ Dipake buat beli baju couple katanya`]
      const judulRand = judul[Math.floor(Math.random() * judul.length)]
      const isiRand = isi[Math.floor(Math.random() * isi.length)]

      return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💰 *Bank* : -Rp ${jumlah.toLocaleString()}\n│ 💌 *Love* : +${love}\n│ 📈 *EXP* : +${exp}\n│ ⏰ *Cooldown* : ${jam}j ${menit}m\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
    }

    // MODE 2: GIFT ITEM
    if(tipe === 'item'){
      let input = args[2]
      let jumlah = parseInt(args[3]) || 1
      if(!input) return m.reply(`╭──「 ❌ SALAH 」──╮\n\nContoh:.rship gift item 5 2\n━━━━━━━━━━━`)

      let gift
      let noGift = parseInt(input) - 1
      if(!isNaN(noGift)) gift = GIFT_LIST[noGift]
      else gift = GIFT_LIST.find(g => g.nama === input.toLowerCase())

      if(!gift) return m.reply(`╭──「 ❌ SALAH 」──╮\n\nLihat list dulu:.rship gift list\n━━━━━━━━━━━`)

      let totalHarga = gift.harga * jumlah
      let totalExp = gift.exp * jumlah
      let totalLove = gift.love * jumlah
      let cooldown = Math.min(86400000, Math.floor(totalHarga / 1000000) * 3600000)

      if(Date.now() - (user.cooldown['gift_'+p.name] || 0) < (user.cooldown['gift_cd_'+p.name] || 0)) {
        let sisa = Math.ceil(((user.cooldown['gift_'+p.name] || 0) + (user.cooldown['gift_cd_'+p.name] || 0) - Date.now()) / 60000)
        return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\n${p.name} masih seneng sama hadiah sebelumnya\nTunggu ${sisa} menit lagi\n━━━━━━━━━━━`)
      }
      if ((user.bank || 0) < totalHarga) return m.reply(`╭──「 ❌ BANK KOSONG 」──╮\n\nButuh Rp ${totalHarga.toLocaleString()} di bank\n━━━━━━━━━━━`)

      user.bank -= totalHarga
      p.love = Math.min(100, p.love + totalLove)
      p.exp = (p.exp || 0) + totalExp
      let up = false
      let need = p.level * 500
      if(p.exp >= need){ p.exp -= need; p.level++; up = true }

      user.cooldown['gift_'+p.name] = Date.now()
      user.cooldown['gift_cd_'+p.name] = cooldown
      saveDB(wdb)

      let jam = Math.floor(cooldown / 3600000)
      let menit = Math.floor((cooldown % 3600000) / 60000)

      const judul = ['🎁 HADIAH MEWAH','💎 KADO SPESIAL','👑 ROYAL GIFT','🎀 SURPRISE','💝 KADO CINTA','🎁 PAKET MEWAH','💎 GIFT EKSKLUSIF','🎁 KADO TERBAIK','💝 UNTUKMU SAYANG']
      const isi = [`${gift.emoji} Kamu kasih ${jumlah}x *${gift.desc}* ke *${p.name}* ${waktu.toLowerCase()}\n│ Dia langsung peluk dan bilang makasih`,`${gift.emoji} *${p.name}* kaget dapet ${gift.desc}\n│ "Sayang ini mahal banget" katanya sambil nangis haru`,`${gift.emoji} Surprise ${gift.desc} buat *${p.name}*\n│ Mood dia langsung naik dan makin sayang`,`${gift.emoji} *${p.name}* unboxing ${gift.desc} di depan kamu\n│ Terus langsung pake dan muter-muter`,`${gift.emoji} Kado ${gift.desc} bikin *${p.name}* seneng banget\n│ Seharian ga lepas dari kamu`,`${gift.emoji} *${p.name}* pamer ${gift.desc} ke temennya\n│ "Ini dari pacar aku" katanya bangga`,`${gift.emoji} Kamu beliin ${gift.desc} buat *${p.name}*\n│ Dia bilang "Aku ga nyangka" sambil peluk`,`${gift.emoji} Hadiah ${gift.desc} dari kamu\n│ *${p.name}* simpen baik-baik katanya`,`${gift.emoji} *${p.name}* fotoin ${gift.desc} terus\n│ Buat dijadiin wallpaper HP`]
      const judulRand = judul[Math.floor(Math.random() * judul.length)]
      const isiRand = isi[Math.floor(Math.random() * isi.length)]

      return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💰 *Bank* : -Rp ${totalHarga.toLocaleString()}\n│ 💌 *Love* : +${totalLove}\n│ 📈 *EXP* : +${totalExp}\n│ ⏰ *Cooldown* : ${jam}j ${menit}m\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
    }

    return m.reply(`╭──「 ❌ FORMAT 」──╮\n\nItem:.rship gift item 5 2\nUang:.rship gift money 50000000\nList:.rship gift list\n━━━━━━━━━━━`)
}

  // === USIL LV30 ===
  if (action === 'usil') {
    let err = cekLevel(p, 1, 'Usil')
    if(err) return m.reply(err)
    if(cekCD('usil'+no, 3600000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 1 jam\n━━━━━━━━━━━`)
    p.love = Math.max(0, p.love - 2)
    let up = addExp(p, 10)
    user.cooldown['usil'+no] = Date.now()
    saveDB(wdb)

    const judul = [
      '😈 USIL BARENG',
      '😆 JAHILIN',
      '🙈 GODAIN',
      '🤭 NAKAL RINGAN',
      '😏 PRANK TIPIS',
      '😜 KERJAAN ISENG',
      '😤 NAKAL SEDANG',
      '😈 ULANG TAHUN NAKAL',
      '🔥 NAKAL PARAH'
    ]
    const isi = [
      `Isengin *${p.name}* ${waktu.toLowerCase()}\n│ Dia kaget terus ketawa ngak`,
      `*${p.name}* digelitikin pas lagi diem\n│ "Awas ya" katanya sambil ngejar`,
      `Jahilin *${p.name}* pake filter jelek\n│ Hasilnya lucu banget`,
      `Sembunyiin sendal *${p.name}* terus pura2 bantu nyari\n│ Pas ketemu dia langsung manyun`,
      `Ganti nada dering *${p.name}* pake suara kambing\n│ Kaget tiap ada notif masuk`,
      `Tempel stiker "aku jomblo" di belakang HP *${p.name}*\n│ Dia baru sadar pas difoto orang`,
      `Isi chat *${p.name}* pake stiker cringe 50 biji\n│ Dia scroll sejam buat hapusin`,
      `Tuker wallpaper *${p.name}* pake foto pas tidur ngiler\n│ Langsung hapus grup gara2 malu`,
      `Broadcast ke semua kontak *${p.name}*: "aku suka kamu"\n│ Dia ngeblok kamu 3 hari`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💌 *Love* : -2\n│ 📈 *EXP* : +10\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === MARAH LV30 ===
  if (action === 'marah') {
    let err = cekLevel(p, 10, 'Marah')
    if(err) return m.reply(err)
    if(cekCD('marah'+no, 3600000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 1 jam\n━━━━━━━━━━━`)
    p.love = Math.max(0, p.love - 8)
    let up = addExp(p, 5)
    user.cooldown['marah'+no] = Date.now()
    saveDB(wdb)

    const judul = [
        '😤 BERTENGKAR',
        '😠 CEKCOK',
        '😡 SALAH PAHAM',
        '😏 NGAMBEG MANJA',
        '😒 DIEM DIEMAN',
        '🥺 UJUNG UJUNGAN',
        '😈 KODE KODEAN',
        '🔥 PERANG BANTAL',
        '💋 BAIIKAN DI KASUR'
    ]
    const isi = [
        `Kamu sama *${p.name}* lagi salah paham ${waktu.toLowerCase()}\n│ Abis itu baikan lagi kok`,
        `*${p.name}* ngambek bentar\n│ Tapi ujungnya saling minta maaf`,
        `Cekcok kecil sama *${p.name}*\n│ Namanya juga pasangan ya`,
        `*${p.name}* cemberut karena kamu kurang perhatian ${waktu.toLowerCase()}\n│ Spill peluk 1x langsung luluh`,
        `Diem dieman sejam sama *${p.name}*\n│ Yang kalah duluan yang chat duluan`,
        `Ujung ujungan gara gara hal sepele sama *${p.name}*\n│ 5 menit kemudian udah kangen`,
        `*${p.name}* marah sambil kode "ga butuh kamu"\n│ Padahal chat tiap 2 menit`,
        `Perang bantal virtual sama *${p.name}*\n│ Katanya marah, tapi ketawanya paling kenceng`,
        `Abis marah sama *${p.name}* malah jadi nempel terus\n│ Katanya hukuman, ujungnya baikan di kasur`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💔 *Love* : -8\n│ 📈 *EXP* : +5\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

if (action === 'maaf') {
    let err = cekLevel(p, 1, 'Maaf')
    if(err) return m.reply(err)
    if(cekCD('maaf'+no, 1800000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 30 menit\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 12)
    let up = addExp(p, 8)
    user.cooldown['maaf'+no] = Date.now()
    saveDB(wdb)

    const judul = [
        '🥺 MINTA MAAF',
        '🫂 PELUK DULUAN',
        '💌 SURAT CINTA',
        '😳 SALAH PAHAM DOANG',
        '😌 UDAH BAIIKAN YUK',
        '😏 YANG NGAJAK BAIKAN',
        '🤭 NGALAH DULUAN',
        '💋 CIUMAN DAMAI',
        '❤️‍🔥 NEMPEL LAGI'
    ]
    const isi = [
        `Kamu nyamperin *${p.name}* terus bilang "maaf ya" ${waktu.toLowerCase()}\n│ Dia diem 3 detik terus senyum`,
        `Peluk dari belakang pas *${p.name}* lagi diem\n│ Katanya "ih ngagetin" tapi ga ngelepas`,
        `Kirim chat panjang ke *${p.name}*\n│ Isinya minta maaf + janji ga ngulangin`,
        `Ternyata yang bikin marah itu miskom doang\n│ Abis dijelasin *${p.name}* langsung ketawa`,
        `Kamu duluan yang chat "udah yuk"\n│ *${p.name}* jawab "ihh dari tadi kemana aja"`,
        `*${p.name}* gengsi, tapi kamu yang ngalah duluan\n│ Poin +100 buat dewasa`,
        `Ngalah demi hubungan daripada ego\n│ *${p.name}* jadi makin sayang`,
        `Abis baikan langsung minta dicium\n│ *${p.name}* "ihh ga sekalian nikah"`,
        `5 menit abis marah udah nempel lagi\n│ Katanya benci, kelakuannya nempel 24 jam`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💖 *Love* : +12\n│ 📈 *EXP* : +8\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

if (action === 'talk') {
    let err = cekLevel(p, 1, 'Talk')
    if(err) return m.reply(err)
    if(cekCD('talk'+no, 900000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 15 menit\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 4)
    let up = addExp(p, 3)
    user.cooldown['talk'+no] = Date.now()
    saveDB(wdb)

    const judul = [
        '💬 NGOPI BARENG',
        '📱 CHAT AN RECEH',
        '🌙 TELFONAN',
        '😆 NGEGOSIP',
        '🎮 MABAR BARENG',
        '😏 FLIRTING',
        '📸 VC 5 MENIT',
        '🥰 KATA SAYANG',
        '💭 CURHAT MALAM'
    ]
    const isi = [
        `Nongkrong sama *${p.name}* sambil ngopi ${waktu.toLowerCase()}\n│ Bahas hal ga penting sampe 1 jam`,
        `Chat an receh sama *${p.name}*\n│ Dari "lagi apa" ujungnya debat mie kuah apa goreng`,
        `Telfonan sama *${p.name}* pas mau tidur\n│ Ujungnya ketiduran bareng`,
        `Ngegossipin temen sama *${p.name}*\n│ Abis itu kompak "gapapa yang penting kita"`,
        `Mabar bareng *${p.name}*\n│ Kamu yang feeder, dia yang gendong`,
        `*${p.name}* tiba-tiba bilang "kamu cakep"\n│ Padahal lagi pake baju tidur`,
        `VC cepet sama *${p.name}*\n│ Katanya cuma 5 menit, molor jadi 1 jam`,
        `*${p.name}* tiba-tiba spam "sayang sayang"\n│ Padahal ga ada angin ga ada hujan`,
        `Curhat malem sama *${p.name}*\n│ Dari masalah hidup ujungnya "besok makan apa"`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💖 *Love* : +4\n│ 📈 *EXP* : +3\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === KISS LV20 ===
  if (action === 'kiss') {
    let err = cekLevel(p, 27, 'Kiss')
    if(err) return m.reply(err)
    if(cekCD('kiss'+no, 14400000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 4 jam\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 15)
    let up = addExp(p, 30)
    user.cooldown['kiss'+no] = Date.now()
    saveDB(wdb)

    const judul = [
        '💋 MOMEN MESRA','❤️ ROMANTIS','🥰 SAYANG',
        '💋 CIUMAN PANJANG', '😘 KECUP', '❤️‍🔥 NAKAL',
        '💋 KECUP NAKAL', '🥵 INTENS', '😏 GEMES'
    ]
    const isi = [
      `Momen romantis bareng *${p.name}* ${waktu.toLowerCase()}\n│ Saling tatap dan senyum`,
      `*${p.name}* kasih kejutan manis\n│ Bikin hati kamu anget`,
      `Waktu berkualitas sama *${p.name}*\n│ Penuh kasih sayang`,
      `Ciuman lama sama *${p.name}* ${waktu.toLowerCase()}\n│ Di pipi, kening, terus bibir`,
      `*${p.name}* nyamperin terus minta dicium\n│ Ga cukup sekali katanya`,
      `Momen mesra berdua sama *${p.name}*\n│ Bisik "aku sayang kamu" abis itu`,
      `*${p.name}* tiba-tiba nyium leher kamu ${waktu.toLowerCase()}\n│ Bikin merinding dan ketawa`,
      `Ciuman intens diem-diem sama *${p.name}*\n│ Takut ketahuan orang`,
      `*${p.name}* gigit bibir kamu pelan\n│ Terus bilang "nakal ya"`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💌 *Love* : +15\n│ 📈 *EXP* : +30\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === NONTON LV20 ===
  if (action === 'nonton') {
    let err = cekLevel(p, 20, 'Nonton')
    if(err) return m.reply(err)
    if(cekCD('nonton'+no, 10800000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 3 jam\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 12)
    let up = addExp(p, 18)
    user.cooldown['nonton'+no] = Date.now()
    saveDB(wdb)

    const judul = ['🎬 NONTON BARENG','🍿 MOVIE DATE','📺 MARATON FILM','🌃 BIOSKOP ROMANTIS']
    const isi = [
      `Nonton ${['Anime','Horror','Romance','Action','Komedi'][Math.floor(Math.random()*5)]} sama *${p.name}*\n│ Kalian ketawa bareng terus`,
      `*${p.name}* nyender pas nonton ${waktu.toLowerCase()}\n│ Filmnya seru, suasana makin enak`,
      `Maraton film bareng *${p.name}*\n│ Beli popcorn 2 ember 😂`,
      `*${p.name}* nutup mata pas scene serem\n│ Terus pegang tangan kamu`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💌 *Love* : +12\n│ 📈 *EXP* : +18\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}
  
    // === SWIM LV60 ===
  if (action === 'swim') {
    let err = cekLevel(p, 20, 'Swim')
    if(err) return m.reply(err)
    if(cekCD('swim'+no, 14400000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 4 jam\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 20)
    let up = addExp(p, 50)
    user.cooldown['swim'+no] = Date.now()
    saveDB(wdb)

    const judul = ['🏊 RENANG BARENG','🌊 PANTAI ROMANTIS','☀️ LIBURAN BERDUA']
    const isi = [
      `Renang bareng *${p.name}* di pantai ${waktu.toLowerCase()}\n│ Saling cipratin air terus ketawa`,
      `*${p.name}* ngajarin kamu renang\n│ Pegangannya erat banget`,
      `Main pasir sama *${p.name}*\n│ Bikin istana pasir terus foto-foto`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💌 *Love* : +20\n│ 📈 *EXP* : +50\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === BELI CINCIN ===
  if (action === 'belicincin') {
    let no = parseInt(args[1]) - 1
    let jenis = args[2]?.toLowerCase()
    if(isNaN(no) ||!user.harem[no]) return m.reply(`╭──「 ❌ SALAH 」──╮\n\nContoh:.rship belicincin 1 emas\n━━━━━━━━━━━`)
    let p = user.harem[no]
    if(p.menikah) return m.reply(`╭──「 ❌ UDAH 」──╮\n\nUdah nikah\n━━━━━━━━━━━`)

    let harga = {emas: 500000, berlian: 2000000, platina: 5000000}
    let namaCincin = {emas: 'Cincin Emas', berlian: 'Cincin Berlian', platina: 'Cincin Platina'}
    if(!harga[jenis]) return m.reply(`╭──「 ❌ JENIS 」──╮\n\nemas: Rp 500.000\nberlian: Rp 2.000.000\nplatina: Rp 5.000.000\n━━━━━━━━━━━`)
    if ((wdb.money[m.sender] || 0) < harga[jenis]) return m.reply(`╭──「 ❌ UANG 」──╮\n\nButuh Rp ${harga[jenis].toLocaleString()}\n━━━━━━━━━━━`)

    wdb.money[m.sender] -= harga[jenis]
    p.cincin = namaCincin[jenis]
    saveDB(wdb)
    return m.reply(`╭──「 💎 BELI CINCIN 」──╮\n\nBerhasil beli ${namaCincin[jenis]} untuk ${p.name}\n💰 -Rp ${harga[jenis].toLocaleString()}\nSekarang bisa nikah\n━━━━━━━━━━━`)
  }

  // === NIKAH LV40 HARUS PAKE CINCIN ===
  if (action === 'nikah') {
    let err = cekLevel(p, 40, 'Nikah')
    if(err) return m.reply(err)
    if (p.menikah) return m.reply(`╭──「 ❌ UDAH 」──╮\n\nUdah nikah\n━━━━━━━━━━━`)
    if (!p.cincin) return m.reply(`╭──「 ❌ CINCIN 」──╮\n\nBeli cincin dulu:.rship belicincin ${no+1} emas/berlian/platina\n━━━━━━━━━━━`)
    if (p.love < 90) return m.reply(`╭──「 ❌ LOVE 」──╮\n\nLove ${p.love}%. Minimal 90%\n━━━━━━━━━━━`)
    p.menikah = true
    user.dateStats.totalNikah++
    saveDB(wdb)
    return m.reply(`╭──「 💍 NIKAH 」──╮\n\nSelamat menikah dengan ${p.name}!\nMenggunakan ${p.cincin}\nSekarang jadi Suami/Istri\n━━━━━━━━━━━`)
  }

  // === WOHOO LV40 ===
  if (action === 'wohoo') {
    let err = cekLevel(p, 40, 'Wohoo')
    if(err) return m.reply(err)
    if(cekCD('wohoo'+no, 21600000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 6 jam\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 25)
    let up = addExp(p, 60)
    user.dateStats.wohoo++
    user.cooldown['wohoo'+no] = Date.now()
    saveDB(wdb)

    const judul = ['🌙 MALAM ROMANTIS','💞 QUALITY TIME','✨ WAKTU BERDUA','🔥 MOMEN PANAS','💋 PRIVAT TIME']
    const isi = [
      `Waktu berdua sama *${p.name}*\n│ Nonton, makan, dan ngobrol santai`,
      `Cuma berdua di kamar, lampu redup`,
      `*${p.name}* manja banget malem ini\n│ Bisik-bisik dan ketawa kecil`,
      `Quality time berdua sama *${p.name}*\n│ Gaada yg ganggu, full perhatian`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${isiRand}\n│\n│ 💌 *Love* : +25\n│ 📈 *EXP* : +60\n${up? `│ 🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}*╰───────────────────────╯*`)
}

  // === ANAK LV40 ===
  if (action === 'anak') {
    let err = cekLevel(p, 50, 'Anak')
    if(err) return m.reply(err)
    if (!p.menikah) return m.reply(`╭──「 ❌ NIKAH 」──╮\n\nHarus nikah dulu\n━━━━━━━━━━━`)
    if (p.love < 70) return m.reply(`╭──「 ❌ LOVE 」──╮\n\nLove minimal 90%\n━━━━━━━━━━━`)
    if(cekCD('anak'+no, 86400000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 24 jam\n━━━━━━━━━━━`)
    let jenis = Math.random() < 0.5? 'Laki-laki' : 'Perempuan'
    let namaAnak = args.slice(2).join(' ') || `Bayi ${p.name}`
    user.kids.push({ nama: namaAnak, jenis, umur: 0, ortu: p.name })
    addExp(p, 40)
    user.cooldown['anak'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 👶 ANAK 」──╮\n\nKamu dan ${p.name} punya anak!\n${getGenderEmoji(jenis === 'Laki-laki'? 'cowok' : 'cewek')} ${namaAnak} - ${jenis}\n📈 +40 EXP\n━━━━━━━━━━━`)
  }

  // === URUS ANAK ===
  if (action === 'urusanak') {
    let no = parseInt(args[1]) - 1
    if(isNaN(no) ||!user.kids[no]) return m.reply(`╭──「 ❌ SALAH 」──╮\n\nContoh:.rship urusanak 1\n━━━━━━━━━━━`)
    let anak = user.kids[no]
    if(cekCD('urusanak'+no, 14400000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nAnak masih kenyang\n━━━━━━━━━━━`)
    anak.umur += 0.1
    let expOrtu = Math.floor(anak.umur * 10) + 20
    let cariOrtu = user.harem.find(p => p.name === anak.ortu)
    if(cariOrtu) addExp(cariOrtu, expOrtu)
    user.dateStats.urusAnak++
    user.cooldown['urusanak'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 👶 URUS ANAK 」──╮\n\nMengurus *${anak.nama}*\nUmur: ${anak.umur.toFixed(1)} tahun ${getUmurAnak(anak.umur)}\n${getGenderEmoji(anak.jenis === 'Laki-laki'? 'cowok' : 'cewek')} ${anak.jenis}\n📈 EXP Ortu +${expOrtu}\n━━━━━━━━━━━`)
  }

  // === ANAK LIST ===
  if (action === 'anaklist') {
    if(user.kids.length === 0) return m.reply(`╭──「 💔 KOSONG 」──╮\n\nBelum punya anak\n━━━━━━━━━━━`)
    let cap = `╭──「 👶 DAFTAR ANAK 」──╮\n\n`
    user.kids.forEach((k,i) => {
      cap += `${i+1}. ${getGenderEmoji(k.jenis === 'Laki-laki'? 'cowok' : 'cewek')} *${k.nama}*\n`
      cap += ` Umur: ${k.umur.toFixed(1)} tahun ${getUmurAnak(k.umur)}\n`
      cap += ` Ortu: ${k.ortu}\n\n`
    })
    return m.reply(cap + `📌 urusanak <no>\n━━━━━━━━━━━`)
  }

  // === DUEL LV80 ===
  if (action === 'duel') {
    let err = cekLevel(p, 1, 'Duel')
    if(err) return m.reply(err)
    if(cekCD('duel'+no, 21600000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 6 jam\n━━━━━━━━━━━`)
    let win = Math.random() < 0.6
    user.cooldown['duel'+no] = Date.now()
    if(win){
      let hadiah = Math.floor(Math.random() * 100000) + 50000
      wdb.money[m.sender] += hadiah
      addExp(p, 80)
      user.dateStats.duelWin++
      saveDB(wdb)
      return m.reply(`╭──「 ⚔️ DUEL 」──╮\n\nMENANG!\nKamu dan ${p.name} menang duel\n🏆 +Rp ${hadiah.toLocaleString()}\n📈 +80 EXP\n━━━━━━━━━━━`)
} else {
      p.love = Math.max(0, p.love - 10)
      addExp(p, 20)
      saveDB(wdb)
      return m.reply(`╭──「 ⚔️ DUEL 」──╮\n\nKALAH\n${p.name} kecewa\n💌 -10\n📈 +20 EXP\n━━━━━━━━━━━`)
    }
  } // <-- TAMBAHIN INI
  
    // === DETAIL PASANGAN ===
  if (action === 'detail') {
    let no = parseInt(args[1]) - 1
    if(isNaN(no) ||!user.harem[no]) return m.reply(`╭──「 ❌ SALAH 」──╮\n\nContoh:.rship detail 1\n━━━━━━━━━━━`)
    let p = user.harem[no]
    let need = (p.level || 1) * 200
    let cap = `╭──「 📋 DETAIL ${p.name.toUpperCase()} 」──╮\n\n`
    cap += `${getGenderEmoji(p.gender)} Nama : ${p.name}\n`
    cap += `📊 Level : ${p.level} ${getTitle(p.level, p.customTitle)}\n`
    cap += `📈 EXP : ${p.exp || 0}/${need}\n`
    cap += `💌 Love : ${p.love}%\n`
    cap += `😊 Mood : ${getMood(p.love)}\n`
    cap += `💍 Status : ${p.menikah? 'Menikah' : 'Pacaran'}\n`
    cap += `💎 Cincin : ${p.cincin || 'Belum ada'}\n`
    cap += `\n🛍️ Beli cincin:.rship belicincin ${no+1} emas/berlian/platina\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  // === KILL LV100 ===
if (action === 'kill') {
    let err = cekLevel(p, 10, 'Kill')
    if(err) return m.reply(err)
    if(cekCD('kill'+no, 604800000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 7 hari\n━━━━━━━━━━━`)
    
    let nama = p.name
    user.ex.push(p)
    user.harem.splice(no, 1)
    user.dateStats.kill++
    user.cooldown['kill'+no] = Date.now()
    saveDB(wdb)

    const judul = ['💔 HUBUNGAN BERAKHIR', '😢 PERPISAHAN', '💀 FINISH']
    const cerita = [
      `Hubungan kamu dengan *${nama}* berakhir ${waktu.toLowerCase()}\n│ Keputusan berat tapi harus diambil`,
      `Kamu dan *${nama}* berpisah untuk selamanya\n│ Semua kenangan jadi masa lalu`,
      `Cerita kalian selesai di sini *${nama}*\n│ Semoga masing-masing bisa lebih baik`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const ceritaRand = cerita[Math.floor(Math.random() * cerita.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${ceritaRand}\n│\n│ 📊 *Total Putus Paksa* : ${user.dateStats.kill}\n*╰───────────────────────╯*`)
}

// === PUTUS ===
if (action === 'putus') {
    let nama = p.name
    user.ex.push(p)
    user.harem.splice(no, 1)
    saveDB(wdb)

    const judul = ['💔 PUTUS', '😔 BERPISAH', '👋 SELAMAT TINGGAL']
    const cerita = [
      `Kamu memutuskan putus dengan *${nama}* ${waktu.toLowerCase()}\n│ Semoga jadi keputusan terbaik`,
      `Perpisahan dengan *${nama}*\n│ Jalani hidup masing-masing ya`,
      `Hubungan kalian selesai *${nama}*\n│ Terima kasih untuk semua kenangan`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const ceritaRand = cerita[Math.floor(Math.random() * cerita.length)]

    return m.reply(`*╭─「 ${judulRand} 」─╮*\n│\n│ ${ceritaRand}\n*╰───────────────────────╯*`)
}

// === FITUR LIST ===
if (action === 'fitur') {
    let cap = `╭──「 📋 FITUR RELATIONSHIP 」──╮\n\n`
    cap += `🔓 Lv.1  : date, talk, makan, marah, maaf, usil, kill, duel, putus\n`
    cap += `🔓 Lv.10 : peluk, belanja\n`
    cap += `🔓 Lv.20 : nonton, swim\n`
    cap += `🔓 Lv.27 : kiss ${'['}Harus Nikah${']'}\n`
    cap += `🔓 Lv.40 : mandi, tidur, nikah, wohoo, kerja ${'['}Harus Nikah${']'}\n`
    cap += `🔓 Lv.50 : anak ${'['}Harus Nikah + Love 70%${']'}\n\n`
    cap += `━━━━━━━━━━━\n`
    cap += `📌 INFO PENTING\n`
    cap += `• Slot Harem +1 tiap pasangan Lv.20, max 10\n`
    cap += `• nikah = Butuh Lv.40 + Cincin + Love 90%\n`
    cap += `• anak  = Butuh Lv.50 + Status Nikah + Love 70%\n`
    cap += `• kiss, kerja, anak, wohoo = Harus status Nikah\n`
    cap += `• maaf = Cooldown 30m | talk = Cooldown 15m\n`
    cap += `• gift = pake Bank, bukan Uang Saku\n`
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
}
}

handler.help = ['rship']
handler.tags = ['rpg']
handler.command = ['rship']
handler.group = true
export default handler