import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let args = text.split(' ')
  let who, type, count

  const items = ['money', 'diamond', 'gold', 'iron', 'stone', 'wood']

  // CEK DATA
  if (!wdb.users[m.sender]?.rpg) return m.reply('Kamu belum punya data RPG.')

  // DAPATKAN TARGET
  if (m.mentionedJid[0]) {
    who = m.mentionedJid[0]
    type = (args[1] || '').toLowerCase()
    count = parseInt(args[2])
  } else if (m.quoted) {
    who = m.quoted.sender
    type = (args[0] || '').toLowerCase()
    count = parseInt(args[1])
  } else if (args.length >= 3) {
    who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    type = (args[1] || '').toLowerCase()
    count = parseInt(args[2])
  }

  if (!who || !type || isNaN(count) || count <= 0) {
  return m.reply(
    `╭─❏「 🎁 GIFT SYSTEM 」❏\n` +
    `│ Kirim item langsung tanpa persetujuan.\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *CARA GIFT*\n` +
    `> 🏷️ Tag: *.${command} @tag diamond 5*\n` +
    `> 💬 Reply: *.${command} diamond 5*\n` +
    `> 📱 Nomor: *.${command} 628xxx gold 10*\n` +
    `> 📦 Item: ${items.join(', ')}` 
  )
}

if (!items.includes(type)) {
  return m.reply(
    `╭─❏「 ❌ GIFT SYSTEM 」❏\n` +
    `│ Item tidak valid!\n` +
    `│ ↳ Pilih: ${items.join(', ')}\n` +
    `╰─━━━━━━━━━━━━━━─`
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
  wdb.users[who] = { rpg: {} }
}

wdb.users[who].rpg = wdb.users[who].rpg || {}

// CEK STOK & KIRIM
if (type === 'money') {
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
  if ((wdb.users[m.sender].rpg[type] || 0) < count) {
    return m.reply(
      `╭─❏「 ❌ GIFT SYSTEM 」❏\n` +
      `│ 📦 ${type.toUpperCase()} tidak cukup!\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  wdb.users[m.sender].rpg[type] -= count
  wdb.users[who].rpg[type] =
    (wdb.users[who].rpg[type] || 0) + count
}

saveDB(wdb)

return sendRpgMsg(
  conn,
  m,
  `╭─❏「 🎁 GIFT SENT 」❏\n` +
  `│ 📤 Dari: @${m.sender.split('@')[0]}\n` +
  `│ 📥 Ke: @${who.split('@')[0]}\n` +
  `│ 📦 Item: ${type.toUpperCase()}\n` +
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
