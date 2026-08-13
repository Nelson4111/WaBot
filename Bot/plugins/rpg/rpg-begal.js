import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()

  if (!global.db.data) global.db.data = {}
  if (!global.db.data.cooldowns) global.db.data.cooldowns = {}
  if (!global.db.data.cooldowns[m.sender]) global.db.data.cooldowns[m.sender] = {}
  if (!global.db.data.cooldowns[m.sender].gagalBegal) global.db.data.cooldowns[m.sender].gagalBegal = 0

  let penjara = global.db.data.cooldowns[m.sender]?.penjara || 0
  if (Date.now() - penjara < 60000) {
    let sisa = 60000 - (Date.now() - penjara)
    let detik = Math.floor(sisa / 1000)
    return m.reply(` *DI PENJARA*\nKamu masih di penjara karena gagal begal 2x.\nTunggu *${detik} detik* lagi.`)
  }

  let lastBegal = global.db.data.cooldowns[m.sender]?.begal || 0
  let cd = 120000

  if (Date.now() - lastBegal < cd) {
    let sisa = cd - (Date.now() - lastBegal)
    let menit = Math.floor(sisa / 60000)
    let detik = Math.floor((sisa % 60000) / 1000)
    return m.reply(` Tunggu *${menit} menit ${detik} detik* lagi untuk begal kembali.`)
  }

  let who = m.quoted ? m.quoted.sender : null
  if (!who) return m.reply(`Silakan reply pesan orang yang ingin kamu begal!`)
  if (who === m.sender) return m.reply(' Tidak bisa begal diri sendiri.')

  // CEK GUILD
  let myGuild = Object.values(wdb.guilds || {}).find(g => g.members.includes(m.sender))
  let targetGuild = Object.values(wdb.guilds || {}).find(g => g.members.includes(who))
  if(myGuild && targetGuild && myGuild.name === targetGuild.name){
    return m.reply(' Sesama anggota guild tidak bisa saling begal!')
  }

  let dataTarget = getUserRPG(wdb, who)
  let target = dataTarget.rpg
  if(!target) return m.reply(' Target belum punya data RPG.')

  if(!target.maxDarahBonus) target.maxDarahBonus = 0
  let armorTarget = target.armor || 0
  let maxHPTarget = 100 + (armorTarget * 20) + target.maxDarahBonus
  target.maxDarah = maxHPTarget
  if(!target.darah) target.darah = maxHPTarget

  if (target.darah <= 0) return m.reply(' Target sudah sekarat! Dia tidak bisa dibegal. Suruh heal dulu')

  let targetMoney = wdb.money[who] || 0
  if (targetMoney < 500) return m.reply(' Target terlalu miskin untuk dibegal.')

  global.db.data.cooldowns[m.sender].begal = Date.now()

  let peluangGagal = Math.random() < 0.3

  if (peluangGagal) {
    global.db.data.cooldowns[m.sender].gagalBegal += 1

    let denda = Math.floor((wdb.money[m.sender] || 0) * 0.15)
    wdb.money[m.sender] -= denda
    wdb.money[who] += denda

    if (global.db.data.cooldowns[m.sender].gagalBegal >= 2) {
      global.db.data.cooldowns[m.sender].penjara = Date.now()
      global.db.data.cooldowns[m.sender].gagalBegal = 0
      saveDB(wdb)
      return m.reply(` *DITANGKEP POLISI!*\nKamu gagal begal 2x berturut-turut.\nMasuk penjara *1 menit*.`)
    }

    saveDB(wdb)

    let teksGagal = ` *BEGAL GAGAL!*\n\n`
    teksGagal += ` *Begal:* @${m.sender.split('@')[0]}\n`
    teksGagal += ` *Target:* @${who.split('@')[0]}\n\n`
    teksGagal += ` Kamu ketahuan warga!\n`
    teksGagal += ` Bayar ganti rugi *Rp ${denda.toLocaleString()}*\n`
    teksGagal += ` Gagal ${global.db.data.cooldowns[m.sender].gagalBegal}/2. Gagal 1x lagi = Penjara!`
    return conn.reply(m.chat, teksGagal, m, { mentions: [m.sender, who] })
  }

  global.db.data.cooldowns[m.sender].gagalBegal = 0

  let persen = Math.floor(Math.random() * 11) + 5
  let hasilCuri = Math.floor(targetMoney * (persen / 100))

  let damage = Math.floor(Math.random() * 15) + 5
  target.darah -= damage
  if(target.darah < 0) target.darah = 0

  wdb.money[who] -= hasilCuri
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hasilCuri

  // TRACKING CRIME - TAMBAHIN INI
  if(!wdb.crime) wdb.crime = {}
  if(!wdb.crime[m.sender]) wdb.crime[m.sender] = { rampok: 0, begal: 0, bunuh: 0, total: 0 }
  wdb.crime[m.sender].begal += 1
  wdb.crime[m.sender].total += 1

  saveDB(wdb)

  let teks = ` *BEGAL BERHASIL*\n\n`
  teks += ` *Begal:* @${m.sender.split('@')[0]}\n`
  teks += ` *Korban:* @${who.split('@')[0]}\n\n`
  teks += ` Korban kehilangan *${persen}%* uangnya.\n`
  teks += ` Kamu mendapatkan: *Rp ${hasilCuri.toLocaleString()}*\n\n`
  teks += ` *Target kehilangan ${damage} HP*\n`
  teks += ` *Sisa HP Target:* ${target.darah}/${maxHPTarget}`
  if(target.darah <= 0) teks += `\n\n *TARGET SEKARAT!* Gabisa dibegal lagi`

  conn.reply(m.chat, teks, m, { mentions: [m.sender, who] })
}

handler.help = ['begal (reply)']
handler.tags = ['rpg']
handler.command = /^(begal)$/i
handler.group = true

export default handler