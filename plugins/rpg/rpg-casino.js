import { randomInt as cryptoRandomInt } from 'node:crypto'
import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { isPremiumUser } from './rpg-bank.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { sendRpgButtons, sendRpgConfirmButtons, sendRpgQuickButton, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { AUCTION_BIDDER_NAMES } from '../../lib/rpg-auctionData.js'
import {
  addRpgMoney,
  compareRpgMoney,
  formatRpgMoney,
  formatRpgNumber,
  getRpgMoneySuffixGuide,
  maxRpgMoney,
  minRpgMoney,
  multiplyRpgMoney,
  normalizeRpgMoney,
  parseRpgMoneyAmount,
  subtractRpgMoney
} from '../../lib/rpgMoney.js'
import { getRpgWibDateKey, getRpgWibWeekKey } from '../../lib/rpgTime.js'
import { getGroupTotemBuff } from '../../lib/rpg-totemData.js'

const games = {
  slot: { name: 'Slot', emoji: '🎰', aliases: ['slot'], minBet: 10000 },
  roulette: { name: 'Roulette', emoji: '🎡', aliases: ['roulette'], minBet: 500 },
  blackjack: { name: 'Blackjack', emoji: '🃏', aliases: ['blackjack', 'bj'], minBet: 100 },
  dice: { name: 'Dice', emoji: '🎲', aliases: ['dice'], minBet: 250 },
  coinflip: { name: 'Coinflip', emoji: '🔄', aliases: ['coinflip', 'cf'], minBet: 100 },
  mahjong: { name: 'Mahjong', emoji: '🀄', aliases: ['mahjong'], minBet: 1000 },
  cups: { name: 'Three Cups', emoji: '🥤', aliases: ['cups', 'threecups'], minBet: 500 },
  domino: { name: 'Domino', emoji: '🁣', aliases: ['domino'], minBet: 500 },
  uno: { name: 'UNO', emoji: '🃏', aliases: ['uno'], minBet: 1000 },
  darts: { name: 'Darts', emoji: '🎯', aliases: ['darts'], minBet: 500 },
  bingo: { name: 'Bingo', emoji: '🎱', aliases: ['bingo'], minBet: 2500 },
  hanafuda: { name: 'Hanafuda', emoji: '🎴', aliases: ['hanafuda', 'hf'], minBet: 500 },
  horserace: { name: 'Balap Kuda', emoji: '🏇', aliases: ['horserace', 'balapkuda', 'bk', 'hr'], minBet: 500 },
  pool: { name: 'Pool', emoji: '🎱', aliases: ['pool', 'billiard'], minBet: 1000 },
  rps: { name: 'Rock Paper Scissors', emoji: '✂️', aliases: ['rps'], minBet: 100 },
  poker: { name: 'Poker', emoji: '♠️', aliases: ['poker'], minBet: 2500 },
  chess: { name: 'Chess', emoji: '♟️', aliases: ['chess'], minBet: 250 },
  blacksapphire: { name: 'Black Sapphire', emoji: '💠', aliases: ['blacksapphire', 'black-sapphire', 'bs'], minBet: 2500 },
  keno: { name: 'Keno', emoji: '🎟️', aliases: ['keno'], minBet: 1000 },
  mines: { name: 'Mines', emoji: '💣', aliases: ['mines'], minBet: 2500 },
  squidgames: { name: 'Squid Games', emoji: '🦑', aliases: ['squidgames', 'squid-games'], minBet: 5000 },
  ludo: { name: 'Ludo', emoji: '🎲', aliases: ['ludo'], minBet: 500 },
  baccarat: { name: 'Baccarat', emoji: '🂡', aliases: ['baccarat'], minBet: 5000 },
  craps: { name: 'Craps', emoji: '🎲', aliases: ['craps'], minBet: 5000 },
  pontoon: { name: 'Pontoon', emoji: '🃏', aliases: ['pontoon'], minBet: 500 },
  boxing: { name: 'Boxing', emoji: '🥊', aliases: ['boxing'], minBet: 1000 },
  hungergames: { name: 'Hunger Games', emoji: '🏹', aliases: ['hungergames', 'hunger-games'], minBet: 10000 },
  hazard: { name: 'Hazard', emoji: '🎲', aliases: ['hazard'], minBet: 2500 },
  yahtzee: { name: 'Yahtzee', emoji: '🎲', aliases: ['yahtzee'], minBet: 5000 },
  tripeaks: { name: 'Tripeaks', emoji: '🂠', aliases: ['tripeaks', 'tri-peaks'], minBet: 2500 },
  accordion: { name: 'Accordion', emoji: '🂠', aliases: ['accordion'], minBet: 1000 },
  crash: { name: 'Crash', emoji: '📈', aliases: ['crash'], minBet: 10000 },
  farkle: { name: 'Farkle', emoji: '🎲', aliases: ['farkle'], minBet: 2500 },
  spinner: { name: 'Spinner', emoji: '🌀', aliases: ['spinner'], minBet: 500 },
  match: { name: 'Match', emoji: '🎴', aliases: ['match'], minBet: 2500 },
  reddog: { name: 'Red Dog', emoji: '🐕', aliases: ['reddog', 'red-dog'], minBet: 2500 },
  solitaire: { name: 'Solitaire', emoji: '🃏', aliases: ['solitaire'], minBet: 2500 },
  doors: { name: 'Doors', emoji: '🚪', aliases: ['doors'], minBet: 1000 },
  puzzle: { name: 'Puzzle', emoji: '🧩', aliases: ['puzzle'], minBet: 5000 },
  cipher: { name: 'Cipher', emoji: '🔐', aliases: ['cipher'], minBet: 2500 },
  riddle: { name: 'Riddle', emoji: '❓', aliases: ['riddle'], minBet: 1000 },
  jenga: { name: 'Jenga', emoji: '🪵', aliases: ['jenga'], minBet: 1000 },
  monopoly: { name: 'Monopoly', emoji: '🏠', aliases: ['monopoly'], minBet: 5000 },
  snakes: { name: 'Snakes and Ladders', emoji: '🐍', aliases: ['snakes', 'snl', 'snakesandladders', 'snakes-and-ladders'], minBet: 2500 },
  parcheesi: { name: 'Parcheesi', emoji: '🎲', aliases: ['parcheesi'], minBet: 2500 }
}

const GAME_COOLDOWN = 60000
const aliases = Object.fromEntries(Object.entries(games).flatMap(([key, game]) => game.aliases.map(alias => [alias, key])))
const pick = values => values[Math.floor(Math.random() * values.length)]
const number = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const money = value => formatRpgMoney(maxRpgMoney(0, normalizeRpgMoney(value)))
const signedMoney = value => {
  const amount = normalizeRpgMoney(value)
  return `${compareRpgMoney(amount, 0) >= 0 ? '+' : '-'}${formatRpgMoney(compareRpgMoney(amount, 0) < 0 ? subtractRpgMoney(0, amount) : amount)}`
}
const DAILY_LIMIT = 25
const PREMIUM_DAILY_LIMIT = 50
const CASINO_BLACKOUT_TARGET_COUNT = 5
const CASINO_GUARD_CONFIRMATION_TTL = 5 * 60 * 1000
const MAX_CASINO_SIMULATION_BET = 1_000_000_000_000
const MIN_RANDOM_CASINO_SIMULATION_BET = 1_000_000_001
const CASINO_IMAGE = 'https://c.termai.cc/i173/pemtc.jpg'
const CASINO_ROOM_IMAGE = 'https://c.termai.cc/i125/FOKafe.jpg'
const winDialogs = [
  'Yes! Kali ini keberuntungan di pihakku!',
  'Mantap, hadiahnya masuk!',
  'Aku tahu pilihanku tepat!',
  'Wah, hasilnya lebih bagus dari dugaan!',
  'Menang! Saatnya simpan hasilnya.',
  'Nice! Hasilnya sesuai harapan.',
  'Berhasil! Kali ini tepat sasaran.',
  'Yes, pilihan yang bagus!',
  'Lumayan, dapat hasil juga!',
  'Akhirnya menang juga!',
  'Keberuntunganku lagi bagus hari ini.',
  'Hasil yang memuaskan!',
  'Mantap, nggak sia-sia pilih tadi.',
  'Yes! Hadiahnya aman.',
  'Kali ini feeling-ku benar.',
  'Berhasil melewati ronde ini!',
  'Wah, rezeki datang juga.',
  'Menang lagi, mantap!',
  'Pilihan tepat, hasil mantap!',
  'Oke, hasilnya sesuai perkiraan.',
  'Beruntung banget kali ini!',
  'Yes! Dapat juga hadiahnya.',
  'Kali ini aku nggak salah pilih.',
  'Mantap, hasilnya masuk kantong.',
  'Ronde ini berhasil dimenangkan!'
]
const loseDialogs = [
  'Yah, kali ini belum beruntung.',
  'Hampir saja! Coba lagi nanti.',
  'Aku harus lebih hati-hati memilih.',
  'Aduh, taruhanku melayang.',
  'Belum rezeki, cukup sampai di sini dulu.',
  'Yah, hasilnya nggak sesuai harapan.',
  'Kali ini pilihanku kurang tepat.',
  'Aduh, meleset sedikit.',
  'Belum berhasil di ronde ini.',
  'Yah, harus coba lagi lain waktu.',
  'Sepertinya keberuntungan sedang pergi.',
  'Kali ini kurang beruntung.',
  'Aduh, salah pilih.',
  'Hasilnya di luar perkiraan.',
  'Belum waktunya menang.',
  'Yah, kesempatan kali ini lewat.',
  'Aku harus lebih sabar memilih.',
  'Kali ini hasilnya kurang bagus.',
  'Sayang sekali, hampir berhasil.',
  'Yah, taruhan kali ini hilang.',
  'Belum dapat hasil yang diinginkan.',
  'Mungkin ronde berikutnya lebih baik.',
  'Kali ini feeling-ku meleset.',
  'Nggak apa-apa, coba lagi nanti.',
  'Ronde ini belum berpihak kepadaku.'
]
const ROOM_GAMES = {
  blacksapphire: { name: 'Black Sapphire', emoji: '💠', aliases: ['blacksapphire', 'black-sapphire', 'bs'] },
  uno: { name: 'UNO', emoji: '🃏', aliases: ['uno'] },
  mahjong: { name: 'Mahjong', emoji: '🀄', aliases: ['mahjong'] },
  poker: { name: 'Poker', emoji: '♠️', aliases: ['poker'] },
  monopoly: { name: 'Monopoly', emoji: '🏠', aliases: ['monopoly'] },
  jenga: { name: 'Jenga', emoji: '🪵', aliases: ['jenga'] },
  horserace: { name: 'Balap Kuda', emoji: '🏇', aliases: ['horserace', 'balapkuda', 'hr'] },
  ludo: { name: 'Ludo', emoji: '🎲', aliases: ['ludo'] },
  snakes: { name: 'Snakes and Ladders', emoji: '🐍', aliases: ['snakes', 'snl', 'snakesandladders'] },
  parcheesi: { name: 'Parcheesi', emoji: '🎲', aliases: ['parcheesi'] },
  squidgames: { name: 'Squid Games', emoji: '🦑', aliases: ['squidgames', 'squid-games'] },
  hungergames: { name: 'Hunger Games', emoji: '🏹', aliases: ['hungergames', 'hunger-games'] }
}
const ROOM_GAME_ALIASES = Object.fromEntries(Object.entries(ROOM_GAMES).flatMap(([key, game]) => game.aliases.map(alias => [alias, key])))
const ROOM_IDLE_TIMEOUT = 30 * 60 * 1000
const randomRoomPlayer = players => players[cryptoRandomInt(players.length)]

function getPlayerCasinoRoom(wdb, jid) {
  if (!wdb?.casinoRooms || !jid) return null
  for (const room of Object.values(wdb.casinoRooms)) {
    if (Array.isArray(room?.players) && room.players.includes(jid)) return room
  }
  return null
}

function refundCasinoRoom(room, wdb) {
  for (const [jid, contribution] of Object.entries(room.contributions || {})) {
    const amount = normalizeRpgMoney(contribution)
    if (compareRpgMoney(amount, 0) > 0) {
      wdb.money[jid] = addRpgMoney(wdb.money[jid] || 0, amount)
    }
  }
}

function cleanupExpiredCasinoRooms(wdb, now = Date.now()) {
  let removed = false
  wdb.casinoRooms = wdb.casinoRooms || {}

  for (const [chat, room] of Object.entries(wdb.casinoRooms)) {
    const lastActivityAt = Number(room.lastActivityAt || room.createdAt || 0)
    if (now - lastActivityAt < ROOM_IDLE_TIMEOUT) continue
    refundCasinoRoom(room, wdb)
    delete wdb.casinoRooms[chat]
    removed = true
  }

  return removed
}

const casinoRoomCleanupTimer = setInterval(() => {
  const wdb = loadDB()
  if (cleanupExpiredCasinoRooms(wdb)) void saveDB(wdb)
}, 60_000)
casinoRoomCleanupTimer.unref?.()

function getDailyLimit(jid, wdb) {
  return isPremiumUser(jid, wdb) ? PREMIUM_DAILY_LIMIT : DAILY_LIMIT
}

function todayKey() {
  return getRpgWibDateKey()
}

function casinoWeekKey(now = Date.now()) {
  return getRpgWibWeekKey(now)
}

function getBlackoutRecoveryAmount(blackout) {
  const amount = normalizeRpgMoney(blackout?.amount)
  const recovered = addRpgMoney(
    addRpgMoney(blackout?.guardRecovered || 0, blackout?.insuredRecovered || 0),
    blackout?.panelRefunded || 0
  )
  return maxRpgMoney(0, subtractRpgMoney(amount, recovered))
}

function getLatestRecoverableBlackout(user, weekKey = null) {
  const blackouts = Array.isArray(user.casinoBlackouts) ? user.casinoBlackouts : []
  return [...blackouts].reverse().find(blackout =>
    (!weekKey || blackout.weekKey === weekKey) && compareRpgMoney(getBlackoutRecoveryAmount(blackout), 0) > 0
  )
}

function makeBlackoutTargets() {
  const availableNames = [...AUCTION_BIDDER_NAMES]
  const targets = []
  while (targets.length < CASINO_BLACKOUT_TARGET_COUNT && availableNames.length) {
    const index = number(0, availableNames.length - 1)
    targets.push(availableNames.splice(index, 1)[0])
  }
  return targets
}

const CASINO_OUTCOME_KEYS = ['wins', 'losses', 'jackpots', 'blackouts', 'payoutDenied', 'escapes', 'dealerMercies']

function emptyCasinoOutcomes() {
  return { games: 0, wins: 0, losses: 0, jackpots: 0, blackouts: 0, payoutDenied: 0, escapes: 0, dealerMercies: 0, byGame: {} }
}

