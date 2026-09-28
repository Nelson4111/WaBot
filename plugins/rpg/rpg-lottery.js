import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

const LOTTERY_TICKET_PRICE = 10000
const LOTTERY_PRIZE = 500000
const LOTTERY_LOW_ODDS = 0.001
const LOTTERY_LUCKY_DATE_ODDS = 0.9
const LOTTERY_LUCKY_DAYS = new Set([1, 5, 7, 12, 14, 15, 17, 19, 21, 23, 24, 25, 27, 29])
const PURCHASE_CONFIRMATION_TTL = 5 * 60 * 1000
const LOTTERY_IMAGE = 'https://c.termai.cc/i180/qPrLP.jpg'
const DRAW_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function todayKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function money(value) {
  return `Rp ${(Number(value) || 0).toLocaleString()}`
}

function totalTicketsAcrossUsers(users) {
  return Object.values(users || {}).reduce((total, entry) => {
    const user = entry?.rpg || entry
    return total + Number(user?.lottery?.totalTickets || 0)
  }, 0)
}

function makeDrawCode() {
  return Array.from({ length: 9 }, () => DRAW_CODE_CHARS[Math.floor(Math.random() * DRAW_CODE_CHARS.length)]).join('')
}

function hasLuckyDate(date) {
  const day = Number(String(date).slice(-2))
  return LOTTERY_LUCKY_DAYS.has(day)
}

function getGiveawayState(chat) {
  const database = global.db.data
  database.giveaways = database.giveaways || {}
  database.giveaways[chat] = database.giveaways[chat] || { nextId: 1, draft: null, active: {} }
  const state = database.giveaways[chat]
  state.active = state.active || {}
  state.nextId = Number(state.nextId) || 1
  return state
}

function parseDuration(value) {
  const match = String(value || '').trim().toLowerCase().match(/^(\d+)\s*(m|menit|h|jam)?$/)
  if (!match) return null
  const amount = Number(match[1])
  const unit = match[2] || 'h'
  const duration = amount * (unit === 'm' || unit === 'menit' ? 60000 : 3600000)
  return duration > 0 && duration <= 86400000 ? duration : null
}

function formatDuration(milliseconds) {
  const minutes = Math.ceil(milliseconds / 60000)
  return minutes >= 60 ? `${Math.ceil(minutes / 60)} jam` : `${minutes} menit`
}

function scheduleGiveawayEnd(conn, chat, giveaway) {
  global.giveawayTimers = global.giveawayTimers || new Map()
  const key = `${chat}:${giveaway.id}`
  if (global.giveawayTimers.has(key)) return
  const timer = setTimeout(async () => {
    global.giveawayTimers.delete(key)
    const state = getGiveawayState(chat)
    const current = state.active[giveaway.id]
    if (current && current.endsAt <= Date.now()) await finishGiveaway(conn, chat, state, current)
  }, Math.max(0, giveaway.endsAt - Date.now()))
  timer.unref?.()
  global.giveawayTimers.set(key, timer)
}

async function finishGiveaway(conn, chat, state, giveaway) {
  if (!state.active[giveaway.id]) return
  delete state.active[giveaway.id]
  const participants = [...new Set(giveaway.participants || [])]
  const winner = participants.length ? participants[Math.floor(Math.random() * participants.length)] : null
  const wdb = loadDB()
  const creator = wdb.users[giveaway.creator]
  const creatorRpg = creator?.rpg || creator

  if (winner && giveaway.rewardType === 'money') {
    wdb.money[winner] = Number(wdb.money[winner] || 0) + giveaway.amount
  } else if (winner && giveaway.rewardType === 'limit') {
    const winnerUser = wdb.users[winner] = wdb.users[winner] || {}
    const winnerRpg = winnerUser.rpg || winnerUser
    winnerRpg.limit = Number(winnerRpg.limit || 0) + giveaway.amount
  } else if (!winner && giveaway.rewardType === 'money') {
    wdb.money[giveaway.creator] = Number(wdb.money[giveaway.creator] || 0) + giveaway.amount
  } else if (!winner && giveaway.rewardType === 'limit' && creatorRpg) {
    creatorRpg.limit = Number(creatorRpg.limit || 0) + giveaway.amount
  }

  await saveDB(wdb)
  const reward = giveaway.rewardType === 'money'
    ? `${money(giveaway.amount)}`
    : giveaway.rewardType === 'limit'
      ? `${giveaway.amount.toLocaleString()} limit`
      : giveaway.reward
  const text = winner
    ? `🎉 *GIVEAWAY #${giveaway.id} SELESAI!\n> Hadiah: ${reward}\n> Pemenang: @${winner.split('@')[0]}${giveaway.rewardType === 'custom' ? '\n> Hadiah custom diserahkan oleh penyelenggara.' : ''}`
    : `Giveaway #${giveaway.id} berakhir tanpa peserta, jadi belum ada yang beruntung.`
  await conn.reply(chat, text, null, { mentions: winner ? [winner] : [] })
}

