export const CRIME_SCORES = Object.freeze({
  rampok: 4,
  jarah: 4,
  culik: 3,
  bunuh: 3,
  begal: 2,
  copet: 1,
  kabur: 5,
  breakout: 5
})

export const PATROL_CRIME_PROTECTION_MS = 15 * 60 * 1000
export const PATROL_PRISON_PROTECTION_MS = 30 * 60 * 1000
export const PATROL_CAPTURE_PROTECTION_MS = 2 * 60 * 60 * 1000

export function getPatrolCaptureChance(score) {
  const points = Math.max(0, Number(score) || 0)
  if (!points) return 0
  return Math.min(0.05, 0.001 + points * 0.0005)
}

export function markPatrolRelease(rpg, now = Date.now()) {
  if (!Number(rpg?.patrolCaughtAt)) return false
  rpg.patrolCrimeProtectionUntil = now + PATROL_CRIME_PROTECTION_MS
  rpg.patrolPrisonProtectionUntil = now + PATROL_PRISON_PROTECTION_MS
  rpg.patrolCaptureProtectionUntil = now + PATROL_CAPTURE_PROTECTION_MS
  delete rpg.patrolCaughtAt
  return true
}

export function ensurePatrolReleaseProtection(rpg, now = Date.now()) {
  if (!Number(rpg?.patrolCaughtAt)) return false
  const jailStartedAt = Number(rpg.penjara) || 0
  const releaseAt = jailStartedAt
    ? Math.min(now, jailStartedAt + (Number(rpg.lamaPenjara) || 0))
    : now
  if (jailStartedAt && now - jailStartedAt < (Number(rpg.lamaPenjara) || 0)) return false
  return markPatrolRelease(rpg, releaseAt)
}

export function getPatrolProtectionRemaining(rpg, type, now = Date.now()) {
  const protectionField = {
    crime: 'patrolCrimeProtectionUntil',
    prison: 'patrolPrisonProtectionUntil',
    capture: 'patrolCaptureProtectionUntil'
  }[type]
  if (!protectionField) throw new Error(`Jenis perlindungan patroli tidak dikenal: ${type}`)
  const legacyProtectionUntil = Number(rpg?.patrolProtectionUntil) || 0
  const protectionUntil = Number(rpg?.[protectionField]) || legacyProtectionUntil
  return Math.max(0, protectionUntil - now)
}

export function getPatrolCapturePenalty(score) {
  const points = Math.max(0, Math.floor(Number(score) || 0))
  return {
    durationMs: (30 + points * 5) * 60 * 1000,
    ransom: 500000 + points * 100000
  }
}

export function computeCrimeScore(data = {}) {
  const crimeData = data || {}
  return Object.entries(CRIME_SCORES)
    .reduce((total, [crime, weight]) => total + (Number(crimeData[crime]) || 0) * weight, 0)
}

export function getActiveCrimeScore(data = {}) {
  const crimeData = data || {}
  return Math.max(0, computeCrimeScore(crimeData) - (Number(crimeData.pardonedScore) || 0))
}

export function recordEscapeCrime(db, jid, type = 'kabur') {
  if (!['kabur', 'breakout'].includes(type)) {
    throw new Error(`Jenis kabur tidak dikenal: ${type}`)
  }

  if (!db.crime || typeof db.crime !== 'object') db.crime = {}
  if (!db.crime[jid] || typeof db.crime[jid] !== 'object') {
    db.crime[jid] = {
      copet: 0,
      rampok: 0,
      jarah: 0,
      culik: 0,
      begal: 0,
      bunuh: 0,
      kabur: 0,
      breakout: 0
    }
  }

  const crimeData = db.crime[jid]
  crimeData[type] = (Number(crimeData[type]) || 0) + 1
  if (!db.prisonStats || typeof db.prisonStats !== 'object') db.prisonStats = {}
  if (!db.prisonStats[jid] || typeof db.prisonStats[jid] !== 'object') {
    db.prisonStats[jid] = { routine: 0, talk: 0, escapeCount: 0 }
  }
  const stats = db.prisonStats[jid]
  stats.escapeCount = (Number(stats.escapeCount) || (stats.escaped ? 1 : 0)) + 1
  stats[type === 'breakout' ? 'breakoutCount' : 'soloEscapeCount'] =
    (Number(stats[type === 'breakout' ? 'breakoutCount' : 'soloEscapeCount']) || 0) + 1
  stats.escaped = true
  crimeData.total = computeCrimeScore(crimeData)
  return crimeData
}

