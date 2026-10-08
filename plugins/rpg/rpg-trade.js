import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'
import { isValidRpgUserId } from '../../lib/rpgLeaderboard.js'
import {
  changeTransferBalance,
  findTransferItems,
  getTransferBalance,
  makeTransferKey,
  parseTransferReference
} from '../../lib/rpgTransfer.js'

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
  if (!isValidRpgUserId(partner)) return m.reply('❌ Target reply tidak valid. Tag atau reply pengguna WhatsApp yang terdaftar.')
  if (partner === sender) return m.reply('❌ Tidak bisa trade dengan diri sendiri!')
  let pData = getUserRPG(wdb, partner)
  let pUser = pData?.rpg
  if (!pUser || pData?.isDummy) return m.reply('❌ Partner belum memiliki data RPG.')
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
if (m.mentionedJid?.[0] && !trade) {
  let partner = m.mentionedJid[0]
  if (!isValidRpgUserId(partner)) return m.reply('❌ Target tag tidak valid. Tag pengguna WhatsApp yang terdaftar.')
  if (partner === sender) return m.reply('❌ Tidak bisa trade dengan diri sendiri!')
  let pData = getUserRPG(wdb, partner)
  let pUser = pData?.rpg
  if (!pUser || pData?.isDummy) return m.reply('❌ Partner belum memiliki data RPG.')
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
    `> ↳ Item dapat berasal dari gudang, tas, aquarium, kulkas, dan saldo RPG. Gunakan format *penyimpanan:item* jika item ganda.\n` +
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

if (action === 'add') {
  const type = (args[1] || '').toLowerCase()
  const count = Number(args[2])
  if (!type || !Number.isSafeInteger(count) || count <= 0) {
    return m.reply(
      `╭─❏「 🔄 TRADE 」❏\n` +
      `│ ❌ *FORMAT SALAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *.trade add [item] [jumlah]*\n` +
      `> ↳ Item dari gudang, tas, aquarium, kulkas, saldo RPG, atau bank.\n` +
      `> ↳ Contoh sumber: *inventory:diamond*, *ikan:ikan_teri*, *masakan:sushi*, *balance:diamond*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const matches = findTransferItems(sUser, type)
  if (matches.length > 1) {
    const locations = matches.map(match => match.field === 'balance'
      ? `balance:${match.item}`
      : `${match.field === 'bank' ? 'bank' : match.field}:${match.item}`)
    return m.reply(`❌ Item *${type}* ada di beberapa penyimpanan. Tentukan sumbernya: ${locations.map(location => `*${location}*`).join(', ')}.`)
  }
  const reference = matches[0]
  if (!reference) return m.reply(`❌ Item *${type}* tidak ditemukan di stok yang bisa ditrade.`)

  const stok = reference.money ? Number(wdb.money[sender]) || 0 : getTransferBalance(sUser, reference, wdb.users[sender])
  if (stok < count) {
    return m.reply(
      `╭─❏「 🔄 TRADE 」❏\n` +
      `│ ❌ *STOK TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${reference.label.toUpperCase()} tidak cukup!\n` +
      `> ↳ Punya : ${stok}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const transferKey = makeTransferKey(reference)
  myOffer[transferKey] = (myOffer[transferKey] || 0) + count
  trade.p1Accept = trade.p2Accept = false

  return m.reply(
    `╭─❏「 🔄 TRADE 」❏\n` +
    `│ ✅ *ITEM DITAMBAHKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${reference.label} x${count}\n\n` +
    `📌 *.trade panel* untuk lihat\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'panel') {
  let p1List = Object.entries(trade.p1Offer)
    .map(([k, v]) => `> ↳ ${parseTransferReference(k)?.label || k}: ${v.toLocaleString()}`)
    .join('\n') || '> ↳ Kosong'

  let p2List = Object.entries(trade.p2Offer)
    .map(([k, v]) => `> ↳ ${parseTransferReference(k)?.label || k}: ${v.toLocaleString()}`)
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
  let p1User = p1Data?.rpg
  let p2User = p2Data?.rpg
  if (!p1User || !p2User || p1Data?.isDummy || p2Data?.isDummy) {
    return m.reply('❌ Salah satu peserta trade belum memiliki data RPG.')
  }

  // cek stok lagi
  for (let [key, qty] of Object.entries(trade.p1Offer)) {
    const item = parseTransferReference(key)
    const stok = item?.money ? Number(wdb.money[trade.p1]) || 0 : getTransferBalance(p1User, item, wdb.users[trade.p1])
    if (stok < qty) {
      return m.reply(
        `╭─❏「 🔄 TRADE 」❏\n` +
        `│ ❌ *STOK TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ @${trade.p1.split('@')[0]} stok ${item?.label || key} tidak cukup!\n\n` +
        `─━━━━━━━━━━━━━━─`,
        null,
        { mentions: [trade.p1] }
      )
    }
  }

  for (let [key, qty] of Object.entries(trade.p2Offer)) {
    const item = parseTransferReference(key)
    const stok = item?.money ? Number(wdb.money[trade.p2]) || 0 : getTransferBalance(p2User, item, wdb.users[trade.p2])
    if (stok < qty) {
      return m.reply(
        `╭─❏「 🔄 TRADE 」❏\n` +
        `│ ❌ *STOK TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ @${trade.p2.split('@')[0]} stok ${item?.label || key} tidak cukup!\n\n` +
        `─━━━━━━━━━━━━━━─`,
        null,
        { mentions: [trade.p2] }
      )
    }
  }

  // eksekusi
  for (let [key, qty] of Object.entries(trade.p1Offer)) {
    const item = parseTransferReference(key)
    if (item.money) {
      wdb.money[trade.p1] -= qty
      wdb.money[trade.p2] = (Number(wdb.money[trade.p2]) || 0) + qty
    } else {
      changeTransferBalance(p1User, item, -qty, wdb.users[trade.p1])
      changeTransferBalance(p2User, item, qty, wdb.users[trade.p2])
      if (item.field === 'bank' && wdb.users[trade.p1]) wdb.users[trade.p1].bank = p1User.bank
      if (item.field === 'bank' && wdb.users[trade.p2]) wdb.users[trade.p2].bank = p2User.bank
    }
  }

  for (let [key, qty] of Object.entries(trade.p2Offer)) {
    const item = parseTransferReference(key)
    if (item.money) {
      wdb.money[trade.p2] -= qty
      wdb.money[trade.p1] = (Number(wdb.money[trade.p1]) || 0) + qty
    } else {
      changeTransferBalance(p2User, item, -qty, wdb.users[trade.p2])
      changeTransferBalance(p1User, item, qty, wdb.users[trade.p1])
      if (item.field === 'bank' && wdb.users[trade.p2]) wdb.users[trade.p2].bank = p2User.bank
      if (item.field === 'bank' && wdb.users[trade.p1]) wdb.users[trade.p1].bank = p1User.bank
    }
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