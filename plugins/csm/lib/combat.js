/**
 * Combat & Progression Helpers for CSM RPG
 */

import {
  CHARACTER_LIST, PARTNER_REACTIONS, getTitle, getTitleBackstory,
  calcBonus
} from '../../../lib/rpg-libmyCSM.js'
import { header } from './utils.js'
import { equipFist } from './state.js'

export const rememberSeen = (csm, key, value) => {
  if (!value || !Array.isArray(csm[key]) || csm[key].includes(value)) return
  csm[key].push(value)
}

export const getPartnerLevel = (csm, partner) => {
  const character = CHARACTER_LIST.find(item => item.nama === partner.name)
  const love = Number(csm.relations?.[partner.name] || 0)
  const level = Math.max(1, Math.floor(love / Math.max(1, partner.needLove || character?.needLove || 1)) + 1)
  partner.level = level
  return level
}

export const getLoveProgress = (love, needLove) => Number(love || 0) % Math.max(1, Number(needLove) || 1)

export const getPartnerDamage = (csm, partner) => {
  const level = getPartnerLevel(csm, partner)
  return Math.max(10, level * 10) * (calcBonus(csm).partnerDmgMultiplier || 1)
}

export const addPartnerExp = (targetCsm, amount) => {
  if (!targetCsm || !Array.isArray(targetCsm.partners)) return
  if (!targetCsm.relations || typeof targetCsm.relations !== 'object') targetCsm.relations = {}
  targetCsm.partners.filter(partner => partner.status === 'active').forEach(partner => {
    const character = CHARACTER_LIST.find(item => item.nama === partner.name)
    const needLove = Math.max(1, Number(partner.needLove || character?.needLove) || 1)
    targetCsm.relations[partner.name] = Number(targetCsm.relations[partner.name] || 0) + amount
    partner.level = Math.max(1, Math.floor(targetCsm.relations[partner.name] / needLove) + 1)
  })
}

export const recordPartnerDialog = (csm, partnerName, reactionText, outcome = 'neutral', extra = {}) => {
  const cleanName = String(partnerName || '').trim()
  const cleanText = String(reactionText || '...').trim()
  if (!cleanName || !cleanText) return ''
  const character = CHARACTER_LIST.find(item => item.nama === cleanName)
  const entry = {
    partner: cleanName,
    emoji: character?.emoji || '🤝',
    reaction: cleanText,
    outcome,
    source: extra.source || 'dialog',
    level: extra.level ?? getPartnerLevel(csm, csm.partners.find(p => p.name === cleanName) || { name: cleanName, needLove: character?.needLove || 1 }),
    at: Date.now()
  }
  csm.partnerReactionHistory = Array.isArray(csm.partnerReactionHistory) ? csm.partnerReactionHistory : []
  csm.partnerReactionHistory.push(entry)
  return `\n\n${character?.emoji || '🤝'} *${cleanName}*\n> "${cleanText}"`
}

export const injurePartners = (csm, damage, outcome = 'hurt') => {
  if (!Array.isArray(csm.hospital)) csm.hospital = []
  const injured = []
  csm.partners.filter(partner => partner.status === 'active').forEach(partner => {
    partner.hp = Math.max(0, Number(partner.hp ?? 100) - Math.max(1, Math.floor(damage * 0.35)))
    if (partner.hp <= 0) {
      partner.status = 'hospital'
      csm.hospital.push(partner)
      injured.push(partner)
    }
  })
  if (!injured.length) return ''
  return `\n🏥 ${injured.map(partner => {
    const character = CHARACTER_LIST.find(item => item.nama === partner.name)
    const line = outcome === 'lose' ? 'Aku tidak bisa berdiri lagi... selamatkan yang lain.' : 'Lukaku parah, tapi aku masih percaya padamu.'
    recordPartnerDialog(csm, partner.name, line, outcome, { source: 'injure' })
    return `${character?.emoji || '🏥'} *${partner.name}*: "${line}"`
  }).join('\n')}\nPartner dibawa ke hospital. Gunakan *.csm hospital* untuk memulihkan mereka.`
}

export const partnerReaction = (csm, outcome = 'neutral', grantExp = true) => {
  const activePartners = csm.partners.filter(partner => partner.status === 'active')
  if (!activePartners.length) return ''
  const partnerExp = Math.floor(Math.random() * 3) + 1
  if (grantExp) addPartnerExp(csm, partnerExp)
  const lines = PARTNER_REACTIONS[outcome] || PARTNER_REACTIONS.neutral
  const reactionText = activePartners.map(partner => {
    const character = CHARACTER_LIST.find(item => item.nama === partner.name)
    if (!character) return ''
    const line = lines[Math.floor(Math.random() * lines.length)] || PARTNER_REACTIONS.neutral[0]
    return recordPartnerDialog(csm, character.nama, line, outcome, { source: 'reaction', level: getPartnerLevel(csm, partner) })
  }).filter(Boolean).join('')
  return `\n\n💌 Partner EXP: +${partnerExp}${reactionText}\n\n`
}

export const addExp = (csm, exp, m) => {
  csm.exp += exp
  let need = csm.level * 300
  let leveled = false
  const previousTitle = csm.title || getTitle(csm.level)
  while (csm.exp >= need) {
    csm.exp -= need
    csm.level++
    csm.maxHealth += 25
    csm.health = csm.maxHealth
    const newTitle = getTitle(csm.level)
    const oldTitle = csm.title || previousTitle
    csm.title = newTitle
    if (newTitle !== oldTitle && m && typeof m.reply === 'function') {
      m.reply(header('TITLE BERUBAH') + `🏷️ ${oldTitle} → ${newTitle}\n📖 ${getTitleBackstory(csm.level)}\n━━━━━━━━━━━`)
    }
    need = csm.level * 300
    leveled = true
  }
  csm.title = getTitle(csm.level)
  return leveled
}

export const damageWeapon = (csm, amount = 1, chance = 1) => {
  if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) {
    equipFist(csm)
    return null
  }
  if (csm.weapon?.nama === 'Fist' || csm.inventory[0]?.nama === 'Fist') return null
  if (Math.random() >= chance) return null
  csm.inventory[0].dur -= amount
  csm.weapon.dur = Math.max(0, csm.inventory[0].dur)
  if (csm.inventory[0].dur <= 0) {
    let rusak = csm.inventory.shift()
    equipFist(csm)
    return rusak.nama
  }
  return null
}