export function syncAllEscapeCrimeCounts(db) {
  if (!db.crime || typeof db.crime !== 'object') db.crime = {}
  for (const [jid, stats] of Object.entries(db.prisonStats || {})) {
    const escapeCount = Number(stats?.escapeCount) || (stats?.escaped ? 1 : 0)
    if (escapeCount > 0 && !db.crime[jid]) {
      db.crime[jid] = {
        copet: 0,
        rampok: 0,
        jarah: 0,
        culik: 0,
        begal: 0,
        bunuh: 0,
        kabur: Number(stats.soloEscapeCount) || 0,
        breakout: Number(stats.breakoutCount) || 0
      }
    }
  }
  for (const jid of Object.keys(db.crime || {})) syncEscapeCrimeCounts(db, jid)
}

export function syncEscapeCrimeCounts(db, jid) {
  if (!db.crime || typeof db.crime !== 'object') db.crime = {}
  if (!db.prisonStats || typeof db.prisonStats !== 'object') db.prisonStats = {}
  const statsKey = [jid, global.lids?.[jid], global.db?.data?.lids?.[jid]]
    .find(key => key && db.prisonStats[key])
  const stats = statsKey ? db.prisonStats[statsKey] : null
  let crimeData = db.crime?.[jid]
  if (!crimeData) {
    const escapeCount = Number(stats?.escapeCount) || (stats?.escaped ? 1 : 0)
    if (!escapeCount) return null
    crimeData = db.crime[jid] = {
      copet: 0,
      rampok: 0,
      jarah: 0,
      culik: 0,
      begal: 0,
      bunuh: 0,
      kabur: Number(stats.soloEscapeCount) || 0,
      breakout: Number(stats.breakoutCount) || 0
    }
  }
  const escapeStats = stats || (db.prisonStats[jid] = {})
  const escapeCount = Math.max(
    Number(crimeData.kabur) + Number(crimeData.breakout) || 0,
    Number(escapeStats.escapeCount) || (escapeStats.escaped ? 1 : 0)
  )
  const recordedCount = (Number(crimeData.kabur) || 0) + (Number(crimeData.breakout) || 0)
  if (escapeCount > recordedCount) {
    crimeData.kabur = (Number(crimeData.kabur) || 0) + escapeCount - recordedCount
  }
  escapeStats.escapeCount = escapeCount
  escapeStats.escaped = escapeCount > 0
  crimeData.total = computeCrimeScore(crimeData)
  return { kabur: Number(crimeData.kabur) || 0, breakout: Number(crimeData.breakout) || 0, total: escapeCount }
}

export function getCrimeScoreSummary(data = {}) {
  const crimeData = data || {}
  const normalized = {
    rampok: Number(crimeData.rampok) || 0,
    jarah: Number(crimeData.jarah) || 0,
    culik: Number(crimeData.culik) || 0,
    bunuh: Number(crimeData.bunuh) || 0,
    begal: Number(crimeData.begal) || 0,
    copet: Number(crimeData.copet) || 0,
    kabur: Number(crimeData.kabur) || 0,
    breakout: Number(crimeData.breakout) || 0
  }

  return {
    ...normalized,
    total: computeCrimeScore(normalized),
    weight: { ...CRIME_SCORES }
  }
}
