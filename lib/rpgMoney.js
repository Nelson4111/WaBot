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

export function formatRpgNumber(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || Math.abs(amount) < 1_000) {
    return amount.toLocaleString('id-ID')
  }

  const suffixIndex = Math.min(
    MONEY_SUFFIXES.length,
    Math.max(1, Math.floor(Math.log10(Math.abs(amount)) / 3))
  )
  const [suffix] = MONEY_SUFFIXES[suffixIndex - 1]
  const scaledAmount = amount / 10 ** (suffixIndex * 3)
  return `${scaledAmount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}${suffix}`
}

export function formatRpgMoney(value) {
  return `Rp ${formatRpgNumber(value)}`
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
    const multiplier = 10 ** ((suffixIndex + 1) * 3)
    amount = Number(shorthand[1].replace(',', '.')) * multiplier
  } else if (/^\d[\d.,]*$/.test(value)) {
    amount = Number(value.replace(/[.,]/g, ''))
  }

  return Number.isFinite(amount) && Number.isInteger(amount) && amount > 0
    ? amount
    : null
}

export function getRpgMoneySuffixGuide() {
  return MONEY_SUFFIXES.map(([suffix, name], index) =>
    `> 10^${(index + 1) * 3} = ${suffix} — ${name}`
  ).join('\n')
}
