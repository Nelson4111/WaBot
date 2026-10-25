const BIGINT_JSON_PREFIX = '__RPG_BIGINT__:'
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)
const MIN_SAFE_BIGINT = BigInt(Number.MIN_SAFE_INTEGER)

const MONEY_SUFFIXES = [
  ['K', 'Ribu (Thousand)'],
  ['M', 'Juta (Million)'],
  ['B', 'Miliar (Billion)'],
  ['T', 'Triliun (Trillion)'],
  ['Qa', 'Quadrillion'],
  ['Qi', 'Quintillion'],
  ['Sx', 'Sextillion'],
  ['Sp', 'Septillion'],
  ['Oc', 'Octillion'],
  ['No', 'Nonillion'],
  ['Dc', 'Decillion'],
  ['Ud', 'Undecillion'],
  ['Dd', 'Duodecillion'],
  ['Td', 'Tredecillion'],
  ['Qad', 'Quattuordecillion'],
  ['Qid', 'Quindecillion'],
  ['Sxd', 'Sexdecillion'],
  ['Spd', 'Septendecillion'],
  ['Ocd', 'Octodecillion'],
  ['Nod', 'Novemdecillion']
]
const MONEY_SCALE_PREFIXES = [
  ['U', 'un'],
  ['D', 'duo'],
  ['T', 'tres'],
  ['Qa', 'quattuor'],
  ['Qi', 'quinqua'],
  ['Sx', 'ses'],
  ['Sp', 'septem'],
  ['Oc', 'octo'],
  ['No', 'novem']
]
const MONEY_DECADES = [
  ['vg', 'vigint'],
  ['tg', 'trigint'],
  ['qag', 'quadragint'],
  ['qig', 'quinquagint'],
  ['sxg', 'sexagint'],
  ['spg', 'septuagint'],
  ['ocg', 'octogint'],
  ['nog', 'nonagint']
]

for (const [abbreviation, name] of MONEY_DECADES) {
  MONEY_SUFFIXES.push([abbreviation[0].toUpperCase() + abbreviation.slice(1), `${name}illion`])
  for (const [shortPrefix, namePrefix] of MONEY_SCALE_PREFIXES) {
    MONEY_SUFFIXES.push([
      `${shortPrefix}${abbreviation}`,
      `${namePrefix}${name}illion`
    ])
  }
}
MONEY_SUFFIXES.push(['Ce', 'Centillion'])

export function serializeRpgBigInt(value) {
  return `${BIGINT_JSON_PREFIX}${value}`
}

export function normalizeRpgMoney(value, fallback = 0) {
  if (typeof value === 'bigint') return compactInteger(value)
  if (typeof value === 'number') {
    return Number.isFinite(value) ? compactNumber(Math.trunc(value)) : fallback
  }
  if (typeof value === 'string') {
    const tagged = value.match(/^__RPG_BIGINT__:(-?\d+)$/)
    const plain = tagged ? tagged[1] : value.trim()
    if (!/^-?\d+$/.test(plain)) return fallback
    try {
      return compactInteger(BigInt(plain))
    } catch {
      return fallback
    }
  }
  return fallback
}

function compactInteger(value) {
  return value <= MAX_SAFE_BIGINT && value >= MIN_SAFE_BIGINT
    ? Number(value)
    : value
}

function compactNumber(value) {
  return Number.isSafeInteger(value) ? value : BigInt(value)
}

