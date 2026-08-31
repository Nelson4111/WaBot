/**
 * Shared Utilities for CSM RPG Plugin
 * 
 * Extracted from rpg-csm.js
 * Used by all command handlers and modules.
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  WEAPON_LIST, ITEM_LIST, CHARACTER_LIST,
  MAIN_JOB_LIST, SIDE_JOB_LIST, MAIN_LOCATION_LIST, SIDE_LOCATION_LIST,
  COMMAND_SECTIONS, EVENT_LIST,
  DEVIL_LIST, RAID_RANK_WEIGHTS, CSM_PICTURES,
  calcBonus
} from '../../../lib/rpg-libmyCSM.js'

// ============================
// ALL LOCATIONS
// ============================
export const ALL_LOCATION_LIST = [...MAIN_LOCATION_LIST, ...SIDE_LOCATION_LIST]

// ============================
// SAFE BLOOD LOCATIONS
// ============================
export const SAFE_BLOOD_LOCATIONS = new Set([
  'Kafe Crossroads (Trois Bagues Vertes)',
  'Markas Public Safety',
  'Apartemen Himeno',
  'Apartemen Hayakawa',
  'Rumah Sakit Tokyo (Hospital)',
  'Toko Roti Murah Tokyo',
  'Kedai Ramen Pinggir Jalan',
  'Supermarket Tokyo',
  'Kamar Hotel Kyoto',
  'Kafe Retro Tokyo',
  'Rumah Perlindungan Public Safety (Safehouse)',
  'Pusat Penyelamatan Publik',
  'Kedai Es Krim Tokyo',
  'Kedai Teh Tradisional (Tea House)'
])

// ============================
// PICTURE HELPERS
// ============================
export const pickNamedPicture = pictures => {
  const [name, picture] = pictures[Math.floor(Math.random() * pictures.length)]
  return { name, picture }
}

export const pickPicture = pictures => Array.isArray(pictures)
  ? pictures[Math.floor(Math.random() * pictures.length)]
  : pictures

export const picturesEnabled = (wdb) => wdb.csmPicturesEnabled !== false

export const sendCsmReply = async (conn, m, wdb, caption, picture, preservePicture = false) => {
  if (typeof caption === 'string') {
    caption = caption + '\n\n'
  }
  if (!picturesEnabled(wdb) || !picture) return m.reply(caption)
  try {
    return await conn.sendMessage(m.chat, {
      image: { url: picture },
      caption,
      jpegQuality: 100,
      mimetype: 'image/jpeg'
    }, { quoted: m })
  } catch (error) {
    console.error('[CSMPicture] Error:', error.message)
    return m.reply(caption)
  }
}

export const getLocationPicture = (location, characters = []) => {
  const names = new Set(characters.map(character => character.nama))
  if (location?.nama === 'Family Burger') return CSM_PICTURES.familyBurger
  if (location?.nama === 'Kuburan Massal Pemburu Iblis (Graveyard)') return CSM_PICTURES.graveyard
  if (location?.nama === 'Hotel Morin') return CSM_PICTURES.hotelMorin
  if (location?.nama === 'Markas Public Safety') return CSM_PICTURES.publicSafety
  if (location?.nama === 'Stan Telepon Umum Nishi-Kanda (Phonebooth)') {
    if (names.has('Reze')) return CSM_PICTURES.rezePhonebooth
    if (names.has('Denji')) return CSM_PICTURES.denjiPhonebooth
  }
  if (location?.nama === 'Kafe Crossroads (Trois Bagues Vertes)') {
    if (names.has('Reze') && names.has('Denji')) return CSM_PICTURES.rezeDenjiCafe
    if (names.has('Reze')) return pickPicture(CSM_PICTURES.rezeCafe)
    return CSM_PICTURES.cafe
  }
  return pickPicture(CSM_PICTURES.city)
}

export const getStoryPicture = devilName => {
  if (devilName === 'Bomb Devil') return CSM_PICTURES.bombDevil
  if (devilName === 'Katana Man') return CSM_PICTURES.katanaMan
  if (devilName === 'Chainsaw Devil') return CSM_PICTURES.chainsawDevil
  return null
}

// ============================
// COMMAND COUNT
// ============================
export const getCommandCount = () => new Set([
  ...COMMAND_SECTIONS.flatMap(section => section.commands.map(([command]) => command)),
  ...EVENT_LIST.map(event => event.command.replace(/^\.csm\s*/, ''))
]).size

// ============================
// JOB LIST (merged)
// ============================
export const JOB_LIST = [...MAIN_JOB_LIST, ...SIDE_JOB_LIST]

