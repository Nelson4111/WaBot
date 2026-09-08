import { loadDB, saveDB } from '../../lib/waifuHelper.js'

const games = {
  slot: { name: 'Slot', emoji: '🎰', aliases: ['slot'] },
  roulette: { name: 'Roulette', emoji: '🎡', aliases: ['roulette'] },
  blackjack: { name: 'Blackjack', emoji: '🃏', aliases: ['blackjack', 'bj'] },
  dice: { name: 'Dice', emoji: '🎲', aliases: ['dice'] },
  coinflip: { name: 'Coinflip', emoji: '🔄', aliases: ['coinflip', 'cf'] },
  mahjong: { name: 'Mahjong', emoji: '🀄', aliases: ['mahjong'] },
  cups: { name: 'Three Cups', emoji: '🥤', aliases: ['cups', 'threecups'] },
  domino: { name: 'Domino', emoji: '🁣', aliases: ['domino'] },
  uno: { name: 'UNO', emoji: '🃏', aliases: ['uno'] },
  darts: { name: 'Darts', emoji: '🎯', aliases: ['darts'] },
  bingo: { name: 'Bingo', emoji: '🎱', aliases: ['bingo'] },
  hanafuda: { name: 'Hanafuda', emoji: '🎴', aliases: ['hanafuda'] },
  horserace: { name: 'Balap Kuda', emoji: '🏇', aliases: ['horserace', 'balapkuda', 'bk', 'hr'] },
  pool: { name: 'Pool', emoji: '🎱', aliases: ['pool', 'billiard'] },
  rps: { name: 'Rock Paper Scissors', emoji: '✂️', aliases: ['rps'] },
  poker: { name: 'Poker', emoji: '♠️', aliases: ['poker'] },
  chess: { name: 'Chess', emoji: '♟️', aliases: ['chess'] }
}

const GAME_COOLDOWN = 60000
const aliases = Object.fromEntries(Object.entries(games).flatMap(([key, game]) => game.aliases.map(alias => [alias, key])))
const pick = values => values[Math.floor(Math.random() * values.length)]
const number = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const money = value => `Rp ${Math.max(0, value).toLocaleString()}`
const signedMoney = value => `${value >= 0 ? '+' : '-'}Rp ${Math.abs(Number(value) || 0).toLocaleString()}`
const DAILY_LIMIT = 50

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getCasinoStats(user) {
  user.casinoStats = user.casinoStats || { wins: 0, games: 0, profit: 0, byGame: {} }
  user.casinoStats.byGame = user.casinoStats.byGame || {}
  if (user.casinoStats.dailyDate !== todayKey()) {
    user.casinoStats.dailyDate = todayKey()
    user.casinoStats.dailyGames = 0
  }
  user.casinoStats.dailyGames = Number(user.casinoStats.dailyGames || 0)
  user.casinoStats.games = Number(user.casinoStats.games || 0)
  user.casinoStats.wins = Number(user.casinoStats.wins || 0)
  user.casinoStats.profit = Number(user.casinoStats.profit || 0)
  return user.casinoStats
}

function getCasinoTitle(gamesPlayed) {
  if (gamesPlayed >= 1900) return '👑 Casino Legend'
  if (gamesPlayed >= 1800) return '💎 Casino Master'
  if (gamesPlayed >= 1700) return '🔥 Casino Grand'
  if (gamesPlayed >= 1600) return '⚡ Casino Elite'
  if (gamesPlayed >= 1500) return '🏆 Casino Champion'
  if (gamesPlayed >= 1400) return '🌟 Casino Superstar'
  if (gamesPlayed >= 1300) return '💫 Casino Star'
  if (gamesPlayed >= 1200) return '🎯 Casino Ace'
  if (gamesPlayed >= 1100) return '🦁 Casino Dominator'
  if (gamesPlayed >= 1000) return '💰 Casino High Roller'
  if (gamesPlayed >= 900) return '🔥 Casino Pro'
  if (gamesPlayed >= 800) return '⚔️ Casino Expert'
  if (gamesPlayed >= 700) return '🎰 Casino Specialist'
  if (gamesPlayed >= 600) return '🎲 Casino Skilled'
  if (gamesPlayed >= 500) return '💎 Casino Experienced'
  if (gamesPlayed >= 400) return '✨ Casino Advanced'
  if (gamesPlayed >= 300) return '🚀 Casino Rising'
  if (gamesPlayed >= 200) return '🎯 Casino Regular'
  if (gamesPlayed >= 100) return '🎲 Casino Active'
  return '🌱 Casino Novice'
}

