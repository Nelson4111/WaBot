import { addRpgMoney } from '../../lib/rpgMoney.js'
import { addRpgExp, getUserRPG, loadDB, saveDB } from '../../lib/waifuHelper.js'
import { adjustDifficultyFailureChance, getDifficultyProfile, scaleDifficultyCooldown, scaleDifficultyIncome, scaleDifficultyXP } from '../../lib/rpgDifficulty.js'
import { applyBloodlineBuff } from '../../lib/rpgCharacterData.js'
import { sendRpgButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { getGroupTotemBuff } from '../../lib/rpg-totemData.js'
import { attemptRpgIllegalAction, formatRpgIllegalResult, saveFailedRpgIllegalAction } from '../../lib/rpgIlegal.js'

const COOLDOWN = 2 * 60 * 1000
const TIERS = ['TRASH', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'SECRET']
const TIER_INFO = {
  TRASH: { icon: '🗑️', stars: '☆☆☆☆☆☆☆', exp: 5 },
  COMMON: { icon: '🤍', stars: '★☆☆☆☆☆☆', exp: 15 },
  UNCOMMON: { icon: '💙', stars: '★★☆☆☆☆☆', exp: 50 },
  RARE: { icon: '✨', stars: '★★★☆☆☆☆', exp: 120 },
  EPIC: { icon: '💎', stars: '★★★★☆☆☆', exp: 250 },
  LEGENDARY: { icon: '👑', stars: '★★★★★☆☆', exp: 500 },
  MYTHIC: { icon: '🌌', stars: '★★★★★★☆', exp: 1000 },
  SECRET: { icon: '🔮', stars: '★★★★★★★', exp: 5000 }
}

const LOOT = {
  COMMON: [
    { id: 'ranting_kering', name: 'Ranting Kering', emoji: '🍂' },
    { id: 'getah_pohon', name: 'Getah Pohon', emoji: '🟤' },
    { id: 'kayu', name: 'Kayu', emoji: '🪵', coreWood: true }
  ],
  UNCOMMON: [
    { id: 'kayu_keras', name: 'Kayu Keras', emoji: '🪵' },
    { id: 'biji_pohon', name: 'Biji Pohon', emoji: '🌰' },
    { id: 'jamur_hutan', name: 'Jamur Hutan', emoji: '🍄' }
  ],
  RARE: [
    { id: 'kayu_berurat', name: 'Kayu Berurat', emoji: '🪵' },
    { id: 'resin_emas', name: 'Resin Emas', emoji: '🟡' },
    { id: 'bunga_purba', name: 'Bunga Purba', emoji: '🌺' }
  ],
  EPIC: [
    { id: 'kayu_elf', name: 'Kayu Elf', emoji: '🌳' },
    { id: 'amber_hutan', name: 'Amber Hutan', emoji: '🟠' },
    { id: 'akar_bercahaya', name: 'Akar Bercahaya', emoji: '✨' }
  ],
  LEGENDARY: [
    { id: 'kayu_dunia', name: 'Kayu Dunia', emoji: '🌲' },
    { id: 'jantung_hutan', name: 'Jantung Hutan', emoji: '💚' }
  ],
  MYTHIC: [
    { id: 'kayu_kehidupan', name: 'Kayu Kehidupan', emoji: '🌟' },
    { id: 'benih_keabadian', name: 'Benih Keabadian', emoji: '🌱' }
  ],
  SECRET: [
    { id: 'kayu_kosmos', name: 'Kayu Kosmos', emoji: '🌌' }
  ]
}

function rollLoot(user, dropRate, rareBuff) {
  const level = Math.max(1, Number(user.level) || 1)
  const bonus = Math.min(45, level * 1.5)
  const threshold = value => 100 - ((100 - value) * dropRate * rareBuff)
  const roll = Math.random() * 100
  const pick = tier => ({ ...LOOT[tier][Math.floor(Math.random() * LOOT[tier].length)], tier })
  if (level >= 25 && roll > threshold(99.999 - bonus * 0.001)) return pick('SECRET')
  if (level >= 20 && roll > threshold(99.99 - bonus * 0.002)) return pick('MYTHIC')
  if (level >= 15 && roll > threshold(99.9 - bonus * 0.004)) return pick('LEGENDARY')
  if (level >= 10 && roll > threshold(99 - bonus * 0.01)) return pick('EPIC')
  if (level >= 5 && roll > threshold(92 - bonus * 0.02)) return pick('RARE')
  if (level >= 1 && roll > threshold(67 - bonus * 0.04)) return pick('UNCOMMON')
  return { ...LOOT.COMMON[Math.floor(Math.random() * LOOT.COMMON.length)], tier: 'COMMON' }
}

const handler = async (m, { conn, text, usedPrefix }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const user = account.rpg
  const now = Date.now()
  const illegalText = String(text || '').trim().toLowerCase()
  let illegalMultiplier = 1
  let illegalResult = null
  if (illegalText && illegalText !== 'ilegal') {
    return m.reply(`Gunakan *${usedPrefix || '.'}logging ilegal* untuk mencoba usaha ilegal logging.`)
  }
  const cooldown = Math.floor(
    scaleDifficultyCooldown(user, COOLDOWN) *
    getGroupTotemBuff(db.data, m.chat, 'mining', 'cooldown')
  )
  if (illegalText) {
    illegalResult = attemptRpgIllegalAction({
      db,
      jid: m.sender,
      user,
      activity: 'logging',
      cooldownDuration: cooldown,
      cooldownField: 'lastLogging',
      now
    })
    if (illegalResult.status !== 'success') {
      if (['failed', 'caught', 'protected'].includes(illegalResult.status)) await saveFailedRpgIllegalAction(db)
      return m.reply(formatRpgIllegalResult(illegalResult))
    }
    illegalMultiplier = illegalResult.rewardMultiplier
  }
  const remaining = cooldown - (now - (Number(user.lastLogging) || 0))
  if (!illegalText && remaining > 0) {
    return m.reply(`╭─❏「 🪓 LOGGING 」❏\n│ ⏳ Istirahat dulu selama ${Math.ceil(remaining / 1000)} detik.\n╰─━━━━━━━━━━━━━━─`)
  }

  if (!illegalText) user.lastLogging = now
  user.loggingCount = (Number(user.loggingCount) || 0) + 1
  if (!illegalText && Math.random() < adjustDifficultyFailureChance(user, 0.1)) {
    await saveDB(db)
    return m.reply('🌲 Pohon terlalu keras untuk ditebang kali ini. Aktivitas gagal; coba lagi setelah cooldown.')
  }

  const dropRate = getDifficultyProfile(user).dropRate
  const rareBuff = getGroupTotemBuff(db.data, m.chat, 'mining', 'rareChance')
  const loot = [
    { ...LOOT.COMMON[2], tier: 'COMMON' },
    { ...LOOT.COMMON[2], tier: 'COMMON' }
  ]
  const extraCount = 1 + Math.floor(Math.random() * 3)
  for (let index = 0; index < extraCount; index++) loot.push(rollLoot(user, dropRate, rareBuff))

  const yieldBuff = getGroupTotemBuff(db.data, m.chat, 'mining', 'yield') * illegalMultiplier
  const counts = new Map()
  for (const item of loot) counts.set(item.id, (counts.get(item.id) || 0) + 1)
  if (!user.inventory || typeof user.inventory !== 'object') user.inventory = {}

  let totalWood = 0
  for (const [itemId, quantity] of counts) {
    const item = loot.find(drop => drop.id === itemId)
    const amount = Math.max(1, Math.floor(quantity * yieldBuff))
    if (item.coreWood) totalWood += amount
    else user.inventory[itemId] = (Number(user.inventory[itemId]) || 0) + amount
  }
  user.wood = (Number(user.wood) || 0) + totalWood

  const highestTier = loot.reduce((highest, item) =>
    TIERS.indexOf(item.tier) > TIERS.indexOf(highest) ? item.tier : highest, 'TRASH')
  const baseExp = loot.reduce((total, item) => total + TIER_INFO[item.tier].exp, 0)
  const xp = Math.floor(
    applyBloodlineBuff(user, 'xp', scaleDifficultyXP(user, baseExp)) *
    illegalMultiplier *
    getGroupTotemBuff(db.data, m.chat, 'mining', 'xp')
  )
  addRpgExp(user, xp)
  const income = Math.floor(
    scaleDifficultyIncome(user, 400 + loot.length * 200) *
    illegalMultiplier *
    getGroupTotemBuff(db.data, m.chat, 'mining', 'income')
  )
  db.money[m.sender] = addRpgMoney(db.money[m.sender], income)
  await saveDB(db)

  const caption =
    `╭─❏「 🪓 PENEBANGAN 」❏\n` +
    `│ 🌲 *HASIL LOGGING*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${TIER_INFO[highestTier].stars} ${highestTier} ${TIER_INFO[highestTier].icon}\n\n` +
    `📦 *HASIL HUTAN*\n` +
    [...counts].map(([id, quantity]) => {
      const item = loot.find(drop => drop.id === id)
      const amount = Math.max(1, Math.floor(quantity * yieldBuff))
      return `> ↳ ${item.emoji} ${item.name} ×${amount}\n`
    }).join('') +
    `\n✨ *HASIL RPG*\n` +
    `> ↳ ✨ EXP: +${xp.toLocaleString()}\n` +
    `> ↳ 💰 Uang: +Rp ${income.toLocaleString()}\n` +
    `${illegalText ? `> ↳ ⚠️ Usaha ilegal (pembalakan liar/bakar hutan): hasil ×${illegalMultiplier} | 💀 +1 poin kriminal (aktif ${illegalResult.activeCrimeScore})\n` : ''}` +
    `> ↳ 🪓 Total penebangan: ${user.loggingCount}\n` +
    `> ↳ ⏳ Cooldown: ${Math.ceil(cooldown / 1000)} detik\n\n` +
    `─━━━━━━━━━━━━━━─`

  return sendRpgButtons(conn, {
    chat: m.chat,
    text: caption,
    title: '🪓 HASIL LOGGING',
    subtitle: 'Kayu dan material sudah masuk ke tasmu',
    thumbnailUrl: 'https://c.termai.cc/i181/UTTbZ.jpg',
    buttons: [['🎒 Buka Tas', `${usedPrefix || '.'}bag`]],
    quoted: m,
    reply: fallbackText => m.reply(fallbackText)
  })
}

handler.help = ['logging', 'nebang']
handler.tags = ['rpg']
handler.command = /^(logging|nebang)$/i
handler.group = true

export default handler
