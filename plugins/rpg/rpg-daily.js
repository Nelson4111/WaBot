import { getUserRPG, loadDB, saveDB } from '../../lib/waifuHelper.js'
import { getDifficultyProfile, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { getEvonexusAbilityModifiers } from '../../lib/rpg-evonexusData.js'
import { claimPremiumDailyLimit, getJakartaDate } from '../../lib/userLimit.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import { INTERSTELLAR_ITEM_BY_ID } from '../../lib/rpg-exploreData.js'
import { normalizeFishKey, RPG_FISH_TIERS } from '../../lib/rpg-fishCatalog.js'
import { isPremiumAccount, PREMIUM_DAILY_MIN_DONATION, PREMIUM_DAILY_REWARD } from '../../lib/rpgPremium.js'
import { sendRpgButtons } from '../../lib/rpgActionButtons.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'
import { filterRpgPanelUsers, isValidRpgUserId } from '../../lib/rpgLeaderboard.js'
import { addRpgMoney, compareRpgMoney, formatRpgMoney, multiplyRpgMoney, normalizeRpgMoney, subtractRpgMoney } from '../../lib/rpgMoney.js'
import { getHasilDisplay, hewanList } from '../../lib/rpg-libternakData.js'
import { bibit } from './rpg-panen.js'

const DAILY_ITEM_QUALITY = {
  daily: ['COMMON', 'UNCOMMON'],
  weekly: ['RARE', 'EPIC'],
  monthly: ['LEGENDARY', 'MYTHIC', 'SECRET']
}

const DAILY_MINING_ITEMS = {
  COMMON: ['stone', 'sand_stone', 'copper', 'tin'],
  UNCOMMON: ['iron', 'silver', 'gold', 'cuprite'],
  RARE: ['platinum', 'cobalt', 'titanium', 'obsidian', 'rivalite', 'bananite'],
  EPIC: ['uranium', 'lightite', 'demonite', 'darkryte', 'iore', 'aite', 'blue_crystal'],
  LEGENDARY: ['orange_crystal', 'purple_crystal', 'red_crystal', 'aetherite', 'valtry', 'sanctis'],
  MYTHIC: ['arcane_crystal', 'voidar', 'galaxy', 'tungsten', 'massacerit'],
  SECRET: ['ethereal_light']
}

const DAILY_ADVENTURE_ITEMS = {
  COMMON: ['kayu', 'koin_tembaga', 'ramuan_kecil', 'tali'],
  UNCOMMON: ['koin_perak', 'ramuan_sedang', 'belati_karat', 'perisai_kayu'],
  RARE: ['diamond', 'koin_emas', 'ramuan_besar', 'pedang_baja', 'armor_kulit'],
  EPIC: ['permata_biru', 'permata_merah', 'permata_hijau', 'peta_harta'],
  LEGENDARY: ['pedang_legendaris', 'buku_sihir_kuno', 'armor_naga', 'mahkota_raja'],
  MYTHIC: ['air_mata_dewi', 'pecahan_bintang', 'pulsar_heart'],
  SECRET: ['segel_dewa', 'jiwa_abadi']
}

const DAILY_DIVING_ITEMS = {
  COMMON: ['kerang', 'rumput_laut', 'batu_karang'],
  UNCOMMON: ['mutiara_biasa', 'bintang_laut', 'koin_kuno'],
  RARE: ['mutiara', 'karang_antik', 'peti_kayu'],
  EPIC: ['mutiara_hitam', 'relik_laut', 'trisula_patah'],
  LEGENDARY: ['mahkota_karang', 'air_mata_putri'],
  MYTHIC: ['jantung_leviathan', 'mutiara_raja'],
  SECRET: ['inti_palung']
}

const DAILY_LOGGING_ITEMS = {
  COMMON: ['ranting_kering', 'getah_pohon', 'kayu'],
  UNCOMMON: ['kayu_keras', 'biji_pohon', 'jamur_hutan'],
  RARE: ['kayu_berurat', 'resin_emas', 'bunga_purba'],
  EPIC: ['kayu_elf', 'amber_hutan', 'akar_bercahaya'],
  LEGENDARY: ['kayu_dunia', 'jantung_hutan'],
  MYTHIC: ['kayu_kehidupan', 'benih_keabadian'],
  SECRET: ['kayu_kosmos']
}

const DAILY_DUNGEON_ITEMS = {
  COMMON: ['gold'],
  UNCOMMON: ['gold'],
  RARE: ['diamond'],
  EPIC: ['diamond'],
  LEGENDARY: ['diamond'],
  MYTHIC: ['diamond'],
  SECRET: ['diamond']
}

const FARMING_QUALITY_BY_PRICE = [
  { max: 10000, tier: 'COMMON' },
  { max: 15000, tier: 'UNCOMMON' },
  { max: 22000, tier: 'RARE' },
  { max: 50000, tier: 'EPIC' },
  { max: 100000, tier: 'LEGENDARY' },
  { max: 200000, tier: 'MYTHIC' },
  { max: Infinity, tier: 'SECRET' }
]

const LIVESTOCK_QUALITY_BY_PRICE = [
  { max: 100000, tier: 'COMMON' },
  { max: 250000, tier: 'UNCOMMON' },
  { max: 500000, tier: 'RARE' },
  { max: 1000000, tier: 'EPIC' },
  { max: 3000000, tier: 'LEGENDARY' },
  { max: 6000000, tier: 'MYTHIC' },
  { max: Infinity, tier: 'SECRET' }
]

function getActivityItemPools(entries, priceTiers) {
  return entries.reduce((pools, { item, price }) => {
    const tier = priceTiers.find(({ max }) => price <= max)?.tier
    if (!tier || !item) return pools
    if (!pools[tier]) pools[tier] = []
    pools[tier].push(item)
    return pools
  }, {})
}

const DAILY_FARMING_ITEMS = getActivityItemPools(
  Object.values(bibit)
    .filter(seed => seed.hasil?.item && !['money', 'exp'].includes(seed.hasil.item))
    .map(seed => ({ item: seed.hasil.item, price: Number(seed.harga) || 0 })),
  FARMING_QUALITY_BY_PRICE
)

const livestockItems = new Map()
for (const animal of Object.values(hewanList)) {
  for (const result of [animal.hasil, animal.hasilTelur, animal.hasilDaging]) {
    if (!result) continue
    const item = getHasilDisplay(result).key
    const price = Number(animal.hargaBibit) || 0
    if (price > (livestockItems.get(item)?.price || 0)) livestockItems.set(item, { item, price })
  }
}
const DAILY_LIVESTOCK_ITEMS = getActivityItemPools(
  [...livestockItems.values()],
  LIVESTOCK_QUALITY_BY_PRICE
)

function randomItem(items) {
  return items.length ? items[Math.floor(Math.random() * items.length)] : null
}

function pickTieredItem(pools, tiers) {
  const available = tiers.flatMap(tier => pools[tier] || [])
  return randomItem(available)
}

function formatDailyItemName(itemId) {
  const name = String(itemId || '').replace(/^ikan_/, 'ikan ').replace(/_/g, ' ')
  return name.replace(/\b\w/g, character => character.toUpperCase())
}

function getDailyStreakRanking(wdb, conn) {
  return filterLeaderboardUsers(
    filterRpgPanelUsers(Object.entries(wdb.users || {}), ([jid]) => jid),
    conn,
    ([jid]) => jid
  )
    .filter(([jid]) => isValidRpgUserId(jid))
    .map(([jid, player]) => ({
      jid,
      streak: Number(player.dailyStreak ?? player.rpg?.dailyStreak) || 0
    }))
    .filter(player => player.streak > 0)
    .sort((a, b) => b.streak - a.streak)
}

function getDailyRewardItem(rpgUser, rewardQuality) {
  const qualityTiers = DAILY_ITEM_QUALITY[rewardQuality]
  const fishPools = Object.fromEntries(
    RPG_FISH_TIERS.map(({ name, fish }) => [name, fish])
  )
  const fish = pickTieredItem(fishPools, qualityTiers)
  const ore = pickTieredItem(DAILY_MINING_ITEMS, qualityTiers)
  const adventureItem = pickTieredItem(DAILY_ADVENTURE_ITEMS, qualityTiers)
  const divingItem = pickTieredItem(DAILY_DIVING_ITEMS, qualityTiers)
  const loggingItem = pickTieredItem(DAILY_LOGGING_ITEMS, qualityTiers)
  const farmingItem = pickTieredItem(DAILY_FARMING_ITEMS, qualityTiers)
  const livestockItem = pickTieredItem(DAILY_LIVESTOCK_ITEMS, qualityTiers)
  const dungeonItem = pickTieredItem(DAILY_DUNGEON_ITEMS, qualityTiers)
  const foundItems = []

  if (!rpgUser.ikan || typeof rpgUser.ikan !== 'object') rpgUser.ikan = {}
  const fishKey = normalizeFishKey(fish)
  rpgUser.ikan[fishKey] = (Number(rpgUser.ikan[fishKey]) || 0) + 1
  foundItems.push(fishKey)

  if (!rpgUser.ores || typeof rpgUser.ores !== 'object') rpgUser.ores = {}
  rpgUser.ores[ore] = (Number(rpgUser.ores[ore]) || 0) + 1
  foundItems.push(ore)

  if (!rpgUser.inventory || typeof rpgUser.inventory !== 'object') rpgUser.inventory = {}
  rpgUser.inventory[adventureItem] = (Number(rpgUser.inventory[adventureItem]) || 0) + 1
  if (adventureItem === 'kayu') rpgUser.wood = (Number(rpgUser.wood) || 0) + 1
  if (adventureItem === 'iron') rpgUser.iron = (Number(rpgUser.iron) || 0) + 1
  if (adventureItem === 'diamond') rpgUser.diamond = (Number(rpgUser.diamond) || 0) + 1
  foundItems.push(adventureItem)

  rpgUser.inventory[divingItem] = (Number(rpgUser.inventory[divingItem]) || 0) + 1
  foundItems.push(divingItem)

  if (loggingItem === 'kayu') {
    rpgUser.wood = (Number(rpgUser.wood) || 0) + 1
  } else {
    rpgUser.inventory[loggingItem] = (Number(rpgUser.inventory[loggingItem]) || 0) + 1
  }
  foundItems.push(loggingItem)

  rpgUser.inventory[farmingItem] = (Number(rpgUser.inventory[farmingItem]) || 0) + 1
  foundItems.push(farmingItem)

  rpgUser.inventory[livestockItem] = (Number(rpgUser.inventory[livestockItem]) || 0) + 1
  foundItems.push(livestockItem)

  if (dungeonItem === 'gold') {
    rpgUser.gold = (Number(rpgUser.gold) || 0) + 1
  } else {
    rpgUser.diamond = (Number(rpgUser.diamond) || 0) + 1
  }
  foundItems.push(dungeonItem)

  const bankTier = BANK_TIERS[Number(rpgUser.bankTier)]
  if (bankTier?.fasilitas?.includes('Interstellar Gateway')) {
    const explorePools = {}
    for (const item of INTERSTELLAR_ITEM_BY_ID.values()) {
      if (!explorePools[item.tier]) explorePools[item.tier] = []
      explorePools[item.tier].push(item.id)
    }
    const exploreItem = pickTieredItem(explorePools, qualityTiers)
    if (exploreItem) {
      rpgUser.inventory[exploreItem] = (Number(rpgUser.inventory[exploreItem]) || 0) + 1
      foundItems.push(exploreItem)
    }
  }

  return foundItems
}

function getDailyRewardBreakdown(rpgUser, balanceValue) {
  const balance = normalizeRpgMoney(balanceValue)
  const balanceBasedReward = compareRpgMoney(balance, 500000) >= 0
    ? multiplyRpgMoney(balance, 0.02)
    : 0
  const base = compareRpgMoney(balanceBasedReward, 50000) > 0
    ? balanceBasedReward
    : 50000
  const difficultyRewardRaw = multiplyRpgMoney(base, getDifficultyProfile(rpgUser).income)
  const difficultyReward = compareRpgMoney(difficultyRewardRaw, base) > 0
    ? difficultyRewardRaw
    : base
  const difficultyBonus = subtractRpgMoney(difficultyReward, base)
  const total = multiplyRpgMoney(
    difficultyReward,
    1 + getEvonexusAbilityModifiers(rpgUser).income
  )

  return {
    base,
    difficultyBonus,
    abilityBonus: subtractRpgMoney(total, difficultyReward),
    total
  }
}

let handler = async (m, { conn, groupMetadata, usedPrefix, text = '' }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}

  let senderKey = m.sender || ''
  if (senderKey.endsWith('@lid')) {
    const cleanLid = senderKey.split(':')[0].replace(/@.+/, '') + '@lid'
    senderKey = (global.lids?.[senderKey] || global.lids?.[cleanLid] || global.db?.data?.lids?.[senderKey] || global.db?.data?.lids?.[cleanLid] || senderKey)
  }
  if (senderKey.includes('@s.whatsapp.net')) {
    senderKey = senderKey.split('@')[0].split(':')[0] + '@s.whatsapp.net'
  }

  if (!wdb.users[senderKey]) wdb.users[senderKey] = {}
  if (!wdb.money) wdb.money = {}

  let user = wdb.users[senderKey]
  const now = Date.now()
  const today = getJakartaDate(now)
  let rpgUser = user.rpg || user

  user.dailyStreak ??= rpgUser.dailyStreak
  user.dailyDate ??= rpgUser.dailyDate
  user.lastDaily ??= rpgUser.lastDaily
  user.dailyBrokenStreak ??= rpgUser.dailyBrokenStreak
  user.dailyRestreakOfferDate ??= rpgUser.dailyRestreakOfferDate
  user.dailyRestreakDate ??= rpgUser.dailyRestreakDate

  const subcommand = String(text).trim().toLowerCase()
  if (subcommand === 'top') {
    const rankedUsers = getDailyStreakRanking(wdb, conn).slice(0, 10)

    const entries = rankedUsers.length
      ? rankedUsers.map((player, index) => {
        const identity = getLeaderboardUserIdentity(player.jid, {
          conn,
          groupMetadata,
          name: conn?.getName?.(player.jid)
        })
        return `🏆 *${index + 1}. ${identity.display}*\n` +
          `> ↳ 🔥 Streak: ${player.streak} hari`
      }).join('\n\n')
      : 'Belum ada pemain dengan streak daily.'

    return m.reply(
      `╭─❏「 🏆 DAILY STREAK TOP 」❏\n` +
      `│ 🔥 *TOP 10 STREAK DAILY*\n` +
      `╰─━━━━━━━━━━━━━━─\n` +
      `> Rank 1–5 mendapat bonus 5% saldo saat klaim daily.\n\n` +
      `${entries}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (['status', 'cek', 'check'].includes(subcommand)) {
    const lastDaily = Number(user.lastDaily || rpgUser.lastDaily) || 0
    const claimedToday = lastDaily > 0 && getJakartaDate(lastDaily) === today
    const currentStreak = Math.max(0, Number(user.dailyStreak ?? rpgUser.dailyStreak) || 0)
    const bestStreak = Math.max(
      currentStreak,
      Number(user.dailyBestStreak) || 0,
      Number(rpgUser.dailyBestStreak) || 0,
      Number(user.dailyBrokenStreak) || 0,
      Number(rpgUser.dailyBrokenStreak) || 0
    )

    const claimInfo = claimedToday
      ? '> Daily sudah diklaim hari ini.'
      : `> Klaim daily sebelum hari berganti dengan *${usedPrefix || '.'}daily*.`
    return m.reply(
      `╭─❏「 📅 STATUS DAILY 」❏\n` +
      `│ 🎁 Klaim hari ini: *${claimedToday ? 'Sudah' : 'Belum'}*\n` +
      `│ 🔥 Streak saat ini: *${currentStreak} hari*\n` +
      `│ 🏆 Streak tertinggi: *${bestStreak} hari*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      claimInfo
    )
  }

  if (subcommand === 'restreak') {
    const previousStreak = Math.max(0, Math.floor(Number(
      user.dailyBrokenStreak || user.rpg?.dailyBrokenStreak
    ) || 0))
    const offerDate = user.dailyRestreakOfferDate || user.rpg?.dailyRestreakOfferDate ||
      (user.dailyDate === today ? user.dailyDate : null)
    const offerAvailable = previousStreak > 0 && user.dailyDate === today && offerDate === today
    if (!offerAvailable) {
      if (previousStreak > 0 && offerDate !== today) {
        delete user.dailyBrokenStreak
        delete user.dailyRestreakOfferDate
        if (user.rpg) {
          delete user.rpg.dailyBrokenStreak
          delete user.rpg.dailyRestreakOfferDate
        }
        await saveDB(wdb)
      }
      return m.reply(
        `╭─❏「 🔥 DAILY RESTREAK 」❏\n` +
        `│ ⏳ *KESEMPATAN TELAH BERAKHIR*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Restreak hanya tersedia pada hari yang sama saat streak terputus.\n` +
        `> ↳ Klaim daily berikutnya akan menutup kesempatan pemulihan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const dailyReward = getDailyRewardBreakdown(rpgUser, wdb.money[senderKey]).total
    const cost = multiplyRpgMoney(dailyReward, 2 * previousStreak)
    const balance = normalizeRpgMoney(wdb.money[senderKey])
    if (compareRpgMoney(balance, cost) < 0) {
      return m.reply(
        `╭─❏「 🔥 DAILY RESTREAK 」❏\n` +
        `│ ❌ *SALDO BELUM MENCUKUPI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pulihkan streak ${previousStreak} hari dengan biaya *${formatRpgMoney(cost)}*.\n` +
        `> ↳ Restreak tidak memakai cooldown; kesempatan berlaku sampai hari ini berakhir.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    wdb.money[senderKey] = subtractRpgMoney(balance, cost)
    user.dailyStreak = previousStreak
    delete user.dailyBrokenStreak
    delete user.dailyRestreakOfferDate
    if (user.rpg) {
      user.rpg.dailyStreak = previousStreak
      delete user.rpg.dailyBrokenStreak
      delete user.rpg.dailyRestreakOfferDate
    }
    await saveDB(wdb)
    const nextStep = 'Streak tersambung kembali. Klaim daily besok untuk melanjutkannya.'
    return m.reply(
      `╭─❏「 🔥 DAILY RESTREAK 」❏\n` +
      `│ ✅ *STREAK BERHASIL DIPULIHKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Streak kembali menjadi *${previousStreak} hari*.\n` +
      `> ↳ Biaya: -Rp ${cost.toLocaleString('id-ID')} (2× hadiah daily × ${previousStreak} hari streak).\n` +
      `> ↳ ${nextStep}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (user.dailyRestreakOfferDate && user.dailyRestreakOfferDate !== today) {
    delete user.dailyBrokenStreak
    delete user.dailyRestreakOfferDate
    if (user.rpg) {
      delete user.rpg.dailyBrokenStreak
      delete user.rpg.dailyRestreakOfferDate
    }
    await saveDB(wdb)
  }

  if (user.lastDaily && getJakartaDate(user.lastDaily) === today) {
    const nextMidnight = Date.parse(`${today}T00:00:00+07:00`) + 24 * 60 * 60 * 1000
    const remaining = Math.max(0, nextMidnight - now)
    if (remaining > 0) {
      const sisaJam = Math.floor(remaining / 3600000)
      const sisaMenit = Math.floor((remaining % 3600000) / 60000)
      return m.reply(`⏳ Daily sudah diklaim hari ini. Klaim lagi setelah reset pukul 00.00 WIB, sekitar *${sisaJam} jam ${sisaMenit} menit* lagi.`)
    }
  }

  getUserRPG(wdb, senderKey)
  user = wdb.users[senderKey] || user
  rpgUser = user.rpg || rpgUser

  const previousClaimDate = user.dailyDate || (user.lastDaily ? getJakartaDate(user.lastDaily) : null)
  let streakInfo = ''

  if (previousClaimDate) {
    const prevMs = Date.parse(`${previousClaimDate}T00:00:00+07:00`)
    const todayMs = Date.parse(`${today}T00:00:00+07:00`)
    const diffDays = Math.round((todayMs - prevMs) / 86400000)

    if (diffDays === 1) {
      // Klaim berturut-turut di hari berikutnya
      user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
      delete user.dailyBrokenStreak
    } else if (diffDays === 2) {
      // Terlewat 1 hari - Cek Streak Freeze
      const freezeCount = Number(user.streakFreeze || user.inventory?.streak_freeze || 0)
      if (user.dailyRestreakDate === today) {
        user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
        streakInfo = `\n✅ *Restreak Aktif*: streak lama berhasil dilanjutkan.`
      } else if (freezeCount > 0) {
        if ((Number(user.streakFreeze) || 0) > 0) {
          user.streakFreeze -= 1
        } else if (user.inventory?.streak_freeze > 0) {
          user.inventory.streak_freeze -= 1
        }
        user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
        streakInfo = `\n🛡️ *Streak Freeze Aktif*: Kamu terlewat 1 hari kemarin, tetapi 1 Streak Freeze digunakan untuk menyelamatkan streak-mu!`
      } else {
        user.dailyBrokenStreak = Number(user.dailyStreak) || 0
        user.dailyRestreakOfferDate = today
        user.dailyStreak = 1
        streakInfo = `\n⚠️ *Streak Terputus*: Terakhir klaim ${previousClaimDate} (terlewat 1 hari). Streak dimulai kembali dari 1.`
      }
    } else if (diffDays > 2) {
      if (user.dailyRestreakDate === today) {
        user.dailyStreak = (Number(user.dailyStreak) || 0) + 1
        streakInfo = `\n✅ *Restreak Aktif*: streak lama berhasil dilanjutkan.`
      } else {
        user.dailyBrokenStreak = Number(user.dailyStreak) || 0
        user.dailyRestreakOfferDate = today
        user.dailyStreak = 1
        streakInfo = `\n⚠️ *Streak Terputus*: Terakhir klaim ${previousClaimDate} (terlewat ${diffDays - 1} hari). Streak dimulai kembali dari 1.`
      }
    } else {
      user.dailyStreak = Number(user.dailyStreak) || 1
      delete user.dailyBrokenStreak
      delete user.dailyRestreakOfferDate
    }
  } else {
    user.dailyStreak = 1
    delete user.dailyBrokenStreak
    delete user.dailyRestreakOfferDate
  }

  user.dailyDate = today
  user.lastDaily = now
  user.dailySavedAt = now
  user.dailyBestStreak = Math.max(
    Number(user.dailyBestStreak) || 0,
    Number(rpgUser.dailyBestStreak) || 0,
    Number(user.dailyStreak) || 0,
    Number(user.dailyBrokenStreak) || 0,
    Number(rpgUser.dailyBrokenStreak) || 0
  )
  if (user.rpg) {
    user.rpg.dailyStreak = user.dailyStreak
    user.rpg.dailyDate = today
    user.rpg.lastDaily = now
    user.rpg.dailyBestStreak = user.dailyBestStreak
    user.rpg.dailyBrokenStreak = user.dailyBrokenStreak
    if (user.dailyRestreakOfferDate) user.rpg.dailyRestreakOfferDate = user.dailyRestreakOfferDate
    else delete user.rpg.dailyRestreakOfferDate
  }

  const currentBalance = normalizeRpgMoney(wdb.money[senderKey] || 0)
  const dailyBreakdown = getDailyRewardBreakdown(rpgUser, currentBalance)
  const {
    base: dailyBase,
    difficultyBonus: dailyDifficultyAdjustment,
    abilityBonus: dailyAbilityAdjustment,
    total: dailyReward
  } = dailyBreakdown
  let weekly = 0
  let weeklyDifficultyAdjustment = 0
  let weeklyAbilityAdjustment = 0
  let monthly = 0
  let monthlyDifficultyAdjustment = 0
  let monthlyAbilityAdjustment = 0
  let premiumDailyReward = 0
  const dailyRankIndex = getDailyStreakRanking(wdb, conn)
    .findIndex(player => player.jid === senderKey)
  const dailyRank = dailyRankIndex >= 0 ? dailyRankIndex + 1 : 0
  const topStreakBonus = dailyRank >= 1 && dailyRank <= 5
    ? multiplyRpgMoney(currentBalance, 0.05)
    : 0

  wdb.money[senderKey] = addRpgMoney(currentBalance, dailyReward)
  if (user.dailyStreak % 7 === 0) {
    const weeklyBase = 250000
    const weeklyDifficultyReward = multiplyRpgMoney(weeklyBase, getDifficultyProfile(rpgUser).income)
    weekly = scaleDifficultyIncome(rpgUser, weeklyBase)
    weeklyDifficultyAdjustment = subtractRpgMoney(weeklyDifficultyReward, weeklyBase)
    weeklyAbilityAdjustment = subtractRpgMoney(weekly, weeklyDifficultyReward)
    wdb.money[senderKey] = addRpgMoney(wdb.money[senderKey], weekly)
  }
  if (user.dailyStreak % 30 === 0) {
    const monthlyBase = 1500000
    const monthlyDifficultyReward = multiplyRpgMoney(monthlyBase, getDifficultyProfile(rpgUser).income)
    monthly = scaleDifficultyIncome(rpgUser, monthlyBase)
    monthlyDifficultyAdjustment = subtractRpgMoney(monthlyDifficultyReward, monthlyBase)
    monthlyAbilityAdjustment = subtractRpgMoney(monthly, monthlyDifficultyReward)
    wdb.money[senderKey] = addRpgMoney(wdb.money[senderKey], monthly)
  }
  if (compareRpgMoney(topStreakBonus, 0) > 0) {
    wdb.money[senderKey] = addRpgMoney(wdb.money[senderKey], topStreakBonus)
  }

  const rewardQuality = user.dailyStreak % 30 === 0
    ? 'monthly'
    : user.dailyStreak % 7 === 0
      ? 'weekly'
      : 'daily'
  const rewardItems = getDailyRewardItem(rpgUser, rewardQuality)

  const account = global.db?.data?.users?.[senderKey] || global.db?.data?.users?.[m.sender]
  const freeDailyLimit = account?.freeDailyLimitDate === today
    ? Number(account.freeDailyLimitAmount) || 0
    : 0
  if (
    account &&
    isPremiumAccount(account, now) &&
    Number(account.totalDonasi) >= PREMIUM_DAILY_MIN_DONATION
  ) {
    const reward = claimPremiumDailyLimit(account, now, PREMIUM_DAILY_REWARD)
    if (reward.claimed) {
      premiumDailyReward = reward.amount
      if (typeof global.db.write === 'function') await global.db.write()
    }
  }

  await saveDB(wdb)

  const formatAdjustment = (label, adjustment) => {
    const comparison = compareRpgMoney(adjustment, 0)
    if (comparison === 0) return `> ${label}: +${formatRpgMoney(0)}`
    const amount = comparison > 0 ? adjustment : multiplyRpgMoney(adjustment, -1)
    return `> ${label}: ${comparison > 0 ? '+' : '-'}${formatRpgMoney(amount)}`
  }
  const totalIncome = addRpgMoney(
    addRpgMoney(addRpgMoney(dailyReward, weekly), monthly),
    topStreakBonus
  )
  let cap = `╭─❏「 🎁 DAILY REWARD 」❏\n`
  cap += `│ 🔥 *Streak*: ${user.dailyStreak} hari\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`
  cap += `💰 *RINCIAN PEMASUKAN*\n`
  cap += `> Daily dasar: ${formatRpgMoney(dailyBase)}\n`
  cap += `${formatAdjustment('Bonus Difficulty', dailyDifficultyAdjustment)}\n`
  cap += `> Bonus Ability: +${formatRpgMoney(dailyAbilityAdjustment)}\n`
  cap += `> *Total Daily: ${formatRpgMoney(dailyReward)}*\n`

  if (user.dailyStreak % 7 === 0) {
    cap += `\n🏆 *WEEKLY*\n`
    cap += `> Weekly dasar: ${formatRpgMoney(250000)}\n`
    cap += `${formatAdjustment('Bonus Difficulty', weeklyDifficultyAdjustment)}\n`
    cap += `${formatAdjustment('Bonus Ability', weeklyAbilityAdjustment)}\n`
    cap += `> *Total Weekly: ${formatRpgMoney(weekly)}*\n`
  }

  if (user.dailyStreak % 30 === 0) {
    cap += `\n👑 *MONTHLY*\n`
    cap += `> Monthly dasar: ${formatRpgMoney(1500000)}\n`
    cap += `${formatAdjustment('Bonus Difficulty', monthlyDifficultyAdjustment)}\n`
    cap += `${formatAdjustment('Bonus Ability', monthlyAbilityAdjustment)}\n`
    cap += `> *Total Monthly: ${formatRpgMoney(monthly)}*\n`
  }

  if (dailyRank >= 1 && dailyRank <= 5) {
    cap += `\n🏅 *Bonus Top Streak (Rank ${dailyRank})*: +${formatRpgMoney(topStreakBonus)} (5% saldo)\n`
  }
  cap += `\n> 💵 *Total Pemasukan: ${formatRpgMoney(totalIncome)}*\n`

  cap += `\n🎒 *HADIAH ITEM*\n`
  const groupedItems = rewardItems.reduce((items, item) => {
    items.set(item, (items.get(item) || 0) + 1)
    return items
  }, new Map())
  cap += `${groupedItems.size
    ? [...groupedItems].map(([item, quantity]) =>
      `> 🎁 ${formatDailyItemName(item)} ×${quantity}`
    ).join('\n')
    : '> Belum ada item yang bisa diberikan.'}\n`

  if (freeDailyLimit || premiumDailyReward) {
    cap += `\n🎁 *BONUS LIMIT*\n`
    if (freeDailyLimit) cap += `> Limit Gratis: +${freeDailyLimit} limit\n`
    if (premiumDailyReward) cap += `> Premium Daily: +${premiumDailyReward} limit\n`
  }
  cap += `\n${streakInfo ? `${streakInfo.trim()}\n\n` : ''}`
  cap += `📌 *INFO*\n`
  cap += `> ↳ Klaim berikutnya tersedia besok setelah pukul 00:00 WIB!`

  if (user.dailyBrokenStreak && user.dailyRestreakOfferDate === today) {
    const dailyReward = getDailyRewardBreakdown(rpgUser, wdb.money[senderKey]).total
    const restreakCost = multiplyRpgMoney(dailyReward, 2 * user.dailyBrokenStreak)
    cap += `\n\n🔥 Pulihkan streak ${user.dailyBrokenStreak} hari hari ini seharga *${formatRpgMoney(restreakCost)}*.\n` +
      `Kesempatan berakhir saat hari berganti.`
    return sendRpgButtons(conn, {
      chat: m.chat,
      quoted: m,
      title: '🔥 STREAK TERPUTUS',
      subtitle: 'Kesempatan pulih hanya berlaku hari ini',
      text: cap,
      buttons: [[
        '🔥 Pulihkan Streak',
        `${usedPrefix || '.'}daily restreak`
      ]],
      noThumbnail: true,
      reply: fallbackText => m.reply(fallbackText)
    })
  }
  return m.reply(cap)
}

function getCommandPrefix(text, conn) {
  const configuredPrefixes = [conn?.prefix, global.prefix]
    .flatMap(prefix => Array.isArray(prefix) ? prefix : [prefix])

  for (const prefix of configuredPrefixes) {
    if (prefix instanceof RegExp) {
      prefix.lastIndex = 0
      const match = prefix.exec(text)
      prefix.lastIndex = 0
      if (match?.index === 0 && match[0]) return match[0]
    } else if (typeof prefix === 'string' && prefix && text.startsWith(prefix)) {
      return prefix
    }
  }

  return text.match(/^[.!/#]/)?.[0] || ''
}

handler.all = async function (m) {
  if (!m?.sender || m.fromMe) return

  const text = String(m.text || '').trim()
  const prefix = getCommandPrefix(text, this)
  if (!prefix) return

  const commandParts = text.slice(prefix.length).trim().split(/\s+/)
  const command = commandParts[0]?.toLowerCase()
  if (!command || command === 'claim' || (command === 'daily' && !commandParts[1])) return

  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}

  let senderKey = m.sender
  if (senderKey.endsWith('@lid')) {
    const cleanLid = senderKey.split(':')[0].replace(/@.+/, '') + '@lid'
    senderKey = global.lids?.[senderKey] ||
      global.lids?.[cleanLid] ||
      global.db?.data?.lids?.[senderKey] ||
      global.db?.data?.lids?.[cleanLid] ||
      senderKey
  }
  if (senderKey.includes('@s.whatsapp.net')) {
    senderKey = senderKey.split('@')[0].split(':')[0] + '@s.whatsapp.net'
  }

  const user = wdb.users[senderKey] || (wdb.users[senderKey] = {})
  const today = getJakartaDate(Date.now())
  if (user.dailyReminderDate === today) return

  const storedLastDaily = user.lastDaily ?? user.rpg?.lastDaily
  const hasLastDaily = storedLastDaily !== undefined && storedLastDaily !== null
  const claimedToday = hasLastDaily
    ? Number(storedLastDaily) > 0 && getJakartaDate(Number(storedLastDaily)) === today
    : (user.dailyDate || user.rpg?.dailyDate) === today
  if (claimedToday) return

  user.dailyReminderDate = today
  await saveDB(wdb)
  await m.reply(
    `⏰ Kamu belum mengambil reward *daily* hari ini. Silakan klaim sebelum hari berganti dengan *${prefix}daily* agar tidak melewatkan hadiah dan streak.`
  )
}

handler.help = ['daily', 'daily status', 'daily restreak', 'daily top', 'claim']
handler.tags = ['rpg']
handler.command = ['daily', 'claim']
export default handler