// ============================
// FORMAT HELPERS
// ============================
export const formatPartnerReactionBlock = (partnerName, reactionText) => {
  const cleanName = String(partnerName || 'Partner').trim()
  const cleanReaction = String(reactionText || '...').trim()
  return `${cleanName}\n> ${cleanReaction}`
}

// ============================
// ITEM LOOKUP & DROP
// ============================
export const findItemEntryByInput = (input) => {
  const raw = String(input || '').trim()
  if (!raw) return null
  const candidates = [...ITEM_LIST, ...WEAPON_LIST]
  if (/^\d+$/.test(raw)) {
    const index = Number(raw)
    return candidates[index - 1] || null
  }
  const key = raw.toLowerCase()
  return candidates.find(entry => {
    const name = String(entry.nama || '').toLowerCase()
    return name === key || name.includes(key)
  }) || null
}

export const getDropByName = name => ITEM_LIST.find(item => item.nama === name) || WEAPON_LIST.find(weapon => weapon.nama === name)

export const addInventoryDrop = (csm, drop) => {
  if (!drop) return false
  const isItem = ITEM_LIST.includes(drop)
  if (!Array.isArray(csm.inventory)) csm.inventory = [{ nama: 'Fist', dur: 999 }]
  csm.inventory.push({ nama: drop.nama, ...(isItem ? { jml: 1 } : {}), dur: drop.dur ?? 1 })
  if (isItem) {
    if (!Array.isArray(csm.foundItems)) csm.foundItems = []
    if (!csm.foundItems.includes(drop.nama)) csm.foundItems.push(drop.nama)
  }
  return true
}

export const getInventoryEntryByInput = (csm, input, allowWeapons = false) => {
  if (!Array.isArray(csm.inventory)) csm.inventory = [{ nama: 'Fist', dur: 999 }]

  const entries = []
  csm.inventory.forEach((inv, inventoryIndex) => {
    const weapon = WEAPON_LIST.find(w => w.nama === inv.nama)
    const item = !weapon ? ITEM_LIST.find(i => i.nama === inv.nama) : null

    if (weapon && allowWeapons) {
      entries.push({ inv, inventoryIndex, data: weapon })
    } else if (item) {
      entries.push({ inv, inventoryIndex, data: item })
    }
  })

  if (!input) return null
  const normalized = String(input).trim()
  if (!normalized) return null

  if (!isNaN(normalized)) {
    const nomor = Number(normalized)
    return entries[nomor - 1] || null
  }

  const key = normalized.toLowerCase()
  return entries.find(entry => {
    const name = String(entry.data.nama || '').toLowerCase()
    return name === key || name.includes(key)
  }) || null
}

// ============================
// LEGACY DATA CLEANUP
// ============================
export const resetLegacyViewData = (csm) => {
  const staleViewArrays = [
    'seenContractScenes', 'seenExploreStories', 'seenMissionStories',
    'seenRescueStories', 'seenRescueResults', 'buffHistory',
    'terrorStory', 'workStories', 'partnerReactionHistory'
  ]
  staleViewArrays.forEach(key => {
    if (!Array.isArray(csm[key])) csm[key] = []
  })
  if (!csm.lastSeenChars || typeof csm.lastSeenChars !== 'object') csm.lastSeenChars = {}
  if (!csm.lastSeenDevils || typeof csm.lastSeenDevils !== 'object') csm.lastSeenDevils = {}
  if (!csm.relations || typeof csm.relations !== 'object') csm.relations = {}
}

// ============================
// RAID DEVIL PICKER
// ============================
export const pickRaidDevil = () => {
  const pool = DEVIL_LIST.filter(devil => devil.tipe === 'Devil')
  const totalWeight = pool.reduce((total, devil) => total + (RAID_RANK_WEIGHTS[devil.rank] || 1), 0)
  let roll = Math.random() * totalWeight
  return pool.find(devil => (roll -= RAID_RANK_WEIGHTS[devil.rank] || 1) <= 0) || pool[pool.length - 1]
}

// ============================
// ACTION ALIAS NORMALIZATION
// ============================
export const normalizeCsmAction = (value) => {
  const aliasMap = {
    kontrak: 'contract',
    contrack: 'contract',
    'kontrak-trial': 'contract',
    'kontrak-deal': 'contract',
    'kontrak trial': 'contract',
    'kontrak deal': 'contract',
    'contract trial': 'contract',
    'contract deal': 'contract',
    'makima-call': 'makimacall',
    'makimacall': 'makimacall',
    'makima call': 'makimacall',
    'blood-convert': 'blood',
    'bloodconvert': 'blood',
    'team': 'partner',
    'cd' : 'cooldown',
    'berhenti': 'cancel',
    accept: 'terima',
    reject: 'tolak',
    gacha: 'contract',
    yes: 'yes',
    no: 'no',
    terima: 'terima',
    tolak: 'tolak'
  }
  return aliasMap[String(value || '').toLowerCase()] || String(value || '').toLowerCase()
}

