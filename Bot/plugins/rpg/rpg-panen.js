import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)

  if(!user.inventory) user.inventory = {}

  const bibit = {
    'padi': { emoji: '🌾', exp: 50, waktu: 180000, hasil: { item: 'padi', jumlah: 1 } },
    'jagung': { emoji: '🌽', exp: 100, waktu: 300000, hasil: { item: 'jagung', jumlah: 1 } },
    'apel merah': { emoji: '🍎', exp: 500, waktu: 1500000, hasil: { item: 'apel merah', jumlah: 1 } },
    'apel hijau': { emoji: '🍏', exp: 480, waktu: 1450000, hasil: { item: 'apel hijau', jumlah: 1 } },
    'pir': { emoji: '🍐', exp: 350, waktu: 1200000, hasil: { item: 'pir', jumlah: 1 } },
    'jeruk': { emoji: '🍊', exp: 250, waktu: 900000, hasil: { item: 'jeruk', jumlah: 1 } },
    'lemon': { emoji: '🍋', exp: 200, waktu: 800000, hasil: { item: 'lemon', jumlah: 1 } },
    'pisang': { emoji: '🍌', exp: 300, waktu: 1000000, hasil: { item: 'pisang', jumlah: 1 } },
    'semangka': { emoji: '🍉', exp: 150, waktu: 600000, hasil: { item: 'semangka', jumlah: 1 } },
    'anggur': { emoji: '🍇', exp: 400, waktu: 1300000, hasil: { item: 'anggur', jumlah: 1 } },
    'stroberi': { emoji: '🍓', exp: 220, waktu: 850000, hasil: { item: 'stroberi', jumlah: 1 } },
    'bluberi': { emoji: '🫐', exp: 240, waktu: 870000, hasil: { item: 'bluberi', jumlah: 1 } },
    'melon': { emoji: '🍈', exp: 380, waktu: 1250000, hasil: { item: 'melon', jumlah: 1 } },
    'ceri': { emoji: '🍒', exp: 260, waktu: 900000, hasil: { item: 'ceri', jumlah: 1 } },
    'persik': { emoji: '🍑', exp: 360, waktu: 1150000, hasil: { item: 'persik', jumlah: 1 } },
    'mangga': { emoji: '🥭', exp: 400, waktu: 1200000, hasil: { item: 'mangga', jumlah: 1 } },
    'brokoli': { emoji: '🥦', exp: 180, waktu: 700000, hasil: { item: 'brokoli', jumlah: 1 } },
    'terong': { emoji: '🍆', exp: 190, waktu: 720000, hasil: { item: 'terong', jumlah: 1 } },
    'tomat': { emoji: '🍅', exp: 170, waktu: 680000, hasil: { item: 'tomat', jumlah: 1 } },
    'alpukat': { emoji: '🥑', exp: 420, waktu: 1350000, hasil: { item: 'alpukat', jumlah: 1 } },
    'kiwi': { emoji: '🥝', exp: 320, waktu: 1050000, hasil: { item: 'kiwi', jumlah: 1 } },
    'kelapa': { emoji: '🥥', exp: 450, waktu: 1400000, hasil: { item: 'kelapa', jumlah: 1 } },
    'nanas': { emoji: '🍍', exp: 340, waktu: 1100000, hasil: { item: 'nanas', jumlah: 1 } },
    'selada': { emoji: '🥬', exp: 160, waktu: 650000, hasil: { item: 'selada', jumlah: 1 } },
    'timun': { emoji: '🥒', exp: 150, waktu: 600000, hasil: { item: 'timun', jumlah: 1 } },
    'wortel': { emoji: '🥕', exp: 140, waktu: 550000, hasil: { item: 'wortel', jumlah: 1 } },
    'zaitun': { emoji: '🫒', exp: 300, waktu: 950000, hasil: { item: 'zaitun', jumlah: 1 } },
    'bawang putih': { emoji: '🧄', exp: 120, waktu: 500000, hasil: { item: 'bawang putih', jumlah: 1 } },
    'bawang merah': { emoji: '🧅', exp: 130, waktu: 520000, hasil: { item: 'bawang merah', jumlah: 1 } },
    'cabai': { emoji: '🌶', exp: 210, waktu: 780000, hasil: { item: 'cabai', jumlah: 1 } },
    'paprika': { emoji: '🫑', exp: 200, waktu: 750000, hasil: { item: 'paprika', jumlah: 1 } },
    'kentang': { emoji: '🥔', exp: 160, waktu: 640000, hasil: { item: 'kentang', jumlah: 1 } },
    'ubi': { emoji: '🍠', exp: 170, waktu: 660000, hasil: { item: 'ubi', jumlah: 1 } },
    'kastanye': { emoji: '🌰', exp: 280, waktu: 920000, hasil: { item: 'kastanye', jumlah: 1 } },
    'kacang': { emoji: '🥜', exp: 110, waktu: 480000, hasil: { item: 'kacang', jumlah: 1 } },
    'durian': { emoji: '🌳', exp: 800, waktu: 1800000, hasil: { item: 'durian', jumlah: 1 } },
    'uang': { emoji: '💵', exp: 1000, waktu: 1800000, hasil: { item: 'money', jumlah: 100000 } },
    'koin': { emoji: '🪙', exp: 1200, waktu: 2000000, hasil: { item: 'koin', jumlah: 150 } },
    'diamond': { emoji: '💎', exp: 5000, waktu: 7200000, hasil: { item: 'diamond', jumlah: 1 } },
    'exp': { emoji: '✨', exp: 800, waktu: 1600000, hasil: { item: 'exp', jumlah: 2000 } },
    'emas': { emoji: '⚜️', exp: 3000, waktu: 3600000, hasil: { item: 'emas', jumlah: 1 } }
  }

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