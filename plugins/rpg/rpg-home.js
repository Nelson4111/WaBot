import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  MALL_CATEGORY_ALIASES,
  MALL_CATEGORIES
} from '../../lib/rpgMallData.js'
import {
  HOME_ACTIVITY_COOLDOWN,
  HOME_BASE_CAPACITY,
  HOME_BASE_FURNITURE_CAPACITY,
  HOME_CARE_STORIES,
  HOME_CONFIRMATION_TTL,
  HOME_EAT_HARMONY,
  HOME_LEVELS,
  HOME_MAX_UPGRADES,
  HOME_PREMIUM_CAPACITY_BONUS,
  HOME_PREMIUM_FURNITURE_BONUS,
  HOME_PREMIUM_UPGRADE_DISCOUNT,
  HOME_UPGRADE_CAPACITY,
  HOME_PREMIUM_STAFF_DISCOUNT,
  HOME_STAFF_COOLDOWN,
  HOME_STAFF_DEFAULT_CONTRACT_DAYS,
  HOME_STAFF_MAX_CONTRACT_DAYS,
  HOME_STAFF_SALARY_PERIOD_DAYS,
  HOME_STAFF,
  HOME_STORIES,
  HOME_UPGRADE_FURNITURE_CAPACITY,
  clampHomeStat,
  getHomeComfort,
  getHomeLevel,
  getHomeStaffContractEnd,
  getHomeStaffCooldownUntil
} from '../../lib/rpgHomeData.js'
import { getJakartaDate } from '../../lib/userLimit.js'
import { AUCTION_ITEMS } from '../../lib/rpg-auctionData.js'
import { BANK_SPECIAL_ITEMS } from '../../lib/rpg-bankData.js'
import { hargaBeli, masakanResep, normalizeMasakanKey, formatMasakanNama } from '../../lib/rpg-masakanData.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

const money = value => `Rp ${(Number(value) || 0).toLocaleString('id-ID')}`
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')
const displayName = item => `${item.emoji} ${item.name}`
const collectionItems = [...MALL_CATEGORIES.koleksi.items, ...AUCTION_ITEMS, ...BANK_SPECIAL_ITEMS]
const allItems = Object.entries(MALL_CATEGORIES).flatMap(([category, data]) =>
  data.items.map(item => ({ ...item, category }))
).concat(AUCTION_ITEMS, BANK_SPECIAL_ITEMS)

function findItem(input, category) {
  const key = normalize(input)
  if (!key) return null
  const candidates = category
    ? (category === 'koleksi' ? collectionItems : MALL_CATEGORIES[category]?.items || []).map(item => ({ ...item, category }))
    : allItems
  return candidates.find(item => normalize(item.id) === key || normalize(item.name) === key)
    || candidates.find(item => normalize(item.name).includes(key))
}

function getHome(rpg) {
  if (!rpg.home || typeof rpg.home !== 'object') {
    rpg.home = { level: 0, public: false, access: [], blocked: [], visitors: [], visitCount: 0, likes: [], furniture: [], trophies: [] }
  }
  const home = rpg.home
  for (const key of ['access', 'blocked', 'visitors', 'likes', 'furniture', 'trophies', 'staff']) {
    if (!Array.isArray(home[key])) home[key] = []
  }
  home.level = Math.min(HOME_MAX_UPGRADES, Math.max(0, Math.floor(Number(home.level) || 0)))
  home.harmony = clampHomeStat(home.harmony ?? 0)
  home.security = getHomeLevel(home.level).security
  home.hygiene = clampHomeStat(home.hygiene ?? 70)
  home.aesthetics = clampHomeStat(home.aesthetics ?? 0)
  home.visitCount = Number(home.visitCount) || 0
  return home
}

function getCollection(rpg) {
  if (!rpg.mallInventory || typeof rpg.mallInventory !== 'object') rpg.mallInventory = {}
  if (!Array.isArray(rpg.collectionFavorites)) rpg.collectionFavorites = []
  if (!Array.isArray(rpg.collectionShowcase)) rpg.collectionShowcase = []
  return rpg.mallInventory
}

function clearCollectionFlagsWhenUnowned(rpg, itemId) {
  if (Number(rpg.mallInventory?.[itemId]) > 0) return
  rpg.collectionFavorites = (rpg.collectionFavorites || []).filter(id => id !== itemId)
  rpg.collectionShowcase = (rpg.collectionShowcase || []).filter(id => id !== itemId)
}

function getUser(db, jid) {
  return jid ? getUserRPG(db, jid) : null
}

function normalizeJid(jid) {
  if (!jid) return jid
  const resolved = jid.endsWith('@lid')
    ? global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
    : jid
  if (!resolved.includes('@')) return resolved
  return `${resolved.split('@')[0].split(':')[0]}${resolved.includes('@lid') ? '@lid' : '@s.whatsapp.net'}`
}

function mentionsOrReply(m, args) {
  const target = normalizeJid(m.mentionedJid?.[0] || m.quoted?.sender)
  return { target, args: args.filter(arg => !/^@/.test(arg)) }
}

function getPartnerJid(partner) {
  const digits = String(partner?.name || '').replace(/\D/g, '')
  return digits.length >= 8 ? `${digits}@s.whatsapp.net` : null
}

function getHomeMembers(rpg) {
  const spouses = (Array.isArray(rpg.harem) ? rpg.harem : [])
    .filter(partner => partner && Number(partner.level) >= 40)
  const children = Array.isArray(rpg.kids) ? rpg.kids : []
  const pets = Array.isArray(rpg.pets) ? rpg.pets : []
  return { spouses, children, pets }
}

function getStaffRecord(home, name) {
  return home.staff.find(staff => normalize(staff.name) === normalize(name))
}

function getStaffCost(staff, premium, durationDays = HOME_STAFF_DEFAULT_CONTRACT_DAYS) {
  const salary = Math.ceil(staff.salary * durationDays / HOME_STAFF_SALARY_PERIOD_DAYS)
  const price = staff.hireCost + salary
  return Math.floor(price * (premium ? 1 - HOME_PREMIUM_STAFF_DISCOUNT : 1))
}

function formatHomeDuration(timestamp) {
  if (!timestamp) return 'Belum ada kontrak'
  const now = Date.now()
  const remaining = timestamp - now
  if (remaining <= 0) return 'Kontrak habis'
  const today = Date.parse(`${getJakartaDate(now)}T00:00:00+07:00`)
  const endDay = Date.parse(`${getJakartaDate(timestamp)}T00:00:00+07:00`)
  const days = Math.max(1, Math.round((endDay - today) / 86400000))
  return `${days} hari lagi`
}

