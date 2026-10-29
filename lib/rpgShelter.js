import { computeCrimeScore } from './crimeHelper.js'
import { getRpgWibDateKey } from './rpgTime.js'

export const LIVESTOCK_NEGLECT_TIMEOUT = 7 * 24 * 60 * 60 * 1000
export const SHELTER_CRIME_POINTS_PER_DAY = 2
export const SHELTER_CRIME_DAILY_CAP = 50
export const SHELTER_RETRIEVE_BASE_FEE = 100000
export const SHELTER_RETRIEVE_DAILY_FEE = 100000

const getShelterResidents = user => [
  ...(Array.isArray(user.shelterKids) ? user.shelterKids : []),
  ...(Array.isArray(user.shelterPets) ? user.shelterPets : []),
  ...(Array.isArray(user.shelterLivestock) ? user.shelterLivestock : [])
]

const getDateOrdinal = dateKey => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000)
}

export function processLivestockNeglect(user, now = Date.now()) {
  if (!user.ternak || typeof user.ternak !== 'object' || Array.isArray(user.ternak)) user.ternak = {}
  if (!user.lastLivestockCareAt || typeof user.lastLivestockCareAt !== 'object') user.lastLivestockCareAt = {}
  if (!user.lastLivestockHarvest || typeof user.lastLivestockHarvest !== 'object') user.lastLivestockHarvest = {}
  if (!Array.isArray(user.shelterLivestock)) user.shelterLivestock = []

  const escapedLivestock = []
  let changed = false
  for (const [field, merge] of [
    ['ternak', (current, value) => (Number(current) || 0) + (Number(value) || 0)],
    ['lastLivestockCareAt', (current, value) => Math.max(Number(current) || 0, Number(value) || 0)],
    ['lastLivestockHarvest', (current, value) => Math.max(Number(current) || 0, Number(value) || 0)]
  ]) {
    const normalized = {}
    for (const [type, value] of Object.entries(user[field])) {
      const key = type.toLowerCase()
      normalized[key] = Object.prototype.hasOwnProperty.call(normalized, key)
        ? merge(normalized[key], value)
        : value
      if (key !== type) changed = true
    }
    if (Object.keys(normalized).length !== Object.keys(user[field]).length) changed = true
    user[field] = normalized
  }

  for (const [type, rawCount] of Object.entries(user.ternak)) {
    const count = Math.floor(Number(rawCount) || 0)
    if (count <= 0) continue

    const lastCareAt = Number(user.lastLivestockCareAt[type])
    if (!Number.isFinite(lastCareAt) || lastCareAt <= 0) {
      user.lastLivestockCareAt[type] = now
      changed = true
      continue
    }
    if (now - lastCareAt < LIVESTOCK_NEGLECT_TIMEOUT) continue

    const entry = {
      type,
      count,
      enteredAt: now,
      shelterStatus: { reason: 'runaway', enteredAt: now },
      shelterCrimeTicks: 0,
      shelterCrimeDate: getRpgWibDateKey(now)
    }
    const existing = user.shelterLivestock.find(resident => resident.type === type)
    if (existing) {
      existing.count = (Number(existing.count) || 0) + count
      escapedLivestock.push({ ...entry })
    } else {
      user.shelterLivestock.push(entry)
      escapedLivestock.push(entry)
    }
    delete user.ternak[type]
    delete user.lastLivestockCareAt[type]
    delete user.lastLivestockHarvest[type]
    changed = true
  }

  return { escapedLivestock, changed }
}

export function recordLivestockCare(user, type, now = Date.now()) {
  if (!user.lastLivestockCareAt || typeof user.lastLivestockCareAt !== 'object') user.lastLivestockCareAt = {}
  user.lastLivestockCareAt[type] = now
}

export function getShelterRetrieveFee(resident, now = Date.now(), isLivestock = false) {
  const enteredAt = Number(resident.shelterStatus?.enteredAt || resident.enteredAt) || now
  const daysInShelter = Math.max(0, Math.floor((now - enteredAt) / 86400000))
  const headCount = isLivestock ? Math.max(1, Math.floor(Number(resident.count) || 1)) : 1
  return (SHELTER_RETRIEVE_BASE_FEE + daysInShelter * SHELTER_RETRIEVE_DAILY_FEE) * headCount
}

