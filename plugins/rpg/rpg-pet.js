import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik.adventure dulu buat daftar RPG.')
  if (!user.pets) user.pets = []

  // migrasi data lama
  if (user.pet && user.pet.tipe && user.pet.tipe!== 'none') {
    let oldPet = user.pet
    if (!user.pets.find(p => p.tipe === oldPet.tipe)) {
      user.pets.push({ tipe: oldPet.tipe, level: oldPet.level || 1, exp: oldPet.exp || 0, energy: 100, happy: 50, dirty: 0, lastFeed: oldPet.lastFeed || 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    }
    delete user.pet
    saveDB(wdb)
  }

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()
  let jam = new Date().getHours()
  let menit = new Date().getMinutes().toString().padStart(2, '0')
  let isMalam = jam >= 18 || jam < 6
  let waktu = isMalam? '🌙 Malam' : '☀️ Siang'

  const pets = {
    'lalat': { emoji: '🪰', harga: 30000 }, 'nyamuk': { emoji: '🦟', harga: 35000 },
    'semut': { emoji: '🐜', harga: 40000 }, 'tikus_got': { emoji: '🐀', harga: 40000 },
    'tikus_rumah': { emoji: '🐁', harga: 45000 }, 'cacing': { emoji: '🪱', harga: 50000 },
    'kecoa': { emoji: '🪳', harga: 50000 }, 'tikus': { emoji: '🐭', harga: 50000 },
    'ulat': { emoji: '🐛', harga: 60000 }, 'siput': { emoji: '🐌', harga: 70000 },
    'hamster': { emoji: '🐹', harga: 80000 }, 'belalang': { emoji: '🦗', harga: 80000 },
    'anak_ayam': { emoji: '🐥', harga: 90000 }, 'kumbang': { emoji: '🪲', harga: 90000 },
    'ayam': { emoji: '🐔', harga: 100000 }, 'burung': { emoji: '🐦', harga: 100000 },
    'kumbang_tanduk': { emoji: '🪲', harga: 120000 }, 'katak': { emoji: '🐸', harga: 120000 },
    'ayam_jago': { emoji: '🐓', harga: 120000 }, 'merpati': { emoji: '🕊️', harga: 150000 },
    'lebah': { emoji: '🐝', harga: 150000 }, 'kelinci': { emoji: '🐰', harga: 150000 },
    'bebek': { emoji: '🦆', harga: 180000 }, 'kupu': { emoji: '🦋', harga: 200000 },
    'kelinci_liar': { emoji: '🐰', harga: 200000 }, 'tupai': { emoji: '🐿️', harga: 200000 },
    'burung_hitam': { emoji: '🐦‍⬛', harga: 200000 }, 'angsa': { emoji: '🦢', harga: 250000 },
    'monyet': { emoji: '🐒', harga: 250000 }, 'ikan': { emoji: '🐟', harga: 250000 },
    'laba': { emoji: '🕷️', harga: 250000 }, 'kalkun': { emoji: '🦃', harga: 300000 },
    'kelelawar': { emoji: '🦇', harga: 300000 }, 'udang': { emoji: '🦐', harga: 300000 },
    'kucing': { emoji: '🐱', harga: 300000 }, 'anjing': { emoji: '🐶', harga: 400000 },
    'kucing_hitam': { emoji: '🐈‍⬛', harga: 400000 }, 'kepiting': { emoji: '🦀', harga: 400000 },
    'babi_hutan': { emoji: '🐗', harga: 400000 }, 'babi': { emoji: '🐷', harga: 450000 },
    'penguin': { emoji: '🐧', harga: 450000 }, 'kura': { emoji: '🐢', harga: 450000 },
    'rakun': { emoji: '🦝', harga: 500000 }, 'sigung': { emoji: '🦨', harga: 450000 },
    'sapi': { emoji: '🐄', harga: 500000 }, 'domba': { emoji: '🐑', harga: 500000 },
    'ular': { emoji: '🐍', harga: 500000 }, 'kadal': { emoji: '🦎', harga: 550000 },
    'domba_jantan': { emoji: '🐏', harga: 550000 }, 'buntal': { emoji: '🐡', harga: 600000 },
    'rubah': { emoji: '🦊', harga: 600000 }, 'angsa_putih': { emoji: '🦢', harga: 600000 },
    'luwak': { emoji: '🦦', harga: 600000 }, 'kalajengking': { emoji: '🦂', harga: 600000 },
    'burung_hantu': { emoji: '🦉', harga: 650000, skill: 'hemat energy saat malam' },
    'kambing': { emoji: '🐐', harga: 650000 }, 'keledai': { emoji: '🫏', harga: 600000 },
    'koala': { emoji: '🐨', harga: 700000 }, 'berang': { emoji: '🦫', harga: 700000 },
    'anjing_ras': { emoji: '🐕', harga: 700000 }, 'poodle': { emoji: '🐩', harga: 750000 },
    'beruang': { emoji: '🐻', harga: 750000 }, 'sapi_perah': { emoji: '🐄', harga: 750000 },
    'kerbau': { emoji: '🐃', harga: 850000 }, 'lembu': { emoji: '🐂', harga: 800000 },
    'panda': { emoji: '🐼', harga: 850000 }, 'lobster': { emoji: '🦞', harga: 800000 },
    'kuda': { emoji: '🐴', harga: 800000 }, 'berang_air': { emoji: '🦦', harga: 900000 },
    'serigala': { emoji: '🐺', harga: 950000, skill: '+10 exp saat malam' },
    'beruang_kutub': { emoji: '🐻‍❄️', harga: 950000 }, 'unta': { emoji: '🐪', harga: 900000 },
    'unta_2_punuk': { emoji: '🐫', harga: 950000 }, 'lama': { emoji: '🦙', harga: 1000000 },
    'elang': { emoji: '🦅', harga: 1100000 }, 'sloth': { emoji: '🦥', harga: 1100000 },
    'rusa': { emoji: '🦌', harga: 1100000 }, 'zebra': { emoji: '🦓', harga: 1100000 },
    'anjing_laut': { emoji: '🦭', harga: 1200000 }, 'kuda_pacu': { emoji: '🏇', harga: 1200000 },
    'harimau': { emoji: '🐅', harga: 1300000 }, 'macan': { emoji: '🐆', harga: 1300000 },
    'nuri': { emoji: '🦜', harga: 1300000 }, 'buaya': { emoji: '🐊', harga: 1400000 },
    'singa': { emoji: '🦁', harga: 1500000 }, 'ubur': { emoji: '🪼', harga: 1500000 },
    'macan_tutul': { emoji: '🐆', harga: 1600000 }, 'kanguru': { emoji: '🦘', harga: 1600000 },
    'lumba': { emoji: '🐬', harga: 1700000 }, 'flamingo': { emoji: '🦩', harga: 1700000 },
    'bison': { emoji: '🦬', harga: 1700000 }, 'cumi': { emoji: '🦑', harga: 1800000 },
    'jerapah': { emoji: '🦒', harga: 1800000 }, 'orangutan': { emoji: '🦧', harga: 1900000 },
    'gorila': { emoji: '🦍', harga: 2000000 }, 'merak': { emoji: '🦚', harga: 2000000 },
    'gurita': { emoji: '🐙', harga: 2000000 }, 'rusa_kutub': { emoji: '🦌', harga: 2200000 },
    'hiu': { emoji: '🦈', harga: 2500000 }, 'kuda_nil': { emoji: '🦛', harga: 2800000 },
    'paus': { emoji: '🐋', harga: 3000000 }, 'paus_biru': { emoji: '🐳', harga: 3000000 },
    'gajah': { emoji: '🐘', harga: 3500000 }, 'badak': { emoji: '🦏', harga: 3200000 },
    'batu': { emoji: '🪨', harga: 4000000, skill: 'energy tak terbatas' },
    'robot': { emoji: '🤖', harga: 5000000, skill: 'tidak makan' }, 'unicorn': { emoji: '🦄', harga: 5000000 },
    'snowman': { emoji: '⛄', harga: 6000000, skill: 'lemah saat siang' },
    'jack_o_lantern': { emoji: '🎃', harga: 6500000, skill: 'cooldown -10 detik' },
    'ghost': { emoji: '👻', harga: 6500000, skill: 'happy x2' },
    'orc': { emoji: '👹', harga: 7000000, skill: 'exp +5 pas walk' },
    'zombie': { emoji: '🧟', harga: 7200000, skill: 'energy gak turun 50%' },
    'skeleton': { emoji: '💀', harga: 7500000, skill: 'exp x1.5' },
    'fairy': { emoji: '🧚', harga: 7800000, skill: 'happy +5 pas rest' },
    'phoenix': { emoji: '🔥', harga: 8000000, skill: 'revive 1x/hari' },
    'mermaid': { emoji: '🧜', harga: 8500000, skill: 'energy +10 pas feed' },
    'alien': { emoji: '👽', harga: 9000000, skill: 'hasilkan uang' },
    'dino': { emoji: '🦖', harga: 9000000 }, 'vampir': { emoji: '🧛', harga: 9500000, skill: 'kuat di malam hari' },
    'dino_rex': { emoji: '🦖', harga: 10000000 }, 'naga': { emoji: '🐉', harga: 10000000 },
    'mamut': { emoji: '🦣', harga: 8000000 }, 'poop': { emoji: '💩', harga: 1000000, skill: 'hasilkan uang pas feed' },
    'jin': { emoji: '🧞', harga: 12000000, skill: 'cooldown x0.5' }
  }

  const alias = { 'trex': 'dino_rex', 't_rex': 'dino_rex', 't-rex': 'dino_rex' }
  const bar = (val, len = 10) => '`' + '█'.repeat(Math.floor(val / (100/len))) + '░'.repeat(len - Math.floor(val / (100/len))) + '`'
  const getPet = (name) => user.pets.find(p => p.tipe === name)
  const formatNama = (name) => name.replace(/_/g, ' ')

  if (!action) {
    let cap = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n`
    cap += `⏰ ${waktu} | ${jam}:${menit} WIB\n`
    cap += `💰 Saldo : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `📦 Total Pet : ${user.pets.length}\n\n`
    if (user.pets.length > 0) {
      cap += `🐾 SEMUA PELIHARAAN KAMU 🐾\n`
      user.pets.forEach(p => {
        let skill = pets[p.tipe]?.skill? ` ✨ ${pets[p.tipe].skill}` : ''
        let debuff = ''
        if(p.tipe === 'vampir' &&!isMalam) debuff = ' ☀️ Lemah'
        if(p.tipe === 'snowman' &&!isMalam) debuff = ' 🔥 Kepanasan'

        let bersih = 100 - (p.dirty || 0)
        let statusKotor = ''
        if(bersih >= 80) statusKotor = '✅ Bersih'
        else if(bersih >= 50) statusKotor = '🟡 Agak Kotor'
        else statusKotor = '💩 Sangat Kotor'

        cap += `${pets[p.tipe]?.emoji || '❓'} *${formatNama(p.tipe).toUpperCase()}*${skill}${debuff}\n`
        cap += ` 📈 Level : ${p.level}\n`
        cap += ` 📊 Exp : ${p.exp}/100\n`
        cap += ` 🔋 Energy : ${bar(p.energy || 100)} ${(p.energy || 100)}%\n`
        cap += ` 😊 Happy : ${bar(p.happy || 50)} ${(p.happy || 50)}%\n`
        cap += ` 🧼 Kebersihan : ${bar(bersih)} ${bersih}%\n`
        cap += ` └ Status : ${statusKotor}\n\n`
      })
    } else cap += `_📝 Kamu belum punya pet. Ketik ${usedPrefix}pet shop buat beli_\n\n`
    cap += `━━━━━━━━━━━\n📌.pet shop | adopt | release\n📌.pet feed | walk | play | train | rest | clean | battle`
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/54b79a9952b0.jpeg')
  }

  if (action === 'shop') {
    let sortedPets = Object.entries(pets).sort((a,b) => a[1].harga - b[1].harga)
    let cap = `╭──「 🛍️ ZETA PET SHOP 」──╮\n\n💰 Saldo : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n`
    cap += `📌 Cara beli:.pet adopt nama_pet\nContoh:.pet adopt jack_o_lantern / trex\n`
    cap += `🟢 MURAH < 500RB 🟢\n`
    sortedPets.filter(([k,v]) => v.harga < 500000).forEach(([k, v]) => cap += ` ${v.emoji} ${formatNama(k).padEnd(15)} Rp ${v.harga.toLocaleString()}\n`)
    cap += `\n🔵 STANDAR 500RB-2JT 🔵\n`
    sortedPets.filter(([k,v]) => v.harga >= 500000 && v.harga < 2000000).forEach(([k, v]) => cap += ` ${v.emoji} ${formatNama(k).padEnd(15)} Rp ${v.harga.toLocaleString()}\n`)
    cap += `\n🟣 RARE 2JT-10JT 🟣\n`
    sortedPets.filter(([k,v]) => v.harga >= 2000000 && v.harga < 10000000).forEach(([k, v]) => cap += ` ${v.emoji} ${formatNama(k).padEnd(15)} Rp ${v.harga.toLocaleString()}\n`)
    cap += `\n🔴 LEGEND > 10JT 🔴\n`
    sortedPets.filter(([k,v]) => v.harga >= 10000000).forEach(([k, v]) => cap += ` ${v.emoji} ${formatNama(k).padEnd(15)} Rp ${v.harga.toLocaleString()}\n`)
    return m.reply(cap)
  }

  if (action === 'adopt') {
    let petName = args.slice(1).join(' ').toLowerCase()
    if (!petName) return m.reply(`❌ Contoh: ${usedPrefix}pet adopt jack_o_lantern`)
    petName = petName.replace(/ /g, '_').replace(/-/g, '_')
    if(alias[petName]) petName = alias[petName]
    if (!pets[petName]) return m.reply(`❌ Pilih pet yang benar. Ketik ${usedPrefix}pet shop`)
    if (getPet(petName)) return m.reply(`❌ Kamu sudah punya pet ${formatNama(petName)}!`)
    let harga = pets[petName].harga
    if ((wdb.money[m.sender] || 0) < harga) return m.reply(`❌ Uangmu tidak cukup! Butuh Rp ${harga.toLocaleString()}.`)
    wdb.money[m.sender] -= harga
    user.pets.push({ tipe: petName, level: 1, exp: 0, energy: 100, happy: 50, dirty: 0, lastFeed: 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    saveDB(wdb)
    return m.reply(`✅ ADOPSI BERHASIL\n${pets[petName].emoji} *${formatNama(petName).toUpperCase()}*\n✨ Skill : ${pets[petName].skill || 'Tidak ada'}\n💰 Harga : -Rp ${harga.toLocaleString()}`)
  }

  if (action === 'release') {
    let petName = args.slice(1).join(' ').toLowerCase()
    if (!petName) return m.reply(`❌ Contoh: ${usedPrefix}${command} release kucing`)
    petName = petName.replace(/ /g, '_').replace(/-/g, '_')
    if(alias[petName]) petName = alias[petName]
    let index = user.pets.findIndex(p => p.tipe === petName)
    if (index === -1) return m.reply(`❌ Kamu tidak memiliki pet ${formatNama(petName)}.`)
    user.pets.splice(index, 1)
    saveDB(wdb)
    return m.reply(`💔 *${formatNama(petName).toUpperCase()}* telah dilepaskan`)
  }
}

handler.help = ['pet', 'pet shop', 'pet adopt']
handler.tags = ['rpg']
handler.command = ['pet']
export default handler