function normalizeCasinoOutcomes(outcomes) {
  const normalized = outcomes && typeof outcomes === 'object' ? outcomes : emptyCasinoOutcomes()
  normalized.games = Number(normalized.games || 0)
  for (const key of CASINO_OUTCOME_KEYS) normalized[key] = Number(normalized[key] || 0)
  if (!normalized.byGame || typeof normalized.byGame !== 'object') normalized.byGame = {}
  for (const [game, entry] of Object.entries(normalized.byGame)) {
    normalized.byGame[game] = { ...emptyCasinoOutcomes(), ...entry }
    for (const key of ['games', ...CASINO_OUTCOME_KEYS]) {
      normalized.byGame[game][key] = Number(normalized.byGame[game][key] || 0)
    }
    delete normalized.byGame[game].byGame
  }
  return normalized
}

function getCasinoStats(user) {
  user.casinoStats = user.casinoStats || { wins: 0, games: 0, profit: 0, byGame: {} }
  user.casinoStats.byGame = user.casinoStats.byGame || {}
  if (user.casinoStats.dailyDate !== todayKey()) {
    user.casinoStats.dailyDate = todayKey()
    user.casinoStats.dailyGames = 0
    user.casinoStats.dailyResults = emptyCasinoOutcomes()
    user.casinoStats.dailyHistory = []
  }
  user.casinoStats.dailyGames = Number(user.casinoStats.dailyGames || 0)
  user.casinoStats.games = Number(user.casinoStats.games || 0)
  user.casinoStats.wins = Number(user.casinoStats.wins || 0)
  user.casinoStats.profit = normalizeRpgMoney(user.casinoStats.profit)
  user.casinoStats.dailyResults = normalizeCasinoOutcomes(user.casinoStats.dailyResults)
  user.casinoStats.dailyHistory = Array.isArray(user.casinoStats.dailyHistory) ? user.casinoStats.dailyHistory : []
  const historyBlackouts = user.casinoStats.dailyHistory.filter(round => round?.outcome === '🌑 Blackout').length
  const trackedBlackouts = Number(user.casinoStats.dailyResults.blackouts)
  user.casinoStats.dailyResults.blackouts = Math.max(
    Number.isFinite(trackedBlackouts) ? Math.floor(trackedBlackouts) : 0,
    historyBlackouts
  )
  if (!user.casinoStats.recordResults || typeof user.casinoStats.recordResults !== 'object') {
    const byGame = {}
    for (const [game, entry] of Object.entries(user.casinoStats.byGame)) {
      const gamesPlayed = Number(entry?.games || 0)
      const wins = Number(entry?.wins || 0)
      byGame[game] = { games: gamesPlayed, wins, losses: Math.max(0, gamesPlayed - wins), jackpots: 0, blackouts: 0, payoutDenied: 0, escapes: 0, dealerMercies: 0 }
    }
    user.casinoStats.recordResults = {
      ...emptyCasinoOutcomes(),
      games: user.casinoStats.games,
      wins: user.casinoStats.wins,
      losses: Math.max(0, user.casinoStats.games - user.casinoStats.wins),
      byGame
    }
  } else {
    user.casinoStats.recordResults = normalizeCasinoOutcomes(user.casinoStats.recordResults)
  }
  return user.casinoStats
}

function incrementCasinoOutcome(outcomes, game, result) {
  outcomes.games++
  const entry = outcomes.byGame[game] || (outcomes.byGame[game] = {
    games: 0, wins: 0, losses: 0, jackpots: 0, blackouts: 0, payoutDenied: 0, escapes: 0, dealerMercies: 0
  })
  entry.games++

  const add = key => {
    outcomes[key]++
    entry[key]++
  }
  if (result.blackout) add('blackouts')
  else if (result.payoutDenied) {
    add('payoutDenied')
    if (result.multiplier > 0) add('wins')
  }
  else if (result.escaped) add('escapes')
  else if (result.dealerMercy) add('dealerMercies')
  else if (result.multiplier >= 10) {
    add('wins')
    add('jackpots')
  } else if (result.multiplier > 0) add('wins')
  else add('losses')
}

function formatCasinoOutcomeSummary(outcomes) {
  return `> ↳ Total ronde: ${outcomes.games}x\n` +
    `> ↳ Menang: ${outcomes.wins}x (termasuk jackpot)\n` +
    `> ↳ Jackpot: ${outcomes.jackpots}x\n` +
    `> ↳ Kalah: ${outcomes.losses}x\n` +
    `> ↳ Blackout: ${outcomes.blackouts}x\n` +
    `> ↳ Hadiah tidak cair: ${outcomes.payoutDenied}x\n` +
    `> ↳ Berhasil kabur: ${outcomes.escapes}x\n` +
    `> ↳ Bandar berbaik hati: ${outcomes.dealerMercies}x`
}

function casinoHistoryText(stats, dailyLimit, usedPrefix) {
  const rounds = stats.dailyHistory.slice().reverse()
  const history = rounds.length
    ? rounds.map((round, index) => {
      const game = games[round.game]
      const moneyChange = normalizeRpgMoney(round.moneyChange ?? round.profit)
      const time = new Date(round.at).toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit'
      })
      return `*${index + 1}. ${game?.emoji || '🎲'} ${game?.name || round.game}*\n` +
        `> ↳ Waktu: ${time}\n` +
        `> ↳ Hasil: ${round.outcome}\n` +
        `> ↳ Taruhan: ${money(round.bet)}\n` +
        `> ↳ Hadiah: ${money(round.payout)}\n` +
        `> ↳ Profit: ${signedMoney(round.profit)}\n` +
        `> ↳ Perubahan uang: ${signedMoney(moneyChange)}` +
        `${round.panelRefundedAt ? '\n> ↳ Kerugian dikembalikan lewat RPG Panel' : ''}`
    }).join('\n\n')
    : '> ↳ Belum ada permainan casino hari ini.'

  return `╭─❏「 🗓️ RIWAYAT CASINO 」❏\n` +
    `│ CATATAN PERMAINAN HARI INI\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📊 *RINGKASAN HASIL*\n` +
    `> ↳ Kesempatan terpakai: ${stats.dailyGames}/${dailyLimit}x\n` +
    `${formatCasinoOutcomeSummary(stats.dailyResults)}\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `🎲 *RONDE TERAKHIR HARI INI*\n\n` +
    `${history}\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `Catatan ini direset bersama kesempatan casino harian. Rekap permanen tetap tersimpan di *${usedPrefix}cs record*.\n\n` +
    `─━━━━━━━━━━━━━━─`
}