export function normalizeRpgMoneyData(data) {
  if (!data || typeof data !== 'object') return data
  if (data.casinoStats && typeof data.casinoStats === 'object' && 'totalWinnings' in data.casinoStats) {
    data.casinoStats.totalWinnings = normalizeRpgMoney(data.casinoStats.totalWinnings)
  }
  for (const room of Object.values(data.casinoRooms || {})) {
    if (!room || typeof room !== 'object') continue
    for (const key of ['stake', 'currentStake', 'pot']) {
      if (key in room) room[key] = normalizeRpgMoney(room[key])
    }
    for (const key of ['contributions']) {
      if (room[key] && typeof room[key] === 'object') {
        for (const [jid, amount] of Object.entries(room[key])) {
          room[key][jid] = normalizeRpgMoney(amount)
        }
      }
    }
    for (const round of room.roundHistory || []) {
      if (round && typeof round === 'object' && 'stake' in round) {
        round.stake = normalizeRpgMoney(round.stake)
      }
    }
  }

  for (const user of Object.values(data.users || {})) {
    if (!user || typeof user !== 'object') continue
    for (const key of ['money', 'bank']) {
      if (key in user) user[key] = normalizeRpgMoney(user[key])
    }
    const rpg = user.rpg
    if (rpg && typeof rpg === 'object' && 'bank' in rpg) {
      rpg.bank = normalizeRpgMoney(rpg.bank)
    }
    if (rpg && typeof rpg === 'object') {
      if ('totalBunga' in rpg) rpg.totalBunga = normalizeRpgMoney(rpg.totalBunga)
      if (rpg.bankruptProtectionPending && 'funds' in rpg.bankruptProtectionPending) {
        rpg.bankruptProtectionPending.funds = normalizeRpgMoney(rpg.bankruptProtectionPending.funds)
      }
      if (rpg.pinjaman && typeof rpg.pinjaman === 'object' && 'jumlah' in rpg.pinjaman) {
        rpg.pinjaman.jumlah = normalizeRpgMoney(rpg.pinjaman.jumlah)
      }
      if (rpg.pendingStellarExchange && typeof rpg.pendingStellarExchange === 'object' &&
          'moneyAmount' in rpg.pendingStellarExchange) {
        rpg.pendingStellarExchange.moneyAmount = normalizeRpgMoney(rpg.pendingStellarExchange.moneyAmount)
      }
      if (rpg.rshipGiftDraft && typeof rpg.rshipGiftDraft === 'object' && 'amount' in rpg.rshipGiftDraft) {
        rpg.rshipGiftDraft.amount = normalizeRpgMoney(rpg.rshipGiftDraft.amount)
      }
      if (rpg.pendingChildFosterOffer && typeof rpg.pendingChildFosterOffer === 'object' &&
          'amount' in rpg.pendingChildFosterOffer) {
        rpg.pendingChildFosterOffer.amount = normalizeRpgMoney(rpg.pendingChildFosterOffer.amount)
      }
      for (const dispatch of Array.isArray(rpg.pendingPetDispatch) ? rpg.pendingPetDispatch : []) {
        if (dispatch && typeof dispatch === 'object' && 'money' in dispatch) {
          dispatch.money = normalizeRpgMoney(dispatch.money)
        }
      }
      const assistant = rpg.asistenBank
      if (assistant && typeof assistant === 'object') {
        if ('target' in assistant) assistant.target = normalizeRpgMoney(assistant.target)
        if (assistant.autoSetor && 'ambang' in assistant.autoSetor) {
          assistant.autoSetor.ambang = normalizeRpgMoney(assistant.autoSetor.ambang)
        }
      }
    }
    const casinoStats = user.casinoStats || rpg?.casinoStats
    if (casinoStats && typeof casinoStats === 'object') {
      if ('profit' in casinoStats) casinoStats.profit = normalizeRpgMoney(casinoStats.profit)
      if (casinoStats.byGame && typeof casinoStats.byGame === 'object') {
        for (const game of Object.values(casinoStats.byGame)) {
          if (game && typeof game === 'object' && 'profit' in game) {
            game.profit = normalizeRpgMoney(game.profit)
          }
        }
      }
      for (const round of casinoStats.dailyHistory || []) {
        if (!round || typeof round !== 'object') continue
        for (const key of ['bet', 'payout', 'profit', 'moneyChange']) {
          if (key in round) round[key] = normalizeRpgMoney(round[key])
        }
      }
    }
    for (const blackout of user.casinoBlackouts || []) {
      if (!blackout || typeof blackout !== 'object') continue
      for (const key of ['amount', 'guardRecovered', 'insuredRecovered', 'panelRefunded']) {
        if (key in blackout) blackout[key] = normalizeRpgMoney(blackout[key])
      }
    }
    if (user.casinoReplay && 'bet' in user.casinoReplay) {
      user.casinoReplay.bet = normalizeRpgMoney(user.casinoReplay.bet)
    }
  }
  for (const pending of Object.values(data.fitnahPending || {})) {
    if (pending && typeof pending === 'object' && 'wager' in pending) {
      pending.wager = normalizeRpgMoney(pending.wager)
    }
  }
  return data
}

