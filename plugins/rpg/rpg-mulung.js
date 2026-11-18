import { addRpgMoney } from '../../lib/rpgMoney.js'
import { sendRpgButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { getStorageAvailableSpace, isStorageFull, sendStorageFullNotice } from '../../lib/rpg-storage.js'
import { getUserRPG, loadDB, saveDB } from '../../lib/waifuHelper.js'
import { addRpgTrashToKarung, migrateRpgTrashToKarung, RPG_KARUNG_ITEMS } from '../../lib/rpg-karungData.js'

const COOLDOWN = 30 * 1000

const handler = async (m, { conn, text, usedPrefix }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) {
    return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')
  }

  if (String(text || '').trim()) {
    return m.reply(`Gunakan *${usedPrefix || '.'}mulung* tanpa tambahan teks.`)
  }

  const user = account.rpg
  if (migrateRpgTrashToKarung(user)) await saveDB(db)
  if (isStorageFull(user, 'karung')) return sendStorageFullNotice(conn, m, user, 'karung', usedPrefix || '.')

  const now = Date.now()
  const remaining = COOLDOWN - (now - (Number(user.lastMulung) || 0))
  if (remaining > 0) {
    return m.reply(`🗑️ Kamu masih mengumpulkan sampah. Coba lagi dalam *${Math.ceil(remaining / 1000)} detik*.`)
  }

  const typeCount = 3 + Math.floor(Math.random() * 4)
  const found = new Map()
  while (found.size < typeCount) {
    const item = RPG_KARUNG_ITEMS[Math.floor(Math.random() * RPG_KARUNG_ITEMS.length)]
    found.set(item.id, { item, quantity: 1 + Math.floor(Math.random() * 4) })
  }

  let availableSpace = getStorageAvailableSpace(user, 'karung')
  const requestedTotal = [...found.values()].reduce((sum, entry) => sum + entry.quantity, 0)
  const stored = []
  let total = 0
  for (const { item, quantity } of found.values()) {
    if (availableSpace <= 0) break
    const storedQuantity = Math.min(quantity, availableSpace)
    addRpgTrashToKarung(user, item.id, storedQuantity)
    stored.push({ item, quantity: storedQuantity })
    total += storedQuantity
    availableSpace -= storedQuantity
  }
  const moneyReward = Math.random() < 0.2 ? rollMulungMoneyReward() : 0
  if (moneyReward) wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], moneyReward)
  user.lastMulung = now
  await saveDB(db)

  const caption =
    `╭─❏「 🗑️ MULUNG 」❏\n` +
    `│ ♻️ *HASIL MULUNG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Kamu mengumpulkan ${total} sampah dari ${stored.length} jenis:\n\n` +
    stored.map(({ item, quantity }) =>
      `> ↳ ${item.emoji} ${item.name} ×${quantity}\n`
    ).join('') +
    (total < requestedTotal ? `\n> ↳ Ruang karung hampir penuh; sebagian sampah tidak tersimpan.\n` : '') +
    (moneyReward ? `\n> ↳ 💵 Kamu juga menemukan uang: *+Rp ${moneyReward.toLocaleString('id-ID')}*\n` : '') +
    `\n> ↳ ⏳ Cooldown: 30 detik\n\n` +
    `─━━━━━━━━━━━━━━─`

  return sendRpgButtons(conn, {
    chat: m.chat,
    text: caption,
    title: '🗑️ HASIL MULUNG',
    subtitle: 'Sampah sudah tersimpan di karung',
    buttons: [['🧺 Buka Karung', `${usedPrefix || '.'}karung`]],
    quoted: m,
    reply: fallbackText => m.reply(fallbackText)
  })
}

function rollMulungMoneyReward() {
  const roll = Math.random()
  const range = roll < 0.7
    ? [100, 1000]
    : roll < 0.9
      ? [1000, 10000]
      : roll < 0.98
        ? [10000, 100000]
        : roll < 0.999
          ? [100000, 1000000]
          : [1000000, 10000000]
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1))
}

handler.help = ['mulung', 'scavenge']
handler.tags = ['rpg']
handler.command = /^(mulung|scavenge)$/i

export default handler
