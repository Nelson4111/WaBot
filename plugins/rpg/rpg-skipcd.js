import { sendRpgButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import { compareRpgMoney, formatRpgMoney, normalizeRpgMoney, subtractRpgMoney } from '../../lib/rpgMoney.js'
import {
  clearSkipCooldownEntries,
  getSkipCooldownEntries,
  getSkipCooldownUsage,
  recordSkipCooldownUsage,
  resolveSkipCooldownTarget,
  selectSkipCooldownEntries,
  SKIPCD_CONFIRMATION_TTL,
  SKIPCD_COST_PER_SECOND,
  SKIPCD_HOURLY_LIMIT
} from '../../lib/rpgCooldownSkip.js'

const CONFIRM_YES = new Set(['ya', 'yes', 'ok', 'confirm'])
const CONFIRM_NO = new Set(['batal', 'no', 'tidak', 'cancel'])

const formatMoney = amount => formatRpgMoney(amount)
const formatSkipCooldownLimit = ({ count, resetAt }, now) => {
  const remainingMinutes = Math.max(1, Math.ceil((resetAt - now) / 60000))
  return `❌ Batas skipcd ${SKIPCD_HOURLY_LIMIT} kali per jam sudah tercapai. Coba lagi dalam ${remainingMinutes} menit.`
}

const handler = async (m, { conn, text = '', usedPrefix = '.' }) => {
  const db = loadDB()
  const account = db.users?.[m.sender]
  const now = Date.now()
  if (!isPremiumAccount(account, now)) {
    return m.reply('❌ `.skipcd` hanya tersedia untuk pengguna Premium.')
  }
  const rpg = account?.rpg
  if (!rpg) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Data RPG kamu belum tersedia.')
  if (!global.db.data.fitnah || typeof global.db.data.fitnah !== 'object') {
    global.db.data.fitnah = {}
  }
  db.fitnah = global.db.data.fitnah

  const input = text.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!db.temp || typeof db.temp !== 'object') db.temp = {}
  if (!db.temp.skipcd || typeof db.temp.skipcd !== 'object') db.temp.skipcd = {}
  if (!db.temp.skipcdUsage || typeof db.temp.skipcdUsage !== 'object') db.temp.skipcdUsage = {}
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

    const usage = getSkipCooldownUsage(db.temp.skipcdUsage[m.sender], now)
    if (usage.count >= SKIPCD_HOURLY_LIMIT) {
      delete db.temp.skipcd[m.sender]
      await saveDB(db)
      return m.reply(formatSkipCooldownLimit(usage, now))
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
    const balance = normalizeRpgMoney(db.money[m.sender])
    if (compareRpgMoney(balance, cost) < 0) {
      delete db.temp.skipcd[m.sender]
      await saveDB(db)
      return m.reply(`❌ Uang tidak cukup. Dibutuhkan ${formatMoney(cost)}, saldo kamu ${formatMoney(balance)}.`)
    }

    db.money[m.sender] = subtractRpgMoney(balance, cost)
    db.temp.skipcdUsage[m.sender] = recordSkipCooldownUsage(db.temp.skipcdUsage[m.sender], now)
    clearSkipCooldownEntries(rpg, db, m.sender, currentEntries)
    delete db.temp.skipcd[m.sender]
    await saveDB(db)
    return m.reply(
      `✅ *COOLDOWN BERHASIL DILEWATI*\n` +
      `> ↳ Target: ${currentEntries.map(({ label }) => label).join(', ')}\n` +
      `> ↳ Biaya: ${formatMoney(cost)}\n` +
      `> ↳ Sisa kuota skipcd: ${SKIPCD_HOURLY_LIMIT - usage.count - 1}/${SKIPCD_HOURLY_LIMIT} kali per jam\n` +
      `> ↳ Sisa saldo: ${formatMoney(db.money[m.sender])}`
    )
  }

  const target = resolveSkipCooldownTarget(input)
  if (!target) {
    const guideText =
      `📌 *Cara menggunakan*\n` +
      `> ↳ ${usedPrefix}skipcd <mining|mancing|dungeon|adventure|work|kriminal|kawin|explore>\n` +
      `> ↳ Contoh: ${usedPrefix}skipcd mining\n` +
      `> ↳ Semua tindak kriminal: ${usedPrefix}skipcd kriminal\n` +
      `> ↳ Tarif: ${formatMoney(SKIPCD_COST_PER_SECOND)} per detik tersisa, dibulatkan ke atas untuk setiap aktivitas/aksi.\n` +
      `> ↳ Batas pemakaian: maksimal ${SKIPCD_HOURLY_LIMIT} kali per jam.\n` +
      `> ↳ Konfirmasi: ${usedPrefix}skipcd ya | ${usedPrefix}skipcd batal`
    const activities = [
      ['Mining', 'mining'],
      ['Memancing', 'mancing'],
      ['Dungeon', 'dungeon'],
      ['Adventure', 'adventure'],
      ['Work', 'work'],
      ['Kriminal', 'kriminal'],
      ['Kawin', 'kawin'],
      ['Explore', 'explore']
    ]
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '⏩ SKIP COOLDOWN',
      text: guideText,
      buttonText: 'PILIH AKTIVITAS',
      sections: [{
        title: 'Pilih aktivitas',
        rows: activities.map(([name, id]) => ({
          title: name,
          description: `Lewati cooldown ${name}`,
          id: `${usedPrefix}skipcd ${id}`
        }))
      }],
      fallbackText: guideText,
      noThumbnail: true,
      noHeader: true
    })
  }

  const usage = getSkipCooldownUsage(db.temp.skipcdUsage[m.sender], now)
  if (usage.count >= SKIPCD_HOURLY_LIMIT) {
    return m.reply(formatSkipCooldownLimit(usage, now))
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

  const confirmationText =
    `╭─❏「 ⏩ KONFIRMASI SKIP COOLDOWN 」❏\n` +
    `│ Premium • Berlaku 5 menit\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Cooldown: ${entries.map(({ label, remaining }) => `${label} (${Math.ceil(remaining / 60000)} menit)`).join(', ')}\n` +
    `> ↳ Tarif: ${formatMoney(SKIPCD_COST_PER_SECOND)} per detik tersisa (dibulatkan per aktivitas/aksi)\n` +
    `> ↳ Total biaya: *${formatMoney(cost)}*\n\n` +
    `Tekan tombol untuk melanjutkan atau membatalkan.`
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    text: confirmationText,
    buttons: [
      ['✅ Lanjutkan', `${usedPrefix}skipcd ya`],
      ['↩️ Batalkan', `${usedPrefix}skipcd batal`]
    ],
    noThumbnail: true,
    noHeader: true
  })
}

handler.help = ['skipcd <mining|mancing|dungeon|adventure|work|kriminal|kawin|explore>']
handler.tags = ['rpg']
handler.command = /^skipcd$/i

export default handler
