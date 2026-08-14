import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user, amount
  let args = text.trim().split(/\s+/)

  if (m.quoted) {
    user = m.quoted.sender
    amount = args[0]
  } else {
    if (args.length < 2) return m.reply(`*Format:* ${usedPrefix}${command} <nomor> <jumlah>`)
    user = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    amount = args[1]
  }

  amount = parseInt(amount?.replace(/[^0-9]/g, ''))
  if (!amount || isNaN(amount)) return m.reply('❌ Masukkan angka valid.')

  if (!wdb.money[user]) wdb.money[user] = 0
  wdb.money[user] += amount
  
  saveDB(wdb)

  let name = conn.getName(user) || user.split('@')[0]
  let cap = `*──「 ADD MONEY 」──*\n\n`
  cap += `👤 User: ${name}\n`
  cap += `💰 Jumlah: +Rp ${amount.toLocaleString()}\n`
  cap += `💳 Total Saldo: Rp ${wdb.money[user].toLocaleString()}`

  return m.reply(cap)
}

handler.help = ['addmoney']
handler.tags = ['owner']
handler.command = ['addmoney', 'adduang']
handler.owner = true 

export default handler