function casinoRecordText(stats) {
  const outcomes = stats.recordResults
  const byGame = Object.entries(outcomes.byGame)
    .filter(([, entry]) => entry.games > 0)
    .sort(([, first], [, second]) => second.games - first.games)
    .map(([key, entry]) => {
      const game = games[key]
      return `${game?.emoji || '🎲'} *${game?.name || key}*\n` +
        `> ↳ Main ${entry.games}x · Menang ${entry.wins}x · Kalah ${entry.losses}x\n` +
        `> ↳ Jackpot ${entry.jackpots}x · Blackout ${entry.blackouts}x\n` +
        `> ↳ Hadiah tidak cair ${entry.payoutDenied}x · Kabur ${entry.escapes}x · Bandar berbaik hati ${entry.dealerMercies}x`
    }).join('\n\n')

  return `╭─❏「 🏆 CASINO RECORD 」❏\n` +
    `│ REKAP SEPANJANG WAKTU\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📈 *SEMUA PERMAINAN*\n` +
    `${formatCasinoOutcomeSummary(outcomes)}\n` +
    `> ↳ Profit bersih: ${signedMoney(stats.profit)}\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `🎮 *RINCIAN PER GAME*\n\n` +
    `${byGame || '> ↳ Belum ada catatan permainan.'}\n\n` +
    `─━━━━━━━━━━━━━━─`
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

function reduceCasinoWinChance(result) {
  if (result.multiplier > 0 && Math.random() >= 0.5) {
    result.payoutDenied = true
    result.text += '\n> ↳ 🎟️ Kamu menang, tetapi hadiah tidak cair. Taruhan dikembalikan.'
  }
  return result
}

function resultFor(game) {
if (game === 'slot') {
  const symbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '🔔', '7️⃣', '💎', '⭐', '👑', '💰', '💵', '🍀', '🃏', '🎰']
  const reels = Array.from({ length: 9 }, () => pick(symbols))
  const middle = reels.slice(3, 6)
  const jackpot = middle[0] === middle[1] && middle[1] === middle[2]
  const pair = middle[0] === middle[1] || middle[1] === middle[2] || middle[0] === middle[2]

  return reduceCasinoWinChance({
    multiplier: jackpot ? 10 : pair ? 1.5 : 0,
    text:
      `> ${reels[0]} | ${reels[1]} | ${reels[2]}\n` +
      `> ${reels[3]} | ${reels[4]} | ${reels[5]} ❮\n` +
      `> ${reels[6]} | ${reels[7]} | ${reels[8]}`
  })
}

const outcomes = {
  roulette: () => { const value = number(0, 36); return { multiplier: value === 0 ? 3 : Math.random() < 0.45 ? 1.5 : 0, text: `🎡 *Angka* : ${value}\n> ↳ 🎨 Warna : ${value === 0 ? 'Hijau' : value % 2 ? 'Hitam' : 'Merah'}` } },
  blackjack: () => { const player = number(15, 21), dealer = number(15, 21); return { multiplier: player > dealer ? 2 : player === dealer ? 1 : 0, text: `🃏 *Kamu* : ${player}\n> ↳ 🏦 Dealer : ${dealer}` } },
  dice: () => { const first = number(1, 6), second = number(1, 6); return { multiplier: first === second ? 2.5 : first + second >= 8 ? 1.5 : 0, text: `🎲 *Dadu* : ${first} + ${second}\n> ↳ Total : ${first + second}` } },
  coinflip: () => ({ multiplier: Math.random() < 0.5 ? 2 : 0, text: `🔄 *Hasil* : ${pick(['Head', 'Tail'])}` }),
  mahjong: () => ({ multiplier: Math.random() < 0.2 ? 4 : Math.random() < 0.45 ? 1.5 : 0, text: `🀄 *Tile* : ${pick(['Dragon', 'Wind', 'Bamboo', 'Circle'])}\n> ↳ Kombinasi : ${pick(['Pung', 'Chow', 'Kong', 'Pair'])}` }),
  cups: () => { const choice = number(1, 3), ball = number(1, 3); return { multiplier: choice === ball ? 3 : 0, text: `🥤 *Pilihan* : Cup ${choice}\n> ↳ Bola : Cup ${ball}` } },
  domino: () => { const first = number(0, 6), second = number(0, 6); return { multiplier: first === second ? 3 : first + second >= 7 ? 1.5 : 0, text: `🁣 *Domino* : [${first}|${second}]\n> ↳ Total : ${first + second}` } },
  uno: () => ({ multiplier: Math.random() < 0.1 ? 4 : Math.random() < 0.45 ? 1.5 : 0, text: `🃏 *Kartu* : ${pick(['Skip', 'Reverse', '+2', 'Wild', 'UNO'])}\n> ↳ Warna : ${pick(['Merah', 'Kuning', 'Hijau', 'Biru'])}` }),
  darts: () => { const score = number(1, 60); return { multiplier: score >= 50 ? 3 : score >= 30 ? 1.5 : 0, text: `🎯 *Skor* : ${score}\n> ↳ Target : Bullseye` } },
  bingo: () => ({ multiplier: Math.random() < 0.08 ? 5 : Math.random() < 0.4 ? 1.5 : 0, text: `🎱 *Nomor* : ${Array.from({ length: 3 }, () => number(1, 75)).join(' - ')}\n> ↳ Papan : ${pick(['B-I-N-G-O', 'Hampir Bingo', 'Belum Bingo'])}` }),
  hanafuda: () => ({ multiplier: Math.random() < 0.2 ? 3 : Math.random() < 0.5 ? 1.5 : 0, text: `🎴 *Kartu* : ${pick(['Crane', 'Moon', 'Rain Man', 'Cherry Blossom'])}\n> ↳ Set : ${pick(['Bright', 'Ribbon', 'Animal', 'Plain'])}` }),
  horserace: () => { const winner = number(1, 8); return { multiplier: winner === 1 ? 3 : winner <= 3 ? 1.5 : 0, text: `🏇 *Pemenang* : Kuda ${winner}\n> ↳ Lintasan : 8 kuda` } },
  pool: () => { const ball = number(1, 15); return { multiplier: ball === 8 ? 4 : ball >= 10 ? 1.5 : 0, text: `🎱 *Bola Masuk* : ${ball}\n> ↳ Target : Bola 8` } },
  rps: () => ({ multiplier: Math.random() < 0.33 ? 2 : Math.random() < 0.5 ? 1 : 0, text: `✊ *Kamu* : ${pick(['Rock', 'Paper', 'Scissors'])}\n> ↳ 🤖 Lawan : ${pick(['Rock', 'Paper', 'Scissors'])}` }),
  poker: () => ({ multiplier: Math.random() < 0.08 ? 5 : Math.random() < 0.4 ? 2 : 0, text: `♠️ *Hand* : ${pick(['Pair', 'Two Pair', 'Straight', 'Flush', 'Full House'])}\n> ↳ 🃏 Kartu : 5 kartu` }),
  chess: () => ({ multiplier: Math.random() < 0.25 ? 2.5 : Math.random() < 0.5 ? 1 : 0, text: `♟️ *Hasil* : ${pick(['Checkmate', 'Menang Posisi', 'Draw', 'Kalah Posisi'])}\n> ↳ Langkah : ${number(12, 48)}` }),
  blacksapphire: () => { const result = pick(['Sapphire', 'Black Sapphire', 'Crystal']), multiplier = result === 'Black Sapphire' ? 5 : result === 'Sapphire' ? 2 : 0; return { multiplier, text: `💠 *Hasil* : ${result}\n> ↳ ✨ Bonus : ${result === 'Black Sapphire' ? 'Jadwal keberuntungan' : result === 'Sapphire' ? 'Beruntung sedang naik' : 'Coba lagi'}` } },
  keno: () => { const drawn = Array.from({ length: 6 }, () => number(1, 10)), lucky = drawn[0], multiplier = lucky === 7 ? 4 : lucky <= 3 ? 1.5 : 0; return { multiplier, text: `🎟️ *Nomor* : ${drawn.join(' - ')}\n> ↳ 🎯 Lucky : ${lucky}` } },
  mines: () => { const mineCount = number(1, 4), safe = number(1, 3), multiplier = mineCount === safe ? 5 : safe >= 2 ? 2 : 0; return { multiplier, text: `💣 *Mine Count* : ${mineCount}\n> ↳ 🧭 Safe Tile : ${safe}` } },
  squidgames: () => { const stage = number(1, 6), multiplier = stage === 6 ? 8 : stage >= 4 ? 2 : 0; return { multiplier, text: `🦑 *Babak bertahan* : ${stage}/6\n> ↳ ${stage === 6 ? 'Menang permainan!' : stage >= 4 ? 'Berhasil bertahan.' : 'Tereliminasi.'}` } },
  ludo: () => { const roll = number(1, 6), finished = roll === 6 || Math.random() < 0.25; return { multiplier: finished ? 3 : 0, text: `🎲 *Lemparan* : ${roll}\n> ↳ ${finished ? 'Bidak sampai tujuan!' : 'Bidak belum sampai tujuan.'}` } },
  baccarat: () => { const player = number(0, 9), banker = number(0, 9), multiplier = player === banker ? 8 : player > banker ? 2 : 0; return { multiplier, text: `🂡 *Player* : ${player}\n> ↳ 🏦 Banker : ${banker}\n> ↳ ${player === banker ? 'Tie' : player > banker ? 'Player menang' : 'Banker menang'}` } },
  craps: () => { const first = number(1, 6) + number(1, 6), point = first !== 7 && first !== 11 && first !== 2 && first !== 3 && first !== 12, second = point ? number(1, 6) + number(1, 6) : 0, won = first === 7 || first === 11 || (point && second === first); return { multiplier: won ? (point ? 6 : 2) : 0, text: `🎲 *Lemparan awal* : ${first}\n> ↳ ${point ? `Lemparan berikutnya: ${second}` : 'Natural / craps'}` } },
  pontoon: () => { const player = number(15, 21), dealer = number(15, 21), multiplier = player === 21 ? 3 : player > dealer ? 2.5 : 0; return { multiplier, text: `🃏 *Kartu kamu* : ${player}\n> ↳ 🏦 Dealer : ${dealer}` } },
  boxing: () => { const round = number(1, 12), knockout = Math.random() < 0.2, won = knockout || Math.random() < 0.45; return { multiplier: won ? (knockout ? 4 : 2.5) : 0, text: `🥊 *Ronde* : ${round}\n> ↳ ${knockout && won ? 'Menang KO!' : won ? 'Menang angka!' : 'Kalah angka.'}` } },
  hungergames: () => { const stages = number(1, 5), champion = stages === 5 && Math.random() < 0.5; return { multiplier: champion ? 10 : stages >= 4 ? 2 : 0, text: `🏹 *Babak bertahan* : ${stages}/5\n> ↳ ${champion ? 'Juara arena!' : stages >= 4 ? 'Bertahan sampai akhir.' : 'Tereliminasi.'}` } },
  hazard: () => { const point = number(4, 10), roll = number(2, 12), won = roll === point || (roll === 7 && point !== 7); return { multiplier: won ? 5 : 0, text: `🎲 *Point* : ${point}\n> ↳ Lemparan : ${roll}` } },
  yahtzee: () => { const dice = Array.from({ length: 5 }, () => number(1, 6)), counts = dice.reduce((result, value) => ({ ...result, [value]: (result[value] || 0) + 1 }), {}), highest = Math.max(...Object.values(counts)); return { multiplier: highest === 5 ? 8 : highest >= 3 ? 3 : highest === 2 ? 2 : 0, text: `🎲 *Dadu* : ${dice.join(' - ')}\n> ↳ Kombinasi : ${highest === 5 ? 'Yahtzee!' : `${highest} angka sama`}` } },
  tripeaks: () => { const ranks = Array.from({ length: 4 }, () => number(1, 13)), longest = ranks.reduce((length, rank, index) => index && Math.abs(rank - ranks[index - 1]) === 1 ? length + 1 : 1, 1); return { multiplier: longest >= 4 ? 5 : longest >= 3 ? 2 : 0, text: `🂠 *Kartu terbuka* : ${ranks.join(' - ')}\n> ↳ Rangkaian : ${longest} kartu` } },
  accordion: () => { const piles = number(1, 7), multiplier = piles === 1 ? 4 : piles <= 3 ? 2 : 0; return { multiplier, text: `🂠 *Sisa tumpukan* : ${piles}\n> ↳ ${piles === 1 ? 'Semua kartu tersusun!' : piles <= 3 ? 'Hampir selesai.' : 'Susunan belum berhasil.'}` } },
  crash: () => { const crashAt = pick([1.2, 1.5, 2, 3, 5, 10]), cashedOut = Math.random() < 0.55; return { multiplier: cashedOut ? crashAt : 0, text: `📈 *Crash point* : ${crashAt}x\n> ↳ ${cashedOut ? `Berhasil cash out ${crashAt}x` : 'Terlambat cash out!'}` } },
  farkle: () => { const dice = Array.from({ length: 6 }, () => number(1, 6)), score = dice.reduce((total, value) => total + value, 0), triple = dice.some(value => dice.filter(die => die === value).length >= 3); return { multiplier: triple ? 5 : score >= 25 ? 2 : 0, text: `🎲 *Dadu* : ${dice.join(' - ')}\n> ↳ Skor : ${score}` } },
  spinner: () => { const section = pick([0, 2, 2, 3, 5]); return { multiplier: section, text: `🌀 *Spinner berhenti di* : ${section ? `${section}x` : 'zonk'}` } },
  match: () => { const symbols = Array.from({ length: 3 }, () => pick(['🍒', '🍋', '🍇', '⭐'])), counts = symbols.reduce((result, value) => ({ ...result, [value]: (result[value] || 0) + 1 }), {}), highest = Math.max(...Object.values(counts)); return { multiplier: highest === 3 ? 5 : highest === 2 ? 2 : 0, text: `🎴 *Kartu* : ${symbols.join(' | ')}\n> ↳ ${highest === 3 ? 'Triple match!' : highest === 2 ? 'Pair match!' : 'Tidak match.'}` } },
  reddog: () => { const first = number(1, 13), middle = number(1, 13), last = number(1, 13), low = Math.min(first, last), high = Math.max(first, last), won = middle > low && middle < high, multiplier = won ? Math.min(5, Math.max(2, Math.floor(13 / (high - low)))) : 0; return { multiplier, text: `🐕 *Kartu* : ${first} - ${middle} - ${last}\n> ↳ ${won ? 'Kartu tengah masuk rentang!' : 'Kartu tengah di luar rentang.'}` } },
  solitaire: () => { const moves = number(12, 52), completed = Math.random() < 0.15; return { multiplier: completed ? 5 : 0, text: `🃏 *Langkah* : ${moves}\n> ↳ ${completed ? 'Solitaire selesai!' : 'Permainan belum selesai.'}` } },
  doors: () => { const door = number(1, 3), prize = Math.random() < 0.3; return { multiplier: prize ? 4 : 0, text: `🚪 *Pintu pilihan* : ${door}\n> ↳ ${prize ? 'Ada hadiah di balik pintu!' : 'Pintu kosong.'}` } },
  puzzle: () => { const first = number(2, 12), second = number(2, 12), solved = Math.random() < 0.35; return { multiplier: solved ? 6 : 0, text: `🧩 *Teka-teki* : ${first} × ${second}\n> ↳ Jawaban : ${first * second}${solved ? ' (terpecahkan!)' : ' (gagal dipecahkan)'}` } },
  cipher: () => { const shift = number(1, 25), solved = Math.random() < 0.3; return { multiplier: solved ? 5 : 0, text: `🔐 *Cipher shift* : ${shift}\n> ↳ ${solved ? 'Kode berhasil dipecahkan!' : 'Kode tidak terpecahkan.'}` } },
  riddle: () => { const riddles = [{ question: 'Apa yang punya jarum tapi tidak bisa menjahit?', answer: 'Jam' }, { question: 'Semakin diisi semakin ringan, apakah itu?', answer: 'Balon' }, { question: 'Apa yang selalu naik tapi tidak pernah turun?', answer: 'Umur' }], riddle = pick(riddles), solved = Math.random() < 0.35; return { multiplier: solved ? 4 : 0, text: `❓ *Teka-teki* : ${riddle.question}\n> ↳ Jawaban : ${riddle.answer} (${solved ? 'terjawab' : 'belum terjawab'})` } },
  jenga: () => { const height = number(1, 12), collapsed = Math.random() < 0.25; return { multiplier: collapsed ? 0 : height >= 10 ? 6 : height >= 7 ? 3 : 2, text: `🪵 *Tinggi menara* : ${height} balok\n> ↳ ${collapsed ? 'Menara roboh!' : 'Balok berhasil ditarik.'}` } },
  monopoly: () => { const spaces = number(1, 12), property = pick(['Tanah', 'Stasiun', 'Rumah', 'Hotel']), multiplier = spaces >= 11 ? 10 : spaces >= 8 ? 4 : spaces >= 5 ? 2 : 0; return { multiplier, text: `🏠 *Langkah* : ${spaces}\n> ↳ Petak : ${property}\n> ↳ ${multiplier ? 'Berhasil mendapat keuntungan!' : 'Membayar sewa.'}` } },
  snakes: () => { const start = number(1, 80), roll = number(1, 6), ladder = Math.random() < 0.2, snake = !ladder && Math.random() < 0.2, position = Math.max(1, Math.min(100, start + roll + (ladder ? number(10, 25) : snake ? -number(5, 20) : 0))), multiplier = position === 100 ? 8 : position >= 80 ? 3 : 0; return { multiplier, text: `🐍 *Posisi awal* : ${start} | Dadu: ${roll}\n> ↳ ${ladder ? 'Naik tangga!' : snake ? 'Turun karena ular!' : 'Tidak bertemu ular/tangga.'}\n> ↳ Posisi akhir : ${position}/100` } },
  parcheesi: () => { const dice = [number(1, 6), number(1, 6)], start = number(1, 45), position = Math.min(56, start + dice[0] + dice[1]), home = position >= 56, multiplier = home ? 6 : dice[0] === dice[1] ? 3 : position >= 35 ? 2 : 0; return { multiplier, text: `🎲 *Dadu* : ${dice.join(' + ')}\n> ↳ Posisi bidak : ${position}/56\n> ↳ ${home ? 'Bidak sampai rumah!' : dice[0] === dice[1] ? 'Dadu kembar, langkah bonus!' : 'Bidak bergerak maju.'}` } }
}
  return reduceCasinoWinChance(outcomes[game]())
}

function normalizeResult(result) {
  if (result.multiplier > 0) result.multiplier = Math.max(2, result.multiplier)
  result.text = result.text.replaceAll('├[', '│ [')
  return result
}

function applyCasinoSpecialOutcome(result, allowBlackout = true) {
  if (!result.payoutDenied && Math.random() < 0.02 && allowBlackout) {
    result.blackout = true
    result.multiplier = 0
    result.text += '\n> ↳ 🌑 Blackout! Kamu pingsan dan uang taruhan dicuri.'
    return result
  }

  if (result.multiplier === 0 && !result.payoutDenied) {
    const outcome = Math.random()
    if (outcome < 0.08) {
      result.escaped = true
      result.text += '\n> ↳ 🏃 Berhasil kabur! Taruhanmu tidak berkurang.'
    } else if (outcome < 0.16) {
      result.dealerMercy = true
      result.text += '\n> ↳ 🤝 Bandar berbaik hati dan membiarkanmu menyimpan taruhan.'
    }
  }
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
  const cooldownDurations = user.casinoCooldownDurations || {}
  const now = Date.now()
  let cap = `╭─❏「 ⏳ CASINO COOLDOWN 」❏\n`
  cap += `│ Cooldown mengikuti taruhan dan multiplier hasil.\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  for (const [key, game] of Object.entries(games)) {
    const cooldownDuration = cooldownDurations[key] || getGameCooldownDuration(key, 2, user)
    const remaining = (cooldowns[key] || 0) + cooldownDuration - now
    cap += `${game.emoji} *${game.name}*\n`
    cap += `> ↳ Cooldown ${formatRemaining(cooldownDuration)} • ${remaining > 0 ? `⏳ ${formatRemaining(remaining)} lagi` : `✅ READY (${prefix}casino ${key})`}\n\n`
  }

  return cap + `─━━━━━━━━━━━━━━─`
}

function getGameCooldownDuration(game, multiplier, user) {
  const minimumBet = games[game]?.minBet || 100
  const wagerTier = Math.max(1, Math.ceil(Math.log10(minimumBet / 100 + 1)))
  const rewardFactor = Math.max(1, Number(multiplier) / 2)
  return scaleDifficultyCooldown(user, GAME_COOLDOWN * wagerTier * rewardFactor)
}

function getTopPlayers(wdb, limit = 20, conn) {
  const players = Object.entries(wdb.users || {})
    .flatMap(([jid, account]) => {
      const rpg = account?.rpg
      const stats = rpg?.casinoStats
      const games = Number(stats?.games || 0)

      if (!rpg || !stats || !(games > 0)) return []

      return [{
        jid,
        nickname: String(rpg.casinoNickname || '').trim(),
        wins: Number(stats.wins || 0),
        games,
        profit: normalizeRpgMoney(stats.profit),
        title: getCasinoTitle(games)
      }]
    })
  return filterLeaderboardUsers(players, conn, player => player.jid)
    .sort((a, b) => compareRpgMoney(b.profit, a.profit) || b.wins - a.wins)
    .slice(0, limit)
}

function casinoCommands(prefix) {
  return [
    `╭─❏「 🎰 CASINO COMMANDS 」❏`,
    `│ 🎰 *DAFTAR COMMAND*`,
    `╰─━━━━━━━━━━━━━━─`,
    ``,
    `📌 *CASINO*`,
    `> ↳ 🎰 ${prefix}casino`,
    `> ↳ 🎮 ${prefix}casino <game> <taruhan> (contoh: 2M)`,
    `> ↳ 💸 ${prefix}casino <game> all (seluruh uang saku)`,
    `> ↳ 🎲 ${prefix}casino random <taruhan> (contoh: 2M)`,
    `> ↳ 🧪 ${prefix}casino simulation <game/random> [nominal] atau ${prefix}cs sl <game/random> [nominal]`,
    `> ↳ 📖 ${prefix}cs hasil`,
    `> ↳ 🗓️ ${prefix}cs history`,
    `> ↳ 🏆 ${prefix}cs record`,
    `> ↳ 👮‍♀️ ${prefix}cs guard — cari pelaku blackout`,
    `> ↳ 🛡️ ${prefix}cs guard protect — proteksi Premium`,
    `> ↳ 📋 ${prefix}casino games`,
    `> ↳ 📖 ${prefix}casino guide`,
    `> ↳ 💰 ${prefix}casino money — daftar suffix nominal`,
    `> ↳ 👤 ${prefix}casino profile`,
    `> ↳ 💰 ${prefix}cs profit <all/nama game/nomor>`,
    `> ↳ 🏆 ${prefix}casino top`,
    `> ↳ ⏰ ${prefix}casino cd`,
    `> ↳ ✏️ ${prefix}casino nickname <julukan>`,
    ``,
    `👥 *CASINO ROOM*`,
    `> ↳ 🏠 ${prefix}cs room create <taruhan> (contoh: 2M)`,
    `> ↳ ➕ ${prefix}cs room join`,
    `> ↳ 🚪 ${prefix}cs room leave`,
    `> ↳ 👢 ${prefix}cs room kick @tag`,
    `> ↳ 👥 ${prefix}cs room player`,
    `> ↳ 📊 ${prefix}cs room status`,
    `> ↳ ▶️ ${prefix}cs room start`,
    `> ↳ 🗑️ ${prefix}cs room delete`,
    `> ↳ ℹ️ ${prefix}cs room info`,
    `> ↳ 🎮 ${prefix}cs room games`,
    `> ↳ 📖 ${prefix}cs room guide`,
    `> ↳ 🎯 ${prefix}cs room game <pilihan>`,
    `> ↳ ⏭️ ${prefix}cs room next (taruhan tetap)`,
    `> ↳ ⬆️ ${prefix}cs room up (taruhan x2)`,
    `> ↳ 💰 ${prefix}cs room set <nominal>`,
    ``,
    `─━━━━━━━━━━━━━━─`
  ].join('\n')
}

