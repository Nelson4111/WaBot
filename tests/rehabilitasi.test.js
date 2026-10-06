import assert from 'node:assert/strict'
import { computeCrimeScore, getActiveCrimeScore } from '../lib/crimeHelper.js'
import { getCrimeRestriction } from '../lib/rpgDifficulty.js'
import {
  applyRehabilitationPayment,
  completeRehabilitation,
  getRehabilitationCompletion,
  getRehabilitationPaymentStatus,
  getRehabilitationRequirements,
  REHABILITATION_FEE,
  REHABILITATION_DAY_MS,
  REHABILITATION_SOCIAL_COOLDOWN_MS,
  REHABILITATION_WORK_COOLDOWN_MS,
  startRehabilitation
} from '../lib/rehabilitationHelper.js'
import { isPatrolExemptCommand } from '../lib/patrolHelper.js'

const lowRequirements = getRehabilitationRequirements(2)
const highRequirements = getRehabilitationRequirements(10)
assert.ok(highRequirements.durationMs > lowRequirements.durationMs)
assert.ok(highRequirements.requiredProgress > lowRequirements.requiredProgress)
assert.equal(lowRequirements.durationMs, 20 * 60 * 1000)
assert.equal(highRequirements.durationMs, 100 * 60 * 1000)
assert.equal(lowRequirements.requiredPayments, 1)
assert.equal(highRequirements.requiredPayments, 1)
assert.equal(REHABILITATION_WORK_COOLDOWN_MS, 2 * 60 * 1000)
assert.equal(REHABILITATION_SOCIAL_COOLDOWN_MS, 4 * 60 * 1000)
for (const command of ['rh', 'rehabilitasi']) {
  for (const action of ['', 'mulai', 'bayar', 'kerja', 'sosial', 'progres', 'batal', 'info', 'guide', 'command', 'list']) {
    assert.equal(isPatrolExemptCommand(command, action ? [action] : []), true)
  }
}

const now = 1_000_000
assert.deepEqual(getRehabilitationPaymentStatus({ paidDays: 1, requiredPayments: 1 }), {
  requiredAmount: REHABILITATION_FEE,
  paidAmount: REHABILITATION_FEE,
  remainingAmount: 0
})
assert.throws(() => applyRehabilitationPayment({}, 0), RangeError)
assert.throws(() => applyRehabilitationPayment({}, 1.5), RangeError)

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
process.socialActivities = 1
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 75000)
assert.equal(process.progress, process.requiredProgress)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 50000)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 25000)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 0)
assert.equal(process.progress, process.requiredProgress + 1)
assert.deepEqual(getRehabilitationPaymentStatus(process), {
  requiredAmount: REHABILITATION_FEE,
  paidAmount: REHABILITATION_FEE,
  remainingAmount: 0
})
assert.equal(process.paidDays, process.requiredPayments)
assert.equal('lastPaidAt' in process, false)
assert.equal(getRehabilitationCompletion(rpg, process.completesAt - 1).ready, false)
assert.equal(completeRehabilitation(rpg, crimeData, process.completesAt), true)
assert.equal(getActiveCrimeScore(crimeData), 0)
assert.equal(computeCrimeScore(crimeData), totalCrimeScore)
assert.equal(rpg.rehabilitation.status, 'completed')

crimeData.copet += 1
assert.equal(getActiveCrimeScore(crimeData), 1)
assert.equal(REHABILITATION_DAY_MS, 24 * 60 * 60 * 1000)

console.log('rehabilitation tests passed')
