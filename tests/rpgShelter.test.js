import assert from 'node:assert/strict'
import { returnAllShelterResidents } from '../lib/rpgShelter.js'

const now = 1763474400000
const data = {
  users: {
    '111@s.whatsapp.net': {
      rpg: {
        kids: [],
        shelterKids: [{ nama: 'Anak', shelterStatus: { reason: 'runaway' } }],
        pets: [],
        shelterPets: [{ tipe: 'kucing', energy: 10, happy: 20, dirty: 80, neglectStartedAt: now - 1 }],
        shelterLivestock: [{ type: 'sapi', count: 2 }],
        ternak: {},
        lastLivestockCareAt: {}
      }
    },
    '222@s.whatsapp.net': {
      kids: [],
      shelterKids: [],
      pets: [],
      shelterPets: [],
      shelterLivestock: [{ type: 'ayam', count: 3 }],
      ternak: {}
    },
    'dummy@s.whatsapp.net': {
      isDummy: true,
      rpg: { shelterKids: [{ nama: 'Dummy' }] }
    }
  }
}

assert.deepEqual(returnAllShelterResidents(data, now), {
  owners: 2,
  children: 1,
  pets: 1,
  livestock: 5
})

const firstOwner = data.users['111@s.whatsapp.net'].rpg
assert.equal(firstOwner.shelterKids.length, 0)
assert.equal(firstOwner.kids[0].shelterStatus, undefined)
assert.equal(firstOwner.kids[0].lastCaredAt, now)
assert.equal(firstOwner.shelterPets.length, 0)
assert.equal(firstOwner.pets[0].energy, 50)
assert.equal(firstOwner.pets[0].happy, 50)
assert.equal(firstOwner.pets[0].dirty, 30)
assert.equal(firstOwner.pets[0].neglectStartedAt, undefined)
assert.equal(firstOwner.ternak.sapi, 2)
assert.equal(firstOwner.lastLivestockCareAt.sapi, now)
assert.equal(data.users['222@s.whatsapp.net'].ternak.ayam, 3)
assert.equal(returnAllShelterResidents(data, now).livestock, 0)
assert.equal(data.users['dummy@s.whatsapp.net'].rpg.shelterKids.length, 1)

console.log('rpg shelter tests passed')
