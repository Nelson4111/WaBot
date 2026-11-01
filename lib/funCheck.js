export function formatFunCheck({
  title,
  user,
  userLabel = 'User',
  score,
  scoreLabel = 'Skor',
  subject,
  details = [],
  verdict
}) {
  const lines = [
    `╭〔  *${title}* 〕`,
    '│',
    `│  ◦ *${userLabel}* : ${user}`
  ]

  if (subject) lines.push(`│  ◦ *Kata* : ${subject}`)

  if (score !== undefined && score !== null) {
    const numericScore = Number(score)
    const barCount = Number.isFinite(numericScore)
      ? Math.max(0, Math.min(10, Math.floor(numericScore / 10)))
      : 0
    const bar = '█'.repeat(barCount) + '░'.repeat(10 - barCount)
    lines.push(`│  ◦ *${scoreLabel}* : ${score}%`, `│  ◦ *Bar* : [${bar}]`)
  }

  for (const { label, value } of details) {
    lines.push(`│  ◦ *${label}* : ${value}`)
  }

  if (verdict) {
    lines.push(
      '│',
      '├─〔  *V E R D I C T* 〕',
      '│',
      `│  ◦ ${verdict}`
    )
  }

  lines.push('╰──────────────────⬣')

  return lines.join('\n')
}