function resultFor(game) {
  if (game === 'slot') {
    const symbols = ['🎰', '🔔', '💎', '🍋', '🍒', '💰', '⭐', '🍀', '🍇']
    const reels = Array.from({ length: 9 }, () => pick(symbols))
    const middle = reels.slice(3, 6)
    const jackpot = middle[0] === middle[1] && middle[1] === middle[2]
    const pair = middle[0] === middle[1] || middle[1] === middle[2] || middle[0] === middle[2]
    return { multiplier: jackpot ? 10 : pair ? 1.5 : 0, text: `│ ${reels[0]} | ${reels[1]} | ${reels[2]}\n│ ${reels[3]} | ${reels[4]} | ${reels[5]} ◀\n│ ${reels[6]} | ${reels[7]} | ${reels[8]}` }
  }

  const outcomes = {
    roulette: () => { const value = number(0, 36); return { multiplier: value === 0 ? 3 : Math.random() < 0.45 ? 1.5 : 0, text: `├[ 🎡 Angka ] ${value}\n├[ 🎨 Warna ] ${value === 0 ? 'Hijau' : value % 2 ? 'Hitam' : 'Merah'}` } },
    blackjack: () => { const player = number(15, 21); const dealer = number(15, 21); return { multiplier: player > dealer ? 2 : player === dealer ? 1 : 0, text: `├[ 🃏 Kamu ] ${player}\n├[ 🏦 Dealer ] ${dealer}` } },
    dice: () => { const first = number(1, 6); const second = number(1, 6); return { multiplier: first === second ? 2.5 : first + second >= 8 ? 1.5 : 0, text: `├[ 🎲 Dadu ] ${first} + ${second}\n├[ Total ] ${first + second}` } },
    coinflip: () => ({ multiplier: Math.random() < 0.5 ? 2 : 0, text: `├[ 🔄 Hasil ] ${pick(['Head', 'Tail'])}` }),
    mahjong: () => ({ multiplier: Math.random() < 0.2 ? 4 : Math.random() < 0.45 ? 1.5 : 0, text: `├[ 🀄 Tile ] ${pick(['Dragon', 'Wind', 'Bamboo', 'Circle'])}\n├[ Kombinasi ] ${pick(['Pung', 'Chow', 'Kong', 'Pair'])}` }),
    cups: () => { const choice = number(1, 3); const ball = number(1, 3); return { multiplier: choice === ball ? 3 : 0, text: `├[ 🥤 Pilihan ] Cup ${choice}\n├[ Bola ] Cup ${ball}` } },
    domino: () => { const first = number(0, 6); const second = number(0, 6); return { multiplier: first === second ? 3 : first + second >= 7 ? 1.5 : 0, text: `├[ 🁣 Domino ] [${first}|${second}]\n├[ Total ] ${first + second}` } },
    uno: () => ({ multiplier: Math.random() < 0.1 ? 4 : Math.random() < 0.45 ? 1.5 : 0, text: `├[ 🃏 Kartu ] ${pick(['Skip', 'Reverse', '+2', 'Wild', 'UNO'])}\n├[ Warna ] ${pick(['Merah', 'Kuning', 'Hijau', 'Biru'])}` }),
    darts: () => { const score = number(1, 60); return { multiplier: score >= 50 ? 3 : score >= 30 ? 1.5 : 0, text: `├[ 🎯 Skor ] ${score}\n├[ Target ] Bullseye` } },
    bingo: () => ({ multiplier: Math.random() < 0.08 ? 5 : Math.random() < 0.4 ? 1.5 : 0, text: `├[ 🎱 Nomor ] ${Array.from({ length: 3 }, () => number(1, 75)).join(' - ')}\n├[ Papan ] ${pick(['B-I-N-G-O', 'Hampir Bingo', 'Belum Bingo'])}` }),
    hanafuda: () => ({ multiplier: Math.random() < 0.2 ? 3 : Math.random() < 0.5 ? 1.5 : 0, text: `├[ 🎴 Kartu ] ${pick(['Crane', 'Moon', 'Rain Man', 'Cherry Blossom'])}\n├[ Set ] ${pick(['Bright', 'Ribbon', 'Animal', 'Plain'])}` }),
    horserace: () => { const winner = number(1, 8); return { multiplier: winner === 1 ? 3 : winner <= 3 ? 1.5 : 0, text: `├[ 🏇 Pemenang ] Kuda ${winner}\n├[ Lintasan ] 8 kuda` } },
    pool: () => { const ball = number(1, 15); return { multiplier: ball === 8 ? 4 : ball >= 10 ? 1.5 : 0, text: `├[ 🎱 Bola Masuk ] ${ball}\n├[ Target ] Bola 8` } },
    rps: () => ({ multiplier: Math.random() < 0.33 ? 2 : Math.random() < 0.5 ? 1 : 0, text: `├[ ✊ Kamu ] ${pick(['Rock', 'Paper', 'Scissors'])}\n├[ 🤖 Lawan ] ${pick(['Rock', 'Paper', 'Scissors'])}` }),
    poker: () => ({ multiplier: Math.random() < 0.08 ? 5 : Math.random() < 0.4 ? 2 : 0, text: `├[ ♠️ Hand ] ${pick(['Pair', 'Two Pair', 'Straight', 'Flush', 'Full House'])}\n├[ 🃏 Kartu ] 5 kartu` }),
    chess: () => ({ multiplier: Math.random() < 0.25 ? 2.5 : Math.random() < 0.5 ? 1 : 0, text: `├[ ♟️ Hasil ] ${pick(['Checkmate', 'Menang Posisi', 'Draw', 'Kalah Posisi'])}\n├[ Langkah ] ${number(12, 48)}` })
  }
  return outcomes[game]()
}