function casinoResults(prefix) {
  return `╭─❏「 📖 HASIL CASINO 」❏\n` +
    `│ Arti hasil yang mungkin muncul saat bermain.\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🏆 *JACKPOT*\n` +
    `> ↳ Menang besar dengan multiplier 10x atau lebih.\n\n` +
    `🎉 *MENANG*\n` +
    `> ↳ Game menghasilkan multiplier; hadiah dihitung dari taruhan dan multiplier.\n\n` +
    `💀 *KALAH*\n` +
    `> ↳ Tidak mendapat hadiah dan taruhan menjadi kerugian.\n\n` +
    `🎟️ *HADIAH TIDAK CAIR*\n` +
    `> ↳ Hasil game menang, tetapi hadiah dibatalkan; saldo taruhan tidak berubah.\n\n` +
    `🏃 *BERHASIL KABUR* / 🤝 *BANDAR BERBAIK HATI*\n` +
    `> ↳ Hasil game kalah, tetapi taruhan tidak berkurang.\n\n` +
    `🌑 *BLACKOUT*\n` +
    `> ↳ Uang hilang hingga maksimal 2x taruhan, dibatasi saldo yang tersedia. Maksimal satu blackout per pengguna per hari; kerugian ini tidak mengurangi profit casino.\n` +
    `> ↳ ${prefix}cs guard menampilkan pelaku virtual dan mengirim Avelia Guard untuk memulihkan saldo.\n` +
    `> ↳ Premium dapat mengklaim proteksi satu kali per minggu kalender; kesempatan direset setiap Senin.\n\n` +
    `🧪 *SIMULASI*\n` +
    `> ↳ ${prefix}cs sl <game/random> [nominal] menampilkan hasil virtual tanpa mengubah uang, cooldown, batas harian, atau statistik. Nominal bisa memakai suffix seperti 1K, 2M, atau 1B.\n\n` +
    `─━━━━━━━━━━━━━━─`
}

function casinoGuide(prefix) {
  return `╭─❏「 📖 CASINO GUIDE 」❏\n` +
    `│ 🎰 *PANDUAN CASINO*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *CARA BERMAIN*\n` +
    `> ↳ Mainkan dengan ${prefix}casino <game> <taruhan>.\n` +
    `> ↳ Nominal taruhan bisa memakai suffix seperti 1K, 2M, 1B, atau 1T; format tampilan saldo dan hasil juga ringkas.\n` +
    `> ↳ Lihat game dan minimum taruhan: ${prefix}casino games.\n` +
    `> ↳ Untuk game acak, gunakan ${prefix}casino random <taruhan>.\n` +
    `> ↳ Taruhan dapat berupa nominal atau *all* untuk memakai seluruh uang saku.\n` +
    `> ↳ Coba game tanpa memakai atau mendapatkan uang dengan ${prefix}casino simulation <game/random> [nominal] (alias: ${prefix}cs sl <game/random> [nominal]). Nominal bisa memakai suffix seperti 1K, 2M, atau 1B. Nominal acak selalu di atas 1B; nominal pilihan maksimal 1T.\n` +
    `> ↳ Hadiah dihitung dari taruhan dikali multiplier hasil.\n` +
    `> ↳ Cooldown game mengikuti difficulty; batas harian 25x, premium 50x.\n\n` +
    `> ↳ Blackout memiliki peluang normal, tetapi maksimal hanya terjadi sekali per pengguna per hari.\n` +
    `> ↳ Kerugian blackout hanya mengurangi saldo, bukan profit casino. Pulihkan melalui ${prefix}cs guard.\n` +
    `> ↳ Premium dapat mengambil proteksi blackout sekali dalam minggu kalender melalui ${prefix}cs guard protect; kuota kembali setiap Senin.\n\n` +
    `> ↳ Casino room tidak terpengaruh batas/progres permainan reguler.\n\n` +

    `👥 *MULTIPLAYER*\n` +
    `> ↳ Multiplayer dapat dimainkan melalui casino room: ${prefix}cs room.\n` +
    `> ↳ Atur julukan dengan ${prefix}casino nickname <julukan>.\n\n` +

    `> ↳ Gunakan ${prefix}cs room status untuk melihat kondisi room terbaru.\n\n` +

    `─━━━━━━━━━━━━━━─`
}

function getPositivePlayerProfitTotal(wdb) {
  return Object.values(wdb.users || {}).reduce((total, account) => {
    const profit = normalizeRpgMoney(account?.rpg?.casinoStats?.profit)
    return compareRpgMoney(profit, 0) > 0 ? addRpgMoney(total, profit) : total
  }, 0)
}

function menu(prefix, wdb, conn, groupMetadata) {
  const leader = getTopPlayers(wdb, 1, conn)[0]
  const leaderIdentity = leader ? getLeaderboardUserIdentity(leader.jid, { conn, groupMetadata }) : null
  const mentions = leader && !leader.nickname && leaderIdentity?.mention ? [leaderIdentity.mention] : []
  const totalProfit = getPositivePlayerProfitTotal(wdb)

  let text = `╭─❏「 🎰 AVELIA CASINO 」❏\n`
  text += `│ *Uji Keberuntunganmu disini!*\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`

  text += `📊 *INFORMASI CASINO*\n`
  text += `> ↳ 🎮 Total permainan : ${Object.keys(games).length}\n`
  text += `> ↳ 💰 Hadiah terkumpulkan :\n`
  text += `> ↳ 💰 ${money(totalProfit)}\n\n`

  text += `🏆 *TOP CASINO #1*\n`
  text += leader
    ? `> ↳ ${casinoPlayerName(leader, leaderIdentity)}\n> ↳ Profit: ${signedMoney(leader.profit)}\n`
    : `> ↳ Belum ada pemain\n`
  text += `\n`

  text += `🎟️ *BATAS HARIAN*\n`
  text += `> ↳ User biasa\n`
  text += `> ↳ ${DAILY_LIMIT} permainan per hari\n`
  text += `> ↳ User Premium\n`
  text += `> ↳ ${PREMIUM_DAILY_LIMIT} permainan per hari\n\n`

  text += `📌 *PERINTAH*\n`
  text += `> ↳ ${prefix}casino command\n`
  text += `> ↳ ${prefix}casino guide\n\n`
  text += `> ↳ ${prefix}cs history — hasil hari ini\n`
  text += `> ↳ ${prefix}cs record — rekap sepanjang waktu\n\n`

  text += `─━━━━━━━━━━━━━━─`

  return { text, mentions }
}

function casinoPlayerName(player, identity) {
  return player.nickname || identity?.display || '@pengguna'
}

function getCasinoNickname(wdb, jid) {
  return String(wdb.users?.[jid]?.rpg?.casinoNickname || '').trim()
}

function visibleCasinoMentions(jids, wdb) {
  return jids.filter(jid => !getCasinoNickname(wdb, jid))
}

function gamesMenu(prefix) {
  const list = Object.entries(games)
    .map(([key, game], index) => `> ${index + 1}. ${game.emoji} *${game.name}* - min ${money(game.minBet)}\n> ↳ ${prefix}casino ${key} <taruhan>`)
    .join('\n')
  return `╭─❏「 🎮 DAFTAR CASINO 」❏\n│ Total permainan: ${Object.keys(games).length}\n╰─━━━━━━━━━━━━━━─\n\n${list}`
}

function top(wdb, conn, groupMetadata) {
  const players = getTopPlayers(wdb, 20, conn)

  if (!players.length) {
    return { text: `╭─❏「 🏆 CASINO TOP 」❏\n` +
      `│ Belum ada pemenang.\n` +
      `╰─━━━━━━━━━━━━━━─`, mentions: [] }
  }

  let text = `╭─❏「 🏆 CASINO TOP 20 」❏\n`
  text += `│ Pemain dengan kemenangan terbanyak.\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`

  const mentions = []
  players.forEach((player, index) => {
    const identity = getLeaderboardUserIdentity(player.jid, { conn, groupMetadata })
    if (!player.nickname && identity.mention) mentions.push(identity.mention)
    text += `> *${index + 1}. 🏆 ${casinoPlayerName(player, identity)}*\n`
    text += `> ↳ Title: ${player.title}\n`
    text += `> ↳ Menang: ${player.wins}x\n`
    text += `> ↳ Main: ${player.games}x\n`
    text += `> ↳ Profit: ${signedMoney(player.profit)}\n`

    if (index < players.length - 1) {
      text += `\n─━━━━━━━━━━━━━━─\n`
    }
  })

  return { text, mentions }
}

function profile(user, sender, dailyLimit, showProfit = false) {
  const stats = getCasinoStats(user)

  let text = `╭─❏「 🎰 CASINO PROFILE 」❏\n`
  text += user.casinoNickname
    ? `│ 👤 *${user.casinoNickname}*\n`
    : `│ 👤 *@${sender.split('@')[0]}*\n`
  text += `│ 🏷️ Title : ${getCasinoTitle(stats.games)}\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`

  text += `📊 *RINGKASAN*\n`
  text += `> ↳ Total main : ${stats.games}x\n`
  text += `> ↳ Hari ini : ${stats.dailyGames}/${dailyLimit}x\n`
  text += `> ↳ Menang : ${stats.wins}x\n`

  if (!showProfit) {
    return text +
      `\n📌 Ketik *.cs profit* untuk melihat profit lengkap per game tanpa singkatan.\n\n` +
      `─━━━━━━━━━━━━━━─`
  }

  text += `> ↳ Profit total : ${signedMoney(stats.profit)}\n\n`

  text += `🎮 *PROFIT PER GAME*\n`
  for (const [key, game] of Object.entries(games)) {
    const entry = stats.byGame[key] || { games: 0, profit: 0 }
    text += `${game.emoji} *${game.name}*\n`
    text += `> ↳ Total : ${entry.games || 0}x | Menang : ${entry.wins || 0}x | Kalah : ${Math.max(0, (entry.games || 0) - (entry.wins || 0))}x\n`
    text += `> ↳ Profit : ${signedMoney(entry.profit || 0)}\n\n`
  }

  text += `⚠️ Main secukupnya. Batas casino : ${dailyLimit} permainan per hari.\n\n`
  text += `─━━━━━━━━━━━━━━─`

  return text
}

function formatFullProfit(value) {
  const amount = normalizeRpgMoney(value)
  const positive = compareRpgMoney(amount, 0) >= 0
  const absolute = positive ? amount : subtractRpgMoney(0, amount)
  const exact = typeof absolute === 'bigint' ? absolute.toLocaleString('id-ID') : absolute.toLocaleString('id-ID')
  return `${positive ? '+' : '-'}Rp ${exact}`
}

function resolveProfitGame(selection) {
  const normalized = String(selection || '').trim().toLowerCase()
  if (!normalized || normalized === 'all') return normalized === 'all' ? 'all' : null

  const entries = Object.entries(games)
  if (/^\d+$/.test(normalized)) {
    const index = Number(normalized) - 1
    return entries[index]?.[0] || null
  }

  const compact = normalized.replace(/[^a-z0-9]/g, '')
  return entries.find(([key, game]) =>
    key.toLowerCase() === normalized ||
    game.name.toLowerCase() === normalized ||
    game.name.toLowerCase().replace(/[^a-z0-9]/g, '') === compact ||
    game.aliases.some(alias => alias.toLowerCase() === normalized)
  )?.[0] || null
}

const PROFIT_GAMES_PER_PAGE = 8

function casinoProfitSections(usedPrefix, page = 1) {
  const entries = Object.entries(games)
  const pageCount = Math.ceil(entries.length / PROFIT_GAMES_PER_PAGE)
  const currentPage = Math.min(pageCount, Math.max(1, page))
  const startIndex = (currentPage - 1) * PROFIT_GAMES_PER_PAGE
  const rows = entries.slice(startIndex, startIndex + PROFIT_GAMES_PER_PAGE)
    .map(([key, game], index) => ({
      title: `${game.emoji} ${startIndex + index + 1}. ${game.name}`,
      description: 'Lihat hasil game ini',
      id: `${usedPrefix}cs profit ${startIndex + index + 1}`
    }))

  if (currentPage > 1) {
    rows.push({
      title: '⬅️ Game sebelumnya',
      description: `Halaman ${currentPage - 1} dari ${pageCount}`,
      id: `${usedPrefix}cs profit list ${currentPage - 1}`
    })
  }
  if (currentPage < pageCount) {
    rows.push({
      title: '➡️ Game lainnya',
      description: `Halaman ${currentPage + 1} dari ${pageCount}`,
      id: `${usedPrefix}cs profit list ${currentPage + 1}`
    })
  }

  return {
    page: currentPage,
    pageCount,
    sections: [{ title: `🎮 Pilih game · ${currentPage}/${pageCount}`, rows }]
  }
}

function casinoProfitText(user, selection) {
  const stats = user.casinoStats || {}
  const byGame = stats.byGame || {}
  const totalProfit = normalizeRpgMoney(stats.profit)

  if (selection !== 'all') {
    const game = games[selection]
    const entry = byGame[selection] || {}
    const played = Number(entry.games) || 0
    const wins = Number(entry.wins) || 0
    const losses = Math.max(0, played - wins)
    return `╭─❏「 ${game.emoji} PROFIT ${game.name.toUpperCase()} 」❏\n` +
      `│ REKAP PER GAME\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Total main: ${played}x\n` +
      `> ↳ Menang: ${wins}x · Kalah: ${losses}x\n` +
      `> ↳ Profit game: ${formatFullProfit(entry.profit)}\n` +
      `> ↳ Profit seluruh game: ${formatFullProfit(totalProfit)}\n\n` +
      `─━━━━━━━━━━━━━━─`
  }

  const rows = Object.entries(games).map(([key, game], index) => {
    const entry = byGame[key] || {}
    const played = Number(entry.games) || 0
    const wins = Number(entry.wins) || 0
    const losses = Math.max(0, played - wins)
    return `${game.emoji} *${index + 1}. ${game.name}*\n` +
      `> ↳ Main ${played}x · Menang ${wins}x · Kalah ${losses}x\n` +
      `> ↳ Profit: ${formatFullProfit(entry.profit)}`
  }).join('\n\n')

  return `╭─❏「 💰 PROFIT CASINO 」❏\n` +
    `│ REKAP SEMUA PERMAINAN\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📈 *PROFIT TOTAL: ${formatFullProfit(totalProfit)}*\n\n` +
    `🎮 *RINCIAN PER GAME*\n\n${rows}\n\n` +
    `─━━━━━━━━━━━━━━─`
}

