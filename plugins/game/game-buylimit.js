let handler = async (m, { args, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]

  const usage = `❌ Cara pakai:
${usedPrefix + command} <jumlah>
${usedPrefix + command} all`

  if (!args[0])
    return m.reply(usage)

  // ✅ harga normal & premium
  const hargaNormal = 100
  const hargaPremium = 80
  const hargaLimit = user.premium ? hargaPremium : hargaNormal

  let jumlah

  // beli semua
  if (args[0].toLowerCase() === 'all') {
    jumlah = Math.floor(user.exp / hargaLimit)
    if (jumlah < 1)
      return m.reply('❌ EXP kamu tidak cukup!')
  } else {
    jumlah = parseInt(args[0])
    if (isNaN(jumlah) || jumlah <= 0)
      return m.reply(usage)
  }

  let harga = jumlah * hargaLimit

  if (user.exp < harga)
    return m.reply(
`❌ EXP tidak cukup!

Harga : ${harga} EXP
EXP kamu : ${user.exp}`
    )

  // transaksi
  user.exp -= harga
  user.limit += jumlah

  m.reply(
`✅ *PEMBELIAN BERHASIL*

👑 Status : ${user.premium ? 'Premium (Diskon 20%)' : 'User Biasa'}
➕ Limit : +${jumlah}
➖ EXP : -${harga}

🎟️ Total Limit : ${user.limit}
📊 Sisa EXP : ${user.exp}`
  )
}

handler.help = ['buylimit <jumlah|all>']
handler.tags = ['game']
handler.command = /^buylimit$/i

export default handler