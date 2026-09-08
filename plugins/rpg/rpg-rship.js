import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.money) wdb.money = {}
  let uData = getUserRPG(wdb, m.sender)
  let user = wdb.users[m.sender]?.rpg || uData?.rpg || uData
  if (!user) return m.reply(`╭─❏「 ❌ ERROR 」❏\n├ Ketik .adventure dulu buat daftar RPG.\n╰─━━━━━━━━━━━━━━─`)
  if (!wdb.users[m.sender]) wdb.users[m.sender] = { rpg: user }
  if (!wdb.users[m.sender].rpg) wdb.users[m.sender].rpg = user

  if (!user.harem) user.harem = []
  if (!user.ex) user.ex = []
  if (!user.kids) user.kids = []
  if (!user.cooldown) user.cooldown = {}
  if (!user.dateStats) user.dateStats = { totalDate: 0, totalNikah: 0, selingkuh: 0, kill: 0, duelWin: 0, urusAnak: 0, wohoo: 0 }

  let args = text ? text.trim().split(/\s+/) : []
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
  const CHILD_STAGES = [
    { name: '👶 Bayi', care: 0 },
    { name: '🧒 Balita', care: 10 },
    { name: '👦 Anak', care: 30 },
    { name: '🧑 Remaja', care: 70 },
    { name: '🧑‍🎓 Dewasa', care: 120 },
  ]

  const getChildCareCount = child => {
    if (Number.isFinite(child.careCount)) return Math.max(0, child.careCount)
    return Math.max(0, Math.round((Number(child.umur) || 0) * 10))
  }

  const getChildStage = careCount => {
    return CHILD_STAGES.reduce((stage, current) => careCount >= current.care ? current : stage)
  }

  const getChildProgress = careCount => {
    const nextStage = CHILD_STAGES.find(stage => stage.care > careCount)
    if (!nextStage) return '✅ Selesai diasuh'
    return `${careCount}/${nextStage.care} kali ke ${nextStage.name}`
  }

  const cekCD = (key, durasi) => {
    let last = user.cooldown[key] || 0
    let sisa = durasi - (Date.now() - last)
    return sisa > 0? Math.ceil(sisa / 1000) : 0
  }

  if (action === 'cd' || action === 'cooldown') {
    const cooldownNames = {
      date: ['Date', 60 * 60 * 1000], liburan: ['Liburan', 12 * 60 * 60 * 1000],
      makan: ['Makan', 2 * 60 * 60 * 1000], peluk: ['Peluk', 30 * 60 * 1000],
      mandi: ['Mandi', 60 * 60 * 1000], tidur: ['Tidur', 8 * 60 * 60 * 1000],
      belanja: ['Belanja', 2 * 60 * 60 * 1000], kerja: ['Kerja', 4 * 60 * 60 * 1000],
      usil: ['Usil', 60 * 60 * 1000], marah: ['Marah', 60 * 60 * 1000],
      maaf: ['Maaf', 30 * 60 * 1000], talk: ['Talk', 15 * 60 * 1000],
      kiss: ['Kiss', 4 * 60 * 60 * 1000], nonton: ['Nonton', 3 * 60 * 60 * 1000],
      swim: ['Swim', 4 * 60 * 60 * 1000], wohoo: ['Wohoo', 6 * 60 * 60 * 1000],
      anak: ['Anak', 24 * 60 * 60 * 1000], urusanak: ['Urus anak', 4 * 60 * 60 * 1000],
      duel: ['Duel', 6 * 60 * 60 * 1000], kill: ['Kill', 7 * 24 * 60 * 60 * 1000]
    }
    let cap = `╭─❏「 ⏰ RSHIP COOLDOWN 」❏\n│ 📋 *STATUS SEMUA AKTIVITAS*\n╰─━━━━━━━━━━━━━━─\n\n`
    for (const [key, [label, duration]] of Object.entries(cooldownNames)) {
      const partnerEntries = user.harem.map((partner, index) => ({
        index,
        remaining: cekCD(`${key}${index}`, duration)
      }))
      const status = partnerEntries.length
        ? partnerEntries.map(item => `${item.index + 1}: ${item.remaining ? formatRemaining(item.remaining) : 'READY'}`).join(' | ')
        : 'Belum ada pasangan'
      cap += `> *${label}*: ${status}\n`
    }
    return m.reply(cap + `\n─━━━━━━━━━━━━━━─`)
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
    if((p.level || 1) < lvl) return `╭─❏「 ❌ LEVEL KURANG 」❏\n\nButuh Lv.${lvl} ${getTitle(lvl)}.\nSekarang Lv.${p.level}\nFitur: ${fitur}\n╰─━━━━━━━━━━━━━━─`
    return null
  }

  // === DAFTAR COMMAND RSHIP ===
if (action === 'command' || action === 'commands' || action === 'cmd') {
  let cap = `╭─❏「 📋 RSHIP COMMAND 」❏\n`
  cap += `│ Daftar command relationship.\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `💕 *DASAR*\n`
  cap += `> *${usedPrefix}rship tembak <nama> <cowok/cewek>*\n`
  cap += `> ↳ Membuat pasangan baru.\n`
  cap += `> *${usedPrefix}rship harem*\n`
  cap += `> ↳ Melihat semua pasangan.\n`
  cap += `> *${usedPrefix}rship status <no>*\n`
  cap += `> ↳ Melihat status pasangan.\n`
  cap += `> *${usedPrefix}rship detail <no>*\n`
  cap += `> ↳ Melihat detail pasangan.\n`
  cap += `> *${usedPrefix}rship fitur*\n`
  cap += `> ↳ Melihat fitur yang terbuka berdasarkan level.\n`
  cap += `> *${usedPrefix}rship anak list*\n`
  cap += `> ↳ Melihat daftar anak.\n`

  cap += `─━━━━━━━━━━━━━━─\n`

  cap += `🎭 *AKTIVITAS PASANGAN*\n`
  cap += `> *${usedPrefix}rship date <no>*\n`
  cap += `> ↳ Pergi berkencan dengan pasangan.\n`
  cap += `> *${usedPrefix}rship talk <no>*\n`
  cap += `> ↳ Mengobrol dengan pasangan.\n`
  cap += `> *${usedPrefix}rship makan <no>*\n`
  cap += `> ↳ Makan bersama pasangan.\n`
  cap += `> *${usedPrefix}rship liburan <no>*\n`
  cap += `> ↳ Pergi liburan bersama pasangan.\n`
  cap += `> *${usedPrefix}rship peluk <no>*\n`
  cap += `> ↳ Memeluk pasangan.\n`
  cap += `> *${usedPrefix}rship usil <no>*\n`
  cap += `> ↳ Mengusili pasangan.\n`
  cap += `> *${usedPrefix}rship maaf <no>*\n`
  cap += `> ↳ Meminta maaf kepada pasangan.\n`
  cap += `> *${usedPrefix}rship mandi <no>*\n`
  cap += `> ↳ Melakukan aktivitas mandi bersama.\n`
  cap += `> *${usedPrefix}rship tidur <no>*\n`
  cap += `> ↳ Tidur bersama pasangan.\n`
  cap += `> *${usedPrefix}rship nonton <no>*\n`
  cap += `> ↳ Menonton bersama pasangan.\n`
  cap += `> *${usedPrefix}rship swim <no>*\n`
  cap += `> ↳ Berenang bersama pasangan.\n`
  cap += `> *${usedPrefix}rship belanja <no>*\n`
  cap += `> ↳ Berbelanja bersama pasangan.\n`
  cap += `> *${usedPrefix}rship marah <no>*\n`
  cap += `> ↳ Melampiaskan amarah kepada pasangan.\n`
  cap += `> *${usedPrefix}rship kerja <no>*\n`
  cap += `> ↳ Bekerja bersama pasangan.\n`
  cap += `> *${usedPrefix}rship kiss <no>*\n`
  cap += `> ↳ Mencium pasangan.\n`
  cap += `> *${usedPrefix}rship wohoo <no>*\n`
  cap += `> ↳ Aktivitas khusus pasangan level tinggi.\n`

  cap += `─━━━━━━━━━━━━━━─\n`

  cap += `💍 *KELUARGA & HADIAH*\n`
  cap += `> *${usedPrefix}rship gift list*\n`
  cap += `> ↳ Melihat daftar hadiah pasangan.\n`
  cap += `> *${usedPrefix}rship gift item ...*\n`
  cap += `> ↳ Memberikan item kepada pasangan.\n`
  cap += `> *${usedPrefix}rship gift money ...*\n`
  cap += `> ↳ Memberikan uang kepada pasangan.\n`
  cap += `> *${usedPrefix}rship gift anak <no> item ...*\n`
  cap += `> ↳ Memberikan item kepada anak.\n`
  cap += `> *${usedPrefix}rship gift anak <no> money ...*\n`
  cap += `> ↳ Memberikan uang kepada anak.\n`
  cap += `> *${usedPrefix}rship belicincin <no> <tipe>*\n`
  cap += `> ↳ Membeli cincin pernikahan.\n`
  cap += `> *${usedPrefix}rship nikah <no>*\n`
  cap += `> ↳ Menikahi pasangan yang memenuhi syarat.\n`
  cap += `> *${usedPrefix}rship anak <no>*\n`
  cap += `> ↳ Memiliki anak bersama pasangan.\n`
  cap += `> *${usedPrefix}rship urusanak <no>*\n`
  cap += `> ↳ Merawat anak dan mendapatkan EXP.\n`
  cap += `> *${usedPrefix}rship duel <no>*\n`
  cap += `> ↳ Mengajak pasangan untuk berduel.\n`
  cap += `> *${usedPrefix}rship kill <no>*\n`
  cap += `> ↳ Mengakhiri hubungan secara paksa.\n`

  cap += `─━━━━━━━━━━━━━━─\n`

  cap += `💔 *LAINNYA*\n`
  cap += `> *${usedPrefix}rship title <no> ya/tidak*\n`
  cap += `> ↳ Mengatur title pasangan.\n`
  cap += `> *${usedPrefix}rship putus <no>*\n`
  cap += `> ↳ Mengakhiri hubungan dengan pasangan.\n`

  cap += `─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}

  // === MENU RINGKAS TANPA DAFTAR COMMAND ===
