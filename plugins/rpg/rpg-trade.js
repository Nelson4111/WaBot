import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

let tradeDB = global.tradeDB || (global.tradeDB = {})

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let args = text.trim().split(' ')
  let action = args[0]?.toLowerCase()
  let sender = m.sender
  const getTradeId = (a, b) => [a,b].sort().join('_')

  // AUTO INIT PAKE GETUSERRPG
  let sData = getUserRPG(wdb, sender)
  let sUser = sData.rpg
  initLadang(sUser)
  if(!sUser.inventory) sUser.inventory = {}
  if(!sUser.ikan) sUser.ikan = {}
  if(!sUser.ores) sUser.ores = {}
  if(!sUser.items) sUser.items = {}
  if(!sUser.masakan) sUser.masakan = {}

  let tradeId = Object.keys(tradeDB).find(id => id.includes(sender))
  let trade = tradeId? tradeDB[tradeId] : null

  // 1. MULAI VIA REPLY
if (m.quoted && !trade) {
  let partner = m.quoted.sender
  if (partner === sender) return m.reply('❌ Tidak bisa trade dengan diri sendiri!')
  let pData = getUserRPG(wdb, partner)
  let pUser = pData.rpg
  initLadang(pUser)
  if (!pUser.inventory) pUser.inventory = {}
  if (!pUser.ikan) pUser.ikan = {}
  if (!pUser.ores) pUser.ores = {}
  if (!pUser.items) pUser.items = {}
  if (!pUser.masakan) pUser.masakan = {}
  let tid = getTradeId(sender, partner)
  if (tradeDB[tid]) return m.reply('❌ Sudah ada trade aktif.')
  tradeDB[tid] = { p1: sender, p2: partner, p1Offer: {}, p2Offer: {}, p1Accept: false, p2Accept: false }

  return m.reply(
    `╭─❏「 🔄 TRADE REQUEST 」❏\n` +
    `│ 👤 *Dari* : @${sender.split('@')[0]}\n` +
    `│ 👤 *Ke* : @${partner.split('@')[0]}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *MENU TRADE*\n` +
    `> ↳ Add : *.trade add [item] [jml]*\n` +
    `> ↳ Bank : *.trade add bank [jml]*\n` +
    `> ↳ Panel : *.trade panel*\n` +
    `> ↳ Setuju : *.trade accept*\n` +
    `> ↳ Selesai : *.trade deal*\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [sender, partner] }
  )
}

// 2. MULAI VIA TAG
if (m.mentionedJid[0] && !trade) {
  let partner = m.mentionedJid[0]
  if (partner === sender) return m.reply('❌ Tidak bisa trade dengan diri sendiri!')
  let pData = getUserRPG(wdb, partner)
  let pUser = pData.rpg
  initLadang(pUser)
  if (!pUser.inventory) pUser.inventory = {}
  if (!pUser.ikan) pUser.ikan = {}
  if (!pUser.ores) pUser.ores = {}
  if (!pUser.items) pUser.items = {}
  if (!pUser.masakan) pUser.masakan = {}
  let tid = getTradeId(sender, partner)
  if (tradeDB[tid]) return m.reply('❌ Sudah ada trade aktif.')
  tradeDB[tid] = { p1: sender, p2: partner, p1Offer: {}, p2Offer: {}, p1Accept: false, p2Accept: false }

  return m.reply(
    `╭─❏「 🔄 TRADE REQUEST 」❏\n` +
    `│ 👤 *Dari* : @${sender.split('@')[0]}\n` +
    `│ 👤 *Ke* : @${partner.split('@')[0]}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *MENU TRADE*\n` +
    `> ↳ Add : *.trade add [item] [jml]*\n` +
    `> ↳ Bank : *.trade add bank [jml]*\n` +
    `> ↳ Panel : *.trade panel*\n` +
    `> ↳ Setuju : *.trade accept*\n` +
    `> ↳ Selesai : *.trade deal*\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [sender, partner] }
  )
}

