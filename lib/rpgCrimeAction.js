import { isAfk } from './afkHelper.js'
import { computeCrimeScore } from './crimeHelper.js'
import { ensurePrisonCell, registerPrisoner } from './prisonHelper.js'
import {
  adjustCrimeSuccessChance,
  getCrimeRestriction,
  scaleDifficultyCooldown,
  scaleDifficultyIncome
} from './rpgDifficulty.js'
import { tryPremiumProtection } from './rpgPremium.js'
import { MALL_CATEGORIES } from './rpgMallData.js'
import { createRpgCrimeRecord } from './rpgCrimeData.js'
import { getRpgCrimeStory } from './rpgCrimeStories.js'
import { saveDB } from './waifuHelper.js'

const formatMoney = value => `Rp ${Number(value).toLocaleString('id-ID')}`
const normalizeItem = value => String(value || '').normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[\s-]+/g, '_')
const mallItems = Object.values(MALL_CATEGORIES).flatMap(category => category.items)

function findHomeItemIndex(contents, selector) {
  const requested = normalizeItem(selector)
  if (!requested) return -1
  return contents.findIndex(itemId => {
    if (normalizeItem(itemId) === requested) return true
    const catalogItem = mallItems.find(item => item.id === itemId)
    return catalogItem && normalizeItem(catalogItem.name) === requested
  })
}