export function processShelterCrime(user, crimeDB, jid, now = Date.now()) {
  const residents = getShelterResidents(user)
  if (!residents.length) return { changed: false, pointsAdded: 0 }

  if (!user.shelterCrimeCounters || typeof user.shelterCrimeCounters !== 'object') {
    user.shelterCrimeCounters = {}
  }
  const today = getRpgWibDateKey(now)
  const isRehabilitationActive = user.rehabilitation?.status === 'active'
  let changed = false
  let pointsAdded = 0

  const shelterKinds = new Map()
  for (const resident of residents) {
    const isLivestock = Boolean(resident.type)
    const key = isLivestock
      ? `livestock:${resident.type}`
      : resident.nama
        ? `child:${resident.nama}`
        : resident.tipe
          ? `pet:${resident.tipe}`
          : `resident:${resident.shelterStatus?.enteredAt || resident.enteredAt || 0}`
    if (!shelterKinds.has(key)) shelterKinds.set(key, [])
    shelterKinds.get(key).push(resident)
  }

  for (const [key, kindResidents] of shelterKinds) {
    const enteredAt = Math.min(...kindResidents.map(resident =>
      Number(resident.shelterStatus?.enteredAt || resident.enteredAt) || now
    ))
    const representative = kindResidents[0]
    let counter = user.shelterCrimeCounters[key]
    if (!counter || typeof counter !== 'object') {
      counter = user.shelterCrimeCounters[key] = {
        ticks: Math.max(0, Math.floor(Number(representative.shelterCrimeTicks) || 0)),
        date: typeof representative.shelterCrimeDate === 'string'
          ? representative.shelterCrimeDate
          : getRpgWibDateKey(enteredAt)
      }
      changed = true
    }
    let ticks = Math.max(0, Math.min(SHELTER_CRIME_DAILY_CAP, Math.floor(Number(counter.ticks) || 0)))
    const lastDate = typeof counter.date === 'string' ? counter.date : getRpgWibDateKey(enteredAt)
    const enteredDate = getRpgWibDateKey(enteredAt)
    if (isRehabilitationActive) {
      if (counter.date !== today || counter.ticks !== ticks) changed = true
      counter.date = today
      counter.ticks = ticks
      for (const resident of kindResidents) {
        resident.shelterCrimeDate = today
        resident.shelterCrimeTicks = ticks
      }
      continue
    }

    const eligibleDays = Math.max(0, getDateOrdinal(today) - Math.max(getDateOrdinal(lastDate), getDateOrdinal(enteredDate) - 1))
    const addedTicks = Math.min(eligibleDays, SHELTER_CRIME_DAILY_CAP - ticks)
    if (addedTicks > 0) {
      pointsAdded += addedTicks * SHELTER_CRIME_POINTS_PER_DAY
      ticks += addedTicks
      changed = true
    }
    if (counter.date !== today || counter.ticks !== ticks) changed = true
    counter.date = today
    counter.ticks = ticks
    for (const resident of kindResidents) {
      resident.shelterCrimeDate = today
      resident.shelterCrimeTicks = ticks
    }
  }

  if (pointsAdded > 0) {
    if (!crimeDB[jid]) crimeDB[jid] = {}
    crimeDB[jid].shelterNeglectPoints =
      (Number(crimeDB[jid].shelterNeglectPoints) || 0) + pointsAdded
    crimeDB[jid].total = computeCrimeScore(crimeDB[jid])
    changed = true
  }

  return { changed, pointsAdded }
}

export function resetShelterCrimeCounters(user, now = Date.now()) {
  const residents = getShelterResidents(user)
  const date = getRpgWibDateKey(now)
  if (!user.shelterCrimeCounters || typeof user.shelterCrimeCounters !== 'object') {
    user.shelterCrimeCounters = {}
  }
  const grouped = new Map()
  for (const resident of residents) {
    const key = resident.type
      ? `livestock:${resident.type}`
      : resident.nama
        ? `child:${resident.nama}`
        : resident.tipe
          ? `pet:${resident.tipe}`
          : `resident:${resident.shelterStatus?.enteredAt || resident.enteredAt || 0}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(resident)
  }
  for (const [key, kindResidents] of grouped) {
    user.shelterCrimeCounters[key] = { ticks: 0, date }
    for (const resident of kindResidents) {
      resident.shelterCrimeTicks = 0
      resident.shelterCrimeDate = date
    }
  }
  return residents.length
}