if (!action) {
  let maxSlot = getMaxSlot()
  let cap = `╭─❏「 💕 RELATIONSHIP 」❏\n`
  cap += `│ 👤 *PROFIL HUBUNGAN*\n`
  cap += `│ 💰 Bank: Rp${(user.bank || 0).toLocaleString('id-ID')}\n`
  cap += `│ 💵 Uang: Rp${(wdb.money[m.sender] || 0).toLocaleString('id-ID')}\n`
  cap += `│ ⏰ Waktu: ${waktu} | ${jam}:00 WIB\n`
  cap += `│ 💞 Pasangan: ${user.harem.length}/${maxSlot}\n`
  cap += `│ 👶 Anak: ${user.kids.length}\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  if (user.harem.length > 0) {
    cap += `💕 *DAFTAR PASANGAN*\n`

    user.harem.forEach((p, i) => {
      cap += `> *${i + 1}. ${getGenderEmoji(p.gender)} ${p.name}*\n`
      cap += `> ↳ Lv.${p.level || 1}${p.menikah ? ' • 💍 Menikah' : ''}\n`
    })
  } else {
    cap += `💔 *STATUS HUBUNGAN*\n`
    cap += `> ↳ Kamu masih jomblo.\n`
  }

  cap += `\n─━━━━━━━━━━━━━━─\n`
  cap += `📋 Ketik *${usedPrefix}rship command* untuk melihat semua fitur.`

  return m.reply(cap)
}

  // === TEMBAK ===
  if (action === 'tembak') {
    let maxSlot = getMaxSlot()
    if (user.harem.length >= maxSlot) return m.reply(`╭─❏「 ❌ SLOT PENUH 」❏\n\nSlot: ${user.harem.length}/${maxSlot}\nNaikin ke Lv.20 buat +1 slot\n╰─━━━━━━━━━━━━━━─`)
    let nama = args[1]
    let gender = args[2]?.toLowerCase()
    if (!nama ||!gender) return m.reply(`╭─❏「 ❌ FORMAT 」❏\n\nContoh:.rship tembak Rem cewek\n╰─━━━━━━━━━━━━━━─`)
    if(gender!== 'cowok' && gender!== 'cewek') return m.reply(`╭─❏「 ❌ SALAH 」❏\n\nGender: cowok / cewek\n╰─━━━━━━━━━━━━━━─`)
    user.harem.push({ name: nama, gender: gender, love: 50, exp: 0, level: 1, menikah: false, cincin: null })
    saveDB(wdb)
    return m.reply(`╭─❏「 💕 JADIAN! 」❏\n\n${getGenderEmoji(gender)} *${nama}* jadi pasanganmu!\n📊 Lv.1 ${getTitle(1)}\n╰─━━━━━━━━━━━━━━─`)
  }

  // === HAREM ===
  if (action === 'harem') {
    if(user.harem.length === 0) return m.reply(`╭─❏「 💔 JOMBLO 」❏\n╰─━━━━━━━━━━━━━━─`)
    let maxSlot = getMaxSlot()
    let cap = `╭─❏「 💕 DAFTAR PASANGAN 」❏\n│ 📌 Slot: ${user.harem.length}/${maxSlot}\n╰─━━━━━━━━━━━━━━─\n\n`
    user.harem.forEach((p, i) => {
      let need = (p.level || 1) * 200
      let title = getTitle(p.level, p.customTitle)
      cap += `*${i + 1}. ${getGenderEmoji(p.gender)} ${p.name}* ${p.menikah ? '💍' : ''}\n`
      cap += `> 🏷️ Title: ${title}\n`
      cap += `> 😊 Mood: ${getMood(p.love)}\n`
      cap += `> 📈 EXP: ${bar((p.exp || 0) / need * 100)} ${p.exp || 0}/${need}\n`
      cap += `> 💌 Love: ${bar(p.love)} ${p.love}%\n`
      if(p.waitTitleUp) cap += `> ⚠️ Ketik *${usedPrefix}rship title ${i + 1}* untuk memilih\n`
    })
    return m.reply(cap + `╰─━━━━━━━━━━━━━━─`)
  }

  // === STATUS ===
if (action === 'status') {
  let no = parseInt(args[1]) - 1

  if (isNaN(no) || !user.harem[no]) {
    return m.reply(
      `╭─❏「 ❌ SALAH 」❏\n` +
      `│ ❌ *DATA TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Contoh: *${usedPrefix}rship status 1*`
    )
  }

  let p = user.harem[no]
  let need = (p.level || 1) * 200
  let anakPasangan = user.kids.filter(k => k.ortu === p.name)

  let cap = `╭─❏「 💕 STATUS ${p.name.toUpperCase()} 」❏\n`
  cap += `│ 💕 *INFORMASI PASANGAN*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `${getGenderEmoji(p.gender)} *Nama: ${p.name}*\n`
  cap += `> ↳ 📊 Level: Lv.${p.level} ${getTitle(p.level, p.customTitle)}\n`
  cap += `> ↳ 📈 EXP: ${p.exp || 0}/${need}\n`
  cap += `> ↳ 💍 Status: ${p.menikah ? 'Menikah 💍' : 'Pacaran 💑'}\n`
  cap += `> ↳ 💌 Love: ${p.love}% ${bar(p.love)}\n`
  cap += `> ↳ 😊 Mood: ${getMood(p.love)}\n`

  if (p.waitTitleUp) {
    cap += `\n─━━━━━━━━━━━━━━─\n\n`
    cap += `⚠️ *TITLE TERSEDIA*\n`
    cap += `> ↳ Ketik *${usedPrefix}rship title ${no + 1}* untuk memilih title baru.\n`
  }

  if (anakPasangan.length > 0) {
    cap += `\n─━━━━━━━━━━━━━━─\n\n`
    cap += `👶 *ANAK* • ${anakPasangan.length}\n\n`

    anakPasangan.forEach((k, i) => {
      const careCount = getChildCareCount(k)
      const gender = k.jenis === 'Laki-laki' ? 'cowok' : 'cewek'

      cap += `*${i + 1}. ${getGenderEmoji(gender)} ${k.nama}*\n`
      cap += `> ↳ ${getChildStage(careCount).name}\n`
    })
  }

  cap += `\n─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}


// === PILIH TITLE ===
if (action === 'title') {
  let no = parseInt(args[1]) - 1
  let pilih = args[2]?.toLowerCase()

  if(isNaN(no) || !user.harem[no]) return m.reply(
    `╭─❏「 ❌ SALAH 」❏\n` +
    `│ ❌ *FORMAT SALAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: .rship title 1 ya/tidak`
  )

  let p = user.harem[no]

  if(!p.waitTitleUp) return m.reply(
    `╭─❏「 ❌ TIDAK BISA 」❏\n` +
    `│ ❌ *TITLE BELUM TERSEDIA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${p.name} belum level up.`
  )

  if(pilih === 'ya'){
    delete p.waitTitleUp
    delete p.customTitle
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🎉 TITLE BARU 」❏\n` +
      `│ 🎉 *TITLE BERHASIL DIGANTI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${p.name} naik jadi ${getTitle(p.level)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  } else if(pilih === 'tidak'){
    p.customTitle = getTitle(p.level - 1, p.customTitle)
    delete p.waitTitleUp
    saveDB(wdb)

    return m.reply(
      `╭─❏「 💕 STAY TITLE 」❏\n` +
      `│ 💕 *TITLE TETAP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${p.name} tetap ${getTitle(p.level, p.customTitle)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  } else {
    return m.reply(
      `╭─❏「 ❓ PILIHAN 」❏\n` +
      `│ ❓ *PILIH TITLE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Naikkan title ${p.name} ke ${getTitle(p.level)}?\n\n` +
      `📌 *PILIHAN*\n` +
      `> ↳ .rship title ${no+1} ya\n` +
      `> ↳ .rship title ${no+1} tidak\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
}


// === FITUR LIST ===
if (action === 'fitur') {
  let maxPartnerLvl = user.harem.reduce((max, cur) => Math.max(max, cur.level || 1), 0)
  let isNikah = user.harem.some(cur => cur.menikah)

  let getLock = (reqLvl, reqNikah = false) => {
    if (reqNikah && !isNikah) return '🔒'
    return maxPartnerLvl >= reqLvl ? '🔓' : '🔒'
  }

  let cap = `╭─❏「 📋 FITUR RELATIONSHIP 」❏\n`
  cap += `│ 📋 *DAFTAR FITUR*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `💞 *FITUR TERBUKA*\n`
  cap += `> ↳ Fitur terbuka mengikuti level pasangan dan status nikah.\n\n`

  cap += `*Lv.1* ${getLock(1)}\n`
  cap += `> ↳ date, talk, makan, marah, maaf, usil, kill, duel, putus\n\n`

  cap += `*Lv.10* ${getLock(10)}\n`
  cap += `> ↳ peluk, belanja\n\n`

  cap += `*Lv.20* ${getLock(20)}\n`
  cap += `> ↳ nonton, swim, liburan\n\n`

  cap += `*Lv.27* ${getLock(27, true)}\n`
  cap += `> ↳ kiss - Harus Nikah\n\n`

  cap += `*Lv.40* ${getLock(40, true)}\n`
  cap += `> ↳ mandi, tidur, nikah, wohoo, kerja - Harus Nikah\n\n`

  cap += `*Lv.50* ${getLock(50, true)}\n`
  cap += `> ↳ anak - Nikah + Love 70%\n\n`

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `🔓 *STATUS FITUR*\n`
  cap += `> ↳ 🔓 Fitur terbuka\n`
  cap += `> ↳ 🔒 Fitur terkunci\n\n`

  cap += `💡 *INFORMASI*\n`
  cap += `> ↳ Slot: +1 tiap pasangan Lv.20, maksimal 10\n`
  cap += `> ↳ Cooldown: Maaf 30m - Talk 15m\n\n`

  cap += `─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}


// === GIFT LIST ===
if (action === 'gift' && args[1]?.toLowerCase() === 'list') {
  let cap = `╭─❏「 🎁 DAFTAR 50 HADIAH 」❏\n`
  cap += `│ 🎁 *DAFTAR HADIAH*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `💝 *50 HADIAH UNTUK PASANGAN*\n`
  cap += `> ↳ Hadiah memakai saldo bank dan menaikkan Love pasangan.\n\n`

  GIFT_LIST.forEach((g, i) => {
    cap += `*${i + 1}. ${g.desc} ${g.emoji}*\n`
    cap += `> ↳ Buy: Rp ${g.harga.toLocaleString()}\n`
    cap += `> ↳ XP: +${g.exp.toLocaleString()}\n`
    cap += `> ↳ Love: +${g.love}\n\n`
  })

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `📌 *CARA PAKAI*\n`
  cap += `> ↳ Item: ${usedPrefix}rship gift item 5 2\n`
  cap += `> ↳ Nama: ${usedPrefix}rship gift item baju 1\n`
  cap += `> ↳ Uang: ${usedPrefix}rship gift money 50000000 1\n\n`

  cap += `─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}

  // === ANAK LIST ===
if (action === 'anak' && args[1]?.toLowerCase() === 'list') {
  if(user.kids.length === 0) return m.reply(
    `╭─❏「 💔 KOSONG 」❏\n` +
    `│ 💔 *BELUM PUNYA ANAK*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let cap = `╭─❏「 👶 DAFTAR ANAK 」❏\n`
  cap += `│ 👶 *DAFTAR ANAK*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  user.kids.forEach((k,i) => {
    const careCount = getChildCareCount(k)

    cap += `*${i + 1}. ${getGenderEmoji(k.jenis === 'Laki-laki' ? 'cowok' : 'cewek')} ${k.nama}*\n`
    cap += `> ↳ Tahap: ${getChildStage(careCount).name}\n`
    cap += `> ↳ Asuhan: ${getChildProgress(careCount)}\n`
    cap += `> ↳ Ortu: ${k.ortu}\n\n`
  })

  cap += `─━━━━━━━━━━━━━━─\n\n`
  cap += `📌 *CARA MENGELOLA*\n`
  cap += `> ↳ ${usedPrefix}rship urusanak <no>\n\n`
  cap += `─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}


if (user.harem.length === 0) return m.reply(
  `╭─❏「 ❌ JOMBLO 」❏\n` +
  `│ ❌ *BELUM MEMILIKI PASANGAN*\n` +
  `╰─━━━━━━━━━━━━━━─`
)

let no = parseInt(args[1]) - 1

if(isNaN(no) || !user.harem[no]) return m.reply(
  `╭─❏「 ❌ SALAH 」❏\n` +
  `│ ❌ *NOMOR PASANGAN TIDAK VALID*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Pilih nomor dari .rship harem`
)

let p = user.harem[no]


// === DATE LV1 ===
if (action === 'date') {
  if(cekCD('date'+no, 3600000) > 0) return m.reply(
    `╭─❏「 ⏰ SIBUK 」❏\n` +
    `│ ⏰ *PASANGAN SEDANG SIBUK*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${p.name} lagi sibuk`
  )
  
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
    `Kencan di ${tempat[Math.floor(Math.random()*tempat.length)]} bareng *${p.name}* ${waktu.toLowerCase()}\n Ngobrol banyak dan ketawa bareng`,
    `*${p.name}* ngajakin kamu jalan ke ${tempat[Math.floor(Math.random()*tempat.length)]}\n Suasananya tenang dan nyaman banget`,
    `Date sederhana tapi berkesan sama *${p.name}*\n│ Saling cerita tentang hari ini`,
    `Jalan sore bareng *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n Foto-foto dan jajan es krim`,
    `Makan malam bareng *${p.name}*\n│ Cerita sambil suap-suapan`,
    `Nonton di ${tempat[Math.floor(Math.random()*tempat.length)]} bareng *${p.name}* ${waktu.toLowerCase()}\n Komentar filmnya sampe ketawa ngak`,
    `Dinner candle light sama *${p.name}*\n│ Pesan menu favorit kalian berdua`,
    `Jalan malam berdua sama *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n Duduk sambil ngobrol sampai larut`,
    `Main ke ${tempat[Math.floor(Math.random()*tempat.length)]} bareng *${p.name}*\n Rebutan main game dan saling dukung`,
    `Hunting foto sama *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n Hasilnya bagus-bagus buat dipajang`,
    `Shopping date bareng *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n Saling pilihin baju yang cocok`,
    `Date kreatif bareng *${p.name}*\n Bikin kerajinan tangan sambil bercanda`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const ceritaRand = cerita[Math.floor(Math.random() * cerita.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💕 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${ceritaRand}\n\n`
  msg += `💌 *Love*: +10\n`
  msg += `📈 *EXP*: +20`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}\n> ↳ Ketik .rship title ${no+1} buat pilih`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === LIBURAN LV20 ===
if (action === 'liburan') {
  let err = cekLevel(p, 20, 'Liburan')
  if(err) return m.reply(err)

  if(cekCD('liburan'+no, 43200000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH DALAM LIBURAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${p.name} masih menikmati liburan sebelumnya`
  )

  const biaya = 250000

  if ((wdb.money[m.sender] || 0) < biaya) return m.reply(
    `╭─❏「 ❌ UANG 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh Rp ${biaya.toLocaleString()} untuk liburan`
  )

  const cerita = [
    `Kamu dan *${p.name}* menikmati pantai yang tenang\n Main air, makan seafood, lalu melihat sunset bersama`,
    `Liburan ke pegunungan bersama *${p.name}*\n Udara dingin dan pemandangannya bikin betah`,
    `Staycation romantis bareng *${p.name}*\n Seharian rebahan, pesan makanan, dan nonton film`,
    `Kamu mengajak *${p.name}* jalan-jalan ke kota wisata\n Foto berdua di setiap tempat yang kalian datangi`,
    `Petualangan singkat bersama *${p.name}* ${waktu.toLowerCase()}\n Capeknya hilang karena kalian menikmati semuanya berdua`,
  ]

  wdb.money[m.sender] -= biaya
  p.love = Math.min(100, p.love + 20)
  const up = addExp(p, 40)
  user.cooldown['liburan'+no] = Date.now()
  saveDB(wdb)

  const ceritaRand = cerita[Math.floor(Math.random() * cerita.length)]

  let msg = `╭─❏「 🏖️ LIBURAN BERSAMA 」❏\n`
  msg += `│ 🏖️ *MOMEN LIBURAN*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${ceritaRand}\n\n`
  msg += `💰 *Uang*: -Rp ${biaya.toLocaleString()}\n`
  msg += `💌 *Love*: +20\n`
  msg += `📈 *EXP*: +40\n`

  if(up) msg += `🎉 *LEVEL UP!* Lv.${p.level}\n`

  msg += `\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}
  // === MAKAN LV5 ===
if (action === 'makan') {
  let err = cekLevel(p, 1, 'Makan')
  if(err) return m.reply(err)
  
  if(cekCD('makan'+no, 7200000) > 0) return m.reply(
    `╭─❏「 ⏰ KENYANG 」❏\n` +
    `│ ⏰ *MASIH KENYANG*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
  
  let biaya = Math.floor(Math.random() * 10000) + 15000
  if ((wdb.money[m.sender] || 0) < biaya) return m.reply(
    `╭─❏「 ❌ UANG 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh Rp ${biaya.toLocaleString()}`
  )
  
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
    `*${p.name}* traktir kamu makan ${waktu.toLowerCase()}\nMenunya enak banget, nambah 2x`,
    `Makan bareng *${p.name}* ${waktu.toLowerCase()}\nSambil suap-suapan bercanda`,
    `*${p.name}* masakin kamu ${waktu.toLowerCase()}\nRasanya bikin kangen rumah`,
    `Makan malam romantis sama *${p.name}* ${waktu.toLowerCase()}\nSaling suapin dan rebutan makanan`,
    `*${p.name}* pesen menu favorit kamu\nKatanya biar kamu tambah sayang`,
    `Date makan bareng *${p.name}*\nDuduk mepet sambil bisik-bisik`
  ]
  
  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 🍽️ *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💰 *Uang*: -Rp ${biaya.toLocaleString()}\n`
  msg += `💌 *Love*: +8\n`
  msg += `📈 *EXP*: +12`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === PELUK LV1 ===
if (action === 'peluk') {
  let err = cekLevel(p, 10, 'Peluk') 
  if(err) return m.reply(err)

  if (user.harem.length === 0) return m.reply(
    `╭─❏「 ❌ JOMBLO 」❏\n` +
    `│ ❌ *BELUM PUNYA PASANGAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pacaran dulu baru bisa peluk`
  )

  if(cekCD('peluk'+no, 1800000) > 0) return m.reply(
    `╭─❏「 ⏰ MALU 」❏\n` +
    `│ ⏰ *MASIH MALU*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
  
  p.love = Math.min(100, p.love + 5)
  let up = addExp(p, 8)
  user.cooldown['peluk'+no] = Date.now()
  saveDB(wdb)

  const judul = [
    '🫂 PELUK HANGAT','🤗 HUG TIME','💞 DEKETAN', 
    '🫂 PELUKAN ERAT', '💞 MANJA', '😳 NEMPEL'     
  ]

  const isi = [
    `*${p.name}* ngasih peluk hangat ${waktu.toLowerCase()}\nCapek langsung ilang`,
    `Pelukan dari *${p.name}* paling nyaman\nRasanya aman banget`,
    `*${p.name}* nyender di bahu kamu ${waktu.toLowerCase()}\nDiem aja udah bahagia`,
    `Kamu peluk *${p.name}* dari belakang ${waktu.toLowerCase()}\nBisikin "kangen" di telinganya`,
    `*${p.name}* duduk di pangkuan kamu\nPelukan yg lama banget lepasnya`,
    `Nempel terus sama *${p.name}*\nKatanya anget dan nyaman`
  ]
  
  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 🫂 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: +5\n`
  msg += `📈 *EXP*: +8`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === MANDI LV40 ===
if (action === 'mandi') {
  let err = cekLevel(p, 40, 'Mandi')
  if(err) return m.reply(err)

  if(cekCD('mandi'+no, 3600000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH DALAM COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Baru mandi`
  )

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
    `Mandi bareng *${p.name}* ${waktu.toLowerCase()}\nSambil ngobrol santai`,
    `*${p.name}* siapin air hangat buat kamu\nRasanya nyaman banget`,
    `Waktu santai bareng *${p.name}*\nBercanda sambil cuci muka`,
    `Mandi bareng *${p.name}* ${waktu.toLowerCase()}\nSaling gosokin punggung sambil bercanda`,
    `*${p.name}* rebutan shower sama kamu\nBasah-basahan dan ketawa terus`,
    `Waktu privat berdua di kamar mandi *${p.name}*\nBantuin keramas katanya`,
    `*${p.name}* narik kamu ke shower\n"Mandi bareng yuk" katanya sambil senyum nakal`,
    `Berendam di bathtub sama *${p.name}*\nBusanya banyak dan lampunya temaram`,
    `*${p.name}* nempel dari belakang pas kamu sabunan\nBisik "jangan gerak dulu"`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 🛁 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: +8\n`
  msg += `📈 *EXP*: +12`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}

  // === TIDUR LV40 ===
if (action === 'tidur') {
  let err = cekLevel(p, 40, 'Tidur')
  if(err) return m.reply(err)

  if(cekCD('tidur'+no, 28800000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH DALAM COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Baru tidur`
  )

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
    `Tidur dipelukan *${p.name}* ${waktu.toLowerCase()}\nMimpinya indah banget`,
    `*${p.name}* bisikin "selamat tidur"\nTerus kalian tidur sambil pegangan tangan`,
    `Malam ditemenin *${p.name}*\nRasanya tenang dan aman`,
    `Tidur bareng *${p.name}* ${waktu.toLowerCase()}\nNempel terus, ga mau lepas pelukannya`,
    `*${p.name}* minta digendong pas tidur\nKatanya gitu baru nyenyak`,
    `Semalaman pelukan sama *${p.name}*\nBangun-bangun masih saling tatap`,
    `*${p.name}* tidurnya sambil tiduran di dada kamu\nNapasnya anget dan pelan`,
    `Berdua pake 1 selimut sama *${p.name}*\nKaki saling nyari di bawah selimut`,
    `Malam ini *${p.name}* manja banget\nDari tidur sampe bangun ga lepas pelukan`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 😴 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: +10\n`
  msg += `📈 *EXP*: +15`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === BELANJA LV10 ===
if (action === 'belanja') {
  let err = cekLevel(p, 10, 'Belanja')
  if(err) return m.reply(err)

  if(cekCD('belanja'+no, 7200000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Dompet kosong`
  )

  let biaya = Math.floor(Math.random() * 20000) + 10000

  if ((wdb.money[m.sender] || 0) < biaya) return m.reply(
    `╭─❏「 ❌ UANG 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh Rp ${biaya.toLocaleString()}`
  )

  wdb.money[m.sender] -= biaya
  p.love = Math.min(100, p.love + 10)
  let up = addExp(p, 15)
  saveDB(wdb)

  const judul = [
    '🛍️ BELANJA BARENG','🛒 JALAN KE MALL','🎁 SHOPPING TIME',
    '🏬 MALL DATE','🛒 JAJAN BARENG'
  ]

  const isi = [
    `Belanja bareng *${p.name}* ${waktu.toLowerCase()}\nNyoba baju terus saling kasih pendapat`,
    `*${p.name}* nemenin kamu cari barang\nMuter mall sampe capek tapi seru`,
    `Shopping bareng *${p.name}*\nJajan es krim dulu biar semangat*\nKeliling toko sambil pilih barang lucu`,
    `*${p.name}* traktir kamu jajan\nSeneng banget bisa jalan bareng`,
    `Hunting barang sama *${p.name}*\nDapat banyak diskon dan foto lucu`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 🛍️ *MOMEN BELANJA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💰 *Uang*: -Rp ${biaya.toLocaleString()}\n`
  msg += `💌 *Love*: +10\n`
  msg += `📈 *EXP*: +15`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === KERJA LV10 ===
if (action === 'kerja') {
  let err = cekLevel(p, 40, 'Kerja')
  if(err) return m.reply(err)

  if (!p.menikah) return m.reply(
    `╭─❏「 ❌ NIKAH 」❏\n` +
    `│ ❌ *BELUM MENIKAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Harus nikah dulu`
  )

  if(cekCD('kerja'+no, 14400000) > 0) return m.reply(
    `╭─❏「 ⏰ CAPEK 」❏\n` +
    `│ ⏰ *MASIH CAPEK*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${p.name} masih capek`
  )

  let gaji = Math.floor(Math.random() * 30000) + 15000
  wdb.money[m.sender] += gaji
  p.love += 8
  let up = addExp(p, 15)
  user.cooldown['kerja'+no] = Date.now()
  saveDB(wdb)

  const judul = [
    '💼 KERJA BARENG','💰 CARI CUAN','👨‍💼 TIM KERJA'
  ]

  const isi = [
    `Kerja bareng *${p.name}* ${waktu.toLowerCase()}\nKompak banget, bos sampe muji`,
    `*${p.name}* bantuin kamu lembur\nPulang dibeliin makan enak`,
    `Satu tim sama *${p.name}*\nKerjaan cepet beres karena kerja sama`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💼 *MOMEN KERJA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💰 *Uang*: +Rp ${gaji.toLocaleString()}\n`
  msg += `💌 *Love*: +8\n`
  msg += `📈 *EXP*: +15`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === GIFT HANDLER ===
if (action === 'gift') {
  let tipe = args[1]?.toLowerCase()

  // MODE LIST:.rship gift list
  if(tipe === 'list'){
    let cap = `╭─❏「 🎁 DAFTAR 50 HADIAH 」❏\n`
    cap += `│ 🎁 *DAFTAR HADIAH*\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    GIFT_LIST.forEach((g, i) => {
      cap += `*${g.emoji} ${i+1}. ${g.desc}*\n`
      cap += `> ↳ Harga: Rp ${g.harga.toLocaleString()}\n`
      cap += `> ↳ EXP: ${g.exp.toLocaleString()}\n\n`
    })

    cap += `─━━━━━━━━━━━━━━─\n\n`
    cap += `📌 *CARA PAKAI*\n`
    cap += `> ↳ Item: .rship gift item 5 2\n`
    cap += `> ↳ Nama: .rship gift item baju 1\n`
    cap += `> ↳ Uang: .rship gift money 50000000\n\n`
    cap += `─━━━━━━━━━━━━━━─`

    return m.reply(cap)
  }

  // MODE HADIAH ANAK: .rship gift anak <no> item/money ...
  if (tipe === 'anak') {
    const childNo = parseInt(args[2]) - 1
    const child = user.kids[childNo]
    const giftType = args[3]?.toLowerCase()

    if (!child) return m.reply(
      `╭─❏「 ❌ ANAK TIDAK DITEMUKAN 」❏\n` +
      `│ ❌ *DATA ANAK TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Contoh: ${usedPrefix}rship gift anak 1 item 5 1`
    )

    let giftName
    let jumlah
    let totalHarga
    let totalExp
    let totalLove

    if (giftType === 'money' || giftType === 'uang') {
      const nominal = parseInt(args[4])

      if (!nominal || nominal <= 0) return m.reply(
        `╭─❏「 ❌ FORMAT HADIAH 」❏\n` +
        `│ ❌ *FORMAT TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Contoh: ${usedPrefix}rship gift anak 1 money 50000`
      )

      giftName = 'Uang jajan'
      jumlah = nominal
      totalHarga = nominal
      totalExp = Math.max(10, Math.floor(nominal / 1000))
      totalLove = Math.max(1, Math.floor(nominal / 10000))

    } else if (giftType === 'item') {
      const input = args[4]
      jumlah = parseInt(args[5]) || 1

      const giftIndex = parseInt(input) - 1
      const gift = !isNaN(giftIndex)
        ? GIFT_LIST[giftIndex]
        : GIFT_LIST.find(item => item.nama === input?.toLowerCase())

      if (!gift || jumlah <= 0) return m.reply(
        `╭─❏「 ❌ FORMAT HADIAH 」❏\n` +
        `│ ❌ *FORMAT TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Contoh: ${usedPrefix}rship gift anak 1 item 5 1`
      )

      giftName = `${jumlah}x ${gift.desc}`
      totalHarga = gift.harga * jumlah
      totalExp = gift.exp * jumlah
      totalLove = gift.love * jumlah

    } else {
      return m.reply(
        `╭─❏「 ❌ FORMAT HADIAH 」❏\n` +
        `│ ❌ *FORMAT TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${usedPrefix}rship gift anak 1 item 5 1\n` +
        `> ↳ ${usedPrefix}rship gift anak 1 money 50000`
      )
    }

    if ((user.bank || 0) < totalHarga) return m.reply(
      `╭─❏「 ❌ BANK KOSONG 」❏\n` +
      `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh Rp ${totalHarga.toLocaleString()} di bank`
    )

    user.bank -= totalHarga
    child.love = Math.min(100, (child.love || 0) + totalLove)
    child.exp = (child.exp || 0) + totalExp
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🎁 HADIAH UNTUK ANAK 」❏\n` +
      `│ 🎁 *HADIAH DITERIMA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `👶 *${child.nama}* menerima ${giftName}\n` +
      `> ↳ 💰 Bank: -Rp ${totalHarga.toLocaleString()}\n` +
      `> ↳ 💖 Kasih sayang: +${totalLove}\n` +
      `> ↳ 📈 EXP: +${totalExp}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let p = user.harem[0] // ganti sesuai sistem pilih pasangan kamu

  if(!p) return m.reply(
    `╭─❏「 ❌ BELUM PUNYA PASANGAN 」❏\n` +
    `│ ❌ *BELUM PUNYA PASANGAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pacaran dulu lah`
  )

  // MODE 1: GIFT MONEY
  if(tipe === 'money' || tipe === 'uang'){
    let jumlah = parseInt(args[2])

    if(!jumlah || jumlah <= 0) return m.reply(
      `╭─❏「 ❌ SALAH 」❏\n` +
      `│ ❌ *FORMAT TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Contoh: .rship gift money 50000000`
    )

    if ((user.bank || 0) < jumlah) return m.reply(
      `╭─❏「 ❌ BANK KOSONG 」❏\n` +
      `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh Rp ${jumlah.toLocaleString()} di bank`
    )

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

    const judul = [
      '💵 KASIH UANG','💰 TRAKTIRAN','💸 ROYAL GIFT','💵 CASH MONEY',
      '💳 TRANSFER SAYANG','💵 DUIT JAJAN','💰 HADIAH UANG',
      '💸 TAJIR MENDADAK','💵 NGASIH DUIT'
    ]

    const isi = [
      `Kamu transfer Rp ${jumlah.toLocaleString()} ke *${p.name}* ${waktu.toLowerCase()}\n*${p.name}*: "Makasih banyak sayang!"`,
      `*${p.name}* kaget dikasih uang sebanyak itu\nLangsung peluk dan cium pipi kamu`,
      `Kamu traktir *${p.name}* Rp ${jumlah.toLocaleString()}\n"Buat jajan ya" katanya sambil senyum`,
      `*${p.name}* langsung belanja online abis dapet duit\nKirim struknya ke kamu semua`,
      `Kasih uang ke *${p.name}* ${waktu.toLowerCase()}\nDia bilang "Aku sayang kamu banget"`,
      `*${p.name}* nabung uang dari kamu\nKatanya buat masa depan kalian berdua`,
      `Transfer dadakan ke *${p.name}*\nDibales "Ini buat apa? Banyak amat"`,
      `*${p.name}* happy banget dapet uang\nMood dia langsung naik 100%`,
      `Kamu kasih uang ke *${p.name}*\nDipake buat beli baju couple katanya`
    ]

    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    let msg = `╭─❏「 ${judulRand} 」❏\n`
    msg += `│ 💵 *HADIAH UANG*\n`
    msg += `╰─━━━━━━━━━━━━━━─\n\n`
    msg += `${isiRand}\n\n`
    msg += `💰 *Bank*: -Rp ${jumlah.toLocaleString()}\n`
    msg += `💌 *Love*: +${love}\n`
    msg += `📈 *EXP*: +${exp}\n`
    msg += `⏰ *Cooldown*: ${jam}j ${menit}m`

    if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

    msg += `\n\n─━━━━━━━━━━━━━━─`

    return m.reply(msg)
  }

  // MODE 2: GIFT ITEM
  if(tipe === 'item'){
    let input = args[2]
    let jumlah = parseInt(args[3]) || 1

    if(!input) return m.reply(
      `╭─❏「 ❌ SALAH 」❏\n` +
      `│ ❌ *FORMAT TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Contoh: .rship gift item 5 2`
    )

    let gift
    let noGift = parseInt(input) - 1

    if(!isNaN(noGift)) gift = GIFT_LIST[noGift]
    else gift = GIFT_LIST.find(g => g.nama === input.toLowerCase())

    if(!gift) return m.reply(
      `╭─❏「 ❌ SALAH 」❏\n` +
      `│ ❌ *HADIAH TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Lihat list dulu: .rship gift list`
    )

    let totalHarga = gift.harga * jumlah
    let totalExp = gift.exp * jumlah
    let totalLove = gift.love * jumlah
    let cooldown = Math.min(86400000, Math.floor(totalHarga / 1000000) * 3600000)

    if(Date.now() - (user.cooldown['gift_'+p.name] || 0) < (user.cooldown['gift_cd_'+p.name] || 0)) {
      let sisa = Math.ceil(((user.cooldown['gift_'+p.name] || 0) + (user.cooldown['gift_cd_'+p.name] || 0) - Date.now()) / 60000)

      return m.reply(
        `╭─❏「 ⏰ COOLDOWN 」❏\n` +
        `│ ⏰ *HADIAH SEBELUMNYA MASIH BERLAKU*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${p.name} masih seneng sama hadiah sebelumnya\n` +
        `> ↳ Tunggu ${sisa} menit lagi`
      )
    }

    if ((user.bank || 0) < totalHarga) return m.reply(
      `╭─❏「 ❌ BANK KOSONG 」❏\n` +
      `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh Rp ${totalHarga.toLocaleString()} di bank`
    )

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

    const judul = [
      '🎁 HADIAH MEWAH','💎 KADO SPESIAL','👑 ROYAL GIFT',
      '🎀 SURPRISE','💝 KADO CINTA','🎁 PAKET MEWAH',
      '💎 GIFT EKSKLUSIF','🎁 KADO TERBAIK','💝 UNTUKMU SAYANG'
    ]

    const isi = [
      `${gift.emoji} Kamu kasih ${jumlah}x *${gift.desc}* ke *${p.name}* ${waktu.toLowerCase()}\nDia langsung peluk dan bilang makasih`,
      `${gift.emoji} *${p.name}* kaget dapet ${gift.desc}\n"Sayang ini mahal banget" katanya sambil nangis haru`,
      `${gift.emoji} Surprise ${gift.desc} buat *${p.name}*\nMood dia langsung naik dan makin sayang`,
      `${gift.emoji} *${p.name}* unboxing ${gift.desc} di depan kamu\nTerus langsung pake dan muter-muter`,
      `${gift.emoji} Kado ${gift.desc} bikin *${p.name}* seneng banget\nSeharian ga lepas dari kamu`,
      `${gift.emoji} *${p.name}* pamer ${gift.desc} ke temennya\n"Ini dari pacar aku" katanya bangga`,
      `${gift.emoji} Kamu beliin ${gift.desc} buat *${p.name}*\nDia bilang "Aku ga nyangka" sambil peluk`,
      `${gift.emoji} Hadiah ${gift.desc} dari kamu\n*${p.name}* simpen baik-baik katanya`,
      `${gift.emoji} *${p.name}* fotoin ${gift.desc} terus\nBuat dijadiin wallpaper HP`
    ]

    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    let msg = `╭─❏「 ${judulRand} 」❏\n`
    msg += `│ 🎁 *HADIAH UNTUK PASANGAN*\n`
    msg += `╰─━━━━━━━━━━━━━━─\n\n`
    msg += `${isiRand}\n\n`
    msg += `💰 *Bank*: -Rp ${totalHarga.toLocaleString()}\n`
    msg += `💌 *Love*: +${totalLove}\n`
    msg += `📈 *EXP*: +${totalExp}\n`
    msg += `⏰ *Cooldown*: ${jam}j ${menit}m`

    if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

    msg += `\n\n─━━━━━━━━━━━━━━─`

    return m.reply(msg)
  }

  return m.reply(
    `╭─❏「 ❌ FORMAT 」❏\n` +
    `│ ❌ *FORMAT GIFT*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Item: .rship gift item 5 2\n` +
    `> ↳ Uang: .rship gift money 50000000\n` +
    `> ↳ List: .rship gift list`
  )
}


// === USIL LV30 ===
if (action === 'usil') {
  let err = cekLevel(p, 1, 'Usil')
  if(err) return m.reply(err)

  if(cekCD('usil'+no, 3600000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 1 jam`
  )

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
    `Isengin *${p.name}* ${waktu.toLowerCase()}\nDia kaget terus ketawa ngak`,
    `*${p.name}* digelitikin pas lagi diem\n"Awas ya" katanya sambil ngejar`,
    `Jahilin *${p.name}* pake filter jelek\nHasilnya lucu banget`,
    `Sembunyiin sendal *${p.name}* terus pura2 bantu nyari\nPas ketemu dia langsung manyun`,
    `Ganti nada dering *${p.name}* pake suara kambing\nKaget tiap ada notif masuk`,
    `Tempel stiker "aku jomblo" di belakang HP *${p.name}*\nDia baru sadar pas difoto orang`,
    `Isi chat *${p.name}* pake stiker cringe 50 biji\nDia scroll sejam buat hapusin`,
    `Tuker wallpaper *${p.name}* pake foto pas tidur ngiler\nLangsung hapus grup gara2 malu`,
    `Broadcast ke semua kontak *${p.name}*: "aku suka kamu"\nDia ngeblok kamu 3 hari`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 😈 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: -2\n`
  msg += `📈 *EXP*: +10`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === MARAH LV1 ===
if (action === 'marah') {
  let err = cekLevel(p, 1, 'Marah')
  if(err) return m.reply(err)

  if(cekCD('marah'+no, 3600000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 1 jam`
  )

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
    `Kamu sama *${p.name}* lagi salah paham ${waktu.toLowerCase()}\nAbis itu baikan lagi kok`,
    `*${p.name}* ngambek bentar\nTapi ujungnya saling minta maaf`,
    `Cekcok kecil sama *${p.name}*\nNamanya juga pasangan ya`,
    `*${p.name}* cemberut karena kamu kurang perhatian ${waktu.toLowerCase()}\nSpill peluk 1x langsung luluh`,
    `Diem dieman sejam sama *${p.name}*\nYang kalah duluan yang chat duluan`,
    `Ujung ujungan gara gara hal sepele sama *${p.name}*\n5 menit kemudian udah kangen`,
    `*${p.name}* marah sambil kode "ga butuh kamu"\nPadahal chat tiap 2 menit`,
    `Perang bantal virtual sama *${p.name}*\nKatanya marah, tapi ketawanya paling kenceng`,
    `Abis marah sama *${p.name}* malah jadi nempel terus\nKatanya hukuman, ujungnya baikan di kasur`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 😤 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💔 *Love*: -8\n`
  msg += `📈 *EXP*: +5`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === MAAF ===
if (action === 'maaf') {
  let err = cekLevel(p, 1, 'Maaf')
  if(err) return m.reply(err)

  if(cekCD('maaf'+no, 1800000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 30 menit`
  )

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
    `Kamu nyamperin *${p.name}* terus bilang "maaf ya" ${waktu.toLowerCase()}\nDia diem 3 detik terus senyum`,
    `Peluk dari belakang pas *${p.name}* lagi diem\nKatanya "ih ngagetin" tapi ga ngelepas`,
    `Kirim chat panjang ke *${p.name}*\nIsinya minta maaf + janji ga ngulangin`,
    `Ternyata yang bikin marah itu miskom doang\nAbis dijelasin *${p.name}* langsung ketawa`,
    `Kamu duluan yang chat "udah yuk"\n*${p.name}* jawab "ihh dari tadi kemana aja"`,
    `*${p.name}* gengsi, tapi kamu yang ngalah duluan\nPoin +100 buat dewasa`,
    `Ngalah demi hubungan daripada ego\n*${p.name}* jadi makin sayang`,
    `Abis baikan langsung minta dicium\n*${p.name}* "ihh ga sekalian nikah"`,
    `5 menit abis marah udah nempel lagi\nKatanya benci, kelakuannya nempel 24 jam`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💕 *MOMEN BAIKAN*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💖 *Love*: +12\n`
  msg += `📈 *EXP*: +8`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === TALK ===
if (action === 'talk') {
  let err = cekLevel(p, 1, 'Talk')
  if(err) return m.reply(err)

  if(cekCD('talk'+no, 900000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 15 menit`
  )

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
    `Nongkrong sama *${p.name}* sambil ngopi ${waktu.toLowerCase()}\nBahas hal ga penting sampe 1 jam`,
    `Chat an receh sama *${p.name}*\nDari "lagi apa" ujungnya debat mie kuah apa goreng`,
    `Telfonan sama *${p.name}* pas mau tidur\nUjungnya ketiduran bareng`,
    `Ngegossipin temen sama *${p.name}*\nAbis itu kompak "gapapa yang penting kita"`,
    `Mabar bareng *${p.name}*\nKamu yang feeder, dia yang gendong`,
    `*${p.name}* tiba-tiba bilang "kamu cakep"\nPadahal lagi pake baju tidur`,
    `VC cepet sama *${p.name}*\nKatanya cuma 5 menit, molor jadi 1 jam`,
    `*${p.name}* tiba-tiba spam "sayang sayang"\nPadahal ga ada angin ga ada hujan`,
    `Curhat malem sama *${p.name}*\nDari masalah hidup ujungnya "besok makan apa"`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💬 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💖 *Love*: +4\n`
  msg += `📈 *EXP*: +3`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === KISS LV20 ===
if (action === 'kiss') {
  let err = cekLevel(p, 27, 'Kiss')
  if(err) return m.reply(err)

  if(cekCD('kiss'+no, 14400000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 4 jam`
  )

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
    `Momen romantis bareng *${p.name}* ${waktu.toLowerCase()}\nSaling tatap dan senyum`,
    `*${p.name}* kasih kejutan manis\nBikin hati kamu anget`,
    `Waktu berkualitas sama *${p.name}*\nPenuh kasih sayang`,
    `Ciuman lama sama *${p.name}* ${waktu.toLowerCase()}\nDi pipi, kening, terus bibir`,
    `*${p.name}* nyamperin terus minta dicium\nGa cukup sekali katanya`,
    `Momen mesra berdua sama *${p.name}*\nBisik "aku sayang kamu" abis itu`,
    `*${p.name}* tiba-tiba nyium leher kamu ${waktu.toLowerCase()}\nBikin merinding dan ketawa`,
    `Ciuman intens diem-diem sama *${p.name}*\nTakut ketahuan orang`,
    `*${p.name}* gigit bibir kamu pelan\nTerus bilang "nakal ya"`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💋 *MOMEN MESRA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: +15\n`
  msg += `📈 *EXP*: +30`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}

  // === NONTON LV20 ===
  if (action === 'nonton') {
    let err = cekLevel(p, 20, 'Nonton')
    if(err) return m.reply(err)
    if(cekCD('nonton'+no, 10800000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 3 jam\n╰─━━━━━━━━━━━━━━─`)
    p.love = Math.min(100, p.love + 12)
    let up = addExp(p, 18)
    user.cooldown['nonton'+no] = Date.now()
    saveDB(wdb)

    const judul = ['🎬 NONTON BARENG','🍿 MOVIE DATE','📺 MARATON FILM','🌃 BIOSKOP ROMANTIS']
    const isi = [
      `Nonton ${['Anime','Horror','Romance','Action','Komedi'][Math.floor(Math.random()*5)]} sama *${p.name}*\nKalian ketawa bareng terus`,
      `*${p.name}* nyender pas nonton ${waktu.toLowerCase()}\nFilmnya seru, suasana makin enak`,
      `Maraton film bareng *${p.name}*\nBeli popcorn 2 ember 😂`,
      `*${p.name}* nutup mata pas scene serem\nTerus pegang tangan kamu`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(
      `╭─❏「 ${judulRand} 」❏\n` +
      `│ 🍿 *MOMEN NONTON*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${isiRand}\n\n` +
      `💌 *Love* : +12\n` +
      `📈 *EXP* : +18\n` +
      `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
      `\n─━━━━━━━━━━━━━━─`
    )
  }

  // === SWIM LV60 ===
  if (action === 'swim') {
    let err = cekLevel(p, 20, 'Swim')
    if(err) return m.reply(err)
    if(cekCD('swim'+no, 14400000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 4 jam\n╰─━━━━━━━━━━━━━━─`)
    p.love = Math.min(100, p.love + 20)
    let up = addExp(p, 50)
    user.cooldown['swim'+no] = Date.now()
    saveDB(wdb)

    const judul = ['🏊 RENANG BARENG','🌊 PANTAI ROMANTIS','☀️ LIBURAN BERDUA']
    const isi = [
      `Renang bareng *${p.name}* di pantai ${waktu.toLowerCase()}\nSaling cipratin air terus ketawa`,
      `*${p.name}* ngajarin kamu renang\nPegangannya erat banget`,
      `Main pasir sama *${p.name}*\nBikin istana pasir terus foto-foto`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(
      `╭─❏「 ${judulRand} 」❏\n` +
      `│ 🌊 *MOMEN BARENG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${isiRand}\n\n` +
      `💌 *Love* : +20\n` +
      `📈 *EXP* : +50\n` +
      `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
      `\n─━━━━━━━━━━━━━━─`
    )
  }

  // === BELI CINCIN ===
  if (action === 'belicincin') {
    let no = parseInt(args[1]) - 1
    let jenis = args[2]?.toLowerCase()
    if(isNaN(no) ||!user.harem[no]) return m.reply(`╭─❏「 ❌ SALAH 」❏\n\nContoh:.rship belicincin 1 emas\n╰─━━━━━━━━━━━━━━─`)
    let p = user.harem[no]
    if(p.menikah) return m.reply(`╭─❏「 ❌ UDAH 」❏\n\nUdah nikah\n╰─━━━━━━━━━━━━━━─`)

    let harga = {emas: 500000, berlian: 2000000, platina: 5000000}
    let namaCincin = {emas: 'Cincin Emas', berlian: 'Cincin Berlian', platina: 'Cincin Platina'}
    if(!harga[jenis]) return m.reply(
      `╭─❏「 💎 JENIS CINCIN 」❏\n` +
      `│ 💍 *Pilihan Cincin*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Emas: Rp 500.000\n` +
      `> ↳ Berlian: Rp 2.000.000\n` +
      `> ↳ Platina: Rp 5.000.000\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
    if ((wdb.money[m.sender] || 0) < harga[jenis]) return m.reply(`╭─❏「 ❌ UANG 」❏\n\nButuh Rp ${harga[jenis].toLocaleString()}\n╰─━━━━━━━━━━━━━━─`)

    wdb.money[m.sender] -= harga[jenis]
    p.cincin = namaCincin[jenis]
    saveDB(wdb)

    return m.reply(
      `╭─❏「 💎 BELI CINCIN 」❏\n` +
      `│ 💍 *Pembelian Berhasil*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Berhasil beli ${namaCincin[jenis]} untuk ${p.name}\n\n` +
      `💰 *Uang* : -Rp ${harga[jenis].toLocaleString()}\n` +
      `💍 *Cincin* : ${namaCincin[jenis]}\n\n` +
      `Sekarang bisa nikah\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  // === NIKAH LV40 HARUS PAKE CINCIN ===
  if (action === 'nikah') {
    let err = cekLevel(p, 40, 'Nikah')
    if(err) return m.reply(err)
    if (p.menikah) return m.reply(`╭─❏「 ❌ UDAH 」❏\n\nUdah nikah\n╰─━━━━━━━━━━━━━━─`)
    if (!p.cincin) return m.reply(`╭─❏「 ❌ CINCIN 」❏\n\nBeli cincin dulu:.rship belicincin ${no+1} emas/berlian/platina\n╰─━━━━━━━━━━━━━━─`)
    if (p.love < 90) return m.reply(`╭─❏「 ❌ LOVE 」❏\n\nLove ${p.love}%. Minimal 90%\n╰─━━━━━━━━━━━━━━─`)
    p.menikah = true
    user.dateStats.totalNikah++
    saveDB(wdb)

    return m.reply(
      `╭─❏「 💍 NIKAH 」❏\n` +
      `│ 💕 *PERNIKAHAN BERHASIL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Selamat menikah dengan ${p.name}!\n\n` +
      `💍 *Cincin* : ${p.cincin}\n` +
      `💕 *Status* : Sekarang jadi Suami/Istri\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  // === WOHOO LV40 ===
  if (action === 'wohoo') {
    let err = cekLevel(p, 40, 'Wohoo')
    if(err) return m.reply(err)
    if(cekCD('wohoo'+no, 21600000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 6 jam\n╰─━━━━━━━━━━━━━━─`)
    p.love = Math.min(100, p.love + 25)
    let up = addExp(p, 60)
    user.dateStats.wohoo++
    user.cooldown['wohoo'+no] = Date.now()
    saveDB(wdb)

    const judul = ['🌙 MALAM ROMANTIS','💞 QUALITY TIME','✨ WAKTU BERDUA','🔥 MOMEN PANAS','💋 PRIVAT TIME']
    const isi = [
      `Waktu berdua sama *${p.name}*\nNonton, makan, dan ngobrol santai`,
      `Cuma berdua di kamar, lampu redup`,
      `*${p.name}* manja banget malem ini\nBisik-bisik dan ketawa kecil`,
      `Quality time berdua sama *${p.name}*\nGaada yg ganggu, full perhatian`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(
      `╭─❏「 ${judulRand} 」❏\n` +
      `│ 💞 *MOMEN BERDUA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${isiRand}\n\n` +
      `💌 *Love* : +25\n` +
      `📈 *EXP* : +60\n` +
      `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
      `\n─━━━━━━━━━━━━━━─`
    )
  }

  // === ANAK LV40 ===
  if (action === 'anak') {
    let err = cekLevel(p, 50, 'Anak')
    if(err) return m.reply(err)
    if (!p.menikah) return m.reply(`╭─❏「 ❌ NIKAH 」❏\n\nHarus nikah dulu\n╰─━━━━━━━━━━━━━━─`)
    if (p.love < 70) return m.reply(`╭─❏「 ❌ LOVE 」❏\n\nLove minimal 90%\n╰─━━━━━━━━━━━━━━─`)
    if(cekCD('anak'+no, 86400000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 24 jam\n╰─━━━━━━━━━━━━━━─`)
    let jenis = Math.random() < 0.5? 'Laki-laki' : 'Perempuan'
    let namaAnak = args.slice(2).join(' ') || `Bayi ${p.name}`
    user.kids.push({ nama: namaAnak, jenis, umur: 0, careCount: 0, ortu: p.name })
    addExp(p, 40)
    user.cooldown['anak'+no] = Date.now()
    saveDB(wdb)

    return m.reply(
      `╭─❏「 👶 ANAK 」❏\n` +
      `│ 👶 *KELUARGA BERTAMBAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Kamu dan ${p.name} punya anak!\n\n` +
      `${getGenderEmoji(jenis === 'Laki-laki'? 'cowok' : 'cewek')} ${namaAnak} - ${jenis}\n` +
      `📈 *EXP* : +40\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  // === URUS ANAK ===
  if (action === 'urusanak') {
    let no = parseInt(args[1]) - 1
    if(isNaN(no) ||!user.kids[no]) return m.reply(`╭─❏「 ❌ SALAH 」❏\n\nContoh:.rship urusanak 1\n╰─━━━━━━━━━━━━━━─`)
    let anak = user.kids[no]
    const previousCareCount = getChildCareCount(anak)

    if (previousCareCount >= CHILD_STAGES[CHILD_STAGES.length - 1].care) {
      return m.reply(
        `╭─❏「 ✅ ANAK SUDAH DEWASA 」❏\n` +
        `│ 👶 *${anak.nama}*\n` +
        `│ Sudah dewasa.\n` +
        `│ Tidak perlu diurus lagi.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    if(cekCD('urusanak'+no, 14400000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nAnak masih kenyang\n╰─━━━━━━━━━━━━━━─`)
    anak.careCount = previousCareCount + 1
    anak.umur = anak.careCount / 10
    const previousStage = getChildStage(previousCareCount)
    const currentStage = getChildStage(anak.careCount)
    const expOrtu = 20 + anak.careCount
    let cariOrtu = user.harem.find(p => p.name === anak.ortu)
    if(cariOrtu) addExp(cariOrtu, expOrtu)
    user.dateStats.urusAnak++
    user.cooldown['urusanak'+no] = Date.now()
    saveDB(wdb)

    const stageUp = previousStage.name !== currentStage.name

    return m.reply(
      `╭─❏「 👶 URUS ANAK 」❏\n` +
      `│ ${getGenderEmoji(anak.jenis === 'Laki-laki' ? 'cowok' : 'cewek')} *${anak.nama}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tahap : ${currentStage.name}\n` +
      `> ↳ Asuhan : ${getChildProgress(anak.careCount)}\n` +
      `> ↳ EXP Ortu : +${expOrtu}\n` +
      `${stageUp ? `> ↳ 🎉 Naik tahap dari ${previousStage.name}\n` : ''}` +
      `${currentStage === CHILD_STAGES[CHILD_STAGES.length - 1] ? `> ↳ ✅ Sudah dewasa, tidak perlu diurus lagi.\n` : ''}` +
      `\n─━━━━━━━━━━━━━━─`
    )
  }

  // === DUEL LV80 ===
  if (action === 'duel') {
    let err = cekLevel(p, 1, 'Duel')
    if(err) return m.reply(err)
    if(cekCD('duel'+no, 21600000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 6 jam\n╰─━━━━━━━━━━━━━━─`)
    let win = Math.random() < 0.5
    user.cooldown['duel'+no] = Date.now()

    if(win){
      let up = addExp(p, 40)
      p.love = Math.max(0, p.love - 5)
      user.dateStats.duelWin++
      saveDB(wdb)

      return m.reply(
        `╭─❏「 ⚔️ DUEL RELATIONSHIP 」❏\n` +
        `│ 🏆 *KAMU MENANG!*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Kamu berhasil mengalahkan *${p.name}* dalam duel.\n\n` +
        `🥺 *${p.name}* : "Ih kamu tega banget ngalahin aku!"\n\n` +
        `💔 *Love* : -5\n` +
        `📈 *EXP* : +40\n` +
        `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
        `\n─━━━━━━━━━━━━━━─`
      )
    } else {
      let hadiah = Math.floor(Math.random() * 50000) + 25000
      wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hadiah
      p.love = Math.min(100, p.love + 15)
      let up = addExp(p, 60)
      saveDB(wdb)

      return m.reply(
        `╭─❏「 ⚔️ DUEL RELATIONSHIP 」❏\n` +
        `│ 🎉 *${p.name.toUpperCase()} MENANG!*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `*${p.name}* berhasil mengalahkanmu dalam duel.\n\n` +
        `😆 *${p.name}* : "Horeee! Aku lebih kuat dari kamu!" (Bangga & Senang)\n\n` +
        `💖 *Love* : +15\n` +
        `📈 *EXP* : +60\n` +
        `💰 *Hadiah* : +Rp ${hadiah.toLocaleString()}\n` +
        `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
        `\n─━━━━━━━━━━━━━━─`
      )
    }
  }
  
    // === DETAIL PASANGAN ===
  if (action === 'detail') {
    let no = parseInt(args[1]) - 1
    if(isNaN(no) ||!user.harem[no]) return m.reply(`╭─❏「 ❌ SALAH 」❏\n\nContoh:.rship detail 1\n╰─━━━━━━━━━━━━━━─`)
    let p = user.harem[no]
    let need = (p.level || 1) * 200

    let cap = `╭─❏「 📋 DETAIL ${p.name.toUpperCase()} 」❏\n`
    cap += `│ ${getGenderEmoji(p.gender)} *${p.name}*\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `> ↳ 📊 Level : Lv.${p.level} ${getTitle(p.level, p.customTitle)}\n`
    cap += `> ↳ 📈 EXP : ${p.exp || 0}/${need}\n`
    cap += `> ↳ 💌 Love : ${p.love}% ${bar(p.love)}\n`
    cap += `> ↳ 😊 Mood : ${getMood(p.love)}\n`
    cap += `> ↳ 💍 Status : ${p.menikah ? 'Menikah' : 'Pacaran'}\n`
    cap += `> ↳ 💎 Cincin : ${p.cincin || 'Belum ada'}\n\n`
    cap += `🛍️ *Beli cincin*\n`
    cap += `> ↳ ${usedPrefix}rship belicincin ${no + 1} emas/berlian/platina`
    cap += `\n\n─━━━━━━━━━━━━━━─`

    return m.reply(cap)
  }

  // === KILL LV100 ===
  if (action === 'kill') {
    let err = cekLevel(p, 10, 'Kill')
    if(err) return m.reply(err)
    if(cekCD('kill'+no, 604800000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 7 hari\n╰─━━━━━━━━━━━━━━─`)
    
    let nama = p.name
    user.ex.push(p)
    user.harem.splice(no, 1)
    user.dateStats.kill++
    user.cooldown['kill'+no] = Date.now()
    saveDB(wdb)

    const judul = ['💔 HUBUNGAN BERAKHIR', '😢 PERPISAHAN', '💀 FINISH']
    const cerita = [
      `Hubungan kamu dengan *${nama}* berakhir ${waktu.toLowerCase()}\nKeputusan berat tapi harus diambil`,
      `Kamu dan *${nama}* berpisah untuk selamanya\nSemua kenangan jadi masa lalu`,
      `Cerita kalian selesai di sini *${nama}*\nSemoga masing-masing bisa lebih baik`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const ceritaRand = cerita[Math.floor(Math.random() * cerita.length)]

    return m.reply(
      `╭─❏「 ${judulRand} 」❏\n` +
      `│ 💔 *HUBUNGAN BERAKHIR*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${ceritaRand}\n\n` +
      `📊 *Total Putus Paksa* : ${user.dateStats.kill}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  // === PUTUS ===
  if (action === 'putus') {
    let nama = p.name
    user.ex.push(p)
    user.harem.splice(no, 1)
    saveDB(wdb)

    const judul = ['💔 PUTUS', '😔 BERPISAH', '👋 SELAMAT TINGGAL']
    const cerita = [
      `Kamu memutuskan putus dengan *${nama}* ${waktu.toLowerCase()}\nSemoga jadi keputusan terbaik`,
      `Perpisahan dengan *${nama}*\nJalani hidup masing-masing ya`,
      `Hubungan kalian selesai *${nama}*\nTerima kasih untuk semua kenangan`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const ceritaRand = cerita[Math.floor(Math.random() * cerita.length)]

    return m.reply(
      `╭─❏「 ${judulRand} 」❏\n` +
      `│ 💔 *PERPISAHAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${ceritaRand}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
}

handler.help = ['rship']
handler.tags = ['rpg']
handler.command = ['rship']
handler.group = true
export default handler