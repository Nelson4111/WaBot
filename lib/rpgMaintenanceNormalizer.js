import { getRpgWibDateKey } from './rpgTime.js'

function getRpgProfile(account) {
  if (!account || typeof account !== 'object' || account.isDummy) return null
  if (account.rpg && typeof account.rpg === 'object') return account.rpg

  return ['pets', 'kids', 'shelterKids', 'dapur', 'ladang', 'dailyStreak']
    .some(key => key in account)
    ? account
    : null
}

function shiftWibDate(dateKey, days) {
  const timestamp = Date.parse(`${dateKey}T00:00:00+07:00`)
  return Number.isFinite(timestamp) ? getRpgWibDateKey(timestamp + days * 86400000) : ''
}

function getEligibleAccounts(data) {
  return Object.entries(data?.users || {})
    .map(([, account]) => ({ account, rpg: getRpgProfile(account) }))
    .filter(entry => entry.rpg)
}

export function previewRpgMaintenanceNormalization(data, {
  now = Date.now(),
  maintenanceStartedAt = now
} = {}) {
  const accounts = getEligibleAccounts(data)
  const summary = {
    players: accounts.length,
    petsRestored: 0,
    childrenReturned: 0,
    childrenReset: 0,
    mealsCompleted: 0,
    cropsReadied: 0,
    jobsUnlocked: 0,
    dailyStreaksProtected: 0,
    relationshipsRestored: 0
  }
  const today = getRpgWibDateKey(now)
  const maintenanceStartDate = getRpgWibDateKey(maintenanceStartedAt)
  const earliestProtectedDate = shiftWibDate(maintenanceStartDate, -1)

  for (const { account, rpg } of accounts) {
    summary.petsRestored += (Array.isArray(rpg.pets) ? rpg.pets.length : 0) +
      (Array.isArray(rpg.sanctuary) ? rpg.sanctuary.length : 0)
    const kids = Array.isArray(rpg.kids) ? rpg.kids : []
    summary.childrenReturned += (Array.isArray(rpg.shelterKids) ? rpg.shelterKids.length : 0) +
      (Array.isArray(rpg.orphanageKids) ? rpg.orphanageKids.length : 0) +
      kids.filter(child => child?.facility).length
    summary.childrenReset += (Array.isArray(rpg.kids) ? rpg.kids.length : 0) +
      (Array.isArray(rpg.shelterKids) ? rpg.shelterKids.length : 0) +
      (Array.isArray(rpg.orphanageKids) ? rpg.orphanageKids.length : 0)
    summary.mealsCompleted += Array.isArray(rpg.dapur?.antrian)
      ? rpg.dapur.antrian.filter(item => item && Number.isFinite(Number(item.selesai))).length
      : 0
    summary.cropsReadied += Object.values(rpg.ladang || {})
      .filter(plant => plant && typeof plant === 'object' && Number.isFinite(Number(plant.waktuTanam)))
      .length
    summary.jobsUnlocked += Object.values(rpg.jobWorkCooldowns || {})
      .filter(readyAt => Number(readyAt) > now).length
    if (!Object.keys(rpg.jobWorkCooldowns || {}).length && Number(rpg.lastkerja) > 0) {
      summary.jobsUnlocked += Math.max(1, Array.isArray(rpg.activeJobNames) ? rpg.activeJobNames.length : 0)
    }

    const lastDaily = Number(account.lastDaily || rpg.lastDaily) || 0
    const dailyDate = account.dailyDate || rpg.dailyDate ||
      (lastDaily ? getRpgWibDateKey(lastDaily) : '')
    const streak = Math.max(
      Number(account.dailyStreak) || 0,
      Number(rpg.dailyStreak) || 0
    )
    if (streak > 0 && dailyDate < today && dailyDate >= earliestProtectedDate) {
      summary.dailyStreaksProtected++
    }
  }

  for (const status of Object.values(data?.status || {})) {
    if (status && typeof status === 'object') summary.relationshipsRestored++
  }

  return summary
}

