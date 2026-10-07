export const RPG_CRIME_ACTIONS = Object.freeze({
  jarah: {
    label: 'Jarah',
    type: 'homeRaid',
    cooldown: 12 * 60 * 60 * 1000,
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
    cooldown: 24 * 60 * 60 * 1000,
    successChance: 0.62,
    failurePenaltyRate: 0.08,
    failurePenaltyMin: 20000,
    failurePenaltyMax: 500000,
    prisonDuration: 4 * 60 * 60 * 1000,
    ransom: 4000000,
    caseLabel: '🕶️ Culik'
  }
})
