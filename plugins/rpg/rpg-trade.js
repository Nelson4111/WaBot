import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

let tradeDB = global.tradeDB || (global.tradeDB = {})

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let args = text.trim().split(' ')
  let action = args[0]?.toLowerCase()
  let sender = m.sender
  const items = ['money', 'diamond', 'gold', 'iron', 'stone', 'wood', 'koin_tembaga', 'koin_perak', 'koin_emas', 'ramuan_kecil', 'ramuan_sedang', 'ramuan_besar']
  const getTradeId = (a, b) => [a,b].sort().join('_')

  // AUTO INIT PAKE GETUSERRPG
  let sData = getUserRPG(wdb, sender)
  let sUser = sData.rpg
  initLadang(sUser)
  if(!sUser.inventory) sUser.inventory = {}

  let tradeId = Object.keys(tradeDB).find(id => id.includes(sender))
  let trade = tradeId? tradeDB[tradeId] : null

  // 1. MULAI VIA REPLY
  if (m.quoted &&!trade) {
    let partner = m.quoted.sender
    if (partner === sender) return m.reply('❌ Tidak bisa trade dengan diri sendiri!')
    let pData = getUserRPG(wdb, partner)
    let pUser = pData.rpg
    initLadang(pUser)
    if(!pUser.inventory) pUser.inventory = {}
    let tid = getTradeId(sender, partner)
    if (tradeDB[tid]) return m.reply('❌ Sudah ada trade aktif.')
    tradeDB[tid] = { p1: sender, p2: partner, p1Offer: {}, p2Offer: {}, p1Accept: false, p2Accept: false }
    return m.reply(`*───「 TRADE REQUEST 」───*\n\n@${sender.split('@')[0]} mengajak @${partner.split('@')[0]} trade!\n\n*.trade add [item] [jml]*\n*.trade panel*\n*.trade accept* jika siap\n*.trade deal* untuk selesai`, null, { mentions: [sender, partner] })
  }

  // 2. MULAI VIA TAG
  if (m.mentionedJid[0] &&!trade) {
    let partner = m.mentionedJid[0]
    if (partner === sender) return m.reply('❌ Tidak bisa trade dengan diri sendiri!')
    let pData = getUserRPG(wdb, partner)
    let pUser = pData.rpg
    initLadang(pUser)
    if(!pUser.inventory) pUser.inventory = {}
    let tid = getTradeId(sender, partner)
    if (tradeDB[tid]) return m.reply('❌ Sudah ada trade aktif.')
    tradeDB[tid] = { p1: sender, p2: partner, p1Offer: {}, p2Offer: {}, p1Accept: false, p2Accept: false }
    return m.reply(`*───「 TRADE REQUEST 」───*\n\n@${sender.split('@')[0]} mengajak @${partner.split('@')[0]} trade!\n\n*.trade add [item] [jml]*\n*.trade panel*\n*.trade accept* jika siap\n*.trade deal* untuk selesai`, null, { mentions: [sender, partner] })
  }

  // MENU
  if (!action) {
    return m.reply(`*───「 TRADE SYSTEM 」───*\n\nTukar barang dengan persetujuan 2 pihak.\n\n*Cara:*\n*.trade @tag* / reply → Mulai\n*.trade add [item] [jml]* → Masukkan\n*.trade panel* → Lihat isi\n*.trade accept* → Setuju\n*.trade deal* → Selesaikan\n*.trade cancel* → Batal\n\n*Item:* ${items.join(', ')}\n\n💡 *Mau langsung kirim? Pakai:* *.gift @tag [item] [jml]*`)
  }

  if (!trade) return m.reply(`❌ Belum ada trade aktif. *.trade @tag* atau reply chat`)

  let isP1 = trade.p1 === sender
  let myOffer = isP1? trade.p1Offer : trade.p2Offer
  let partner = isP1? trade.p2 : trade.p1
  let pData = getUserRPG(wdb, partner)

  // FUNGSI AMBIL STOK
  const getStok = (user, item) => {
    if(item === 'money') return wdb.money[user] || 0
    if(user.inventory && user.inventory[item]!== undefined) return user.inventory[item] || 0
    return user[item] || 0
  }
  const kurangStok = (user, item, qty) => {
    if(item === 'money') wdb.money[user] -= qty
    else if(user.inventory && user.inventory[item]!== undefined) user.inventory[item] -= qty
    else user[item] -= qty
  }
  const tambahStok = (user, item, qty) => {
    if(item === 'money') wdb.money[user] = (wdb.money[user] || 0) + qty
    else if(user.inventory) user.inventory[item] = (user.inventory[item] || 0) + qty
    else user[item] = (user[item] || 0) + qty
  }

  if (action === 'add') {
    let type = (args[1] || '').toLowerCase()
    let count = parseInt(args[2])
    if (!items.includes(type) || isNaN(count) || count <= 0) return m.reply(`❌ Format: *.trade add [item] [jumlah]*\nItem: ${items.join(', ')}`)
    let stok = getStok(sUser, type)
    if (stok < count) return m.reply(`❌ ${type.toUpperCase()} tidak cukup! Punya: ${stok}`)
    myOffer[type] = (myOffer[type] || 0) + count
    trade.p1Accept = trade.p2Accept = false
    return m.reply(`✅ Ditambahkan: ${type} x${count}\n*.trade panel* untuk lihat`)
  }

  if (action === 'panel') {
    let p1List = Object.entries(trade.p1Offer).map(([k,v]) => `│ ${k}: ${v}`).join('\n') || '│ Kosong'
    let p2List = Object.entries(trade.p2Offer).map(([k,v]) => `│ ${k}: ${v}`).join('\n') || '│ Kosong'
    return m.reply(`*───「 TRADE PANEL 」───*\n\n@${trade.p1.split('@')[0]} ${trade.p1Accept? '✅' : '❌'}\n${p1List}\n\n@${trade.p2.split('@')[0]} ${trade.p2Accept? '✅' : '❌'}\n${p2List}`, null, { mentions: [trade.p1, trade.p2] })
  }

  if (action === 'accept') {
    if (isP1) trade.p1Accept = true; else trade.p2Accept = true
    if (trade.p1Accept && trade.p2Accept) return m.reply(`✅ Kedua setuju. Ketik *.trade deal* untuk menyelesaikan`)
    return m.reply(`✅ Kamu setuju. Menunggu @${partner.split('@')[0]}...`, null, { mentions: [partner] })
  }

  if (action === 'deal') {
    if (!trade.p1Accept ||!trade.p2Accept) return m.reply('❌ Harus accept dulu!')
    let p1Data = getUserRPG(wdb, trade.p1)
    let p2Data = getUserRPG(wdb, trade.p2)

    // cek stok lagi
    for (let [item, qty] of Object.entries(trade.p1Offer)) {
      let stok = getStok(p1Data.rpg, item)
      if(stok < qty) return m.reply(`❌ @${trade.p1.split('@')[0]} stok ${item} tidak cukup!`, null, {mentions:[trade.p1]})
    }
    for (let [item, qty] of Object.entries(trade.p2Offer)) {
      let stok = getStok(p2Data.rpg, item)
      if(stok < qty) return m.reply(`❌ @${trade.p2.split('@')[0]} stok ${item} tidak cukup!`, null, {mentions:[trade.p2]})
    }

    // eksekusi
    for (let [item, qty] of Object.entries(trade.p1Offer)) {
      kurangStok(p1Data.rpg, item, qty)
      tambahStok(p2Data.rpg, item, qty)
    }
    for (let [item, qty] of Object.entries(trade.p2Offer)) {
      kurangStok(p2Data.rpg, item, qty)
      tambahStok(p1Data.rpg, item, qty)
    }
    saveDB(wdb)
    delete tradeDB[getTradeId(trade.p1, trade.p2)]
    return m.reply(`*───「 TRADE BERHASIL 」───*\n\n✅ Item sudah ditukar!`)
  }

  if (action === 'cancel') {
    delete tradeDB[getTradeId(trade.p1, trade.p2)]
    return m.reply(`❌ Trade dibatalkan`)
  }

  return m.reply(`❌ Command tidak dikenal. *.trade* buat lihat bantuan`)
}

handler.help = ['trade']
handler.tags = ['rpg']
handler.command = ['trade']
handler.group = true
export default handler