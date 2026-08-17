import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let userRPG = wdb.users[m.sender]?.rpg
  if (!userRPG) return m.reply('❌ Kamu belum punya data RPG. Mulai dengan *.adventure*')
  if(!userRPG.riwayat) userRPG.riwayat = {}

  // CEK PENJARA
  if (userRPG.penjara && Date.now() - userRPG.penjara < userRPG.lamaPenjara) {
    let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    let tebusan = userRPG.tebusan || 2000000
    return m.reply(`🚔 *KAMU DI PENJARA SEL ${userRPG.sel}*\nSisa: *${jam}j ${menit}m*\nTebusan: *Rp ${tebusan.toLocaleString()}*\n\nKetik *.tebus*`)
  }

  // COOLDOWN 2 JAM
  let cd = 7200000
  if (!userRPG.lastbegal) userRPG.lastbegal = 0
  let sisa = cd - (Date.now() - userRPG.lastbegal)
  if (sisa > 0) {
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    return m.reply(`⏳ *COOLDOWN BEGAL*\nTunggu *${jam}j ${menit}m* lagi`)
  }

  let who = m.quoted?.sender
  if (!who) return m.reply(`❌ Reply pesan target yg mau dibegal`)
  if (who === m.sender) return m.reply('❌ Ga bisa begal diri sendiri')

  let target = getUserRPG(wdb, who).rpg
  if(!target) return m.reply('❌ Target belum punya data RPG')
  if(!target.riwayat) target.riwayat = []

  let uangTarget = wdb.money[who] || 0
  if (uangTarget < 500) return m.reply('❌ Target terlalu miskin. Minimal Rp 500')

  userRPG.lastbegal = Date.now()
  let gagal = Math.random() < 0.3 // 30% gagal

  // INIT CRIME
  wdb.crime = wdb.crime || {}
  wdb.crime[m.sender] = wdb.crime[m.sender] || { copet: 0, rampok: 0, begal: 0, bunuh: 0, total: 0 }

  if (gagal) {
    // GAGAL = MATI + PENJARA 2 JAM
    userRPG.darah = 0
    wdb.penjara = wdb.penjara || []
    if(!wdb.penjara.includes(m.sender)){
      let sel = wdb.penjara.length + 1
      userRPG.penjara = Date.now()
      userRPG.lamaPenjara = 7200000 // 2 jam
      userRPG.tebusan = 2000000 // 2jt
      userRPG.sel = sel
      wdb.penjara.push(m.sender)
    }

    wdb.crime[m.sender].begal += 1
    wdb.crime[m.sender].total += 1
    userRPG.riwayat.unshift(`💀 Mati saat begal @${who.split('@')[0]}`)

    saveDB(wdb)
    let txt = `┌───❏「 💀 BEGAL GAGAL 」❏\n`
    txt += `│ 🏴‍☠️ Pembegal: @${m.sender.split('@')[0]}\n`
    txt += `│ 🎯 Target: @${who.split('@')[0]}\n`
    txt += `│ ⚰️ Kamu tertembak dan mati\n`
    txt += `│ 🚔 Masuk *PENJARA SEL ${userRPG.sel}* selama *2 jam*\n`
    txt += `│ 💰 Tebusan: *Rp 2.000.000*\n`
    txt += `└───────────────────`
    return conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })
  }

  // SUKSES
  let hasil = Math.max(500, Math.floor(uangTarget * 0.1))
  wdb.money[who] -= hasil
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hasil

  wdb.crime[m.sender].begal += 1
  wdb.crime[m.sender].total += 1

  target.riwayat.unshift(`-Rp ${hasil.toLocaleString()} Dibegal @${m.sender.split('@')[0]}`)
  userRPG.riwayat.unshift(`+Rp ${hasil.toLocaleString()} Begal @${who.split('@')[0]}`)
  saveDB(wdb) // cuma 1x save di akhir

  let txt = `┌───❏「 ✅ BEGAL BERHASIL 」❏\n`
  txt += `│ 🏴‍☠️ Pembegal: @${m.sender.split('@')[0]}\n`
  txt += `│ 🎯 Korban: @${who.split('@')[0]}\n`
  txt += `│ 💰 Jarahan: Rp ${hasil.toLocaleString()}\n`
  txt += `└───────────────────\n`
  txt += `\n💡 Cek *.buronan* untuk lihat DPO`

  conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })
}
handler.help = ['begal (reply)']
handler.tags = ['rpg']
handler.command = /^(begal)$/i
handler.group = true
export default handler