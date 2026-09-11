import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

const MODES = {
  jambak: { nama: 'Jambak', emoji: '💇', verb: 'dijambak' },
  panco: { nama: 'Panco', emoji: '💪', verb: 'diajak panco' },
  dance: { nama: 'Dance Battle', emoji: '💃', verb: 'dance battle' },
  tampar: { nama: 'Tampar', emoji: '🖐️', verb: 'ditampar' },
  tinju: { nama: 'Tinju', emoji: '🥊', verb: 'tinju' }
}

const OLD_KEYS = {
  jambak: ['jambakMenang', 'jambakKalah'],
  panco: ['pancoMenang', 'pancoKalah']
}

function getArenaTitle(wins, mode) {
  const nama = MODES[mode]?.nama || 'Arena'
  if (wins >= 1000) return `👑 Legenda ${nama}`
  if (wins >= 700) return `💎 Master ${nama}`
  if (wins >= 500) return `🏆 Veteran ${nama}`
  if (wins >= 400) return `🌟 Juara ${nama}`
  if (wins >= 250) return `⭐ Bintang ${nama}`
  if (wins >= 200) return `🎯 Spesialis ${nama}`
  if (wins >= 100) return `⚔️ Ahli ${nama}`
  if (wins >= 50) return `🔥 Jagoan ${nama}`
  if (wins >= 10) return `✨ Pemula ${nama}`
  return `🌱 Pendatang ${nama}`
}

function initStats(user) {
  user.stats = user.stats || {}
  user.arenaStats = user.arenaStats || {}

  for (const mode of Object.keys(MODES)) {
    const [oldWin, oldLose] = OLD_KEYS[mode] || []
    const current = user.arenaStats[mode] || {}
    user.arenaStats[mode] = {
      menang: Number(current.menang ?? (oldWin ? user.stats[oldWin] : 0)) || 0,
      kalah: Number(current.kalah ?? (oldLose ? user.stats[oldLose] : 0)) || 0
    }
  }

  return user.arenaStats
}

function totalWins(stats) {
  return Object.values(stats).reduce((total, value) => total + Number(value.menang || 0), 0)
}

function getMode(command, args) {
  if (MODES[command]) return command
  const mode = args[0]?.toLowerCase()
  return MODES[mode] ? mode : null
}

function getTarget(m, conn) {
  const target = m.mentionedJid?.[0] || m.quoted?.sender
  return target ? conn.decodeJid(target) : null
}

function getTaggedTarget(args, conn) {
  const raw = args.find(value => value.includes('@'))
  if (!raw) return null
  const number = raw.replace(/[^0-9]/g, '')
  return number ? conn.decodeJid(`${number}@s.whatsapp.net`) : null
}

function formatRecord(stats, mode) {
  const value = stats[mode]
  return `${getArenaTitle(value.menang, mode)}\n> ↳ ${value.menang} menang - ${value.kalah} kalah`
}

function getPower(user, stats) {
  return Math.max(
    1,
    (Number(user.level) || 1) * 10 +
    Math.floor((Number(user.exp) || 0) / 500) +
    stats.menang * 3 -
    stats.kalah +
    Math.floor(Math.random() * 200)
  )
}

