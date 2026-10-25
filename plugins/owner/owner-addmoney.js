import { loadDB } from '../../lib/waifuHelper.js'
import { addRpgMoney, formatRpgMoney, compareRpgMoney, normalizeRpgMoney, parseRpgMoneyAmount } from '../../lib/rpgMoney.js'

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

  amount = parseRpgMoneyAmount(amount)
  if (amount === null || compareRpgMoney(amount, 1) < 0) return m.reply('❌ Masukkan jumlah rupiah positif yang valid.')

  const currentBalance = normalizeRpgMoney(wdb.money[user])
  const newBalance = addRpgMoney(currentBalance, amount)
  if (compareRpgMoney(currentBalance, 0) < 0) return m.reply('❌ Saldo user tidak valid.')
  if (typeof global.db.write !== 'function') {
    return m.reply('❌ Database belum siap menyimpan saldo. Coba lagi nanti.')
  }
  wdb.money[user] = newBalance
  await global.db.write()

  let name = conn.getName(user) || user.split('@')[0]
  let cap = `*──「 ADD MONEY 」──*\n\n`
  cap += `👤 User: ${name}\n`
  cap += `💰 Jumlah: +${formatRpgMoney(amount)}\n`
  cap += `💳 Total Saldo: ${formatRpgMoney(wdb.money[user])}`

  return m.reply(cap)
}

handler.help = ['addmoney']
handler.tags = ['owner']
handler.command = ['addmoney', 'adduang']
handler.owner = true 

export default handler