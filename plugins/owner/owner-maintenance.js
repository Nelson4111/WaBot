import { setMaintenanceMode, setRpgMaintenanceMode } from '../../lib/maintenance.js'

let handler = async (m, { args, usedPrefix }) => {
  const mode = String(args[0] || '').toLowerCase()
  const action = String(args[1] || args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(action)) {
    const globalStatus = global.opts.maintenance ? 'AKTIF' : 'NONAKTIF'
    const rpgStatus = global.opts.rpgMaintenance ? 'AKTIF' : 'NONAKTIF'
    return m.reply(
      `Status maintenance semua fitur: *${globalStatus}*\n` +
      `Status maintenance RPG: *${rpgStatus}*\n\n` +
      `Gunakan:\n` +
      `• ${usedPrefix}maintenance on\n` +
      `• ${usedPrefix}maintenance off\n` +
      `• ${usedPrefix}maintenance rpg on\n` +
      `• ${usedPrefix}maintenance rpg off`
    )
  }

  const enabled = action === 'on'
  const settings = global.db.data.settings
  if (!settings.bot) settings.bot = {}
  if (mode === 'rpg') setRpgMaintenanceMode(enabled, global.opts, settings.bot)
  else setMaintenanceMode(enabled, global.opts, settings.bot)
  await global.db.write()

  if (mode === 'rpg') {
    return m.reply(
      enabled
        ? '🎮 *MAINTENANCE RPG DIAKTIFKAN*\n\nSemua command dan aktivitas RPG sementara dihentikan, termasuk transaksi atau perubahan nominal. Fitur bot lainnya tetap dapat digunakan.'
        : '✅ *MAINTENANCE RPG SELESAI*\n\nFitur dan aktivitas RPG sudah dapat digunakan kembali.'
    )
  }

  return m.reply(
    enabled
      ? '🛠️ *MAINTENANCE DIAKTIFKAN*\n\nMode owner-only aktif dan akses public dinonaktifkan. User biasa akan menerima pemberitahuan maintenance; owner tetap dapat mengelola bot.'
      : '✅ *MAINTENANCE SELESAI*\n\nMode owner-only dinonaktifkan dan akses public diaktifkan kembali. Avelia siap digunakan!'
  )
}

handler.help = ['maintenance <on/off>', 'maintenance rpg <on/off>']
handler.tags = ['owner']
handler.command = /^maintenance$/i
handler.owner = true

export default handler
