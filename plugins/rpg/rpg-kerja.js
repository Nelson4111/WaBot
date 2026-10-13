import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome, scaleDifficultyXP } from '../../lib/rpgDifficulty.js'
import { getActiveCrimeScore } from '../../lib/crimeHelper.js'
import {
  JOBS,
  JOB_GUIDE,
  JOB_APPLY_COOLDOWN_MS,
  JOB_ATTENDANCE_MAX_NO_WORK_DAYS,
  JOB_MULTI_APPLY_MIN_POINTS,
  JOB_ABSENT_INCOME_MULTIPLIER_1,
  JOB_ABSENT_INCOME_MULTIPLIER_2,
  JOB_LEAVE_COOLDOWN_MS,
  JOB_MAX_APPLIED,
  JOB_TALK_COOLDOWN_MS,
  JOB_TALK_STORIES,
  JOB_PROMOTION_STORIES,
  JOB_APPLY_STORIES,
  JOB_APPLY_REJECT_STORIES,
  JOB_WORK_STORIES,
  JOB_TITLES,
  INDIVIDUAL_JOB_TITLES,
  isIndividualJob,
  getJobByIdentifier,
  getUnlockedJobs,
  getJobTitleByPoints,
  getJobTitleMultiplier,
  withJobExp
} from '../../lib/rpgJobData.js'

const fmtRp = value => `Rp ${Number(value || 0).toLocaleString('id-ID')}`
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

function ensureRpgState(userRPG) {
  if (!userRPG) return null
  if (userRPG.lastkerja === undefined) userRPG.lastkerja = 0
  if (typeof userRPG.level !== 'number' || Number.isNaN(userRPG.level)) userRPG.level = 1
  if (typeof userRPG.exp !== 'number' || Number.isNaN(userRPG.exp)) userRPG.exp = 0
  if (typeof userRPG.promotionPoints !== 'number' || Number.isNaN(userRPG.promotionPoints)) userRPG.promotionPoints = Number(userRPG.promotionPoints || 0)
  if (!Array.isArray(userRPG.appliedJobs)) userRPG.appliedJobs = []
  if (!userRPG.performance || typeof userRPG.performance !== 'object') userRPG.performance = {}
  if (!Array.isArray(userRPG.jobHistory)) userRPG.jobHistory = []
  if (!userRPG.jobProgress || typeof userRPG.jobProgress !== 'object') userRPG.jobProgress = {}
  if (!userRPG.attendance || typeof userRPG.attendance !== 'object') userRPG.attendance = {}
  if (!userRPG.leave || typeof userRPG.leave !== 'object') userRPG.leave = { active: false }
  const resolveJobName = value => {
    const savedName = String(value || '')
    const job = JOBS.find(entry => {
      const legacyId = entry.job.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return entry.job.toLowerCase() === savedName.toLowerCase() || legacyId === savedName.toLowerCase()
    })
    return job?.job || savedName
  }
  userRPG.appliedJobs = Array.from(new Set(userRPG.appliedJobs.map(resolveJobName)))
  userRPG.jobHistory = Array.from(new Set(userRPG.jobHistory.map(resolveJobName)))
  userRPG.currentJobName = resolveJobName(userRPG.currentJobName)
  if (!userRPG.currentJobName && userRPG.currentJobId) {
    userRPG.currentJobName = resolveJobName(userRPG.currentJobId)
  }
  delete userRPG.currentJobId
  userRPG.promotionPoints = Number(userRPG.promotionPoints || 0)
  const currentJobName = userRPG.currentJobName
  const hasPerJobProgress = Object.keys(userRPG.jobProgress).length > 0
  for (const jobName of new Set([...userRPG.appliedJobs, ...userRPG.jobHistory, currentJobName].filter(Boolean))) {
    const progress = userRPG.jobProgress[jobName]
    if (!progress || typeof progress !== 'object') {
      userRPG.jobProgress[jobName] = {
        promotionPoints: hasPerJobProgress
          ? (jobName === currentJobName ? userRPG.promotionPoints : Number(progress || 0))
          : userRPG.promotionPoints,
        works: 0,
        talks: 0
      }
    } else {
      progress.promotionPoints = Number(progress.promotionPoints ?? (
        !hasPerJobProgress || jobName === currentJobName ? userRPG.promotionPoints : 0
      )) || 0
      progress.works = Number(progress.works || 0)
      progress.talks = Number(progress.talks || 0)
    }
  }
  if (!userRPG.jobTitle) userRPG.jobTitle = getJobTitleByPoints(userRPG.promotionPoints, currentJobName)
  userRPG.performance = {
    works: Number(userRPG.performance.works || 0),
    attendance: Number(userRPG.performance.attendance || 0),
    absent: Number(userRPG.performance.absent || 0),
    leave: Number(userRPG.performance.leave || 0),
    talks: Number(userRPG.performance.talks || 0),
    promotions: Number(userRPG.performance.promotions || 0),
    applied: Number(userRPG.performance.applied || 0),
    ...userRPG.performance
  }
  return userRPG
}

function getJobProgress(userRPG, jobName = userRPG.currentJobName) {
  if (!jobName) return { promotionPoints: Number(userRPG.promotionPoints || 0), works: 0, talks: 0 }
  if (!userRPG.jobProgress[jobName]) {
    userRPG.jobProgress[jobName] = { promotionPoints: 0, works: 0, talks: 0 }
  }
  return userRPG.jobProgress[jobName]
}

