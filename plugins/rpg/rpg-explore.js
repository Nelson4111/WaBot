import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import {
  INTERSTELLAR_ITEM_BY_ID,
  rollInterstellarCommonItem,
  rollInterstellarItem,
  rollInterstellarPlanet
} from '../../lib/rpg-exploreData.js'

const EXPLORE_COOLDOWN = 15 * 60 * 1000

let handler = async (m, { conn }) => {
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
  const legendaryDiscovery = isRpgEventActive('legendary_discovery')
  const stellarBlessing = isRpgEventActive('stellar_blessing')
  const dimensionalRift = isRpgEventActive('dimensional_rift')
  const voidCorruption = isRpgEventActive('void_corruption')
  const cosmicTurbulence = isRpgEventActive('cosmic_turbulence')
  const failureChance = (voidCorruption ? 0.45 : 0) + (cosmicTurbulence ? 0.15 : 0)
  rpg.lastExplore = now
  rpg.interstellarExplores = (Number(rpg.interstellarExplores) || 0) + 1
  if (Math.random() < failureChance) {
    await saveDB(db)
    return m.reply(
      `╭─❏「 🌌 EXPLORATION FAILED 」❏\n` +
      `│ ☄️ *PENJELAJAHAN GAGAL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> Navigasi antarbintang terganggu; tidak ada item yang hilang dari inventory.\n` +
      `> ⏳ Cooldown: ${Math.ceil(cooldown / 60000)} menit\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  const tierMultipliers = {
    RARE: (dimensionalRift ? 1.5 : 1) * (stellarBlessing ? 1.3 : 1),
    EPIC: (dimensionalRift ? 1.5 : 1) * (stellarBlessing ? 1.3 : 1),
    LEGENDARY: (dimensionalRift ? 1.5 : 1) * (legendaryDiscovery ? 1.5 : 1) * (stellarBlessing ? 1.3 : 1),
    MYTHIC: (dimensionalRift ? 1.5 : 1) * (legendaryDiscovery ? 1.5 : 1) * (stellarBlessing ? 1.3 : 1)
  }
  const items = [
    rollInterstellarCommonItem(),
    rollInterstellarCommonItem()
  ]
  const bonusRoll = Math.random()
  const bonusCount = bonusRoll < 0.5 ? 0 : bonusRoll < 0.8 ? 1 : bonusRoll < 0.95 ? 2 : 3
  for (let i = 0; i < bonusCount; i++) {
    items.push(rollInterstellarItem(Math.random, tierMultipliers))
  }

  const destination = rollInterstellarPlanet()
  const itemCounts = new Map()
  for (const item of items) {
    rpg.inventory[item.id] = (Number(rpg.inventory[item.id]) || 0) + 1
    itemCounts.set(item.id, (itemCounts.get(item.id) || 0) + 1)
  }
  const foundItems = [...itemCounts].map(([itemId, quantity]) => ({
    item: INTERSTELLAR_ITEM_BY_ID.get(itemId),
    quantity
  }))
  await saveDB(db)

  const caption =
    `╭─❏「 🚀 INTERSTELLAR EXPLORATION 」❏\n` +
    `│ 💫 *PENJELAJAHAN ANTARBINTANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Kamu mengunjungi planet *${destination}* dan menemukan ${items.length} item:\n\n` +
    foundItems.map(({ item, quantity }) =>
      `> ${item.emoji} *${item.name}* ×${quantity} • ${item.tier}\n` +
      `> ↳ ${item.description}\n`
    ).join('') +
    `\n` +
    `🧭 Total penjelajahan : ${rpg.interstellarExplores}\n` +
    `⏳ Cooldown : ${Math.ceil(cooldown / 60000)} menit\n\n` +
    `─━━━━━━━━━━━━━━─`
  const image = Math.random() < 0.5
    ? 'https://c.termai.cc/i143/rU2.jpg'
    : 'https://c.termai.cc/i123/9R4g.jpg'
  return conn.sendMessage(m.chat, { image: { url: image }, caption }, { quoted: m })
}

handler.help = ['explore']
handler.tags = ['rpg']
handler.command = /^(explore)$/i
handler.group = true

export default handler
