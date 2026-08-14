import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function getTitleJambak(menang) {
  if(menang >= 100) return '👑 Legenda Jambak'
  if(menang >= 50) return '💎 Dewi Jambak'
  if(menang >= 10) return '💅 Ratu Jambak'
  if(menang >= 1) return '✨ Penantang Baru'
  return '🌸 Pemula'
}

function getTitlePanco(menang) {
  if(menang >= 100) return '👑 Legenda Panco'
  if(menang >= 50) return '⚡ Dewa Panco'
  if(menang >= 10) return '💪 Raja Panco'
  if(menang >= 1) return '✨ Penantang Baru'
  return '🥊 Pemula'
}

// fungsi buat cari penantang dari tag atau reply
function getPenantang(m, args) {
  let penantang = m.mentionedJid[0] || m.quoted?.sender
  if(!penantang && args[1]) penantang = args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  return penantang
}

// fungsi auto fix stats biar ga undefined
function initStats(user) {
  user.stats = user.stats || { jambakMenang: 0, jambakKalah: 0, pancoMenang: 0, pancoKalah: 0 }
}

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const wdb = loadDB()
  wdb.temp = wdb.temp || {}
  wdb.temp.arena = wdb.temp.arena || {}

  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  initStats(user) // auto fix

  // 1. JAMBAK - BUAT NANTANG
  if (command === 'jambak') {
    let target = m.mentionedJid[0] || m.quoted?.sender
    if(!target) return m.reply(`❌ Tag cewe yang mau kamu jambak!\nContoh: *${usedPrefix}jambak @tag 50000*`)
    if(target === m.sender) return m.reply('❌ Ga bisa jambak diri sendiri lah 😭')

    let dataTarget = getUserRPG(wdb, target)
    let userTarget = dataTarget.rpg
    if(!userTarget) return m.reply('❌ Target belum memiliki data RPG.')
    initStats(userTarget) // auto fix target

    let uangUser = wdb.money[m.sender] || 0
    let uangTarget = wdb.money[target] || 0
    let taruhanInput = parseInt(args[1])
    let taruhanDefault = Math.floor(Math.min(uangUser, uangTarget) * 0.1)
    if(taruhanDefault < 1000) taruhanDefault = 1000
    let taruhan = taruhanInput? taruhanInput : taruhanDefault

    if(taruhan < 1000) return m.reply('❌ Minimal taruhan Rp 1000')
    if(uangUser < taruhan) return m.reply(`❌ Uang kamu kurang! Punya Rp ${uangUser.toLocaleString()}`)
    if(uangTarget < taruhan) return m.reply(`❌ Uang target kurang! Punya Rp ${uangTarget.toLocaleString()}`)

    let arenaId = `jambak_${Date.now()}_${m.sender}`

    let cap = `┌───❏「 💇 ARENA JAMBAK 」❏\n│\n`
    cap += `│ 👤 *PENANTANG*\n│ @${m.sender.split('@')[0]}\n│ ${getTitleJambak(user.stats.jambakMenang)}\n│ Lv.${user.level} | W-L : ${user.stats.jambakMenang}W - ${user.stats.jambakKalah}L\n`
    cap += `│\n│ ⚔️ *VS*\n│\n`
    cap += `│ 👤 *LAWAN*\n│ @${target.split('@')[0]}\n│ ${getTitleJambak(userTarget.stats.jambakMenang)}\n│ Lv.${userTarget.level} | W-L : ${userTarget.stats.jambakMenang}W - ${userTarget.stats.jambakKalah}L\n`
    cap += `│\n│ 💰 Taruhan : Rp ${taruhan.toLocaleString()}\n`
    cap += `│\n│ Balas pesan ini degan tulisan *terima* atau *tolak*\n│ ⏰ 2 menit\n`
    cap += `└───────────────────`

    wdb.temp.arena[arenaId] = { type: 'jambak', chat: m.chat, penantang: m.sender, target: target, taruhan: taruhan, waktu: Date.now() }
    saveDB(wdb)
    return conn.sendMessage(m.chat, { text: cap, mentions: [m.sender, target] }, { quoted: m })
  }

  // 2. PANCO - BUAT NANTANG
  if (command === 'panco') {
    let target = m.mentionedJid[0] || m.quoted?.sender
    if(!target) return m.reply(`❌ Tag cowo yang mau kamu panco!\nContoh: *${usedPrefix}panco @tag 100000*`)
    if(target === m.sender) return m.reply('❌ Ga bisa panco diri sendiri lah 😭')

    let dataTarget = getUserRPG(wdb, target)
    let userTarget = dataTarget.rpg
    if(!userTarget) return m.reply('❌ Target belum memiliki data RPG.')
    initStats(userTarget) // auto fix target

    let uangUser = wdb.money[m.sender] || 0
    let uangTarget = wdb.money[target] || 0
    let taruhanInput = parseInt(args[1])
    let taruhanDefault = Math.floor(Math.min(uangUser, uangTarget) * 0.1)
    if(taruhanDefault < 1000) taruhanDefault = 1000
    let taruhan = taruhanInput? taruhanInput : taruhanDefault

    if(taruhan < 1000) return m.reply('❌ Minimal taruhan Rp 1000')
    if(uangUser < taruhan) return m.reply(`❌ Uang kamu kurang! Punya Rp ${uangUser.toLocaleString()}`)
    if(uangTarget < taruhan) return m.reply(`❌ Uang target kurang! Punya Rp ${uangTarget.toLocaleString()}`)

    let arenaId = `panco_${Date.now()}_${m.sender}`

    let cap = `┌───❏「 💪 ARENA PANCO 」❏\n│\n`
    cap += `│ 👤 *PENANTANG*\n│ @${m.sender.split('@')[0]}\n│ ${getTitlePanco(user.stats.pancoMenang)}\n│ Lv.${user.level} | ✨ ${user.exp}\n│ W-L : ${user.stats.pancoMenang}W - ${user.stats.pancoKalah}L\n`
    cap += `│\n│ ⚔️ *VS*\n│\n`
    cap += `│ 👤 *LAWAN*\n│ @${target.split('@')[0]}\n│ ${getTitlePanco(userTarget.stats.pancoMenang)}\n│ Lv.${userTarget.level} | ✨ ${userTarget.exp}\n│ W-L : ${userTarget.stats.pancoMenang}W - ${userTarget.stats.pancoKalah}L\n`
    cap += `│\n│ 💰 Taruhan : Rp ${taruhan.toLocaleString()}\n`
    cap += `│\n│ Balas pesan ini degan tulisan *terima* atau *tolak*\n│ ⏰ 2 menit\n`
    cap += `└───────────────────`

    wdb.temp.arena[arenaId] = { type: 'panco', chat: m.chat, penantang: m.sender, target: target, taruhan: taruhan, waktu: Date.now() }
    saveDB(wdb)
    return conn.sendMessage(m.chat, { text: cap, mentions: [m.sender, target] }, { quoted: m })
  }

  // 3. TERIMA - LEWAT COMMAND
  if (command === 'jambakterima' || command === 'pancoterima') {
    let type = command.includes('jambak')? 'jambak' : 'panco'
    let penantangTag = getPenantang(m, args)
    let botJid = conn.user.id ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : ''
    let isBot = penantangTag && botJid && penantangTag.includes(botJid.split('@')[0])
    
    let arenaKey = Object.keys(wdb.temp.arena).find(k => {
      let match = wdb.temp.arena[k].type === type && wdb.temp.arena[k].chat === m.chat && wdb.temp.arena[k].target === m.sender;
      if (penantangTag && !isBot) match = match && wdb.temp.arena[k].penantang === penantangTag;
      return match;
    })
    if(!arenaKey) return m.reply(`❌ Tidak ada tantangan ${type} yang sedang menunggumu saat ini.`)

    let arena = wdb.temp.arena[arenaKey]
    let dataP = getUserRPG(wdb, arena.penantang)
    let dataT = getUserRPG(wdb, arena.target)
    let userP = dataP.rpg
    let userT = dataT.rpg
    initStats(userP) // auto fix
    initStats(userT) // auto fix

    let powerP = userP.level * 10 + Math.floor(Math.random() * 200) + Math.floor(userP.exp / 500)
    let powerT = userT.level * 10 + Math.floor(Math.random() * 200) + Math.floor(userT.exp / 500)

    let cap = `┌───❏「 ⚔️ PERTARUNGAN ${type.toUpperCase()} 」❏\n│\n`
    cap += `│ @${arena.penantang.split('@')[0]} ⚡ ${powerP}\n│ VS\n│ @${arena.target.split('@')[0]} ⚡ ${powerT}\n│\n`

    if(powerP > powerT){
      wdb.money[arena.penantang] += arena.taruhan
      wdb.money[arena.target] -= arena.taruhan
      userP.exp += 50
      if(type === 'jambak'){ userP.stats.jambakMenang++; userT.stats.jambakKalah++ }
      else { userP.stats.pancoMenang++; userT.stats.pancoKalah++ }
      cap += `│ 🏆 *PEMENANG*\n│ @${arena.penantang.split('@')[0]}\n│\n│ 💰 +Rp ${arena.taruhan.toLocaleString()}\n│ ✨ +50 Exp`
    } else if(powerT > powerP){
      wdb.money[arena.target] += arena.taruhan
      wdb.money[arena.penantang] -= arena.taruhan
      userT.exp += 50
      if(type === 'jambak'){ userT.stats.jambakMenang++; userP.stats.jambakKalah++ }
      else { userT.stats.pancoMenang++; userP.stats.pancoKalah++ }
      cap += `│ 🏆 *PEMENANG*\n│ @${arena.target.split('@')[0]}\n│\n│ 💰 +Rp ${arena.taruhan.toLocaleString()}\n│ ✨ +50 Exp`
    } else {
      cap += `│ 🤝 *HASIL: SERI*\n│ Taruhan dikembalikan`
    }
    cap += `\n└───────────────────`

    delete wdb.temp.arena[arenaKey]
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', { mentions: [arena.penantang, arena.target] })
  }

  // 4. TOLAK - LEWAT COMMAND
  if (command === 'jambaktolak' || command === 'pancotolak') {
    let type = command.includes('jambak')? 'jambak' : 'panco'
    let penantangTag = getPenantang(m, args)
    let botJid = conn.user.id ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : ''
    let isBot = penantangTag && botJid && penantangTag.includes(botJid.split('@')[0])

    let arenaKey = Object.keys(wdb.temp.arena).find(k => {
      let match = wdb.temp.arena[k].type === type && wdb.temp.arena[k].chat === m.chat && wdb.temp.arena[k].target === m.sender;
      if (penantangTag && !isBot) match = match && wdb.temp.arena[k].penantang === penantangTag;
      return match;
    })
    if(!arenaKey) return m.reply(`❌ Tidak ada tantangan ${type} yang sedang menunggumu saat ini.`)

    let penantangAsli = wdb.temp.arena[arenaKey].penantang
    delete wdb.temp.arena[arenaKey]
    saveDB(wdb)
    return m.reply(`❌ @${m.sender.split('@')[0]} menolak tantangan ${type} dari @${penantangAsli.split('@')[0]}`, null, { mentions: [m.sender, penantangAsli] })
  }
}

