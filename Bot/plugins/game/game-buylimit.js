let handler = async (m, { args, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  const isMoney = /money|uang/i.test(command) || (args[1] && /money|uang/i.test(args[1]))

  const usage = `🎟️ *CARA PEMBELIAN LIMIT*

1️⃣ *Beli dengan EXP:*
• *${usedPrefix}buylimit <jumlah>* (Contoh: ${usedPrefix}buylimit 10)
• *${usedPrefix}buylimit all* (Beli maksimal sesuai saldo EXP)

2️⃣ *Beli dengan Uang (Money):*
• *${usedPrefix}buylimit <jumlah> money* (Contoh: ${usedPrefix}buylimit 10 money)
• *${usedPrefix}buylimitmoney <jumlah>* (Contoh: ${usedPrefix}buylimitmoney 10)
• *${usedPrefix}buylimit all money* (Beli maksimal sesuai saldo Uang)

💡 *Informasi Harga per 1 Limit:*
• Via EXP: ${user.premium ? '80 EXP (Diskon Premium 20%)' : '100 EXP'}
• Via Money: ${user.premium ? 'Rp 8.000 (Diskon Premium 20%)' : 'Rp 10.000'}

✨ *Limit tidak dibatasi max 100, bisa bertambah sebanyak yang kamu beli!*`

  if (!args[0]) return m.reply(usage)

  // Harga per 1 Limit
  const hargaExpUnit = user.premium ? 80 : 100
  const hargaMoneyUnit = user.premium ? 8000 : 10000

  let jumlah = 0

  if (isMoney) {
    // === Beli menggunakan Money / Uang ===
    if (args[0].toLowerCase() === 'all') {
      jumlah = Math.floor((user.money || 0) / hargaMoneyUnit)
      if (jumlah < 1) return m.reply(`❌ Uang (Money) kamu tidak cukup! Minimal butuh Rp ${hargaMoneyUnit.toLocaleString('id-ID')} Money untuk 1 limit.`)
    } else {
      jumlah = parseInt(args[0])
      if (isNaN(jumlah) || jumlah <= 0) return m.reply(usage)
    }

    let hargaTotalMoney = jumlah * hargaMoneyUnit
    if ((user.money || 0) < hargaTotalMoney) {
      return m.reply(
        `❌ Uang (Money) kamu tidak cukup!\n\n` +
        `• Butuh: *Rp ${hargaTotalMoney.toLocaleString('id-ID')} Money*\n` +
        `• Uang Kamu: *Rp ${(user.money || 0).toLocaleString('id-ID')} Money*`
      )
    }

    // Transaksi via Money
    user.money = (user.money || 0) - hargaTotalMoney
    user.limit = (user.limit || 0) + jumlah

    m.reply(
      `✅ *PEMBELIAN LIMIT BERHASIL (VIA MONEY)*\n\n` +
      `👑 *Status:* ${user.premium ? 'Premium (Diskon 20%)' : 'User Biasa'}\n` +
      `➕ *Tambah Limit:* +${jumlah}\n` +
      `➖ *Uang Terpakai:* -Rp ${hargaTotalMoney.toLocaleString('id-ID')}\n\n` +
      `🎟️ *Total Limit Sekarang:* ${user.limit}\n` +
      `💰 *Sisa Uang:* Rp ${(user.money || 0).toLocaleString('id-ID')}`
    )

  } else {
    // === Beli menggunakan EXP ===
    if (args[0].toLowerCase() === 'all') {
      jumlah = Math.floor((user.exp || 0) / hargaExpUnit)
      if (jumlah < 1) return m.reply(`❌ EXP kamu tidak cukup! Minimal butuh ${hargaExpUnit} EXP untuk 1 limit.`)
    } else {
      jumlah = parseInt(args[0])
      if (isNaN(jumlah) || jumlah <= 0) return m.reply(usage)
    }

    let hargaTotalExp = jumlah * hargaExpUnit
    if ((user.exp || 0) < hargaTotalExp) {
      return m.reply(
        `❌ EXP kamu tidak cukup!\n\n` +
        `• Butuh: *${hargaTotalExp.toLocaleString('id-ID')} EXP*\n` +
        `• EXP Kamu: *${(user.exp || 0).toLocaleString('id-ID')} EXP*`
      )
    }

    // Transaksi via EXP
    user.exp = (user.exp || 0) - hargaTotalExp
    user.limit = (user.limit || 0) + jumlah

    m.reply(
      `✅ *PEMBELIAN LIMIT BERHASIL (VIA EXP)*\n\n` +
      `👑 *Status:* ${user.premium ? 'Premium (Diskon 20%)' : 'User Biasa'}\n` +
      `➕ *Tambah Limit:* +${jumlah}\n` +
      `➖ *EXP Terpakai:* -${hargaTotalExp.toLocaleString('id-ID')} EXP\n\n` +
      `🎟️ *Total Limit Sekarang:* ${user.limit}\n` +
      `📊 *Sisa EXP:* ${(user.exp || 0).toLocaleString('id-ID')}`
    )
  }
}

handler.help = ['buylimit <jumlah|all>', 'buylimitmoney <jumlah|all>']
handler.tags = ['game', 'rpg']
handler.command = /^(buylimit|buylimitmoney|buylimituang)$/i

export default handler