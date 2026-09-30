import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { isPremiumUser } from './rpg-bank.js'

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
  blacksapphire: { name: 'Black Sapphire', aliases: ['blacksapphire', 'black-sapphire', 'bs'] },
  uno: { name: 'UNO', aliases: ['uno'] },
  mahjong: { name: 'Mahjong', aliases: ['mahjong'] },
  poker: { name: 'Poker', aliases: ['poker'] },
  monopoly: { name: 'Monopoly', aliases: ['monopoly'] }
}
const ROOM_GAME_ALIASES = Object.fromEntries(Object.entries(ROOM_GAMES).flatMap(([key, game]) => game.aliases.map(alias => [alias, key])))
const ROOM_MAX_ROUNDS = 12

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

function resultFor(game) {
if (game === 'slot') {
  const symbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '🔔', '7️⃣', '💎', '⭐', '👑', '💰', '💵', '🍀', '🃏', '🎰']
  const reels = Array.from({ length: 9 }, () => pick(symbols))
  const middle = reels.slice(3, 6)
  const jackpot = middle[0] === middle[1] && middle[1] === middle[2]
  const pair = middle[0] === middle[1] || middle[1] === middle[2] || middle[0] === middle[2]

  return {
    multiplier: jackpot ? 10 : pair ? 1.5 : 0,
    text:
      `> ${reels[0]} | ${reels[1]} | ${reels[2]}\n` +
      `> ${reels[3]} | ${reels[4]} | ${reels[5]} ❮\n` +
      `> ${reels[6]} | ${reels[7]} | ${reels[8]}`
  }
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

function getTopPlayers(wdb, limit = 20) {
  return Object.entries(wdb.users || {})
    .filter(([, user]) => user.rpg?.casinoStats?.games > 0)
    .map(([jid, user]) => ({
      jid,
      nickname: String(user.rpg.casinoNickname || '').trim(),
      wins: Number(user.rpg.casinoStats.wins || 0),
      games: Number(user.rpg.casinoStats.games || 0),
      profit: Number(user.rpg.casinoStats.profit || 0),
      title: getCasinoTitle(Number(user.rpg.casinoStats.games || 0))
    }))
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
    `> ↳ 🎲 ${prefix}casino random <taruhan>`,
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
    `> ↳ ▶️ ${prefix}cs room start`,
    `> ↳ 🗑️ ${prefix}cs room delete`,
    `> ↳ ℹ️ ${prefix}cs room info`,
    `> ↳ 🎮 ${prefix}cs room games`,
    `> ↳ 📖 ${prefix}cs room guide`,
    `> ↳ 🎯 ${prefix}cs room game <pilihan>`,
    ``,
    `─━━━━━━━━━━━━━━─`
  ].join('\n')
}

function casinoGuide(prefix) {
  return `╭─❏「 📖 CASINO GUIDE 」❏\n` +
    `│ 🎰 *PANDUAN CASINO*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *CARA BERMAIN*\n` +
    `> ↳ Mainkan dengan ${prefix}casino <game> <taruhan>.\n` +
    `> ↳ Lihat game dan minimum taruhan: ${prefix}casino games.\n` +
    `> ↳ Untuk game acak, gunakan ${prefix}casino random <taruhan>.\n` +
    `> ↳ Hadiah dihitung dari taruhan dikali multiplier hasil.\n` +
    `> ↳ Setiap game cooldown 60 detik; batas harian 25x, premium 50x.\n\n` +

    `👥 *MULTIPLAYER*\n` +
    `> ↳ Multiplayer dapat dimainkan melalui casino room: ${prefix}cs room.\n` +
    `> ↳ Atur julukan dengan ${prefix}casino nickname <julukan>.\n\n` +

    `─━━━━━━━━━━━━━━─`
}

function menu(prefix, wdb) {
  const leader = getTopPlayers(wdb, 1)[0]
  const mentions = leader && !leader.nickname ? [leader.jid] : []

  let text = `╭─❏「 🎰 AVELIA CASINO 」❏\n`
  text += `│ 🎰 *AVELIA CASINO*\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`

  text += `📊 *INFORMASI CASINO*\n`
  text += `> ↳ 🎮 Total permainan : ${Object.keys(games).length}\n`
  text += `> ↳ 💰 Hadiah terkumpulkan : ${money(wdb.casinoStats?.totalWinnings || 0)}\n\n`

  text += `🏆 *TOP CASINO #1*\n`
  text += leader
    ? `> ↳ ${casinoPlayerName(leader)}\n> ↳ Profit: ${signedMoney(leader.profit)}\n`
    : `> ↳ Belum ada pemain\n`

  text += `> ↳ 🎟️ Batas harian : ${DAILY_LIMIT}x biasa / ${PREMIUM_DAILY_LIMIT}x premium\n\n`

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
    Object.entries(ROOM_GAMES).map(([key, game]) => `> ${game.name}: ${prefix}cs room game ${key}`).join('\n')
}

