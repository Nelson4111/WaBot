import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()

  // INIT COOLDOWN
  if (!wdb.cooldowns) wdb.cooldowns = {}
  if (!wdb.cooldowns[m.sender]) wdb.cooldowns[m.sender] = { begal: 0, gagalBegal: 0, penjara: 0 }
  let cdData = wdb.cooldowns[m.sender]

  // CEK PENJARA
  if (Date.now() - cdData.penjara < 60000) {
    let sisa = 60000 - (Date.now() - cdData.penjara)
    let detik = Math.floor(sisa / 1000)
    return m.reply(`🚔 *DI PENJARA*\nKamu masih di penjara karena gagal begal 2x.\nTunggu *${detik} detik* lagi.`)
  }

  // CEK COOLDOWN BEGAL
  let lastBegal = cdData.begal || 0
  let cd = 120000 // 2 menit
  if (Date.now() - lastBegal < cd) {
    let sisa = cd - (Date.now() - lastBegal)
    let menit = Math.floor(sisa / 60000)
    let detik = Math.floor((sisa % 60000) / 1000)
    return m.reply(`⏳ Tunggu *${menit} menit ${detik} detik* lagi untuk begal kembali.`)
  }

  let who = m.quoted ? m.quoted.sender : null
  if (!who) return m.reply(`❌ Silakan reply pesan orang yang ingin kamu begal!`)
  if (who === m.sender) return m.reply('❌ Tidak bisa begal diri sendiri.')

  // CEK GUILD
  let myGuild = Object.values(wdb.guilds || {}).find(g => g.members?.includes(m.sender))
  let targetGuild = Object.values(wdb.guilds || {}).find(g => g.members?.includes(who))
  if(myGuild && targetGuild && myGuild.name === targetGuild.name){
    return m.reply('❌ Sesama anggota guild tidak bisa saling begal!')
  }

  let dataTarget = getUserRPG(wdb, who)
  let target = dataTarget.rpg
  if(!target) return m.reply('❌ Target belum punya data RPG.')

  // HITUNG HP TARGET
  if(!target.maxDarahBonus) target.maxDarahBonus = 0
  let armorTarget = target.armor || 0
  let maxHPTarget = 100 + (armorTarget * 20) + target.maxDarahBonus
  target.maxDarah = maxHPTarget
  if(!target.darah || target.darah > maxHPTarget) target.darah = maxHPTarget

  if (target.darah <= 0) return m.reply('❌ Target sudah sekarat! Dia tidak bisa dibegal. Suruh heal dulu')

  let targetMoney = wdb.money[who] || 0
  if (targetMoney < 500) return m.reply('❌ Target terlalu miskin untuk dibegal. Minimal Rp 500')

  cdData.begal = Date.now()

  let peluangGagal = Math.random() < 0.3 // 30% gagal

  if (peluangGagal) {
    cdData.gagalBegal += 1

    let denda = Math.floor((wdb.money[m.sender] || 0) * 0.15)
    if(denda > 0) {
      wdb.money[m.sender] -= denda
      wdb.money[who] += denda
    }

    if (cdData.gagalBegal >= 2) {
      cdData.penjara = Date.now()
      cdData.gagalBegal = 0
      saveDB(wdb)
      return m.reply(`🚔 *DITANGKEP POLISI!*\nKamu gagal begal 2x berturut-turut.\nMasuk penjara *1 menit*.`)
    }

    saveDB(wdb)

    let teksGagal = `❌ *BEGAL GAGAL!*\n\n`
    teksGagal += `🏴‍☠️ *Begal:* @${m.sender.split('@')[0]}\n`
    teksGagal += `🎯 *Target:* @${who.split('@')[0]}\n\n`
    teksGagal += `👮 Kamu ketahuan warga!\n`
    teksGagal += `💸 Bayar ganti rugi *Rp ${denda.toLocaleString()}*\n`
    teksGagal += `⚠️ Gagal ${cdData.gagalBegal}/2. Gagal 1x lagi = Penjara!`
    return conn.reply(m.chat, teksGagal, m, { mentions: [m.sender, who] })
  }

  cdData.gagalBegal = 0

  let persen = Math.floor(Math.random() * 11) + 5 // 5-15%
  let hasilCuri = Math.floor(targetMoney * (persen / 100))

  let damage = Math.floor(Math.random() * 15) + 5 // 5-19
  target.darah -= damage
  if(target.darah < 0) target.darah = 0

  wdb.money[who] -= hasilCuri
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hasilCuri

  // TRACKING CRIME
  if(!wdb.crime) wdb.crime = {}
  if(!wdb.crime[m.sender]) wdb.crime[m.sender] = { rampok: 0, begal: 0, bunuh: 0, total: 0 }
  wdb.crime[m.sender].begal += 1
  wdb.crime[m.sender].total += 1

  saveDB(wdb)

  let teks = `✅ *BEGAL BERHASIL*\n\n`
  teks += `🏴‍☠️ *Begal:* @${m.sender.split('@')[0]}\n`
  teks += `🎯 *Korban:* @${who.split('@')[0]}\n\n`
  teks += `💰 Korban kehilangan *${persen}%* uangnya.\n`
  teks += `💵 Kamu mendapatkan: *Rp ${hasilCuri.toLocaleString()}*\n\n`
  teks += `🩸 *Target kehilangan ${damage} HP*\n`
  teks += `❤️ *Sisa HP Target:* ${target.darah}/${maxHPTarget}`
  if(target.darah <= 0) teks += `\n\n💀 *TARGET SEKARAT!* Gabisa dibegal lagi sampai heal`

  conn.reply(m.chat, teks, m, { mentions: [m.sender, who] })
}

handler.help = ['begal (reply)']
handler.tags = ['rpg']
handler.command = /^(begal)$/i
handler.group = true

export default handler