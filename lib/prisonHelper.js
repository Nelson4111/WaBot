import { ensurePatrolReleaseProtection, getPatrolProtectionRemaining } from './crimeHelper.js'
import { BANK_TIERS } from './rpg-bankData.js'

const CELL_PATTERN = /^[A-Z]+[1-9]$/
const EXCLUSIVE_CELL_PATTERN = /^VIP[A-Z]+[1-9]$/

export const EXCLUSIVE_JAIL_BLOCKED_COMMANDS = Object.freeze([
  'adventure', 'adv', 'petualang', 'explore',
  'mining', 'tambang', 'mancing', 'fishing',
  'kerja', 'work', 'daily', 'panen', 'harvest', 'tanam', 'plant',
  'kebun', 'ternak', 'peternakan', 'craft', 'forge',
  'dungeon', 'arena', 'gym', 'mt', 'raid', 'guildwar',
  'copet', 'begal', 'rampok', 'jarah', 'culik', 'bunuh', 'fitnah'
])

function normalizeJid(jid) {
  if (!jid) return null
  jid = String(jid)
  if (jid.includes('@')) {
    const [user, server] = jid.split('@')
    if (server === 's.whatsapp.net' || server === 'lid') {
      jid = `${user.split(':')[0]}@${server}`
    }
  }
  if (jid.endsWith('@lid')) return global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
  if (/^\d+$/.test(jid)) return `${jid}@s.whatsapp.net`
  return jid
}

function getPrisonerRPG(wdb, jid) {
  jid = normalizeJid(jid)
  return global.db?.data?.users?.[jid]?.rpg || wdb?.users?.[jid]?.rpg || null
}

function getOccupiedCells(wdb, excludedJid) {
  const occupied = new Set()
  const excluded = normalizeJid(excludedJid)
  for (const jid of wdb?.penjara || []) {
    if (normalizeJid(jid) === excluded) continue
    const cell = String(getPrisonerRPG(wdb, jid)?.sel || '').toUpperCase()
    if (CELL_PATTERN.test(cell)) occupied.add(cell)
  }
  return occupied
}

export function hasExclusiveJailAccess(rpg) {
  const tier = BANK_TIERS[Number(rpg?.bankTier)] || BANK_TIERS[0]
  return tier.fasilitas.includes('Akses Eksklusif')
}

export function getRandomPrisonCell(wdb, excludedJid) {
  const occupied = getOccupiedCells(wdb, excludedJid)
  const rpg = getPrisonerRPG(wdb, excludedJid)

  if (hasExclusiveJailAccess(rpg)) {
    for (let suffixLength = 1; ; suffixLength++) {
      const suffixCount = 26 ** suffixLength
      const suffixStart = Math.floor(Math.random() * suffixCount)
      for (let offset = 0; offset < suffixCount; offset++) {
        let value = (suffixStart + offset) % suffixCount
        let suffix = ''
        for (let index = 0; index < suffixLength; index++) {
          suffix = String.fromCharCode(65 + value % 26) + suffix
          value = Math.floor(value / 26)
        }

        const digitStart = Math.floor(Math.random() * 9)
        for (let digitOffset = 0; digitOffset < 9; digitOffset++) {
          const cell = `VIP${suffix}${((digitStart + digitOffset) % 9) + 1}`
          if (!occupied.has(cell)) return cell
        }
      }
    }
  }

  for (let prefixLength = 1; ; prefixLength++) {
    const prefixCount = 26 ** prefixLength
    const prefixStart = Math.floor(Math.random() * prefixCount)
    for (let offset = 0; offset < prefixCount; offset++) {
      let value = (prefixStart + offset) % prefixCount
      let prefix = ''
      for (let index = 0; index < prefixLength; index++) {
        prefix = String.fromCharCode(65 + value % 26) + prefix
        value = Math.floor(value / 26)
      }

      const digitStart = Math.floor(Math.random() * 9)
      for (let digitOffset = 0; digitOffset < 9; digitOffset++) {
        const cell = `${prefix}${((digitStart + digitOffset) % 9) + 1}`
        if (!cell.startsWith('VIP') && !occupied.has(cell)) return cell
      }
    }
  }
}

export function ensurePrisonCell(wdb, jid) {
  const rpg = getPrisonerRPG(wdb, jid)
  if (!rpg) return null

  const cell = String(rpg.sel || '').toUpperCase()
  const exclusiveAccess = hasExclusiveJailAccess(rpg)
  const matchingCellType = exclusiveAccess
    ? EXCLUSIVE_CELL_PATTERN.test(cell)
    : CELL_PATTERN.test(cell) && !EXCLUSIVE_CELL_PATTERN.test(cell)
  if (matchingCellType && !getOccupiedCells(wdb, jid).has(cell)) {
    rpg.sel = cell
    return cell
  }

  rpg.sel = getRandomPrisonCell(wdb, jid)
  return rpg.sel
}

export function registerPrisoner(wdb, jid) {
  const normalizedJid = normalizeJid(jid)
  if (!normalizedJid) return null

  const rpg = getPrisonerRPG(wdb, normalizedJid)
  if (!rpg) return null

  if (rpg.rehabilitation?.status === 'active') {
    rpg.penjara = null
    rpg.lamaPenjara = 0
    rpg.tebusan = 0
    rpg.sel = 0
    rpg.kasus = null
    return null
  }

  if (!Array.isArray(wdb.penjara)) wdb.penjara = []
  if (!wdb.penjara.some(entry => normalizeJid(entry) === normalizedJid)) {
    wdb.penjara.push(normalizedJid)
  }

  ensurePatrolReleaseProtection(rpg)
  if (getPatrolProtectionRemaining(rpg, 'prison') > 0) {
    rpg.penjara = null
    rpg.lamaPenjara = 0
    rpg.tebusan = 0
    rpg.sel = 0
    rpg.kasus = null
    wdb.penjara = wdb.penjara.filter(entry => normalizeJid(entry) !== normalizedJid)
    return null
  }

  rpg.sel = getRandomPrisonCell(wdb, normalizedJid)
  if (rpg.rehabilitation?.status === 'completed') {
    rpg.rehabilitation.status = 'revoked'
    rpg.rehabilitation.revokedAt = Date.now()
  }
  return rpg.sel
}