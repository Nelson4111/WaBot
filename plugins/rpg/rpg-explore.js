import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import { INTERSTELLAR_ITEM_BY_ID, STELLAR_CREDIT, rollInterstellarItem } from '../../lib/rpg-exploreData.js'

const EXPLORE_COOLDOWN = 15 * 60 * 1000

let handler = async (m) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const rpg = account.rpg
  const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
  if (!tier.fasilitas.includes('Interstellar Gateway')) {
    return m.reply('❌ Penjelajahan antarbintang membutuhkan fasilitas Interstellar Gateway dari Stellar Card.')
  }

  const now = Date.now()
  const cooldown = scaleDifficultyCooldown(rpg, EXPLORE_COOLDOWN)
  const remaining = cooldown - (now - (Number(rpg.lastExplore) || 0))
  if (remaining > 0) {
    return m.reply(`⏳ Interstellar Gateway sedang mengisi ulang. Coba lagi dalam *${Math.ceil(remaining / 60000)} menit*.`)
  }

  if (!rpg.inventory || typeof rpg.inventory !== 'object') rpg.inventory = {}
  const item = rollInterstellarItem()
  const creditAmount = Math.floor(Math.random() * 5) + 1
  rpg.inventory[item.id] = (Number(rpg.inventory[item.id]) || 0) + 1
  rpg.inventory[STELLAR_CREDIT.id] = (Number(rpg.inventory[STELLAR_CREDIT.id]) || 0) + creditAmount
  rpg.stellarCredit = (Number(rpg.stellarCredit) || 0) + creditAmount
  rpg.lastExplore = now
  rpg.interstellarExplores = (Number(rpg.interstellarExplores) || 0) + 1
  const foundItem = INTERSTELLAR_ITEM_BY_ID.get(item.id)
  await saveDB(db)

  return m.reply(
    `╭─❏「 🚀 INTERSTELLAR EXPLORATION 」❏\n` +
    `│ 💫 *PENJELAJAHAN ANTARBINTANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Kamu menjelajahi wilayah luar dan berhasil menemukan:\n\n` +
    `> ${foundItem.emoji} *${foundItem.name}* ×1 • ${foundItem.tier}\n` +
    `> ↳ ${foundItem.description}\n` +
    `> ${STELLAR_CREDIT.emoji} *${STELLAR_CREDIT.name}* ×${creditAmount}\n` +
    `> ↳ ${STELLAR_CREDIT.description}\n\n` +
    `📦 Item masuk ke *.bag* dan *.gudang material*.\n` +
    `💠 Total Stellar Credit : ${rpg.stellarCredit}\n` +
    `🧭 Total penjelajahan : ${rpg.interstellarExplores}\n` +
    `⏳ Cooldown : ${Math.ceil(cooldown / 60000)} menit\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['explore']
handler.tags = ['rpg']
handler.command = /^(explore)$/i
handler.group = true

export default handler