export function addRpgMoney(left, right) {
  return moneyOperation(left, right, (a, b) => a + b)
}

export function subtractRpgMoney(left, right) {
  return moneyOperation(left, right, (a, b) => a - b)
}

export function compareRpgMoney(left, right) {
  const a = normalizeRpgMoney(left)
  const b = normalizeRpgMoney(right)
  if (typeof a === 'bigint' || typeof b === 'bigint') {
    const bigA = BigInt(a)
    const bigB = BigInt(b)
    return bigA < bigB ? -1 : bigA > bigB ? 1 : 0
  }
  return a < b ? -1 : a > b ? 1 : 0
}

export function minRpgMoney(...values) {
  return values.map(value => normalizeRpgMoney(value))
    .reduce((minimum, value) => compareRpgMoney(value, minimum) < 0 ? value : minimum)
}

export function maxRpgMoney(...values) {
  return values.map(value => normalizeRpgMoney(value))
    .reduce((maximum, value) => compareRpgMoney(value, maximum) > 0 ? value : maximum)
}

export function ratioPercentRpgMoney(part, total) {
  const numerator = normalizeRpgMoney(part)
  const denominator = normalizeRpgMoney(total)
  if (compareRpgMoney(denominator, 0) <= 0) return 0
  return Number((BigInt(numerator) * 100n) / BigInt(denominator))
}

export function multiplyRpgMoney(value, multiplier, rounding = 'floor') {
  const amount = normalizeRpgMoney(value)
  const decimal = String(multiplier)
  const match = decimal.match(/^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i)
  if (!match) throw new TypeError(`Pengali nominal RPG tidak valid: ${decimal}`)
  const fraction = match[3] || ''
  const exponent = Number(match[4] || 0)
  if (!Number.isSafeInteger(exponent)) throw new RangeError('Eksponen pengali nominal RPG terlalu besar.')
  let denominator = 10n ** BigInt(Math.max(0, fraction.length - exponent))
  let factor = BigInt(`${match[1]}${match[2]}${fraction}`)
  if (exponent > fraction.length) {
    factor *= 10n ** BigInt(exponent - fraction.length)
  }
  const product = BigInt(amount) * factor
  let result = product / denominator
  const remainder = product % denominator
  if (remainder !== 0n) {
    if (rounding === 'ceil' && product > 0n) result++
    if (rounding === 'round' && (remainder < 0n ? -remainder : remainder) * 2n >= denominator) {
      result += product < 0n ? -1n : 1n
    }
  }
  return compactInteger(result)
}

export function divideRpgMoney(value, divisor) {
  const amount = normalizeRpgMoney(value)
  const denominator = normalizeRpgMoney(divisor)
  if (compareRpgMoney(denominator, 0) === 0) {
    throw new RangeError('Pembagi nominal RPG tidak boleh nol.')
  }
  return compactInteger(BigInt(amount) / BigInt(denominator))
}

function moneyOperation(left, right, operation) {
  const a = normalizeRpgMoney(left)
  const b = normalizeRpgMoney(right)
  if (typeof a === 'bigint' || typeof b === 'bigint') {
    return compactInteger(operation(BigInt(a), BigInt(b)))
  }
  return compactNumber(operation(a, b))
}