async function settleExpiredGiveaways(conn, chat, state) {
  for (const giveaway of Object.values(state.active)) {
    if (giveaway.endsAt <= Date.now()) await finishGiveaway(conn, chat, state, giveaway)
    else scheduleGiveawayEnd(conn, chat, giveaway)
  }
}

function giveawayReward(args) {
  const first = (args[0] || '').toLowerCase()
  if (['money', 'uang', 'limit'].includes(first)) {
    const amount = Number(args[1])
    if (!Number.isSafeInteger(amount) || amount <= 0) return null
    return {
      rewardType: first === 'limit' ? 'limit' : 'money',
      amount,
      reward: '',
      requirement: args.slice(2).join(' ').replace(/^\|\s*/, '') || 'Tidak Ada'
    }
  }

  const input = args.join(' ').trim()
  if (!input) return null
  const [reward, requirement] = input.includes('|')
    ? input.split(/\s*\|\s*/, 2)
    : input.split(/\s+/, 2)
  return {
    rewardType: 'custom',
    amount: 0,
    reward: reward.trim(),
    requirement: requirement?.trim() || 'Tidak Ada'
  }
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
    jackpot: LOTTERY_PRIZE,
    basePrize: LOTTERY_PRIZE,
    pendingPrize: 0,
    claimed: false,
    lastWinner: null,
    lastWinnerDate: '',
    lastPrize: 0,
    lastDrawCode: '',
    pendingDrawCode: '',
    history: [],
    pendingPurchases: {},
    totalTickets: 0
  }

  wdb.lottery.basePrize = Number(wdb.lottery.basePrize) > 0 ? Number(wdb.lottery.basePrize) : LOTTERY_PRIZE
  wdb.lottery.jackpot = Number(wdb.lottery.jackpot) > 0 ? Number(wdb.lottery.jackpot) : Number(wdb.lottery.pendingPrize || wdb.lottery.basePrize)
  wdb.lottery.pendingPrize = Number(wdb.lottery.pendingPrize || 0)
  wdb.lottery.pool = wdb.lottery.pool || {}
  wdb.lottery.lastWinner ??= wdb.lottery.pendingWinner || null
  wdb.lottery.lastWinnerDate ||= wdb.lottery.pendingWinnerDate || ''
  wdb.lottery.lastPrize = Number(wdb.lottery.lastPrize || wdb.lottery.pendingPrize || 0)
  wdb.lottery.lastDrawCode ||= wdb.lottery.pendingDrawCode || ''
  wdb.lottery.pendingDrawCode ||= ''
  wdb.lottery.history = Array.isArray(wdb.lottery.history) ? wdb.lottery.history : []
  wdb.lottery.pendingPurchases = wdb.lottery.pendingPurchases || {}
  wdb.lottery.totalTickets = totalTicketsAcrossUsers(wdb.users)

  for (const [jid, entry] of Object.entries(wdb.users || {})) {
    const user = entry?.rpg || entry
    const lottery = user?.lottery
    if (lottery && lottery.lastDate === wdb.lottery.dailyDate && Number(lottery.todayTickets) > Number(wdb.lottery.pool[jid] || 0)) {
      wdb.lottery.pool[jid] = Number(lottery.todayTickets)
    }
  }

  if (!wdb.lottery.dailyDate) {
    wdb.lottery.dailyDate = todayKey()
    wdb.lottery.pool = {}
    return wdb.lottery
  }

  if (wdb.lottery.dailyDate !== todayKey()) {
    const previousDate = wdb.lottery.dailyDate
    const previousPool = wdb.lottery.pool || {}
    const previousDay = Date.parse(`${previousDate}T00:00:00+07:00`)
    const currentDay = Date.parse(`${todayKey()}T00:00:00+07:00`)
    const elapsedDays = Number.isFinite(previousDay)
      ? Math.max(1, Math.floor((currentDay - previousDay) / 86400000))
      : 1
    const currentPrize = Number(wdb.lottery.jackpot || wdb.lottery.basePrize)
    const players = Object.entries(previousPool).filter(([, count]) => Number(count) > 0)
    const guaranteedPlayers = players.filter(([, count]) => Number(count) * LOTTERY_TICKET_PRICE > currentPrize)
    const drawPool = guaranteedPlayers.length ? guaranteedPlayers : players
    const drawChance = Math.min(LOTTERY_LOW_ODDS, LOTTERY_LOW_ODDS * LOTTERY_PRIZE / Math.max(currentPrize, 1))
    const hasWinner = guaranteedPlayers.length > 0 || (players.length > 0 && Math.random() < (hasLuckyDate(previousDate) ? LOTTERY_LUCKY_DATE_ODDS : drawChance))

    if (drawPool.length && hasWinner) {
      const totalTickets = drawPool.reduce((total, [, count]) => total + Number(count), 0)
      let winningTicket = Math.floor(Math.random() * totalTickets)
      let winner = drawPool[0][0]
      for (const [jid, count] of drawPool) {
        winningTicket -= Number(count)
        if (winningTicket < 0) {
          winner = jid
          break
        }
      }
      wdb.lottery.pendingWinner = winner
      wdb.lottery.pendingWinnerDate = previousDate
      wdb.lottery.pendingPrize = currentPrize
      wdb.lottery.claimed = false
      wdb.lottery.lastWinner = wdb.lottery.pendingWinner
      wdb.lottery.lastWinnerDate = previousDate
      wdb.lottery.lastPrize = currentPrize
      wdb.lottery.pendingDrawCode = makeDrawCode()
      wdb.lottery.lastDrawCode = wdb.lottery.pendingDrawCode
      wdb.lottery.history.unshift({ jid: winner, date: previousDate, prize: currentPrize, drawCode: wdb.lottery.lastDrawCode })
    } else {
      wdb.lottery.pendingWinner = null
      wdb.lottery.pendingWinnerDate = previousDate
      wdb.lottery.pendingPrize = 0
      wdb.lottery.claimed = false
      wdb.lottery.lastWinner = null
      wdb.lottery.lastWinnerDate = previousDate
      wdb.lottery.lastPrize = 0
      wdb.lottery.pendingDrawCode = ''
      wdb.lottery.lastDrawCode = ''
    }

    wdb.lottery.jackpot = hasWinner
      ? wdb.lottery.basePrize
      : currentPrize + (wdb.lottery.basePrize * elapsedDays)
    wdb.lottery.dailyDate = todayKey()
    wdb.lottery.pool = {}
  }

  return wdb.lottery
}

