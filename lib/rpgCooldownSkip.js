import { RPG_CRIME_ACTIONS } from './rpgCrimeData.js'
import { scaleDifficultyCooldown } from './rpgDifficulty.js'

export const SKIPCD_COST_PER_MINUTE = 100000
export const SKIPCD_CONFIRMATION_TTL = 60 * 1000

const MINUTE = 60 * 1000
const CRIME_COOLDOWNS = [
  { id: 'copet', label: 'Copet', field: 'lastcopet', duration: 5 * MINUTE },
  { id: 'rampok', label: 'Rampok', field: 'lastrob', duration: 12 * 60 * MINUTE },
  { id: 'begal', label: 'Begal', field: 'lastbegal', duration: 60 * MINUTE },
  { id: 'jarah', label: 'Jarah', field: 'lastjarah', duration: RPG_CRIME_ACTIONS.jarah.cooldown },
  { id: 'culik', label: 'Culik', field: 'lastculik', duration: RPG_CRIME_ACTIONS.culik.cooldown },
  { id: 'bunuh', label: 'Bunuh', field: 'lastbunuh', duration: 12 * 60 * MINUTE },
  { id: 'fitnah', label: 'Fitnah', field: 'fitnah', duration: 2.5 * MINUTE, usesAccountTimestamp: true }
]

const COOLDOWN_TARGETS = {
  mining: {
    label: 'Mining',
    aliases: ['mining', 'tambang'],
    field: 'lastMining',
    duration: 2 * MINUTE
  },
  mancing: {
    label: 'Mancing',
    aliases: ['mancing', 'fishing'],
    field: 'lastMancing',
    duration: MINUTE
  },
  dungeon: {
    label: 'Dungeon',
    aliases: ['dungeon'],
    field: 'lastDungeon',
    duration: 2 * MINUTE
  },
  adventure: {
    label: 'Adventure',
    aliases: ['adventure'],
    field: 'lastAdventure',
    duration: 2 * MINUTE
  },
  work: {
    label: 'Work RPG',
    aliases: ['work', 'kerja'],
    field: 'lastkerja',
    duration: 2 * MINUTE
  },
  kawin: {
    label: 'Kawin ternak',
    aliases: ['kawin'],
    field: 'cooldown.kawin',
    duration: 7 * 60 * MINUTE
  },
  explore: {
    label: 'Explore',
    aliases: ['explore', 'penjelajahan'],
    field: 'lastExplore',
    duration: 15 * MINUTE
  }
}

function normalizeTimestamp(value) {
  const timestamp = Number(value) || 0
  return timestamp > 0 && timestamp < 1e12 ? timestamp * 1000 : timestamp
}

function getTimestamp(rpg, fitnahTimestamp, field) {
  if (field === 'fitnah') return normalizeTimestamp(fitnahTimestamp)
  if (field === 'cooldown.kawin') return normalizeTimestamp(rpg.cooldown?.kawin)
  return normalizeTimestamp(rpg[field])
}

export function resolveSkipCooldownTarget(value) {
  const target = String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (['kriminal', 'crime', 'semua kriminal', 'semua tindak kriminal'].includes(target)) {
    return 'kriminal'
  }
  return Object.entries(COOLDOWN_TARGETS)
    .find(([, config]) => config.aliases.includes(target))?.[0] || null
}

export function getSkipCooldownEntries(rpg, fitnahTimestamp, now = Date.now()) {
  const activities = Object.entries(COOLDOWN_TARGETS).map(([id, config]) => {
    const timestamp = getTimestamp(rpg, fitnahTimestamp, config.field)
    const duration = id === 'kawin'
      ? Number(rpg.kawinCooldownDuration) || config.duration
      : config.duration
    const remaining = timestamp
      ? scaleDifficultyCooldown(rpg, duration) - (now - timestamp)
      : 0
    return {
      id,
      group: 'activity',
      label: config.label,
      field: config.field,
      timestamp,
      remaining: Math.max(0, remaining)
    }
  })

  const crimes = CRIME_COOLDOWNS.map(config => {
    const timestamp = getTimestamp(rpg, fitnahTimestamp, config.field)
    const remaining = timestamp
      ? scaleDifficultyCooldown(rpg, config.duration) - (now - timestamp)
      : 0
    return {
      id: config.id,
      group: 'kriminal',
      label: config.label,
      field: config.field,
      usesAccountTimestamp: Boolean(config.usesAccountTimestamp),
      timestamp,
      remaining: Math.max(0, remaining)
    }
  })

  return [...activities, ...crimes]
    .filter(({ remaining }) => remaining > 0)
    .map(entry => ({
      ...entry,
      cost: Math.ceil(entry.remaining / MINUTE) * SKIPCD_COST_PER_MINUTE
    }))
}

export function selectSkipCooldownEntries(target, entries) {
  if (target === 'kriminal') return entries.filter(({ group }) => group === 'kriminal')
  return entries.filter(({ id }) => id === target)
}

export function clearSkipCooldownEntries(rpg, db, jid, entries) {
  for (const entry of entries) {
    if (entry.usesAccountTimestamp) {
      if (!db.fitnah || typeof db.fitnah !== 'object') db.fitnah = {}
      db.fitnah[jid] = 0
    } else if (entry.field === 'cooldown.kawin') {
      if (!rpg.cooldown || typeof rpg.cooldown !== 'object') rpg.cooldown = {}
      rpg.cooldown.kawin = 0
    } else {
      rpg[entry.field] = 0
    }
  }
}
