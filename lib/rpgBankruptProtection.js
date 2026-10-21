import { getRpgWibWeekKey } from './rpgTime.js'

export const BANKRUPT_PROTECTION_RATE = 0.5

export function recordBankruptFunds(rpg, funds, at = Date.now()) {
  const amount = Number(funds)
  if (!rpg || !Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) return false
  rpg.bankruptProtectionPending = {
    funds: (Number(rpg.bankruptProtectionPending?.funds) || 0) + amount,
    lastBankruptAt: at
  }
  return true
}

export function claimBankruptProtection(rpg, wallet, now = Date.now()) {
  if (!rpg) return { status: 'unavailable' }
  if (Number(wallet) > 0 || Number(rpg.bank) > 0) return { status: 'not-bankrupt' }

  const weekKey = getRpgWibWeekKey(now)
  if (rpg.bankruptProtectionClaimWeek === weekKey) return { status: 'already-claimed' }

  const funds = Number(rpg.bankruptProtectionPending?.funds)
  if (!Number.isFinite(funds) || !Number.isInteger(funds) || funds <= 0) return { status: 'no-recorded-bankruptcy' }

  const amount = Math.floor(funds * BANKRUPT_PROTECTION_RATE)
  if (!Number.isFinite(amount) || amount <= 0) return { status: 'no-payout' }

  rpg.bankruptProtectionClaimWeek = weekKey
  rpg.bankruptProtectionPending = null
  return { status: 'claimed', amount, funds, weekKey }
}