function restorePet(pet) {
  if (!pet || typeof pet !== 'object') return
  pet.energy = 100
  pet.happy = 100
  pet.dirty = 0
  pet.lastActivity = 0
  pet.lastFeed = 0
  pet.lastRest = 0
  pet.lastTrain = 0
  delete pet.mati
}

function restoreChild(child, now) {
  if (!child || typeof child !== 'object') return
  delete child.shelterStatus
  delete child.facility
  child.lastCaredAt = now
  child.lastNeglectCheckAt = now
  child.lastKidActivityAt = 0
  child.activityCooldowns = {}
}

export function normalizeRpgMaintenanceData(data, {
  now = Date.now(),
  maintenanceStartedAt = now
} = {}) {
  const summary = previewRpgMaintenanceNormalization(data, { now, maintenanceStartedAt })
  const today = getRpgWibDateKey(now)
  const yesterday = shiftWibDate(today, -1)
  const maintenanceStartDate = getRpgWibDateKey(maintenanceStartedAt)
  const earliestProtectedDate = shiftWibDate(maintenanceStartDate, -1)

  for (const { account, rpg } of getEligibleAccounts(data)) {
    const pets = Array.isArray(rpg.pets) ? rpg.pets : (rpg.pets = [])
    const sanctuary = Array.isArray(rpg.sanctuary) ? rpg.sanctuary : []
    for (const pet of pets) restorePet(pet)
    for (const pet of sanctuary) {
      restorePet(pet)
      pets.push(pet)
    }
    rpg.sanctuary = []
    if (rpg.cooldown && typeof rpg.cooldown === 'object') rpg.cooldown.petbattle = 0

    const kids = Array.isArray(rpg.kids) ? rpg.kids : (rpg.kids = [])
    const shelterKids = Array.isArray(rpg.shelterKids) ? rpg.shelterKids : []
    const orphanageKids = Array.isArray(rpg.orphanageKids) ? rpg.orphanageKids : []
    for (const child of [...kids, ...shelterKids, ...orphanageKids]) restoreChild(child, now)
    rpg.kids = [...kids, ...shelterKids, ...orphanageKids]
    rpg.shelterKids = []
    rpg.orphanageKids = []

    if (Array.isArray(rpg.dapur?.antrian)) {
      for (const meal of rpg.dapur.antrian) {
        if (meal && Number.isFinite(Number(meal.selesai))) meal.selesai = now
      }
    }

    for (const plant of Object.values(rpg.ladang || {})) {
      if (plant && typeof plant === 'object' && Number.isFinite(Number(plant.waktuTanam))) {
        plant.waktuTanam = 0
      }
    }

    if (rpg.jobWorkCooldowns && typeof rpg.jobWorkCooldowns === 'object') {
      for (const jobName of Object.keys(rpg.jobWorkCooldowns)) rpg.jobWorkCooldowns[jobName] = 0
    }
    if ('lastkerja' in rpg) rpg.lastkerja = 0

    const lastDaily = Number(account.lastDaily || rpg.lastDaily) || 0
    const dailyDate = account.dailyDate || rpg.dailyDate ||
      (lastDaily ? getRpgWibDateKey(lastDaily) : '')
    const streak = Math.max(
      Number(account.dailyStreak) || 0,
      Number(rpg.dailyStreak) || 0
    )
    if (streak > 0 && dailyDate < today && dailyDate >= earliestProtectedDate) {
      account.dailyDate = yesterday
      account.dailyStreak = streak
      account.lastDaily = 0
      rpg.dailyDate = yesterday
      rpg.dailyStreak = streak
      rpg.lastDaily = 0
    }
  }

  for (const [jid, status] of Object.entries(data?.status || {})) {
    if (!status || typeof status !== 'object') continue
    status.mood = 100
    status.lapar = 100
    if (!data.lastMoodTick) data.lastMoodTick = {}
    data.lastMoodTick[jid] = now
  }

  return summary
}
