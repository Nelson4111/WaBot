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

function getPenantang(m, args, conn) {
  let tagDariArgs = args.find(v => v.includes('@'))
  if (tagDariArgs) {
    return conn.decodeJid(tagDariArgs.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
  }
  let penantang = m.mentionedJid[0] || m.quoted?.sender
  if (penantang) return conn.decodeJid(penantang)
  return penantang
}

// fungsi auto fix stats biar ga undefined
function initStats(user) {
  user.stats = user.stats || { jambakMenang: 0, jambakKalah: 0, pancoMenang: 0, pancoKalah: 0 }
}

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const wdb = loadDB()
  global.arena = global.arena || {}

  let senderJid = conn.decodeJid(m.sender)
  let data = getUserRPG(wdb, senderJid)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  initStats(user) // auto fix

  // 1. JAMBAK - BUAT NANTANG
  if (command === 'jambak') {
    let targetRaw = m.mentionedJid[0] || m.quoted?.sender
    if(!targetRaw) return m.reply(`❌ Tag orang yang mau kamu jambak!\nContoh: *${usedPrefix}jambak @tag 50000*`)
    let target = conn.decodeJid(targetRaw)
    if(target === senderJid) return m.reply('❌ Ga bisa jambak diri sendiri lah 😭')

    let dataTarget = getUserRPG(wdb, target)
    if(dataTarget.isDummy) return m.reply('❌ Target belum pernah mendaftar/chat dengan bot. Tidak bisa ditantang!')
    let userTarget = dataTarget.rpg
    if(!userTarget) return m.reply('❌ Target belum memiliki data RPG.')
    initStats(userTarget) // auto fix target

    let uangUser = wdb.money[senderJid] || 0
    let uangTarget = wdb.money[target] || 0
    let taruhanInput = parseInt(args[1])
    let taruhanDefault = Math.floor(Math.min(uangUser, uangTarget) * 0.1)
    if(taruhanDefault < 1000) taruhanDefault = 1000
    let taruhan = taruhanInput? taruhanInput : taruhanDefault

    if(taruhan < 1000) return m.reply('❌ Minimal taruhan Rp 1000')
    if(uangUser < taruhan) return m.reply(`❌ Uang kamu kurang! Punya Rp ${uangUser.toLocaleString()}`)
    if(uangTarget < taruhan) return m.reply(`❌ Uang target kurang! Punya Rp ${uangTarget.toLocaleString()}`)

    let arenaId = `jambak_${Date.now()}_${senderJid}`

    let cap = `┌───❏「 💇 ARENA JAMBAK 」❏\n│\n`
    cap += `│ 👤 *PENANTANG*\n│ @${senderJid.split('@')[0]}\n│ ${getTitleJambak(user.stats.jambakMenang)}\n│ Lv.${user.level} | W-L : ${user.stats.jambakMenang}W - ${user.stats.jambakKalah}L\n`
    cap += `│\n│ ⚔️ *VS*\n│\n`
    cap += `│ 👤 *LAWAN*\n│ @${target.split('@')[0]}\n│ ${getTitleJambak(userTarget.stats.jambakMenang)}\n│ Lv.${userTarget.level} | W-L : ${userTarget.stats.jambakMenang}W - ${userTarget.stats.jambakKalah}L\n`
    cap += `│\n│ 💰 Taruhan : Rp ${taruhan.toLocaleString()}\n`
    cap += `│\n│ Silakan klik tombol di bawah untuk\n│ menerima atau menolak tantangan!\n│ ⏰ 2 menit\n`
    cap += `└───────────────────`

    global.arena[arenaId] = { type: 'jambak', chat: m.chat, penantang: senderJid, target: target, taruhan: taruhan, waktu: Date.now() }
    
    // Auto hapus setelah 2 menit
    setTimeout(() => {
        if (global.arena[arenaId]) {
            delete global.arena[arenaId]
            conn.sendMessage(m.chat, { text: `❌ Tantangan Jambak dari @${senderJid.split('@')[0]} kepada @${target.split('@')[0]} telah kedaluwarsa.`, mentions: [senderJid, target] }).catch(() => {})
        }
    }, 120000)

    let buttons = [
        ["Terima ⚔️", `.jambakterima @${senderJid.split('@')[0]}`],
        ["Tolak 🏃", `.jambaktolak @${senderJid.split('@')[0]}`]
    ]
    return conn.sendButton(m.chat, cap, "Pilih Aksi", buttons, m, { mentions: [senderJid, target] })
  }

  // 2. PANCO - BUAT NANTANG
  if (command === 'panco') {
    let targetRaw = m.mentionedJid[0] || m.quoted?.sender
    if(!targetRaw) return m.reply(`❌ Tag orang yang mau diajak panco!\nContoh: *${usedPrefix}panco @tag 50000*`)
    let target = conn.decodeJid(targetRaw)
    if(target === senderJid) return m.reply('❌ Ga bisa panco diri sendiri lah 😭')

    let dataTarget = getUserRPG(wdb, target)
    if(dataTarget.isDummy) return m.reply('❌ Target belum pernah mendaftar/chat dengan bot. Tidak bisa ditantang!')
    let userTarget = dataTarget.rpg
    if(!userTarget) return m.reply('❌ Target belum memiliki data RPG.')
    initStats(userTarget) // auto fix target

    let uangUser = wdb.money[senderJid] || 0
    let uangTarget = wdb.money[target] || 0
    let taruhanInput = parseInt(args[1])
    let taruhanDefault = Math.floor(Math.min(uangUser, uangTarget) * 0.1)
    if(taruhanDefault < 1000) taruhanDefault = 1000
    let taruhan = taruhanInput? taruhanInput : taruhanDefault

    if(taruhan < 1000) return m.reply('❌ Minimal taruhan Rp 1000')
    if(uangUser < taruhan) return m.reply(`❌ Uang kamu kurang! Punya Rp ${uangUser.toLocaleString()}`)
    if(uangTarget < taruhan) return m.reply(`❌ Uang target kurang! Punya Rp ${uangTarget.toLocaleString()}`)

    let arenaId = `panco_${Date.now()}_${senderJid}`

    let cap = `┌───❏「 💪 ARENA PANCO 」❏\n│\n`
    cap += `│ 👤 *PENANTANG*\n│ @${senderJid.split('@')[0]}\n│ ${getTitlePanco(user.stats.pancoMenang)}\n│ Lv.${user.level} | ✨ ${user.exp}\n│ W-L : ${user.stats.pancoMenang}W - ${user.stats.pancoKalah}L\n`
    cap += `│\n│ ⚔️ *VS*\n│\n`
    cap += `│ 👤 *LAWAN*\n│ @${target.split('@')[0]}\n│ ${getTitlePanco(userTarget.stats.pancoMenang)}\n│ Lv.${userTarget.level} | ✨ ${userTarget.exp}\n│ W-L : ${userTarget.stats.pancoMenang}W - ${userTarget.stats.pancoKalah}L\n`
    cap += `│\n│ 💰 Taruhan : Rp ${taruhan.toLocaleString()}\n`
    cap += `│\n│ Silakan klik tombol di bawah untuk\n│ menerima atau menolak tantangan!\n│ ⏰ 2 menit\n`
    cap += `└───────────────────`

    global.arena[arenaId] = { type: 'panco', chat: m.chat, penantang: senderJid, target: target, taruhan: taruhan, waktu: Date.now() }
    
    // Auto hapus setelah 2 menit
    setTimeout(() => {
        if (global.arena[arenaId]) {
            delete global.arena[arenaId]
            conn.sendMessage(m.chat, { text: `❌ Tantangan Panco dari @${senderJid.split('@')[0]} kepada @${target.split('@')[0]} telah kedaluwarsa.`, mentions: [senderJid, target] }).catch(() => {})
        }
    }, 120000)

    let buttons = [
        ["Terima 💪", `.pancoterima @${senderJid.split('@')[0]}`],
        ["Tolak 🏃", `.pancotolak @${senderJid.split('@')[0]}`]
    ]
    return conn.sendButton(m.chat, cap, "Pilih Aksi", buttons, m, { mentions: [senderJid, target] })
  }

  // 3. TERIMA - LEWAT COMMAND
  if (command === 'jambakterima' || command === 'pancoterima') {
    let type = command.includes('jambak')? 'jambak' : 'panco'
    let penantangTag = getPenantang(m, args, conn)
    let botJid = conn.user.id ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : ''
    let isBot = penantangTag && botJid && penantangTag.includes(botJid.split('@')[0])
    
    let meta = await conn.groupMetadata(m.chat).catch(() => null)
    let arenaKey = null
    for (let k in global.arena) {
      let a = global.arena[k]
      if (a.type !== type || a.chat !== m.chat) continue
      
      let isTarget = (a.target === senderJid)
      if (!isTarget && meta && meta.participants) {
         let pTarget = meta.participants.find(p => p.id === a.target || p.lid === a.target)
         let pSender = meta.participants.find(p => p.id === senderJid || p.lid === senderJid)
         if (pTarget && pSender && pTarget.id === pSender.id) isTarget = true
      }
      
      let match = isTarget
      if (penantangTag && !isBot) match = match && a.penantang === penantangTag
      
      if (match) {
         arenaKey = k
         break
      }
    }
    if(!arenaKey) return m.reply(`❌ Tidak ada tantangan ${type} yang sedang menunggumu saat ini.`)

    let arena = global.arena[arenaKey]
    
    // VALIDASI ULANG UANG SEBELUM MAIN (Mencegah uang minus)
    let uangP = wdb.money[arena.penantang] || 0
    let uangT = wdb.money[arena.target] || 0
    if (uangP < arena.taruhan) {
        delete global.arena[arenaKey]
        return m.reply(`❌ Pertarungan dibatalkan! Penantang (@${arena.penantang.split('@')[0]}) tidak memiliki cukup uang lagi.`, null, { mentions: [arena.penantang] })
    }
    if (uangT < arena.taruhan) {
        delete global.arena[arenaKey]
        return m.reply(`❌ Pertarungan dibatalkan! Kamu tidak memiliki cukup uang untuk membayar taruhan Rp ${arena.taruhan.toLocaleString()}.`)
    }
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

    delete global.arena[arenaKey]
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', { mentions: [arena.penantang, arena.target] })
  }

  // 4. TOLAK - LEWAT COMMAND
  if (command === 'jambaktolak' || command === 'pancotolak') {
    let type = command.includes('jambak')? 'jambak' : 'panco'
    let penantangTag = getPenantang(m, args, conn)
    let botJid = conn.user.id ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : ''
    let isBot = penantangTag && botJid && penantangTag.includes(botJid.split('@')[0])

    let meta = await conn.groupMetadata(m.chat).catch(() => null)
    let arenaKey = null
    for (let k in global.arena) {
      let a = global.arena[k]
      if (a.type !== type || a.chat !== m.chat) continue
      
      let isTarget = (a.target === senderJid)
      if (!isTarget && meta && meta.participants) {
         let pTarget = meta.participants.find(p => p.id === a.target || p.lid === a.target)
         let pSender = meta.participants.find(p => p.id === senderJid || p.lid === senderJid)
         if (pTarget && pSender && pTarget.id === pSender.id) isTarget = true
      }
      
      let match = isTarget
      if (penantangTag && !isBot) match = match && a.penantang === penantangTag
      
      if (match) {
         arenaKey = k
         break
      }
    }
    if(!arenaKey) return m.reply(`❌ Tidak ada tantangan ${type} yang sedang menunggumu saat ini.`)

    let penantangAsli = global.arena[arenaKey].penantang
    delete global.arena[arenaKey]
    return m.reply(`❌ @${senderJid.split('@')[0]} menolak tantangan ${type} dari @${penantangAsli.split('@')[0]}`, null, { mentions: [senderJid, penantangAsli] })
  }
}

handler.help = ['jambak @tag [taruhan]', 'panco @tag [taruhan]']
handler.tags = ['rpg']
handler.command = /^(jambak|jambakterima|jambaktolak|panco|pancoterima|pancotolak)$/i
handler.group = true

export default handler