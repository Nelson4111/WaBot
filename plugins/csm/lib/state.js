/**
 * CSM State Management & Initialization
 * 
 * Ensures all player data structures are initialized properly and normalized.
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { getTitle, ITEM_LIST } from '../../../lib/rpg-libmyCSM.js'
import { resetLegacyViewData } from './utils.js'

export const fist = () => ({ nama: 'Fist', dur: 999 })

export function equipFist(csm) {
  if (!Array.isArray(csm.inventory)) csm.inventory = [fist()]
  const fistIndex = csm.inventory.findIndex(item => item.nama === 'Fist')
  if (fistIndex >= 0) csm.inventory.splice(fistIndex, 1)
  csm.inventory.unshift(fist())
  csm.weapon = fist()
}

export function initCsmUser(user, wdb) {
  if (!user.csm) {
    user.csm = {
      started: false,
      nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Applicant',
      devilContract: null, contractType: null, contractHistory: [], isTransform: false,
      erasureProtection: null, erasurePending: null, dollContract: false,
      lastTerror: 0, terrorStory: [], lastStory: 0,
      devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Markas Public Safety', gender: 'None',
      weapon: { nama: 'Fist', dur: 999 },
      inventory: [{ nama: 'Fist', dur: 999 }],
      lastRest: 0, lastGacha: 0, lastVisit: 0, lastExplore: 0, lastMission: 0,
      encounter: null, tempMission: null,
      relations: {}, pendingBlood: 0,
      lastWork: 0, pendingDuel: null,
      contractExpire: 0, contractSide: null, ending: null,
      partnerGachaPending: null, lastPartnerGacha: 0, lastRevengeHeal: 0,
      hospital: [], job: null, lastJob: 0, lastRaid: '', endings: [],
      achievements: [], lastSeenChars: {},
      storyCooldown: {},
      contractPending: null,
      dailyQuests: [], questDate: '', partnerReactionHistory: []
    }
  }

  const csm = user.csm
  csm.title = getTitle(csm.level)
  if (csm.contractType === undefined) csm.contractType = csm.devilContract ? 'devil' : null
  if (csm.erasureProtection === undefined) csm.erasureProtection = null
  if (csm.erasurePending === undefined) csm.erasurePending = null
  if (csm.dollContract === undefined) csm.dollContract = false
  if (csm.lastTerror === undefined) csm.lastTerror = 0
  if (!Array.isArray(csm.terrorStory)) csm.terrorStory = []
  if (csm.lastStory === undefined) csm.lastStory = 0
  if (typeof csm.started !== 'boolean') {
    csm.started = false
    csm.gender = 'None'
    if (wdb) saveDB(wdb)
  }
  if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) csm.inventory = [{ nama: 'Fist', dur: 999 }]
  csm.inventory.filter(item => item.nama === 'Fist').forEach(item => { item.dur = Infinity })
  if (!Array.isArray(csm.foundItems)) csm.foundItems = []
  for (const item of csm.inventory) {
    if (ITEM_LIST.some(entry => entry.nama === item.nama) && !csm.foundItems.includes(item.nama)) {
      csm.foundItems.push(item.nama)
    }
  }

  if (!csm.weapon || !csm.weapon.nama) csm.weapon = fist()
  if (csm.weapon.nama === 'Fist') csm.weapon.dur = Infinity
  if (csm.weapon.nama !== 'Fist' && !csm.inventory.some(item => item.nama === csm.weapon.nama)) {
    equipFist(csm)
  }
  if (csm.weapon.nama !== 'Fist' && csm.inventory[0]?.nama !== csm.weapon.nama) {
    const equippedIndex = csm.inventory.findIndex(item => item.nama === csm.weapon.nama)
    if (equippedIndex >= 0) csm.inventory.unshift(csm.inventory.splice(equippedIndex, 1)[0])
  }

  if (!Array.isArray(csm.partners)) csm.partners = []
  if (typeof csm.lastRandomEvent !== 'number') csm.lastRandomEvent = 0
  if (typeof csm.lastRaidTime !== 'number') csm.lastRaidTime = 0
  if (typeof csm.pendingRandomEvent !== 'string') csm.pendingRandomEvent = null
  if (!csm.relations || typeof csm.relations !== 'object') csm.relations = {}
  if (!csm.lastSeenChars || typeof csm.lastSeenChars !== 'object') csm.lastSeenChars = {}
  if (!csm.lastSeenDevils || typeof csm.lastSeenDevils !== 'object') csm.lastSeenDevils = {}
  if (!Array.isArray(csm.contractHistory)) csm.contractHistory = []
  if (!Array.isArray(csm.hospital)) csm.hospital = []
  if (!Array.isArray(csm.endings)) csm.endings = []
  if (!Array.isArray(csm.achievements)) csm.achievements = []
  if (!csm.storyCooldown || typeof csm.storyCooldown !== 'object') csm.storyCooldown = {}
  if (!Array.isArray(csm.dailyQuests)) csm.dailyQuests = []
  if (!Array.isArray(csm.partnerReactionHistory)) csm.partnerReactionHistory = []
  if (!Array.isArray(csm.workStories)) csm.workStories = []
  resetLegacyViewData(csm)
  if (!Array.isArray(csm.seenContractScenes)) csm.seenContractScenes = []
  if (!Array.isArray(csm.seenExploreStories)) csm.seenExploreStories = []
  if (!Array.isArray(csm.seenMissionStories)) csm.seenMissionStories = []
  if (!Array.isArray(csm.seenRescueStories)) csm.seenRescueStories = []
  if (!Array.isArray(csm.seenRescueResults)) csm.seenRescueResults = []
  if (!Array.isArray(csm.buffHistory)) csm.buffHistory = []

  return csm
}