function roomPlayerName(jid, wdb) {
  return getCasinoNickname(wdb, jid) || `@${jid.split('@')[0]}`
}

function roomGamesMenu(prefix) {
  return `🎮 *GAME ROOM CASINO*\n` +
    Object.values(ROOM_GAMES).map(game => `> ↳ ${game.emoji} ${game.name}`).join('\n') +
    `\n\n📌 *CARA MEMILIH GAME*\n` +
    `> ↳ ${prefix}cs room game <nama_game>\n` +
    `> ↳ Contoh: ${prefix}cs room game jenga`
}

function roomGuide(prefix) {
  return `╭─❏「 📖 CASINO ROOM GUIDE 」❏\n` +
    `│ 🎰 *PANDUAN CASINO ROOM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *CARA BERMAIN*\n` +
    `> ↳ Buat room : ${prefix}cs room create <taruhan>.\n` +
    `> ↳ Pemain lain bergabung dengan : ${prefix}cs room join.\n` +
    `> ↳ Master memilih game : ${prefix}cs room game <pilihan>.\n` +
    `> ↳ Lihat daftar permainan dengan : ${prefix}cs room games.\n` +
    `> ↳ Jika game tidak dipilih, sistem memilih secara acak.\n\n` +

    `🎮 *MULAI PERMAINAN*\n` +
    `> ↳ Mulai : ${prefix}cs room start.\n` +
    `> ↳ Setiap ronde, tiap pemain mendapat 5 gacha.\n` +
    `> ↳ Satu pemain dengan skor terendah tereliminasi tiap ronde; jika hasil seri, tidak ada yang tereliminasi.\n` +
    `> ↳ Setelah ronde, master dapat memakai *.cs room next*, *.cs room up*, atau *.cs room set <nominal> untuk mengatur taruhan ronde berikutnya.\n` +
    `> ↳ Master juga dapat mengganti game dengan *.cs room game <nama_game>*.\n\n` +

    `📌 *CATATAN*\n` +
    `> ↳ Room tanpa interaksi selama 30 menit otomatis dihapus; kontribusi ronde berjalan dikembalikan.\n` +
    `> ↳ Casino room tidak memakai atau menambah batas/progres casino reguler.\n\n` +

    `─━━━━━━━━━━━━━━─`
}

function playRoomRound(gameKey, players) {
  return Object.fromEntries(players.map(jid => {
    let score = 0
    for (let attempt = 0; attempt < 5; attempt++) {
      const result = gameKey === 'monopoly'
        ? reduceCasinoWinChance({ multiplier: Math.random() < 0.35 ? 2 : 0, text: '' })
        : resultFor(gameKey)
      if (result.multiplier > 0) score++
    }
    return [jid, score]
  }))
}

function playCasinoRoomRound(room, wdb, stake) {
  room.contributions = room.contributions || {}
  const players = [...room.players]
  for (const jid of players) {
    if (!wdb.users?.[jid]?.rpg || compareRpgMoney(wdb.money?.[jid] || 0, stake) < 0) {
      return { insufficientPlayer: jid }
    }
  }

  const roundContribution = multiplyRpgMoney(stake, players.length)

  const scores = playRoomRound(room.game, players)
  const lowest = Math.min(...Object.values(scores))
  const lowestPlayers = players.filter(jid => scores[jid] === lowest)
  const eliminated = lowestPlayers.length === 1 ? lowestPlayers[0] : null

  for (const jid of players) {
    wdb.money[jid] = subtractRpgMoney(wdb.money[jid] || 0, stake)
    room.contributions[jid] = addRpgMoney(room.contributions[jid] || 0, stake)
  }

  room.pot = addRpgMoney(room.pot || 0, roundContribution)
  room.players = eliminated ? players.filter(jid => jid !== eliminated) : [...players]
  room.round = Number(room.round || 0) + 1
  room.currentStake = stake
  room.lastActivityAt = Date.now()
  const result = { scores, eliminated, stake, number: room.round, tie: lowestPlayers.length > 1 }
  room.roundHistory = [...(room.roundHistory || []), result]

  if (room.players.length === 1) {
    const winner = room.players[0]
    wdb.money[winner] = addRpgMoney(wdb.money[winner] || 0, room.pot)
    return { ...result, winner, prize: room.pot }
  }

  room.status = 'round_wait'
  return result
}

function formatRoomRound(result, wdb) {
  const scoreList = Object.entries(result.scores)
    .map(([jid, score]) => `> ↳ ${roomPlayerName(jid, wdb)} : ${score}/5`)
    .join('\n')
  const eliminationText = result.eliminated
    ? `> ↳ ❌ Tereliminasi: ${roomPlayerName(result.eliminated, wdb)}`
    : `> ↳ ⚖️ Hasil seri: tidak ada yang tereliminasi.`

  return `🎮 *RONDE ${result.number}*\n` +
    `${scoreList}\n\n` +
    `${eliminationText}\n`
}

