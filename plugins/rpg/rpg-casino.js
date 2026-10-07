import { randomInt as cryptoRandomInt } from 'node:crypto'
import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { isPremiumUser } from './rpg-bank.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'

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
const money = value => `Rp ${Math.max(0, value).toLocaleString()}`
const signedMoney = value => `${value >= 0 ? '+' : '-'}Rp ${Math.abs(Number(value) || 0).toLocaleString()}`
const DAILY_LIMIT = 25
const PREMIUM_DAILY_LIMIT = 50
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
  const amount = Number(contribution) || 0
    if (Number.isSafeInteger(amount) && amount > 0) {
      wdb.money[jid] = Number(wdb.money[jid] || 0) + amount
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

function applyCasinoSpecialOutcome(result) {
  if (!result.payoutDenied && Math.random() < 0.02) {
    result.blackout = true
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

function getTopPlayers(wdb, limit = 20) {
  return Object.entries(wdb.users || {})
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
        profit: Number(stats.profit || 0),
        title: getCasinoTitle(games)
      }]
    })
    .sort((a, b) => b.profit - a.profit || b.wins - a.wins)
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
    `> ↳ 🎮 ${prefix}casino <game> <taruhan>`,
    `> ↳ 💸 ${prefix}casino <game> all (seluruh uang saku)`,
    `> ↳ 🎲 ${prefix}casino random <taruhan>`,
    `> ↳ 🧪 ${prefix}casino simulation <game/random> [nominal] atau ${prefix}cs sl <game/random> [nominal]`,
    `> ↳ 📖 ${prefix}cs hasil`,
    `> ↳ 📋 ${prefix}casino games`,
    `> ↳ 📖 ${prefix}casino guide`,
    `> ↳ 👤 ${prefix}casino profile`,
    `> ↳ 💰 ${prefix}casino profit`,
    `> ↳ 🏆 ${prefix}casino top`,
    `> ↳ ⏰ ${prefix}casino cd`,
    `> ↳ ✏️ ${prefix}casino nickname <julukan>`,
    ``,
    `👥 *CASINO ROOM*`,
    `> ↳ 🏠 ${prefix}cs room create <taruhan>`,
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
    `> ↳ Uang hilang hingga maksimal 2x taruhan, dibatasi saldo yang tersedia.\n\n` +
    `🧪 *SIMULASI*\n` +
    `> ↳ ${prefix}cs sl <game/random> [nominal] menampilkan hasil virtual tanpa mengubah uang, cooldown, batas harian, atau statistik.\n\n` +
    `─━━━━━━━━━━━━━━─`
}

function casinoGuide(prefix) {
  return `╭─❏「 📖 CASINO GUIDE 」❏\n` +
    `│ 🎰 *PANDUAN CASINO*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *CARA BERMAIN*\n` +
    `> ↳ Mainkan dengan ${prefix}casino <game> <taruhan>.\n` +
    `> ↳ Lihat game dan minimum taruhan: ${prefix}casino games.\n` +
    `> ↳ Untuk game acak, gunakan ${prefix}casino random <taruhan>.\n` +
    `> ↳ Taruhan dapat berupa nominal atau *all* untuk memakai seluruh uang saku.\n` +
    `> ↳ Coba game tanpa memakai atau mendapatkan uang dengan ${prefix}casino simulation <game/random> [nominal] (alias: ${prefix}cs sl <game/random> [nominal]). Nominal acak selalu di atas Rp1 miliar; nominal pilihan maksimal Rp1 triliun.\n` +
    `> ↳ Hadiah dihitung dari taruhan dikali multiplier hasil.\n` +
    `> ↳ Cooldown game mengikuti difficulty; batas harian 25x, premium 50x.\n\n` +
    `> ↳ Casino room tidak terpengaruh batas/progres permainan reguler.\n\n` +

    `👥 *MULTIPLAYER*\n` +
    `> ↳ Multiplayer dapat dimainkan melalui casino room: ${prefix}cs room.\n` +
    `> ↳ Atur julukan dengan ${prefix}casino nickname <julukan>.\n\n` +

    `> ↳ Gunakan ${prefix}cs room status untuk melihat kondisi room terbaru.\n\n` +

    `─━━━━━━━━━━━━━━─`
}