function formatHomeStaffCooldown(remaining) {
  const totalMinutes = Math.ceil(Math.max(0, remaining) / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours} jam ${minutes} menit`
}

function getHomePopularity(home, comfort, members, collectionCount) {
  return Math.min(100, Math.floor(
    (Number(home.level) || 0) * 2 +
    (Number(home.harmony) || 0) * 0.25 +
    (Number(home.security) || 0) * 0.15 +
    (Number(home.hygiene) || 0) * 0.15 +
    (Number(home.aesthetics) || 0) * 0.15 +
    comfort.level +
    Math.min(10, members.spouses.length + members.children.length + members.pets.length) +
    Math.min(10, collectionCount)
  ))
}

function getHomeAesthetics(home, inventory) {
  const decor = [...new Map(
    [...MALL_CATEGORIES.furniture.items, ...collectionItems].map(item => [item.id, item])
  ).values()]
  const owned = decor.reduce((total, item) => total + Math.max(0, Number(inventory[item.id]) || 0), 0)
  const designerBonus = home.staff.some(staff => staff.key === 'stripper' && staff.expiresAt > Date.now()) ? 15 : 0
  return clampHomeStat(home.aesthetics + designerBonus + Math.floor((owned + home.furniture.length + home.trophies.length) / 2))
}

function getHomeSecurity(home) {
  const baseSecurity = getHomeLevel(home.level).security
  const bodyguard = home.staff.some(staff => staff.key === 'bodyguard' && staff.expiresAt > Date.now()) ? 15 : 0
  const guard = home.staff.some(staff => staff.key === 'security guard' && staff.expiresAt > Date.now()) ? 10 : 0
  return clampHomeStat(baseSecurity + bodyguard + guard)
}

let handler = async (m, { conn, text = '', usedPrefix, command, groupMetadata }) => {
  const db = loadDB()
  const sender = normalizeJid(m.sender)
  const account = getUserRPG(db, sender)
  if (!account?.rpg) return m.reply('Kamu belum memiliki data RPG.')
  if (!db.money) db.money = {}

  const rpg = account.rpg
  const wallet = () => Number(db.money[sender]) || 0
  const setWallet = value => { db.money[sender] = Math.max(0, Math.floor(value)) }
  const premium = isPremiumAccount(global.db?.data?.users?.[sender])
  const tokens = String(text || '').trim().split(/\s+/).filter(Boolean)
  const root = String(command || '').toLowerCase()
  const prefix = usedPrefix || '.'

  const leaveVisitedHome = () => {
    if (!rpg.lastVisitedHome) return
    const previousHome = getUser(db, rpg.lastVisitedHome)?.rpg?.home
    if (previousHome?.visitors) previousHome.visitors = previousHome.visitors.filter(jid => jid !== sender)
    delete rpg.lastVisitedHome
  }

  if (!['home', 'rumah'].includes(root)) return null
const mode = String(tokens[0] || '').toLowerCase()
const home = getHome(rpg)
const capacity = HOME_BASE_FURNITURE_CAPACITY + (Number(home.level) || 0) * HOME_UPGRADE_FURNITURE_CAPACITY + (premium ? HOME_PREMIUM_FURNITURE_BONUS : 0)
const residentCapacity = HOME_BASE_CAPACITY + (Number(home.level) || 0) * HOME_UPGRADE_CAPACITY + (premium ? HOME_PREMIUM_CAPACITY_BONUS : 0)
const furnitureInventory = getCollection(rpg)
const comfort = () => getHomeComfort(home, furnitureInventory)

const yes = ['yes', 'ya', 'iya', 'y', 'konfirmasi', 'setuju'].includes(normalize(tokens[1] || mode))
const no = ['no', 'tidak', 'batal', 'cancel', 'tolak', 'n'].includes(normalize(tokens[1] || mode))
if ((yes || no) && (mode === 'yes' || mode === 'no' || ['yes', 'ya', 'iya', 'no', 'tidak', 'batal', 'cancel'].includes(normalize(tokens[1])))) {
  const pending = home.pendingConfirmation
  if (!pending || Date.now() - Number(pending.createdAt || 0) > HOME_CONFIRMATION_TTL) {
    delete home.pendingConfirmation
    await saveDB(db)
    return m.reply(
      `╭─❏「 🏠 KONFIRMASI RUMAH 」❏\n` +
      `│ ⚠️ *KONFIRMASI KEDALUWARSA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tidak ada konfirmasi rumah yang masih berlaku.\n` +
      `> ↳ Jalankan perintahnya kembali.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  delete home.pendingConfirmation
  if (no) {
    await saveDB(db)
    return m.reply(
      `╭─❏「 🏠 KONFIRMASI RUMAH 」❏\n` +
      `│ ❌ *AKSI DIBATALKAN*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (pending.type === 'upgrade') {
    const currentLevel = Number(home.level) || 0
    const next = getHomeLevel(currentLevel + 1)
    const cost = Math.floor(next.cost * (premium ? 1 - HOME_PREMIUM_UPGRADE_DISCOUNT : 1))
    if (currentLevel !== Number(pending.fromLevel) || cost !== Number(pending.cost) ||
        currentLevel >= HOME_MAX_UPGRADES || wallet() < cost) {
      await saveDB(db)
      return m.reply(
        `╭─❏「 ⬆️ UPGRADE RUMAH 」❏\n` +
        `│ ⚠️ *UPGRADE TIDAK DIPROSES*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Level, harga, atau saldo berubah.\n` +
        `> ↳ Periksa kembali dengan *${prefix}home upgrade*.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    setWallet(wallet() - cost)
    home.level = currentLevel + 1
    home.security = getHomeLevel(home.level).security
    await saveDB(db)
    return m.reply(
      `╭─❏「 ⬆️ UPGRADE RUMAH 」❏\n` +
      `│ ✅ *UPGRADE BERHASIL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🏠 *INFORMASI RUMAH*\n` +
      `> ↳ Rumah: *${getHomeLevel(home.level).name}*\n` +
      `> ↳ Level: ${home.level}/${HOME_MAX_UPGRADES}\n` +
      `> ↳ Biaya: ${money(cost)}\n\n` +
      `📊 *KAPASITAS & KEAMANAN*\n` +
      `> ↳ Kapasitas penghuni: ${residentCapacity + HOME_UPGRADE_CAPACITY}\n` +
      `> ↳ Kapasitas furniture: ${capacity + HOME_UPGRADE_FURNITURE_CAPACITY}\n` +
      `> ↳ Security: ${getHomeSecurity(home)}/100\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (pending.type === 'invite' || pending.type === 'kick') {
    const target = normalizeJid(pending.target)
    const targetAccount = getUser(db, target)
    if (!targetAccount?.rpg) {
      await saveDB(db)
      return m.reply(
        `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
        `│ ❌ *AKUN TIDAK TERSEDIA*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Akun target tidak lagi tersedia.\n` +
        `> ↳ Aksi dibatalkan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    const targetHome = getHome(targetAccount.rpg)
    if (pending.type === 'invite') {
      const members = getHomeMembers(rpg)
      const spouseIds = new Set(members.spouses.map(getPartnerJid).filter(Boolean).map(normalizeJid))
      const guests = [...new Set([...home.access, ...home.visitors])]
        .filter(jid => !spouseIds.has(normalizeJid(jid)))
      if (!spouseIds.has(target) && !guests.includes(target) && guests.length + 1 >= residentCapacity) {
        await saveDB(db)
        return m.reply(
          `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
          `│ ⚠️ *KAPASITAS PENGHUNI PENUH*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Kapasitas penghuni non-keluarga: ${residentCapacity}\n` +
          `> ↳ Upgrade rumah terlebih dahulu.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }
      home.blocked = home.blocked.filter(jid => normalizeJid(jid) !== target)
      if (!home.access.some(jid => normalizeJid(jid) === target)) home.access.push(target)
      await saveDB(db)
      return m.reply(
        `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
        `│ ✅ *UNDANGAN BERHASIL*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ @${target.split('@')[0]} berhasil diundang ke rumah.\n\n` +
        `─━━━━━━━━━━━━━━─`,
        null,
        { mentions: [target] }
      )
    }

    const members = getHomeMembers(rpg)
    const spouse = members.spouses.find(partner => normalizeJid(getPartnerJid(partner) || '') === target)
    home.access = home.access.filter(jid => normalizeJid(jid) !== target)
    home.visitors = home.visitors.filter(jid => normalizeJid(jid) !== target)
    if (targetAccount.rpg.lastVisitedHome === sender) delete targetAccount.rpg.lastVisitedHome
    if (!home.blocked.includes(target)) home.blocked.push(target)
    if (spouse) {
      rpg.harem = rpg.harem.filter(partner => partner !== spouse)
      const otherSpouse = (targetAccount.rpg.harem || []).find(partner =>
        normalizeJid(getPartnerJid(partner) || '') === sender
      )
      if (otherSpouse) targetAccount.rpg.harem = targetAccount.rpg.harem.filter(partner => partner !== otherSpouse)
      rpg.ex = Array.isArray(rpg.ex) ? rpg.ex : []
      targetAccount.rpg.ex = Array.isArray(targetAccount.rpg.ex) ? targetAccount.rpg.ex : []
      rpg.ex.push(spouse)
      if (otherSpouse) targetAccount.rpg.ex.push(otherSpouse)
    }
    await saveDB(db)
    const message = spouse
      ? `💔 @${target.split('@')[0]} dikeluarkan dari rumah. Konfirmasi ini juga mengakhiri hubungan pernikahan kalian.`
      : `🚫 Akses @${target.split('@')[0]} ke rumah berhasil dicabut.`
    return m.reply(
      `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
      `│ ${spouse ? '💔 *PENGHUNI DIKELUARKAN*' : '🚫 *AKSES DICABUT*'}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ${message}\n\n` +
      `─━━━━━━━━━━━━━━─`,
      null,
      { mentions: [target] }
    )
  }

  if (pending.type === 'hire' || pending.type === 'renew') {
    const staff = HOME_STAFF[pending.staff]
    const durationDays = Number(pending.durationDays)
    if (!staff ||
        !Number.isSafeInteger(durationDays) ||
        durationDays < 1 ||
        durationDays > HOME_STAFF_MAX_CONTRACT_DAYS) {
      await saveDB(db)
      return m.reply(
        `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
        `│ ❌ *DATA KONTRAK TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Tidak ada biaya yang dipotong.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    const price = getStaffCost(staff, premium, durationDays)
    if (price !== Number(pending.cost) || wallet() < price) {
      await saveDB(db)
      return m.reply(
        `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
        `│ ⚠️ *PEMBAYARAN DIBATALKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Biaya atau saldo berubah.\n` +
        `> ↳ Tidak ada pembayaran.\n` +
        `> ↳ Ulangi perintah staff untuk melihat biaya terbaru: ${money(price)}.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    let record = getStaffRecord(home, staff.name)
    if (pending.type === 'hire' && record && record.expiresAt > Date.now()) {
      await saveDB(db)
      return m.reply(
        `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
        `│ ⚠️ *STAFF MASIH AKTIF*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Gunakan ${prefix}home staff renew ${pending.staff} [durasi] untuk memperpanjang kontrak.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    const cooldownUntil = getHomeStaffCooldownUntil(record)
    if (record && record.expiresAt <= Date.now() && cooldownUntil > Date.now()) {
      await saveDB(db)
      return m.reply(
        `╭─❏「 ⏳ COOLDOWN STAFF 」❏\n` +
        `│ ⏳ *STAFF MASIH COOLDOWN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${staff.name} bisa disewa lagi dalam *${formatHomeStaffCooldown(cooldownUntil - Date.now())}*.\n` +
        `> ↳ Gunakan *${prefix}home staff cd* untuk melihat cooldown.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    setWallet(wallet() - price)
    if (!record) {
      record = { name: staff.name, key: pending.staff, hiredAt: Date.now(), expiresAt: 0, paid: 0 }
      home.staff.push(record)
    }
    record.key = pending.staff
    record.hiredAt = Date.now()
    record.expiresAt = getHomeStaffContractEnd(
      Math.max(Date.now(), Number(record.expiresAt) || 0),
      durationDays
    )
    record.contractDays = durationDays
    delete record.cooldownUntil
    record.paid = (Number(record.paid) || 0) + price
    await saveDB(db)
    return m.reply(
      `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
      `│ ✅ *KONTRAK ${pending.type === 'hire' ? 'DIBUAT' : 'DIPERPANJANG'}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `👤 *INFORMASI STAFF*\n` +
      `> ↳ Staff: ${staff.emoji} ${staff.name}\n` +
      `> ↳ Biaya: ${money(price)}\n` +
      `> ↳ Durasi: ${durationDays} hari\n` +
      `> ↳ Efek: ${staff.effect}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (pending.type === 'eat') {
    const total = Math.max(0, Number(pending.total) || 0)
    if (wallet() < total) {
      await saveDB(db)
      return m.reply(
        `╭─❏「 🍽️ MAKAN BERSAMA 」❏\n` +
        `│ ⚠️ *SALDO TIDAK MENCUKUPI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Saldo kurang dan tidak cukup untuk makanan chef (${money(total)}).\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    setWallet(wallet() - total)
    const members = getHomeMembers(rpg)
    const mealText = (pending.meals || []).map(meal => `${meal.emoji || '🍽️'} ${formatMasakanNama(meal.name)} x${meal.amount}`).join(', ')
    const story = HOME_CARE_STORIES.eat[Math.floor(Math.random() * HOME_CARE_STORIES.eat.length)]
    const previousHarmony = home.harmony
    home.harmony = clampHomeStat(home.harmony + HOME_EAT_HARMONY)
    const harmonyGained = home.harmony - previousHarmony
    for (const partner of members.spouses.slice(0, 2)) partner.love = Math.min(100, (Number(partner.love) || 0) + 1)
    for (const pet of members.pets.slice(0, 2)) pet.happy = clampHomeStat((Number(pet.happy) || 0) + 5)
    await saveDB(db)
    return m.reply(
      `╭─❏「 🍽️ MAKAN BERSAMA 」❏\n` +
      `│ ✅ *PRIVATE CHEF MENYAJIKAN MENU*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📖 *CERITA*\n` +
      `> ${story}\n\n` +
      `🍽️ *MENU MAKANAN*\n` +
      `> ↳ Menu: ${mealText}\n` +
      `> ↳ Biaya restoran: ${money(total)}\n\n` +
      `🏡 *KONDISI RUMAH*\n` +
      `> ↳ Harmony rumah: +${harmonyGained} (sekarang ${home.harmony}/100)\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }


    if (pending.type === 'fire') {
  const record = getStaffRecord(home, pending.name)
  if (!record) {
    await saveDB(db)
    return m.reply(
      `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
      `│ ❌ *STAFF TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }
  if (record.expiresAt <= Date.now()) {
    await saveDB(db)
    return m.reply(
      `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
      `│ ⚠️ *KONTRAK SUDAH TIDAK AKTIF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Staff ini sudah selesai kontrak dan sedang menjalani cooldown.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  record.expiresAt = Date.now()
  record.cooldownUntil = record.expiresAt + HOME_STAFF_COOLDOWN
  await saveDB(db)
  return m.reply(
    `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
    `│ ✅ *KONTRAK STAFF DIHENTIKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Staff: ${record.name}\n` +
    `> ↳ Kontrak dihentikan. Staff bisa disewa lagi setelah cooldown 2 jam.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (pending.type === 'hireAll') {
  if (!premium) {
    await saveDB(db)
    return m.reply(
      `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
      `│ ❌ *FITUR PREMIUM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Fitur staff hire all hanya tersedia untuk akun Premium.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  const durationDays = Number(pending.durationDays)
  const requestedKeys = Array.isArray(pending.staffKeys) ? pending.staffKeys : []
  if (!Number.isSafeInteger(durationDays) ||
      durationDays < 1 ||
      durationDays > HOME_STAFF_MAX_CONTRACT_DAYS ||
      !requestedKeys.length) {
    await saveDB(db)
    return m.reply(
      `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
      `│ ❌ *DATA KONTRAK TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Jalankan ulang perintah hire all.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  const missing = requestedKeys
    .filter(key => HOME_STAFF[key])
    .map(key => [key, HOME_STAFF[key]])
    .filter(([, staff]) => {
      const record = getStaffRecord(home, staff.name)
      return (!record || record.expiresAt <= Date.now()) &&
        getHomeStaffCooldownUntil(record) <= Date.now()
    })
  const total = missing.reduce((sum, [, staff]) =>
    sum + getStaffCost(staff, premium, durationDays), 0)
  if (missing.length !== requestedKeys.length ||
      total !== Number(pending.cost) ||
      wallet() < total) {
    await saveDB(db)
    return m.reply(
      `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
      `│ ⚠️ *PEMBAYARAN DIBATALKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Status staff, biaya, atau saldo berubah.\n` +
      `> ↳ Tidak ada pembayaran.\n` +
      `> ↳ Jalankan kembali perintah untuk melihat total terbaru: ${money(total)}.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  setWallet(wallet() - total)
  for (const [key, staff] of missing) {
    const record = getStaffRecord(home, staff.name) || { name: staff.name, key, hiredAt: Date.now(), expiresAt: 0, paid: 0 }
    if (!home.staff.includes(record)) home.staff.push(record)
    record.key = key
    record.hiredAt = Date.now()
    record.expiresAt = getHomeStaffContractEnd(
      Math.max(Date.now(), Number(record.expiresAt) || 0),
      durationDays
    )
    record.contractDays = durationDays
    delete record.cooldownUntil
    record.paid = (Number(record.paid) || 0) + getStaffCost(staff, premium, durationDays)
  }
  await saveDB(db)
  return m.reply(
    `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
    `│ ✅ *STAFF TERSEDIA BERHASIL DIAKTIFKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `👤 *INFORMASI KONTRAK*\n` +
    `> ↳ Staff direkrut: ${missing.length}\n` +
    `> ↳ Durasi: ${durationDays} hari\n` +
    `> ↳ Total biaya: ${money(total)}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}
}

const requestConfirmation = async (pending, summary) => {
  if (home.pendingConfirmation && Date.now() - Number(home.pendingConfirmation.createdAt || 0) <= HOME_CONFIRMATION_TTL) {
    return m.reply(
      `╭─❏「 ⚠️ KONFIRMASI RUMAH 」❏\n` +
      `│ ⚠️ *KONFIRMASI MASIH MENUNGGU*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Balas *${prefix}home yes* untuk melanjutkan.\n` +
      `> ↳ Balas *${prefix}home no* untuk membatalkan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  home.pendingConfirmation = { ...pending, createdAt: Date.now() }
  await saveDB(db)
  return m.reply(
    `╭─❏「 ⚠️ KONFIRMASI RUMAH 」❏\n` +
    `│ ⚠️ *PERIKSA SEBELUM MELANJUTKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${summary}\n\n` +
    `📌 *PILIHAN KONFIRMASI*\n` +
    `> ↳ Balas *${prefix}home yes* untuk melanjutkan.\n` +
    `> ↳ Balas *${prefix}home no* untuk membatalkan.\n` +
    `> ↳ Konfirmasi berlaku 5 menit.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (!mode) {
  return m.reply(
    `╭─❏「 🏠 HOME / RUMAH 」❏\n` +
    `│ 🏠 *HOME / RUMAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Fitur untuk mengatur rumah, memasang furniture, dan mengunjungi rumah pemain lain.\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ *${prefix}home guide*\n` +
    `> ↳ *${prefix}home command*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'info') {
  const homeComfort = comfort()
  const members = getHomeMembers(rpg)
  const aesthetics = getHomeAesthetics(home, furnitureInventory)
  const collectionCount = Object.values(furnitureInventory).reduce((total, count) => total + Math.max(0, Number(count) || 0), 0)
  const popularity = getHomePopularity(
    { ...home, aesthetics, security: getHomeSecurity(home) },
    homeComfort,
    members,
    collectionCount
  )

  const spouses = members.spouses.map(partner => {
    const jid = getPartnerJid(partner)
    const partnerAccount = jid ? getUser(db, jid) : null
    return { jid, name: partnerAccount?.name || partner?.name || 'Pasangan' }
  })

  const spouseList = spouses.length
    ? spouses.map((partner, index) =>
        `> ↳ ${index + 1}. ${partner.jid ? `@${partner.jid.split('@')[0]}` : partner.name}`
      ).join('\n')
    : '> ↳ Belum ada'

  const childList = members.children.length
    ? members.children.map((child, index) =>
        `> ↳ ${index + 1}. ${child.nama || child.name || 'Anak'}`
      ).join('\n')
    : '> ↳ Belum ada'

  const petList = members.pets.length
    ? members.pets.map((pet, index) =>
        `> ↳ ${index + 1}. ${pet.nickname || pet.tipe || pet.name || 'Pet'}`
      ).join('\n')
    : '> ↳ Belum ada'

  return m.reply(
    `╭─❏「 🏠 ${getHomeLevel(home.level).name.toUpperCase()} 」❏\n` +
    `│ 🏠 *INFORMASI RUMAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🏡 *PROFIL RUMAH*\n` +
    `> ↳ Status: ${home.public ? 'Publik' : 'Pribadi'}\n` +
    `> ↳ Tipe: *${getHomeLevel(home.level).name}*\n` +
    `> ↳ Level: ${home.level}/${HOME_MAX_UPGRADES}\n` +
    `> ↳ Barang untuk Comfort: ${homeComfort.furnitureCount}\n` +
    `> ↳ Kenyamanan: *Level ${homeComfort.level}* (${homeComfort.points} poin)\n` +
    `> ↳ Kapasitas pasang: ${home.furniture.length}/${capacity}\n` +
    `> ↳ Pajangan koleksi: ${home.trophies.length}\n\n` +
    `📊 *STATISTIK RUMAH*\n` +
    `> ↳ Harmony: ${home.harmony}/100\n` +
    `> ↳ Security: ${getHomeSecurity(home)}/100\n` +
    `> ↳ Hygiene: ${home.hygiene}/100\n` +
    `> ↳ Aesthetics: ${aesthetics}/100\n` +
    `> ↳ Popularity: ${popularity}/100\n` +
    `> ↳ Like: ${home.likes.length}\n` +
    `> ↳ Kunjungan: ${home.visitCount}\n\n` +
    `👥 *PENGHUNI*\n` +
    `> 💍 *Pasangan*\n` +
    `${spouseList}\n\n` +
    `> 👶 *Anak*\n` +
    `${childList}\n\n` +
    `> 🐾 *Pet*\n` +
    `${petList}\n\n` +
    `> 👔 Staff aktif: ${home.staff.filter(staff => staff.expiresAt > Date.now()).length}\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: spouses.map(partner => partner.jid).filter(Boolean) }
  )
}

if (mode === 'guide') {
  return m.reply(
    `╭─❏「 📖 HOME GUIDE 」❏\n` +
    `│ 📖 *PANDUAN HOME*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Atur privasi rumah, pasang barang dari inventori, undang teman, dan kunjungi rumah pemain lain.\n` +
    `> ↳ Semua barang Mall selain fashion dapat dipasang/dilepas dengan *${prefix}home pasang/lepas <item>*.\n` +
    `> ↳ Koleksi juga dapat dipajang/disimpan dengan *${prefix}home pajang/simpan <item>*.\n` +
    `> ↳ Furniture bisa dibeli melalui *${prefix}mall kategori furniture*.\n` +
    `> ↳ Setiap 5 furniture di inventori/barang yang terpasang atau setiap upgrade menaikkan 1 level kenyamanan.\n` +
    `> ↳ Upgrade rumah sampai level ${HOME_MAX_UPGRADES}; setiap level memiliki tipe dan kapasitas penghuni lebih besar.\n` +
    `> ↳ Penghuni inti (pasangan menikah dan pet) tidak mengurangi kapasitas tamu.\n` +
    `> ↳ Premium mendapat ${HOME_PREMIUM_CAPACITY_BONUS} kapasitas ekstra, diskon upgrade 20%, dan akses staff hire all.\n` +
    `> ↳ Gunakan .home stats guide untuk cara meningkatkan Harmony, Security, Hygiene, dan Aesthetics.\n\n` +
    `📌 *INFORMASI*\n` +
    `> ↳ Lihat daftar perintah: *${prefix}home command*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'command') {
  return m.reply(
    `╭─❏「 📋 HOME COMMAND 」❏\n` +
    `│ 📋 *DAFTAR COMMAND*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🏠 *RUMAH & BARANG*\n` +
    `> ↳ ${prefix}home guide — panduan rumah\n` +
    `> ↳ ${prefix}home command — daftar semua command\n` +
    `> ↳ ${prefix}home info — info rumah dan status\n` +
    `> ↳ ${prefix}home furniture — lihat barang yang terpasang\n` +
    `> ↳ ${prefix}home pasang/lepas <item> — pasang/lepas barang Mall selain fashion\n` +
    `> ↳ ${prefix}home pajangan — lihat koleksi yang dipajang\n` +
    `> ↳ ${prefix}home pajang/simpan <item> — pajang/simpan koleksi (alternatif pasang/lepas)\n` +
    `> ↳ ${prefix}home <kategori> list — lihat barang kategori yang dimiliki\n` +
    `> ↳ ${prefix}home upgrade [list/guide] — upgrade atau lihat tipe/biaya\n` +
    `> ↳ ${prefix}home stats [guide] — statistik dan panduan status rumah\n` +
    `> ↳ ${prefix}home masuk/pulang — masuk atau pulang ke rumah sendiri\n` +
    `> ↳ ${prefix}home keluar — keluar rumah\n` +
    `> ↳ ${prefix}home public/private — atur privasi rumah\n\n` +
    `🍽️ *AKTIVITAS & PERAWATAN*\n` +
    `> ↳ ${prefix}home act — aktivitas rumah (alias: activity/aktivitas; cooldown 5 menit)\n` +
    `> ↳ ${prefix}home eat <menu> [jumlah] — makan dari kulkas (alias: makan); Chef meminta konfirmasi\n` +
    `> ↳ ${prefix}home clean — bersihkan rumah\n` +
    `> ↳ ${prefix}home childcare — rawat anak\n` +
    `> ↳ ${prefix}home petcare — rawat pet\n` +
    `> ↳ ${prefix}home cd — lihat cooldown aktivitas\n\n` +
    `🏡 *STAFF RUMAH*\n` +
    `> ↳ ${prefix}home staff [guide] — panduan staff\n` +
    `> ↳ ${prefix}home staff list — daftar staff dan status (alias: data)\n` +
    `> ↳ ${prefix}home staff info <nama> — detail staff\n` +
    `> ↳ ${prefix}home staff hire <nama|all> [durasi 1-7] — sewa staff (all khusus Premium)\n` +
    `> ↳ ${prefix}home staff renew <nama> [durasi 1-7] — perpanjang kontrak\n` +
    `> ↳ ${prefix}home staff fire <nama> — berhentikan staff\n` +
    `> ↳ ${prefix}home staff cd — lihat cooldown staff\n` +
    `> ↳ ${prefix}home staff salary/contract — lihat gaji atau kontrak\n\n` +
    `🚪 *AKSES & INTERAKSI*\n` +
    `> ↳ ${prefix}home invite @user — undang pemain\n` +
    `> ↳ ${prefix}home kick @user — cabut akses pemain\n` +
    `> ↳ ${prefix}home visit @user — kunjungi rumah\n` +
    `> ↳ ${prefix}home favorite @user — simpan rumah favorit\n\n` +
    `> ↳ ${prefix}home tamu — lihat tamu terbaru\n` +
    `> ↳ ${prefix}home like — beri like pada rumah yang dikunjungi\n\n` +
    `🏘️ *JELAJAH RUMAH*\n` +
    `> ↳ ${prefix}home list — lihat rumah yang dapat dikunjungi\n` +
    `> ↳ ${prefix}home explore — lihat rumah publik\n` +
    `> ↳ ${prefix}home top — lihat rumah terpopuler\n\n` +
    `✅ *KONFIRMASI*\n` +
    `> ↳ ${prefix}home yes/no — lanjutkan atau batalkan aksi yang meminta konfirmasi\n\n` +
    `📦 Kategori barang: ${Object.keys(MALL_CATEGORIES).join(', ')} (fashion tidak dapat dipasang).\n` +
    `> ↳ Alias rumah: ${prefix}rumah\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const ownedCategory = MALL_CATEGORY_ALIASES[normalize(mode)]
if (ownedCategory && normalize(tokens[1]) === 'list') {
  const candidates = ownedCategory === 'koleksi'
    ? collectionItems
    : MALL_CATEGORIES[ownedCategory].items
  const items = candidates
    .map(item => ({
      ...item,
      count: Math.max(0, Number(furnitureInventory[item.id]) || 0) +
        home.furniture.filter(id => id === item.id).length +
        home.trophies.filter(id => id === item.id).length
    }))
    .filter(item => item.count > 0)
  return m.reply(
    `╭─❏「 ${MALL_CATEGORIES[ownedCategory].emoji} ${MALL_CATEGORIES[ownedCategory].label.toUpperCase()} 」❏\n` +
    `│ 📦 *BARANG YANG DIMILIKI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${items.map((item, index) => `> ${index + 1}. ${displayName(item)}\n> ↳ Jumlah: ${item.count}x`).join('\n\n') || '> ↳ Belum memiliki barang dari kategori ini.'}\n\n` +
    `📌 *BELANJA*\n` +
    `> ↳ ${prefix}mall ${ownedCategory} list\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'stats') {
  const members = getHomeMembers(rpg)
  const owned = Object.values(furnitureInventory).reduce((total, count) => total + Math.max(0, Number(count) || 0), 0)
  const aesthetics = getHomeAesthetics(home, furnitureInventory)
  const popularity = getHomePopularity(
    { ...home, aesthetics, security: getHomeSecurity(home) },
    comfort(),
    members,
    owned
  )
  if (normalize(tokens[1]) === 'guide' || normalize(tokens[1]) === 'panduan') {
    return m.reply(
      `╭─❏「 📖 PANDUAN HOME STATS 」❏\n` +
      `│ 📈 *CARA MENINGKATKAN STATUS RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🛋️ *COMFORT*\n` +
      `> ↳ Miliki furniture atau pasang barang non-fashion, lalu upgrade rumah.\n\n` +
      `💖 *HARMONY*\n` +
      `> ↳ Lakukan *${prefix}home eat*.\n` +
      `> ↳ Lakukan *${prefix}home act*.\n` +
      `> ↳ Gunakan *${prefix}home clean*.\n` +
      `> ↳ Gunakan *${prefix}home childcare*.\n` +
      `> ↳ Gunakan *${prefix}home petcare*.\n\n` +
      `🛡️ *SECURITY*\n` +
      `> ↳ Upgrade rumah atau sewa Bodyguard/Security Guard.\n\n` +
      `🧹 *HYGIENE*\n` +
      `> ↳ Gunakan ${prefix}home clean atau pulang dengan Housekeeper aktif.\n\n` +
      `🎨 *AESTHETICS*\n` +
      `> ↳ Pasang furniture/pajangan dan kumpulkan koleksi.\n` +
      `> ↳ Aesthetic Designer juga membantu.\n\n` +
      `⭐ *POPULARITY*\n` +
      `> ↳ Gabungan level rumah, status, kenyamanan, penghuni, dan koleksi.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  return m.reply(
    `╭─❏「 📊 HOME STATS 」❏\n` +
    `│ 📊 *STATISTIK RUMAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🏠 *INFORMASI RUMAH*\n` +
    `> ↳ Tipe: ${getHomeLevel(home.level).name}\n` +
    `> ↳ Level: ${home.level}/${HOME_MAX_UPGRADES}\n\n` +
    `📊 *STATUS RUMAH*\n` +
    `> ↳ Comfort: ${comfort().level} (${comfort().points} poin)\n` +
    `> ↳ Harmony: ${home.harmony}/100\n` +
    `> ↳ Security: ${getHomeSecurity(home)}/100\n` +
    `> ↳ Hygiene: ${home.hygiene}/100\n` +
    `> ↳ Aesthetics: ${aesthetics}/100\n` +
    `> ↳ Popularity: ${popularity}/100\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ ${prefix}home stats guide\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'furniture') {
  const placed = home.furniture.map(id => findItem(id)).filter(Boolean)
  const homeComfort = comfort()

  return m.reply(
    `╭─❏「 🏠 BARANG RUMAH 」❏\n` +
    `│ 🏠 *BARANG TERPASANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kapasitas : ${placed.length}/${capacity}\n` +
    `> ↳ Kenyamanan : *Level ${homeComfort.level}* (${homeComfort.points} poin)\n\n` +
    `${placed.length ? placed.map(item => `• *${displayName(item)}*`).join('\n') : '> ↳ Belum ada barang terpasang.'}\n\n` +
    `📌 *BARANG MALL*\n` +
    `> ↳ Pasang : ${prefix}home pasang <item>\n` +
    `> ↳ Lepas : ${prefix}home lepas <item>\n` +
    `> ↳ Semua kategori dapat dipasang kecuali fashion.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'pajangan') {
  const trophies = home.trophies.map(id => findItem(id)).filter(Boolean)
  return m.reply(
    `╭─❏「 🏆 PAJANGAN RUMAH 」❏\n` +
    `│ 🏆 *KOLEKSI YANG DIPAJANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${trophies.length ? trophies.map(item => `> ${displayName(item)}`).join('\n') : '> Belum ada koleksi yang dipajang.'}\n\n` +
    `> Pajangan rumah tidak dapat dijarah.\n` +
    `> ${prefix}home pasang <item> — pasang koleksi/barang Mall non-fashion\n` +
    `> ${prefix}home lepas <item> — lepas dan kembalikan ke inventori\n` +
    `> ${prefix}home pajang/simpan <item> — alias khusus koleksi\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'pajang' || mode === 'simpan') {
  const item = findItem(tokens.slice(1).join(' '), 'koleksi')
  if (!item) return m.reply('❌ Item koleksi tidak ditemukan. Gunakan *.cl list*, *.lelang list*, atau *.home pajangan*.')
  if (mode === 'pajang') {
    if ((Number(furnitureInventory[item.id]) || 0) < 1) return m.reply(`❌ Kamu belum memiliki ${item.name}.`)
    if (home.trophies.length >= 20) return m.reply('❌ Pajangan rumah sudah mencapai batas 20 item.')
    furnitureInventory[item.id]--
    if (!furnitureInventory[item.id]) delete furnitureInventory[item.id]
    home.trophies.push(item.id)
  } else {
    const index = home.trophies.indexOf(item.id)
    if (index < 0) return m.reply(`❌ ${item.name} tidak sedang dipajang di rumah.`)
    home.trophies.splice(index, 1)
    furnitureInventory[item.id] = (Number(furnitureInventory[item.id]) || 0) + 1
  }
  await saveDB(db)
  return m.reply(`✅ ${item.emoji} ${item.name} berhasil ${mode === 'pajang' ? 'dipajang di rumah' : 'disimpan kembali ke koleksi'}.`)
}

if (mode === 'pasang' || mode === 'lepas') {
  const item = findItem(tokens.slice(1).join(' '))
  const isCollectible = item && collectionItems.some(candidate => candidate.id === item.id)

  if (!item || item.category === 'fashion') {
    return m.reply(
      `╭─❏「 🏠 BARANG RUMAH 」❏\n` +
      `│ ❌ *BARANG TIDAK DAPAT DIPASANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Barang tidak ditemukan atau termasuk kategori fashion.\n` +
      `> ↳ Fashion dapat dipakai/dilepas melalui *${prefix}wardrobe*.\n` +
      `> ↳ Lihat daftar barang melalui *${prefix}mall kategori*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const installedItems = isCollectible ? home.trophies : home.furniture
  const index = installedItems.indexOf(item.id)

  if (mode === 'pasang') {
    if (!isCollectible && index !== -1) {
      return m.reply(
        `╭─❏「 🏠 PASANG BARANG 」❏\n` +
        `│ ⚠️ *SUDAH TERPASANG*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Barang itu sudah terpasang di rumah.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (isCollectible && home.trophies.length >= 20) {
      return m.reply('❌ Pajangan rumah sudah mencapai batas 20 item.')
    }

    if (!isCollectible && home.furniture.length >= capacity) {
      return m.reply(
        `╭─❏「 🏠 PASANG BARANG 」❏\n` +
        `│ ❌ *KAPASITAS PENUH*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kapasitas rumah : ${capacity} barang.\n` +
        `> ↳ Upgrade rumah atau gunakan Premium untuk kapasitas ekstra.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if ((Number(furnitureInventory[item.id]) || 0) < 1) {
      return m.reply(
        `╭─❏「 🏠 PASANG BARANG 」❏\n` +
        `│ ❌ *BARANG TIDAK DIMILIKI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kamu belum memiliki ${item.name}.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    furnitureInventory[item.id]--
    if (!furnitureInventory[item.id]) delete furnitureInventory[item.id]
    installedItems.push(item.id)
  } else {
    if (index === -1) {
      return m.reply(
        `╭─❏「 🏠 LEPAS BARANG 」❏\n` +
        `│ ❌ *BARANG TIDAK TERPASANG*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Barang itu tidak sedang terpasang di rumah.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    installedItems.splice(index, 1)
    furnitureInventory[item.id] = (Number(furnitureInventory[item.id]) || 0) + 1
  }

  await saveDB(db)

  return m.reply(
    `╭─❏「 🏠 BARANG RUMAH 」❏\n` +
    `│ ✅ *${mode === 'pasang' ? 'BARANG DIPASANG' : 'BARANG DILEPAS'}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Barang : ${displayName(item)}\n` +
    `> ↳ ${mode === 'pasang' ? 'Barang berhasil dipasang di rumah.' : 'Barang dikembalikan ke inventori.'}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'upgrade') {
  const level = Number(home.level) || 0

  if (normalize(tokens[1]) === 'list' || normalize(tokens[1]) === 'guide') {
    return m.reply(
      `╭─❏「 ⬆️ TIPE RUMAH 」❏\n` +
      `│ 🏠 *DAFTAR UPGRADE RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${HOME_LEVELS.slice(1).map(tier => {
        const price = Math.floor(tier.cost * (premium ? 1 - HOME_PREMIUM_UPGRADE_DISCOUNT : 1))
        return `🏠 *Level ${tier.level} — ${tier.name}*\n` +
          `> ↳ Biaya: ${money(price)}\n` +
          `> ↳ Kapasitas penghuni: ${HOME_BASE_CAPACITY + tier.level * HOME_UPGRADE_CAPACITY + (premium ? HOME_PREMIUM_CAPACITY_BONUS : 0)}\n` +
          `> ↳ Slot furniture: ${HOME_BASE_FURNITURE_CAPACITY + tier.level * HOME_UPGRADE_FURNITURE_CAPACITY + (premium ? HOME_PREMIUM_FURNITURE_BONUS : 0)}\n` +
          `> ↳ Security dasar: ${tier.security}/100`
      }).join('\n\n')}\n\n` +
      `📌 *INFORMASI*\n` +
      `> ↳ Premium mendapat diskon 20%.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (level >= HOME_MAX_UPGRADES) {
    return m.reply(
      `╭─❏「 ⬆️ UPGRADE RUMAH 」❏\n` +
      `│ ❌ *LEVEL MAKSIMUM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Rumah sudah mencapai level upgrade maksimum.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const nextTier = getHomeLevel(level + 1)
  const cost = Math.floor(nextTier.cost * (premium ? 1 - HOME_PREMIUM_UPGRADE_DISCOUNT : 1))

  if (wallet() < cost) {
    return m.reply(
      `╭─❏「 ⬆️ UPGRADE RUMAH 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Biaya upgrade: ${money(cost)}\n` +
      `> ↳ Saldo kamu: ${money(wallet())}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return requestConfirmation(
    { type: 'upgrade', fromLevel: level, cost },
    `> ↳ Upgrade ke *${nextTier.name}* (Level ${level + 1}).\n` +
    `> ↳ Biaya: *${money(cost)}*${premium ? ' (diskon Premium 20%)' : ''}.`
  )
}

if (mode === 'staff') {
  const action = normalize(tokens[1])
  const names = Object.keys(HOME_STAFF)
  const prettyNames = names.map(name => HOME_STAFF[name].name)

  if (!action || ['guide', 'command', 'panduan'].includes(action)) {
    return m.reply(
      `╭─❏「 🏡 HOME STAFF 」❏\n` +
      `│ 🏡 *PANDUAN STAFF RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Sewa staff untuk membantu merawat rumah, anak, pet, kesehatan, dan keamanan.\n` +
      `> ↳ Pilih durasi kontrak 1–${HOME_STAFF_MAX_CONTRACT_DAYS} hari (default 1 hari); hari dihitung mengikuti pergantian tanggal WIB, bukan 24 jam.\n` +
      `> ↳ Biaya dibayar di muka. Staff yang kontraknya selesai atau dipecat cooldown 2 jam.\n` +
      `> ↳ Tanpa Housekeeper gunakan *${prefix}home clean*.\n` +
      `> ↳ Tanpa Babysitter gunakan *${prefix}home childcare*.\n` +
      `> ↳ Tanpa Pet Sitter gunakan *${prefix}home petcare*.\n` +
      `> ↳ Private Chef menyajikan menu restoran mahal saat *${prefix}home eat*.\n` +
      `> ↳ Premium dapat memakai *${prefix}home staff hire all <durasi>*.\n\n` +
      `📌 *PERINTAH*\n` +
      `> ↳ ${prefix}home staff list\n` +
      `> ↳ ${prefix}home staff info <nama>\n` +
      `> ↳ ${prefix}home staff hire <nama> [durasi]\n` +
      `> ↳ ${prefix}home staff hire all <durasi> (Premium)\n` +
      `> ↳ ${prefix}home staff fire <nama>\n` +
      `> ↳ ${prefix}home staff renew <nama> [durasi]\n` +
      `> ↳ ${prefix}home staff cd\n` +
      `> ↳ ${prefix}home staff salary\n` +
      `> ↳ ${prefix}home staff contract\n\n` +
      `👥 *DAFTAR NAMA STAFF*\n` +
      `> ↳ ${prettyNames.join(', ')}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'cd') {
    const now = Date.now()
    const cooling = home.staff
      .map(record => ({
        record,
        cooldownUntil: getHomeStaffCooldownUntil(record, now)
      }))
      .filter(({ cooldownUntil }) => cooldownUntil > now)

    return m.reply(
      `╭─❏「 ⏳ COOLDOWN STAFF 」❏\n` +
      `│ ⏳ *COOLDOWN STAFF RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${cooling.map(({ record, cooldownUntil }) =>
        `> ↳ ${record.name}: bisa disewa lagi dalam *${formatHomeStaffCooldown(cooldownUntil - now)}*`
      ).join('\n') || '> ↳ Tidak ada staff yang sedang cooldown.'}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'data' || action === 'list') {
    return m.reply(
      `╭─❏「 🏡 STAFF RUMAH 」❏\n` +
      `│ 📋 *DAFTAR STAFF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${Object.entries(HOME_STAFF).map(([key, staff]) => {
        const record = getStaffRecord(home, staff.name)
        const now = Date.now()
        const active = record && record.expiresAt > now
        const cooldownUntil = getHomeStaffCooldownUntil(record, now)
        return `${staff.emoji} *${staff.name}*\n` +
          `> ↳ Status: ${active ? '✅ Aktif, ' + formatHomeDuration(record.expiresAt) : cooldownUntil > now ? `⏳ Cooldown ${formatHomeStaffCooldown(cooldownUntil - now)}` : '❌ Belum disewa'}\n` +
          `> ↳ Tugas: ${staff.effect}\n` +
          `> ↳ Hire 1 hari: ${money(getStaffCost(staff, premium))}\n` +
          `> ↳ Perintah: ${prefix}home staff hire ${key} [durasi]`
      }).join('\n\n')}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'info') {
    const input = normalize(tokens.slice(2).join(' '))
    const found = names.find(key => normalize(key) === input || normalize(HOME_STAFF[key].name) === input)

    if (!found) {
      return m.reply(
        `╭─❏「 🏡 STAFF INFO 」❏\n` +
        `│ ❌ *STAFF TIDAK DIKENAL*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Gunakan *${prefix}home staff list* untuk melihat daftar staff.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const staff = HOME_STAFF[found]
    const record = getStaffRecord(home, staff.name)

    return m.reply(
      `╭─❏「 ${staff.emoji} STAFF INFO 」❏\n` +
      `│ *${staff.name.toUpperCase()}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📋 *INFORMASI STAFF*\n` +
      `> ↳ Tugas: ${staff.effect}\n` +
      `> ↳ Biaya kontrak 1 hari: ${money(getStaffCost(staff, premium))}\n` +
      `> ↳ Status: ${record && record.expiresAt > Date.now() ? `Aktif (${formatHomeDuration(record.expiresAt)})` : getHomeStaffCooldownUntil(record) > Date.now() ? `Cooldown (${formatHomeStaffCooldown(getHomeStaffCooldownUntil(record) - Date.now())})` : 'Belum disewa / kontrak habis'}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'hire' || action === 'renew') {
    const hireArgs = tokens.slice(2)
    const durationToken = hireArgs[hireArgs.length - 1] || ''
    const hasDuration = /^-?\d+(?:\.\d+)?$/.test(durationToken)
    const durationDays = hasDuration
      ? Number(durationToken)
      : HOME_STAFF_DEFAULT_CONTRACT_DAYS
    const nameArgs = hasDuration ? hireArgs.slice(0, -1) : hireArgs
    const key = normalize(nameArgs.join(' '))

    if (!Number.isSafeInteger(durationDays) ||
        durationDays < 1 ||
        durationDays > HOME_STAFF_MAX_CONTRACT_DAYS) {
      return m.reply(
        `╭─❏「 🏡 HOME STAFF 」❏\n` +
        `│ ❌ *DURASI KONTRAK TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Durasi kontrak harus 1–${HOME_STAFF_MAX_CONTRACT_DAYS} hari.\n` +
        `> ↳ Contoh: ${prefix}home staff hire all 3\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (key === 'all' && action === 'hire') {
      if (!premium) {
        return m.reply(
          `╭─❏「 🏡 HOME STAFF 」❏\n` +
          `│ ❌ *FITUR KHUSUS PREMIUM*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Hire all hanya tersedia untuk Premium.\n` +
          `> ↳ Lihat informasi: *${prefix}premium*.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      const now = Date.now()
      const missing = Object.entries(HOME_STAFF).filter(([, staff]) => {
        const record = getStaffRecord(home, staff.name)
        return (!record || record.expiresAt <= now) &&
          getHomeStaffCooldownUntil(record, now) <= now
      })
      const cooling = Object.values(HOME_STAFF).filter(staff => {
        const record = getStaffRecord(home, staff.name)
        return record && record.expiresAt <= now &&
          getHomeStaffCooldownUntil(record, now) > now
      })

      if (!missing.length) {
        return m.reply(
          `╭─❏「 🏡 HOME STAFF 」❏\n` +
          `│ ${cooling.length ? '⏳ *STAFF SEDANG COOLDOWN*' : '✅ *SEMUA STAFF AKTIF*'}\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Tidak ada staff yang bisa direkrut saat ini.\n` +
          `${cooling.length ? `> ↳ Lihat waktu cooldown: ${prefix}home staff cd\n\n` : '\n'}` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      const total = missing.reduce((sum, [, staff]) =>
        sum + getStaffCost(staff, premium, durationDays), 0)
      const staffKeys = missing.map(([staffKey]) => staffKey)

      return requestConfirmation(
        { type: 'hireAll', staffKeys, durationDays, cost: total },
        `> ↳ Rekrut ${missing.length} staff untuk ${durationDays} hari.\n` +
        `${cooling.length ? `> ↳ ${cooling.length} staff yang cooldown akan dilewati.\n` : ''}` +
        `> ↳ Total biaya: *${money(total)}* (diskon Premium termasuk).`
      )
    }

    const staffKey = names.find(name => normalize(name) === key || normalize(HOME_STAFF[name].name) === key)

    if (!staffKey) {
      return m.reply(
        `╭─❏「 🏡 HOME STAFF 」❏\n` +
        `│ ❌ *NAMA STAFF TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pilihan: ${prettyNames.join(', ')}.\n` +
        `> ↳ Format: ${prefix}home staff ${action} <nama> [durasi 1-${HOME_STAFF_MAX_CONTRACT_DAYS}]\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const staff = HOME_STAFF[staffKey]
    const record = getStaffRecord(home, staff.name)

    if (action === 'hire' && record && record.expiresAt > Date.now()) {
      return m.reply(
        `╭─❏「 🏡 HOME STAFF 」❏\n` +
        `│ ⚠️ *STAFF MASIH AKTIF*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${staff.name} masih aktif.\n` +
        `> ↳ Gunakan *${prefix}home staff renew ${staffKey} [durasi]* untuk memperpanjang kontrak.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (action === 'renew' && !record) {
      return m.reply(
        `╭─❏「 🏡 HOME STAFF 」❏\n` +
        `│ ❌ *STAFF BELUM PERNAH DISEWA*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Gunakan *${prefix}home staff hire ${staffKey} [durasi]* untuk menyewa staff.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const cooldownUntil = getHomeStaffCooldownUntil(record)
    if (record && record.expiresAt <= Date.now() && cooldownUntil > Date.now()) {
      return m.reply(
        `╭─❏「 ⏳ COOLDOWN STAFF 」❏\n` +
        `│ ⏳ *STAFF MASIH COOLDOWN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${staff.name} bisa disewa lagi dalam *${formatHomeStaffCooldown(cooldownUntil - Date.now())}*.\n` +
        `> ↳ Gunakan *${prefix}home staff cd* untuk melihat cooldown.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const price = getStaffCost(staff, premium, durationDays)

    if (wallet() < price) {
      return m.reply(
        `╭─❏「 💰 HOME STAFF 」❏\n` +
        `│ ❌ *UANG TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Biaya: ${money(price)}\n` +
        `> ↳ Saldo: ${money(wallet())}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    return requestConfirmation(
      { type: action, staff: staffKey, durationDays, cost: price },
      `> ↳ ${action === 'hire' ? 'Sewa' : 'Perpanjang'} ${staff.emoji} *${staff.name}* selama ${durationDays} hari.\n` +
      `> ↳ Total biaya: *${money(price)}*${premium ? ' (diskon Premium 10%)' : ''}.\n` +
      `> ↳ Tugas: ${staff.effect}`
    )
  }

  if (action === 'fire') {
    const input = normalize(tokens.slice(2).join(' '))
    const record = home.staff.find(staff => normalize(staff.name) === input || normalize(staff.key) === input)

    if (!record) {
      return m.reply(
        `╭─❏「 🏡 HOME STAFF 」❏\n` +
        `│ ❌ *STAFF TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Gunakan *${prefix}home staff list* untuk melihat daftar staff.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (record.expiresAt <= Date.now()) {
      return m.reply(
        `╭─❏「 🏡 HOME STAFF 」❏\n` +
        `│ ⚠️ *KONTRAK STAFF SUDAH TIDAK AKTIF*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Staff yang kontraknya selesai otomatis masuk cooldown.\n` +
        `> ↳ Gunakan *${prefix}home staff cd* untuk melihat sisanya.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    return requestConfirmation(
      { type: 'fire', name: record.name },
      `> ↳ Hentikan kontrak *${record.name}*?`
    )
  }

  if (action === 'salary') {
    const activeStaff = home.staff.filter(staff => staff.expiresAt > Date.now())
    const paidTotal = activeStaff.reduce((sum, staff) => sum + (Number(staff.paid) || 0), 0)

    return m.reply(
      `╭─❏「 💰 GAJI STAFF 」❏\n` +
      `│ 💰 *STATUS BIAYA STAFF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `👥 *DAFTAR STAFF*\n` +
      `${home.staff.map(staff =>
        `> ↳ ${staff.name}: ${staff.expiresAt > Date.now() ? `kontrak ${staff.contractDays || 1} hari; total biaya ${money(staff.paid)}` : 'Kontrak habis'}`
      ).join('\n') || '> ↳ Belum ada staff.'}\n\n` +
      `💰 *RINGKASAN PEMBAYARAN*\n` +
      `> ↳ Total biaya kontrak staff aktif: ${money(paidTotal)}\n` +
      `> ↳ Perpanjang kontrak dengan ${prefix}home staff renew <nama> [durasi].\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'contract') {
    return m.reply(
      `╭─❏「 📄 KONTRAK STAFF 」❏\n` +
      `│ 📄 *KONTRAK RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${home.staff.map(staff =>
        `👥 *${staff.name}*\n` +
        `> ↳ Sisa kontrak: ${formatHomeDuration(staff.expiresAt)}\n` +
        `> ↳ Berakhir: ${staff.expiresAt ? new Date(staff.expiresAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-'}\n` +
        `${getHomeStaffCooldownUntil(staff) > Date.now() ? `> ↳ Bisa disewa lagi dalam ${formatHomeStaffCooldown(getHomeStaffCooldownUntil(staff) - Date.now())}` : ''}`
      ).join('\n\n') || '> ↳ Belum ada kontrak staff.'}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(
    `╭─❏「 🏡 HOME STAFF 」❏\n` +
    `│ 📌 *MENU HOME STAFF*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${prefix}home staff guide\n` +
    `> ↳ ${prefix}home staff list\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'act' || mode === 'activity' || mode === 'aktivitas') {
  if (!home.inside) {
    return m.reply(
      `╭─❏「 🏡 AKTIVITAS RUMAH 」❏\n` +
      `│ 🚪 *BELUM BERADA DI RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Gunakan *${prefix}home masuk* terlebih dahulu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const remaining = HOME_ACTIVITY_COOLDOWN - (Date.now() - Number(home.lastActivityAt || 0))

  if (remaining > 0) {
    return m.reply(
      `╭─❏「 ⏳ AKTIVITAS RUMAH 」❏\n` +
      `│ ⏳ *COOLDOWN AKTIF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Aktivitas rumah bisa digunakan lagi dalam ${Math.ceil(remaining / 1000)} detik.\n` +
      `> ↳ Gunakan *${prefix}home cd* untuk melihat waktu tersisa.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const members = getHomeMembers(rpg)
  const canCollect = home.furniture.length + home.trophies.length + Object.values(furnitureInventory).reduce((sum, count) => sum + (Number(count) || 0), 0) > 0
  const eligible = ['solo']
  if (members.spouses.length) eligible.push('relationship')
  if (members.pets.length) eligible.push('pet')
  if (members.spouses.length && members.pets.length) eligible.push('family')
  if (canCollect) eligible.push('collection')
  if (members.spouses.length && members.pets.length && canCollect) eligible.push('everything')
  const type = eligible[Math.floor(Math.random() * eligible.length)]
  const stories = HOME_STORIES[type]
  const story = stories[Math.floor(Math.random() * stories.length)]
  const chosen = (items, limit = 2) => [...items].sort(() => Math.random() - 0.5).slice(0, Math.min(limit, items.length))
  const involvedPartners = ['relationship', 'family', 'everything'].includes(type) ? chosen(members.spouses) : []
  const involvedPets = ['pet', 'family', 'everything'].includes(type) ? chosen(members.pets) : []
  const involvedChildren = ['family', 'everything'].includes(type) ? chosen(members.children) : []
  const heldItems = Object.entries(furnitureInventory)
    .filter(([, count]) => Number(count) > 0)
    .map(([id, count]) => ({ id, count: Number(count), source: 'inventori' }))
  const placedItems = home.furniture.map(id => ({ id, count: 1, source: 'terpasang' }))
  const displayedItems = home.trophies.map(id => ({ id, count: 1, source: 'pajangan' }))
  const involvedItems = ['collection', 'everything'].includes(type)
    ? chosen([...heldItems, ...placedItems, ...displayedItems], 3)
    : []
  home.harmony = clampHomeStat(home.harmony + story.harmony)
  if (story.aesthetics) home.aesthetics = clampHomeStat(home.aesthetics + story.aesthetics)

  const relationshipRewards = involvedPartners.map(partner => {
    partner.love = Math.min(100, (Number(partner.love) || 0) + (story.love || 0))
    const jid = getPartnerJid(partner)
    const profile = jid ? global.db?.data?.users?.[jid] : null
    return {
      jid,
      name: profile?.name || partner.name || 'Pasangan',
      love: partner.love
    }
  })

  const petRewards = []

  for (const pet of involvedPets) {
    pet.happy = clampHomeStat((Number(pet.happy) || 0) + (story.petHappy || 0))
    pet.exp = (Number(pet.exp) || 0) + 5
    petRewards.push({ name: pet.nickname || pet.tipe || pet.name || 'Pet', happy: pet.happy })
  }

  home.lastActivityAt = Date.now()
  await saveDB(db)

  const partnerMentions = relationshipRewards.map(partner => partner.jid).filter(Boolean)
  const itemDetails = involvedItems.map(({ id, count, source }) => {
    const item = findItem(id)
    return `> ↳ ${displayName(item || { emoji: '📦', name: id })} (${source}${count > 1 ? `, ${count}x` : ''})`
  })

  const categoryLabel = {
    solo: 'AKTIVITAS SENDIRI',
    relationship: 'BERSAMA PASANGAN',
    pet: 'BERSAMA PET',
    family: 'BERSAMA KELUARGA & PET',
    collection: 'BERSAMA FURNITURE & KOLEKSI',
    everything: 'BERSAMA SEMUA PENGHUNI & BARANG'
  }[type]

  return m.reply(
    `╭─❏「 🎲 AKTIVITAS RUMAH 」❏\n` +
    `│ 🎲 *${categoryLabel}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ${story.text}\n\n` +
    `👤 *PENGHUNI YANG IKUT*\n` +
    `> ↳ Kamu: ${m.pushName || 'Pemilik rumah'}\n` +
    `${relationshipRewards.length ? `> ↳ Pasangan: ${relationshipRewards.map(partner => partner.name).join(', ')}\n` : ''}` +
    `${involvedChildren.length ? `> ↳ Anak: ${involvedChildren.map(child => child.nama || child.name || 'Anak').join(', ')}\n` : ''}` +
    `${petRewards.length ? `> ↳ Pet: ${petRewards.map(pet => pet.name).join(', ')}\n` : ''}` +
    `${itemDetails.length ? `\n🪑 *BARANG YANG DILIBATKAN*\n${itemDetails.join('\n')}\n` : ''}\n` +
    `📊 *HASIL AKTIVITAS*\n` +
    `> ↳ Harmony rumah: +${story.harmony} (sekarang ${home.harmony}/100)\n` +
    `${relationshipRewards.length ? `> ↳ Love pasangan: ${relationshipRewards.map(partner => `${partner.name} +${story.love || 0} (sekarang ${partner.love}/100)`).join('; ')}\n` : ''}` +
    `${petRewards.length ? `> ↳ Kebahagiaan pet: ${petRewards.map(pet => `${pet.name} +${story.petHappy || 0} (sekarang ${pet.happy}/100)`).join('; ')}\n` : ''}` +
    `${story.aesthetics ? `> ↳ Aesthetics: +${story.aesthetics}\n` : ''}\n` +
    `⏳ *COOLDOWN*\n` +
    `> ↳ 5 menit.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: partnerMentions }
  )
}

if (mode === 'cd') {
  const remaining = Math.max(0, HOME_ACTIVITY_COOLDOWN - (Date.now() - Number(home.lastActivityAt || 0)))

  return m.reply(
    `╭─❏「 ⏱️ HOME COOLDOWN 」❏\n` +
    `│ ⏱️ *COOLDOWN AKTIVITAS RUMAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Status: ${remaining ? '⏳ Cooldown aktif' : '✅ Siap digunakan'}\n` +
    `> ↳ Waktu tersisa: ${remaining ? `${Math.ceil(remaining / 1000)} detik` : 'Tidak ada'}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'eat' || mode === 'makan') {
  if (!home.inside) {
    return m.reply(
      `╭─❏「 🍽️ MAKAN DI RUMAH 」❏\n` +
      `│ 🚪 *BELUM BERADA DI RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Gunakan *${prefix}home masuk* terlebih dahulu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const chef = home.staff.some(staff => staff.key === 'private chef' && staff.expiresAt > Date.now())
  let meals
  let total = 0

  if (chef) {
    const premiumMenus = Object.entries(hargaBeli)
      .filter(([key, menu]) => masakanResep[key] && Number(menu.harga) >= 500000)
      .sort((a, b) => Number(b[1].harga) - Number(a[1].harga))
      .slice(0, 12)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 3))

    meals = premiumMenus.map(([name, menu]) => ({
      name,
      emoji: menu.emoji || '🍽️',
      amount: 1 + Math.floor(Math.random() * 3),
      price: Math.floor(Number(menu.harga) * 1.5)
    }))

    total = meals.reduce((sum, meal) => sum + meal.price * meal.amount, 0)

    if (!meals.length) {
      return m.reply(
        `╭─❏「 👨‍🍳 PRIVATE CHEF 」❏\n` +
        `│ ❌ *MENU BELUM TERSEDIA*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Menu restoran premium belum tersedia.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (wallet() < total) {
      return m.reply(
        `╭─❏「 👨‍🍳 PRIVATE CHEF 」❏\n` +
        `│ ❌ *SALDO TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Total biaya menu: ${money(total)}\n` +
        `> ↳ Saldo kamu: ${money(wallet())}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    home.pendingConfirmation = { type: 'eat', meals, total, createdAt: Date.now() }
    await saveDB(db)

    return m.reply(
      `╭─❏「 👨‍🍳 PRIVATE CHEF 」❏\n` +
      `│ ⚠️ *KONFIRMASI MENU RESTORAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🍽️ *DAFTAR HIDANGAN*\n` +
      `${meals.map(meal => `> ↳ ${meal.emoji} ${formatMasakanNama(meal.name)} x${meal.amount}`).join('\n')}\n\n` +
      `💰 *TOTAL PEMBAYARAN*\n` +
      `> ↳ Total: *${money(total)}*\n\n` +
      `📌 *KONFIRMASI PESANAN*\n` +
      `> ↳ Balas *${prefix}home yes* untuk memesan.\n` +
      `> ↳ Balas *${prefix}home no* untuk membatalkan.\n` +
      `> ↳ Konfirmasi berlaku selama 5 menit.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!tokens[1]) {
    return m.reply(
      `╭─❏「 🍽️ MAKAN DI RUMAH 」❏\n` +
      `│ 📌 *FORMAT PESANAN MAKANAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Format: *${prefix}home eat nama_masakan jumlah, nama_lain jumlah*\n` +
      `> ↳ Tanpa Private Chef, makanan harus tersedia di kulkas RPG-mu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const entries = tokens.slice(1).join(' ').split(',').map(entry => entry.trim()).filter(Boolean)
  meals = []

  for (const entry of entries) {
    const match = entry.match(/^(.*?)\s+(\d+)$/)
    const input = match ? match[1] : entry
    const amount = match ? Number(match[2]) : 1
    const name = normalizeMasakanKey(input)

    if (!masakanResep[name]) {
      return m.reply(
        `╭─❏「 🍽️ MAKAN DI RUMAH 」❏\n` +
        `│ ❌ *MENU TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Menu *${input}* tidak ditemukan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 50) {
      return m.reply(
        `╭─❏「 🍽️ MAKAN DI RUMAH 」❏\n` +
        `│ ❌ *JUMLAH MAKANAN TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Jumlah makanan harus 1–50 per jenis.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if ((Number(rpg.masakan?.[name]) || 0) < amount) {
      return m.reply(
        `╭─❏「 🍽️ MAKAN DI RUMAH 」❏\n` +
        `│ ❌ *STOK MAKANAN TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Stok ${formatMasakanNama(name)} di kulkas tidak cukup.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    meals.push({ name, amount, emoji: masakanResep[name].emoji || '🍽️' })
  }

  for (const meal of meals) {
    rpg.masakan[meal.name] -= meal.amount
    if (rpg.masakan[meal.name] <= 0) delete rpg.masakan[meal.name]
  }

  const members = getHomeMembers(rpg)
  const story = HOME_CARE_STORIES.eat[Math.floor(Math.random() * HOME_CARE_STORIES.eat.length)]
  const previousHarmony = home.harmony
  home.harmony = clampHomeStat(home.harmony + HOME_EAT_HARMONY)
  const harmonyGained = home.harmony - previousHarmony

  for (const partner of members.spouses.slice(0, 2)) partner.love = Math.min(100, (Number(partner.love) || 0) + 1)
  for (const pet of members.pets.slice(0, 2)) pet.happy = clampHomeStat((Number(pet.happy) || 0) + 5)

  await saveDB(db)

  return m.reply(
    `╭─❏「 🍽️ MAKAN BERSAMA 」❏\n` +
    `│ ✅ *HIDANGAN DARI KULKAS*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ${story}\n\n` +
    `🍱 *MENU MAKANAN*\n` +
    `> ↳ ${meals.map(meal => `${meal.emoji} ${formatMasakanNama(meal.name)} x${meal.amount}`).join('\n> ↳ ')}\n\n` +
    `📊 *HASIL AKTIVITAS*\n` +
    `> ↳ Harmony rumah: +${harmonyGained} (sekarang ${home.harmony}/100)\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'clean' || mode === 'childcare' || mode === 'petcare') {
  if (mode === 'clean' && home.staff.some(staff => staff.key === 'housekeeper' && staff.expiresAt > Date.now())) {
    return m.reply(
      `╭─❏「 🧹 PERAWATAN RUMAH 」❏\n` +
      `│ ✅ *HOUSEKEEPER AKTIF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Hygiene rumah akan dirawat saat kamu pulang.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const members = getHomeMembers(rpg)

  if (mode === 'childcare' && !members.children.length) {
    return m.reply(
      `╭─❏「 👶 PERAWATAN ANAK 」❏\n` +
      `│ ❌ *BELUM ADA ANAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Belum ada anak yang dapat diurus.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'petcare' && !members.pets.length) {
    return m.reply(
      `╭─❏「 🐾 PERAWATAN PET 」❏\n` +
      `│ ❌ *BELUM MEMILIKI PET*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu belum memiliki pet.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const story = HOME_CARE_STORIES[mode][Math.floor(Math.random() * HOME_CARE_STORIES[mode].length)]

  if (mode === 'clean') home.hygiene = clampHomeStat(home.hygiene + 20)

  if (mode === 'childcare') {
    const tutor = home.staff.some(staff => staff.key === 'tutor' && staff.expiresAt > Date.now())
    home.harmony = clampHomeStat(home.harmony + 10 + (tutor ? 5 : 0))
    members.children.forEach(child => {
      child.careCount = (Number(child.careCount) || 0) + 1
      const parent = (rpg.harem || []).find(partner => partner.name === child.ortu)
      if (parent) parent.exp = (Number(parent.exp) || 0) + 20 + child.careCount
    })
  }

  if (mode === 'petcare') {
    home.harmony = clampHomeStat(home.harmony + 8)
    members.pets.forEach(pet => {
      pet.happy = clampHomeStat((Number(pet.happy) || 0) + 15)
      pet.exp = (Number(pet.exp) || 0) + 10
    })
  }

  await saveDB(db)

  return m.reply(
    `╭─❏「 🏡 PERAWATAN RUMAH 」❏\n` +
    `│ ✅ *${mode.toUpperCase()}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ${story}\n\n` +
    `${mode === 'childcare' && home.staff.some(staff => staff.key === 'babysitter' && staff.expiresAt > Date.now()) ? `👶 *BANTUAN STAFF*\n> ↳ Babysitter membantu mengurus seluruh anak.\n\n` : ''}` +
    `${mode === 'childcare' && home.staff.some(staff => staff.key === 'tutor' && staff.expiresAt > Date.now()) ? `🎓 *BANTUAN STAFF*\n> ↳ Tutor mendampingi anak; Harmony rumah mendapat bonus +5.\n\n` : ''}` +
    `${mode === 'petcare' && home.staff.some(staff => staff.key === 'pet sitter' && staff.expiresAt > Date.now()) ? `🐾 *BANTUAN STAFF*\n> ↳ Pet Sitter membantu merawat seluruh pet.\n\n` : ''}` +
    `📊 *HASIL PERAWATAN*\n` +
    `${mode === 'clean' ? `> ↳ Hygiene: ${home.hygiene}/100\n` : ''}` +
    `${mode !== 'clean' ? `> ↳ Harmony rumah: ${home.harmony}/100\n> ↳ Total penghuni yang dirawat: ${mode === 'childcare' ? members.children.length : members.pets.length}\n` : ''}\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'public' || mode === 'private') {
  home.public = mode === 'public'

  await saveDB(db)

  return m.reply(
    `╭─❏「 🏠 PRIVASI RUMAH 」❏\n` +
    `│ ${home.public ? '🌐' : '🔒'} *PRIVASI DIPERBARUI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Rumah sekarang ${home.public ? 'terbuka untuk umum' : 'pribadi'}.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'masuk' || mode === 'pulang') {
  leaveVisitedHome()
  home.inside = true
  home.visitors = [sender, ...home.visitors.filter(jid => jid !== sender)].slice(0, 20)
  const staffActive = key => home.staff.some(staff => staff.key === key && staff.expiresAt > Date.now())
  let nurseStory = ''

  if (mode === 'pulang' && staffActive('private nurse')) {
    const maxHealth = Math.max(1, Number(rpg.maxDarah) || 100)
    const healed = Math.max(0, maxHealth - (Number(rpg.darah) || 0))
    rpg.darah = maxHealth
    nurseStory = `\n> ↳ Private Nurse menyambutmu dan merawat luka; darah pulih ${healed} HP (${rpg.darah}/${maxHealth}).`
  }

  if (mode === 'pulang' && staffActive('housekeeper')) home.hygiene = clampHomeStat(home.hygiene + 2)
  if (mode === 'pulang' && staffActive('gardener')) home.hygiene = clampHomeStat(home.hygiene + 4)

  await saveDB(db)

  const homeComfort = comfort()

  return m.reply(
    `╭─❏「 🏠 RUMAH SENDIRI 」❏\n` +
    `│ 🏠 *KAMU BERADA DI RUMAH SENDIRI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kenyamanan : *Level ${homeComfort.level}* (${homeComfort.points} poin)\n` +
    `> ↳ Barang terpasang : ${home.furniture.length}/${capacity}\n\n` +
    `${mode === 'pulang' && staffActive('housekeeper') ? `> ↳ Housekeeper merapikan rumah; Hygiene ${home.hygiene}/100.\n` : ''}` +
    `${mode === 'pulang' && staffActive('gardener') ? `> ↳ Gardener merawat taman dan kebersihan; Hygiene ${home.hygiene}/100.\n` : ''}` +
    `${nurseStory}\n` +

    `${home.furniture.length ? home.furniture.map(id => `📦 *${findItem(id)?.name || id}*`).join('\n') : '> ↳ Belum ada barang terpasang.'}\n` +
    `${home.trophies.length ? `\n🏆 *PAJANGAN*\n${home.trophies.map(id => `> ${displayName(findItem(id) || { emoji: '📦', name: id })}`).join('\n')}\n` : ''}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'keluar') {
  leaveVisitedHome()
  home.inside = false
  home.visitors = home.visitors.filter(jid => jid !== sender)

  await saveDB(db)

  return m.reply(
    `╭─❏「 🚪 KELUAR RUMAH 」❏\n` +
    `│ 🚪 *KAMU SUDAH KELUAR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu sudah keluar dari rumah.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'invite' || mode === 'kick' || mode === 'visit' || mode === 'favorite') {
  const { target } = mentionsOrReply(m, tokens.slice(1))

  if (!target) {
    return m.reply(
      `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
      `│ ❌ *TARGET TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tag atau reply pemain.\n` +
      `> ↳ Contoh : *${prefix}home ${mode} @user*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (target === sender) {
    return m.reply(
      `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
      `│ ❌ *TARGET TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pilih pemain lain, bukan diri sendiri.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const targetAccount = getUser(db, target)

  if (!targetAccount?.rpg) {
    return m.reply(
      `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
      `│ ❌ *DATA RPG TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pemain tersebut belum memiliki data RPG.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const targetHome = getHome(targetAccount.rpg)

  if (mode === 'invite') {
    if (home.access.includes(target) && !home.blocked?.includes(target)) {
      return m.reply(
        `╭─❏「 📩 UNDANG PEMAIN 」❏\n` +
        `│ ⚠️ *SUDAH MEMILIKI AKSES*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pemain ini sudah memiliki akses rumah.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const members = getHomeMembers(rpg)
    const spouseIds = new Set(members.spouses.map(getPartnerJid).filter(Boolean).map(normalizeJid))
    const guests = [...new Set([...home.access, ...home.visitors])]
      .filter(jid => !spouseIds.has(normalizeJid(jid)))
    if (!spouseIds.has(target) && !guests.includes(target) && guests.length + 1 >= residentCapacity) {
      return m.reply(`❌ Kapasitas penghuni non-keluarga penuh (${residentCapacity}). Upgrade rumah terlebih dahulu.`)
    }
    return requestConfirmation(
      { type: 'invite', target },
      `> ↳ Undang @${target.split('@')[0]} ke rumah.\n> ↳ Kapasitas orang: ${guests.length + 1}/${residentCapacity} (pasangan dan pet tidak dihitung).`
    )
  }

  if (mode === 'kick') {
    const spouse = getHomeMembers(rpg).spouses.find(partner =>
      normalizeJid(getPartnerJid(partner) || '') === target
    )
    if (!home.access.includes(target) && !home.visitors.includes(target) && !spouse) {
      return m.reply(
        `╭─❏「 🚫 CABUT AKSES 」❏\n` +
        `│ ❌ *PEMAIN TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pemain tersebut tidak sedang berkunjung atau memiliki akses.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    return requestConfirmation(
      { type: 'kick', target },
      spouse
        ? `> ↳ Keluarkan @${target.split('@')[0]} dari rumah.\n> ↳ Perhatian: karena statusnya pasangan suami/istri, konfirmasi ini juga memutuskan hubungan dan menghapus status pasangan.`
        : `> ↳ Cabut akses rumah @${target.split('@')[0]}?`
    )
  }

  if (mode === 'favorite') {
    if (!Array.isArray(rpg.favoriteHomes)) rpg.favoriteHomes = []
    if (!rpg.favoriteHomes.includes(target)) rpg.favoriteHomes.push(target)

    await saveDB(db)

    return m.reply(
      `╭─❏「 ⭐ RUMAH FAVORIT 」❏\n` +
      `│ ⭐ *DITAMBAHKAN KE FAVORIT*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Rumah @${target.split('@')[0]} ditambahkan ke favorit.\n\n` +
      `─━━━━━━━━━━━━━━─`,
      null,
      { mentions: [target] }
    )
  }

  if (targetHome.blocked?.includes(sender)) {
    return m.reply(
      `╭─❏「 🚫 KUNJUNGAN DITOLAK 」❏\n` +
      `│ 🚫 *AKSES DICABUT PEMILIK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pemilik rumah telah mencabut akses kunjunganmu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const targetMembers = getHomeMembers(targetAccount.rpg)
  const targetSpouseIds = new Set(targetMembers.spouses.map(getPartnerJid).filter(Boolean).map(normalizeJid))
  if (!targetHome.public && !targetHome.access.includes(sender) && !targetSpouseIds.has(sender)) {
    return m.reply(
      `╭─❏「 🔒 RUMAH PRIBADI 」❏\n` +
      `│ 🔒 *AKSES TIDAK TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Rumah ini pribadi. Minta pemilik mengundangmu terlebih dahulu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const currentGuests = [...new Set([...targetHome.access, ...targetHome.visitors])]
    .filter(jid => !targetSpouseIds.has(normalizeJid(jid)))
  if (!targetSpouseIds.has(sender) && !currentGuests.some(jid => normalizeJid(jid) === sender)) {
    const targetPremium = isPremiumAccount(global.db?.data?.users?.[target])
    const targetCapacity = HOME_BASE_CAPACITY + targetHome.level * HOME_UPGRADE_CAPACITY +
      (targetPremium ? HOME_PREMIUM_CAPACITY_BONUS : 0)
    if (currentGuests.length + 1 >= targetCapacity) {
      return m.reply(`❌ Kapasitas penghuni non-keluarga rumah ini penuh (${targetCapacity}).`)
    }
  }

  if (rpg.lastVisitedHome && rpg.lastVisitedHome !== target) leaveVisitedHome()

  targetHome.visitors = [sender, ...targetHome.visitors.filter(jid => jid !== sender)].slice(0, 20)
  targetHome.visitCount++
  rpg.lastVisitedHome = target

  await saveDB(db)

  const placed = targetHome.furniture.map(id => findItem(id)).filter(Boolean)
  const trophies = targetHome.trophies.map(id => findItem(id)).filter(Boolean)
  const targetComfort = getHomeComfort(targetHome, targetAccount.rpg.mallInventory || {})

  return m.reply(
    `╭─❏「 🏠 KUNJUNGAN RUMAH 」❏\n` +
    `│ 🏠 *MENGUNJUNGI RUMAH @${target.split('@')[0]}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kenyamanan : *Level ${targetComfort.level}* (${targetComfort.points} poin)\n` +
    `> ↳ Barang terpasang : ${placed.length ? placed.map(item => displayName(item)).join(', ') : 'belum ada'}\n\n` +
    `${trophies.length ? `🏆 *Koleksi dipajang* : ${trophies.map(item => displayName(item)).join(', ')}\n\n` : ''}` +
    `📌 *INTERAKSI*\n` +
    `> ↳ Gunakan *${prefix}home like* untuk memberi like.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [target] }
  )
}

if (mode === 'tamu') {
  return m.reply(
    `╭─❏「 👥 TAMU TERBARU 」❏\n` +
    `│ 👥 *TAMU TERBARU*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${home.visitors.length ? home.visitors.map(jid => `👤 @${jid.split('@')[0]}`).join('\n') : '> ↳ Belum ada tamu.'}\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: home.visitors }
  )
}

if (mode === 'like') {
  const target = rpg.lastVisitedHome

  if (!target) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ❌ *BELUM MENGUNJUNGI RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kunjungi rumah pemain lain terlebih dahulu dengan *${prefix}home visit @user*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const owner = getUser(db, target)

  if (!owner?.rpg) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ❌ *RUMAH TIDAK TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Rumah pemain tersebut sudah tidak tersedia.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const targetHome = getHome(owner.rpg)

  if (target === sender) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ❌ *AKSI TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu tidak dapat memberi like pada rumah sendiri.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!targetHome.visitors.includes(sender)) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ❌ *BELUM MENGUNJUNGI RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kunjungi rumah tersebut terlebih dahulu dengan *${prefix}home visit @user*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (targetHome.likes.includes(sender)) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ⚠️ *SUDAH MEMBERI LIKE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu sudah memberi like pada rumah ini.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  targetHome.likes.push(sender)
  await saveDB(db)

  return m.reply(
    `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
    `│ ✅ *LIKE BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Like berhasil diberikan ke rumah @${target.split('@')[0]}.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [target] }
  )
}

if (mode === 'list' || mode === 'explore' || mode === 'top') {
  const homes = Object.entries(db.users || {})
    .filter(([jid, user]) => {
      if (!user?.rpg) return false
      const candidateHome = getHome(user.rpg)
      if (mode === 'top' || candidateHome.public) return true
      return mode === 'list' && (candidateHome.access.includes(sender) || (rpg.favoriteHomes || []).includes(jid))
    })
    .map(([jid, user]) => ({ jid, rpg: user.rpg, home: getHome(user.rpg), name: user.name || 'Pemain' }))

  if (mode === 'top') {
      const eligibleHomes = filterLeaderboardUsers(homes, conn, entry => entry.jid)
      const popularity = entry => getHomePopularity(
        {
          ...entry.home,
          aesthetics: getHomeAesthetics(entry.home, entry.rpg.mallInventory || {}),
          security: getHomeSecurity(entry.home)
        },
        getHomeComfort(entry.home, entry.rpg.mallInventory || {}),
        getHomeMembers(entry.rpg),
        Object.values(entry.rpg.mallInventory || {}).reduce((total, amount) => total + (Number(amount) || 0), 0)
      )
      eligibleHomes.sort((a, b) => popularity(b) - popularity(a) || b.home.likes.length - a.home.likes.length)
      const mentions = []

      return m.reply(
      `╭─❏「 🏆 RUMAH TERPOPULER 」❏\n` +
      `│ 🏆 *RUMAH TERPOPULER*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${eligibleHomes.slice(0, 10).map((entry, index) => {
        const identity = getLeaderboardUserIdentity(entry.jid, {
          conn,
          groupMetadata,
          name: entry.name === 'Pemain' ? conn.getName(entry.jid) : entry.name
        })
        if (identity.mention) mentions.push(identity.mention)
        return `🏆 *${index + 1}. ${identity.display}*\n` +
        `> ↳ ⭐ Popularity : ${popularity(entry)}/100\n` +
        `> ↳ ❤️ Like : ${entry.home.likes.length}\n` +
        `> ↳ 👣 Kunjungan : ${entry.home.visitCount}`
      }).join('\n\n') || '> ↳ Belum ada rumah.'}\n\n` +
      `─━━━━━━━━━━━━━━─`,
      { mentions }
    )
  }

  if (mode === 'list') {
    const favorites = new Set(rpg.favoriteHomes || [])
    homes.sort((a, b) => Number(favorites.has(b.jid)) - Number(favorites.has(a.jid)))
  }

  return m.reply(
    `╭─❏「 🏘️ RUMAH ${mode === 'explore' ? 'PUBLIK' : 'YANG DAPAT DIKUNJUNGI'} 」❏\n` +
    `│ 🏘️ *DAFTAR RUMAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${homes.slice(0, 15).map(entry =>
      `🏠 *${entry.name}*\n` +
      `> ↳ Status : ${entry.home.public || entry.home.access.includes(sender) ? '🟢 Terbuka' : '🔒 Pribadi'}\n` +
      `> ↳ ❤️ Like : ${entry.home.likes.length}\n` +
      `> ↳ Kunjungi : ${prefix}home visit @${entry.jid.split('@')[0]}`
    ).join('\n\n') || '> ↳ Belum ada rumah terbuka untuk dikunjungi.'}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

return m.reply(
  `╭─❏「 🏠 HOME 」❏\n` +
  `│ ❌ *COMMAND TIDAK DIKENAL*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Gunakan *${prefix}home guide* untuk panduan.\n` +
  `> ↳ Gunakan *${prefix}home command* untuk daftar command.\n\n` +
  `─━━━━━━━━━━━━━━─`
)
}

handler.help = ['home', 'rumah']
handler.alias = ['rumah']
handler.tags = ['rpg']
handler.command = /^(home|rumah)$/i

export default handler
