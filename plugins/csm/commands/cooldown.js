/**
 * CSM Cooldown Status Command Handler
 */

import { calcBonus } from '../../../lib/rpg-libmyCSM.js'
import { header } from '../lib/utils.js'

export async function handleCooldown(ctx) {
  const { m, csm, today } = ctx
  const checks = [
    ['Terror', csm.lastTerror, 60 * 60 * 1000],
    ['Explore', csm.lastExplore, 10 * 60 * 1000],
    ['Mission', csm.lastMission, 20 * 60 * 1000],
    ['Rescue', csm.lastRescue, 20 * 60 * 1000],
    ['Visit', csm.lastVisit, 5 * 60 * 1000],
    ['Interact', csm.lastInteract, 2 * 60 * 1000],
    ['Gacha', csm.lastGacha, 5 * 60 * 1000],
    ['Partner Gacha', csm.lastPartnerGacha, 60 * 60 * 1000, calcBonus(csm).gachaBonus > 0],
    ['Rest', csm.lastRest, 5 * 60 * 1000],
    ['Heal', csm.lastRevengeHeal, 30 * 60 * 1000, calcBonus(csm).noHeal],
    ['Story', csm.lastStory, 60 * 60 * 1000],
    ['Raid', csm.lastRaidTime, 24 * 60 * 60 * 1000],
    ['Work', csm.lastWork, 10 * 60 * 1000],
    ['Job', csm.lastJob, 60 * 60 * 1000],
    ['Daily', csm.dailyDate ? new Date(`${csm.dailyDate}T00:00:00`).getTime() : 0, 24 * 60 * 60 * 1000],
    ['Quest', csm.questDate === today && csm.dailyQuests?.every(quest => quest.claimed) ? new Date(`${today}T00:00:00`).getTime() : 0, 24 * 60 * 60 * 1000]
  ]

  const formatCooldown = (leftMs) => {
    const totalSeconds = Math.max(0, Math.ceil(leftMs / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  let cap = header('COOLDOWN STATUS')
  cap += `📊 Status semua cooldown personalmu:\n\n`

  let hasAnyCooldown = false

  checks.forEach(([name, timestamp, duration, available = true]) => {
    if (!available) {
      cap += `🔴 ${name}: Tidak Aktif\n`
      return
    }
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      cap += `🟢 ${name}: Ready\n`
      return
    }
    const left = duration - (Date.now() - timestamp)
    if (left <= 0) {
      cap += `🟢 ${name}: Ready\n`
      return
    }

    hasAnyCooldown = true
    cap += `⏳ ${name}: ${formatCooldown(left)} tersisa\n`
  })

  if (!hasAnyCooldown) {
    cap += `\n✅ Semua aktivitas saat ini sudah siap dipakai.\n`
  }

  cap += '━━━━━━━━━━━'
  return m.reply(cap)
}
