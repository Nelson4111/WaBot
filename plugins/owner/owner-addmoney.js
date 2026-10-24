import { loadDB } from '../../lib/waifuHelper.js'

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

  if (!/^[\d.,]+$/.test(amount || '')) return m.reply('❌ Masukkan jumlah angka yang valid.')
  amount = Number(amount.replace(/[.,]/g, ''))
  if (!Number.isSafeInteger(amount) || amount < 1) {
    return m.reply('❌ Jumlah harus berupa bilangan bulat positif yang masih aman dihitung.')
  }

  const currentBalance = Number(wdb.money[user]) || 0
  const newBalance = currentBalance + amount
  if (!Number.isSafeInteger(currentBalance) || currentBalance < 0 || !Number.isSafeInteger(newBalance)) {
    return m.reply('❌ Saldo atau jumlah penambahan terlalu besar untuk dihitung dengan aman.')
  }
  if (typeof global.db.write !== 'function') {
    return m.reply('❌ Database belum siap menyimpan saldo. Coba lagi nanti.')
  }
  wdb.money[user] = newBalance
  await global.db.write()

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