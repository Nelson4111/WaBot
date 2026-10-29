import { sendRpgButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { adjustDifficultyFailureChance, getDifficultyProfile, scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import {
  INTERSTELLAR_ITEM_BY_ID,
  rollInterstellarCommonItem,
  rollInterstellarItem,
  rollInterstellarPlanet
} from '../../lib/rpg-exploreData.js'
import { getGroupTotemBuff } from '../../lib/rpg-totemData.js'
import { attemptRpgIllegalAction, formatRpgIllegalResult, saveFailedRpgIllegalAction } from '../../lib/rpgIlegal.js'

const EXPLORE_COOLDOWN = 15 * 60 * 1000

let handler = async (m, { conn, text, usedPrefix }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const rpg = account.rpg
  const illegalText = String(text || '').trim().toLowerCase()
  let illegalMultiplier = 1
  let illegalResult = null
  if (illegalText && illegalText !== 'ilegal') {
    return m.reply(`Gunakan *${usedPrefix || '.'}explore ilegal* untuk mencoba usaha ilegal explore.`)
  }
  const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
  if (!tier.fasilitas.includes('Interstellar Gateway')) {
    return m.reply('❌ Penjelajahan antarbintang membutuhkan fasilitas Interstellar Gateway dari Stellar Card.')
  }

  const now = Date.now()
  const cooldownBuff = getGroupTotemBuff(db.data, m.chat, 'explore', 'cooldown')
  const rareBuff = getGroupTotemBuff(db.data, m.chat, 'explore', 'rareChance')
  const yieldBuff = getGroupTotemBuff(db.data, m.chat, 'explore', 'yield')
  const cooldown = Math.floor(scaleDifficultyCooldown(rpg, EXPLORE_COOLDOWN) * cooldownBuff)
  const remaining = cooldown - (now - (Number(rpg.lastExplore) || 0))
  if (illegalText) {
    illegalResult = attemptRpgIllegalAction({
      db,
      jid: m.sender,
      user: rpg,
      activity: 'explore',
      cooldownDuration: cooldown,
      cooldownField: 'lastExplore',
      now
    })
    if (illegalResult.status !== 'success') {
      if (['failed', 'caught', 'protected'].includes(illegalResult.status)) {
        rpg.interstellarExplores = (Number(rpg.interstellarExplores) || 0) + 1
        await saveFailedRpgIllegalAction(db)
      }
      return m.reply(formatRpgIllegalResult(illegalResult))
    }
    illegalMultiplier = illegalResult.rewardMultiplier
  }
  if (!illegalText && remaining > 0) {
    return m.reply(`⏳ Interstellar Gateway sedang mengisi ulang. Coba lagi dalam *${Math.ceil(remaining / 60000)} menit*.`)
  }

  if (!rpg.inventory || typeof rpg.inventory !== 'object') rpg.inventory = {}
  const legendaryDiscovery = isRpgEventActive('legendary_discovery')
  const stellarBlessing = isRpgEventActive('stellar_blessing')
  const dimensionalRift = isRpgEventActive('dimensional_rift')
  const voidCorruption = isRpgEventActive('void_corruption')
  const cosmicTurbulence = isRpgEventActive('cosmic_turbulence')
  const difficultyDropRate = getDifficultyProfile(rpg).dropRate
  const failureChance = adjustDifficultyFailureChance(rpg, (voidCorruption ? 0.45 : 0) + (cosmicTurbulence ? 0.15 : 0))
  rpg.lastExplore = now
  rpg.interstellarExplores = (Number(rpg.interstellarExplores) || 0) + 1
  if (Math.random() < failureChance) {
    await saveDB(db)
    return m.reply(
      `╭─❏「 🌌 INTERSTELLAR 」❏\n` +
      `│ ☄️ *PENJELAJAHAN GAGAL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> Navigasi antarbintang terganggu; tidak ada item yang hilang dari inventory.\n` +
      `${illegalText ? `> ⚠️ Usaha ilegal: +1 poin kriminal (aktif ${illegalResult.activeCrimeScore}); tidak ada hasil tambahan.\n` : ''}` +
      `> ⏳ Cooldown: ${Math.ceil(cooldown / 60000)} menit\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  const tierMultipliers = {
    RARE: difficultyDropRate * (dimensionalRift ? 1.5 : 1) * (stellarBlessing ? 1.3 : 1) * rareBuff,
    EPIC: difficultyDropRate * (dimensionalRift ? 1.5 : 1) * (stellarBlessing ? 1.3 : 1) * rareBuff,
    LEGENDARY: difficultyDropRate * (dimensionalRift ? 1.5 : 1) * (legendaryDiscovery ? 1.5 : 1) * (stellarBlessing ? 1.3 : 1) * rareBuff,
    MYTHIC: difficultyDropRate * (dimensionalRift ? 1.5 : 1) * (legendaryDiscovery ? 1.5 : 1) * (stellarBlessing ? 1.3 : 1) * rareBuff
  }
  const items = [
    rollInterstellarCommonItem(),
    rollInterstellarCommonItem()
  ]
  const bonusRoll = Math.random()
  const bonusCount = (bonusRoll < 0.5 ? 0 : bonusRoll < 0.8 ? 1 : bonusRoll < 0.95 ? 2 : 3) +
    (Math.random() < Math.max(0, yieldBuff - 1) ? 1 : 0)
  for (let i = 0; i < bonusCount; i++) {
    items.push(rollInterstellarItem(Math.random, tierMultipliers))
  }
  let illegalExtraItems = 0
  if (illegalMultiplier > 1) {
    illegalExtraItems = Math.ceil(items.length * (illegalMultiplier - 1))
    for (let index = 0; index < illegalExtraItems; index++) items.push(rollInterstellarCommonItem())
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

  const tierOrder = ['TRASH', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'SECRET']
  const tierStars = {
    SECRET: { stars: '★★★★★★★', icon: '🔮' },
    MYTHIC: { stars: '★★★★★★☆', icon: '🌌' },
    LEGENDARY: { stars: '★★★★★☆☆', icon: '👑' },
    EPIC: { stars: '★★★★☆☆☆', icon: '💎' },
    RARE: { stars: '★★★☆☆☆☆', icon: '✨' },
    UNCOMMON: { stars: '★★☆☆☆☆☆', icon: '💙' },
    COMMON: { stars: '★☆☆☆☆☆☆', icon: '🤍' },
    TRASH: { stars: '☆☆☆☆☆☆☆', icon: '🗑️' }
  }
  const highestTier = foundItems.reduce((highest, { item }) =>
    tierOrder.indexOf(item.tier) > tierOrder.indexOf(highest) ? item.tier : highest,
  'TRASH')
  const caption =
    `╭─❏「 🚀 INTERSTELLAR 」❏\n` +
    `│ 💫 *PENJELAJAHAN PLANET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${tierStars[highestTier].stars} ${highestTier} ${tierStars[highestTier].icon}\n\n` +
    `🎒 *HASIL PENJELAJAHAN*\n` +
    `Kamu mengunjungi planet *${destination}* dan menemukan ${items.length} item:\n\n` +
    foundItems.map(({ item, quantity }) =>
      `> ↳ *${item.name}* ×${quantity}\n` +
      `> ↳ ${item.description}\n`
    ).join('') +
    `\n─━━━━━━━━━━━━━━─\n\n` +
    `📊 *STATUS PENJELAJAHAN*\n` +
    `> ↳ 🧭 Total penjelajahan: ${rpg.interstellarExplores}\n` +
    `${illegalText ? `> ↳ ⚠️ Menerobos gateway ilegal: +${illegalExtraItems} temuan tambahan | 💀 +1 poin kriminal (aktif ${illegalResult.activeCrimeScore})\n` : ''}` +
    `> ↳ ⏳ Cooldown: ${Math.ceil(cooldown / 60000)} menit\n\n` +
    `─━━━━━━━━━━━━━━─`
  const image = Math.random() < 0.5
    ? 'https://c.termai.cc/i143/rU2.jpg'
    : 'https://c.termai.cc/i123/9R4g.jpg'
  return sendRpgButtons(conn, {
    chat: m.chat,
    text: caption,
    title: '🚀 HASIL PENJELAJAHAN',
    subtitle: `Temuan di Planet ${destination} sudah tersimpan di tas`,
    thumbnailUrl: image,
    buttons: [['🎒 Lihat Hasil Jelajah', `${usedPrefix || '.'}invst`]],
    quoted: m,
    reply: fallbackText => m.reply(fallbackText)
  })
}

handler.help = ['explore']
handler.tags = ['rpg']
handler.command = /^(explore)$/i
handler.group = true

export default handler
