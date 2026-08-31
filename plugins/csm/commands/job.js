/**
 * CSM Job & Work Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  MAIN_JOB_LIST, SIDE_JOB_LIST, JOB_WORK_STORIES, CSM_PICTURES, calcBonus
} from '../../../lib/rpg-libmyCSM.js'
import {
  header, cekCD, pickPicture, JOB_LIST, getJobData, addJobExp, getJobDesc,
  sendCsmReply, checkMakimaTrigger
} from '../lib/utils.js'
import { addExp, partnerReaction } from '../lib/combat.js'

export async function handleJob(ctx) {
  const { m, csm, wdb, args } = ctx

  if (!csm.jobs) csm.jobs = {}

  // === JOB LIST ===
  if (args[1]?.toLowerCase() === 'list') {
    let cap = header('PILIH PEKERJAAN')
    cap += `Pilih pekerjaan untuk mendapatkan Blood dan menaikkan level job.\n`
    cap += `Semakin tinggi level job, semakin besar pendapatan.\n\n`

    cap += `*MAIN JOB*\n`
    cap += `|━━━━━━━━━━━\n`
    MAIN_JOB_LIST.forEach((j, i) => {
      let jd = getJobData(csm, j.job)
      const incomeMin = 500 + (jd.level - 1) * 250
      const incomeMax = 1000 + (jd.level - 1) * 500

      cap += `${i + 1}. ${j.job}\n`
      cap += `> Income : ${incomeMin.toLocaleString()} - ${incomeMax.toLocaleString()} Blood\n`
      cap += `> Level : ${jd.level}\n\n`
    })

    cap += `*SIDE JOB*\n`
    cap += `|━━━━━━━━━━━\n`
    SIDE_JOB_LIST.forEach((j, i) => {
      let jd = getJobData(csm, j.job)
      const incomeMin = 500 + (jd.level - 1) * 250
      const incomeMax = 1000 + (jd.level - 1) * 500

      cap += `${i + 1 + MAIN_JOB_LIST.length}. ${j.job}\n`
      cap += `> Income : ${incomeMin.toLocaleString()} - ${incomeMax.toLocaleString()} Blood\n`
      cap += `> Level : ${jd.level}\n\n`
    })

    cap += `|━━━━━━━━━━━\n`
    cap += `📌 .csm job\n`
    cap += `📌 .csm job join <nomor/nama>\n`
    cap += `📌 .csm job leave\n`
    cap += `📌 .csm job info\n`
    cap += `|━━━━━━━━━━━`

    return m.reply(cap)
  }

  // === JOB RIWAYAT / INFO DIRI ===
  if (!args[1]) {
    if (!csm.jobs || Object.keys(csm.jobs).length === 0) {
      return m.reply(header('RIWAYAT KERJA') +
        ` Kamu belum pernah bekerja.\n` +
        ` Gunakan *.csm job list* untuk mulai.\n` +
        `|━━━━━━━━━━━`)
    }

    let cap = header('RIWAYAT KERJA KAMU')
    if (csm.job) {
      cap += `Sedang Bekerja:\n`
      cap += `Job: *${csm.job}*\n`
      cap += `Level: ${getJobData(csm, csm.job).level}\n\n`
    }

    cap += `|── SEMUA JOB ──|\n`
    let sorted = Object.entries(csm.jobs).sort((a, b) => b[1].level - a[1].level)

    sorted.forEach(([jobName, data]) => {
      let expButuh = Math.floor(100 * Math.pow(data.level, 1.5))
      let status = csm.job === jobName ? '▶️' : '✅'
      cap += ` ${status} *${jobName}*\n` +
        `  Level: ${data.level}\n` +
        `  EXP: ${data.exp}/${expButuh}\n` +
        `  Gaji: x${(1 + (data.level - 1) * 0.25).toFixed(2)}\n\n`
    })

    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  // === JOB INFO ===
  if (args[1]?.toLowerCase() === 'info') {
    if (!csm.job) return m.reply(header('BELUM PUNYA JOB') + `|━━━━━━━━━━━`)
    let jd = getJobData(csm, csm.job)
    let expButuh = Math.floor(100 * Math.pow(jd.level, 1.5))
    let desc = getJobDesc(csm.job)
    return m.reply(header(`INFO JOB: ${csm.job}`) +
      ` ${desc}\n\n` +
      ` Level: ${jd.level}\n` +
      ` EXP: ${jd.exp}/${expButuh}\n` +
      ` Bonus Gaji: x${(1 + (jd.level - 1) * 0.25).toFixed(2)}\n` +
      `|━━━━━━━━━━━`)
  }

  // === JOB JOIN ===
  if (args[1]?.toLowerCase() === 'join') {
    if (csm.job) {
      return m.reply(header('SUDAH PUNYA JOB') +
        ` Kamu sedang bekerja sebagai:\n` +
        ` 💼 *${csm.job}*\n\n` +
        ` Gunakan.csm job leave jika ingin resign.\n` +
        `|━━━━━━━━━━━`)
    }

    const cd = cekCD(csm, 'lastJobLeave', 60 * 60 * 1000)
    if (cd > 0) {
      const menit = Math.floor(cd / 60000)
      const detik = Math.floor((cd % 60000) / 1000)
      return m.reply(header('COOLDOWN') +
        ` Tunggu ${menit}m ${detik}d lagi untuk cari job baru.\n` +
        `|━━━━━━━━━━━`)
    }

    const input = args.slice(2).join(' ').trim()
    if (!input) {
      return m.reply(
        header('PENGGUNAAN JOB') +
        `Pilih dan kelola pekerjaan Devil Hunter.\n\n` +
        `💼 *DAFTAR JOB*\n` +
        `> .csm job list\n` +
        `> Melihat semua pekerjaan tersedia.\n\n` +
        `📝 *GABUNG JOB*\n` +
        `> .csm job join <nomor>\n` +
        `> .csm job join <nama job>\n` +
        `> Mengambil pekerjaan yang dipilih.\n\n` +
        `|━━━━━━━━━━━`
      )
    }

    let job = null
    if (/^\d+$/.test(input)) {
      const index = parseInt(input, 10) - 1
      job = JOB_LIST[index]?.job
    } else {
      job = JOB_LIST.find(j => j.job.toLowerCase() === input.toLowerCase())?.job
    }

    if (!job) {
      return m.reply(header('JOB TIDAK ADA') +
        ` Gunakan.csm job list untuk melihat semua job.\n` +
        `|━━━━━━━━━━━`)
    }

    csm.job = job
    getJobData(csm, job)
    saveDB(wdb)

    let jd = getJobData(csm, job)
    return m.reply(header('KERJA DIMULAI') +
      ` 💼 Kamu sekarang: *${job}*\n` +
      ` ${getJobDesc(job)}\n\n` +
      ` Level Job: ${jd.level}\n\n` +
      ` Gaji bisa didapat melalui:\n` +
      ` .csm work\n` +
      `|━━━━━━━━━━━`)
  }

  // === JOB LEAVE ===
  if (args[1]?.toLowerCase() === 'leave') {
    if (!csm.job) {
      return m.reply(header('BELUM PUNYA JOB') +
        ` Kamu sedang tidak bekerja.\n` +
        `|━━━━━━━━━━━`)
    }

    const jobLama = csm.job
    let jd = getJobData(csm, jobLama)
    csm.job = null
    csm.lastJobLeave = Date.now()
    saveDB(wdb)

    return m.reply(header('BERHENTI KERJA') +
      ` Kamu resign dari:\n` +
      ` 💼 *${jobLama}* [Lv.${jd.level}]\n` +
      ` Level job tersimpan. Bisa lanjut lagi nanti.\n` +
      ` Cooldown 1 jam untuk cari job baru.\n` +
      `|━━━━━━━━━━━`)
  }
}

export async function handleWork(ctx) {
  const { m, conn, csm, wdb } = ctx

  const mainOwned = Object.keys(csm.jobs || {}).some(jobName => MAIN_JOB_LIST.some(job => job.job === jobName))
  const sideOwned = Object.keys(csm.jobs || {}).some(jobName => SIDE_JOB_LIST.some(job => job.job === jobName))

  if (!csm.job || !mainOwned || !sideOwned) {
    return m.reply(header('AMBIL JOB DULU') +
      ` Kamu wajib punya minimal 1 Main Job dan 1 Side Job sebelum bisa bekerja.\n\n` +
      `> .csm job list\n` +
      `> .csm job join <nomor/nama>\n` +
      `|━━━━━━━━━━━`)
  }

  let b = calcBonus(csm)
  const cooldown = 10 * 60 * 1000
  const cd = cekCD(csm, 'lastWork', cooldown)

  if (cd > 0) {
    const menit = Math.floor(cd / 60000)
    const detik = Math.floor((cd % 60000) / 1000)
    return m.reply(header('COOLDOWN') +
      ` Tunggu ${menit}m ${detik}d lagi.\n` +
      `|━━━━━━━━━━━`)
  }

  let jobData = getJobData(csm, csm.job)
  if (!Array.isArray(csm.workStories)) csm.workStories = []
  const jobStories = JOB_WORK_STORIES[csm.job] || []
  const workStory = jobStories[(jobData.workCount || 0) % Math.max(1, jobStories.length)]
  jobData.workCount = (jobData.workCount || 0) + 1
  if (workStory && !csm.workStories.includes(`${csm.job}: ${workStory}`)) csm.workStories.push(`${csm.job}: ${workStory}`)

  const jobMultiplier = 1 + (jobData.level - 1) * 0.25
  const incomeMin = 500 + (jobData.level - 1) * 250
  const incomeMax = 1000 + (jobData.level - 1) * 500
  const gajiDasar = Math.floor(Math.random() * (incomeMax - incomeMin + 1)) + incomeMin
  const gaji = Math.floor((gajiDasar + b.bloodFlat) * b.bloodMult * jobMultiplier)

  const expPlayer = Math.floor((50 + csm.level * 5) * b.expMult)
  const expJob = Math.floor((20 + jobData.level * 5) * b.expMult)

  csm.blood += gaji
  const leveledPlayer = addExp(csm, expPlayer, m)
  const jobLevelUp = addJobExp(csm, csm.job, expJob)

  csm.lastWork = Date.now()

  if (!b.noHeal && b.heal > 0) {
    csm.health = Math.min(csm.maxHealth, csm.health + b.heal)
  }

  saveDB(wdb)

  let msg = header(`KERJA: ${csm.job} [Lv.${jobData.level}]`) +
    `${workStory || 'Kamu bekerja hari ini.'}\n` +
    `|━━━━━━━━━━━\n\n` +
    `🩸 +${gaji.toLocaleString()} Blood [x${jobMultiplier.toFixed(2)}]`

  if (b.bloodFlat > 0) msg += `\n🩸 +${b.bloodFlat} Blood Bonus`
  if (b.bloodMult > 1) msg += `\n🩸 Blood Multiplier x${b.bloodMult.toFixed(2)}`

  msg += `\n\n📈 +${expPlayer} EXP Player`
  if (b.expMult > 1) msg += ` [x${b.expMult.toFixed(2)}]`

  msg += `\n📊 +${expJob} EXP Job`

  if (b.findItem > 0 && Math.random() < b.findItem) {
    msg += `\n🎁 Dapet Item Sampingan!`
  }

  if (b.heal > 0) {
    msg += `\n❤️ +${b.heal} HP [Istirahat Kerja]`
  }

  if (jobLevelUp.leveled || leveledPlayer) {
    msg += `\n\n|━━━━━━━━━━━`
  }

  if (jobLevelUp.leveled) {
    msg += `\n\n🎉 LEVEL UP JOB!`
    msg += `\n💼 Job: ${csm.job}`
    msg += `\n📊 Level: ${jobData.level}`
  }

  if (leveledPlayer) {
    msg += `\n\n🎉 LEVEL UP PLAYER! Lv.${csm.level}`
  }

  msg += `\n\n|━━━━━━━━━━━\n`
  msg += partnerReaction(csm, 'neutral')
  msg += `\n|━━━━━━━━━━━`

  await checkMakimaTrigger(m, csm, wdb)
  return sendCsmReply(conn, m, wdb, msg, pickPicture(CSM_PICTURES.city))
}
