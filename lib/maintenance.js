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

export function setRpgMaintenanceMode(enabled, opts, settings, now = Date.now()) {
  const isEnabled = Boolean(enabled)
  const startedAt = Number(opts.rpgMaintenanceStartedAt || settings.rpgMaintenanceStartedAt)

  opts.rpgMaintenance = isEnabled
  opts.rpgMaintenanceStartedAt = isEnabled
    ? Number.isFinite(startedAt) && startedAt > 0 ? startedAt : now
    : null

  settings.rpgMaintenance = isEnabled
  settings.rpgMaintenanceStartedAt = opts.rpgMaintenanceStartedAt
}

export function isRpgPlugin(name, plugin) {
  return (Array.isArray(plugin?.tags) &&
      plugin.tags.some(tag => ['rpg', 'pasangan'].includes(String(tag).toLowerCase()))) ||
    /(?:^|[\\/])rpg(?:[\\/]|$)/i.test(String(name || ''))
}

export function isRpgCommand(command, plugins = {}) {
  if (!command) return false

  return Object.entries(plugins).some(([name, plugin]) => {
    if (!isRpgPlugin(name, plugin) || !plugin?.command) return false
    const accepts = spec => {
      if (spec instanceof RegExp) {
        spec.lastIndex = 0
        return spec.test(command)
      }
      return typeof spec === 'string' && spec.toLowerCase() === command.toLowerCase()
    }
    return Array.isArray(plugin.command)
      ? plugin.command.some(accepts)
      : accepts(plugin.command)
  })
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

export function formatMaintenanceMessage(usedPrefix = '.', startedAt = Date.now(), now = Date.now(), mode = 'all') {
  const validStartedAt = Number.isFinite(Number(startedAt)) && Number(startedAt) > 0
    ? Number(startedAt)
    : now
  const duration = formatMaintenanceDuration(validStartedAt, now)
  const scopeMessage = mode === 'rpg'
    ? 'Fitur RPG sementara tidak tersedia, termasuk aktivitas game dan perubahan saldo atau nominal.'
    : 'Semua fitur bot sementara tidak tersedia.'

  return `╭─❏「 🛠️ AVELIA MAINTENANCE 」❏
│ 🔧 PEMELIHARAAN SISTEM AVELIA
╰─━━━━━━━━━━━━━━─

⏳ *Durasi Maintenance:* ${duration}

> ↳ Avelia sedang menjalani pemeliharaan.
> ↳ ${scopeMessage}

💜 Kami sedang menyiapkan pembaruan dan perbaikan yang terbaik untukmu!

─━━━━━━━━━━━━━━─
📰 *INFORMASI TERBARU*
> ↳ Silakan coba kembali setelah maintenance selesai.
> ↳ Pantau *.news 1* untuk melihat info terbaru setelah bot aktif kembali.

Terima kasih sudah menunggu 💜`
}