handler.help = ['jambak @tag [taruhan]', 'panco @tag [taruhan]']
handler.tags = ['rpg']
handler.command = /^(jambak|jambakterima|jambaktolak|panco|pancoterima|pancotolak)$/i
handler.group = true

handler.before = async function (m, { conn }) {
    if (!m.text) return
    let txt = m.text.toLowerCase().trim()
    if (txt !== 'terima' && txt !== 'tolak') return
    if (!m.quoted) return

    let cap = m.quoted.text || m.quoted.caption || ''
    let isJambak = cap.includes('JAMBAK')
    let isPanco = cap.includes('PANCO')
    
    // DEBUG:
    if (!isJambak && !isPanco) {
       // Only reply debug if they explicitly replied to something with terima/tolak
       return m.reply(`[DEBUG] No Jambak/Panco found in cap.\n\nCap content:\n${cap}`)
    }

    let type = isJambak ? 'jambak' : 'panco'
    let wdb = loadDB()
    wdb.temp = wdb.temp || {}
    wdb.temp.arena = wdb.temp.arena || {}

    let senderJid = m.sender.split(':')[0] + '@s.whatsapp.net'

    let arenaKey = Object.keys(wdb.temp.arena).find(k => {
      return wdb.temp.arena[k].type === type && wdb.temp.arena[k].chat === m.chat && wdb.temp.arena[k].target === senderJid;
    })

    if (!arenaKey) {
        let debugKeys = Object.keys(wdb.temp.arena).map(k => `Key: ${k}, Target: ${wdb.temp.arena[k].target}`).join('\n')
        m.reply(`❌ Tidak ada tantangan ${type} yang sedang menunggumu saat ini.\n\n[DEBUG Info]\nYour senderJid: ${senderJid}\nPending arenas:\n${debugKeys || 'None'}`)
        return true
    }

    let arena = wdb.temp.arena[arenaKey]

    if (txt === 'tolak') {
        let penantangAsli = arena.penantang
        delete wdb.temp.arena[arenaKey]
        saveDB(wdb)
        m.reply(`❌ @${senderJid.split('@')[0]} menolak tantangan ${type} dari @${penantangAsli.split('@')[0]}`, null, { mentions: [senderJid, penantangAsli] })
        return true
    }

    // Jika Terima
    let dataP = getUserRPG(wdb, arena.penantang)
    let dataT = getUserRPG(wdb, arena.target)
    let userP = dataP.rpg
    let userT = dataT.rpg
    initStats(userP)
    initStats(userT)

    let powerP = userP.level * 10 + Math.floor(Math.random() * 200) + Math.floor(userP.exp / 500)
    let powerT = userT.level * 10 + Math.floor(Math.random() * 200) + Math.floor(userT.exp / 500)

    let resCap = `┌───❏「 ⚔️ PERTARUNGAN ${type.toUpperCase()} 」❏\n│\n`
    resCap += `│ @${arena.penantang.split('@')[0]} ⚡ ${powerP}\n│ VS\n│ @${arena.target.split('@')[0]} ⚡ ${powerT}\n│\n`

    if (powerP > powerT) {
      wdb.money[arena.penantang] += arena.taruhan
      wdb.money[arena.target] -= arena.taruhan
      userP.exp += 50
      if(type === 'jambak'){ userP.stats.jambakMenang++; userT.stats.jambakKalah++ }
      else { userP.stats.pancoMenang++; userT.stats.pancoKalah++ }
      resCap += `│ 🏆 *PEMENANG*\n│ @${arena.penantang.split('@')[0]}\n│\n│ 💰 +Rp ${arena.taruhan.toLocaleString()}\n│ ✨ +50 Exp`
    } else if (powerT > powerP) {
      wdb.money[arena.target] += arena.taruhan
      wdb.money[arena.penantang] -= arena.taruhan
      userT.exp += 50
      if(type === 'jambak'){ userT.stats.jambakMenang++; userP.stats.jambakKalah++ }
      else { userT.stats.pancoMenang++; userP.stats.pancoKalah++ }
      resCap += `│ 🏆 *PEMENANG*\n│ @${arena.target.split('@')[0]}\n│\n│ 💰 +Rp ${arena.taruhan.toLocaleString()}\n│ ✨ +50 Exp`
    } else {
      resCap += `│ 🤝 *HASIL: SERI*\n│ Taruhan dikembalikan`
    }
    resCap += `\n└───────────────────`

    delete wdb.temp.arena[arenaKey]
    saveDB(wdb)
    conn.sendMessage(m.chat, { text: resCap, mentions: [arena.penantang, arena.target] }, { quoted: m })
    return true
}

export default handler