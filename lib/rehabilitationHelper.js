import { computeCrimeScore } from './crimeHelper.js'

export const REHABILITATION_DAY_MS = 24 * 60 * 60 * 1000
export const REHABILITATION_FEE = 100000
export const REHABILITATION_WORK_COOLDOWN_MS = 2 * 60 * 1000
export const REHABILITATION_SOCIAL_COOLDOWN_MS = 4 * 60 * 1000

export function getRehabilitationPaymentStatus(process) {
  const crimeScore = Math.max(1, Math.floor(Number(process?.crimeScore) || 0))
  const savedFee = Number(process?.requiredFee) || 0
  const requiredAmount = savedFee > REHABILITATION_FEE || crimeScore === 1
    ? savedFee || REHABILITATION_FEE * crimeScore
    : REHABILITATION_FEE * crimeScore
  const paidAmount = process?.paidAmount !== undefined
    ? Math.max(0, Number(process.paidAmount) || 0)
    : Math.min(requiredAmount, (Number(process?.paidDays) || 0) * REHABILITATION_FEE)
  return {
    requiredAmount,
    paidAmount: Math.min(requiredAmount, paidAmount),
    remainingAmount: Math.max(0, requiredAmount - paidAmount)
  }
}

export function applyRehabilitationPayment(process, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new RangeError('Nominal pembayaran rehabilitasi harus berupa bilangan bulat positif.')
  }

  const payment = getRehabilitationPaymentStatus(process)
  const paidAmount = payment.paidAmount + Math.min(amount, payment.remainingAmount)
  process.requiredFee = payment.requiredAmount
  process.paidAmount = paidAmount
  if (paidAmount >= payment.requiredAmount) {
    process.paidDays = Number(process.requiredPayments) || 1
  }
  if (payment.paidAmount < payment.requiredAmount && paidAmount >= payment.requiredAmount) {
    process.progress = (Number(process.progress) || 0) + 1
  }
  return getRehabilitationPaymentStatus(process)
}

export function getRehabilitationRequirements(crimeScore) {
  const score = Math.max(0, Math.floor(Number(crimeScore) || 0))
  const durationMs = score * 10 * 60 * 1000

  return {
    crimeScore: score,
    durationMs,
    requiredProgress: 3 + score * 2,
    requiredPayments: Math.ceil(durationMs / REHABILITATION_DAY_MS),
    requiredFee: REHABILITATION_FEE * score
  }
}

export function startRehabilitation(userRPG, crimeScore, now = Date.now()) {
  if (!userRPG || userRPG.rehabilitation?.status === 'active') return false
  const requirements = getRehabilitationRequirements(crimeScore)
  if (!requirements.crimeScore) return false

  userRPG.rehabilitation = {
    status: 'active',
    startedAt: now,
    completesAt: now + requirements.durationMs,
    crimeScore: requirements.crimeScore,
    requiredProgress: requirements.requiredProgress,
    requiredPayments: requirements.requiredPayments,
    requiredFee: requirements.requiredFee,
    progress: 0,
    paidDays: 0,
    paidAmount: 0,
    socialActivities: 0,
    lastWorkAt: 0,
    lastSocialAt: 0
  }
  return true
}

export function getRehabilitationCompletion(userRPG, now = Date.now()) {
  const process = userRPG?.rehabilitation
  if (process?.status !== 'active') return { ready: false, reason: 'inactive' }
  if (now < Number(process.completesAt || 0)) return { ready: false, reason: 'time' }
  if ((Number(process.progress) || 0) < Number(process.requiredProgress || 0)) {
    return { ready: false, reason: 'progress' }
  }
  if (getRehabilitationPaymentStatus(process).remainingAmount > 0) {
    return { ready: false, reason: 'payments' }
  }
  if ((Number(process.socialActivities) || 0) < 1) return { ready: false, reason: 'social' }
  return { ready: true, reason: null }
}

export function completeRehabilitation(userRPG, crimeData, now = Date.now()) {
  const completion = getRehabilitationCompletion(userRPG, now)
  if (!completion.ready) return false

  const process = userRPG.rehabilitation
  process.status = 'completed'
  process.completedAt = now
  process.pardonedScore = computeCrimeScore(crimeData)
  if (crimeData && typeof crimeData === 'object') {
    crimeData.pardonedScore = process.pardonedScore
  }
  return true
}
