export const RPG_CRIME_TYPES = Object.freeze([
  Object.freeze({ key: 'rampok', label: 'Rampok', emoji: '🕵️', score: 4 }),
  Object.freeze({ key: 'jarah', label: 'Jarah', emoji: '🏚️', score: 4 }),
  Object.freeze({ key: 'culik', label: 'Culik', emoji: '🕶️', score: 3 }),
  Object.freeze({ key: 'bunuh', label: 'Bunuh', emoji: '🔪', score: 3 }),
  Object.freeze({ key: 'begal', label: 'Begal', emoji: '🏴‍☠️', score: 2 }),
  Object.freeze({ key: 'copet', label: 'Copet', emoji: '🤏', score: 1 }),
  Object.freeze({ key: 'kabur', label: 'Kabur sendiri', emoji: '🏃', score: 5 }),
  Object.freeze({ key: 'breakout', label: 'Breakout', emoji: '🧱', score: 5 })
])

export const KIDNAP_ESCAPE_COOLDOWN = 60 * 1000
export const KIDNAP_ESCAPE_WINDOW = 5 * 60 * 1000

export function createRpgCrimeRecord(initialValues = {}) {
  return {
    ...Object.fromEntries(RPG_CRIME_TYPES.map(({ key }) => [key, 0])),
    total: 0,
    ...initialValues
  }
}

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
    caseLabel: '🕶️ Culik',
    escapeCooldown: KIDNAP_ESCAPE_COOLDOWN,
    escapeWindow: KIDNAP_ESCAPE_WINDOW
  }
})
