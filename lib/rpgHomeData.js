import { MALL_CATEGORIES } from './rpgMallData.js'
import { getJakartaDate } from './userLimit.js'
import { RPG_CONFIRMATION_TTL } from './rpgConfirmation.js'

export const HOME_MAX_UPGRADES = 10
export const HOME_BASE_CAPACITY = 2
export const HOME_UPGRADE_CAPACITY = 2
export const HOME_PREMIUM_CAPACITY_BONUS = 2
export const HOME_BASE_FURNITURE_CAPACITY = 5
export const HOME_UPGRADE_FURNITURE_CAPACITY = 3
export const HOME_PREMIUM_FURNITURE_BONUS = 5
export const HOME_PREMIUM_UPGRADE_DISCOUNT = 0.2
export const HOME_CONFIRMATION_TTL = RPG_CONFIRMATION_TTL
export const HOME_ACTIVITY_COOLDOWN = 5 * 60 * 1000
export const HOME_STAFF_DEFAULT_CONTRACT_DAYS = 1
export const HOME_STAFF_MAX_CONTRACT_DAYS = 7
export const HOME_STAFF_SALARY_PERIOD_DAYS = 30
export const HOME_STAFF_COOLDOWN = 2 * 60 * 60 * 1000
export const HOME_STAT_MAX = 100
export const HOME_PREMIUM_STAFF_DISCOUNT = 0.1
export const HOME_EAT_HARMONY = 8

export const HOME_LEVELS = Object.freeze([
  Object.freeze({ level: 0, name: 'Simple House', cost: 0, security: 5 }),
  Object.freeze({ level: 1, name: 'Cozy House', cost: 5000000, security: 12 }),
  Object.freeze({ level: 2, name: 'Family House', cost: 25000000, security: 20 }),
  Object.freeze({ level: 3, name: 'Townhouse', cost: 100000000, security: 30 }),
  Object.freeze({ level: 4, name: 'Luxury House', cost: 500000000, security: 40 }),
  Object.freeze({ level: 5, name: 'Exclusive Villa', cost: 2000000000, security: 50 }),
  Object.freeze({ level: 6, name: 'Mansion', cost: 10000000000, security: 60 }),
  Object.freeze({ level: 7, name: 'Penthouse', cost: 50000000000, security: 70 }),
  Object.freeze({ level: 8, name: 'Modern Palace', cost: 250000000000, security: 80 }),
  Object.freeze({ level: 9, name: 'Private Estate', cost: 1000000000000, security: 90 }),
  Object.freeze({ level: 10, name: 'Grand Palace', cost: 5000000000000, security: 100 }),
  Object.freeze({ level: 11, name: 'Luxury Estate', cost: 10000000000000, security: 110 }),
  Object.freeze({ level: 12, name: 'Royal Mansion', cost: 25000000000000, security: 120 }),
  Object.freeze({ level: 13, name: 'Imperial Residence', cost: 50000000000000, security: 130 }),
  Object.freeze({ level: 14, name: 'Crystal Palace', cost: 100000000000000, security: 140 }),
  Object.freeze({ level: 15, name: 'Royal Estate', cost: 250000000000000, security: 150 }),
  Object.freeze({ level: 16, name: 'Imperial Palace', cost: 500000000000000, security: 160 }),
  Object.freeze({ level: 17, name: 'Celestial Mansion', cost: 1000000000000000, security: 170 }),
  Object.freeze({ level: 18, name: 'Eternal Palace', cost: 2500000000000000, security: 180 }),
  Object.freeze({ level: 19, name: 'Sovereign Estate', cost: 5000000000000000, security: 190 }),
  Object.freeze({ level: 20, name: 'Supreme Celestial Estate', cost: 10000000000000000, security: 200 })
])

export const HOME_STAFF = Object.freeze({
  housekeeper: Object.freeze({ name: 'Housekeeper', emoji: '🧹', hireCost: 15000000, salary: 5000000, effect: 'Hygiene +2 setiap pulang' }),
  babysitter: Object.freeze({ name: 'Babysitter', emoji: '🍼', hireCost: 20000000, salary: 8000000, effect: 'Mengurus semua anak melalui .home childcare' }),
  gardener: Object.freeze({ name: 'Gardener', emoji: '🌿', hireCost: 18000000, salary: 6000000, effect: 'Hygiene +4 setiap pulang' }),
  tutor: Object.freeze({ name: 'Tutor', emoji: '🎓', hireCost: 30000000, salary: 10000000, effect: 'Harmony +5 saat mengurus anak' }),
  bodyguard: Object.freeze({ name: 'Bodyguard', emoji: '🥋', hireCost: 50000000, salary: 20000000, effect: 'Security +15' }),
  'private chef': Object.freeze({ name: 'Private Chef', emoji: '👨‍🍳', hireCost: 75000000, salary: 30000000, effect: 'Menyajikan makanan restoran premium secara gratis' }),
  stripper: Object.freeze({ name: 'Aesthetic Designer', emoji: '🎨', hireCost: 25000000, salary: 10000000, effect: 'Aesthetics +15' }),
  'private nurse': Object.freeze({ name: 'Private Nurse', emoji: '🩺', hireCost: 40000000, salary: 15000000, effect: 'Memulihkan darah saat pulang' }),
  'pet sitter': Object.freeze({ name: 'Pet Sitter', emoji: '🐾', hireCost: 20000000, salary: 8000000, effect: 'Mengurus semua pet melalui .home petcare' }),
  'security guard': Object.freeze({ name: 'Security Guard', emoji: '🛡️', hireCost: 35000000, salary: 15000000, effect: 'Security +10' })
})