export async function runRpgCrimeAction({ m, conn, db, userRPG, targetJid, action, config, itemSelector }) {
  const actorRestriction = getCrimeRestriction(userRPG)
  if (actorRestriction) return m.reply(actorRestriction)
  if (!Array.isArray(userRPG.riwayat)) userRPG.riwayat = []
  if (userRPG.penjara && Date.now() - userRPG.penjara < (Number(userRPG.lamaPenjara) || 0)) {
    const previousCell = userRPG.sel
    ensurePrisonCell(db, m.sender)
    if (userRPG.sel !== previousCell) await saveDB(db)
    const remaining = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / 60000)
    return m.reply(`🚔 *KAMU DI PENJARA SEL ${userRPG.sel}*\nSisa: *${hours}j ${minutes}m*\nTebusan: *${formatMoney(userRPG.tebusan || config.ransom)}*\n\nKetik *.tebus*`)
  }

  const now = Date.now()
  const cooldownField = `last${action}`
  const cooldown = scaleDifficultyCooldown(userRPG, config.cooldown)
  const remaining = cooldown - (now - (Number(userRPG[cooldownField]) || 0))

  if (remaining > 0) {
    const totalMinutes = Math.ceil(remaining / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return m.reply(`⏳ *COOLDOWN ${config.label.toUpperCase()}*\nTunggu *${hours}j ${minutes}m* lagi.`)
  }
  if (!targetJid) return m.reply(`❌ Tag atau reply target yang ingin di${action}.`)
  if (targetJid === m.sender) return m.reply(`❌ Kamu tidak bisa ${action} diri sendiri.`)

  const senderUser = global.db?.data?.users?.[m.sender] || db.users?.[m.sender] || {}
  const targetUser = global.db?.data?.users?.[targetJid] || db.users?.[targetJid] || {}
  if (isAfk(senderUser)) return m.reply('❌ Kamu sedang AFK. Nonaktifkan dulu status AFK sebelum melakukan aksi kriminal.')
  if (isAfk(targetUser)) return m.reply('❌ Target sedang AFK dan tidak bisa dijadikan sasaran tindakan kriminal.')

  const targetAccount = db.users[targetJid]
  const targetRPG = targetAccount?.rpg
  if (!targetRPG) return m.reply('❌ Target belum punya data RPG.')
  const targetRestriction = getCrimeRestriction(targetRPG, { target: true })
  if (targetRestriction) return m.reply(targetRestriction)
  if (!Array.isArray(userRPG.riwayat)) userRPG.riwayat = []
  if (!Array.isArray(targetRPG.riwayat)) targetRPG.riwayat = []

  const targetBalance = Number(db.money[targetJid]) || 0
  let requestedHomeItemIndex = -1
  if (config.type === 'homeRaid') {
    const contents = targetRPG.home?.furniture
    if (!Array.isArray(contents) || contents.length === 0) {
      return m.reply('🏠 Rumah target tidak memiliki furniture yang bisa dijarah.')
    }
    requestedHomeItemIndex = findHomeItemIndex(contents, itemSelector)
    if (itemSelector && requestedHomeItemIndex < 0) {
      return m.reply('🏠 Furniture tersebut tidak ditemukan di rumah target.')
    }
  } else if (config.type === 'kidnap') {
    if (targetRPG.rehabilitation?.status === 'active') {
      return m.reply('🕊️ Target sedang menjalani rehabilitasi dan tidak bisa diculik.')
    }
    if (targetRPG.kidnappedBy && Date.now() < (Number(targetRPG.kidnappedUntil) || 0)) {
      return m.reply('🚨 Target sedang dalam penculikan dan belum bisa diculik lagi.')
    }
    if (targetRPG.penjara && Date.now() - targetRPG.penjara < (Number(targetRPG.lamaPenjara) || 0)) {
      return m.reply('🚔 Target sudah berada di penjara.')
    }
  } else if (targetBalance < config.minimumTargetMoney) {
    return m.reply(`❌ Uang target terlalu sedikit. Minimal ${formatMoney(config.minimumTargetMoney)}.`)
  }

  if (tryPremiumProtection(targetJid, action)) {
    userRPG[cooldownField] = now
    await saveDB(db)
    const protectedAsset = config.type === 'homeRaid'
      ? 'furniture rumah target tetap aman'
      : config.type === 'kidnap'
        ? 'target tetap aman'
        : 'saldo target aman'
    return m.reply(`🛡️ Aksi ${action} gagal: Premium Protection target aktif. Cooldown ${action} kamu tetap berlaku; ${protectedAsset}.`)
  }

  userRPG[cooldownField] = now
  const crimeData = db.crime[m.sender] = createRpgCrimeRecord(db.crime[m.sender] || {})
  const success = Math.random() < adjustCrimeSuccessChance(userRPG, config.successChance)
  const rawAmount = config.type
    ? 0
    : targetBalance * (config.lootRateMin + Math.random() * (config.lootRateMax - config.lootRateMin))
  const amount = config.type
    ? 0
    : Math.min(targetBalance, config.maximumLoot, Math.max(config.minimumLoot, scaleDifficultyIncome(userRPG, rawAmount)))

  if (!success) {
    const story = getRpgCrimeStory(action, 'failure')
    if (tryPremiumProtection(m.sender, action)) {
      userRPG.riwayat.unshift(`🛡️ Premium Protection mencegah hukuman saat ${action} @${targetJid.split('@')[0]}`)
      await saveDB(db)
      return m.reply(`🛡️ Premium Protection aktif: kamu selamat dari kegagalan ${action} dan tidak masuk penjara.\n\n${story}`)
    }

    const penalty = Math.min(
      Number(db.money[m.sender]) || 0,
      Math.max(config.failurePenaltyMin, Math.floor(amount * config.failurePenaltyRate)),
      config.failurePenaltyMax
    )
    db.money[m.sender] = (Number(db.money[m.sender]) || 0) - penalty
    userRPG.penjara = now
    userRPG.lamaPenjara = config.prisonDuration
    userRPG.tebusan = config.ransom
    userRPG.kasus = config.caseLabel
    userRPG.sel = registerPrisoner(db, m.sender)
    userRPG.riwayat.unshift(`🚔 Ditangkap saat ${action} @${targetJid.split('@')[0]}`)
    crimeData.total = computeCrimeScore(crimeData)
    await saveDB(db)

    if (!userRPG.sel) {
      return m.reply(`❌ ${config.label} gagal. Kamu kehilangan ${formatMoney(penalty)}. Perlindungan mencegahmu masuk penjara.\n\n${story}`)
    }

    const durationHours = Math.floor(config.prisonDuration / (60 * 60 * 1000))
    return conn.reply(
      m.chat,
      `╭─❏「 🚔 ${config.label.toUpperCase()} GAGAL 」❏\n` +
      `│ 👤 Pelaku: @${m.sender.split('@')[0]}\n` +
      `│ 🎯 Target: @${targetJid.split('@')[0]}\n` +
      `│ 💸 Denda: ${formatMoney(penalty)}\n` +
      `│ 🚔 Penjara: SEL ${userRPG.sel} selama ${durationHours} jam\n` +
      `│ 💰 Tebusan: ${formatMoney(config.ransom)}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n${story}\n\nKetik *.tebus* untuk membayar tebusan.`,
      m,
      { mentions: [m.sender, targetJid] }
    )
  }

  let stolenItem
  if (config.type === 'homeRaid') {
    const targetHome = targetRPG.home
    const stolenIndex = itemSelector
      ? requestedHomeItemIndex
      : Math.floor(Math.random() * targetHome.furniture.length)
    stolenItem = targetHome.furniture.splice(stolenIndex, 1)[0]
    if (!userRPG.mallInventory || typeof userRPG.mallInventory !== 'object') userRPG.mallInventory = {}
    userRPG.mallInventory[stolenItem] = (Number(userRPG.mallInventory[stolenItem]) || 0) + 1
    targetRPG.riwayat.unshift(`🏚️ ${stolenItem} dijarah oleh @${m.sender.split('@')[0]}`)
    userRPG.riwayat.unshift(`🏚️ Berhasil menjarah ${stolenItem} dari rumah @${targetJid.split('@')[0]}`)
  }

  if (config.type === 'kidnap') {
    targetRPG.kidnappedBy = m.sender
    targetRPG.kidnappedAt = now
    targetRPG.kidnappedUntil = now + config.prisonDuration
    targetRPG.kidnapEscapeAttempt = null
    targetRPG.riwayat.unshift(`🚨 Diculik oleh @${m.sender.split('@')[0]}`)
    userRPG.riwayat.unshift(`🚨 Berhasil menculik @${targetJid.split('@')[0]}`)
  }

  if (!config.type) {
    db.money[targetJid] = targetBalance - amount
    db.money[m.sender] = (Number(db.money[m.sender]) || 0) + amount
  }
  crimeData[action] = (Number(crimeData[action]) || 0) + 1
  crimeData.total = computeCrimeScore(crimeData)
  if (!config.type) {
    targetRPG.riwayat.unshift(`-${formatMoney(amount)} ${action} @${m.sender.split('@')[0]}`)
    userRPG.riwayat.unshift(`+${formatMoney(amount)} ${config.label} @${targetJid.split('@')[0]}`)
  }
  await saveDB(db)

  if (config.type === 'homeRaid') {
    const itemName = mallItems.find(item => item.id === stolenItem)?.name || stolenItem.replace(/_/g, ' ')
    const story = getRpgCrimeStory(action, 'success')
    return conn.reply(
      m.chat,
      `╭─❏「 🏚️ JARAH BERHASIL 」❏\n` +
      `│ 👤 Penjarah: @${m.sender.split('@')[0]}\n` +
      `│ 🏠 Rumah: @${targetJid.split('@')[0]}\n` +
      `│ 🎁 Barang: ${itemName}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${story}\n\n` +
      `💀 Poin buronan bertambah; lihat detailnya melalui .buronan.`,
      m,
      { mentions: [m.sender, targetJid] }
    )
  }

  if (config.type === 'kidnap') {
    const story = getRpgCrimeStory(action, 'success')
    return conn.reply(
      m.chat,
      `╭─❏「 🕶️ CULIK BERHASIL 」❏\n` +
      `│ 👤 Penculik: @${m.sender.split('@')[0]}\n` +
      `│ 🎯 Korban: @${targetJid.split('@')[0]}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${story}\n\n` +
      `Korban tidak dapat melakukan aktivitas lain selama diculik. Untuk kabur, korban gunakan *.kabur*; penculik harus merespons dengan *.tangkap @${targetJid.split('@')[0]}* dalam 5 menit, atau korban otomatis bebas. Penculikan berlangsung maksimal 4 jam.\n` +
      `Poin buronan penculik bertambah; cek *.buronan*.`,
      m,
      { mentions: [m.sender, targetJid] }
    )
  }

  const story = getRpgCrimeStory(action, 'success')
  return conn.reply(
    m.chat,
    `╭─❏「 ✅ ${config.label.toUpperCase()} BERHASIL 」❏\n` +
    `│ 👤 Pelaku: @${m.sender.split('@')[0]}\n` +
    `│ 🎯 Target: @${targetJid.split('@')[0]}\n` +
    `│ 💰 Hasil: ${formatMoney(amount)}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${story}\n\n` +
    `💀 Poin buronan bertambah; lihat detailnya melalui .buronan.`,
    m,
    { mentions: [m.sender, targetJid] }
  )
}
