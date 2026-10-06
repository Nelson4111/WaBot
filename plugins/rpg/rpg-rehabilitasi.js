import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { computeCrimeScore, getActiveCrimeScore } from '../../lib/crimeHelper.js'
import { REHABILITATION_ACTIVITY_STORIES } from '../../lib/rehabilitationStories.js'
import { isPremiumUser } from './rpg-bank.js'
import {
  applyRehabilitationPayment,
  completeRehabilitation,
  getRehabilitationCompletion,
  getRehabilitationPaymentStatus,
  getRehabilitationRequirements,
  REHABILITATION_ACTIVITY_COOLDOWNS,
  REHABILITATION_FEE,
  startRehabilitation
} from '../../lib/rehabilitationHelper.js'

const randomItem = list => list[Math.floor(Math.random() * list.length)]

const formatDuration = (ms) => {
  const minutes = Math.max(0, Math.ceil(ms / (60 * 1000)))
  if (minutes < 60) return `${minutes} menit`
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  const remainingMinutes = minutes % 60
  if (days) return `${days} hari ${remainingHours} jam${remainingMinutes ? ` ${remainingMinutes} menit` : ''}`
  return `${hours} jam${remainingMinutes ? ` ${remainingMinutes} menit` : ''}`
}

const activityDefinitions = {
  kerja: { label: 'Kerja', cooldownField: 'lastWorkAt' },
  sosial: { label: 'Sosial', cooldownField: 'lastSocialAt' },
  ibadah: { label: 'Ibadah', cooldownField: 'lastWorshipAt' },
  olahraga: { label: 'Olahraga', cooldownField: 'lastExerciseAt' },
  belajar: { label: 'Belajar', cooldownField: 'lastStudyAt' }
}

function isImprisoned(userRPG, now) {
  const startedAt = Number(userRPG?.penjara) || 0
  const duration = Number(userRPG?.lamaPenjara) || 0
  return startedAt > 0 && duration > 0 && now - startedAt < duration
}

function getUserRPG(wdb, jid) {
  return wdb.users?.[jid]?.rpg || null
}

function getStatusLabel(status) {
  return {
    active: 'Sedang dijalani',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    revoked: 'Dicabut karena masuk penjara'
  }[status] || 'Belum dimulai'
}

function statusText(process, now) {
  const remaining = Math.max(0, Number(process.completesAt) - now)
  const payment = getRehabilitationPaymentStatus(process)
  return `⏳ Sisa waktu: *${formatDuration(remaining)}*\n` +
    `📈 Progres: *${Number(process.progress) || 0}/${Number(process.requiredProgress) || 0} poin*\n` +
    `💳 Pembayaran: *${payment.remainingAmount > 0 ? `Kurang Rp ${payment.remainingAmount.toLocaleString('id-ID')}` : 'Lunas'}*\n` +
    `🤝 Kegiatan sosial: *${Number(process.socialActivities) || 0}x*`
}

