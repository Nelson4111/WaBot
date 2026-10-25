import { getRpgWibWeekKey } from './rpgTime.js'
import {
  addRpgMoney,
  compareRpgMoney,
  multiplyRpgMoney,
  normalizeRpgMoney
} from './rpgMoney.js'

export const BANKRUPT_PROTECTION_RATE = 0.5

export function recordBankruptFunds(rpg, funds, at = Date.now()) {
  const amount = normalizeRpgMoney(funds)
  if (!rpg || compareRpgMoney(amount, 0) <= 0) return false
  rpg.bankruptProtectionPending = {
    funds: addRpgMoney(normalizeRpgMoney(rpg.bankruptProtectionPending?.funds), amount),
    lastBankruptAt: at
  }
  return true
}

export function claimBankruptProtection(rpg, wallet, now = Date.now()) {
  if (!rpg) return { status: 'unavailable' }
  if (compareRpgMoney(normalizeRpgMoney(wallet), 0) > 0 ||
      compareRpgMoney(normalizeRpgMoney(rpg.bank), 0) > 0) return { status: 'not-bankrupt' }

  const weekKey = getRpgWibWeekKey(now)
  if (rpg.bankruptProtectionClaimWeek === weekKey) return { status: 'already-claimed' }

  const funds = normalizeRpgMoney(rpg.bankruptProtectionPending?.funds)
  if (compareRpgMoney(funds, 0) <= 0) return { status: 'no-recorded-bankruptcy' }

  const amount = multiplyRpgMoney(funds, BANKRUPT_PROTECTION_RATE)
  if (compareRpgMoney(amount, 0) <= 0) return { status: 'no-payout' }

  rpg.bankruptProtectionClaimWeek = weekKey
  rpg.bankruptProtectionPending = null
  return { status: 'claimed', amount, funds, weekKey }
}
