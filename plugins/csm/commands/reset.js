/**
 * CSM Reset / New Game+ Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { header, headerUnavailable } from '../lib/utils.js'

export async function handleReset(ctx) {
  const { m, csm, wdb, args, isPrivileged } = ctx

  if (!isPrivileged) return m.reply(headerUnavailable('RESET'))
  const sub = args[1]?.toLowerCase()

  if (sub === 'ending') {
    return m.reply(
      header('RESET ENDING OTOMATIS') +
      `Ending langsung mereset story setelah dikonfirmasi.\n` +
      `Partner, level, EXP, achievement, reward, dan buff tetap tersimpan.\n` +
      `━━━━━━━━━━━`
    )
  }

  const confirmation = sub

  if (!sub) {
    let cap = header('PERINGATAN RESET')
    cap += `Kamu akan mengulang perjalanan biasa dari Arc 1.\n\n` +
      `Data yang DI-RESET:\n` +
      `• Weapon\n` +
      `• Inventory\n` +
      `• Darah\n` +
      `• Story\n` +
      `• Kontrak aktif\n` +
      `• Transform\n` +
      `• Progress sementara\n\n` +
      `Data yang TETAP:\n` +
      `• Level RPG\n` +
      `• EXP RPG\n` +
      `• Level Job\n` +
      `• EXP Job\n` +
      `• Partner\n` +
      `• Riwayat Partner\n` +
      `• Title Player\n` +
      `• Riwayat Ending\n` +
      `• Reward Ending\n` +
      `• Buff Ending\n` +
      `• Riwayat Kontrak\n` +
      `• Achievement\n\n` +
      `📊 Reset sebelumnya: ${csm.resetCount || 0}x\n\n` +
      `⚠️ Setiap reset akan membuat Story berikutnya sedikit lebih sulit.\n` +
      `⚠️ Reward ending yang sudah dikumpulkan juga membuat dunia semakin sulit.\n\n` +
      `📌 Selesaikan semua arc lalu pilih ending untuk reset otomatis perjalanan.\n` +
      `━━━━━━━━━━━`

    return m.reply(cap)
  }

  if (confirmation === 'cancel') {
    return m.reply(header('RESET DIBATALKAN') + `Data kamu aman.\n━━━━━━━━━━━`)
  }

  if (confirmation !== 'confirm') {
    return m.reply(header('PERINTAH SALAH') + `Pilih ending terlebih dahulu untuk mengulang perjalanan.\n━━━━━━━━━━━`)
  }

  if (!Array.isArray(csm.endingHistory)) {
    csm.endingHistory = []
  }

  if (
    csm.ending &&
    !csm.endingHistory.some(
      e => e.ending === csm.ending && e.reset === (csm.resetCount || 0)
    )
  ) {
    csm.endingHistory.push({
      ending: csm.ending,
      reset: csm.resetCount || 0,
      obtainedAt: Date.now()
    })
  }

  csm.resetCount = (csm.resetCount || 0) + 1

  csm.weapon = { nama: 'Fist', dur: 999 }
  csm.inventory = [{ nama: 'Fist', dur: 999 }]

  csm.devilContract = null
  csm.contractType = null
  csm.contractExpire = 0
  csm.contractSide = null
  csm.contractPending = null

  csm.erasureProtection = null
  csm.erasurePending = null
  csm.dollContract = false
  csm.isTransform = false

  csm.blood = 0
  csm.hospital = []

  csm.story = 1
  csm.ending = null
  csm.pendingEnding = null
  csm.location = 'Markas Public Safety'

  csm.encounter = null
  csm.pendingDuel = null
  csm.pendingBlood = 0
  csm.lastRevengeHeal = 0
  csm.partnerGachaPending = null

  csm.lastTerror = 0
  csm.terrorStory = []
  csm.lastStory = 0

  csm.lastRest = 0
  csm.lastExplore = 0
  csm.lastMission = 0
  csm.lastVisit = 0

  csm.lastJob = 0
  csm.lastRaid = ''

  saveDB(wdb)

  return m.reply(
    header('RESET BERHASIL') +
    ` Story kembali ke Arc 1.\n\n` +
    ` 🔄 Reset ke-${csm.resetCount}\n` +
    ` ❤️ Partner tetap dipertahankan.\n` +
    ` 📈 Level & EXP tetap.\n` +
    ` 💼 Level & EXP Job tetap.\n` +
    ` 🏆 Reward Ending tetap.\n` +
    ` ⛓️ Riwayat Kontrak tetap.\n` +
    ` 🏅 Achievement tetap.\n\n` +
    ` ⚠️ Story berikutnya akan sedikit lebih sulit.\n` +
    `|━━━━━━━━━━━`
  )
}
