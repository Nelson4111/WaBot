import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome, scaleDifficultyXP } from '../../lib/rpgDifficulty.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import { getActiveCrimeScore } from '../../lib/crimeHelper.js'
import { getGroupTotemBuff } from '../../lib/rpg-totemData.js'
import { sendRpgButtons, sendRpgExpActivityList, sendRpgQuickButton } from '../../lib/rpgActionButtons.js'
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
  JOB_INDIVIDUAL_TALK_STORIES,
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
const JOB_WORK_COOLDOWN_MS = 5 * 60 * 1000
const JOB_TALK_ALL_COOLDOWN_MS = 5 * 60 * 1000
const formatDuration = milliseconds => {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return [minutes ? `${minutes} menit` : '', remainingSeconds ? `${remainingSeconds} detik` : '']
    .filter(Boolean)
    .join(' ') || '0 detik'
}

function ensureRpgState(userRPG) {
  if (!userRPG) return null
  if (userRPG.lastkerja === undefined) userRPG.lastkerja = 0
  if (typeof userRPG.level !== 'number' || Number.isNaN(userRPG.level)) userRPG.level = 1
  if (typeof userRPG.exp !== 'number' || Number.isNaN(userRPG.exp)) userRPG.exp = 0
  if (typeof userRPG.promotionPoints !== 'number' || Number.isNaN(userRPG.promotionPoints)) userRPG.promotionPoints = Number(userRPG.promotionPoints || 0)
  if (!Array.isArray(userRPG.appliedJobs)) userRPG.appliedJobs = []
  const hadActiveJobNames = Array.isArray(userRPG.activeJobNames)
  if (!hadActiveJobNames) userRPG.activeJobNames = []
  const hadJobWorkCooldowns = userRPG.jobWorkCooldowns && typeof userRPG.jobWorkCooldowns === 'object'
  if (!hadJobWorkCooldowns) userRPG.jobWorkCooldowns = {}
  if (!userRPG.performance || typeof userRPG.performance !== 'object') userRPG.performance = {}
  if (!Array.isArray(userRPG.jobHistory)) userRPG.jobHistory = []
  if (!userRPG.jobProgress || typeof userRPG.jobProgress !== 'object') userRPG.jobProgress = {}
  if (!userRPG.attendance || typeof userRPG.attendance !== 'object') userRPG.attendance = {}
  if (!userRPG.leave || typeof userRPG.leave !== 'object') userRPG.leave = { active: false }
  if (!userRPG.firedJobs || typeof userRPG.firedJobs !== 'object') userRPG.firedJobs = {}
  const resolveJobName = value => {
    const savedName = String(value || '')
    const job = JOBS.find(entry => {
      const legacyId = entry.job.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return entry.job.toLowerCase() === savedName.toLowerCase() || legacyId === savedName.toLowerCase()
    })
    return job?.job || savedName
  }
  userRPG.appliedJobs = Array.from(new Set(userRPG.appliedJobs.map(resolveJobName)))
  userRPG.jobWorkCooldowns = Object.fromEntries(
    Object.entries(userRPG.jobWorkCooldowns).map(([jobName, readyAt]) => [
      resolveJobName(jobName),
      Number(readyAt) || 0
    ])
  )
  for (const jobName of userRPG.appliedJobs) {
    if (!Number.isFinite(userRPG.jobWorkCooldowns[jobName])) userRPG.jobWorkCooldowns[jobName] = 0
  }
  userRPG.jobHistory = Array.from(new Set(userRPG.jobHistory.map(resolveJobName)))
  userRPG.firedJobs = Object.fromEntries(
    Object.entries(userRPG.firedJobs).map(([jobName, firedAt]) => [resolveJobName(jobName), Number(firedAt) || 0])
  )
  userRPG.currentJobName = resolveJobName(userRPG.currentJobName)
  userRPG.activeJobNames = Array.from(new Set(
    (hadActiveJobNames ? userRPG.activeJobNames : [userRPG.currentJobName])
      .map(resolveJobName)
      .filter(jobName => userRPG.appliedJobs.includes(jobName))
  ))
  if (!hadJobWorkCooldowns && Number(userRPG.lastkerja) > 0) {
    const legacyJobCount = Math.max(1, Number(userRPG.lastkerjaJobCount) || 1)
    const legacyReadyAt = Number(userRPG.lastkerja) + scaleDifficultyCooldown(userRPG, JOB_WORK_COOLDOWN_MS * legacyJobCount)
    for (const jobName of userRPG.activeJobNames) userRPG.jobWorkCooldowns[jobName] = legacyReadyAt
  }
  if (userRPG.firedJobName) userRPG.firedJobName = resolveJobName(userRPG.firedJobName)
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
  if (!nextTitle) return `> ⭐ Poin promosi: ${points}\n> ⭐ ↳ Jabatan tertinggi tercapai`
  return `> ⭐ Progres promosi: ${points}/${nextTitle.points} poin\n> ⭐ ↳ ${nextTitle.points - points} poin menuju ${nextTitle.title}`
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

function getWorkCooldownRemaining(userRPG, jobName, now = Date.now()) {
  return Math.max(0, Number(userRPG.jobWorkCooldowns[jobName] || 0) - now)
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
    const firedJobName = userRPG.currentJobName
    const firedJob = JOBS.find(job => job.job === firedJobName)
    if (firedJob?.lv === 1) return false
    if (firedJobName) {
      userRPG.appliedJobs = userRPG.appliedJobs.filter(jobName => jobName !== firedJobName)
      userRPG.activeJobNames = userRPG.activeJobNames.filter(jobName => jobName !== firedJobName)
      delete userRPG.jobWorkCooldowns[firedJobName]
      userRPG.firedJobs[firedJobName] = now
      userRPG.firedJobName = firedJobName
    }
    userRPG.currentJobName = userRPG.activeJobNames[0] || null
    const nextProgress = userRPG.currentJobName
      ? getJobProgress(userRPG, userRPG.currentJobName)
      : { promotionPoints: 0 }
    userRPG.promotionPoints = Number(nextProgress.promotionPoints || 0)
    userRPG.jobTitle = getJobTitleByPoints(userRPG.promotionPoints, userRPG.currentJobName || '')
    userRPG.firedAt = now
    userRPG.lastkerja = 0
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
    let blockedByRecentFiring = 0
    let withoutEligibleJob = 0

    for (const account of Object.values(wdb.users)) {
      if (!account?.rpg || typeof account.rpg !== 'object') continue

      const targetRPG = ensureRpgState(account.rpg)
      if (getActiveJob(targetRPG)) {
        alreadyWorking++
        continue
      }

      const unlockedJobs = getUnlockedJobs(targetRPG.level)
      const eligibleJobs = unlockedJobs.filter(job => {
        const firedAt = Number(targetRPG.firedJobs[job.job] || 0)
        return !firedAt || now - firedAt >= JOB_APPLY_COOLDOWN_MS
      })
      let selectedJob = eligibleJobs.at(-1)
      if (!selectedJob) {
        if (unlockedJobs.length) blockedByRecentFiring++
        else withoutEligibleJob++
        continue
      }

      if (
        !targetRPG.appliedJobs.includes(selectedJob.job) &&
        targetRPG.appliedJobs.length >= JOB_MAX_APPLIED
      ) {
        selectedJob = eligibleJobs
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
      targetRPG.activeJobNames = [selectedJob.job]
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
      `> ↳ Tidak diproses karena baru dipecat dari semua pekerjaan yang tersedia: ${blockedByRecentFiring}`,
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
    const availableJobs = userRPG.appliedJobs
      .map(jobName => JOBS.find(job => job.job.toLowerCase() === jobName.toLowerCase()))
      .filter(job => job && job.lv <= userRPG.level)
    const remaining = availableJobs.length
      ? Math.min(...availableJobs.map(job => getWorkCooldownRemaining(userRPG, job.job, now)))
      : 0
    const currentJob = getActiveJob(userRPG)
    const highestJob = getHighestRankedJob(userRPG)
    const displayJob = highestJob || currentJob
    const displayPoints = Number(getJobProgress(userRPG, displayJob?.job).promotionPoints || 0)
    const estimatedIncome = Math.floor(
      scaleDifficultyIncome(userRPG, Number(displayJob?.gaji || 0)) *
      getJobTitleMultiplier(displayPoints, displayJob?.job) *
      getAttendanceMultiplier(userRPG, now)
    )

    const caption = [
      '╭─❏「 💼 JOB SYSTEM 」❏',
      '│ 💼 INFORMASI PEKERJAAN',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 🎮 Level: Lv.${userRPG.level}`,
      `> 💼 Pekerjaan: ${getJobLabel(displayJob)}`,
      `> 🏆 Jabatan: ${getCurrentJobTitle(userRPG, displayJob?.job)}`,
      `> 💰 Perkiraan gaji diterima: ${fmtRp(estimatedIncome)}`,
      `> 📊 Status: ${availableJobs.length && remaining > 0 ? `⏳ ${formatDuration(remaining)} lagi` : availableJobs.length ? '✅ Siap kerja' : 'Belum ada pekerjaan aktif'}`,
      userRPG.firedJobName ? `> ⚠️ Pemecatan terakhir dari: ${userRPG.firedJobName}` : '',
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

  if (['command', 'commands'].includes(action)) {
    const rows = [
      { title: '📋 Lihat lowongan', description: 'Temukan pekerjaan yang sesuai dengan levelmu', id: `${usedPrefix}job list` },
      { title: '📝 Ajukan pekerjaan', description: 'Pilih posisi yang ingin kamu tekuni', id: `${usedPrefix}job apply` },
      { title: '💬 Bicara dengan atasan', description: 'Bangun relasi dan buka peluang karier', id: `${usedPrefix}job talk` },
      { title: '💼 Mulai bekerja', description: 'Jalani giliran kerja dan kumpulkan hasil', id: `${usedPrefix}work` },
      { title: '📊 Profil pekerjaan', description: 'Tinjau status dan perkembangan kariermu', id: `${usedPrefix}job info` },
      { title: '🏅 Promosi jabatan', description: 'Periksa peluang naik pangkat di pekerjaanmu', id: `${usedPrefix}job promotion` },
      { title: '📖 Panduan karier', description: 'Kenali sistem kerja, cuti, dan promosi', id: `${usedPrefix}job guide` }
    ]
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '💼 PUSAT KARIER AVELIA',
      subtitle: 'Pilih langkah untuk membangun kariermu',
      text: 'Temukan pekerjaan, asah kemampuan, dan raih jabatan yang lebih tinggi.',
      buttonText: '💼 JELAJAHI KARIER',
      sections: [{ title: 'Perjalanan kerja', rows }],
      fallbackText: `╭─❏「 💼 MENU KARIER 」❏\n${rows.map(row => `> ${row.title}: *${row.id}* — ${row.description}`).join('\n')}\n╰─━━━━━━━━━━━━━━─`
    })
  }

  if (['guide', 'help'].includes(action)) {
    const guideText = [
      ...JOB_GUIDE.map(line => line)
    ].join('\n')
    return m.reply(guideText)
  }


  if (action === 'info') {
    const target = payload.trim()
    if (target) {
      const numericIndex = /^\d+$/.test(target) ? Number(target) - 1 : -1
      const normalizedTarget = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const selectedJob = numericIndex >= 0
        ? listJobs[numericIndex]
        : listJobs.find(job => {
          const jobId = job.job.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          return job.job.toLowerCase() === target.toLowerCase() || jobId === normalizedTarget
        })
      if (!selectedJob) {
        return m.reply(`❌ Pekerjaan tidak ditemukan. Cek *${usedPrefix}job list* atau *${usedPrefix}job info <nama/nomor>*.`)
      }
      return m.reply([
        '╭─❏「 💼 DETAIL PEKERJAAN 」❏',
        `│ *${selectedJob.job}*`,
        '╰─━━━━━━━━━━━━━━─',
        '',
        `> 🎮 Level minimum: Lv.${selectedJob.lv}`,
        `> 💰 Gaji dasar: ${fmtRp(selectedJob.gaji)}`,
        `> 🌟 XP dasar: +${selectedJob.exp}`,
        `> 🔓 Status: ${userRPG.level >= selectedJob.lv ? 'Terbuka' : 'Terkunci'}`,
        '',
        `📌 Lamar: *${usedPrefix}job apply ${selectedJob.job}*`
      ].join('\n'))
    }
    const jobsWithIncome = userRPG.appliedJobs
      .map(jobName => {
        const job = JOBS.find(entry => entry.job.toLowerCase() === jobName.toLowerCase())
        if (!job) return null
        const progress = getJobProgress(userRPG, job.job)
        const points = Number(progress.promotionPoints || 0)
        const income = Math.floor(
          scaleDifficultyIncome(userRPG, Number(job.gaji || 0)) *
          getJobTitleMultiplier(points, job.job) *
          getAttendanceMultiplier(userRPG, now)
        )
        return {
          job,
          points,
          income,
          title: getCurrentJobTitle(userRPG, job.job),
          active: userRPG.activeJobNames.includes(job.job)
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
      `> 💰 Perkiraan total gaji saat ini: ${fmtRp(totalIncome)} per kerja`,
      '',
      '─━━━━━━━━━━━━━━─',
      '📂 *PEKERJAAN DAN JABATAN*',
      '> Gunakan nomor pekerjaan di bawah untuk resign, contoh: *.job resign 1*.',
      '',
      ...(jobsWithIncome.length
        ? jobsWithIncome.map(({ job, points, income, title, active }, index) => [
          `> ${index + 1}. ${active ? '✅' : '▫️'} *${job.job}*${active ? ' (aktif)' : ''}`,
          `> ↳ Jabatan: ${title}`,
          `> ↳ Poin promosi: ${points}`,
          `> ↳ Perkiraan diterima: ${fmtRp(income)}`
        ].join('\n'))
        : ['> Belum ada pekerjaan yang dilamar.']),
      userRPG.firedJobName ? `> ⚠️ Pemecatan terakhir dari: *${userRPG.firedJobName}*` : '',
      '',
      '─━━━━━━━━━━━━━━─',
      'ℹ️ *INFORMASI*',
      '',
      '> ↳ Gunakan .work untuk otomatis bekerja di pekerjaan yang cooldown-nya siap.',
      '> ↳ .work all khusus Premium untuk semua pekerjaan aktif yang cooldown-nya siap.',
      `> ↳ Pilih satu pekerjaan: *${usedPrefix}job active <nomor/nama>* atau aktifkan semua: *${usedPrefix}job active all*`,
      '',
      `📌 Lihat daftar pekerjaan dengan *${usedPrefix}job list*.`,
      '',
      '─━━━━━━━━━━━━━━─'
    ].join('\n')
    return m.reply(caption)
  }

  if (['active', 'aktif', 'switch'].includes(action)) {
    const target = payload.trim()
    const appliedJobs = userRPG.appliedJobs
      .map(jobName => JOBS.find(job => job.job.toLowerCase() === jobName.toLowerCase()))
      .filter(Boolean)
    if (target.toLowerCase() === 'all') {
      if (!appliedJobs.length) {
        return m.reply(`╭─❏「 ⚠️ BELUM MELAMAR 」❏
│ Lamar pekerjaan terlebih dahulu sebelum mengaktifkan semuanya.
╰─━━━━━━━━━━━━━━─`)
      }
      const eligibleJobs = appliedJobs.filter(job => job.lv <= userRPG.level)
      if (!eligibleJobs.length) {
        const lockedJob = appliedJobs[0]
        return m.reply(`╭─❏「 🔒 LEVEL BELUM CUKUP 」❏
│ *${lockedJob.job}* membutuhkan Lv.${lockedJob.lv}.
│ Level kamu saat ini: Lv.${userRPG.level}.
╰─━━━━━━━━━━━━━━─`)
      }
      userRPG.activeJobNames = eligibleJobs.map(job => job.job)
      if (!userRPG.activeJobNames.includes(userRPG.currentJobName)) {
        userRPG.currentJobName = eligibleJobs[0].job
      }
      const progress = getJobProgress(userRPG, userRPG.currentJobName)
      userRPG.promotionPoints = Number(progress.promotionPoints || 0)
      userRPG.jobTitle = getJobTitleByPoints(userRPG.promotionPoints, userRPG.currentJobName)
      saveDB(wdb)
      return m.reply(`╭─❏「 ✅ SEMUA PEKERJAAN AKTIF 」❏
│ ${eligibleJobs.length} pekerjaan aktif untuk *.work*.
│ Gunakan *.work all* untuk menjalankan semuanya sekaligus (Premium).
╰─━━━━━━━━━━━━━━─`)
    }
    const numericIndex = /^\d+$/.test(target) ? Number(target) - 1 : -1
    const normalizedTarget = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const selectedJob = numericIndex >= 0
      ? appliedJobs[numericIndex]
      : appliedJobs.find(job => {
        const jobId = job.job.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        return job.job.toLowerCase() === target.toLowerCase() || jobId === normalizedTarget
      })

    if (!selectedJob) {
      return m.reply(`╭─❏「 ⚠️ PILIH PEKERJAAN 」❏
│ Gunakan nomor atau nama pekerjaan dari *${usedPrefix}job info*.
│ Contoh: *${usedPrefix}job active 1*
╰─━━━━━━━━━━━━━━─`)
    }
    if (selectedJob.lv > userRPG.level) {
      return m.reply(`╭─❏「 🔒 LEVEL BELUM CUKUP 」❏
│ Pekerjaan *${selectedJob.job}* membutuhkan Lv.${selectedJob.lv}.
│ Level kamu saat ini: Lv.${userRPG.level}.
╰─━━━━━━━━━━━━━━─`)
    }

    userRPG.currentJobName = selectedJob.job
    userRPG.activeJobNames = [selectedJob.job]
    const progress = getJobProgress(userRPG, selectedJob.job)
    userRPG.promotionPoints = Number(progress.promotionPoints || 0)
    userRPG.jobTitle = getJobTitleByPoints(userRPG.promotionPoints, selectedJob.job)
    saveDB(wdb)
    return m.reply(`╭─❏「 ✅ PEKERJAAN AKTIF 」❏
│ Pekerjaan aktif: *${selectedJob.job}*
│ Jabatan: ${userRPG.jobTitle}
│ Pekerjaan aktif lainnya dinonaktifkan.
│ Gunakan *.work* untuk bekerja saat cooldown siap.
╰─━━━━━━━━━━━━━━─`)
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
      caption.push(`> ${index + 1}. *${job.job}*`)
    })

    caption.push('')
    caption.push('─━━━━━━━━━━━━━━─')
    caption.push(`ℹ️ Detail: ${usedPrefix}job info <nama/nomor>`)
    caption.push('')
    caption.push('📌 *CARA KERJA*')
    caption.push('')
    caption.push(`> 💼 ${usedPrefix}work`)
    caption.push(`> 💼 ${usedPrefix}work all`)
    caption.push('')
    caption.push('> Work otomatis memilih pekerjaan yang cooldown-nya siap.')
    caption.push('> Work all menjalankan semua pekerjaan yang cooldown-nya siap.')
    caption.push('')
    caption.push('> Gaji akhir dipengaruhi difficulty, jabatan, dan absensi. XP dipengaruhi difficulty.')
    caption.push('> Hasil kerja menampilkan jumlah akhir yang benar-benar diterima.')
    caption.push('')
    caption.push('─━━━━━━━━━━━━━━─')
    return m.reply(caption.join('\n'))
  }

  if (action === 'profile') {
    const currentJob = getActiveJob(userRPG)
    const displayJob = getHighestRankedJob(userRPG) || currentJob
    const promotion = Number(getJobProgress(userRPG, displayJob?.job).promotionPoints || 0)
    const income = Math.floor(
      scaleDifficultyIncome(userRPG, Number(displayJob?.gaji || 0)) *
      getJobTitleMultiplier(promotion, displayJob?.job) *
      getAttendanceMultiplier(userRPG, now)
    )
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
      `> ↳ Setelah difficulty: ${fmtRp(scaleDifficultyIncome(userRPG, job.gaji))}`,
      `> 📈 Multiplier jabatan: x${salaryMultiplier}`,
      `> 📅 Multiplier absensi saat ini: x${getAttendanceMultiplier(userRPG, now)}`,
      `> 💵 Perkiraan gaji diterima: ${fmtRp(Math.floor(scaleDifficultyIncome(userRPG, job.gaji) * salaryMultiplier * getAttendanceMultiplier(userRPG, now)))}`,
      `> 🎮 Minimal level: Lv.${job.lv}`
    ].join('\n')
    return m.reply(caption)
  }

  if (['apply', 'lamar'].includes(action)) {
    const target = payload.trim()
    const selectedJob = getSelectedJob(userRPG, target)
    if (!selectedJob) return m.reply(`╭─❏「 ⚠️ JOB APPLICATION 」❏\n│ ❌ Nama/nomor pekerjaan tidak ditemukan.\n│ 📋 Cek *${usedPrefix}job list* untuk melihat daftar pekerjaan.\n╰─━━━━━━━━━━━━━━─`)
    if (selectedJob.lv > userRPG.level) {
      return sendRpgExpActivityList(conn, m, usedPrefix,
        `╭─❏「 🔒 JOB APPLICATION 」❏\n` +
        `│ 💼 PEKERJAAN BELUM TERBUKA\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pekerjaan: *${selectedJob.job}*\n` +
        `> ↳ Minimal level: Lv.${selectedJob.lv}\n` +
        `> ↳ Level kamu saat ini: Lv.${userRPG.level}\n` +
        `> ↳ Kumpulkan EXP lewat aktivitas berikut:`
      )
    }
    if (userRPG.leave.active) return m.reply(`╭─❏「 🌴 CUTI KERJA 」❏\n│ Kamu sedang cuti dan belum bisa melamar pekerjaan.\n│ Gunakan *${usedPrefix}job return* untuk kembali bekerja.\n╰─━━━━━━━━━━━━━━─`)
    const firedAt = Number(userRPG.firedJobs[selectedJob.job] || 0)
    if (firedAt && now - firedAt < JOB_APPLY_COOLDOWN_MS) {
      const remaining = Math.ceil((JOB_APPLY_COOLDOWN_MS - (now - firedAt)) / 1000)
      return m.reply(`╭─❏「 ⏳ LAMARAN DITANGGUHKAN 」❏\n│ Kamu baru dipecat dari *${selectedJob.job}*.\n│ Coba lamar pekerjaan ini lagi dalam *${remaining} detik*.\n╰─━━━━━━━━━━━━━━─`)
    }
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
    userRPG.activeJobNames = [selectedJob.job]
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
    const activeJob = getActiveJob(userRPG)
    if (!activeJob) return m.reply(`╭─❏「 💼 CUTI KERJA 」❏\n│ Kamu belum memiliki pekerjaan aktif untuk mengambil cuti.\n╰─━━━━━━━━━━━━━━─`)
    if (leaveState.active) {
      return m.reply(`╭─❏「 ⏳ CUTI KERJA 」❏
│ 💼 STATUS CUTI
╰─━━━━━━━━━━━━━━─

> ↳ Kamu masih sedang cuti.
> ↳ Gunakan *${usedPrefix}job return* untuk kembali bekerja.`)
    }
    const lastLeaveReturnAt = Number(userRPG.lastLeaveReturnAt || 0)
    if (lastLeaveReturnAt && now - lastLeaveReturnAt < JOB_LEAVE_COOLDOWN_MS) {
      const remaining = Math.ceil((JOB_LEAVE_COOLDOWN_MS - (now - lastLeaveReturnAt)) / 1000)
      return m.reply(`╭─❏「 ⏳ CUTI KERJA 」❏
│ Cooldown cuti setelah kembali masih aktif.
│ ↳ Coba ambil cuti lagi dalam *${remaining} detik*.
╰─━━━━━━━━━━━━━━─`)
    }

    userRPG.leave = {
      active: true,
      startedAt: now
    }
    userRPG.performance.leave = Number(userRPG.performance.leave || 0) + 1
    saveDB(wdb)
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
    userRPG.leave = { ...leaveState, active: false, endedAt: now }
    userRPG.lastLeaveReturnAt = now
    saveDB(wdb)
    return m.reply(`╭─❏「 💼 KEMBALI BEKERJA 」❏
│ ✅ CUTI SELESAI
╰─━━━━━━━━━━━━━━─

> ↳ Kamu sudah kembali bekerja.
> ↳ Cooldown untuk mengambil cuti lagi dimulai sekarang (12 jam).
> ↳ Semangat kembali menjalani rutinitas kerja!`)
  }

  if (action === 'resign' || action === 'keluar') {
    if (userRPG.leave.active) return m.reply(`╭─❏「 🌴 CUTI KERJA 」❏
│ Kamu sedang cuti dan belum bisa resign.
│ ↳ Gunakan *${usedPrefix}job return* sebelum resign.
╰─━━━━━━━━━━━━━━─`)
    const target = payload.trim()
    const numericIndex = /^\d+$/.test(target) ? Number(target) - 1 : -1
    const listedJobs = userRPG.appliedJobs.filter(jobName =>
      JOBS.some(job => job.job.toLowerCase() === jobName.toLowerCase())
    )
    const selectedJobName = numericIndex >= 0
      ? listedJobs[numericIndex]
      : userRPG.appliedJobs.find(jobName => {
        const normalized = target.toLowerCase()
        const jobId = jobName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const targetId = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        return jobName.toLowerCase() === normalized || jobId === targetId
      })
    if (!selectedJobName) {
      return m.reply(`╭─❏「 📋 RESIGN PEKERJAAN 」❏
│ Pilih pekerjaan yang ingin ditinggalkan dengan nama atau nomor dari *${usedPrefix}job info*.
│ Contoh: *${usedPrefix}job resign 1*
╰─━━━━━━━━━━━━━━─`)
    }
    userRPG.appliedJobs = userRPG.appliedJobs.filter(jobName => jobName !== selectedJobName)
    userRPG.activeJobNames = userRPG.activeJobNames.filter(jobName => jobName !== selectedJobName)
    delete userRPG.jobWorkCooldowns[selectedJobName]
    if (userRPG.currentJobName?.toLowerCase() === selectedJobName.toLowerCase()) {
      userRPG.currentJobName = userRPG.activeJobNames[0] || null
      const progress = userRPG.currentJobName
        ? getJobProgress(userRPG, userRPG.currentJobName)
        : { promotionPoints: 0 }
      userRPG.promotionPoints = Number(progress.promotionPoints || 0)
      userRPG.jobTitle = getJobTitleByPoints(userRPG.promotionPoints, userRPG.currentJobName || '')
    }
    userRPG.resignedAt = now
    saveDB(wdb)
    return m.reply(`╭─❏「 📋 RESIGN PEKERJAAN 」❏
│ 💼 STATUS PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Kamu telah keluar dari pekerjaan *${selectedJobName}*.
> ↳ Lamaran pekerjaan ini sudah dihapus. Kamu bisa melamar pekerjaan lain.`)
  }


  if (action === 'talk') {
    const isTalkAll = payload.trim().toLowerCase() === 'all'
    if (payload.trim() && !isTalkAll) {
      return m.reply(`Gunakan *${usedPrefix}job talk* atau *${usedPrefix}job talk all*.`)
    }
    if (isTalkAll && !isPremiumAccount(wdb.users[m.sender], now)) {
      return m.reply(`╭─❏「 🔒 AKSES PREMIUM 」❏
│ Perintah *.job talk all* khusus pengguna Premium.
╰─━━━━━━━━━━━━━━─`)
    }
    const previousTalkCooldown = Number(userRPG.lastTalkCooldownMs) || JOB_TALK_COOLDOWN_MS
    const lastTalk = Number(userRPG.lastTalkAt || 0)
    const talkCooldown = scaleDifficultyCooldown(
      userRPG,
      isTalkAll ? JOB_TALK_ALL_COOLDOWN_MS : previousTalkCooldown
    )
    if (lastTalk && now - lastTalk < talkCooldown) {
      const remaining = Math.ceil((talkCooldown - (now - lastTalk)) / 1000)
      return m.reply(`╭─❏「 💬 JOB TALK 」❏
│ ⏳ COOLDOWN OBROLAN
╰─━━━━━━━━━━━━━━─

> ⏳ Cooldown: *${formatDuration(remaining * 1000)}*.

─━━━━━━━━━━━━━━─`)
    }

    if (isTalkAll) {
      const activeJobs = userRPG.activeJobNames
        .map(jobName => JOBS.find(job => job.job === jobName && job.lv <= userRPG.level))
        .filter(Boolean)
      if (!activeJobs.length) {
        return m.reply(`╭─❏「 ⚠️ JOB TALK 」❏
│ Belum ada pekerjaan aktif yang bisa diajak bicara.
╰─━━━━━━━━━━━━━━─`)
      }

      const promotions = []
      for (const job of activeJobs) {
        const progress = getJobProgress(userRPG, job.job)
        const beforeTitle = getJobTitleByPoints(progress.promotionPoints, job.job)
        progress.promotionPoints += 1
        progress.talks += 1
        const afterTitle = getJobTitleByPoints(progress.promotionPoints, job.job)
        if (afterTitle !== beforeTitle) promotions.push({ job, beforeTitle, afterTitle })
      }
      userRPG.lastTalkAt = now
      userRPG.lastTalkCooldownMs = JOB_TALK_ALL_COOLDOWN_MS
      userRPG.performance.talks = Number(userRPG.performance.talks || 0) + activeJobs.length
      userRPG.performance.promotions = Number(userRPG.performance.promotions || 0) + promotions.length
      const currentProgress = getJobProgress(userRPG, userRPG.currentJobName)
      userRPG.promotionPoints = Number(currentProgress.promotionPoints || 0)
      userRPG.jobTitle = getJobTitleByPoints(userRPG.promotionPoints, userRPG.currentJobName || '')
      const storyJob = activeJobs.find(job => job.job === userRPG.currentJobName) || activeJobs[0]
      const talkStories = isIndividualJob(storyJob.job)
        ? JOB_INDIVIDUAL_TALK_STORIES
        : JOB_TALK_STORIES
      const message = [
        '╭─❏「 💬 JOB TALK ALL 」❏',
        '│ 🤝 OBROLAN PEKERJAAN',
        '╰─━━━━━━━━━━━━━━─',
        '',
        pick(talkStories),
        ...(promotions.length
          ? [
            '',
            '🎉 *JABATAN NAIK*',
            ...promotions.map(({ job, beforeTitle, afterTitle }) =>
              `> ${job.job}: ${beforeTitle} → ${afterTitle}`)
          ]
          : []),
        '',
        `> ⏰ Cooldown: ${formatDuration(talkCooldown)}`
      ].join('\n')
      saveDB(wdb)
      return sendRpgQuickButton(conn, m, {
        text: message,
        title: '💼 INFO PEKERJAAN',
        buttonText: '📋 Lihat Pekerjaan',
        command: `${usedPrefix}job info`,
        noThumbnail: true
      })
    }

    const activeJob = getActiveJob(userRPG)
    if (!activeJob) return m.reply(`╭─❏「 ⚠️ JOB TALK 」❏
│ 💼 PEKERJAAN BELUM AKTIF
╰─━━━━━━━━━━━━━━─

> ↳ Kamu belum punya pekerjaan aktif.
> ↳ Lamar pekerjaan dengan *${usedPrefix}job apply <nama/nomor>*.

─━━━━━━━━━━━━━━─`)
    const talkStories = isIndividualJob(activeJob.job)
      ? JOB_INDIVIDUAL_TALK_STORIES
      : JOB_TALK_STORIES
    const progress = getJobProgress(userRPG, activeJob.job)
    const beforeTitle = getJobTitleByPoints(progress.promotionPoints, activeJob.job)
    userRPG.lastTalkAt = now
    userRPG.lastTalkCooldownMs = JOB_TALK_COOLDOWN_MS
    userRPG.performance.talks = Number(userRPG.performance.talks || 0) + 1
    progress.promotionPoints += 1
    progress.talks += 1
    userRPG.promotionPoints = progress.promotionPoints
    const afterTitle = getJobTitleByPoints(progress.promotionPoints, activeJob.job)
    userRPG.jobTitle = afterTitle
    const promoted = afterTitle !== beforeTitle
    if (promoted) userRPG.performance.promotions = Number(userRPG.performance.promotions || 0) + 1
    saveDB(wdb)
    return sendRpgQuickButton(conn, m, {
      text: `╭─❏「 💬 JOB TALK 」❏
│ 🤝 OBROLAN PEKERJAAN
╰─━━━━━━━━━━━━━━─

${pick(talkStories)}
${promoted ? `> 🎉 Jabatan naik: ${beforeTitle} → ${afterTitle}` : ''}

─━━━━━━━━━━━━━━─
*PROGRES PROMOSI*
> 📈 Poin promosi bertambah +1
> 🏢 Pekerjaan ${activeJob.job}.
${getPromotionProgressText(progress.promotionPoints, activeJob.job)}

─━━━━━━━━━━━━━━─`,
      title: '💼 LANGKAH KARIER BERIKUTNYA',
      buttonText: '✨ Lihat Info Pekerjaan',
      command: `${usedPrefix}job info`,
      noThumbnail: true
    })
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
      const firedJobIndex = listJobs.findIndex(job => job.job === userRPG.firedJobName)
      const firingMessage = `╭─❏「 ⚠️ PEMECATAN KERJA 」❏
│ 📋 STATUS PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Kamu dipecat karena sudah tidak masuk kerja selama lebih dari 7 hari.
> ↳ Pekerjaan yang memecatmu: *${userRPG.firedJobName || 'tidak diketahui'}*.
> ↳ Lamar pekerjaan baru dengan *${usedPrefix}job apply*.

─━━━━━━━━━━━━━━─`
      if (firedJobIndex > 0) {
        return sendRpgButtons(conn, {
          chat: m.chat,
          text: firingMessage,
          footer: 'AVELIA • JOB SYSTEM',
          buttons: [['⬇️ Coba Job Sebelumnya', `${usedPrefix}job apply ${firedJobIndex}`]],
          quoted: m,
          reply: text => m.reply(text)
        })
      }
      return m.reply(firingMessage)
    }

    const appliedJobs = userRPG.appliedJobs
      .map(jobName => listJobs.find(job => job.job.toLowerCase() === jobName.toLowerCase()))
      .filter(Boolean)
    const selection = String(payload || '').trim()
    if (!appliedJobs.length) {
      return m.reply(`╭─❏「 ⚠️ BELUM MELAMAR 」❏
│ 💼 DAFTAR PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Kamu belum melamar pekerjaan.
> ↳ Gunakan *${usedPrefix}job apply* untuk melamar terlebih dahulu.

─━━━━━━━━━━━━━━─`)
    }

    const isWorkAll = selection.toLowerCase() === 'all'
    if (isWorkAll && !isPremiumAccount(wdb.users[m.sender], now)) {
      return m.reply(`╭─❏「 🔒 AKSES PREMIUM 」❏
│ Perintah *.work all* khusus pengguna Premium.
│ Kamu tetap bisa memakai *.work* untuk bekerja satu per satu.
╰─━━━━━━━━━━━━━━─`)
    }
    if (selection && !isWorkAll) return m.reply(`╭─❏「 ❌ FORMAT WORK TIDAK VALID 」❏
│ 💼 INFORMASI PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Gunakan *${usedPrefix}work* untuk pekerjaan yang siap.
> ↳ Gunakan *${usedPrefix}work all* untuk semua pekerjaan.

─━━━━━━━━━━━━━━─`)
    const activeJobs = userRPG.activeJobNames
      .map(jobName => appliedJobs.find(job => job.job === jobName))
      .filter(Boolean)
    if (!activeJobs.length) {
      return m.reply(`╭─❏「 ⚠️ BELUM ADA PEKERJAAN AKTIF 」❏
│ Gunakan *.job active all* atau pilih dengan *.job active <nomor>*.
╰─━━━━━━━━━━━━━━─`)
    }
    const lockedJob = isWorkAll ? activeJobs.find(job => job.lv > userRPG.level) : null
    if (lockedJob) {
      return sendRpgExpActivityList(conn, m, usedPrefix,
        `╭─❏「 ⚠️ LEVEL BELUM CUKUP 」❏\n` +
        `│ 💼 PERSYARATAN PEKERJAAN\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pekerjaan *${lockedJob.job}* belum bisa dipilih.\n` +
        `> ↳ Minimal level: *Lv.${lockedJob.lv}*.\n` +
        `> ↳ Level kamu saat ini: Lv.${userRPG.level}.\n` +
        `> ↳ Kumpulkan EXP lewat aktivitas berikut:`
      )
    }
    const unlockedAppliedJobs = activeJobs.filter(job => job.lv <= userRPG.level)
    if (!unlockedAppliedJobs.length) {
      const requiredJob = activeJobs[0]
      return sendRpgExpActivityList(conn, m, usedPrefix,
        `╭─❏「 ⚠️ LEVEL BELUM CUKUP 」❏\n` +
        `│ 💼 PERSYARATAN PEKERJAAN\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pekerjaan *${requiredJob.job}* membutuhkan Lv.${requiredJob.lv}.\n` +
        `> ↳ Level kamu saat ini: Lv.${userRPG.level}.\n` +
        `> ↳ Kumpulkan EXP lewat aktivitas berikut:`
      )
    }
    const availableJobs = unlockedAppliedJobs.filter(job =>
      getWorkCooldownRemaining(userRPG, job.job, now) === 0
    )
    const coolingJobs = unlockedAppliedJobs
      .map(job => ({ job, remaining: getWorkCooldownRemaining(userRPG, job.job, now) }))
      .filter(({ remaining }) => remaining > 0)

    let selectedJobs
    if (isWorkAll) {
      if (coolingJobs.length) {
        const longestCooldown = Math.max(...coolingJobs.map(({ remaining }) => remaining))
        return m.reply(`╭─❏「 ⏳ JOB COOLDOWN 」❏
│ 💼 STATUS PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ⏰ Cooldown: *${formatDuration(longestCooldown)}*.

─━━━━━━━━━━━━━━─`)
      }
      selectedJobs = unlockedAppliedJobs
    } else if (availableJobs.length) {
      const preferredJob = availableJobs.find(job =>
        job.job.toLowerCase() === String(userRPG.currentJobName || '').toLowerCase()
      )
      selectedJobs = [preferredJob || availableJobs[0]]
    } else {
      const shortestCooldown = Math.min(...coolingJobs.map(({ remaining }) => remaining))
      return m.reply(`╭─❏「 ⏳ JOB COOLDOWN 」❏
│ 💼 STATUS PEKERJAAN
╰─━━━━━━━━━━━━━━─

> ↳ Semua pekerjaan masih cooldown.
> ↳ Pekerjaan terdekat siap dalam *${formatDuration(shortestCooldown)}*.

─━━━━━━━━━━━━━━─`)
    }

    const jobCooldown = Math.floor(scaleDifficultyCooldown(userRPG, JOB_WORK_COOLDOWN_MS * selectedJobs.length) *
      getGroupTotemBuff(wdb.data, m.chat, 'work', 'cooldown'))
    const attendanceMultiplier = getAttendanceMultiplier(userRPG, now)
    let totalMoney = 0
    let totalExp = 0
    const workResults = selectedJobs.map(job => {
      const progress = getJobProgress(userRPG, job.job)
      const beforeTitle = getJobTitleByPoints(progress.promotionPoints, job.job)
      const titleMultiplier = getJobTitleMultiplier(progress.promotionPoints, job.job)
      const difficultyAdjustedIncome = scaleDifficultyIncome(userRPG, job.gaji)
      const difficultyAdjustedExp = scaleDifficultyXP(userRPG, job.exp)
      const earnedMoney = Math.max(0, Math.floor(
        difficultyAdjustedIncome * attendanceMultiplier * titleMultiplier
      ))
      const earnedExp = Math.max(1, difficultyAdjustedExp)

      totalMoney += earnedMoney
      totalExp += earnedExp
      progress.promotionPoints += 1
      progress.works += 1
      const afterTitle = getJobTitleByPoints(progress.promotionPoints, job.job)
      if (afterTitle !== beforeTitle) {
        userRPG.performance.promotions = Number(userRPG.performance.promotions || 0) + 1
      }

      return { job, progress, beforeTitle, afterTitle, earnedMoney, earnedExp }
    })

    totalMoney = Math.floor(totalMoney * getGroupTotemBuff(wdb.data, m.chat, 'work', 'income'))
    totalExp = Math.floor(totalExp * getGroupTotemBuff(wdb.data, m.chat, 'work', 'xp'))
    wdb.money[m.sender] = (Number(wdb.money[m.sender]) || 0) + totalMoney
    userRPG.exp = Number(userRPG.exp || 0) + totalExp
    userRPG.lastkerja = now
    const nextWorkReadyAt = now + jobCooldown
    for (const job of selectedJobs) userRPG.jobWorkCooldowns[job.job] = nextWorkReadyAt
    userRPG.performance.works = Number(userRPG.performance.works || 0) + selectedJobs.length
    userRPG.performance.attendance = Number(userRPG.performance.attendance || 0) + 1
    if (!selectedJobs.some(job => job.job === userRPG.currentJobName)) {
      userRPG.currentJobName = selectedJobs[0].job
    }
    userRPG.jobHistory = Array.from(new Set([
      ...userRPG.jobHistory,
      ...selectedJobs.map(job => job.job)
    ]))
    const lastProgress = getJobProgress(userRPG, userRPG.currentJobName)
    userRPG.promotionPoints = lastProgress.promotionPoints
    userRPG.jobTitle = getJobTitleByPoints(lastProgress.promotionPoints, userRPG.currentJobName)

    let jumlahLevel = 0
    while (userRPG.exp >= userRPG.level * 500) {
      userRPG.exp -= userRPG.level * 500
      userRPG.level += 1
      jumlahLevel += 1
    }

    const story = pick(JOB_WORK_STORIES)
    const nextLevel = listJobs.find(job => job.lv > userRPG.level)
    const workCooldown = formatDuration(jobCooldown)

    const message = [
      '╭─❏「 💼 KERJA BERHASIL 」❏',
      '│ 📋 HASIL PEKERJAAN KAMU',
      '╰─━━━━━━━━━━━━━━─',
      '',
      ...(isWorkAll
        ? [
          '> 🏢 Pekerjaan:',
          ...selectedJobs.map(job => `> ↳ *${job.job}*`)
        ]
        : workResults.flatMap(({ job, progress, afterTitle, earnedMoney, earnedExp }) => [
          `> 🏢 Pekerjaan: *${job.job}*`,
          `> 🎖️ Jabatan: ${afterTitle}`,
          `> 💰 Gaji: +${fmtRp(earnedMoney)}`,
          `> ✨ XP: +${earnedExp}`,
          getPromotionProgressText(progress.promotionPoints, job.job)
        ])),
      `> 💰 ${isWorkAll ? 'Total gaji' : 'Gaji'}: +${fmtRp(totalMoney)}`,
      `> ✨ ${isWorkAll ? 'Total XP' : 'XP'}: +${totalExp}`,
      '',
      '─━━━━━━━━━━━━━━─',
      `> ${story}`,
      ...(!isWorkAll
        ? [
          '',
          '─━━━━━━━━━━━━━━─',
          '📊 *STATUS KARAKTER*',
          '',
          `> 🎮 Level: Lv.${userRPG.level}`,
          `> 📈 XP: ${userRPG.exp}/${userRPG.level * 500}`,
          nextLevel ? `> ➡️ Next: ${nextLevel.job} (Lv.${nextLevel.lv})` : '> 🏆 Pekerjaan tertinggi sudah tercapai!'
        ]
        : []),
      jumlahLevel > 0 ? `> 🎉 LEVEL UP! +${jumlahLevel} level` : '',
      `> ⏰ Cooldown: ${workCooldown}`,
      '',
      '─━━━━━━━━━━━━━━─'
    ].filter(Boolean).join('\n')

    saveDB(wdb)
    await sendRpgButtons(conn, {
      chat: m.chat,
      text: message,
      footer: 'AVELIA • JOB SYSTEM',
      buttons: [[
        isWorkAll ? '💬 Ngobrol Semua (Premium)' : '💬 Ngobrol (+1 Poin)',
        `${usedPrefix}job talk${isWorkAll ? ' all' : ''}`
      ]],
      quoted: m,
      reply: text => m.reply(text)
    })

    const promotions = workResults.filter(result => result.afterTitle !== result.beforeTitle)
    if (promotions.length) {
      const promoMessage = [
        '╭─❏「 🔥 PROMOSI JABATAN 」❏',
        '│ 📈 INFORMASI PROMOSI',
        '╰─━━━━━━━━━━━━━━─',
        '',
        ...promotions.map(({ job, beforeTitle, afterTitle }) =>
          `> 💼 ${job.job}: ${beforeTitle} → ${afterTitle}`),
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
    const currentJobIncome = Math.floor(
      scaleDifficultyIncome(userRPG, Number(currentJob?.gaji || 0)) *
      getJobTitleMultiplier(getJobProgress(userRPG, currentJob?.job).promotionPoints, currentJob?.job) *
      getAttendanceMultiplier(userRPG, now)
    )
    const caption = [
      '╭─❏「 💼 JOB INFORMATION 」❏',
      '│ 📋 INFORMASI PEKERJAAN',
      '╰─━━━━━━━━━━━━━━─',
      '',
      `> 🏢 Pekerjaan aktif: ${getJobLabel(currentJob)}`,
      `> 🎖️ Jabatan: ${getTitleFromJob(currentJob, userRPG)}`,
      `> 💰 Perkiraan gaji diterima: ${fmtRp(currentJobIncome)}`,
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

handler.help = ['job', 'job guide', 'job list', 'job info [nama/nomor]', 'job active <nama/nomor>', 'job profile', 'job performance', 'job work [all]', 'job apply <nama/nomor>', 'job salary <nama/nomor>', 'job talk [all]', 'job leave', 'job return', 'job resign <nama/nomor>', 'work [all]', 'kerja [all]']
handler.tags = ['rpg']
handler.command = /^(job|kerja|work)$/i
handler.alias = ['job', 'kerja', 'work']
handler.group = true

export default handler
