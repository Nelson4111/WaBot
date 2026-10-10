import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import {
  INTERSTELLAR_ITEM_BY_ID,
  rollInterstellarItem,
  rollInterstellarPlanet
} from '../../lib/rpg-exploreData.js'

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
  const item = rollInterstellarItem(Math.random, tierMultipliers)
  const destination = rollInterstellarPlanet()
  rpg.inventory[item.id] = (Number(rpg.inventory[item.id]) || 0) + 1
  const foundItem = INTERSTELLAR_ITEM_BY_ID.get(item.id)
  await saveDB(db)

  return m.reply(
    `╭─❏「 🚀 INTERSTELLAR EXPLORATION 」❏\n` +
    `│ 💫 *PENJELAJAHAN ANTARBINTANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Kamu berhasil mengunjungi *${destination}* dan menemukan:\n\n` +
    `> ${foundItem.emoji} *${foundItem.name}* ×1 • ${foundItem.tier}\n` +
    `> ↳ ${foundItem.description}\n\n` +
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
