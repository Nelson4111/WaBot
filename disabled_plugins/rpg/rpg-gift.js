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

  if (!who ||!type || isNaN(count) || count <= 0) {
    return m.reply(`*───「 GIFT SYSTEM 」───*\n\nKirim item langsung tanpa persetujuan.\n\n*Cara:*\n*Tag:* ${usedPrefix}${command} @tag diamond 5\n*Reply:* ${usedPrefix}${command} diamond 5\n*Nomor:* ${usedPrefix}${command} 628xxx gold 10\n\n*Item:* ${items.join(', ')}`)
  }

  if (!items.includes(type)) return m.reply(`*Item tidak valid!* Pilih: ${items.join(', ')}`)
  if (who === m.sender) return m.reply('Tidak bisa gift ke diri sendiri!')
  if (!wdb.users[who]?.rpg) wdb.users[who] = { rpg: {} }
  wdb.users[who].rpg = wdb.users[who].rpg || {}

  // CEK STOK & KIRIM
  if (type === 'money') {
    if ((wdb.money[m.sender] || 0) < count) return m.reply('Uangmu tidak cukup!')
    wdb.money[m.sender] -= count
    wdb.money[who] = (wdb.money[who] || 0) + count
  } else {
    if ((wdb.users[m.sender].rpg[type] || 0) < count) return m.reply(`${type.toUpperCase()} tidak cukup!`)
    wdb.users[m.sender].rpg[type] -= count
    wdb.users[who].rpg[type] = (wdb.users[who].rpg[type] || 0) + count
  }

  saveDB(wdb)

  return sendRpgMsg(conn, m, `*───「 GIFT SENT 」───*\n\n🎁 Berhasil mengirim hadiah!\n\n┌ *Dari*: @${m.sender.split('@')[0]}\n├ *Ke*: @${who.split('@')[0]}\n├ *Item*: ${type.toUpperCase()}\n└ *Jumlah*: ${count.toLocaleString()}\n\n💡 *Mau tukar barang? Pakai:* *.trade @tag*`, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg', { mentions: [m.sender, who] })
}

handler.help = ['gift']
handler.tags = ['rpg']
handler.command = ['gift']
export default handler