function cooldownText(process, now) {
  return Object.entries(activityDefinitions).map(([action, activity]) => {
    const cooldown = REHABILITATION_ACTIVITY_COOLDOWNS[action]
    const remaining = cooldown - (now - (Number(process?.[activity.cooldownField]) || 0))
    const status = remaining > 0 ? formatDuration(remaining) : 'Siap digunakan'
    return `> ↳ ${activity.label}: *${status}*`
  }).join('\n')
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const wdb = loadDB()
  const requestedAction = String(args[0] || '').toLowerCase()
  const action = requestedAction === 'start' ? 'mulai' : requestedAction
  const now = Date.now()

  if (action === 'list') {
    const active = Object.entries(wdb.users || {})
      .filter(([, data]) => data?.rpg?.rehabilitation?.status === 'active')
    if (!active.length) return m.reply('📋 Belum ada pemain yang sedang menjalani rehabilitasi.')

    const pageSize = 10
    const requestedPage = Number.parseInt(args[1], 10)
    const totalPages = Math.ceil(active.length / pageSize)
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
    if (page > totalPages) return m.reply(`❌ Halaman tidak tersedia. Total halaman: *${totalPages}*.`)

    const entries = active.slice((page - 1) * pageSize, page * pageSize)
    const mentions = entries.map(([jid]) => jid)
    const lines = entries.map(([jid, data], index) => {
      const process = data.rpg.rehabilitation
      return `${(page - 1) * pageSize + index + 1}. @${jid.split('@')[0]} • ` +
        `${Number(process.progress) || 0}/${Number(process.requiredProgress) || 0} poin • ` +
        `${formatDuration(Math.max(0, Number(process.completesAt) - now))} lagi`
    })
    return conn.reply(
      m.chat,
      `📋 *PEMAIN DALAM REHABILITASI • ${page}/${totalPages}*\n\n${lines.join('\n')}`,
      m,
      { mentions }
    )
  }
  const userRPG = getUserRPG(wdb, m.sender)
  if (!userRPG && !['command', 'commands', 'cmd', 'guide'].includes(action)) {
    return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')
  }

  const process = userRPG?.rehabilitation
  const crimeData = wdb.crime?.[m.sender]
  const wantedScore = getActiveCrimeScore(crimeData)

  if (action === 'command' || action === 'commands' || action === 'cmd') {
  return m.reply(
    `╭─❏「 📋 COMMAND REHABILITASI 」❏\n` +
    `│ 📋 *DAFTAR COMMAND*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *REHABILITASI*\n` +
    `> ↳ *.rh* — Cek status dan sisa waktu\n` +
    `> ↳ *.rh info* — Info status rehabilitasi\n` +
    `> ↳ *.rh guide* — Panduan proses rehabilitasi\n` +
    `> ↳ *.rh command* — Daftar command\n` +
    `> ↳ *.rh list [halaman]* — Daftar pemain rehabilitasi\n` +
    `> ↳ *.rh mulai* / *.rh start* — Memulai rehabilitasi\n` +
    `> ↳ *.rh bayar <nominal/all>* — Cicil nominal atau lunasi sisa biaya\n` +
    `> ↳ *.rh kerja* — Bekerja untuk progres\n` +
    `> ↳ *.rh sosial* — Kegiatan sosial\n` +
    `> ↳ *.rh ibadah* — Ibadah untuk progres\n` +
    `> ↳ *.rh olahraga* — Olahraga untuk progres\n` +
    `> ↳ *.rh belajar* — Belajar untuk progres\n` +
    `> ↳ *.rh all* — Jalankan semua aktivitas yang siap (khusus premium)\n` +
    `> ↳ *.rh cd* — Cek cooldown semua aktivitas\n` +
    `> ↳ *.rh progres* — Melihat perkembangan\n` +
    `> ↳ *.rh lapor* — Melaporkan proses jika semua syarat terpenuhi\n` +
    `> ↳ *.rh batal* — Membatalkan rehabilitasi\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'guide') {
  return m.reply(
    `╭─❏「 📖 PANDUAN REHABILITASI 」❏\n` +
    `│ 📖 *PANDUAN REHABILITASI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *TAHAP REHABILITASI*\n` +
    `> ↳ 1. Pastikan kamu sudah bebas dari penjara dan masih memiliki poin buronan.\n` +
    `> ↳ 2. Mulai proses dengan *.rh mulai* atau *.rh start*. Durasi rehabilitasi adalah 10 menit dikali poin buronan aktif.\n` +
    `> ↳ 3. Biaya rehabilitasi adalah Rp ${REHABILITATION_FEE.toLocaleString('id-ID')} dikali poin buronan. Cicil lewat *.rh bayar <nominal>* atau lunasi sisa biaya lewat *.rh bayar all*; pembayaran tidak memiliki cooldown.\n` +
    `> ↳ 4. Gunakan *.rh kerja*, *.rh sosial*, *.rh ibadah*, *.rh olahraga*, atau *.rh belajar* untuk menambah progres; cooldown tiap aktivitas bisa dicek dengan *.rh cd*.\n` +
    `> ↳ 5. Setelah waktu minimum, target poin, pembayaran, dan kegiatan sosial terpenuhi, gunakan *.rh lapor* untuk menyelesaikan proses.\n` +
    `> ↳ 6. Berhasil rehabilitasi menghapus poin buronan aktif, bukan riwayat total kejahatan.\n` +
    `> ↳ 7. Tindak kriminal diblokir selama rehabilitasi. Membatalkan proses mengembalikan status buronan.\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'info') {
  return m.reply(
    `╭─❏「 📘 INFO REHABILITASI 」❏\n` +
    `│ 📘 *INFORMASI REHABILITASI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📋 *PENGERTIAN*\n` +
    `> ↳ Rehabilitasi adalah proses memperbaiki perilaku agar pelaku dapat kembali dipercaya masyarakat.\n\n` +

    `📊 *STATUS KRIMINAL*\n` +
    `> ↳ Status : *${getStatusLabel(process?.status)}*\n` +
    `> ↳ Poin buronan aktif : *${wantedScore} poin*\n` +
    `> ↳ Total riwayat kriminal seumur hidup : *${computeCrimeScore(crimeData)} poin* (tidak dihapus saat rehabilitasi).\n` +
    `> ↳ Selama proses aktif, semua command tindak kriminal ditolak.\n\n` +

    `📌 *PERINTAH*\n` +
    `> ↳ Gunakan *.rh guide* untuk panduan dan *.rh command* untuk daftar perintah.\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'mulai') {
  if (process?.status === 'active') {
    return m.reply(
      `╭─❏「 ℹ️ REHABILITASI 」❏\n` +
      `│ ℹ️ *REHABILITASI SUDAH BERJALAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${statusText(process, now)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (isImprisoned(userRPG, now)) {
    return m.reply(
      `╭─❏「 🚔 REHABILITASI 」❏\n` +
      `│ 🚔 *MASIH DI PENJARA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu harus menyelesaikan masa penjara terlebih dahulu sebelum memulai rehabilitasi.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (wantedScore <= 0) {
    return m.reply(
      `╭─❏「 ✅ REHABILITASI 」❏\n` +
      `│ ✅ *TIDAK ADA POIN BURONAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu tidak memiliki poin buronan aktif yang perlu direhabilitasi.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const requirements = getRehabilitationRequirements(wantedScore)

  if (!startRehabilitation(userRPG, wantedScore, now)) {
    return m.reply(
      `╭─❏「 ❌ REHABILITASI 」❏\n` +
      `│ ❌ *REHABILITASI TIDAK DAPAT DIMULAI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Periksa status dan poin buronanmu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  await saveDB(wdb)

  return m.reply(
    `╭─❏「 ✅ REHABILITASI DIMULAI 」❏\n` +
    `│ ✅ *PROSES REHABILITASI DIMULAI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📋 *DETAIL REHABILITASI*\n` +
    `> ↳ 💀 Poin buronan : *${wantedScore}*\n` +
    `> ↳ ⏳ Durasi minimum : *${formatDuration(requirements.durationMs)}*\n` +
    `> ↳ 📈 Target progres : *${requirements.requiredProgress} poin*\n` +
    `> ↳ 💳 Biaya rehabilitasi : *Rp ${requirements.requiredFee.toLocaleString('id-ID')}* (${REHABILITATION_FEE.toLocaleString('id-ID')} x ${wantedScore} poin)\n\n` +

    `📌 *LANGKAH BERIKUTNYA*\n` +
    `> ↳ Gunakan *.rh guide* untuk menyelesaikan proses.\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

  if (action === 'batal') {
  if (process?.status !== 'active') {
    return m.reply(
      `╭─❏「 ❌ REHABILITASI 」❏\n` +
      `│ ❌ *TIDAK ADA PROSES AKTIF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tidak ada proses rehabilitasi aktif yang bisa dibatalkan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  process.status = 'cancelled'
  process.cancelledAt = now
  await saveDB(wdb)

  return m.reply(
    `╭─❏「 ❌ REHABILITASI DIBATALKAN 」❏\n` +
    `│ ❌ *PROSES REHABILITASI DIBATALKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Poin buronan dan riwayat kriminal tetap; kamu kembali berstatus buronan.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'cd') {
  if (process?.status !== 'active') {
    return m.reply('ℹ️ Cooldown aktivitas rehabilitasi tersedia setelah kamu memulai proses dengan *.rh mulai*.')
  }
  return m.reply(
    `╭─❏「 ⏳ COOLDOWN REHABILITASI 」❏\n` +
    `│ ⏳ *COOLDOWN AKTIVITAS*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${cooldownText(process, now)}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'bayar' || activityDefinitions[action] || action === 'all') {
  if (process?.status !== 'active') {
    return m.reply(
      `╭─❏「 ❌ REHABILITASI 」❏\n` +
      `│ ❌ *TIDAK SEDANG REHABILITASI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu tidak sedang menjalani rehabilitasi.\n` +
      `> ↳ Mulai dengan *.rh mulai*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'all') {
  if (!isPremiumUser(m.sender, wdb)) {
    return m.reply(
      `╭─❏「 👑 AKTIVITAS REHABILITASI ALL 」❏\n` +
      `│ ❌ *AKSES PREMIUM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Perintah *.rh all* khusus pengguna premium.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const readyActivities = Object.entries(activityDefinitions).filter(([activity, definition]) => {
    const cooldown = REHABILITATION_ACTIVITY_COOLDOWNS[activity]
    return cooldown - (now - (Number(process[definition.cooldownField]) || 0)) <= 0
  })

  if (!readyActivities.length) {
    return m.reply(
      `╭─❏「 ⏳ REHABILITASI ALL 」❏\n` +
      `│ ⏳ *SEMUA AKTIVITAS COOLDOWN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Semua aktivitas rehabilitasi masih cooldown.\n\n` +
      `${cooldownText(process, now)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const completedActivities = []

  for (const [activity, definition] of readyActivities) {
    process[definition.cooldownField] = now
    process.progress = (Number(process.progress) || 0) + 2
    if (activity === 'sosial') process.socialActivities = (Number(process.socialActivities) || 0) + 1
    completedActivities.push(`> ↳ *${definition.label}:* ${randomItem(REHABILITATION_ACTIVITY_STORIES[activity])} (+2 poin)`)
  }

  await saveDB(wdb)

  return m.reply(
    `╭─❏「 👑 AKTIVITAS REHABILITASI 」❏\n` +
    `│ 👑 *AKTIVITAS PREMIUM SELESAI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${completedActivities.join('\n')}\n\n` +
    `${statusText(process, now)}\n\n` +
    `> ↳ Aktivitas yang masih cooldown dilewati.\n` +
    `> ↳ Cek cooldown dengan *.rh cd*.\n` +
    `> ↳ Jika semua syarat terpenuhi, gunakan *.rh lapor*.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  let paymentResult = null
  if (action === 'bayar') {
    const payment = getRehabilitationPaymentStatus(process)
    if (!payment.remainingAmount) {
      return m.reply('✅ Biaya rehabilitasi sudah lunas.')
    }
    const rawAmount = String(args[1] || '').toLowerCase()
    const amount = !rawAmount || rawAmount === 'all'
      ? payment.remainingAmount
      : Number(rawAmount)
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return m.reply(
        `❌ Nominal pembayaran harus berupa angka bulat positif.\n` +
        `Gunakan *.rh bayar <nominal>* atau *.rh bayar all* untuk melunasi sisa biaya.`
      )
    }
    if (amount > payment.remainingAmount) {
      return m.reply(
        `❌ Nominal melebihi sisa biaya rehabilitasi.\n` +
        `Sisa yang perlu dibayar: *Rp ${payment.remainingAmount.toLocaleString('id-ID')}*.`
      )
    }
    const balance = Number(wdb.money[m.sender]) || 0

    if (balance < amount) {
      return m.reply(
        `╭─❏「 ❌ PEMBAYARAN GAGAL 」❏\n` +
        `│ ❌ *SALDO TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Uangmu masih kurang *Rp ${(amount - balance).toLocaleString('id-ID')}* untuk pembayaran ini.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    wdb.money[m.sender] = balance - amount
    const updatedPayment = applyRehabilitationPayment(process, amount)
    paymentResult = updatedPayment.remainingAmount > 0
      ? `✅ Pembayaran diterima. Masih kurang Rp ${updatedPayment.remainingAmount.toLocaleString('id-ID')}.`
      : '✅ Pembayaran rehabilitasi lunas.'
  } else {
    const activity = activityDefinitions[action]
    const cooldown = REHABILITATION_ACTIVITY_COOLDOWNS[action]
    const remaining = cooldown - (now - (Number(process[activity.cooldownField]) || 0))

    if (remaining > 0) {
      return m.reply(
        `╭─❏「 ⏳ ${activity.label.toUpperCase()} REHABILITASI 」❏\n` +
        `│ ⏳ *MASIH COOLDOWN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Aktivitas ${activity.label.toLowerCase()} bisa dilakukan lagi dalam *${formatDuration(remaining)}*.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    process[activity.cooldownField] = now
    if (action === 'sosial') process.socialActivities = (Number(process.socialActivities) || 0) + 1
    process.progress = (Number(process.progress) || 0) + 2
  }

  await saveDB(wdb)

  return m.reply(
    `╭─❏「 📋 AKTIVITAS REHABILITASI 」❏\n` +
    `│ 📋 *PROSES REHABILITASI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${action === 'bayar'
      ? paymentResult
      : `${randomItem(REHABILITATION_ACTIVITY_STORIES[action])} (+2 poin progres).`}\n\n` +
    `${statusText(process, now)}\n\n` +
    `> ↳ Jika semua syarat sudah terpenuhi, gunakan *.rh lapor*.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'lapor') {
  if (process?.status !== 'active') {
    return m.reply('❌ Tidak ada rehabilitasi aktif untuk dilaporkan.')
  }
  const completion = getRehabilitationCompletion(userRPG, now)
  if (!completion.ready) {
    const waitingFor = completion.reason === 'time'
      ? `⏳ Waktu minimum masih tersisa *${formatDuration(Math.max(0, Number(process.completesAt) - now))}*.`
      : completion.reason === 'progress'
        ? `📈 Progres masih kurang *${Math.max(0, Number(process.requiredProgress) - (Number(process.progress) || 0))} poin*.`
        : completion.reason === 'payments'
          ? `💳 Pembayaran masih kurang *Rp ${getRehabilitationPaymentStatus(process).remainingAmount.toLocaleString('id-ID')}*.`
          : `🤝 Selesaikan setidaknya satu kegiatan melalui *.rh sosial*.`
    return m.reply(`⏳ Rehabilitasi belum dapat diselesaikan.\n${waitingFor}`)
  }
  if (completeRehabilitation(userRPG, crimeData, now)) {
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 🎉 REHABILITASI BERHASIL 」❏\n` +
      `│ 🎉 *REHABILITASI BERHASIL!*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Poin buronan aktifmu sekarang *0*.\n` +
      `> ↳ Catatan kriminal seumur hidup tetap tersimpan.\n` +
      `> ↳ Masyarakat kembali memberimu kesempatan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
}

if (action === 'progres' || !action) {
  if (process?.status !== 'active') {
    if (action === 'progres') {
      return m.reply(
        `╭─❏「 ℹ️ PROGRES REHABILITASI 」❏\n` +
        `│ ℹ️ *TIDAK ADA REHABILITASI AKTIF*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Status terakhir: *${process?.status || 'belum dimulai'}*.\n` +
        `> ↳ Gunakan *.rh mulai* untuk memulai.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    return m.reply(
      `╭─❏「 🕊️ STATUS REHABILITASI 」❏\n` +
      `│ 🕊️ *STATUS REHABILITASI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `📊 *STATUS KRIMINAL*\n` +
      `> ↳ Status : *${getStatusLabel(process?.status)}*\n` +
      `> ↳ Poin buronan aktif : *${wantedScore}*\n` +
      `> ↳ Total riwayat kriminal seumur hidup : *${computeCrimeScore(crimeData)} poin*.\n\n` +

      `📌 *PERINTAH*\n` +
      `> ↳ Gunakan *.rh mulai* untuk memperbaiki status kriminal.\n` +
      `> ↳ Gunakan *.rh command* untuk melihat perintah.\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  const completion = getRehabilitationCompletion(userRPG, now)

  await saveDB(wdb)

  if (!action) {
    return m.reply(
      `╭─❏「 🕊️ STATUS REHABILITASI 」❏\n` +
      `│ 🕊️ *STATUS REHABILITASI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `📊 *STATUS KRIMINAL*\n` +
      `> ↳ Poin buronan aktif : *${wantedScore} poin*\n` +
      `> ↳ Total riwayat kriminal seumur hidup : *${computeCrimeScore(crimeData)} poin*\n\n` +

      `${statusText(process, now)}\n\n` +

      `📌 *PERINTAH*\n` +
      `> ↳ Gunakan *.rh progres* untuk melihat syarat yang belum terpenuhi.\n` +
      `> ↳ Gunakan *.rh command* untuk daftar perintah.\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  const waitingFor = completion.reason === 'time'
    ? `\n⏳ Waktu minimum belum terpenuhi.`
    : completion.reason === 'progress'
      ? `\n📈 Tambah progres melalui *.rh kerja*, *.rh sosial*, *.rh ibadah*, *.rh olahraga*, atau *.rh belajar*.`
      : completion.reason === 'payments'
        ? `\n💳 Selesaikan kewajiban melalui *.rh bayar*.`
        : completion.ready
          ? `\n✅ Semua syarat terpenuhi. Gunakan *.rh lapor* untuk menyelesaikan proses.`
          : `\n🤝 Lakukan kegiatan melalui *.rh sosial*.`

  return m.reply(
    `╭─❏「 📊 PROGRES REHABILITASI 」❏\n` +
    `│ 📊 *PROGRES REHABILITASI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${statusText(process, now)}${waitingFor}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  return m.reply('❌ Subcommand tidak dikenal. Gunakan *.rh command* untuk daftar command.')
}

handler.help = ['rh', 'rh info', 'rh guide', 'rh command', 'rh list', 'rh mulai', 'rh start', 'rh bayar <nominal/all>', 'rh kerja', 'rh sosial', 'rh ibadah', 'rh olahraga', 'rh belajar', 'rh cd', 'rh lapor', 'rh progres', 'rh batal']
handler.tags = ['rpg']
handler.command = /^(rehabilitasi|rh)$/i
handler.group = true
export default handler
