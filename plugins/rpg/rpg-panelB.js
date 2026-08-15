import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, isOwner }) => {
  if (!isOwner) return m.reply('❌ Fitur khusus Owner')
  const wdb = loadDB()
  wdb.users = wdb.users || {}
  wdb.money = wdb.money || {}

  let [aksi, target,...args] = text.split(' ')
  let who = m.mentionedJid[0]
  if(!who && target) who = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  let jumlah = parseInt(args[0])

  if (!aksi) return m.reply(`❌ Pilih aksi:\n${usedPrefix}rpgpanelB toprpg\n${usedPrefix}rpgpanelB rpgstat\n${usedPrefix}rpgpanelB topyt\n${usedPrefix}rpgpanelB setlevel @tag <jml>\n${usedPrefix}rpgpanelB setmoney @tag <jml>\n${usedPrefix}rpgpanelB setdiamond @tag <jml>\n${usedPrefix}rpgpanelB resetlevel @tag`)

  // 1. CEK GLOBAL
  if(aksi === 'toprpg'){
    let users = Object.keys(wdb.users).filter(id => wdb.users[id]?.rpg) // filter yg punya rpg doang
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
    return sendRpgMsg(conn, m, text, 'https://files.cloudkuimages.guru/images/e0684787315c.jpeg')
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
    let cap = `*───「 RPG GLOBAL STATS 」───*\n\n📊 *Populasi:* ${totalUsers} User\n💰 *Total Uang:* Rp ${totalMoney.toLocaleString()}\n🏆 *Lv Tertinggi:* ${topPlayer} Lv.${highestLevel}\n📚 *Rata2:* Lv.${avgLevel}`
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
  }

  if(aksi === 'topyt'){
    let topYoutuber = Object.entries(wdb.users).filter(([_, u]) => u.youtube).map(([jid, u]) => ({ name: u.youtube.name, subs: u.youtube.subs })).sort((a, b) => b.subs - a.subs)
    if (topYoutuber.length === 0) return m.reply('Belum ada YouTuber')
    let caption = `*───「 TOP YOUTUBER 」───*\n\n`
    topYoutuber.slice(0, 10).forEach((u, i) => { caption += `${i + 1}. ${u.name}\n *Subs*: ${u.subs.toLocaleString()}\n\n` })
    return sendRpgMsg(conn, m, caption.trim(), 'https://c.termai.cc/i174/Uwc')
  }

  // 2. EDIT DATA
  if(!who) return m.reply('❌ Tag target dulu')

  // INISIALISASI BIAR GA RESET
  if(!wdb.users[who]) wdb.users[who] = {}
  if(!wdb.users[who].rpg) wdb.users[who].rpg = {level:1, exp:0, diamond:0, iron:0, gold:0}
  if(!wdb.money[who]) wdb.money[who] = 0

  let user = wdb.users[who].rpg

  if(aksi === 'setlevel'){
    if(isNaN(jumlah)) return m.reply('❌ Isi jumlah level')
    user.level = jumlah; user.exp = 0
    user.maxDarah = 100 + (user.armor * 20) + (user.maxDarahBonus || 0)
    user.darah = user.maxDarah
    saveDB(wdb)
    return m.reply(`✅ *SET LEVEL*\n@${who.split('@')[0]} = Lv ${jumlah}`, null, {mentions: [who]})
  }

  if(aksi === 'setmoney'){
    if(isNaN(jumlah)) return m.reply('❌ Isi jumlah uang')
    wdb.money[who] = jumlah
    saveDB(wdb)
    return m.reply(`✅ *SET MONEY*\n@${who.split('@')[0]} = Rp ${jumlah.toLocaleString()}`, null, {mentions: [who]})
  }

  if(aksi === 'setdiamond'){
    if(isNaN(jumlah)) return m.reply('❌ Isi jumlah diamond')
    user.diamond = jumlah
    saveDB(wdb)
    return m.reply(`✅ *SET DIAMOND*\n@${who.split('@')[0]} = ${jumlah} 💎`, null, {mentions: [who]})
  }

  // 3. RESET
  if(aksi === 'resetlevel'){ user.level = 1; user.exp = 0; saveDB(wdb); return m.reply(`🔄 Reset level @${who.split('@')[0]}`, null, {mentions: [who]}) }
  if(aksi === 'resetmoney'){ wdb.money[who] = 0; saveDB(wdb); return m.reply(`🔄 Reset money @${who.split('@')[0]}`, null, {mentions: [who]}) }
  if(aksi === 'resetdiamond'){ user.diamond = 0; saveDB(wdb); return m.reply(`🔄 Reset diamond @${who.split('@')[0]}`, null, {mentions: [who]}) }

  if(aksi === 'daily'){
    let hadiah = 50000
    wdb.money[who] += hadiah
    user.lastDaily = Date.now()
    saveDB(wdb)
    return m.reply(`🎁 *DAILY DIPAKSA*\n@${who.split('@')[0]} +Rp ${hadiah.toLocaleString()}`, null, {mentions: [who]})
  }

  m.reply('❌ Aksi tidak valid')
}

handler.help = ['rpgpanelB']
handler.tags = ['owner']
handler.command = /^(rpgpanelB)$/i
handler.owner = true
handler.group = true
export default handler