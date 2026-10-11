import { EVENT_SCHEDULE, findRpgEvent, findRpgEventCategory, findRpgEventScheduleDay, getActiveRpgEvents, getRpgEventCategories, getRpgEventScheduleDayForNow, getRpgEventScheduleForNow, RPG_EVENTS } from '../../lib/rpgEvents.js'

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

function resolveEventTargets(input) {
  const targets = String(input || '')
    .split(/[,+;|]/)
    .map(target => target.trim())
    .filter(Boolean)
  if (!targets.length) return null

  const events = []
  for (const target of targets) {
    const scheduledDay = ['today', 'sekarang', 'hari ini', 'now'].includes(target.toLowerCase())
      ? getRpgEventScheduleDayForNow()
      : findRpgEventScheduleDay(target)
    const category = scheduledDay ? null : findRpgEventCategory(target)
    const matches = scheduledDay
      ? scheduledDay.ids.map(id => RPG_EVENTS.find(event => event.id === id)).filter(Boolean)
      : category
        ? RPG_EVENTS.filter(event => event.category === category.label)
        : [resolveEvent(target)].filter(Boolean)

    if (!matches.length) return null
    events.push(...matches)
  }

  return [...new Map(events.map(event => [event.id, event])).values()]
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
    `│ 🎮 SISTEM EVENT UNIVERSAL\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Event RPG adalah acara sementara yang memberi efek khusus pada aktivitas tertentu, seperti bonus mancing, casino, panen, dan lainnya.\n\n` +
    `> ↳ Event yang diaktifkan berlaku untuk semua grup dan semua pemain.\n` +
    `> ↳ Efek berjalan otomatis selama event berlangsung.\n\n` +
    `📌 *PERINTAH UTAMA*\n` +
    `> 📖 ${prefix}event\n` +
    `> ↳ Penjelasan singkat dan arah ke panduan.\n` +
    `> 🌟 ${prefix}ev active\n` +
    `> ↳ Melihat event yang sedang aktif.\n` +
    `> 🗓️ ${prefix}ev jadwal <hari> / ${prefix}ev today\n` +
    `> ↳ Melihat nama event pada hari tertentu atau hari ini.\n` +
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
    `> ↳ Penjelasan singkat dan arahan ke panduan.\n` +
    `> 📚 ${prefix}ev guide\n` +
    `> ↳ Panduan penggunaan event.\n` +
    `> 📋 ${prefix}ev command\n` +
    `> ↳ Daftar seluruh perintah.\n` +
    `> 🗂️ ${prefix}ev list\n` +
    `> ↳ Daftar kategori; tambahkan nama kategori atau "all" untuk melihat event.\n` +
    `> 🌟 ${prefix}ev active\n` +
    `> ↳ Event yang sedang berlangsung.\n` +
    `> 🗓️ ${prefix}ev jadwal <hari> / schedule <hari> / today\n` +
    `> ↳ Melihat nama event pada hari yang dipilih; tanpa hari menampilkan pilihan hari.\n` +
    `> 🔎 ${prefix}ev info <nomor/nama>\n` +
    `> ↳ Detail dan status event.\n` +
    `> ⏳ ${prefix}ev cd\n` +
    `> ↳ Countdown event aktif.\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `🔒 *KHUSUS OWNER/CO-OWNER*\n` +
    `> 🚀 ${prefix}ev launch <nama/nomor/kategori/hari> <durasi>\n` +
    `> ↳ Pisahkan target dengan koma; kategori atau hari meluncurkan semua event di dalamnya.\n` +
    `> 🛑 ${prefix}ev terminate <all/nama/nomor/kategori>\n` +
    `> ↳ Pisahkan target dengan koma untuk menghentikan beberapa event.\n` +
    `> ↳ Alias: shutdown dan clear\n\n` +
    `📖 *CONTOH*\n` +
    `> ${prefix}ev launch Golden Hour, Safety Net 2h\n` +
    `> ${prefix}ev launch Casino 2h\n` +
    `> ${prefix}ev launch Senin 2h\n` +
    `> ${prefix}ev terminate Casino`
}

let handler = async (m, { args, text = '', usedPrefix, isOwner }) => {
  const prefix = usedPrefix || '.'
  const root = String(args[0] || '').toLowerCase()
  const now = Date.now()
  const activeEvents = getActiveRpgEvents(now)

  if (!root) {
    return m.reply(
      `╭─❏「 🎮 EVENT RPG 」❏\n` +
      `│ Sistem event sementara yang memengaruhi aktivitas tertentu.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> Event aktif berlaku secara universal untuk semua grup dan pemain.\n` +
      `> Gunakan *${prefix}ev guide* untuk panduan lengkap.\n` +
      `> Gunakan *${prefix}ev command* untuk daftar perintah.\n` +
      `> Untuk mengecek event hari ini, pakai *${prefix}ev today* atau *${prefix}ev sekarang*.`
    )
  }

  if (args.length > 1 && ['enable', 'launch'].includes(String(args[1]).toLowerCase())) {
    const legacyInput = String(args[0] || '').trim()
    const legacyDuration = parseDuration(args.slice(2).join(' '))
    const legacyParsed = legacyDuration ? { eventInput: legacyInput, duration: legacyDuration } : parseLaunchArguments(args)

    if (!legacyParsed?.eventInput || !legacyParsed.duration) {
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

    const legacyEvent = resolveEvent(legacyParsed.eventInput)
    if (!legacyEvent) {
      return m.reply(
        `╭─❏「 ❌ EVENT TIDAK DITEMUKAN 」❏\n` +
        `│ Periksa kembali nama atau nomor event.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 Gunakan *${prefix}ev list* untuk melihat daftar event.`
      )
    }

    if (!isOwner) {
      return m.reply(
        `╭─❏「 🔒 AKSES DITOLAK 」❏\n` +
        `│ 🚀 PELUNCURAN EVENT\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Hanya owner atau co-owner yang dapat meluncurkan event.`
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

    const expiresAt = now + legacyParsed.duration
    global.db.data.rpgEvents[legacyEvent.id] = {
      startedAt: now,
      expiresAt,
      startedBy: m.sender
    }

    await global.db.write()

    return m.reply(
      `╭─❏「 🚀 EVENT DILUNCURKAN 」❏\n` +
      `│ ${legacyEvent.emoji} *${legacyEvent.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ✅ Durasi: ${formatDuration(legacyParsed.duration)}\n` +
      `> 🌐 Jangkauan: Semua grup dan pemain\n` +
      `> ⏳ Berakhir: ${formatDate(expiresAt)}\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `✨ Event berhasil diluncurkan.`
    )
  }

  if (root === 'guide' || root === 'panduan') {
    return m.reply(commandGuide(prefix))
  }

  if (root === 'command' || root === 'commands' || root === 'cmd') {
    return m.reply(commandList(prefix))
  }

  if (root === 'list') {
    const categoryInput = String(args[1] || '').trim()
    const categories = getRpgEventCategories()

    if (categoryInput && categoryInput.toLowerCase() === 'all') {
      const lines = categories.map(category => `> ${category.label} (${category.count})\n${RPG_EVENTS.map((event, index) => event.category === category.label ? `> ↳ ${index + 1}. ${event.name}` : null).filter(Boolean).join('\n')}`).join('\n\n')

      return m.reply(
        `╭─❏「 📋 SEMUA KATEGORI EVENT RPG 」❏\n` +
        `│ 🗂️ TOTAL KATEGORI: ${categories.length}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${lines}\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `📌 *DETAIL EVENT*\n` +
        `> ↳ ${prefix}ev info <nomor/nama>`
      )
    }

    if (categoryInput) {
      const category = findRpgEventCategory(categoryInput) || categories.find(item => item.label.toLowerCase() === categoryInput.toLowerCase())

      if (!category) {
        return m.reply(
          `╭─❏「 ❌ KATEGORI TIDAK DITEMUKAN 」❏\n` +
          `│ Cek kembali nama kategori yang ingin dilihat.\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `${categories.map(item => `> ${item.label} (${item.count})`).join('\n')}`
        )
      }

      const categoryEvents = RPG_EVENTS.filter(event => event.category === category.label)

      return m.reply(
        `╭─❏「 📂 ${category.label.toUpperCase()} 」❏\n` +
        `│ Jumlah Event : ${categoryEvents.length}\n` +
        `╰─━━━━━━━━━━━━━━─\n` +
        `${categoryEvents.map(event => `> *${RPG_EVENTS.indexOf(event) + 1}. ${event.emoji} ${event.name}*\n> ↳ ${event.description}\n${event.effects.map(effect => `> ✦ ${effect}`).join('\n')}`).join('\n\n')}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    return m.reply(
      `╭─❏「 📋 DAFTAR KATEGORI EVENT RPG 」❏\n` +
      `│ 🗂️ TOTAL KATEGORI: ${categories.length}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      categories.map(category => `> ${category.label} (${category.count})`).join('\n') +
      `\n\n─━━━━━━━━━━━━━━─\n` +
      `📌 *LIHAT DETAIL KATEGORI*\n` +
      `> ↳ ${prefix}ev list <kategori>\n` +
      `> ↳ ${prefix}ev list all\n\n` +
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

  if (root === 'jadwal' || root === 'schedule' || root === 'today' || root === 'sekarang') {
    const isTodayRequest = root === 'today' || root === 'sekarang'
    const requestedDay = isTodayRequest
      ? getRpgEventScheduleDayForNow(now)
      : args.length > 1
        ? findRpgEventScheduleDay(args.slice(1).join(' '))
        : null
    const day = requestedDay

    const todayEvents = getRpgEventScheduleForNow(now)
    const dayEvents = (day?.ids || todayEvents).map(id => RPG_EVENTS.find(event => event.id === id)).filter(Boolean)
    const dayDisplay = dayEvents.length
      ? dayEvents.map(event => {
          return `> ${event.name}`
        }).join('\n')
      : `> ↳ Belum ada event yang dijadwalkan${day?.label ? ` pada hari ${day.label}` : ' hari ini'}.`

    if (!isTodayRequest && args.length > 1 && !requestedDay) {
      return m.reply(
        `╭─❏「 ❌ HARI TIDAK DITEMUKAN 」❏\n` +
        `│ Gunakan nama hari Senin sampai Minggu.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }

    const body = isTodayRequest || requestedDay
      ? `╭─❏「 🗓️ JADWAL EVENT 」❏\n` +
        `│ 📅 ${day?.label || 'Hari ini'}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${dayDisplay}`
      : `╭─❏「 🗓️ JADWAL EVENT RPG 」❏\n` +
        `│ Pilih hari dengan ${prefix}ev jadwal <hari>\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> Senin\n> Selasa\n> Rabu\n> Kamis\n> Jumat\n> Sabtu\n> Minggu\n\n` +
        `> Gunakan ${prefix}ev jadwal <nama hari> untuk melihat event pada hari tersebut.`

    return m.reply(body)
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

    if (!parsed?.eventInput || !parsed.duration) {
      return m.reply(
        `╭─❏「 🚀 LUNCURKAN EVENT 」❏\n` +
        `│ 📌 FORMAT PERINTAH\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${prefix}ev launch <nama/nomor/kategori> <durasi>\n` +
        `> ↳ Pisahkan beberapa target dengan koma.\n\n` +
        `📖 *CONTOH*\n` +
        `> ${prefix}ev launch 1 2h\n` +
        `> ${prefix}ev launch Golden Hour, Safety Net 2 jam\n` +
        `> ${prefix}ev launch Casino 2h`
      )
    }

    const events = resolveEventTargets(parsed.eventInput)

    if (!events) {
      return m.reply(
        `╭─❏「 ❌ TARGET EVENT TIDAK VALID 」❏\n` +
        `│ Periksa kembali nama, nomor, atau kategori event.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 Gunakan *${prefix}ev list* untuk kategori dan *${prefix}ev list all* untuk event.`
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

    for (const event of events) {
      global.db.data.rpgEvents[event.id] = {
        startedAt: now,
        expiresAt,
        startedBy: m.sender
      }
    }

    await global.db.write()

    return m.reply(
      `╭─❏「 🚀 EVENT DILUNCURKAN 」❏\n` +
      `│ Jumlah Event: ${events.length}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${events.map(event => `> ${event.emoji} *${event.name}*`).join('\n')}\n\n` +
      `> ✅ Durasi: ${formatDuration(parsed.duration)}\n` +
      `> 🌐 Jangkauan: Semua grup dan pemain\n` +
      `> ⏳ Berakhir: ${formatDate(expiresAt)}\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `✨ Semua event berhasil diluncurkan.`
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
        `> ↳ ${prefix}ev terminate <all/nama/nomor/kategori>\n` +
        `> ↳ Pisahkan beberapa target dengan koma.\n\n` +
        `📖 Contoh: ${prefix}ev terminate Golden Hour, Safety Net\n` +
        `📖 Contoh: ${prefix}ev terminate Casino`
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

    const events = resolveEventTargets(target)

    if (!events) {
      return m.reply(
        `╭─❏「 ❌ TARGET EVENT TIDAK VALID 」❏\n` +
        `│ Periksa kembali nama, nomor, atau kategori event.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 Gunakan *${prefix}ev list* untuk melihat kategori event.`
      )
    }

    const activeIds = new Set(current.map(event => event.id))
    const eventsToStop = events.filter(event => activeIds.has(event.id))

    if (!eventsToStop.length) {
      return m.reply(
        `╭─❏「 ℹ️ EVENT RPG 」❏\n` +
        `│ Tidak ada event aktif yang cocok dengan target tersebut.\n` +
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

    for (const event of eventsToStop) {
      delete global.db.data.rpgEvents[event.id]
    }
    await global.db.write()

    return m.reply(
      `╭─❏「 🛑 EVENT DIHENTIKAN 」❏\n` +
      `│ Jumlah Event: ${eventsToStop.length}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${eventsToStop.map(event => `> ${event.emoji} *${event.name}*`).join('\n')}\n\n` +
      `> ✅ Status: Berhasil dihentikan secara universal`
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
  'ev jadwal <hari>',
  'ev schedule <day>',
  'ev today',
  'ev sekarang',
  'ev info <nomor/nama>',
  'ev cd',
  'ev launch <nomor/nama/kategori/hari> <durasi>',
  'ev terminate <all/nomor/nama/kategori/hari>',
  'ev shutdown <all/nomor/nama/kategori/hari>',
  'ev clear [all/nomor/nama/kategori/hari]'
]

handler.tags = ['rpg']
handler.command = /^(event|ev)$/i

export default handler