function removeChallenge(id) {
  if (global.arena?.[id]) delete global.arena[id]
}

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const wdb = loadDB()
  global.arena = global.arena || {}
  wdb.money = wdb.money || {}

  const sender = conn.decodeJid(m.sender)
  const data = getUserRPG(wdb, sender)
  const user = data?.rpg || data
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  const stats = initStats(user)

  const action = command === 'arena' ? args[0]?.toLowerCase() : null
  const modeKey = getMode(command, args)
  const mode = modeKey ? MODES[modeKey] : null
  const subAction = command === 'arena' ? args[1]?.toLowerCase() : args[0]?.toLowerCase()

  if (command === 'arena' && (!action || ['menu', 'help'].includes(action))) {
    let cap = `╭─❏「 ⚔️ ARENA AVELIA 」❏\n│ Pilih salah satu mode battle.\n╰─━━━━━━━━━━━━━━─\n\n`
    cap += Object.entries(MODES).map(([key, value]) => `> *${usedPrefix}${key} @tag [taruhan]* ${value.emoji}`).join('\n')
    cap += `\n\n> *${usedPrefix}arena stats* - Statistik arena\n> *${usedPrefix}arena top [halaman]* - Leaderboard`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i198/PELeGje.jpg')
  }

  if (command === 'arena' && action === 'stats') {
    let cap = `╭─❏「 📊 ARENA STATS 」❏\n│ 👤 @${sender.split('@')[0]}\n╰─━━━━━━━━━━━━━━─\n\n`
    for (const [key, value] of Object.entries(MODES)) {
      cap += `${value.emoji} *${value.nama}*\n> ↳ ${formatRecord(stats, key)}\n\n`
    }
    cap += `🏆 *TOTAL MENANG:* ${totalWins(stats)}\n─━━━━━━━━━━━━━━─`
    return conn.reply(m.chat, cap, m, { mentions: [sender] })
  }

  if (command === 'arena' && action === 'top') {
    const page = Math.max(1, parseInt(args[1]) || 1)
    const rows = Object.entries(wdb.users || {})
      .map(([jid, entry]) => {
        const player = entry?.rpg || entry
        if (!player) return null
        return { jid, total: totalWins(initStats(player)) }
      })
      .filter(row => row && row.total > 0)
      .sort((first, second) => second.total - first.total)

    const ownRank = rows.findIndex(row => row.jid === sender) + 1
    const start = (page - 1) * 10
    const visible = rows.slice(start, start + 10)
    let cap = `🏆 *RANK KAMU: ${ownRank || '-'}*\n\n`
    cap += `╭─❏「 🏆 ARENA TOP ${page} 」❏\n│ Total pemain: ${rows.length}\n╰─━━━━━━━━━━━━━━─\n\n`

    if (!visible.length) cap += `❌ Halaman ${page} belum memiliki data.\n`
    for (const [index, row] of visible.entries()) {
      const rank = start + index + 1
      const medal = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`
      cap += `${medal} @${row.jid.split('@')[0]}\n> ↳ Total menang: *${row.total}x*\n\n`
    }

    cap += `─━━━━━━━━━━━━━━─\n> Halaman: ${page}`
    if (start + 10 < rows.length) cap += ` | Berikutnya: ${usedPrefix}arena top ${page + 1}`
    return conn.reply(m.chat, cap, m, { mentions: visible.map(row => row.jid).concat(sender) })
  }

  if (!mode) return m.reply(`❌ Mode arena tidak dikenal. Gunakan *${usedPrefix}arena* untuk melihat pilihan.`)

  const isAccept = subAction === 'terima' || subAction === 'accept'
  const isReject = ['tolak', 'batal', 'reject'].includes(subAction)

  if (isAccept || isReject) {
    const requestedBy = command === 'arena' ? getTaggedTarget(args.slice(2), conn) : getTaggedTarget(args.slice(1), conn)
    const challengeId = Object.keys(global.arena).find(id => {
      const challenge = global.arena[id]
      return challenge.type === modeKey && challenge.chat === m.chat && challenge.target === sender && (!requestedBy || challenge.penantang === requestedBy)
    })

    if (!challengeId) return m.reply(`❌ Tidak ada tantangan ${mode.nama} yang menunggumu.`)
    const challenge = global.arena[challengeId]
    removeChallenge(challengeId)

    if (isReject) {
      return conn.reply(m.chat, `❌ @${sender.split('@')[0]} menolak tantangan ${mode.nama}.`, m, { mentions: [sender, challenge.penantang] })
    }

    const playerAData = getUserRPG(wdb, challenge.penantang)
    const playerBData = getUserRPG(wdb, challenge.target)
    const playerA = playerAData?.rpg || playerAData
    const playerB = playerBData?.rpg || playerBData
    if (!playerA || !playerB) return m.reply('❌ Data salah satu pemain sudah tidak tersedia.')

    const statsA = initStats(playerA)
    const statsB = initStats(playerB)
    const wager = Number(challenge.taruhan) || 0
    if ((wdb.money[challenge.penantang] || 0) < wager || (wdb.money[challenge.target] || 0) < wager) {
      return m.reply('❌ Pertarungan dibatalkan karena saldo taruhan tidak mencukupi.')
    }

    const powerA = getPower(playerA, statsA[modeKey])
    const powerB = getPower(playerB, statsB[modeKey])
    let cap = `╭─❏「 ${mode.emoji} ARENA 」❏\n│ Mode: *${mode.nama}*\n╰─━━━━━━━━━━━━━━─\n\n`
    cap += `👤 @${challenge.penantang.split('@')[0]} ⚡ ${powerA}\n⚔️ *VS*\n👤 @${challenge.target.split('@')[0]} ⚡ ${powerB}\n`

    if (powerA === powerB) {
      cap += `\n🤝 *HASIL: SERI*\n> ↳ Taruhan dikembalikan.`
    } else {
      const winnerIsA = powerA > powerB
      const winner = winnerIsA ? playerA : playerB
      const loser = winnerIsA ? playerB : playerA
      const winnerJid = winnerIsA ? challenge.penantang : challenge.target
      const loserJid = winnerIsA ? challenge.target : challenge.penantang
      winner.arenaStats[modeKey].menang++
      loser.arenaStats[modeKey].kalah++
      winner.exp = (winner.exp || 0) + 50
      wdb.money[winnerJid] = (wdb.money[winnerJid] || 0) + wager
      wdb.money[loserJid] = (wdb.money[loserJid] || 0) - wager
      const winnerTitle = getArenaTitle(winner.arenaStats[modeKey].menang, modeKey)
      cap += `\n🏆 *PEMENANG*\n> ↳ @${winnerJid.split('@')[0]}\n> ↳ Title: *${winnerTitle}*\n> ↳ Hadiah: +Rp ${wager.toLocaleString()}\n> ↳ EXP: +50\n\n💸 *TRANSFER TARUHAN*\n> ↳ Yang kalah: -Rp ${wager.toLocaleString()}`
    }

    cap += `\n\n─━━━━━━━━━━━━━━─`
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', { mentions: [challenge.penantang, challenge.target] })
  }

  const target = getTarget(m, conn)
  if (!target) return m.reply(`❌ Tag atau reply target yang mau ${mode.verb}.\nContoh: *${usedPrefix}${modeKey} @tag 50000*`)
  if (target === sender) return m.reply('❌ Tidak bisa menantang diri sendiri.')

  const targetData = getUserRPG(wdb, target)
  const targetUser = targetData?.rpg || targetData
  if (!targetUser) return m.reply('❌ Target belum memiliki data RPG.')
  initStats(targetUser)

  const taruhanInput = parseInt(command === 'arena' ? args[2] : args[1])
  const taruhanDefault = Math.max(1000, Math.floor(Math.min(wdb.money[sender] || 0, wdb.money[target] || 0) * 0.1))
  const taruhan = taruhanInput || taruhanDefault
  if (taruhan < 1000) return m.reply('❌ Minimal taruhan Rp 1.000.')
  if ((wdb.money[sender] || 0) < taruhan || (wdb.money[target] || 0) < taruhan) return m.reply('❌ Saldo salah satu pemain tidak cukup untuk taruhan.')

  const challengeId = `${modeKey}_${Date.now()}_${sender}`
  global.arena[challengeId] = { type: modeKey, chat: m.chat, penantang: sender, target, taruhan, waktu: Date.now() }
  setTimeout(() => {
    if (!global.arena[challengeId]) return
    delete global.arena[challengeId]
    conn.sendMessage(m.chat, { text: `❌ Tantangan ${mode.nama} kedaluwarsa.` }).catch(() => {})
  }, 120000)

  const cap = `╭─❏「 ${mode.emoji} ARENA 」❏\n│ Mode: *${mode.nama}*\n╰─━━━━━━━━━━━━━━─\n\n` +
    `👤 Penantang: @${sender.split('@')[0]}\n👤 Lawan: @${target.split('@')[0]}\n💰 Taruhan: Rp ${taruhan.toLocaleString()}\n\n` +
    `> Terima: *${usedPrefix}${modeKey} terima*\n> Tolak: *${usedPrefix}${modeKey} tolak*\n> Berlaku selama 2 menit.`
  return conn.sendMessage(m.chat, { text: cap, mentions: [sender, target] }, { quoted: m })
}

handler.help = ['arena', 'arena stats', 'arena top [halaman]', 'jambak @tag [taruhan]', 'panco @tag [taruhan]', 'dance @tag [taruhan]', 'tampar @tag [taruhan]', 'tinju @tag [taruhan]']
handler.tags = ['rpg']
handler.command = /^(arena|jambak|panco|dance|tampar|tinju)$/i
handler.group = true

export default handler