function roomGuide(prefix) {
  return `╭─❏「 📖 CASINO ROOM GUIDE 」❏\n` +
    `│ 🎰 *PANDUAN CASINO ROOM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *CARA BERMAIN*\n` +
    `> ↳ Buat room : ${prefix}cs room create <taruhan>.\n` +
    `> ↳ Pemain lain bergabung dengan : ${prefix}cs room join.\n` +
    `> ↳ Master memilih game : ${prefix}cs room game <pilihan>.\n` +
    `> ↳ Game yang tersedia : Black Sapphire, UNO, Mahjong, Poker, Monopoly.\n` +
    `> ↳ Jika game tidak dipilih, sistem memilih secara acak.\n\n` +

    `🎮 *MULAI PERMAINAN*\n` +
    `> ↳ Mulai : ${prefix}cs room start.\n` +
    `> ↳ Setiap ronde, tiap pemain mendapat 5 gacha.\n` +
    `> ↳ Skor terendah yang unik tereliminasi; jika seri, ronde diulang.\n\n` +

    `📌 *CATATAN*\n` +
    `> ↳ Room dapat dihapus sebelum start tanpa memotong saldo.\n\n` +

    `─━━━━━━━━━━━━━━─`
}

function playRoomRound(gameKey, players) {
  return Object.fromEntries(players.map(jid => {
    let score = 0
    for (let attempt = 0; attempt < 5; attempt++) {
      const result = gameKey === 'monopoly'
        ? { multiplier: Math.random() < 0.35 ? 2 : 0 }
        : resultFor(gameKey)
      if (result.multiplier > 0) score++
    }
    return [jid, score]
  }))
}

function runRoomTournament(room) {
  let active = [...room.players]
  const rounds = []

  for (let round = 1; round <= ROOM_MAX_ROUNDS && active.length > 1; round++) {
    const scores = playRoomRound(room.game, active)
    const lowest = Math.min(...Object.values(scores))
    const eliminated = active.filter(jid => scores[jid] === lowest)
    rounds.push({ scores, eliminated: eliminated.length === 1 ? eliminated[0] : null })
    if (eliminated.length === 1) active = active.filter(jid => jid !== eliminated[0])
  }

  return { winner: pick(active), rounds, tiebreak: active.length > 1 }
}

