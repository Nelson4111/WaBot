/**
 * Daily Quest System for CSM RPG
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { QUEST_LIST, getTitle } from '../../../lib/rpg-libmyCSM.js'
import { header } from './utils.js'

export const awardQuestReward = (csm, wdb, m, quest, source = 'manual') => {
  if (!quest || quest.claimed) return false
  quest.claimed = true
  csm.blood += Number(quest.blood || 0)
  csm.exp += Number(quest.exp || 0)
  let leveled = false
  while (csm.exp >= csm.level * 300) {
    csm.exp -= csm.level * 300
    csm.level++
    csm.maxHealth += 25
    csm.health = csm.maxHealth
    leveled = true
  }
  csm.title = getTitle(csm.level)
  quest.autoRewardedAt = Date.now()
  quest.completedSource = source
  saveDB(wdb)
  const sourceText = source === 'activity'
    ? '📌 Selesai otomatis dari aktivitas'
    : source === 'skip'
      ? '⚡ Selesai via skip quest'
      : source === 'claim'
        ? '✅ Klaim manual quest'
        : '🏆 Quest selesai'
  const message = header('QUEST SELESAI') +
    `${quest.name}\n\n` +
    `${sourceText}\n\n` +
    `> 🩸 +${Number(quest.blood || 0).toLocaleString()} Blood\n` +
    `> 📈 +${Number(quest.exp || 0).toLocaleString()} EXP` +
    `${leveled ? `\n> 🎉 LEVEL UP! Lv.${csm.level}` : ''}\n` +
    `|━━━━━━━━━━━`
  if (m && typeof m.reply === 'function') m.reply(message)
  return true
}

export const recordActivity = (csm, wdb, m, activity) => {
  if (!Array.isArray(csm.dailyQuests)) return
  csm.dailyQuests.forEach(quest => {
    if (quest.type !== activity || quest.claimed) return
    quest.progress = Math.min(quest.target, Number(quest.progress || 0) + 1)
    if (quest.progress >= quest.target) {
      awardQuestReward(csm, wdb, m, quest, 'activity')
    }
  })
}

export const ensureDailyQuests = (csm, wdb, today) => {
  if (!today) today = new Date().toISOString().split('T')[0]
  if (csm.questDate === today && Array.isArray(csm.dailyQuests) && csm.dailyQuests.length === 2) {
    csm.dailyQuests = csm.dailyQuests.map(quest => ({
      ...quest,
      progress: Number(quest.progress || 0),
      claimed: Boolean(quest.claimed),
      target: Number(quest.target || 1),
      blood: Number(quest.blood || 0),
      exp: Number(quest.exp || 0)
    }))
    return
  }
  const pool = [...QUEST_LIST]
  const dailyQuests = []
  while (dailyQuests.length < 2 && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    dailyQuests.push({ ...pool.splice(index, 1)[0], progress: 0, claimed: false })
  }
  csm.questDate = today
  csm.dailyQuests = dailyQuests
  if (wdb) saveDB(wdb)
}
