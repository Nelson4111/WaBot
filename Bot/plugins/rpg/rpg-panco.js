import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function getTitlePanco(menang) {
  if(menang >= 100) return '👑 Legenda Panco'
  if(menang >= 50) return '⚡ Dewa Panco'
  if(menang >= 10) return '💪 Raja Panco'
  if(menang >= 1) return '✨ Penantang Baru'
  return '🥊 Pemula'
}

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const wdb = loadDB()
  wdb.temp = wdb.temp || {}
  wdb.temp.panco = wdb.temp.panco || {} // SIMPAN JADI OBJECT

  // AUTO HAPUS KALAU EXPIRED - 2 MENIT
  for(let id in wdb.temp.panco){
    if(Date.now() - wdb.temp.panco[id].waktu > 120000){
      delete wdb.temp.panco[id]
    }
  }

  // COMMAND 1: PANCO - BUAT NANTANG
  if (command === 'panco') {
    let data = getUserRPG(wdb, m.sender)
    let user = data.rpg
    if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
    if(!user.stats) user.stats = { jambakMenang: 0, jambakKalah: 0, pancoMenang: 0, pancoKalah: 0 }

    let armorLvl = user.armor || 0
    let maxHP = 100 + (armorLvl * 20) + (user.maxDarahBonus || 0)
    user.maxDarah = maxHP
    if(!user.darah) user.darah = maxHP

    let target = m.mentionedJid[0] || m.quoted?.sender
    if(!target) return m.reply(`❌ Tag cowo yang mau kamu panco!\nContoh: *${usedPrefix}panco @tag 100000*`)
    if(target === m.sender) return m.reply('❌ Ga bisa panco diri sendiri lah 😭')

    let dataTarget = getUserRPG(wdb, target)
    let userTarget = dataTarget.rpg
    if(!userTarget) return m.reply('❌ Target belum memiliki data RPG.')
    if(!userTarget.stats) userTarget.stats = { jambakMenang: 0, jambakKalah: 0, pancoMenang: 0, pancoKalah: 0 }

    let armorTarget = userTarget.armor || 0
    let maxHPTarget = 100 + (armorTarget * 20) + (userTarget.maxDarahBonus || 0)
    userTarget.maxDarah = maxHPTarget
    if(!userTarget.darah) userTarget.darah = maxHPTarget

    let uangUser = wdb.money[m.sender] || 0
    let uangTarget = wdb.money[target] || 0

    let taruhanInput = parseInt(args[1])
    let taruhanDefault = Math.floor(Math.min(uangUser, uangTarget) * 0.1)
    if(taruhanDefault < 1000) taruhanDefault = 1000
    let taruhan = taruhanInput? taruhanInput : taruhanDefault

    if(taruhan < 1000) return m.reply('❌ Minimal taruhan Rp 1000')
    if(uangUser < taruhan) return m.reply(`❌ Uang kamu kurang! Punya Rp ${uangUser.toLocaleString()}`)
    if(uangTarget < taruhan) return m.reply(`❌ Uang target kurang! Punya Rp ${uangTarget.toLocaleString()}`)

    let titleP = getTitlePanco(user.stats.pancoMenang)
    let titleT = getTitlePanco(userTarget.stats.pancoMenang)

    let arenaId = Date.now().toString() // ID UNIK

    let cap = `┌───❏「 💪 ARENA PANCO #${arenaId.slice(-4)} 」❏\n│\n`
    cap += `│ 👤 *PENANTANG*\n│ @${m.sender.split('@')[0]}\n│ ${titleP}\n│ Lv.${user.level} | ❤️ ${user.darah}/${maxHP} | ✨ ${user.exp}\n│ W-L : ${user.stats.pancoMenang}W - ${user.stats.pancoKalah}L\n`
    cap += `│\n│ ⚔️ *VS*\n│\n`
    cap += `│ 👤 *LAWAN*\n│ @${target.split('@')[0]}\n│ ${titleT}\n│ Lv.${userTarget.level} | ❤️ ${userTarget.darah}/${maxHPTarget} | ✨ ${userTarget.exp}\n│ W-L : ${userTarget.stats.pancoMenang}W - ${userTarget.stats.pancoKalah}L\n`
    cap += `│\n│ 💰 Taruhan : Rp ${taruhan.toLocaleString()}\n`
    cap += `│\n│ *.pancoterima @${m.sender.split('@')[0]}* → Terima\n│ *.pancotolak @${m.sender.split('@')[0]}* → Tolak\n│ ⏰ 2 menit\n`
    cap += `└───────────────────`

    wdb.temp.panco[arenaId] = {
      id: arenaId,
      chat: m.chat,
      penantang: m.sender,
      target: target,
      taruhan: taruhan,
      waktu: Date.now()
    }
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [m.sender, target])
  }

  // COMMAND 2: PANCO TERIMA - PAKE @TAG
  if (command === 'pancoterima') {
    let penantangTag = m.mentionedJid[0]
    if(!penantangTag) return m.reply(`❌ Format: *.pancoterima @penantang*`)

    let arena = Object.values(wdb.temp.panco).find(a => a.chat === m.chat && a.penantang === penantangTag && a.target === m.sender)
    if(!arena) return m.reply('❌ Tidak ada tantangan panco dari orang itu ke kamu')

    let dataP = getUserRPG(wdb, arena.penantang)
    let dataT = getUserRPG(wdb, arena.target)
    let userP = dataP.rpg
    let userT = dataT.rpg

    let powerP = userP.level * 10 + Math.floor(Math.random() * 200) + Math.floor(userP.exp / 500)
    let powerT = userT.level * 10 + Math.floor(Math.random() * 200) + Math.floor(userT.exp / 500)

    let cap = `┌───❏「 ⚔️ PERTARUNGAN PANCO 」❏\n│\n`
    cap += `│ @${arena.penantang.split('@')[0]} ⚡ ${powerP}\n│ VS\n│ @${arena.target.split('@')[0]} ⚡ ${powerT}\n│\n`

    if(powerP > powerT){
      wdb.money[arena.penantang] += arena.taruhan
      wdb.money[arena.target] -= arena.taruhan
      userP.exp += 50
      userP.stats.pancoMenang++
      userT.stats.pancoKalah++
      cap += `│ 🏆 *PEMENANG*\n│ @${arena.penantang.split('@')[0]}\n│\n│ 🔥 Ototmu terlalu besar!\n│\n│ 💰 +Rp ${arena.taruhan.toLocaleString()}\n│ ✨ +50 Exp`
    } else if(powerT > powerP){
      wdb.money[arena.target] += arena.taruhan
      wdb.money[arena.penantang] -= arena.taruhan
      userT.exp += 50
      userT.stats.pancoMenang++
      userP.stats.pancoKalah++
      cap += `│ 🏆 *PEMENANG*\n│ @${arena.target.split('@')[0]}\n│\n│ 💥 Dialah raja panco sejati!\n│\n│ 💰 +Rp ${arena.taruhan.toLocaleString()}\n│ ✨ +50 Exp`
    } else {
      cap += `│ 🤝 *HASIL: SERI*\n│ Taruhan dikembalikan`
    }
    cap += `\n└───────────────────`

    delete wdb.temp.panco[arena.id]
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [arena.penantang, arena.target])
  }

  // COMMAND 3: PANCO TOLAK - PAKE @TAG
  if (command === 'pancotolak') {
    let penantangTag = m.mentionedJid[0]
    if(!penantangTag) return m.reply(`❌ Format: *.pancotolak @penantang*`)

    let arena = Object.values(wdb.temp.panco).find(a => a.chat === m.chat && a.penantang === penantangTag && a.target === m.sender)
    if(!arena) return m.reply('❌ Tidak ada tantangan panco dari orang itu ke kamu')

    delete wdb.temp.panco[arena.id]
    saveDB(wdb)
    return m.reply(`❌ @${m.sender.split('@')[0]} menolak tantangan panco dari @${penantangTag.split('@')[0]}`, null, { mentions: [m.sender, penantangTag] })
  }
}

handler.all = async function(m) {
  const wdb = loadDB()
  wdb.temp = wdb.temp || {}
  wdb.temp.panco = wdb.temp.panco || {}
  for(let id in wdb.temp.panco){
    let arena = wdb.temp.panco[id]
    if(Date.now() - arena.waktu > 120000){ // 2 MENIT
      delete wdb.temp.panco[id]
      saveDB(wdb)
      await this.sendMessage(arena.chat, { text: `⏰ Tantangan panco dari @${arena.penantang.split('@')[0]} ke @${arena.target.split('@')[0]} telah kadaluarsa`, mentions: [arena.penantang, arena.target] })
    }
  }
}

handler.help = ['panco @tag [taruhan]', 'pancoterima @tag', 'pancotolak @tag']
handler.tags = ['rpg']
handler.command = /^(panco|pancoterima|pancotolak)$/i
handler.group = true
export default handler