function normalizeResult(result) {
  if (result.multiplier > 0) result.multiplier = Math.max(2, result.multiplier)
  result.text = result.text.replaceAll('├[', '│ [')
  return result
}

function formatRemaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes ? `${minutes}m ${remainingSeconds}d` : `${remainingSeconds}d`
}

function getCooldowns(user) {
  user.casinoCooldowns = user.casinoCooldowns || {}
  if (user.lastcasino && !user.casinoCooldowns.slot) user.casinoCooldowns.slot = user.lastcasino
  return user.casinoCooldowns
}

function cooldownMenu(user, prefix) {
  const cooldowns = getCooldowns(user)
  const now = Date.now()
  let cap = `╭─❏「 ⏳ CASINO COOLDOWN 」❏\n`
  cap += `│ Setiap game memiliki cooldown sendiri.\n│ Durasi: ${formatRemaining(GAME_COOLDOWN)}\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  for (const [key, game] of Object.entries(games)) {
    const remaining = (cooldowns[key] || 0) + GAME_COOLDOWN - now
    cap += `${game.emoji} *${game.name}*\n`
    cap += `> ↳ ${remaining > 0 ? `⏳ ${formatRemaining(remaining)} lagi` : `✅ READY (${prefix}casino ${key})`}\n\n`
  }

  return cap + `─━━━━━━━━━━━━━━─`
}

function menu(prefix) {
  const list = Object.entries(games)
    .map(([key, game], index) =>
      `> *${index + 1}. ${game.emoji} ${game.name}*\n` +
      `> ↳ ${prefix}casino ${key} <taruhan>`
    )
    .join('\n\n')

  return `╭─❏「 🎰 AVELIA CASINO 」❏\n` +
    `│ 🎲 Pilih permainan dan masukkan jumlah taruhan.\n` +
    `│ 💰 Minimal taruhan: ${money(100)}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${list}\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `⏳ *COOLDOWN*\n` +
    `> ↳ ${prefix}casino cd\n\n` +
    `👤 *PROFILE*\n` +
    `> ↳ ${prefix}casino profile\n` +
    `> ↳ ${prefix}casino profit\n\n` +
    `🏆 *TOP 20*\n` +
    `> ↳ ${prefix}casino top\n\n` +
    `⚠️ Main secukupnya. Batas: ${DAILY_LIMIT} permainan per hari.`
}

