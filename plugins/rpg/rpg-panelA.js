import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { hewanList, getHewan } from '../../lib/rpg-libternakData.js'
import { BANK_TIERS } from './rpg-bank.js'
import fs from 'fs'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, text, usedPrefix, isOwner }) => {
  if (!isOwner) return m.reply('❌ Fitur khusus Owner')

  const wdb = loadDB()
  wdb.guilds = wdb.guilds || {}
  wdb.crime = wdb.crime || {}
  wdb.users = wdb.users || {}
  wdb.money = wdb.money || {}

  let [aksi, target,...args] = text.split(' ')

  if (!aksi) return m.reply(`❌ Ketik *${usedPrefix}rpgpanelmenu* untuk lihat daftar command`)

  // VALIDASI TARGET
  let who = m.mentionedJid[0]
  if(!who && target) who = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if(!who) return m.reply(`❌ Tag user atau masukin nomor\nContoh: *${usedPrefix}rpgpanel setlevel @user 100*`)

  // INISIALISASI WAJIB BIAR GA RESET
  if(!wdb.users[who]) wdb.users[who] = {}
  if(!wdb.users[who].rpg) wdb.users[who].rpg = {}
  if(!wdb.money[who]) wdb.money[who] = 0

  let user = wdb.users[who].rpg
  user.inventory = user.inventory || {}
  user.ikan = user.ikan || {}
  user.ores = user.ores || {}
  user.items = user.items || {}
  user.masakan = user.masakan || {}
  user.pets = user.pets || []
  user.ternak = user.ternak || {}
  user.dapur = user.dapur || {slot:1, antrian:[]}
  user.bank = user.bank || 0
  user.bankTier = user.bankTier || 0
  user.riwayat = user.riwayat || []
  user.pinjaman = user.pinjaman || {jumlah:0,waktu:0}
  user.kartuBeku = user.kartuBeku || false
  user.lastkerja = user.lastkerja || 0
  user.maxDarahBonus = user.maxDarahBonus || 0
  user.darah = user.darah || 100
  user.level = user.level || 1
  user.exp = user.exp || 0
  user.gold = user.gold || 0
  user.diamond = user.diamond || 0
  user.iron = user.iron || 0
  user.stone = user.stone || 0
  user.wood = user.wood || 0
  user.limit = user.limit || 0
  user.armor = user.armor || 0
  user.sword = user.sword || 0
  user.pickaxe = user.pickaxe || 0
  user.fishingrod = user.fishingrod || 0
  user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus

  let jumlah = parseInt(args[0]) || 0
  let itemInput = args[1]
  let item = itemInput?.toLowerCase().replace(/ /g, '_')

  // 1. SET STAT
  if(['setmoney','setlevel','setexp','setdarah','setdiamond','setiron','setgold','setstone','setwood','setmaxhp','setarmor','setsword','setpickaxe','setfishingrod'].includes(aksi)){
    if(jumlah < 0) return m.reply('❌ Jumlah tidak boleh minus')

    if(aksi === 'setmoney') wdb.money[who] = jumlah
    else if(aksi === 'setmaxhp') user.maxDarahBonus = jumlah
    else user[aksi.replace('set','')] = jumlah

    // auto recalc kalau set level/armor/maxhp
    if(['setlevel','setarmor','setmaxhp'].includes(aksi)){
      user.exp = 0
      user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
      user.darah = user.maxDarah
    }
    saveDB(wdb)
    return m.reply(`✅ *SET ${aksi.toUpperCase().replace('SET','')}*\n@${who.split('@')[0]} = ${jumlah.toLocaleString()}`, null, {mentions: [who]})
  }

  // 2. ADD STAT
  if(['addmoney','addlevel','addexp','adddarah','adddiamond','addiron','addgold','addstone','addwood'].includes(aksi)){
    if(jumlah < 1) return m.reply('❌ Jumlah minimal 1')

    if(aksi === 'addmoney') wdb.money[who] += jumlah
    else if(aksi === 'adddarah') user.darah = Math.min(user.maxDarah, user.darah + jumlah)
    else if(aksi === 'addlevel'){
      user.level += jumlah
      user.exp = 0
      user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
      user.darah = user.maxDarah
    }
    else if(aksi === 'addexp'){
      user.exp += jumlah
      // auto level up
      while(user.exp >= user.level * 500){
        user.exp -= user.level * 500
        user.level++
        user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
        user.darah = user.maxDarah
      }
    }
    else user[aksi.replace('add','')] += jumlah

    saveDB(wdb)
    let total = aksi === 'addmoney'? wdb.money[who] : user[aksi.replace('add','')]
    return m.reply(`✅ *TAMBAH ${aksi.toUpperCase().replace('ADD','')}*\n@${who.split('@')[0]} +${jumlah.toLocaleString()}\nTotal: ${total.toLocaleString()}`, null, {mentions: [who]})
  }

  // 3. GUDANG
  if(['add','del','wipe','cek'].includes(aksi)){
    if(aksi === 'add'){
      if(!itemInput || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel add @user diamond 5*`)
      let kat = 'inventory'
      if(user.ikan[item]!== undefined) kat = 'ikan'
      else if(user.ores[item]!== undefined) kat = 'ores'
      else if(user.items[item]!== undefined) kat = 'items'
      else if(user.masakan[item]!== undefined) kat = 'masakan'

      user[kat][item] = (user[kat][item] || 0) + jumlah
      saveDB(wdb)
      return m.reply(`✅ *TAMBAH ITEM*\n@${who.split('@')[0]}\n${formatNama(item)} +${jumlah}\nTotal: ${user[kat][item]}`, null, {mentions: [who]})
    }
    if(aksi === 'del'){
      if(!itemInput || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel del @user diamond 5*`)
      let kat = 'inventory'
      if(user.ikan[item]!== undefined) kat = 'ikan'
      else if(user.ores[item]!== undefined) kat = 'ores'
      else if(user.items[item]!== undefined) kat = 'items'
      else if(user.masakan[item]!== undefined) kat = 'masakan'
      if(!user[kat][item]) return m.reply(`❌ Tidak punya ${formatNama(item)}`, null, {mentions: [who]})
      user[kat][item] = Math.max(0, user[kat][item] - jumlah)
      if(user[kat][item] <= 0) delete user[kat][item]
      saveDB(wdb)
      return m.reply(`✅ *HAPUS ITEM*\n@${who.split('@')[0]}\n${formatNama(item)} -${jumlah}`, null, {mentions: [who]})
    }
    if(aksi === 'wipe'){ user.inventory = {}; user.ikan = {}; user.ores = {}; user.items = {}; user.masakan = {}; saveDB(wdb); return m.reply(`🧹 *WIPE GUDANG*\n@${who.split('@')[0]}`, null, {mentions: [who]}) }
    if(aksi === 'cek'){ let allItems = {...user.inventory,...user.ikan,...user.ores,...user.items,...user.masakan}; if(Object.keys(allItems).length === 0) return m.reply(`🏚️ Gudang kosong`, null, {mentions: [who]}); let sorted = Object.entries(allItems).sort((a,b) => b[1] - a[1]); let cap = `*───「 📦 GUDANG @${who.split('@')[0]} 」───*\n`; sorted.forEach(([n,j]) => cap += `├ ${formatNama(n)} x${j.toLocaleString()}\n`); return conn.reply(m.chat, cap, m, {mentions: [who]}) }
  }

  // 4. INVENTORY CEK
  if(aksi === 'inv'){
    let threshold = user.level * 500
    let cap = `*───「 INVENTORY @${who.split('@')[0]} 」───*\n\n`
    cap += `🆙 *Level:* ${user.level} (${user.exp}/${threshold} XP)\n`
    cap += `❤️ *Darah:* ${user.darah}/${user.maxDarah}\n`
    cap += `💰 *Saldo:* Rp ${wdb.money[who].toLocaleString()}\n\n`
    cap += `*EQUIPMENT*\n🗡️ Sword: Lv.${user.sword}\n🛡️ Armor: Lv.${user.armor}\n⛏️ Pickaxe: Lv.${user.pickaxe}\n🎣 Fishingrod: Lv.${user.fishingrod}\n\n`
    cap += `*STORAGE*\n💎 Diamond: ${user.diamond}\n⛓️ Iron: ${user.iron}\n✨ Gold: ${user.gold}\n🪵 Wood: ${user.wood}\n🪨 Stone: ${user.stone}`
    return conn.reply(m.chat, cap, m, {mentions: [who]})
  }

  // 5. HEAL
  if(aksi === 'heal'){
    let butuhHP = user.maxDarah - user.darah
    if(butuhHP <= 0) return m.reply(`❤️ Darah sudah penuh!`, null, {mentions: [who]})
    let biaya = butuhHP * 1000
    let tier = BANK_TIERS[user.bankTier || 0]
    let asuransi = tier.asuransi || 0
    let biayaBayar = Math.floor(biaya * (1 - asuransi))
    if (wdb.money[who] >= biayaBayar) { wdb.money[who] -= biayaBayar }
    else if (user.bank >= biayaBayar &&!user.kartuBeku) { user.bank -= biayaBayar }
    else { return m.reply(`❌ Uang tidak cukup! Butuh Rp ${biayaBayar.toLocaleString()}`, null, {mentions: [who]}) }
    user.darah = user.maxDarah
    saveDB(wdb)
    return m.reply(`*───「 HEAL SUCCESS 」───*\n\n@${who.split('@')[0]}\n🏥 HP: ${user.darah}/${user.maxDarah}\n💸 Bayar: Rp ${biayaBayar.toLocaleString()}`, null, {mentions: [who]})
  }

  m.reply(`❌ Command tidak ada.\n\n*Contoh:*\n.setlevel @user 100\n.addlevel @user 5\n.setexp @user 10000\n.addexp @user 500`)
}

handler.help = ['rpgpanel']
handler.tags = ['owner']
handler.command = /^(rpgpanel|rpgowner)$/i
handler.owner = true
handler.group = true
export default handler