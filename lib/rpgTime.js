function getWibDateParts(value = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(value)
  return Object.fromEntries(parts.map(part => [part.type, part.value]))
}

export function getRpgWibDateKey(value = Date.now()) {
  const { year, month, day } = getWibDateParts(value)
  return `${year}-${month}-${day}`
}

export function getRpgWibWeekKey(value = Date.now()) {
  const { year, month, day } = getWibDateParts(value)
  const localDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  const daysFromMonday = (localDate.getUTCDay() + 6) % 7
  localDate.setUTCDate(localDate.getUTCDate() - daysFromMonday)
  return localDate.toISOString().slice(0, 10)
}
