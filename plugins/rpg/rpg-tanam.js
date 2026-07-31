import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)

  const isPrem = global.db.data.users[m.sender]?.premium
  const buyDiscount = isPrem ? 0.8 : 1

  const bibit = {
    'padi': { emoji: '🌾', harga: 20000, waktu: 180000 },
    'jagung': { emoji: '🌽', harga: 40000, waktu: 300000 },
    'semangka': { emoji: '🍉', harga: 70000, waktu: 600000 },
    'jeruk': { emoji: '🍊', harga: 110000, waktu: 900000 },
    'mangga': { emoji: '🥭', harga: 160000, waktu: 1200000 },
    'apel': { emoji: '🍎', harga: 200000, waktu: 1500000 },
    'durian': { emoji: '🌳', harga: 350000, waktu: 1800000 },
    'emas': { emoji: '⚜️', harga: 1500000, waktu: 3600000 }
  }

  let slotKosong = []
  for (let i = 1; i <= user.maxLadang; i++) {
    if (!user.ladang[i]) slotKosong.push(i)
  }

  if (slotKosong.length === 0) return m.reply(`❌ Semua ladang sudah penuh.`)

  let args = text ? text.toLowerCase().split(' ') : []
  let jenis = args[0]
  let isAll = args[1] === 'all'

  if (!bibit[jenis]) {
    let cap = `🌱 *DAFTAR BIBIT ZETA*\n`
    cap += `Status: ${isPrem ? '👑 Premium (Diskon 20%)' : '👤 User Normal'}\n\n`
    
    cap += Object.entries(bibit).map(([name, info]) => {
      let hargaFinal = Math.floor(info.harga * buyDiscount)
      return `${info.emoji} ${name.toUpperCase()} - Rp ${hargaFinal.toLocaleString()}`
    }).join('\n')

    cap += `\n\n*CARA TANAM:* \n`
    cap += `• Per slot: *${usedPrefix}tanam padi*\n`
    cap += `• Semua slot: *${usedPrefix}tanam padi all*`
    return m.reply(cap)
  }

  let info = bibit[jenis]
  let hargaFinal = Math.floor(info.harga * buyDiscount)
  let userMoney = wdb.money[m.sender] || 0

  if (isAll) {
    let count = 0
    for (let slot of slotKosong) {
      if (userMoney >= hargaFinal) {
        user.ladang[slot] = { jenis: jenis, waktuTanam: Date.now() }
        userMoney -= hargaFinal
        count++
      } else {
        break
      }
    }

    if (count === 0) return m.reply(`❌ Uang tidak cukup.`)

    wdb.money[m.sender] = userMoney
    saveDB(wdb)
    return m.reply(`🌱 Berhasil menanam *${count}* ${info.emoji} ${jenis.toUpperCase()}!\nBiaya: Rp ${(hargaFinal * count).toLocaleString()}\nSisa: Rp ${userMoney.toLocaleString()}`)
  }

  if (userMoney < hargaFinal) return m.reply(`❌ Uang tidak cukup.`)

  wdb.money[m.sender] -= hargaFinal
  user.ladang[slotKosong[0]] = { jenis: jenis, waktuTanam: Date.now() }
  
  saveDB(wdb)
  m.reply(`🌱 Berhasil menanam *${info.emoji} ${jenis.toUpperCase()}* di *Ladang ${slotKosong[0]}*.\n💸 Biaya: Rp ${hargaFinal.toLocaleString()}`)
}

handler.help = ['tanam']
handler.tags = ['rpg']
handler.command = /^(tanam|berkebun)$/i
handler.group = true

export default handler