import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik.adventure dulu buat daftar RPG.')
  if (!user.pets) user.pets = []
  if (!user.cooldown) user.cooldown = {}

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()
  let jam = new Date().getHours()
  let isMalam = jam >= 18 || jam < 6

  const pets = {
    'lalat': { emoji: '🪰' }, 'nyamuk': { emoji: '🦟' }, 'semut': { emoji: '🐜' }, 'tikus_got': { emoji: '🐀' },
    'tikus_rumah': { emoji: '🐁' }, 'cacing': { emoji: '🪱' }, 'kecoa': { emoji: '🪳' }, 'tikus': { emoji: '🐭' },
    'ulat': { emoji: '🐛' }, 'siput': { emoji: '🐌' }, 'hamster': { emoji: '🐹' }, 'belalang': { emoji: '🦗' },
    'anak_ayam': { emoji: '🐥' }, 'kumbang': { emoji: '🪲' }, 'ayam': { emoji: '🐔' }, 'burung': { emoji: '🐦' },
    'kumbang_tanduk': { emoji: '🪲' }, 'katak': { emoji: '🐸' }, 'ayam_jago': { emoji: '🐓' }, 'merpati': { emoji: '🕊️' },
    'lebah': { emoji: '🐝' }, 'kelinci': { emoji: '🐰' }, 'bebek': { emoji: '🦆' }, 'kupu': { emoji: '🦋' },
    'kelinci_liar': { emoji: '🐰' }, 'tupai': { emoji: '🐿️' }, 'burung_hitam': { emoji: '🐦‍⬛' }, 'angsa': { emoji: '🦢' },
    'monyet': { emoji: '🐒' }, 'ikan': { emoji: '🐟' }, 'laba': { emoji: '🕷️' }, 'kalkun': { emoji: '🦃' },
    'kelelawar': { emoji: '🦇' }, 'udang': { emoji: '🦐' }, 'kucing': { emoji: '🐱' }, 'anjing': { emoji: '🐶' },
    'kucing_hitam': { emoji: '🐈‍⬛' }, 'kepiting': { emoji: '🦀' }, 'babi_hutan': { emoji: '🐗' }, 'babi': { emoji: '🐷' },
    'penguin': { emoji: '🐧' }, 'kura': { emoji: '🐢' }, 'rakun': { emoji: '🦝' }, 'sigung': { emoji: '🦨' },
    'sapi': { emoji: '🐄' }, 'domba': { emoji: '🐑' }, 'ular': { emoji: '🐍' }, 'kadal': { emoji: '🦎' },
    'domba_jantan': { emoji: '🐏' }, 'buntal': { emoji: '🐡' }, 'rubah': { emoji: '🦊' }, 'angsa_putih': { emoji: '🦢' },
    'luwak': { emoji: '🦦' }, 'kalajengking': { emoji: '🦂' }, 'burung_hantu': { emoji: '🦉', skill: 'hemat energy saat malam' },
    'kambing': { emoji: '🐐' }, 'keledai': { emoji: '🫏' }, 'koala': { emoji: '🐨' }, 'berang': { emoji: '🦫' },
    'anjing_ras': { emoji: '🐕' }, 'poodle': { emoji: '🐩' }, 'beruang': { emoji: '🐻' }, 'sapi_perah': { emoji: '🐄' },
    'kerbau': { emoji: '🐃' }, 'lembu': { emoji: '🐂' }, 'panda': { emoji: '🐼' }, 'lobster': { emoji: '🦞' },
    'kuda': { emoji: '🐴' }, 'berang_air': { emoji: '🦦' }, 'serigala': { emoji: '🐺', skill: '+10 exp saat malam' },
    'beruang_kutub': { emoji: '🐻‍❄️' }, 'unta': { emoji: '🐪' }, 'unta_2_punuk': { emoji: '🐫' }, 'lama': { emoji: '🦙' },
    'elang': { emoji: '🦅' }, 'sloth': { emoji: '🦥' }, 'rusa': { emoji: '🦌' }, 'zebra': { emoji: '🦓' },
    'anjing_laut': { emoji: '🦭' }, 'kuda_pacu': { emoji: '🏇' }, 'harimau': { emoji: '🐅' }, 'macan': { emoji: '🐆' },
    'nuri': { emoji: '🦜' }, 'buaya': { emoji: '🐊' }, 'singa': { emoji: '🦁' }, 'ubur': { emoji: '🪼' },
    'macan_tutul': { emoji: '🐆' }, 'kanguru': { emoji: '🦘' }, 'lumba': { emoji: '🐬' }, 'flamingo': { emoji: '🦩' },
    'bison': { emoji: '🦬' }, 'cumi': { emoji: '🦑' }, 'jerapah': { emoji: '🦒' }, 'orangutan': { emoji: '🦧' },
    'gorila': { emoji: '🦍' }, 'merak': { emoji: '🦚' }, 'gurita': { emoji: '🐙' }, 'rusa_kutub': { emoji: '🦌' },
    'hiu': { emoji: '🦈' }, 'kuda_nil': { emoji: '🦛' }, 'paus': { emoji: '🐋' }, 'paus_biru': { emoji: '🐳' },
    'gajah': { emoji: '🐘' }, 'badak': { emoji: '🦏' }, 'batu': { emoji: '🪨', skill: 'energy tak terbatas' },
    'robot': { emoji: '🤖', skill: 'tidak makan' }, 'unicorn': { emoji: '🦄' }, 'snowman': { emoji: '⛄', skill: 'lemah saat siang' },
    'jack_o_lantern': { emoji: '🎃', skill: 'cooldown -10 detik' }, 'ghost': { emoji: '👻', skill: 'happy x2' },
    'orc': { emoji: '👹', skill: 'exp +5 pas walk' }, 'zombie': { emoji: '🧟', skill: 'energy gak turun 50%' },
    'skeleton': { emoji: '💀', skill: 'exp x1.5' }, 'fairy': { emoji: '🧚', skill: 'happy +5 pas rest' },
    'phoenix': { emoji: '🔥', skill: 'revive 1x/hari' }, 'mermaid': { emoji: '🧜', skill: 'energy +10 pas feed' },
    'alien': { emoji: '👽', skill: 'hasilkan uang' }, 'dino': { emoji: '🦖' }, 'vampir': { emoji: '🧛', skill: 'kuat di malam hari' },
    'dino_rex': { emoji: '🦖' }, 'naga': { emoji: '🐉' }, 'mamut': { emoji: '🦣' }, 'poop': { emoji: '💩', skill: 'hasilkan uang pas feed' },
    'jin': { emoji: '🧞', skill: 'cooldown x0.5' }
  }

  const formatNama = (name) => name.replace(/_/g, ' ')
  const getDebuff = (p) => (p.dirty || 0) >= 80? 0.8 : (p.dirty || 0) >= 50? 0.9 : 1
  const cekCD = (key, durasi) => {
    let last = user.cooldown[key] || 0
    let sisa = durasi - (Date.now() - last)
    return sisa > 0? Math.ceil(sisa / 1000) : 0
  }

  if(!action) return m.reply(`📌 Interaksi Pet:\n.pet feed | walk | play | train | rest | clean | battle @tag [taruhan]`)

  if(['walk','play','feed','rest','train'].includes(action)){
    if (user.pets.some(p => p.tipe === 'vampir') &&!isMalam) {
      return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🧛 *VAMPIR TIDUR*\nVampir kamu bersembunyi di peti mati karena matahari!\nAktif lagi jam 18:00 - 05:59 WIB\n━━━━━━━━━━━━━━━━━━━`)
    }
  }

  // FEED
  if (action === 'feed') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let cd = 120000
    if (user.pets.some(p => Date.now() - (p.lastFeed || 0) < cd)) return m.reply(`⏰ Tunggu 2 menit dulu sebelum memberi makan lagi.`)
    let biayaMakan = 5000 * user.pets.filter(p => p.tipe!== 'robot').length
    if ((wdb.money[m.sender] || 0) < biayaMakan) return m.reply(`❌ Uang tidak cukup! Butuh Rp ${biayaMakan.toLocaleString()}.`)
    wdb.money[m.sender] -= biayaMakan
    let naik = []
    user.pets.forEach(p => {
      let energyGain = 20 + (p.tipe === 'mermaid'? 10 : 0)
      if(p.tipe!== 'robot'){ p.exp += 25; p.energy = Math.min(100, (p.energy || 100) + energyGain); p.happy = Math.min(100, (p.happy || 50) + 5) }
      if(p.tipe === 'alien') wdb.money[m.sender] += 1000 * p.level
      if(p.tipe === 'poop') wdb.money[m.sender] += 2000
      p.lastFeed = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naik.push(p.tipe) }
    })
    saveDB(wdb)
    let teks = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n🍖 WAKTU MAKAN TIBA\n🍽️ MEMBERI MAKAN 🍽️\n💰 Biaya : -Rp ${biayaMakan.toLocaleString()}\n📊 Status : +25 Exp | +20 Energy | +5 Happy`
    if(naik.length) teks += `\n\n🎉 LEVEL UP!\n${naik.map(n => `${pets[n].emoji} ${formatNama(n)}`).join('\n')}`
    teks += `\n━━━━━━━━━━━`
    return m.reply(teks)
  }

  // TRAIN
  if (action === 'train') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let cd = 300000 / (user.pets.some(p => p.tipe === 'jin')? 2 : 1)
    if (user.pets.some(p => Date.now() - (p.lastTrain || 0) < cd)) {
      let sisa = Math.ceil((cd - (Date.now() - user.pets[0].lastTrain)) / 1000)
      return m.reply(`⏰ Pet masih lelah latihan. Tunggu ${sisa} detik lagi.`)
    }
    if (user.pets.some(p => (p.energy || 100) < 30 &&!['batu','zombie'].includes(p.tipe))) return m.reply(`❌ Ada pet yang terlalu capek! Energy minimal 30%.`)
    let naik = []
    user.pets.forEach(p => {
      let expGain = 60 * getDebuff(p) * (p.tipe === 'skeleton'? 1.5 : 1) + (p.tipe === 'orc'? 10 : 0)
      if(p.tipe === 'vampir' && isMalam) expGain += 20
      if(p.tipe === 'serigala' && isMalam) expGain += 15
      let energyLoss = 30 * (p.tipe === 'zombie'? 0.5 : 1)
      if(p.tipe === 'burung_hantu' && isMalam) energyLoss = 15
      if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
      p.exp += expGain; p.happy -= 5; p.dirty = Math.min(100, (p.dirty || 0) + 20); p.lastTrain = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naik.push(p.tipe) }
    })
    saveDB(wdb)
    let teks = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n💪 SESI LATIHAN\n🏋️ MELATIH PET 🏋️`
    if(user.pets.some(p => p.tipe === 'jin')) teks += `\n🧞 Bonus : Jin mempercepat latihan!`
    if(getDebuff(user.pets[0]) < 1) teks += `\n💩 Debuff : Pet kotor! Exp -${(1-getDebuff(user.pets[0]))*100}%`
    teks += `\n📊 Status : +60 Exp | -30 Energy | -5 Happy | +20 Dirty`
    if(naik.length) teks += `\n\n🎉 LEVEL UP!\n${naik.map(n => `${pets[n].emoji} ${formatNama(n)}`).join('\n')}`
    teks += `\n━━━━━━━━━━━━━━━━━━━`
    return m.reply(teks)
  }

  // WALK
  if (action === 'walk') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let cd = 60000 / (user.pets.some(p => p.tipe === 'jin')? 2 : 1)
    cd = Math.max(10, cd - (user.pets.some(p => p.tipe === 'jack_o_lantern')? 10000 : 0))
    if (user.pets.some(p => (p.energy || 100) < 20 &&!['batu','zombie'].includes(p.tipe))) return m.reply(`❌ Ada pet yang terlalu capek!`)
    if (Date.now() - (user.pets[0].lastActivity || 0) < cd) return m.reply(`⏰ Tunggu ${cd/1000} detik dulu sebelum jalan lagi.`)
    let naik = []
    user.pets.forEach(p => {
      let expGain = 30 * getDebuff(p) * (p.tipe === 'skeleton'? 1.5 : 1) + (p.tipe === 'orc'? 5 : 0)
      if(p.tipe === 'vampir' && isMalam) expGain += 15
      if(p.tipe === 'serigala' && isMalam) expGain += 10
      let energyLoss = 20 * (p.tipe === 'zombie'? 0.5 : 1)
      if(p.tipe === 'burung_hantu' && isMalam) energyLoss = 10
      if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
      p.exp += expGain; p.happy = Math.min(100, (p.happy || 50) + 5); p.dirty = Math.min(100, (p.dirty || 0) + 15); p.lastActivity = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naik.push(p.tipe) }
    })
    saveDB(wdb)
    let teks = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n🚶 JALAN-JALAN BERSAMA\n🌳 WALKING 🌳`
    if(user.pets.some(p => p.tipe === 'jin')) teks += `\n🧞 Bonus : Jin membawamu terbang!`
    if(user.pets.some(p => p.tipe === 'jack_o_lantern')) teks += `\n🎃 Bonus : Jack o lantern menerangi jalan!`
    if(getDebuff(user.pets[0]) < 1) teks += `\n💩 Debuff : Pet kotor! Exp -${(1-getDebuff(user.pets[0]))*100}%`
    teks += `\n📊 Status : +30 Exp | -20 Energy | +5 Happy | +15 Dirty`
    if(naik.length) teks += `\n\n🎉 LEVEL UP!\n${naik.map(n => `${pets[n].emoji} ${formatNama(n)}`).join('\n')}`
    teks += `\n━━━━━━━━━━━━━━━━━━━`
    return m.reply(teks)
  }

  // PLAY
  if (action === 'play') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let cd = 60000 / (user.pets.some(p => p.tipe === 'jin')? 2 : 1)
    cd = Math.max(10, cd - (user.pets.some(p => p.tipe === 'jack_o_lantern')? 10000 : 0))
    if (user.pets.some(p => (p.energy || 100) < 20 &&!['batu','zombie'].includes(p.tipe))) return m.reply(`❌ Ada pet yang terlalu capek!`)
    if (Date.now() - (user.pets[0].lastActivity || 0) < cd) return m.reply(`⏰ Tunggu ${cd/1000} detik dulu sebelum bermain lagi.`)
    let naik = []
    user.pets.forEach(p => {
      let expGain = 30 * getDebuff(p) * (p.tipe === 'skeleton'? 1.5 : 1)
      if(p.tipe === 'vampir' && isMalam) expGain += 15
      let happyGain = 10 * (p.tipe === 'ghost'? 2 : 1)
      let energyLoss = 20 * (p.tipe === 'zombie'? 0.5 : 1)
      if(p.tipe === 'burung_hantu' && isMalam) energyLoss = 10
      if(p.tipe === 'snowman' &&!isMalam) energyLoss = 30
      if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
      p.exp += expGain; p.happy = Math.min(100, (p.happy || 50) + happyGain); p.dirty = Math.min(100, (p.dirty || 0) + 10); p.lastActivity = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naik.push(p.tipe) }
    })
    saveDB(wdb)
    let teks = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n🎮 WAKTU BERMAIN\n⚽ PLAYING ⚽`
    if(user.pets.some(p => p.tipe === 'ghost')) teks += `\n👻 Bonus : Ghost membuat suasana lebih seru!`
    if(!isMalam && user.pets.some(p => p.tipe === 'snowman')) teks += `\n⛄ Debuff : Snowman kepanasan! Energy -30`
    if(getDebuff(user.pets[0]) < 1) teks += `\n💩 Debuff : Pet kotor! Exp -${(1-getDebuff(user.pets[0]))*100}%`
    teks += `\n📊 Status : +30 Exp | -20 Energy | +10 Happy | +10 Dirty`
    if(naik.length) teks += `\n\n🎉 LEVEL UP!\n${naik.map(n => `${pets[n].emoji} ${formatNama(n)}`).join('\n')}`
    teks += `\n━━━━━━━━━━━━━━━━━━━`
    return m.reply(teks)
  }

  // REST
  if (action === 'rest') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    if (user.pets.every(p => p.tipe === 'vampir')) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🧛 Vampir tidak perlu istirahat. Mereka begadang selamanya\n━━━━━━━━━━━━━━━━━━━`)
    let cd = 600000 / (user.pets.some(p => p.tipe === 'jin')? 2 : 1)
    cd = Math.max(30000, cd - (user.pets.some(p => p.tipe === 'jack_o_lantern')? 10000 : 0))
    if (Date.now() - (user.pets[0].lastRest || 0) < cd) return m.reply(`⏰ Baru istirahat. Tunggu ${Math.floor(cd/60000)} menit lagi`)
    user.pets.forEach(p => {
      if(p.energy <= 0 && p.tipe === 'phoenix' && p.revive){ p.energy = 100; p.revive = false }
      let happyGain = 0 + (p.tipe === 'fairy'? 5 : 0)
      p.energy = Math.min(100, (p.energy || 100) + 30)
      p.happy = Math.min(100, (p.happy || 50) + happyGain)
      p.dirty = Math.min(100, (p.dirty || 0) + 5)
      p.lastRest = Date.now()
    })
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n😴 WAKTU ISTIRAHAT\n🛏️ RESTING 🛏️\n📊 Status : +30 Energy | +5 Dirty\n━━━━━━━━━━━`)
  }

  // CLEAN
  if (action === 'clean') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let biaya = 2000 * user.pets.length
    if ((wdb.money[m.sender] || 0) < biaya) return m.reply(`❌ Uang tidak cukup! Butuh Rp ${biaya.toLocaleString()} untuk sabun + sampo.`)
    if(user.pets.every(p => (p.dirty || 0) === 0)) return m.reply('✨ Semua pet kamu sudah bersih!')
    wdb.money[m.sender] -= biaya
    user.pets.forEach(p => { p.dirty = 0; p.happy = Math.min(100, (p.happy || 50) + 10) })
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🧼 WAKTU MANDI\n🛁 MEMBERSIHKAN PET 🛁\n💰 Biaya : -Rp ${biaya.toLocaleString()}\n📊 Status : Semua pet bersih! +10 Happy\n━━━━━━━━━━━━━━━━━━━`)
  }

  // BATTLE
  if (action === 'battle') {
    let cd = cekCD('petbattle', 300000)
    if(cd > 0) return m.reply(`⏰ Pet kamu masih capek battle!\nTunggu ${Math.floor(cd/60)} menit ${cd%60} detik lagi`)

    let target = m.mentionedJid[0] || m.quoted?.sender
    if(!target) return m.reply(`❌ Tag atau reply orang yang mau kamu ajak battle!\nContoh: *.pet battle @tag 50000*`)
    if(target === m.sender) return m.reply('❌ Ga bisa battle sama diri sendiri')

    let dataTarget = getUserRPG(wdb, target)
    let userTarget = dataTarget.rpg
    if(!userTarget.pets) userTarget.pets = []
    if(userTarget.pets.length === 0) return m.reply('❌ Target tidak punya pet.')
    if(user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')

    let myPet = [...user.pets].sort((a,b) => b.level - a.level || b.exp - a.exp)[0]
    let enemyPet = [...userTarget.pets].sort((a,b) => b.level - a.level || b.exp - a.exp)[0]
    let idxA = user.pets.findIndex(p => p.tipe === myPet.tipe)
    let idxB = userTarget.pets.findIndex(p => p.tipe === enemyPet.tipe)

    if((myPet.energy || 100) < 20) return m.reply(`❌ Pet ${formatNama(myPet.tipe)} kamu energy < 20%`)
    if((enemyPet.energy || 100) < 20) return m.reply(`❌ Pet ${formatNama(enemyPet.tipe)} target energy < 20%`)

    let taruhan = parseInt(args[1]) || 0
    let uangUser = wdb.money[m.sender] || 0
    let uangTarget = wdb.money[target] || 0
    if(taruhan > 0){
      if(taruhan < 1000) return m.reply('❌ Minimal taruhan Rp 1000')
      if(uangUser < taruhan) return m.reply(`❌ Uang kamu kurang!`)
      if(uangTarget < taruhan) return m.reply(`❌ Uang target kurang!`)
    }

    let powerA = myPet.level * 10 + myPet.exp + Math.floor(Math.random() * 50)
    let powerB = enemyPet.level * 10 + enemyPet.exp + Math.floor(Math.random() * 50)
    if(myPet.tipe === 'vampir' && isMalam) powerA += 30
    if(enemyPet.tipe === 'vampir' && isMalam) powerB += 30

    user.pets[idxA].energy = Math.max(0, (myPet.energy || 100) - 20)
    userTarget.pets[idxB].energy = Math.max(0, (enemyPet.energy || 100) - 20)

    let cap = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n┌───❏「 ⚔️ PET BATTLE 」❏\n│\n`
    cap += `│ @${m.sender.split('@')[0]}\n│ ${pets[myPet.tipe].emoji} ${formatNama(myPet.tipe)} Lv.${myPet.level}\n│ Power: ${powerA}\n`
    cap += `│\n│ VS\n│\n`
    cap += `│ @${target.split('@')[0]}\n│ ${pets[enemyPet.tipe].emoji} ${formatNama(enemyPet.tipe)} Lv.${enemyPet.level}\n│ Power: ${powerB}\n│\n`
    if(taruhan > 0) cap += `│ 💰 Taruhan: Rp ${taruhan.toLocaleString()}\n│\n`

    if(powerA > powerB){
      if(taruhan > 0){ wdb.money[m.sender] += taruhan; wdb.money[target] -= taruhan }
      user.pets[idxA].exp += 40; userTarget.pets[idxB].exp += 10
      if(user.pets[idxA].exp >= 100){ user.pets[idxA].level++; user.pets[idxA].exp = 0; cap += `│ 🎉 ${formatNama(myPet.tipe)} LEVEL UP!\n` }
      cap += `│ 🏆 *PEMENANG*\n│ @${m.sender.split('@')[0]}\n│ +40 Exp`
      if(taruhan > 0) cap += `\n│ +Rp ${taruhan.toLocaleString()}`
    } else if(powerB > powerA){
      if(taruhan > 0){ wdb.money[target] += taruhan; wdb.money[m.sender] -= taruhan }
      userTarget.pets[idxB].exp += 40; user.pets[idxA].exp += 10
      if(userTarget.pets[idxB].exp >= 100){ userTarget.pets[idxB].level++; userTarget.pets[idxB].exp = 0; cap += `│ 🎉 ${formatNama(enemyPet.tipe)} LEVEL UP!\n` }
      cap += `│ 🏆 *PEMENANG*\n│ @${target.split('@')[0]}\n│ +40 Exp`
      if(taruhan > 0) cap += `\n│ +Rp ${taruhan.toLocaleString()}`
    } else {
      user.pets[idxA].exp += 20; userTarget.pets[idxB].exp += 20
      cap += `│ 🤝 *HASIL: SERI*\n│ +20 Exp untuk keduanya`
    }
    cap += `\n└───────────────────\n━━━━━━━━━━━━━━━━━━━`

    user.cooldown.petbattle = Date.now()
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/54b79a9952b0.jpeg', [m.sender, target])
  }
}

handler.help = ['pet feed', 'pet walk', 'pet battle']
handler.tags = ['rpg']
handler.command = ['pet']
export default handler