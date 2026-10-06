import assert from 'node:assert/strict'
import { computeCrimeScore, getActiveCrimeScore } from '../lib/crimeHelper.js'
import { getCrimeRestriction } from '../lib/rpgDifficulty.js'
import {
  completeRehabilitation,
  getRehabilitationCompletion,
  getRehabilitationRequirements,
  REHABILITATION_DAY_MS,
  startRehabilitation
} from '../lib/rehabilitationHelper.js'

const lowRequirements = getRehabilitationRequirements(2)
const highRequirements = getRehabilitationRequirements(10)
assert.ok(highRequirements.durationMs > lowRequirements.durationMs)
assert.ok(highRequirements.requiredProgress > lowRequirements.requiredProgress)
assert.ok(highRequirements.requiredPayments > lowRequirements.requiredPayments)

const now = 1_000_000
const rpg = {}
assert.equal(startRehabilitation(rpg, 2, now), true)
assert.equal(startRehabilitation(rpg, 2, now), false)
assert.equal(getCrimeRestriction(rpg), '🕊️ Kamu sedang menjalani rehabilitasi dan tidak bisa melakukan tindak kriminal.')
assert.equal(getCrimeRestriction(rpg, { target: true }), '🕊️ Target sedang menjalani rehabilitasi dan tidak bisa menjadi sasaran tindak kriminal.')

const crimeData = { rampok: 1, copet: 2 }
const totalCrimeScore = computeCrimeScore(crimeData)
assert.equal(getActiveCrimeScore(crimeData), totalCrimeScore)
assert.equal(completeRehabilitation(rpg, crimeData, now + rpg.rehabilitation.completesAt), false)

const process = rpg.rehabilitation
process.progress = process.requiredProgress
process.paidDays = process.requiredPayments
process.socialActivities = 1
assert.equal(getRehabilitationCompletion(rpg, process.completesAt - 1).ready, false)
assert.equal(completeRehabilitation(rpg, crimeData, process.completesAt), true)
assert.equal(getActiveCrimeScore(crimeData), 0)
assert.equal(computeCrimeScore(crimeData), totalCrimeScore)
assert.equal(rpg.rehabilitation.status, 'completed')

crimeData.copet += 1
assert.equal(getActiveCrimeScore(crimeData), 1)
assert.equal(REHABILITATION_DAY_MS, 24 * 60 * 60 * 1000)

console.log('rehabilitation tests passed')