// ============================
// JOB HELPERS
// ============================
export function getJobData(csm, jobName) {
  if (!csm.jobs) csm.jobs = {}
  if (!csm.jobs[jobName]) csm.jobs[jobName] = { level: 1, exp: 0 }
  return csm.jobs[jobName]
}

export function addJobExp(csm, jobName, exp) {
  let jobData = getJobData(csm, jobName)
  jobData.exp += exp
  let leveled = false

  while (true) {
    let expButuh = Math.floor(100 * Math.pow(jobData.level, 1.5))
    if (jobData.exp >= expButuh) {
      jobData.exp -= expButuh
      jobData.level++
      leveled = true
    } else break
  }
  return { leveled, level: jobData.level }
}

export function getJobDesc(jobName) {
  let f = JOB_LIST.find(j => j.job === jobName)
  return f ? f.desc : 'Deskripsi tidak ditemukan.'
}

// ============================
// HEADER BUILDER
// ============================
export const header = (title) => `╭──「 ⛓️ DEVIL HUNTER RPG 」──╮\n│ ${title}\n━━━━━━━━━━━\n\n`

export const headerUnavailable = (commandName) =>
  `╭──「 PERINTAH TERKUNCI 」──╮\n│ ${commandName}\n━━━━━━━━━━━\n\nPerintah ini tidak tersedia untuk akunmu.\nGunakan *.csm command* untuk melihat daftar perintah yang bisa digunakan.\n━━━━━━━━━━━`

// ============================
// JID RESOLVER
// ============================
export const resolveJid = (jid, wdb) => {
  if (!jid) return jid
  if (jid.endsWith('@lid')) {
    return global.lids?.[jid] ||
           global.db?.data?.lids?.[jid] ||
           (wdb?.lids && wdb.lids[jid]) ||
           jid
  }
  return jid
}

// ============================
// DEVIL RATE COLOR
// ============================
export const getRateColor = (rate) => {
  if (rate >= 0.70) return '🔴'
  if (rate >= 0.40) return '🟡'
  return '🟢'
}

// ============================
// COOLDOWN CHECKER
// ============================
export const cekCD = (csm, key, durasi) => {
  let last = csm[key] || 0
  let sisa = durasi - (Date.now() - last)
  return sisa > 0 ? sisa : 0
}

// ============================
// BUFF GUIDE
// ============================
export const buffGuide = [
  'DMG, Accuracy, Speed, Snake, Control, Army, Summon: tambah damage; dapat dari partner/achievement set.',
  'DEF, Taunt, CC Resist, Doll Buff: mengurangi damage; dapat dari partner/achievement set.',
  'Critical, Crit Damage, Evasion, Instant Kill, Pierce, Bleed, AoE, Burn, Fire, Water: efek battle; dapat dari partner/achievement set.',
  'Self Destruct: peluang mengorbankan HP untuk ledakan damage besar; dapat dari Yuko.',
  'Summon: memanggil Devil tambahan dan memberi damage bonus; dapat dari Santa Claus atau ending Apocalypse.',
  'Regen, Heal, Revive, Team HP, Weapon Dur: efek bertahan hidup; dapat dari partner/achievement set.',
  'EXP, Blood, Steal Blood, Money, Blood Flat: bonus reward; dapat dari partner/achievement set/ending.',
  'Find Item, Info, Luck, Discount, Stamina: eksplorasi, encounter, cooldown, dan toko; dapat dari partner/achievement set.',
  'Political, Law, Diplomacy, Crime, INT, Justice: bonus taktik yang menambah damage atau defense; dapat dari partner/achievement set.',
  'Teleport: peluang menghindari serangan dan pindah ke lokasi aman; dapat dari achievement Divisi 4.',
  'Concept Erasure: bonus damage konsep; dapat dari Chainsaw Devil dan sekarang aktif di battle.',
  'Auto Transform, Gacha Bonus, No Heal, No Fight: efek ending atau set achievement.'
]

