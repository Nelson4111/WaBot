import { findRpgEvent, getActiveRpgEvents, RPG_EVENTS } from '../../lib/rpgEvents.js'

const durationUnits = {
  s: 1000, sec: 1000, second: 1000, seconds: 1000, detik: 1000,
  m: 60000, min: 60000, minute: 60000, minutes: 60000, menit: 60000,
  h: 3600000, hr: 3600000, hour: 3600000, hours: 3600000, jam: 3600000,
  d: 86400000, day: 86400000, days: 86400000, hari: 86400000
}

function parseDuration(value) {
  const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)\s*(s|sec|second|seconds|detik|m|min|minute|minutes|menit|h|hr|hour|hours|jam|d|day|days|hari)$/i)
  if (!match) return null

  const duration = Number(match[1]) * durationUnits[match[2].toLowerCase()]
  return Number.isSafeInteger(Math.floor(duration)) && duration > 0 ? Math.floor(duration) : null
}

function formatDuration(milliseconds) {
  let seconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const days = Math.floor(seconds / 86400)
  seconds %= 86400
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600
  const minutes = Math.floor(seconds / 60)
  seconds %= 60

  return [
    days && `${days} hari`,
    hours && `${hours}j`,
    minutes && `${minutes}m`,
    seconds && `${seconds}dtk`
  ].filter(Boolean).join(' ') || '0dtk'
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

function resolveEvent(input) {
  const key = String(input || '').trim()
  if (/^\d+$/.test(key)) return RPG_EVENTS[Number(key) - 1] || null

  return findRpgEvent(key)
}

function parseLaunchArguments(args) {
  for (let durationTokenCount = Math.min(2, args.length - 1); durationTokenCount > 0; durationTokenCount--) {
    const duration = parseDuration(args.slice(-durationTokenCount).join(' '))

    if (duration) {
      return {
        eventInput: args.slice(0, -durationTokenCount).join(' '),
        duration
      }
    }
  }

  return null
}

function commandGuide(prefix) {
  return `╭─❏「 📖 PANDUAN EVENT RPG 」❏\n` +
    `│ 🎮 SISTEM EVENT SEMENTARA\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Event RPG adalah acara sementara yang memberi efek khusus pada aktivitas tertentu, seperti bonus mancing, casino, panen, dan lainnya.\n\n` +
    `> ↳ Event aktif berlaku secara universal untuk semua grup dan pemain.\n` +
    `> ↳ Efek berjalan otomatis selama event berlangsung.\n\n` +
    `📌 *PERINTAH UTAMA*\n` +
    `> 🌟 ${prefix}ev active\n` +
    `> ↳ Melihat event yang sedang aktif.\n` +
    `> 📋 ${prefix}ev info <nomor/nama>\n` +
    `> ↳ Melihat detail dan efek event.\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `📖 *PANDUAN LENGKAP*\n` +
    `> ↳ ${prefix}ev command`
}

function commandList(prefix) {
  return `╭─❏「 📋 PERINTAH EVENT RPG 」❏\n` +
    `│ 🎮 DAFTAR COMMAND\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *PERINTAH UMUM*\n` +
    `> 📖 ${prefix}event\n` +
    `> ↳ Penjelasan event.\n` +
    `> 📚 ${prefix}ev guide\n` +
    `> ↳ Panduan penggunaan event.\n` +
    `> 📋 ${prefix}ev command\n` +
    `> ↳ Daftar seluruh perintah.\n` +
    `> 🗂️ ${prefix}ev list\n` +
    `> ↳ Daftar nama event.\n` +
    `> 🌟 ${prefix}ev active\n` +
    `> ↳ Event yang sedang berlangsung.\n` +
    `> 🔎 ${prefix}ev info <nomor/nama>\n` +
    `> ↳ Detail dan status event.\n` +
    `> ⏳ ${prefix}ev cd\n` +
    `> ↳ Countdown event aktif.\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `🔒 *KHUSUS OWNER/CO-OWNER*\n` +
    `> 🚀 ${prefix}ev launch <nomor/nama> <durasi>\n` +
    `> ↳ Meluncurkan event untuk semua grup.\n` +
    `> 🛑 ${prefix}ev terminate <all/nomor/nama>\n` +
    `> ↳ Menghentikan event yang aktif.\n` +
    `> ↳ Alias: shutdown dan clear`
}

let handler = async (m, { args, text = '', usedPrefix, isOwner }) => {
  const prefix = usedPrefix || '.'
  const root = String(args[0] || '').toLowerCase()
  const now = Date.now()
  const activeEvents = getActiveRpgEvents(now)

  if (!root) {
    return m.reply(commandGuide(prefix) + `\n\nPerintah: *${prefix}ev guide* dan *${prefix}ev command*`)
  }

  if (root === 'guide' || root === 'panduan') {
    return m.reply(commandGuide(prefix))
  }

  if (root === 'command' || root === 'commands' || root === 'cmd') {
    return m.reply(commandList(prefix))
  }

  if (root === 'list') {
    return m.reply(
      `╭─❏「 📋 DAFTAR EVENT RPG 」❏\n` +
      `│ 🗂️ SEMUA EVENT TERSEDIA\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      RPG_EVENTS.map((event, index) => `> ${index + 1}. ${event.name}`).join('\n') +
      `\n\n─━━━━━━━━━━━━━━─\n` +
      `📌 *DETAIL EVENT*\n` +
      `> ↳ ${prefix}ev info <nomor/nama>`
    )
  }

  if (root === 'active') {
    if (!activeEvents.length) {
      return m.reply(
        `╭─❏「 🌟 EVENT RPG 」❏\n` +
        `│ ⚪ STATUS: TIDAK AKTIF\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Saat ini tidak ada event RPG yang sedang berlangsung.`
      )
    }

    return m.reply(
      `╭─❏「 🌟 EVENT AKTIF 」❏\n` +
      `│ 🎮 EVENT YANG SEDANG BERLANGSUNG\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      activeEvents.map(event =>
        `> ${event.emoji} *${event.name}*\n` +
        `> ↳ Sisa waktu: ${formatDuration(event.expiresAt - now)}`
      ).join('\n\n') +
      `\n\n─━━━━━━━━━━━━━━─\n` +
      `🌐 Event berlaku universal untuk semua grup.`
    )
  }

  if (root === 'cd') {
    if (!activeEvents.length) {
      return m.reply(
        `╭─❏「 ⏳ COUNTDOWN EVENT 」❏\n` +
        `│ ⚪ TIDAK ADA EVENT AKTIF\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Saat ini tidak ada event yang sedang berlangsung.`
      )
    }

    return m.reply(
      `╭─❏「 ⏳ COUNTDOWN EVENT 」❏\n` +
      `│ ⏰ SISA WAKTU EVENT\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      activeEvents.map(event =>
        `> ${event.emoji} *${event.name}*\n` +
        `> ↳ Berakhir dalam: ${formatDuration(event.expiresAt - now)}`
      ).join('\n\n') +
      `\n\n─━━━━━━━━━━━━━━─`
    )
  }

  if (root === 'info') {
    const target = text.trim().replace(/^info\s*/i, '')
    const event = resolveEvent(target)

    if (!event) {
      return m.reply(
        `╭─❏「 ❌ EVENT TIDAK DITEMUKAN 」❏\n` +
        `│ Periksa kembali nama atau nomor event.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 Gunakan *${prefix}ev list* untuk melihat daftar event.`
      )
    }

    const active = activeEvents.find(item => item.id === event.id)

    return m.reply(
      `╭─❏「 ${event.emoji} ${event.name.toUpperCase()} 」❏\n` +
      `│ 📂 Kategori: ${event.category}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${event.description}\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `✨ *EFEK EVENT*\n` +
      event.effects.map(effect => `> ✦ ${effect}`).join('\n') +
      `\n\n─━━━━━━━━━━━━━━─\n` +
      `📊 *STATUS EVENT*\n` +
      (active
        ? `> ✅ Status: Sedang berlangsung secara universal\n` +
          `> ⏳ Sisa waktu: ${formatDuration(active.expiresAt - now)}\n` +
          `> 🕒 Berakhir: ${formatDate(active.expiresAt)}`
        : `> ⚪ Status: Tidak sedang berlangsung`)
    )
  }

  if (['launch', 'enable'].includes(root)) {
    if (!isOwner) {
      return m.reply(
        `╭─❏「 🔒 AKSES DITOLAK 」❏\n` +
        `│ 🚀 PELUNCURAN EVENT\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Hanya owner atau co-owner yang dapat meluncurkan event.`
      )
    }

    const parsed = parseLaunchArguments(args.slice(1))

    if (!parsed?.eventInput) {
      return m.reply(
        `╭─❏「 🚀 LUNCURKAN EVENT 」❏\n` +
        `│ 📌 FORMAT PERINTAH\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${prefix}ev launch <nomor/nama event> <durasi>\n\n` +
        `📖 *CONTOH*\n` +
        `> ${prefix}ev launch 1 2h\n` +
        `> ${prefix}ev launch Golden Hour 2 jam`
      )
    }

    const event = resolveEvent(parsed.eventInput)

    if (!event) {
      return m.reply(
        `╭─❏「 ❌ EVENT TIDAK DITEMUKAN 」❏\n` +
        `│ Periksa kembali nama atau nomor event.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 Gunakan *${prefix}ev list* untuk melihat daftar event.`
      )
    }

    if (!global.db?.data || typeof global.db.write !== 'function') {
      return m.reply(
        `╭─❏「 ❌ DATABASE BELUM SIAP 」❏\n` +
        `│ Perubahan event tidak dapat disimpan.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    global.db.data.rpgEvents = global.db.data.rpgEvents || {}

    const expiresAt = now + parsed.duration

    if (!Number.isFinite(expiresAt) || !Number.isFinite(new Date(expiresAt).getTime())) {
      return m.reply(
        `╭─❏「 ❌ DURASI TIDAK VALID 」❏\n` +
        `│ Durasi event terlalu panjang.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    global.db.data.rpgEvents[event.id] = {
      startedAt: now,
      expiresAt,
      startedBy: m.sender
    }

    await global.db.write()

    return m.reply(
      `╭─❏「 🚀 EVENT DILUNCURKAN 」❏\n` +
      `│ ${event.emoji} *${event.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ✅ Durasi: ${formatDuration(parsed.duration)}\n` +
      `> 🌐 Jangkauan: Semua grup dan pemain\n` +
      `> ⏳ Berakhir: ${formatDate(expiresAt)}\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `✨ Event berhasil diluncurkan.`
    )
  }

  if (['terminate', 'shutdown', 'clear'].includes(root)) {
    if (!isOwner) {
      return m.reply(
        `╭─❏「 🔒 AKSES DITOLAK 」❏\n` +
        `│ 🛑 PENGHENTIAN EVENT\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Hanya owner atau co-owner yang dapat menghentikan event.`
      )
    }

    const target = args.slice(1).join(' ').trim() || (root === 'clear' ? 'all' : '')

    if (!target) {
      return m.reply(
        `╭─❏「 🛑 HENTIKAN EVENT 」❏\n` +
        `│ 📌 FORMAT PERINTAH\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${prefix}ev terminate <all/nomor/nama event>`
      )
    }

    const current = getActiveRpgEvents(now)

    if (target.toLowerCase() === 'all') {
      if (!current.length) {
        return m.reply(
          `╭─❏「 ℹ️ EVENT RPG 」❏\n` +
          `│ Tidak ada event aktif untuk dihentikan.\n` +
          `╰─━━━━━━━━━━━━━━─`
        )
      }

      if (!global.db?.data || typeof global.db.write !== 'function') {
        return m.reply(
          `╭─❏「 ❌ DATABASE BELUM SIAP 」❏\n` +
          `│ Perubahan event tidak dapat disimpan.\n` +
          `╰─━━━━━━━━━━━━━━─`
        )
      }

      global.db.data.rpgEvents = {}
      await global.db.write()

      return m.reply(
        `╭─❏「 🛑 EVENT DIHENTIKAN 」❏\n` +
        `│ 📋 Semua event aktif berhasil dihentikan.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ✅ Jumlah event: ${current.length}\n` +
        `> 🌐 Jangkauan: Semua grup dan pemain`
      )
    }

    const event = resolveEvent(target)

    if (!event || !current.some(active => active.id === event.id)) {
      return m.reply(
        `╭─❏「 ❌ EVENT AKTIF TIDAK DITEMUKAN 」❏\n` +
        `│ Periksa kembali nomor atau nama event.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 Gunakan nomor dari *${prefix}ev list* atau nama event.`
      )
    }

    if (!global.db?.data || typeof global.db.write !== 'function') {
      return m.reply(
        `╭─❏「 ❌ DATABASE BELUM SIAP 」❏\n` +
        `│ Perubahan event tidak dapat disimpan.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    delete global.db.data.rpgEvents[event.id]
    await global.db.write()

    return m.reply(
      `╭─❏「 🛑 EVENT DIHENTIKAN 」❏\n` +
      `│ ${event.emoji} *${event.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ✅ Status: Berhasil dihentikan\n` +
      `> 🌐 Jangkauan: Semua grup dan pemain`
    )
  }

  return m.reply(commandGuide(prefix) + `\n\nPerintah: *${prefix}ev guide* dan *${prefix}ev command*`)
}

handler.help = [
  'event',
  'ev guide',
  'ev command',
  'ev list',
  'ev active',
  'ev info <nomor/nama>',
  'ev cd',
  'ev launch <nomor/nama> <durasi>',
  'ev terminate <all/nomor/nama>',
  'ev shutdown <all/nomor/nama>',
  'ev clear [all/nomor/nama]'
]

handler.tags = ['rpg']
handler.command = /^(event|ev)$/i

export default handler