function buildMenu(wdb, sender, usedPrefix) {
  const state = ensureLotteryState(wdb)
  const user = wdb.users?.[sender]
  if (user) initUserLottery(user)
  const currentTickets = Number(user?.rpg?.lottery?.todayTickets || 0)
  const currentPrize = Number(state.jackpot || state.basePrize || LOTTERY_PRIZE)

  let cap = `╭─❏「 🎟️ LOTTERY 」❏\n`
cap += `│ 🎟️ *DAILY LOTTERY*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `💰 *INFORMASI LOTTERY*\n`
cap += `> ↳ 1 tiket = ${money(LOTTERY_TICKET_PRICE)}\n`
cap += `> ↳ Hadiah hari ini: ${money(currentPrize)}\n\n`

if (state.pendingWinner) {
  cap += `🎉 *PENGUMUMAN LOTTERY*\n`
  cap += `> ↳ @${state.pendingWinner.split('@')[0]} menang lottery hari ${state.pendingWinnerDate}!\n`
  if (state.pendingWinner === sender) {
    cap += `> ↳ Ketik *${usedPrefix}lottery claim* untuk mengklaim hadiah.\n`
  }
  cap += `\n`
}

  cap += `📊 *STATUS*\n`
  cap += `> ↳ Tiket hari ini: ${currentTickets.toLocaleString()}\n`
  cap += `> ↳ Harga tiket: ${money(LOTTERY_TICKET_PRICE)}\n`

  cap += `🧾 *CARA*\n`
  cap += `> ↳ ${usedPrefix}lottery buy <jumlah>, lalu konfirmasi yes/no\n`
  cap += `> ↳ ${usedPrefix}lottery stats | ${usedPrefix}lottery history | ${usedPrefix}lottery guide\n`
  if (state.pendingWinner === sender) cap += `> ↳ ${usedPrefix}lottery claim\n`
  cap += `─━━━━━━━━━━━━━━─`

  const mentions = state.pendingWinner ? [state.pendingWinner] : []
  return { text: cap, mentions }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const wdb = loadDB()
  const sender = m.sender
  const giveawayCommand = command === 'giveaway'

  const previousLotteryDate = wdb.lottery?.dailyDate
  const state = ensureLotteryState(wdb)
  if (previousLotteryDate !== state.dailyDate) await saveDB(wdb)
  const user = wdb.users[sender]
  if (user) initUserLottery(user)

  const input = giveawayCommand ? 'giveaway' : (args[0] || '').toLowerCase()

  if (!input || input === 'menu') {
    const menu = buildMenu(wdb, sender, usedPrefix)
    return sendRpgMsg(conn, m, menu.text, LOTTERY_IMAGE, { mentions: menu.mentions })
  }

  if (input === 'guide' || input === 'panduan') {
    return m.reply(
      `🎟️ *PANDUAN LOTTERY*\n\n` +
      `1. Ketik *${usedPrefix}lottery* untuk melihat hadiah saat ini, harga tiket, dan status tiketmu.\n\n` +
      `2. Untuk membeli, ketik *${usedPrefix}lottery buy <jumlah tiket>*. Contoh: *${usedPrefix}lottery buy 5*. Harga satu tiket ${money(LOTTERY_TICKET_PRICE)}. Bot akan menampilkan rincian harga terlebih dahulu.\n\n` +
      `3. Periksa rincian pembelian, lalu ketik *${usedPrefix}lottery buy yes* untuk menyetujui. Saldo dipotong setelah persetujuan. Ketik *${usedPrefix}lottery buy no* untuk membatalkan. Konfirmasi berlaku 5 menit.\n\n` +
      `4. Undian diproses saat periode harian berganti. Jika namamu terpilih, cek *${usedPrefix}lottery info* untuk melihat pemenang, hadiah, dan nomor undian.\n\n` +
      `5. Jika kamu pemenang, ketik *${usedPrefix}lottery claim* untuk memasukkan hadiah ke saldo.\n\n` +
      `6. Gunakan *${usedPrefix}lottery stats* untuk melihat hadiah dan jumlah tiket terjual hari ini/total, atau *${usedPrefix}lottery history* untuk melihat pemenang terdahulu.`
    )
  }

  if (input === 'command' || input === 'commands' || input === 'cmd') {
    return m.reply(
      `🎟️ *COMMAND LOTTERY*\n` +
      `> ${usedPrefix}lottery\n` +
      `> ${usedPrefix}lottery guide\n` +
      `> ${usedPrefix}lottery buy <jumlah>\n` +
      `> ${usedPrefix}lottery buy yes\n` +
      `> ${usedPrefix}lottery buy no\n` +
      `> ${usedPrefix}lottery info\n` +
      `> ${usedPrefix}lottery stats\n` +
      `> ${usedPrefix}lottery history\n` +
      `> ${usedPrefix}lottery claim`
    )
  }

  if (input === 'info') {
    if (!state.lastWinner) {
      return m.reply(`Belum ada yang beruntung di grup ini. Pemenang lottery akan ditentukan setelah pergantian hari.`)
    }
    return conn.reply(
      m.chat,
      `🎉 Pemenang lottery tanggal ${state.lastWinnerDate}: @${state.lastWinner.split('@')[0]}\n🎟️ Nomor undian: *${state.lastDrawCode || '---------'}*\n💰 Hadiah: ${money(state.lastPrize)}${state.claimed ? '\n✅ Hadiah sudah diklaim.' : `\nKetik *${usedPrefix}lottery claim* untuk klaim hadiah.`}`,
      m,
      { mentions: [state.lastWinner] }
    )
  }

  if (['stats', 'status'].includes(input)) {
    const ticketsSold = Object.values(state.pool).reduce((total, count) => total + Number(count || 0), 0)
    const prize = Number(state.jackpot || state.basePrize || LOTTERY_PRIZE)
    return m.reply(
      `📊 *LOTTERY STATS*\n> Hadiah: ${money(prize)}\n> Tiket terjual hari ini: ${ticketsSold.toLocaleString()} tiket\n> Total tiket terjual: ${state.totalTickets.toLocaleString()} tiket`
    )
  }

  if (['history', 'riwayat'].includes(input)) {
    if (!state.history.length) return m.reply('Belum ada riwayat pemenang lottery.')
    const mentions = [...new Set(state.history.map(item => item.jid))]
    const rows = state.history.map((item, index) =>
      `${index + 1}. @${item.jid.split('@')[0]} - ${item.date} (${money(item.prize)})\n   Nomor undian: *${item.drawCode || '---------'}*`
    )
    return conn.reply(m.chat, `🏆 *RIWAYAT PEMENANG LOTTERY*\n${rows.join('\n')}`, m, { mentions })
  }

  if (input === 'buy' || input === 'beli') {
    if (!user?.rpg) return m.reply(`Kamu belum memiliki data RPG. Mulai dulu dengan *${usedPrefix}adventure*.`)
    const confirmation = (args[1] || '').toLowerCase()
    const pendingPurchase = state.pendingPurchases[sender]

    if (['yes', 'ya', 'iya'].includes(confirmation)) {
      if (!pendingPurchase || pendingPurchase.expiresAt < Date.now()) {
        delete state.pendingPurchases[sender]
        await saveDB(wdb)
        return m.reply(`Tidak ada pembelian yang menunggu konfirmasi. Buat pembelian baru lewat *${usedPrefix}lottery buy <jumlah>*.`)
      }

      const saldoSaatIni = Number(wdb.money?.[sender] || 0)
      if (saldoSaatIni < pendingPurchase.totalHarga) {
        delete state.pendingPurchases[sender]
        await saveDB(wdb)
        return m.reply(`Saldo tidak cukup untuk konfirmasi. Pembelian dibatalkan.`)
      }

      wdb.money[sender] = saldoSaatIni - pendingPurchase.totalHarga
      state.pool[sender] = (Number(state.pool[sender]) || 0) + pendingPurchase.jumlah
      user.rpg.lottery.todayTickets = Number(user.rpg.lottery.todayTickets || 0) + pendingPurchase.jumlah
      user.rpg.lottery.totalAttempts = Number(user.rpg.lottery.totalAttempts || 0) + 1
      user.rpg.lottery.totalTickets = Number(user.rpg.lottery.totalTickets || 0) + pendingPurchase.jumlah
      user.rpg.lottery.lastDate = todayKey()
      state.totalTickets += pendingPurchase.jumlah
      delete state.pendingPurchases[sender]
      await saveDB(wdb)
      return m.reply(`✅ Pembelian dikonfirmasi: *${pendingPurchase.jumlah.toLocaleString()} tiket*.\n💸 -${money(pendingPurchase.totalHarga)}\n📦 Tiket hari ini: ${user.rpg.lottery.todayTickets.toLocaleString()}`)
    }

    if (['no', 'tidak', 'batal'].includes(confirmation)) {
      if (!pendingPurchase) return m.reply('Tidak ada pembelian lottery yang menunggu konfirmasi.')
      delete state.pendingPurchases[sender]
      await saveDB(wdb)
      return m.reply('Pembelian lottery dibatalkan, saldo tidak berubah.')
    }

    const jumlah = Number(args[1] || 0)

   if (!Number.isInteger(jumlah) || jumlah <= 0) {
  return m.reply(
    `╭─❏「 ❌ LOTTERY 」❏\n` +
    `│ ❌ *Format salah.*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *CONTOH*\n` +
    `> ↳ *${usedPrefix}lottery buy 10*\n\n` +
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

    state.pendingPurchases[sender] = {
      jumlah,
      totalHarga,
      expiresAt: Date.now() + PURCHASE_CONFIRMATION_TTL
    }
    await saveDB(wdb)
    return m.reply(
      `🎟️ Pembelian *${jumlah.toLocaleString()} tiket*\n` +
      `> Harga per tiket: ${money(LOTTERY_TICKET_PRICE)}\n` +
      `> Total: ${money(totalHarga)}\n> Saldo: ${money(saldo)}\n\n` +
      `Konfirmasi dengan *${usedPrefix}lottery buy yes* atau batalkan dengan *${usedPrefix}lottery buy no*. Konfirmasi berlaku 5 menit.`
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
    state.pendingPrize = 0
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

  if (input === 'giveaway') {
    const giveawayArgs = giveawayCommand ? args : args.slice(1)
    const action = (giveawayArgs[0] || '').toLowerCase()
    const giveawayState = getGiveawayState(m.chat)
    await settleExpiredGiveaways(conn, m.chat, giveawayState)

    if (!action || action === 'menu') {
      return m.reply(
        `🎁 *GIVEAWAY GRUP*\n` +
        `> ${usedPrefix}giveaway <money/limit> <jumlah> [syarat]\n` +
        `> ${usedPrefix}giveaway <hadiah> | <syarat>\n` +
        `> ${usedPrefix}giveaway konfirmasi <durasi> / batal\n` +
        `> ${usedPrefix}giveaway join <nomor/all>\n` +
        `> ${usedPrefix}giveaway list\n` +
        `> ${usedPrefix}giveaway end [nomor]\n` +
        `Durasi memakai menit atau jam, maksimal 24 jam. Contoh: *${usedPrefix}giveaway konfirmasi 2h*.`
      )
    }

    if (action === 'list') {
      const active = Object.values(giveawayState.active).sort((a, b) => a.id - b.id)
      if (!active.length) return m.reply('Belum ada giveaway aktif di grup ini.')
      const rows = active.map(item => {
        const reward = item.rewardType === 'money' ? money(item.amount) : item.rewardType === 'limit' ? `${item.amount.toLocaleString()} limit` : item.reward
        return `#${item.id} ${reward}\n> Syarat: ${item.requirement}\n> Peserta: ${item.participants.length}\n> Sisa: ${formatDuration(item.endsAt - Date.now())}`
      })
      return m.reply(`🎁 *GIVEAWAY AKTIF*\n\n${rows.join('\n\n')}`)
    }

    if (action === 'konfirmasi') {
      const duration = parseDuration(giveawayArgs[1])
      if (!giveawayState.draft) return m.reply('Tidak ada draft giveaway untuk dikonfirmasi.')
      if (giveawayState.draft.creator !== sender) return m.reply('Hanya pembuat giveaway yang bisa mengonfirmasi draft ini.')
      if (!duration) return m.reply(`Durasi tidak valid. Gunakan menit atau jam, maksimal 24 jam. Contoh: *${usedPrefix}giveaway konfirmasi 30m*.`)
      if (giveawayState.draft.rewardType === 'money') {
        const balance = Number(wdb.money[sender] || 0)
        if (balance < giveawayState.draft.amount) return m.reply(`Saldo tidak cukup. Hadiah membutuhkan ${money(giveawayState.draft.amount)}, saldomu ${money(balance)}.`)
        wdb.money[sender] = balance - giveawayState.draft.amount
      } else if (giveawayState.draft.rewardType === 'limit') {
        const creator = wdb.users[sender]
        const creatorRpg = creator?.rpg || creator
        const balance = Number(creatorRpg?.limit || 0)
        if (balance < giveawayState.draft.amount) return m.reply(`Limit tidak cukup. Hadiah membutuhkan ${giveawayState.draft.amount.toLocaleString()}, limitmu ${balance.toLocaleString()}.`)
        creatorRpg.limit = balance - giveawayState.draft.amount
      }
      const giveaway = {
        ...giveawayState.draft,
        id: giveawayState.nextId++,
        participants: [],
        createdAt: Date.now(),
        endsAt: Date.now() + duration
      }
      giveawayState.draft = null
      giveawayState.active[giveaway.id] = giveaway
      await saveDB(wdb)
      scheduleGiveawayEnd(conn, m.chat, giveaway)
      return m.reply(`✅ Giveaway #${giveaway.id} dimulai selama ${formatDuration(duration)}. Peserta bisa ikut lewat *${usedPrefix}giveaway join ${giveaway.id}*.`)
    }

    if (action === 'batal') {
      if (!giveawayState.draft) return m.reply('Tidak ada draft giveaway yang bisa dibatalkan.')
      if (giveawayState.draft.creator !== sender) return m.reply('Hanya pembuat giveaway yang bisa membatalkan draft ini.')
      giveawayState.draft = null
      await saveDB(wdb)
      return m.reply('Draft giveaway dibatalkan.')
    }

    if (action === 'join') {
      const selector = (giveawayArgs[1] || '').toLowerCase()
      const active = Object.values(giveawayState.active)
      const selected = selector === 'all'
        ? active
        : active.filter(item => String(item.id) === selector)
      if (!selected.length) return m.reply('Giveaway tidak ditemukan atau sudah berakhir. Cek *list* untuk melihat giveaway aktif.')
      const joined = []
      for (const giveaway of selected) {
        if (giveaway.participants.includes(sender)) continue
        giveaway.participants.push(sender)
        joined.push(giveaway.id)
      }
      await saveDB(wdb)
      return m.reply(joined.length
        ? `✅ Kamu ikut giveaway ${joined.map(id => `#${id}`).join(', ')}. Peserta tidak bisa keluar setelah bergabung.`
        : 'Kamu sudah terdaftar di giveaway tersebut.')
    }

    if (action === 'end') {
      const selector = giveawayArgs[1]
      const owned = Object.values(giveawayState.active)
        .filter(item => item.creator === sender)
        .sort((a, b) => a.id - b.id)
      const giveaway = selector
        ? owned.find(item => String(item.id) === selector)
        : owned[owned.length - 1]
      if (!giveaway) return m.reply('Tidak ada giveaway aktif milikmu dengan nomor itu.')
      await finishGiveaway(conn, m.chat, giveawayState, giveaway)
      return
    }

    const draft = giveawayReward(giveawayArgs)
    if (!draft) return m.reply(`Format hadiah salah. Contoh: *${usedPrefix}giveaway money 100000 Syarat: follow akun* atau *${usedPrefix}giveaway Voucher | follow akun*.`)
    giveawayState.draft = { ...draft, creator: sender }
    await saveDB(wdb)
    const reward = draft.rewardType === 'money' ? money(draft.amount) : draft.rewardType === 'limit' ? `${draft.amount.toLocaleString()} limit` : draft.reward
    return m.reply(
      `📝 *KONFIRMASI GIVEAWAY*\n> Hadiah: ${reward}\n> Syarat: ${draft.requirement}\n\n` +
      `Ketik *${usedPrefix}giveaway konfirmasi <durasi>* (maksimal 24 jam) untuk mulai, atau *${usedPrefix}giveaway batal*.`
    )
  }

  const menu = buildMenu(wdb, sender, usedPrefix)
  return sendRpgMsg(conn, m, menu.text, LOTTERY_IMAGE, { mentions: menu.mentions })
}

handler.help = ['lottery', 'lottery guide', 'lottery info', 'lottery stats', 'lottery history', 'lottery buy <jumlah>', 'lottery buy yes/no', 'lottery claim', 'lottery giveaway']
handler.tags = ['rpg']
handler.command = ['lottery', 'giveaway']
handler.group = true

export default handler
