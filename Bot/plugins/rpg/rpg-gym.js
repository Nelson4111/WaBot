import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.stats) user.stats = { gym: 0 }
  if(!user.cooldown) user.cooldown = {}
  if(!user.maxDarahBonus) user.maxDarahBonus = 0
  if(!user.gymMembership) user.gymMembership = { tier: null, expired: 0 }
  if(!user.darah) user.darah = 100

  let armorLvl = user.armor || 0
  let maxHP = 100 + (armorLvl * 20) + user.maxDarahBonus

  let cooldown = 5 * 60 * 60 * 1000 // 5 jam
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

  const membershipList = {
    'harian': { nama: 'Membership Harian', harga: 75000, hari: 1, desc: 'Akses semua gym 1 hari' },
    'mingguan': { nama: 'Membership Mingguan', harga: 400000, hari: 7, desc: 'Akses semua gym 7 hari' },
    'bulanan': { nama: 'Membership Bulanan', harga: 1200000, hari: 30, desc: 'Akses semua gym 30 hari + Bonus 10% Exp' }
  }

  let args = text?.toLowerCase().split(' ') || []
  let action = args[0]

  // MENU MEMBERSHIP
  if(action === 'membership' || action === 'member') {
    let pilihMember = args[1]
    if(!pilihMember) {
      let punya = user.gymMembership.tier
      let sisaHari = Math.max(0, Math.ceil((user.gymMembership.expired - Date.now()) / 86400000))
      let cap = `┌───❏「 🎟️ GYM MEMBERSHIP 」❏\n`
      cap += `│\n`
      if(punya && Date.now() < user.gymMembership.expired) {
        cap += `│ Status: *${membershipList[punya].nama}* ✅\n`
        cap += `│ Sisa: *${sisaHari} hari*\n`
        cap += `│ Bonus: Gratis masuk semua gym\n`
        if(punya === 'bulanan') cap += `│ Bonus: +10% Exp\n`
      } else {
        cap += `│ Status: *Tidak Aktif* ❌\n`
      }
      cap += `│\n`
      Object.keys(membershipList).forEach(k => {
        let mem = membershipList[k]
        cap += `│ ${mem.nama}\n`
        cap += `│ 💰 Rp ${mem.harga.toLocaleString()}\n`
        cap += `│ ${mem.desc}\n\n`
      })
      cap += `│ Cara beli: *.gym membership harian*\n`
      cap += `└───────────────────`
      return m.reply(cap)
    }

    if(!membershipList[pilihMember]) return m.reply('❌ Paket tidak ada')
    let paket = membershipList[pilihMember]
    let uang = wdb.money[m.sender] || 0
    if(uang < paket.harga) return m.reply(`❌ Uang kurang!\nButuh: Rp ${paket.harga.toLocaleString()}`)

    wdb.money[m.sender] -= paket.harga
    user.gymMembership.tier = pilihMember
    user.gymMembership.expired = Date.now() + (paket.hari * 86400000)
    saveDB(wdb)

    return m.reply(`🎉 *MEMBERSHIP AKTIF!*\n${paket.nama}\nBerlaku: ${paket.hari} hari\nSekarang semua gym GRATIS!`)
  }

  // MENU GYM
  if(!action ||!gymList[action]) {
    let punya = user.gymMembership.tier
    let aktif = punya && Date.now() < user.gymMembership.expired
    let list = Object.keys(gymList).map(k => {
      let g = gymList[k]
      let harga = aktif? 'GRATIS' : `Rp ${g.harga.toLocaleString()}`
      return `${g.nama}\n💰 ${harga}\n✨ Exp: ${g.exp[0]}-${g.exp[1]} | ❤️ HP: +${g.darah[0]}-${g.darah[1]}\n${g.desc}`
    }).join('\n\n')
    return m.reply(`┌───❏「 🏋️ PILIH GYM 」❏\n│\n│ Cara: *.gym premium*\n│ Cara Member: *.gym membership*\n│\n│ ${list}\n│\n│ ⏰ Cooldown: 5 jam\n└───────────────────`)
  }

  let gym = gymList[action]
  let punyaMember = user.gymMembership.tier && Date.now() < user.gymMembership.expired
  let uang = wdb.money[m.sender] || 0
  let biaya = punyaMember? 0 : gym.harga

  if(uang < biaya) return m.reply(`❌ Uang kurang buat ${gym.nama}!\nButuh: Rp ${biaya.toLocaleString()}`)

  if(biaya > 0) wdb.money[m.sender] -= biaya

  let hasilExp = Math.floor(Math.random() * (gym.exp[1] - gym.exp[0])) + gym.exp[0]
  let hasilDarah = Math.floor(Math.random() * (gym.darah[1] - gym.darah[0])) + gym.darah[0]
  let hasilOtot = ['💪', '🏋️', '🔥', '⚡'][Math.floor(Math.random() * 4)]

  // BONUS EXP 10% KALO MEMBER BULAN
  if(user.gymMembership.tier === 'bulanan') hasilExp = Math.floor(hasilExp * 1.1)

  user.maxDarahBonus += 1 // +1 Max HP Permanen
  user.exp += hasilExp
  maxHP = 100 + (armorLvl * 20) + user.maxDarahBonus // update maxHP baru
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
  cap += `│ 💸 Biaya: ${biaya === 0? 'GRATIS (Member)' : `Rp ${biaya.toLocaleString()}`}\n`
  if(punyaMember) cap += `│ 🎟️ Member: ${membershipList[user.gymMembership.tier].nama}\n`
  cap += `│\n`
  cap += `│ ✨ +${hasilExp} Exp ${user.gymMembership.tier === 'bulanan'? '(+10% Bonus)' : ''}\n`
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

handler.help = ['gym <basic/premium/legend>', 'gym membership']
handler.tags = ['rpg']
handler.command = /^(gym|olahraga|workout)$/i
handler.group = true
export default handler
