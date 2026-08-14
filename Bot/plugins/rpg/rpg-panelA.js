import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { hewanList, getHewan } from '../../lib/rpg-libternakData.js'
import { BANK_TIERS } from './bank.js'
import fs from 'fs'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, text, usedPrefix, isOwner }) => {
  if (!isOwner) return m.reply('❌ Fitur khusus Owner')

  const wdb = loadDB()
  wdb.guilds = wdb.guilds || {}
  wdb.crime = wdb.crime || {}
  let [aksi, target,...args] = text.split(' ')

  const petsList = {'lalat':'🪰','nyamuk':'🦟','semut':'🐜','tikus':'🐭','kucing':'🐱','anjing':'🐶','serigala':'🐺','singa':'🦁','harimau':'🐅','naga':'🐉','robot':'🤖','jin':'🧞','ghost':'👻','vampir':'🧛','zombie':'🧟','alien':'👽','phoenix':'🔥','unicorn':'🦄','rubah':'🦊'}
  const upgradeable = ['sword', 'armor', 'pickaxe', 'fishingrod']
  const basePrice = {
    sword: { money: 50000, iron: 10, stone: 5, wood: 0, gold: 5 },
    armor: { money: 40000, iron: 15, stone: 10, wood: 0, gold: 8 },
    pickaxe: { money: 30000, iron: 10, stone: 0, wood: 15, gold: 3 },
    fishingrod: { money: 35000, iron: 5, stone: 0, wood: 20, gold: 4 }
  }
  const listJobs = [
    { lv: 1, job: "Pemulung", gaji: 5000 }, { lv: 10, job: "Satpam", gaji: 210000 },
    { lv: 50, job: "Admin Kantor", gaji: 2295000 }, { lv: 100, job: "Supervisor", gaji: 5092000 },
    { lv: 200, job: "Tentara", gaji: 12500000 }, { lv: 300, job: "Manager", gaji: 20000000 },
    { lv: 600, job: "Pilot", gaji: 42500000 }, { lv: 1000, job: "Gamer Profesional", gaji: 66000000 },
    { lv: 1600, job: "CEO Perusahaan", gaji: 93000000 }, { lv: 2000, job: "Gubernur", gaji: 99500000 },
    { lv: 2500, job: "CEO", gaji: 100000 }
  ].map(j => ({...j, exp: Math.floor(j.gaji / 1000) }))

  if (!aksi) return m.reply(`❌ Ketik *${usedPrefix}rpgpanelmenu* untuk lihat daftar command`)

  let who = m.mentionedJid[0] || target?.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  let user = who && wdb.users[who]?.rpg? wdb.users[who].rpg : null
  if(who &&!wdb.users[who]) return m.reply('❌ Target belum punya data RPG')
  if(user){
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
  }

  let itemInput = args[0]
  let jumlah = parseInt(args[1]) || 1
  let item = itemInput?.toLowerCase().replace(/ /g, '_')

  const getKategori = (item) => {
    if(!user) return 'inventory'
    if(user.inventory[item]!== undefined) return 'inventory'
    if(user.ikan[item]!== undefined) return 'ikan'
    if(user.ores[item]!== undefined) return 'ores'
    if(user.items[item]!== undefined) return 'items'
    if(user.masakan[item]!== undefined) return 'masakan'
    if(['wood','stone','iron','gold','diamond','emas'].includes(item)) return 'inventory'
    if(['grass','copper','silver','platinum','uranium'].includes(item)) return 'ores'
    if(['tulang','pedang_legendaris','jiwa_abadi'].includes(item)) return 'items'
    return 'inventory'
  }

  // 1. GUDANG
  if(['add','del','wipe','cek'].includes(aksi) && who &&!aksi.includes('wanted')){
    if(aksi === 'add'){ let kat = getKategori(item); user[kat][item] = (user[kat][item] || 0) + jumlah; saveDB(wdb); return m.reply(`✅ *TAMBAH ITEM*\n@${who.split('@')[0]}\n${formatNama(item)} x${jumlah}`, null, {mentions: [who]}) }
    if(aksi === 'del'){ let kat = getKategori(item); if(!user[kat][item]) return m.reply(`❌ Tidak punya ${formatNama(item)}`, null, {mentions: [who]}); user[kat][item] -= jumlah; if(user[kat][item] <= 0) delete user[kat][item]; saveDB(wdb); return m.reply(`✅ *HAPUS ITEM*\n@${who.split('@')[0]}\n${formatNama(item)} x${jumlah}`, null, {mentions: [who]}) }
    if(aksi === 'wipe'){ user.inventory = {}; user.ikan = {}; user.ores = {}; user.items = {}; user.masakan = {}; saveDB(wdb); return m.reply(`🧹 *WIPE GUDANG*\n@${who.split('@')[0]}`, null, {mentions: [who]}) }
    if(aksi === 'cek'){ let allItems = {...user.inventory,...user.ikan,...user.ores,...user.items,...user.masakan}; if(Object.keys(allItems).length === 0) return m.reply(`🏚️ Gudang kosong`, null, {mentions: [who]}); let sorted = Object.entries(allItems).sort((a,b) => b[1] - a[1]); let cap = `*───「 📦 GUDANG @${who.split('@')[0]} 」───*\n`; sorted.forEach(([n,j]) => cap += `├ ${formatNama(n)} x${j.toLocaleString()}\n`); return conn.reply(m.chat, cap, m, {mentions: [who]}) }
  }

  // 2. USER STAT
  if(['money','level','advlvl','darah','sword','armor','pickaxe','fishingrod','diamond','exp','maxhp'].includes(aksi) && who){
    if(aksi === 'money') wdb.money[who] = jumlah
    else if(aksi === 'maxhp') user.maxDarahBonus = jumlah
    else user[aksi] = jumlah
    if(aksi === 'level' || aksi === 'armor' || aksi === 'maxhp'){ user.exp = 0; user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus; user.darah = user.maxDarah }
    saveDB(wdb)
    return m.reply(`✅ *SET ${aksi.toUpperCase()}*\n@${who.split('@')[0]} = ${jumlah}`, null, {mentions: [who]})
  }

  // 3. KERJA
  if(aksi === 'kerjareset' && who){ user.lastkerja = 0; saveDB(wdb); return m.reply(`⏰ *COOLDOWN KERJA DIRESET*\n@${who.split('@')[0]}`, null, {mentions: [who]}) }
  if(aksi === 'kerjagaji' && who){ let availableJobs = listJobs.filter(j => user.level >= j.lv); if (availableJobs.length === 0) return m.reply('❌ Level terlalu rendah'); let selected = availableJobs[availableJobs.length - 1]; wdb.money[who] = (wdb.money[who] || 0) + selected.gaji; user.exp += selected.exp; user.lastkerja = Date.now(); if (user.exp >= user.level * 500) { user.level++; user.exp = 0 }; saveDB(wdb); return m.reply(`💼 *KERJA PAKSA*\n@${who.split('@')[0]}\nJob: ${selected.job}\n+Rp ${selected.gaji.toLocaleString()}\n+${selected.exp} XP`, null, {mentions: [who]}) }
  if(aksi === 'kerjalevel' && who){ user.level = jumlah; user.exp = 0; saveDB(wdb); let availableJobs = listJobs.filter(j => user.level >= j.lv); let selected = availableJobs[availableJobs.length - 1]; return m.reply(`📊 *SET LEVEL KERJA*\n@${who.split('@')[0]}\nLv: ${jumlah}\nJob Terbuka: ${selected.job}`, null, {mentions: [who]}) }

  // 4. HEAL
  if(aksi === 'heal' && who){
    let armorLvl = user.armor || 0
    let maxHP = 100 + (armorLvl * 20) + user.maxDarahBonus
    if (user.darah >= maxHP) return m.reply(`❤️ Darah sudah penuh! (*${user.darah}/${maxHP} HP*)`, null, {mentions: [who]})
    let butuhHP = maxHP - user.darah
    let biaya = butuhHP * 1000
    let tier = BANK_TIERS[user.bankTier || 0]
    let asuransi = tier.asuransi || 0
    let biayaBayar = Math.floor(biaya * (1 - asuransi))
    if ((wdb.money[who] || 0) >= biayaBayar) { wdb.money[who] -= biayaBayar }
    else if (user.bank >= biayaBayar &&!user.kartuBeku) { user.bank -= biayaBayar; user.riwayat.unshift(`-Rp ${biayaBayar.toLocaleString()} Biaya Heal`) }
    else { return m.reply(`❌ Uang tidak cukup! \n❤️ Butuh: +${butuhHP} HP\n💰 Biaya: Rp ${biaya.toLocaleString()}\n💸 Bayar: Rp ${biayaBayar.toLocaleString()}`, null, {mentions: [who]}) }
    user.darah = maxHP
    saveDB(wdb)
    return m.reply(`*───「 HEAL SUCCESS 」───*\n\n@${who.split('@')[0]}\n🏥 Status: Pulih Total!\n❤️ HP: ${user.darah}/${maxHP}\n💸 Bayar: Rp ${biayaBayar.toLocaleString()}`, null, {mentions: [who]})
  }

  // 5. DAPUR
  if(aksi === 'dapurup' && who){ if(user.dapur.slot >= 10) return m.reply('❌ Dapur sudah mentok Lv 10'); let harga = user.dapur.slot * 5000000; if((wdb.money[who] || 0) < harga) return m.reply(`❌ Uang kurang! Butuh Rp ${harga.toLocaleString()}`); wdb.money[who] -= harga; user.dapur.slot += 1; saveDB(wdb); return m.reply(`✅ *DAPUR DIUPGRADE*\n@${who.split('@')[0]}\nSlot: ${user.dapur.slot}/10\nBiaya: Rp ${harga.toLocaleString()}`, null, {mentions: [who]}) }
  if(aksi === 'dapurset' && who){ user.dapur.slot = Math.min(10, Math.max(1, jumlah)); saveDB(wdb); return m.reply(`✅ *SET DAPUR SLOT*\n@${who.split('@')[0]} = ${user.dapur.slot}/10`, null, {mentions: [who]}) }

  // 6. UPGRADE
  let upItem = args[0]?.toLowerCase()
  if(aksi === 'up' && who){
    if(!upgradeable.includes(upItem)) return m.reply(`❌ Item: sword, armor, pickaxe, fishingrod`)
    if(!user[upItem] || user[upItem] < 1) return m.reply(`❌ Belum punya ${upItem.toUpperCase()}`)
    let lvl = user[upItem]
    let multiplier = Math.pow(2, lvl - 1)
    let totalMoney = basePrice[upItem].money * multiplier
    let totalIron = basePrice[upItem].iron * multiplier
    let totalStone = basePrice[upItem].stone * multiplier
    let totalWood = basePrice[upItem].wood * multiplier
    let totalGold = (basePrice[upItem].gold || 0) * multiplier
    let totalDiamond = lvl >= 7? (lvl - 5) : 0
    if ((wdb.money[who] || 0) < totalMoney) return m.reply(`❌ Uang kurang!`)
    if ((user.iron || 0) < totalIron) return m.reply(`❌ Iron kurang!`)
    if ((user.stone || 0) < totalStone) return m.reply(`❌ Stone kurang!`)
    if ((user.wood || 0) < totalWood) return m.reply(`❌ Wood kurang!`)
    if ((user.gold || 0) < totalGold) return m.reply(`❌ Gold kurang!`)
    if ((user.diamond || 0) < totalDiamond) return m.reply(`❌ Diamond kurang!`)
    wdb.money[who] -= totalMoney; user.iron -= totalIron; user.stone -= totalStone; user.wood -= totalWood; user.gold -= totalGold; user.diamond -= totalDiamond
    user[upItem] += 1
    if (upItem === 'armor') { user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus; user.darah = user.maxDarah }
    saveDB(wdb)
    return m.reply(`✅ *UPGRADE BERHASIL*\n@${who.split('@')[0]}\n${upItem.toUpperCase()} Lv.${user[upItem]}\n-Rp ${totalMoney.toLocaleString()}`, null, {mentions: [who]})
  }
  if(aksi === 'uplvl' && who){ user[upItem] = jumlah; if(upItem === 'armor'){ user.maxDarah = 100 + (jumlah * 20) + user.maxDarahBonus; user.darah = user.maxDarah }; saveDB(wdb); return m.reply(`✅ *SET ${upItem.toUpperCase()} LV*\n@${who.split('@')[0]} = Lv ${jumlah}`, null, {mentions: [who]}) }

  // 7. INVENTORY
  if(aksi === 'inv' && who){
    let threshold = user.level * 500
    let armorLvl = user.armor || 0
    let maxHP = 100 + (armorLvl * 20) + user.maxDarahBonus
    let petTertinggi = user.pets && user.pets.length > 0? user.pets.sort((a,b) => b.level - a.level)[0] : null
    let cap = `*───「 INVENTORY @${who.split('@')[0]} 」───*\n\n`
    cap += `🆙 *Level:* ${user.level} (${user.exp}/${threshold} XP)\n`
    cap += `❤️ *Darah:* ${user.darah}/${maxHP}\n`
    cap += `💰 *Saldo:* Rp ${(wdb.money[who] || 0).toLocaleString()}\n\n`
    cap += `*EQUIPMENT*\n🗡️ Sword: Lv.${user.sword || 0}\n🛡️ Armor: Lv.${user.armor || 0}\n⛏️ Pickaxe: Lv.${user.pickaxe || 0}\n🎣 Fishingrod: Lv.${user.fishingrod || 0}\n🐾 Pet: ${petTertinggi? `${petTertinggi.tipe.toUpperCase()} Lv.${petTertinggi.level}` : 'Tidak ada'}\n\n`
    cap += `*STORAGE*\n💎 Diamond: ${user.diamond || 0}\n⛓️ Iron: ${user.iron || 0}\n✨ Gold: ${user.gold || 0}\n🪵 Wood: ${user.wood || 0}\n🪨 Stone: ${user.stone || 0}\n🏠 Dapur Slot: ${user.dapur.slot}/10`
    return conn.reply(m.chat, cap, m, {mentions: [who]})
  }

  // 8. PET
  let petName = args[0]?.toLowerCase().replace(/ /g, '_').replace(/-/g, '_')
  if(aksi === 'petadd' && who){ if(!petsList[petName]) return m.reply(`❌ Pet tidak ada`); if(user.pets.find(p => p.tipe === petName)) return m.reply('❌ Sudah punya pet itu'); user.pets.push({ tipe: petName, level: 1, exp: 0, energy: 100, happy: 50, dirty: 0, lastFeed: 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true }); saveDB(wdb); return m.reply(`✅ *PET DITAMBAH*\n@${who.split('@')[0]}\n${petsList[petName]} ${formatNama(petName)}`, null, {mentions: [who]}) }
  if(aksi === 'petdel' && who){ let index = user.pets.findIndex(p => p.tipe === petName); if(index === -1) return m.reply('❌ Tidak punya pet itu'); user.pets.splice(index, 1); saveDB(wdb); return m.reply(`💔 *PET DIHAPUS*\n@${who.split('@')[0]}\n${formatNama(petName)}`, null, {mentions: [who]}) }
  if(aksi === 'petlvl' && who){ let lvl = parseInt(args[1]) || 1; let pet = user.pets.find(p => p.tipe === petName); if(!pet) return m.reply('❌ Tidak punya pet itu'); pet.level = lvl; pet.exp = 0; saveDB(wdb); return m.reply(`📈 *SET PET LEVEL*\n@${who.split('@')[0]}\n${formatNama(petName)} = Lv ${lvl}`, null, {mentions: [who]}) }

  // 9. TERNAK
  let hewanName = args[0]?.toLowerCase().replace(/ /g, '_')
  if(aksi === 'ternakadd' && who){ let h = getHewan(hewanName); if(!h) return m.reply('❌ Hewan tidak ada'); user.ternak[hewanName] = (user.ternak[hewanName] || 0) + jumlah; saveDB(wdb); return m.reply(`✅ *TERNAK DITAMBAH*\n@${who.split('@')[0]}\n${h.emoji} ${h.nama} x${jumlah}`, null, {mentions: [who]}) }
  if(aksi === 'ternakdel' && who){ let h = getHewan(hewanName); if(!h ||!user.ternak[hewanName]) return m.reply('❌ Tidak punya hewan itu'); user.ternak[hewanName] -= jumlah; if(user.ternak[hewanName] <= 0) delete user.ternak[hewanName]; saveDB(wdb); return m.reply(`✅ *TERNAK DIHAPUS*\n@${who.split('@')[0]}\n${h.emoji} ${h.nama} x${jumlah}`, null, {mentions: [who]}) }
  if(aksi === 'ternakwipe' && who){ user.ternak = {}; saveDB(wdb); return m.reply(`🧹 *KANDANG DIWIPE*\n@${who.split('@')[0]}`, null, {mentions: [who]}) }
  if(aksi === 'ternakcek' && who){ if(Object.keys(user.ternak).length === 0) return m.reply(`🏡 Kandang kosong`, null, {mentions: [who]}); let txt = `*───「 🏡 KANDANG @${who.split('@')[0]} 」───*\n`; for(let h in user.ternak) { let data = getHewan(h); if(data) txt += `├ ${data.emoji} ${data.nama} [E${data.evolusi}]: ${user.ternak[h]}\n` }; return conn.reply(m.chat, txt, m, {mentions: [who]}) }
  if(aksi === 'hybradd'){ let [baru, h1, h2] = args; if(!baru ||!h1 ||!h2) return m.reply(`Contoh: ${usedPrefix}rpgpanel hybradd nagasapi naga sapi`); let d1 = getHewan(h1), d2 = getHewan(h2); if(!d1 ||!d2) return m.reply('❌ Hewan induk tidak ada'); hewanList[baru] = { nama: formatNama(baru), emoji: '🧬', evolusi: Math.min(Math.max(d1.evolusi, d2.evolusi) + 1, 7), hargaBibit: 0, exp: d1.exp + d2.exp }; saveDB(wdb); return m.reply(`🧬 *HYBRID DITAMBAH*\n${formatNama(baru)} [E${hewanList[baru].evolusi}]\nDari: ${d1.nama} x ${d2.nama}`) }

  // 10. GUILD
  let guildName = args.join(' ')
  if(aksi === 'guildadd' && who){ let guild = Object.values(wdb.guilds).find(g => g.name.toLowerCase() === guildName.toLowerCase()); if(!guild) return m.reply('❌ Guild tidak ada'); if(guild.members.includes(who)) return m.reply('❌ Sudah di guild itu'); guild.members.push(who); guild.contribution[who] = 0; saveDB(wdb); return m.reply(`✅ *DITAMBAH KE GUILD*\n@${who.split('@')[0]} → ${guild.name}`, null, {mentions: [who]}) }
  if(aksi === 'guildkick' && who){ let guild = Object.values(wdb.guilds).find(g => g.members.includes(who)); if(!guild) return m.reply('❌ Tidak di guild manapun'); guild.members = guild.members.filter(j => j!== who); delete guild.contribution[who]; wdb.users[who].rpg.lastGuildCooldown = Date.now(); wdb.users[who].rpg.lastGuildCooldownType = 'kick'; saveDB(wdb); return m.reply(`👢 *DIKICK DARI GUILD*\n@${who.split('@')[0]} dari ${guild.name}`, null, {mentions: [who]}) }
  if(aksi === 'guilddel'){ if(!wdb.guilds[guildName]) return m.reply('❌ Guild tidak ada'); delete wdb.guilds[guildName]; saveDB(wdb); return m.reply(`🗑️ *GUILD DIHAPUS*\n${guildName}`) }
  if(aksi === 'guildlvl'){ let lvl = parseInt(args[1]) || 1; if(!wdb.guilds[guildName]) return m.reply('❌ Guild tidak ada'); wdb.guilds[guildName].level = lvl; saveDB(wdb); return m.reply(`📊 *SET GUILD LEVEL*\n${guildName} = Lv ${lvl}`) }
  if(aksi === 'guildexp'){ let exp = parseInt(args[1]) || 0; if(!wdb.guilds[guildName]) return m.reply('❌ Guild tidak ada'); wdb.guilds[guildName].exp = exp; saveDB(wdb); return m.reply(`✨ *SET GUILD EXP*\n${guildName} = ${exp.toLocaleString()}`) }
  if(aksi === 'setcontrib' && who){ let [namaGuild, jml] = args; let g = wdb.guilds[namaGuild]; if(!g) return m.reply('❌ Guild tidak ada'); if(!g.members.includes(who)) return m.reply('❌ Target bukan member guild'); g.contribution[who] = parseInt(jml) || 0; saveDB(wdb); return m.reply(`📊 *SET KONTRIBUSI*\n@${who.split('@')[0]} di ${namaGuild} = ${jml}`, null, {mentions: [who]}) }
  if(aksi === 'guildbuff'){ let [gName, buff, durasi] = args; let time = durasi === '1h'? 60*60*1000 : 24*60*60*1000; if(!wdb.guilds[gName]) return m.reply('❌ Guild tidak ada'); wdb.guilds[gName][`buff${buff.charAt(0).toUpperCase() + buff.slice(1)}`] = Date.now() + time; saveDB(wdb); return m.reply(`⚡ *GUILD BUFF AKTIF*\n${gName} → ${buff} selama ${durasi}`) }

  // 11. BANK
  if(aksi === 'bank' && who){ user.bank = jumlah; user.riwayat.unshift(`+Rp ${jumlah.toLocaleString()} Owner Set`); saveDB(wdb); return m.reply(`🏦 *SET SALDO BANK*\n@${who.split('@')[0]} = Rp ${jumlah.toLocaleString()}`, null, {mentions: [who]}) }
  if(aksi === 'banktier' && who){ let tier = parseInt(args[0]); if(tier < 0 || tier > 14) return m.reply('❌ Tier 0-14'); user.bankTier = tier; user.riwayat.unshift(`⬆️ Upgrade ke ${BANK_TIERS[tier].name} oleh Owner`); saveDB(wdb); return m.reply(`💳 *SET BANK TIER*\n@${who.split('@')[0]} = ${BANK_TIERS[tier].color} ${BANK_TIERS[tier].name}`, null, {mentions: [who]}) }
  if(aksi === 'bankunfreeze' && who){ user.kartuBeku = false; user.lastMembership = Date.now(); saveDB(wdb); return m.reply(`✅ *KARTU DIUNFREEZE*\n@${who.split('@')[0]}`, null, {mentions: [who]}) }

  // 12. WANTED SYSTEM
  if(!wdb.crime) wdb.crime = {}
  if(who &&!wdb.crime[who]) wdb.crime[who] = {total:0, rampok:0, begal:0, bunuh:0}
  if(aksi === 'wantedadd' && who){ let jenis = args[0]?.toLowerCase(); let jml = parseInt(args[1]) || 1; if(!['rampok','begal','bunuh'].includes(jenis)) return m.reply('❌ Jenis: rampok, begal, bunuh'); wdb.crime[who][jenis] += jml; wdb.crime[who].total += jml; saveDB(wdb); return m.reply(`🚨 *BURONAN DITAMBAH*\n@${who.split('@')[0]}\n${jenis} +${jml}\nTotal: ${wdb.crime[who].total}`, null, {mentions: [who]}) }
  if(aksi === 'wanteddel' && who){ let jenis = args[0]?.toLowerCase(); let jml = parseInt(args[1]) || 1; if(!['rampok','begal','bunuh'].includes(jenis)) return m.reply('❌ Jenis: rampok, begal, bunuh'); wdb.crime[who][jenis] = Math.max(0, wdb.crime[who][jenis] - jml); wdb.crime[who].total = wdb.crime[who].rampok + wdb.crime[who].begal + wdb.crime[who].bunuh; saveDB(wdb); return m.reply(`✅ *BURONAN DIKURANGI*\n@${who.split('@')[0]}\n${jenis} -${jml}\nTotal: ${wdb.crime[who].total}`, null, {mentions: [who]}) }
  if(aksi === 'wantedreset' && who){ wdb.crime[who] = {total:0, rampok:0, begal:0, bunuh:0}; saveDB(wdb); return m.reply(`🧹 *DATA BURONAN DIRESET*\n@${who.split('@')[0]} sudah bersih`, null, {mentions: [who]}) }
  if(aksi === 'wantedwipe'){ wdb.crime = {}; saveDB(wdb); return m.reply(`🧹 *SEMUA DATA BURONAN DIHAPUS*\nKota sudah aman`) }
  if(aksi === 'wantedcek' && who){ let data = wdb.crime[who]; if(!data || data.total === 0) return m.reply(`✅ @${who.split('@')[0]} bersih`, null, {mentions: [who]}); let cap = `*───「 🚨 DATA BURONAN 」───*\n@${who.split('@')[0]}\n│ 💀 Total : ${data.total}x\n│ 🕵️ Rampok : ${data.rampok}\n│ 🏴‍☠️ Begal : ${data.begal}\n│ 🔪 Bunuh : ${data.bunuh}`; return conn.reply(m.chat, cap, m, {mentions: [who]}) }

  // 13. BACKUP
  if(aksi === 'backup'){
    let date = new Date().toISOString().replace(/:/g, '-')
    fs.writeFileSync(`./database_backup_${date}.json`, JSON.stringify(wdb, null, 2))
    return m.reply(`✅ *BACKUP BERHASIL*\nFile: database_backup_${date}.json`)
  }

  m.reply('❌ Aksi tidak valid. Ketik *rpgpanelmenu* untuk lihat menu')
}

handler.help = ['rpgpanel']
handler.tags = ['owner']
handler.command = /^(rpgpanel|rpgowner)$/i
handler.owner = true
handler.group = true
export default handler