async function handleCasinoRoom(m, { conn, args, usedPrefix, wdb, user }) {
  const action = String(args[1] || '').toLowerCase()
  const reply = (text, mentions = []) => conn.reply(m.chat, text, m, { mentions: visibleCasinoMentions(mentions, wdb) })
  const replyWithImage = (text, mentions = []) => sendRpgMsg(conn, m, text, CASINO_ROOM_IMAGE, { mentions: visibleCasinoMentions(mentions, wdb) })
  const mention = jid => roomPlayerName(jid, wdb)
  if (cleanupExpiredCasinoRooms(wdb)) void saveDB(wdb)
  const activeRoom = wdb.casinoRooms?.[m.chat]
  if (activeRoom) {
    activeRoom.lastActivityAt = Date.now()
    void saveDB(wdb)
  }

 if (!action) {
  return replyWithImage(
    `╭─❏「 🎰 CASINO ROOM 」❏\n` +
    `│ 🎰 *CASINO ROOM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *MODE MULTIPLAYER*\n` +
    `> ↳ Mode multiplayer casino untuk bermain bersama dalam room,\n` +
    `> ↳ bertanding, dan memperebutkan total hadiah dari peserta.\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

  if (action === 'guide') return m.reply(roomGuide(usedPrefix))
  if (action === 'games') return m.reply(roomGamesMenu(usedPrefix))

  if (action === 'create') {
  if (wdb.casinoRooms?.[m.chat]) {
    return m.reply(
      `╭─❏「 🎰 CASINO ROOM 」❏\n` +
      `│ ❌ *ROOM SUDAH ADA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Room casino sudah ada di grup ini.\n` +
      `> ↳ Gunakan *${usedPrefix}cs room info* atau hapus room yang lama.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const stake = parseRpgMoneyAmount(args[2])

  if (stake === null || compareRpgMoney(stake, 100) < 0) {
    return m.reply(
      `╭─❏「 ❌ FORMAT SALAH 」❏\n` +
      `│ ❌ *Format taruhan tidak valid.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *CONTOH*\n` +
      `> ↳ *${usedPrefix}cs room create 1K* (minimal 100)\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (compareRpgMoney(wdb.money?.[m.sender] || 0, stake) < 0) {
    return m.reply(
      `╭─❏「 ❌ SALDO TIDAK CUKUP 」❏\n` +
      `│ ❌ *Uang saku tidak cukup.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Syarat taruhan : ${money(stake)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  wdb.casinoRooms = wdb.casinoRooms || {}
  wdb.casinoRooms[m.chat] = {
    master: m.sender,
    stake,
    currentStake: stake,
    pot: 0,
    contributions: {},
    game: null,
    status: 'waiting',
    players: [m.sender],
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
    round: 0,
    roundHistory: []
  }

  saveDB(wdb)

  return reply(
    `╭─❏「 🎰 CASINO ROOM CREATED 」❏\n` +
    `│ 🎰 *ROOM CASINO DIBUAT*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `👤 *INFORMASI ROOM*\n` +
    `> ↳ Master : ${mention(m.sender)}\n` +
    `> ↳ Syarat taruhan : ${money(stake)} per pemain\n` +
    `> ↳ Pemain : 1\n\n` +
    `📌 *LANGKAH BERIKUTNYA*\n` +
    `> ↳ Master otomatis masuk sebagai pemain.\n` +
    `> ↳ Pilih game atau tunggu pemain lain.\n` +
    `> ↳ Gunakan *${usedPrefix}cs room start* untuk memulai.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    [m.sender]
  )
}

const room = wdb.casinoRooms?.[m.chat]

if (!room) {
  return m.reply(
    `╭─❏「 🎰 CASINO ROOM 」❏\n` +
    `│ ❌ *BELUM ADA ROOM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *CARA MEMBUAT ROOM*\n` +
    `> ↳ Buat dengan *${usedPrefix}cs room create <taruhan>*.\n\n` +
    `${roomGamesMenu(usedPrefix)}`
  )
}

if (action === 'game') {
  if (room.master !== m.sender) {
    return m.reply(
      `╭─❏「 ❌ AKSES DITOLAK 」❏\n` +
      `│ ❌ *Hanya room master yang dapat memilih permainan.*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (!['waiting', 'round_wait'].includes(room.status)) {
    return m.reply(
      `╭─❏「 ❌ CASINO ROOM 」❏\n` +
      `│ ❌ *RONDE SEDANG BERLANGSUNG*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  const gameChoice = args.slice(2).join(' ').trim().toLowerCase()
  const selectedGame = ROOM_GAME_ALIASES[gameChoice]
    || ROOM_GAME_ALIASES[gameChoice.replace(/\s+/g, '')]
    || ROOM_GAME_ALIASES[gameChoice.replace(/\s+/g, '-')]

  if (!selectedGame) {
    return m.reply(
      `╭─❏「 ❌ FORMAT SALAH 」❏\n` +
      `│ ❌ *Pilihan game tidak ditemukan.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *CONTOH*\n` +
      `> ↳ *${usedPrefix}cs room game <pilihan>*\n\n` +
      `${roomGamesMenu(usedPrefix)}`
    )
  }

  room.game = selectedGame
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🎮 GAME ROOM 」❏\n` +
    `│ 🎮 *GAME DIPILIH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${ROOM_GAMES[room.game].emoji} ${ROOM_GAMES[room.game].name}\n` +
    `${room.status === 'round_wait' ? '> ↳ Game baru dipakai pada ronde berikutnya.\n\n' : '\n'}` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'join') {
  if (room.status !== 'waiting') {
    return m.reply(
      `╭─❏「 ❌ CASINO ROOM 」❏\n` +
      `│ ❌ *ROOM SUDAH DIMULAI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Room tidak menerima pemain baru.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (room.players.includes(m.sender)) {
    return m.reply(
      `╭─❏「 ❌ CASINO ROOM 」❏\n` +
      `│ ❌ *KAMU SUDAH BERGABUNG*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (!wdb.users?.[m.sender]?.rpg) {
    return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG.')
  }

  if (compareRpgMoney(wdb.money?.[m.sender] || 0, room.stake) < 0) {
    return m.reply(
      `╭─❏「 ❌ SALDO TIDAK CUKUP 」❏\n` +
      `│ ❌ *Uang saku untuk taruhan belum cukup.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Taruhan : ${money(room.stake)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  room.players.push(m.sender)
  saveDB(wdb)

  return reply(
    `╭─❏「 ✅ JOIN ROOM 」❏\n` +
    `│ 👤 *PEMAIN BERGABUNG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${mention(m.sender)} bergabung.\n` +
    `> ↳ Total pemain : ${room.players.length}\n\n` +
    `─━━━━━━━━━━━━━━─`,
    [m.sender]
  )
}

if (action === 'leave') {
  if (room.status !== 'waiting') {
    return m.reply(`Room yang sudah dimulai tidak menerima leave; gunakan room sampai selesai atau tunggu timeout 30 menit.`)
  }

  if (room.master === m.sender) {
    return m.reply(
      `╭─❏「 ❌ CASINO ROOM 」❏\n` +
      `│ ❌ *ROOM MASTER TIDAK BISA LEAVE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Gunakan *.cs room delete* untuk membatalkan room.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!room.players.includes(m.sender)) {
    return m.reply(
      `╭─❏「 ❌ CASINO ROOM 」❏\n` +
      `│ ❌ *KAMU TIDAK BERADA DI ROOM*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  room.players = room.players.filter(jid => jid !== m.sender)
  saveDB(wdb)

  return reply(
    `╭─❏「 🚪 LEAVE ROOM 」❏\n` +
    `│ 🚪 *PEMAIN KELUAR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${mention(m.sender)} keluar dari room.\n` +
    `> ↳ Saldo tidak berubah.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    [m.sender]
  )
}

if (action === 'kick') {
  if (room.status !== 'waiting') {
    return m.reply(`Pemain tidak dapat dikeluarkan setelah permainan dimulai.`)
  }

  if (room.master !== m.sender) {
    return m.reply(
      `╭─❏「 ❌ AKSES DITOLAK 」❏\n` +
      `│ ❌ *Hanya room master yang dapat mengeluarkan pemain.*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  const target = m.mentionedJid?.[0] || m.quoted?.sender

  if (!target || target === room.master || !room.players.includes(target)) {
    return m.reply(
      `╭─❏「 ❌ TARGET TIDAK VALID 」❏\n` +
      `│ ❌ *Pemain tidak ditemukan.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *CONTOH*\n` +
      `> ↳ *${usedPrefix}cs room kick @tag*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  room.players = room.players.filter(jid => jid !== target)
  saveDB(wdb)

  return reply(
    `╭─❏「 👢 KICK PLAYER 」❏\n` +
    `│ 👢 *PEMAIN DIKELUARKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${mention(target)} dikeluarkan dari room.\n` +
    `> ↳ Saldo tidak berubah.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    [target]
  )
}

if (action === 'player' || action === 'players') {
  const players = room.players
    .map((jid, index) => `> ${index + 1}. ${roomPlayerName(jid, wdb)}${jid === room.master ? ' (Master)' : ''}`)
    .join('\n')

  const prize = room.status === 'waiting'
    ? multiplyRpgMoney(room.stake, room.players.length)
    : normalizeRpgMoney(room.pot)
  const prizeLabel = room.status === 'waiting' ? 'Estimasi hadiah' : 'Pot saat ini'

  return replyWithImage(
    `╭─❏「 👥 CASINO ROOM 」❏\n` +
    `│ 👥 *PEMAIN ROOM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${players}\n\n` +
    `📊 *INFORMASI ROOM*\n` +
    `> ↳ Taruhan ronde berikutnya : ${money(room.currentStake || room.stake)}\n` +
    `> ↳ ${prizeLabel} : ${money(prize)}\n` +
    `> ↳ Game : ${room.game ? ROOM_GAMES[room.game].name : 'Acak'}\n` +
    `> ↳ Status : ${room.status}\n\n` +
    `─━━━━━━━━━━━━━━─`,
    room.players
  )
}

if (action === 'status') {
  const latestRound = room.roundHistory?.[room.roundHistory.length - 1]
  const statusLabel = room.status === 'waiting'
    ? 'Menunggu pemain dan siap dimulai'
    : room.status === 'round_wait'
      ? 'Menunggu keputusan master ronde berikutnya'
      : 'Permainan sedang berlangsung'

  const prize = room.status === 'waiting'
    ? multiplyRpgMoney(room.stake, room.players.length)
    : normalizeRpgMoney(room.pot)

  return replyWithImage(
    `╭─❏「 🎰 CASINO ROOM 」❏\n` +
    `│ 🎰 *STATUS ROOM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📊 *KONDISI SAAT INI*\n` +
    `> ↳ Master : ${roomPlayerName(room.master, wdb)}\n` +
    `> ↳ Status : ${statusLabel}\n` +
    `> ↳ Game : ${room.game ? ROOM_GAMES[room.game].name : 'Acak saat start'}\n` +
    `> ↳ Taruhan aktif : ${money(room.currentStake || room.stake)} per pemain\n` +
    `> ↳ Pot saat ini : ${money(prize)}\n` +
    `> ↳ Pemain aktif : ${room.players.length}\n` +
    `> ↳ Ronde : ${Number(room.round || 0)}\n\n` +
    `${latestRound ? `📌 *HASIL TERAKHIR*\n${formatRoomRound(latestRound, wdb)}\n\n` : ''}` +
    `> ↳ ${room.players.map(jid => roomPlayerName(jid, wdb)).join(', ')}\n\n` +
    `─━━━━━━━━━━━━━━─`,
    [room.master, ...room.players]
  )
}

if (action === 'info') {
  const prize = room.status === 'waiting'
    ? multiplyRpgMoney(room.stake, room.players.length)
    : normalizeRpgMoney(room.pot)
  const prizeLabel = room.status === 'waiting' ? 'Estimasi hadiah' : 'Pot saat ini'

  return replyWithImage(
    `╭─❏「 🎰 CASINO ROOM 」❏\n` +
    `│ 🎰 *INFORMASI ROOM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📋 *DETAIL ROOM*\n` +
    `> ↳ Master : ${roomPlayerName(room.master, wdb)}\n` +
    `> ↳ Game : ${room.game ? ROOM_GAMES[room.game].name : 'Acak saat start'}\n` +
    `> ↳ Taruhan ronde berikutnya : ${money(room.currentStake || room.stake)} per pemain\n` +
    `> ↳ ${prizeLabel} : ${money(prize)}\n` +
    `> ↳ Pemain : ${room.players.length}\n` +
    `> ↳ Ronde : ${Number(room.round || 0)}\n` +
    `> ↳ Status : ${room.status}\n\n` +
    `⚠️ Taruhan dipotong per ronde dan dikumpulkan sebagai pot.\n` +
    `> ↳ Ronde berikutnya: master pilih *.cs room next* (tetap) atau *.cs room up* (x2).\n\n` +
    `─━━━━━━━━━━━━━━─`,
    [room.master, ...room.players]
  )
}

if (action === 'delete') {
  if (room.master !== m.sender) {
    return m.reply(
      `╭─❏「 ❌ AKSES DITOLAK 」❏\n` +
      `│ ❌ *Hanya room master yang dapat menghapus room.*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (room.status !== 'waiting') {
    return m.reply(`Room yang sudah dimulai tidak dapat dihapus manual; timeout akan mengembalikan seluruh kontribusi jika room terbengkalai.`)
  }

  delete wdb.casinoRooms[m.chat]
  saveDB(wdb)

  return reply(
    `╭─❏「 🗑️ CASINO ROOM 」❏\n` +
    `│ 🗑️ *ROOM DIHAPUS*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Room berhasil dihapus.\n` +
    `> ↳ Tidak ada saldo pemain yang dipotong.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    room.players
  )
}

if (['start', 'up', 'next', 'set'].includes(action)) {
  const isFirstRound = action === 'start'
  if (room.master !== m.sender) {
    return m.reply(`Hanya room master yang dapat memulai atau memilih taruhan ronde berikutnya.`)
  }

  if (isFirstRound ? room.status !== 'waiting' : room.status !== 'round_wait') {
    return m.reply(isFirstRound
      ? `Room sudah dimulai. Lanjutkan dengan *.cs room next* atau *.cs room up*.`
      : `Belum ada ronde yang menunggu keputusan master.`)
  }

  if (isFirstRound && room.players.length < 2) {
    return m.reply(`Room membutuhkan minimal 2 pemain untuk memulai.`)
  }

  const requestedStake = action === 'set' ? parseRpgMoneyAmount(args[2]) : null
  if (action === 'set' && (requestedStake === null || compareRpgMoney(requestedStake, 100) < 0)) {
    return m.reply(
      `╭─❏「 ❌ FORMAT SALAH 」❏\n` +
      `│ ❌ *Nominal taruhan tidak valid.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Nominal minimal: ${money(100)}.\n` +
      `> ↳ Contoh: *${usedPrefix}cs room set 500K*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  room.game = room.game || pick(Object.keys(ROOM_GAMES))
  const stake = action === 'set'
    ? requestedStake
    : isFirstRound || action === 'next'
      ? normalizeRpgMoney(room.currentStake || room.stake)
      : multiplyRpgMoney(room.currentStake || room.stake, 2)

  const result = playCasinoRoomRound(room, wdb, stake)
  if (result.insufficientPlayer) {
    return reply(`Pemain ${mention(result.insufficientPlayer)} tidak memiliki saldo cukup untuk ronde ini. Saldo belum berubah.`, [result.insufficientPlayer])
  }
  if (result.invalidPot) {
    return m.reply(`Total pot melebihi batas aman saldo. Room tidak dilanjutkan dan saldo belum berubah.`)
  }

  if (result.winner) {
    delete wdb.casinoRooms[m.chat]
    saveDB(wdb)
    return reply(
      `╭─❏「 🏆 ${ROOM_GAMES[room.game].name.toUpperCase()} ROOM SELESAI 」❏\n` +
      `│ 🏆 *TURNAMEN SELESAI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${formatRoomRound(result, wdb)}\n\n` +
      `🏆 *PEMENANG*\n` +
      `> ↳ ${roomPlayerName(result.winner, wdb)}\n` +
      `> ↳ Hadiah total: ${money(result.prize)}\n` +
      `> ↳ Casino room tidak mengubah progres casino reguler.\n\n` +
      `─━━━━━━━━━━━━━━─`,
      Object.keys(room.contributions)
    )
  }

  saveDB(wdb)
  const nextStake = room.currentStake
  const roundMentions = result.eliminated ? [...room.players, result.eliminated] : [...room.players]
  return reply(
    `╭─❏「 🎮 ${ROOM_GAMES[room.game].name.toUpperCase()} ROOM 」❏\n` +
    `│ 🎮 *RONDE SELESAI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${formatRoomRound(result, wdb)}\n` +
    `\n👥 *PEMAIN TERSISA (${room.players.length})*\n` +
    `${room.players.map(jid => `> ↳ ${roomPlayerName(jid, wdb)}`).join('\n')}\n\n` +
    `💰 *TOTAL HADIAH ROOM*\n` +
    `> ↳ Pot sementara : ${money(room.pot)}\n` +
    `> ↳ Taruhan ronde ini: ${money(result.stake)}\n\n` +
    `👑 *Room Master bisa pilih:*\n` +
    `> ↳ ⏭️ *.cs room next* (${money(nextStake)}).\n` +
    `> ↳ ⬆️ *.cs room up* (${money(nextStake * 2)}).\n` +
    `> ↳ 💰 *.cs room set <nominal>*.\n` +
    `> ↳ 🎮 *.cs room game <pilihan>*.`,
    roundMentions
  )
}

return m.reply(
  `╭─❏「 ❌ CASINO ROOM 」❏\n` +
  `│ ❌ *SUBCOMMAND TIDAK DIKENAL*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `📌 *GUNAKAN*\n` +
  `> ↳ *${usedPrefix}casino command*\n` +
  `> ↳ *${usedPrefix}cs room games*\n\n` +
  `─━━━━━━━━━━━━━━─`
)
}

let handler = async (m, { conn, args, usedPrefix, groupMetadata }) => {
  const wdb = loadDB()
  const user = wdb.users?.[m.sender]?.rpg
  const input = (args[0] || '').toLowerCase()

  if (input === 'command' || input === 'commands') {
    const sections = [
      {
        title: '🎰 Meja permainan',
        rows: [
          ['🎲 Pilih permainan', 'casino games', 'Temukan meja yang cocok dengan gayamu'],
          ['📖 Kenali aturannya', 'casino guide', 'Pelajari peluang dan cara bermain dengan bijak'],
          ['🪪 Profil pemain', 'casino profile', 'Lihat perjalanan dan catatan permainanmu'],
          ['💹 Rekap keberuntungan', 'casino profit', 'Pantau hasil permainan secara ringkas'],
          ['🏆 Papan peringkat', 'casino top', 'Lihat para pemain paling beruntung'],
          ['👮‍♀️ Avelia Guard', 'cs guard', 'Lacak pelaku virtual setelah blackout'],
          ['🛡️ Proteksi Blackout', 'cs guard protect', 'Klaim perlindungan Premium mingguan'],
          ['⏳ Waktu bermain', 'casino cd', 'Periksa kapan kesempatan berikutnya tiba'],
          ['🧪 Coba simulasi', 'casino simulation', 'Kenali mekanisme tanpa mempertaruhkan saldo']
        ].map(([title, command, description]) => ({ title, description, id: `${usedPrefix}${command}` }))
      },
      {
        title: '👥 Main bersama',
        rows: [
          ['🏠 Ruang permainan', 'cs room guide', 'Siapkan sesi seru bersama teman-teman'],
          ['🎲 Pilih permainan grup', 'cs room games', 'Temukan permainan yang bisa dimainkan bersama'],
          ['📊 Status ruang', 'cs room status', 'Periksa sesi yang sedang kamu ikuti']
        ].map(([title, command, description]) => ({ title, description, id: `${usedPrefix}${command}` }))
      }
    ]
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '🎰 MALAM DI CASINO',
      subtitle: 'Pilih meja dan suasana permainanmu',
      text: casinoCommands(usedPrefix),
      buttonText: '🎰 JELAJAHI CASINO',
      sections,
      fallbackText: casinoCommands(usedPrefix),
      noThumbnail: true,
      noHeader: true
    })
  }

  if (!user) {
    return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG.')
  }

  if (!wdb.money) wdb.money = {}
  if (user.casinoBlocked) {
    return m.reply(`╭─❏「 🚫 CASINO 」❏\n│ Akses casino kamu sedang diblokir oleh admin.\n╰─━━━━━━━━━━━━━━─`)
  }
  const casinoShutdown = isRpgEventActive('casino_shutdown')
  const readOnlyCasinoInputs = ['', 'command', 'commands', 'guide', 'games', 'money', 'top', 'profile', 'profil', 'profit', 'cd', 'cooldown', 'hasil', 'history', 'record', 'guard']
  const roomReadOnlyActions = ['info', 'games', 'guide']
  if (casinoShutdown && !readOnlyCasinoInputs.includes(input) &&
      !(input === 'room' && roomReadOnlyActions.includes(String(args[1] || '').toLowerCase()))) {
    return m.reply('🚫 *CASINO SHUTDOWN*\nSeluruh permainan Casino sedang ditutup. Saldo dan inventori tetap aman.')
  }
  const inCasinoRoom = getPlayerCasinoRoom(wdb, m.sender)

  if (inCasinoRoom && input !== 'room' && !['hasil', 'history', 'record', 'guard'].includes(input)) {
    return m.reply(
      `╭─❏「 🚫 CASINO ROOM 」❏\n` +
      `│ 🔒 *Kamu sedang berada di room casino.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Fokus dulu di room ini sebelum membuka akses casino lain.\n` +
      `> ↳ Gunakan *${usedPrefix}cs room status* atau *${usedPrefix}cs room info* untuk melihat kondisi room.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (input === 'room') {
    return handleCasinoRoom(m, { conn, args, usedPrefix, wdb, user })
  }

  if (input === 'hasil' || input === 'results') {
    return m.reply(casinoResults(usedPrefix))
  }

  if (['simulation', 'sim', 'sl'].includes(input)) {
    let gameArgs = args.slice(1)
    if (input === 'simulation' && gameArgs[0]?.toLowerCase() === 'sl') gameArgs = gameArgs.slice(1)
    const gameInput = (gameArgs[0] || 'random').toLowerCase()
    const game = gameInput === 'random'
      ? pick(Object.keys(games))
      : aliases[gameInput]
    if (!game) return m.reply(`❌ Game tidak ditemukan. Gunakan *${usedPrefix}casino games* untuk melihat pilihan.`)
    const betInput = gameArgs[1]
    const bet = betInput === undefined
      ? cryptoRandomInt(MIN_RANDOM_CASINO_SIMULATION_BET, MAX_CASINO_SIMULATION_BET + 1)
      : parseRpgMoneyAmount(betInput)
    if (!Number.isSafeInteger(bet) || bet < 1 || bet > MAX_CASINO_SIMULATION_BET) {
      return m.reply(
        `❌ Nominal simulasi harus berupa angka bulat dari Rp 1 sampai ${money(MAX_CASINO_SIMULATION_BET)}.\n` +
        `Contoh: *${usedPrefix}cs sl random 999B*`
      )
    }
      const result = applyCasinoSpecialOutcome(normalizeResult(resultFor(game)))
    const balanceBefore = bet * number(5, 20)
    let blackoutLoss = 0
    let payout = result.payoutDenied
      ? 0
      : result.multiplier > 0
        ? bet + scaleDifficultyIncome(user, Math.floor(bet * (result.multiplier - 1)))
        : 0
    let net = result.payoutDenied ? 0 : payout - bet
    if (result.payoutDenied || result.escaped || result.dealerMercy) {
      payout = result.payoutDenied ? 0 : bet
      net = 0
    } else if (result.blackout) {
      payout = 0
      blackoutLoss = Math.min(balanceBefore, bet * 2)
      net = 0
    }
    const balanceAfter = balanceBefore + net - blackoutLoss
    const status = result.blackout
      ? '🌑 *BLACKOUT*'
      : result.escaped
        ? '🏃 *BERHASIL KABUR*'
        : result.dealerMercy
          ? '🤝 *BANDAR BERBAIK HATI*'
          : result.payoutDenied
            ? '🎟️ *HADIAH TIDAK CAIR*'
            : result.multiplier >= 10
              ? '🏆 *JACKPOT*'
              : result.multiplier > 0
                ? '🎉 *MENANG*'
                : '💀 *KALAH*'
    const dialog = pick(!result.blackout && (result.multiplier > 0 || result.dealerMercy || result.escaped) ? winDialogs : loseDialogs)
return m.reply(
  `╭─❏「 🧪 ${games[game].name.toUpperCase()} 」❏\n` +
  `│ 🧪 *SIMULASI CASINO*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `${result.text}\n\n` +
  `🎲 *HASIL*\n` +
  `> ↳ Status : ${status}\n` +
  `> ↳ Taruhan : ${money(bet)}\n` +
  `> ↳ Hadiah: ${money(payout)}\n` +
  `${result.blackout ? `> ↳ Uang Hilang : ${money(blackoutLoss)}\n` : ''}` +
  `> ↳ Profit : ${signedMoney(net)}\n` +
  `> ↳ 💰 Saldo Sebelum : ${money(balanceBefore)}\n` +
  `> ↳ 💰 Saldo Sesudah : ${money(balanceAfter)}\n\n` +
  `💬 *Dialog*\n` +
  `> ↳ "${dialog}"\n\n` +
  `🧪 *MODE SIMULASI*\n` +
  `> ↳ Saldo asli, cooldown, batas harian, dan statistik casino tidak berubah.\n\n` +
  `─━━━━━━━━━━━━━━─`
)
  }

  const stats = getCasinoStats(user)
  const dailyLimit = getDailyLimit(m.sender, wdb)
  if (input === 'guard') {
    const action = String(args[1] || '').toLowerCase()

    if (action === 'cancel') {
      delete user.casinoGuardPending
      saveDB(wdb)
      return m.reply('↩️ Aksi dibatalkan. Saldo dan perlindunganmu tidak berubah.')
    }

    if (action === 'protect' && ['no', 'cancel'].includes(String(args[2] || '').toLowerCase())) {
      return m.reply('↩️ Proteksi disimpan untuk nanti. Kesempatan minggu ini tetap tersedia.')
    }

    if (action === 'target' || action === 'choose') {
      const blackout = getLatestRecoverableBlackout(user)
      const targetIndex = Number(args[2]) - 1
      const target = blackout?.targets?.[targetIndex]
      if (!blackout || !target) {
        return m.reply(`❌ Target tidak tersedia. Buka daftar terbaru dengan *${usedPrefix}cs guard list*.`)
      }

      user.casinoGuardPending = { blackoutId: blackout.id, target, at: Date.now() }
      saveDB(wdb)
      return sendRpgConfirmButtons(conn, m, {
        text: `╭─❏「 👮‍♀️ AVELIA GUARD 」❏\n` +
          `│ 🎯 TARGET TERPILIH: *${target}*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `Avelia Guard siap menelusuri jejak pelaku ini dan mengamankan kembali *${money(getBlackoutRecoveryAmount(blackout))}*.\n\n` +
          `> ↳ Konfirmasi untuk mengirim tim pengamanan.\n` +
          `> ↳ Permintaan berlaku selama 5 menit.\n\n` +
          `─━━━━━━━━━━━━━━─`,
        title: '🛡️ KONFIRMASI PENGAMANAN',
        subtitle: 'Pastikan target sudah sesuai',
        acceptText: '👮‍♀️ Panggil Avelia Guard',
        acceptCommand: `${usedPrefix}cs guard confirm`,
        cancelText: '↩️ Pilih Nanti',
        cancelCommand: `${usedPrefix}cs guard cancel`,
        noThumbnail: true
      })
    }

    if (action === 'confirm') {
      const pending = user.casinoGuardPending
      if (!pending || Date.now() - Number(pending.at || 0) > CASINO_GUARD_CONFIRMATION_TTL) {
        delete user.casinoGuardPending
        saveDB(wdb)
        return m.reply(`⌛ Konfirmasi Avelia Guard sudah tidak berlaku. Pilih target lagi melalui *${usedPrefix}cs guard list*.`)
      }

      const blackout = (Array.isArray(user.casinoBlackouts) ? user.casinoBlackouts : [])
        .find(entry => entry.id === pending.blackoutId)
      const amount = getBlackoutRecoveryAmount(blackout)
      const balance = normalizeRpgMoney(wdb.money[m.sender])
      if (!blackout || !blackout.targets?.includes(pending.target) || compareRpgMoney(amount, 0) <= 0) {
        delete user.casinoGuardPending
        saveDB(wdb)
        return m.reply('ℹ️ Kasus ini sudah ditutup. Tidak ada uang yang perlu diamankan.')
      }
      const recoveredBalance = addRpgMoney(balance, amount)

      wdb.money[m.sender] = recoveredBalance
      blackout.guardRecovered = addRpgMoney(blackout.guardRecovered || 0, amount)
      blackout.guardTarget = pending.target
      blackout.guardResolvedAt = Date.now()
      delete user.casinoGuardPending
      saveDB(wdb)
      const guardStories = [
        `Avelia Guard membuntuti ${pending.target} hingga ke lorong belakang casino. Uangmu berhasil diamankan kembali.`,
        `Jejak transaksi mengarah ke ${pending.target}. Tim Avelia bergerak cepat dan membawa pulang seluruh uangmu.`,
        `${pending.target} tertangkap saat mencoba meninggalkan area. Avelia Guard memastikan uangmu kembali utuh.`,
        `Dengan bantuan saksi dan rekaman casino, Avelia Guard menemukan ${pending.target}. Kasus selesai—uangmu aman.`,
        `Operasi pengamanan berhasil! ${pending.target} menyerahkan uang yang dibawanya setelah dikepung tim Avelia.`
      ]
      return m.reply(
        `╭─❏「 ✅ KASUS DIAMANKAN 」❏\n` +
        `│ 👮‍♀️ AVELIA GUARD BERHASIL\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📖 *OPERASI*\n` +
        `> ↳ ${pick(guardStories)}\n\n` +
        `💰 *PEMULIHAN*\n` +
        `> ↳ Target: ${pending.target}\n` +
        `> ↳ Uang kembali: ${money(amount)}\n` +
        `> ↳ Profit casino tidak berubah; saldo saja yang dipulihkan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (action === 'protect') {
      if (!isPremiumUser(m.sender, wdb)) {
        return m.reply(`🛡️ Proteksi Blackout tersedia khusus Premium. Avelia Guard tetap bisa dipanggil melalui *${usedPrefix}cs guard list*.`)
      }
      const weekKey = casinoWeekKey()
      if (user.casinoBlackoutProtectionWeek === weekKey) {
        return m.reply(`🛡️ Proteksi minggu ini sudah digunakan. Kesempatan berikutnya terbuka lagi pada hari Senin.`)
      }
      const blackout = getLatestRecoverableBlackout(user, weekKey)
      const amount = getBlackoutRecoveryAmount(blackout)
      if (!blackout || compareRpgMoney(amount, 0) <= 0) {
        return m.reply(`🛡️ Belum ada kerugian blackout yang bisa diproteksi minggu ini. Proteksi direset otomatis setiap Senin.`)
      }
      if (['yes', 'confirm', 'ambil'].includes(String(args[2] || '').toLowerCase())) {
        const balance = normalizeRpgMoney(wdb.money[m.sender])
        const protectedBalance = addRpgMoney(balance, amount)
        wdb.money[m.sender] = protectedBalance
        blackout.insuredRecovered = addRpgMoney(blackout.insuredRecovered || 0, amount)
        user.casinoBlackoutProtectionWeek = weekKey
        saveDB(wdb)
        return m.reply(
          `╭─❏「 🛡️ PROTEKSI BLACKOUT 」❏\n` +
          `│ KLAIM PERLINDUNGAN BERHASIL\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Dana yang diproteksi: ${money(amount)}\n` +
          `> ↳ Kesempatan berikutnya: Senin mendatang\n` +
          `> ↳ Profit casino tidak berubah; saldo saja yang dipulihkan.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }
      return sendRpgConfirmButtons(conn, m, {
        text: `╭─❏「 🛡️ ASURANSI BLACKOUT 」❏\n` +
          `│ PROTEKSI PREMIUM MINGGU INI\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `Kamu dapat mengambil kembali *${money(amount)}* dari kerugian blackout.\n\n` +
          `> ↳ Bisa diklaim satu kali dalam minggu kalender.\n` +
          `> ↳ Kesempatan direset setiap Senin, bukan dihitung 7 hari.\n` +
          `> ↳ Klaim ini tidak mengubah profit casino.\n\n` +
          `─━━━━━━━━━━━━━━─`,
        title: '🛡️ PERLINDUNGAN PREMIUM',
        subtitle: 'Satu klaim tersedia hingga Senin',
        acceptText: '💰 Ambil Dana Proteksi',
        acceptCommand: `${usedPrefix}cs guard protect yes`,
        cancelText: '↩️ Simpan Proteksi',
        cancelCommand: `${usedPrefix}cs guard protect no`,
        noThumbnail: true
      })
    }

    if (action && action !== 'list') {
      return m.reply(`❌ Pilihan tidak dikenal. Gunakan *${usedPrefix}cs guard* atau *${usedPrefix}cs guard protect*.`)
    }

    const blackout = getLatestRecoverableBlackout(user)
    if (!blackout) {
      return m.reply(
        `╭─❏「 👮‍♀️ AVELIA GUARD 」❏\n` +
        `│ TIDAK ADA KASUS BLACKOUT AKTIF\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Saat terjadi blackout, daftar pelaku akan muncul di sini.\n` +
        `> ↳ Premium: x1 per minggu.\n` +
        `> ↳ Reset proteksi: setiap Senin.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const remaining = getBlackoutRecoveryAmount(blackout)
    const rows = blackout.targets.map((target, index) => ({
      title: `${index + 1}. ${target}`,
      description: 'Pelaku — pilih untuk meminta Avelia Guard menyelidiki',
      id: `${usedPrefix}cs guard target ${index + 1}`
    }))
    const protectionAvailable = isPremiumUser(m.sender, wdb) &&
      user.casinoBlackoutProtectionWeek !== casinoWeekKey() &&
      blackout.weekKey === casinoWeekKey()
    const fallbackText = `╭─❏「 👮‍♀️ AVELIA GUARD 」❏\n` +
      `│ DAFTAR PELAKU \n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${blackout.targets.map((target, index) => `> ↳ ${index + 1}. ${target} — ${usedPrefix}cs guard target ${index + 1}`).join('\n')}\n\n` +
      `Pilih target agar Avelia Guard mengamankan kembali ${money(remaining)}.\n` +
      `${protectionAvailable ? `Proteksi Premium tersedia: ${usedPrefix}cs guard protect\n` : ''}` +
      `─━━━━━━━━━━━━━━─`
    const menuSections = [{
      title: 'Pilih satu target',
      rows
    }]
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '👮‍♀️ DAFTAR KASUS BLACKOUT',
      subtitle: `Dana yang belum kembali: ${money(remaining)}`,
      text: `Avelia Guard sedang melacak pelaku virtual. Pilih satu nama untuk memulai penyelidikan.\n\n` +
        `> ↳ Profit casino tidak terpengaruh oleh blackout.\n` +
        `> ↳ ${isPremiumUser(m.sender, wdb)
          ? `Proteksi Premium: ${usedPrefix}cs guard protect (klaim 1x/minggu, reset Senin).`
          : 'Proteksi asuransi tersedia untuk pengguna Premium.'}`,
      buttonText: '👮‍♀️ PILIH PELAKU',
      sections: menuSections,
      fallbackText,
      noThumbnail: true,
      reply: fallback => m.reply(fallback)
    })
  }

  if (input === 'history') {
    return sendRpgQuickButton(conn, m, {
      text: casinoHistoryText(stats, dailyLimit, usedPrefix),
      title: '🗓️ RIWAYAT CASINO',
      buttonText: '🏆 BUKA RECORD',
      command: `${usedPrefix}cs record`,
      noThumbnail: true
    })
  }

  if (input === 'record') {
    return m.reply(casinoRecordText(stats))
  }

  if (!input) {
    const overview = menu(usedPrefix, wdb, conn, groupMetadata)
    return sendRpgMsg(conn, m, overview.text, CASINO_IMAGE, { mentions: overview.mentions })
  }

  if (input === 'command' || input === 'commands') {
    return m.reply(casinoCommands(usedPrefix))
  }

  if (input === 'guide') {
    return m.reply(casinoGuide(usedPrefix))
  }

  if (input === 'money') {
    return m.reply(
      `╭─❏「 💰 DAFTAR SUFIKS UANG 」❏\n` +
      `│ 💰 NOMINAL RINGKAS CASINO\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Gunakan suffix langsung setelah angka, contoh: *${usedPrefix}cs random 2M*.\n` +
      `Nominal taruhan, saldo, profit, hadiah, dan hasil ditampilkan ringkas.\n\n` +
      `${getRpgMoneySuffixGuide()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (input === 'nickname' || input === 'nick') {
    const nickname = args.slice(1).join(' ').trim()
    if (!nickname) {
      return m.reply(`Format: *${usedPrefix}casino nickname <julukan>*`)
    }
    if (nickname.length > 30) {
      return m.reply('Julukan maksimal 30 karakter.')
    }
    user.casinoNickname = nickname
    saveDB(wdb)
    return m.reply(`✅ Nickname casino kamu sekarang: *${nickname}*`)
  }

  if (input === 'games') {
    return m.reply(gamesMenu(usedPrefix))
  }

  if (input === 'top') {
    const leaderboard = top(wdb, conn, groupMetadata)
    return conn.reply(m.chat, leaderboard.text, m, { mentions: leaderboard.mentions })
  }

  if (input === 'profile' || input === 'profil' || input === 'profit') {
    if (input !== 'profit') {
      return sendRpgMsg(conn, m, profile(user, m.sender, dailyLimit, false), CASINO_IMAGE, { mentions: visibleCasinoMentions([m.sender], wdb) })
    }

    const isListPage = (args[1] || '').toLowerCase() === 'list'
    const selector = isListPage ? '' : args.slice(1).join(' ').toLowerCase()
    const listPage = isListPage && /^\d+$/.test(args[2] || '') ? Number(args[2]) : 1
    const profitSelection = isListPage ? 'all' : selector ? resolveProfitGame(selector) : 'all'
    if (!isListPage && !profitSelection) {
      return m.reply(
        `❌ Game tidak ditemukan.\n` +
        `Gunakan *${usedPrefix}cs games* untuk melihat urutan game, lalu pilih:\n` +
        `• *${usedPrefix}cs profit all*\n` +
        `• *${usedPrefix}cs profit <nama game/nomor>*`
      )
    }

    const { page, pageCount, sections } = casinoProfitSections(usedPrefix, listPage)
    const summaryText = profitSelection === 'all'
      ? casinoProfitText(user, 'all')
      : casinoProfitText(user, profitSelection)
    const text = `${summaryText}\n\n📌 *Pilih game untuk melihat rinciannya* · Halaman ${page}/${pageCount}`
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      text,
      image: CASINO_IMAGE,
      sections,
      noHeader: true,
      footer: 'AVELIA • RPG CASINO'
    })
  }

  if (input === 'cd' || input === 'cooldown') {
    return m.reply(cooldownMenu(user, usedPrefix))
  }

  const retryMode = input === 'retry'
  const legacySlot = /^\d+$/.test(input) || parseRpgMoneyAmount(input) !== null
  const legacyAll = input === 'all'
  const randomGame = input === 'random' || retryMode
  const randomBet = retryMode
    ? normalizeRpgMoney(user.casinoReplay?.bet)
    : args[1]?.toLowerCase() === 'all' ? normalizeRpgMoney(wdb.money[m.sender] || 0) : parseRpgMoneyAmount(args[1])
  const eligibleGames = Object.keys(games).filter(key => compareRpgMoney(games[key].minBet, randomBet) <= 0)
  let game = legacySlot
    ? 'slot'
    : legacyAll
      ? 'slot'
    : randomGame
      ? pick(eligibleGames.length ? eligibleGames : Object.keys(games))
      : aliases[input]

  if (retryMode) {
    if (compareRpgMoney(randomBet, 1) < 0) {
      return m.reply('❌ Belum ada permainan sebelumnya yang bisa diulang.')
    }
    const cooldowns = getCooldowns(user)
    const now = Date.now()
    const readyGames = eligibleGames.filter(key => {
      const duration = Number(user.casinoCooldownDurations?.[key]) || getGameCooldownDuration(key, 2, user)
      return now - (Number(cooldowns[key]) || 0) >= duration
    })
    if (!readyGames.length) {
      return m.reply(
        `╭─❏「 ⏳ MEJA CASINO 」❏\n` +
        `│ 🎲 SEMUA PERMAINAN MASIH BERISTIRAHAT\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Belum ada meja yang siap dimainkan dengan taruhan ${money(randomBet)}.\n` +
        `> ↳ Coba lagi setelah cooldown salah satu permainan selesai.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    game = pick(readyGames)
  }

  if (!game) {
    const overview = menu(usedPrefix, wdb, conn, groupMetadata)
    return sendRpgMsg(conn, m, overview.text, CASINO_IMAGE, { mentions: overview.mentions })
  }

  if (stats.dailyGames >= dailyLimit) {
  return m.reply(
    `╭─❏「 🛑 BATAS CASINO 」❏\n` +
    `│ 🛑 *Batas permainan tercapai.*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📊 *STATUS*\n` +
    `> ↳ Kamu sudah bermain ${dailyLimit}x hari ini.\n` +
    `> ↳ Akses casino diblokir sampai hari berganti.\n\n` +
    `⚠️ Istirahat dulu dan main secukupnya.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const betInput = retryMode ? String(randomBet) : legacySlot ? input : legacyAll ? 'all' : String(args[1] || '').toLowerCase()
const bet = betInput === 'all' ? normalizeRpgMoney(wdb.money[m.sender]) : parseRpgMoneyAmount(betInput)

if (bet === null || compareRpgMoney(bet, games[game].minBet) < 0) {
  return m.reply(
    `╭─❏「 ❌ TARUHAN 」❏\n` +
    `│ ❌ *Taruhan tidak valid.*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *BATAS TARUHAN*\n` +
    `> ↳ 💰 Minimal ${games[game].name} : ${money(games[game].minBet)}\n` +
    `> ↳ 📌 Contoh : *${usedPrefix}casino ${randomGame ? 'random' : game} ${formatRpgNumber(games[game].minBet)}*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (compareRpgMoney(wdb.money[m.sender] || 0, bet) < 0) {
  return m.reply(
    `╭─❏「 ❌ TARUHAN 」❏\n` +
    `│ 💸 *Uang di saku kamu tidak cukup!*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

const cooldowns = getCooldowns(user)
const lastPlayed = cooldowns[game] || 0
const elapsed = Date.now() - lastPlayed
const cooldownDuration = Number(user.casinoCooldownDurations?.[game]) || getGameCooldownDuration(game, 2, user)

if (elapsed < cooldownDuration) {
  return m.reply(
    `╭─❏「 ⏳ CASINO 」❏\n` +
    `│ ⏳ *${games[game].name} masih cooldown.*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu ${formatRemaining(cooldownDuration - elapsed)} lagi.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  const result = applyCasinoSpecialOutcome(
    normalizeResult(resultFor(game)),
    stats.dailyResults.blackouts === 0
  )
  const safetyNet = isRpgEventActive('safety_net')
  if (safetyNet && result.multiplier > 0 && Math.random() < 0.5) {
    result.multiplier = 0
    result.text += '\n🛡️ Safety Net mengurangi peluang kemenangan selama event.'
  }
  const balanceBefore = normalizeRpgMoney(wdb.money[m.sender])
  let blackoutLoss = 0
  const winFactor = (isRpgEventActive('golden_hour') ? 1.2 : 1) *
    (isRpgEventActive('low_stakes') ? 0.5 : 1) *
    getGroupTotemBuff(wdb.data, m.chat, 'casino', 'income')
  let payout = result.payoutDenied
    ? 0
    : result.multiplier > 0
    ? addRpgMoney(bet, multiplyRpgMoney(
      scaleDifficultyIncome(user, multiplyRpgMoney(bet, result.multiplier - 1)),
      winFactor
    ))
    : 0
  let net = result.payoutDenied ? 0 : subtractRpgMoney(payout, bet)
  if (result.payoutDenied) {
    payout = 0
  } else if (result.escaped) {
    payout = bet
    net = 0
  } else if (result.dealerMercy) {
    payout = bet
    net = 0
  } else if (result.blackout) {
    payout = 0
    blackoutLoss = minRpgMoney(balanceBefore, multiplyRpgMoney(bet, 2))
    net = 0
  }
  if (safetyNet && compareRpgMoney(net, 0) < 0 && !result.blackout) {
    payout = bet
    net = 0
  }
  const cashbackEvent = global.db?.data?.rpgEvents?.cashback_hour
  let cashback = 0
  if (isRpgEventActive('cashback_hour') && compareRpgMoney(net, 0) < 0 && cashbackEvent) {
    if (user.cashbackHour?.startedAt !== cashbackEvent.startedAt) {
      user.cashbackHour = { startedAt: cashbackEvent.startedAt, total: 0 }
    }
    cashback = minRpgMoney(
      maxRpgMoney(0, subtractRpgMoney(1_000_000, user.cashbackHour.total || 0)),
      multiplyRpgMoney(subtractRpgMoney(0, net), 0.25)
    )
    user.cashbackHour.total = addRpgMoney(user.cashbackHour.total || 0, cashback)
  }
  net = addRpgMoney(net, cashback)

  wdb.money[m.sender] = subtractRpgMoney(addRpgMoney(balanceBefore, net), blackoutLoss)
  cooldowns[game] = Date.now()
  user.casinoCooldownDurations = user.casinoCooldownDurations || {}
  user.casinoCooldownDurations[game] = getGameCooldownDuration(game, result.multiplier, user)

  stats.games++
  stats.dailyGames++
  stats.byGame[game] = stats.byGame[game] || { games: 0, wins: 0, profit: 0 }
  stats.byGame[game].games++
  stats.byGame[game].profit = addRpgMoney(stats.byGame[game].profit || 0, net)

  if (result.multiplier > 0 && !result.blackout) {
    stats.wins++
    stats.byGame[game].wins++
  }

  stats.profit = addRpgMoney(stats.profit || 0, net)
  incrementCasinoOutcome(stats.dailyResults, game, result)
  incrementCasinoOutcome(stats.recordResults, game, result)
  stats.dailyHistory.push({
    at: Date.now(),
    game,
    outcome: result.blackout
      ? '🌑 Blackout'
      : result.payoutDenied
        ? '🎟️ Hadiah tidak cair'
        : result.escaped
          ? '🏃 Berhasil kabur'
          : result.dealerMercy
            ? '🤝 Bandar berbaik hati'
            : result.multiplier >= 10
              ? '🏆 Jackpot'
              : result.multiplier > 0
                ? '🎉 Menang'
                : '💀 Kalah',
    bet,
    payout,
    profit: net,
    moneyChange: subtractRpgMoney(net, blackoutLoss)
  })
  stats.dailyHistory = stats.dailyHistory.slice(-PREMIUM_DAILY_LIMIT)
  wdb.casinoStats = wdb.casinoStats || { totalWinnings: 0 }
  if (result.multiplier > 0 && !result.payoutDenied && !result.blackout) {
    wdb.casinoStats.totalWinnings = addRpgMoney(wdb.casinoStats.totalWinnings || 0, payout)
  }

  if (result.blackout) {
    const now = Date.now()
    user.casinoBlackouts = Array.isArray(user.casinoBlackouts) ? user.casinoBlackouts : []
    user.casinoBlackouts.push({
      id: `${now}-${cryptoRandomInt(0, 1_000_000)}`,
      date: stats.dailyDate,
      weekKey: casinoWeekKey(now),
      amount: blackoutLoss,
      targets: makeBlackoutTargets(),
      createdAt: now,
      guardRecovered: 0,
      insuredRecovered: 0
    })
  }

  user.casinoReplay = { bet }
  saveDB(wdb)

  const status = result.blackout
    ? `🌑 *BLACKOUT*`
    : result.escaped
      ? `🏃 *BERHASIL KABUR*`
      : result.dealerMercy
        ? `🤝 *BANDAR BERBAIK HATI*`
        : result.payoutDenied
          ? `🎟️ *HADIAH TIDAK CAIR*`
    : result.multiplier >= 10
      ? `🏆 *JACKPOT*`
      : result.multiplier > 0
        ? `🎉 *MENANG*`
        : `💀 *KALAH*`
  const dialog = pick(!result.blackout && (result.multiplier > 0 || result.dealerMercy || result.escaped) ? winDialogs : loseDialogs)

if (result.blackout) {
  const blackoutButtons = [
    ['👮‍♀️ Panggil Avelia Guard', `${usedPrefix}cs guard`],
    ...(isPremiumUser(m.sender, wdb)
      ? [['🛡️ Proteksi Premium', `${usedPrefix}cs guard protect`]]
      : []),
    ['🎲 Main Lagi', `${usedPrefix}casino retry`]
  ]
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    title: '🌑 BLACKOUT — PILIH LANGKAH',
    subtitle: 'Dana hilang, profit casino tetap aman',
    footer: 'AVELIA • RPG CASINO',
    text: `╭─❏「 ${games[game].emoji} ${games[game].name.toUpperCase()} 」❏\n` +
      `│ 🎲 *HASIL PERMAINAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${result.text}\n\n` +
      `🎲 *HASIL*\n` +
      `> ↳ Status : ${status}\n` +
      `> ↳ Taruhan : ${money(bet)}\n` +
      `> ↳ Hadiah : ${money(payout)}\n` +
      `> ↳ Uang Hilang : ${money(blackoutLoss)}\n` +
      `> ↳ Profit : ${signedMoney(net)}\n` +
      `> ↳ 💰 Saldo Sebelum : ${money(balanceBefore)}\n` +
      `> ↳ 💰 Saldo Sesudah : ${money(wdb.money[m.sender])}\n\n` +
      `💬 *Dialog*\n` +
      `> ↳ "${dialog}"\n\n` +
      `👮‍♀️ Kerugian blackout tidak masuk ke profit casino. Avelia Guard dapat membantu mengambilnya kembali.\n` +
      `> ↳ Hari ini : ${stats.dailyGames}/${dailyLimit}x.`,
    buttons: blackoutButtons,
    noThumbnail: true,
    reply: fallbackText => m.reply(fallbackText)
  })
}

return sendRpgQuickButton(conn, m, {
  text: `╭─❏「 ${games[game].emoji} ${games[game].name.toUpperCase()} 」❏\n` +
  `│ 🎲 *HASIL PERMAINAN*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `${result.text}\n\n` +
  `🎲 *HASIL*\n` +
  `> ↳ Status : ${status}\n` +
  `> ↳ Taruhan : ${money(bet)}\n` +
  `> ↳ Hadiah : ${money(payout)}\n` +
  `${result.blackout ? `> ↳ Uang Hilang : ${money(blackoutLoss)}\n` : ''}` +
  `> ↳ Profit : ${signedMoney(net)}\n` +
  `${cashback ? `> ↳ Cashback Hour : +${money(cashback)}\n` : ''}` +
  `> ↳ 💰 Saldo Sebelum : ${money(balanceBefore)}\n` +
  `> ↳ 💰 Saldo Sesudah : ${money(wdb.money[m.sender])}\n\n` +
  `💬 *Dialog*\n` +
  `> ↳ "${dialog}"\n\n` +
  `─━━━━━━━━━━━━━━─\n\n` +
  `⚠️ *PENGINGAT*\n` +
  `> ↳ Main secukupnya.\n` +
  `> ↳ Hari ini : ${stats.dailyGames}/${dailyLimit}x.`,
  title: '🎲 SATU RONDE LAGI?',
  buttonText: '🎲 Main Lagi',
  command: `${usedPrefix}casino retry`,
  noThumbnail: true
})
}

handler.help = [
  'casino',
  'casino command',
  'casino guide',
  'casino money',
  'casino games',
  'casino random <taruhan>',
  'casino <game> all',
  'casino simulation <game/random> [nominal]',
  'cs sl <game/random> [nominal]',
  'cs hasil',
  'cs history',
  'cs record',
  'cs guard',
  'cs guard list',
  'cs guard target <nomor>',
  'cs guard protect',
  'casino top',
  'casino profile',
  'casino nickname <julukan>',
  'casino profit',
  'casino cd',
  'casino cooldown',
  'casino room create <taruhan>',
  'casino room join/leave/kick/player/start/next/up/delete/info/games',
  'casino room set <nominal>',
  'casino room game <pilihan>',
  'casino room <permainan>',
  'cs room create <taruhan>',
  ...Object.keys(games).map(key => `casino ${key} <taruhan>`)
]

handler.tags = ['rpg']
handler.command = ['casino', 'cs']
handler.group = true

export default handler