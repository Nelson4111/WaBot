import { isAfk } from './afkHelper.js'
import {
  adjustCrimeSuccessChance,
  applyProtectedCrimeAttemptPenalty,
  getCrimeRestriction,
  isProtectedCrimeTarget,
  scaleDifficultyCooldown,
  scaleDifficultyIncome
} from './rpgDifficulty.js'
import { clampHomeStat, getHomeLevel } from './rpgHomeData.js'
import { formatPremiumProtectionMessage, tryPremiumProtection } from './rpgPremium.js'
import { MALL_CATEGORIES } from './rpgMallData.js'
import { getRpgCrimeStory } from './rpgCrimeStories.js'
import { saveDB } from './waifuHelper.js'
import {
  addRpgMoney,
  compareRpgMoney,
  formatRpgMoney,
  maxRpgMoney,
  minRpgMoney,
  multiplyRpgMoney,
  normalizeRpgMoney,
  subtractRpgMoney
} from './rpgMoney.js'

export const KIDNAP_ESCAPE_COOLDOWN = 60 * 1000
export const KIDNAP_ESCAPE_WINDOW = 5 * 60 * 1000
export const KIDNAP_INACTIVITY_TIMEOUT = 60 * 60 * 1000
export const KIDNAP_INACTIVITY_LABEL = `${KIDNAP_INACTIVITY_TIMEOUT / (60 * 60 * 1000)} jam`

export const RPG_CRIME_TYPES = Object.freeze([
  Object.freeze({ key: 'rampok', label: 'Rampok', emoji: '🕵️', score: 4 }),
  Object.freeze({ key: 'jarah', label: 'Jarah', emoji: '🏚️', score: 4 }),
  Object.freeze({ key: 'culik', label: 'Culik', emoji: '🕶️', score: 3 }),
  Object.freeze({ key: 'bunuh', label: 'Bunuh', emoji: '🔪', score: 3 }),
  Object.freeze({ key: 'begal', label: 'Begal', emoji: '🏴‍☠️', score: 2 }),
  Object.freeze({ key: 'copet', label: 'Copet', emoji: '🤏', score: 1 }),
  Object.freeze({ key: 'kabur', label: 'Kabur sendiri', emoji: '🏃', score: 5 }),
  Object.freeze({ key: 'breakout', label: 'Breakout', emoji: '🧱', score: 5 }),
  Object.freeze({ key: 'aniaya', label: 'Aniaya', emoji: '👶', score: 3 })
])

export function createRpgCrimeRecord(initialValues = {}) {
  const record = {
    ...Object.fromEntries(RPG_CRIME_TYPES.map(({ key }) => [key, 0])),
    total: 0,
    ...initialValues
  }
  if (
    !Object.prototype.hasOwnProperty.call(initialValues, 'aniaya') &&
    Object.prototype.hasOwnProperty.call(initialValues, 'penelantaran')
  ) {
    record.aniaya = initialValues.penelantaran
  }
  delete record.penelantaran
  return record
}

export const RPG_CRIME_ACTIONS = Object.freeze({
  jarah: {
    label: 'Jarah',
    type: 'homeRaid',
    cooldown: 6 * 60 * 60 * 1000,
    successChance: 0.68,
    failurePenaltyRate: 0,
    failurePenaltyMin: 15000,
    failurePenaltyMax: 300000,
    prisonDuration: 2 * 60 * 60 * 1000,
    ransom: 2000000,
    caseLabel: '🏚️ Jarah'
  },
  culik: {
    label: 'Culik',
    type: 'kidnap',
    cooldown: 12 * 60 * 60 * 1000,
    successChance: 0.62,
    failurePenaltyRate: 0.08,
    failurePenaltyMin: 20000,
    failurePenaltyMax: 500000,
    prisonDuration: 4 * 60 * 60 * 1000,
    kidnapDuration: 5 * 60 * 60 * 1000,
    ransom: 4000000,
    caseLabel: '🕶️ Culik',
    escapeCooldown: KIDNAP_ESCAPE_COOLDOWN,
    escapeWindow: KIDNAP_ESCAPE_WINDOW
  }
})

