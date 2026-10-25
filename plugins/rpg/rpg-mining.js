import { addRpgMoney } from '../../lib/rpgMoney.js'
import { loadDB, saveDB, addRpgExp } from '../../lib/waifuHelper.js'
import { adjustAbilityDropChance, adjustDifficultyFailureChance, getDifficultyProfile, scaleDifficultyCooldown, scaleDifficultyIncome, scaleDifficultyXP } from '../../lib/rpgDifficulty.js'
import { applyBloodlineBuff, applyBloodlineYield, getBloodlineBuff, getBloodlineDrawback } from '../../lib/rpgCharacterData.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { sendRpgButtons } from '../../lib/rpgActionButtons.js'
import { getGroupTotemBuff } from '../../lib/rpg-totemData.js'

function formatNama(ore) {
  return ore.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export const oreEmoji = {
  'stone': '🪨', 'sand_stone': '🏜️', 'copper': '🟠', 'iron': '⛓️', 'tin': '📎', 'silver': '⚪',
  'gold': '✨', 'mushroomite': '🍄', 'platinum': '💿', 'bananite': '🍌', 'cardboardite': '📦',
  'poopite': '💩', 'fillium': '🧪', 'cobalt': '🔵', 'titanium': '⚙️', 'obsidian': '🖤',
  'rivalite': '⚔️', 'uranium': '☢️', 'lightite': '💡', 'demonite': '😈', 'darkryte': '🌑',
  'iore': '🔷', 'aite': '🔶', 'blue_crystal': '🔹', 'orange_crystal': '🧡', 'green_crystal': '💚',
  'purple_crystal': '🟣', 'red_crystal': '🔴', 'arcane_crystal': '🔮', 'grass': '🌱', 'graphite': '✏️',
  'aetherite': '👻', 'valtry': '🛡️', 'sanctis': '✨', 'snowite': '❄️', 'voidar': '🌌',
  'galaxy': '🌠', 'tungsten': '🔩', 'sulfur': '💛', 'pumice': '🫧', 'cuprite': '🔺',
  'massacerit': '🩸', 'ethereal_light': '👼'
}

export const miningOreKeys = Object.keys(oreEmoji)

let secret = ['ethereal_light'];
let mythic = ['arcane_crystal', 'voidar', 'galaxy', 'tungsten', 'massacerit'];
let legendary = ['orange_crystal', 'purple_crystal', 'red_crystal', 'aetherite', 'valtry', 'sanctis', 'snowite'];
let epic = ['uranium', 'lightite', 'demonite', 'darkryte', 'iore', 'aite', 'blue_crystal', 'green_crystal'];
let rare = ['platinum', 'cobalt', 'titanium', 'obsidian', 'rivalite', 'bananite', 'fillium'];
let uncommon = ['iron', 'silver', 'gold', 'mushroomite', 'cardboardite', 'poopite', 'cuprite'];
let common = ['stone', 'sand_stone', 'grass', 'graphite', 'pumice', 'sulfur', 'copper', 'tin'];

function getTier(nama){
  if(secret.includes(nama)) return {name:'SECRET', icon:'🔮'}
  if(mythic.includes(nama)) return {name:'MYTHIC', icon:'🌌'}
  if(legendary.includes(nama)) return {name:'LEGENDARY', icon:'👑'}
  if(epic.includes(nama)) return {name:'EPIC', icon:'💎'}
  if(rare.includes(nama)) return {name:'RARE', icon:'✨'}
  if(uncommon.includes(nama)) return {name:'UNCOMMON', icon:'💙'}
  return {name:'COMMON', icon:'🤍'}
}

function rollOre(hance, bonus, pickLvl, rareChanceFactor = 1){
  const cutoff = value => 100 - Math.min(100, Math.max(0, 100 - value) * rareChanceFactor)
  let bisaSecret = pickLvl >= 25
  let bisaMythic = pickLvl >= 20
  let bisaLegend = pickLvl >= 15
  let bisaEpic = pickLvl >= 10
  let bisaRare = pickLvl >= 5

  if (bisaSecret && hance > cutoff(99.99 - bonus)) return {ore: secret[Math.floor(Math.random() * secret.length)], tier: 'SECRET', exp: 5000}
  if (bisaMythic && hance > cutoff(99.9 - bonus)) return {ore: mythic[Math.floor(Math.random() * mythic.length)], tier: 'MYTHIC', exp: 1000}
  if (bisaLegend && hance > cutoff(99 - bonus)) return {ore: legendary[Math.floor(Math.random() * legendary.length)], tier: 'LEGENDARY', exp: 500}
  if (bisaEpic && hance > cutoff(96 - bonus)) return {ore: epic[Math.floor(Math.random() * epic.length)], tier: 'EPIC', exp: 250}
  if (bisaRare && hance > cutoff(88 - bonus)) return {ore: rare[Math.floor(Math.random() * rare.length)], tier: 'RARE', exp: 120}
  if (hance > 100 - Math.min(100, (100 - (65 - bonus)) * rareChanceFactor)) return {ore: uncommon[Math.floor(Math.random() * uncommon.length)], tier: 'UNCOMMON', exp: 50}
  return {ore: common[Math.floor(Math.random() * common.length)], tier: 'COMMON', exp: 15}
}

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik #adventure dulu.')
  if (!user.ores) user.ores = {}
  if (user.pity_mining!== undefined) delete user.pity_mining

  // COOLDOWN
  const mineralRush = isRpgEventActive('mineral_rush')
  const caveCollapse = isRpgEventActive('cave_collapse')
  const cooldownBuff = getGroupTotemBuff(wdb.data, m.chat, 'mining', 'cooldown')
  const rareBuff = getGroupTotemBuff(wdb.data, m.chat, 'mining', 'rareChance')
  const yieldBuff = getGroupTotemBuff(wdb.data, m.chat, 'mining', 'yield')
  const incomeBuff = getGroupTotemBuff(wdb.data, m.chat, 'mining', 'income')
  const xpBuff = getGroupTotemBuff(wdb.data, m.chat, 'mining', 'xp')
  const rareChanceFactor = (mineralRush ? 1.5 : 1) * (caveCollapse ? 0.75 : 1) * getDifficultyProfile(user).dropRate * rareBuff
  let cooldown = Math.floor(scaleDifficultyCooldown(user, 120000) * (caveCollapse ? 1.3 : 1) * cooldownBuff)
  if (Date.now() - (user.lastMining || 0) < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - user.lastMining)) / 1000)
    return m.reply(`╭─❏「 ⛏️ MINING 」❏\n│ ⏰ LELAH\n│ Tunggu ${sisa} detik lagi agar energimu pulih.\n╰─━━━━━━━━━━━━━━─`)
  }

  if (Math.random() < adjustDifficultyFailureChance(user, 0.1)) {
    user.lastMining = Date.now()
    await saveDB(wdb)
    return m.reply('⛏️ Terowongan runtuh sebelum sempat menambang. Aktivitas gagal; coba lagi setelah cooldown.')
  }

  let pickLvl = user.pickaxe || 0
  let bonus = Math.min(45, Math.min(pickLvl * 1.5, 30) + adjustAbilityDropChance(user, 0) * 100)
  const jumlahJenisDrop = Math.min(2 + Math.floor(Math.random() * 4), 5)

  let hasilTambang = { stone: 0 }
  let totalExp = 0
  let totalOreDidapat = 0
  let tierTertinggi = 'COMMON'

  const stoneQty = Math.floor(Math.random() * 2) + 1
  hasilTambang.stone = stoneQty
  totalOreDidapat += stoneQty
  totalExp += 15 * stoneQty
  const stoneTier = 'COMMON'
  const urutanTier = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'SECRET']
  if (urutanTier.indexOf(stoneTier) > urutanTier.indexOf(tierTertinggi)) tierTertinggi = stoneTier

  for (let i = 1; i < jumlahJenisDrop; i++) {
    let hance = Math.random() * 100
    let {ore, tier, exp} = rollOre(hance, bonus, pickLvl, rareChanceFactor)
    if (ore === 'stone') continue
    if (hasilTambang[ore]) continue

    let maxJumlah = Math.min(Math.floor(pickLvl / 15) + 2, 5)
    let jumlahPerOre = Math.floor(Math.random() * maxJumlah) + 1

    hasilTambang[ore] = jumlahPerOre
    totalExp += exp * jumlahPerOre
    totalOreDidapat += jumlahPerOre

    if (urutanTier.indexOf(tier) > urutanTier.indexOf(tierTertinggi)) tierTertinggi = tier
  }

  if (mineralRush && Math.random() < 0.25) {
    const { ore, tier, exp } = rollOre(Math.random() * 100, bonus, pickLvl, rareChanceFactor)
    const oreKey = ore === 'stone' ? rare[Math.floor(Math.random() * rare.length)] : ore
    hasilTambang[oreKey] = (hasilTambang[oreKey] || 0) + 1
    totalExp += ore === 'stone' ? 120 : exp
    const extraTier = ore === 'stone' ? 'RARE' : tier
    if (urutanTier.indexOf(extraTier) > urutanTier.indexOf(tierTertinggi)) tierTertinggi = extraTier
  }

  for (const ore of Object.keys(hasilTambang)) {
    hasilTambang[ore] = applyBloodlineYield(user, 'miningYield', hasilTambang[ore])
    hasilTambang[ore] = Math.floor(hasilTambang[ore] * yieldBuff)
    if (caveCollapse) hasilTambang[ore] = Math.max(1, Math.floor(hasilTambang[ore] * 0.7))
  }
  totalOreDidapat = Object.values(hasilTambang).reduce((sum, amount) => sum + amount, 0)

  // Simpan hasil
  for(let ore in hasilTambang){
    user.ores[ore] = (user.ores[ore] || 0) + hasilTambang[ore]
  }

  totalExp = Math.floor(applyBloodlineBuff(user, 'xp', scaleDifficultyXP(user, totalExp)) * xpBuff)
  let uangDidapat = Math.floor(scaleDifficultyIncome(user, (Math.floor(Math.random() * 3) + 1 + Math.floor(pickLvl / 2)) * totalOreDidapat) * incomeBuff)
  wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], uangDidapat)
  addRpgExp(user, totalExp)
  user.lastMining = Date.now()
  await saveDB(wdb)

  let tierData = {
    SECRET: { stars: '★★★★★★★', icon: '🔮' },
    MYTHIC: { stars: '★★★★★★☆', icon: '🌌' },
    LEGENDARY: { stars: '★★★★★☆☆', icon: '👑' },
    EPIC: { stars: '★★★★☆☆☆', icon: '💎' },
    RARE: { stars: '★★★☆☆☆☆', icon: '✨' },
    UNCOMMON: { stars: '★★☆☆☆☆☆', icon: '💙' },
    COMMON: { stars: '★☆☆☆☆☆☆', icon: '🤍' }
  }

  let caption = `╭─❏「 ⛏️ *AVELIA CAVE* 」❏\n`
  caption += `│ ⛏️ *HASIL TAMBANG*\n`
  caption += `╰─━━━━━━━━━━━━━━─\n\n`
  caption += `> ↳ ${tierData[tierTertinggi].stars} ${tierTertinggi} ${tierData[tierTertinggi].icon}\n\n`

