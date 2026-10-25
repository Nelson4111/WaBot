import { loadDB } from '../../lib/waifuHelper.js'
import { addRpgMoney, formatRpgMoney, compareRpgMoney, normalizeRpgMoney, parseRpgMoneyAmount } from '../../lib/rpgMoney.js'
import { resolveRpgPanelTarget } from '../../lib/rpgPanelTarget.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  const args = text.trim().split(/\s+/).filter(Boolean)
  const { target, consumedIndexes } = resolveRpgPanelTarget(
    args,
    m,
    conn,
    global.db.data.users
  )
  const amountArgs = args.filter((_, index) => !consumedIndexes.includes(index))
  const user = target
  const amountInput = amountArgs[0]

  if (!user || amountArgs.length !== 1) {
    return m.reply(
      `*Format:* ${usedPrefix}${command} <nomor> <jumlah>\n` +
      `Contoh: ${usedPrefix}${command} 628123456789 10000\n` +
      `Atau reply pesan user: ${usedPrefix}${command} 10000`
    )
  }

  const amount = parseRpgMoneyAmount(amountInput)
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