function top(wdb) {
  const players = Object.entries(wdb.users || {})
    .filter(([, user]) => user.rpg?.casinoStats?.games > 0)
    .map(([jid, user]) => ({
      jid,
      wins: user.rpg.casinoStats.wins,
      games: user.rpg.casinoStats.games || 0,
      profit: user.rpg.casinoStats.profit || 0,
      title: getCasinoTitle(user.rpg.casinoStats.games || 0)
    }))
    .sort((a, b) => b.profit - a.profit || b.wins - a.wins)
    .slice(0, 20)

  if (!players.length) {
    return { text: `╭─❏「 🏆 CASINO TOP 」❏\n` +
      `│ Belum ada pemenang.\n` +
      `╰─━━━━━━━━━━━━━━─`, mentions: [] }
  }

  let text = `╭─❏「 🏆 CASINO TOP 20 」❏\n`
  text += `│ Pemain dengan kemenangan terbanyak.\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`

  players.forEach((player, index) => {
    text += `> *${index + 1}. 🏆 @${player.jid.split('@')[0]}*\n`
    text += `> ↳ Title: ${player.title}\n`
    text += `> ↳ Menang: ${player.wins}x\n`
    text += `> ↳ Main: ${player.games}x\n`
    text += `> ↳ Profit: ${signedMoney(player.profit)}\n`

    if (index < players.length - 1) {
      text += `\n─━━━━━━━━━━━━━━─\n`
    }
  })

  return { text, mentions: players.map(player => player.jid) }
}

