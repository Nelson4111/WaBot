import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { hewanList, getHewan, prosesKawin } from '../../lib/rpg-libternakData.js'
import { BANK_TIERS } from './rpg-bank.js'

import fs from 'fs'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// TAMBAHIN INI DI BAWAHNYA
function getAdvTitle(lvl){
  if(lvl >= 250) return '👑 DEWA PENJELAJAH'
  if(lvl >= 200) return '🌌 MITOS HIDUP'
  if(lvl >= 150) return '⚔️ LEGENDA'
  if(lvl >= 100) return '💎 EPIC HERO'
  if(lvl >= 50) return '✨ PENJELAJAH ULUNG'
  if(lvl >= 25) return '💙 PETUALANG'
  if(lvl >= 10) return '🤍 PEMULA'
  return '🗑️ PENGEMBARA'
}

let handler = async (m, { conn, text, usedPrefix, isOwner }) => {
  if (!isOwner) return m.reply('❌ Fitur khusus Owner')

  const wdb = loadDB()
  wdb.guilds = wdb.guilds || {}
  wdb.crime = wdb.crime || {}
  wdb.users = wdb.users || {}
  wdb.money = wdb.money || {}

  let rawArgs = (text || '').trim().split(/\s+/).filter(Boolean)
  let aksi = rawArgs[0]?.toLowerCase()
  let remaining = rawArgs.slice(1)

  if (!aksi) return m.reply(`*╭───「 👑 RPG PANEL OWNER 」───╮*
│ *Fitur Admin RPG ZETA*
╰────────────────────╯

*───「 📊 GLOBAL 」───*
├ ${usedPrefix}rpgpanel toprpg
├ ${usedPrefix}rpgpanel rpgstat
└ ${usedPrefix}rpgpanel topyt

*───「 👤 USER STAT 」───*
├ ${usedPrefix}rpgpanel set/add/del money @tag <jml>
├ ${usedPrefix}rpgpanel set/add/del level @tag <jml>
├ ${usedPrefix}rpgpanel set/add/del exp @tag <jml>
├ ${usedPrefix}rpgpanel set/add/del darah @tag <jml>
├ ${usedPrefix}rpgpanel set/add/del diamond @tag <jml>
├ ${usedPrefix}rpgpanel set/add/del gold @tag <jml>
├ ${usedPrefix}rpgpanel set/add/del iron @tag <jml>
├ ${usedPrefix}rpgpanel set/add/del wood @tag <jml>
├ ${usedPrefix}rpgpanel set/add/del stone @tag <jml>
├ ${usedPrefix}rpgpanel set maxhp @tag <jml>
├ ${usedPrefix}rpgpanel set sword/armor/pickaxe/fishingrod @tag <lvl>
└ ${usedPrefix}rpgpanel inv @tag

*───「 📦 GUDANG 」───*
├ ${usedPrefix}rpgpanel add @tag <item> <jml>
├ ${usedPrefix}rpgpanel del @tag <item> <jml>
├ ${usedPrefix}rpgpanel addikan @tag <nama_ikan> <jml>
├ ${usedPrefix}rpgpanel delikan @tag <nama_ikan> <jml>
├ ${usedPrefix}rpgpanel addore @tag <nama_ore> <jml>
├ ${usedPrefix}rpgpanel delore @tag <nama_ore> <jml>
├ ${usedPrefix}rpgpanel addmasak @tag <nama_masakan> <jml>
├ ${usedPrefix}rpgpanel delmasak @tag <nama_masakan> <jml>
├ ${usedPrefix}rpgpanel wipe @tag
└ ${usedPrefix}rpgpanel cek @tag

*───「 🏡 TERNAK 」───*
├ ${usedPrefix}rpgpanel addternak @tag <hewan> <jml>
├ ${usedPrefix}rpgpanel delternak @tag <hewan> <jml>
├ ${usedPrefix}rpgpanel kawinforce @tag <h1> <h2>
└ ${usedPrefix}rpgpanel icuforce @tag

*───「 🗺️ ADVENTURE 」───*
├ ${usedPrefix}rpgpanel additem @tag <item> <jml>
├ ${usedPrefix}rpgpanel delitem @tag <item> <jml>
├ ${usedPrefix}rpgpanel setadvlevel @tag <lvl>
└ ${usedPrefix}rpgpanel addadvlevel @tag <jml>

*───「 🏦 BANK 」───*
├ ${usedPrefix}rpgpanel setbank @tag <jml>
├ ${usedPrefix}rpgpanel setbanktier @tag <0-14>
├ ${usedPrefix}rpgpanel freezebank @tag
└ ${usedPrefix}rpgpanel unfreezebank @tag

*───「 💕 RSHIP 」───*
├ ${usedPrefix}rpgpanel addharem @tag <nama> <cowok/cewek>
├ ${usedPrefix}rpgpanel delharem @tag <no>
├ ${usedPrefix}rpgpanel setharem @tag <no> <level/love/exp/nikah> <val>
├ ${usedPrefix}rpgpanel addanak @tag <nama_anak>
└ ${usedPrefix}rpgpanel delanak @tag <no_anak>

*───「 ⛓️ CSM PANEL 」───*
├ ${usedPrefix}rpgpanel cekcsm @tag
├ ${usedPrefix}rpgpanel setcsm @tag <stat> <jml>
├ ${usedPrefix}rpgpanel addcsm @tag <stat> <jml>
├ ${usedPrefix}rpgpanel delcsm @tag <stat> <jml>
├ ${usedPrefix}rpgpanel setcontract @tag <nama>
├ ${usedPrefix}rpgpanel delcontract @tag
├ ${usedPrefix}rpgpanel giveending @tag <ending>
└ ${usedPrefix}rpgpanel resetcsm @tag

*───「 💊 LAINNYA 」───*
├ ${usedPrefix}rpgpanel heal @tag
├ ${usedPrefix}rpgpanel resetlevel @tag
├ ${usedPrefix}rpgpanel resetmoney @tag
└ ${usedPrefix}rpgpanel resetdiamond @tag`)

  // ========== GLOBAL MENU DARI RPGB ==========
  if(aksi === 'toprpg'){
    let users = Object.keys(wdb.users).filter(id => wdb.users[id]?.rpg)
    const formatUser = (id) => {
      let name = conn.getName(id) || 'Petualang'
      let num = id.split('@')[0]
      let maskedNum = num.length > 7? `${num.substring(0, 5)}xxxx${num.slice(-2)}` : num
      return `${name} (@${maskedNum})`
    }
    let topLevel = [...users].sort((a,b) => (wdb.users[b].rpg.level || 0) - (wdb.users[a].rpg.level || 0)).slice(0, 10)
    let topMoney = Object.keys(wdb.money).sort((a,b) => (wdb.money[b] || 0) - (wdb.money[a] || 0)).slice(0, 10)
    let topDiamond = [...users].sort((a,b) => (wdb.users[b].rpg.diamond || 0) - (wdb.users[a].rpg.diamond || 0)).slice(0, 10)

    let text = `*───「 ZETA RPG LEADERBOARD 」───*\n\n`
    text += `🆙 *TOP 10 LEVEL*\n`
    topLevel.forEach((id, i) => { text += `${i + 1}. ${formatUser(id)}\n └─ *Level ${wdb.users[id].rpg.level}*\n` })
    text += `\n💰 *TOP 10 KEKAYAAN*\n`
    topMoney.forEach((id, i) => { text += `${i + 1}. ${formatUser(id)}\n └─ *Rp ${(wdb.money[id] || 0).toLocaleString()}*\n` })
    text += `\n💎 *TOP 10 COLLECTOR*\n`
    topDiamond.forEach((id, i) => { text += `${i + 1}. ${formatUser(id)}\n └─ *${wdb.users[id].rpg.diamond || 0} Diamond*\n` })
    return conn.sendMessage(m.chat, { 
      image: { url: 'https://files.cloudkuimages.guru/images/e0684787315c.jpeg' }, 
      caption: text 
    }, { quoted: m })
  }

  if(aksi === 'rpgstat'){
    let users = Object.entries(wdb.users).filter(([_,d]) => d.rpg)
    let totalUsers = users.length
    let totalMoney = Object.values(wdb.money || {}).reduce((a,b) => a+b, 0)
    let totalIron = 0, totalGold = 0, totalLevel = 0
    let highestLevel = 0, topPlayer = 'Tidak ada'
    users.forEach(([jid, data]) => {
      totalIron += (data.rpg.iron || 0)
      totalGold += (data.rpg.gold || 0)
      totalLevel += (data.rpg.level || 1)
      if (data.rpg.level > highestLevel) {
        highestLevel = data.rpg.level
        topPlayer = conn.getName(jid) || jid.split('@')[0]
      }
    })
    let avgLevel = totalUsers > 0? (totalLevel / totalUsers).toFixed(1) : 0
    let cap = `*───「 RPG GLOBAL STATS 」───*\n\n📊 *Populasi:* ${totalUsers} User\n💰 *Total Uang:* Rp ${totalMoney.toLocaleString()}\n⛓️ *Total Iron:* ${totalIron.toLocaleString()}\n✨ *Total Gold:* ${totalGold.toLocaleString()}\n🏆 *Lv Tertinggi:* ${topPlayer} Lv.${highestLevel}\n📚 *Rata2:* Lv.${avgLevel}`
    return conn.sendMessage(m.chat, { 
      image: { url: 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg' }, 
      caption: cap 
    }, { quoted: m })
  } 
  
  if(aksi === 'topyt'){
    let topYoutuber = Object.entries(wdb.users).filter(([_, u]) => u.youtube).map(([jid, u]) => ({ name: u.youtube.name, subs: u.youtube.subs })).sort((a, b) => b.subs - a.subs)
    if (topYoutuber.length === 0) return m.reply('Belum ada YouTuber')
    let caption = `*───「 TOP YOUTUBER 」───*\n\n`
    topYoutuber.slice(0, 10).forEach((u, i) => { caption += `${i + 1}. ${u.name}\n *Subs*: ${u.subs.toLocaleString()}\n\n` })
    return conn.sendMessage(m.chat, { 
      image: { url: 'https://c.termai.cc/i174/Uwc' }, 
      caption: caption.trim() 
    }, { quoted: m })
  }

  // 2. Normalisasi 2-kata aksi (misal: "set money", "add diamond", "del wood")
  const statAliases = [
    'money', 'level', 'exp', 'darah', 'diamond', 'iron', 'gold', 'stone', 'wood',
    'maxhp', 'armor', 'sword', 'pickaxe', 'fishingrod', 'limit', 'bank', 'banktier',
    'advlevel', 'csm', 'contract', 'harem', 'anak', 'ikan', 'ore', 'masak', 'ternak', 'item'
  ];

  if (['set', 'add', 'del', 'tambah', 'kurang', 'reset'].includes(aksi) && remaining.length > 0) {
    let nextWord = remaining[0].toLowerCase();
    if (statAliases.includes(nextWord)) {
      let prefixAksi = aksi === 'tambah' ? 'add' : (aksi === 'kurang' ? 'del' : aksi);
      aksi = prefixAksi + nextWord;
      remaining = remaining.slice(1);
    }
  }

  // 3. Resolusi Target User (Mendukung: Tag / Mention, Reply / Quoted, Nomor HP, JID, LID)
  let who = null;
  let targetArgIndex = -1;

  // A. Cek dari Mention / Tag (@user)
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0];
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].startsWith('@') || remaining[i].includes('@s.whatsapp.net') || remaining[i].includes('@lid')) {
        targetArgIndex = i;
        break;
      }
    }
  }
  // B. Cek dari Quoted / Reply pesan user
  else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender;
  }
  // C. Cek dari argumen teks (nomor HP / string JID / LID)
  else {
    for (let i = 0; i < remaining.length; i++) {
      let arg = remaining[i].trim();
      let clean = arg.replace(/^@/, '');
      if (clean.includes('@s.whatsapp.net') || clean.includes('@lid')) {
        who = clean;
        targetArgIndex = i;
        break;
      }
      let digits = clean.replace(/[^0-9]/g, '');
      if (digits.length >= 8 && digits.length <= 16) {
        if (digits.startsWith('08')) digits = '628' + digits.slice(2);
        who = digits + '@s.whatsapp.net';
        targetArgIndex = i;
        break;
      }
    }
  }

  if (targetArgIndex !== -1) {
    remaining.splice(targetArgIndex, 1);
  }

  // 4. Konversi dan Standarisasi format JID / LID ke Database User Key
  if (who) {
    try {
      if (conn && typeof conn.decodeJid === 'function') {
        who = conn.decodeJid(who);
      }
    } catch (_) {}

    // Konversi LID (@lid) ke nomor HP (@s.whatsapp.net) asli jika tersedia
    if (who.endsWith('@lid')) {
      const resolvedLid = global.lids?.[who] || 
                          global.db?.data?.lids?.[who] || 
                          (wdb?.lids && wdb.lids[who]);
      if (resolvedLid) {
        who = resolvedLid;
      } else if (global.db?.data?.users) {
        for (const [realJid, uData] of Object.entries(global.db.data.users)) {
          if (uData.lid === who || realJid.split('@')[0] === who.split('@')[0]) {
            who = realJid;
            break;
          }
        }
      }
    }

    if (!who.includes('@')) {
      who = who + '@s.whatsapp.net';
    } else if (!who.endsWith('@s.whatsapp.net') && !who.endsWith('@lid')) {
      who = who.split('@')[0] + '@s.whatsapp.net';
    }

    if (who === '@s.whatsapp.net' || who.startsWith('NaN') || who === 'undefined@s.whatsapp.net') {
      who = null;
    }
  }

  // ========== EDIT USER HARUS ADA TARGET ==========
  if (!who) return m.reply('❌ Tag / reply / masukkan nomor target dulu untuk edit user!')

  // INISIALISASI WAJIB BIAR GA RESET
  if (!wdb.users[who]) wdb.users[who] = {}
  if (!wdb.users[who].rpg) wdb.users[who].rpg = {}
  if (wdb.money[who] === undefined) wdb.money[who] = 0

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

  let args = remaining
  let jumlah = parseInt(remaining.find(a => !isNaN(parseInt(a)))) || 0
  let itemInput = remaining.find(a => isNaN(parseInt(a)))
  let item = itemInput?.toLowerCase().replace(/ /g, '_')

  // 1. SET STAT
  if(['setmoney','setlevel','setexp','setdarah','setdiamond','setiron','setgold','setstone','setwood','setmaxhp','setarmor','setsword','setpickaxe','setfishingrod'].includes(aksi)){
    if(jumlah < 0) return m.reply('❌ Jumlah tidak boleh minus')

    if(aksi === 'setmoney') wdb.money[who] = jumlah
    else if(aksi === 'setmaxhp') user.maxDarahBonus = jumlah
    else user[aksi.replace('set','')] = jumlah

    if(['setlevel','setarmor','setmaxhp','setsword','setpickaxe','setfishingrod'].includes(aksi)){
      user.exp = 0
      user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
      user.darah = user.maxDarah
    }
    saveDB(wdb)
    return m.reply(`✅ *SET ${aksi.toUpperCase().replace('SET','')}*\n@${who.split('@')[0]} = ${jumlah.toLocaleString()}`, null, {mentions: [who]})
  }

  // 2. ADD STAT
  if(['addmoney','addlevel','addexp','adddarah','adddiamond','addiron','addgold','addstone','addwood','addsword','addarmor','addpickaxe','addfishingrod'].includes(aksi)){
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

  // 3. DEL STAT
  if(['delmoney','dellevel','delexp','deldarah','deldiamond','deliron','delgold','delstone','delwood','delsword','delarmor','delpickaxe','delfishingrod'].includes(aksi)){
    if(jumlah < 1) return m.reply('❌ Jumlah minimal 1')

    if(aksi === 'delmoney') wdb.money[who] = Math.max(0, wdb.money[who] - jumlah)
    else if(aksi === 'deldarah') user.darah = Math.max(0, user.darah - jumlah)
    else if(aksi === 'dellevel'){
      user.level = Math.max(1, user.level - jumlah)
      user.exp = 0
      user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
      user.darah = Math.min(user.darah, user.maxDarah)
    }
    else if(aksi === 'delexp'){
      user.exp = Math.max(0, user.exp - jumlah)
    }
    else {
      let stat = aksi.replace('del','')
      user[stat] = Math.max(0, user[stat] - jumlah)
    }

    saveDB(wdb)
    let total = aksi === 'delmoney'? wdb.money[who] : user[aksi.replace('del','')]
    return m.reply(`✅ *KURANGI ${aksi.toUpperCase().replace('DEL','')}*\n@${who.split('@')[0]} -${jumlah.toLocaleString()}\nTotal: ${total.toLocaleString()}`, null, {mentions: [who]})
  }

  // 4. GUDANG
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
  
  // 4.5 IKAN
  if(['addikan','delikan'].includes(aksi)){
    if(!itemInput || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel addikan @user kraken 5*`)
    let ikan = itemInput.toLowerCase().replace(/ /g, '_')

    if(aksi === 'addikan'){
      user.ikan[ikan] = (user.ikan[ikan] || 0) + jumlah
      saveDB(wdb)
      return m.reply(`✅ *TAMBAH IKAN*\n@${who.split('@')[0]}\n${formatNama(ikan)} +${jumlah}\nTotal: ${user.ikan[ikan]}`, null, {mentions: [who]})
    }
    if(aksi === 'delikan'){
      if(!user.ikan[ikan]) return m.reply(`❌ Tidak punya ${formatNama(ikan)}`, null, {mentions: [who]})
      user.ikan[ikan] = Math.max(0, user.ikan[ikan] - jumlah)
      if(user.ikan[ikan] <= 0) delete user.ikan[ikan]
      saveDB(wdb)
      return m.reply(`✅ *HAPUS IKAN*\n@${who.split('@')[0]}\n${formatNama(ikan)} -${jumlah}`, null, {mentions: [who]})
    }
  }
  
  // 4.6 ORE
  if(aksi === 'addore'){
    let ore = itemInput.toLowerCase().replace(/ /g, '_')
    user.ores[ore] = (user.ores[ore] || 0) + jumlah
    saveDB(wdb)
    return m.reply(`✅ Ditambah ${formatNama(ore)} x${jumlah} ke @${who.split('@')[0]}`, null, {mentions: [who]})
  }
  if(aksi === 'delore'){
    let ore = itemInput.toLowerCase().replace(/ /g, '_')
    user.ores[ore] = Math.max(0, (user.ores[ore] || 0) - jumlah)
    if(user.ores[ore] <= 0) delete user.ores[ore]
    saveDB(wdb)
    return m.reply(`✅ Dikurangi ${formatNama(ore)} x${jumlah} dari @${who.split('@')[0]}`, null, {mentions: [who]})
  }
  
  if(aksi === 'addmasak'){
  let masak = itemInput.toLowerCase().replace(/ /g, '_')
  user.masakan[masak] = (user.masakan[masak] || 0) + jumlah
  saveDB(wdb)
  return m.reply(`✅ Ditambah ${formatNama(masak)} x${jumlah}`, null, {mentions: [who]})
}
if(aksi === 'delmasak'){
  let masak = itemInput.toLowerCase().replace(/ /g, '_')
  user.masakan[masak] = Math.max(0, (user.masakan[masak] || 0) - jumlah)
  if(user.masakan[masak] <= 0) delete user.masakan[masak]
  saveDB(wdb)
  return m.reply(`✅ Dikurangi ${formatNama(masak)} x${jumlah}`, null, {mentions: [who]})
}

// 4.7 TERNAK
  if(['addternak','delternak'].includes(aksi)){
    user.ternak = user.ternak || {}
    let hewan = itemInput.toLowerCase().replace(/ /g, '_') // biar sama kayak di file ternak.js

    if(aksi === 'addternak'){
      if(!hewan || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel addternak @tag sapi 5*`)
      user.ternak[hewan] = (user.ternak[hewan] || 0) + jumlah
      saveDB(wdb)
      return m.reply(`✅ Ditambah ${formatNama(hewan)} x${jumlah} ke kandang @${who.split('@')[0]}`, null, {mentions: [who]})
    }
    if(aksi === 'delternak'){
      if(!user.ternak[hewan]) return m.reply(`❌ @${who.split('@')[0]} tidak punya ${formatNama(hewan)}`, null, {mentions: [who]})
      user.ternak[hewan] = Math.max(0, user.ternak[hewan] - jumlah)
      if(user.ternak[hewan] <= 0) delete user.ternak[hewan]
      saveDB(wdb)
      return m.reply(`✅ Dikurangi ${formatNama(hewan)} x${jumlah} dari kandang @${who.split('@')[0]}`, null, {mentions: [who]})
    }
  }
  
  // 4.8 KAWIN FORCE - LANGSUNG HASIL
  if(aksi === 'kawinforce'){
    user.ternak = user.ternak || {}
    let h1 = args[1]?.toLowerCase()
    let h2 = args[2]?.toLowerCase()
    if(!h1 ||!h2) return m.reply(`Contoh: *${usedPrefix}rpgpanel kawinforce @tag sapi ayam*`)

    let d1 = getHewan(h1)
    let d2 = getHewan(h2)
    if(!d1 ||!d2) return m.reply(`❌ Hewan tidak ada di database`)

    let hasil = prosesKawin(h1,h2)
    let keyHasil = hasil.data.nama.toLowerCase()
    user.ternak[keyHasil] = (user.ternak[keyHasil] || 0) + 1
    saveDB(wdb)
    return m.reply(`✅ Langsung lahir: ${hasil.data.emoji} ${hasil.data.nama} [E${hasil.data.evolusi}] ke @${who.split('@')[0]}`, null, {mentions: [who]})
  }

