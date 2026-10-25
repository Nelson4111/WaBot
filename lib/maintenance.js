export function setMaintenanceMode(enabled, opts, settings, now = Date.now()) {
  const isEnabled = Boolean(enabled)
  const startedAt = Number(opts.maintenanceStartedAt || settings.maintenanceStartedAt)

  opts.maintenance = isEnabled
  opts.owneronly = isEnabled
  opts.self = isEnabled
  opts.maintenanceStartedAt = isEnabled
    ? Number.isFinite(startedAt) && startedAt > 0 ? startedAt : now
    : null

  settings.maintenance = isEnabled
  settings.owneronly = isEnabled
  settings.self = isEnabled
  settings.maintenanceStartedAt = opts.maintenanceStartedAt
}

function formatMaintenanceDuration(startedAt, now) {
  const elapsedSeconds = Math.floor(Math.max(0, now - startedAt) / 1000)
  const days = Math.floor(elapsedSeconds / 86400)
  const hours = Math.floor((elapsedSeconds % 86400) / 3600)
  const minutes = Math.floor((elapsedSeconds % 3600) / 60)
  const seconds = elapsedSeconds % 60
  const parts = []

  if (days) parts.push(`${days} hari`)
  if (hours) parts.push(`${hours} jam`)
  if (minutes) parts.push(`${minutes} menit`)
  if (seconds || !parts.length) parts.push(`${seconds} detik`)

  return parts.join(' ')
}

export function formatMaintenanceMessage(usedPrefix = '.', startedAt = Date.now(), now = Date.now()) {
  const validStartedAt = Number.isFinite(Number(startedAt)) && Number(startedAt) > 0
    ? Number(startedAt)
    : now
  const duration = formatMaintenanceDuration(validStartedAt, now)

  return `╭─❏「 🛠️ AVELIA MAINTENANCE 」❏
│ 🔧 PEMELIHARAAN SISTEM AVELIA
╰─━━━━━━━━━━━━━━─

⏳ *Durasi Maintenance:* ${duration}

> ↳ Avelia sedang menjalani pemeliharaan.
> ↳ Semua fitur sementara tidak tersedia.

💜 Kami sedang menyiapkan pembaruan dan perbaikan yang terbaik untukmu!

─━━━━━━━━━━━━━━─
📰 *INFORMASI TERBARU*
> ↳ Silakan coba kembali setelah maintenance selesai.
> ↳ Pantau *${usedPrefix}news 1* untuk melihat info terbaru setelah bot aktif kembali.

Terima kasih sudah menunggu 💜`
}