function getCurrentJobTitle(userRPG, jobName = userRPG.currentJobName) {
  const points = Number(getJobProgress(userRPG, jobName).promotionPoints || 0)
  return getJobTitleByPoints(points, jobName) || 'Anak Magang'
}

function getPromotionProgressText(points, jobName) {
  const titles = isIndividualJob(jobName) ? INDIVIDUAL_JOB_TITLES : JOB_TITLES
  const nextTitle = titles.find(entry => points < entry.points)
  if (!nextTitle) return `> ⭐ Poin promosi: ${points} • Jabatan tertinggi tercapai`
  return `> ⭐ Progres promosi: ${points}/${nextTitle.points} poin • kurang ${nextTitle.points - points} poin menuju ${nextTitle.title}`
}

function getHighestRankedJob(userRPG) {
  return userRPG.appliedJobs
    .map(jobName => JOBS.find(job => job.job.toLowerCase() === jobName.toLowerCase()))
    .filter(Boolean)
    .reduce((highest, job) => {
      if (!highest) return job
      return Number(getJobProgress(userRPG, job.job).promotionPoints || 0) >
        Number(getJobProgress(userRPG, highest.job).promotionPoints || 0)
        ? job
        : highest
    }, null)
}

function getActiveJob(userRPG, levelOverride = userRPG.level) {
  const currentJobName = userRPG.currentJobName ?? null
  if (!currentJobName) return null
  const current = JOBS.find(job => job.job.toLowerCase() === currentJobName.toLowerCase())
  if (current && current.lv <= levelOverride) return current
  return null
}

function getTitleFromJob(job, userRPG = null) {
  if (!job) return 'Belum ada jabatan'
  if (!userRPG) return 'Anak Magang'
  return getCurrentJobTitle(userRPG, job.job)
}

function getJobLabel(job) {
  return job?.job || 'Belum ada pekerjaan'
}

function getSelectedJob(userRPG, input = '') {
  const text = String(input || '').trim()
  if (!text) return getActiveJob(userRPG)
  return getJobByIdentifier(text, userRPG.level)
}

function getAttendanceMultiplier(userRPG, now = Date.now()) {
  const lastWork = Number(userRPG.lastkerja || 0)
  if (!lastWork) return 1
  const diff = now - lastWork
  if (diff > JOB_ATTENDANCE_MAX_NO_WORK_DAYS * 24 * 60 * 60 * 1000) return 1
  if (diff > 2 * 24 * 60 * 60 * 1000) return JOB_ABSENT_INCOME_MULTIPLIER_2
  if (diff > 24 * 60 * 60 * 1000) return JOB_ABSENT_INCOME_MULTIPLIER_1
  return 1
}

