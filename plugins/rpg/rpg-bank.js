import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan .adventure')

  // Inisialisasi saldo bank jika belum ada
  if (user.bank === undefined) user.bank = 0

  let args = text.toLowerCase().split(' ')
  let action = args[0]
  let amount = args[1]

  if (!action) {
    let cap = `*───「 RPG BANK 」───*\n\n`
    cap += `💳 *Nama Akun:* ${m.pushName}\n`
    cap += `💰 *Saldo Bank:* Rp ${user.bank.toLocaleString()}\n`
    cap += `💵 *Uang di Saku:* Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n`
    cap += `*PERINTAH:* \n`
    cap += `• ${usedPrefix}${command} simpan [jumlah]\n`
    cap += `• ${usedPrefix}${command} tarik [jumlah]\n`
    cap += `• ${usedPrefix}${command} all (Simpan semua uang)`

    return conn.sendMessage(m.chat, {
      text: cap,
      contextInfo: {
        externalAdReply: {
          title: "CENTRAL BANK",
          body: "Simpan uangmu agar aman dari rampok!",
          thumbnailUrl: 'https://c.termai.cc/i187/11piK9',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
  }

  let userMoney = wdb.money[m.sender] || 0

  if (action === 'simpan' || action === 'deposit') {
    if (amount === 'all') amount = userMoney
    amount = parseInt(amount)
    if (!amount || amount <= 0) return m.reply('❌ Masukkan jumlah uang yang valid.')
    if (userMoney < amount) return m.reply('❌ Uang di saku kamu tidak cukup!')

    wdb.money[m.sender] -= amount
    user.bank += amount
    saveDB(wdb)
    return m.reply(`✅ Berhasil menyimpan *Rp ${amount.toLocaleString()}* ke Bank.`)
  }

  if (action === 'tarik' || action === 'withdraw') {
    if (amount === 'all') amount = user.bank
    amount = parseInt(amount)
    if (!amount || amount <= 0) return m.reply('❌ Masukkan jumlah uang yang valid.')
    if (user.bank < amount) return m.reply('❌ Saldo bank kamu tidak cukup!')

    user.bank -= amount
    wdb.money[m.sender] = (wdb.money[m.sender] || 0) + amount
    saveDB(wdb)
    return m.reply(`✅ Berhasil menarik *Rp ${amount.toLocaleString()}* dari Bank.`)
  }

  if (action === 'all') {
    if (userMoney <= 0) return m.reply('❌ Kamu tidak punya uang untuk disimpan.')
    user.bank += userMoney
    wdb.money[m.sender] = 0
    saveDB(wdb)
    return m.reply(`✅ Berhasil menyimpan semua uang (*Rp ${userMoney.toLocaleString()}*) ke Bank.`)
  }
}

handler.help = ['bank <action> <jumlah>']
handler.tags = ['rpg']
handler.command = ['bank', 'tabung']

export default handler