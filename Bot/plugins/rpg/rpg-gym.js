import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.stats) user.stats = { gym: 0 }
  if(!user.cooldown) user.cooldown = {}
  if(!user.maxDarahBonus) user.maxDarahBonus = 0

  let armorLvl = user.armor || 0
  let maxHP = 100 + (armorLvl * 20) + user.maxDarahBonus

  let cooldown = 5 * 60 * 60 * 1000
  let lastGym = user.cooldown.gym || 0
  let sisa = cooldown - (Date.now() - lastGym)

  if(sisa > 0) {
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    return m.reply(`⏰ Kamu masih capek! Istirahat dulu\nCooldown: *${jam}j ${menit}m* lagi`)
  }

  const gymList = {
    'basic': { nama: 'Gym Basic', harga: 0, exp: [30, 60], darah: [5, 10], desc: 'Peralatan seadanya. Gratis' },
    'premium': { nama: 'Gym Premium', harga: 50000, exp: [60, 120], darah: [10, 20], desc: 'Alat lengkap + AC + Sauna' },
    'legend': { nama: 'Gym Legend', harga: 200000, exp: [120, 200], darah: [15, 30], desc: 'Trainer pribadi + Kolam renang' }
  }

  let pilih = (text || 'basic').toLowerCase()
  if(!gymList[pilih]) {
    let list = Object.keys(gymList).map(k => {
      let g = gymList[k]
      return `${g.nama}\n💰 Rp ${g.harga.toLocaleString()}\n✨ Exp: ${g.exp[0]}-${g.exp[1]} | ❤️ HP: +${g.darah[0]}-${g.darah[1]}\n${g.desc}`
    }).join('\n\n')
    return m.reply(`┌───❏「 🏋️ PILIH GYM 」❏\n│\n│ Cara: *.gym premium*\n│\n│ ${list}\n│\n│ ⏰ Cooldown: 5 jam\n└───────────────────`)
  }

  let gym = gymList[pilih]
  let uang = wdb.money[m.sender] || 0
  if(uang < gym.harga) return m.reply(`❌ Uang kurang buat ${gym.nama}!\nButuh: Rp ${gym.harga.toLocaleString()}`)

  if(gym.harga > 0) wdb.money[m.sender] -= gym.harga

  let hasilExp = Math.floor(Math.random() * (gym.exp[1] - gym.exp[0])) + gym.exp[0]
  let hasilDarah = Math.floor(Math.random() * (gym.darah[1] - gym.darah[0])) + gym.darah[0]
  let hasilOtot = ['💪', '🏋️', '🔥', '⚡'][Math.floor(Math.random() * 4)]

  user.maxDarahBonus += 1
  user.exp += hasilExp
  maxHP = 100 + (armorLvl * 20) + user.maxDarahBonus
  user.darah = Math.min(maxHP, (user.darah || maxHP) + hasilDarah)
  user.stats.gym++
  user.cooldown.gym = Date.now()

  let expButuh = user.level * 100
  let levelUp = false
  if(user.exp >= expButuh) {
    user.level++
    user.exp = user.exp - expButuh
    levelUp = true
  }

  saveDB(wdb)

  let cap = `┌───❏「 ${gym.nama} 」❏\n`
  cap += `│\n`
  cap += `│ ${hasilOtot} Latihan selesai!\n`
  cap += `│ 💸 Biaya: Rp ${gym.harga.toLocaleString()}\n`
  cap += `│\n`
  cap += `│ ✨ +${hasilExp} Exp\n`
  cap += `│ ❤️ +${hasilDarah} HP\n`
  cap += `│ 🏋️ +1 Max HP Permanen\n`
  cap += `│\n`
  cap += `│ Level: ${user.level} ${levelUp? '⬆️ LEVEL UP!' : ''}\n`
  cap += `│ HP: ${user.darah}/${maxHP}\n`
  cap += `│ Total Gym: ${user.stats.gym}x\n`
  cap += `│ Sisa Uang: Rp ${wdb.money[m.sender].toLocaleString()}\n`
  cap += `│\n`
  cap += `│ ⏰ Cooldown: 5 jam\n`
  cap += `└───────────────────`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [m.sender])
}

handler.help = ['gym <basic/premium/legend>']
handler.tags = ['rpg']
handler.command = /^(gym|olahraga|workout)$/i
handler.group = true
export default handler