import { loadDB, saveDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg

  initLadang(user)

  let currentLadang = user.maxLadang || 1

  if (currentLadang >= 10) {
    return m.reply(
      `╭─❏「 ❌ UPGRADE LADANG 」❏\n` +
      `│ 🌱 Slot ladang sudah maksimal.\n` +
      `│ ↳ Maksimal: 10 ladang.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  let hargaSewa = currentLadang * 500000

  if ((wdb.money[m.sender] || 0) < hargaSewa) {
    return m.reply(
      `╭─❏「 ❌ UPGRADE LADANG 」❏\n` +
      `│ 💸 Uang tidak cukup.\n` +
      `│ ↳ Harga ladang ke-${currentLadang + 1}: Rp ${hargaSewa.toLocaleString()}\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  wdb.money[m.sender] -= hargaSewa
  user.maxLadang = currentLadang + 1

  saveDB(wdb)

  return m.reply(
    `╭─❏「 🏡 UPGRADE LADANG 」❏\n` +
    `│ 🌱 Slot Baru: ${user.maxLadang}\n` +
    `│ 💸 Biaya: -Rp ${hargaSewa.toLocaleString()}\n` +
    `│ 🔧 Upgrade Berikutnya: Rp ${(user.maxLadang * 500000).toLocaleString()}\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['buyladang']
handler.tags = ['rpg']
handler.command = /^(buyladang)$/i
handler.group = true

export default handler