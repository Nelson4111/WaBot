import { setMaintenanceMode } from '../../lib/maintenance.js'

let handler = async (m, { args, usedPrefix }) => {
  const action = String(args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(action)) {
    const status = global.opts.maintenance ? 'AKTIF' : 'NONAKTIF'
    return m.reply(
      `Status maintenance: *${status}*\n\n` +
      `Gunakan:\n` +
      `• ${usedPrefix}maintenance on\n` +
      `• ${usedPrefix}maintenance off`
    )
  }

  const enabled = action === 'on'
  const settings = global.db.data.settings
  if (!settings.bot) settings.bot = {}
  setMaintenanceMode(enabled, global.opts, settings.bot)
  await global.db.write()

  return m.reply(
    enabled
      ? '🛠️ *MAINTENANCE DIAKTIFKAN*\n\nMode owner-only aktif dan akses public dinonaktifkan. User biasa akan menerima pemberitahuan maintenance; owner tetap dapat mengelola bot.'
      : '✅ *MAINTENANCE SELESAI*\n\nMode owner-only dinonaktifkan dan akses public diaktifkan kembali. Avelia siap digunakan!'
  )
}

handler.help = ['maintenance <on/off>']
handler.tags = ['owner']
handler.command = /^maintenance$/i
handler.owner = true

export default handler
