import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)

  const bibit = {
    'padi': { emoji: '🌾', exp: 50, waktu: 180000 },
    'jagung': { emoji: '🌽', exp: 100, waktu: 300000 },
    'semangka': { emoji: '🍉', exp: 150, waktu: 600000 },
    'jeruk': { emoji: '🍊', exp: 250, waktu: 900000 },
    'mangga': { emoji: '🥭', exp: 400, waktu: 1200000 },
    'apel': { emoji: '🍎', exp: 500, waktu: 1500000 },
    'durian': { emoji: '🌳', exp: 800, waktu: 1800000 },
    'emas': { emoji: '⚜️', exp: 3000, waktu: 3600000 }
  }

  if (!text) {
    let cap = `*🏡 AREA PERKEBUNAN 🏡*\n`
    cap += `*──「 STATUS LADANG 」──*\n\n`
    
    for (let i = 1; i <= user.maxLadang; i++) {
      if (user.ladang[i]) {
        let l = user.ladang[i]
        let info = bibit[l.jenis]
        let sisa = info.waktu - (Date.now() - l.waktuTanam)
        let ready = sisa <= 0
        
        cap += `╭───〔 *Ladang ${i}* 〕\n`
        cap += `┊  Jenis: ${info.emoji} ${l.jenis.toUpperCase()}\n`
        cap += `┊  Status: ${ready ? '✅ Siap Panen' : `🌱 Tumbuh (${Math.ceil(sisa / 60000)}m)`}\n`
        cap += `╰──────────────\n`
      } else {
        cap += `╭───〔 *LADANG ${i}* 〕\n`
        cap += `┊ 🪾 Status: Kosong\n`
        cap += `╰──────────────\n`
      }
    }
    
    cap += `\n*CARA PANEN:* \n`
    cap += `- *${usedPrefix}panen all* (Semua)\n`
    cap += `- *${usedPrefix}panen [nomor]* (Satu slot)\n`
    
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
        let sisaWaktu = dataBibit.waktu - (Date.now() - l.waktuTanam)

        if (sisaWaktu <= 0) {
          user.hasilKebun[l.jenis] = (user.hasilKebun[l.jenis] || 0) + 1
          totalExp += dataBibit.exp
          hasil[l.jenis] = (hasil[l.jenis] || 0) + 1
          delete user.ladang[i]
          count++
        }
      }
    }

    if (count === 0) return m.reply('❌ Belum ada yang siap dipanen.')

    user.exp += totalExp
    let teks = `*PANEN MASSAL BERHASIL!*\n\n`
    teks += `*Total:* ${count} Slot\n`
    Object.keys(hasil).forEach(key => {
      teks += `• ${hasil[key]}x ${bibit[key].emoji} ${key.toUpperCase()}\n`
    })
    teks += `\n*Bonus:* +${totalExp} XP`

    if (user.exp >= user.level * 500) { 
      user.level++
      user.exp = 0
      teks += `\n🎉 *LEVEL UP!* Lv.${user.level}` 
    }

    saveDB(wdb)
    return m.reply(teks)
  }

  let index = parseInt(text)
  if (isNaN(index) || !user.ladang[index]) return m.reply(`❌ Ladang nomor *${index}* kosong.`)
  
  let l = user.ladang[index]
  let dataBibit = bibit[l.jenis]
  let sisaWaktu = dataBibit.waktu - (Date.now() - l.waktuTanam)

  if (sisaWaktu <= 0) {
    user.hasilKebun[l.jenis] = (user.hasilKebun[l.jenis] || 0) + 1
    user.exp += dataBibit.exp
    delete user.ladang[index] 

    let teks = `*PANEN BERHASIL!*\n\n`
    teks += `📍 *Slot:* ${index}\n`
    teks += `☘️ *Hasil:* 1 ${dataBibit.emoji} ${l.jenis.toUpperCase()}\n`
    teks += `*Bonus:* +${dataBibit.exp} XP`

    if (user.exp >= user.level * 500) { 
      user.level++
      user.exp = 0
      teks += `\n🎉 *LEVEL UP!* Lv.${user.level}` 
    }
    saveDB(wdb)
    m.reply(teks)
  } else {
    let mnt = Math.floor(sisaWaktu / 60000)
    let dtk = Math.floor((sisaWaktu % 60000) / 1000)
    m.reply(`⏳ *${l.jenis.toUpperCase()}* sisa waktu: *${mnt}m ${dtk}s*`)
  }
}

handler.help = ['panen']
handler.tags = ['rpg']
handler.command = /^(panen)$/i
handler.group = true

export default handler