const formatMoney = value => formatRpgMoney(value)
const resolveKidnapperJid = jid => {
  const value = String(jid || '')
  return value.endsWith('@lid')
    ? global.lids?.[value] || global.db?.data?.lids?.[value] || value
    : value
}
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

export async function runRpgCrimeAction({ m, conn, db, userRPG, targetJid, action, config, itemSelector, ransomAmount }) {
  const [{ computeCrimeScore }, { ensurePrisonCell, registerPrisoner }] = await Promise.all([
    import('./crimeHelper.js'),
    import('./prisonHelper.js')
  ])
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
    return m.reply(`🚔 *KAMU DI PENJARA SEL ${userRPG.sel}*\nSisa: *${hours}j ${minutes}m*\nTebusan: *${formatMoney(userRPG.tebusan || config.ransom)}*\n\nMinta bantuan dengan *.penjara tebus @tag*.`)
  }

  const now = Date.now()
  const cooldownField = `last${action}`
  const cooldown = scaleDifficultyCooldown(userRPG, config.cooldown)
  const remaining = cooldown - (now - (Number(userRPG[cooldownField]) || 0))

  if (remaining > 0) {
  const totalMinutes = Math.ceil(remaining / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return m.reply(
    `╭─❏「 ⏳ COOLDOWN ${config.label.toUpperCase()} 」❏\n` +
    `│ Kamu harus menunggu sebelum melakukan aksi lagi.\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ⏰ Sisa waktu: *${hours}j ${minutes}m*`
  )
}

if (!targetJid) {
  return m.reply(
    `╭─❏「 ❌ TARGET TIDAK DITEMUKAN 」❏\n` +
    `│ Tag atau reply target yang ingin di${action}.\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

if (targetJid === m.sender) {
  return m.reply(
    `╭─❏「 ❌ TARGET TIDAK VALID 」❏\n` +
    `│ Kamu tidak bisa ${action} diri sendiri.\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

const senderUser = global.db?.data?.users?.[m.sender] || db.users?.[m.sender] || {}
const targetUser = global.db?.data?.users?.[targetJid] || db.users?.[targetJid] || {}

if (isAfk(senderUser)) {
  return m.reply(
    `╭─❏「 💤 STATUS AFK 」❏\n` +
    `│ Kamu sedang AFK.\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Nonaktifkan status AFK terlebih dahulu sebelum melakukan aksi kriminal.`
  )
}

if (isAfk(targetUser)) {
  return m.reply(
    `╭─❏「 💤 TARGET SEDANG AFK 」❏\n` +
    `│ Target tidak bisa dijadikan sasaran tindakan kriminal.\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

const targetAccount = db.users[targetJid]
const targetRPG = targetAccount?.rpg

if (!targetRPG) {
  return m.reply(
    `╭─❏「 ❌ DATA RPG TIDAK DITEMUKAN 」❏\n` +
    `│ Target belum memiliki data RPG.\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

const targetRestriction = getCrimeRestriction(targetRPG, { target: true })
if (targetRestriction) return m.reply(targetRestriction)

if (!Array.isArray(userRPG.riwayat)) userRPG.riwayat = []
if (!Array.isArray(targetRPG.riwayat)) targetRPG.riwayat = []

const targetBalance = normalizeRpgMoney(db.money[targetJid])
let requestedHomeItemIndex = -1

if (config.type === 'homeRaid') {
  const contents = targetRPG.home?.furniture

  if (!Array.isArray(contents) || contents.length === 0) {
    return m.reply(
      `╭─❏「 🏠 RUMAH TARGET 」❏\n` +
      `│ Rumah target tidak memiliki furniture yang bisa dijarah.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  requestedHomeItemIndex = findHomeItemIndex(contents, itemSelector)

  if (itemSelector && requestedHomeItemIndex < 0) {
    return m.reply(
      `╭─❏「 🏠 FURNITURE TIDAK DITEMUKAN 」❏\n` +
      `│ Furniture tersebut tidak ditemukan di rumah target.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }
} else if (config.type === 'kidnap') {
  if (targetRPG.rehabilitation?.status === 'active') {
    return m.reply(
      `╭─❏「 🕊️ TARGET DIREHABILITASI 」❏\n` +
      `│ Target sedang menjalani rehabilitasi dan tidak bisa diculik.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  const targetIsKidnapper = Object.values(db.users || {}).some(account => {
    const hostageRPG = account?.rpg

    return Number(hostageRPG?.kidnappedUntil) > Date.now() &&
      resolveKidnapperJid(hostageRPG?.kidnappedBy) === resolveKidnapperJid(targetJid)
  })

  if (targetIsKidnapper) {
    return m.reply(
      `╭─❏「 🚨 TARGET ADALAH PENCULIK 」❏\n` +
      `│ Target sedang menahan korban dan tidak bisa diculik.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (targetRPG.kidnappedBy && Date.now() < (Number(targetRPG.kidnappedUntil) || 0)) {
    return m.reply(
      `╭─❏「 🚨 TARGET SEDANG DICULIK 」❏\n` +
      `│ Target belum bisa diculik kembali.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (targetRPG.penjara && Date.now() - targetRPG.penjara < (Number(targetRPG.lamaPenjara) || 0)) {
    return m.reply(
      `╭─❏「 🚔 TARGET DI PENJARA 」❏\n` +
      `│ Target sudah berada di penjara.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }
} else if (compareRpgMoney(targetBalance, config.minimumTargetMoney) < 0) {
  return m.reply(
    `╭─❏「 💰 SALDO TARGET TERLALU SEDIKIT 」❏\n` +
    `│ Saldo target belum memenuhi batas minimum.\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> 💵 Minimal saldo: ${formatMoney(config.minimumTargetMoney)}`
  )
}

const protectedTarget = isProtectedCrimeTarget(targetJid)
if (!protectedTarget && tryPremiumProtection(targetJid, action, Date.now(), m.sender)) {
  userRPG[cooldownField] = now
  await saveDB(db)

  const protectedAsset = config.type === 'homeRaid'
    ? 'Furniture rumah target tetap aman.'
    : config.type === 'kidnap'
      ? 'Target tetap aman.'
      : 'Saldo target tetap aman.'

  return m.reply(formatPremiumProtectionMessage(action, protectedAsset))
}

userRPG[cooldownField] = now

const crimeData = db.crime[m.sender] = createRpgCrimeRecord(db.crime[m.sender] || {})
const baseSuccessChance = adjustCrimeSuccessChance(userRPG, config.successChance, targetJid)
const activeHomeStaff = (targetRPG.home?.staff || []).filter(staff => Number(staff.expiresAt) > now)

const homeSecurity = config.type === 'homeRaid'
  ? clampHomeStat(
      getHomeLevel(targetRPG.home?.level).security +
      (activeHomeStaff.some(staff => staff.key === 'bodyguard') ? 15 : 0) +
      (activeHomeStaff.some(staff => staff.key === 'security guard') ? 10 : 0)
    )
  : 0

const successChance = protectedTarget
  ? 0
  : config.type === 'homeRaid'
    ? Math.max(0.05, baseSuccessChance - (homeSecurity * 0.004))
    : baseSuccessChance

const success = Math.random() < successChance

const rawAmount = config.type
  ? 0
  : multiplyRpgMoney(targetBalance, config.lootRateMin + Math.random() * (config.lootRateMax - config.lootRateMin))

const amount = config.type
  ? 0
  : minRpgMoney(
      targetBalance,
      config.maximumLoot,
      maxRpgMoney(config.minimumLoot, scaleDifficultyIncome(userRPG, rawAmount))
    )

if (!success) {
  const story = getRpgCrimeStory(action, 'failure')
  applyProtectedCrimeAttemptPenalty(db, m.sender, targetJid)

  if (tryPremiumProtection(m.sender, action)) {
    userRPG.riwayat.unshift(`🛡️ Premium Protection mencegah hukuman saat ${action} @${targetJid.split('@')[0]}`)
    await saveDB(db)

    return m.reply(
      `${formatPremiumProtectionMessage(action, 'Kamu tidak masuk penjara.', {
        protectionMessage: 'Perlindungan Premium kamu sedang aktif.'
      })}\n\n${story}`
    )
  }

  const failurePenalty = maxRpgMoney(
    config.failurePenaltyMin,
    multiplyRpgMoney(amount, config.failurePenaltyRate)
  )
  const penalty = minRpgMoney(normalizeRpgMoney(db.money[m.sender]), failurePenalty, config.failurePenaltyMax)

  db.money[m.sender] = subtractRpgMoney(db.money[m.sender], penalty)
  userRPG.penjara = now
  userRPG.lamaPenjara = config.prisonDuration
  userRPG.tebusan = config.ransom
  userRPG.kasus = config.caseLabel
  userRPG.sel = registerPrisoner(db, m.sender)
  userRPG.riwayat.unshift(`🚔 Ditangkap saat ${action} @${targetJid.split('@')[0]}`)

  crimeData.total = computeCrimeScore(crimeData)
  await saveDB(db)

  if (!userRPG.sel) {
    return m.reply(
      `╭─❏「 🚔 ${config.label.toUpperCase()} GAGAL 」❏\n` +
      `│ 💸 Denda: ${formatMoney(penalty)}\n` +
      `│ 🛡️ Perlindungan mencegahmu masuk penjara.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${story}`
    )
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
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${story}\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `📌 *CARA MENEBUS TAHANAN*\n` +
    `> ↳ *.penjara tebus @${m.sender.split('@')[0]}*`,
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

  if (!userRPG.mallInventory || typeof userRPG.mallInventory !== 'object') {
    userRPG.mallInventory = {}
  }

  userRPG.mallInventory[stolenItem] = (Number(userRPG.mallInventory[stolenItem]) || 0) + 1

  targetRPG.riwayat.unshift(`🏚️ ${stolenItem} dijarah oleh @${m.sender.split('@')[0]}`)
  userRPG.riwayat.unshift(`🏚️ Berhasil menjarah ${stolenItem} dari rumah @${targetJid.split('@')[0]}`)
}

if (config.type === 'kidnap') {
  targetRPG.kidnappedBy = m.sender
  targetRPG.kidnappedAt = now
  targetRPG.kidnappedUntil = now + config.kidnapDuration
  targetRPG.kidnapRansom = ransomAmount
  targetRPG.kidnapLastActivityAt = now
  targetRPG.kidnapChat = m.chat
  targetRPG.kidnapEscapeAttempt = null

  targetRPG.riwayat.unshift(`🚨 Diculik oleh @${m.sender.split('@')[0]}`)
  userRPG.riwayat.unshift(`🚨 Berhasil menculik @${targetJid.split('@')[0]}`)
}

if (!config.type) {
  db.money[targetJid] = subtractRpgMoney(targetBalance, amount)
  db.money[m.sender] = addRpgMoney(db.money[m.sender], amount)
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
    `─━━━━━━━━━━━━━━─\n` +
    `💀 Poin buronan bertambah.\n` +
    `> ↳ Cek detail melalui *.buronan*.`,
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
    `│ 💰 Tebusan: ${formatMoney(ransomAmount)}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${story}\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `📌 *INFORMASI PENCULIKAN*\n` +
    `> ↳ Korban tidak dapat melakukan aktivitas lain selama diculik.\n` +
    `> ↳ Korban dapat mencoba kabur dengan *.kabur*.\n` +
    `> ↳ Penculik harus merespons dengan *.tangkap @${targetJid.split('@')[0]}* dalam 5 menit.\n` +
    `> ↳ Penebus dapat menggunakan *.tebus @${targetJid.split('@')[0]}* untuk membayar tebusan kepada penculik.\n` +
    `> ↳ Jika tidak ada aktivitas selama ${KIDNAP_INACTIVITY_LABEL}, korban otomatis kabur.\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `💀 Poin buronan penculik bertambah.\n` +
    `> ↳ Cek detail melalui *.buronan*.`,
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
  `─━━━━━━━━━━━━━━─\n` +
  `💀 Poin buronan bertambah.\n` +
  `> ↳ Cek detail melalui *.buronan*.`,
  m,
  { mentions: [m.sender, targetJid] }
)
}