function applyAttendancePenalty(userRPG, now = Date.now()) {
  const lastWork = Number(userRPG.lastkerja || 0)
  if (!lastWork) return false
  const diff = now - lastWork
  if (diff > JOB_ATTENDANCE_MAX_NO_WORK_DAYS * 24 * 60 * 60 * 1000) {
    userRPG.currentJobName = null
    userRPG.firedAt = now
    userRPG.performance.absent = Number(userRPG.performance.absent || 0) + 1
    userRPG.attendance.lastPenaltyAt = now
    return true
  }
  return false
}

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
  const wdb = loadDB()
  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
  if (!wdb.users[m.sender].rpg) wdb.users[m.sender].rpg = {}
  if (!wdb.money) wdb.money = {}
  if (!wdb.money[m.sender]) wdb.money[m.sender] = 0

  const userRPG = ensureRpgState(wdb.users[m.sender].rpg)
  const now = Date.now()

  const parsed = (text || '').trim()
  const parts = parsed ? parsed.split(/\s+/) : []
  const isWorkAlias = ['work', 'kerja'].includes(String(command || '').toLowerCase())
  let action = isWorkAlias ? 'work' : (parts[0] || '').toLowerCase()
  let payload = isWorkAlias ? parsed : parts.slice(1).join(' ')
  const listJobs = withJobExp()

  if (action === 'autoapply' && command.toLowerCase() === 'job') {
    if (!isOwner) return m.reply(`╭─❏「 🔒 AKSES DITOLAK 」❏
│ 🔐 AKSES OWNER
╰─━━━━━━━━━━━━━━─

> ↳ Perintah ini khusus owner/co-owner.`)

    const assignedByJob = new Map()
    let alreadyWorking = 0
    let blockedByApplicationLimit = 0
    let withoutEligibleJob = 0

    for (const account of Object.values(wdb.users)) {
      if (!account?.rpg || typeof account.rpg !== 'object') continue

      const targetRPG = ensureRpgState(account.rpg)
      if (getActiveJob(targetRPG)) {
        alreadyWorking++
        continue
      }

      const unlockedJobs = getUnlockedJobs(targetRPG.level)
      let selectedJob = unlockedJobs.at(-1)
      if (!selectedJob) {
        withoutEligibleJob++
        continue
      }

      if (
        !targetRPG.appliedJobs.includes(selectedJob.job) &&
        targetRPG.appliedJobs.length >= JOB_MAX_APPLIED
      ) {
        selectedJob = unlockedJobs
          .filter(job => targetRPG.appliedJobs.includes(job.job))
          .at(-1)
        if (!selectedJob) {
          blockedByApplicationLimit++
          continue
        }
      }

      if (!targetRPG.appliedJobs.includes(selectedJob.job)) {
        targetRPG.appliedJobs.push(selectedJob.job)
      }
      targetRPG.currentJobName = selectedJob.job
      targetRPG.jobHistory = Array.from(new Set([...targetRPG.jobHistory, selectedJob.job]))
      const progress = getJobProgress(targetRPG, selectedJob.job)
      targetRPG.promotionPoints = Number(progress.promotionPoints || 0)
      targetRPG.jobTitle = getJobTitleByPoints(targetRPG.promotionPoints, selectedJob.job)
      assignedByJob.set(selectedJob.job, (assignedByJob.get(selectedJob.job) || 0) + 1)
    }

    await saveDB(wdb)
    const totalAssigned = [...assignedByJob.values()].reduce((total, count) => total + count, 0)
    const jobSummary = [...assignedByJob.entries()]
      .map(([job, count]) => `> 💼 ${job}: ${count} player`)
    return m.reply([
      '╭─❏「 ✅ AUTO APPLY PEKERJAAN 」❏',
      '│ 📋 HASIL PENEMPATAN PEKERJA',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `👥 *STATISTIK PENEMPATAN*`,
      `> ↳ Player yang diberi pekerjaan: ${totalAssigned}`,
      `> ↳ Player yang sudah punya pekerjaan aktif: ${alreadyWorking}`,
      `> ↳ Tidak diproses karena batas lamaran: ${blockedByApplicationLimit}`,
      `> ↳ Tidak ada pekerjaan sesuai level: ${withoutEligibleJob}`,
      '',
      '─━━━━━━━━━━━━━━─',
      '💼 *DAFTAR PEKERJAAN YANG DIBERIKAN*',
      ...(jobSummary.length ? jobSummary : ['> ↳ Tidak ada penempatan baru.']),
      '',
      '─━━━━━━━━━━━━━━─',
      'ℹ️ *INFORMASI*',
      '> ↳ Penempatan memakai pekerjaan yang tersedia di sistem sesuai level.',
      '> ↳ Penempatan ini bukan klaim adanya lowongan terbatas atau jaminan pekerjaan.'
    ].join('\n'))
  }

  if (!parsed && command === 'job') {
    const statusCooldown = scaleDifficultyCooldown(userRPG, 120000)
    const remaining = Math.max(0, statusCooldown - (now - Number(userRPG.lastkerja || 0)))
    const currentJob = getActiveJob(userRPG)
    const highestJob = getHighestRankedJob(userRPG)
    const displayJob = highestJob || currentJob
    const displayPoints = Number(getJobProgress(userRPG, displayJob?.job).promotionPoints || 0)

    const caption = [
      '╭─❏「 💼 JOB SYSTEM 」❏',
      '│ 💼 INFORMASI PEKERJAAN',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 🎮 Level: Lv.${userRPG.level}`,
      `> 💼 Pekerjaan: ${getJobLabel(displayJob)}`,
      `> 🏆 Jabatan: ${getCurrentJobTitle(userRPG, displayJob?.job)}`,
      `> 💰 Income: ${fmtRp(Math.floor(Number(displayJob?.gaji || 0) * getJobTitleMultiplier(displayPoints, displayJob?.job)))}`,
      `> 📊 Status: ${remaining > 0 ? `⏳ ${Math.ceil(remaining / 1000)} detik lagi` : '✅ Siap kerja'}`,
      '',
      '📌 *INFORMASI JOB SYSTEM*',
      '> ↳ Sistem kerja harian dengan absensi, lamaran, cuti, promosi, dan profil kerja.',
      `> 📖 ${usedPrefix}job guide`,
      '> ↳ Panduan sistem pekerjaan.',
      `> 📋 ${usedPrefix}job command`,
      '> ↳ Daftar perintah pekerjaan.',
      `> 💼 Alias kerja: ${usedPrefix}work / ${usedPrefix}job work`
    ].join('\n')
    return m.reply(caption)
  }

  if (['guide', 'command', 'help'].includes(action)) {
    const guideText = [
      ...JOB_GUIDE.map(line => line)
    ].join('\n')
    return m.reply(guideText)
  }


  if (action === 'info') {
    const jobsWithIncome = userRPG.appliedJobs
      .map(jobName => {
        const job = JOBS.find(entry => entry.job.toLowerCase() === jobName.toLowerCase())
        if (!job) return null
        const progress = getJobProgress(userRPG, job.job)
        const points = Number(progress.promotionPoints || 0)
        const income = Math.floor(Number(job.gaji || 0) * getJobTitleMultiplier(points, job.job))
        return {
          job,
          points,
          income,
          title: getCurrentJobTitle(userRPG, job.job),
          active: userRPG.currentJobName?.toLowerCase() === job.job.toLowerCase()
        }
      })
      .filter(Boolean)
    const totalIncome = jobsWithIncome.reduce((total, entry) => total + entry.income, 0)
    const caption = [
      '╭─❏「 💼 JOB INFO 」❏',
      '│ 📋 RINGKASAN PEKERJAAN',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 🎮 Level: Lv.${userRPG.level}`,
      `> 💼 Jumlah pekerjaan: ${jobsWithIncome.length}`,
      `> 💰 Total potensi income: ${fmtRp(totalIncome)} per kerja`,
      '',
      '─━━━━━━━━━━━━━━─',
      '📂 *PEKERJAAN DAN JABATAN*',
      '',
      ...(jobsWithIncome.length
        ? jobsWithIncome.map(({ job, points, income, title, active }) => [
          `> ${active ? '✅' : '▫️'} *${job.job}*${active ? ' (aktif)' : ''}`,
          `> ↳ Jabatan: ${title}`,
          `> ↳ Poin promosi: ${points}`,
          `> ↳ Income: ${fmtRp(income)}`
        ].join('\n'))
        : ['> Belum ada pekerjaan yang dilamar.']),
      '',
      '─━━━━━━━━━━━━━━─',
      'ℹ️ *INFORMASI*',
      '',
      '> ↳ Total income menjumlahkan potensi gaji semua pekerjaan.',
      '> ↳ Setiap perintah kerja hanya membayar pekerjaan yang dipilih.',
      '',
      `📌 Lihat daftar pekerjaan dengan *${usedPrefix}job list*.`,
      '',
      '─━━━━━━━━━━━━━━─'
    ].join('\n')
    return m.reply(caption)
  }

  if (['list', 'l', 'daftar'].includes(action)) {
    const currentJob = getActiveJob(userRPG)
    const caption = [
      '╭─❏「 💼 DAFTAR PEKERJAAN 」❏',
      '│ 📋 INFORMASI LOWONGAN KERJA',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 🎮 Level kamu: Lv.${userRPG.level}`,
      `> 💼 Pekerjaan aktif: ${getJobLabel(currentJob)}`,
      `> 🏆 Jabatan: ${getCurrentJobTitle(userRPG, currentJob?.job)}`,
      '',
      '─━━━━━━━━━━━━━━─',
      '📋 *LIST PEKERJAAN*',
      '',
    ]

    listJobs.forEach((job, index) => {
      const unlock = userRPG.level >= job.lv ? '✅' : '🔒'
      caption.push(`> ${index + 1}. ${unlock} *${job.job}*`)
      caption.push(`> ↳ Level minimum: Lv.${job.lv}`)
      caption.push(`> ↳ Gaji: ${fmtRp(job.gaji)}`)
      caption.push(`> ↳ XP: +${job.exp}`)
      if (index < listJobs.length - 1) caption.push('')
    })

    caption.push('')
    caption.push('─━━━━━━━━━━━━━━─')
    caption.push('📌 *CARA KERJA*')
    caption.push('')
    caption.push(`> 💼 ${usedPrefix}work`)
    caption.push(`> 💼 ${usedPrefix}job work`)
    caption.push('')
    caption.push('─━━━━━━━━━━━━━━─')
    return m.reply(caption.join('\n'))
  }

  if (action === 'profile') {
    const currentJob = getActiveJob(userRPG)
    const displayJob = getHighestRankedJob(userRPG) || currentJob
    const promotion = Number(getJobProgress(userRPG, displayJob?.job).promotionPoints || 0)
    const income = Math.floor(Number(displayJob?.gaji || 0) * getJobTitleMultiplier(promotion, displayJob?.job))
    const caption = [
      '╭─❏「 💼 JOB PROFILE 」❏',
      '│ 👤 PROFIL PEKERJA',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 👤 Nama: ${m.pushName || 'Player'}`,
      `> 🎮 Level: Lv.${userRPG.level}`,
      `> 💼 Pekerjaan: ${getJobLabel(displayJob)}`,
      `> 🏆 Jabatan: ${getCurrentJobTitle(userRPG, displayJob?.job)}`,
      `> 💰 Income: ${fmtRp(income)}`,
      `> ⭐ Poin promosi: ${promotion}`,
      '',
      '─━━━━━━━━━━━━━━─',
      '📊 *STATISTIK KERJA*',
      '',
      `> 📅 Absensi: ${Number(userRPG.performance.attendance || 0)} hari`,
      `> 💼 Kerja: ${Number(userRPG.performance.works || 0)} kali`,
      '',
      '─━━━━━━━━━━━━━━─',
      '📂 *PROGRES PEKERJAAN*',
      '',
      ...(userRPG.appliedJobs.length
        ? userRPG.appliedJobs.map(jobName => {
          const points = Number(getJobProgress(userRPG, jobName).promotionPoints || 0)
          return `> 💼 *${jobName}*\n` +
            `> ↳ Jabatan: ${getCurrentJobTitle(userRPG, jobName)}\n` +
            `> ↳ Poin promosi: ${points}`
        })
        : ['> Belum ada pekerjaan yang dilamar.']),
      '',
      '─━━━━━━━━━━━━━━─'
    ].join('\n')
    return m.reply(caption)
  }

  if (action === 'performance') {
    const perf = userRPG.performance || {}
    const caption = [
      '╭─❏「 💼 JOB PERFORMANCE 」❏',
      '│ 📊 STATISTIK PEKERJAAN',
      '╰─━━━━━━━━━━━━━━─',
      '',
      '📊 *AKTIVITAS KERJA*',
      '',
      `> 💼 Kerja: ${Number(perf.works || 0)}x`,
      `> 📅 Absensi: ${Number(perf.attendance || 0)}x`,
      `> 🌴 Cuti: ${Number(perf.leave || 0)}x`,
      `> ❌ Alpha: ${Number(perf.absent || 0)}x`,
      `> 💬 Talk: ${Number(perf.talks || 0)}x`,
      '',
      '─━━━━━━━━━━━━━━─',
      '🏆 *RIWAYAT KARIER*',
      '',
      `> 📈 Promosi: ${Number(perf.promotions || 0)}x`,
      `> 📝 Lamaran: ${Number(perf.applied || 0)}x`,
      '',
      '─━━━━━━━━━━━━━━─',
      '💼 *PERFORMA TIAP PEKERJAAN*',
      '',
      ...(userRPG.appliedJobs.length
        ? userRPG.appliedJobs.map(jobName => {
          const progress = getJobProgress(userRPG, jobName)
          return `> 💼 *${jobName}*\n` +
            `> ↳ Jabatan: ${getCurrentJobTitle(userRPG, jobName)}\n` +
            `> ↳ Poin promosi: ${Number(progress.promotionPoints || 0)}\n` +
            `> ↳ Total kerja: ${Number(progress.works || 0)}x\n` +
            `> ↳ Total talk: ${Number(progress.talks || 0)}x`
        })
        : ['> Belum ada pekerjaan yang dilamar.']),
      '',
      '─━━━━━━━━━━━━━━─'
    ].join('\n')
    return m.reply(caption)
  }

  if (action === 'salary') {
    const target = payload || ''
    const job = getJobByIdentifier(target, userRPG.level)
    if (!job) return m.reply(`╭─❏「 ⚠️ JOB SALARY 」❏\n│ ❌ Pekerjaan *${target || 'yang kamu cari'}* tidak ditemukan.\n╰─━━━━━━━━━━━━━━─`)
    const jobPoints = Number(userRPG.jobProgress[job.job]?.promotionPoints || 0)
    const salaryMultiplier = getJobTitleMultiplier(jobPoints, job.job)
    const caption = [
      '╭─❏「 💰 JOB SALARY 」❏',
      '│ 💵 INFORMASI GAJI PEKERJAAN',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 💼 Pekerjaan: ${job.job}`,
      `> 🏆 Jabatan: ${getCurrentJobTitle(userRPG, job.job)}`,
      `> 💰 Gaji dasar: ${fmtRp(job.gaji)}`,
      `> 📈 Multiplier jabatan: x${salaryMultiplier}`,
      `> 💵 Gaji per absen: ${fmtRp(Math.floor(job.gaji * salaryMultiplier))}`,
      `> 🎮 Minimal level: Lv.${job.lv}`
    ].join('\n')
    return m.reply(caption)
  }

  if (['apply', 'lamar'].includes(action)) {
    const target = payload.trim()
    const selectedJob = getSelectedJob(userRPG, target)
    if (!selectedJob) return m.reply(`╭─❏「 ⚠️ JOB APPLICATION 」❏\n│ ❌ Nama/nomor pekerjaan tidak ditemukan.\n│ 📋 Cek *${usedPrefix}job list* untuk melihat daftar pekerjaan.\n╰─━━━━━━━━━━━━━━─`)
    if (selectedJob.lv > userRPG.level) return m.reply(`╭─❏「 🔒 JOB APPLICATION 」❏\n│ 💼 Pekerjaan: ${selectedJob.job}\n│ 🎮 Minimal level: Lv.${selectedJob.lv}\n│ ❌ Level kamu belum mencukupi.\n╰─━━━━━━━━━━━━━━─`)
    const alreadyApplied = userRPG.appliedJobs.includes(selectedJob.job)
    if (!alreadyApplied && userRPG.appliedJobs.length >= JOB_MAX_APPLIED) return m.reply(`╭─❏「 ⚠️ JOB APPLICATION 」❏\n│ 📝 Batas lamaran: ${JOB_MAX_APPLIED} pekerjaan.\n│ Kamu sudah mencapai batas maksimal lamaran.\n│ Pilih salah satu pekerjaan yang sudah ada.\n╰─━━━━━━━━━━━━━━─`)
    if (!alreadyApplied) {
      const unqualifiedJob = userRPG.appliedJobs.find(jobName => {
        return Number(getJobProgress(userRPG, jobName).promotionPoints || 0) < JOB_MULTI_APPLY_MIN_POINTS
      })
      if (unqualifiedJob) {
        return m.reply(`╭─❏「 🔒 SYARAT LAMARAN 」❏
│ 🏢 Pekerjaan: ${unqualifiedJob}
│ 🎖️ Jabatan saat ini: ${getCurrentJobTitle(userRPG, unqualifiedJob)}
│ 📈 Syarat: ${getJobTitleByPoints(JOB_MULTI_APPLY_MIN_POINTS, unqualifiedJob)} (${JOB_MULTI_APPLY_MIN_POINTS} poin)
╰─━━━━━━━━━━━━━━─

> Capai jabatan setara syarat minimum pada semua pekerjaan yang sudah kamu lamar sebelum melamar pekerjaan baru.`)
      }
    }

    const nowMs = Date.now()
    const lastApply = Number(userRPG.lastApplyAt || 0)
    if (lastApply && nowMs - lastApply < JOB_APPLY_COOLDOWN_MS) {
      const remaining = Math.ceil((JOB_APPLY_COOLDOWN_MS - (nowMs - lastApply)) / 1000)
      return m.reply(`╭─❏「 ⏳ JOB APPLICATION 」❏\n│ Kamu masih dalam cooldown lamaran kerja.\n│ ↳ Coba lagi dalam *${remaining} detik*.\n╰─━━━━━━━━━━━━━━─`)
    }

    const crimeScore = getActiveCrimeScore(userRPG.crime || {})
    const rejectChance = crimeScore > 50
      ? Math.min(0.75, 0.05 + (crimeScore - 50) * 0.02)
      : 0.05
    const accepted = Math.random() > rejectChance
    userRPG.lastApplyAt = nowMs
    userRPG.performance.applied = Number(userRPG.performance.applied || 0) + 1

    if (!accepted) {
      const story = pick(JOB_APPLY_REJECT_STORIES)
      saveDB(wdb)
      return m.reply([
        '╭─❏「 ⚠️ JOB APPLICATION 」❏',
        '│ Status: Lamaran ditolak.',
        '╰─━━━━━━━━━━━━━━─',
        '',
        `> ↳ ${story}`,
        crimeScore > 50
          ? `> ↳ Poin kriminal aktifmu ${crimeScore} (>50), sehingga peluang ditolak lebih tinggi.`
          : '> ↳ Peluang dasar ditolak kecil; poin kriminal aktif di atas 50 akan meningkatkannya.'
      ].join('\n'))
    }

    if (!alreadyApplied) {
      userRPG.appliedJobs.push(selectedJob.job)
      userRPG.jobProgress[selectedJob.job] = { promotionPoints: 0, works: 0, talks: 0 }
    }
    userRPG.currentJobName = selectedJob.job
    userRPG.jobHistory = Array.from(new Set([...(Array.isArray(userRPG.jobHistory) ? userRPG.jobHistory : []), selectedJob.job]))
    const selectedProgress = getJobProgress(userRPG, selectedJob.job)
    userRPG.promotionPoints = Number(selectedProgress.promotionPoints || 0)
    userRPG.jobTitle = getJobTitleByPoints(userRPG.promotionPoints, selectedJob.job)

    const story = pick(JOB_APPLY_STORIES)
    saveDB(wdb)
    return m.reply([
      '╭─❏「 ✅ JOB APPLICATION 」❏',
      '│ 🎉 LAMARAN DITERIMA',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 💼 Pekerjaan: ${selectedJob.job}`,
      `> 🏆 Jabatan: ${getCurrentJobTitle(userRPG)}`,
      `> ↳ ${story}`
    ].join('\n'))
  }


  if (['leave', 'cuti'].includes(action)) {
    const leaveState = userRPG.leave || {}
    if (leaveState.active) {
      const remaining = Math.max(0, Number(leaveState.until || 0) - now)
      return m.reply(`╭─❏「 ⏳ CUTI KERJA 」❏
│ 💼 STATUS CUTI
╰─━━━━━━━━━━━━━━─

> ↳ Kamu masih sedang cuti.
> ↳ Sisa cooldown: *${Math.ceil(remaining / 1000)} detik*.`)
    }

    userRPG.leave = {
      active: true,
      startedAt: now,
      until: now + JOB_LEAVE_COOLDOWN_MS
    }
    userRPG.performance.leave = Number(userRPG.performance.leave || 0) + 1
    return m.reply(`╭─❏「 🌴 CUTI KERJA 」❏
│ 💼 CUTI BERHASIL DIAJUKAN
╰─━━━━━━━━━━━━━━─

> ↳ Kamu telah mengambil cuti kerja.
> ↳ Gaji dihentikan sementara selama cuti.
> ↳ Kembali bekerja dengan *${usedPrefix}job return*.`)
  }

  if (action === 'return') {
    const leaveState = userRPG.leave || {}
    if (!leaveState.active) return m.reply(`╭─❏「 💼 KEMBALI BEKERJA 」❏
│ 📋 STATUS PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Kamu belum sedang cuti.
> ↳ Gunakan *${usedPrefix}job leave* untuk mengambil cuti.`)
    if (now < Number(leaveState.until || 0)) {
      const remaining = Math.ceil((Number(leaveState.until || 0) - now) / 1000)
      return m.reply(`╭─❏「 ⏳ CUTI MASIH AKTIF 」❏
│ 🌴 STATUS CUTI
╰─━━━━━━━━━━━━━━─

> ↳ Kamu belum bisa kembali bekerja.
> ↳ Sisa waktu cuti: *${remaining} detik*.`)
    }

    userRPG.leave = { active: false, endedAt: now }
    return m.reply(`╭─❏「 💼 KEMBALI BEKERJA 」❏
│ ✅ CUTI SELESAI
╰─━━━━━━━━━━━━━━─

> ↳ Kamu sudah kembali bekerja.
> ↳ Semangat kembali menjalani rutinitas kerja!`)
  }

  if (action === 'resign' || action === 'keluar') {
    const currentJob = getActiveJob(userRPG)
    userRPG.currentJobName = null
    userRPG.jobTitle = getJobTitleByPoints(Number(userRPG.promotionPoints || 0), currentJob?.job)
    userRPG.resignedAt = now
    return m.reply(`╭─❏「 📋 RESIGN PEKERJAAN 」❏
│ 💼 STATUS PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Kamu telah resign dari pekerjaan *${currentJob?.job || 'pekerjaan'}*.
> ↳ Kamu bisa kembali bekerja lagi nanti.`)
  }


  if (action === 'talk') {
    const lastTalk = Number(userRPG.lastTalkAt || 0)
    if (lastTalk && now - lastTalk < JOB_TALK_COOLDOWN_MS) {
      const remaining = Math.ceil((JOB_TALK_COOLDOWN_MS - (now - lastTalk)) / 1000)
      return m.reply(`╭─❏「 💬 JOB TALK 」❏
│ ⏳ COOLDOWN OBROLAN
╰─━━━━━━━━━━━━━━─

> 💬 Kamu baru saja mengajak seseorang mengobrol.
> ⏳ Coba lagi dalam *${remaining} detik*.

─━━━━━━━━━━━━━━─`)
    }

    const activeJob = getActiveJob(userRPG)
    if (!activeJob) return m.reply(`╭─❏「 ⚠️ JOB TALK 」❏
│ 💼 PEKERJAAN BELUM AKTIF
╰─━━━━━━━━━━━━━━─

> ↳ Kamu belum punya pekerjaan aktif.
> ↳ Lamar pekerjaan dengan *${usedPrefix}job apply <nama/nomor>*.

─━━━━━━━━━━━━━━─`)
    const progress = getJobProgress(userRPG, activeJob.job)
    const beforeTitle = getJobTitleByPoints(progress.promotionPoints, activeJob.job)
    userRPG.lastTalkAt = now
    userRPG.performance.talks = Number(userRPG.performance.talks || 0) + 1
    progress.promotionPoints += 1
    progress.talks += 1
    userRPG.promotionPoints = progress.promotionPoints
    const afterTitle = getJobTitleByPoints(progress.promotionPoints, activeJob.job)
    userRPG.jobTitle = afterTitle
    const promoted = afterTitle !== beforeTitle
    if (promoted) userRPG.performance.promotions = Number(userRPG.performance.promotions || 0) + 1
    saveDB(wdb)
    return m.reply(`╭─❏「 💬 JOB TALK 」❏
│ 🤝 OBROLAN PEKERJAAN
╰─━━━━━━━━━━━━━━─

${pick(JOB_TALK_STORIES)}
${promoted ? `> 🎉 Jabatan naik: ${beforeTitle} → ${afterTitle}` : ''}

─━━━━━━━━━━━━━━─
📈 *PROGRES PROMOSI*
> ↳ Poin promosi bertambah +1 untuk pekerjaan ${activeJob.job}.
${getPromotionProgressText(progress.promotionPoints, activeJob.job)}

─━━━━━━━━━━━━━━─`)
  }

  if (action === 'work') {
    if (userRPG.leave && userRPG.leave.active) {
      return m.reply(`╭─❏「 🌴 CUTI KERJA 」❏
│ ⚠️ TIDAK BISA BEKERJA
╰─━━━━━━━━━━━━━━─

> ↳ Kamu sedang cuti.
> ↳ Gunakan *.job return* untuk kembali bekerja.

─━━━━━━━━━━━━━━─`)
    }

    const wasFired = applyAttendancePenalty(userRPG, now)
    if (wasFired) {
      saveDB(wdb)
      return m.reply(`╭─❏「 ⚠️ PEMECATAN KERJA 」❏
│ 📋 STATUS PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Kamu dipecat karena sudah tidak masuk kerja selama lebih dari 7 hari.
> ↳ Lamar pekerjaan baru dengan *${usedPrefix}job apply*.

─━━━━━━━━━━━━━━─`)
    }

    const selectedJob = getSelectedJob(userRPG, payload)
    if (!selectedJob) return m.reply(`╭─❏「 ❌ PEKERJAAN TIDAK DITEMUKAN 」❏
│ 💼 INFORMASI PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Pekerjaan yang kamu pilih tidak ditemukan.
> ↳ Periksa daftar pekerjaan dengan *${usedPrefix}job list*.

─━━━━━━━━━━━━━━─`)
    if (selectedJob.lv > userRPG.level) return m.reply(`╭─❏「 ⚠️ LEVEL BELUM CUKUP 」❏
│ 💼 PERSYARATAN PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Pekerjaan *${selectedJob.job}* belum bisa kamu pilih.
> ↳ Minimal level: *Lv.${selectedJob.lv}*.

─━━━━━━━━━━━━━━─`)

    const gap = now - Number(userRPG.lastkerja || 0)
    const jobCooldown = scaleDifficultyCooldown(userRPG, 120000)
    const remainingCooldown = Math.max(0, jobCooldown - gap)
    if (gap < jobCooldown) {
      return m.reply(`╭─❏「 ⏳ JOB COOLDOWN 」❏
│ 💼 STATUS PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Kamu masih lelah setelah bekerja.
> ↳ Sisa cooldown: *${Math.ceil(remainingCooldown / 1000)} detik*.

─━━━━━━━━━━━━━━─`)
    }

    if (!userRPG.appliedJobs.includes(selectedJob.job)) {
      return m.reply(`╭─❏「 ⚠️ BELUM MELAMAR 」❏
│ 💼 STATUS LAMARAN KERJA
╰─━━━━━━━━━━━━━━─

> ↳ Kamu belum melamar pekerjaan *${selectedJob.job}*.
> ↳ Gunakan *${usedPrefix}job apply ${selectedJob.job}* untuk melamar.

─━━━━━━━━━━━━━━─`)
    }

    const progress = getJobProgress(userRPG, selectedJob.job)
    const beforeTitle = getJobTitleByPoints(progress.promotionPoints, selectedJob.job)
    const incomeMultiplier = getAttendanceMultiplier(userRPG, now) * getJobTitleMultiplier(progress.promotionPoints, selectedJob.job)
    const baseJob = selectedJob
    const earnedMoney = Math.max(0, Math.floor(scaleDifficultyIncome(userRPG, baseJob.gaji) * incomeMultiplier))
    const earnedExp = Math.max(1, scaleDifficultyXP(userRPG, baseJob.exp))

    wdb.money[m.sender] = (Number(wdb.money[m.sender]) || 0) + earnedMoney
    userRPG.exp = Number(userRPG.exp || 0) + earnedExp
    userRPG.lastkerja = now
    userRPG.performance.works = Number(userRPG.performance.works || 0) + 1
    userRPG.performance.attendance = Number(userRPG.performance.attendance || 0) + 1
    userRPG.currentJobName = selectedJob.job
    userRPG.jobHistory = Array.from(new Set([...(Array.isArray(userRPG.jobHistory) ? userRPG.jobHistory : []), selectedJob.job]))
    progress.promotionPoints += 1
    progress.works += 1
    userRPG.promotionPoints = progress.promotionPoints
    userRPG.jobTitle = getJobTitleByPoints(progress.promotionPoints, selectedJob.job)
    const afterTitle = getCurrentJobTitle(userRPG, selectedJob.job)
    if (afterTitle !== beforeTitle) userRPG.performance.promotions = Number(userRPG.performance.promotions || 0) + 1

    let jumlahLevel = 0
    while (userRPG.exp >= userRPG.level * 500) {
      userRPG.exp -= userRPG.level * 500
      userRPG.level += 1
      jumlahLevel += 1
    }

    const story = pick(JOB_WORK_STORIES)
    const nextLevel = listJobs.find(job => job.lv > userRPG.level)

    const message = [
      '╭─❏「 💼 KERJA BERHASIL 」❏',
      '│ 📋 HASIL PEKERJAAN KAMU',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 🏢 Pekerjaan: *${selectedJob.job}*`,
      `> 🎖️ Jabatan: ${afterTitle}`,
      getPromotionProgressText(progress.promotionPoints, selectedJob.job),
      `> 💰 Gaji: +${fmtRp(earnedMoney)}`,
      `> ✨ XP: +${earnedExp}`,
      '',
      '─━━━━━━━━━━━━━━─',
      `> ${story}`,
      '',
      '─━━━━━━━━━━━━━━─',
      '📊 *STATUS KARAKTER*',
      '',
      `> 🎮 Level: Lv.${userRPG.level}`,
      `> 📈 XP: ${userRPG.exp}/${userRPG.level * 500}`,
      nextLevel ? `> ➡️ Next: ${nextLevel.job} (Lv.${nextLevel.lv})` : '> 🏆 Pekerjaan tertinggi sudah tercapai!',
      jumlahLevel > 0 ? `> 🎉 LEVEL UP! +${jumlahLevel} level` : '',
      `> ⏰ Cooldown: 2 menit`,
      '',
      '─━━━━━━━━━━━━━━─'
    ].filter(Boolean).join('\n')

    saveDB(wdb)
    await m.reply(message)

    if (afterTitle !== beforeTitle) {
      const promoMessage = [
        '╭─❏「 🔥 PROMOSI JABATAN 」❏',
        '│ 📈 INFORMASI PROMOSI',
        '╰─━━━━━━━━━━━━━━─',
        '',
        `> 📉 Jabatan sebelumnya: ${beforeTitle}`,
        `> 📈 Jabatan baru: ${afterTitle}`,
        getPromotionProgressText(progress.promotionPoints, selectedJob.job),
        '',
        '─━━━━━━━━━━━━━━─',
        `> ${pick(JOB_PROMOTION_STORIES)}`,
        '',
        '─━━━━━━━━━━━━━━─'
      ].join('\n')
      return m.reply(promoMessage)
    }

    return
  }

  if (action === '') {
    const currentJob = getActiveJob(userRPG)
    const caption = [
      '╭─❏「 💼 JOB INFORMATION 」❏',
      '│ 📋 INFORMASI PEKERJAAN',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 🏢 Pekerjaan aktif: ${getJobLabel(currentJob)}`,
      `> 🎖️ Jabatan: ${getTitleFromJob(currentJob, userRPG)}`,
      `> 💰 Income: ${fmtRp(currentJob?.gaji || 0)}`,
      '',
      `> ↳ Ketik *${usedPrefix}job guide* untuk melihat semua command.`
    ].join('\n')
    return m.reply(caption)
  }

  return m.reply(`╭─❏「 ❌ PERINTAH TIDAK DIKENAL 」❏
│ 💼 JOB SYSTEM
╰─━━━━━━━━━━━━━━─

> ↳ Perintah job tidak dikenal.
> ↳ Gunakan *${usedPrefix}job guide* untuk melihat daftar command.`)
}

handler.help = ['job', 'job guide', 'job list', 'job info', 'job profile', 'job performance', 'job work', 'job apply <nama/nomor>', 'job salary <nama/nomor>', 'job talk', 'job leave', 'job return', 'job resign', 'work', 'kerja']
handler.tags = ['rpg']
handler.command = /^(job|kerja|work)$/i
handler.alias = ['job', 'kerja', 'work']
handler.group = true

export default handler
