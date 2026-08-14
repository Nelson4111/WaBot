import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function getTitleJambak(menang) {
  if(menang >= 100) return '👑 Legenda Jambak'
  if(menang >= 50) return '💎 Dewi Jambak'
  if(menang >= 10) return '💅 Ratu Jambak'
  if(menang >= 1) return '✨ Penantang Baru'
  return '🌸 Pemula'
}

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const wdb = loadDB()
  wdb.temp = wdb.temp || {}
  wdb.temp.jambak = wdb.temp.jambak || {} // SIMPAN JADI OBJECT

  // AUTO HAPUS KALAU EXPIRED - 2 MENIT
  for(let id in wdb.temp.jambak){
    if(Date.now() - wdb.temp.jambak[id].waktu > 120000){
      delete wdb.temp.jambak[id]
    }
  }

  // COMMAND 1: JAMBAK - BUAT NANTANG
  if (command === 'jambak') {
    let data = getUserRPG(wdb, m.sender)
    let user = data.rpg
    if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
    if(!user.stats) user.stats = { jambakMenang: 0, jambakKalah: 0, pancoMenang: 0, pancoKalah: 0 }

    let armorLvl = user.armor || 0
    let maxHP = 100 + (armorLvl * 20) + (user.maxDarahBonus || 0)
    user.maxDarah = maxHP
    if(!user.darah) user.darah = maxHP

    let target = m.mentionedJid[0] || m.quoted?.sender
    if(!target) return m.reply(`❌ Tag cewe yang mau kamu jambak!\nContoh: *${usedPrefix}jambak @tag 50000*`)
    if(target === m.sender) return m.reply('❌ Ga bisa jambak diri sendiri lah 😭')

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

    let titleP = getTitleJambak(user.stats.jambakMenang)
    let titleT = getTitleJambak(userTarget.stats.jambakMenang)

    let arenaId = Date.now().toString() // ID UNIK

    let cap = `┌───❏「 💇 ARENA JAMBAK 」❏\n│\n`
    cap += `│ 👤 *PENANTANG*\n│ @${m.sender.split('@')[0]}\n│ ${titleP}\n│ Lv.${user.level} | ❤️ ${user.darah}/${maxHP}\n│ W-L : ${user.stats.jambakMenang}W - ${user.stats.jambakKalah}L\n`
    cap += `│\n│ ⚔️ *VS*\n│\n`
    cap += `│ 👤 *LAWAN*\n│ @${target.split('@')[0]}\n│ ${titleT}\n│ Lv.${userTarget.level} | ❤️ ${userTarget.darah}/${maxHPTarget}\n│ W-L : ${userTarget.stats.jambakMenang}W - ${userTarget.stats.jambakKalah}L\n`
    cap += `│\n│ 💰 Taruhan : Rp ${taruhan.toLocaleString()}\n`
    cap += `│\n│ *.jambakterima @${m.sender.split('@')[0]}* → Terima\n│ *.jambaktolak @${m.sender.split('@')[0]}* → Tolak\n│ ⏰ 2 menit\n`
    cap += `└───────────────────`

    wdb.temp.jambak[arenaId] = {
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

  // COMMAND 2: JAMBAKTERIMA - PAKE @TAG
  if (command === 'jambakterima') {
    let penantangTag = m.mentionedJid[0]
    if(!penantangTag) return m.reply(`❌ Format: *.jambakterima @penantang*`)

    let arena = Object.values(wdb.temp.jambak).find(a => a.chat === m.chat && a.penantang === penantangTag && a.target === m.sender)
    if(!arena) return m.reply('❌ Tidak ada tantangan jambak dari orang itu ke kamu')

    let dataP = getUserRPG(wdb, arena.penantang)
    let dataT = getUserRPG(wdb, arena.target)
    let userP = dataP.rpg
    let userT = dataT.rpg

    let powerP = userP.level * 10 + Math.floor(Math.random() * 200) + Math.floor(userP.exp / 500)
    let powerT = userT.level * 10 + Math.floor(Math.random() * 200) + Math.floor(userT.exp / 500)

    let cap = `┌───❏「 ⚔️ PERTARUNGAN JAMBAK 」❏\n│\n`
    cap += `│ @${arena.penantang.split('@')[0]} ⚡ ${powerP}\n│ VS\n│ @${arena.target.split('@')[0]} ⚡ ${powerT}\n│\n`

    if(powerP > powerT){
      wdb.money[arena.penantang] += arena.taruhan
      wdb.money[arena.target] -= arena.taruhan
      userP.exp += 50
      userP.stats.jambakMenang++
      userT.stats.jambakKalah++
      cap += `│ 🏆 *PEMENANG*\n│ @${arena.penantang.split('@')[0]}\n│\n│ 💅 Kekuatanmu tak tertandingi!\n│\n│ 💰 +Rp ${arena.taruhan.toLocaleString()}\n│ ✨ +50 Exp`
    } else if(powerT > powerP){
      wdb.money[arena.target] += arena.taruhan
      wdb.money[arena.penantang] -= arena.taruhan
      userT.exp += 50
      userT.stats.jambakMenang++
      userP.stats.jambakKalah++
      cap += `│ 🏆 *PEMENANG*\n│ @${arena.target.split('@')[0]}\n│\n│ 👑 Mahkota ratu tetap di tanganmu!\n│\n│ 💰 +Rp ${arena.taruhan.toLocaleString()}\n│ ✨ +50 Exp`
    } else {
      cap += `│ 🤝 *HASIL: SERI*\n│ Taruhan dikembalikan`
    }
    cap += `\n└───────────────────`

    delete wdb.temp.jambak[arena.id]
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [arena.penantang, arena.target])
  }

  // COMMAND 3: JAMBAKTOLAK - PAKE @TAG
  if (command === 'jambaktolak') {
    let penantangTag = m.mentionedJid[0]
    if(!penantangTag) return m.reply(`❌ Format: *.jambaktolak @penantang*`)

    let arena = Object.values(wdb.temp.jambak).find(a => a.chat === m.chat && a.penantang === penantangTag && a.target === m.sender)
    if(!arena) return m.reply('❌ Tidak ada tantangan jambak dari orang itu ke kamu')

    delete wdb.temp.jambak[arena.id]
    saveDB(wdb)
    return m.reply(`❌ @${m.sender.split('@')[0]} menolak tantangan jambak dari @${penantangTag.split('@')[0]}`, null, { mentions: [m.sender, penantangTag] })
  }
}

handler.all = async function(m) {
  const wdb = loadDB()
  wdb.temp = wdb.temp || {}
  wdb.temp.jambak = wdb.temp.jambak || {}
  for(let id in wdb.temp.jambak){
    let arena = wdb.temp.jambak[id]
    if(Date.now() - arena.waktu > 120000){ // 2 MENIT
      delete wdb.temp.jambak[id]
      saveDB(wdb)
      await this.sendMessage(arena.chat, { text: `⏰ Tantangan jambak dari @${arena.penantang.split('@')[0]} ke @${arena.target.split('@')[0]} telah kadaluarsa`, mentions: [arena.penantang, arena.target] })
    }
  }
}

handler.help = ['jambak @tag [taruhan]', 'jambakterima @tag', 'jambaktolak @tag']
handler.tags = ['rpg']
handler.command = /^(jambak|jambakterima|jambaktolak)$/i
handler.group = true
export default handler