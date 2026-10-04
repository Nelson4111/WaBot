export const CRIME_SCORES = Object.freeze({
  rampok: 4,
  bunuh: 3,
  begal: 2,
  copet: 1,
  kabur: 5,
  breakout: 5
})

export function getPatrolCaptureChance(score) {
  const points = Math.max(0, Number(score) || 0)
  if (!points) return 0
  return Math.min(0.75, 0.05 + points * 0.025)
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

export function recordEscapeCrime(db, jid, type = 'kabur') {
  if (!['kabur', 'breakout'].includes(type)) {
    throw new Error(`Jenis kabur tidak dikenal: ${type}`)
  }

  if (!db.crime || typeof db.crime !== 'object') db.crime = {}
  if (!db.crime[jid] || typeof db.crime[jid] !== 'object') {
    db.crime[jid] = { copet: 0, rampok: 0, begal: 0, bunuh: 0, kabur: 0, breakout: 0 }
  }

  const crimeData = db.crime[jid]
  crimeData[type] = (Number(crimeData[type]) || 0) + 1
  crimeData.total = computeCrimeScore(crimeData)
  return crimeData
}

export function getCrimeScoreSummary(data = {}) {
  const crimeData = data || {}
  const normalized = {
    rampok: Number(crimeData.rampok) || 0,
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