function getPositivePlayerProfitTotal(wdb) {
  return Object.values(wdb.users || {}).reduce((total, account) => {
    const profit = Number(account?.rpg?.casinoStats?.profit || 0)
    return profit > 0 ? total + profit : total
  }, 0)
}

function menu(prefix, wdb) {
  const leader = getTopPlayers(wdb, 1)[0]
  const mentions = leader && !leader.nickname ? [leader.jid] : []
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
    ? `> ↳ ${casinoPlayerName(leader)}\n> ↳ Profit: ${signedMoney(leader.profit)}\n`
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

  text += `─━━━━━━━━━━━━━━─`

  return { text, mentions }
}

function casinoPlayerName(player) {
  const tag = `@${player.jid.split('@')[0]}`
  return player.nickname || tag
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

function top(wdb) {
  const players = getTopPlayers(wdb)

  if (!players.length) {
    return { text: `╭─❏「 🏆 CASINO TOP 」❏\n` +
      `│ Belum ada pemenang.\n` +
      `╰─━━━━━━━━━━━━━━─`, mentions: [] }
  }

  let text = `╭─❏「 🏆 CASINO TOP 20 」❏\n`
  text += `│ Pemain dengan kemenangan terbanyak.\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`

  players.forEach((player, index) => {
    text += `> *${index + 1}. 🏆 ${casinoPlayerName(player)}*\n`
    text += `> ↳ Title: ${player.title}\n`
    text += `> ↳ Menang: ${player.wins}x\n`
    text += `> ↳ Main: ${player.games}x\n`
    text += `> ↳ Profit: ${signedMoney(player.profit)}\n`

    if (index < players.length - 1) {
      text += `\n─━━━━━━━━━━━━━━─\n`
    }
  })

  return { text, mentions: players.filter(player => !player.nickname).map(player => player.jid) }
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
      `\n📌 Ketik *.casino profit* untuk melihat total dan detail profit setiap game.\n\n` +
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
    if (!wdb.users?.[jid]?.rpg || Number(wdb.money?.[jid] || 0) < stake) {
      return { insufficientPlayer: jid }
    }
  }

  const roundContribution = stake * players.length
  if (!Number.isSafeInteger(roundContribution) || !Number.isSafeInteger((room.pot || 0) + roundContribution)) {
    return { invalidPot: true }
  }

  const scores = playRoomRound(room.game, players)
  const lowest = Math.min(...Object.values(scores))
  const lowestPlayers = players.filter(jid => scores[jid] === lowest)
  const eliminated = lowestPlayers.length === 1 ? lowestPlayers[0] : null

  for (const jid of players) {
    wdb.money[jid] = Number(wdb.money[jid] || 0) - stake
    room.contributions[jid] = Number(room.contributions[jid] || 0) + stake
  }

  room.pot = Number(room.pot || 0) + roundContribution
  room.players = eliminated ? players.filter(jid => jid !== eliminated) : [...players]
  room.round = Number(room.round || 0) + 1
  room.currentStake = stake
  room.lastActivityAt = Date.now()
  const result = { scores, eliminated, stake, number: room.round, tie: lowestPlayers.length > 1 }
  room.roundHistory = [...(room.roundHistory || []), result]

  if (room.players.length === 1) {
    const winner = room.players[0]
    wdb.money[winner] = Number(wdb.money[winner] || 0) + room.pot
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

  const stake = Number(args[2])

  if (!Number.isSafeInteger(stake) || stake < 100) {
    return m.reply(
      `╭─❏「 ❌ FORMAT SALAH 」❏\n` +
      `│ ❌ *Format taruhan tidak valid.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *CONTOH*\n` +
      `> ↳ *${usedPrefix}cs room create <taruhan minimal 100>*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (Number(wdb.money?.[m.sender] || 0) < stake) {
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
    return m.reply(
      `╭─❏「 ❌ DATA RPG 」❏\n` +
      `│ ❌ *Kamu belum memiliki data RPG.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Mulai dengan *.adventure* terlebih dahulu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (Number(wdb.money?.[m.sender] || 0) < room.stake) {
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
    ? room.players.length * Number(room.stake)
    : Number(room.pot || 0)
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
    ? room.players.length * Number(room.stake)
    : Number(room.pot || 0)

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
    ? room.players.length * Number(room.stake)
    : Number(room.pot || 0)
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

  const requestedStake = action === 'set' ? Number(args[2]) : null
  if (action === 'set' && (!Number.isSafeInteger(requestedStake) || requestedStake < 100)) {
    return m.reply(
      `╭─❏「 ❌ FORMAT SALAH 」❏\n` +
      `│ ❌ *Nominal taruhan tidak valid.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Nominal minimal: ${money(100)}.\n` +
      `> ↳ Contoh: *${usedPrefix}cs room set 500000*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  room.game = room.game || pick(Object.keys(ROOM_GAMES))
  const stake = action === 'set'
    ? requestedStake
    : isFirstRound || action === 'next'
      ? Number(room.currentStake || room.stake)
      : Number(room.currentStake || room.stake) * 2

  if (!Number.isSafeInteger(stake)) {
    return m.reply(`Taruhan berikutnya melebihi batas aman saldo. Gunakan *.cs room next* untuk melanjutkan tanpa kenaikan.`)
  }

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
  const input = (args[0] || '').toLowerCase()
  const inCasinoRoom = getPlayerCasinoRoom(wdb, m.sender)

  if (inCasinoRoom && input !== 'room' && input !== 'hasil') {
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
      : /^\d+$/.test(betInput) ? Number(betInput) : NaN
    if (!Number.isSafeInteger(bet) || bet < 1 || bet > MAX_CASINO_SIMULATION_BET) {
      return m.reply(
        `❌ Nominal simulasi harus berupa angka bulat dari Rp1 sampai Rp${MAX_CASINO_SIMULATION_BET.toLocaleString('id-ID')}.\n` +
        `Contoh: *${usedPrefix}cs sl random 999999999999*`
      )
    }
    const result = applyCasinoSpecialOutcome(normalizeResult(resultFor(game)))
    const balanceBefore = bet * number(5, 20)
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
      net = -Math.min(balanceBefore, bet * 2)
    }
    const balanceAfter = balanceBefore + net
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
    const dialog = pick(result.multiplier > 0 || result.dealerMercy || result.escaped ? winDialogs : loseDialogs)
return m.reply(
  `╭─❏「 🧪 SIMULASI ${games[game].name.toUpperCase()} 」❏\n` +
  `│ 🧪 *HASIL CASINO*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `${result.text}\n\n` +
  `🎲 *HASIL*\n` +
  `> ↳ Status : ${status}\n` +
  `> ↳ Taruhan Simulasi : ${money(bet)}\n` +
  `> ↳ Hadiah Simulasi : ${money(payout)}\n` +
  `${result.blackout ? `> ↳ Uang Simulasi Hilang : ${money(-net)} (maksimal 2x taruhan)\n` : ''}` +
  `> ↳ Profit Simulasi : ${signedMoney(net)}\n` +
  `> ↳ 💰 Saldo Virtual Sebelum : ${money(balanceBefore)}\n` +
  `> ↳ 💰 Saldo Virtual Sesudah : ${money(balanceAfter)}\n\n` +
  `💬 *Dialog*\n` +
  `> ↳ "${dialog}"\n\n` +
  `🧪 *MODE SIMULASI*\n` +
  `> ↳ Saldo asli, cooldown, batas harian, dan statistik casino tidak berubah.\n\n` +
  `─━━━━━━━━━━━━━━─`
)
  }

  const stats = getCasinoStats(user)
  const dailyLimit = getDailyLimit(m.sender, wdb)

  if (!input) {
    const overview = menu(usedPrefix, wdb)
    return sendRpgMsg(conn, m, overview.text, CASINO_IMAGE, { mentions: overview.mentions })
  }

  if (input === 'command' || input === 'commands') {
    return m.reply(casinoCommands(usedPrefix))
  }

  if (input === 'guide') {
    return m.reply(casinoGuide(usedPrefix))
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
    const leaderboard = top(wdb)
    return conn.reply(m.chat, leaderboard.text, m, { mentions: leaderboard.mentions })
  }

  if (input === 'profile' || input === 'profil' || input === 'profit') {
    return sendRpgMsg(conn, m, profile(user, m.sender, dailyLimit, input === 'profit'), CASINO_IMAGE, { mentions: visibleCasinoMentions([m.sender], wdb) })
  }

  if (input === 'cd' || input === 'cooldown') {
    return m.reply(cooldownMenu(user, usedPrefix))
  }

  const legacySlot = /^\d+$/.test(input)
  const legacyAll = input === 'all'
  const randomGame = input === 'random'
  const randomBet = args[1]?.toLowerCase() === 'all' ? Number(wdb.money[m.sender] || 0) : Number(args[1])
  const eligibleGames = Object.keys(games).filter(key => games[key].minBet <= randomBet)
  const game = legacySlot
    ? 'slot'
    : legacyAll
      ? 'slot'
    : randomGame
      ? pick(eligibleGames.length ? eligibleGames : Object.keys(games))
      : aliases[input]

  if (!game) {
    const overview = menu(usedPrefix, wdb)
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

const betInput = legacySlot ? input : legacyAll ? 'all' : String(args[1] || '').toLowerCase()
const bet = betInput === 'all' ? Math.floor(Number(wdb.money[m.sender]) || 0) : Number(betInput)

if (!Number.isInteger(bet) || bet < games[game].minBet) {
  return m.reply(
    `╭─❏「 ❌ TARUHAN 」❏\n` +
    `│ ❌ *Taruhan tidak valid.*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *BATAS TARUHAN*\n` +
    `> ↳ 💰 Minimal ${games[game].name} : ${money(games[game].minBet)}\n` +
    `> ↳ 📌 Contoh : *${usedPrefix}casino ${randomGame ? 'random' : game} ${games[game].minBet}*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if ((wdb.money[m.sender] || 0) < bet) {
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

  const result = applyCasinoSpecialOutcome(normalizeResult(resultFor(game)))
  const balanceBefore = wdb.money[m.sender] || 0
  let payout = result.payoutDenied
    ? 0
    : result.multiplier > 0
    ? bet + scaleDifficultyIncome(user, Math.floor(bet * (result.multiplier - 1)))
    : 0
  let net = result.payoutDenied ? 0 : payout - bet
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
    net = -Math.min(balanceBefore, bet * 2)
  }

  wdb.money[m.sender] = balanceBefore + net
  cooldowns[game] = Date.now()
  user.casinoCooldownDurations = user.casinoCooldownDurations || {}
  user.casinoCooldownDurations[game] = getGameCooldownDuration(game, result.multiplier, user)

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
  wdb.casinoStats = wdb.casinoStats || { totalWinnings: 0 }
  if (result.multiplier > 0 && !result.payoutDenied) {
    wdb.casinoStats.totalWinnings = Number(wdb.casinoStats.totalWinnings || 0) + payout
  }

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
  const dialog = pick(result.multiplier > 0 || result.dealerMercy || result.escaped ? winDialogs : loseDialogs)

return m.reply(
  `╭─❏「 ${games[game].emoji} ${games[game].name.toUpperCase()} 」❏\n` +
  `│ 🎲 *HASIL PERMAINAN*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `${result.text}\n\n` +
  `🎲 *HASIL*\n` +
  `> ↳ Status : ${status}\n` +
  `> ↳ Taruhan : ${money(bet)}\n` +
  `> ↳ Hadiah : ${money(payout)}\n` +
  `${result.blackout ? `> ↳ Uang Hilang : ${money(-net)} (maksimal 2x taruhan)\n` : ''}` +
  `> ↳ Profit : ${signedMoney(net)}\n` +
  `> ↳ 💰 Saldo Sebelum : ${money(balanceBefore)}\n` +
  `> ↳ 💰 Saldo Sesudah : ${money(wdb.money[m.sender])}\n\n` +
  `💬 *Dialog*\n` +
  `> ↳ "${dialog}"\n\n` +
  `─━━━━━━━━━━━━━━─\n\n` +
  `⚠️ *PENGINGAT*\n` +
  `> ↳ Main secukupnya.\n` +
  `> ↳ Hari ini : ${stats.dailyGames}/${dailyLimit}x.`
)
}

handler.help = [
  'casino',
  'casino command',
  'casino guide',
  'casino games',
  'casino random <taruhan>',
  'casino <game> all',
  'casino simulation <game/random> [nominal]',
  'cs sl <game/random> [nominal]',
  'cs hasil',
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