import assert from 'node:assert/strict'
import { computeCrimeScore, getActiveCrimeScore } from '../lib/crimeHelper.js'
import { getCrimeRestriction } from '../lib/rpgDifficulty.js'
import {
  applyRehabilitationPayment,
  completeRehabilitation,
  getRehabilitationCompletion,
  getRehabilitationPaymentStatus,
  getRehabilitationRequirements,
  REHABILITATION_ACTIVITY_COOLDOWNS,
  REHABILITATION_FEE,
  REHABILITATION_DAY_MS,
  REHABILITATION_SOCIAL_COOLDOWN_MS,
  REHABILITATION_WORK_COOLDOWN_MS,
  startRehabilitation
} from '../lib/rehabilitationHelper.js'
import { isPatrolExemptCommand } from '../lib/patrolHelper.js'
import { registerPrisoner } from '../lib/prisonHelper.js'

const lowRequirements = getRehabilitationRequirements(2)
const highRequirements = getRehabilitationRequirements(10)
assert.ok(highRequirements.durationMs > lowRequirements.durationMs)
assert.ok(highRequirements.requiredProgress > lowRequirements.requiredProgress)
assert.equal(lowRequirements.durationMs, 20 * 60 * 1000)
assert.equal(highRequirements.durationMs, 100 * 60 * 1000)
assert.equal(lowRequirements.requiredPayments, 1)
assert.equal(highRequirements.requiredPayments, 1)
assert.equal(lowRequirements.requiredFee, 2 * REHABILITATION_FEE)
assert.equal(highRequirements.requiredFee, 10 * REHABILITATION_FEE)
assert.equal(REHABILITATION_SOCIAL_COOLDOWN_MS, 4 * 60 * 1000)
assert.equal(REHABILITATION_WORK_COOLDOWN_MS, REHABILITATION_SOCIAL_COOLDOWN_MS)
assert.deepEqual(Object.keys(REHABILITATION_ACTIVITY_COOLDOWNS), ['kerja', 'sosial', 'ibadah', 'olahraga', 'belajar'])
assert.equal(REHABILITATION_ACTIVITY_COOLDOWNS.kerja, REHABILITATION_WORK_COOLDOWN_MS)
assert.equal(REHABILITATION_ACTIVITY_COOLDOWNS.sosial, REHABILITATION_SOCIAL_COOLDOWN_MS)
for (const command of ['rh', 'rehabilitasi']) {
  for (const action of ['', 'mulai', 'start', 'bayar', 'kerja', 'sosial', 'ibadah', 'olahraga', 'belajar', 'cd', 'lapor', 'progres', 'batal', 'info', 'guide', 'command', 'list']) {
    assert.equal(isPatrolExemptCommand(command, action ? [action] : []), true)
  }
}

const now = 1_000_000
assert.deepEqual(getRehabilitationPaymentStatus({ paidDays: 1, requiredPayments: 1 }), {
  requiredAmount: REHABILITATION_FEE,
  paidAmount: REHABILITATION_FEE,
  remainingAmount: 0
})
assert.deepEqual(getRehabilitationPaymentStatus({
  crimeScore: 4,
  requiredFee: REHABILITATION_FEE,
  paidAmount: 0
}), {
  requiredAmount: 4 * REHABILITATION_FEE,
  paidAmount: 0,
  remainingAmount: 4 * REHABILITATION_FEE
})
assert.throws(() => applyRehabilitationPayment({}, 0), RangeError)
assert.throws(() => applyRehabilitationPayment({}, 1.5), RangeError)

const rpg = { darah: 100, difficulty: 'normal' }
assert.equal(startRehabilitation(rpg, 2, now), true)
assert.equal(startRehabilitation(rpg, 2, now), false)
assert.equal(getCrimeRestriction(rpg), '🕊️ Kamu sedang menjalani rehabilitasi dan tidak bisa melakukan tindak kriminal.')
assert.equal(getCrimeRestriction(rpg, { target: true }), null)
const completionTime = rpg.rehabilitation.completesAt
const requiredProgress = rpg.rehabilitation.requiredProgress
assert.equal(getRehabilitationCompletion(rpg, completionTime - 1).reason, 'time')
rpg.rehabilitation.progress = requiredProgress
assert.equal(getRehabilitationCompletion(rpg, completionTime).reason, 'payments')
rpg.rehabilitation.paidAmount = rpg.rehabilitation.requiredFee
assert.equal(getRehabilitationCompletion(rpg, completionTime).reason, 'social')
rpg.rehabilitation.socialActivities = 1
assert.equal(getRehabilitationCompletion(rpg, completionTime).ready, true)
assert.equal(getRehabilitationCompletion(rpg, completionTime - 1).ready, false)

const crimeData = { rampok: 1, copet: 2 }
const totalCrimeScore = computeCrimeScore(crimeData)
assert.equal(getActiveCrimeScore(crimeData), totalCrimeScore)
assert.equal(getRehabilitationCompletion(rpg, now + rpg.rehabilitation.completesAt).reason, 'progress')
assert.equal(completeRehabilitation(rpg, crimeData, now + rpg.rehabilitation.completesAt), false)

const process = rpg.rehabilitation
process.progress = 0
process.socialActivities = 0
process.paidAmount = 0
process.progress = process.requiredProgress
process.socialActivities = 1
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 175000)
assert.equal(process.progress, process.requiredProgress)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 150000)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 125000)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 100000)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 75000)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 50000)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 25000)
assert.equal(applyRehabilitationPayment(process, 25000).remainingAmount, 0)
assert.equal(process.progress, process.requiredProgress + 1)
assert.deepEqual(getRehabilitationPaymentStatus(process), {
  requiredAmount: 2 * REHABILITATION_FEE,
  paidAmount: 2 * REHABILITATION_FEE,
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

const protectedJid = 'rehab@s.whatsapp.net'
const protectedRpg = {
  rehabilitation: { status: 'active' },
  penjara: now,
  lamaPenjara: 60000,
  tebusan: 1000,
  sel: 'A1',
  kasus: 'test'
}
global.db = { data: { users: { [protectedJid]: { rpg: protectedRpg } } } }
const prisonDB = { users: { [protectedJid]: { rpg: protectedRpg } }, penjara: [] }
assert.equal(registerPrisoner(prisonDB, protectedJid), null)
assert.deepEqual(prisonDB.penjara, [])
assert.equal(protectedRpg.rehabilitation.status, 'active')
assert.equal(protectedRpg.penjara, null)
assert.equal(protectedRpg.lamaPenjara, 0)

console.log('rehabilitation tests passed')
