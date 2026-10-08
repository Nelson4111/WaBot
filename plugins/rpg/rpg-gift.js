import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { isValidRpgUserId } from '../../lib/rpgLeaderboard.js'
import { changeTransferBalance, findTransferItems, getTransferBalance } from '../../lib/rpgTransfer.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.money) wdb.money = {}
  let args = (text || '').trim().split(/\s+/).filter(Boolean)
  let who, itemInput, count

  // CEK DATA
  if (!wdb.users[m.sender]?.rpg) return m.reply('Kamu belum punya data RPG.')

  // DAPATKAN TARGET
  const mentionedJid = m.mentionedJid || []
  if (mentionedJid[0]) {
    who = mentionedJid[0]
    itemInput = args[1]
    count = parseInt(args[2])
  } else if (m.quoted) {
    who = m.quoted.sender
    itemInput = args[0]
    count = parseInt(args[1])
  }

  if (!who || !isValidRpgUserId(who) || !itemInput || isNaN(count) || count <= 0) {
    return m.reply(
      `╭─❏「 🎁 GIFT SYSTEM 」❏\n` +
      `│ Kirim item langsung tanpa persetujuan.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *CARA GIFT*\n` +
      `> 🏷️ Tag: *${usedPrefix}${command} @tag <item> <jumlah>*\n` +
      `> 💬 Reply: *${usedPrefix}${command} <item> <jumlah>*\n` +
      `> 📦 Item bisa dari gudang, tas, aquarium, kulkas, atau saldo RPG.\n` +
      `> ↳ Sumber khusus: *inventory:item*, *ikan:item*, *ores:item*, *items:item*, *masakan:item*, atau *balance:diamond*`
    )
  }

if (who === m.sender) {
  return m.reply(
    `╭─❏「 ❌ GIFT SYSTEM 」❏\n` +
    `│ Tidak bisa gift ke diri sendiri!\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

if (!wdb.users[who]?.rpg) {
  return m.reply('❌ Target belum memiliki data RPG. Gift hanya bisa dikirim ke pengguna RPG yang valid.')
}

const matches = findTransferItems(wdb.users[m.sender].rpg, itemInput)
if (matches.length > 1) {
  const locations = matches.map(match => match.field === 'balance'
    ? `balance:${match.item}`
    : `${match.field === 'bank' ? 'bank' : match.field}:${match.item}`)
  return m.reply(`❌ Item *${itemInput}* ada di beberapa penyimpanan. Tentukan sumbernya: ${locations.map(location => `*${location}*`).join(', ')}.`)
}
const item = matches[0]
if (!item) return m.reply(`❌ Item *${itemInput}* tidak ditemukan di stok yang bisa dikirim.`)

// CEK STOK & KIRIM
if (item.money) {
  if ((wdb.money[m.sender] || 0) < count) {
    return m.reply(
      `╭─❏「 ❌ GIFT SYSTEM 」❏\n` +
      `│ 💰 Uangmu tidak cukup!\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  wdb.money[m.sender] -= count
  wdb.money[who] = (wdb.money[who] || 0) + count
} else {
  if (getTransferBalance(wdb.users[m.sender].rpg, item, wdb.users[m.sender]) < count) {
    return m.reply(
      `╭─❏「 ❌ GIFT SYSTEM 」❏\n` +
      `│ 📦 ${item.label} tidak cukup!\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  changeTransferBalance(wdb.users[m.sender].rpg, item, -count, wdb.users[m.sender])
  changeTransferBalance(wdb.users[who].rpg, item, count, wdb.users[who])
}

saveDB(wdb)

return sendRpgMsg(
  conn,
  m,
  `╭─❏「 🎁 GIFT SENT 」❏\n` +
  `│ 📤 Dari: @${m.sender.split('@')[0]}\n` +
  `│ 📥 Ke: @${who.split('@')[0]}\n` +
  `│ 📦 Item: ${item.item.toUpperCase()}${item.field && item.field !== 'balance' && item.field !== 'bank' ? ` (${item.field})` : ''}\n` +
  `│ 🔢 Jumlah: ${count.toLocaleString()}\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `🔄 *TRADE*\n` +
  `> ↳ Tukar barang: *.trade @tag*`,
  'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg',
  { mentions: [m.sender, who] }
)
}

handler.help = ['gift']
handler.tags = ['rpg']
handler.command = ['gift']
export default handler