export function getHomeStaffContractEnd(startTimestamp, durationDays) {
  if (!Number.isFinite(Number(startTimestamp)) ||
      !Number.isSafeInteger(durationDays) ||
      durationDays < 1 ||
      durationDays > HOME_STAFF_MAX_CONTRACT_DAYS) {
    throw new RangeError('Waktu mulai atau durasi kontrak staff tidak valid.')
  }

  const dayStart = Date.parse(`${getJakartaDate(Number(startTimestamp))}T00:00:00+07:00`)
  return dayStart + durationDays * 86400000
}

export function getHomeStaffCooldownUntil(record, now = Date.now()) {
  if (!record || Number(record.expiresAt) > now) return 0
  const expiresAt = Number(record.expiresAt) || 0
  return Math.max(Number(record.cooldownUntil) || 0, expiresAt + HOME_STAFF_COOLDOWN)
}

export const HOME_STORIES = Object.freeze({
  solo: Object.freeze([
    Object.freeze({ text: 'Kamu menikmati pagi yang tenang di rumah dan merapikan pikiran.', harmony: 3 }),
    Object.freeze({ text: 'Kamu membaca buku favorit di sudut rumah yang nyaman.', harmony: 4 }),
    Object.freeze({ text: 'Kamu membuka jendela dan menikmati udara segar.', harmony: 2 }),
    Object.freeze({ text: 'Kamu memasak minuman hangat dan bersantai sejenak.', harmony: 3 }),
    Object.freeze({ text: 'Kamu merapikan ruang pribadi dan merasa lebih betah.', harmony: 5 })
  ]),
  relationship: Object.freeze([
    Object.freeze({ text: 'Kamu berbincang hangat dengan pasangan yang ikut menghabiskan waktu di rumah.', harmony: 6, love: 2 }),
    Object.freeze({ text: 'Kamu dan pasangan yang tinggal di rumah menonton film bersama di ruang keluarga.', harmony: 5, love: 2 }),
    Object.freeze({ text: 'Kamu menyiapkan kejutan kecil untuk pasangan yang tinggal bersamamu.', harmony: 8, love: 3 }),
    Object.freeze({ text: 'Kamu dan pasangan yang tinggal di rumah menikmati waktu santai berdua.', harmony: 7, love: 2 }),
    Object.freeze({ text: 'Kamu dan pasangan yang tinggal di rumah menata ulang sudut favorit.', harmony: 6, love: 2 })
  ]),
  pet: Object.freeze([
    Object.freeze({ text: 'Kamu bermain lempar tangkap dengan pet yang tinggal di rumah.', harmony: 5, petHappy: 8 }),
    Object.freeze({ text: 'Kamu menyisir bulu pet penghuni rumah dan memberinya perhatian.', harmony: 4, petHappy: 10 }),
    Object.freeze({ text: 'Kamu mengajak pet penghuni rumah berkeliling halaman.', harmony: 6, petHappy: 8 }),
    Object.freeze({ text: 'Kamu memberi camilan kepada pet penghuni rumah dan bermain sebentar.', harmony: 5, petHappy: 10 }),
    Object.freeze({ text: 'Pet yang tinggal di rumah tertidur nyaman setelah bermain denganmu.', harmony: 4, petHappy: 6 })
  ]),
  family: Object.freeze([
    Object.freeze({ text: 'Kamu, pasangan, dan pet penghuni rumah menikmati waktu santai bersama.', harmony: 10, love: 2, petHappy: 8 }),
    Object.freeze({ text: 'Keluargamu bermain bersama pet di ruang keluarga.', harmony: 12, love: 2, petHappy: 8 }),
    Object.freeze({ text: 'Kamu dan pasangan mengajak pet menikmati sore di rumah.', harmony: 9, love: 2, petHappy: 10 }),
    Object.freeze({ text: 'Kamu, pasangan, dan pet berfoto bersama untuk kenangan.', harmony: 11, love: 3, petHappy: 8 }),
    Object.freeze({ text: 'Rumah ramai oleh obrolan keluarga dan tingkah lucu pet kesayangan.', harmony: 10, love: 2, petHappy: 8 })
  ]),
  collection: Object.freeze([
    Object.freeze({ text: 'Kamu menata koleksi dan furniture agar ruangan terasa hidup.', harmony: 7, aesthetics: 3 }),
    Object.freeze({ text: 'Kamu membersihkan pajangan koleksi dengan teliti.', harmony: 6, aesthetics: 4 }),
    Object.freeze({ text: 'Kamu mengatur ulang furniture agar rumah terasa lebih lapang.', harmony: 8, aesthetics: 3 }),
    Object.freeze({ text: 'Kamu memperlihatkan koleksi favorit kepada penghuni rumah.', harmony: 7, aesthetics: 3 }),
    Object.freeze({ text: 'Kamu menemukan dekorasi yang membuat rumah terasa istimewa.', harmony: 9, aesthetics: 4 })
  ]),
  everything: Object.freeze([
    Object.freeze({ text: 'Kamu, pasangan, dan pet menikmati rumah yang dihias dengan koleksimu.', harmony: 15, love: 3, petHappy: 10, aesthetics: 5 }),
    Object.freeze({ text: 'Kamu mengajak pasangan dan pet berkumpul di ruang keluarga yang nyaman.', harmony: 14, love: 3, petHappy: 10, aesthetics: 4 }),
    Object.freeze({ text: 'Kamu mengadakan malam santai bersama pasangan, pet, dan koleksi favorit.', harmony: 16, love: 4, petHappy: 10, aesthetics: 5 }),
    Object.freeze({ text: 'Pasangan dan pet ikut menikmati rumah setelah kamu menata semuanya.', harmony: 15, love: 3, petHappy: 10, aesthetics: 5 }),
    Object.freeze({ text: 'Kamu mengabadikan momen hangat penghuni rumah bersama koleksi kesayangan.', harmony: 18, love: 4, petHappy: 12, aesthetics: 5 })
  ])
})