// MENU
if (!action) {
  return m.reply(
    `╭─❏「 🔄 TRADE SYSTEM 」❏\n` +
    `│ 🔄 *TRADE SYSTEM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 Tukar barang dengan persetujuan dua pihak.\n\n` +
    `🎮 *MENU*\n` +
    `> ↳ Mulai : *.trade @tag* atau reply\n` +
    `> ↳ Add : Masukkan item dan jumlah\n` +
    `> ↳ Bank : Masukkan uang bank\n` +
    `> ↳ Panel : Lihat isi trade\n` +
    `> ↳ Accept : Setujui penawaran\n` +
    `> ↳ Deal : Selesaikan trade\n` +
    `> ↳ Cancel : Batalkan trade\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (!trade) {
  return m.reply(
    `╭─❏「 🔄 TRADE SYSTEM 」❏\n` +
    `│ ❌ *BELUM ADA TRADE AKTIF*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ *.trade @tag* atau reply chat\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

let isP1 = trade.p1 === sender
let myOffer = isP1 ? trade.p1Offer : trade.p2Offer
let partner = isP1 ? trade.p2 : trade.p1
let pData = getUserRPG(wdb, partner)
let pUser = pData.rpg

// FUNGSI AMBIL STOK DARI SEMUA KATEGORI
const getStok = (user, item) => {
  if (item === 'money') return wdb.money[m.sender] || 0
  if (item === 'bank') return user.bank || 0
  if (user.inventory && user.inventory[item]) return user.inventory[item]
  if (user.ikan && user.ikan[item]) return user.ikan[item]
  if (user.ores && user.ores[item]) return user.ores[item]
  if (user.items && user.items[item]) return user.items[item]
  if (user.masakan && user.masakan[item]) return user.masakan[item]
  return 0
}

const kurangStok = (user, item, qty) => {
  if (item === 'money') wdb.money[m.sender] -= qty
  else if (item === 'bank') user.bank -= qty
  else if (user.inventory && user.inventory[item] !== undefined) user.inventory[item] -= qty
  else if (user.ikan && user.ikan[item] !== undefined) user.ikan[item] -= qty
  else if (user.ores && user.ores[item] !== undefined) user.ores[item] -= qty
  else if (user.items && user.items[item] !== undefined) user.items[item] -= qty
  else if (user.masakan && user.masakan[item] !== undefined) user.masakan[item] -= qty
}

const tambahStok = (user, item, qty) => {
  if (item === 'money') wdb.money[m.sender] = (wdb.money[m.sender] || 0) + qty
  else if (item === 'bank') user.bank = (user.bank || 0) + qty
  else if (user.inventory) user.inventory[item] = (user.inventory[item] || 0) + qty
  else if (user.ikan) user.ikan[item] = (user.ikan[item] || 0) + qty
  else if (user.ores) user.ores[item] = (user.ores[item] || 0) + qty
  else if (user.items) user.items[item] = (user.items[item] || 0) + qty
  else if (user.masakan) user.masakan[item] = (user.masakan[item] || 0) + qty
}

if (action === 'add') {
  let type = (args[1] || '').toLowerCase()
  let count = parseInt(args[2])
  if (!type || isNaN(count) || count <= 0) {
    return m.reply(
      `╭─❏「 🔄 TRADE 」❏\n` +
      `│ ❌ *FORMAT SALAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *.trade add [item/bank] [jumlah]*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let stok = getStok(sUser, type)
  if (stok < count) {
    return m.reply(
      `╭─❏「 🔄 TRADE 」❏\n` +
      `│ ❌ *STOK TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${type.toUpperCase()} tidak cukup!\n` +
      `> ↳ Punya : ${stok}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  myOffer[type] = (myOffer[type] || 0) + count
  trade.p1Accept = trade.p2Accept = false

  return m.reply(
    `╭─❏「 🔄 TRADE 」❏\n` +
    `│ ✅ *ITEM DITAMBAHKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${type} x${count}\n\n` +
    `📌 *.trade panel* untuk lihat\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'panel') {
  let p1List = Object.entries(trade.p1Offer)
    .map(([k, v]) => `> ↳ ${k}: ${v.toLocaleString()}`)
    .join('\n') || '> ↳ Kosong'

  let p2List = Object.entries(trade.p2Offer)
    .map(([k, v]) => `> ↳ ${k}: ${v.toLocaleString()}`)
    .join('\n') || '> ↳ Kosong'

  return m.reply(
    `╭─❏「 🔄 TRADE PANEL 」❏\n` +
    `│ 👤 *@${trade.p1.split('@')[0]}* ${trade.p1Accept ? '✅' : '❌'}\n` +
    `${p1List}\n` +
    `\n─━━━━━━━━━━━━━━─\n\n` +
    `│ 👤 *@${trade.p2.split('@')[0]}* ${trade.p2Accept ? '✅' : '❌'}\n` +
    `${p2List}\n` +
    `\n─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [trade.p1, trade.p2] }
  )
}

if (action === 'accept') {
  if (isP1) trade.p1Accept = true
  else trade.p2Accept = true

  if (trade.p1Accept && trade.p2Accept) {
    return m.reply(
      `╭─❏「 🔄 TRADE 」❏\n` +
      `│ ✅ *KEDUA SETUJU*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Ketik *.trade deal* untuk menyelesaikan\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(
    `╭─❏「 🔄 TRADE 」❏\n` +
    `│ ✅ *KAMU SETUJU*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Menunggu @${partner.split('@')[0]}...\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [partner] }
  )
}

if (action === 'deal') {
  if (!trade.p1Accept || !trade.p2Accept) {
    return m.reply(
      `╭─❏「 🔄 TRADE 」❏\n` +
      `│ ❌ *BELUM BISA DISELESAIKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Harus accept dulu!\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let p1Data = getUserRPG(wdb, trade.p1)
  let p2Data = getUserRPG(wdb, trade.p2)
  let p1User = p1Data.rpg
  let p2User = p2Data.rpg

  // cek stok lagi
  for (let [item, qty] of Object.entries(trade.p1Offer)) {
    let stok = getStok(p1User, item)
    if (stok < qty) {
      return m.reply(
        `╭─❏「 🔄 TRADE 」❏\n` +
        `│ ❌ *STOK TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ @${trade.p1.split('@')[0]} stok ${item} tidak cukup!\n\n` +
        `─━━━━━━━━━━━━━━─`,
        null,
        { mentions: [trade.p1] }
      )
    }
  }

  for (let [item, qty] of Object.entries(trade.p2Offer)) {
    let stok = getStok(p2User, item)
    if (stok < qty) {
      return m.reply(
        `╭─❏「 🔄 TRADE 」❏\n` +
        `│ ❌ *STOK TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ @${trade.p2.split('@')[0]} stok ${item} tidak cukup!\n\n` +
        `─━━━━━━━━━━━━━━─`,
        null,
        { mentions: [trade.p2] }
      )
    }
  }

  // eksekusi
  for (let [item, qty] of Object.entries(trade.p1Offer)) {
    kurangStok(p1User, item, qty)
    tambahStok(p2User, item, qty)
  }

  for (let [item, qty] of Object.entries(trade.p2Offer)) {
    kurangStok(p2User, item, qty)
    tambahStok(p1User, item, qty)
  }

  saveDB(wdb)
  delete tradeDB[getTradeId(trade.p1, trade.p2)]

  return m.reply(
    `╭─❏「 🔄 TRADE BERHASIL 」❏\n` +
    `│ ✅ *ITEM SUDAH DITUKAR!*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'cancel') {
  delete tradeDB[getTradeId(trade.p1, trade.p2)]

  return m.reply(
    `╭─❏「 🔄 TRADE 」❏\n` +
    `│ ❌ *TRADE DIBATALKAN*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

return m.reply(
  `╭─❏「 🔄 TRADE SYSTEM 」❏\n` +
  `│ ❌ *COMMAND TIDAK DIKENAL*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ *.trade* buat lihat bantuan\n\n` +
  `─━━━━━━━━━━━━━━─`
)
}

handler.help = ['trade']
handler.tags = ['rpg']
handler.command = ['trade']
handler.group = true
export default handler