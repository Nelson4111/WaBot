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
    if(lvl >= 100) return '💎 Belahan Jiwa'
    if(lvl >= 80) return '💖 Cinta Sejati'
    if(lvl >= 60) return '👨‍👩‍👧‍👦 Keluarga'
    if(lvl >= 40) return '💍 Suami/Istri'
    if(lvl >= 30) return '💘 Pasangan'
    if(lvl >= 20) return '💑 Pacar'
    if(lvl >= 10) return '🤝 Sahabat'
    if(lvl >= 5) return '😊 Teman Dekat'
    return '👋 Kenalan'
  }

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

  // === MENU BERSIH TANPA EMOJI DI COMMAND ===
  if (!action) {
    let maxSlot = getMaxSlot()
    let cap = `╭──「 💕 RSHIP CENTER 」──╮\n\n`
    cap += `⏰ ${waktu} | ${jam}:00 WIB\n`
    cap += `💞 Slot : ${user.harem.length}/${maxSlot}\n`
    cap += `👶 Anak : ${user.kids.length}\n\n`
    if (user.harem.length > 0) {
      cap += `💑 DAFTAR PASANGAN:\n`
      user.harem.forEach((p,i) => cap += ` ${i+1}. ${getGenderEmoji(p.gender)} *${p.name}* Lv.${p.level || 1}\n`)
      cap += `\n📋 COMMAND:\n`
      cap += `date <no> | makan <no> | peluk <no>\n`
      cap += `mandi <no> | tidur <no> | belanja <no>\n`
      cap += `kerja <no> | hadiah <no> | usil <no>\n`
      cap += `marah <no> | kiss <no> | nonton <no>\n`
      cap += `swim <no> | nikah <no> | wohoo <no>\n`
      cap += `duel <no> | kill <no>\n`
      cap += `anak <no> <nama> | urusanak <no_anak>\n`
    } else cap += `💔 STATUS : JOMBLO\n`
    cap += `\n📌 tembak <nama> <cowok/cewek> | harem | status <no> | detail <no>\n━━━━━━━━━━━`
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
    let msg = `╭──「 💑 KENCAN 」──╮\n\nKencan sama ${p.name}\n💌 +10 | 📈 +20 EXP`
    if(up) msg += `\n\n🎉 LEVEL UP! Lv.${p.level}\nKetik.rship title ${no+1} buat pilih`
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // === MAKAN LV5 ===
  if (action === 'makan') {
    let err = cekLevel(p, 5, 'Makan')
    if(err) return m.reply(err)
    if(cekCD('makan'+no, 7200000) > 0) return m.reply(`╭──「 ⏰ KENYANG 」──╮\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 8)
    let up = addExp(p, 12)
    user.cooldown['makan'+no] = Date.now()
    saveDB(wdb)
    let msg = `╭──「 🍜 MAKAN 」──╮\n\nMakan bareng ${p.name}\n💌 +8 | 📈 +12 EXP`
    if(up) msg += `\n\n🎉 LEVEL UP! Lv.${p.level}\nKetik.rship title ${no+1} buat pilih`
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // === PELUK LV1 ===
  if (action === 'peluk') {
    if(cekCD('peluk'+no, 1800000) > 0) return m.reply(`╭──「 ⏰ MALU 」──╮\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 5)
    addExp(p, 8)
    user.cooldown['peluk'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 🤗 PELUK 」──╮\n\nPeluk ${p.name}\n💌 +5 | 📈 +8 EXP\n━━━━━━━━━━━`)
  }

  // === MANDI LV40 ===
  if (action === 'mandi') {
    let err = cekLevel(p, 40, 'Mandi')
    if(err) return m.reply(err)
    if(cekCD('mandi'+no, 3600000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nBaru mandi\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 8)
    addExp(p, 12)
    user.cooldown['mandi'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 🛁 MANDI 」──╮\n\nMandi bareng ${p.name}\n💌 +8 | 📈 +12 EXP\n━━━━━━━━━━━`)
  }

  // === TIDUR LV40 ===
  if (action === 'tidur') {
    let err = cekLevel(p, 40, 'Tidur')
    if(err) return m.reply(err)
    if(cekCD('tidur'+no, 28800000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nBaru tidur\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 10)
    addExp(p, 15)
    user.cooldown['tidur'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 😴 TIDUR 」──╮\n\nTidur dipelukan ${p.name}\n💌 +10 | 📈 +15 EXP\n━━━━━━━━━━━`)
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
    addExp(p, 15)
    saveDB(wdb)
    return m.reply(`╭──「 🛍️ BELANJA 」──╮\n\nBelanja bareng ${p.name}\n💰 -Rp ${biaya.toLocaleString()}\n💌 +10 | 📈 +15 EXP\n━━━━━━━━━━━`)
  }

  // === KERJA LV10 ===
  if (action === 'kerja') {
    let err = cekLevel(p, 10, 'Kerja')
    if(err) return m.reply(err)
    if(cekCD('kerja'+no, 14400000) > 0) return m.reply(`╭──「 ⏰ CAPEK 」──╮\n\n${p.name} masih capek\n━━━━━━━━━━━`)
    let gaji = Math.floor(Math.random() * 30000) + 15000
    wdb.money[m.sender] += gaji
    p.love += 8
    addExp(p, 15)
    user.cooldown['kerja'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 💼 KERJA 」──╮\n\nKerja bareng ${p.name}\n💰 +Rp ${gaji.toLocaleString()}\n💌 +8 | 📈 +15 EXP\n━━━━━━━━━━━`)
  }

  // === HADIAH LV10 ===
  if (action === 'hadiah') {
    let err = cekLevel(p, 10, 'Hadiah')
    if(err) return m.reply(err)
    let item = args[2]?.toLowerCase()
    let harga = {bunga: 5000, coklat: 10000, boneka: 50000, cincin: 500000}
    let loveUp = {bunga: 8, coklat: 12, boneka: 20, cincin: 50}
    let expUp = {bunga: 5, coklat: 8, boneka: 15, cincin: 30}
    if (!harga[item]) return m.reply(`╭──「 ❌ ITEM 」──╮\n\nPilihan: bunga, coklat, boneka, cincin\n━━━━━━━━━━━`)
    if ((wdb.money[m.sender] || 0) < harga[item]) return m.reply(`╭──「 ❌ UANG 」──╮\n\nButuh Rp ${harga[item].toLocaleString()}\n━━━━━━━━━━━`)
    wdb.money[m.sender] -= harga[item]
    p.love = Math.min(100, p.love + loveUp[item])
    addExp(p, expUp[item])
    saveDB(wdb)
    return m.reply(`╭──「 🎁 HADIAH 」──╮\n\nKasih ${item} ke ${p.name}\n💌 +${loveUp[item]} | 📈 +${expUp[item]} EXP\n━━━━━━━━━━━`)
  }

  // === USIL LV30 ===
  if (action === 'usil') {
    let err = cekLevel(p, 30, 'Usil')
    if(err) return m.reply(err)
    if(cekCD('usil'+no, 3600000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 1 jam\n━━━━━━━━━━━`)
    p.love = Math.max(0, p.love - 2)
    addExp(p, 10)
    user.cooldown['usil'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 😈 USIL 」──╮\n\nUsilin ${p.name}\n"${p.name} : awas ya!"\n💌 -2 | 📈 +10 EXP\n━━━━━━━━━━━`)
  }

  // === MARAH LV30 ===
  if (action === 'marah') {
    let err = cekLevel(p, 30, 'Marah')
    if(err) return m.reply(err)
    if(cekCD('marah'+no, 10800000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 3 jam\n━━━━━━━━━━━`)
    p.love = Math.max(0, p.love - 15)
    addExp(p, 5)
    user.cooldown['marah'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 😡 MARAH 」──╮\n\nMarah ke ${p.name}\n"${p.name} : jahat!"\n💌 -15 | 📈 +5 EXP\n━━━━━━━━━━━`)
  }

  // === KISS LV20 ===
  if (action === 'kiss') {
    let err = cekLevel(p, 20, 'Kiss')
    if(err) return m.reply(err)
    if (p.love < 70) return m.reply(`╭──「 ❌ LOVE KURANG 」──╮\n\nLove ${p.love}%. Minimal 70%\n━━━━━━━━━━━`)
    if(cekCD('kiss'+no, 7200000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 2 jam\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 15)
    addExp(p, 30)
    user.cooldown['kiss'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 😘 KISS 」──╮\n\nKiss ${p.name}\n💌 +15 | 📈 +30 EXP\n━━━━━━━━━━━`)
  }

  // === NONTON LV20 ===
  if (action === 'nonton') {
    let err = cekLevel(p, 20, 'Nonton')
    if(err) return m.reply(err)
    if(cekCD('nonton'+no, 10800000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 3 jam\n━━━━━━━━━━━`)
    let film = ['Anime', 'Horror', 'Romance', 'Action', 'Komedi']
    p.love = Math.min(100, p.love + 12)
    addExp(p, 18)
    user.cooldown['nonton'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 🎬 NONTON 」──╮\n\nNonton ${film[Math.floor(Math.random()*5)]} bareng ${p.name}\n💌 +12 | 📈 +18 EXP\n━━━━━━━━━━━`)
  }
  
    // === SWIM LV60 ===
  if (action === 'swim') {
    let err = cekLevel(p, 60, 'Swim')
    if(err) return m.reply(err)
    if(cekCD('swim'+no, 14400000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 4 jam\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 20)
    addExp(p, 50)
    user.cooldown['swim'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 🏊 SWIM 」──╮\n\nRenang bareng ${p.name} di pantai\n💌 +20 | 📈 +50 EXP\n━━━━━━━━━━━`)
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
    if (!p.menikah) return m.reply(`╭──「 ❌ NIKAH 」──╮\n\nHarus nikah dulu\n━━━━━━━━━━━`)
    if(cekCD('wohoo'+no, 21600000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 6 jam\n━━━━━━━━━━━`)
    p.love = Math.min(100, p.love + 25)
    addExp(p, 60)
    user.dateStats.wohoo++
    user.cooldown['wohoo'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 🔥 WOHOO 」──╮\n\nMalam romantis bersama ${p.name} 💞\n💌 +25 | 📈 +60 EXP\n━━━━━━━━━━━`)
  }

  // === ANAK LV40 ===
  if (action === 'anak') {
    let err = cekLevel(p, 40, 'Anak')
    if(err) return m.reply(err)
    if (!p.menikah) return m.reply(`╭──「 ❌ NIKAH 」──╮\n\nHarus nikah dulu\n━━━━━━━━━━━`)
    if (p.love < 80) return m.reply(`╭──「 ❌ LOVE 」──╮\n\nLove minimal 80%\n━━━━━━━━━━━`)
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
    let err = cekLevel(p, 80, 'Duel')
    if(err) return m.reply(err)
    if (!p.menikah) return m.reply(`╭──「 ❌ NIKAH 」──╮\n\nHarus nikah\n━━━━━━━━━━━`)
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
    let err = cekLevel(p, 100, 'Kill')
    if(err) return m.reply(err)
    if(cekCD('kill'+no, 604800000) > 0) return m.reply(`╭──「 ⏰ COOLDOWN 」──╮\n\nTunggu 7 hari\n━━━━━━━━━━━`)
    let nama = p.name
    user.ex.push(p)
    user.harem.splice(no, 1)
    user.dateStats.kill++
    user.cooldown['kill'+no] = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 🔪 KILL 」──╮\n\nKamu membunuh ${nama}...\nHubungan berakhir tragis\n━━━━━━━━━━━`)
  }

  // === PUTUS ===
  if (action === 'putus') {
    let nama = p.name
    user.ex.push(p)
    user.harem.splice(no, 1)
    saveDB(wdb)
    return m.reply(`╭──「 💔 PUTUS 」──╮\n\nPutus dengan ${nama}\n━━━━━━━━━━━`)
  }

  return m.reply(`╭──「 ❌ SALAH 」──╮\n\nCommand tidak ada\nKetik.rship buat lihat menu\n━━━━━━━━━━━`)
} 

handler.help = ['rship']
handler.tags = ['rpg']
handler.command = ['rship']
handler.group = true
export default handler