import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { cancelPendingFitnahTimer, resolvePendingFitnah } from '../../lib/fitnahHelper.js'

function resolveJid(jid) {
  if (!jid) return jid
  if (jid.endsWith('@lid')) return global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
  if (jid.endsWith('@s.whatsapp.net')) return jid
  if (/^\d+$/.test(jid)) return `${jid}@s.whatsapp.net`
  return jid
}

function formatMoney(amount) {
  return Number(amount).toLocaleString('id-ID')
}

let handler = async (m, { args, usedPrefix, conn }) => {
  const target = resolveJid(m.sender)
  const amountText = args[0]
  if (!amountText || !/^\d+$/.test(String(amountText))) {
    return m.reply(`Format: ${usedPrefix}bantah <biaya>\nGunakan nominal biaya yang ingin dipertaruhkan untuk membantah fitnah.`)
  }

  const amount = Number(amountText)
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return m.reply('❌ Biaya bantah harus berupa nominal positif yang valid.')
  }

  global.db.data.fitnahPending = global.db.data.fitnahPending || {}
  const pending = global.db.data.fitnahPending[target]
  if (!pending) return m.reply('❌ Tidak ada fitnah yang sedang menargetkanmu.')

  if (Date.now() >= Number(pending.expiresAt)) {
    await resolvePendingFitnah(conn, pending)
    return m.reply('⏳ Waktu bantah sudah habis; proses fitnah telah berjalan.')
  }
  const wdb = loadDB()
  const balance = Number(wdb.money[target]) || 0
  if (balance < amount) {
    return m.reply(`❌ Uang tidak cukup.\n💰 Punya: Rp ${formatMoney(balance)}\n💸 Butuh: Rp ${formatMoney(amount)}`)
  }

  wdb.money[target] = balance - amount
  const wager = Number(pending.wager)
  const chance = wager > 0 ? Math.min(1, amount / wager) : 1
  const berhasil = Math.random() < chance

  if (berhasil) {
    cancelPendingFitnahTimer(target)
    delete global.db.data.fitnahPending[target]
    await saveDB(wdb)

    return conn.reply(
      m.chat,
      `╭─❏「 🛡️ FITNAH BERHASIL DIBANTAH 」❏\n\n> 👤 Pembantah: @${target.split('@')[0]}\n> 🎯 Pelaku fitnah: @${pending.sender.split('@')[0]}\n> 💸 Biaya bantah: Rp ${formatMoney(amount)}\n> ✅ Fitnah berhasil digagalkan.\n\n╰─━━━━━━━━━━━━━━─`,
      m,
      { mentions: [target, pending.sender] }
    )
  }

  await saveDB(wdb)
  return conn.reply(
    m.chat,
    `╭─❏「 🛡️ BANTAHAN GAGAL 」❏\n\n> 👤 Pembantah: @${target.split('@')[0]}\n> 🎯 Pelaku fitnah: @${pending.sender.split('@')[0]}\n> 💸 Biaya bantah: Rp ${formatMoney(amount)}\n> ❌ Fitnah belum berhasil digagalkan.\n> ⏳ Kesempatan membantah tetap terbuka sampai waktu proses habis.\n\n╰─━━━━━━━━━━━━━━─`,
    m,
    { mentions: [target, pending.sender] }
  )
}

handler.help = ['bantah <biaya>']
handler.tags = ['rpg']
handler.command = /^bantah$/i
handler.group = true

export default handler
