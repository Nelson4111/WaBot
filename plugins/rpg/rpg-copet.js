import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let userRPG = wdb.users[m.sender]?.rpg
  if (!userRPG) return m.reply('❌ Kamu belum punya data RPG. Mulai dengan *.adventure*')
  if(!userRPG.riwayat) userRPG.riwayat = []

  // CEK PENJARA GLOBAL - HANYA UNTUK COMMAND KRIMINAL
  if (userRPG.penjara && Date.now() - userRPG.penjara < userRPG.lamaPenjara) {
    let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    let tebusan = userRPG.tebusan || 1000000
    return m.reply(`🚔 *KAMU DI PENJARA SEL ${userRPG.sel}*\nSisa: *${jam}j ${menit}m*\nTebusan: *Rp ${tebusan.toLocaleString()}*\n\nKetik *.tebus* atau *.tebus sel ${userRPG.sel}*`)
  }

  // COOLDOWN 10 MENIT
  let cd = 600000
  if (!userRPG.lastcopet) userRPG.lastcopet = 0
  let sisa = cd - (Date.now() - userRPG.lastcopet)
  if (sisa > 0) {
    let menit = Math.floor(sisa / 60000)
    let detik = Math.floor((sisa % 60000) / 1000)
    return m.reply(`⏳ *COOLDOWN*\nTunggu *${menit}m ${detik}d* lagi untuk copet`)
  }

  let who = m.quoted?.sender
  if (!who) return m.reply(`❌ Reply pesan target yg mau dicopet`)
  if (who === m.sender) return m.reply('❌ Ga bisa copet diri sendiri')

  let target = getUserRPG(wdb, who).rpg
  if(!target) return m.reply('❌ Target belum punya data RPG')
  if(!target.riwayat) target.riwayat = []

  let uangTarget = wdb.money[who] || 0
  if (uangTarget < 1000) return m.reply('❌ Target terlalu miskin. Minimal Rp 1.000')

  userRPG.lastcopet = Date.now()
  let gagal = Math.random() < 0.4 // 40% gagal

  // INIT CRIME
  wdb.crime = wdb.crime || {}
  wdb.crime[m.sender] = wdb.crime[m.sender] || { copet: 0, rampok: 0, begal: 0, bunuh: 0, total: 0 }

  if (gagal) {
    userRPG.gagalCopet = (userRPG.gagalCopet || 0) + 1
    let denda = Math.max(1000, Math.floor((wdb.money[m.sender] || 0) * 0.05))
    if(denda > 0) {
      wdb.money[m.sender] -= denda
      wdb.money[who] += denda
    }

    wdb.crime[m.sender].copet += 1
    wdb.crime[m.sender].total += 1

    target.riwayat.unshift(`+Rp ${denda.toLocaleString()} Denda copet dari @${m.sender.split('@')[0]}`)
    userRPG.riwayat.unshift(`-Rp ${denda.toLocaleString()} Gagal copet @${who.split('@')[0]}`)

    // GAGAL 2X = PENJARA 1 JAM
    if (userRPG.gagalCopet >= 2) {
      wdb.penjara = wdb.penjara || []
      let sel = wdb.penjara.length + 1
      userRPG.penjara = Date.now()
      userRPG.lamaPenjara = 3600000 // 1 jam
      userRPG.tebusan = 1000000 // 1jt
      userRPG.sel = sel
      userRPG.gagalCopet = 0
      wdb.penjara.push(m.sender)
      saveDB(wdb)
      return m.reply(`🚔 *KETANGKEP POLISI!*\nGagal copet 2x berturut.\nKamu masuk *PENJARA SEL ${sel}* selama *1 jam*\nTebusan: *Rp 1.000.000*\n\nKetik *.tebus* atau minta teman *.tebus @kamu*`)
    }
    saveDB(wdb)

    let txt = `┌───❏「 🤏 COPET GAGAL 」❏\n`
    txt += `│ 👤 Copet: @${m.sender.split('@')[0]}\n`
    txt += `│ 🎯 Target: @${who.split('@')[0]}\n`
    txt += `│ 💸 Denda: Rp ${denda.toLocaleString()}\n`
    txt += `│ ⚠️ Strike: ${userRPG.gagalCopet}/2\n`
    txt += `└───────────────────\n`
    txt += `\n💡 Cek *.buronan* untuk lihat riwayat kriminalmu`
    return conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })
  }

  userRPG.gagalCopet = 0
  let hasil = Math.floor(Math.random() * 5000) + 1000 // 1k - 6k

  wdb.money[who] -= hasil
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hasil

  wdb.crime[m.sender].copet += 1
  wdb.crime[m.sender].total += 1

  target.riwayat.unshift(`-Rp ${hasil.toLocaleString()} Dicopet @${m.sender.split('@')[0]}`)
  userRPG.riwayat.unshift(`+Rp ${hasil.toLocaleString()} Copet @${who.split('@')[0]}`)
  saveDB(wdb)

  let txt = `┌───❏「 ✅ COPET BERHASIL 」❏\n`
  txt += `│ 🤏 Copet: @${m.sender.split('@')[0]}\n`
  txt += `│ 🎯 Korban: @${who.split('@')[0]}\n`
  txt += `│ 💰 Jarahan: Rp ${hasil.toLocaleString()}\n`
  txt += `└───────────────────\n`
  txt += `\n💡 Cek *.buronan* untuk lihat riwayat kriminalmu`

  conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })
}
handler.help = ['copet (reply)']
handler.tags = ['rpg']
handler.command = /^(copet)$/i
handler.group = true
export default handler