import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

const LOTTERY_TICKET_PRICE = 1000
const MIN_TICKETS_TO_WIN = 1000
const LOTTERY_PRIZE = 500000
const LOTTERY_IMAGE = 'https://c.termai.cc/i180/qPrLP.jpg'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function money(value) {
  return `Rp ${(Number(value) || 0).toLocaleString()}`
}

function initUserLottery(user) {
  user.rpg = user.rpg || {}
  user.rpg.lottery = user.rpg.lottery || {
    todayTickets: 0,
    totalAttempts: 0,
    totalTickets: 0,
    lastDate: ''
  }

  if (user.rpg.lottery.lastDate !== todayKey()) {
    user.rpg.lottery.todayTickets = 0
    user.rpg.lottery.lastDate = todayKey()
  }

  user.rpg.lottery.todayTickets = Number(user.rpg.lottery.todayTickets || 0)
  user.rpg.lottery.totalAttempts = Number(user.rpg.lottery.totalAttempts || 0)
  user.rpg.lottery.totalTickets = Number(user.rpg.lottery.totalTickets || 0)
}

function ensureLotteryState(wdb) {
  wdb.lottery = wdb.lottery || {
    dailyDate: '',
    pool: {},
    pendingWinner: null,
    pendingWinnerDate: '',
    pendingPrize: LOTTERY_PRIZE,
    claimed: false
  }

  wdb.lottery.pendingPrize = Number(wdb.lottery.pendingPrize || LOTTERY_PRIZE)

  if (!wdb.lottery.dailyDate) {
    wdb.lottery.dailyDate = todayKey()
    wdb.lottery.pool = {}
    return wdb.lottery
  }

  if (wdb.lottery.dailyDate !== todayKey()) {
    const previousDate = wdb.lottery.dailyDate
    const previousPool = wdb.lottery.pool || {}
    const eligiblePlayers = Object.entries(previousPool)
      .filter(([, count]) => Number(count) >= MIN_TICKETS_TO_WIN)

    const currentPrize = Number(wdb.lottery.pendingPrize || LOTTERY_PRIZE)

    if (eligiblePlayers.length) {
      wdb.lottery.pendingWinner = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)][0]
      wdb.lottery.pendingWinnerDate = previousDate
      wdb.lottery.pendingPrize = LOTTERY_PRIZE
      wdb.lottery.claimed = false
    } else {
      wdb.lottery.pendingWinner = null
      wdb.lottery.pendingWinnerDate = previousDate
      wdb.lottery.pendingPrize = currentPrize * 2
      wdb.lottery.claimed = false
    }

    wdb.lottery.dailyDate = todayKey()
    wdb.lottery.pool = {}
  }

  return wdb.lottery
}

