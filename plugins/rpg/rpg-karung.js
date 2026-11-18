import { getUserRPG, loadDB, saveDB } from '../../lib/waifuHelper.js'
import { formatRpgNumber } from '../../lib/rpgMoney.js'
import { RPG_KARUNG_ITEM_BY_ID, migrateRpgTrashToKarung } from '../../lib/rpg-karungData.js'
import { sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { getStorageCapacity, getStorageCount } from '../../lib/rpg-storage.js'

const handler = async (m, { conn, usedPrefix }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) {
    return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')
  }

  const user = account.rpg
  const migrated = migrateRpgTrashToKarung(user)
  if (migrated) await saveDB(db)

  const entries = Object.entries(user.karung || {})
    .filter(([id, amount]) => RPG_KARUNG_ITEM_BY_ID.has(id) && Number.isSafeInteger(Number(amount)) && Number(amount) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
  const total = getStorageCount(user, 'karung')
  const capacity = getStorageCapacity(user)
  const caption =
    `╭─❏「 🧺 KARUNG SAMPAH 」❏\n` +
    `│ 📦 Kapasitas: ${formatRpgNumber(total)}/${formatRpgNumber(capacity)} item\n` +
    `│ 🧺 Jenis sampah: ${formatRpgNumber(entries.length)}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    (entries.length ? entries.map(([id, amount]) => {
      const item = RPG_KARUNG_ITEM_BY_ID.get(id)
      return `> ↳ ${item.emoji} ${item.name} ×${formatRpgNumber(amount)}\n`
    }).join('') : 'Karung sampahmu masih kosong.\n') +
    `\n> Jual semua: *${usedPrefix || '.'}pasar jual karung all*`

  return m.reply(caption)
}

handler.help = ['karung']
handler.tags = ['rpg']
handler.command = /^karung$/i
handler.group = true

export default handler
