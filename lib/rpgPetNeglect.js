const PET_NEEDS_TICK = 6 * 60 * 60 * 1000
const PET_NEGLECT_GRACE = 24 * 60 * 60 * 1000

const getPetNeeds = pet => ({
  energy: pet.energy == null || !Number.isFinite(Number(pet.energy)) ? 100 : Number(pet.energy),
  happy: pet.happy == null || !Number.isFinite(Number(pet.happy)) ? 50 : Number(pet.happy),
  dirty: pet.dirty == null || !Number.isFinite(Number(pet.dirty)) ? 0 : Number(pet.dirty)
})
const isPoorCondition = ({ energy, happy, dirty }) =>
  [energy <= 25, happy <= 25, dirty >= 80].filter(Boolean).length >= 2 ||
  energy <= 0 || happy <= 0 || dirty >= 100

export function processPetNeglect(user, now = Date.now()) {
  if (!Array.isArray(user.pets)) user.pets = []
  if (!Array.isArray(user.shelterPets)) user.shelterPets = []

  const escapedPets = []
  let changed = false

  for (let index = user.pets.length - 1; index >= 0; index--) {
    const pet = user.pets[index]
    let lastNeedsUpdateAt = Number(pet.lastNeedsUpdateAt)
    if (!Number.isFinite(lastNeedsUpdateAt) || lastNeedsUpdateAt <= 0) {
      lastNeedsUpdateAt = now
      pet.lastNeedsUpdateAt = now
      changed = true
    }

    const elapsedTicks = Math.floor(Math.max(0, now - lastNeedsUpdateAt) / PET_NEEDS_TICK)
    const needsBeforeDecay = getPetNeeds(pet)
    if (!pet.neglectStartedAt) {
      let neglectStartedAt = isPoorCondition(needsBeforeDecay) ? lastNeedsUpdateAt : 0
      if (!neglectStartedAt && elapsedTicks > 0) {
        let energy = needsBeforeDecay.energy
        let happy = needsBeforeDecay.happy
        let dirty = needsBeforeDecay.dirty
        for (let tick = 1; tick <= elapsedTicks; tick++) {
          energy = Math.max(0, energy - 8)
          happy = Math.max(0, happy - 6)
          dirty = Math.min(100, dirty + 8)
          if (isPoorCondition({ energy, happy, dirty })) {
            neglectStartedAt = lastNeedsUpdateAt + tick * PET_NEEDS_TICK
            break
          }
        }
      }
      if (neglectStartedAt) {
        pet.neglectStartedAt = neglectStartedAt
        changed = true
      }
    }

    if (elapsedTicks > 0) {
      const { energy, happy, dirty } = needsBeforeDecay
      pet.energy = Math.max(0, energy - elapsedTicks * 8)
      pet.happy = Math.max(0, happy - elapsedTicks * 6)
      pet.dirty = Math.min(100, dirty + elapsedTicks * 8)
      pet.lastNeedsUpdateAt = lastNeedsUpdateAt + elapsedTicks * PET_NEEDS_TICK
      changed = true
    }

    if (isPoorCondition(getPetNeeds(pet))) {
      if (!Number.isFinite(Number(pet.neglectStartedAt)) || Number(pet.neglectStartedAt) <= 0) {
        pet.neglectStartedAt = now
        changed = true
      }
      if (now - Number(pet.neglectStartedAt) >= PET_NEGLECT_GRACE) {
        pet.shelterStatus = { reason: 'runaway', enteredAt: now }
        user.shelterPets.push(pet)
        user.pets.splice(index, 1)
        escapedPets.unshift(pet)
        changed = true
      }
    } else if (pet.neglectStartedAt) {
      delete pet.neglectStartedAt
      changed = true
    }
  }

  return { escapedPets, changed }
}