function buildMenu(wdb, sender, usedPrefix) {
  const state = ensureLotteryState(wdb)
  const user = wdb.users?.[sender]

  if (!user) {
  return {
    text: `╭─❏「 ❌ LOTTERY 」❏\n` +
      `│ ❌ *Kamu belum memiliki data RPG.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *CARA MEMULAI*\n` +
      `> ↳ Mulai dengan *${usedPrefix}adventure*.\n\n` +
      `─━━━━━━━━━━━━━━─`,
    mentions: []
  }
}

  initUserLottery(user)

  const currentTickets = Number(user.rpg.lottery.todayTickets || 0)
  const totalAttempts = Number(user.rpg.lottery.totalAttempts || 0)
  const totalPurchased = Number(user.rpg.lottery.totalTickets || 0)
  const totalPool = Object.values(state.pool || {}).reduce((sum, value) => sum + Number(value || 0), 0)
  const currentPrize = Number(state.pendingPrize || LOTTERY_PRIZE)

  let chance = 0
  if (totalPool > 0 && currentTickets >= MIN_TICKETS_TO_WIN) {
    chance = Math.min(99.99, (currentTickets / totalPool) * 100)
  }

  let cap = `╭─❏「 🎟️ LOTTERY 」❏\n`
cap += `│ 🎟️ *DAILY LOTTERY*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `💰 *INFORMASI LOTTERY*\n`
cap += `> ↳ 1 tiket = ${money(LOTTERY_TICKET_PRICE)}\n`
cap += `> ↳ Hadiah hari ini: ${money(currentPrize)}\n\n`

if (state.pendingWinner) {
  cap += `🎉 *PENGUMUMAN LOTTERY*\n`
  cap += `> ↳ @${state.pendingWinner.split('@')[0]} menang lottery hari ${state.pendingWinnerDate}!\n`
  cap += `> ↳ Ketik *${usedPrefix}lottery claim* untuk mengklaim hadiah.\n\n`  }

  cap += `📊 *STATUS*\n`
  cap += `> ↳ Tiket hari ini: ${currentTickets.toLocaleString()}\n`
  cap += `> ↳ Keberuntungan: ${chance.toFixed(2)}%\n`
  cap += `> ↳ Percobaan: ${totalAttempts.toLocaleString()} kali\n`
  cap += `> ↳ Total beli tiket: ${totalPurchased.toLocaleString()}\n`

  cap += `🧾 *CARA*\n`
  cap += `> ↳ ${usedPrefix}lottery buy <jumlah>\n`
  cap += `> ↳ ${usedPrefix}lottery claim\n\n`

  cap += `⚠️ *Catatan:* peluang menang lottery sangat kecil, jadi beli tiket hanya jika memang ingin ikut.\n`
  cap += `─━━━━━━━━━━━━━━─`

  const mentions = state.pendingWinner ? [state.pendingWinner] : []
  return { text: cap, mentions }
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const wdb = loadDB()
  const sender = m.sender

if (!wdb.users?.[sender]) {
  return m.reply(
    `╭─❏「 ❌ LOTTERY 」❏\n` +
    `│ ❌ *Kamu belum memiliki data RPG.*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *CARA MEMULAI*\n` +
    `> ↳ Mulai dengan *${usedPrefix}adventure*.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  const state = ensureLotteryState(wdb)
  const user = wdb.users[sender]
  initUserLottery(user)

  const input = (args[0] || '').toLowerCase()

  if (!input || input === 'menu') {
    const menu = buildMenu(wdb, sender, usedPrefix)
    return sendRpgMsg(conn, m, menu.text, LOTTERY_IMAGE, { mentions: menu.mentions })
  }

  if (input === 'buy' || input === 'beli') {
    const jumlah = Number(args[1] || 0)

   if (!Number.isInteger(jumlah) || jumlah <= 0) {
  return m.reply(
    `╭─❏「 ❌ LOTTERY 」❏\n` +
    `│ ❌ *Format salah.*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *CONTOH*\n` +
    `> ↳ *${usedPrefix}lottery buy 1000*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const totalHarga = jumlah * LOTTERY_TICKET_PRICE
const saldo = Number(wdb.money?.[sender] || 0)

if (saldo < totalHarga) {
  return m.reply(
    `╭─❏「 ❌ LOTTERY 」❏\n` +
    `│ ❌ *Saldo kamu tidak cukup.*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *DETAIL SALDO*\n` +
    `> ↳ Butuh : ${money(totalHarga)}\n` +
    `> ↳ Punya : ${money(saldo)}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

    wdb.money[sender] = saldo - totalHarga
    state.pool[sender] = (state.pool[sender] || 0) + jumlah

    user.rpg.lottery.todayTickets = Number(user.rpg.lottery.todayTickets || 0) + jumlah
    user.rpg.lottery.totalAttempts = Number(user.rpg.lottery.totalAttempts || 0) + 1
    user.rpg.lottery.totalTickets = Number(user.rpg.lottery.totalTickets || 0) + jumlah
    user.rpg.lottery.lastDate = todayKey()

    saveDB(wdb)

    return m.reply(
      `╭─❏「 ✅ LOTTERY 」❏\n` +
      `│ Berhasil beli *${jumlah.toLocaleString()} tiket* lottery.\n` +
      `│ 💸 -${money(totalHarga)}\n` +
      `│ 📦 Tiket hari ini: ${user.rpg.lottery.todayTickets.toLocaleString()}\n` +
      `│ 🎯 Minimal agar lolos: ${MIN_TICKETS_TO_WIN.toLocaleString()} tiket\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (input === 'claim' || input === 'klaim') {
    if (!state.pendingWinner) {
      return m.reply(
        `╭─❏「 ❌ LOTTERY 」❏\n` +
        `│ Belum ada pemenang lottery hari ini.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    if (state.pendingWinner !== sender) {
      return m.reply(
        `╭─❏「 ❌ LOTTERY 」❏\n` +
        `│ Hanya pemenang yang bisa claim hadiah.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    const hadiah = Number(state.pendingPrize || LOTTERY_PRIZE)
    wdb.money[sender] = (Number(wdb.money?.[sender] || 0)) + hadiah

    state.pendingWinner = null
    state.pendingWinnerDate = ''
    state.pendingPrize = LOTTERY_PRIZE
    state.claimed = true

    saveDB(wdb)

    return conn.reply(
      m.chat,
      `╭─❏「 🎉 LOTTERY CLAIM 」❏\n` +
      `│ @${sender.split('@')[0]} selamat, kamu menang lottery!\n` +
      `│ 💰 Hadiah masuk saldo: ${money(hadiah)}\n` +
      `╰─━━━━━━━━━━━━━━─`,
      m,
      { mentions: [sender] }
    )
  }

  const menu = buildMenu(wdb, sender, usedPrefix)
  return sendRpgMsg(conn, m, menu.text, LOTTERY_IMAGE, { mentions: menu.mentions })
}

handler.help = ['lottery', 'lottery buy <jumlah>', 'lottery claim']
handler.tags = ['rpg']
handler.command = ['lottery']
handler.group = true

export default handler