export const HOME_CARE_STORIES = Object.freeze({
  clean: Object.freeze([
    'Kamu membersihkan ruang keluarga hingga terasa segar.',
    'Kamu menyapu dan mengepel seluruh lantai rumah.',
    'Kamu merapikan dapur dan membersihkan meja makan.',
    'Kamu membersihkan debu pada furniture dan pajangan.',
    'Kamu merapikan kamar dan mengganti seprai.'
  ]),
  childcare: Object.freeze([
    'Kamu menemani anak belajar sambil bermain.',
    'Kamu menyiapkan makanan dan memastikan anak makan dengan baik.',
    'Kamu membacakan cerita sebelum anak beristirahat.',
    'Kamu mengajak anak bermain dan berbincang.',
    'Kamu membantu anak merapikan mainannya.'
  ]),
  petcare: Object.freeze([
    'Kamu memberi makan semua pet dan memastikan mereka cukup minum.',
    'Kamu membersihkan tempat istirahat semua pet.',
    'Kamu bermain bersama seluruh pet di rumah.',
    'Kamu menyisir dan merawat semua pet dengan telaten.',
    'Kamu mengajak seluruh pet beraktivitas bersama.'
  ]),
  eat: Object.freeze([
    'Kamu mengajak penghuni rumah menikmati hidangan bersama.',
    'Kamu menyajikan makan malam hangat di meja makan.',
    'Semua penghuni berkumpul untuk makan dan bercerita.',
    'Kamu menikmati hidangan rumahan di ruang makan.',
    'Waktu makan bersama membuat suasana rumah semakin akrab.'
  ])
})

export function getHomeLevel(level = 0) {
  const safeLevel = Math.min(HOME_MAX_UPGRADES, Math.max(0, Math.floor(Number(level) || 0)))
  return HOME_LEVELS[safeLevel]
}

export function getHomeComfort(home = {}, inventory = {}) {
  const furnitureCount = MALL_CATEGORIES.furniture.items.reduce(
    (total, item) => total + Math.max(0, Number(inventory[item.id]) || 0),
    0
  ) + (Array.isArray(home.furniture) ? home.furniture.length : 0)
  const upgradeLevel = Math.max(0, Number(home.level) || 0)
  const points = furnitureCount + upgradeLevel * 5
  return {
    level: 1 + Math.floor(points / 5),
    points,
    furnitureCount,
    upgradeLevel
  }
}

export function clampHomeStat(value) {
  return Math.min(HOME_STAT_MAX, Math.max(0, Math.floor(Number(value) || 0)))
}