// ============================
// RANDOM EVENT TRIGGER (MAKIMA CALL, ETC)
// ============================
export async function checkMakimaTrigger(m, csm, wdb) {
  if (csm.lastRandomEvent && Date.now() - csm.lastRandomEvent < 6 * 60 * 60 * 1000) return
  if (csm.pendingDuel || csm.erasurePending || csm.pendingRandomEvent) return
  if (csm.blood < 10000) return

  const eventPool = [
    { id: 'makimacall', chance: 0.01 },
    { id: 'devilsbargain', chance: 0.01 },
    { id: 'eyesofcontrol', chance: 0.01 },
    { id: 'bloodfrenzy', chance: 0.01 },
    { id: 'weaponization', chance: 0.01 },
    { id: 'hungerfeast', chance: 0.01 },
    { id: 'deathsentence', chance: 0.01 },
    { id: 'childwish', chance: 0.01 },
    { id: 'dollcontract', chance: 0.01 },
    { id: 'erasure', chance: 0.0002 }
  ]
  const selected = eventPool[Math.floor(Math.random() * eventPool.length)]
  if (Math.random() > selected.chance) return

  const now = Date.now()
  csm.lastRandomEvent = now
  csm.pendingRandomEvent = selected.id
  if (selected.id === 'makimacall') {
    csm.pendingDuel = 'makima_order'
    csm.pendingDuelTime = now
  }
  if (selected.id === 'erasure') csm.erasurePending = true
  if (!Array.isArray(wdb.csmEventHistory)) wdb.csmEventHistory = []
  wdb.csmEventHistory.push({
    event: selected.id,
    nickname: csm.nickname || 'Hunter tanpa nickname',
    jid: m.sender,
    date: now
  })
  if (wdb.csmEventHistory.length > 100) wdb.csmEventHistory = wdb.csmEventHistory.slice(-100)
  csm.lastRandomEvent = Date.now()
  saveDB(wdb)

  const quotes = [
    `⛓️ "Bunuh seekor anjing untukku."`, `⛓️ "Ada hama. Basmi."`, `⛓️ "Buktikan kesetiaanmu."`,
    `⛓️ "Aku butuh darah. Bawakan."`, `⛓️ "Jangan buat aku menunggu."`, `⛓️ "Pergilah ke sana dan jangan bertanya."`,
    `⛓️ "Selesaikan sebelum matahari terbit."`, `⛓️ "Aku sudah memilih targetmu."`, `⛓️ "Jangan mengecewakanku."`,
    `⛓️ "Kau tahu apa yang harus dilakukan."`
  ]
  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  const prompts = {
    makimacall: header('PANGGILAN DARI MAKIMA') + `${quote}\n\nTarget: Bebas. Pilih sendiri\nWaktu: 1 Jam\n\nReward: +15.000 Blood dan +100 EXP\nGagal/Tolak: -10.000 Blood\n\n.csm event makimacall terima\n.csm event makimacall tolak\n━━━━━━━━━━━`,
    devilsbargain: header("THE DEVIL'S BARGAIN") + `Tawaran Devil aktif. Terima untuk Blood +10.000 dan damage +25% selama 30 menit, atau tolak.\n\n.csm event devilsbargain terima\n.csm event devilsbargain tolak\n━━━━━━━━━━━`,
    eyesofcontrol: header('EYES OF CONTROL') + `Makima sedang mengawasimu. Pilih loyalitas atau kebebasan.\n\n.csm event eyesofcontrol loyal\n.csm event eyesofcontrol tolak\n━━━━━━━━━━━`,
    bloodfrenzy: header('BLOOD FRENZY') + `Haus darah meningkat. Aktifkan Blood Gain x2 dan Terror tanpa cooldown selama 30 menit, atau tahan nalurimu.\n\n.csm event bloodfrenzy ikut\n.csm event bloodfrenzy tahan\n━━━━━━━━━━━`,
    weaponization: header('WEAPONIZATION') + `Yoru menawarkan senjata yang ditempa dari pengorbananmu.\n\n.csm event weaponization sacrifice\n.csm event weaponization reject\n━━━━━━━━━━━`,
    hungerfeast: header("HUNGER'S FEAST") + `Fami menyalakan rasa lapar yang menggandakan Blood dan menghapus cooldown Terror.\n\n.csm event hungerfeast ikut\n.csm event hungerfeast tolak\n━━━━━━━━━━━`,
    deathsentence: header('DEATH SENTENCE') + `Death Devil membacakan vonis. Terima kekuatan atau tolak demi perlindungan.\n\n.csm event deathsentence accept\n.csm event deathsentence reject\n━━━━━━━━━━━`,
    childwish: header('A CHILD WISH') + `Seorang anak meminta bantuan di tengah kota yang runtuh.\n\n.csm event childwish help\n.csm event childwish reject\n━━━━━━━━━━━`,
    dollcontract: header('DOLL CONTRACT') + `Benang Doll Devil menawarkan kontrak yang mengubah tubuhmu menjadi boneka sadar.\n\n.csm event dollcontract accept\n.csm event dollcontract reject\n━━━━━━━━━━━`,
    erasure: header('ERASURE EFFECT') + `Pochita mulai menghapus jejak perjalananmu. Terima penghapusan atau pilih perlindungan.\n\n.csm event erasure yes\n.csm event erasure no\n━━━━━━━━━━━`
  }
  return m.reply(prompts[selected.id])
}
