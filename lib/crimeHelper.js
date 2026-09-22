export const CRIME_SCORES = Object.freeze({
  rampok: 4,
  bunuh: 3,
  begal: 2,
  copet: 1
})

export function computeCrimeScore(data = {}) {
  const crimeData = data || {}
  return (
    (Number(crimeData.rampok) || 0) * CRIME_SCORES.rampok +
    (Number(crimeData.bunuh) || 0) * CRIME_SCORES.bunuh +
    (Number(crimeData.begal) || 0) * CRIME_SCORES.begal +
    (Number(crimeData.copet) || 0) * CRIME_SCORES.copet
  )
}

export function getCrimeScoreSummary(data = {}) {
  const crimeData = data || {}
  const normalized = {
    rampok: Number(crimeData.rampok) || 0,
    bunuh: Number(crimeData.bunuh) || 0,
    begal: Number(crimeData.begal) || 0,
    copet: Number(crimeData.copet) || 0
  }

  return {
    ...normalized,
    total: computeCrimeScore(normalized),
    weight: { ...CRIME_SCORES }
  }
}