function formatInteger(value) {
  return value.toLocaleString('id-ID')
}

function getSuffixIndex(digits) {
  return Math.min(MONEY_SUFFIXES.length, Math.max(1, Math.floor((digits - 1) / 3)))
}

function formatBigInt(value) {
  const negative = value < 0n
  const absolute = negative ? -value : value
  if (absolute < 1_000n) return `${negative ? '-' : ''}${formatInteger(Number(absolute))}`

  const suffixIndex = getSuffixIndex(absolute.toString().length)
  const divisor = 10n ** BigInt(suffixIndex * 3)
  const hundredths = (absolute * 100n + divisor / 2n) / divisor
  const whole = hundredths / 100n
  const fraction = hundredths % 100n
  let decimal = ''
  if (fraction !== 0n) {
    decimal = `,${fraction.toString().padStart(2, '0').replace(/0+$/, '')}`
  }
  const [suffix] = MONEY_SUFFIXES[suffixIndex - 1]
  return `${negative ? '-' : ''}${whole.toLocaleString('id-ID')}${decimal}${suffix}`
}

export function formatRpgNumber(value) {
  const normalized = normalizeRpgMoney(value)
  if (typeof normalized === 'bigint') return formatBigInt(normalized)
  if (!Number.isFinite(normalized) || Math.abs(normalized) < 1_000) {
    return normalized.toLocaleString('id-ID')
  }
  const suffixIndex = Math.min(
    MONEY_SUFFIXES.length,
    Math.max(1, Math.floor(Math.log10(Math.abs(normalized)) / 3))
  )
  const [suffix] = MONEY_SUFFIXES[suffixIndex - 1]
  const scaledAmount = normalized / 10 ** (suffixIndex * 3)
  return `${scaledAmount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}${suffix}`
}

export function formatRpgMoney(value) {
  return `Rp ${formatRpgNumber(value)}`
}

function decimalToInteger(decimalValue, multiplier) {
  const normalized = decimalValue.replace(',', '.')
  const [whole, fraction = ''] = normalized.split('.')
  const scale = 10n ** BigInt(fraction.length)
  const numerator = BigInt(`${whole}${fraction}`) * multiplier
  if (numerator % scale !== 0n) return null
  return numerator / scale
}

export function parseRpgMoneyAmount(input) {
  const value = String(input || '').replace(/^rp/i, '').replace(/\s/g, '')
  const shorthand = value.match(/^(\d+(?:[.,]\d+)?)([a-z]+)$/i)
  let amount

  if (shorthand) {
    const suffixIndex = MONEY_SUFFIXES.findIndex(([suffix]) =>
      suffix.toLowerCase() === shorthand[2].toLowerCase()
    )
    if (suffixIndex < 0) return null
    amount = decimalToInteger(shorthand[1], 10n ** BigInt((suffixIndex + 1) * 3))
  } else if (/^\d[\d.,]*$/.test(value)) {
    const digits = value.replace(/[.,]/g, '')
    try {
      amount = BigInt(digits)
    } catch {
      return null
    }
  }

  if (amount === null || amount === undefined || amount <= 0n) return null
  return compactInteger(amount)
}

export function parseRpgMoneySignedAmount(input) {
  const value = String(input || '').trim()
  const negative = value.startsWith('-')
  const positive = value.startsWith('+')
  const amountText = negative || positive ? value.slice(1) : value
  if (amountText === '0') return 0
  const amount = parseRpgMoneyAmount(amountText)
  if (amount === null) return null
  return negative ? subtractRpgMoney(0, amount) : amount
}

export function getRpgMoneySuffixGuide() {
  return MONEY_SUFFIXES.map(([suffix, name], index) =>
    `> 10^${(index + 1) * 3} = ${suffix} — ${name}`
  ).join('\n')
}

export function getRpgBigIntJsonTag() {
  return BIGINT_JSON_PREFIX
}
