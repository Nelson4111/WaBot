import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()

  if (!global.db.data) global.db.data = {}
  if (!global.db.data.cooldowns) global.db.data.cooldowns = {}

  let lastKill = global.db.data.cooldowns[m.sender]?.bunuh || 0
  let cd = 300000

  if (Date.now() - lastKill < cd) {
    let sisa = cd - (Date.now() - lastKill)
    let menit = Math.floor(sisa / 60000)
    let detik = Math.floor((sisa % 60000) / 1000)
    return m.reply(`⏳ Tunggu *${menit} menit ${detik} detik* lagi untuk membunuh kembali.`)
  }

  let who = m.quoted? m.quoted.sender : null
  if (!who) return m.reply(`Silakan reply pesan orang yang ingin kamu bunuh!`)
  if (who === m.sender) return m.reply('❌ Tidak bisa membunuh diri sendiri.')

  // CEK GUILD
  let myGuild = Object.values(wdb.guilds || {}).find(g => g.members.includes(m.sender))
  let targetGuild = Object.values(wdb.guilds || {}).find(g => g.members.includes(who))
  if(myGuild && targetGuild && myGuild.name === targetGuild.name){
    return m.reply('❌ Sesama anggota guild tidak bisa saling membunuh!')
  }

  let dataTarget = getUserRPG(wdb, who)
  let target = dataTarget.rpg
  if(!target) return m.reply('❌ Target belum punya data RPG.')

  if(!target.maxDarahBonus) target.maxDarahBonus = 0
  let armorTarget = target.armor || 0
  let maxHPTarget = 100 + (armorTarget * 20) + target.maxDarahBonus
  target.maxDarah = maxHPTarget
  if(!target.darah) target.darah = maxHPTarget

  if (target.darah <= 0) return m.reply('❌ Target sudah mati! Dia tidak bisa dibunuh lagi. Suruh.heal dulu')

  let targetMoney = wdb.money[who] || 0
  if (targetMoney < 1000) return m.reply('❌ Target tidak memiliki cukup uang untuk dibunuh.')

  if (!global.db.data.cooldowns[m.sender]) global.db.data.cooldowns[m.sender] = {}
  global.db.data.cooldowns[m.sender].bunuh = Date.now()

  let peluangGagal = Math.random() < 0.2

  if (peluangGagal) {
    let denda = Math.floor((wdb.money[m.sender] || 0) * 0.1)
    wdb.money[m.sender] -= denda
    wdb.money[who] += denda
    saveDB(wdb)

    let teksGagal = `❌ *PEMBUNUHAN GAGAL!*\n\n`
    teksGagal += `🔪 *Pembunuh:* @${m.sender.split('@')[0]}\n`
    teksGagal += `🎯 *Target:* @${who.split('@')[0]}\n\n`
    teksGagal += `👮 Kamu ketahuan saat beraksi!\n`
    teksGagal += `💸 Kamu membayar denda kompensasi sebesar *Rp ${denda.toLocaleString()}* ke target.`
    return conn.reply(m.chat, teksGagal, m, { mentions: [m.sender, who] })
  }

  let persen = Math.floor(Math.random() * 16) + 5
  let hasilCuri = Math.floor(targetMoney * (persen / 100))

  target.darah = 0
  wdb.money[who] -= hasilCuri
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hasilCuri

  // TRACKING CRIME - TAMBAHIN INI
  if(!wdb.crime) wdb.crime = {}
  if(!wdb.crime[m.sender]) wdb.crime[m.sender] = { rampok: 0, begal: 0, bunuh: 0, total: 0 }
  wdb.crime[m.sender].bunuh += 1
  wdb.crime[m.sender].total += 1

  saveDB(wdb)

  let teks = `💀 *PEMBUNUHAN BERHASIL*\n\n`
  teks += `🔪 *Pembunuh:* @${m.sender.split('@')[0]}\n`
  teks += `🎯 *Korban:* @${who.split('@')[0]}\n\n`
  teks += `💰 Korban kehilangan *${persen}%* uangnya.\n`
  teks += `💸 Kamu mendapatkan: *Rp ${hasilCuri.toLocaleString()}*\n\n`
  teks += `❤️ *Target HP: 0/${maxHPTarget}*\n`
  teks += `⚰️ *TARGET MATI!* Harus.heal dulu baru bisa beraktivitas`

  conn.reply(m.chat, teks, m, { mentions: [m.sender, who] })
}

handler.help = ['bunuh (reply)']
handler.tags = ['rpg']
handler.command = /^(bunuh|kill)$/i
handler.group = true

export default handler