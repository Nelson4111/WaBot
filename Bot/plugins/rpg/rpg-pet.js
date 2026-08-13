import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik.adventure dulu buat daftar RPG.')
  if (!user.pets) user.pets = []

  if (user.pet && user.pet.tipe && user.pet.tipe!== 'none') {
    let oldPet = user.pet
    if (!user.pets.find(p => p.tipe === oldPet.tipe)) {
      user.pets.push({ tipe: oldPet.tipe, level: oldPet.level || 1, exp: oldPet.exp || 0, energy: 100, happy: 50, lastFeed: oldPet.lastFeed || 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    }
    delete user.pet
    saveDB(wdb)
  }

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()

  let now = new Date()
  let jam = now.getHours()
  let menit = now.getMinutes().toString().padStart(2, '0')
  let isMalam = jam >= 18 || jam < 6
  let waktu = isMalam? ' Malam' : ' Siang'

  const pets = {
    'lalat': { emoji: '', harga: 30000 }, 'nyamuk': { emoji: '', harga: 35000 },
    'semut': { emoji: '', harga: 40000 }, 'tikus got': { emoji: '', harga: 40000 },
    'tikus rumah': { emoji: '', harga: 45000 }, 'cacing': { emoji: '', harga: 50000 },
    'kecoa': { emoji: '', harga: 50000 }, 'tikus': { emoji: '', harga: 50000 },
    'ulat': { emoji: '', harga: 60000 }, 'siput': { emoji: '', harga: 70000 },
    'hamster': { emoji: '', harga: 80000 }, 'belalang': { emoji: '', harga: 80000 },
    'anak ayam': { emoji: '', harga: 90000 }, 'kumbang': { emoji: '', harga: 90000 },
    'ayam': { emoji: '', harga: 100000 }, 'burung': { emoji: '', harga: 100000 },
    'kumbang tanduk': { emoji: '', harga: 120000 }, 'katak': { emoji: '', harga: 120000 },
    'ayam jago': { emoji: '', harga: 120000 }, 'merpati': { emoji: '', harga: 150000 },
    'lebah': { emoji: '', harga: 150000 }, 'kelinci': { emoji: '', harga: 150000 },
    'bebek': { emoji: '', harga: 180000 }, 'kupu': { emoji: '', harga: 200000 },
    'kelinci liar': { emoji: '', harga: 200000 }, 'tupai': { emoji: '', harga: 200000 },
    'burung hitam': { emoji: '', harga: 200000 }, 'angsa': { emoji: '', harga: 250000 },
    'monyet': { emoji: '', harga: 250000 }, 'ikan': { emoji: '', harga: 250000 },
    'laba': { emoji: '', harga: 250000 }, 'kalkun': { emoji: '', harga: 300000 },
    'kelelawar': { emoji: '', harga: 300000 }, 'udang': { emoji: '', harga: 300000 },
    'kucing': { emoji: '', harga: 300000 }, 'anjing': { emoji: '', harga: 400000 },
    'kucing hitam': { emoji: '', harga: 400000 }, 'kepiting': { emoji: '', harga: 400000 },
    'babi hutan': { emoji: '', harga: 400000 }, 'babi': { emoji: '', harga: 450000 },
    'penguin': { emoji: '', harga: 450000 }, 'kura': { emoji: '', harga: 450000 },
    'rakun': { emoji: '', harga: 500000 }, 'sigung': { emoji: '', harga: 450000 },
    'sapi': { emoji: '', harga: 500000 }, 'domba': { emoji: '', harga: 500000 },
    'ular': { emoji: '', harga: 500000 }, 'kadal': { emoji: '', harga: 550000 },
    'domba jantan': { emoji: '', harga: 550000 }, 'buntal': { emoji: '', harga: 600000 },
    'rubah': { emoji: '', harga: 600000 }, 'angsa putih': { emoji: '', harga: 600000 },
    'luwak': { emoji: '', harga: 600000 }, 'kalajengking': { emoji: '', harga: 600000 },
    'burung hantu': { emoji: '', harga: 650000, skill: 'hemat energy saat malam' },
    'kambing': { emoji: '', harga: 650000 }, 'keledai': { emoji: '', harga: 600000 },
    'koala': { emoji: '', harga: 700000 }, 'berang': { emoji: '', harga: 700000 },
    'anjing ras': { emoji: '', harga: 700000 }, 'poodle': { emoji: '', harga: 750000 },
    'beruang': { emoji: '', harga: 750000 }, 'sapi perah': { emoji: '', harga: 750000 },
    'kerbau': { emoji: '', harga: 850000 }, 'lembu': { emoji: '', harga: 800000 },
    'panda': { emoji: '', harga: 850000 }, 'lobster': { emoji: '', harga: 800000 },
    'kuda': { emoji: '', harga: 800000 }, 'berang air': { emoji: '', harga: 900000 },
    'serigala': { emoji: '', harga: 950000, skill: '+10 exp saat malam' },
    'beruang kutub': { emoji: '', harga: 950000 }, 'unta': { emoji: '', harga: 900000 },
    'unta 2 punuk': { emoji: '', harga: 950000 }, 'lama': { emoji: '', harga: 1000000 },
    'elang': { emoji: '', harga: 1100000 }, 'sloth': { emoji: '', harga: 1100000 },
    'rusa': { emoji: '', harga: 1100000 }, 'zebra': { emoji: '', harga: 1100000 },
    'anjing laut': { emoji: '', harga: 1200000 }, 'kuda pacu': { emoji: '', harga: 1200000 },
    'harimau': { emoji: '', harga: 1300000 }, 'macan': { emoji: '', harga: 1300000 },
    'nuri': { emoji: '', harga: 1300000 }, 'buaya': { emoji: '', harga: 1400000 },
    'singa': { emoji: '', harga: 1500000 }, 'ubur': { emoji: '', harga: 1500000 },
    'macan tutul': { emoji: '', harga: 1600000 }, 'kanguru': { emoji: '', harga: 1600000 },
    'lumba': { emoji: '', harga: 1700000 }, 'flamingo': { emoji: '', harga: 1700000 },
    'bison': { emoji: '', harga: 1700000 }, 'cumi': { emoji: '', harga: 1800000 },
    'jerapah': { emoji: '', harga: 1800000 }, 'orangutan': { emoji: '', harga: 1900000 },
    'gorila': { emoji: '', harga: 2000000 }, 'merak': { emoji: '', harga: 2000000 },
    'gurita': { emoji: '', harga: 2000000 }, 'rusa kutub': { emoji: '', harga: 2200000 },
    'hiu': { emoji: '', harga: 2500000 }, 'kuda nil': { emoji: '', harga: 2800000 },
    'paus': { emoji: '', harga: 3000000 }, 'paus biru': { emoji: '', harga: 3000000 },
    'gajah': { emoji: '', harga: 3500000 }, 'badak': { emoji: '', harga: 3200000 },
    'batu': { emoji: '', harga: 4000000, skill: 'energy tak terbatas' },
    'robot': { emoji: '', harga: 5000000, skill: 'tidak makan' }, 'unicorn': { emoji: '', harga: 5000000 },
    'snowman': { emoji: '', harga: 6000000, skill: 'lemah saat siang' },
    'jack o lantern': { emoji: '', harga: 6500000, skill: 'cooldown -10 detik' },
    'ghost': { emoji: '', harga: 6500000, skill: 'happy x2' },
    'orc': { emoji: '', harga: 7000000, skill: 'exp +5 pas walk' },
    'zombie': { emoji: '', harga: 7200000, skill: 'energy gak turun 50%' },
    'skeleton': { emoji: '', harga: 7500000, skill: 'exp x1.5' },
    'fairy': { emoji: '', harga: 7800000, skill: 'happy +5 pas rest' },
    'phoenix': { emoji: '', harga: 8000000, skill: 'revive 1x/hari' },
    'mermaid': { emoji: '', harga: 8500000, skill: 'energy +10 pas feed' },
    'alien': { emoji: '', harga: 9000000, skill: 'hasilkan uang' },
    'dino': { emoji: '', harga: 9000000 }, 'vampir': { emoji: '', harga: 9500000, skill: 'kuat di malam hari' },
    'dino rex': { emoji: '', harga: 10000000 }, 'naga': { emoji: '', harga: 10000000 },
    'mamut': { emoji: '', harga: 8000000 }, 'poop': { emoji: '', harga: 1000000, skill: 'hasilkan uang pas feed' },
    'jin': { emoji: '', harga: 12000000, skill: 'cooldown x0.5' }
  }

  const bar = (val, len = 10) => '`' + ''.repeat(Math.floor(val / (100/len))) + ''.repeat(len - Math.floor(val / (100/len))) + '`'
  const getPet = (name) => user.pets.find(p => p.tipe === name)

  const progressAllPets = () => {
    if(user.pets.length === 0) return ''
    let list = user.pets.map(p => {
      let kurang = 100 - p.exp
      let skill = pets[p.tipe].skill? `  ${pets[p.tipe].skill}` : ''
      return ` ${pets[p.tipe].emoji} *${p.tipe}* Lv.${p.level}${skill}\n  ${bar(p.exp)} ${p.exp}% | Sisa ${kurang} exp`
    }).join('\n')
    return `\n PROGRESS SEMUA PET \n${list}\n`
  }

  // MENU UTAMA
  if (!action) {
    let cap = `  ZETA PET CENTER \n\n`
    cap += ` ${waktu} | ${jam}:${menit} WIB\n`
    cap += ` Saldo : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += ` Total Pet : ${user.pets.length}\n\n`

    if (user.pets.length > 0) {
      cap += ` SEMUA PELIHARAAN KAMU \n`
      user.pets.forEach(p => {
        let skill = pets[p.tipe].skill? `  ${pets[p.tipe].skill}` : ''
        let debuff = ''
        if(p.tipe === 'vampir' &&!isMalam) debuff = '  Lemah'
        if(p.tipe === 'snowman' &&!isMalam) debuff = '  Kepanasan'

        cap += `${pets[p.tipe].emoji} *${p.tipe.toUpperCase()}*${skill}${debuff}\n`
        cap += `  Level : ${p.level} | Exp : ${p.exp}/100\n`
        cap += `  Energy : ${bar(p.energy || 100)} ${(p.energy || 100)}%\n`
        cap += `  Happy : ${bar(p.happy || 50)} ${(p.happy || 50)}%\n\n`
      })
    } else cap += `_ Kamu belum punya pet. Ketik ${usedPrefix}pet shop buat beli_\n\n`

    cap += `\n`
    cap += `.pet shop | adopt | feed | walk | play | train | rest | release`
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/54b79a9952b0.jpeg')
  }

  // SHOP
  if (action === 'shop') {
    let sortedPets = Object.entries(pets).sort((a,b) => a[1].harga - b[1].harga)
    let cap = `  ZETA PET SHOP \n\n`
    cap += ` Saldo : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n`

    cap += ` MURAH < 500RB \n`
    sortedPets.filter(([k,v]) => v.harga < 500000).forEach(([k, v]) => cap += ` ${v.emoji} ${k.padEnd(15)} Rp ${v.harga.toLocaleString()}\n`)

    cap += `\n STANDAR 500RB-2JT \n`
    sortedPets.filter(([k,v]) => v.harga >= 500000 && v.harga < 2000000).forEach(([k, v]) => cap += ` ${v.emoji} ${k.padEnd(15)} Rp ${v.harga.toLocaleString()}\n`)

    cap += `\n RARE 2JT-10JT \n`
    sortedPets.filter(([k,v]) => v.harga >= 2000000 && v.harga < 10000000).forEach(([k, v]) => cap += ` ${v.emoji} ${k.padEnd(15)} Rp ${v.harga.toLocaleString()}\n`)

    cap += `\n LEGEND > 10JT \n`
    sortedPets.filter(([k,v]) => v.harga >= 10000000).forEach(([k, v]) => cap += ` ${v.emoji} ${k.padEnd(15)} Rp ${v.harga.toLocaleString()}\n`)

    cap += `\n\n Cara beli:.pet adopt [nama]`
    return m.reply(cap)
  }

  if(['walk','play','feed','rest','train'].includes(action)){
    if (user.pets.some(p => p.tipe === 'vampir') &&!isMalam) {
      return m.reply(`  ZETA PET CENTER \n\n *VAMPIR TIDUR*\nVampir kamu bersembunyi di peti mati karena matahari!\nAktif lagi jam 18:00 - 05:59 WIB\n`)
    }
  }

  // ADOPT
  if (action === 'adopt') {
    let petName = args.slice(1).join(' ').toLowerCase()
    if (!petName ||!pets[petName]) return m.reply(` Pilih pet yang benar. Ketik ${usedPrefix}pet shop buat liat list.`)
    if (getPet(petName)) return m.reply(` Kamu sudah punya pet ${petName}!`)
    let harga = pets[petName].harga
    if ((wdb.money[m.sender] || 0) < harga) return m.reply(` Uangmu tidak cukup! Butuh Rp ${harga.toLocaleString()}.`)
    wdb.money[m.sender] -= harga
    user.pets.push({ tipe: petName, level: 1, exp: 0, energy: 100, happy: 50, lastFeed: 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    saveDB(wdb)
    let msg = `  ZETA PET CENTER \n\n ADOPSI BERHASIL\n PET BARU \n ${pets[petName].emoji} ${petName.toUpperCase()}\n Skill : ${pets[petName].skill || 'Tidak ada'}\n Harga : -Rp ${harga.toLocaleString()}\n\n`
    return m.reply(msg)
  }

  // FEED
  if (action === 'feed') {
    if (user.pets.length === 0) return m.reply(' Kamu tidak punya pet.')
    let cd = 120000
    if (user.pets.some(p => Date.now() - (p.lastFeed || 0) < cd)) return m.reply(` Tunggu 2 menit dulu sebelum memberi makan lagi.`)
    let biayaMakan = 5000 * user.pets.filter(p => p.tipe!== 'robot').length
    if ((wdb.money[m.sender] || 0) < biayaMakan) return m.reply(` Uang tidak cukup! Butuh Rp ${biayaMakan.toLocaleString()}.`)
    wdb.money[m.sender] -= biayaMakan
    let naikLevel = []
    let bonusUang = 0

    user.pets.forEach(p => {
      let energyGain = 20 + (p.tipe === 'mermaid'? 10 : 0)
      let uangGain = (p.tipe === 'poop'? 2000 : 0)
      if(p.tipe!== 'robot'){ p.exp += 25; p.energy = Math.min(100, (p.energy || 100) + energyGain); p.happy = Math.min(100, (p.happy || 50) + 5) }
      if(p.tipe === 'alien') bonusUang += 1000 * p.level
      bonusUang += uangGain
      p.lastFeed = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naikLevel.push(p.tipe) }
    })

    wdb.money[m.sender] += bonusUang
    saveDB(wdb)
    let teks = `  ZETA PET CENTER \n\n WAKTU MAKAN TIBA\n MEMBERI MAKAN \n Waktu : ${waktu}\n Biaya : -Rp ${biayaMakan.toLocaleString()}\n`
    if(biayaMakan === 0) teks += ` Catatan : Robot tidak perlu makan\n`
    if(bonusUang > 0) teks += ` Bonus : +Rp ${bonusUang.toLocaleString()}\n`
    teks += ` Status : +25 Exp | +20 Energy | +5 Happy\n`
    if (naikLevel.length > 0) teks += `\n LEVEL UP!\n${naikLevel.map(n => `${pets[n].emoji} ${n}`).join('\n')}`
    teks += progressAllPets() + `\n`
    return m.reply(teks)
  }

  // TRAIN
  if (action === 'train') {
    if (user.pets.length === 0) return m.reply(' Kamu tidak punya pet.')
    let cd = 300000 / (user.pets.some(p => p.tipe === 'jin')? 2 : 1)
    if (user.pets.some(p => Date.now() - (p.lastTrain || 0) < cd)) {
      let sisa = Math.ceil((cd - (Date.now() - user.pets[0].lastTrain)) / 1000)
      return m.reply(` Pet masih lelah latihan. Tunggu ${sisa} detik lagi.`)
    }
    if (user.pets.some(p => (p.energy || 100) < 30 &&!['batu','zombie'].includes(p.tipe))) return m.reply(` Ada pet yang terlalu capek! Energy minimal 30%.`)

    let naikLevel = []
    let bonusTeks = ''
    user.pets.forEach(p => {
      let expGain = 60 * (p.tipe === 'skeleton'? 1.5 : 1) + (p.tipe === 'orc'? 10 : 0)
      if(p.tipe === 'vampir' && isMalam) { expGain += 20; bonusTeks += `\n Vampir latihan malam! +20 Exp` }
      if(p.tipe === 'serigala' && isMalam) { expGain += 15; bonusTeks += `\n Serigala latihan bawah bulan! +15 Exp` }

      let energyLoss = 30 * (p.tipe === 'zombie'? 0.5 : 1)
      if(p.tipe === 'burung hantu' && isMalam) energyLoss = 15
      if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss

      p.exp += expGain; p.happy -= 5; p.lastTrain = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naikLevel.push(p.tipe) }
    })

    saveDB(wdb)
    let teks = `  ZETA PET CENTER \n\n SESI LATIHAN\n MELATIH PET \n Waktu : ${waktu}\n`
    if(user.pets.some(p => p.tipe === 'jin')) teks += ` Bonus : Jin mempercepat latihan!\n`
    teks += bonusTeks
    teks += `\n Status : +60 Exp | -30 Energy | -5 Happy\n`
    if(naikLevel.length > 0) teks += `\n LEVEL UP!\n${naikLevel.map(n => `${pets[n].emoji} ${n}`).join('\n')}`
    teks += progressAllPets() + `\n`
    return m.reply(teks)
  }

  // WALK
  if (action === 'walk') {
    if (user.pets.length === 0) return m.reply(' Kamu tidak punya pet.')
    let cd = 60000 / (user.pets.some(p => p.tipe === 'jin')? 2 : 1)
    cd = Math.max(10, cd - (user.pets.some(p => p.tipe === 'jack o lantern')? 10000 : 0))
    if (user.pets.some(p => (p.energy || 100) < 20 &&!['batu','zombie'].includes(p.tipe))) return m.reply(` Ada pet yang terlalu capek!`)
    if (Date.now() - (user.pets[0].lastActivity || 0) < cd) return m.reply(` Tunggu ${cd/1000} detik dulu sebelum jalan lagi.`)

    let naikLevel = []
    let bonusTeks = ''
    user.pets.forEach(p => {
      let expGain = 30 * (p.tipe === 'skeleton'? 1.5 : 1) + (p.tipe === 'orc'? 5 : 0)
      if(p.tipe === 'vampir' && isMalam) { expGain += 15; bonusTeks += `\n Vampir kuat di malam hari! +15 Exp` }
      if(p.tipe === 'serigala' && isMalam) { expGain += 10; bonusTeks += `\n Serigala meraung di bawah bulan! +10 Exp` }

      let energyLoss = 20 * (p.tipe === 'zombie'? 0.5 : 1)
      if(p.tipe === 'burung hantu' && isMalam) energyLoss = 10
      if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss

      p.exp += expGain; p.happy = Math.min(100, (p.happy || 50) + 5); p.lastActivity = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naikLevel.push(p.tipe) }
    })

    saveDB(wdb)
    let teks = `  ZETA PET CENTER \n\n JALAN-JALAN BERSAMA\n WALKING \n Waktu : ${waktu}\n`
    if(user.pets.some(p => p.tipe === 'jin')) teks += ` Bonus : Jin membawamu terbang!\n`
    if(user.pets.some(p => p.tipe === 'jack o lantern')) teks += ` Bonus : Jack o lantern menerangi jalan!\n`
    teks += bonusTeks
    teks += `\n Status : +30 Exp | -20 Energy | +5 Happy\n`
    if(naikLevel.length > 0) teks += `\n LEVEL UP!\n${naikLevel.map(n => `${pets[n].emoji} ${n}`).join('\n')}`
    teks += progressAllPets() + `\n`
    return m.reply(teks)
  }

  // PLAY
  if (action === 'play') {
    if (user.pets.length === 0) return m.reply(' Kamu tidak punya pet.')
    let cd = 60000 / (user.pets.some(p => p.tipe === 'jin')? 2 : 1)
    cd = Math.max(10, cd - (user.pets.some(p => p.tipe === 'jack o lantern')? 10000 : 0))
    if (user.pets.some(p => (p.energy || 100) < 20 &&!['batu','zombie'].includes(p.tipe))) return m.reply(` Ada pet yang terlalu capek!`)
    if (Date.now() - (user.pets[0].lastActivity || 0) < cd) return m.reply(` Tunggu ${cd/1000} detik dulu sebelum bermain lagi.`)

    let naikLevel = []
    let bonusTeks = ''
    user.pets.forEach(p => {
      let expGain = 30 * (p.tipe === 'skeleton'? 1.5 : 1)
      if(p.tipe === 'vampir' && isMalam) expGain += 15

      let happyGain = 10 * (p.tipe === 'ghost'? 2 : 1)
      let energyLoss = 20 * (p.tipe === 'zombie'? 0.5 : 1)
      if(p.tipe === 'burung hantu' && isMalam) energyLoss = 10
      if(p.tipe === 'snowman' &&!isMalam) energyLoss = 30

      if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
      p.exp += expGain; p.happy = Math.min(100, (p.happy || 50) + happyGain); p.lastActivity = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naikLevel.push(p.tipe) }
    })

    saveDB(wdb)
    let teks = `  ZETA PET CENTER \n\n WAKTU BERMAIN\n PLAYING \n Waktu : ${waktu}\n`
    if(user.pets.some(p => p.tipe === 'ghost')) teks += ` Bonus : Ghost membuat suasana lebih seru!\n`
    if(!isMalam && user.pets.some(p => p.tipe === 'snowman')) teks += ` Debuff : Snowman kepanasan! Energy -30\n`
    teks += bonusTeks
    teks += `\n Status : +30 Exp | -20 Energy | +10 Happy\n`
    if(naikLevel.length > 0) teks += `\n LEVEL UP!\n${naikLevel.map(n => `${pets[n].emoji} ${n}`).join('\n')}`
    teks += progressAllPets() + `\n`
    return m.reply(teks)
  }

  // REST
  if (action === 'rest') {
    if (user.pets.length === 0) return m.reply(' Kamu tidak punya pet.')
    if (user.pets.every(p => p.tipe === 'vampir')) return m.reply(`  ZETA PET CENTER \n\n Vampir tidak perlu istirahat. Mereka begadang selamanya\n`)
    let cd = 600000 / (user.pets.some(p => p.tipe === 'jin')? 2 : 1)
    cd = Math.max(30000, cd - (user.pets.some(p => p.tipe === 'jack o lantern')? 10000 : 0))
    if (Date.now() - (user.pets[0].lastRest || 0) < cd) return m.reply(` Baru istirahat. Tunggu ${Math.floor(cd/60000)} menit lagi`)

    user.pets.forEach(p => {
      if(p.energy <= 0 && p.tipe === 'phoenix' && p.revive){
        p.energy = 100; p.revive = false
        return m.reply(`  ZETA PET CENTER \n\n PHOENIX REVIVE!\n${pets['phoenix'].emoji} Phoenix bangkit dari abu!\n`)
      }
      let happyGain = 0 + (p.tipe === 'fairy'? 5 : 0)
      p.energy = Math.min(100, (p.energy || 100) + 30)
      p.happy = Math.min(100, (p.happy || 50) + happyGain)
      p.lastRest = Date.now()
    })

    saveDB(wdb)
    let teks = `  ZETA PET CENTER \n\n WAKTU ISTIRAHAT\n RESTING \n Waktu : ${waktu}\n Status : +30 Energy untuk semua pet\n`
    return m.reply(teks)
  }

  // RELEASE
  if (action === 'release') {
    let petName = args.slice(1).join(' ').toLowerCase()
    if (!petName) return m.reply(` Contoh: ${usedPrefix}${command} release kucing`)
    let index = user.pets.findIndex(p => p.tipe === petName)
    if (index === -1) return m.reply(` Kamu tidak memiliki pet ${petName}.`)
    user.pets.splice(index, 1)
    saveDB(wdb)
    let msg = `  ZETA PET CENTER \n\n PERPISAHAN\n RELEASE PET \n ${pets[petName].emoji} ${petName.toUpperCase()}\n Status : Telah dilepaskan\n\n`
    return m.reply(msg)
  }
}

handler.help = ['pet', 'pet shop', 'pet adopt']
handler.tags = ['rpg']
handler.command = ['pet']
export default handler