caption += `📦 *HASIL GALIAN*\n`
for(let ore in hasilTambang){
  caption += `> ↳ ${formatNama(ore)} ×${hasilTambang[ore].toLocaleString()}\n`
}

caption += `\n─━━━━━━━━━━━━━━─\n\n`

caption += `✨ *HASIL PENGALAMAN*\n`
caption += `> ↳ ✨ Total XP: +${totalExp.toLocaleString()}\n`
caption += `> ↳ 💰 Uang: +Rp ${uangDidapat.toLocaleString()}\n`
caption += `> ↳ ⛏️ Level Pickaxe: Lv.${pickLvl}\n`
if(bonus > 0) caption += `> ↳ 🍀 Bonus Pick: +${bonus.toFixed(1)}%\n`
const miningYieldEffect = getBloodlineBuff(user, 'miningYield') - getBloodlineDrawback(user).miningYieldPenalty
if(miningYieldEffect !== 0) caption += `> ↳ 🧬 Efek Bloodline: hasil ore ${miningYieldEffect > 0 ? '+' : ''}${(miningYieldEffect * 100).toFixed(0)}%\n`
if(pickLvl < 25) caption += `> ↳ 🔮 Upgrade pickaxe untuk hasil secret\n`
caption += `\n─━━━━━━━━━━━━━━─`

return sendRpgButtons(conn, {
  chat: m.chat,
  text: caption,
  title: '⛏️ HASIL TAMBANG',
  subtitle: 'Semua ore sudah tersimpan di tasmu',
  thumbnailUrl: 'https://c.termai.cc/i140/srjE7x6',
  buttons: [['🎒 Buka Tas', `${usedPrefix || '.'}bag`]],
  quoted: m,
  reply: fallbackText => m.reply(fallbackText)
})
}

handler.help = ['mining', 'tambang']
handler.tags = ['rpg']
handler.command = /^(mining|tambang)$/i
handler.group = true
export default handler