// 4.9 ICU FORCE - SELAMATIN HEWAN SEKARAT
  if(aksi === 'icuforce'){
    if(!global.icuTernak[who]) return m.reply(`❌ @${who.split('@')[0]} tidak ada hewan di ICU`, null, {mentions: [who]})

    let data = global.icuTernak[who]
    let keyHasil = data.d1.nama.toLowerCase()
    user.ternak[keyHasil] = (user.ternak[keyHasil] || 0) + 1 // balikin 1 induk. Mau 2 juga boleh
    delete global.icuTernak[who]
    saveDB(wdb)
    return m.reply(`✅ Diselamatkan dari ICU: ${data.d1.emoji} ${data.d1.nama} ke @${who.split('@')[0]}`, null, {mentions: [who]})
  }
  
  // 4.9 ADVENTURE ITEM
  if(['additem','delitem'].includes(aksi)){
    user.inventory = user.inventory || {}
    let item = itemInput.toLowerCase().replace(/ /g, '_')

    if(aksi === 'additem'){
      if(!item || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel additem @tag pedang_legendaris 1*`)
      user.inventory[item] = (user.inventory[item] || 0) + jumlah

      // sinkronin ke stat juga biar muncul di.inv
      if(item === 'diamond') user.diamond = (user.diamond || 0) + jumlah
      if(item === 'kayu') user.wood = (user.wood || 0) + jumlah
      if(item === 'iron') user.iron = (user.iron || 0) + jumlah

      saveDB(wdb)
      return m.reply(`✅ Ditambah ${formatNama(item)} x${jumlah} ke tas @${who.split('@')[0]}`, null, {mentions: [who]})
    }
    if(aksi === 'delitem'){
      if(!user.inventory[item]) return m.reply(`❌ @${who.split('@')[0]} tidak punya ${formatNama(item)}`, null, {mentions: [who]})
      user.inventory[item] = Math.max(0, user.inventory[item] - jumlah)
      if(user.inventory[item] <= 0) delete user.inventory[item]

      // sinkronin ke stat juga
      if(item === 'diamond') user.diamond = Math.max(0, (user.diamond || 0) - jumlah)
      if(item === 'kayu') user.wood = Math.max(0, (user.wood || 0) - jumlah)
      if(item === 'iron') user.iron = Math.max(0, (user.iron || 0) - jumlah)

      saveDB(wdb)
      return m.reply(`✅ Dikurangi ${formatNama(item)} x${jumlah} dari tas @${who.split('@')[0]}`, null, {mentions: [who]})
    }
  }

// 4.10 ADVENTURE LEVEL
  if(['setadvlevel','addadvlevel'].includes(aksi)){
    let val = parseInt(args[0])
    if(isNaN(val)) return m.reply(`Contoh: *${usedPrefix}rpgpanel setadvlevel @tag 100*`)

    if(aksi === 'setadvlevel') user.adventureLevel = val
    if(aksi === 'addadvlevel') user.adventureLevel = (user.adventureLevel || 1) + val

    saveDB(wdb)
    return m.reply(`✅ Adventure Level @${who.split('@')[0]} = ${user.adventureLevel}\nTitle: ${getAdvTitle(user.adventureLevel)}`, null, {mentions: [who]})
  }
  
if(!who) return m.reply('❌ Tag target dulu untuk cek inv')
  // 5. INVENTORY CEK
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

  // 6. HEAL
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

  // 7. RESET
  if(aksi === 'resetlevel'){ user.level = 1; user.exp = 0; saveDB(wdb); return m.reply(`🔄 Reset level @${who.split('@')[0]}`, null, {mentions: [who]}) }
  if(aksi === 'resetmoney'){ wdb.money[who] = 0; saveDB(wdb); return m.reply(`🔄 Reset money @${who.split('@')[0]}`, null, {mentions: [who]}) }
  if(aksi === 'resetdiamond'){ user.diamond = 0; saveDB(wdb); return m.reply(`🔄 Reset diamond @${who.split('@')[0]}`, null, {mentions: [who]}) }
  
    // 8 BANK PANEL
  if(['setbank','setbanktier','freezebank','unfreezebank'].includes(aksi)){
    user.bank = user.bank || 0
    user.bankTier = user.bankTier || 0
    user.kartuBeku = user.kartuBeku || false

    if(aksi === 'setbank'){
      let val = parseInt(args[1])
      if(isNaN(val)) return m.reply(`Contoh: *${usedPrefix}rpgpanel setbank @tag 100000000*`)
      user.bank = Math.max(0, val)
      saveDB(wdb)
      return m.reply(`✅ Saldo bank @${who.split('@')[0]} di set jadi Rp ${user.bank.toLocaleString()}`, null, {mentions: [who]})
    }

    if(aksi === 'setbanktier'){
      let tier = parseInt(args[1])
      if(isNaN(tier) || tier < 0 || tier > 14) return m.reply(`Contoh: *${usedPrefix}rpgpanel setbanktier @tag 14*\nList: 0-14`)
      user.bankTier = tier
      saveDB(wdb)
      return m.reply(`✅ Tier bank @${who.split('@')[0]} di set jadi ${BANK_TIERS[tier].color} ${BANK_TIERS[tier].name}`, null, {mentions: [who]})
    }

    if(aksi === 'freezebank'){
      user.kartuBeku = true
      saveDB(wdb)
      return m.reply(`✅ Kartu bank @${who.split('@')[0]} dibekukan`, null, {mentions: [who]})
    }

    if(aksi === 'unfreezebank'){
      user.kartuBeku = false
      user.lastMembership = Date.now() // reset biar ga langsung kena denda lagi
      saveDB(wdb)
      return m.reply(`✅ Kartu bank @${who.split('@')[0]} diaktifkan`, null, {mentions: [who]})
    }
  }

// 9. RSHIP HAREM
  if(['addharem','delharem','setharem','editharem'].includes(aksi)){
    user.harem = user.harem || []
    let no = parseInt(args[1]) - 1 // nomor pasangan
    let nama = args[2]
    let gender = args[3]?.toLowerCase()

    if(aksi === 'addharem'){
      if(!nama ||!gender) return m.reply(`Contoh: *${usedPrefix}rpgpanel addharem @tag Rem cewek*`)
      user.harem.push({ name: nama, gender, love: 50, exp: 0, level: 1, menikah: false, cincin: null })
      saveDB(wdb)
      return m.reply(`✅ Tambah pasangan *${nama}* ke @${who.split('@')[0]}`, null, {mentions: [who]})
    }

    if(aksi === 'delharem'){
      if(isNaN(no) ||!user.harem[no]) return m.reply(`❌ Nomor salah. Cek pake.rship harem`)
      let nama = user.harem[no].name
      user.harem.splice(no, 1)
      saveDB(wdb)
      return m.reply(`✅ Hapus pasangan *${nama}* dari @${who.split('@')[0]}`, null, {mentions: [who]})
    }

    if(aksi === 'setharem'){
      let tipe = args[2] // level/love/exp/nikah
      let val = args[3]
      if(isNaN(no) ||!user.harem[no] ||!tipe || val === undefined) return m.reply(`Contoh: *${usedPrefix}rpgpanel setharem @tag 1 level 100*`)
      if(tipe === 'level') user.harem[no].level = parseInt(val)
      if(tipe === 'love') user.harem[no].love = parseInt(val)
      if(tipe === 'exp') user.harem[no].exp = parseInt(val)
      if(tipe === 'nikah') user.harem[no].menikah = val === 'true'
      saveDB(wdb)
      return m.reply(`✅ Set ${tipe} *${user.harem[no].name}* = ${val}`, null, {mentions: [who]})
    }
  }

// 5.2 RSHIP ANAK
  if(['addanak','delanak','setanak'].includes(aksi)){
    user.kids = user.kids || []
    let no = parseInt(args[1]) - 1

    if(aksi === 'addanak'){
      let nama = args.slice(2).join(' ')
      if(!nama) return m.reply(`Contoh: *${usedPrefix}rpgpanel addanak @tag Bayi Zeta*`)
      user.kids.push({ nama, jenis: 'Laki-laki', umur: 0, ortu: 'Admin' })
      saveDB(wdb)
      return m.reply(`✅ Tambah anak *${nama}* ke @${who.split('@')[0]}`, null, {mentions: [who]})
    }
  }
  
  // 10. CSM PANEL - ATUR SEMUA CHAINSWAMAN
  if(['setcsm','addcsm','delcsm','setcontract','delcontract','resetcsm','giveending'].includes(aksi)){
    user.csm = user.csm || {
      nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Rookie Hunter',
      devilContract: null, contractHistory: [], isTransform: false,
      devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Headquarters',
      weapon: {nama: 'Fist', dur: 999}, inventory: [{nama: 'Fist', dur: 999}],
      lastRest: 0, lastGacha: 0, lastVisit: 0, encounter: null,
      relations: {}, pendingBlood: 0, lastWork: 0, pendingDuel: null,
      contractExpire: 0, contractSide: null, ending: null, lastLoveHeal: null
    }

    if(aksi === 'setcsm'){
      //.rpgpanel setcsm @tag blood 100000
      let stat = args[1] // blood, level, story, maxHealth, health, devilsKilled
      let val = parseInt(args[2])
      if(!stat || isNaN(val)) return m.reply(`Contoh: *${usedPrefix}rpgpanel setcsm @tag blood 999999*`)
      if(!user.csm.hasOwnProperty(stat)) return m.reply(`❌ Stat tidak ada. List: blood, level, exp, story, health, maxHealth, devilsKilled`)

      user.csm[stat] = val
      if(stat === 'maxHealth') user.csm.health = Math.min(user.csm.health, val)
      saveDB(wdb)
      return m.reply(`✅ *SET CSM*\n@${who.split('@')[0]}\n${stat} = ${val.toLocaleString()}`, null, {mentions: [who]})
    }

    if(aksi === 'addcsm'){
      //.rpgpanel addcsm @tag blood 50000
      let stat = args[1]
      let val = parseInt(args[2])
      if(!stat || isNaN(val)) return m.reply(`Contoh: *${usedPrefix}rpgpanel addcsm @tag blood 50000*`)
      if(!user.csm.hasOwnProperty(stat)) return m.reply(`❌ Stat tidak ada`)

      user.csm[stat] += val
      saveDB(wdb)
      return m.reply(`✅ *TAMBAH CSM*\n@${who.split('@')[0]}\n${stat} +${val.toLocaleString()}\nTotal: ${user.csm[stat].toLocaleString()}`, null, {mentions: [who]})
    }

    if(aksi === 'delcsm'){
      //.rpgpanel delcsm @tag blood 10000
      let stat = args[1]
      let val = parseInt(args[2])
      if(!stat || isNaN(val)) return m.reply(`Contoh: *${usedPrefix}rpgpanel delcsm @tag blood 10000*`)
      if(!user.csm.hasOwnProperty(stat)) return m.reply(`❌ Stat tidak ada`)

      user.csm[stat] = Math.max(0, user.csm[stat] - val)
      saveDB(wdb)
      return m.reply(`✅ *KURANGI CSM*\n@${who.split('@')[0]}\n${stat} -${val.toLocaleString()}\nTotal: ${user.csm[stat].toLocaleString()}`, null, {mentions: [who]})
    }

    if(aksi === 'setcontract'){
      //.rpgpanel setcontract @tag Chainsaw
      let namaKontrak = args.slice(1).join(' ')
      if(!namaKontrak) return m.reply(`Contoh: *${usedPrefix}rpgpanel setcontract @tag Chainsaw*`)

      user.csm.devilContract = namaKontrak
      user.csm.contractExpire = 0 // 0 = permanen
      user.csm.contractSide = `-15 MaxHP` // efek samping default
      user.csm.maxHealth -= 15
      if(user.csm.health > user.csm.maxHealth) user.csm.health = user.csm.maxHealth
      saveDB(wdb)
      return m.reply(`✅ *KONTRAK DEAL*\n@${who.split('@')[0]}\nKontrak: ${namaKontrak} [Permanen]\nEfek Samping: -15 MaxHP`, null, {mentions: [who]})
    }

    if(aksi === 'delcontract'){
      //.rpgpanel delcontract @tag
      user.csm.devilContract = null
      user.csm.contractExpire = 0
      user.csm.contractSide = null
      saveDB(wdb)
      return m.reply(`✅ *KONTRAK DIBATALKAN*\n@${who.split('@')[0]} sekarang bebas`, null, {mentions: [who]})
    }

    if(aksi === 'giveending'){
      //.rpgpanel giveending @tag Love
      let end = args[1]
      let listEnding = ['Freedom','Apocalypse','Control','Sacrifice','Love','Revenge','Peace']
      if(!end ||!listEnding.includes(end)) return m.reply(`Contoh: *${usedPrefix}rpgpanel giveending @tag Love*\nList: ${listEnding.join(', ')}`)

      user.csm.ending = end
      user.csm.story = 14 // langsung unlock
      // kasih bonus sesuai ending
      if(end === 'Freedom'){ user.csm.blood += 50000; user.csm.title = 'Chainsaw Man' }
      if(end === 'Apocalypse'){ user.csm.devilsKilled += 100; user.csm.title = 'Horseman of Fear' }
      if(end === 'Control'){ wdb.money[who] += 1000000; user.csm.title = 'Public Safety Dog' }
      if(end === 'Sacrifice'){ user.csm.maxHealth -= 50; user.csm.title = 'Guardian Devil' }
      if(end === 'Love'){ user.csm.blood = 0; user.csm.title = 'Beloved Devil' }
      if(end === 'Revenge'){ user.csm.blood += 100000; user.csm.maxHealth += 50; user.csm.title = 'Vengeance Devil' }
      if(end === 'Peace'){ user.csm.blood = 0; user.csm.devilContract = null; user.csm.title = 'Peaceful Devil' }

      saveDB(wdb)
      return m.reply(`✅ *ENDING DIBERIKAN*\n@${who.split('@')[0]}\nEnding: *${end}*\nTitle: ${user.csm.title}`, null, {mentions: [who]})
    }

    if(aksi === 'resetcsm'){
      //.rpgpanel resetcsm @tag
      user.csm = null
      saveDB(wdb)
      return m.reply(`✅ *RESET CSM*\n@${who.split('@')[0]} data CSM dihapus total`, null, {mentions: [who]})
    }
  } 

  m.reply(`❌ Command tidak ada.\n\n*Global:*\n.toprpg.rpgstat.topyt\n\n*Edit:*\n.setlevel.addlevel.dellevel\n.setmoney.addmoney.delmoney\n.add @user diamond 5`)
  

}



handler.help = ['rpgpanel']
handler.tags = ['owner']
handler.command = /^(rpgpanel|rpgowner)$/i
handler.owner = true
handler.group = true
export default handler