function profile(user, sender, showProfit = false) {
  const stats = getCasinoStats(user)
  let text = `╭─❏「 🎰 CASINO PROFILE 」❏\n`
  text += `│ 👤 @${sender.split('@')[0]}\n`
  text += `│ 🏷️ Title: ${getCasinoTitle(stats.games)}\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`
  text += `📊 *RINGKASAN*\n`
  text += `> ↳ Total main: ${stats.games}x\n`
  text += `> ↳ Hari ini: ${stats.dailyGames}/${DAILY_LIMIT}x\n`
  text += `> ↳ Menang: ${stats.wins}x\n`
  if (!showProfit) return text + `\n📌 Ketik *.casino profit* untuk melihat total dan detail profit setiap game.`

  text += `> ↳ Profit total: ${signedMoney(stats.profit)}\n`

  text += `\n🎮 *PROFIT PER GAME*\n`
  for (const [key, game] of Object.entries(games)) {
    const entry = stats.byGame[key] || { games: 0, profit: 0 }
    text += `${game.emoji} *${game.name}*\n`
    text += `> ↳ Total: ${entry.games || 0}x | Menang: ${entry.wins || 0}x | Kalah: ${Math.max(0, (entry.games || 0) - (entry.wins || 0))}x\n`
    text += `> ↳ ${signedMoney(entry.profit || 0)}\n\n`
  }
  return text + `⚠️ Main secukupnya. Batas casino: ${DAILY_LIMIT} permainan per hari.`
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const wdb = loadDB()
  const user = wdb.users?.[m.sender]?.rpg

  if (!user) {
    return m.reply(
      `╭─❏「 ❌ CASINO 」❏\n` +
      `│ Kamu belum memiliki data RPG.\n` +
      `│ ↳ Mulailah dengan *${usedPrefix}adventure*.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (!wdb.money) wdb.money = {}
  if (user.casinoBlocked) {
    return m.reply(`╭─❏「 🚫 CASINO 」❏\n│ Akses casino kamu sedang diblokir oleh admin.\n╰─━━━━━━━━━━━━━━─`)
  }
  const stats = getCasinoStats(user)

  const input = (args[0] || '').toLowerCase()

  if (!input) {
    return m.reply(menu(usedPrefix))
  }

  if (input === 'top') {
    const leaderboard = top(wdb)
    return conn.reply(m.chat, leaderboard.text, m, { mentions: leaderboard.mentions })
  }

  if (input === 'profile' || input === 'profil' || input === 'profit') {
    return conn.reply(m.chat, profile(user, m.sender, input === 'profit'), m, { mentions: [m.sender] })
  }

  if (input === 'cd' || input === 'cooldown') {
    return m.reply(cooldownMenu(user, usedPrefix))
  }

  const legacySlot = /^\d+$/.test(input)
  const game = legacySlot ? 'slot' : aliases[input]

  if (!game) {
    return m.reply(menu(usedPrefix))
  }

  if (stats.dailyGames >= DAILY_LIMIT) {
    return m.reply(
      `╭─❏「 🛑 BATAS CASINO 」❏\n` +
      `│ Kamu sudah bermain ${DAILY_LIMIT}x hari ini.\n` +
      `│ Akses casino diblokir sampai hari berganti.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `⚠️ Istirahat dulu dan main secukupnya.`
    )
  }

  const bet = Number(legacySlot ? input : args[1])

  if (!Number.isInteger(bet) || bet < 100) {
    return m.reply(
      `╭─❏「 ❌ TARUHAN 」❏\n` +
      `│ 💰 Minimal taruhan: ${money(100)}\n` +
      `│ 📌 Contoh:\n` +
      `> ↳ *${usedPrefix}casino ${game} 1000*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if ((wdb.money[m.sender] || 0) < bet) {
    return m.reply(
      `╭─❏「 ❌ TARUHAN 」❏\n` +
      `│ 💸 Uang di saku kamu tidak cukup!\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  const cooldowns = getCooldowns(user)
  const lastPlayed = cooldowns[game] || 0
  const elapsed = Date.now() - lastPlayed

  if (elapsed < GAME_COOLDOWN) {
    return m.reply(
      `╭─❏「 ⏳ CASINO 」❏\n` +
      `│ ${games[game].name} masih cooldown.\n` +
      `│ Tunggu ${formatRemaining(GAME_COOLDOWN - elapsed)} lagi.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  const result = normalizeResult(resultFor(game))
  const payout = Math.floor(bet * result.multiplier)
  const net = payout - bet

  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + net
  cooldowns[game] = Date.now()

  stats.games++
  stats.dailyGames++
  stats.byGame[game] = stats.byGame[game] || { games: 0, wins: 0, profit: 0 }
  stats.byGame[game].games++
  stats.byGame[game].profit = Number(stats.byGame[game].profit || 0) + net

  if (result.multiplier > 0) {
    stats.wins++
    stats.byGame[game].wins++
  }

  stats.profit = Number(stats.profit || 0) + net

  saveDB(wdb)

  const status =
    result.multiplier >= 10
      ? `🏆 *JACKPOT*`
      : result.multiplier > 0
        ? `🎉 *MENANG*`
        : `💀 *KALAH*`

  return m.reply(
    `╭─❏「 ${games[game].emoji} ${games[game].name.toUpperCase()} 」❏\n` +
    `${result.text}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🎲 *HASIL*\n` +
    `> ↳ ${status}\n` +
    `> ↳ Taruhan: ${money(bet)}\n` +
    `> ↳ Hadiah: ${money(payout)}\n` +
    `> ↳ Profit: ${signedMoney(net)}\n` +
    `> ↳ 💰 Saldo: ${money(wdb.money[m.sender])}\n` +
    `\n─━━━━━━━━━━━━━━─\n` +
    `⚠️ Main secukupnya. Hari ini: ${stats.dailyGames}/${DAILY_LIMIT}x.`
  )
}

handler.help = [
  'casino',
  'casino top',
  'casino profile',
  'casino profit',
  'casino cd',
  'casino cooldown',
  ...Object.keys(games).map(key => `casino ${key} <taruhan>`)
]

handler.tags = ['rpg']
handler.command = ['casino']
handler.group = true

export default handler