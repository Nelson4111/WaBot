import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik .adventure dulu.')

  // Inisialisasi Pet jika belum ada
  if (!user.pet) user.pet = { tipe: 'none', level: 1, exp: 0, lastFeed: 0 }

  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
  let args = text.split(' ')
  let action = args[0]?.toLowerCase()

  // 1. MENU UTAMA PET
  if (!action) {
    let cap = `*───「 ZETA PET CENTER 」───*\n\n`
    if (user.pet.tipe === 'none') {
      cap += `Kamu belum memiliki teman perjalanan.\nKetik *${usedPrefix}${command} adopt [nama]* untuk memilih.\n\n`
      cap += `*Daftar Harga Adopsi:*\n`
      cap += `• 🐱 *Kucing*: Rp 150.000\n`
      cap += `• 🐶 *Anjing*: Rp 250.000\n`
      cap += `• 🐉 *Naga*: Rp 750.000\n\n`
      cap += `*Skill:* Kucing (XP+), Anjing (Gold+), Naga (Damage & Diamond+)`
    } else {
      cap += `🐾 *Pet Saat Ini:* ${user.pet.tipe.toUpperCase()}\n`
      cap += `🆙 *Level:* ${user.pet.level}\n`
      cap += `✨ *Exp:* ${user.pet.exp}/100\n\n`
      cap += `*Menu:*\n`
      cap += `• ${usedPrefix}${command} feed (Beri Makan - Rp 5.000)\n`
      cap += `• ${usedPrefix}${command} release (Lepaskan Pet)`
    }

    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/54b79a9952b0.jpeg')
  }

  // 2. ADOPSI PET (Harga Baru)
  if (action === 'adopt') {
    if (user.pet.tipe !== 'none') return m.reply('Kamu sudah memiliki pet! Lepaskan dulu jika ingin ganti.')
    let type = args[1]?.toLowerCase()
    
    // Penentuan Harga Berdasarkan Jenis
    let prices = {
      'kucing': 150000,
      'anjing': 250000,
      'naga': 750000
    }

    if (!prices[type]) return m.reply('Pilih pet yang benar: kucing, anjing, atau naga.')

    let hargaAdopt = prices[type]
    if ((wdb.money[m.sender] || 0) < hargaAdopt) return m.reply(`Uangmu tidak cukup! Butuh Rp ${hargaAdopt.toLocaleString()} untuk mengadopsi ${type}.`)

    wdb.money[m.sender] -= hargaAdopt
    user.pet.tipe = type
    user.pet.level = 1
    user.pet.exp = 0
    saveDB(wdb)
    return m.reply(`🎉 Selamat! Kamu telah mengadopsi *${type.toUpperCase()}* seharga Rp ${hargaAdopt.toLocaleString()}.`)
  }

  // 3. MEMBERI MAKAN (FEED) - Cooldown 2 Menit
  if (action === 'feed') {
    if (user.pet.tipe === 'none') return m.reply('Kamu tidak punya pet.')
    
    let cooldown = 120000 // 2 Menit
    if (Date.now() - (user.pet.lastFeed || 0) < cooldown) {
      let sisa = ((cooldown - (Date.now() - user.pet.lastFeed)) / 1000).toFixed(0)
      return m.reply(`🍖 *${user.pet.tipe}* masih kenyang. Tunggu ${sisa} detik lagi.`)
    }

    let biayaMakan = 5000
    if ((wdb.money[m.sender] || 0) < biayaMakan) return m.reply('Uang tidak cukup untuk beli makanan pet.')

    wdb.money[m.sender] -= biayaMakan
    user.pet.exp += 25
    user.pet.lastFeed = Date.now()

    if (user.pet.exp >= 100) {
      user.pet.level += 1
      user.pet.exp = 0
      m.reply(`🆙 Pet kamu naik ke *Level ${user.pet.level}*!`)
    } else {
      m.reply(`🍴 *${user.pet.tipe}* makan dengan lahap! (Exp +25)`)
    }
    saveDB(wdb)
  }

  // 4. MELEPAS PET
  if (action === 'release') {
    if (user.pet.tipe === 'none') return m.reply('Tidak ada pet untuk dilepas.')
    user.pet.tipe = 'none'
    user.pet.level = 1
    user.pet.exp = 0
    saveDB(wdb)
    m.reply('Pet telah dilepaskan. Kamu bisa mengadopsi yang baru sekarang.')
  }
}

handler.help = ['pet <action>']
handler.tags = ['rpg']
handler.command = ['pet']

export default handler