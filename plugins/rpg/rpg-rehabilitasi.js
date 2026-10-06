import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { computeCrimeScore, getActiveCrimeScore } from '../../lib/crimeHelper.js'
import {
  applyRehabilitationPayment,
  completeRehabilitation,
  getRehabilitationCompletion,
  getRehabilitationPaymentStatus,
  getRehabilitationRequirements,
  REHABILITATION_FEE,
  REHABILITATION_SOCIAL_COOLDOWN_MS,
  REHABILITATION_WORK_COOLDOWN_MS,
  startRehabilitation
} from '../../lib/rehabilitationHelper.js'

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
    `💳 Biaya dibayar: *Rp ${payment.paidAmount.toLocaleString('id-ID')}/${payment.requiredAmount.toLocaleString('id-ID')}*\n` +
    `🤝 Kegiatan sosial: *${Number(process.socialActivities) || 0}x*`
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const wdb = loadDB()
  const action = String(args[0] || '').toLowerCase()
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
    `> ↳ *.rh mulai* — Memulai rehabilitasi\n` +
    `> ↳ *.rh bayar <nominal/all>* — Cicil nominal atau lunasi sisa biaya\n` +
    `> ↳ *.rh kerja* — Bekerja untuk progres\n` +
    `> ↳ *.rh sosial* — Kegiatan sosial\n` +
    `> ↳ *.rh progres* — Melihat perkembangan\n` +
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
    `> ↳ 2. Mulai proses dengan *.rh mulai*. Durasi rehabilitasi adalah 10 menit dikali poin buronan aktif.\n` +
    `> ↳ 3. Bayar total Rp ${REHABILITATION_FEE.toLocaleString('id-ID')} dengan mencicil lewat *.rh bayar <nominal>* atau lunas lewat *.rh bayar all*; pembayaran tidak memiliki cooldown.\n` +
    `> ↳ 4. Gunakan *.rh kerja* (cooldown 2 menit) dan *.rh sosial* (cooldown 4 menit) untuk menambah progres.\n` +
    `> ↳ 5. Proses selesai jika waktunya cukup, progres dan pembayaran terpenuhi, serta ada kegiatan sosial.\n` +
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
    `> ↳ 💳 Kewajiban : *${requirements.requiredPayments}x Rp ${REHABILITATION_FEE.toLocaleString('id-ID')}*\n\n` +

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

if (action === 'bayar' || action === 'kerja' || action === 'sosial') {
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
        `> ↳ Nominal pembayaran: *Rp ${amount.toLocaleString('id-ID')}*.\n` +
        `> ↳ Saldo kamu: *Rp ${balance.toLocaleString('id-ID')}*.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    wdb.money[m.sender] = balance - amount
    const updatedPayment = applyRehabilitationPayment(process, amount)
    paymentResult = `✅ Rp ${amount.toLocaleString('id-ID')} dibayar. Sisa biaya: Rp ${updatedPayment.remainingAmount.toLocaleString('id-ID')}.`
  } else if (action === 'kerja') {
    const remaining = REHABILITATION_WORK_COOLDOWN_MS - (now - (Number(process.lastWorkAt) || 0))

    if (remaining > 0) {
      return m.reply(
        `╭─❏「 ⏳ KERJA REHABILITASI 」❏\n` +
        `│ ⏳ *MASIH COOLDOWN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kamu bisa bekerja lagi dalam *${formatDuration(remaining)}*.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    process.lastWorkAt = now
    process.progress = (Number(process.progress) || 0) + 2
  } else {
    const remaining = REHABILITATION_SOCIAL_COOLDOWN_MS - (now - (Number(process.lastSocialAt) || 0))

    if (remaining > 0) {
      return m.reply(
        `╭─❏「 ⏳ KEGIATAN SOSIAL 」❏\n` +
        `│ ⏳ *MASIH COOLDOWN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kegiatan sosial berikutnya tersedia dalam *${formatDuration(remaining)}*.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    process.lastSocialAt = now
    process.socialActivities = (Number(process.socialActivities) || 0) + 1
    process.progress = (Number(process.progress) || 0) + 2
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

  await saveDB(wdb)

  return m.reply(
    `╭─❏「 📋 AKTIVITAS REHABILITASI 」❏\n` +
    `│ 📋 *PROSES REHABILITASI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${action === 'bayar'
      ? paymentResult
      : action === 'kerja'
        ? '💼 Pekerjaan rehabilitasi selesai.'
        : '🤝 Kegiatan sosial selesai.'}\n\n` +
    `${statusText(process, now)}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
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

  if (completeRehabilitation(userRPG, crimeData, now)) {
    await saveDB(wdb)

    return m.reply(
      `╭─❏「 🎉 REHABILITASI BERHASIL 」❏\n` +
      `│ 🎉 *REHABILITASI BERHASIL!*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Poin buronan aktifmu menjadi *0*.\n` +
      `> ↳ Catatan kriminal seumur hidup tetap tersimpan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

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
      ? `\n📈 Tambah progres melalui *.rh kerja* atau *.rh sosial*.`
      : completion.reason === 'payments'
        ? `\n💳 Selesaikan kewajiban melalui *.rh bayar*.`
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

handler.help = ['rh', 'rh info', 'rh guide', 'rh command', 'rh list', 'rh mulai', 'rh bayar <nominal/all>', 'rh kerja', 'rh sosial', 'rh progres', 'rh batal']
handler.tags = ['rpg']
handler.command = /^(rehabilitasi|rh)$/i
handler.group = true
export default handler