async function handleCasinoRoom(m, { conn, args, usedPrefix, wdb, user }) {
  const action = String(args[1] || '').toLowerCase()
  const reply = (text, mentions = []) => conn.reply(m.chat, text, m, { mentions: visibleCasinoMentions(mentions, wdb) })
  const replyWithImage = (text, mentions = []) => sendRpgMsg(conn, m, text, CASINO_ROOM_IMAGE, { mentions: visibleCasinoMentions(mentions, wdb) })
  const mention = jid => roomPlayerName(jid, wdb)

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
    if (wdb.casinoRooms?.[m.chat]) return m.reply('Room casino sudah ada di grup ini. Gunakan `.cs room info` atau hapus room yang lama.')
    const stake = Number(args[2])
    if (!Number.isInteger(stake) || stake < 100) return m.reply(`Format: *${usedPrefix}cs room create <taruhan minimal 100>*`)
    if (Number(wdb.money?.[m.sender] || 0) < stake) return m.reply(`Uang saku untuk syarat taruhan ${money(stake)} belum cukup.`)
    wdb.casinoRooms = wdb.casinoRooms || {}
    wdb.casinoRooms[m.chat] = {
      master: m.sender,
      stake,
      game: null,
      status: 'waiting',
      players: [m.sender],
      createdAt: Date.now()
    }
    saveDB(wdb)
    return reply(`✅ Room casino dibuat oleh ${mention(m.sender)}.\nSyarat taruhan: ${money(stake)} per pemain.\nMaster otomatis masuk sebagai pemain. Pilih game atau tunggu pemain lain, lalu gunakan ${usedPrefix}cs room start.`, [m.sender])
  }

  const room = wdb.casinoRooms?.[m.chat]
  if (!room) return m.reply(`Belum ada room casino. Buat dengan *${usedPrefix}cs room create <taruhan>*.\n\n${roomGamesMenu(usedPrefix)}`)

  if (action === 'game') {
    if (room.master !== m.sender) return m.reply('Hanya room master yang dapat memilih permainan.')
    if (room.status !== 'waiting') return m.reply('Permainan room sudah dimulai.')
    const selectedGame = ROOM_GAME_ALIASES[String(args[2] || '').toLowerCase()]
    if (!selectedGame) return m.reply(`Pilih game dengan format *${usedPrefix}cs room game <pilihan>*.\n\n${roomGamesMenu(usedPrefix)}`)
    room.game = selectedGame
    saveDB(wdb)
    return m.reply(`🎮 Game room dipilih: *${ROOM_GAMES[room.game].name}*`)
  }

  if (action === 'join') {
    if (room.status !== 'waiting') return m.reply('Room sudah dimulai dan tidak menerima pemain baru.')
    if (room.players.includes(m.sender)) return m.reply('Kamu sudah berada di room ini.')
    if (!wdb.users?.[m.sender]?.rpg) return m.reply('Kamu belum memiliki data RPG. Mulai dengan *.adventure* terlebih dahulu.')
    if (Number(wdb.money?.[m.sender] || 0) < room.stake) return m.reply(`Uang saku untuk taruhan ${money(room.stake)} belum cukup.`)
    room.players.push(m.sender)
    saveDB(wdb)
    return reply(`✅ ${mention(m.sender)} bergabung. Pemain: ${room.players.length}`, [m.sender])
  }

  if (action === 'leave') {
    if (room.master === m.sender) return m.reply('Room master tidak bisa leave. Gunakan `.cs room delete` untuk membatalkan room.')
    if (!room.players.includes(m.sender)) return m.reply('Kamu tidak berada di room ini.')
    room.players = room.players.filter(jid => jid !== m.sender)
    saveDB(wdb)
    return reply(`${mention(m.sender)} keluar dari room. Saldo tidak berubah.`, [m.sender])
  }

  if (action === 'kick') {
    if (room.master !== m.sender) return m.reply('Hanya room master yang dapat mengeluarkan pemain.')
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target || target === room.master || !room.players.includes(target)) return m.reply(`Tag atau reply pemain yang akan dikeluarkan. Contoh: *${usedPrefix}cs room kick @tag*`)
    room.players = room.players.filter(jid => jid !== target)
    saveDB(wdb)
    return reply(`${mention(target)} dikeluarkan dari room. Saldo tidak berubah.`, [target])
  }

  if (action === 'player' || action === 'players') {
    const players = room.players.map((jid, index) => `> ${index + 1}. ${roomPlayerName(jid, wdb)}${jid === room.master ? ' (Master)' : ''}`).join('\n')
    const prize = room.players.length * room.stake
    return replyWithImage(`👥 *PEMAIN ROOM*\n${players}\n\nTaruhan: ${money(room.stake)} | Total hadiah: ${money(prize)}\nGame: ${room.game ? ROOM_GAMES[room.game].name : 'Acak'}\nStatus: ${room.status}`, room.players)
  }

  if (action === 'info') {
    const prize = room.players.length * room.stake
    return replyWithImage(`🎰 *CASINO ROOM*\nMaster: ${roomPlayerName(room.master, wdb)}\nGame: ${room.game ? ROOM_GAMES[room.game].name : 'Acak saat start'}\nTaruhan: ${money(room.stake)} per pemain\nTotal hadiah: ${money(prize)}\nPemain: ${room.players.length}\nStatus: ${room.status}\nSaldo belum dipotong sebelum turnamen selesai.`, [room.master, ...room.players])
  }

  if (action === 'delete') {
    if (room.master !== m.sender) return m.reply('Hanya room master yang dapat menghapus room.')
    delete wdb.casinoRooms[m.chat]
    saveDB(wdb)
    return reply('🗑️ Room dihapus. Tidak ada saldo pemain yang dipotong.', room.players)
  }

  if (action === 'start') {
    if (room.master !== m.sender) return m.reply('Hanya room master yang dapat memulai permainan.')
    if (room.status !== 'waiting') return m.reply('Permainan room sudah dimulai.')
    if (room.players.length < 2) return m.reply('Room membutuhkan minimal 2 pemain.')

    for (const jid of room.players) {
      if (!wdb.users?.[jid]?.rpg || Number(wdb.money?.[jid] || 0) < room.stake) {
        return reply(`${mention(jid)} tidak memiliki saldo yang cukup. Tidak ada saldo yang dipotong.`, [jid])
      }
      const stats = getCasinoStats(wdb.users[jid].rpg)
      if (stats.dailyGames >= getDailyLimit(jid, wdb)) {
        return reply(`${mention(jid)} sudah mencapai batas casino hari ini. Tidak ada saldo yang dipotong.`, [jid])
      }
    }

    room.status = 'playing'
    room.game = room.game || pick(Object.keys(ROOM_GAMES))
    const { winner, rounds, tiebreak } = runRoomTournament(room)
    const prize = room.players.length * room.stake
    const roundText = rounds.map((round, index) => {
      const scores = Object.entries(round.scores).map(([jid, score]) => `${roomPlayerName(jid, wdb)} ${score}/5`).join(' | ')
      const result = round.eliminated ? `Tereliminasi: ${roomPlayerName(round.eliminated, wdb)}` : 'Skor terendah seri, lanjut ronde berikutnya.'
      return `Ronde ${index + 1}: ${scores}\n> ${result}`
    }).join('\n\n')

    for (const jid of room.players) wdb.money[jid] = Number(wdb.money[jid] || 0) - room.stake
    wdb.money[winner] = Number(wdb.money[winner] || 0) + prize

    for (const jid of room.players) {
      const stats = getCasinoStats(wdb.users[jid].rpg)
      const won = jid === winner
      const net = won ? prize - room.stake : -room.stake
      stats.games++
      stats.dailyGames++
      stats.profit += net
      stats.byGame[room.game] = stats.byGame[room.game] || { games: 0, wins: 0, profit: 0 }
      stats.byGame[room.game].games++
      stats.byGame[room.game].profit = Number(stats.byGame[room.game].profit || 0) + net
      if (won) {
        stats.wins++
        stats.byGame[room.game].wins++
      }
    }

    wdb.casinoStats = wdb.casinoStats || { totalWinnings: 0 }
    wdb.casinoStats.totalWinnings = Number(wdb.casinoStats.totalWinnings || 0) + prize
    delete wdb.casinoRooms[m.chat]
    saveDB(wdb)
    return reply(`🏆 *${ROOM_GAMES[room.game].name.toUpperCase()} ROOM SELESAI*\n${roundText}\n\n${tiebreak ? 'Seri berlanjut hingga batas ronde; pemenang ditentukan secara acak.\n' : ''}Pemenang: ${roomPlayerName(winner, wdb)}\nHadiah total: ${money(prize)}\nSaldo pemain lain berkurang ${money(room.stake)}.`, room.players)
  }

  return m.reply(`Subcommand room tidak dikenal. Gunakan *${usedPrefix}casino command* atau *${usedPrefix}cs room games*.`)
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
  const dailyLimit = getDailyLimit(m.sender, wdb)

  const input = (args[0] || '').toLowerCase()

  if (input === 'room') {
    return handleCasinoRoom(m, { conn, args, usedPrefix, wdb, user })
  }

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
  const randomGame = input === 'random'
  const randomBet = Number(args[1])
  const eligibleGames = Object.keys(games).filter(key => games[key].minBet <= randomBet)
  const game = legacySlot
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

