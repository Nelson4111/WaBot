import { getActiveCrimeScore, getPatrolCapturePenalty, computeCrimeScore } from './crimeHelper.js'
import { getCrimeRestriction, adjustDifficultyFailureChance } from './rpgDifficulty.js'
import { createRpgCrimeRecord } from './rpgCrimeAction.js'
import { registerPrisoner } from './prisonHelper.js'
import { saveDB } from './waifuHelper.js'

export const RPG_ILLEGAL_REWARD_MULTIPLIER = 1.5
export const RPG_ILLEGAL_COOLDOWN_MULTIPLIER = 2

function isInPrison(user, now) {
  const startedAt = Number(user?.penjara) || 0
  const duration = Number(user?.lamaPenjara) || 0
  return startedAt > 0 && duration > 0 && now - startedAt < duration
}

function getIllegalCooldownMessage(lastAttempt, cooldown, now) {
  const remaining = cooldown - (now - lastAttempt)
  if (remaining <= 0) return null
  return `⏳ Usaha ilegal ini belum siap digunakan lagi. Coba dalam ${Math.ceil(remaining / 1000)} detik.`
}

export function attemptRpgIllegalAction({
  db,
  jid,
  user,
  activity,
  cooldownDuration,
  cooldownField = `last${activity.charAt(0).toUpperCase()}${activity.slice(1)}`,
  now = Date.now()
}) {
  const restriction = getCrimeRestriction(user)
  if (restriction) return { status: 'blocked', message: restriction }

  if (isInPrison(user, now)) {
    const remaining = Number(user.lamaPenjara) - (now - Number(user.penjara))
    return {
      status: 'blocked',
      message: `🚔 Kamu masih di penjara. Sisa hukuman: ${Math.ceil(remaining / 60000)} menit. Gunakan *.penjara* untuk melihat pilihan.`
    }
  }

  const suffix = `${activity.charAt(0).toUpperCase()}${activity.slice(1)}`
  const illegalCooldownField = `lastIllegal${suffix}`
  const cooldown = Math.max(0, Number(cooldownDuration) || 0) * RPG_ILLEGAL_COOLDOWN_MULTIPLIER
  const previousAttempt = Number(user[illegalCooldownField]) || Number(user[`lastShortcut${suffix}`]) || 0
  const cooldownMessage = getIllegalCooldownMessage(previousAttempt, cooldown, now)
  if (cooldownMessage) return { status: 'cooldown', message: cooldownMessage }

  user[illegalCooldownField] = now
  if (cooldownField) user[cooldownField] = now

  if (!db.crime || typeof db.crime !== 'object') db.crime = {}
  const crimeRecord = createRpgCrimeRecord(db.crime[jid] || {})
  crimeRecord.aksi_ilegal = (Number(crimeRecord.aksi_ilegal) || Number(crimeRecord.jalan_pintas) || 0) + 1
  delete crimeRecord.jalan_pintas
  crimeRecord.total = computeCrimeScore(crimeRecord)
  db.crime[jid] = crimeRecord
  const activeCrimeScore = getActiveCrimeScore(crimeRecord)

  const caughtChance = Math.min(0.95, adjustDifficultyFailureChance(user, 0.05))
  const failureChance = Math.min(
    0.95 - caughtChance,
    adjustDifficultyFailureChance(user, 0.2)
  )
  const roll = Math.random()
  if (roll < caughtChance) {
    const penalty = getPatrolCapturePenalty(getActiveCrimeScore(crimeRecord))
    user.penjara = now
    user.lamaPenjara = penalty.durationMs
    user.tebusan = penalty.ransom
    user.kasus = `⚠️ Usaha ilegal ${activity}`
    user.sel = registerPrisoner(db, jid)
    if (!user.sel) {
      return {
        status: 'protected',
        crimePoints: 1,
        activeCrimeScore,
        message: '🚨 Petugas hampir menangkapmu, tetapi perlindungan patroli mencegahmu masuk penjara. Poin kriminal usaha ilegal tetap bertambah.'
      }
    }
    return {
      status: 'caught',
      crimePoints: 1,
      activeCrimeScore,
      cell: user.sel,
      durationMs: penalty.durationMs,
      ransom: penalty.ransom,
      activeCrimeScore: getActiveCrimeScore(crimeRecord),
      message: `🚔 Kamu tertangkap saat melakukan usaha ilegal ${activity}.`
    }
  }

  if (roll < caughtChance + failureChance) {
    return {
      status: 'failed',
      crimePoints: 1,
      activeCrimeScore,
      message: `⚠️ Usaha ilegal ${activity} gagal; tidak ada hasil yang didapat.`
    }
  }

  return {
    status: 'success',
    crimePoints: 1,
    activeCrimeScore,
    rewardMultiplier: RPG_ILLEGAL_REWARD_MULTIPLIER
  }
}

export async function saveFailedRpgIllegalAction(db) {
  await saveDB(db)
}

export function formatRpgIllegalResult(result) {
  if (result.status === 'blocked' || result.status === 'cooldown') return result.message
  if (result.status === 'caught') {
    const minutes = Math.ceil(result.durationMs / 60000)
    return `${result.message}\n` +
      `> ↳ 🚔 Sel: ${result.cell}\n` +
      `> ↳ ⏳ Hukuman: ${minutes} menit\n` +
      `> ↳ 💰 Tebusan: Rp ${Number(result.ransom).toLocaleString()}\n` +
      `> ↳ 💀 Poin kriminal: +${result.crimePoints} (aktif ${result.activeCrimeScore})\n\n` +
      `Gunakan *.penjara* untuk melihat pilihan.`
  }
  return `${result.message}\n> ↳ 💀 Poin kriminal ilegal: +${result.crimePoints} (aktif ${result.activeCrimeScore})`
}
