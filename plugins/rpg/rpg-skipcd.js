import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  clearSkipCooldownEntries,
  getSkipCooldownEntries,
  resolveSkipCooldownTarget,
  selectSkipCooldownEntries,
  SKIPCD_CONFIRMATION_TTL,
  SKIPCD_COST_PER_MINUTE
} from '../../lib/rpgCooldownSkip.js'

const CONFIRM_YES = new Set(['ya', 'yes', 'ok', 'confirm'])
const CONFIRM_NO = new Set(['batal', 'no', 'tidak', 'cancel'])

const formatMoney = amount => `Rp ${Number(amount).toLocaleString('id-ID')}`

const handler = async (m, { text = '', usedPrefix = '.' }) => {
  const db = loadDB()
  const account = db.users?.[m.sender]
  const now = Date.now()
  if (!isPremiumAccount(account, now)) {
    return m.reply('❌ `.skipcd` hanya tersedia untuk pengguna Premium.')
  }
  const rpg = account?.rpg
  if (!rpg) return m.reply('❌ Data RPG kamu belum tersedia.')
  if (!global.db.data.fitnah || typeof global.db.data.fitnah !== 'object') {
    global.db.data.fitnah = {}
  }
  db.fitnah = global.db.data.fitnah

  const input = text.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!db.temp || typeof db.temp !== 'object') db.temp = {}
  if (!db.temp.skipcd || typeof db.temp.skipcd !== 'object') db.temp.skipcd = {}
  const pending = db.temp.skipcd[m.sender]

  if (CONFIRM_NO.has(input)) {
    if (!pending) return m.reply('❌ Tidak ada konfirmasi `.skipcd` yang aktif.')
    delete db.temp.skipcd[m.sender]
    await saveDB(db)
    return m.reply('✅ Konfirmasi `.skipcd` dibatalkan. Uang tidak dipotong.')
  }

  if (CONFIRM_YES.has(input)) {
    if (!pending || now - pending.createdAt > SKIPCD_CONFIRMATION_TTL) {
      delete db.temp.skipcd[m.sender]
      await saveDB(db)
      return m.reply('❌ Konfirmasi `.skipcd` tidak ada atau sudah kedaluwarsa. Buat permintaan baru.')
    }

    const currentEntries = selectSkipCooldownEntries(
      pending.target,
      getSkipCooldownEntries(rpg, db.fitnah?.[m.sender], now)
    )
    const snapshotMatches = currentEntries.length === pending.entries.length &&
      pending.entries.every(saved => currentEntries.some(current =>
        current.id === saved.id && current.timestamp === saved.timestamp
      ))
    if (!snapshotMatches) {
      delete db.temp.skipcd[m.sender]
      await saveDB(db)
      return m.reply('❌ Status cooldown berubah sejak konfirmasi dibuat. Jalankan `.skipcd` lagi untuk melihat biaya terbaru.')
    }

    const cost = Number(pending.cost) || 0
    const balance = Number(db.money[m.sender]) || 0
    if (balance < cost) {
      delete db.temp.skipcd[m.sender]
      await saveDB(db)
      return m.reply(`❌ Uang tidak cukup. Dibutuhkan ${formatMoney(cost)}, saldo kamu ${formatMoney(balance)}.`)
    }

    db.money[m.sender] = balance - cost
    clearSkipCooldownEntries(rpg, db, m.sender, currentEntries)
    delete db.temp.skipcd[m.sender]
    await saveDB(db)
    return m.reply(
      `✅ *COOLDOWN BERHASIL DILEWATI*\n` +
      `> ↳ Target: ${currentEntries.map(({ label }) => label).join(', ')}\n` +
      `> ↳ Biaya: ${formatMoney(cost)}\n` +
      `> ↳ Sisa saldo: ${formatMoney(Number(db.money[m.sender]) || 0)}`
    )
  }

  const target = resolveSkipCooldownTarget(input)
  if (!target) {
    return m.reply(
      `📌 *Cara menggunakan*\n` +
      `> ↳ ${usedPrefix}skipcd <mining|mancing|dungeon|adventure|work|kriminal|kawin|explore>\n` +
      `> ↳ Contoh: ${usedPrefix}skipcd mining\n` +
      `> ↳ Semua tindak kriminal: ${usedPrefix}skipcd kriminal\n` +
      `> ↳ Tarif: ${formatMoney(SKIPCD_COST_PER_MINUTE)} per menit tersisa, dibulatkan ke atas untuk setiap aktivitas/aksi.\n` +
      `> ↳ Konfirmasi: ${usedPrefix}skipcd ya | ${usedPrefix}skipcd batal`
    )
  }

  const entries = selectSkipCooldownEntries(
    target,
    getSkipCooldownEntries(rpg, db.fitnah?.[m.sender], now)
  )
  if (!entries.length) {
    return m.reply('✅ Tidak ada cooldown aktif untuk target tersebut.')
  }

  const cost = entries.reduce((total, entry) => total + entry.cost, 0)
  db.temp.skipcd[m.sender] = {
    target,
    createdAt: now,
    cost,
    entries: entries.map(({ id, timestamp }) => ({ id, timestamp }))
  }
  await saveDB(db)

  return m.reply(
    `╭─❏「 ⏩ KONFIRMASI SKIP COOLDOWN 」❏\n` +
    `│ Premium • Berlaku 60 detik\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Cooldown: ${entries.map(({ label, remaining }) => `${label} (${Math.ceil(remaining / 60000)} menit)`).join(', ')}\n` +
    `> ↳ Tarif: ${formatMoney(SKIPCD_COST_PER_MINUTE)} per menit tersisa (dibulatkan per aktivitas/aksi)\n` +
    `> ↳ Total biaya: *${formatMoney(cost)}*\n\n` +
    `Ketik *${usedPrefix}skipcd ya* untuk lanjut atau *${usedPrefix}skipcd batal* untuk membatalkan.`
  )
}

handler.help = ['skipcd <mining|mancing|dungeon|adventure|work|kriminal|kawin|explore>']
handler.tags = ['rpg']
handler.command = /^skipcd$/i

export default handler