const bet = Number(legacySlot ? input : args[1])

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

if (elapsed < GAME_COOLDOWN) {
  return m.reply(
    `╭─❏「 ⏳ CASINO 」❏\n` +
    `│ ⏳ *${games[game].name} masih cooldown.*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu ${formatRemaining(GAME_COOLDOWN - elapsed)} lagi.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  const result = normalizeResult(resultFor(game))
  const payout = Math.floor(bet * result.multiplier)
  const net = payout - bet
  const balanceBefore = wdb.money[m.sender] || 0

  wdb.money[m.sender] = balanceBefore + net
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
  wdb.casinoStats = wdb.casinoStats || { totalWinnings: 0 }
  if (result.multiplier > 0) {
    wdb.casinoStats.totalWinnings = Number(wdb.casinoStats.totalWinnings || 0) + payout
  }

  saveDB(wdb)

  const status =
    result.multiplier >= 10
      ? `🏆 *JACKPOT*`
      : result.multiplier > 0
        ? `🎉 *MENANG*`
        : `💀 *KALAH*`
  const dialog = pick(result.multiplier > 0 ? winDialogs : loseDialogs)

  return m.reply(
    `╭─❏「 ${games[game].emoji} ${games[game].name.toUpperCase()} 」❏\n` +
    `${result.text}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🎲 *HASIL*\n` +
    `> ↳ ${status}\n` +
    `> ↳ Taruhan: ${money(bet)}\n` +
    `> ↳ Hadiah: ${money(payout)}\n` +
    `> ↳ Profit: ${signedMoney(net)}\n` +
    `> ↳ 💰 Sebelum: ${money(balanceBefore)}\n` +
    `> ↳ 💰 Sesudah: ${money(wdb.money[m.sender])}\n\n` +
    `💬 Kamu: "${dialog}"\n` +
    `\n─━━━━━━━━━━━━━━─\n` +
    `⚠️ Main secukupnya. Hari ini: ${stats.dailyGames}/${dailyLimit}x.`
  )
}

handler.help = [
  'casino',
  'casino command',
  'casino guide',
  'casino games',
  'casino random <taruhan>',
  'casino top',
  'casino profile',
  'casino nickname <julukan>',
  'casino profit',
  'casino cd',
  'casino cooldown',
  'casino room create <taruhan>',
  'casino room join/leave/kick/player/start/delete/info/games',
  'casino room <permainan>',
  'cs room create <taruhan>',
  ...Object.keys(games).map(key => `casino ${key} <taruhan>`)
]

handler.tags = ['rpg']
handler.command = ['casino', 'cs']
handler.group = true

export default handler