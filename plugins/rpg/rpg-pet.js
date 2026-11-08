import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { isPremiumUser } from './rpg-bank.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'

import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { sendRpgButtons } from '../../lib/rpgActionButtons.js'
import {
  addRpgMoney,
  compareRpgMoney,
  formatRpgMoney,
  parseRpgMoneyAmount,
  subtractRpgMoney
} from '../../lib/rpgMoney.js'
import { getGroupTotemBuff } from '../../lib/rpg-totemData.js'
import { processPetNeglect } from '../../lib/rpgPetNeglect.js'
import { recordTaxActivity } from '../../lib/rpgTax.js'
import { rarities, pets, aliases } from '../../lib/rpg-petData.js'

let handler = async (m, { conn, text, usedPrefix, command, groupMetadata }) => {
  const petImageUrl = 'https://c.termai.cc/i173/LwJG.jpg'

  const safeReply = async (text, options = {}) => {
    try {
      return await sendRpgMsg(conn, m, text, petImageUrl, options)
    } catch {
      options = options || {}
      const mentions = options.mentions || options.contextInfo?.mentionedJid || []
      return conn.sendMessage(m.chat, { text, mentions: mentions.length ? mentions : undefined }, { quoted: m })
    }
  }

  const normalizeJid = (jid) => {
    if (!jid) return ''
    const decoded = typeof conn.decodeJid === 'function' ? conn.decodeJid(jid) : jid
    if (decoded?.endsWith('@lid')) return global.lids?.[decoded] || global.db?.data?.lids?.[decoded] || decoded
    return decoded
  }

  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return safeReply('Ketik.adventure dulu buat daftar RPG.')
  const totemIncome = amount => Math.floor(scaleDifficultyIncome(user, amount) *
    getGroupTotemBuff(wdb.data, m.chat, 'pet', 'income'))
  const petCooldownBuff = getGroupTotemBuff(wdb.data, m.chat, 'pet', 'cooldown')
  if (!user.pets) user.pets = []
  if (!Array.isArray(user.shelterPets)) user.shelterPets = []
  const maxPetSlots = user.premium ? 15 : 10
// init data baru
if (!user.sanctuary) user.sanctuary = []
if (!user.stats) user.stats = { totalFeed: 0, totalBattle: 0, totalHunt: 0 }
if (!user.buzzUsed) user.buzzUsed = 0 // [TAMBAH INI] buat nyimpen tanggal terakhir pake buzz

const formatNamaAsli = (name) => name.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
const formatNama = (p) => p.nickname? `${p.nickname} (${formatNamaAsli(p.tipe)})` : formatNamaAsli(p.tipe)
const bar = (val, len = 10) => '`' + '█'.repeat(Math.floor(val / (100/len))) + '░'.repeat(len - Math.floor(val / (100/len))) + '`'
const isMesin = (tipe) => ['robot', 'drone', 'cyborg', 'mecha'].includes(tipe)
const getDebuff = (p) => ((p.dirty || 0) >= 80? 0.8 : (p.dirty || 0) >= 50? 0.9 : 1) *
  (isRpgEventActive('pet_festival') ? 1.25 : 1)
const applyPetFestivalExp = amount => Math.floor(amount * (isRpgEventActive('pet_festival') ? 1.5 : 1))

const petNeglect = processPetNeglect(user)
if (petNeglect.changed) saveDB(wdb)
if (petNeglect.escapedPets.length) {
  safeReply(
    `╭─❏「 🐾 KABAR PET 」❏\n` +
    `│ 📋 INFORMASI PERAWATAN\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `❏「 🚨 PET KABUR 」❏\n` +
    petNeglect.escapedPets.map(pet => `> ↳ *${formatNama(pet)} kabur dari rumah.*`).join('\n') +
    `\n> Pet kabur setelah kondisinya buruk dan tidak mendapatkan perawatan.\n\n` +
    `> Pet dibawa ke shelter. Gunakan *${usedPrefix}shelter retrieve pet <no>* untuk menjemputnya.\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

user.pets = user.pets.filter(p => {
  if(Number(p.energy) <= 0 && !p.neglectStartedAt && (Date.now() - (p.lastActivity || 0) > 86400000)) {
    if(user.pets.some(x => x.tipe === 'malaikat')){
      p.energy = 50

      safeReply(
        `╭─❏「 ✨ PET 」❏\n` +
        `│ 😇 *PET DIHIDUPKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ✨ ${formatNama(p)} dihidupkan oleh Malaikat!\n\n` +
        `─━━━━━━━━━━━━━━─`
      )

      return true
    }

    user.sanctuary.push({...p, mati: Date.now()})

    safeReply(
      `╭─❏「 💀 PET 」❏\n` +
      `│ 💀 *PET MATI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${formatNama(p)} mati karena kelaparan.\n` +
      `> ↳ Ketik *${usedPrefix}pet sanctuary* untuk melihat sanctuary.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )

    return false
  }
  return true
})
  if (!user.achievements) user.achievements = []
  if (!user.cooldown) user.cooldown = {}
  if (!user.pity) user.pity = 0

  user.pets.sort((a, b) => (b.level || 1) - (a.level || 1) || (b.exp || 0) - (a.exp || 0) || a.tipe.localeCompare(b.tipe))
  const getSelectedPets = (target, defaultAll = true) => {
    if (!target && defaultAll) return user.pets.map((pet, index) => ({ pet, index }))
    if (target?.toLowerCase() === 'all') return user.pets.map((pet, index) => ({ pet, index }))
    if (target && /^\d+$/.test(target)) {
      const index = Number(target) - 1
      return user.pets[index] ? [{ pet: user.pets[index], index }] : []
    }
    return target ? user.pets.map((pet, index) => ({ pet, index })).filter(({ pet }) => pet.tipe === target.replace(/ /g, '_').toLowerCase()) : []
  }
  const normalizePetInput = (value) => String(value || '').trim().toLowerCase().replace(/_/g, ' ')
  const resolvePetType = (value) => {
    const input = normalizePetInput(value)
    return Object.keys(pets).find(type => normalizePetInput(type) === input || (aliases[type] || []).some(alias => normalizePetInput(alias) === input))
  }
  const getPending = () => user.pendingPetAction && user.pendingPetAction.expires > Date.now() ? user.pendingPetAction : null
  const getPendingPetDispatches = () => {
    if (!user.pendingPetDispatch) return []
    return Array.isArray(user.pendingPetDispatch) ? user.pendingPetDispatch : [user.pendingPetDispatch]
  }

  // migrasi data lama
  if (user.pet && user.pet.tipe && user.pet.tipe!== 'none') {
    let oldPet = user.pet
    if (!user.pets.find(p => p.tipe === oldPet.tipe)) {
      user.pets.push({ tipe: oldPet.tipe, level: oldPet.level || 1, exp: oldPet.exp || 0, energy: 100, happy: 50, dirty: 0, nickname: null, lastFeed: oldPet.lastFeed || 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    }
    delete user.pet
    saveDB(wdb)
  }

  let args = (text || '').trim().split(/\s+/).filter(Boolean)
  let action = args[0]?.toLowerCase()
  if (String(command || '').toLowerCase() === 'petcare') action = 'care'
  let jam = new Date().getHours()
  let menit = new Date().getMinutes().toString().padStart(2, '0')
  let isMalam = jam >= 18 || jam < 6
  let waktu = isMalam? '🌙 Malam' : '☀️ Siang'


const applySkill = (p, type = 'general') => {
  const data = pets[p.tipe]
  const skill = String(data?.skill || '').toLowerCase()
  if (!skill) {
    return {
      multi: 1,
      powerBonus: 0,
      damageBonus: 0,
      expBonus: 0,
      moneyBonus: 0,
      moneyMulti: 1,
      happyBonus: 0,
      energyBonus: 0,
      cooldownMulti: 1,
      cooldownReduce: 0,
      noEnergyLoss: false,
      keepHappy: false,
      extraHappyMulti: 1
    }
  }

  const result = {
    multi: 1,
    powerBonus: 0,
    damageBonus: 0,
    expBonus: 0,
    moneyBonus: 0,
    moneyMulti: 1,
    happyBonus: 0,
    energyBonus: 0,
    cooldownMulti: 1,
    cooldownReduce: 0,
    noEnergyLoss: false,
    keepHappy: false,
    extraHappyMulti: 1
  }

  const expX = Number(skill.match(/exp x([\d.]+)/)?.[1] || 0)
  if (expX > 0) result.multi *= expX

  const powerBattle = Number(skill.match(/power battle \+(\d+)/)?.[1] || 0)
  if (powerBattle > 0) result.powerBonus += powerBattle

  const damageBoost = Number(skill.match(/damage \+(\d+)/)?.[1] || 0)
  if (damageBoost > 0) result.damageBonus += damageBoost

  const cooldownX = Number(skill.match(/cooldown x([\d.]+)/)?.[1] || 0)
  if (cooldownX > 0) result.cooldownMulti *= cooldownX

  const cooldownReduce = Number(skill.match(/cooldown -(\d+) detik/)?.[1] || 0)
  if (cooldownReduce > 0) result.cooldownReduce += cooldownReduce * 1000

  const feedEnergy = Number(skill.match(/energy \+(\d+) pas feed/)?.[1] || 0)
  if (feedEnergy > 0) result.energyBonus += feedEnergy

  const restHappy = Number(skill.match(/happy \+(\d+) pas rest/)?.[1] || 0)
  if (restHappy > 0) result.happyBonus += restHappy

  const happyMulti = Number(skill.match(/happy x([\d.]+)/)?.[1] || 0)
  if (happyMulti > 0) result.extraHappyMulti *= happyMulti

  if (skill.includes('energy tidak turun')) result.noEnergyLoss = true
  if (skill.includes('happy tidak pernah turun')) result.keepHappy = true
  if (skill.includes('hasilkan uang pas feed')) result.moneyBonus += 2000
  if (skill.includes('hunt dapat 2x hasil') || skill.includes('drop uang +2x pas hunt')) result.moneyMulti *= 2
  if (skill.includes('exp x1.5 saat hunt') || skill.includes('exp x2 saat hunt') || skill.includes('exp x3 saat hunt')) {
    const huntExp = Number(skill.match(/exp x([\d.]+) saat hunt/)?.[1] || 0)
    if (huntExp > 0) result.multi *= huntExp
  }

  if (type === 'battle') {
    const battleMulti = result.multi
    return {
      ...result,
      multi: battleMulti,
      powerBonus: result.powerBonus,
      damageBonus: result.damageBonus
    }
  }

  if (type === 'hunt') {
    return {
      ...result,
      multi: result.multi,
      moneyMulti: result.moneyMulti
    }
  }

  return result
}

const getCooldown = (base, user) => {
  let multi = 1
  let reduce = 0

  user.pets.forEach(p => {
    const skill = applySkill(p, 'cooldown')
    multi *= skill.cooldownMulti
    reduce += skill.cooldownReduce
  })

  if(user.pets.some(p => p.tipe === 'jin')) multi *= 0.5
  if(user.pets.some(p => p.tipe === 'sonic')) multi *= 0.2
  if(user.pets.some(p => p.tipe === 'toothless')) multi *= 0.5
  if(user.pets.some(p => p.tipe === 'jessie')) multi *= 0.5

  let hasil = base * multi - reduce
  if(user.pets.some(p => p.tipe === 'jack_o_lantern')) hasil -= 10000
  return Math.floor(scaleDifficultyCooldown(user, Math.max(10000, hasil)) * petCooldownBuff)
}

const formatCooldown = (ms) => {
  if (ms <= 0) return '✅ Siap'
  const menit = Math.floor(ms / 60000)
  const detik = Math.floor((ms % 60000) / 1000)
  return menit > 0 ? `⏳ ${menit}m ${detik}s` : `⏳ ${detik}s`
}

const getRemaining = (key, base, user) => {
  const last = Number(user.cooldown[key] || 0)
  return Math.max(0, getCooldown(base, user) - (Date.now() - last))
}

const getPetRemaining = (field, base, user) => {
  const cooldown = getCooldown(base, user)
  return Math.max(0, ...user.pets.map(p => {
    const last = Number(p[field] || 0)
    return last > 0 ? Math.max(0, cooldown - (Date.now() - last)) : 0
  }))
}

const cekBuzz = () => {
  let today = new Date().toDateString()
  let lastUsed = user.buzzUsed? new Date(user.buzzUsed).toDateString() : null
  if(user.pets.some(p => p.tipe === 'buzz_lightyear') && lastUsed !== today){
    user.buzzUsed = Date.now()
    saveDB(wdb)
    safeReply(`╭──「 🐾 AVELIA PET CENTER 」──╮\n\n🚀 *SKILL AKTIF*\n${pets['buzz_lightyear'].emoji} *BUZZ LIGHTYEAR*\n✨ To Infinity And Beyond!\nCooldown kamu di-skip 1x hari ini\n━━━━━━━━━━━`)
    return true
  }
  return false
}

if (action === 'care') {
  if (!isPremiumUser(m.sender, wdb)) return safeReply('❌ Perintah *.pet care* khusus pengguna premium.')
  if (!user.pets.length) return safeReply('❌ Kamu belum memiliki pet.')
  if (user.pets.some(pet => pet.tipe === 'vampir') && !isMalam) return safeReply('🧛 Pet vampir hanya bisa dirawat pada pukul 18:00-05:59 WIB.')

  const cooldown = Math.floor(30 * 60 * 1000 * petCooldownBuff)
  const remaining = cooldown - (Date.now() - (Number(user.cooldown.petcare) || 0))
  if (remaining > 0) return safeReply(`⏳ Cooldown *.pet care* tersisa ${Math.ceil(remaining / 60000)} menit.`)

  const feedCost = { COMMON: 5000, UNCOMMON: 15000, RARE: 50000, EPIC: 150000, LEGENDARY: 500000, MYTHIC: 1000000, SECRET: 2000000 }
  const hasRemy = user.pets.some(pet => pet.tipe === 'remy_ratatouille')
  let totalFeedCost = 0
  for (const pet of user.pets) {
    if (isMesin(pet.tipe)) continue
    let cost = feedCost[pets[pet.tipe]?.rarity || 'COMMON'] || 2000
    if (applySkill(pet, 'feed').moneyBonus > 0) cost = Math.max(0, cost - Math.floor(cost * 0.5))
    if (hasRemy) cost = Math.floor(cost * 0.5)
    totalFeedCost += cost
  }
  const cleanCost = user.pets.filter(pet => Number(pet.dirty) !== 0).length * 2000
  const totalCost = totalFeedCost + cleanCost
  if (compareRpgMoney(wdb.money[m.sender], totalCost) < 0) return safeReply(`❌ Uang tidak cukup. Care membutuhkan ${formatRpgMoney(totalCost)} untuk feed dan clean.`)

  const now = Date.now()
  wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], totalCost)
  for (const pet of user.pets) {
    if (!isMesin(pet.tipe)) {
      const rarity = pets[pet.tipe]?.rarity || 'COMMON'
      const skill = applySkill(pet, 'feed')
      let expGain = ( { COMMON: 20, UNCOMMON: 25, RARE: 35, EPIC: 50, LEGENDARY: 70, MYTHIC: 90, SECRET: 120 }[rarity] || 20) + (pet.tipe === 'anjing_alpha' ? 10 : 0) + (skill.expBonus || 0)
      pet.exp = (Number(pet.exp) || 0) + applyPetFestivalExp(expGain)
      pet.energy = Math.min(100, (Number(pet.energy) || 100) + 20 + (pet.tipe === 'mermaid' ? 10 : 0) + (skill.energyBonus || 0))
      pet.happy = Math.min(100, (Number(pet.happy) || 50) + 5 + (skill.happyBonus || 0))
      if (pet.tipe === 'alien') wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], totemIncome(1000 * (Number(pet.level) || 1)))
      if (pet.tipe === 'poop') wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], totemIncome(2000))
      if (skill.moneyBonus > 0) wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], totemIncome(skill.moneyBonus))
      if (pet.exp >= 100) { pet.level = (Number(pet.level) || 1) + Math.floor(pet.exp / 100); pet.exp %= 100 }
      pet.lastFeed = now
    }

    if (pet.energy <= 0 && pet.tipe === 'phoenix' && pet.revive) { pet.energy = 100; pet.revive = false }
    const restSkill = applySkill(pet, 'rest')
    pet.energy = Math.min(100, (Number(pet.energy) || 100) + 30 + (restSkill.energyBonus || 0))
    pet.happy = Math.min(100, (Number(pet.happy) || 50) + (pet.tipe === 'fairy' ? 5 : 0) + (restSkill.happyBonus || 0))
    if (restSkill.keepHappy) pet.happy = Math.max(pet.happy, 100)
    pet.lastRest = now
    pet.dirty = 0
    pet.happy = Math.min(100, pet.happy + 10)
  }

  user.petCareAt = now
  user.cooldown.petcare = now
  saveDB(wdb)
  const careResult = `✅ *PET CARE SELESAI*\nSemua pet sudah di-feed, di-rest, dan dibersihkan.\n> ↳ Biaya: Rp ${totalCost.toLocaleString('id-ID')}\n> ↳ *.pet all* bisa digunakan sekarang. Cooldown care: 30 menit.`
  return sendRpgButtons(conn, {
    chat: m.chat,
    text: careResult,
    footer: 'AVELIA PET CENTER',
    buttons: [['❖ AKTIVITAS PET', `${usedPrefix}pet all`]],
    quoted: m,
    reply: text => safeReply(text)
  })
}

if (action === 'all') {
  if (!isPremiumUser(m.sender, wdb)) return safeReply('❌ Perintah *.pet all* khusus pengguna premium.')
  if (!user.pets.length) return safeReply('❌ Kamu belum memiliki pet.')
  const batchCooldown = 30 * 60 * 1000
  const batchRemaining = batchCooldown - (Date.now() - (Number(user.cooldown.petall) || 0))
  if (batchRemaining > 0) return safeReply(`⏳ Cooldown *.pet all* tersisa ${Math.ceil(batchRemaining / 60000)} menit.`)
  if (!user.petCareAt || Number(user.petCareAt) <= (Number(user.petLastAllAt) || 0)) return safeReply(`❌ Gunakan *.pet care* terlebih dahulu sebelum *.pet all*.`)
  if (user.pets.some(pet => pet.tipe === 'vampir') && !isMalam) return safeReply('🧛 Pet vampir hanya bisa beraktivitas pada pukul 18:00-05:59 WIB.')

  const now = Date.now()
  let huntExp = Math.floor(Math.random() * 30) + 10
  const huntMoneyMulti = user.pets.reduce((total, pet) => total * (applySkill(pet, 'hunt').moneyMulti || 1), 1)
  const huntMoney = totemIncome(Math.floor((Math.floor(Math.random() * 50000) + 10000) * huntMoneyMulti))
  const dispatchMoney = totemIncome(Math.floor(Math.random() * 100000) + 50000)
  const levelUps = []

  user.pets.forEach(pet => {
    const trainSkill = applySkill(pet, 'train')
    const walkSkill = applySkill(pet, 'walk')
    const playSkill = applySkill(pet, 'play')
    const huntSkill = applySkill(pet, 'hunt')
    let trainExp = 60 * getDebuff(pet) * (pet.tipe === 'skeleton' ? 1.5 : 1) + (pet.tipe === 'orc' ? 10 : 0)
    let walkExp = 30 * getDebuff(pet) * (pet.tipe === 'skeleton' ? 1.5 : 1) + (pet.tipe === 'orc' ? 5 : 0)
    let playExp = 30 * getDebuff(pet) * (pet.tipe === 'skeleton' ? 1.5 : 1)
    if (pet.tipe === 'vampir' && isMalam) { trainExp += 20; walkExp += 15; playExp += 15 }
    if (pet.tipe === 'serigala' && isMalam) { trainExp += 15; walkExp += 10 }
    const trainLoss = trainSkill.noEnergyLoss || ['batu', 'zombie'].includes(pet.tipe) ? 0 : pet.tipe === 'zombie' ? 15 : pet.tipe === 'burung_hantu' && isMalam ? 15 : 30
    const walkLoss = walkSkill.noEnergyLoss || ['batu', 'zombie'].includes(pet.tipe) ? 0 : pet.tipe === 'zombie' ? 10 : pet.tipe === 'burung_hantu' && isMalam ? 10 : 20
    let playLoss = playSkill.noEnergyLoss || ['batu', 'zombie'].includes(pet.tipe) ? 0 : pet.tipe === 'zombie' ? 10 : pet.tipe === 'burung_hantu' && isMalam ? 10 : pet.tipe === 'snowman' && !isMalam ? 30 : 20
    if (pet.tipe === 'zombie') playLoss = 10
    const expGain = applyPetFestivalExp(trainExp + walkExp + playExp + huntExp * huntSkill.multi * getDebuff(pet))
    pet.exp = (Number(pet.exp) || 0) + expGain
    if (!trainSkill.keepHappy) pet.happy = (Number(pet.happy) || 50) - 5
    pet.happy = Math.min(100, pet.happy + 5 + 10 * (pet.tipe === 'ghost' ? 2 : 1))
    pet.dirty = Math.min(100, (Number(pet.dirty) || 0) + 45)
    pet.energy = Math.max(0, (Number(pet.energy) || 100) - trainLoss - walkLoss - playLoss - 40)
    pet.lastTrain = now
    pet.lastActivity = now
    if (pet.exp >= 100) {
      pet.level = (Number(pet.level) || 1) + Math.floor(pet.exp / 100)
      pet.exp %= 100
      levelUps.push(pet)
    }
  })

  wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], huntMoney)
  user.cooldown.pethunt = now
  user.cooldown.petdispatch = now
  user.cooldown.petall = now
  user.petLastAllAt = user.petCareAt
  user.pendingPetDispatch = [...getPendingPetDispatches(), { startedAt: now, readyAt: now + 1800000, money: dispatchMoney }]
  saveDB(wdb)
  return safeReply(
    `✅ *PET ALL SELESAI*\n` +
    `\n📋 *DAFTAR AKTIVITAS*\n` +
    `> ↳ Train: dilakukan untuk ${user.pets.length} pet.\n` +
    `> ↳ Walk: dilakukan untuk ${user.pets.length} pet.\n` +
    `> ↳ Play: dilakukan untuk ${user.pets.length} pet.\n` +
    `> ↳ Hunt: dilakukan untuk ${user.pets.length} pet.\n` +
    `\n📊 *HASIL*\n` +
    `> ↳ Hasil hunt: +Rp ${huntMoney.toLocaleString('id-ID')}\n` +
    `> ↳ Dispatch selesai dalam 30 menit; hasilnya bisa ditumpuk tanpa klaim dulu.\n` +
    `> ↳ Info dispatch: *${usedPrefix}pet dispatch info*.\n` +
    `> ↳ Klaim dispatch: *${usedPrefix}pet dispatch collect*.${levelUps.length ? `\n> ↳ Level up: ${levelUps.length} pet.` : ''}`
  )
}
  const getPet = (name) => user.pets.find(p => p.tipe === name)
  const getMood = (p) => {
    let avg = ((p.happy || 50) + (p.energy || 100) + (100 - (p.dirty || 0))) / 3
    if(avg >= 80) return '😄 Sangat Bahagia'
    if(avg >= 60) return '🙂 Senang'
    if(avg >= 40) return '😐 Biasa'
    if(avg >= 20) return '😞 Sedih'
    return '💀 Butuh Perhatian!'
  }
  const getRarityPet = () => {
    let roll = Math.random() * 100
    let cum = 0
    for(let r of Object.keys(rarities)){
      cum += rarities[r].rate
      if(roll <= cum) return r
    }
    return 'COMMON'
  }

if (action === 'guide') {
  return safeReply(
    `╭─❏「 📖 PANDUAN PET 」❏\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Pet dapat dirawat dan dilatih untuk menaikkan level serta membuka kemampuannya.\n\n` +
    `> ↳ Lihat pet yang dimiliki: *${usedPrefix}pet list*\n` +
    `> ↳ Cek detail dan kondisi: *${usedPrefix}pet status <no/nama>*\n` +
    `> ↳ Lihat pet yang bisa dibeli: *${usedPrefix}pet shop*\n` +
    `> ↳ Beli pet: *${usedPrefix}pet adopt <no/nama>*\n` +
    `> ↳ Perintah lengkap: *${usedPrefix}pet command*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'command' || action === 'commands' || action === 'cmd') {
  const commands = handler.help.filter(item => item.startsWith('pet '))
  const menuCopy = {
    guide: ['📖 Panduan Pet', 'Kenali kebutuhan, perawatan, dan perkembangan pet-mu.'],
    command: ['📋 Aktivitas Pet', 'Temukan semua cara berinteraksi dengan teman kecilmu.'],
    care: ['💖 Rawat Pet', 'Berikan perhatian agar pet tetap sehat dan bahagia.'],
    all: ['⚡ Perawatan Lengkap', 'Jalankan perawatan pet yang siap dilakukan sekaligus.'],
    list: ['🐾 Koleksi Pet', 'Jelajahi teman-teman yang sudah menemanimu.'],
    shop: ['🛍️ Toko Pet', 'Cari perlengkapan dan teman baru untuk koleksimu.'],
    adopt: ['🏡 Adopsi Pet', 'Sambut teman baru untuk menemani petualanganmu.'],
    gacha: ['🎁 Pet Kejutan', 'Coba peruntungan untuk menemukan pet istimewa.'],
    feed: ['🍖 Isi Energi', 'Pulihkan tenaga pet dengan makanan kesukaannya.'],
    charge: ['🔋 Pulihkan Stamina', 'Bantu pet kembali siap beraktivitas.'],
    walk: ['🚶 Jalan Bersama', 'Nikmati waktu santai dan bangun kedekatan.'],
    play: ['🎾 Ajak Bermain', 'Buat suasana ceria bersama pet kesayangan.'],
    train: ['💪 Latihan Pet', 'Asah kemampuan agar pet makin tangguh.'],
    rest: ['😴 Waktu Istirahat', 'Biarkan pet beristirahat setelah beraktivitas.'],
    clean: ['🫧 Bersihkan Pet', 'Jaga penampilan pet tetap bersih dan nyaman.'],
    heal: ['🩹 Pulihkan Pet', 'Bantu pet kembali sehat dan bugar.'],
    gift: ['🎀 Hadiah untuk Pet', 'Berikan sesuatu yang membuat pet senang.'],
    rename: ['🏷️ Ganti Nama', 'Pilih nama yang cocok untuk temanmu.'],
    battle: ['⚔️ Tantangan Pet', 'Uji kemampuan pet dalam pertarungan.'],
    hunt: ['🎯 Berburu Bersama', 'Ajak pet mencari hasil di alam liar.'],
    dispatch: ['🧭 Misi Pet', 'Kirim pet menjalankan ekspedisi khusus.'],
    status: ['📊 Status Pet', 'Pantau kesehatan dan perkembangan temanmu.'],
    sell: ['💰 Jual Pet', 'Kelola koleksi dengan melepas pet pilihan.'],
    release: ['🕊️ Lepaskan Pet', 'Antarkan pet kembali ke alam dengan baik.'],
    breed: ['💕 Kawinkan Pet', 'Temukan keturunan dengan kombinasi unik.'],
    playwith: ['🤍 Waktu Berkualitas', 'Pererat ikatan lewat momen kebersamaan.'],
    transfer: ['🤝 Pindahkan Pet', 'Percayakan pet kepada pemain lain.'],
    kill: ['🛑 Kelola Pet', 'Lihat opsi pengelolaan pet yang tersedia.'],
    claim: ['🎁 Klaim Pet', 'Ambil pet yang sudah menantimu.'],
    sanctuary: ['🌿 Suaka Pet', 'Titipkan pet dalam tempat yang aman.'],
    revive: ['✨ Bangkitkan Pet', 'Bantu pet kembali menemanimu.'],
    lb: ['🏆 Peringkat Pet', 'Lihat pet dan pemilik paling berprestasi.']
  }
  const sections = []
  for (let index = 0; index < commands.length; index += 10) {
    sections.push({
      title: `🐾 Pet • ${Math.floor(index / 10) + 1}`,
      rows: commands.slice(index, index + 10).map(item => {
        const commandText = item.slice(4)
        const action = commandText.split(/\s+/)[0].toLowerCase()
        const [title, description] = menuCopy[action] || ['🐾 Interaksi Pet', 'Pilih cara untuk menjaga ikatan dengan teman kecilmu.']
        return {
          title,
          description,
          id: `${usedPrefix}${item}`
        }
      })
    })
  }
  const commandText = commands.map(item => `> ↳ *${usedPrefix}${item}*`).join('\n')
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    title: '🐾 DUNIA PET AVELIA',
    subtitle: 'Temani, rawat, dan tumbuh bersama pet-mu',
    text: 'Setiap pet punya kisahnya sendiri. Pilih momen yang ingin kamu jalani bersama.',
    buttonText: '🐾 JELAJAHI AKTIVITAS',
    sections,
    fallbackText: `╭─❏「 📋 COMMAND PET 」❏\n╰─━━━━━━━━━━━━━━─\n\n${commandText}\n\n─━━━━━━━━━━━━━━─`,
    reply: text => safeReply(text)
  })
}

  // === DAFTAR COOLDOWN ===
if (action === 'cd' || action === 'cooldown') {
  const rows = [
    ['🍖 Feed', getPetRemaining('lastFeed', 120000, user)],
    ['💪 Train', getPetRemaining('lastTrain', 300000, user)],
    ['🚶 Walk', getPetRemaining('lastActivity', 60000, user)],
    ['🎮 Play', getPetRemaining('lastActivity', 60000, user)],
    ['😴 Rest', getPetRemaining('lastRest', 600000, user)],
    ['⚔️ Battle', getRemaining('petbattle', 300000, user)],
    ['🎯 Hunt', getRemaining('pethunt', 600000, user)],
    ['📦 Dispatch', getRemaining('petdispatch', 1800000, user)],
    ['💕 Breed', getRemaining('petbreed', 86400000, user)]
  ]

  let cap = `╭─❏「 ⏰ PET COOLDOWN 」❏\n`
  cap += `│ ⏰ *Status seluruh aktivitas pet.*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  rows.forEach(([name, remaining]) => {
    cap += `> ↳ ${name} : ${formatCooldown(remaining)}\n`
  })

  cap += `\n─━━━━━━━━━━━━━━─`

  return safeReply(cap)
}

  // === MENU UTAMA DAN DAFTAR PET ===
  if (!action) {
    return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Fitur pet memungkinkanmu membeli, merawat, melatih, dan mengembangkan pet.\n\n` +
      `> ↳ Lihat pet yang dimiliki: *${usedPrefix}pet list*\n` +
      `> ↳ Cek detail pet: *${usedPrefix}pet status <no/nama>*\n` +
      `> ↳ Lihat pet shop: *${usedPrefix}pet shop*\n` +
      `> ↳ Baca panduan: *${usedPrefix}pet guide*\n` +
      `> ↳ Lihat command: *${usedPrefix}pet command*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'list') {
    let cap = `╭─❏「 🐾 DAFTAR PET KAMU 」❏\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    if (!user.pets.length) {
      cap += `Kamu belum memiliki pet.\n`
    } else {
      user.pets.forEach((pet, index) => {
        cap += `*${index + 1}. ${formatNama(pet)} ${pets[pet.tipe]?.emoji || '❓'}*\n`
      })
    }
    cap += `\n─━━━━━━━━━━━━━━─`
    return safeReply(cap)
}

// === STATUS DETAIL ===
if (action === 'status') {
  if(user.pets.length === 0) return safeReply(
    `╭─❏「 🐾 PET STATUS 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu tidak punya pet.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let target = args[1]

  if(!target) return safeReply(
    `╭─❏「 🐾 PET STATUS 」❏\n` +
    `│ ❌ *TARGET PET KOSONG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: *${usedPrefix}pet status 1*\n` +
    `> ↳ Atau: *${usedPrefix}pet status kucing*\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let p = !isNaN(target)
    ? user.pets[parseInt(target)-1]
    : user.pets.find(x => x.tipe === target.replace(/ /g,'_'))

  if(!p) return safeReply(
    `╭─❏「 🐾 PET STATUS 」❏\n` +
    `│ ❌ *PET TIDAK DITEMUKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet yang kamu cari tidak ditemukan.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let bersih = 100 - (p.dirty || 0)

  let cap = `╭─❏「 📋 DETAIL PET 」❏\n`
  cap += `│ ${pets[p.tipe].emoji} *${formatNama(p).toUpperCase()}*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `📋 *INFORMASI PET*\n`
  cap += `> ↳ 🏷️ Jenis: ${formatNamaAsli(p.tipe)}\n`
  cap += `> ↳ 📈 Level: ${p.level}\n`
  cap += `> ↳ 📊 Exp: ${p.exp}/100\n`
  cap += `> ↳ ✨ Skill: ${pets[p.tipe].skill || 'Tidak ada'}\n`
  cap += `> ↳ 🌟 Rarity: ${rarities[pets[p.tipe].rarity].emoji} ${pets[p.tipe].rarity}\n\n`

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `🔋 *ENERGY*\n`
  cap += `> ↳ ${bar(p.energy || 100)} ${(p.energy || 100)}%\n\n`

  cap += `😊 *HAPPY*\n`
  cap += `> ↳ ${bar(p.happy || 50)} ${(p.happy || 50)}%\n\n`

  cap += `🧼 *KEBERSIHAN*\n`
  cap += `> ↳ ${bar(bersih)} ${bersih}%\n\n`

  cap += `💭 *MOOD*\n`
  cap += `> ↳ ${getMood(p)}\n\n`

  cap += `╰─━━━━━━━━━━━━━━─`

  return safeReply(cap)
}

// === SHOP ===
if (action === 'shop') {
  let sortedPets = Object.entries(pets).sort((a,b) => a[1].harga - b[1].harga)

  // MAP NOMOR -> NAMA PET URUT 1-....
  const nomorKePet = {}
  sortedPets.forEach(([k], i) => nomorKePet[i+1] = k)
  user.nomorKePet = nomorKePet // simpan biar adopt bisa baca

  let cap = `╭─❏「 🛍️ AVELIA PET SHOP 」❏\n`
  cap += `│ 🛍️ *DAFTAR PET TERSEDIA*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `💰 *INFORMASI SALDO*\n`
  cap += `> ↳ Saldo: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n`

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `📌 *CARA BELI*\n`
  cap += `> ↳ *${usedPrefix}pet adopt <no/nama>*\n\n`

  cap += `─━━━━━━━━━━━━━━─\n\n`

  let nomor = 1

  cap += `🟢 *MURAH < 500RB*\n\n`
  sortedPets.filter(([k,v]) => v.harga < 500000).forEach(([k, v]) => {
    cap += `*${nomor++}. ${formatNamaAsli(k)} ${v.emoji}*\n`
    cap += `> Buy : Rp ${v.harga.toLocaleString()}\n\n`
  })

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `🔵 *STANDAR 500RB - 2JT*\n\n`
  sortedPets.filter(([k,v]) => v.harga >= 500000 && v.harga < 2000000).forEach(([k, v]) => {
    cap += `*${nomor++}. ${formatNamaAsli(k)} ${v.emoji}*\n`
    cap += `> Buy : Rp ${v.harga.toLocaleString()}\n\n`
  })

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `🟣 *RARE 2JT - 10JT*\n\n`
  sortedPets.filter(([k,v]) => v.harga >= 2000000 && v.harga < 10000000).forEach(([k, v]) => {
    cap += `*${nomor++}. ${formatNamaAsli(k)} ${v.emoji}*\n`
    cap += `> Buy : Rp ${v.harga.toLocaleString()}\n\n`
  })

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `🔴 *LEGEND > 10JT*\n\n`
  sortedPets.filter(([k,v]) => v.harga >= 10000000).forEach(([k, v]) => {
    cap += `*${nomor++}. ${formatNamaAsli(k)} ${v.emoji}*\n`
    cap += `> Buy : Rp ${v.harga.toLocaleString()}\n\n`
  })

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `💡 *TIPS*\n`
  cap += `> ↳ Beli memakai nomor agar lebih cepat.\n`

  cap += `\n─━━━━━━━━━━━━━━─`

  return safeReply(cap)
}

// === ADOPT ===
if (action === 'adopt') {
    
  if(user.pets.length >= maxPetSlots) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *PET PENUH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Maksimal ${maxPetSlots} pet.\n` +
    `> ↳ Release/Sell/Kill/Transfer pet terlebih dahulu.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let petName = args.slice(1).join(' ').toLowerCase()

  if (!petName) return safeReply(
    `╭─❏「 🐾 ADOPT PET 」❏\n` +
    `│ ❌ *PET BELUM DIPILIH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: *${usedPrefix}pet adopt 1*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  // CEK APAKAH INPUTNYA NOMOR DARI SHOP
  if(!isNaN(petName) && user.nomorKePet){
    petName = user.nomorKePet[parseInt(petName)]

    if(!petName) return safeReply(
      `╭─❏「 🐾 ADOPT PET 」❏\n` +
      `│ ❌ *NOMOR TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Cek daftar pet melalui *${usedPrefix}pet shop*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

    const resolvedAdoptType = resolvePetType(petName)
    if (resolvedAdoptType) petName = resolvedAdoptType
    else petName = petName.replace(/ /g, '_').replace(/-/g, '_')

    if (!pets[petName]) return safeReply(`❌ Pilih pet yang benar. Ketik ${usedPrefix}pet shop`)
    if (getPet(petName)) return safeReply(`╭──「 🐾 AVELIA PET CENTER 」──╮\n\n❌ *KAMU SUDAH PUNYA*\n${pets[petName].emoji} *${formatNamaAsli(petName).toUpperCase()}*\n━━━━━━━━━━━`)
    let harga = pets[petName].harga
    if ((wdb.money[m.sender] || 0) < harga) return safeReply(`╭──「 🐾 AVELIA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp ${harga.toLocaleString()}\n━━━━━━━━━━━`)
    wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], harga)
    user.pets.push({ tipe: petName, level: 1, exp: 0, energy: 100, happy: 50, dirty: 0, nickname: null, lastFeed: 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    recordTaxActivity(wdb.data, m.sender, 'purchase', harga)
    saveDB(wdb)
    return safeReply(`╭──「 🐾 AVELIA PET CENTER 」──╮\n\n✅ *ADOPSI BERHASIL*\n${pets[petName].emoji} *${formatNamaAsli(petName).toUpperCase()}*\n🌟 ${rarities[pets[petName].rarity].emoji} ${pets[petName].rarity}\n✨ Skill : ${pets[petName].skill || 'Tidak ada'}\n💰 Harga : -Rp ${harga.toLocaleString()}\n━━━━━━━━━━━`)
  }

// === GACHA ===
  if (action === 'gacha') {
  if(user.pets.length >= maxPetSlots) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *PET PENUH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Maksimal ${maxPetSlots} pet.\n` +
    `> ↳ Release/Sell/Kill/Transfer dulu.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let biaya = 2500000 // 2.5jt

  if ((wdb.money[m.sender] || 0) < biaya) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh: Rp ${biaya.toLocaleString()}\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  user.pity++

  const raritiesNerf = {
    COMMON:    {stars: '★☆☆☆☆☆☆', emoji: '🤍', rate: 60},
    UNCOMMON:  {stars: '★★☆☆☆☆☆', emoji: '💙', rate: 25},
    RARE:      {stars: '★★★☆☆☆☆', emoji: '✨', rate: 10},
    EPIC:      {stars: '★★★★☆☆☆', emoji: '💎', rate: 3.5},
    LEGENDARY: {stars: '★★★★★☆☆', emoji: '👑', rate: 1.0},
    MYTHIC:    {stars: '★★★★★★☆', emoji: '🌌', rate: 0.4},
    SECRET:    {stars: '★★★★★★★', emoji: '🔮', rate: 0.1}
  }

  let roll = Math.random() * 100
  let cum = 0
  let rarity = 'COMMON'

  for(let r of Object.keys(raritiesNerf)){
    cum += raritiesNerf[r].rate
    if(roll <= cum){
      rarity = r
      break
    }
  }
  
  // Pity 100 roll ke LEGENDARY
  if(user.pity >= 100){ 
    rarity = 'LEGENDARY'
    user.pity = 0 
  }

  if(rarity === 'LEGENDARY' || rarity === 'MYTHIC' || rarity === 'SECRET') user.pity = 0

  let pool = Object.entries(pets).filter(([k,v]) => v.rarity === rarity)
  let randomPet = pool[Math.floor(Math.random() * pool.length)][0]

  wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], biaya)

  user.pets.push({
    tipe: randomPet,
    level: 1,
    exp: 0,
    energy: 100,
    happy: 50,
    dirty: 0,
    nickname: null,
    lastFeed: 0,
    lastActivity: 0,
    lastRest: 0,
    lastTrain: 0,
    revive: true
  })

  saveDB(wdb)

  let pitySisa = Math.max(0, 100 - user.pity)

  return safeReply(
    `╭─❏「 🎰 PET GACHA 」❏\n` +
    `│ 🐾 *HASIL PET GACHA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `🎰 *GACHA PET*\n` +
    `> ↳ Biaya: Rp ${biaya.toLocaleString()}/Roll\n\n` +

    `🌟 *RARITY*\n` +
    `> ↳ ${raritiesNerf[rarity].emoji} *${rarity}*\n` +
    `> ↳ ${raritiesNerf[rarity].stars}\n\n` +

    `─━━━━━━━━━━━━━━─\n\n` +

    `🐾 *PET DIDAPATKAN*\n` +
    `> ↳ ${pets[randomPet].emoji} *${formatNamaAsli(randomPet).toUpperCase()}*\n\n` +

    `💰 *PENGELUARAN*\n` +
    `> ↳ 💸 Biaya: -Rp ${biaya.toLocaleString()}\n` +
    `> ↳ 🎯 Pity: ${pitySisa} lagi ke LEGEND\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}
  
// === CEK VAMPIR ===
if(['walk','play','feed','rest','train'].includes(action)){
  if (user.pets.some(p => p.tipe === 'vampir') && !isMalam) {
    return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ 🧛 *VAMPIR TIDUR*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Vampir kamu bersembunyi di peti mati karena matahari!\n` +
      `> ↳ Aktif lagi jam 18:00 - 05:59 WIB\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
}

const cekCD = (key, durasi) => {
  let last = user.cooldown[key] || 0
  let sisa = scaleDifficultyCooldown(user, durasi) - (Date.now() - last)
  return sisa > 0? Math.ceil(sisa / 1000) : 0
}

// === FEED ===
if (action === 'feed') {
  if (user.pets.length === 0) return safeReply(
    `╭─❏「 🍖 PET FEED 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu tidak punya pet.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  const selected = getSelectedPets(args[1])

  if (selected.length === 0) return safeReply(
    `╭─❏「 🍖 PET FEED 」❏\n` +
    `│ ❌ *NOMOR PET TIDAK VALID*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Cek daftar pet dengan *${usedPrefix}pet*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  const organic = selected.filter(({ pet }) => !isMesin(pet.tipe))
  const machines = selected.filter(({ pet }) => isMesin(pet.tipe))

  if (machines.length && !organic.length) return safeReply(
    `╭─❏「 🍖 PET FEED 」❏\n` +
    `│ ⚙️ *PET MESIN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet mesin tidak bisa diberi makan.\n` +
    `> ↳ Gunakan *${usedPrefix}pet charge all*\n` +
    `> ↳ Atau *${usedPrefix}pet charge <nomor>*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let cd = getCooldown(120000, user)
  if(cekBuzz()) cd = 0 

  if (organic.some(({ pet }) => Date.now() - (pet.lastFeed || 0) < cd)) return safeReply(
    `╭─❏「 🍖 PET FEED 」❏\n` +
    `│ 🍖 *MASIH KENYANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Perut pet buncit. Nanti muntah.\n` +
    `> ↳ ⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
    // HARGA FEED BERDASAR RARITY
    const feedCost = {
      COMMON: 5000,
      UNCOMMON: 15000,
      RARE: 50000,
      EPIC: 150000,
      LEGENDARY: 500000,
      MYTHIC: 1000000,
      SECRET: 2000000
    }
    const feedExp = {
      COMMON: 20,
      UNCOMMON: 25,
      RARE: 35,
      EPIC: 50,
      LEGENDARY: 70,
      MYTHIC: 90,
      SECRET: 120
    }

    let biayaMakan = 0
    let detailBiaya = []
    let hasRemy = user.pets.some(p => p.tipe === 'remy_ratatouille')

    organic.forEach(({ pet: p }) => {
      let rarity = pets[p.tipe]?.rarity || 'COMMON'
      let cost = feedCost[rarity] || 2000
      const feedSkill = applySkill(p, 'feed')
      if (feedSkill.moneyBonus > 0) {
        cost = Math.max(0, cost - Math.floor(cost * 0.5))
      }
      if (hasRemy) cost = Math.floor(cost * 0.5)
      biayaMakan += cost
      detailBiaya.push(`${pets[p.tipe]?.emoji || '🐾'} ${formatNama(p)}: Rp ${cost.toLocaleString()}${hasRemy ? ' (Remy -50%)' : ''}`)
    })

    if ((wdb.money[m.sender] || 0) < biayaMakan) return safeReply(`╭──「 🐾 AVELIA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp ${biayaMakan.toLocaleString()}.\n━━━━━━━━━━━`)
    
    wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], biayaMakan)
    let naik = []
    organic.forEach(({ pet: p }) => {
      let rarity = pets[p.tipe]?.rarity || 'COMMON'
      let expGain = feedExp[rarity] + (p.tipe === 'anjing_alpha' ? 10 : 0)
      let energyGain = 20 + (p.tipe === 'mermaid' ? 10 : 0)
      const feedSkill = applySkill(p, 'feed')

      expGain += feedSkill.expBonus || 0
      expGain = applyPetFestivalExp(expGain)
      energyGain += feedSkill.energyBonus || 0
      p.happy = Math.min(100, (p.happy || 50) + 5 + (feedSkill.happyBonus || 0))

      p.exp = (p.exp || 0) + expGain
      p.energy = Math.min(100, (p.energy || 100) + energyGain)

      if(p.tipe === 'alien') wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], totemIncome(1000 * p.level))
      if(p.tipe === 'poop') wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], totemIncome(2000))
      if(feedSkill.moneyBonus > 0) wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], totemIncome(feedSkill.moneyBonus))

      p.lastFeed = Date.now()
      if (p.exp >= 100) { p.level = (Number(p.level) || 1) + Math.floor(p.exp / 100); p.exp %= 100; naik.push(p) }
    })
    saveDB(wdb)
    
    let teks = `╭─❏「 🐾 AVELIA PET CENTER 」❏\n`
teks += `│ 🍖 *WAKTU MAKAN TIBA*\n`
teks += `╰─━━━━━━━━━━━━━━─\n\n`

teks += `🍽️ *MEMBERI MAKAN*\n\n`

teks += `💰 *BIAYA MAKAN*\n`
teks += `> ↳ Total: -Rp ${biayaMakan.toLocaleString()}${hasRemy ? ' ✨ (Remy Passif -50%)' : ''}\n\n`

teks += `📊 *DETAIL BIAYA*\n`
teks += detailBiaya.map(x => `> ↳ ${x}`).join('\n')

teks += `\n\n─━━━━━━━━━━━━━━─\n\n`

teks += `📈 *STATUS PET*\n`
teks += `> ↳ Exp bertambah\n`
teks += `> ↳ 🔋 +20 Energy\n`
teks += `> ↳ 😊 +5 Happy`

if (machines.length) {
  teks += `\n> ↳ ⚙️ ${machines.length} pet mesin dilewati; gunakan *${usedPrefix}pet charge* untuk dayanya.`
}

if(naik.length) {
  teks += `\n\n🎉 *LEVEL UP!*\n`
  teks += naik.map(n => `> ↳ ${pets[n.tipe]?.emoji || '🐾'} ${formatNama(n)} (Lv.${n.level})`).join('\n')
}

teks += `\n\n─━━━━━━━━━━━━━━─`
    return safeReply(teks)
  }

  // === CHARGE PET MESIN ===
 if (action === 'charge') {
  const selected = getSelectedPets(args[1])
  const machines = selected.filter(({ pet }) => isMesin(pet.tipe))

  if (selected.length === 0) return safeReply(
    `╭─❏「 ⚡ PET CHARGE 」❏\n` +
    `│ ❌ *NOMOR PET TIDAK VALID*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Cek daftar pet dengan *${usedPrefix}pet*\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if (machines.length === 0) return safeReply(
    `╭─❏「 ⚡ PET CHARGE 」❏\n` +
    `│ ❌ *BUKAN PET MESIN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Charge hanya untuk pet mesin.\n` +
    `> ↳ Robot, Drone, Cyborg, atau Mecha.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  const biaya = machines.reduce((total, { pet }) => total + 3000 * (pets[pet.tipe]?.rarity === 'SECRET' ? 2 : 1), 0)

  if ((wdb.money[m.sender] || 0) < biaya) return safeReply(
    `╭─❏「 ⚡ PET CHARGE 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh: Rp ${biaya.toLocaleString()}\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], biaya)

  machines.forEach(({ pet }) => {
    pet.energy = 100
    pet.lastCharge = Date.now()
  })

  saveDB(wdb)

  return safeReply(
    `╭─❏「 ⚡ PET CHARGE 」❏\n` +
    `│ ⚡ *CHARGE BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `⚙️ *PET YANG DI-CHARGE*\n` +
    machines.map(({ pet }) => `> ↳ ${pets[pet.tipe].emoji} ${formatNama(pet)}`).join('\n') +
    `\n\n` +

    `─━━━━━━━━━━━━━━─\n\n` +

    `💰 *BIAYA & ENERGY*\n` +
    `> ↳ 💸 Biaya: -Rp ${biaya.toLocaleString()}\n` +
    `> ↳ 🔋 Energy: 100%\n\n` +

    `╰─━━━━━━━━━━━━━━─`
  )
}

// === TRAIN ===
if (action === 'train') {
  if (user.pets.length === 0) return safeReply(
    `╭─❏「 💪 PET TRAIN 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu tidak punya pet.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let cd = getCooldown(300000, user)
  if(cekBuzz()) cd = 0

  let naik = []

  if (user.pets.some(p => Date.now() - (p.lastTrain || 0) < cd)) return safeReply(
    `╭─❏「 💪 PET TRAIN 」❏\n` +
    `│ 💪 *PET MASIH LATIHAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Otot mereka masih sakit. Istirahat dulu.\n` +
    `> ↳ ⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if (user.pets.some(p => (p.energy || 100) < 30 && !['batu','zombie'].includes(p.tipe))) return safeReply(
    `╭─❏「 💪 PET TRAIN 」❏\n` +
    `│ 😵 *ENERGY RENDAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Minimal 30% untuk latihan.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  user.pets.forEach(p => {
    const skill = applySkill(p, 'train')
    let expGain = 60 * getDebuff(p) * (p.tipe === 'skeleton'? 1.5 : 1) + (p.tipe === 'orc'? 10 : 0)
    if(p.tipe === 'vampir' && isMalam) expGain += 20
    if(p.tipe === 'serigala' && isMalam) expGain += 15
    let energyLoss = 30 * (p.tipe === 'zombie'? 0.5 : 1)
    if(p.tipe === 'burung_hantu' && isMalam) energyLoss = 15
    if(skill.noEnergyLoss) energyLoss = 0
    if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
    p.exp += applyPetFestivalExp(expGain)
    if (!skill.keepHappy) p.happy -= 5
    p.dirty = Math.min(100, (p.dirty || 0) + 20)
    p.lastTrain = Date.now()

    if (p.exp >= 100) {
      p.level = (Number(p.level) || 1) + Math.floor(p.exp / 100)
      p.exp %= 100
      naik.push(p)
    }
  })

  saveDB(wdb)

  let teks = `╭─❏「 💪 PET TRAIN 」❏\n`
  teks += `│ 💪 *SESI LATIHAN*\n`
  teks += `╰─━━━━━━━━━━━━━━─\n\n`

  teks += `🏋️ *MELATIH PET*\n`

  if(user.pets.some(p => p.tipe === 'jin')) {
    teks += `> ↳ 🧞 Bonus: Jin mempercepat latihan!\n`
  }

  if(getDebuff(user.pets[0]) < 1) {
    teks += `> ↳ 💩 Debuff: Pet kotor! Exp -${Math.round((1-getDebuff(user.pets[0]))*100)}%\n`
  }

  teks += `\n📊 *STATUS LATIHAN*\n`
  teks += `> ↳ ✨ +60 Exp\n`
  teks += `> ↳ 🔋 -30 Energy\n`
  teks += `> ↳ 😊 -5 Happy\n`
  teks += `> ↳ 🧼 +20 Dirty`

  if(naik.length) {
    teks += `\n\n🎉 *LEVEL UP!*\n`
    teks += naik.map(n => `> ↳ ${pets[n.tipe].emoji} ${formatNama(n)}`).join('\n')
  }

  teks += `\n\n╰─━━━━━━━━━━━━━━─`

  return safeReply(teks)
}

// === WALK ===
if (action === 'walk') {
  if (user.pets.length === 0) return safeReply(
    `╭─❏「 🚶 PET WALK 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu tidak punya pet.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let cd = getCooldown(60000, user)
  if(cekBuzz()) cd = 0

  if (user.pets.some(p => (p.energy || 100) < 20 && !['batu','zombie'].includes(p.tipe))) return safeReply(
    `╭─❏「 🚶 PET WALK 」❏\n` +
    `│ 😵 *KECAPEKAN JALAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${pets['anjing']?.emoji || '🐾'} Pet kamu duduk & ngos-ngosan.\n` +
    `> ↳ 🔋 Isi energy dulu minimal 20%.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if (Date.now() - (user.pets[0].lastActivity || 0) < cd) return safeReply(
    `╭─❏「 🚶 PET WALK 」❏\n` +
    `│ 🚶 *KAKI MASIH PEGEL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet baru aja jalan-jalan. Kasih napas dulu.\n` +
    `> ↳ ⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let naik = []

  user.pets.forEach(p => {
    const skill = applySkill(p, 'walk')
    let expGain = 30 * getDebuff(p) * (p.tipe === 'skeleton'? 1.5 : 1) + (p.tipe === 'orc'? 5 : 0)
    if(p.tipe === 'vampir' && isMalam) expGain += 15
    if(p.tipe === 'serigala' && isMalam) expGain += 10
    let energyLoss = 20 * (p.tipe === 'zombie'? 0.5 : 1)
    if(p.tipe === 'burung_hantu' && isMalam) energyLoss = 10
    if(skill.noEnergyLoss) energyLoss = 0
    if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
    p.exp += applyPetFestivalExp(expGain)
    p.happy = Math.min(100, (p.happy || 50) + 5)
    p.dirty = Math.min(100, (p.dirty || 0) + 15)
    p.lastActivity = Date.now()

    if (p.exp >= 100) {
      p.level = (Number(p.level) || 1) + Math.floor(p.exp / 100)
      p.exp %= 100
      naik.push(p)
    }
  })

  saveDB(wdb)

  let teks = `╭─❏「 🚶 PET WALK 」❏\n`
  teks += `│ 🚶 *JALAN-JALAN BERSAMA*\n`
  teks += `╰─━━━━━━━━━━━━━━─\n\n`

  teks += `🌳 *WALKING*\n`

  if(user.pets.some(p => p.tipe === 'jin')) {
    teks += `> ↳ 🧞 Bonus: Jin membawamu terbang!\n`
  }

  if(user.pets.some(p => p.tipe === 'jack_o_lantern')) {
    teks += `> ↳ 🎃 Bonus: Jack o lantern menerangi jalan!\n`
  }

  if(getDebuff(user.pets[0]) < 1) {
    teks += `> ↳ 💩 Debuff: Pet kotor! Exp -${Math.round((1-getDebuff(user.pets[0]))*100)}%\n`
  }

  teks += `\n📊 *STATUS WALKING*\n`
  teks += `> ↳ ✨ +30 Exp\n`
  teks += `> ↳ 🔋 -20 Energy\n`
  teks += `> ↳ 😊 +5 Happy\n`
  teks += `> ↳ 🧼 +15 Dirty`

  if(naik.length) {
    teks += `\n\n🎉 *LEVEL UP!*\n`
    teks += naik.map(n => `> ↳ ${pets[n.tipe].emoji} ${formatNama(n)}`).join('\n')
  }

  teks += `\n\n╰─━━━━━━━━━━━━━━─`

  return safeReply(teks)
}

// === PLAY ===
if (action === 'play') {
  if (user.pets.length === 0) return safeReply(
    `╭─❏「 🎮 PET PLAY 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu tidak punya pet.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let cd = getCooldown(60000, user)
  if(cekBuzz()) cd = 0

  if (user.pets.some(p => (p.energy || 100) < 20 && !['batu','zombie'].includes(p.tipe))) return safeReply(
    `╭─❏「 🎮 PET PLAY 」❏\n` +
    `│ 🥵 *KEHABISAN TENAGA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${pets['kucing']?.emoji || '🐾'} Pet rebahan minta digendong.\n` +
    `> ↳ 🔋 Kasih rest atau vitamin dulu.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if (Date.now() - (user.pets[0].lastActivity || 0) < cd) return safeReply(
    `╭─❏「 🎮 PET PLAY 」❏\n` +
    `│ 🎮 *KECAPEKAN MAIN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet lagi ngos-ngosan. Ajak main lagi nanti.\n` +
    `> ↳ ⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let naik = []

  user.pets.forEach(p => {
    const skill = applySkill(p, 'play')
    let expGain = 30 * getDebuff(p) * (p.tipe === 'skeleton'? 1.5 : 1)
    if(p.tipe === 'vampir' && isMalam) expGain += 15
    let happyGain = 10 * (p.tipe === 'ghost'? 2 : 1)
    let energyLoss = 20 * (p.tipe === 'zombie'? 0.5 : 1)
    if(p.tipe === 'burung_hantu' && isMalam) energyLoss = 10
    if(p.tipe === 'snowman' && !isMalam) energyLoss = 30
    if(skill.noEnergyLoss) energyLoss = 0
    if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
    p.exp += applyPetFestivalExp(expGain)
    p.happy = Math.min(100, (p.happy || 50) + happyGain)
    p.dirty = Math.min(100, (p.dirty || 0) + 10)
    p.lastActivity = Date.now()

    if (p.exp >= 100) {
      p.level = (Number(p.level) || 1) + Math.floor(p.exp / 100)
      p.exp %= 100
      naik.push(p)
    }
  })

  saveDB(wdb)

  let teks = `╭─❏「 🎮 PET PLAY 」❏\n`
  teks += `│ 🎮 *WAKTU BERMAIN*\n`
  teks += `╰─━━━━━━━━━━━━━━─\n\n`

  teks += `⚽ *PLAYING*\n`

  if(user.pets.some(p => p.tipe === 'ghost')) {
    teks += `> ↳ 👻 Bonus: Ghost membuat suasana lebih seru!\n`
  }

  if(!isMalam && user.pets.some(p => p.tipe === 'snowman')) {
    teks += `> ↳ ⛄ Debuff: Snowman kepanasan! Energy -30\n`
  }

  if(getDebuff(user.pets[0]) < 1) {
    teks += `> ↳ 💩 Debuff: Pet kotor! Exp -${Math.round((1-getDebuff(user.pets[0]))*100)}%\n`
  }

  teks += `\n📊 *STATUS PLAYING*\n`
  teks += `> ↳ ✨ +30 Exp\n`
  teks += `> ↳ 🔋 -20 Energy\n`
  teks += `> ↳ 😊 +10 Happy\n`
  teks += `> ↳ 🧼 +10 Dirty`

  if(naik.length) {
    teks += `\n\n🎉 *LEVEL UP!*\n`
    teks += naik.map(n => `> ↳ ${pets[n.tipe].emoji} ${formatNama(n)}`).join('\n')
  }

  teks += `\n\n╰─━━━━━━━━━━━━━━─`

  return safeReply(teks)
}

  // === REST ===
if (action === 'rest') {
  if (user.pets.length === 0) return safeReply(
    `╭─❏「 😴 PET REST 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu tidak punya pet.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if (user.pets.every(p => p.tipe === 'vampir')) return safeReply(
    `╭─❏「 😴 PET REST 」❏\n` +
    `│ 🧛 *VAMPIR TIDUR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Vampir tidak perlu istirahat.\n` +
    `> ↳ Mereka begadang selamanya.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let cd = getCooldown(600000, user)
  if(cekBuzz()) cd = 0

  if (Date.now() - (user.pets[0].lastRest || 0) < cd) return safeReply(
    `╭─❏「 😴 PET REST 」❏\n` +
    `│ 😴 *MASIH NGANTUK*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet belum bangun tidur. Jangan diganggu.\n` +
    `> ↳ ⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  user.pets.forEach(p => {
    if(p.energy <= 0 && p.tipe === 'phoenix' && p.revive){ p.energy = 100; p.revive = false }
    const restSkill = applySkill(p, 'rest')
    let happyGain = 0 + (p.tipe === 'fairy'? 5 : 0) + (restSkill.happyBonus || 0)
    p.energy = Math.min(100, (p.energy || 100) + 30 + (restSkill.energyBonus || 0))
    p.happy = Math.min(100, (p.happy || 50) + happyGain)
    if (restSkill.keepHappy) p.happy = Math.max(p.happy, 100)
    p.dirty = Math.min(100, (p.dirty || 0) + 5)
    p.lastRest = Date.now()
  })

  saveDB(wdb)

  return safeReply(
    `╭─❏「 😴 PET REST 」❏\n` +
    `│ 😴 *WAKTU ISTIRAHAT*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `🛏️ *RESTING*\n` +
    `> ↳ 🔋 +30 Energy\n` +
    `> ↳ 🧼 +5 Dirty\n\n` +

    `╰─━━━━━━━━━━━━━━─`
  )
}

// === CLEAN ===
if (action === 'clean') {
  const selected = getSelectedPets(args[1])

  if (selected.length === 0) return safeReply(
    `╭─❏「 🧼 PET CLEAN 」❏\n` +
    `│ ❌ *NOMOR PET TIDAK VALID*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Cek daftar pet dengan *${usedPrefix}pet*\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let biaya = 2000 * selected.length

  if ((wdb.money[m.sender] || 0) < biaya) return safeReply(
    `╭─❏「 🧼 PET CLEAN 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh: Rp ${biaya.toLocaleString()} untuk sabun + sampo.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if(selected.every(({ pet }) => (pet.dirty || 0) === 0)) return safeReply(
    `╭─❏「 🧼 PET CLEAN 」❏\n` +
    `│ ✨ *SUDAH BERSIH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet yang dipilih sudah bersih!\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], biaya)
  selected.forEach(({ pet }) => {
    pet.dirty = 0
    pet.happy = Math.min(100, (pet.happy || 50) + 10)
  })

  saveDB(wdb)

  return safeReply(
    `╭─❏「 🧼 PET CLEAN 」❏\n` +
    `│ 🧼 *WAKTU MANDI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `🛁 *MEMBERSIHKAN PET*\n` +
    `> ↳ 💰 Biaya: -Rp ${biaya.toLocaleString()}\n` +
    `> ↳ 🧼 Status: Semua pet bersih!\n` +
    `> ↳ 😊 +10 Happy\n\n` +

    `╰─━━━━━━━━━━━━━━─`
  )
}

// === HEAL ===
if (action === 'heal') {
  if (user.pets.length === 0) return safeReply(
    `╭─❏「 💊 PET HEAL 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu tidak punya pet.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let target = args[1]

  if(!target) return safeReply(
    `╭─❏「 💊 PET HEAL 」❏\n` +
    `│ ❌ *FORMAT SALAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: *${usedPrefix}pet heal 1*\n` +
    `> ↳ Atau: *${usedPrefix}pet heal kucing*\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let p = !isNaN(target)
    ? user.pets[parseInt(target)-1]
    : user.pets.find(x => x.tipe === target.replace(/ /g,'_'))

  if(!p) return safeReply(
    `╭─❏「 💊 PET HEAL 」❏\n` +
    `│ ❌ *PET TIDAK DITEMUKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet yang kamu cari tidak ditemukan.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let biaya = 5000 * p.level

  if ((wdb.money[m.sender] || 0) < biaya) return safeReply(
    `╭─❏「 💊 PET HEAL 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh: Rp ${biaya.toLocaleString()}\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], biaya)
  p.energy = 100
  p.happy = 100
  p.dirty = 0

  saveDB(wdb)

  return safeReply(
    `╭─❏「 💊 PET HEAL 」❏\n` +
    `│ 💊 *WAKTU PENGOBATAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `🏥 *MENYEMBUHKAN PET*\n` +
    `> ↳ ${pets[p.tipe].emoji} *${formatNama(p).toUpperCase()}*\n\n` +

    `📊 *STATUS PET*\n` +
    `> ↳ 🔋 Energy: 100%\n` +
    `> ↳ 😊 Happy: 100%\n` +
    `> ↳ 🧼 Bersih\n\n` +

    `💰 *BIAYA*\n` +
    `> ↳ -Rp ${biaya.toLocaleString()}\n\n` +

    `╰─━━━━━━━━━━━━━━─`
  )
}

// === GIFT ===
if (action === 'gift') {
  if (user.pets.length === 0) return safeReply(
    `╭─❏「 🎁 PET GIFT 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu tidak punya pet.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let target = args[1]
  let item = args[2]?.toLowerCase()

  if(!target || !item) return safeReply(
    `╭─❏「 🎁 PET GIFT 」❏\n` +
    `│ ❌ *FORMAT SALAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: *${usedPrefix}pet gift 1 snack*\n` +
    `> ↳ Item: snack, mainan, vitamin\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let p = !isNaN(target)
    ? user.pets[parseInt(target)-1]
    : user.pets.find(x => x.tipe === target.replace(/ /g,'_'))

  if(!p) return safeReply(
    `╭─❏「 🎁 PET GIFT 」❏\n` +
    `│ ❌ *PET TIDAK DITEMUKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet yang kamu cari tidak ditemukan.\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if(item === 'snack'){
    if((wdb.money[m.sender] || 0) < 3000) return safeReply(
      `╭─❏「 🎁 PET GIFT 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh: Rp 3,000\n\n` +
      `╰─━━━━━━━━━━━━━━─`
    )

    wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], 3000)
    p.happy = Math.min(100, (p.happy || 50) + 15)
    saveDB(wdb)

    return safeReply(
      `╭─❏「 🎁 PET GIFT 」❏\n` +
      `│ 🍖 *MEMBERI HADIAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `🐾 *${pets[p.tipe].emoji} ${formatNama(p).toUpperCase()}*\n` +
      `> ↳ 😊 +15 Happy\n` +
      `> ↳ 💰 Biaya: -Rp 3,000\n\n` +

      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if(item === 'mainan'){
    if((wdb.money[m.sender] || 0) < 10000) return safeReply(
      `╭─❏「 🎁 PET GIFT 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh: Rp 10,000\n\n` +
      `╰─━━━━━━━━━━━━━━─`
    )

    wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], 10000)
    p.happy = Math.min(100, (p.happy || 50) + 30)
    p.exp += applyPetFestivalExp(10)
    saveDB(wdb)

    return safeReply(
      `╭─❏「 🎁 PET GIFT 」❏\n` +
      `│ 🧸 *MEMBERI HADIAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `🐾 *${pets[p.tipe].emoji} ${formatNama(p).toUpperCase()}*\n` +
      `> ↳ 😊 +30 Happy\n` +
      `> ↳ ✨ +10 Exp\n` +
      `> ↳ 💰 Biaya: -Rp 10,000\n\n` +

      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if(item === 'vitamin'){
    if((wdb.money[m.sender] || 0) < 15000) return safeReply(
      `╭─❏「 🎁 PET GIFT 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh: Rp 15,000\n\n` +
      `─━━━━━━━━━━━━━━─`
    )

    wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], 15000)
    p.energy = Math.min(100, (p.energy || 100) + 40)
    saveDB(wdb)

    return safeReply(
      `╭─❏「 🎁 PET GIFT 」❏\n` +
      `│ 💊 *MEMBERI HADIAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `🐾 *${pets[p.tipe].emoji} ${formatNama(p).toUpperCase()}*\n` +
      `> ↳ 🔋 +40 Energy\n` +
      `> ↳ 💰 Biaya: -Rp 15,000\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  return safeReply(
    `╭─❏「 🎁 PET GIFT 」❏\n` +
    `│ ❌ *ITEM TIDAK ADA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pilih: snack, mainan, vitamin\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

// === RENAME ===
if (action === 'rename') {
  if (user.pets.length === 0) return safeReply(
    `╭─❏「 🏷️ PET RENAME 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu tidak punya pet.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let target = args[1]
  let namaBaru = args.slice(2).join(' ')

  if(!target || !namaBaru) return safeReply(
    `╭─❏「 🏷️ PET RENAME 」❏\n` +
    `│ ❌ *FORMAT SALAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: *${usedPrefix}pet rename 1 SiBulat*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let p = !isNaN(target)
    ? user.pets[parseInt(target)-1]
    : user.pets.find(x => x.tipe === target.replace(/ /g,'_'))

  if(!p) return safeReply(
    `╭─❏「 🏷️ PET RENAME 」❏\n` +
    `│ ❌ *PET TIDAK DITEMUKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet yang kamu cari tidak ditemukan.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  if(namaBaru.length > 15) return safeReply(
    `╭─❏「 🏷️ PET RENAME 」❏\n` +
    `│ ❌ *NAMA KEPANJANGAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Maksimal 15 karakter.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  p.nickname = namaBaru
  saveDB(wdb)

  return safeReply(
    `╭─❏「 🏷️ PET RENAME 」❏\n` +
    `│ 🏷️ *GANTI NAMA PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `🐾 *${pets[p.tipe].emoji} ${formatNama(p).toUpperCase()}*\n` +
    `> ↳ Nama baru: *${namaBaru}*\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

// === RELEASE ===
if (action === 'release') {
  let petName = args.slice(1).join(' ').toLowerCase()

  if (!petName) return safeReply(
    `╭─❏「 💔 PET RELEASE 」❏\n` +
    `│ ❌ *FORMAT SALAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: *${usedPrefix}pet release kucing*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  const resolvedReleaseType = resolvePetType(petName)
  if (resolvedReleaseType) petName = resolvedReleaseType
  else petName = petName.replace(/ /g, '_').replace(/-/g, '_')

  let index = user.pets.findIndex(p => p.tipe === petName)

  if (index === -1) return safeReply(
    `╭─❏「 💔 PET RELEASE 」❏\n` +
    `│ ❌ *PET TIDAK DITEMUKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet yang kamu cari tidak ditemukan.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let refund = Math.floor(pets[petName].harga * 0.5)
  wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], refund)
  user.pets.splice(index, 1)
  saveDB(wdb)

  return safeReply(
    `╭─❏「 💔 PET RELEASE 」❏\n` +
    `│ 💔 *MELEPASKAN PET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `🐾 *${pets[petName].emoji} ${formatNamaAsli(petName).toUpperCase()}*\n` +
    `> ↳ 💰 Refund: +Rp ${refund.toLocaleString()}\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

// === SELL ===
if (action === 'sell') {
  const pending = getPending()

  if (['yes', 'no'].includes(args[1]?.toLowerCase())) {
    if (!pending || pending.action !== 'sell') return safeReply(
      `╭─❏「 💸 PET SELL 」❏\n` +
      `│ ❌ *TIDAK ADA PENJUALAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tidak ada penjualan yang menunggu konfirmasi.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )

    delete user.pendingPetAction

    if (args[1].toLowerCase() === 'no') return safeReply(
      `╭─❏「 💸 PET SELL 」❏\n` +
      `│ ✅ *PENJUALAN DIBATALKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Penjualan pet dibatalkan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  } else {
    const selected = getSelectedPets(args[1], false)

    if (selected.length === 0) return safeReply(
      `╭─❏「 💸 PET SELL 」❏\n` +
      `│ ❌ *PET TIDAK DIPILIH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pilih pet dengan nomor atau all.\n` +
      `> ↳ Contoh: *${usedPrefix}pet sell 1*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )

    user.pendingPetAction = {
      action: 'sell',
      indexes: selected.map(({ index }) => index),
      expires: Date.now() + RPG_CONFIRMATION_TTL
    }

    return safeReply(
      `╭─❏「 💸 PET SELL 」❏\n` +
      `│ ⚠️ *KONFIRMASI PENJUALAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Jual ${selected.length} pet?\n` +
      `> ↳ Ketik *${usedPrefix}pet sell yes* untuk lanjut.\n` +
      `> ↳ Ketik *${usedPrefix}pet sell no* untuk batal.\n` +
      `> ↳ Konfirmasi berlaku 5 menit.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const selected = pending.indexes.filter(index => user.pets[index])
  let total = 0
  const sold = []

  selected.sort((a, b) => b - a).forEach(idx => {
    const p = user.pets[idx]
    const hargaJual = Math.floor(
      pets[p.tipe].harga *
      0.7 *
      (Math.floor(p.level / 50) + 1) *
      (user.pets.some(x => x.tipe === 'sphinx') ? 1.2 : 1)
    )

    total += hargaJual
    sold.push(`${pets[p.tipe].emoji} ${formatNama(p)}`)
    user.pets.splice(idx, 1)
  })

  wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], total)
  saveDB(wdb)

  return safeReply(
    `╭─❏「 💸 PET SELL 」❏\n` +
    `│ 💸 *PENJUALAN BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `🐾 *PET TERJUAL*\n` +
    sold.map(v => `> ↳ ${v}`).join('\n') +
    `\n\n` +

    `─━━━━━━━━━━━━━━─\n\n` +

    `💰 *HASIL PENJUALAN*\n` +
    `> ↳ Total: +Rp ${total.toLocaleString()}\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

  // === BREED ===
if (action === 'breed') {
  if(user.pets.length >= maxPetSlots) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *PET PENUH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Max ${maxPetSlots} pet.\n` +
    `> ↳ Release/Sell/Kill/Transfer dulu\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let cd = cekCD('petbreed', 86400000)
  if(cd > 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu ${Math.floor(cd/3600)} jam lagi\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let pet1 = args[1]
  let pet2 = args[2]
  if(!pet1 ||!pet2) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *FORMAT SALAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: .pet breed 1 2\n` +
    `> ↳ Harus 2 pet spesies sama\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  const idx1 = !isNaN(pet1) ? parseInt(pet1) - 1 : user.pets.findIndex(x => x.tipe === pet1.replace(/ /g, '_'))
  const idx2 = !isNaN(pet2) ? parseInt(pet2) - 1 : (typeof user.pets.findLastIndex === 'function' ? user.pets.findLastIndex(x => x.tipe === pet2.replace(/ /g, '_')) : user.pets.map(x => x.tipe).lastIndexOf(pet2.replace(/ /g, '_')))

  let p1 = user.pets[idx1]
  let p2 = user.pets[idx2]

  if(!p1 || !p2) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *PET TIDAK DITEMUKAN*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if(idx1 === idx2 || p1 === p2) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *DUA PET BERBEDA DIBUTUHKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu harus memilih 2 ekor pet yang berbeda untuk dikawinkan.\n` +
    `> ↳ Contoh: .pet breed 1 2\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  if(p1.tipe!== p2.tipe) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *SPESIES BERBEDA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Breed hanya bisa sesama jenis\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  if((p1.energy || 100) < 50 || (p2.energy || 100) < 50) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *ENERGY KURANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Minimal 50% untuk breed\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let biaya = 100000
  if ((wdb.money[m.sender] || 0) < biaya) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh Rp ${biaya.toLocaleString()}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], biaya)
  p1.energy -= 50; p2.energy -= 50
  let berhasil = Math.random() < 0.5

  user.cooldown.petbreed = Date.now()
  saveDB(wdb)

  if(berhasil){
    user.pets.push({ tipe: p1.tipe, level: 1, exp: 0, energy: 100, happy: 50, dirty: 0, nickname: null, lastFeed: 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    saveDB(wdb)

    return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ 💕 *BREED BERHASIL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${pets[p1.tipe].emoji} *${formatNamaAsli(p1.tipe).toUpperCase()}* + ${pets[p2.tipe].emoji} *${formatNamaAsli(p2.tipe).toUpperCase()}*\n` +
      `> ↳ 🎉 Dapat bayi baru!\n\n` +
      `💰 *BIAYA BREED*\n` +
      `> ↳ -Rp ${biaya.toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  } else {
    return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ 💔 *BREED GAGAL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${pets[p1.tipe].emoji} *${formatNamaAsli(p1.tipe).toUpperCase()}* + ${pets[p2.tipe].emoji} *${formatNamaAsli(p2.tipe).toUpperCase()}*\n` +
      `> ↳ 😢 Tidak dapat keturunan\n\n` +
      `💰 *BIAYA BREED*\n` +
      `> ↳ -Rp ${biaya.toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
}


// === BATTLE ===
if (action === 'battle') {
  let cd = cekCD('petbattle', 300000)
  if(cd > 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ⏰ *MASIH CAFEK BATTLE*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu ${Math.floor(cd/60)} menit ${cd%60} detik lagi\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let target = m.mentionedJid[0] || m.quoted?.sender
  if(!target) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *TAG TARGET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: .pet battle @tag 50000\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  if(target === m.sender) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *TIDAK BISA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Ga bisa battle sama diri sendiri\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let dataTarget = getUserRPG(wdb, target)
  let userTarget = dataTarget.rpg
  if(!userTarget.pets) userTarget.pets = []

  if(userTarget.pets.length === 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *TARGET TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if(user.pets.length === 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *KAMU TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let myPet = [...user.pets].sort((a,b) => b.level - a.level || b.exp - a.exp)[0]
  let enemyPet = [...userTarget.pets].sort((a,b) => b.level - a.level || b.exp - a.exp)[0]
  let idxA = user.pets.indexOf(myPet)
  let idxB = userTarget.pets.indexOf(enemyPet)

  if((myPet.energy || 100) < 20) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *ENERGY RENDAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet ${formatNama(myPet)} energy < 20%\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  if((enemyPet.energy || 100) < 20) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *ENERGY TARGET RENDAH*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  const betArg = args[1] && (args[1].startsWith('@') || args[1].includes('@')) ? args[2] : (args[2] || args[1])
  let taruhan = betArg === undefined || betArg === '0' ? 0 : parseRpgMoneyAmount(betArg)
  if (taruhan === null) return m.reply('❌ Nominal taruhan tidak valid. Gunakan nominal angka atau suffix seperti 1M.')
  let uangUser = wdb.money[m.sender] || 0
  let uangTarget = wdb.money[target] || 0

  if(taruhan > 0){
    if(taruhan < 1000) return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ ❌ *MINIMAL TARUHAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Rp 1,000\n\n` +
      `─━━━━━━━━━━━━━━─`
    )

    if (compareRpgMoney(uangUser, taruhan) < 0) return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ ❌ *UANG KAMU KURANG*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )

    if (compareRpgMoney(uangTarget, taruhan) < 0) return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ ❌ *UANG TARGET KURANG*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  let powerA = myPet.level * 10 + myPet.exp + Math.floor(Math.random() * 50)
  let skillA = applySkill(myPet, 'battle')
  powerA = Math.floor(powerA * skillA.multi)
  powerA += (skillA.powerBonus || 0) + (skillA.damageBonus || 0)

  let powerB = enemyPet.level * 10 + enemyPet.exp + Math.floor(Math.random() * 50)
  let skillB = applySkill(enemyPet, 'battle')
  powerB = Math.floor(powerB * skillB.multi)
  powerB += (skillB.powerBonus || 0) + (skillB.damageBonus || 0)

  if(myPet.tipe === 'vampir' && isMalam) powerA += 30
  if(enemyPet.tipe === 'vampir' && isMalam) powerB += 30
  if(myPet.tipe === 'SCP_173') powerA = 999
  if(enemyPet.tipe === 'SCP_173') powerB = 999

  user.pets[idxA].energy = Math.max(0, (myPet.energy || 100) - 20)
  userTarget.pets[idxB].energy = Math.max(0, (enemyPet.energy || 100) - 20)

  let cap = `╭─❏「 🐾 AVELIA PET CENTER 」❏\n`
  cap += `│ ⚔️ *PET BATTLE*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `👤 *PESERTA BATTLE*\n`
  cap += `> ↳ @${m.sender.split('@')[0]}\n`
  cap += `> ↳ ${pets[myPet.tipe].emoji} ${formatNama(myPet)} Lv.${myPet.level}\n`
  cap += `> ↳ Power: ${powerA}\n\n`

  cap += `⚔️ *VS*\n\n`

  cap += `> ↳ @${target.split('@')[0]}\n`
  cap += `> ↳ ${pets[enemyPet.tipe].emoji} ${formatNama(enemyPet)} Lv.${enemyPet.level}\n`
  cap += `> ↳ Power: ${powerB}\n`

  if(taruhan > 0) cap += `\n💰 *TARUHAN*\n> ↳ Rp ${taruhan.toLocaleString()}\n`

  if(powerA > powerB){
    if(taruhan > 0){ wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], taruhan); wdb.money[target] = subtractRpgMoney(wdb.money[target], taruhan) }
    user.pets[idxA].exp += 40; userTarget.pets[idxB].exp += 10

    if(user.pets[idxA].exp >= 100){
      user.pets[idxA].level = (Number(user.pets[idxA].level) || 1) + Math.floor(user.pets[idxA].exp / 100)
      user.pets[idxA].exp %= 100
      cap += `\n🎉 *LEVEL UP!*\n`
      cap += `> ↳ ${formatNama(myPet)}\n`
    }

    cap += `\n🏆 *PEMENANG*\n`
    cap += `> ↳ @${m.sender.split('@')[0]}\n`
    cap += `> ↳ +40 Exp`

    if(taruhan > 0) cap += `\n> ↳ +Rp ${taruhan.toLocaleString()}`
  } else if(powerB > powerA){
    if(taruhan > 0){ wdb.money[target] = addRpgMoney(wdb.money[target], taruhan); wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], taruhan) }
    userTarget.pets[idxB].exp += 40; user.pets[idxA].exp += 10

    if(userTarget.pets[idxB].exp >= 100){
      userTarget.pets[idxB].level = (Number(userTarget.pets[idxB].level) || 1) + Math.floor(userTarget.pets[idxB].exp / 100)
      userTarget.pets[idxB].exp %= 100
      cap += `\n🎉 *LEVEL UP!*\n`
      cap += `> ↳ ${formatNama(enemyPet)}\n`
    }

    cap += `\n🏆 *PEMENANG*\n`
    cap += `> ↳ @${target.split('@')[0]}\n`
    cap += `> ↳ +40 Exp`

    if(taruhan > 0) cap += `\n> ↳ +Rp ${taruhan.toLocaleString()}`
  } else {
    user.pets[idxA].exp += 20
    userTarget.pets[idxB].exp += 20
    if(user.pets[idxA].exp >= 100){
      user.pets[idxA].level = (Number(user.pets[idxA].level) || 1) + Math.floor(user.pets[idxA].exp / 100)
      user.pets[idxA].exp %= 100
    }
    if(userTarget.pets[idxB].exp >= 100){
      userTarget.pets[idxB].level = (Number(userTarget.pets[idxB].level) || 1) + Math.floor(userTarget.pets[idxB].exp / 100)
      userTarget.pets[idxB].exp %= 100
    }
    cap += `\n🤝 *HASIL: SERI*\n`
    cap += `> ↳ +20 Exp untuk keduanya`
  }

  cap += `\n\n─━━━━━━━━━━━━━━─`

  user.cooldown.petbattle = Date.now()
  saveDB(wdb)
  return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/54b79a9952b0.jpeg', { mentions: [m.sender, target] })
}


// === HUNT ===
if (action === 'hunt') {
  let cd = cekCD('pethunt', 600000)

  if(cd > 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ⏰ *MASIH CAFEK BERBURU*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu ${Math.floor(cd/60)} menit lagi\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  if(user.pets.length === 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if(user.pets.some(p => (p.energy || 100) < 40)) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *ENERGY KURANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Minimal 40%\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let hasil = Math.floor(Math.random() * 50000) + 10000
  let exp = Math.floor(Math.random() * 30) + 10
  let huntMoneyMulti = user.pets.reduce((acc, p) => acc * (applySkill(p, 'hunt').moneyMulti || 1), 1)

  hasil = totemIncome(Math.floor(hasil * huntMoneyMulti))
  wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], hasil)

  user.pets.forEach(p => {
    let skill = applySkill(p, 'hunt')
    let expGain = exp * skill.multi * getDebuff(p)
    p.exp += applyPetFestivalExp(expGain)
    p.energy -= 40
    if (p.exp >= 100) { p.level = (Number(p.level) || 1) + Math.floor(p.exp / 100); p.exp %= 100 }
  })

  user.cooldown.pethunt = Date.now()
  saveDB(wdb)

  return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ 🎯 *PET HUNT*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🏹 *BERBURU BERSAMA*\n` +
    `> ↳ 💰 Hasil: +Rp ${hasil.toLocaleString()}\n` +
    `> ↳ 📊 Exp: +${exp} untuk semua pet\n` +
    `> ↳ 🔋 Energy: -40\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}


// === DISPATCH ===
if (action === 'dispatch') {
  const dispatchAction = args[1]?.toLowerCase()
  const pendingDispatches = getPendingPetDispatches()

  if (dispatchAction === 'info') {
    if (!pendingDispatches.length) return safeReply('📦 Tidak ada dispatch aktif. Kirim pet dengan *.pet dispatch*.')
    const now = Date.now()
    const status = pendingDispatches.map((dispatch, index) => {
      const remaining = Math.max(0, Number(dispatch.readyAt) - now)
      if (!remaining) return `${index + 1}. ✅ Siap diklaim: ${formatRpgMoney(dispatch.money || 0)}`
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      return `${index + 1}. ⏳ ${minutes} menit ${seconds} detik lagi`
    }).join('\n')
    return safeReply(`📦 *DISPATCH TERSIMPAN (${pendingDispatches.length})*\n${status}\n\nKetik *${usedPrefix}pet dispatch collect* untuk mengambil hasil yang selesai.`)
  }

  if (dispatchAction === 'collect') {
    if (!pendingDispatches.length) return safeReply('📦 Tidak ada hasil dispatch untuk diklaim.')
    const now = Date.now()
    const completedDispatches = pendingDispatches.filter(dispatch => Number(dispatch.readyAt) <= now)
    if (!completedDispatches.length) return safeReply(`⏳ Dispatch belum selesai. Cek *${usedPrefix}pet dispatch info* untuk melihat durasinya.`)
    const hasil = completedDispatches.reduce((total, dispatch) => addRpgMoney(total, dispatch.money || 0), 0)
    const remainingDispatches = pendingDispatches.filter(dispatch => Number(dispatch.readyAt) > now)
    if (remainingDispatches.length) user.pendingPetDispatch = remainingDispatches
    else delete user.pendingPetDispatch
    wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], hasil)
    saveDB(wdb)
    return safeReply(`✅ *DISPATCH DIKLAIM*\n${completedDispatches.length} hasil dispatch diambil. Total: +${formatRpgMoney(hasil)}.${remainingDispatches.length ? `\n📦 ${remainingDispatches.length} dispatch masih berlangsung; cek dengan *${usedPrefix}pet dispatch info*.` : ''}`)
  }

  if (pendingDispatches.length) return safeReply(`📦 Dispatch masih tersimpan. Cek *${usedPrefix}pet dispatch info* atau klaim dengan *${usedPrefix}pet dispatch collect*.`)
  let cd = cekCD('petdispatch', 1800000)

  if(cd > 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ⏰ *PET MASIH MISI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu ${Math.ceil(cd/60)} menit lagi\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  if(user.pets.length === 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  const now = Date.now()
  const hasil = totemIncome(Math.floor(Math.random() * 100000) + 50000)
  user.cooldown.petdispatch = now
  user.pendingPetDispatch = [{ startedAt: now, readyAt: now + 1800000, money: hasil }]
  saveDB(wdb)

  return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ 📤 *KIRIM MISI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🚚 *PET BERANGKAT*\n` +
    `> ↳ ⏱️ Durasi: 30 menit\n` +
    `> ↳ Hasil diambil dengan *${usedPrefix}pet dispatch collect*\n` +
    `> ↳ Cek waktu dengan *${usedPrefix}pet dispatch info*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  // === KILL ===
if (action === 'kill') {
  const pending = getPending()

  if (['yes', 'no'].includes(args[1]?.toLowerCase())) {
    if (!pending || pending.action !== 'kill') return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ ❌ *TIDAK ADA KONFIRMASI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tidak ada pembunuhan yang menunggu konfirmasi.`
    )

    delete user.pendingPetAction

    if (args[1].toLowerCase() === 'no') return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ ✅ *PEMBUNUHAN DIBATALKAN*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  } else {
    const selected = getSelectedPets(args[1], false)

    if (selected.length === 0) return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ ❌ *PET TIDAK DIPILIH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pilih pet dengan nomor atau all.\n` +
      `> ↳ Contoh: .pet kill 1`
    )

    user.pendingPetAction = {
      action: 'kill',
      indexes: selected.map(({ index }) => index),
      expires: Date.now() + RPG_CONFIRMATION_TTL
    }

    return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ ⚠️ *KONFIRMASI PEMBUNUHAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Bunuh ${selected.length} pet?\n\n` +
      `📌 *KONFIRMASI*\n` +
      `> ↳ Ketik *.pet kill yes* untuk lanjut\n` +
      `> ↳ Ketik *.pet kill no* untuk batal\n` +
      `> ↳ Konfirmasi berlaku 5 menit.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const selected = pending.indexes.filter(index => user.pets[index])
  const killed = []

  selected.sort((a, b) => b - a).forEach(idx => {
    const p = user.pets[idx]
    killed.push(`${pets[p.tipe].emoji} ${formatNama(p)}`)
    user.sanctuary.push({ ...p, mati: Date.now() })
    user.pets.splice(idx, 1)
  })

  saveDB(wdb)

  return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ☠️ *PET DIBUNUH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📋 *PET YANG DIBUNUH*\n` +
    killed.map(x => `> ↳ ${x}`).join('\n') +
    `\n\n` +
    `📦 *STATUS*\n` +
    `> ↳ Masuk sanctuary dan bisa direvive.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}


// === TRANSFER ===
if (action === 'transfer') {
  const transferStore = wdb.temp.petTransfers || (wdb.temp.petTransfers = {})
  const currentSender = normalizeJid(m.sender)
  const now = Date.now()
  for (const [recipient, transfer] of Object.entries(transferStore)) {
    if (!transfer?.expires || transfer.expires <= now) delete transferStore[recipient]
  }
  const decision = args[1]?.toLowerCase()

  if (decision === 'terima' || decision === 'tolak') {
    const pendingTransfer = transferStore[currentSender]
    if (!pendingTransfer) {
      saveDB(wdb)
      return safeReply('❌ Tidak ada transfer pet yang menunggu konfirmasi atau waktunya sudah habis.')
    }

    delete transferStore[currentSender]
    if (decision === 'tolak') {
      saveDB(wdb)
      return safeReply(`❌ Transfer ${formatNama(pendingTransfer.pet)} ditolak.`)
    }

    const senderData = getUserRPG(wdb, pendingTransfer.from)
    const senderPets = senderData?.rpg?.pets || []
    const transferredIndex = senderPets.findIndex(pet => JSON.stringify(pet) === JSON.stringify(pendingTransfer.pet))
    if (senderData?.isDummy || transferredIndex < 0) {
      saveDB(wdb)
      return safeReply('❌ Transfer gagal karena pet sudah tidak dimiliki pengirim atau datanya berubah.')
    }

    if (user.pets.length >= maxPetSlots) {
      saveDB(wdb)
      return safeReply(`❌ Slot pet kamu sudah penuh! Maksimal ${maxPetSlots} pet.`)
    }

    user.pets.push(senderPets.splice(transferredIndex, 1)[0])
    saveDB(wdb)
    return safeReply(
      `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
      `│ ✅ *TRANSFER DITERIMA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${pets[pendingTransfer.pet.tipe]?.emoji || '🐾'} *${formatNama(pendingTransfer.pet)}*\n` +
      `> ↳ Pet berhasil masuk ke koleksimu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const target = normalizeJid(m.mentionedJid?.[0] || m.quoted?.sender)
  const petInput = args.slice(2).join(' ')
  const petIndex = /^\d+$/.test(petInput)
    ? Number(petInput) - 1
    : (() => {
        const petType = resolvePetType(petInput)
        return petType ? user.pets.findIndex(pet => pet.tipe === petType) : -1
      })()

  if (!target || !petInput) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *FORMAT SALAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: .pet transfer @tag 1\n` +
    `> ↳ Bisa juga reply pesan user.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  if (target === currentSender) return safeReply('❌ Kamu tidak bisa mentransfer pet ke diri sendiri.')
  if (petIndex < 0) return safeReply('❌ Pet tidak ditemukan. Gunakan nomor dari daftar pet atau nama/alias pet yang kamu miliki.')

  const targetData = getUserRPG(wdb, target)
  if (targetData?.isDummy || !targetData?.rpg) return safeReply('❌ Penerima belum terdaftar di RPG.')
  if (transferStore[target]) return safeReply('❌ Penerima masih memiliki transfer pet yang belum diputuskan. Tunggu 5 menit sampai request lama batal, atau minta penerima mengetik terima/tolak.')

  const pet = user.pets[petIndex]
  transferStore[target] = {
    from: currentSender,
    pet: JSON.parse(JSON.stringify(pet)),
    expires: Date.now() + RPG_CONFIRMATION_TTL
  }
  saveDB(wdb)

  return safeReply(
    `✅ Permintaan transfer ${formatNama(pet)} telah dikirim ke @${target.split('@')[0]}.\n` +
    `Pet baru berpindah setelah penerima mengetik *.pet transfer terima*.\n` +
    `Permintaan berlaku selama 5 menit.`,
    { mentions: [target] }
  )
}


// === PLAYWITH ===
if (action === 'playwith') {
  let target = m.mentionedJid[0] || m.quoted?.sender

  if(!target) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *TAG/REPLY TARGET*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: .pet playwith @tag\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let dataTarget = getUserRPG(wdb, target)

  if(!dataTarget.rpg.pets || dataTarget.rpg.pets.length === 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *TARGET TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if(user.pets.length === 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *KAMU TIDAK PUNYA PET*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let myPet = user.pets[0]
  let targetPet = dataTarget.rpg.pets[0]

  myPet.happy = Math.min(100, (myPet.happy || 50) + 20)
  targetPet.happy = Math.min(100, (targetPet.happy || 50) + 20)

  saveDB(wdb)

  return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ 🎾 *PLAY TOGETHER*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${pets[myPet.tipe].emoji} *${formatNama(myPet)}* + ${pets[targetPet.tipe].emoji} *${formatNama(targetPet)}*\n\n` +
    `📊 *STATUS*\n` +
    `> ↳ +20 Happy untuk keduanya\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}


// === SANCTUARY ===
if (action === 'sanctuary'){
  if(!user.sanctuary || user.sanctuary.length === 0) return safeReply(
    `╭─❏「 ⚰️ SANCTUARY 」❏\n` +
    `│ 🌸 *SANCTUARY KOSONG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Belum ada pet yg gugur di medan perang.\n` +
    `> ↳ Selalu jaga energy mereka ya`
  )

  let cap = `╭─❏「 ⚰️ SANCTUARY 」❏\n`
  cap += `│ ⚰️ *DAFTAR PET DI SANCTUARY*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  user.sanctuary.forEach((p,i) => {
    cap += `*${i+1}. ${pets[p.tipe].emoji} ${formatNama(p)}*\n`
    cap += `> ↳ Lv.${p.level}\n`
  })

  cap += `\n─━━━━━━━━━━━━━━─\n\n`
  cap += `📌 *CARA REVIVE*\n`
  cap += `> ↳ .pet revive <no/all> — Gratis jika punya malaikat\n\n`
  cap += `─━━━━━━━━━━━━━━─`

  return safeReply(cap)
}


// === REVIVE ===
if (action === 'revive'){
  if(user.pets.some(x => x.tipe === 'malaikat')){
    const maxReviveCount = maxPetSlots - user.pets.length
    if (maxReviveCount <= 0) return safeReply(`❌ Slot pet kamu sudah penuh! Maksimal ${maxPetSlots} pet.`)

    const indexes = args[1]?.toLowerCase() === 'all'
      ? user.sanctuary.map((_, index) => index).slice(0, maxReviveCount)
      : [parseInt(args[1]) - 1]

    const revived = indexes
      .filter(index => user.sanctuary[index])
      .sort((a, b) => b - a)
      .map(index => user.sanctuary.splice(index, 1)[0])

    if(!revived.length) return safeReply(
      `╭─❏「 ⚰️ SANCTUARY 」❏\n` +
      `│ 👻 *GAK ADA ARWAH DI SINI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Nomor yg kamu pilih kosong`
    )

    user.pets.push(...revived.map(p => ({ ...p, energy: 100, mati: undefined })))
    saveDB(wdb)

    return safeReply(
      `╭─❏「 ⚰️ SANCTUARY 」❏\n` +
      `│ ✨ *PET DIHIDUPKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${revived.length} pet dihidupkan oleh Malaikat!`
    )
  }

  return safeReply(
    `╭─❏「 ⚰️ SANCTUARY 」❏\n` +
    `│ ❌ *REVIVE GAGAL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh pet Malaikat untuk revive gratis`
  )
}


// === LEADERBOARD ===
if (action === 'lb'){
  let all = filterLeaderboardUsers(Object.entries(wdb.users), conn, ([jid]) => jid)
    .filter(([_,u]) => u.rpg?.pets?.length)

  if(all.length === 0) return safeReply(
    `╭─❏「 🏆 TOP 10 PET TRAINER 」❏\n` +
    `│ 📝 *BELUM ADA PET TRAINER*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Belum ada yg punya pet`
  )

  all.sort((a,b) => {
    let pa = a[1].rpg.pets.reduce((x,y) => x + y.level, 0)
    let pb = b[1].rpg.pets.reduce((x,y) => x + y.level, 0)
    return pb - pa
  })

  let cap = `╭─❏「 🏆 TOP 10 PET TRAINER 」❏\n`
  cap += `│ 🏆 *LEADERBOARD PET*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  let mention = []

  all.slice(0,10).forEach(([jid,u],i) => {
    const identity = getLeaderboardUserIdentity(jid, { conn, groupMetadata })
    let totalLv = u.rpg.pets.reduce((x,y) => x + y.level, 0)
    let totalPet = u.rpg.pets.length

    cap += `*${i+1}. ${identity.display}*\n`
    cap += `> ↳ Lv Total: ${totalLv}\n`
    cap += `> ↳ Total Pet: ${totalPet}\n`

    if(i < 9) cap += `\n`
    if (identity.mention) mention.push(identity.mention)
  })

  cap += `\n─━━━━━━━━━━━━━━─`

  return conn.reply(m.chat, cap, m, { mentions: mention })
}


// === CLAIM PASIF HARIAN ===
if (action === 'claim') {
  if (user.pets.length === 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ 💸 *DOMPET KOSONG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu belum punya pet yg bisa hasilin uang\n` +
    `> ↳ Beli dulu di .pet shop\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  let uang = 0
  let daftar = []

  user.pets.forEach(p => {
    if(p.tipe === 'kucing_dewa'){ 
      let get = 100000 + (p.level * 25000)
      uang += get
      daftar.push(`${pets[p.tipe].emoji} ${formatNama(p)} (+Rp ${get.toLocaleString()})`) 
    }

    if(p.tipe === 'trotter_numby'){ 
      let get = 150000 + (p.level * 30000)
      uang += get
      daftar.push(`${pets[p.tipe].emoji} ${formatNama(p)} (+Rp ${get.toLocaleString()})`) 
    }

    if(p.tipe === 'alien'){ 
      let get = 75000 + (p.level * 50000)
      uang += get
      daftar.push(`${pets[p.tipe].emoji} ${formatNama(p)} (+Rp ${get.toLocaleString()})`) 
    }

    if(p.tipe === 'poop'){ 
      let get = 50000 + (p.level * 20000)
      uang += get
      daftar.push(`${pets[p.tipe].emoji} ${formatNama(p)} (+Rp ${get.toLocaleString()})`) 
    }
  })

  if(uang === 0) return safeReply(
    `╭─❏「 🐾 AVELIA PET CENTER 」❏\n` +
    `│ ❌ *TIDAK ADA PASSIVE*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pet kamu tidak ada yg punya skill menghasilkan uang\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  uang = totemIncome(uang)
  wdb.money[m.sender] = addRpgMoney(wdb.money[m.sender], uang)
  saveDB(wdb)

  let cap = `╭─❏「 🐾 AVELIA PET CENTER 」❏\n`
  cap += `│ 💰 *KLAIM PASSIVE HARIAN*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `📦 *PET YANG MENGHASILKAN*\n`
  daftar.forEach(x => {
    cap += `> ↳ ${x}\n`
  })

  cap += `\n─━━━━━━━━━━━━━━─\n\n`

  cap += `💵 *TOTAL PENDAPATAN*\n`
  cap += `> ↳ +Rp ${uang.toLocaleString()}\n\n`

  cap += `─━━━━━━━━━━━━━━─`

    return safeReply(cap)
  }

  return safeReply(`❌ Command tidak dikenal. Ketik *.pet* buat lihat menu`)
}

handler.help = ['pet', 'pet guide', 'pet command', 'pet care', 'petcare', 'pet all', 'pet list', 'pet shop', 'pet adopt', 'pet gacha', 'pet feed', 'pet charge', 'pet walk', 'pet play', 'pet train', 'pet rest', 'pet clean', 'pet heal', 'pet gift', 'pet rename', 'pet battle', 'pet hunt', 'pet dispatch', 'pet dispatch info', 'pet dispatch collect', 'pet status', 'pet sell', 'pet release', 'pet breed', 'pet playwith', 'pet transfer', 'pet kill', 'pet claim', 'pet sanctuary', 'pet revive', 'pet lb', 'shelter']
handler.tags = ['rpg']
handler.command = ['pet', 'petcare']
handler.alias = ['pet']
handler.group = true
export default handler