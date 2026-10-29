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
    { id: 'kerang', name: 'Kerang Laut', emoji: '🐚' },
    { id: 'rumput_laut', name: 'Rumput Laut', emoji: '🌿' },
    { id: 'batu_karang', name: 'Batu Karang', emoji: '🪸' }
  ],
  UNCOMMON: [
    { id: 'mutiara_biasa', name: 'Mutiara Biasa', emoji: '⚪' },
    { id: 'bintang_laut', name: 'Bintang Laut', emoji: '⭐' },
    { id: 'koin_kuno', name: 'Koin Kuno', emoji: '🪙' }
  ],
  RARE: [
    { id: 'mutiara', name: 'Mutiara', emoji: '🫧' },
    { id: 'karang_antik', name: 'Karang Antik', emoji: '🪸' },
    { id: 'peti_kayu', name: 'Peti Tenggelam', emoji: '🪵' }
  ],
  EPIC: [
    { id: 'mutiara_hitam', name: 'Mutiara Hitam', emoji: '⚫' },
    { id: 'relik_laut', name: 'Relik Laut', emoji: '🏺' },
    { id: 'trisula_patah', name: 'Pecahan Trisula', emoji: '🔱' }
  ],
  LEGENDARY: [
    { id: 'mahkota_karang', name: 'Mahkota Karang', emoji: '👑' },
    { id: 'air_mata_putri', name: 'Air Mata Putri Laut', emoji: '💧' }
  ],
  MYTHIC: [
    { id: 'jantung_leviathan', name: 'Jantung Leviathan', emoji: '🐉' },
    { id: 'mutiara_raja', name: 'Mutiara Raja', emoji: '🌟' }
  ],
  SECRET: [
    { id: 'inti_palung', name: 'Inti Palung', emoji: '🌌' }
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

function formatName(value) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
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
    return m.reply(`Gunakan *${usedPrefix || '.'}diving ilegal* untuk mencoba usaha ilegal diving.`)
  }
  const cooldown = Math.floor(
    scaleDifficultyCooldown(user, COOLDOWN) *
    getGroupTotemBuff(db.data, m.chat, 'fishing', 'cooldown')
  )
  if (illegalText) {
    illegalResult = attemptRpgIllegalAction({
      db,
      jid: m.sender,
      user,
      activity: 'diving',
      cooldownDuration: cooldown,
      cooldownField: 'lastDiving',
      now
    })
    if (illegalResult.status !== 'success') {
      if (['failed', 'caught', 'protected'].includes(illegalResult.status)) await saveFailedRpgIllegalAction(db)
      return m.reply(formatRpgIllegalResult(illegalResult))
    }
    illegalMultiplier = illegalResult.rewardMultiplier
  }
  const remaining = cooldown - (now - (Number(user.lastDiving) || 0))
  if (!illegalText && remaining > 0) {
    return m.reply(`╭─❏「 🤿 DIVING 」❏\n│ ⏳ Istirahat dulu selama ${Math.ceil(remaining / 1000)} detik.\n╰─━━━━━━━━━━━━━━─`)
  }

  user.lastDiving = now
  user.divingCount = (Number(user.divingCount) || 0) + 1
  if (!illegalText && Math.random() < adjustDifficultyFailureChance(user, 0.1)) {
    await saveDB(db)
    return m.reply('🌊 Arus bawah laut terlalu kuat. Penyelaman gagal; coba lagi setelah cooldown.')
  }

  const dropRate = getDifficultyProfile(user).dropRate
  const rareBuff = getGroupTotemBuff(db.data, m.chat, 'fishing', 'rareChance')
  const loot = [
    { ...LOOT.COMMON[Math.floor(Math.random() * LOOT.COMMON.length)], tier: 'COMMON' },
    { ...LOOT.COMMON[Math.floor(Math.random() * LOOT.COMMON.length)], tier: 'COMMON' }
  ]
  const extraCount = 1 + Math.floor(Math.random() * 3)
  for (let index = 0; index < extraCount; index++) loot.push(rollLoot(user, dropRate, rareBuff))

  const yieldMultiplier = getGroupTotemBuff(db.data, m.chat, 'fishing', 'yield') * illegalMultiplier
  const counts = new Map()
  for (const item of loot) counts.set(item.id, (counts.get(item.id) || 0) + 1)
  if (!user.inventory || typeof user.inventory !== 'object') user.inventory = {}
  for (const [itemId, quantity] of counts) {
    user.inventory[itemId] = (Number(user.inventory[itemId]) || 0) + Math.max(1, Math.floor(quantity * yieldMultiplier))
  }

  const highestTier = loot.reduce((highest, item) =>
    TIERS.indexOf(item.tier) > TIERS.indexOf(highest) ? item.tier : highest, 'TRASH')
  const baseExp = loot.reduce((total, item) => total + TIER_INFO[item.tier].exp, 0)
  const xp = Math.floor(
    applyBloodlineBuff(user, 'xp', scaleDifficultyXP(user, baseExp)) *
    illegalMultiplier *
    getGroupTotemBuff(db.data, m.chat, 'fishing', 'xp')
  )
  addRpgExp(user, xp)
  const income = Math.floor(
    scaleDifficultyIncome(user, 500 + loot.length * 250) *
    illegalMultiplier *
    getGroupTotemBuff(db.data, m.chat, 'fishing', 'income')
  )
  db.money[m.sender] = addRpgMoney(db.money[m.sender], income)
  await saveDB(db)

  const caption =
    `╭─❏「 🤿 PENYELAMAN 」❏\n` +
    `│ 🌊 *HASIL DIVING*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${TIER_INFO[highestTier].stars} ${highestTier} ${TIER_INFO[highestTier].icon}\n\n` +
    `📦 *HARTA BAWAH LAUT*\n` +
    [...counts].map(([id, quantity]) => {
      const item = loot.find(drop => drop.id === id)
      const amount = Math.max(1, Math.floor(quantity * yieldMultiplier))
      return `> ↳ ${item.emoji} ${item.name} ×${amount}\n`
    }).join('') +
    `\n✨ *HASIL RPG*\n` +
    `> ↳ ✨ EXP: +${xp.toLocaleString()}\n` +
    `> ↳ 💰 Uang: +Rp ${income.toLocaleString()}\n` +
    `${illegalText ? `> ↳ ⚠️ Usaha ilegal (peledakan bawah laut): hasil ×${illegalMultiplier} | 💀 +1 poin kriminal (aktif ${illegalResult.activeCrimeScore})\n` : ''}` +
    `> ↳ 🤿 Total penyelaman: ${user.divingCount}\n` +
    `> ↳ ⏳ Cooldown: ${Math.ceil(cooldown / 1000)} detik\n\n` +
    `─━━━━━━━━━━━━━━─`

  return sendRpgButtons(conn, {
    chat: m.chat,
    text: caption,
    title: '🤿 HASIL DIVING',
    subtitle: 'Temuan laut sudah tersimpan di inventory',
    thumbnailUrl: 'https://c.termai.cc/i123/9R4g.jpg',
    buttons: [['🎒 Buka Tas', `${usedPrefix || '.'}bag`]],
    quoted: m,
    reply: fallbackText => m.reply(fallbackText)
  })
}

handler.help = ['diving', 'nyelam']
handler.tags = ['rpg']
handler.command = /^(diving|nyelam)$/i
handler.group = true

export default handler
