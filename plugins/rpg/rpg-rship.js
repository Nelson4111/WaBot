import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { isPremiumUser } from './rpg-bank.js'
import { CINCIN_SHOP, getRingIcon, normalizeRingName } from '../../lib/pasanganHelper.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { computeCrimeScore } from '../../lib/crimeHelper.js'
import { registerPrisoner } from '../../lib/prisonHelper.js'
import { createRpgCrimeRecord } from '../../lib/rpgCrimeAction.js'
import { sendRpgButtons, sendRpgQuickButton, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import {
  CHILD_ACTIVITIES,
  CHILD_FACILITIES,
  CHILD_LOSS_STORIES,
  CHILD_NEGLECT,
  CHILD_RETRIEVE_ACCEPT_STORIES,
  CHILD_RETRIEVE_CHANCE,
  CHILD_RETRIEVE_REJECT_STORIES,
  CHILD_RUNAWAY_STORIES,
  CHILD_STAGES,
  RSHIP_COOLDOWN_NAMES as cooldownNames,
  RSHIP_GIFT_LIST as GIFT_LIST,
  RSHIP_ACTIVITY_COOLDOWNS as activityCooldowns,
  RSHIP_BATCH_ACTIVITY_RULES as batchActivityRules,
  RSHIP_STANDARD_PARTNER_EXP
} from '../../lib/rpgRshipData.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.money) wdb.money = {}
  let uData = getUserRPG(wdb, m.sender)
  let user = wdb.users[m.sender]?.rpg || uData?.rpg || uData
  if (!user) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG.')
  if (user.bank === undefined) user.bank = 0
  if (!wdb.users[m.sender]) wdb.users[m.sender] = { rpg: user }
  if (!wdb.users[m.sender].rpg) wdb.users[m.sender].rpg = user

  if (!user.harem) user.harem = []
  if (!user.ex) user.ex = []
  if (!user.graveyard) user.graveyard = []
  if (!user.kids) user.kids = []
  if (!Array.isArray(user.shelterKids)) user.shelterKids = []
  if (!user.cooldown) user.cooldown = {}
  if (!user.dateStats) user.dateStats = { totalDate: 0, totalNikah: 0, selingkuh: 0, kill: 0, duelWin: 0, urusAnak: 0, wohoo: 0 }


  let args = text ? text.trim().split(/\s+/) : []
  let action = args[0]?.toLowerCase()
  if (['kidcare', 'childcare'].includes(action) || ['kidcare', 'childcare'].includes(String(command || '').toLowerCase())) {
    action = 'kid'
    args = ['kid', 'urus', 'all', 'all']
  }
  if (action === 'child') action = 'kid'
  if (action === 'anak' && ['adopt', 'adopsi'].includes(args[1]?.toLowerCase())) {
    action = 'kid'
    args = ['kid', ...args.slice(1)]
  }
  if (['cerai', 'divorce'].includes(action)) action = 'putus'
  if (['ex', 'exspouse', 'ex-spouse'].includes(action)) action = 'mantan'
  if (action === 'asuh') action = 'custody'
  let jam = new Date().getHours()
  let waktu = jam >= 18 || jam < 6 ? '🌙 Malam' : '☀️ Siang'

  const getMaxSlot = () => {
    let slot = 1
    user.harem.forEach(p => { if ((p.level || 1) >= 20) slot++ })
    return Math.min(slot, 10)
  }

  const findPartner = selector => {
    if (!selector) return null
    const normalizedSelector = String(selector).trim().toLowerCase()
    const index = /^\d+$/.test(normalizedSelector)
      ? Number(normalizedSelector) - 1
      : user.harem.findIndex(partner => String(partner.name).toLowerCase() === normalizedSelector)
    const partner = user.harem[index]
    return partner ? { partner, index } : null
  }

  const bar = (val, len = 10) => {
    const safeValue = Math.max(0, Math.min(100, Number(val) || 0))
    const filled = Math.round((safeValue / 100) * len)
    return '█'.repeat(filled) + '░'.repeat(len - filled)
  }

  const giftGuide = () => `╭─❏「 🎁 RSHIP GIFT GUIDE 」❏
│ 💝 PANDUAN HADIAH PASANGAN
╰─━━━━━━━━━━━━━━─

🎁 *DAFTAR HADIAH*
> ↳ ${usedPrefix}rship gift list

─━━━━━━━━━━━━━━─
💝 *HADIAH ITEM*
> ↳ ${usedPrefix}rship gift item <nomor> <jumlah>
> ↳ Contoh: ${usedPrefix}rship gift item 5 2
> ↳ ${usedPrefix}rship gift item <nama> <jumlah>
> ↳ Contoh: ${usedPrefix}rship gift item baju 1

─━━━━━━━━━━━━━━─
💰 *HADIAH UANG*
> ↳ ${usedPrefix}rship gift money <jumlah>
> ↳ Contoh: ${usedPrefix}rship gift money 50000000

─━━━━━━━━━━━━━━─
👤 *PILIH PASANGAN*
> ↳ ${usedPrefix}rship gift <no> item 5 1
> ↳ ${usedPrefix}rship gift <nama> item baju 1
> ↳ ${usedPrefix}rship gift <no> money 50000000

─━━━━━━━━━━━━━━─
👶 *HADIAH ANAK*
> ↳ ${usedPrefix}rship gift anak <no> item 5 1
> ↳ ${usedPrefix}rship gift anak <no> money 50000

─━━━━━━━━━━━━━━─`
  const giftPageSize = 20
  const giftPageCount = Math.ceil(GIFT_LIST.length / giftPageSize)
  const giftDraftTtl = 5 * 60 * 1000
  const formatGiftCatalogPage = page => {
    const start = (page - 1) * giftPageSize
    const gifts = GIFT_LIST.slice(start, start + giftPageSize)
    const lines = gifts.map((gift, index) =>
      `*${start + index + 1}. ${gift.emoji} ${gift.desc}*\n` +
      `> ↳ Rp ${gift.harga.toLocaleString('id-ID')} · +${gift.exp.toLocaleString('id-ID')} EXP · +${gift.love} Love`
    )
    return `╭─❏「 🎁 KATALOG HADIAH 」❏\n` +
      `│ 💝 PILIHAN ${start + 1}–${start + gifts.length} DARI ${GIFT_LIST.length}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${lines.join('\n\n')}\n\n` +
      `📖 Halaman *${page}/${giftPageCount}* · Tiap halaman berisi maksimal ${giftPageSize} hadiah.\n` +
      `> ↳ Buka: ${usedPrefix}rship gift list ${page < giftPageCount ? page + 1 : 1}\n` +
      `> ↳ Mulai gift interaktif: ${usedPrefix}rship gift`
  }

  const getTitle = (lvl, custom) => {
    if (custom) return custom
    if (lvl >= 90) return '💎 Belahan Jiwa'
    if (lvl >= 70) return '💖 Cinta Sejati'
    if (lvl >= 50) return '👨‍👩‍👧‍👦 Keluarga'
    if (lvl >= 40) return '💍 Suami/Istri'
    if (lvl >= 27) return '💘 Pasangan'
    if (lvl >= 20) return '💞 Pacar'
    if (lvl >= 10) return '🤝 Sahabat'
    if (lvl >= 5) return '😊 Teman Dekat'
    return '👋 Kenalan'
  }

  const getMood = (love) => {
    if (love >= 90) return '🥰 Sangat Bahagia'
    if (love >= 70) return '😍 Jatuh Cinta'
    if (love >= 50) return '😊 Bahagia'
    if (love >= 30) return '🙂 Akrab'
    if (love >= 10) return '😐 Dingin'
    return '😠 Marah'
  }

  const getGenderEmoji = (g) => g === 'cowok'? '♂️' : g === 'cewek'? '♀️' : '❓'
  const getChildCareCount = child => {
    if (Number.isFinite(child.careCount)) return Math.max(0, child.careCount)
    return Math.max(0, Math.round((Number(child.umur) || 0) * 10))
  }

  const getChildStage = careCount => {
    return CHILD_STAGES.reduce((stage, current) => careCount >= current.care ? current : stage)
  }

  const getChildProgress = careCount => {
    const nextStage = CHILD_STAGES.find(stage => stage.care > careCount)
    if (!nextStage) return '✅ Selesai diasuh'
    return `${careCount}/${nextStage.care} kali ke ${nextStage.name}`
  }


  const childEvents = []
  const now = Date.now()
  let childStateChanged = false
  if (!Array.isArray(user.orphanageKids)) user.orphanageKids = []

  const normalizeBiologicalParents = child => {
    if (!Array.isArray(child.biologicalParents)) return false
    const normalized = [...new Set(child.biologicalParents.filter(parent => typeof parent === 'string' && parent.trim()).map(parent => parent.trim()))].slice(0, 2)
    if (normalized.length === child.biologicalParents.length &&
      normalized.every((parent, index) => parent === child.biologicalParents[index])) return false
    child.biologicalParents = normalized
    return true
  }

  const initializeChildState = child => {
    if (child.lastCaredAt == null || !Number.isFinite(Number(child.lastCaredAt))) {
      child.lastCaredAt = now
      childStateChanged = true
    }
    if (!child.activityCooldowns || typeof child.activityCooldowns !== 'object') {
      child.activityCooldowns = {}
      childStateChanged = true
    }
    if (normalizeBiologicalParents(child)) childStateChanged = true
  }

  const settleFacility = (child, returnToFamily) => {
    const facility = child.facility
    if (!facility || !CHILD_FACILITIES[facility.type]) return false
    const config = CHILD_FACILITIES[facility.type]
    const paidUntil = Math.max(0, Number(facility.paidUntil) || now)
    if (paidUntil > now) return false

    const returnChild = () => {
      delete child.facility
      child.lastCaredAt = now
      child.lastNeglectCheckAt = now
      childStateChanged = true
      if (!returnToFamily) user.kids.push(child)
      childEvents.push(returnToFamily
        ? `╭─❏「 💸 BIAYA DAYCARE 」❏\n│ 👶 STATUS PENGASUHAN\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Biaya daycare *${child.nama}* tidak dibayar selama 3 hari.\n> ↳ ${child.nama} dikembalikan ke daftar keluarga.`
        : `╭─❏「 💸 BIAYA PANTI ASUHAN 」❏\n│ 👶 STATUS PENGASUHAN\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Biaya panti asuhan *${child.nama}* tidak dibayar selama 3 hari.\n> ↳ ${child.nama} kembali ke keluarga dan masuk daftar anak.`)
      return true
    }
    if (Number(facility.unpaidSince) > 0 &&
      now - Number(facility.unpaidSince) >= CHILD_NEGLECT.facilityGracePeriod) {
      return returnChild()
    }

    const periodsDue = Math.floor((now - paidUntil) / config.feePeriod) + 1
    const amountDue = periodsDue * config.fee
    if (user.bank >= amountDue) {
      user.bank -= amountDue
      facility.paidUntil = paidUntil + periodsDue * config.feePeriod
      delete facility.unpaidSince
      childStateChanged = true
      return false
    }

    if (!(Number(facility.unpaidSince) > 0)) {
      facility.unpaidSince = paidUntil
      childStateChanged = true
    }
    if (now - Number(facility.unpaidSince) < CHILD_NEGLECT.facilityGracePeriod) return false

    return returnChild()
  }

  for (const child of user.kids) {
    initializeChildState(child)
    settleFacility(child, true)
  }
  for (let index = user.orphanageKids.length - 1; index >= 0; index--) {
    const child = user.orphanageKids[index]
    initializeChildState(child)
    if (settleFacility(child, false)) user.orphanageKids.splice(index, 1)
  }

  for (let index = user.kids.length - 1; index >= 0; index--) {
    const child = user.kids[index]
    if (child.facility) continue
    const careCount = getChildCareCount(child)
    const stage = getChildStage(careCount)
    const adolescent = careCount >= CHILD_STAGES[3].care
    const childStage = careCount >= CHILD_STAGES[2].care && !adolescent
    const young = careCount < CHILD_STAGES[2].care
    if (!adolescent && !childStage && !young) continue

    const eligibleAt = Number(child.lastCaredAt) + (adolescent ? CHILD_NEGLECT.gracePeriod : 0)
    const checkedAt = Number(child.lastNeglectCheckAt) || eligibleAt
    if (now < eligibleAt + CHILD_NEGLECT.checkPeriod || now < checkedAt + CHILD_NEGLECT.checkPeriod) continue
    const elapsedPeriods = Math.floor((now - Math.max(eligibleAt, checkedAt)) / CHILD_NEGLECT.checkPeriod)
    if (elapsedPeriods < 1) continue
    child.lastNeglectCheckAt = Math.max(eligibleAt, checkedAt) + elapsedPeriods * CHILD_NEGLECT.checkPeriod
    childStateChanged = true

    const chance = adolescent ? CHILD_NEGLECT.adultEscapeChance : CHILD_NEGLECT.youngChildLossChance
    if (Math.random() >= 1 - Math.pow(1 - chance, elapsedPeriods)) continue

    const runsAway = adolescent || (childStage && Math.random() < 0.5)
    user.kids.splice(index, 1)
    child.originalOwnerJid ||= m.sender
    let returnedToOriginalParent = false
    if (runsAway && child.custody?.type === 'foster' && child.originalOwnerJid !== m.sender) {
      const originalOwnerData = getUserRPG(wdb, child.originalOwnerJid)
      const originalOwner = originalOwnerData?.rpg || originalOwnerData
      if (originalOwner && !originalOwnerData?.isDummy) {
        if (!Array.isArray(originalOwner.kids)) originalOwner.kids = []
        delete child.custody
        delete child.originalOwnerJid
        delete child.shelterStatus
        child.lastCaredAt = now
        child.lastNeglectCheckAt = now
        originalOwner.kids.push(child)
        returnedToOriginalParent = true
      }
    }
    if (!returnedToOriginalParent) {
      child.shelterStatus = {
        reason: runsAway ? 'runaway' : 'lost',
        enteredAt: now
      }
      normalizeBiologicalParents(child)
      user.shelterKids.push(child)
    }
    wdb.crime = wdb.crime || {}
    wdb.crime[m.sender] = createRpgCrimeRecord(wdb.crime[m.sender] || {})
    wdb.crime[m.sender].aniaya = (Number(wdb.crime[m.sender].aniaya) || 0) + 1
    wdb.crime[m.sender].total = computeCrimeScore(wdb.crime[m.sender])

    const alreadyImprisoned = user.penjara && now - Number(user.penjara) < (Number(user.lamaPenjara) || 0)
    if (!alreadyImprisoned) {
      user.penjara = now
      user.lamaPenjara = 2 * 60 * 60 * 1000
      user.tebusan = 2000000
      user.kasus = '👶 Aniaya'
      user.sel = registerPrisoner(wdb, m.sender)
    }
    if (!Array.isArray(user.riwayat)) user.riwayat = []
    user.riwayat.unshift(`🚔 Anak ${stage.name} ${child.nama} ${runsAway ? 'kabur' : 'hilang'}; kasus Aniaya`)
    const legalStatus = alreadyImprisoned
      ? 'Kasus ini tercatat saat kamu sedang menjalani hukuman.'
      : user.sel
        ? `Kamu dipenjara 2 jam di sel ${user.sel} atas kasus Aniaya.\n> ↳ Tebusan: Rp 2.000.000.`
        : 'Laporan diproses, tetapi perlindungan atau rehabilitasi aktif mencegah penahanan.'

    if (!runsAway) {
      const story = CHILD_LOSS_STORIES[Math.floor(Math.random() * CHILD_LOSS_STORIES.length)]
      childEvents.push(
        `╭─❏「 💔 ANAK HILANG 」❏\n` +
        `│ 👶 STATUS ANAK\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ *${child.nama} hilang.*\n` +
        `> ${story}\n\n` +
        `> ↳ Anak dibawa ke shelter. Lihat ${usedPrefix}rship shelter list untuk status dan coba ${usedPrefix}rship shelter retrieve <no>.\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `🚔 *STATUS HUKUM*\n\n` +
        `> ↳ Poin kriminal Aniaya: *+3 poin*.\n` +
        `> ↳ ${legalStatus}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
      childStateChanged = true
      continue
    }

    const story = CHILD_RUNAWAY_STORIES[Math.floor(Math.random() * CHILD_RUNAWAY_STORIES.length)]
    childEvents.push(
      `╭─❏「 🚨 ANAK KABUR 」❏\n` +
      `│ 👶 LAPORAN ANIAYA\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *${child.nama} kabur dari rumah.*\n` +
      `> ${story}\n\n` +
      (returnedToOriginalParent
        ? `> ↳ Karena anak ini berstatus asuh, *${child.nama}* dikembalikan ke orang tua/pemilik asalnya, bukan ke shelter.\n\n`
        : `> ↳ Anak berada di shelter. Lihat ${usedPrefix}rship shelter list dan coba ${usedPrefix}rship shelter retrieve <no>.\n\n`) +
      `─━━━━━━━━━━━━━━─\n` +
      `🚔 *STATUS HUKUM*\n\n` +
      `> ↳ Poin kriminal Aniaya: *+3 poin*.\n` +
      `> ↳ ${legalStatus}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
    childStateChanged = true
  }

  if (childStateChanged) {
    await saveDB(wdb)
    if (childEvents.length) await m.reply(
      `╭─❏「 👶 KABAR ANAK 」❏\n` +
      `│ 📋 INFORMASI PENGASUHAN\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${childEvents.join('\n\n─━━━━━━━━━━━━━━─\n\n')}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const formatRemaining = seconds => {
    const totalSeconds = Math.max(0, Math.ceil(Number(seconds) || 0))
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    const parts = []
    if (days) parts.push(`${days}hari`)
    if (hours) parts.push(`${hours}j`)
    if (minutes) parts.push(`${minutes}m`)
    if (!days && !hours && !minutes) parts.push(`${secs}detik`)
    return parts.join(' ') || '0detik'
  }

  const getKidCooldownSummary = kids => {
    const careEntries = []
    const activityEntries = Object.entries(CHILD_ACTIVITIES).map(([key, activity]) => ({
      label: `${activity.emoji} ${activity.label}`,
      children: []
    }))

    for (const child of kids) {
      if (child.facility) continue

      const careRemaining = Math.max(
        0,
        Math.ceil((CHILD_NEGLECT.careCooldown - (now - Number(child.lastKidActivityAt || 0))) / 1000)
      )
      if (careRemaining) careEntries.push(`${child.nama} (${formatRemaining(careRemaining)})`)

      Object.entries(CHILD_ACTIVITIES).forEach(([key, activity], index) => {
        const last = Number(child.activityCooldowns?.[key]) || 0
        const remaining = last
          ? Math.max(0, Math.ceil((activity.cooldown - (now - last)) / 1000))
          : 0
        if (remaining) activityEntries[index].children.push(`${child.nama} (${formatRemaining(remaining)})`)
      })
    }

    const lines = []
    if (careEntries.length) lines.push(`> ⏳ *Rawat:* ${careEntries.join(', ')}`)
    for (const activity of activityEntries) {
      if (activity.children.length) lines.push(`> ⏳ *${activity.label}:* ${activity.children.join(', ')}`)
    }
    return lines
  }

  const cekCD = (key, durasi) => {
    const legacyKeys = Object.keys(user.cooldown).filter(storedKey => storedKey.startsWith(key) && /^\d+$/.test(storedKey.slice(key.length)))
    const last = Math.max(0, ...[key, ...legacyKeys].map(storedKey => Number(user.cooldown[storedKey]) || 0))
    let sisa = scaleDifficultyCooldown(user, durasi) - (Date.now() - last)
    return sisa > 0 ? Math.ceil(sisa / 1000) : 0
  }

  if (action === 'cd') {
    const partnerCooldowns = Object.entries(cooldownNames).map(([key, [label, duration]]) => {
      const remaining = cekCD(key, duration)
      return `> ${remaining ? '⏳' : '✅'} *${label}:* ${remaining ? formatRemaining(remaining) : 'Siap'}`
    })
    return sendRpgQuickButton(conn, m, {
      text: `╭─❏「 ⏰ COOLDOWN RSHIP 」❏\n` +
        `│ STATUS COOLDOWN PASANGAN\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `💕 *PASANGAN*\n${partnerCooldowns.join('\n')}\n\n` +
        `─━━━━━━━━━━━━━━─`,
      title: '👶 COOLDOWN AKTIVITAS ANAK',
      buttonText: '🕰️ Cek Waktu Aktivitas Anak',
      command: `${usedPrefix}rship kid cd`,
      noThumbnail: true
    })
  }

  const applyPartnerExp = (partner, amount) => {
    partner.level = Math.max(1, Math.floor(Number(partner.level) || 1))
    partner.exp = Math.max(0, Number(partner.exp) || 0) + amount
    let levelUps = 0
    while (partner.level < Number.MAX_SAFE_INTEGER && partner.exp >= partner.level * 200) {
      partner.exp -= partner.level * 200
      partner.level++
      partner.love = Math.min(100, (Number(partner.love) || 0) + 5)
      partner.waitTitleUp = true
      levelUps++
    }
    return levelUps
  }

  const addExp = (partner, amount) => {
    const eventMultiplier = (isRpgEventActive('love_season') ? 1.5 : 1) *
      (isRpgEventActive('cold_war') ? 0.7 : 1)
    return applyPartnerExp(partner, Math.floor(amount * eventMultiplier))
  }

  const standardPartnerActivityExp = () => RSHIP_STANDARD_PARTNER_EXP

  const getActivityLoveAmount = amount => {
    const eventMultiplier = (isRpgEventActive('love_season') ? 1.25 : 1) *
      (isRpgEventActive('cold_war') ? 0.75 : 1)
    return amount > 0 ? Math.floor(amount * eventMultiplier) : amount
  }

  const applyActivityLove = (partner, amount) => {
    const adjustedAmount = getActivityLoveAmount(amount)
    partner.love = Math.max(0, Math.min(100, (Number(partner.love) || 0) + adjustedAmount))
    return adjustedAmount
  }

  const cekLevel = (partner, level, feature) => {
    if ((Number(partner.level) || 1) >= level) return null
    return `╭─❏「 ❌ LEVEL KURANG 」❏\n\nButuh Lv.${level} ${getTitle(level)}.\nSekarang Lv.${partner.level || 1}\nFitur: ${feature}\n╰─━━━━━━━━━━━━━━─`
  }

  const conflictEffect = (partner, intensity) => {
    const level = Number(partner.level) || 1
    if (level < 5) return -Math.floor(Math.random() * intensity) - 1
    if (level < 10) return Math.random() < 0.55
      ? -Math.floor(Math.random() * intensity) - 1
      : Math.floor(Math.random() * 3) + 1
    return Math.floor(Math.random() * 4) + 1
  }

  const formatLoveChange = change => {
    const adjustedChange = getActivityLoveAmount(change)
    return `${adjustedChange >= 0 ? '+' : ''}${adjustedChange}`
  }


  if (action === 'lamar') {
    const mahar = Number(args[args.length - 1])
    const genderInput = args[args.length - 2]?.toLowerCase()
    const nama = args.slice(1, -2).join(' ').trim()
    const genderAliases = {
      cowok: 'cowok', cowo: 'cowok', pria: 'cowok', male: 'cowok',
      cewek: 'cewek', cewe: 'cewek', perempuan: 'cewek', female: 'cewek'
    }
    const gender = genderAliases[genderInput]
    if (!nama || nama.length > 30 || !gender || !Number.isSafeInteger(mahar) || mahar < 1) {
      return m.reply(
        `╭─❏「 💍 LAMARAN RSHIP 」❏
│ 📋 FORMAT LAMARAN
╰─━━━━━━━━━━━━━━─

💌 *CARA MELAMAR*
> ↳ Gunakan: *${usedPrefix}rship lamar <nama> <cowok/cewek> <nominal mahar>*
> ↳ Contoh: *${usedPrefix}rship lamar Avelia cewek 1000000*

💰 *KETENTUAN MAHAR*
> ↳ Mahar minimal Rp 1.
> ↳ Saldo mahar harus tersedia di bank RPG.

─━━━━━━━━━━━━━━─`
      )
    }
    if (user.harem.length >= getMaxSlot()) {
      return m.reply(
        `╭─❏「 💍 SLOT PASANGAN 」❏
│ ⚠️ SLOT PASANGAN PENUH
╰─━━━━━━━━━━━━━━─

> ↳ Slot terpakai: ${user.harem.length}/${getMaxSlot()}
> ↳ Kosongkan slot pasangan sebelum mengajukan lamaran baru.

─━━━━━━━━━━━━━━─`
      )
    }
    if (user.harem.some(partner => String(partner.name).toLowerCase() === nama.toLowerCase())) {
      return m.reply(
        `╭─❏「 💍 LAMARAN RSHIP 」❏
│ ⚠️ PASANGAN SUDAH TERDAFTAR
╰─━━━━━━━━━━━━━━─

> ↳ *${nama}* sudah terdaftar sebagai pasanganmu.

─━━━━━━━━━━━━━━─`
      )
    }
    if (user.pendingRshipCustody || user.pendingRshipFoster) {
      return m.reply(
        `╭─❏「 💍 LAMARAN RSHIP 」❏
│ ⚠️ PENGATURAN MASIH TERTUNDA
╰─━━━━━━━━━━━━━━─

> ↳ Selesaikan pengaturan hak asuh yang masih menunggu sebelum mengajukan lamaran baru.

─━━━━━━━━━━━━━━─`
      )
    }
    if (user.bank < mahar) {
      return m.reply(
        `╭─❏「 💰 SALDO BANK RPG 」❏
│ ⚠️ SALDO TIDAK MENCUKUPI
╰─━━━━━━━━━━━━━━─

> ↳ Mahar: Rp ${mahar.toLocaleString('id-ID')}
> ↳ Saldo saat ini: Rp ${Number(user.bank).toLocaleString('id-ID')}

─━━━━━━━━━━━━━━─`
      )
    }

    const acceptanceChance = Math.min(95, 10 + Math.floor(mahar / 100000))
    if (Math.random() * 100 >= acceptanceChance) {
      return m.reply(
        `╭─❏「 💔 LAMARAN DITOLAK 」❏
│ ${nama} belum menerima lamaranmu.
╰─━━━━━━━━━━━━━━─

💰 *DETAIL LAMARAN*
> ↳ Mahar yang ditawarkan: Rp ${mahar.toLocaleString('id-ID')}
> ↳ Peluang diterima: ${acceptanceChance}%
> ↳ Mahar tidak dipotong karena lamaran ditolak.

💡 *SARAN*
> ↳ Coba lagi dengan mahar yang lebih tinggi.

─━━━━━━━━━━━━━━─`
      )
    }

    user.bank -= mahar
    user.harem.push({
      name: nama,
      gender,
      love: 50,
      exp: 0,
      level: 1,
      menikah: true,
      cincin: null,
      mahar
    })
    user.dateStats.totalNikah = (Number(user.dateStats.totalNikah) || 0) + 1
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 💍 LAMARAN DITERIMA 」❏
│ 🎉 KALIAN RESMI MENIKAH
╰─━━━━━━━━━━━━━━─

${getGenderEmoji(gender)} *${nama}* menerima lamaranmu!

─━━━━━━━━━━━━━━─

💞 *STATUS PERNIKAHAN*
> ↳ Status: Suami/Istri 💍
> ↳ Level awal: Lv.1
> ↳ Mahar: -Rp ${mahar.toLocaleString('id-ID')} dari bank RPG
> ↳ Peluang diterima: ${acceptanceChance}%

─━━━━━━━━━━━━━━─

📖 *INFORMASI FITUR*
> ↳ Fitur pasangan menikah terbuka mengikuti syarat levelnya.
> ↳ Fitur anak tetap terkunci sampai memenuhi syarat level 50, love, dan cooldown.

─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'mantan' || action === 'makam') {
    const archive = action === 'mantan' ? user.ex : user.graveyard
    const timestampKey = action === 'mantan' ? 'archivedAt' : 'killedAt'
    if (!args[1]) {
      const isFormerSpouse = action === 'mantan'
      return m.reply(
        `╭─❏「 ${isFormerSpouse ? '💔 MANTAN / EX-SPOUSE' : '🪦 MAKAM PASANGAN'} 」❏\n` +
        `│ 📖 PENJELASAN FITUR\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        (isFormerSpouse
          ? `Daftar ini berisi pasangan yang hubungan dengannya sudah diakhiri melalui cerai/putus.\n` +
            `> ↳ Data mantan tersimpan sementara selama 7 hari.\n` +
            `> ↳ Lihat daftar: ${usedPrefix}rship mantan list\n` +
            `> ↳ Balikan dengan mantan: ${usedPrefix}rship balikan <no>\n`
          : `Daftar ini berisi pasangan yang sudah meninggal akibat command kill.\n` +
            `> ↳ Data pasangan tersimpan sementara selama 7 hari.\n` +
            `> ↳ Lihat daftar: ${usedPrefix}rship makam list\n` +
            `> ↳ Hidupkan kembali pasangan: ${usedPrefix}rship revive <no>\n`) +
        `\n─━━━━━━━━━━━━━━─`
      )
    }
    if (!['list', 'daftar'].includes(args[1].toLowerCase())) {
      return m.reply(
        `Gunakan ${usedPrefix}rship ${action} untuk penjelasan atau ${usedPrefix}rship ${action} list untuk melihat daftar.`
      )
    }
    if (!archive.length) return m.reply(action === 'mantan' ? 'Daftar mantan kosong.' : 'Daftar makam kosong.')
    const title = action === 'mantan' ? 'DAFTAR MANTAN' : 'DAFTAR MAKAM'
    const command = action === 'mantan' ? 'balikan' : 'revive'
    const entries = archive.map((partner, index) => {
      const remaining = partner[timestampKey] ? Math.max(0, archiveExpiry - (Date.now() - partner[timestampKey])) : archiveExpiry
      return `│ *${index + 1}. ${partner.name}*\n│ > ↳ ${command} ${index + 1} dalam ${formatRemaining(Math.ceil(remaining / 1000))}`
    })
    return m.reply(`╭─❏「 ${title} 」❏
│ 📋 STATUS ARSIP PASANGAN
╰─━━━━━━━━━━━━━━─

${entries.join('\n')}

─━━━━━━━━━━━━━━─`)
  }

  if (action === 'shelter') {
    const shelterAction = args[1]?.toLowerCase()
    if (!shelterAction) {
      return m.reply(
        `╭─❏「 🛟 SHELTER ANAK 」❏\n` +
        `│ 📖 PENJELASAN FITUR\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Shelter menampung anakmu yang hilang atau kabur karena kurang pengasuhan.\n` +
        `> ↳ Anak tetap tercatat dan tidak terhapus dari data.\n` +
        `> ↳ Lihat anak di shelter: ${usedPrefix}rship shelter list\n` +
        `> ↳ Coba jemput anak: ${usedPrefix}rship shelter retrieve <no>\n` +
        `> ↳ Peluang retrieve berhasil hanya ${Math.round(CHILD_RETRIEVE_CHANCE * 100)}%; anak juga bisa menolak.\n` +
        `> ↳ Setiap percobaan retrieve memiliki cooldown 30 menit; cek dengan ${usedPrefix}rship cd.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    if (['list', 'daftar'].includes(shelterAction)) {
      if (!user.shelterKids.length) {
        return m.reply(
          `╭─❏「 🛟 DAFTAR SHELTER 」❏\n` +
          `│ BELUM ADA ANAK DI SHELTER\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Anak yang hilang atau kabur akan tercatat di sini.\n` +
          `> ↳ Lihat daftar dengan ${usedPrefix}rship shelter list.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }
      const entries = user.shelterKids.map((child, index) => {
        const reason = child.shelterStatus?.reason === 'runaway' ? 'Kabur' : 'Hilang'
        const stage = getChildStage(getChildCareCount(child)).name
        return `> *${index + 1}. ${child.nama}* (${stage}, ${child.jenis || 'jenis tidak diketahui'}, umur ${Number(child.umur) || 0})\n` +
          `> ↳ Status: ${reason}\n` +
          `> ↳ Coba retrieve: ${usedPrefix}rship shelter retrieve ${index + 1}`
      })
      return m.reply(
        `╭─❏「 🛟 DAFTAR SHELTER 」❏\n` +
        `│ ANAK YANG DAPAT DICOBA RETRIEVE\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${entries.join('\n\n')}\n\n` +
        `> ↳ Peluang berhasil hanya ${Math.round(CHILD_RETRIEVE_CHANCE * 100)}%; anak dapat menolak dan tetap di shelter.\n` +
        `> ↳ Cooldown retrieve: 30 menit. Cek waktu tersisa dengan ${usedPrefix}rship cd.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    if (['retrieve', 'ambil', 'jemput'].includes(shelterAction)) {
      const index = Number(args[2]) - 1
      const child = Number.isInteger(index) && index >= 0 ? user.shelterKids[index] : null
      if (!child) {
        return m.reply(
          `Nomor anak tidak valid. Lihat daftar shelter dengan ${usedPrefix}rship shelter list.`
        )
      }

      const retrieveCooldown = cooldownNames.shelterRetrieve[1]
      const retrieveCooldownRemaining = cekCD('shelterRetrieve', retrieveCooldown)
      if (retrieveCooldownRemaining > 0) {
        return m.reply(
          `⏰ Kamu masih perlu menunggu *${formatRemaining(retrieveCooldownRemaining)}* sebelum mencoba menjemput anak lagi.`
        )
      }

      user.cooldown.shelterRetrieve = Date.now()
      const success = Math.random() < CHILD_RETRIEVE_CHANCE
      const stories = success ? CHILD_RETRIEVE_ACCEPT_STORIES : CHILD_RETRIEVE_REJECT_STORIES
      const story = stories[Math.floor(Math.random() * stories.length)]
      if (!success) {
        await saveDB(wdb)
        return m.reply(
          `╭─❏「 💔 RETRIEVE GAGAL 」❏\n` +
          `│ *${child.nama}* BELUM MAU KEMBALI\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ${story}\n` +
          `> ↳ *${child.nama}* tetap berada di shelter. Kamu bisa mencoba lagi setelah cooldown jemput anak selesai.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      user.shelterKids.splice(index, 1)
      delete child.shelterStatus
      if (!Array.isArray(user.kids)) user.kids = []
      user.kids.push(child)
      child.lastKidActivityAt = now
      child.lastCaredAt = now
      child.lastNeglectCheckAt = now
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 💚 RETRIEVE BERHASIL 」❏\n` +
        `│ *${child.nama}* BERSEDIA PULANG\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ${story}\n` +
        `> ↳ *${child.nama}* kembali ke daftar anakmu.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    return m.reply(
      `Gunakan ${usedPrefix}rship shelter untuk penjelasan atau:\n` +
      `📌 *PERINTAH SHELTER*\n` +
      `> ↳ Lihat daftar anak: ${usedPrefix}rship shelter list\n` +
      `> ↳ Coba jemput anak: ${usedPrefix}rship shelter retrieve <no>`
    )
  }

  if (action === 'balikan' || action === 'revive') {
    const archive = action === 'balikan' ? user.ex : user.graveyard
    const timestampKey = action === 'balikan' ? 'archivedAt' : 'killedAt'
    const archiveIndex = Number(args[1]) - 1
    const partner = archive[archiveIndex]
    if (!partner) return m.reply(`╭─❏「 ❌ DATA TIDAK DITEMUKAN 」❏
│ ⚠️ NOMOR ARSIP TIDAK VALID
╰─━━━━━━━━━━━━━━─

> ↳ Cek daftar dengan ${usedPrefix}rship ${action === 'balikan' ? 'mantan' : 'makam'}.

─━━━━━━━━━━━━━━─`)
    if (partner[timestampKey] && Date.now() - partner[timestampKey] >= archiveExpiry) {
      archive.splice(archiveIndex, 1)
      saveDB(wdb)
      return m.reply(`╭─❏「 ⏳ WAKTU PEMULIHAN HABIS 」❏
│ 📋 STATUS ARSIP PASANGAN
╰─━━━━━━━━━━━━━━─

> ↳ Waktu pemulihan 7 hari sudah habis.
> ↳ Data telah dihapus.

─━━━━━━━━━━━━━━─`)
    }
    if (user.harem.length >= getMaxSlot()) return m.reply(`╭─❏「 ⚠️ SLOT PASANGAN PENUH 」❏
│ 📋 STATUS HUBUNGAN
╰─━━━━━━━━━━━━━━─

> ↳ Kosongkan satu slot terlebih dahulu.

─━━━━━━━━━━━━━━─`)
    const [restored] = archive.splice(archiveIndex, 1)
    delete restored[timestampKey]
    user.harem.push(restored)
    saveDB(wdb)
    return m.reply(`╭─❏「 💞 PEMULIHAN PASANGAN 」❏
│ 📋 STATUS HUBUNGAN DIPERBARUI
╰─━━━━━━━━━━━━━━─

> 💞 *${restored.name}* kembali ke daftar pasangan.

─━━━━━━━━━━━━━━─`)
  }

  if (action === 'custody') {
    const method = args[1]?.toLowerCase()
    const pendingOffer = user.pendingRshipFosterOffer
    const clearSourceFoster = offer => {
      if (!offer?.sourceJid) return
      const source = getUserRPG(wdb, offer.sourceJid)
      const sourceUser = source?.rpg || source
      if (sourceUser?.pendingRshipFoster?.targetJid === m.sender) delete sourceUser.pendingRshipFoster
    }
    if (['terima', 'accept', 'yes', 'iya', 'ya'].includes(method)) {
      if (!pendingOffer || now - Number(pendingOffer.createdAt || 0) > 5 * 60 * 1000) {
        clearSourceFoster(pendingOffer)
        delete user.pendingRshipFosterOffer
        await saveDB(wdb)
        return m.reply(`╭─❏「 ⚠️ TAWARAN FOSTER 」❏
│ 📋 STATUS PERMINTAAN
╰─━━━━━━━━━━━━━━─

> ↳ Tidak ada tawaran foster yang masih berlaku.

─━━━━━━━━━━━━━━─`)
      }
      const source = getUserRPG(wdb, pendingOffer.sourceJid)
      const sourceUser = source?.rpg || source
      const sourcePending = sourceUser?.pendingRshipCustody
      if (!sourceUser || source?.isDummy || !sourcePending ||
        !Array.isArray(sourceUser.kids) ||
        !pendingOffer.children.every(entry => sourcePending.children.some(child => child.id === entry.id))) {
        clearSourceFoster(pendingOffer)
        delete user.pendingRshipFosterOffer
        await saveDB(wdb)
        return m.reply(`╭─❏「 ❌ TAWARAN FOSTER GAGAL 」❏
│ 📋 VALIDASI HAK ASUH
╰─━━━━━━━━━━━━━━─

> ↳ Data hak asuh dari pengirim sudah berubah.

─━━━━━━━━━━━━━━─`)
      }
      const sourceChildren = pendingOffer.children.map(entry => ({
        entry,
        index: sourceUser.kids.findIndex(child =>
          child.custodyId === entry.id && child.nama === entry.name && child.ortu === entry.parent)
      }))
      if (sourceChildren.some(({ index }) => index < 0)) {
        clearSourceFoster(pendingOffer)
        delete user.pendingRshipFosterOffer
        await saveDB(wdb)
        return m.reply(`╭─❏「 ❌ TAWARAN FOSTER GAGAL 」❏
│ 📋 VALIDASI DATA ANAK
╰─━━━━━━━━━━━━━━─

> ↳ Data anak sudah berubah.

─━━━━━━━━━━━━━━─`)
      }
      if (!Array.isArray(user.kids)) user.kids = []
      const transferred = []
      for (const { entry, index } of sourceChildren.sort((a, b) => b.index - a.index)) {
        const [child] = sourceUser.kids.splice(index, 1)
        child.biologicalParents = child.biologicalParents || [
          pendingOffer.sourceName,
          pendingOffer.partnerName
        ].filter(Boolean)
        child.biologicalParents = [...new Set(child.biologicalParents
          .filter(parent => typeof parent === 'string' && parent.trim())
          .map(parent => parent.trim()))].slice(0, 2)
        child.originalOwnerJid ||= pendingOffer.sourceJid
        child.custody = { type: 'foster', guardianJid: m.sender }
        delete child.facility
        transferred.push(child)
        sourcePending.children = sourcePending.children.filter(item => item.id !== entry.id)
      }
      user.kids.push(...transferred)
      if (!sourcePending.children.length) delete sourceUser.pendingRshipCustody
      delete sourceUser.pendingRshipFoster
      delete user.pendingRshipFosterOffer
      await saveDB(wdb)
      return m.reply(`╭─❏「 👶 ANAK ASUH DITERIMA 」❏
│ 📋 STATUS HAK ASUH DIPERBARUI
╰─━━━━━━━━━━━━━━─

> ✅ Tawaran diterima.
> 👶 ${transferred.map(child => `*${child.nama}*`).join(', ')} sekarang masuk daftar anak asuhmu.
> ↳ Orang tua kandung tercatat di ${usedPrefix}rship kid info.

─━━━━━━━━━━━━━━─`)
    }
    if (['tolak', 'reject', 'no', 'tidak', 'batal'].includes(method)) {
      if (!pendingOffer) return m.reply(`╭─❏「 ⚠️ TAWARAN FOSTER 」❏
│ 📋 STATUS PERMINTAAN
╰─━━━━━━━━━━━━━━─

> ↳ Tidak ada tawaran foster yang menunggu.

─━━━━━━━━━━━━━━─`)
      clearSourceFoster(pendingOffer)
      delete user.pendingRshipFosterOffer
      await saveDB(wdb)
      return m.reply(`╭─❏「 ❌ TAWARAN FOSTER DITOLAK 」❏
│ 📋 STATUS HAK ASUH
╰─━━━━━━━━━━━━━━─

> ↳ Anak tetap menunggu keputusan hak asuh pengirim.

─━━━━━━━━━━━━━━─`)
    }

    const pending = user.pendingRshipCustody
    if (!pending) {
      return m.reply(
        `╭─❏「 👶 PILIHAN HAK ASUH 」❏
│ 📋 PANDUAN PENGATURAN HAK ASUH
╰─━━━━━━━━━━━━━━─

> ↳ *Joint:* semua anak tetap diasuh bersama.
> ↳ *Sole:* pilih anak yang kamu asuh sendiri; sisanya ke mantan (atau panti jika kill).
> ↳ *Foster:* pilih anak dan tag pemain lain; anak pindah setelah dia menerima.
> ↳ *Spouse:* semua anak diasuh mantan pasangan (tidak tersedia untuk kill).
> ↳ *Orphaned:* pilih anak untuk dimasukkan ke daftar panti asuhan.

─━━━━━━━━━━━━━━─

📝 *FORMAT COMMAND*
> ${usedPrefix}rship custody <joint|sole|foster|spouse|orphaned> [all|nomor,...]`
      )
    }
    const childList = pending.children.map((entry, index) => `> ${index + 1}. ${entry.name}`).join('\n')
    if (!method || ['guide', 'panduan', 'info'].includes(method)) {
      const spouseOption = pending.action === 'kill' ? '' : `> ↳ Spouse: semua anak diasuh *${pending.partnerName}*.\n`
      return m.reply(
        `╭─❏「 👶 PILIH HAK ASUH 」❏
│ Setelah ${pending.action === 'kill' ? 'kill' : 'perceraian/putus'}
╰─━━━━━━━━━━━━━━─

📋 *ANAK YANG PERLU DIATUR*
${childList}

─━━━━━━━━━━━━━━─

📖 *PERBEDAAN HAK ASUH*
> ↳ *Joint:* semua anak tetap di keluargamu dengan hak asuh bersama.
> ↳ *Sole:* pilih anak yang tetap kamu asuh sendiri; anak lain diasuh ${pending.action === 'kill' ? 'panti asuhan' : 'mantan pasangan'}.
> ↳ *Foster:* pilih anak yang akan diasuh pemain lain; perpindahan menunggu persetujuan pemain itu.
` +
        spouseOption +
        `> ↳ *Orphaned:* anak pilihan masuk daftar panti asuhan.

─━━━━━━━━━━━━━━─

📝 *FORMAT COMMAND*
> Gunakan ${usedPrefix}rship custody <tipe> <all|nomor,...>
> ↳ Contoh sole: ${usedPrefix}rship custody sole 1,3
> ↳ Contoh foster: ${usedPrefix}rship custody foster 1,3 @user`
      )
    }

    if (user.pendingRshipFoster &&
      now - Number(user.pendingRshipFoster.createdAt || 0) > 5 * 60 * 1000) {
      const target = getUserRPG(wdb, user.pendingRshipFoster.targetJid)
      const targetUser = target?.rpg || target
      if (targetUser?.pendingRshipFosterOffer?.sourceJid === m.sender) delete targetUser.pendingRshipFosterOffer
      delete user.pendingRshipFoster
      await saveDB(wdb)
    }
    if (user.pendingRshipFoster) return m.reply(`╭─❏「 ⏳ TAWARAN FOSTER AKTIF 」❏
│ 📋 STATUS PERMINTAAN
╰─━━━━━━━━━━━━━━─

> ↳ Tawaran foster sedang menunggu jawaban.
> ↳ Selesaikan dengan .rship custody terima atau .rship custody tolak.

─━━━━━━━━━━━━━━─`)
    const selectable = ['joint', 'sole', 'foster', 'spouse', 'orphaned']
    if (!selectable.includes(method) || (method === 'spouse' && pending.action === 'kill')) {
      return m.reply(`╭─❏「 ❌ TIPE HAK ASUH TIDAK VALID 」❏
│ 📋 PILIHAN HAK ASUH
╰─━━━━━━━━━━━━━━─

> ↳ Pilihan: joint, sole, foster${pending.action === 'kill' ? '' : ', spouse'}, orphaned.

─━━━━━━━━━━━━━━─`)
    }

    const selectionArgs = args.slice(2).filter(token => !token.startsWith('@'))
    const selection = selectionArgs.join(',').toLowerCase()
    const selectedIndexes = selection === 'all'
      ? pending.children.map((_, index) => index)
      : selection.split(',').filter(Boolean).map(value => Number(value) - 1)
    if (method === 'joint') selectedIndexes.splice(0, selectedIndexes.length, ...pending.children.map((_, index) => index))
    if (method === 'spouse') selectedIndexes.splice(0, selectedIndexes.length, ...pending.children.map((_, index) => index))
    if (!selectedIndexes.length || selectedIndexes.some(index => !Number.isInteger(index) || index < 0 || index >= pending.children.length) ||
      new Set(selectedIndexes).size !== selectedIndexes.length) {
      return m.reply(`╭─❏「 ❌ NOMOR ANAK TIDAK VALID 」❏
│ 📋 FORMAT PEMILIHAN ANAK
╰─━━━━━━━━━━━━━━─

> ↳ Gunakan *all* atau nomor dipisahkan koma.

${childList}

─━━━━━━━━━━━━━━─`)
    }
    const selected = selectedIndexes.map(index => pending.children[index])
    const currentChildren = pending.children.map(entry => {
      const child = user.kids.find(item => item.custodyId === entry.id)
      return child && child.nama === entry.name && child.ortu === entry.parent ? child : null
    })
    if (currentChildren.some(child => !child)) {
      delete user.pendingRshipCustody
      delete user.pendingRshipFoster
      await saveDB(wdb)
      return m.reply(`╭─❏「 ❌ PENGATURAN HAK ASUH DIBATALKAN 」❏
│ 📋 VALIDASI DATA ANAK
╰─━━━━━━━━━━━━━━─

> ↳ Pengaturan hak asuh dibatalkan karena data anak sudah berubah.

─━━━━━━━━━━━━━━─`)
    }
    const selectedIds = new Set(selected.map(entry => entry.id))
    const unselected = pending.children.filter(entry => !selectedIds.has(entry.id))
    const fallbackCustody = pending.action === 'kill' ? 'orphaned' : 'spouse'
    const sendToOrphanage = entry => {
      const childIndex = user.kids.findIndex(item => item.custodyId === entry.id)
      const [child] = user.kids.splice(childIndex, 1)
      child.custody = { type: 'orphaned' }
      child.facility = { type: 'orphanage', paidUntil: now + CHILD_FACILITIES.orphanage.feePeriod }
      user.orphanageKids.push(child)
    }
    const assignFallback = entry => {
      const child = user.kids.find(item => item.custodyId === entry.id)
      if (fallbackCustody === 'orphaned') {
        sendToOrphanage(entry)
      } else {
        child.custody = { type: 'spouse', custodianName: pending.partnerName }
      }
    }

    if (method === 'foster') {
      const targetJid = conn.decodeJid?.(m.mentionedJid?.[0] || '') || m.mentionedJid?.[0]
      const targetData = targetJid && getUserRPG(wdb, targetJid)
      const targetUser = targetData?.rpg || targetData
      if (!targetJid || targetJid === m.sender || !targetUser || targetData?.isDummy) {
        return m.reply(`╭─❏「 ⚠️ PEMAIN FOSTER TIDAK VALID 」❏
│ 📋 FORMAT PERMINTAAN FOSTER
╰─━━━━━━━━━━━━━━─

> ↳ Tandai satu pemain RPG lain yang akan menerima anak.
> ↳ Format: ${usedPrefix}rship custody foster <nomor|all> @user

─━━━━━━━━━━━━━━─`)
      }
      if (targetUser.pendingRshipFosterOffer &&
        now - Number(targetUser.pendingRshipFosterOffer.createdAt || 0) <= 5 * 60 * 1000) {
        return m.reply(`╭─❏「 ⏳ TAWARAN FOSTER AKTIF 」❏
│ 📋 STATUS PEMAIN
╰─━━━━━━━━━━━━━━─

> ↳ Pemain tersebut masih memiliki tawaran foster lain yang belum dijawab.

─━━━━━━━━━━━━━━─`)
      }
      for (const entry of unselected) assignFallback(entry)
      targetUser.pendingRshipFosterOffer = {
        sourceJid: m.sender,
        sourceName: wdb.users[m.sender]?.name || m.sender.split('@')[0],
        partnerName: pending.partnerName,
        children: selected,
        createdAt: now
      }
      user.pendingRshipFoster = { targetJid, childIds: selected.map(entry => entry.id), createdAt: now }
      pending.children = selected
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 📨 PERMINTAAN FOSTER 」❏
│ 📋 MENUNGGU PERSETUJUAN PEMAIN
╰─━━━━━━━━━━━━━━─

> 📨 Permintaan foster untuk ${selected.map(entry => `*${entry.name}*`).join(', ')} dikirim ke @${targetJid.split('@')[0]}.
> ↳ Terima: ${usedPrefix}rship custody terima
> ↳ Tolak: ${usedPrefix}rship custody tolak
> ↳ Jika ditolak, anak tetap menunggu pilihan hak asuh lain.

─━━━━━━━━━━━━━━─`,
        null,
        { mentions: [targetJid] }
      )
    }

    if (method === 'sole') {
      for (const entry of selected) user.kids.find(child => child.custodyId === entry.id).custody = { type: 'sole', guardianJid: m.sender }
      for (const entry of unselected) assignFallback(entry)
    } else if (method === 'spouse') {
      for (const entry of selected) user.kids.find(child => child.custodyId === entry.id).custody = { type: 'spouse', custodianName: pending.partnerName }
    } else if (method === 'orphaned') {
      for (const entry of selected) sendToOrphanage(entry)
      for (const entry of unselected) assignFallback(entry)
    } else {
      for (const entry of selected) user.kids.find(child => child.custodyId === entry.id).custody = {
        type: 'joint',
        otherParent: pending.partnerName
      }
      for (const entry of unselected) assignFallback(entry)
    }
    delete user.pendingRshipCustody
    delete user.pendingRshipFoster
    await saveDB(wdb)
    const custodyDestination = {
      joint: 'anak tetap diasuh bersama dalam keluargamu',
      sole: 'anak pilihanmu tetap dalam pengasuhanmu',
      spouse: `anak diasuh mantan pasangan ${pending.partnerName}`,
      orphaned: 'anak pilihanmu masuk daftar panti asuhan'
    }[method]
    return m.reply(`╭─❏「 ✅ HAK ASUH BERHASIL DIATUR 」❏
│ 📋 HASIL PENGATURAN HAK ASUH
╰─━━━━━━━━━━━━━━─

> ↳ ${custodyDestination}.
> ↳ Anak lain: ${fallbackCustody === 'spouse' ? `diasuh ${pending.partnerName}` : 'masuk daftar panti asuhan'}.
> ↳ Periksa ${usedPrefix}rship kid info dan ${usedPrefix}rship kid orphanage list.

─━━━━━━━━━━━━━━─`)
  }

  if (action === 'cincin') {
    const options = Object.entries(CINCIN_SHOP)
      .map(([key, ring]) => `> ${ring.icon} *${ring.name}* • Rp ${ring.price.toLocaleString('id-ID')}\n> ↳ ${usedPrefix}rship belicincin <no> ${key}`)
      .join('\n')
    return m.reply(`╭─❏「 💍 PILIHAN CINCIN RELATIONSHIP 」❏
│ 📋 DAFTAR CINCIN DAN HARGA
╰─━━━━━━━━━━━━━━─

${options}

─━━━━━━━━━━━━━━─

💳 *INFORMASI PEMBAYARAN*
> ↳ Pembayaran memakai saldo bank RPG, bukan limit.
> ↳ Cek cincin terpasang: ${usedPrefix}rship detail <no>

─━━━━━━━━━━━━━━─`)
  }


  // === PANDUAN RSHIP ===
  if (action === 'guide' || action === 'panduan') {
    return m.reply(
      `╭─❏「 📖 RSHIP GUIDE 」❏
│ 💕 PANDUAN FITUR RELATIONSHIP
╰─━━━━━━━━━━━━━━─

💕 *DASAR RELATIONSHIP*
> 1. Buat pasangan: ${usedPrefix}rship tembak <nama> <cowok/cewek/pria/perempuan/male/female>
> 2. Lamaran langsung menikah: ${usedPrefix}rship lamar <nama> <gender> <mahar>
> 3. Lihat pasangan: ${usedPrefix}rship harem
> 4. Jalankan aktivitas: ${usedPrefix}rship date <no>
> 5. Cek level dan fitur: ${usedPrefix}rship status <no>
> 6. Lihat cooldown: ${usedPrefix}rship cd
> 7. Lihat daftar hadiah: ${usedPrefix}rship gift list

─━━━━━━━━━━━━━━─

📋 *INFORMASI TAMBAHAN*
> ↳ Aktivitas memakai nomor pasangan dari menu harem.
> ↳ Mahar lebih besar meningkatkan peluang lamaran diterima.
> ↳ Lamaran langsung menikah pada Lv.1; fitur anak tetap butuh Lv.50.
> ↳ Cooldown aktivitas berlaku untuk semua pasangan.
> ↳ Gunakan ${usedPrefix}rship command untuk daftar command lengkap.
> ↳ Gunakan ${usedPrefix}rship fitur untuk syarat level.

─━━━━━━━━━━━━━━─`
    )
  }

  // === DAFTAR COMMAND RSHIP ===
  if (action === 'command' || action === 'commands' || action === 'cmd') {
    let cap = `╭─❏「 📋 RSHIP COMMAND 」❏
│ 💕 DAFTAR COMMAND RELATIONSHIP
╰─━━━━━━━━━━━━━━─

`

    cap += `💕 *DASAR*
> *${usedPrefix}rship tembak <nama> <cowok/cewek/pria/perempuan/male/female>*
> ↳ Membuat pasangan baru.
> *${usedPrefix}rship lamar <nama> <cowok/cewek> <mahar>*
> ↳ Mahar dari bank RPG; peluang diterima meningkat seiring nominal. Jika diterima, langsung menikah pada Lv.1.
> *${usedPrefix}rship harem*
> ↳ Melihat semua pasangan.
> *${usedPrefix}rship status <no>*
> ↳ Melihat status pasangan.
> *${usedPrefix}rship detail <no>*
> ↳ Melihat detail pasangan.
> *${usedPrefix}rship rename <no> <nama baru>*
> ↳ Ganti nama pasangan dengan konfirmasi.
> *${usedPrefix}rship fitur*
> ↳ Melihat fitur yang terbuka berdasarkan level.
> *${usedPrefix}rship cincin*
> ↳ Melihat pilihan dan harga cincin.
> *${usedPrefix}rship kid info*
> ↳ Melihat daftar anak keluarga.
> *${usedPrefix}rship kid guide/command*
> ↳ Panduan dan daftar command pengasuhan.
> *${usedPrefix}rship cd*
> ↳ Melihat cooldown semua aktivitas pasangan dan anak.

─━━━━━━━━━━━━━━─

`

    cap += `🎭 *AKTIVITAS PASANGAN*
> *${usedPrefix}rship date <no>*
> ↳ Pergi berkencan dengan pasangan.
> *${usedPrefix}rship talk <no>*
> ↳ Mengobrol dengan pasangan.
> *${usedPrefix}rship makan <no>*
> ↳ Makan bersama pasangan.
> *${usedPrefix}rship liburan <no>*
> ↳ Pergi liburan bersama pasangan.
> *${usedPrefix}rship peluk <no>*
> ↳ Memeluk pasangan.
> *${usedPrefix}rship usil <no>*
> ↳ Mengusili pasangan.
> *${usedPrefix}rship prank <no>*
> ↳ Mengerjai pasangan.
> *${usedPrefix}rship debat <no>*
> ↳ Berdebat dengan pasangan.
> *${usedPrefix}rship maaf <no>*
> ↳ Meminta maaf kepada pasangan.
> *${usedPrefix}rship mandi <no>*
> ↳ Melakukan aktivitas mandi bersama.
> *${usedPrefix}rship tidur <no>*
> ↳ Tidur bersama pasangan.
> *${usedPrefix}rship nonton <no>*
> ↳ Menonton bersama pasangan.
> *${usedPrefix}rship swim <no>*
> ↳ Berenang bersama pasangan.
> *${usedPrefix}rship belanja <no>*
> ↳ Berbelanja bersama pasangan.
> *${usedPrefix}rship marah <no>*
> ↳ Melampiaskan amarah kepada pasangan.
> *${usedPrefix}rship rampok <no>*
> ↳ Merampok pasangan dan mengambil uang.
> *${usedPrefix}rship staycation <no>*
> ↳ Staycation romantis bersama pasangan.
> *${usedPrefix}rship santet <uang>*
> ↳ Mencoba mendapatkan pasangan dengan ritual.
> *${usedPrefix}rship kerja <no>*
> ↳ Bekerja bersama pasangan.
> *${usedPrefix}rship kiss <no>*
> ↳ Mencium pasangan.
> *${usedPrefix}rship wohoo <no>*
> ↳ Aktivitas khusus pasangan level tinggi.

─━━━━━━━━━━━━━━─

`

    cap += `💍 *KELUARGA & HADIAH*
> *${usedPrefix}rship gift list*
> ↳ Melihat daftar hadiah pasangan.
> *${usedPrefix}rship gift item ...*
> ↳ Memberikan item kepada pasangan.
> *${usedPrefix}rship gift money ...*
> ↳ Memberikan uang kepada pasangan.
> *${usedPrefix}rship gift anak <no> item ...*
> ↳ Memberikan item kepada anak.
> *${usedPrefix}rship gift anak <no> money ...*
> ↳ Memberikan uang kepada anak.
> *${usedPrefix}rship gift <no/nama> item/money ...*
> ↳ Memilih pasangan tertentu dengan nomor atau nama.
> *${usedPrefix}rship belicincin <no> <silver|gold|topaz|amethyst|ruby|sapphire|emerald|platinum|diamond|jade>*
> ↳ Membeli cincin pernikahan.
> *${usedPrefix}rship nikah <no>*
> ↳ Menikahi pasangan yang memenuhi syarat.
> *${usedPrefix}rship anak <no>*
> ↳ Memiliki anak bersama pasangan.
> *${usedPrefix}rship kid adopt*
> ↳ Panduan adopsi dari panti asuhan.
> *${usedPrefix}rship kid adopt list*
> ↳ Melihat anak orphaned yang tersedia untuk diadopsi.
> *${usedPrefix}rship kid adopt <no>*
> ↳ Memilih anak dari daftar; perpindahan memerlukan konfirmasi.
> *${usedPrefix}rship anak adopsi <no-anak> @user*
> ↳ Tawarkan anakmu ke pemain RPG; anak baru pindah setelah penerima menerima.
> *${usedPrefix}rship anak asuh terima/tolak*
> ↳ Penerima menerima atau menolak tawaran pengasuhan langsung.
> *${usedPrefix}rship kid <aktivitas> <pasangan/all> <anak/all>*
> ↳ Aktivitas: hibur, main, jalan, makan, tidur, mandi, peluk, puji, motivasi.
> *${usedPrefix}rship urus <pasangan/all> <anak/all>*
> ↳ Premium: menjalankan semua 9 aktivitas pengasuhan.
> *${usedPrefix}rship kid rename <pasangan> <anak> <nama baru>*
> ↳ Mengganti nama anak.
> *${usedPrefix}rship kid daycare/orphanage <pasangan> <anak>*
> ↳ Menitipkan anak dengan konfirmasi dan biaya berkala.
> *${usedPrefix}rship kid moveout <pasangan> <anak>*
> ↳ Anak dewasa pindah rumah dengan konfirmasi.
> *${usedPrefix}rship duel <no>*
> ↳ Mengajak pasangan untuk berduel.
> *${usedPrefix}rship kill <no>*
> ↳ Meminta konfirmasi untuk memindahkan pasangan ke makam.
> *${usedPrefix}rship all <no pasangan/all>*
> ↳ Premium: menjalankan semua aktivitas yang siap untuk pasangan pilihan; cooldown all 30 menit.
> ↳ Batch: date, liburan, makan, peluk, mandi, tidur, belanja, kerja, usil, marah, maaf, talk, kiss, nonton, swim, wohoo, debat, prank, staycation, rampok.
> ↳ Contoh: ${usedPrefix}rship all 1 atau ${usedPrefix}rship all all.

─━━━━━━━━━━━━━━─

`

    cap += `💔 *LAINNYA*
> *${usedPrefix}rship rename yes/konfirmasi/no/batal*
> ↳ Konfirmasi atau batalkan perubahan nama.
> *${usedPrefix}rship title <no> ya/tidak*
> ↳ Mengatur title pasangan.
> *${usedPrefix}rship putus <no>*
> ↳ Alias: cerai/divorce. Meminta konfirmasi; pasangan masuk daftar mantan 7 hari.
> *${usedPrefix}rship kill <no>*
> ↳ Meminta konfirmasi; pasangan masuk makam 7 hari.
> *${usedPrefix}rship putus/kill konfirmasi/batal*
> ↳ Menyetujui atau membatalkan perpisahan/pemakaman.
> *${usedPrefix}rship exspouse* / *ex* / *balikan <no>*
> ↳ Lihat mantan dan balikan dalam 7 hari.
> *${usedPrefix}rship custody <joint|sole|foster|spouse|orphaned> <anak> [@user]*
> ↳ Atur hak asuh setelah putus; spouse tidak tersedia untuk kill.
> *${usedPrefix}rship custody terima/tolak*
> ↳ Terima atau tolak permintaan mengasuh anak foster.
> *${usedPrefix}rship makam* / *revive <no>*
> ↳ Lihat makam dan pulihkan dalam 7 hari.
> *${usedPrefix}rship shelter list*
> ↳ Lihat anak yang hilang/kabur di shelter.
> *${usedPrefix}rship shelter retrieve <no>*
> ↳ Coba jemput anak; peluang berhasil hanya ${Math.round(CHILD_RETRIEVE_CHANCE * 100)}%, dengan cooldown 30 menit.

─━━━━━━━━━━━━━━─`

    const commandSections = [
      {
        title: '💕 Dasar & pasangan',
        rows: [
          ['💞 Daftar pasangan', 'rship harem', 'Lihat status semua pasangan'],
          ['📊 Status pasangan', 'rship status', 'Cek level dan hubungan'],
          ['💬 Aktivitas pasangan', 'rship date', 'Pilih aktivitas hubungan'],
          ['⏰ Cooldown pasangan', 'rship cd', 'Cek semua cooldown'],
          ['💍 Fitur & cincin', 'rship fitur', 'Syarat level dan pilihan cincin']
        ].map(([title, command, description]) => ({ title, description, id: `${usedPrefix}${command}` }))
      },
      {
        title: '👶 Keluarga & anak',
        rows: [
          ['👶 Daftar anak', 'rship kid info', 'Lihat anak dalam keluarga'],
          ['📚 Panduan anak', 'rship kid guide', 'Cara merawat anak'],
          ['⏰ Cooldown anak', 'rship kid cd', 'Cek kapan aktivitas anak siap'],
          ['🧸 Aktivitas anak', 'rship kid', 'Pilih aktivitas pengasuhan'],
          ['🎁 Kirim hadiah', 'rship gift', 'Pilih pasangan dan hadiah secara interaktif']
        ].map(([title, command, description]) => ({ title, description, id: `${usedPrefix}${command}` }))
      },
      {
        title: '🏠 Fitur lainnya',
        rows: [
          ['🪦 Makam pasangan', 'rship makam', 'Lihat status pasangan di makam'],
          ['💔 Mantan', 'rship mantan list', 'Lihat daftar mantan'],
          ['🛟 Shelter anak', 'rship shelter list', 'Lihat status anak di shelter'],
          ['📋 Semua command', 'rship command all', 'Tampilkan daftar command lengkap']
        ].map(([title, command, description]) => ({ title, description, id: `${usedPrefix}${command}` }))
      }
    ]
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '💕 RSHIP • PILIH MENU',
      subtitle: 'Akses fitur hubungan dan keluarga',
      text: 'Pilih fitur yang ingin kamu buka.',
      buttonText: '💕 BUKA MENU RSHIP',
      sections: commandSections,
      fallbackText: cap
    })
  }

  // === MENU RINGKAS TANPA DAFTAR COMMAND ===
  if (!action) {
    let maxSlot = getMaxSlot()
    let cap = `╭─❏「 💕 RELATIONSHIP 」❏
│ 👤 PROFIL HUBUNGAN
╰─━━━━━━━━━━━━━━─

💰 *INFORMASI KEUANGAN*
> 💳 Bank: Rp${(user.bank || 0).toLocaleString('id-ID')}
> 💵 Uang: Rp${(wdb.money[m.sender] || 0).toLocaleString('id-ID')}
> ⏰ Waktu: ${waktu} | ${jam}:00 WIB

─━━━━━━━━━━━━━━─

💕 *STATUS KELUARGA*
> 💞 Pasangan: ${user.harem.length}/${maxSlot}
> 👶 Anak: ${user.kids.length}

`

    if (user.harem.length > 0) {
      cap += `💕 *DAFTAR PASANGAN*\n`

      user.harem.forEach((p, i) => {
        cap += `> *${i + 1}. ${getGenderEmoji(p.gender)} ${p.name}*\n`
        cap += `> ↳ Lv.${p.level || 1}${p.menikah ? ' • 💍 Menikah' : ''}\n`
      })
    } else {
      cap += `💔 *STATUS HUBUNGAN*
> ↳ Kamu masih jomblo.
`
    }

    cap += `
─━━━━━━━━━━━━━━─
📋 Ketik *${usedPrefix}rship command* untuk melihat semua fitur.

─━━━━━━━━━━━━━━─`

    return m.reply(cap)
  }


  const rshipGuideExp = () => `╭─❏「 📊 RSHIP EXP GUIDE 」❏
│ 💕 STANDAR EXP PASANGAN & KELUARGA
╰─━━━━━━━━━━━━━━─

💞 *PASANGAN*
> ↳ Base EXP tiap aktivitas pasangan: +${RSHIP_STANDARD_PARTNER_EXP} EXP.
> ↳ Semua aktivitas pasangan memakai nilai yang sama agar tidak ada perbedaan EXP antar kegiatan.
> ↳ Contoh: date, talk, makan, liburan, peluk, mandi, tidur, belanja, kerja, usil, marah, maaf, kiss, nonton, swim, wohoo, debat, prank, staycation, rampok, duel, dll. semua memakai +${RSHIP_STANDARD_PARTNER_EXP} EXP dasar.
> ↳ Catatan: event seperti love_season/cold_war bisa menambah atau menurunkan multiplier, tetapi aturan dasarnya tetap sama.

👶 *ANAK*
> ↳ hibur: +8 EXP
> ↳ main: +10 EXP
> ↳ jalan: +12 EXP
> ↳ makan: +8 EXP
> ↳ tidur: +7 EXP
> ↳ mandi: +8 EXP
> ↳ peluk: +10 EXP
> ↳ puji: +6 EXP
> ↳ motivasi: +9 EXP

🏠 *HOME / RUMAH*
> ↳ Aktivitas rumah tidak memakai EXP pasangan seperti .rship date; fokus utamanya memberi love/harmony dan support untuk anggota rumah.
> ↳ Rumah memberi bonus love: pasangan terpilih +1 love, anak terpilih +2 love, pet terpilih +5 bahagia dan +5 EXP.
> ↳ Jadi sumber EXP dari rumah itu bersifat pendukung, bukan aktivitas pasangan dengan base ${RSHIP_STANDARD_PARTNER_EXP}.

🎁 *HADIAH*
> ↳ Gift item juga memberi EXP sesuai nominal hadiah, misalnya bunga 40, eskrim 80, sate 100, coklat 120, dll.
> ↳ Nilai EXP hadiah berubah sesuai item; ini berbeda dari aktivitas pasangan yang tetap seragam.

─━━━━━━━━━━━━━━─

> ↳ Gunakan ${usedPrefix}rship command all untuk lihat semua fitur.
> ↳ Gunakan ${usedPrefix}rship command pasangan untuk aktivitas pasangan.
> ↳ Gunakan ${usedPrefix}rship command anak untuk aktivitas keluarga.
> ↳ Gunakan ${usedPrefix}rship command rumah untuk aktivitas rumah.

─━━━━━━━━━━━━━━─`

  const buildRshipCommandBlock = (category = 'all') => {
    const sections = {
      dasar: `╭─❏「 📋 RSHIP COMMAND 」❏
│ 💕 KATEGORI: DASAR
╰─━━━━━━━━━━━━━━─

💕 *SETUP & STATUS*
> *${usedPrefix}rship tembak <nama> <cowok/cewek/pria/perempuan/male/female>*
> ↳ Membuat pasangan baru.
> *${usedPrefix}rship lamar <nama> <gender> <mahar>*
> ↳ Lamaran langsung menikah dan memakai mahar dari bank RPG.
> *${usedPrefix}rship harem*
> ↳ Melihat semua pasangan.
> *${usedPrefix}rship status <no>*
> ↳ Menampilkan status pasangan.
> *${usedPrefix}rship detail <no>*
> ↳ Detail lengkap pasangan.
> *${usedPrefix}rship fitur*
> ↳ Melihat syarat level fitur.
> *${usedPrefix}rship cincin*
> ↳ Melihat pilihan cincin dan harga.
> *${usedPrefix}rship cd*
> ↳ Melihat cooldown pasangan dan anak.

─━━━━━━━━━━━━━━─

> ↳ Ketik ${usedPrefix}rship command all untuk lihat semua kategori.

─━━━━━━━━━━━━━━─`,
      pasangan: `╭─❏「 📋 RSHIP COMMAND 」❏
│ 💕 KATEGORI: PASANGAN
╰─━━━━━━━━━━━━━━─

🎭 *AKTIVITAS PASANGAN*
> *${usedPrefix}rship date <no>*
> ↳ Berkencan; EXP dasar +${RSHIP_STANDARD_PARTNER_EXP}.
> *${usedPrefix}rship talk <no>*
> ↳ Mengobrol.
> *${usedPrefix}rship makan <no>*
> ↳ Makan bersama.
> *${usedPrefix}rship liburan <no>*
> ↳ Liburan bersama.
> *${usedPrefix}rship peluk <no>*
> ↳ Memeluk.
> *${usedPrefix}rship usil <no>*
> ↳ Mengusili pasangan.
> *${usedPrefix}rship prank <no>*
> ↳ Menggoda/bercanda.
> *${usedPrefix}rship debat <no>*
> ↳ Berdebat.
> *${usedPrefix}rship maaf <no>*
> ↳ Meminta maaf.
> *${usedPrefix}rship mandi <no>*
> ↳ Mandi bersama.
> *${usedPrefix}rship tidur <no>*
> ↳ Tidur bersama.
> *${usedPrefix}rship nonton <no>*
> ↳ Menonton bersama.
> *${usedPrefix}rship swim <no>*
> ↳ Berenang bersama.
> *${usedPrefix}rship belanja <no>*
> ↳ Berbelanja bersama.
> *${usedPrefix}rship marah <no>*
> ↳ Melampiaskan emosi.
> *${usedPrefix}rship rampok <no>*
> ↳ Merampok pasangan.
> *${usedPrefix}rship staycation <no>*
> ↳ Staycation romantis.
> *${usedPrefix}rship kerja <no>*
> ↳ Bekerja bersama.
> *${usedPrefix}rship kiss <no>*
> ↳ Mencium pasangan.
> *${usedPrefix}rship wohoo <no>*
> ↳ Aktivitas level tinggi.

> ↳ Semua aktivitas pasangan memakai EXP dasar +${RSHIP_STANDARD_PARTNER_EXP}.

─━━━━━━━━━━━━━━─`,
      keluarga: `╭─❏「 📋 RSHIP COMMAND 」❏
│ 💕 KATEGORI: KELUARGA
╰─━━━━━━━━━━━━━━─

💍 *HADIAH & KELUARGA*
> *${usedPrefix}rship gift list*
> ↳ Daftar hadiah pasangan.
> *${usedPrefix}rship gift item ...*
> ↳ Memberi item ke pasangan.
> *${usedPrefix}rship gift money ...*
> ↳ Memberi uang ke pasangan.
> *${usedPrefix}rship gift anak <no> item ...*
> ↳ Memberi item ke anak.
> *${usedPrefix}rship gift anak <no> money ...*
> ↳ Memberi uang ke anak.
> *${usedPrefix}rship nikah <no>*
> ↳ Menikahkan pasangan.
> *${usedPrefix}rship anak <no>*
> ↳ Memiliki anak.
> *${usedPrefix}rship kid info*
> ↳ Lihat daftar anak.
> *${usedPrefix}rship kid <aktivitas> <pasangan/all> <anak/all>*
> ↳ Aktivitas: hibur, main, jalan, makan, tidur, mandi, peluk, puji, motivasi.
> *${usedPrefix}rship urus <pasangan/all> <anak/all>*
> ↳ Premium: semua aktivitas anak sekaligus.
> *${usedPrefix}rship kid adopt/list/adopt <no>*
> ↳ Mengadopsi anak dari panti asuhan.
> *${usedPrefix}rship anak adopsi <no-anak> @user*
> ↳ Menawarkan anak untuk diasuh.
> *${usedPrefix}rship custody <joint|sole|foster|spouse|orphaned> <anak> [@user]*
> ↳ Mengatur hak asuh.
> *${usedPrefix}rship kid rename <pasangan> <anak> <nama baru>*
> ↳ Mengganti nama anak.
> *${usedPrefix}rship kid daycare/orphanage <pasangan> <anak>*
> ↳ Menitipkan anak.
> *${usedPrefix}rship kid moveout <pasangan> <anak>*
> ↳ Anak dewasa pindah rumah.

─━━━━━━━━━━━━━━─`,
      rumah: `╭─❏「 📋 RSHIP COMMAND 」❏
│ 💕 KATEGORI: RUMAH
╰─━━━━━━━━━━━━━━─

🏠 *AKTIVITAS RUMAH / HOME*
> *${usedPrefix}home*
> ↳ Menu utama rumah.
> *${usedPrefix}home care*
> ↳ Menjaga kebersihan dan kenyamanan rumah.
> *${usedPrefix}home staff*
> ↳ Kelola staf rumah.
> *${usedPrefix}home upgrade*
> ↳ Upgrade dan tingkatkan kualitas rumah.
> *${usedPrefix}home visit* / *${usedPrefix}home explore*
> ↳ Kunjungi rumah atau melihat rumah publik.

> ↳ Sumber EXP rumah biasanya berupa bonus love + pet +5 EXP, bukan EXP pasangan seragam.

─━━━━━━━━━━━━━━─`,
      lainnya: `╭─❏「 📋 RSHIP COMMAND 」❏
│ 💕 KATEGORI: LAINNYA
╰─━━━━━━━━━━━━━━─

💔 *LAINNYA*
> *${usedPrefix}rship rename yes/konfirmasi/no/batal*
> ↳ Konfirmasi atau batalkan perubahan nama.
> *${usedPrefix}rship title <no> ya/tidak*
> ↳ Mengatur title pasangan.
> *${usedPrefix}rship putus <no>* / *${usedPrefix}rship divorce <no>*
> ↳ Memutus hubungan / cerai.
> *${usedPrefix}rship exspouse* / *ex* / *balikan <no>*
> ↳ Lihat mantan dan balikan.
> *${usedPrefix}rship duel <no>*
> ↳ Mengajak pasangan berduel.
> *${usedPrefix}rship kill <no>*
> ↳ Memindahkan pasangan ke makam.
> *${usedPrefix}rship makam* / *revive <no>*
> ↳ Lihat dan pulihkan makam.
> *${usedPrefix}rship shelter list* / *retrieve <no>*
> ↳ Lihat dan ambil anak yang ada di shelter.

─━━━━━━━━━━━━━━─`,
      all: `╭─❏「 📋 RSHIP COMMAND 」❏
│ 💕 DAFTAR COMMAND RELATIONSHIP
╰─━━━━━━━━━━━━━━─

💕 *DASAR*
> *${usedPrefix}rship tembak <nama> <cowok/cewek/pria/perempuan/male/female>*
> ↳ Membuat pasangan baru.
> *${usedPrefix}rship lamar <nama> <gender> <mahar>*
> ↳ Lamaran langsung menikah.
> *${usedPrefix}rship harem*
> ↳ Melihat semua pasangan.
> *${usedPrefix}rship status <no>*
> ↳ Melihat status pasangan.
> *${usedPrefix}rship detail <no>*
> ↳ Melihat detail pasangan.
> *${usedPrefix}rship fitur*
> ↳ Melihat fitur berdasarkan level.
> *${usedPrefix}rship cd*
> ↳ Melihat cooldown aktivitas.

─━━━━━━━━━━━━━━─

🎭 *PASANGAN*
> *${usedPrefix}rship date <no>*
> ↳ Berkencan; EXP dasar +${RSHIP_STANDARD_PARTNER_EXP}.
> *${usedPrefix}rship talk <no>*
> ↳ Mengobrol.
> *${usedPrefix}rship makan <no>*
> ↳ Makan bersama.
> *${usedPrefix}rship liburan <no>*
> ↳ Liburan bersama.
> *${usedPrefix}rship all <no/all>*
> ↳ Premium: menjalankan semua aktivitas pasangan yang siap.

─━━━━━━━━━━━━━━─

💍 *KELUARGA & HADIAH*
> *${usedPrefix}rship gift list*
> ↳ Melihat daftar hadiah pasangan.
> *${usedPrefix}rship kid info*
> ↳ Melihat daftar anak keluarga.
> *${usedPrefix}rship kid <aktivitas> <pasangan/all> <anak/all>*
> ↳ Aktivitas: hibur, main, jalan, makan, tidur, mandi, peluk, puji, motivasi.
> *${usedPrefix}rship urus <pasangan/all> <anak/all>*
> ↳ Premium: semua aktivitas pengasuhan sekaligus.
> *${usedPrefix}rship kid adopt/list/adopt <no>*
> ↳ Panduan dan pilih adopsi anak.

─━━━━━━━━━━━━━━─

🏠 *RUMAH / HOME*
> *${usedPrefix}home*
> ↳ Menu rumah utama.
> *${usedPrefix}home care*
> ↳ Merawat rumah.
> *${usedPrefix}home staff*
> ↳ Kelola staf rumah.

─━━━━━━━━━━━━━━─

💔 *LAINNYA*
> *${usedPrefix}rship rename yes/konfirmasi/no/batal*
> ↳ Konfirmasi nama.
> *${usedPrefix}rship putus <no>*
> ↳ Cerai / putus.
> *${usedPrefix}rship exspouse* / *ex* / *balikan <no>*
> ↳ Mantan dan balikan.
> *${usedPrefix}rship custody <joint|sole|foster|spouse|orphaned> <anak> [@user]*
> ↳ Hak asuh anak.

> ↳ Ketik ${usedPrefix}rship command <all|dasar|pasangan|keluarga|rumah|lainnya> untuk melihat kategori tertentu.

─━━━━━━━━━━━━━━─`
    }
    return sections[category] || sections.all
  }

  // === PANDUAN RSHIP ===
  if (action === 'guide' || action === 'panduan') {
    const guideTarget = (args[1] || '').toLowerCase()
    if (guideTarget === 'exp' || guideTarget === 'xp') return m.reply(rshipGuideExp())
    return m.reply(
      `╭─❏「 📖 RSHIP GUIDE 」❏
│ 💕 PANDUAN FITUR RELATIONSHIP
╰─━━━━━━━━━━━━━━─

💕 *DASAR RELATIONSHIP*
> 1. Buat pasangan: ${usedPrefix}rship tembak <nama> <cowok/cewek/pria/perempuan/male/female>
> 2. Lamaran langsung menikah: ${usedPrefix}rship lamar <nama> <gender> <mahar>
> 3. Lihat pasangan: ${usedPrefix}rship harem
> 4. Jalankan aktivitas: ${usedPrefix}rship date <no>
> 5. Cek level dan fitur: ${usedPrefix}rship status <no>
> 6. Lihat cooldown: ${usedPrefix}rship cd
> 7. Lihat daftar hadiah: ${usedPrefix}rship gift list
> 8. Cek EXP per aktivitas: ${usedPrefix}rship guide exp

─━━━━━━━━━━━━━━─

📋 *INFORMASI TAMBAHAN*
> ↳ Aktivitas memakai nomor pasangan dari menu harem.
> ↳ Mahar lebih besar meningkatkan peluang lamaran diterima.
> ↳ Lamaran langsung menikah pada Lv.1; fitur anak tetap butuh Lv.50.
> ↳ Cooldown aktivitas berlaku untuk semua pasangan.
> ↳ Gunakan ${usedPrefix}rship command all untuk daftar command lengkap.
> ↳ Gunakan ${usedPrefix}rship command <all|dasar|pasangan|keluarga|rumah|lainnya> untuk kategori tertentu.
> ↳ Gunakan ${usedPrefix}rship fitur untuk syarat level.

─━━━━━━━━━━━━━━─`
    )
  }

  // === DAFTAR COMMAND RSHIP ===
  if (action === 'command' || action === 'commands' || action === 'cmd') {
    const categoryMap = {
      all: 'all', semua: 'all', default: 'all',
      dasar: 'dasar', basic: 'dasar', base: 'dasar',
      pasangan: 'pasangan', partner: 'pasangan', couple: 'pasangan',
      keluarga: 'keluarga', family: 'keluarga', anak: 'keluarga', kid: 'keluarga',
      rumah: 'rumah', home: 'rumah',
      lainnya: 'lainnya', other: 'lainnya', lain: 'lainnya',
      hadiah: 'keluarga', gift: 'keluarga'
    }
    const requestedCategory = (args[1] || 'all').toLowerCase()
    const category = categoryMap[requestedCategory] || 'all'
    return m.reply(buildRshipCommandBlock(category))
  }

  // === MENU RINGKAS TANPA DAFTAR COMMAND ===
  if (!action) {
    let maxSlot = getMaxSlot()
    let cap = `╭─❏「 💕 RELATIONSHIP 」❏
│ 👤 PROFIL HUBUNGAN
╰─━━━━━━━━━━━━━━─

💰 *INFORMASI KEUANGAN*
> 💳 Bank: Rp${(user.bank || 0).toLocaleString('id-ID')}
> 💵 Uang: Rp${(wdb.money[m.sender] || 0).toLocaleString('id-ID')}
> ⏰ Waktu: ${waktu} | ${jam}:00 WIB

─━━━━━━━━━━━━━━─

💕 *STATUS KELUARGA*
> 💞 Pasangan: ${user.harem.length}/${maxSlot}
> 👶 Anak: ${user.kids.length}

`

    if (user.harem.length > 0) {
      cap += `💕 *DAFTAR PASANGAN*\n`

      user.harem.forEach((p, i) => {
        cap += `> *${i + 1}. ${getGenderEmoji(p.gender)} ${p.name}*\n`
        cap += `> ↳ Lv.${p.level || 1}${p.menikah ? ' • 💍 Menikah' : ''}\n`
      })
    } else {
      cap += `💔 *STATUS HUBUNGAN*
> ↳ Kamu masih jomblo.
`
    }

    cap += `
─━━━━━━━━━━━━━━─
📋 Ketik *${usedPrefix}rship command* untuk melihat semua fitur.

─━━━━━━━━━━━━━━─`

    return m.reply(cap)
  }


  // === TEMBAK ===
  if (action === 'tembak') {
    let maxSlot = getMaxSlot()
    if (user.harem.length >= maxSlot) return m.reply(`╭─❏「 ❌ SLOT PENUH 」❏
│ 📋 STATUS SLOT PASANGAN
╰─━━━━━━━━━━━━━━─

> 💞 Slot: ${user.harem.length}/${maxSlot}
> ↳ Naikin ke Lv.20 buat +1 slot.

─━━━━━━━━━━━━━━─`)
    let nama = args[1]
    let gender = args[2]?.toLowerCase()
    if (!nama ||!gender) return m.reply(`╭─❏「 ❌ FORMAT SALAH 」❏
│ 📋 FORMAT PENAMBAHAN PASANGAN
╰─━━━━━━━━━━━━━━─

> 📝 Contoh: ${usedPrefix}rship tembak Rem cewek

─━━━━━━━━━━━━━━─`)
    const genderAliases = {
      cowok: 'cowok', pria: 'cowok', male: 'cowok', cowo: 'cowok', boy: 'cowok',
      cewek: 'cewek', perempuan: 'cewek', female: 'cewek', cewe: 'cewek', girl: 'cewek'
    }
    gender = genderAliases[gender]
    if (!gender) return m.reply(`╭─❏「 ❌ GENDER TIDAK VALID 」❏
│ 📋 PILIHAN GENDER
╰─━━━━━━━━━━━━━━─

> ♂️ Cowok: cowok / pria / male / cowo / boy
> ♀️ Cewek: cewek / perempuan / female / cewe / girl

─━━━━━━━━━━━━━━─`)
    user.harem.push({ name: nama, gender: gender, love: 50, exp: 0, level: 1, menikah: false, cincin: null })
    saveDB(wdb)
    return m.reply(`╭─❏「 💕 JADIAN! 」❏
│ 💞 PASANGAN BARU DITAMBAHKAN
╰─━━━━━━━━━━━━━━─

> ${getGenderEmoji(gender)} *${nama}* jadi pasanganmu!
> 📊 Level: Lv.1 ${getTitle(1)}

─━━━━━━━━━━━━━━─`)
  }

  // === RENAME PASANGAN ===
  if (action === 'rename') {
    const confirmAction = args[1]?.toLowerCase()
    const pendingRename = user.pendingRshipRename

    if (['yes', 'konfirmasi'].includes(confirmAction)) {
      if (!pendingRename) return m.reply(`╭─❏「 ❌ TIDAK ADA KONFIRMASI 」❏
│ 📋 STATUS PERUBAHAN NAMA
╰─━━━━━━━━━━━━━━─

> ↳ Tidak ada perubahan nama yang menunggu konfirmasi.

─━━━━━━━━━━━━━━─`)

      const partner = user.harem[pendingRename.index]
      if (!partner || partner.name !== pendingRename.oldName) {
        delete user.pendingRshipRename
        saveDB(wdb)
        return m.reply(`╭─❏「 ❌ PASANGAN TIDAK DITEMUKAN 」❏
│ 📋 VALIDASI DATA PASANGAN
╰─━━━━━━━━━━━━━━─

> ↳ Data pasangan berubah. Ajukan rename kembali.

─━━━━━━━━━━━━━━─`)
      }

      const oldName = partner.name
      partner.name = pendingRename.newName
      user.kids.forEach(child => {
        if (child.ortu === oldName) child.ortu = pendingRename.newName
      })
      user.orphanageKids.forEach(child => {
        if (child.ortu === oldName) child.ortu = pendingRename.newName
      })
      delete user.pendingRshipRename
      saveDB(wdb)
      return m.reply(`╭─❏「 🏷️ NAMA PASANGAN DIUBAH 」❏
│ 📋 PERUBAHAN NAMA BERHASIL
╰─━━━━━━━━━━━━━━─

> 📝 ${oldName} menjadi *${partner.name}*

─━━━━━━━━━━━━━━─`)
    }

    if (['no', 'batal'].includes(confirmAction)) {
      if (!pendingRename) return m.reply(`╭─❏「 ❌ TIDAK ADA KONFIRMASI 」❏
│ 📋 STATUS PERUBAHAN NAMA
╰─━━━━━━━━━━━━━━─

> ↳ Tidak ada perubahan nama yang menunggu konfirmasi.

─━━━━━━━━━━━━━━─`)
      delete user.pendingRshipRename
      saveDB(wdb)
      return m.reply(`╭─❏「 ❌ RENAME DIBATALKAN 」❏
│ 📋 STATUS PERUBAHAN NAMA
╰─━━━━━━━━━━━━━━─

> ↳ Perubahan nama pasangan dibatalkan.

─━━━━━━━━━━━━━━─`)
    }

    if (pendingRename) return m.reply(`╭─❏「 ⚠️ RENAME MENUNGGU 」❏
│ 📋 SELESAIKAN PERMINTAAN SEBELUMNYA
╰─━━━━━━━━━━━━━━─

> ↳ Konfirmasi perubahan nama:
> ${usedPrefix}rship rename yes
> ${usedPrefix}rship rename batal

─━━━━━━━━━━━━━━─`)

    const partnerNumber = Number(args[1])
    const newName = args.slice(2).join(' ').trim()
    if (!Number.isInteger(partnerNumber) || partnerNumber < 1 || !newName) {
      return m.reply(`╭─❏「 ❌ FORMAT SALAH 」❏
│ 📋 FORMAT RENAME PASANGAN
╰─━━━━━━━━━━━━━━─

> ↳ Contoh: ${usedPrefix}rship rename 1 Nama Baru

─━━━━━━━━━━━━━━─`)
    }

    const partner = user.harem[partnerNumber - 1]
    if (!partner) return m.reply(`╭─❏「 ❌ PASANGAN TIDAK DITEMUKAN 」❏
│ 📋 VALIDASI NOMOR PASANGAN
╰─━━━━━━━━━━━━━━─

> ↳ Nomor pasangan tidak ada di daftar harem.

─━━━━━━━━━━━━━━─`)
    if (newName.length > 30) return m.reply(`╭─❏「 ❌ NAMA TERLALU PANJANG 」❏
│ 📋 BATAS KARAKTER NAMA
╰─━━━━━━━━━━━━━━─

> ↳ Nama pasangan maksimal 30 karakter.

─━━━━━━━━━━━━━━─`)
    if (partner.name === newName) return m.reply(`╭─❏「 ℹ️ NAMA SUDAH SAMA 」❏
│ 📋 INFORMASI PASANGAN
╰─━━━━━━━━━━━━━━─

> ↳ Nama pasangan itu sudah *${newName}*.

─━━━━━━━━━━━━━━─`)

    user.pendingRshipRename = {
      index: partnerNumber - 1,
      oldName: partner.name,
      newName
    }
    saveDB(wdb)
    return m.reply(`╭─❏「 ⚠️ KONFIRMASI RENAME 」❏
│ 📋 PERIKSA PERUBAHAN NAMA
╰─━━━━━━━━━━━━━━─

> 💕 Pasangan: *${partner.name}*
> 🏷️ Nama baru: *${newName}*

─━━━━━━━━━━━━━━─

📝 *KONFIRMASI*
> ✅ Lanjut: ${usedPrefix}rship rename yes
> ✅ Lanjut: ${usedPrefix}rship rename konfirmasi
> ❌ Batal: ${usedPrefix}rship rename no
> ❌ Batal: ${usedPrefix}rship rename batal

─━━━━━━━━━━━━━━─`)
  }

  // === HAREM ===
  if (action === 'harem') {
    if(user.harem.length === 0) return m.reply(`╭─❏「 💔 JOMBLO 」❏
│ 📋 STATUS HUBUNGAN
╰─━━━━━━━━━━━━━━─`)
    let progressRepaired = false
    for (const partner of user.harem) {
      if (applyPartnerExp(partner, 0)) progressRepaired = true
    }
    if (progressRepaired) await saveDB(wdb)
    let maxSlot = getMaxSlot()
    let cap = `╭─❏「 💕 DAFTAR PASANGAN 」❏
│ 📌 Slot: ${user.harem.length}/${maxSlot}
╰─━━━━━━━━━━━━━━─

`
    user.harem.forEach((p, i) => {
      let need = (p.level || 1) * 200
      let title = getTitle(p.level, p.customTitle)
      cap += `💕 *${i + 1}. ${getGenderEmoji(p.gender)} ${p.name}* ${p.menikah ? '💍' : ''}\n`
      cap += `> 🏷️ Title: ${title}\n`
      cap += `> 😊 Mood: ${getMood(p.love)}\n`
      cap += `> 📈 EXP: ${bar((p.exp || 0) / need * 100)} ${p.exp || 0}/${need}\n`
      cap += `> 💌 Love: ${bar(p.love)} ${p.love}%\n`
      if(p.waitTitleUp) cap += `> ⚠️ Ketik *${usedPrefix}rship title ${i + 1}* untuk memilih\n`
      cap += `\n`
    })
    return m.reply(cap + `─━━━━━━━━━━━━━━─`)
  }

  // === STATUS ===
if (action === 'status') {
  let no = parseInt(args[1]) - 1

  if (isNaN(no) || !user.harem[no]) {
    return m.reply(
      `╭─❏「 ❌ SALAH 」❏\n` +
      `│ ❌ *DATA TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Contoh: *${usedPrefix}rship status 1*`
    )
  }

  let p = user.harem[no]
  if (applyPartnerExp(p, 0)) await saveDB(wdb)
  let need = (p.level || 1) * 200
  let anakPasangan = user.kids.filter(k => k.ortu === p.name)

  let cap = `╭─❏「 💕 STATUS ${p.name.toUpperCase()} 」❏\n`
  cap += `│ 💕 *INFORMASI PASANGAN*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `${getGenderEmoji(p.gender)} *Nama: ${p.name}*\n`
  cap += `> ↳ 📊 Level: Lv.${p.level} ${getTitle(p.level, p.customTitle)}\n`
  cap += `> ↳ 📈 EXP: ${p.exp || 0}/${need}\n`
  cap += `> ↳ 💍 Status: ${p.menikah ? 'Menikah 💍' : 'Pacaran 💞'}\n`
  cap += `> ↳ 💌 Love: ${p.love}% ${bar(p.love)}\n`
  cap += `> ↳ 😊 Mood: ${getMood(p.love)}\n`

  if (p.waitTitleUp) {
    cap += `\n─━━━━━━━━━━━━━━─\n\n`
    cap += `⚠️ *TITLE TERSEDIA*\n`
    cap += `> ↳ Ketik *${usedPrefix}rship title ${no + 1}* untuk memilih title baru.\n`
  }

  if (anakPasangan.length > 0) {
    cap += `\n─━━━━━━━━━━━━━━─\n\n`
    cap += `👶 *ANAK* • ${anakPasangan.length}\n\n`

    anakPasangan.forEach((k, i) => {
      const careCount = getChildCareCount(k)
      const gender = k.jenis === 'Laki-laki' ? 'cowok' : 'cewek'

      cap += `*${i + 1}. ${getGenderEmoji(gender)} ${k.nama}*\n`
      cap += `> ↳ ${getChildStage(careCount).name}\n`
    })
  }

  cap += `\n─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}


// === PILIH TITLE ===
if (action === 'title') {
  let no = parseInt(args[1]) - 1
  let pilih = args[2]?.toLowerCase()

  if(isNaN(no) || !user.harem[no]) return m.reply(
    `╭─❏「 ❌ SALAH 」❏\n` +
    `│ ❌ *FORMAT SALAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Contoh: .rship title 1 ya/tidak`
  )

  let p = user.harem[no]

  if(!p.waitTitleUp) return m.reply(
    `╭─❏「 ❌ TIDAK BISA 」❏\n` +
    `│ ❌ *TITLE BELUM TERSEDIA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${p.name} belum level up.`
  )

  if(pilih === 'ya'){
    delete p.waitTitleUp
    delete p.customTitle
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🎉 TITLE BARU 」❏\n` +
      `│ 🎉 *TITLE BERHASIL DIGANTI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${p.name} naik jadi ${getTitle(p.level)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  } else if(pilih === 'tidak'){
    p.customTitle = getTitle(p.level - 1, p.customTitle)
    delete p.waitTitleUp
    saveDB(wdb)

    return m.reply(
      `╭─❏「 💕 STAY TITLE 」❏\n` +
      `│ 💕 *TITLE TETAP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${p.name} tetap ${getTitle(p.level, p.customTitle)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  } else {
    return m.reply(
      `╭─❏「 ❓ PILIHAN 」❏\n` +
      `│ ❓ *PILIH TITLE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Naikkan title ${p.name} ke ${getTitle(p.level)}?\n\n` +
      `📌 *PILIHAN*\n` +
      `> ↳ .rship title ${no+1} ya\n` +
      `> ↳ .rship title ${no+1} tidak\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
}


// === FITUR LIST ===
if (action === 'fitur') {
  let maxPartnerLvl = user.harem.reduce((max, cur) => Math.max(max, cur.level || 1), 0)
  let isNikah = user.harem.some(cur => cur.menikah)

  let getLock = (reqLvl, reqNikah = false) => {
    if (reqNikah && !isNikah) return '🔒'
    return maxPartnerLvl >= reqLvl ? '🔓' : '🔒'
  }

  let cap = `╭─❏「 📋 FITUR RELATIONSHIP 」❏\n`
  cap += `│ 📋 *DAFTAR FITUR*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `💞 *FITUR TERBUKA*\n`
  cap += `> ↳ Fitur terbuka mengikuti level pasangan dan status nikah.\n\n`

  cap += `*Lv.1* ${getLock(1)}\n`
  cap += `> ↳ date, talk, makan, marah, maaf, usil, prank, debat, santet, kill, duel, putus\n\n`

  cap += `*Lv.10* ${getLock(10)}\n`
  cap += `> ↳ peluk, belanja, staycation\n\n`

  cap += `*Lv.20* ${getLock(20)}\n`
  cap += `> ↳ nonton, swim, liburan, rampok\n\n`

  cap += `*Lv.27* ${getLock(27, true)}\n`
  cap += `> ↳ kiss - Harus Nikah\n\n`

  cap += `*Lv.40* ${getLock(40, true)}\n`
  cap += `> ↳ mandi, tidur, nikah, wohoo, kerja - Harus Nikah\n\n`

  cap += `*Lv.50* ${getLock(50, true)}\n`
  cap += `> ↳ anak - Nikah + Love 70%\n\n`

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `🔓 *STATUS FITUR*\n`
  cap += `> ↳ 🔓 Fitur terbuka\n`
  cap += `> ↳ 🔒 Fitur terkunci\n\n`

  cap += `💡 *INFORMASI*\n`
  cap += `> ↳ Slot: +1 tiap pasangan Lv.20, maksimal 10\n`
  cap += `> ↳ Cooldown: Maaf 30m - Talk 15m\n\n`

  cap += `─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}


// === GIFT LIST ===
if (action === 'gift' && args[1]?.toLowerCase() === 'list') {
  const requestedPage = Number(args[2] || 1)
  if (!Number.isSafeInteger(requestedPage) || requestedPage < 1 || requestedPage > giftPageCount) {
    return m.reply(`❌ Pilih halaman katalog dari *1–${giftPageCount}*.\nContoh: *${usedPrefix}rship gift list 1*`)
  }
  const navigationButtons = []
  if (requestedPage > 1) navigationButtons.push(['⬅️ Sebelumnya', `${usedPrefix}rship gift list ${requestedPage - 1}`])
  if (requestedPage < giftPageCount) navigationButtons.push(['Berikutnya ➡️', `${usedPrefix}rship gift list ${requestedPage + 1}`])
  navigationButtons.push(['💝 Mulai pilih hadiah', `${usedPrefix}rship gift`])
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    title: '🎁 KATALOG HADIAH',
    subtitle: `Halaman ${requestedPage} dari ${giftPageCount}`,
    text: formatGiftCatalogPage(requestedPage),
    footer: 'AVELIA • RSHIP GIFT',
    buttons: navigationButtons,
    fallbackText: formatGiftCatalogPage(requestedPage)
  })
}

  // === ANAK LIST ===
  const kidGuide = () =>
`╭─❏「 👶 PANDUAN KID 」❏
│ 📋 PANDUAN FITUR PENGASUHAN ANAK
╰─━━━━━━━━━━━━━━─

🧸 *AKTIVITAS ANAK*
> ↳ Format: ${usedPrefix}rship kid <aktivitas> <pasangan/all> <anak/all>
> ↳ Aktivitas: ${Object.keys(CHILD_ACTIVITIES).join(', ')}
> ↳ Contoh: ${usedPrefix}rship kid main 1 1
> ↳ Batch premium: ${usedPrefix}rship urus <pasangan/all> <anak/all>

─━━━━━━━━━━━━━━─

👨‍👩‍👧 *PENGELOLAAN ANAK*
> ↳ Info: ${usedPrefix}rship kid info
> ↳ Rename: ${usedPrefix}rship kid rename <pasangan> <anak> <nama>
> ↳ Rename anak asuh: ${usedPrefix}rship kid rename custody <no-anak> <nama>
> ↳ Kembalikan anak asuh ke pemilik asal: ${usedPrefix}rship kid return <no-anak>
> ↳ Moveout: ${usedPrefix}rship kid moveout <pasangan> <anak>

─━━━━━━━━━━━━━━─

⚖️ *HAK ASUH SETELAH BERPISAH*
> ↳ Joint: semua anak tetap diasuh bersama.
> ↳ Sole: pilih anak yang kamu asuh; sisanya diasuh mantan (atau panti jika kill).
> ↳ Foster: tag pemain lain; anak pindah hanya setelah dia menerima.
> ↳ Spouse: semua anak diasuh mantan pasangan; tidak tersedia saat kill.
> ↳ Orphaned: anak pilihan masuk daftar panti asuhan.
> ↳ Format: ${usedPrefix}rship custody <tipe> <all|1,2> [@user]
> ↳ Rawat anak hak asuh mandiri/foster: ${usedPrefix}rship kid <aktivitas> custody <no-anak>

🏡 *ADOPSI DARI PANTI ASUHAN*
> ↳ Panduan dan command: ${usedPrefix}rship kid adopt
> ↳ Lihat daftar anak: ${usedPrefix}rship kid adopt list
> ↳ Tawarkan anakmu ke pemain lain: ${usedPrefix}rship kid adopt <no-anak> @user <biaya>
> ↳ Pilih anak panti dari daftar: ${usedPrefix}rship kid adopt <no>
> ↳ Selesaikan konfirmasi: ${usedPrefix}rship kid adopt yes/no
> ↳ Alias command: ${usedPrefix}rship kid adopsi
> ↳ Daftar berisi anak orphaned yang dititipkan di panti; nama orang tua asal tetap tercatat.

👨‍👩‍👧 *PINDAHKAN ANAKMU KE PEMAIN LAIN*
> ↳ Ini transfer langsung dari keluargamu, bukan adopsi anak panti; tag pemain RPG yang bersedia.
> ↳ Pemilik: ${usedPrefix}rship kid adopt <no-anak> @user <biaya>
> ↳ Penerima: ${usedPrefix}rship kid adopt yes atau ${usedPrefix}rship kid adopt no
> ↳ Biaya opsional dipotong dari bank pemilik dan masuk ke bank penerima setelah diterima.
> ↳ Anak baru pindah setelah penerima menerima tawaran.
> ↳ Kembalikan anak asuh: ${usedPrefix}rship kid return <no-anak-asuh>

─━━━━━━━━━━━━━━─

🏠 *PENITIPAN ANAK*
> ↳ Daycare: ${usedPrefix}rship kid daycare <pasangan> <anak>
> ↳ Panti asuhan: ${usedPrefix}rship kid orphanage <pasangan> <anak>
> ↳ Bisa menggunakan nomor global anak.

📝 *ALIAS COMMAND*
> ↳ Daycare: daycare / dayc / dc
> ↳ Orphanage: orphanage / pa / pantiasuhan / orp

─━━━━━━━━━━━━━━─

⚠️ *ATURAN PENITIPAN*
> ↳ Konfirmasi menggunakan command tujuan diikuti yes atau no.
> ↳ Biaya ditagih otomatis setiap 24 jam.
> ↳ Tiga hari tanpa pembayaran membuat anak kembali ke keluarga.

💰 *PEMBAYARAN DI MUKA*
> ↳ ${usedPrefix}rship kid <daycare/orphanage> bayar <pasangan> <anak> <hari>

─━━━━━━━━━━━━━━─

📌 *PANDUAN LANJUTAN*
> ↳ Daftar command: ${usedPrefix}rship kid command
> ↳ Panduan fitur: ${usedPrefix}rship kid guide

─━━━━━━━━━━━━━━─`

  const kidCommandGuide = () =>
`╭─❏「 📋 COMMAND KID 」❏
│ 👶 DAFTAR COMMAND PENGASUHAN ANAK
╰─━━━━━━━━━━━━━━─

👶 *INFORMASI & PANDUAN*
> ↳ ${usedPrefix}rship kid info
> ↳ ${usedPrefix}rship kid guide
> ↳ ${usedPrefix}rship kid command
> ↳ Cooldown pasangan dan anak: ${usedPrefix}rship cd

─━━━━━━━━━━━━━━─

🧸 *AKTIVITAS ANAK*
> ↳ ${usedPrefix}rship kid hibur <pasangan/all> <anak/all>
> ↳ ${usedPrefix}rship kid main <pasangan/all> <anak/all>
> ↳ ${usedPrefix}rship kid jalan <pasangan/all> <anak/all>
> ↳ ${usedPrefix}rship kid makan <pasangan/all> <anak/all>
> ↳ ${usedPrefix}rship kid tidur <pasangan/all> <anak/all>
> ↳ ${usedPrefix}rship kid mandi <pasangan/all> <anak/all>
> ↳ ${usedPrefix}rship kid peluk <pasangan/all> <anak/all>
> ↳ ${usedPrefix}rship kid puji <pasangan/all> <anak/all>
> ↳ ${usedPrefix}rship kid motivasi <pasangan/all> <anak/all>
> ↳ Anak hak asuh mandiri/foster: ${usedPrefix}rship kid <aktivitas> custody <anak/all>

─━━━━━━━━━━━━━━─

💎 *FITUR PREMIUM*
> ↳ ${usedPrefix}rship urus <pasangan/all> <anak/all>
> ↳ Shortcut semua anak: ${usedPrefix}kidcare
> ↳ Menjalankan seluruh 9 aktivitas sekaligus.

─━━━━━━━━━━━━━━─

✏️ *PENGELOLAAN ANAK*
> ↳ ${usedPrefix}rship kid rename <pasangan> <anak> <nama baru>
> ↳ Anak asuh: ${usedPrefix}rship kid rename custody <no-anak> <nama baru>
> ↳ Kembalikan anak asuh ke pemilik asal: ${usedPrefix}rship kid return <no-anak>
> ↳ ${usedPrefix}rship kid moveout <pasangan> <anak>
> ↳ Moveout hanya berlaku untuk anak dewasa dan memerlukan konfirmasi.
> ↳ Panduan adopsi panti: ${usedPrefix}rship kid adopt
> ↳ Daftar anak untuk diadopsi: ${usedPrefix}rship kid adopt list
> ↳ Pilih anak untuk diadopsi: ${usedPrefix}rship kid adopt <no>
> ↳ Tawari anak ke pemain lain: ${usedPrefix}rship kid adopt <no-anak> @user <biaya>
> ↳ Pemain yang ditag menerima/menolak: ${usedPrefix}rship kid adopt yes/no
> ↳ Biaya asuh dibayar oleh pengirim hanya saat tawaran diterima.
> ↳ Kembalikan anak asuh: ${usedPrefix}rship kid return <no-anak>
> ↳ Anak kembali ke keluarga atau shelter tempat asalnya.

─━━━━━━━━━━━━━━─

🏠 *DAYCARE*
> ↳ ${usedPrefix}rship kid daycare info
> ↳ ${usedPrefix}rship kid daycare guide
> ↳ ${usedPrefix}rship kid daycare command
> ↳ ${usedPrefix}rship kid daycare list
> ↳ ${usedPrefix}rship kid daycare bayar <pasangan> <anak> <hari>
> ↳ ${usedPrefix}rship kid daycare <pasangan> <anak>

─━━━━━━━━━━━━━━─

🏡 *ORPHANAGE / PANTI ASUHAN*
> ↳ ${usedPrefix}rship kid orphanage info
> ↳ ${usedPrefix}rship kid orphanage guide
> ↳ ${usedPrefix}rship kid orphanage command
> ↳ ${usedPrefix}rship kid orphanage list
> ↳ ${usedPrefix}rship kid orphanage bayar <pasangan> <anak> <hari>
> ↳ Anak hak asuh mantan/panti: ${usedPrefix}rship kid orphanage bayar orphanage <no-anak> <hari>
> ↳ ${usedPrefix}rship kid orphanage <pasangan> <anak>

─━━━━━━━━━━━━━━─

⚠️ *CATATAN*
> ↳ Konfirmasi penitipan menggunakan yes atau no.
> ↳ Pembayaran otomatis dilakukan setiap 24 jam.
> ↳ Jika tidak membayar selama 3 hari, anak kembali ke keluarga.

─━━━━━━━━━━━━━━─`



const getKidTargets = (partnerSelector, childSelector, sourceKids = user.kids) => {
  const selector = partnerSelector?.toLowerCase()
  const getIndependentKids = () => sourceKids
      .map((child, globalIndex) => ({ child, globalIndex }))
      .filter(({ child }) =>
        ['foster', 'sole', 'joint'].includes(child.custody?.type) &&
        !child.facility &&
        (child.custody.type === 'foster' || !user.harem.some(partner => partner.name === child.ortu))
      )
  if (selector === 'foster' || selector === 'custody') {
    const independentKids = getIndependentKids()
      .filter(({ child }) => selector === 'custody' || child.custody.type === 'foster')
    const chosen = childSelector?.toLowerCase() === 'all'
      ? independentKids
      : independentKids.filter(({ globalIndex }) => globalIndex === Number(childSelector) - 1)
    return chosen.map(({ child, globalIndex }, index) => ({
      child,
      partner: { name: child.custody.type === 'foster' ? 'Anak Asuh' : 'Hak Asuh Mandiri' },
      partnerIndex: -1,
      childIndex: index,
      globalIndex
    }))
  }
  const partnerIndices = selector === 'all'
    ? user.harem.map((_, index) => index)
    : [Number(partnerSelector) - 1]
  if (!partnerSelector || partnerIndices.some(index => !Number.isInteger(index) || !user.harem[index])) return null
  const targets = []
  for (const partnerIndex of partnerIndices) {
    const partner = user.harem[partnerIndex]
    const children = sourceKids
      .map((child, globalIndex) => ({ child, globalIndex }))
      .filter(({ child }) => child.ortu === partner.name &&
        child.custody?.type !== 'spouse' && child.custody?.type !== 'foster')
    const chosen = childSelector?.toLowerCase() === 'all'
      ? children
      : children.filter((_, childIndex) => childIndex === Number(childSelector) - 1)
    targets.push(...chosen.map(({ child, globalIndex }, index) => ({
      child,
      partner,
      partnerIndex,
      childIndex: children.findIndex(entry => entry.child === child),
      globalIndex,
      index
    })))
  }
  if (selector === 'all') {
    const independentKids = getIndependentKids()
    const chosen = childSelector?.toLowerCase() === 'all'
      ? independentKids
      : independentKids.filter((_, childIndex) => childIndex === Number(childSelector) - 1)
    targets.push(...chosen.map(({ child, globalIndex }, index) => ({
      child,
      partner: { name: child.custody.type === 'foster' ? 'Anak Asuh' : 'Hak Asuh Mandiri' },
      partnerIndex: -1,
      childIndex: index,
      globalIndex
    })))
  }
  return targets
}

const getFacilityTargets = (facilityType, partnerSelector, childSelector) => {
  const sourceKids = facilityType === 'orphanage' ? user.orphanageKids : user.kids
  if (facilityType === 'orphanage' && ['orphanage', 'panti', 'orp'].includes(partnerSelector?.toLowerCase())) {
    const globalIndex = Number(childSelector) - 1
    const child = sourceKids[globalIndex]
    return child?.facility?.type === 'orphanage'
      ? [{ child, partner: { name: child.ortu }, partnerIndex: -1, childIndex: globalIndex, globalIndex }]
      : []
  }
  if (partnerSelector === 'all' || childSelector === 'all') {
    return getKidTargets(partnerSelector, childSelector, sourceKids)
  }
  if (childSelector === undefined && /^\d+$/.test(partnerSelector || '')) {
    const child = user.kids[Number(partnerSelector) - 1]
    if (!child || child.facility || !user.harem.some(partner => partner.name === child.ortu)) return []
    return [{
      child,
      partner: user.harem.find(partner => partner.name === child.ortu),
      partnerIndex: user.harem.findIndex(partner => partner.name === child.ortu),
      childIndex: Number(partnerSelector) - 1,
      globalIndex: Number(partnerSelector) - 1
    }]
  }
  return getKidTargets(partnerSelector, childSelector, sourceKids)
}

const facilityAliases = {
  daycare: 'daycare', dayc: 'daycare', dc: 'daycare',
  orphanage: 'orphanage', pa: 'orphanage', pantiasuhan: 'orphanage', orp: 'orphanage'
}

const isChildAdoptionCommand = action === 'kid' && ['adopt', 'adopsi'].includes(args[1]?.toLowerCase())
const clearChildTransferOffer = offer => {
  if (!offer?.sourceJid) return
  const source = getUserRPG(wdb, offer.sourceJid)
  const sourceUser = source?.rpg || source
  if (sourceUser?.pendingChildTransfer?.id === offer.id) {
    const child = sourceUser.kids?.find(entry => entry.pendingTransferId === offer.id)
    if (child) delete child.pendingTransferId
    delete sourceUser.pendingChildTransfer
  }
}
const respondToChildTransfer = async response => {
  const offer = user.pendingChildFosterOffer
  if (!offer) return m.reply(`Tidak ada tawaran pengasuhan anak yang menunggu.`)
  if (['no', 'tidak', 'batal', 'tolak', 'reject'].includes(response)) {
    clearChildTransferOffer(offer)
    delete user.pendingChildFosterOffer
    await saveDB(wdb)
    return m.reply(`❌ Tawaran ditolak. Anak tetap berada di daftar keluarga pemiliknya.`)
  }
  if (now - Number(offer.createdAt || 0) > 5 * 60 * 1000) {
    clearChildTransferOffer(offer)
    delete user.pendingChildFosterOffer
    await saveDB(wdb)
    return m.reply(`Tawaran pengasuhan sudah kedaluwarsa. Minta pemilik anak mengirim tawaran baru.`)
  }

  const source = getUserRPG(wdb, offer.sourceJid)
  const sourceUser = source?.rpg || source
  const childIndex = sourceUser?.kids?.findIndex(child =>
    child.pendingTransferId === offer.id &&
    child.nama === offer.childName &&
    child.ortu === offer.parentName &&
    !child.facility) ?? -1
  const amount = Number(offer.amount) || 0
  if (!sourceUser || source?.isDummy || childIndex < 0 || !Number.isSafeInteger(amount) || amount < 0) {
    clearChildTransferOffer(offer)
    delete user.pendingChildFosterOffer
    await saveDB(wdb)
    return m.reply(`Tawaran gagal karena data anak, nominal, atau permintaan pemilik sudah berubah.`)
  }
  if ((Number(sourceUser.bank) || 0) < amount) {
    clearChildTransferOffer(offer)
    delete user.pendingChildFosterOffer
    await saveDB(wdb)
    return m.reply(`Tawaran dibatalkan karena saldo bank pemilik tidak lagi cukup untuk membayar biaya pengasuhan.`)
  }

  const [child] = sourceUser.kids.splice(childIndex, 1)
  delete child.pendingTransferId
  if (!Array.isArray(child.biologicalParents) || !child.biologicalParents.length) {
    child.biologicalParents = [offer.sourceName, offer.parentName]
      .filter(parent => typeof parent === 'string' && parent.trim())
      .map(parent => parent.trim())
      .slice(0, 2)
  } else {
    child.biologicalParents = [...new Set(child.biologicalParents
      .filter(parent => typeof parent === 'string' && parent.trim())
      .map(parent => parent.trim()))].slice(0, 2)
  }
  child.originalOwnerJid ||= offer.sourceJid
  child.custody = { type: 'foster', guardianJid: m.sender }
  delete child.facility
  if (!Array.isArray(user.kids)) user.kids = []
  sourceUser.bank = (Number(sourceUser.bank) || 0) - amount
  user.bank = (Number(user.bank) || 0) + amount
  user.kids.push(child)
  delete sourceUser.pendingChildTransfer
  delete user.pendingChildFosterOffer
  await saveDB(wdb)
  return m.reply(
    `✅ Kamu menerima pengasuhan *${child.nama}*. Anak sekarang masuk ke daftar anakmu.\n` +
    `> ↳ Uang asuh diterima: Rp ${amount.toLocaleString('id-ID')}.\n` +
    `> ↳ Rawat: ${usedPrefix}rship kid <aktivitas> custody <no-anak>\n` +
    `> ↳ Kembalikan ke pemilik asal: ${usedPrefix}rship kid return <no-anak>`
  )
}

if (isChildAdoptionCommand && ['yes', 'ya', 'iya', 'terima', 'konfirmasi', 'no', 'tidak', 'batal', 'tolak', 'reject'].includes(args[2]?.toLowerCase()) &&
  user.pendingChildFosterOffer) {
  return respondToChildTransfer(args[2].toLowerCase())
}

if (isChildAdoptionCommand) {
  const option = args[2]?.toLowerCase()
  const pendingAdoption = user.pendingKidAdoption
  const targetJid = conn.decodeJid?.(m.mentionedJid?.[0] || '') || m.mentionedJid?.[0]

  if (targetJid) {
    const childNumber = Number(args[2])
    const child = Number.isInteger(childNumber) && childNumber > 0 ? user.kids[childNumber - 1] : null
    const targetData = getUserRPG(wdb, targetJid)
    const targetUser = targetData?.rpg || targetData
    const amountTokens = args.slice(3).filter(token => !token.startsWith('@'))
    const amountText = amountTokens.length === 1 ? amountTokens[0].replace(/[.,]/g, '') : '0'
    const amount = amountTokens.length ? Number(amountText) : 0
    if (!child || child.facility || child.pendingTransferId || targetJid === m.sender || !targetUser || targetData?.isDummy ||
      amountTokens.length > 1 || !Number.isSafeInteger(amount) || amount < 0) {
      return m.reply(
        `Format: ${usedPrefix}rship kid adopt <no-anak> @user <biaya>\n` +
        `> ↳ Biaya opsional, dipotong dari bank pengirim dan diterima saat tawaran disetujui.\n` +
        `> ↳ Contoh: ${usedPrefix}rship kid adopt 1 @user 1000000`
      )
    }
    if (user.pendingChildTransfer) {
      const oldOffer = user.pendingChildTransfer
      if (now - Number(oldOffer.createdAt || 0) <= 5 * 60 * 1000) {
        return m.reply(`Selesaikan tawaran pengasuhan sebelumnya sebelum mengirim tawaran baru.`)
      }
      const oldTargetData = getUserRPG(wdb, oldOffer.targetJid)
      const oldTarget = oldTargetData?.rpg || oldTargetData
      if (oldTarget?.pendingChildFosterOffer?.id === oldOffer.id) delete oldTarget.pendingChildFosterOffer
      const oldChild = user.kids.find(entry => entry.pendingTransferId === oldOffer.id)
      if (oldChild) delete oldChild.pendingTransferId
      delete user.pendingChildTransfer
    }
    if (child.pendingTransferId) {
      return m.reply(`Anak ini sudah memiliki tawaran pengasuhan yang sedang menunggu jawaban.`)
    }
    if (targetUser.pendingChildFosterOffer) {
      const previousOffer = targetUser.pendingChildFosterOffer
      if (now - Number(previousOffer.createdAt || 0) <= 5 * 60 * 1000) {
        return m.reply(`Pemain tersebut masih memiliki tawaran pengasuhan anak yang belum dijawab.`)
      }
      clearChildTransferOffer(previousOffer)
      delete targetUser.pendingChildFosterOffer
    }
    if ((Number(user.bank) || 0) < amount) {
      return m.reply(`Saldo bank tidak cukup untuk biaya asuh Rp ${amount.toLocaleString('id-ID')}.`)
    }

    const transferId = `${m.sender}-${now}-${Math.random().toString(36).slice(2, 10)}`
    child.pendingTransferId = transferId
    user.pendingChildTransfer = { id: transferId, targetJid, createdAt: now }
    targetUser.pendingChildFosterOffer = {
      id: transferId,
      sourceJid: m.sender,
      sourceName: wdb.users[m.sender]?.name || m.sender.split('@')[0],
      childName: child.nama,
      parentName: child.ortu,
      amount,
      createdAt: now
    }
    await saveDB(wdb)
    return m.reply(
      `📨 Tawaran pengasuhan *${child.nama}* dikirim ke @${targetJid.split('@')[0]}.\n` +
      `> ↳ Biaya asuh: Rp ${amount.toLocaleString('id-ID')} (dibayar saat diterima).\n` +
      `> ↳ Penerima: ${usedPrefix}rship kid adopt yes atau ${usedPrefix}rship kid adopt no.\n` +
      `> ↳ Anak tetap berada di daftar keluargamu sampai disetujui.`,
      null,
      { mentions: [targetJid] }
    )
  }

  const clearPendingAdoption = pending => {
    const sourceData = pending?.sourceJid && wdb.users[pending.sourceJid]
    const sourceUser = sourceData?.rpg || sourceData
    const child = sourceUser?.orphanageKids?.find(entry => entry.pendingAdoptionId === pending?.id)
    if (child) {
      delete child.pendingAdoptionId
      delete child.pendingAdoptionAt
    }
  }
  if (['no', 'tidak', 'batal', 'cancel'].includes(option)) {
    if (pendingAdoption) {
      clearPendingAdoption(pendingAdoption)
      delete user.pendingKidAdoption
      await saveDB(wdb)
      return m.reply(`❌ Adopsi dibatalkan. Anak tetap berada di panti asuhan.`)
    }
    return m.reply(`Tidak ada tawaran adopsi yang menunggu.`)
  }
  if (['yes', 'ya', 'iya', 'terima', 'konfirmasi'].includes(option)) {
    if (!pendingAdoption) return m.reply(`Tidak ada konfirmasi adopsi yang menunggu.`)
    if (now - Number(pendingAdoption.createdAt || 0) > 5 * 60 * 1000) {
      clearPendingAdoption(pendingAdoption)
      delete user.pendingKidAdoption
      await saveDB(wdb)
      return m.reply(`Konfirmasi adopsi kedaluwarsa. Lihat daftar lagi dengan ${usedPrefix}rship kid adopt list.`)
    }
    const sourceData = wdb.users[pendingAdoption.sourceJid]
    const sourceUser = sourceData?.rpg || sourceData
    const childIndex = sourceUser?.orphanageKids?.findIndex(child =>
      child.pendingAdoptionId === pendingAdoption.id &&
      child.nama === pendingAdoption.childName &&
      child.ortu === pendingAdoption.parentName &&
      child.custody?.type === 'orphaned') ?? -1
    if (!sourceUser || childIndex < 0) {
      clearPendingAdoption(pendingAdoption)
      delete user.pendingKidAdoption
      await saveDB(wdb)
      return m.reply(`Adopsi gagal karena data anak sudah berubah. Tampilkan ulang ${usedPrefix}rship kid adopt list.`)
    }
    const [child] = sourceUser.orphanageKids.splice(childIndex, 1)
    delete child.pendingAdoptionId
    delete child.pendingAdoptionAt
    delete child.facility
    normalizeBiologicalParents(child)
    child.originalOwnerJid ||= pendingAdoption.sourceJid
    child.custody = { type: 'foster', guardianJid: m.sender }
    if (!Array.isArray(user.kids)) user.kids = []
    user.kids.push(child)
    delete user.pendingKidAdoption
    await saveDB(wdb)
    return m.reply(`✅ *${child.nama}* berhasil diadopsi dan masuk ke daftar anakmu. Orang tua kandungnya tetap tercatat.`)
  }
  if (pendingAdoption) {
    return m.reply(`Selesaikan konfirmasi sebelumnya dengan ${usedPrefix}rship kid adopt yes atau ${usedPrefix}rship kid adopt no.`)
  }
  if (['list', 'daftar'].includes(option)) {
    const available = Object.entries(wdb.users).flatMap(([sourceJid, sourceData]) => {
      const sourceUser = sourceData?.rpg || sourceData
      return sourceData?.isDummy || !Array.isArray(sourceUser?.orphanageKids)
        ? []
        : sourceUser.orphanageKids
          .filter(child => child.custody?.type === 'orphaned' && !child.pendingAdoptionId)
          .map((child, sourceIndex) => ({ child, sourceJid, sourceIndex, sourceData }))
    })
    return m.reply(available.length
      ? `╭─❏「 🏡 DAFTAR ADOPSI 」❏\n│ ANAK DI PANTI ASUHAN\n╰─━━━━━━━━━━━━━━─\n\n` +
        `${available.map(({ child, sourceData }, index) =>
          `> *${index + 1}. ${child.nama}*\n> ↳ Orang tua asli: ${child.biologicalParents?.slice(0, 2).join(' & ') || child.ortu || 'Tidak diketahui'}\n> ↳ Dititipkan oleh: ${sourceData?.name || 'Pemain RPG'}`
        ).join('\n\n')}\n\n` +
        `> ↳ Pilih anak: ${usedPrefix}rship kid adopt <no>\n> ↳ Adopsi dari daftar ini tidak membutuhkan mention.`
      : `╭─❏「 🏡 DAFTAR ADOPSI 」❏\n│ Belum ada anak orphaned yang tersedia di panti asuhan.\n╰─━━━━━━━━━━━━━━─`)
  }
  if (/^\d+$/.test(option || '')) {
    const selectedIndex = Number(option) - 1
    const available = Object.entries(wdb.users).flatMap(([sourceJid, sourceData]) => {
      const sourceUser = sourceData?.rpg || sourceData
      return sourceData?.isDummy || !Array.isArray(sourceUser?.orphanageKids)
        ? []
        : sourceUser.orphanageKids
          .filter(child => child.custody?.type === 'orphaned' && !child.pendingAdoptionId)
          .map((child, sourceIndex) => ({ child, sourceJid, sourceIndex }))
    })
    const selected = available[selectedIndex]
    if (!selected) return m.reply(`Nomor anak tidak valid. Lihat daftar dengan ${usedPrefix}rship kid adopt list.`)
    const id = `${m.sender}-${now}-${Math.random().toString(36).slice(2, 10)}`
    user.pendingKidAdoption = {
      id,
      sourceJid: selected.sourceJid,
      childName: selected.child.nama,
      parentName: selected.child.ortu,
      createdAt: now
    }
    selected.child.pendingAdoptionId = id
    selected.child.pendingAdoptionAt = now
    await saveDB(wdb)
    return m.reply(
      `⚠️ Konfirmasi adopsi *${selected.child.nama}* dari panti?\n` +
      `> ↳ Orang tua kandung: ${selected.child.biologicalParents?.slice(0, 2).join(' & ') || selected.child.ortu || 'Tidak diketahui'}\n` +
      `> ↳ Terima: ${usedPrefix}rship kid adopt yes\n> ↳ Batal: ${usedPrefix}rship kid adopt no`
    )
  }
  return m.reply(
    `╭─❏「 🏡 PANDUAN ADOPSI 」❏\n` +
    `│ Anak sendiri: ${usedPrefix}rship kid adopt <no-anak> @user <biaya>\n` +
    `│ Terima/tolak tawaran: ${usedPrefix}rship kid adopt yes/no\n` +
    `│ Daftar anak panti: ${usedPrefix}rship kid adopt list\n` +
    `│ Adopsi anak panti: ${usedPrefix}rship kid adopt <no>\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

if (action === 'anak' && args[1]?.toLowerCase() === 'asuh') {
  const response = args[2]?.toLowerCase()
  if (user.pendingChildFosterOffer &&
    ['terima', 'accept', 'yes', 'iya', 'ya', 'tolak', 'reject', 'no', 'tidak', 'batal'].includes(response)) {
    return respondToChildTransfer(response)
  }
  const offer = user.pendingChildFosterOffer
  const clearSourceOffer = pendingOffer => {
    if (!pendingOffer?.sourceJid) return
    const source = getUserRPG(wdb, pendingOffer.sourceJid)
    const sourceUser = source?.rpg || source
    if (sourceUser?.pendingChildTransfer?.id === pendingOffer.id) {
      const child = sourceUser.kids?.find(entry => entry.pendingTransferId === pendingOffer.id)
      if (child) delete child.pendingTransferId
      delete sourceUser.pendingChildTransfer
    }
  }

  if (['terima', 'accept', 'yes', 'iya', 'ya', 'tolak', 'reject', 'no', 'tidak', 'batal'].includes(response)) {
    if (!offer) return m.reply(
      `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ⚠️ TIDAK ADA TAWARAN MENUNGGU
╰─━━━━━━━━━━━━━━─

> ↳ Tidak ada tawaran pengasuhan anak yang menunggu.
> ↳ Orang tua anak dapat mengirim tawaran dengan:
> ↳ ${usedPrefix}rship anak adopsi <no-anak> @user

─━━━━━━━━━━━━━━─`
    )
    if (['tolak', 'reject', 'no', 'tidak', 'batal'].includes(response)) {
      clearSourceOffer(offer)
      delete user.pendingChildFosterOffer
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ❌ TAWARAN DITOLAK
╰─━━━━━━━━━━━━━━─

> ↳ Anak tetap berada di daftar keluarga orang tua kandungnya.

─━━━━━━━━━━━━━━─`
      )
    }
    if (now - Number(offer.createdAt || 0) > 5 * 60 * 1000) {
      clearSourceOffer(offer)
      delete user.pendingChildFosterOffer
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 ⏰ PENGASUHAN ANAK 」❏
│ TAWARAN SUDAH KEDALUWARSA
╰─━━━━━━━━━━━━━━─

> ↳ Minta orang tua anak mengirim tawaran baru.

─━━━━━━━━━━━━━━─`
      )
    }

    const source = getUserRPG(wdb, offer.sourceJid)
    const sourceUser = source?.rpg || source
    const childIndex = sourceUser?.kids?.findIndex(child =>
      child.pendingTransferId === offer.id &&
      child.nama === offer.childName &&
      child.ortu === offer.parentName &&
      !child.facility) ?? -1
    if (!sourceUser || source?.isDummy || childIndex < 0) {
      clearSourceOffer(offer)
      delete user.pendingChildFosterOffer
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ⚠️ TAWARAN TIDAK DAPAT DIPROSES
╰─━━━━━━━━━━━━━━─

> ↳ Data anak atau permintaan dari orang tua sudah berubah.

─━━━━━━━━━━━━━━─`
      )
    }

    const [child] = sourceUser.kids.splice(childIndex, 1)
    delete child.pendingTransferId
    child.biologicalParents = [...new Set([
      ...(Array.isArray(child.biologicalParents) ? child.biologicalParents : []),
      offer.sourceName,
      offer.parentName
    ].filter(Boolean))]
    normalizeBiologicalParents(child)
    child.custody = { type: 'foster', guardianJid: m.sender }
    delete child.facility
    if (!Array.isArray(user.kids)) user.kids = []
    user.kids.push(child)
    delete sourceUser.pendingChildTransfer
    delete user.pendingChildFosterOffer
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ✅ TAWARAN PENGASUHAN DITERIMA
╰─━━━━━━━━━━━━━━─

👶 *DETAIL ANAK*
> ↳ Nama: *${child.nama}*
> ↳ Anak sekarang masuk daftar anakmu.

─━━━━━━━━━━━━━━─

📋 *PANDUAN*
> ↳ Rawat dengan: ${usedPrefix}rship kid <aktivitas> custody <no-anak>
> ↳ Orang tua kandung tercatat di: ${usedPrefix}rship kid info

─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(
    `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ 📋 RESPONS TAWARAN
╰─━━━━━━━━━━━━━━─

> ↳ Terima tawaran: ${usedPrefix}rship anak asuh terima
> ↳ Tolak tawaran: ${usedPrefix}rship anak asuh tolak

─━━━━━━━━━━━━━━─

📖 *KIRIM TAWARAN*
> ↳ Orang tua anak menggunakan:
> ↳ ${usedPrefix}rship anak adopsi <no-anak> @user

─━━━━━━━━━━━━━━─`
  )
}
if (action === 'urus') args = ['kid', 'urus', ...args.slice(1)]
const kidSubcommand = action === 'kid' || action === 'urus' ||
  (action === 'anak' && args[1] &&
    !['adopsi', 'asuh', 'jual', 'jualanak', 'buang', 'buanganak', 'bunuh', 'bunuhanak'].includes(args[1].toLowerCase()) &&
    !/^\d+$/.test(args[1]))


if (kidSubcommand) {
  const sub = args[1]?.toLowerCase()
  const confirmationWord = args[2]?.toLowerCase()
  const facilityType = facilityAliases[sub]

  if (!sub || ['guide', 'panduan'].includes(sub)) return m.reply(kidGuide())
  if (['command', 'commands', 'cmd'].includes(sub)) {
    const rows = [
      { header: '📚 Panduan', title: 'Panduan pengasuhan', description: 'Cara merawat dan membesarkan anak', id: `${usedPrefix}rship kid guide` },
      { header: '👶 Anak', title: 'Info anak', description: 'Lihat daftar dan status anak', id: `${usedPrefix}rship kid info` },
      { header: '⏰ Cooldown', title: 'Cooldown aktivitas anak', description: 'Cek kapan aktivitas anak siap lagi', id: `${usedPrefix}rship kid cd` },
      { header: '🧸 Rawat', title: 'Aktivitas pengasuhan', description: 'Buka pilihan aktivitas anak', id: `${usedPrefix}rship kid` }
    ]
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '👶 MENU PENGASUHAN',
      subtitle: 'Pilih yang ingin kamu lihat',
      text: 'Rawat keluarga dengan mudah lewat menu interaktif ini.',
      buttonText: '👶 PILIH MENU ANAK',
      sections: [{ title: 'Fitur anak', rows }],
      fallbackText: kidCommandGuide()
    })
  }
  if (sub === 'cd' || sub === 'cooldown') {
    const kids = user.kids.filter(child => !child.facility)
    const cooldowns = getKidCooldownSummary(kids)
    const status = !kids.length
      ? '> Belum ada anak yang bisa dicek. Adopsi atau daftarkan anak terlebih dahulu.'
      : cooldowns.length
        ? cooldowns.join('\n')
        : '> ✅ Tidak ada cooldown anak yang aktif.'
    return m.reply(
      `╭─❏「 ⏰ COOLDOWN AKTIVITAS ANAK 」❏\n` +
      `│ 👶 WAKTU ISTIRAHAT KELUARGA\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${status}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  if (['info', 'list'].includes(sub)) {
    if (user.kids.length === 0) {
      return m.reply(
        `╭─❏「 👶 ANAK KELUARGA 」❏
│ 📋 DAFTAR ANAK
╰─━━━━━━━━━━━━━━─

Belum ada anak yang terdaftar dalam keluargamu.

─━━━━━━━━━━━━━━─

📌 *PANDUAN*
> ↳ ${usedPrefix}rship kid guide

─━━━━━━━━━━━━━━─`
      )
    }

  

    const lines = user.kids.map((child, index) => {
      const careCount = getChildCareCount(child)
      const facility = child.facility ? ` • 🏠 ${CHILD_FACILITIES[child.facility.type]?.label || child.facility.type}` : ''
      const partner = user.harem.find(entry => entry.name === child.ortu)
      const biologicalParent = Array.isArray(child.biologicalParents)
        ? child.biologicalParents.find(parent => typeof parent === 'string' && parent.trim())
        : null
      const parentLine = partner
        ? `> ↳ Pasangan: ${partner.name}\n`
        : biologicalParent
          ? `> ↳ Orang tua asli: ${biologicalParent}\n`
          : ''
      return `*${index + 1}. ${getGenderEmoji(child.jenis === 'Laki-laki' ? 'cowok' : 'cewek')} ${child.nama}* (${getChildStage(careCount).name}${facility})\n` +
        parentLine +
        `> ↳ Asuhan: ${getChildProgress(careCount)}`
    })
    return m.reply(
      `╭─❏「 👶 ANAK KELUARGA 」❏
│ 📋 DAFTAR ANAK TERDAFTAR
╰─━━━━━━━━━━━━━━─

${lines.join('\n\n')}

─━━━━━━━━━━━━━━─

📖 *PANDUAN*
> ↳ ${usedPrefix}rship kid guide

─━━━━━━━━━━━━━━─`
    )
  }


if (action === 'anak' && args[1]?.toLowerCase() === 'asuh') {
  const response = args[2]?.toLowerCase()
  const offer = user.pendingChildFosterOffer
  const clearSourceOffer = pendingOffer => {
    if (!pendingOffer?.sourceJid) return
    const source = getUserRPG(wdb, pendingOffer.sourceJid)
    const sourceUser = source?.rpg || source
    if (sourceUser?.pendingChildTransfer?.id === pendingOffer.id) {
      const sourceList = pendingOffer.sourceList === 'shelterKids' ? sourceUser.shelterKids : sourceUser.kids
      const child = sourceList?.find(entry => entry.pendingTransferId === pendingOffer.id)
      if (child) delete child.pendingTransferId
      delete sourceUser.pendingChildTransfer
    }
  }

  if (['terima', 'accept', 'yes', 'iya', 'ya', 'tolak', 'reject', 'no', 'tidak', 'batal'].includes(response)) {
    if (!offer) return m.reply(
      `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ⚠️ TIDAK ADA TAWARAN MENUNGGU
╰─━━━━━━━━━━━━━━─

> ↳ Tidak ada tawaran pengasuhan anak yang menunggu.
> ↳ Orang tua anak dapat mengirim tawaran dengan:
> ↳ ${usedPrefix}rship anak adopsi <no-anak> @user

─━━━━━━━━━━━━━━─`
    )
    if (['tolak', 'reject', 'no', 'tidak', 'batal'].includes(response)) {
      clearSourceOffer(offer)
      delete user.pendingChildFosterOffer
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ❌ TAWARAN DITOLAK
╰─━━━━━━━━━━━━━━─

> ↳ Anak tetap berada di daftar keluarga orang tua kandungnya.

─━━━━━━━━━━━━━━─`
      )
    }
    if (now - Number(offer.createdAt || 0) > 5 * 60 * 1000) {
      clearSourceOffer(offer)
      delete user.pendingChildFosterOffer
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 ⏰ PENGASUHAN ANAK 」❏
│ TAWARAN SUDAH KEDALUWARSA
╰─━━━━━━━━━━━━━━─

> ↳ Minta orang tua anak mengirim tawaran baru.

─━━━━━━━━━━━━━━─`
      )
    }

    const source = getUserRPG(wdb, offer.sourceJid)
    const sourceUser = source?.rpg || source
    const sourceList = offer.sourceList === 'shelterKids' ? sourceUser?.shelterKids : sourceUser?.kids
    const childIndex = sourceList?.findIndex(child =>
      child.pendingTransferId === offer.id &&
      child.nama === offer.childName &&
      child.ortu === offer.parentName &&
      !child.facility) ?? -1
    if (!sourceUser || source?.isDummy || childIndex < 0) {
      clearSourceOffer(offer)
      delete user.pendingChildFosterOffer
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ⚠️ TAWARAN TIDAK DAPAT DIPROSES
╰─━━━━━━━━━━━━━━─

> ↳ Data anak atau permintaan dari orang tua sudah berubah.

─━━━━━━━━━━━━━━─`
      )
    }

    const amount = Number(offer.amount) || 0
    if (!Number.isSafeInteger(amount) || amount < 0 || (Number(sourceUser.bank) || 0) < amount) {
      clearSourceOffer(offer)
      delete user.pendingChildFosterOffer
      await saveDB(wdb)
      return m.reply(`Tawaran pengasuhan dibatalkan karena saldo atau biaya asuh pemilik tidak valid.`)
    }

    const [child] = sourceList.splice(childIndex, 1)
    delete child.pendingTransferId
    if (offer.sourceList === 'shelterKids') {
      child.originalShelterStatus = child.shelterStatus
      child.originalOwnerLocation = 'shelterKids'
      delete child.shelterStatus
    } else {
      child.biologicalParents = [...new Set([
        ...(Array.isArray(child.biologicalParents) ? child.biologicalParents : []),
        offer.sourceName,
        offer.parentName
      ].filter(Boolean))]
      normalizeBiologicalParents(child)
    }
    child.originalOwnerJid ||= offer.sourceJid
    child.custody = { type: 'foster', guardianJid: m.sender }
    delete child.facility
    if (!Array.isArray(user.kids)) user.kids = []
    sourceUser.bank = (Number(sourceUser.bank) || 0) - amount
    user.bank = (Number(user.bank) || 0) + amount
    user.kids.push(child)
    delete sourceUser.pendingChildTransfer
    delete user.pendingChildFosterOffer
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ✅ TAWARAN PENGASUHAN DITERIMA
╰─━━━━━━━━━━━━━━─

👶 *DETAIL ANAK*
> ↳ Nama: *${child.nama}*
> ↳ Anak sekarang masuk daftar anakmu.
> ↳ Biaya asuh diterima: Rp ${amount.toLocaleString('id-ID')}.

─━━━━━━━━━━━━━━─

📋 *PANDUAN*
> ↳ Rawat dengan: ${usedPrefix}rship kid <aktivitas> custody <no-anak>
> ↳ Orang tua kandung tercatat di: ${usedPrefix}rship kid info

─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(
    `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ 📋 RESPONS TAWARAN
╰─━━━━━━━━━━━━━━─

> ↳ Terima tawaran: ${usedPrefix}rship anak asuh terima
> ↳ Tolak tawaran: ${usedPrefix}rship anak asuh tolak

─━━━━━━━━━━━━━━─

📖 *KIRIM TAWARAN*
> ↳ Orang tua anak menggunakan:
> ↳ ${usedPrefix}rship anak adopsi <no-anak> @user

─━━━━━━━━━━━━━━─`
  )
}
if (action === 'urus') args = ['kid', 'urus', ...args.slice(1)]
const kidSubcommand = action === 'kid' || action === 'urus' ||
  (action === 'anak' && args[1] &&
    !['adopsi', 'asuh', 'jual', 'jualanak', 'buang', 'buanganak', 'bunuh', 'bunuhanak'].includes(args[1].toLowerCase()) &&
    !/^\d+$/.test(args[1]))

  if (facilityType) {
    const facility = CHILD_FACILITIES[facilityType]
    const verb = facilityType === 'daycare' ? 'daycare' : 'orphanage'
    const facilityKids = facilityType === 'orphanage' ? user.orphanageKids : user.kids.filter(child => child.facility?.type === facilityType)

    if (['guide', 'command', 'info'].includes(confirmationWord)) {
      if (confirmationWord === 'command') return m.reply(kidCommandGuide())

      if (confirmationWord === 'guide') {
        return m.reply(
          `╭─❏「 📖 PANDUAN ${facility.label.toUpperCase()} 」❏\n` +
          `│ 👶 SISTEM PENITIPAN ANAK\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `Fasilitas ini memungkinkanmu menitipkan anak dengan biaya perawatan berkala.\n\n` +
          `─━━━━━━━━━━━━━━─\n` +
          `📌 *PERINTAH UTAMA*\n` +
          `> 🔎 ${usedPrefix}rship kid info\n` +
          `> ↳ Melihat daftar anak dan nomor pasangan.\n` +
          `> 🏠 ${usedPrefix}rship kid ${verb} <pasangan> <anak>\n` +
          `> ↳ Memulai proses penitipan anak.\n` +
          `> ✅ ${usedPrefix}rship kid ${verb} yes\n` +
          `> ↳ Mengonfirmasi penitipan anak.\n` +
          `> ❌ ${usedPrefix}rship kid ${verb} no\n` +
          `> ↳ Membatalkan pemindahan anak.\n` +
          `> 📋 ${usedPrefix}rship kid ${verb} list\n` +
          `> ↳ Melihat anak yang berada di fasilitas.\n` +
          `> 💳 ${usedPrefix}rship kid ${verb} bayar <pasangan> <anak> <hari>\n` +
          `> ↳ Membayar biaya penitipan di muka.\n\n` +
          `─━━━━━━━━━━━━━━─\n` +
          `💰 *BIAYA PENITIPAN*\n` +
          `> ↳ Tarif: Rp ${facility.fee.toLocaleString('id-ID')} per anak setiap 24 jam.\n` +
          `> ↳ Jika saldo bank tidak mencukupi, anak kembali setelah 3 hari.\n\n` +
          `─━━━━━━━━━━━━━━─\n` +
          `📖 *PANDUAN LENGKAP*\n` +
          `> ↳ ${usedPrefix}rship kid ${verb} info\n` +
          `> ↳ ${usedPrefix}rship kid ${verb} command`
        )
      }

      const lines = facilityKids.length
        ? facilityKids.map((child, index) => {
          const parentIndex = user.harem.findIndex(partner => partner.name === child.ortu)
          const childSource = facilityType === 'daycare' ? user.kids : facilityKids
          const partnerChildIndex = childSource.filter(entry => entry.ortu === child.ortu).indexOf(child) + 1
          const originalParents = Array.isArray(child.biologicalParents) && child.biologicalParents.length
            ? `\n> ↳ Orang tua kandung: ${child.biologicalParents.join(' & ')}`
            : ''
          return `*${index + 1}. 👶 ${child.nama}*\n` +
            `> ↳ ${parentIndex >= 0 ? `Pasangan ${parentIndex + 1}` : 'Orang tua'}: ${child.ortu} • Anak ke-${partnerChildIndex}${originalParents}\n` +
            `> ↳ Biaya: Rp ${facility.fee.toLocaleString('id-ID')} setiap 24 jam\n` +
            `> ↳ Tagihan berikutnya: ${new Date(Number(child.facility?.paidUntil) || now).toLocaleString('id-ID')}`
        }).join('\n\n')
        : 'Belum ada anak yang terdaftar di fasilitas ini.'

      return m.reply(
        `╭─❏「 ${facility.label.toUpperCase()} 」❏\n` +
        `│ 👶 INFORMASI FASILITAS\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `💰 *BIAYA PENITIPAN*\n` +
        `> ↳ Tarif: Rp ${facility.fee.toLocaleString('id-ID')} per anak setiap 24 jam.\n` +
        `> ↳ Jika saldo bank tidak mencukupi, anak kembali setelah 3 hari.\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `📋 *DAFTAR ANAK*\n` +
        `${lines}\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `📌 *PERINTAH*\n` +
        `> 🏠 Masukkan anak:\n` +
        `> ↳ ${usedPrefix}rship kid ${verb} <pasangan> <anak>\n` +
        `> 💳 Bayar di muka:\n` +
        `> ↳ ${usedPrefix}rship kid ${verb} bayar <pasangan> <anak> <hari>`
      )
    }

    if (['list', 'daftar'].includes(confirmationWord)) {
      return m.reply(facilityKids.length
        ? `╭─❏「 ${facility.label.toUpperCase()} 」❏\n` +
          `│ 📋 DAFTAR ANAK DI FASILITAS\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `${facilityKids.map(child => {
            const partnerIndex = user.harem.findIndex(partner => partner.name === child.ortu)
            const childSource = facilityType === 'daycare' ? user.kids : facilityKids
            const childIndex = childSource.filter(entry => entry.ortu === child.ortu).indexOf(child) + 1
            const originalParents = Array.isArray(child.biologicalParents) && child.biologicalParents.length
              ? `\n> ↳ Orang tua kandung: ${child.biologicalParents.join(' & ')}`
              : ''
            return `> 👶 *${child.nama}*\n` +
              `> ↳ ${partnerIndex >= 0 ? `Pasangan ${partnerIndex + 1}` : 'Orang tua'}, anak ke-${childIndex}: ${child.ortu}${originalParents}`
          }).join('\n\n')}\n\n` +
          `─━━━━━━━━━━━━━━─`
        : `╭─❏「 ${facility.label.toUpperCase()} 」❏\n` +
          `│ 📋 DAFTAR ANAK\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `Belum ada anak yang terdaftar di ${facility.label.toLowerCase()}.`
      )
    }

    if (['bayar', 'pay'].includes(confirmationWord)) {
      if (args[3]?.toLowerCase() === 'all' || args[4]?.toLowerCase() === 'all') {
        return m.reply(
          `╭─❏「 ⚠️ PEMBAYARAN FASILITAS 」❏\n` +
          `│ 📌 TARGET PEMBAYARAN\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `Pembayaran dilakukan untuk satu anak dalam satu transaksi.\n\n` +
          `> ↳ Pilih nomor pasangan dan nomor anak.\n` +
          `> ↳ Penggunaan *all* tidak didukung.`
        )
      }

      const targets = getFacilityTargets(facilityType, args[3], args[4])
      const days = Number(args[5] || 1)

      if (!targets?.length || !Number.isInteger(days) || days < 1 || days > 365) {
        return m.reply(
          `╭─❏「 💳 PEMBAYARAN FASILITAS 」❏\n` +
          `│ 📌 FORMAT PERINTAH\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ ${usedPrefix}rship kid ${verb} bayar <pasangan> <anak> <hari>\n\n` +
          `📖 *KETERANGAN*\n` +
          `> ↳ Durasi pembayaran: 1–365 hari.`
        )
      }

      const target = targets.find(entry => entry.child.facility?.type === facilityType)

      if (!target) {
        return m.reply(
          `╭─❏「 ❌ ANAK TIDAK DITEMUKAN 」❏\n` +
          `│ Anak tersebut tidak terdaftar di ${facility.label.toLowerCase()}.\n` +
          `╰─━━━━━━━━━━━━━━─`
        )
      }

      const total = facility.fee * days

      if (user.bank < total) {
        return m.reply(
          `╭─❏「 ❌ SALDO TIDAK MENCUKUPI 」❏\n` +
          `│ 💳 PEMBAYARAN FASILITAS\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> 👶 Anak: ${target.child.nama}\n` +
          `> ⏳ Durasi: ${days} hari\n` +
          `> 💰 Total biaya: Rp ${total.toLocaleString('id-ID')}\n\n` +
          `─━━━━━━━━━━━━━━─\n` +
          `Silakan periksa saldo bank sebelum melakukan pembayaran.`
        )
      }

      const paidUntil = Math.max(now, Number(target.child.facility.paidUntil) || now)
      user.bank -= total
      target.child.facility.paidUntil = paidUntil + facility.feePeriod * days
      delete target.child.facility.unpaidSince
      await saveDB(wdb)

      return m.reply(
        `╭─❏「 ✅ PEMBAYARAN BERHASIL 」❏\n` +
        `│ 💳 BIAYA FASILITAS TERBAYAR\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> 👶 Anak: ${target.child.nama}\n` +
        `> 🏠 Fasilitas: ${facility.label}\n` +
        `> ⏳ Durasi: ${days} hari\n` +
        `> 💰 Total pembayaran: Rp ${total.toLocaleString('id-ID')}\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `✨ Biaya penitipan berhasil dibayar.`
      )
    }

    if (['yes', 'ya', 'iya', 'konfirmasi', 'no', 'tidak', 'batal', 'cancel'].includes(confirmationWord)) {
      const pending = user.pendingKidFacility
      const approve = ['yes', 'ya', 'iya', 'konfirmasi'].includes(confirmationWord)

      if (!pending || pending.type !== facilityType) {
        return m.reply(
          `╭─❏「 ⚠️ KONFIRMASI FASILITAS 」❏\n` +
          `│ Tidak ada konfirmasi fasilitas yang sesuai.\n` +
          `╰─━━━━━━━━━━━━━━─`
        )
      }

      if (!approve) {
        delete user.pendingKidFacility
        await saveDB(wdb)

        return m.reply(
          `╭─❏「 ❌ PEMINDAHAN DIBATALKAN 」❏\n` +
          `│ 👶 Proses pemindahan anak dibatalkan.\n` +
          `╰─━━━━━━━━━━━━━━─`
        )
      }

      if (now - Number(pending.createdAt || 0) > 5 * 60 * 1000) {
        delete user.pendingKidFacility
        await saveDB(wdb)

        return m.reply(
          `╭─❏「 ⏳ KONFIRMASI KEDALUWARSA 」❏\n` +
          `│ Batas waktu konfirmasi pemindahan telah berakhir.\n` +
          `╰─━━━━━━━━━━━━━━─`
        )
      }

      const child = user.kids[pending.globalIndex]

      if (!child || child.nama !== pending.name || child.ortu !== pending.parent || child.facility) {
        delete user.pendingKidFacility
        await saveDB(wdb)

        return m.reply(
          `╭─❏「 ❌ DATA ANAK BERUBAH 」❏\n` +
          `│ Pemindahan dibatalkan karena data anak tidak lagi sesuai.\n` +
          `╰─━━━━━━━━━━━━━━─`
        )
      }

      child.facility = { type: facilityType, paidUntil: now + facility.feePeriod }

      if (facilityType === 'orphanage') {
        user.kids.splice(pending.globalIndex, 1)
        user.orphanageKids.push(child)
      }

      delete user.pendingKidFacility
      await saveDB(wdb)

      return m.reply(
        `╭─❏「 ✅ PEMINDAHAN BERHASIL 」❏\n` +
        `│ 👶 ${child.nama}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> 🏠 Fasilitas: ${facility.label}\n` +
        `> 💰 Biaya: Rp ${facility.fee.toLocaleString('id-ID')} setiap 24 jam\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `✨ Anak berhasil dimasukkan ke fasilitas.`
      )
    }

    if (!confirmationWord) {
      return m.reply(
        `╭─❏「 🏠 ${facility.label.toUpperCase()} 」❏\n` +
        `│ 👶 SISTEM PENITIPAN ANAK\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Fasilitas ini digunakan untuk mengelola penitipan anak.\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `📖 *PANDUAN*\n` +
        `> ↳ ${usedPrefix}rship kid ${verb} guide\n` +
        `> 📋 *DAFTAR COMMAND*\n` +
        `> ↳ ${usedPrefix}rship kid ${verb} command`
      )
    }

    if (args[2]?.toLowerCase() === 'all' || args[3]?.toLowerCase() === 'all') {
      return m.reply(
        `╭─❏「 ⚠️ PEMINDAHAN ANAK 」❏\n` +
        `│ 📌 TARGET PEMINDAHAN\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Pilih satu pasangan dan satu anak untuk fasilitas.\n\n` +
        `> ↳ Gunakan nomor tertentu, bukan *all*.`
      )
    }

    const targets = args[3] === undefined
      ? getFacilityTargets(facilityType, args[2], args[3])
      : getKidTargets(args[2], args[3], user.kids)

    const target = targets?.find(entry => !entry.child.facility)

    if (!target || !user.kids.includes(target.child)) {
      return m.reply(
        `╭─❏「 ❌ ANAK TIDAK DITEMUKAN 」❏\n` +
        `│ Anak tidak ditemukan atau sudah berada di fasilitas.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 *PERIKSA DAFTAR ANAK*\n` +
        `> ↳ ${usedPrefix}rship kid info`
      )
    }

    user.pendingKidFacility = {
      type: facilityType,
      globalIndex: target.globalIndex,
      name: target.child.nama,
      parent: target.child.ortu,
      createdAt: now
    }

    await saveDB(wdb)

    return m.reply(
      `╭─❏「 ⚠️ KONFIRMASI PENITIPAN 」❏\n` +
      `│ 👶 ${target.child.nama}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> 🏠 Fasilitas: ${facility.label}\n` +
      `> 💰 Biaya: Rp ${facility.fee.toLocaleString('id-ID')} setiap 24 jam\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `📌 *KONFIRMASI PEMINDAHAN*\n` +
      `> ✅ ${usedPrefix}rship kid ${verb} yes\n` +
      `> ↳ Konfirmasi penitipan anak.\n` +
      `> ❌ ${usedPrefix}rship kid ${verb} no\n` +
      `> ↳ Batalkan pemindahan anak.`
    )
  }


  if (['return', 'kembalikan'].includes(sub)) {
    const target = getKidTargets('custody', args[2])?.[0]
    const child = target?.child
    const ownerJid = child?.originalOwnerJid
    if (!child || !ownerJid || child.facility) {
      return m.reply(
        `Anak asuh tersebut tidak memiliki data pemilik asal untuk dikembalikan.\n` +
        `> ↳ Format: ${usedPrefix}rship kid return <no-anak>`
      )
    }
    const ownerData = getUserRPG(wdb, ownerJid)
    const owner = ownerData?.rpg || ownerData
    if (!owner || ownerData?.isDummy || ownerJid === m.sender) {
      return m.reply(`Pemilik asal tidak tersedia atau anak sudah berada di akun pemilik asal.`)
    }
    const childIndex = user.kids.indexOf(child)
    if (childIndex < 0) return m.reply(`Anak tidak ditemukan di daftar keluargamu.`)

    user.kids.splice(childIndex, 1)
    const returningToShelter = child.originalOwnerLocation === 'shelterKids'
    if (child.originalCustody) {
      child.custody = child.originalCustody
      delete child.originalCustody
    } else {
      delete child.custody
    }
    delete child.originalOwnerJid
    delete child.pendingTransferId
    if (returningToShelter) {
      if (!Array.isArray(owner.shelterKids)) owner.shelterKids = []
      child.shelterStatus = child.originalShelterStatus || { reason: 'lost', enteredAt: now }
      delete child.originalShelterStatus
      delete child.originalOwnerLocation
      owner.shelterKids.push(child)
    } else {
      if (!Array.isArray(owner.kids)) owner.kids = []
      delete child.originalOwnerLocation
      delete child.originalShelterStatus
      owner.kids.push(child)
    }
    await saveDB(wdb)
    return m.reply(
      `✅ *${child.nama}* sudah dikembalikan ke ${returningToShelter ? 'shelter asal' : 'pemilik asalnya'}.\n` +
      `${returningToShelter ? '' : '> ↳ Nama orang tua kandung tidak berubah.\n'}` +
      `> ↳ Biaya asuh yang sudah dibayarkan tidak dikembalikan.`
    )
  }

  if (sub === 'rename') {
    const targets = getKidTargets(args[2], args[3])
    const target = targets?.[0]
    const newName = args.slice(4).join(' ').trim()
    if (!target || target.child.facility) return m.reply(
      `╭─❏「 ❌ ANAK TIDAK DITEMUKAN 」❏\n` +
      `│ Anak tidak ditemukan atau sedang berada di fasilitas.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *DAFTAR ANAK*\n` +
      `> ↳ ${usedPrefix}rship kid info`
    )
    if (!newName || newName.length > 30) return m.reply(
      `╭─❏「 ✏️ GANTI NAMA ANAK 」❏\n` +
      `│ 📌 FORMAT PERINTAH\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Nama anak harus terdiri dari 1–30 karakter.\n\n` +
      `> ↳ ${usedPrefix}rship kid rename <pasangan> <anak> <nama baru>`
    )
    target.child.originalName ||= target.child.nama
    target.child.nama = newName
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 ✅ NAMA ANAK DIPERBARUI 」❏\n` +
      `│ ✏️ PERUBAHAN NAMA BERHASIL\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> 👶 Nama baru: *${newName}*\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `✨ Nama anak berhasil diperbarui.`
    )
  }

  if (sub === 'moveout') {
    const pending = user.pendingKidMoveout
    if (['yes', 'ya', 'iya', 'konfirmasi'].includes(confirmationWord)) {
      const child = pending && user.kids[pending.globalIndex]
      if (!pending || now - Number(pending.createdAt || 0) > 5 * 60 * 1000 ||
        !child || child.nama !== pending.name || child.ortu !== pending.parent ||
        getChildCareCount(child) < CHILD_STAGES[CHILD_STAGES.length - 1].care) {
        delete user.pendingKidMoveout
        await saveDB(wdb)
        return m.reply(
          `╭─❏「 ❌ PEMINDAHAN DIBATALKAN 」❏\n` +
          `│ Data anak berubah, anak belum dewasa, atau konfirmasi telah kedaluwarsa.\n` +
          `╰─━━━━━━━━━━━━━━─`
        )
      }
      user.kids.splice(pending.globalIndex, 1)
      delete user.pendingKidMoveout
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 🏡 ANAK PINDAH RUMAH 」❏\n` +
        `│ 👶 *${child.nama}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ✅ Status: Telah dewasa\n` +
        `> 🏡 Keadaan: Resmi pindah rumah\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `✨ Kamu tidak perlu mengurusnya lagi.`
      )
    }
    if (['no', 'tidak', 'batal', 'cancel'].includes(confirmationWord)) {
      delete user.pendingKidMoveout
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 ❌ PINDAH RUMAH DIBATALKAN 」❏\n` +
        `│ Konfirmasi pindah rumah berhasil dibatalkan.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }
    const target = getKidTargets(args[2], args[3])?.[0]
    if (!target || target.child.facility) return m.reply(
      `╭─❏「 ❌ ANAK TIDAK DITEMUKAN 」❏\n` +
      `│ Anak tidak ditemukan atau sedang berada di fasilitas.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *DAFTAR ANAK*\n` +
      `> ↳ ${usedPrefix}rship kid info`
    )
    if (getChildCareCount(target.child) < CHILD_STAGES[CHILD_STAGES.length - 1].care) return m.reply(
      `╭─❏「 ⚠️ ANAK BELUM DEWASA 」❏\n` +
      `│ Anak harus sudah dewasa sebelum dapat pindah rumah.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
    user.pendingKidMoveout = {
      globalIndex: target.globalIndex,
      name: target.child.nama,
      parent: target.child.ortu,
      createdAt: now
    }
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 ⚠️ KONFIRMASI PINDAH RUMAH 」❏\n` +
      `│ 👶 *${target.child.nama}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Anak telah dewasa dan siap meninggalkan daftar anak keluarga.\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `📌 *KONFIRMASI PEMINDAHAN*\n` +
      `> ✅ ${usedPrefix}rship kid moveout yes\n` +
      `> ↳ Konfirmasi pindah rumah.\n` +
      `> ❌ ${usedPrefix}rship kid moveout no\n` +
      `> ↳ Batalkan pemindahan anak.`
    )
  }


  const isBatchCare = sub === 'urus'
  const activity = CHILD_ACTIVITIES[sub]
  if (!activity && !isBatchCare) return m.reply(kidGuide())
  if (isBatchCare && !isPremiumUser(m.sender, wdb)) return m.reply(
    `╭─❏「 🔒 AKSES PREMIUM 」❏
│ 👶 PENGASUHAN ANAK
╰─━━━━━━━━━━━━━━─

Fitur pengasuhan seluruh aktivitas khusus pengguna premium.

─━━━━━━━━━━━━━━─

📌 *PANDUAN*
> ↳ Fitur: ${usedPrefix}rship urus

─━━━━━━━━━━━━━━─`
  )
  if ((args[2]?.toLowerCase() === 'all' || args[3]?.toLowerCase() === 'all') && !isPremiumUser(m.sender, wdb)) {
    return m.reply(
      `╭─❏「 🔒 AKSES PREMIUM 」❏
│ 📋 PEMILIHAN ANAK
╰─━━━━━━━━━━━━━━─

Pemilihan *all* untuk anak hanya tersedia bagi pengguna premium.

─━━━━━━━━━━━━━━─`
    )
  }
  const targets = getKidTargets(args[2], args[3])
  if (!targets?.length) {
    return m.reply(
      `╭─❏「 📖 PENGASUHAN ANAK 」❏
│ 📌 FORMAT PERINTAH
╰─━━━━━━━━━━━━━━─

> ↳ ${usedPrefix}rship kid <aktivitas> <pasangan/all> <anak/all>

📖 *CONTOH*
> ↳ ${usedPrefix}rship kid main 1 1

─━━━━━━━━━━━━━━─`
    )
  }
  const actions = isBatchCare ? Object.entries(CHILD_ACTIVITIES) : [[sub, activity]]
  const eligible = targets.filter(({ child }) =>
    !child.facility &&
    getChildCareCount(child) < CHILD_STAGES[CHILD_STAGES.length - 1].care &&
    (!Number(child.lastKidActivityAt) || now - Number(child.lastKidActivityAt) >= CHILD_NEGLECT.careCooldown) &&
    actions.every(([name]) => !(Number(child.activityCooldowns?.[name]) > 0 && now - Number(child.activityCooldowns[name]) < CHILD_ACTIVITIES[name].cooldown))
  )
  if (!eligible.length) return sendRpgQuickButton(conn, m, {
    title: '⏰ CEK WAKTU AKTIVITAS ANAK',
    buttonText: '🕰️ Lihat Cooldown Anak',
    command: `${usedPrefix}rship kid cd`,
    noThumbnail: true,
    text: `╭─❏「 ⚠️ ANAK TIDAK TERSEDIA 」❏
│ 👶 STATUS PENGASUHAN
╰─━━━━━━━━━━━━━━─

Tidak ada anak yang dapat melakukan aktivitas saat ini.

─━━━━━━━━━━━━━━─

📌 *KETERANGAN*
> ↳ Anak mungkin sudah dewasa, sedang berada di daycare, atau aktivitasnya masih cooldown.
> ↳ Cek kapan aktivitas siap lagi lewat tombol di bawah.

─━━━━━━━━━━━━━━─`
  })
  if (eligible.length !== targets.length) {
    const unavailable = targets.length - eligible.length
    if (!isBatchCare && args[3]?.toLowerCase() !== 'all') return sendRpgQuickButton(conn, m, {
      title: '⏰ AKTIVITAS ANAK MASIH ISTIRAHAT',
      buttonText: '🕰️ Cek Cooldown Anak',
      command: `${usedPrefix}rship kid cd`,
      noThumbnail: true,
      text: `╭─❏「 ⚠️ AKTIVITAS BELUM TERSEDIA 」❏
│ 👶 STATUS AKTIVITAS
╰─━━━━━━━━━━━━━━─

Anak sedang tidak tersedia atau aktivitasnya masih cooldown.
> ↳ Cek waktu tersisa sebelum mencoba lagi.

─━━━━━━━━━━━━━━─`
    })
  }

  let totalCost = 0
  for (const [, rule] of actions) {
    for (const target of eligible) totalCost += rule.cost || 0
  }
  if (user.bank < totalCost) return m.reply(
    `╭─❏「 ❌ SALDO TIDAK MENCUKUPI 」❏
│ 💳 BIAYA PENGASUHAN
╰─━━━━━━━━━━━━━━─

> 💰 Total biaya: Rp ${totalCost.toLocaleString('id-ID')}

─━━━━━━━━━━━━━━─

Silakan periksa saldo bank sebelum melakukan aktivitas.

─━━━━━━━━━━━━━━─`
  )

  const completed = []
  const levelUps = new Map()
  user.bank -= totalCost
  for (const target of eligible) {
    const { child, partner } = target
    for (const [name, rule] of actions) {
      child.activityCooldowns[name] = now
      child.love = Math.min(100, (Number(child.love) || 0) + rule.love)
      if (target.partnerIndex >= 0) {
        const previousUps = levelUps.get(partner.name) || 0
        const newUps = addExp(partner, rule.exp)
        if (newUps) levelUps.set(partner.name, previousUps + newUps)
      }
    }
    child.careCount = getChildCareCount(child) + 1
    child.umur = child.careCount / 10
    child.lastKidActivityAt = now
    child.lastCaredAt = now
    child.lastNeglectCheckAt = now
    user.dateStats.urusAnak = (Number(user.dateStats.urusAnak) || 0) + 1
    completed.push(child.nama)
  }
  await saveDB(wdb)
  const totalUps = [...levelUps.values()].reduce((sum, value) => sum + value, 0)
  const costLine = totalCost ? `\n> ↳ Biaya: -Rp ${totalCost.toLocaleString('id-ID')}` : ''
  const levelLine = totalUps ? `\n> ↳ Level pasangan naik ${totalUps} kali` : ''
  const childSummary = completed.map(name => `> ↳ 👶 ${name}`).join('\n')
  const activitySummary = actions.map(([, rule]) => `> ↳ ${rule.emoji} ${rule.label}`).join('\n')
  return m.reply(
    `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ${isBatchCare ? '✨ SEMUA AKTIVITAS PENGASUHAN' : `💗 ${activity.label.toUpperCase()}`}
╰─━━━━━━━━━━━━━━─

> ↳ ${isBatchCare ? '✅ Semua 9 aktivitas pengasuhan selesai.' : `✅ Aktivitas ${activity.label} selesai.`}

👶 *ANAK*
${childSummary}

🧸 *AKTIVITAS*
${activitySummary}${costLine}${levelLine}

─━━━━━━━━━━━━━━─

⏳ *WAKTU COOLDOWN*
> ↳ ${isBatchCare ? `Cooldown pengasuhan anak: ${formatRemaining(CHILD_NEGLECT.careCooldown / 1000)}.` : `Cooldown pengasuhan: ${formatRemaining(CHILD_NEGLECT.careCooldown / 1000)}.`}

─━━━━━━━━━━━━━━─`
  )
}

if (action === 'urusanak') {
  return m.reply(
    `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ 📌 PERINTAH BARU
╰─━━━━━━━━━━━━━━─

Gunakan command pengasuhan yang baru:

> ↳ ${usedPrefix}rship urus <pasangan/all> <anak/all>

─━━━━━━━━━━━━━━─

📖 *PANDUAN*
> ↳ ${usedPrefix}rship kid guide

─━━━━━━━━━━━━━━─`
  )
}

if (
  ['jualanak', 'buanganak', 'bunuhanak'].includes(action) ||
  (action === 'anak' && ['jual', 'jualanak', 'buang', 'buanganak', 'bunuh', 'bunuhanak'].includes(args[1]?.toLowerCase()))
) {
  return m.reply(
    `╭─❏「 ⚠️ SISTEM PENGASUHAN 」❏
│ 👶 PENGALIHAN PENGASUHAN
╰─━━━━━━━━━━━━━━─

Jual atau menyakiti anak tidak tersedia dalam sistem.

─━━━━━━━━━━━━━━─

📌 *PENGALIHAN PENGASUHAN*
> ↳ Untuk memindahkan anakmu langsung, pilih dan tag pemain RPG yang bersedia.
> ↳ ${usedPrefix}rship anak info
> ↳ ${usedPrefix}rship anak adopsi <no-anak> @user
> ↳ Penerima: ${usedPrefix}rship anak asuh terima/tolak
> ↳ Untuk panduan adopsi dari panti, lihat ${usedPrefix}rship kid adopt.

─━━━━━━━━━━━━━━─`
  )
}

if (action === 'anak' && args[1]?.toLowerCase() === 'adopsi') {
  const childNumber = Number(args[2])
  const child = Number.isInteger(childNumber) && childNumber > 0 ? user.kids[childNumber - 1] : null
  const targetJid = conn.decodeJid?.(m.mentionedJid?.[0] || '') || m.mentionedJid?.[0]
  const targetData = targetJid && getUserRPG(wdb, targetJid)
  const targetUser = targetData?.rpg || targetData
  if (!child || child.facility || !targetJid || targetJid === m.sender || !targetUser || targetData?.isDummy) {
    return m.reply(
      `╭─❏「 👶 PENGALIHAN PENGASUHAN 」❏\n` +
      `│ TRANSFER LANGSUNG KE PEMAIN LAIN\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Untuk memindahkan anakmu, tag pemain RPG yang bersedia mengasuh.\n` +
      `> ↳ Lihat nomor anak: ${usedPrefix}rship kid info\n` +
      `> ↳ Format: ${usedPrefix}rship anak adopsi <no-anak> @user\n` +
      `> ↳ Penerima menyetujui/menolak: ${usedPrefix}rship anak asuh terima/tolak\n\n` +
      `Anak yang sedang di daycare atau panti tidak bisa dipindahkan dengan cara ini.\n` +
      `> ↳ Panduan adopsi panti: ${usedPrefix}rship kid adopt\n` +
      `> ↳ Lihat daftarnya: ${usedPrefix}rship kid adopt list`
    )
  }
  if (user.pendingChildTransfer) {
    return m.reply(`Selesaikan tawaran pengasuhan sebelumnya sebelum mengirim tawaran baru.`)
  }
  if (child.pendingTransferId) {
    return m.reply(`Anak ini sudah memiliki tawaran pengasuhan yang sedang menunggu jawaban.`)
  }
  if (targetUser.pendingChildFosterOffer) {
    const previousOffer = targetUser.pendingChildFosterOffer
    if (now - Number(previousOffer.createdAt || 0) <= 5 * 60 * 1000) {
      return m.reply(`Pemain tersebut masih memiliki tawaran pengasuhan anak yang belum dijawab.`)
    }
    const previousSource = getUserRPG(wdb, previousOffer.sourceJid)
    const previousSourceUser = previousSource?.rpg || previousSource
    if (previousSourceUser?.pendingChildTransfer?.id === previousOffer.id) {
      const previousChild = previousSourceUser.kids?.find(entry => entry.pendingTransferId === previousOffer.id)
      if (previousChild) delete previousChild.pendingTransferId
      delete previousSourceUser.pendingChildTransfer
    }
    delete targetUser.pendingChildFosterOffer
  }

  const transferId = `${m.sender}-${now}-${Math.random().toString(36).slice(2, 10)}`
  child.pendingTransferId = transferId
  user.pendingChildTransfer = { id: transferId, targetJid, createdAt: now }
  targetUser.pendingChildFosterOffer = {
    id: transferId,
    sourceJid: m.sender,
    sourceName: wdb.users[m.sender]?.name || m.sender.split('@')[0],
    childName: child.nama,
    parentName: child.ortu,
    createdAt: now
  }
  await saveDB(wdb)
  return m.reply(
    `📨 Tawaran pengasuhan *${child.nama}* dikirim ke @${targetJid.split('@')[0]}.\n` +
    `> ↳ Penerima: ${usedPrefix}rship anak asuh terima atau ${usedPrefix}rship anak asuh tolak.\n` +
    `> ↳ Anak tetap di daftar keluargamu sampai penerima menyetujui.`,
    null,
    { mentions: [targetJid] }
  )
}

if (user.harem.length === 0) return m.reply(
  `╭─❏「 ❌ JOMBLO 」❏\n` +
  `│ ❌ *BELUM MEMILIKI PASANGAN*\n` +
  `╰─━━━━━━━━━━━━━━─`
)

// === SANTET LV1 ===
if (action === 'santet') {
  let targetNo = 0
  let amountText = args[1]
  if (args[2] && /^\d+$/.test(args[1] || '')) {
    targetNo = Number(args[1]) - 1
    amountText = args[2]
  }
  const target = user.harem[targetNo]
  const amount = Number(amountText)
  if (!target) return m.reply(`❌ Nomor pasangan tidak valid.`)
  if (!Number.isSafeInteger(amount) || amount <= 0) return m.reply(`❌ Masukkan jumlah uang yang valid.`)
  if (cekCD('santet', 2 * 60 * 60 * 1000) > 0) return m.reply(`⏰ Santet masih cooldown. Tunggu 2 jam.`)
  if (user.bank < amount) return m.reply(`❌ Saldo bank tidak cukup.`)

  user.bank -= amount
  user.cooldown.santet = Date.now()
  const successChance = amount > 100000000
    ? 1
    : amount < 10000000
      ? Math.min(0.08, 0.01 + (amount / 10000000) * 0.07)
      : 0.08 + ((amount - 10000000) / 90000000) * 0.92
  const success = Math.random() < successChance
  if (success) {
    target.level = Math.max(20, target.level || 1)
    target.love = Math.max(50, target.love || 0)
    delete target.customTitle
    target.waitTitleUp = true
  }
  saveDB(wdb)

  const story = success
    ? [
      `${target.name} tiba-tiba makin dekat dan mengajakmu memulai hubungan baru.`,
      `Ritualmu membuat ${target.name} melihatmu dengan perasaan yang berbeda.`,
      `${target.name} datang membawa kabar bahwa hatinya sudah berubah.`,
      `Hubungan kalian mendadak naik drastis setelah malam ritual itu.`,
      `${target.name} mengakui bahwa ia mulai benar-benar menyukaimu.`
    ][Math.floor(Math.random() * 5)]
    : [
      `Asap ritual menghilang, sementara ${target.name} hanya merasa sedikit pusing.`,
      `Ritualnya gagal dan ${target.name} malah menjauh sementara.`,
      `Mantra yang kamu ucapkan tidak bekerja pada ${target.name}.`,
      `${target.name} sama sekali tidak terpengaruh oleh ritualmu.`,
      `Malam itu berlalu tanpa perubahan apa pun pada hubungan kalian.`
    ][Math.floor(Math.random() * 5)]

  return m.reply(success
    ? `╭─❏「 🕯️ SANTET BERHASIL 」❏\n╰─━━━━━━━━━━━━━━─\n\n${story}\n\n${target.name} sekarang naik ke Lv.${target.level}.\n\n💰 Uang: -Rp ${amount.toLocaleString()}\n\n─━━━━━━━━━━━━━━─`
    : `╭─❏「 🕯️ SANTET GAGAL 」❏\n╰─━━━━━━━━━━━━━━─\n\n${story}\n\n💰 Uang: -Rp ${amount.toLocaleString()}\n\n─━━━━━━━━━━━━━━─`)
}


if (action === 'all') {
  if (!isPremiumUser(m.sender, wdb)) {
    return m.reply(
      `╭─❏「 💞 RSHIP ALL 」❏
│ 🔒 FITUR KHUSUS PREMIUM
╰─━━━━━━━━━━━━━━─

> ↳ Fitur \`.rship all\` hanya tersedia untuk pengguna premium.

─━━━━━━━━━━━━━━─`
    )
  }
  const partnerSelector = args[1]?.toLowerCase()
  const partners = partnerSelector === 'all'
    ? user.harem
    : [user.harem[Number(partnerSelector) - 1]].filter(Boolean)
  if (!partners.length) {
    return m.reply(
      `╭─❏「 💞 RSHIP ALL 」❏
│ 📋 FORMAT PENGGUNAAN
╰─━━━━━━━━━━━━━━─

> ↳ Pilih nomor pasangan atau gunakan \`all\`.
> ↳ Contoh: ${usedPrefix}rship all 1
> ↳ Contoh: ${usedPrefix}rship all all

─━━━━━━━━━━━━━━─`
    )
  }
  const allCooldown = cekCD('all', 30 * 60 * 1000)
  if (allCooldown > 0) {
    return m.reply(
      `╭─❏「 ⏰ RSHIP ALL 」❏
│ AKTIVITAS MASIH COOLDOWN
╰─━━━━━━━━━━━━━━─

> ↳ Tunggu ${formatRemaining(allCooldown)} sebelum menggunakan aktivitas ini kembali.

─━━━━━━━━━━━━━━─`
    )
  }
  const activityCosts = partners.flatMap(partner =>
    Object.entries(batchActivityRules)
      .filter(([activity, rule]) =>
        cekCD(activity, rule.cooldown) === 0 &&
        (partner.level || 1) >= rule.level &&
        (!rule.married || partner.menikah)
      )
      .map(([activity, rule]) => ({
        partner,
        activity,
        rule,
        cost: rule.costMin === undefined
          ? 0
          : Math.floor(Math.random() * (rule.costMax - rule.costMin + 1)) + rule.costMin
      }))
  )
  if (!activityCosts.length) {
    return m.reply(
      `╭─❏「 💞 RSHIP ALL 」❏
│ ⚠️ TIDAK ADA AKTIVITAS TERSEDIA
╰─━━━━━━━━━━━━━━─

> ↳ Belum ada aktivitas yang siap untuk pasangan pilihan.
> ↳ Periksa cooldown dan syarat level dengan ${usedPrefix}rship cd/fitur.

─━━━━━━━━━━━━━━─`
    )
  }

  const totalCost = activityCosts.reduce((total, item) => total + item.cost, 0)
  if (user.bank < totalCost) {
    return m.reply(
      `╭─❏「 💰 RSHIP ALL 」❏
│ ⚠️ SALDO BANK TIDAK MENCUKUPI
╰─━━━━━━━━━━━━━━─

> ↳ Total biaya: Rp ${totalCost.toLocaleString()}
> ↳ Saldo bank tidak cukup untuk menjalankan aktivitas.

─━━━━━━━━━━━━━━─`
    )
  }

  const now = Date.now()
  user.bank -= totalCost
  let totalIncome = 0
  const completedByPartner = new Map()
  let levelUps = 0
  for (const { partner, activity, rule } of activityCosts) {
    const loveChange = rule.conflictIntensity === undefined ? rule.love : conflictEffect(partner, rule.conflictIntensity)
    applyActivityLove(partner, loveChange)
    levelUps += addExp(partner, rule.exp)
    if (rule.incomeMin !== undefined) {
      totalIncome += Math.floor(Math.random() * (rule.incomeMax - rule.incomeMin + 1)) + rule.incomeMin
    }
    user.cooldown[activity] = now
    if (!completedByPartner.has(partner.name)) completedByPartner.set(partner.name, [])
    completedByPartner.get(partner.name).push(activity)
    if (activity === 'date') user.dateStats.totalDate++
    if (activity === 'wohoo') user.dateStats.wohoo++
  }
  totalIncome = scaleDifficultyIncome(user, totalIncome)
  user.bank += totalIncome
  user.cooldown.all = now
  saveDB(wdb)

  const costLine = totalCost ? `\n> ↳ Biaya: -Rp ${totalCost.toLocaleString()}` : ''
  const incomeLine = totalIncome ? `\n> ↳ Pendapatan: +Rp ${totalIncome.toLocaleString()}` : ''
  const levelLine = levelUps ? `\n> ↳ Level up: ${levelUps} kali` : ''
  const partnerLines = [...completedByPartner]
    .map(([name, activities]) =>
      `*${name}*\n${activities.map(activity => `> ↳ ${activity}`).join('\n')}`
    )
    .join('\n')
  return m.reply(
    `╭─❏「 💞 RSHIP ALL 」❏
│ ✅ AKTIVITAS RELATIONSHIP SELESAI
╰─━━━━━━━━━━━━━━─

💑 *DAFTAR AKTIVITAS*
${partnerLines}
> ↳ EXP dan Love mengikuti hasil tiap aktivitas${costLine}${incomeLine}${levelLine}

─━━━━━━━━━━━━━━─

⏰ *COOLDOWN*
> ↳ Cooldown all: 30 menit

─━━━━━━━━━━━━━━─`
  )
}

if (['putus', 'kill'].includes(action)) {
  const partnerNumber = Number(args[1])
  const partner = Number.isInteger(partnerNumber) && partnerNumber > 0
    ? user.harem[partnerNumber - 1]
    : null
  if (!partner) {
    return m.reply(
      `╭─❏「 💔 RSHIP ${action.toUpperCase()} 」❏
│ ⚠️ NOMOR PASANGAN TIDAK VALID
╰─━━━━━━━━━━━━━━─

📋 *PANDUAN*
> ↳ Pilih nomor pasangan yang valid.
> ↳ ${usedPrefix}rship ${action} <nomor pasangan>
> ↳ Lihat nomor dengan ${usedPrefix}rship harem

─━━━━━━━━━━━━━━─`
    )
  }
  if (user.pendingRshipCustody) {
    return m.reply(
      `╭─❏「 ⚖️ HAK ASUH RSHIP 」❏
│ ⚠️ PENGATURAN MASIH TERTUNDA
╰─━━━━━━━━━━━━━━─

> ↳ Selesaikan hak asuh yang masih menunggu terlebih dahulu.
> ↳ Gunakan ${usedPrefix}rship custody

─━━━━━━━━━━━━━━─`
    )
  }
  const cooldownKey = action
  const cooldown = cekCD(cooldownKey, 7 * 24 * 60 * 60 * 1000)
  if (cooldown > 0) {
    return m.reply(
      `╭─❏「 ⏰ RSHIP ${action.toUpperCase()} 」❏
│ AKTIVITAS MASIH COOLDOWN
╰─━━━━━━━━━━━━━━─

> ↳ Tunggu ${formatRemaining(cooldown)}.
> ↳ Periksa status dengan ${usedPrefix}rship cd.

─━━━━━━━━━━━━━━─`
    )
  }
  const pendingKey = action === 'putus' ? 'pendingRshipPutus' : 'pendingRshipKill'
  if (user[pendingKey] && now - Number(user[pendingKey].createdAt || 0) <= 5 * 60 * 1000) {
    return m.reply(
      `╭─❏「 ⚠️ KONFIRMASI ${action.toUpperCase()} 」❏
│ KONFIRMASI MASIH AKTIF
╰─━━━━━━━━━━━━━━─

> ↳ Selesaikan konfirmasi yang masih aktif terlebih dahulu.
> ↳ ${usedPrefix}rship ${action} konfirmasi
> ↳ ${usedPrefix}rship ${action} batal

─━━━━━━━━━━━━━━─`
    )
  }
  user[pendingKey] = { name: partner.name, createdAt: now }
  await saveDB(wdb)
  const destination = action === 'putus'
    ? `pasangan masuk daftar *mantan/exspouse* selama 7 hari (${usedPrefix}rship ex)`
    : `pasangan masuk *makam* selama 7 hari (${usedPrefix}rship makam)`
  return m.reply(
    `╭─❏「 ⚠️ KONFIRMASI ${action.toUpperCase()} 」❏
│ 💔 TINDAKAN TERHADAP PASANGAN
╰─━━━━━━━━━━━━━━─

👤 *DETAIL PASANGAN*
> ↳ Pasangan: *${partner.name}*
> ↳ Jika dikonfirmasi, ${destination}.
> ↳ Jika ada anak, kamu akan diminta memilih hak asuh setelahnya.

─━━━━━━━━━━━━━━─

📋 *PILIH TINDAKAN*
> ↳ ✅ ${usedPrefix}rship ${action} konfirmasi
> ↳ ❌ ${usedPrefix}rship ${action} batal

─━━━━━━━━━━━━━━─`
  )
}

let no = parseInt(args[1]) - 1
if (Number.isNaN(no) || !user.harem[no]) {
  const available = user.harem
    .map((partner, index) => ({ partner, index }))
    .filter(({ partner }) => !activityCooldowns[action] || !cekCD(action, activityCooldowns[action]))
  if (!available.length) {
    return m.reply(
      `╭─❏「 💞 RSHIP ${action.toUpperCase()} 」❏
│ ❌ TIDAK ADA PASANGAN TERSEDIA
╰─━━━━━━━━━━━━━━─

> ↳ Tidak ada pasangan yang siap untuk kegiatan *${action}*.

─━━━━━━━━━━━━━━─`
    )
  }
  no = available[Math.floor(Math.random() * available.length)].index
}

let p = user.harem[no]


// === DATE LV1 ===
if (action === 'date') {
  if(cekCD('date', 3600000) > 0) return m.reply(
    `╭─❏「 ⏰ SIBUK 」❏\n` +
    `│ ⏰ *PASANGAN SEDANG SIBUK*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${p.name} lagi sibuk`
  )

  const biaya = 25_000 * Math.max(1, Math.floor(Number(p.level) || 1))
  if (user.bank < biaya) return m.reply(
    `╭─❏「 ❌ UANG 」❏\n` +
    `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kencan dengan *${p.name}* (Lv.${p.level || 1}) butuh Rp ${biaya.toLocaleString('id-ID')}.\n` +
    `> ↳ Saldo bank kamu: Rp ${Number(user.bank).toLocaleString('id-ID')}`
  )
  
  user.bank -= biaya
  applyActivityLove(p, 10)
  let up = addExp(p, 20)
  user.dateStats.totalDate++
  user.cooldown.date = Date.now()
  saveDB(wdb)

  const tempat = ['Cafe', 'Taman', 'Mall', 'Alun-alun', 'Pantai', 'Bioskop', 'Museum', 'Kebun Binatang', 'Warung', 'Gunung', 'Sawah', 'Dermaga']
  const judul = [
    '💞 KENCAN ROMANTIS', '☕ NGEDATE SANTAI', '🌆 JALAN SORE', '🎬 MOVIE DATE', '🍽️ MAKAN BARENG',
    '💞 DATE ROMANTIS', '🌃 KENCAN MALAM', '🥂 BERDUA AJA',
    '🎡 MAIN BARENG', '📸 HUNTING FOTO', '🛍️ SHOPPING DATE', '🎨 DATE KREATIF'
  ]

  const cerita = [
    `Kencan di ${tempat[Math.floor(Math.random()*tempat.length)]} bareng *${p.name}* ${waktu.toLowerCase()}\n Ngobrol banyak dan ketawa bareng`,
    `*${p.name}* ngajakin kamu jalan ke ${tempat[Math.floor(Math.random()*tempat.length)]}\n Suasananya tenang dan nyaman banget`,
    `Date sederhana tapi berkesan sama *${p.name}*\n│ Saling cerita tentang hari ini`,
    `Jalan sore bareng *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n Foto-foto dan jajan es krim`,
    `Makan malam bareng *${p.name}*\n│ Cerita sambil suap-suapan`,
    `Nonton di ${tempat[Math.floor(Math.random()*tempat.length)]} bareng *${p.name}* ${waktu.toLowerCase()}\n Komentar filmnya sampe ketawa ngak`,
    `Dinner candle light sama *${p.name}*\n│ Pesan menu favorit kalian berdua`,
    `Jalan malam berdua sama *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n Duduk sambil ngobrol sampai larut`,
    `Main ke ${tempat[Math.floor(Math.random()*tempat.length)]} bareng *${p.name}*\n Rebutan main game dan saling dukung`,
    `Hunting foto sama *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n Hasilnya bagus-bagus buat dipajang`,
    `Shopping date bareng *${p.name}* di ${tempat[Math.floor(Math.random()*tempat.length)]}\n Saling pilihin baju yang cocok`,
    `Date kreatif bareng *${p.name}*\n Bikin kerajinan tangan sambil bercanda`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const ceritaRand = cerita[Math.floor(Math.random() * cerita.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💕 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${ceritaRand}\n\n`
  msg += `💰 *Biaya date*: -Rp ${biaya.toLocaleString('id-ID')} (Pasangan Lv.${p.level || 1})\n`
  msg += `💌 *Love*: +${getActivityLoveAmount(10)}\n`
  msg += `📈 *EXP*: +20`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}\n> ↳ Ketik .rship title ${no+1} buat pilih`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === LIBURAN LV20 ===
if (action === 'liburan') {
  let err = cekLevel(p, 20, 'Liburan')
  if(err) return m.reply(err)

  if(cekCD('liburan', 43200000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH DALAM LIBURAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${p.name} masih menikmati liburan sebelumnya`
  )

  const biaya = 250000

  if (user.bank < biaya) return m.reply(
    `╭─❏「 ❌ UANG 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh Rp ${biaya.toLocaleString()} untuk liburan`
  )

  const cerita = [
    `Kamu dan *${p.name}* menikmati pantai yang tenang\n Main air, makan seafood, lalu melihat sunset bersama`,
    `Liburan ke pegunungan bersama *${p.name}*\n Udara dingin dan pemandangannya bikin betah`,
    `Staycation romantis bareng *${p.name}*\n Seharian rebahan, pesan makanan, dan nonton film`,
    `Kamu mengajak *${p.name}* jalan-jalan ke kota wisata\n Foto berdua di setiap tempat yang kalian datangi`,
    `Petualangan singkat bersama *${p.name}* ${waktu.toLowerCase()}\n Capeknya hilang karena kalian menikmati semuanya berdua`,
  ]

  user.bank -= biaya
  applyActivityLove(p, 20)
  const up = addExp(p, 40)
  user.cooldown.liburan = Date.now()
  saveDB(wdb)

  const ceritaRand = cerita[Math.floor(Math.random() * cerita.length)]

  let msg = `╭─❏「 🏖️ LIBURAN BERSAMA 」❏\n`
  msg += `│ 🏖️ *MOMEN LIBURAN*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${ceritaRand}\n\n`
  msg += `💰 *Uang*: -Rp ${biaya.toLocaleString()}\n`
  msg += `💌 *Love*: +${getActivityLoveAmount(20)}\n`
  msg += `📈 *EXP*: +40\n`

  if(up) msg += `🎉 *LEVEL UP!* Lv.${p.level}\n`

  msg += `\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}
  // === MAKAN LV5 ===
if (action === 'makan') {
  let err = cekLevel(p, 1, 'Makan')
  if(err) return m.reply(err)
  
  if(cekCD('makan', 7200000) > 0) return m.reply(
    `╭─❏「 ⏰ KENYANG 」❏\n` +
    `│ ⏰ *MASIH KENYANG*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
  
  let biaya = Math.floor(Math.random() * 10000) + 15000
  if (user.bank < biaya) return m.reply(
    `╭─❏「 ❌ UANG 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh Rp ${biaya.toLocaleString()}`
  )
  
  user.bank -= biaya
  applyActivityLove(p, 8)
  let up = addExp(p, 12)
  user.cooldown.makan = Date.now()
  saveDB(wdb)

  const judul = [
    '🍜 MAKAN BARENG','🥢 DINNER DATE','🍰 JAJAN BARENG',
    '🍽️ MAKAN BARENG', '😋 SUAP-SUAPAN', '💕 ROMANTIS'
  ]

  const isi = [
    `*${p.name}* traktir kamu makan ${waktu.toLowerCase()}\nMenunya enak banget, nambah 2x`,
    `Makan bareng *${p.name}* ${waktu.toLowerCase()}\nSambil suap-suapan bercanda`,
    `*${p.name}* masakin kamu ${waktu.toLowerCase()}\nRasanya bikin kangen rumah`,
    `Makan malam romantis sama *${p.name}* ${waktu.toLowerCase()}\nSaling suapin dan rebutan makanan`,
    `*${p.name}* pesen menu favorit kamu\nKatanya biar kamu tambah sayang`,
    `Date makan bareng *${p.name}*\nDuduk mepet sambil bisik-bisik`
  ]
  
  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 🍽️ *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💰 *Uang*: -Rp ${biaya.toLocaleString()}\n`
  msg += `💌 *Love*: +${getActivityLoveAmount(8)}\n`
  msg += `📈 *EXP*: +12`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === PELUK LV1 ===
if (action === 'peluk') {
  let err = cekLevel(p, 10, 'Peluk') 
  if(err) return m.reply(err)

  if (user.harem.length === 0) return m.reply(
    `╭─❏「 ❌ JOMBLO 」❏\n` +
    `│ ❌ *BELUM PUNYA PASANGAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pacaran dulu baru bisa peluk`
  )

  if(cekCD('peluk', 1800000) > 0) return m.reply(
    `╭─❏「 ⏰ MALU 」❏\n` +
    `│ ⏰ *MASIH MALU*\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
  
  applyActivityLove(p, 5)
  let up = addExp(p, 8)
  user.cooldown.peluk = Date.now()
  saveDB(wdb)

  const judul = [
    '🫂 PELUK HANGAT','🤗 HUG TIME','💞 DEKETAN', 
    '🫂 PELUKAN ERAT', '💞 MANJA', '😳 NEMPEL'     
  ]

  const isi = [
    `*${p.name}* ngasih peluk hangat ${waktu.toLowerCase()}\nCapek langsung ilang`,
    `Pelukan dari *${p.name}* paling nyaman\nRasanya aman banget`,
    `*${p.name}* nyender di bahu kamu ${waktu.toLowerCase()}\nDiem aja udah bahagia`,
    `Kamu peluk *${p.name}* dari belakang ${waktu.toLowerCase()}\nBisikin "kangen" di telinganya`,
    `*${p.name}* duduk di pangkuan kamu\nPelukan yg lama banget lepasnya`,
    `Nempel terus sama *${p.name}*\nKatanya anget dan nyaman`
  ]
  
  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 🫂 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: +${getActivityLoveAmount(5)}\n`
  msg += `📈 *EXP*: +8`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === MANDI LV40 ===
if (action === 'mandi') {
  let err = cekLevel(p, 40, 'Mandi')
  if(err) return m.reply(err)

  if(cekCD('mandi', 3600000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH DALAM COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Baru mandi`
  )

  applyActivityLove(p, 8)
  let up = addExp(p, 12)
  user.cooldown.mandi = Date.now()
  saveDB(wdb)

  const judul = [
    '🛁 WAKTU SANTAI','🚿 MANDI BARENG','🧼 QUALITY TIME',
    '🚿 MANDI BARENG', '🫧 SABUNAN', '😳 PRIVAT',
    '💦 BASAH-BASAHAN', '🛀 BERENDAM', '😉 MANJA'
  ]

  const isi = [
    `Mandi bareng *${p.name}* ${waktu.toLowerCase()}\nSambil ngobrol santai`,
    `*${p.name}* siapin air hangat buat kamu\nRasanya nyaman banget`,
    `Waktu santai bareng *${p.name}*\nBercanda sambil cuci muka`,
    `Mandi bareng *${p.name}* ${waktu.toLowerCase()}\nSaling gosokin punggung sambil bercanda`,
    `*${p.name}* rebutan shower sama kamu\nBasah-basahan dan ketawa terus`,
    `Waktu privat berdua di kamar mandi *${p.name}*\nBantuin keramas katanya`,
    `*${p.name}* narik kamu ke shower\n"Mandi bareng yuk" katanya sambil senyum nakal`,
    `Berendam di bathtub sama *${p.name}*\nBusanya banyak dan lampunya temaram`,
    `*${p.name}* nempel dari belakang pas kamu sabunan\nBisik "jangan gerak dulu"`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 🛁 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: +${getActivityLoveAmount(8)}\n`
  msg += `📈 *EXP*: +12`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}

  // === TIDUR LV40 ===
if (action === 'tidur') {
  let err = cekLevel(p, 40, 'Tidur')
  if(err) return m.reply(err)

  if(cekCD('tidur', 28800000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH DALAM COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Baru tidur`
  )

  applyActivityLove(p, 10)
  let up = addExp(p, 15)
  user.cooldown.tidur = Date.now()
  saveDB(wdb)

  const judul = [
    '😴 TIDUR BARENG','🛏️ MALAM NYAMAN','🌙 PELUKAN HANGAT',
    '😴 TIDUR NEMPEL', '🌙 GENDONGAN', '💤 PELUK SAMPE PAGI',
    '🫂 NEMPEL ERAT', '😳 SATU SELIMUT', '❤️‍🔥 MALAM PANAS'
  ]

  const isi = [
    `Tidur dipelukan *${p.name}* ${waktu.toLowerCase()}\nMimpinya indah banget`,
    `*${p.name}* bisikin "selamat tidur"\nTerus kalian tidur sambil pegangan tangan`,
    `Malam ditemenin *${p.name}*\nRasanya tenang dan aman`,
    `Tidur bareng *${p.name}* ${waktu.toLowerCase()}\nNempel terus, ga mau lepas pelukannya`,
    `*${p.name}* minta digendong pas tidur\nKatanya gitu baru nyenyak`,
    `Semalaman pelukan sama *${p.name}*\nBangun-bangun masih saling tatap`,
    `*${p.name}* tidurnya sambil tiduran di dada kamu\nNapasnya anget dan pelan`,
    `Berdua pake 1 selimut sama *${p.name}*\nKaki saling nyari di bawah selimut`,
    `Malam ini *${p.name}* manja banget\nDari tidur sampe bangun ga lepas pelukan`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 😴 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: +${getActivityLoveAmount(10)}\n`
  msg += `📈 *EXP*: +15`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === BELANJA LV10 ===
if (action === 'belanja') {
  let err = cekLevel(p, 10, 'Belanja')
  if(err) return m.reply(err)

  if(cekCD('belanja', 7200000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Dompet kosong`
  )

  let biaya = (Math.floor(Math.random() * 20000) + 10000) * Math.max(1, Math.floor(Number(p.level) || 1))

  if (user.bank < biaya) return m.reply(
    `╭─❏「 ❌ UANG 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh Rp ${biaya.toLocaleString()}`
  )

  user.bank -= biaya
  applyActivityLove(p, 10)
  let up = addExp(p, 15)
  user.cooldown.belanja = Date.now()
  saveDB(wdb)

  const judul = [
    '🛍️ BELANJA BARENG','🛒 JALAN KE MALL','🎁 SHOPPING TIME',
    '🏬 MALL DATE','🛒 JAJAN BARENG'
  ]

  const isi = [
    `Belanja bareng *${p.name}* ${waktu.toLowerCase()}\nNyoba baju terus saling kasih pendapat`,
    `*${p.name}* nemenin kamu cari barang\nMuter mall sampe capek tapi seru`,
    `Shopping bareng *${p.name}*\nJajan es krim dulu biar semangat*\nKeliling toko sambil pilih barang lucu`,
    `*${p.name}* traktir kamu jajan\nSeneng banget bisa jalan bareng`,
    `Hunting barang sama *${p.name}*\nDapat banyak diskon dan foto lucu`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 🛍️ *MOMEN BELANJA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `🏷️ *Level pasangan*: Lv.${p.level || 1}\n`
  msg += `💰 *Uang*: -Rp ${biaya.toLocaleString()}\n`
  msg += `💌 *Love*: +${getActivityLoveAmount(10)}\n`
  msg += `📈 *EXP*: +15`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === KERJA LV10 ===
if (action === 'kerja') {
  let err = cekLevel(p, 40, 'Kerja')
  if(err) return m.reply(err)

  if (!p.menikah) return m.reply(
    `╭─❏「 ❌ NIKAH 」❏\n` +
    `│ ❌ *BELUM MENIKAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Harus nikah dulu`
  )

  if(cekCD('kerja', 14400000) > 0) return m.reply(
    `╭─❏「 ⏰ CAPEK 」❏\n` +
    `│ ⏰ *MASIH CAPEK*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${p.name} masih capek`
  )

  let gaji = Math.floor(Math.random() * 30000) + 15000
  gaji = scaleDifficultyIncome(user, gaji)
  user.bank += gaji
  applyActivityLove(p, 8)
  let up = addExp(p, 15)
  user.cooldown.kerja = Date.now()
  saveDB(wdb)

  const judul = [
    '💼 KERJA BARENG','💰 CARI CUAN','👨‍💼 TIM KERJA'
  ]

  const isi = [
    `Kerja bareng *${p.name}* ${waktu.toLowerCase()}\nKompak banget, bos sampe muji`,
    `*${p.name}* bantuin kamu lembur\nPulang dibeliin makan enak`,
    `Satu tim sama *${p.name}*\nKerjaan cepet beres karena kerja sama`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💼 *MOMEN KERJA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💰 *Uang*: +Rp ${gaji.toLocaleString()}\n`
  msg += `💌 *Love*: +${getActivityLoveAmount(8)}\n`
  msg += `📈 *EXP*: +15`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === GIFT HANDLER ===
if (action === 'gift') {
  let tipe = args[1]?.toLowerCase()
  let confirmedGiftDraft = null

  const sendGiftPartnerMenu = () => {
    const rows = user.harem.map((partner, index) => ({
      title: `💕 Pasangan ${index + 1}`,
      description: `${String(partner.name).slice(0, 24)} · Lv.${partner.level || 1} · 💖 ${partner.love || 0}${partner.menikah ? ' · 💍' : ''}`,
      id: `${usedPrefix}rship gift flow partner ${index}`
    }))
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '💝 KADO UNTUK SIAPA?',
      subtitle: 'Pilih satu pasangan untuk menerima hadiah',
      text: 'Setiap kado punya cerita. Pilih pasangan yang ingin kamu bahagiakan, lalu tentukan hadiahnya.',
      buttonText: '💕 PILIH PASANGAN',
      footer: 'AVELIA • RSHIP GIFT',
      sections: [{ title: '💕 Pasanganmu', rows }],
      fallbackText:
        `╭─❏「 💝 PILIH PASANGAN 」❏\n` +
        `${rows.map((row, index) => `> ${index + 1}. ${user.harem[index].name} — ${usedPrefix}rship gift flow partner ${index}`).join('\n')}\n\n` +
        `Pilih pasangan sebelum menentukan hadiah.`
    })
  }

  const sendGiftGuide = () => sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    title: '🎁 RSHIP • HADIAH PASANGAN',
    subtitle: 'Pilih kado dengan penuh perhatian',
    text: giftGuide(),
    footer: 'AVELIA • RSHIP GIFT',
    buttons: [[
      user.harem.length ? '💝 Pilih pasangan & hadiah' : '💕 Lihat pasangan',
      user.harem.length ? `${usedPrefix}rship gift flow start` : `${usedPrefix}rship harem`
    ]],
    fallbackText: giftGuide()
  })

  const sendGiftTypeMenu = draft => {
    const rows = []
    for (let page = 1; page <= giftPageCount; page++) {
      const firstGift = (page - 1) * giftPageSize + 1
      const lastGift = Math.min(page * giftPageSize, GIFT_LIST.length)
      rows.push({
        title: `🎁 Kado ${firstGift}–${lastGift}`,
        description: `Jelajahi ${lastGift - firstGift + 1} pilihan kado`,
        id: `${usedPrefix}rship gift flow page ${page}`
      })
    }
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '🎀 PILIH JENIS HADIAH',
      subtitle: `Untuk ${draft.partnerName} · ${giftPageCount} halaman kado`,
      text:
        `💕 Pasangan: *${draft.partnerName}*\n\n` +
        `Pilih satu dari *${giftPageCount} halaman*. Setiap halaman berisi maksimal ${giftPageSize} kado. ` +
        `Setelah memilih hadiah, cek ringkasan lalu konfirmasi sebelum dikirim.\n\n` +
        `💵 Untuk hadiah uang, gunakan *${usedPrefix}rship gift flow money* lalu ikuti petunjuknya.`,
      buttonText: '🎁 LIHAT PILIHAN HADIAH',
      footer: 'AVELIA • RSHIP GIFT',
      sections: [{ title: '🎁 Pilih halaman katalog', rows }],
      fallbackText:
        `🎀 *PILIH HADIAH UNTUK ${draft.partnerName}*\n` +
        `${rows.map(row => `> ↳ ${row.title}: ${row.id}`).join('\n')}\n` +
        `> ↳ Hadiah uang: ${usedPrefix}rship gift flow money`
    })
  }

  const sendGiftItemPage = (draft, page) => {
    const start = (page - 1) * giftPageSize
    const gifts = GIFT_LIST.slice(start, start + giftPageSize)
    const sections = [{
      title: `✨ Kado ${start + 1}–${start + gifts.length}`,
      rows: gifts.map((gift, index) => ({
        title: `${gift.emoji} Kado #${gift.id}`,
        description: `${gift.desc.slice(0, 18)} · Rp ${gift.harga.toLocaleString('id-ID')} · +${gift.love} Love`,
        id: `${usedPrefix}rship gift flow item ${gift.id}`
      }))
    }]
    const navigation = []
    if (page > 1) navigation.push({
      title: '⬅️ Halaman sebelumnya',
      description: `Kado ${Math.max(1, start - giftPageSize + 1)}–${start}`,
      id: `${usedPrefix}rship gift flow page ${page - 1}`
    })
    if (page < giftPageCount) navigation.push({
      title: '➡️ Halaman berikutnya',
      description: `Kado ${start + gifts.length + 1}–${Math.min((page + 1) * giftPageSize, GIFT_LIST.length)}`,
      id: `${usedPrefix}rship gift flow page ${page + 1}`
    })
    navigation.push({
      title: '🎀 Ganti jenis hadiah',
      description: 'Kembali ke pilihan halaman atau hadiah uang',
      id: `${usedPrefix}rship gift flow ulang`
    })
    sections.push({ title: '📖 Jelajahi katalog', rows: navigation })
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '🎁 KATALOG KADO',
      subtitle: `${draft.partnerName} · Halaman ${page}/${giftPageCount}`,
      text:
        `Pilih satu hadiah untuk *${draft.partnerName}*.\n` +
        `💰 Harga dibayar dari bank · 💖 Love dan EXP tercantum di setiap pilihan.\n` +
        `📚 Menampilkan ${gifts.length} hadiah pada halaman ini.`,
      buttonText: '🎁 PILIH SEBUAH KADO',
      footer: 'AVELIA • RSHIP GIFT',
      sections,
      fallbackText:
        `${formatGiftCatalogPage(page)}\n\n` +
        `${gifts.map((gift, index) => `> ↳ ${start + index + 1}. ${gift.desc}: ${usedPrefix}rship gift flow item ${gift.id}`).join('\n')}`
    })
  }

  const sendGiftReview = draft => {
    const gift = draft.kind === 'item'
      ? GIFT_LIST.find(entry => entry.id === Number(draft.giftId))
      : null
    const quantity = Number(draft.quantity) || 1
    const totalHarga = draft.kind === 'item' ? gift.harga * quantity : Number(draft.amount)
    const totalExp = draft.kind === 'item' ? gift.exp * quantity : Math.floor(totalHarga / 1000)
    const totalLove = draft.kind === 'item'
      ? gift.love * quantity
      : Math.min(100, Math.floor(totalHarga / 10000000))
    const balance = Number(user.bank) || 0
    const enoughBalance = balance >= totalHarga
    const giftName = draft.kind === 'item'
      ? `${quantity}x ${gift.desc} ${gift.emoji}`
      : `Uang Rp ${totalHarga.toLocaleString('id-ID')}`
    const itemAmount = draft.kind === 'item'
      ? quantity
      : totalHarga
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '💌 CEK KADO TERAKHIR',
      subtitle: `Kado untuk ${draft.partnerName}`,
      text:
        `╭─❏「 💝 RINGKASAN HADIAH 」❏\n` +
        `│ 💕 PENERIMA: ${draft.partnerName}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `🎁 *${giftName}*\n` +
        `> ↳ 💰 Biaya: Rp ${totalHarga.toLocaleString('id-ID')}\n` +
        `> ↳ 💖 Tambahan Love: +${totalLove}\n` +
        `> ↳ ✨ Tambahan EXP: +${totalExp.toLocaleString('id-ID')}\n` +
        `${draft.kind === 'item' ? `> ↳ Jumlah: ${usedPrefix}rship gift flow jumlah <jumlah>\n` : ''}` +
        `> ↳ 🏦 Saldo bank: Rp ${balance.toLocaleString('id-ID')} ${enoughBalance ? '✅' : '❌ belum cukup'}\n\n` +
        `${enoughBalance
          ? 'Sudah sesuai? Pilih *Kirim hadiah* untuk konfirmasi. Kalau belum, pilih *Pilih ulang* untuk menentukan kado lain.'
          : 'Saldo bank belum cukup. Pilih *Pilih ulang* untuk mengganti kado, atau isi saldo bank sebelum mencoba lagi.'}`,
      footer: 'AVELIA • HADIAH DENGAN HATI',
      buttons: [
        [`💝 Kirim hadiah ${draft.kind === 'item' ? `${itemAmount}x` : ''}`.trim(), `${usedPrefix}rship gift flow konfirmasi`],
        ['🔁 Belum, pilih ulang', `${usedPrefix}rship gift flow ulang`],
        ['✖️ Batalkan', `${usedPrefix}rship gift flow batal`]
      ],
      fallbackText:
        `💕 ${draft.partnerName} · 🎁 ${giftName}\n` +
        `💰 Rp ${totalHarga.toLocaleString('id-ID')} · 💖 +${totalLove} Love · ✨ +${totalExp.toLocaleString('id-ID')} EXP\n` +
        `${enoughBalance ? 'Konfirmasi' : 'Saldo belum cukup'}: ${usedPrefix}rship gift flow konfirmasi\n` +
        `Pilih ulang: ${usedPrefix}rship gift flow ulang`
    })
  }

  if (!tipe) {
    return sendGiftGuide()
  }

  if (tipe === 'flow') {
    const step = args[2]?.toLowerCase()
    const draft = user.rshipGiftDraft
    if (step === 'start') {
      if (!user.harem.length) return m.reply(
        `╭─❏「 💔 BELUM ADA PASANGAN 」❏\n` +
        `│ 🎁 HADIAH MENUNGGU UNTUK DIBERIKAN\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Buat pasangan terlebih dahulu, lalu buka kembali *${usedPrefix}rship gift*.`
      )
      user.rshipGiftDraft = { stage: 'partner', createdAt: Date.now() }
      await saveDB(wdb)
      return sendGiftPartnerMenu()
    }
    if (draft && Date.now() - Number(draft.createdAt) > giftDraftTtl) {
      delete user.rshipGiftDraft
      await saveDB(wdb)
      return m.reply(`⌛ Pilihan hadiah sudah kedaluwarsa. Mulai lagi dengan *${usedPrefix}rship gift*.`)
    }
    if (step === 'partner') {
      const partnerIndex = Number(args[3])
      const partner = Number.isSafeInteger(partnerIndex) ? user.harem[partnerIndex] : null
      if (!partner || draft?.stage !== 'partner') {
        return m.reply(`❌ Pilihan pasangan sudah tidak berlaku. Mulai lagi dengan *${usedPrefix}rship gift*.`)
      }
      user.rshipGiftDraft = {
        stage: 'type',
        partnerIndex,
        partnerName: partner.name,
        createdAt: Date.now()
      }
      await saveDB(wdb)
      return sendGiftTypeMenu(user.rshipGiftDraft)
    }
    if (!draft || !Number.isSafeInteger(Number(draft.partnerIndex)) ||
      user.harem[Number(draft.partnerIndex)]?.name !== draft.partnerName) {
      delete user.rshipGiftDraft
      await saveDB(wdb)
      return m.reply(`❌ Pasangan atau sesi hadiah sudah berubah. Mulai lagi dengan *${usedPrefix}rship gift*.`)
    }
    if (step === 'page') {
      const page = Number(args[3])
      if (draft.stage !== 'type' || !Number.isSafeInteger(page) || page < 1 || page > giftPageCount) {
        return m.reply(`❌ Halaman katalog tidak valid. Pilih lagi dengan *${usedPrefix}rship gift*.`)
      }
      return sendGiftItemPage(draft, page)
    }
    if (step === 'item') {
      const gift = GIFT_LIST.find(entry => entry.id === Number(args[3]))
      if (draft.stage !== 'type' || !gift) {
        return m.reply(`❌ Pilihan kado sudah tidak berlaku. Pilih lagi dari *${usedPrefix}rship gift*.`)
      }
      user.rshipGiftDraft = {
        ...draft,
        stage: 'review',
        kind: 'item',
        giftId: gift.id,
        quantity: 1,
        createdAt: Date.now()
      }
      await saveDB(wdb)
      return sendGiftReview(user.rshipGiftDraft)
    }
    if (step === 'money') {
      if (draft.stage !== 'type') return m.reply(`❌ Pilihan hadiah uang sudah tidak berlaku. Mulai lagi dengan *${usedPrefix}rship gift*.`)
      user.rshipGiftDraft = { ...draft, stage: 'moneyAmount', createdAt: Date.now() }
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 💵 HADIAH UANG 」❏\n` +
        `│ 💕 UNTUK ${draft.partnerName.toUpperCase()}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Kirim nominal yang ingin diberikan:\n` +
        `> ↳ *${usedPrefix}rship gift flow uang <nominal>*\n` +
        `> ↳ Contoh: *${usedPrefix}rship gift flow uang 5000000*\n\n` +
        `Kamu akan melihat ringkasan dan mengonfirmasi sebelum uang dikirim.`
      )
    }
    if (['uang', 'money'].includes(step)) {
      const amount = Number(args[3])
      if (draft.stage !== 'moneyAmount' || !Number.isSafeInteger(amount) || amount <= 0) {
        return m.reply(`❌ Masukkan nominal positif. Contoh: *${usedPrefix}rship gift flow uang 5000000*`)
      }
      user.rshipGiftDraft = { ...draft, stage: 'review', kind: 'money', amount, createdAt: Date.now() }
      await saveDB(wdb)
      return sendGiftReview(user.rshipGiftDraft)
    }
    if (step === 'jumlah') {
      const quantity = Number(args[3])
      if (draft.stage !== 'review' || draft.kind !== 'item' ||
        !Number.isSafeInteger(quantity) || quantity <= 0 ||
        !Number.isSafeInteger(GIFT_LIST.find(entry => entry.id === Number(draft.giftId))?.harga * quantity)) {
        return m.reply(`❌ Jumlah harus bilangan bulat positif. Contoh: *${usedPrefix}rship gift flow jumlah 2*`)
      }
      user.rshipGiftDraft = { ...draft, quantity, createdAt: Date.now() }
      await saveDB(wdb)
      return sendGiftReview(user.rshipGiftDraft)
    }
    if (step === 'ulang' || step === 'again') {
      if (!draft || draft.stage === 'partner') return sendGiftPartnerMenu()
      user.rshipGiftDraft = {
        stage: 'type',
        partnerIndex: draft.partnerIndex,
        partnerName: draft.partnerName,
        createdAt: Date.now()
      }
      await saveDB(wdb)
      return sendGiftTypeMenu(user.rshipGiftDraft)
    }
    if (step === 'batal' || step === 'cancel') {
      delete user.rshipGiftDraft
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 🌷 HADIAH DIBATALKAN 」❏\n` +
        `│ Pilihan hadiah dihapus; saldo dan hubunganmu tidak berubah.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }
    if (step === 'konfirmasi' || step === 'confirm') {
      if (draft.stage !== 'review') return m.reply(`❌ Belum ada hadiah yang siap dikirim. Mulai dengan *${usedPrefix}rship gift*.`)
      const partner = user.harem[Number(draft.partnerIndex)]
      if (!partner || partner.name !== draft.partnerName) {
        delete user.rshipGiftDraft
        await saveDB(wdb)
        return m.reply(`❌ Pasangan sudah berubah. Mulai lagi dengan *${usedPrefix}rship gift*.`)
      }
      const gift = draft.kind === 'item'
        ? GIFT_LIST.find(entry => entry.id === Number(draft.giftId))
        : null
      if (draft.kind === 'item' && (!gift || !Number.isSafeInteger(gift.harga * Number(draft.quantity)))) {
        return m.reply(`❌ Detail kado tidak valid. Pilih ulang dari *${usedPrefix}rship gift*.`)
      }
      if (draft.kind === 'money' && (!Number.isSafeInteger(Number(draft.amount)) || Number(draft.amount) <= 0)) {
        return m.reply(`❌ Nominal hadiah tidak valid. Pilih ulang dari *${usedPrefix}rship gift*.`)
      }
      if (!['item', 'money'].includes(draft.kind)) {
        return m.reply(`❌ Jenis hadiah tidak valid. Pilih ulang dari *${usedPrefix}rship gift*.`)
      }
      confirmedGiftDraft = draft
      if (draft.kind === 'item') {
        args = ['gift', String(Number(draft.partnerIndex) + 1), 'item', String(gift.id), String(draft.quantity)]
      } else {
        args = ['gift', String(Number(draft.partnerIndex) + 1), 'money', String(draft.amount)]
      }
      tipe = args[1]?.toLowerCase()
    } else {
      return m.reply(`❌ Pilihan menu tidak dikenali. Mulai ulang dengan *${usedPrefix}rship gift*.`)
    }
  }

  // MODE LIST:.rship gift list
  if(tipe === 'list'){
    const requestedPage = Number(args[2] || 1)
    if (!Number.isSafeInteger(requestedPage) || requestedPage < 1 || requestedPage > giftPageCount) {
      return m.reply(`❌ Pilih halaman katalog dari *1–${giftPageCount}*.`)
    }
    return m.reply(formatGiftCatalogPage(requestedPage))
  }

  // MODE HADIAH ANAK: .rship gift anak <no> item/money ...
  if (tipe === 'anak') {
    const childNo = parseInt(args[2]) - 1
    const child = user.kids[childNo]
    const giftType = args[3]?.toLowerCase()

    if (!child) return m.reply(
      `╭─❏「 ❌ ANAK TIDAK DITEMUKAN 」❏\n` +
      `│ ❌ *DATA ANAK TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Contoh: ${usedPrefix}rship gift anak 1 item 5 1`
    )

    let giftName
    let jumlah
    let totalHarga
    let totalExp
    let totalLove

    if (giftType === 'money' || giftType === 'uang') {
      const nominal = parseInt(args[4])

      if (!nominal || nominal <= 0) return m.reply(
        `╭─❏「 ❌ FORMAT HADIAH 」❏\n` +
        `│ ❌ *FORMAT TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Contoh: ${usedPrefix}rship gift anak 1 money 50000`
      )

      giftName = 'Uang jajan'
      jumlah = nominal
      totalHarga = nominal
      totalExp = Math.max(10, Math.floor(nominal / 1000))
      totalLove = Math.max(1, Math.floor(nominal / 10000))

    } else if (giftType === 'item') {
      const input = args[4]
      jumlah = parseInt(args[5]) || 1

      const giftIndex = parseInt(input) - 1
      const gift = !isNaN(giftIndex)
        ? GIFT_LIST[giftIndex]
        : GIFT_LIST.find(item => item.nama === input?.toLowerCase())

      if (!gift || jumlah <= 0) return m.reply(
        `╭─❏「 ❌ FORMAT HADIAH 」❏\n` +
        `│ ❌ *FORMAT TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Contoh: ${usedPrefix}rship gift anak 1 item 5 1`
      )

      giftName = `${jumlah}x ${gift.desc}`
      totalHarga = gift.harga * jumlah
      totalExp = gift.exp * jumlah
      totalLove = gift.love * jumlah

    } else {
      return m.reply(
        `╭─❏「 ❌ FORMAT HADIAH 」❏\n` +
        `│ ❌ *FORMAT TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${usedPrefix}rship gift anak 1 item 5 1\n` +
        `> ↳ ${usedPrefix}rship gift anak 1 money 50000`
      )
    }

    if (user.bank < totalHarga) return m.reply(
      `╭─❏「 ❌ BANK KOSONG 」❏\n` +
      `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh Rp ${totalHarga.toLocaleString()} di bank`
    )

    user.bank -= totalHarga
    child.love = Math.min(100, (child.love || 0) + totalLove)
    child.exp = (child.exp || 0) + totalExp
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🎁 HADIAH UNTUK ANAK 」❏\n` +
      `│ 🎁 *HADIAH DITERIMA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `👶 *${child.nama}* menerima ${giftName}\n` +
      `> ↳ 💰 Bank: -Rp ${totalHarga.toLocaleString()}\n` +
      `> ↳ 💖 Kasih sayang: +${totalLove}\n` +
      `> ↳ 📈 EXP: +${totalExp}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let p = user.harem[0]
  let pIndex = 0
  const explicitPartner = findPartner(args[1])
  if (explicitPartner && (args[2] === 'item' || args[2] === 'money' || args[2] === 'uang')) {
    p = explicitPartner.partner
    pIndex = explicitPartner.index
    args = [args[0], args[2], ...args.slice(3)]
  } else if (args[1] && !['item', 'money', 'uang'].includes(args[1].toLowerCase())) {
    return m.reply(`Pasangan tidak ditemukan. Lihat nomor pasangan dengan *${usedPrefix}rship harem*.`)
  }
  tipe = args[1]?.toLowerCase()

  const hasMultiWordGift = tipe === 'item' && GIFT_LIST.some(gift => gift.nama === args.slice(2, 4).join(' ').toLowerCase())
  const itemPartner = args.length >= (hasMultiWordGift ? 7 : 6) ? findPartner(args[args.length - 1]) : null
  if (tipe === 'item' && itemPartner) {
    p = itemPartner.partner
    pIndex = itemPartner.index
    args = args.slice(0, -1)
  }

  const moneyPartner = args.length >= 5 ? findPartner(args[args.length - 1]) : null
  if ((tipe === 'money' || tipe === 'uang') && moneyPartner) {
    p = moneyPartner.partner
    pIndex = moneyPartner.index
    args = args.slice(0, -1)
  }

  if(!p) return m.reply(
    `╭─❏「 ❌ BELUM PUNYA PASANGAN 」❏\n` +
    `│ ❌ *BELUM PUNYA PASANGAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Pacaran dulu lah`
  )

  // MODE 1: GIFT MONEY
  if(tipe === 'money' || tipe === 'uang'){
    let jumlah = parseInt(args[2])

    if(!jumlah || jumlah <= 0) return m.reply(
      `╭─❏「 ❌ SALAH 」❏\n` +
      `│ ❌ *FORMAT TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Contoh: .rship gift money 50000000`
    )

    if (user.bank < jumlah) return m.reply(
      `╭─❏「 ❌ BANK KOSONG 」❏\n` +
      `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh Rp ${jumlah.toLocaleString()} di bank`
    )

    if (confirmedGiftDraft) delete user.rshipGiftDraft
    let exp = Math.floor(jumlah / 1000)
    let love = Math.min(100, Math.floor(jumlah / 10000000))
    let cooldown = scaleDifficultyCooldown(user, Math.min(86400000, Math.floor(jumlah / 100000) * 60000))

    user.bank -= jumlah
    p.love = Math.min(100, p.love + love)
    const up = applyPartnerExp(p, exp) > 0

    user.cooldown['gift_'+p.name] = Date.now()
    user.cooldown['gift_cd_'+p.name] = cooldown
    saveDB(wdb)

    let jam = Math.floor(cooldown / 3600000)
    let menit = Math.floor((cooldown % 3600000) / 60000)

    const judul = [
      '💵 KASIH UANG','💰 TRAKTIRAN','💸 ROYAL GIFT','💵 CASH MONEY',
      '💳 TRANSFER SAYANG','💵 DUIT JAJAN','💰 HADIAH UANG',
      '💸 TAJIR MENDADAK','💵 NGASIH DUIT'
    ]

    const isi = [
      `Kamu transfer Rp ${jumlah.toLocaleString()} ke *${p.name}* ${waktu.toLowerCase()}\n*${p.name}*: "Makasih banyak sayang!"`,
      `*${p.name}* kaget dikasih uang sebanyak itu\nLangsung peluk dan cium pipi kamu`,
      `Kamu traktir *${p.name}* Rp ${jumlah.toLocaleString()}\n"Buat jajan ya" katanya sambil senyum`,
      `*${p.name}* langsung belanja online abis dapet duit\nKirim struknya ke kamu semua`,
      `Kasih uang ke *${p.name}* ${waktu.toLowerCase()}\nDia bilang "Aku sayang kamu banget"`,
      `*${p.name}* nabung uang dari kamu\nKatanya buat masa depan kalian berdua`,
      `Transfer dadakan ke *${p.name}*\nDibales "Ini buat apa? Banyak amat"`,
      `*${p.name}* happy banget dapet uang\nMood dia langsung naik 100%`,
      `Kamu kasih uang ke *${p.name}*\nDipake buat beli baju couple katanya`
    ]

    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    let msg = `╭─❏「 ${judulRand} 」❏\n`
    msg += `│ 💵 *HADIAH UANG*\n`
    msg += `╰─━━━━━━━━━━━━━━─\n\n`
    msg += `${isiRand}\n\n`
    msg += `💰 *Bank*: -Rp ${jumlah.toLocaleString()}\n`
    msg += `💌 *Love*: +${love}\n`
    msg += `📈 *EXP*: +${exp}\n`
    msg += `⏰ *Cooldown*: ${jam}j ${menit}m`

    if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

    msg += `\n\n─━━━━━━━━━━━━━━─`

    return m.reply(msg)
  }

  // MODE 2: GIFT ITEM
  if(tipe === 'item'){
    let input = args[2]
    let jumlahIndex = 3
    const multiWordGift = GIFT_LIST.find(gift => gift.nama === args.slice(2, 4).join(' ').toLowerCase())
    if (multiWordGift) {
      input = multiWordGift.nama
      jumlahIndex = 4
    }
    let jumlah = parseInt(args[jumlahIndex]) || 1

    if(!input) return m.reply(
      `╭─❏「 ❌ SALAH 」❏\n` +
      `│ ❌ *FORMAT TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Contoh: .rship gift item 5 2`
    )

    let gift = multiWordGift
    let noGift = parseInt(input) - 1

    if(!gift && !isNaN(noGift)) gift = GIFT_LIST[noGift]
    else if(!gift) gift = GIFT_LIST.find(g => g.nama === input.toLowerCase())

    if(!gift) return m.reply(
      `╭─❏「 ❌ SALAH 」❏\n` +
      `│ ❌ *HADIAH TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Lihat list dulu: .rship gift list`
    )

    let totalHarga = gift.harga * jumlah
    let totalExp = gift.exp * jumlah
    let totalLove = gift.love * jumlah
    let cooldown = scaleDifficultyCooldown(user, Math.min(86400000, Math.floor(totalHarga / 1000000) * 3600000))

    if(Date.now() - (user.cooldown['gift_'+p.name] || 0) < (user.cooldown['gift_cd_'+p.name] || 0)) {
      let sisa = Math.ceil(((user.cooldown['gift_'+p.name] || 0) + (user.cooldown['gift_cd_'+p.name] || 0) - Date.now()) / 60000)

      return m.reply(
        `╭─❏「 ⏰ COOLDOWN 」❏\n` +
        `│ ⏰ *HADIAH SEBELUMNYA MASIH BERLAKU*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${p.name} masih seneng sama hadiah sebelumnya\n` +
        `> ↳ Tunggu ${sisa} menit lagi`
      )
    }

    if (user.bank < totalHarga) return m.reply(
      `╭─❏「 ❌ BANK KOSONG 」❏\n` +
      `│ ❌ *SALDO BANK TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Butuh Rp ${totalHarga.toLocaleString()} di bank`
    )

    if (confirmedGiftDraft) delete user.rshipGiftDraft
    user.bank -= totalHarga
    p.love = Math.min(100, p.love + totalLove)
    const up = applyPartnerExp(p, totalExp) > 0

    user.cooldown['gift_'+p.name] = Date.now()
    user.cooldown['gift_cd_'+p.name] = cooldown
    saveDB(wdb)

    let jam = Math.floor(cooldown / 3600000)
    let menit = Math.floor((cooldown % 3600000) / 60000)

    const judul = [
      '🎁 HADIAH MEWAH','💎 KADO SPESIAL','👑 ROYAL GIFT',
      '🎀 SURPRISE','💝 KADO CINTA','🎁 PAKET MEWAH',
      '💎 GIFT EKSKLUSIF','🎁 KADO TERBAIK','💝 UNTUKMU SAYANG'
    ]

    const isi = [
      `${gift.emoji} Kamu kasih ${jumlah}x *${gift.desc}* ke *${p.name}* ${waktu.toLowerCase()}\nDia langsung peluk dan bilang makasih`,
      `${gift.emoji} *${p.name}* kaget dapet ${gift.desc}\n"Sayang ini mahal banget" katanya sambil nangis haru`,
      `${gift.emoji} Surprise ${gift.desc} buat *${p.name}*\nMood dia langsung naik dan makin sayang`,
      `${gift.emoji} *${p.name}* unboxing ${gift.desc} di depan kamu\nTerus langsung pake dan muter-muter`,
      `${gift.emoji} Kado ${gift.desc} bikin *${p.name}* seneng banget\nSeharian ga lepas dari kamu`,
      `${gift.emoji} *${p.name}* pamer ${gift.desc} ke temennya\n"Ini dari pacar aku" katanya bangga`,
      `${gift.emoji} Kamu beliin ${gift.desc} buat *${p.name}*\nDia bilang "Aku ga nyangka" sambil peluk`,
      `${gift.emoji} Hadiah ${gift.desc} dari kamu\n*${p.name}* simpen baik-baik katanya`,
      `${gift.emoji} *${p.name}* fotoin ${gift.desc} terus\nBuat dijadiin wallpaper HP`
    ]

    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    let msg = `╭─❏「 ${judulRand} 」❏\n`
    msg += `│ 🎁 *HADIAH UNTUK PASANGAN*\n`
    msg += `╰─━━━━━━━━━━━━━━─\n\n`
    msg += `${isiRand}\n\n`
    msg += `💰 *Bank*: -Rp ${totalHarga.toLocaleString()}\n`
    msg += `💌 *Love*: +${totalLove}\n`
    msg += `📈 *EXP*: +${totalExp}\n`
    msg += `⏰ *Cooldown*: ${jam}j ${menit}m`

    if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

    msg += `\n\n─━━━━━━━━━━━━━━─`

    return m.reply(msg)
  }

  return m.reply(giftGuide())
}


// === DEBAT LV1 ===
if (action === 'debat') {
  let err = cekLevel(p, 1, 'Debat')
  if(err) return m.reply(err)
  if(cekCD('debat', 1800000) > 0) return m.reply(`⏰ Debat masih cooldown. Tunggu 30 menit.`)

  const loveChange = conflictEffect(p, 5)
  applyActivityLove(p, loveChange)
  const up = addExp(p, 10)
  user.cooldown.debat = Date.now()
  saveDB(wdb)
  const story = [
    `Perdebatan soal film berubah jadi adu argumen panjang sama *${p.name}*.`,
    `Kamu dan *${p.name}* beda pendapat soal makanan, tapi tetap saling dengar.`,
    `*${p.name}* menantangmu debat receh sampai kalian lupa waktu.`,
    `Debat kecil dengan *${p.name}* berakhir dengan saling menertawakan argumen sendiri.`,
    `Kamu dan *${p.name}* berdebat sengit, lalu diam-diam masih saling memperhatikan.`
  ][Math.floor(Math.random() * 5)]
  return m.reply(
    `╭─❏「 🗣️ DEBAT 」❏\n│ 🗣️ *PERDEBATAN BERSAMA*\n╰─━━━━━━━━━━━━━━─\n\n` +
    `${story}\n\n` +
    `💌 *Love*: ${formatLoveChange(loveChange)}\n` +
    `📈 *EXP*: +10\n` +
    `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}\n─━━━━━━━━━━━━━━─`
  )
}

// === PRANK LV1 ===
if (action === 'prank') {
  let err = cekLevel(p, 1, 'Prank')
  if(err) return m.reply(err)
  if(cekCD('prank', 3600000) > 0) return m.reply(`⏰ Prank masih cooldown. Tunggu 1 jam.`)

  const loveChange = conflictEffect(p, 7)
  applyActivityLove(p, loveChange)
  const up = addExp(p, 12)
  user.cooldown.prank = Date.now()
  saveDB(wdb)
  const story = [
    `Kamu mengganti wallpaper HP *${p.name}* dengan foto paling kocak.`,
    `Kamu mengirim stiker aneh bertubi-tubi ke chat *${p.name}*.`,
    `Kamu pura-pura lupa nama panggilan *${p.name}* sampai dia curiga.`,
    `Kamu menyembunyikan camilan *${p.name}*, lalu pura-pura ikut mencari.`,
    `Kamu mengerjai *${p.name}* dengan kejutan kecil yang tidak disangka-sangka.`
  ][Math.floor(Math.random() * 5)]
  return m.reply(
    `╭─❏「 😈 PRANK 」❏\n│ 😈 *MENGERJAI PASANGAN*\n╰─━━━━━━━━━━━━━━─\n\n` +
    `${story}\n\n` +
    `💌 *Love*: ${formatLoveChange(loveChange)}\n` +
    `📈 *EXP*: +12\n` +
    `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}\n─━━━━━━━━━━━━━━─`
  )
}

// === USIL LV1 ===
if (action === 'usil') {
  let err = cekLevel(p, 1, 'Usil')
  if(err) return m.reply(err)

  if(cekCD('usil', 3600000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 1 jam`
  )

  const loveChange = conflictEffect(p, 3)
  applyActivityLove(p, loveChange)
  let up = addExp(p, 10)
  user.cooldown.usil = Date.now()
  saveDB(wdb)

  const judul = [
    '😈 USIL BARENG',
    '😆 JAHILIN',
    '🙈 GODAIN',
    '🤭 NAKAL RINGAN',
    '😏 PRANK TIPIS',
    '😜 KERJAAN ISENG',
    '😤 NAKAL SEDANG',
    '😈 ULANG TAHUN NAKAL',
    '🔥 NAKAL PARAH'
  ]

  const isi = [
    `Isengin *${p.name}* ${waktu.toLowerCase()}\nDia kaget terus ketawa ngak`,
    `*${p.name}* digelitikin pas lagi diem\n"Awas ya" katanya sambil ngejar`,
    `Jahilin *${p.name}* pake filter jelek\nHasilnya lucu banget`,
    `Sembunyiin sendal *${p.name}* terus pura2 bantu nyari\nPas ketemu dia langsung manyun`,
    `Ganti nada dering *${p.name}* pake suara kambing\nKaget tiap ada notif masuk`,
    `Tempel stiker "aku jomblo" di belakang HP *${p.name}*\nDia baru sadar pas difoto orang`,
    `Isi chat *${p.name}* pake stiker cringe 50 biji\nDia scroll sejam buat hapusin`,
    `Tuker wallpaper *${p.name}* pake foto pas tidur ngiler\nLangsung hapus grup gara2 malu`,
    `Broadcast ke semua kontak *${p.name}*: "aku suka kamu"\nDia ngeblok kamu 3 hari`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 😈 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: ${formatLoveChange(loveChange)}\n`
  msg += `📈 *EXP*: +10`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === MARAH LV1 ===
if (action === 'marah') {
  let err = cekLevel(p, 1, 'Marah')
  if(err) return m.reply(err)

  if(cekCD('marah', 3600000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 1 jam`
  )

  const loveChange = conflictEffect(p, 8)
  applyActivityLove(p, loveChange)
  let up = addExp(p, 5)
  user.cooldown.marah = Date.now()
  saveDB(wdb)

  const judul = [
    '😤 BERTENGKAR',
    '😠 CEKCOK',
    '😡 SALAH PAHAM',
    '😏 NGAMBEG MANJA',
    '😒 DIEM DIEMAN',
    '🥺 UJUNG UJUNGAN',
    '😈 KODE KODEAN',
    '🔥 PERANG BANTAL',
    '💋 BAIIKAN DI KASUR'
  ]

  const isi = [
    `Kamu sama *${p.name}* lagi salah paham ${waktu.toLowerCase()}\nAbis itu baikan lagi kok`,
    `*${p.name}* ngambek bentar\nTapi ujungnya saling minta maaf`,
    `Cekcok kecil sama *${p.name}*\nNamanya juga pasangan ya`,
    `*${p.name}* cemberut karena kamu kurang perhatian ${waktu.toLowerCase()}\nSpill peluk 1x langsung luluh`,
    `Diem dieman sejam sama *${p.name}*\nYang kalah duluan yang chat duluan`,
    `Ujung ujungan gara gara hal sepele sama *${p.name}*\n5 menit kemudian udah kangen`,
    `*${p.name}* marah sambil kode "ga butuh kamu"\nPadahal chat tiap 2 menit`,
    `Perang bantal virtual sama *${p.name}*\nKatanya marah, tapi ketawanya paling kenceng`,
    `Abis marah sama *${p.name}* malah jadi nempel terus\nKatanya hukuman, ujungnya baikan di kasur`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 😤 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `${loveChange < 0 ? '💔' : '💖'} *Love*: ${formatLoveChange(loveChange)}\n`
  msg += `📈 *EXP*: +5`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === MAAF ===
if (action === 'maaf') {
  let err = cekLevel(p, 1, 'Maaf')
  if(err) return m.reply(err)

  if(cekCD('maaf', 1800000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 30 menit`
  )

  applyActivityLove(p, 12)
  let up = addExp(p, 8)
  user.cooldown.maaf = Date.now()
  saveDB(wdb)

  const judul = [
    '🥺 MINTA MAAF',
    '🫂 PELUK DULUAN',
    '💌 SURAT CINTA',
    '😳 SALAH PAHAM DOANG',
    '😌 UDAH BAIIKAN YUK',
    '😏 YANG NGAJAK BAIKAN',
    '🤭 NGALAH DULUAN',
    '💋 CIUMAN DAMAI',
    '❤️‍🔥 NEMPEL LAGI'
  ]

  const isi = [
    `Kamu nyamperin *${p.name}* terus bilang "maaf ya" ${waktu.toLowerCase()}\nDia diem 3 detik terus senyum`,
    `Peluk dari belakang pas *${p.name}* lagi diem\nKatanya "ih ngagetin" tapi ga ngelepas`,
    `Kirim chat panjang ke *${p.name}*\nIsinya minta maaf + janji ga ngulangin`,
    `Ternyata yang bikin marah itu miskom doang\nAbis dijelasin *${p.name}* langsung ketawa`,
    `Kamu duluan yang chat "udah yuk"\n*${p.name}* jawab "ihh dari tadi kemana aja"`,
    `*${p.name}* gengsi, tapi kamu yang ngalah duluan\nPoin +100 buat dewasa`,
    `Ngalah demi hubungan daripada ego\n*${p.name}* jadi makin sayang`,
    `Abis baikan langsung minta dicium\n*${p.name}* "ihh ga sekalian nikah"`,
    `5 menit abis marah udah nempel lagi\nKatanya benci, kelakuannya nempel 24 jam`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💕 *MOMEN BAIKAN*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💖 *Love*: +${getActivityLoveAmount(12)}\n`
  msg += `📈 *EXP*: +8`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === TALK ===
if (action === 'talk') {
  let err = cekLevel(p, 1, 'Talk')
  if(err) return m.reply(err)

  if(cekCD('talk', 900000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 15 menit`
  )

  applyActivityLove(p, 4)
  let up = addExp(p, 3)
  user.cooldown.talk = Date.now()
  saveDB(wdb)

  const judul = [
    '💬 NGOPI BARENG',
    '📱 CHAT AN RECEH',
    '🌙 TELFONAN',
    '😆 NGEGOSIP',
    '🎮 MABAR BARENG',
    '😏 FLIRTING',
    '📸 VC 5 MENIT',
    '🥰 KATA SAYANG',
    '💭 CURHAT MALAM'
  ]

  const isi = [
    `Nongkrong sama *${p.name}* sambil ngopi ${waktu.toLowerCase()}\nBahas hal ga penting sampe 1 jam`,
    `Chat an receh sama *${p.name}*\nDari "lagi apa" ujungnya debat mie kuah apa goreng`,
    `Telfonan sama *${p.name}* pas mau tidur\nUjungnya ketiduran bareng`,
    `Ngegossipin temen sama *${p.name}*\nAbis itu kompak "gapapa yang penting kita"`,
    `Mabar bareng *${p.name}*\nKamu yang feeder, dia yang gendong`,
    `*${p.name}* tiba-tiba bilang "kamu cakep"\nPadahal lagi pake baju tidur`,
    `VC cepet sama *${p.name}*\nKatanya cuma 5 menit, molor jadi 1 jam`,
    `*${p.name}* tiba-tiba spam "sayang sayang"\nPadahal ga ada angin ga ada hujan`,
    `Curhat malem sama *${p.name}*\nDari masalah hidup ujungnya "besok makan apa"`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💬 *MOMEN BERSAMA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💖 *Love*: +${getActivityLoveAmount(4)}\n`
  msg += `📈 *EXP*: +3`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}


// === KISS LV20 ===
if (action === 'kiss') {
  let err = cekLevel(p, 27, 'Kiss')
  if(err) return m.reply(err)

  if(cekCD('kiss', 14400000) > 0) return m.reply(
    `╭─❏「 ⏰ COOLDOWN 」❏\n` +
    `│ ⏰ *MASIH COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tunggu 4 jam`
  )

  applyActivityLove(p, 15)
  let up = addExp(p, 30)
  user.cooldown.kiss = Date.now()
  saveDB(wdb)

  const judul = [
    '💋 MOMEN MESRA','❤️ ROMANTIS','🥰 SAYANG',
    '💋 CIUMAN PANJANG', '😘 KECUP', '❤️‍🔥 NAKAL',
    '💋 KECUP NAKAL', '🥵 INTENS', '😏 GEMES'
  ]

  const isi = [
    `Momen romantis bareng *${p.name}* ${waktu.toLowerCase()}\nSaling tatap dan senyum`,
    `*${p.name}* kasih kejutan manis\nBikin hati kamu anget`,
    `Waktu berkualitas sama *${p.name}*\nPenuh kasih sayang`,
    `Ciuman lama sama *${p.name}* ${waktu.toLowerCase()}\nDi pipi, kening, terus bibir`,
    `*${p.name}* nyamperin terus minta dicium\nGa cukup sekali katanya`,
    `Momen mesra berdua sama *${p.name}*\nBisik "aku sayang kamu" abis itu`,
    `*${p.name}* tiba-tiba nyium leher kamu ${waktu.toLowerCase()}\nBikin merinding dan ketawa`,
    `Ciuman intens diem-diem sama *${p.name}*\nTakut ketahuan orang`,
    `*${p.name}* gigit bibir kamu pelan\nTerus bilang "nakal ya"`
  ]

  const judulRand = judul[Math.floor(Math.random() * judul.length)]
  const isiRand = isi[Math.floor(Math.random() * isi.length)]

  let msg = `╭─❏「 ${judulRand} 」❏\n`
  msg += `│ 💋 *MOMEN MESRA*\n`
  msg += `╰─━━━━━━━━━━━━━━─\n\n`
  msg += `${isiRand}\n\n`
  msg += `💌 *Love*: +${getActivityLoveAmount(15)}\n`
  msg += `📈 *EXP*: +30`

  if(up) msg += `\n🎉 *LEVEL UP!* Lv.${p.level}`

  msg += `\n\n─━━━━━━━━━━━━━━─`

  return m.reply(msg)
}

  // === STAYCATION LV10 ===
  if (action === 'staycation') {
    let err = cekLevel(p, 10, 'Staycation')
    if(err) return m.reply(err)
    if(cekCD('staycation', 21600000) > 0) return m.reply(`⏰ Staycation masih cooldown. Tunggu 6 jam.`)

    const biaya = 500000
    if (user.bank < biaya) return m.reply(`❌ Saldo bank tidak cukup. Butuh Rp ${biaya.toLocaleString()}.`)
    user.bank -= biaya
    applyActivityLove(p, 18)
    const up = addExp(p, 30)
    user.cooldown.staycation = Date.now()
    saveDB(wdb)
    const story = [
      `Kamu dan *${p.name}* menginap di hotel dengan pemandangan kota.`,
      `Seharian rebahan, pesan makanan, dan maraton film bersama *${p.name}*.`,
      `*${p.name}* menyiapkan kamar dengan lilin dan makanan favorit kalian.`,
      `Kamu dan *${p.name}* menikmati kolam renang hotel sampai malam.`,
      `Staycation sederhana berubah jadi kenangan manis bersama *${p.name}*.`
    ][Math.floor(Math.random() * 5)]
    return m.reply(
      `╭─❏「 🏨 STAYCATION 」❏\n│ 🏨 *QUALITY TIME*\n╰─━━━━━━━━━━━━━━─\n\n` +
      `${story}\n\n` +
      `💰 *Uang*: -Rp ${biaya.toLocaleString()}\n` +
      `💌 *Love*: +${getActivityLoveAmount(18)}\n📈 *EXP*: +30\n` +
      `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}\n─━━━━━━━━━━━━━━─`
    )
  }

  // === RAMPOK LV20 ===
  if (action === 'rampok') {
    let err = cekLevel(p, 20, 'Rampok')
    if(err) return m.reply(err)
    if(cekCD('rampok', 21600000) > 0) return m.reply(`⏰ Rampok masih cooldown. Tunggu 6 jam.`)

    let hasil = Math.floor(Math.random() * 75001) + 25000
    hasil = scaleDifficultyIncome(user, hasil)
    user.bank += hasil
    applyActivityLove(p, -5)
    const up = addExp(p, 20)
    user.cooldown.rampok = Date.now()
    saveDB(wdb)
    const story = [
      `Kamu mengambil dompet *${p.name}* saat ia sedang lengah.`,
      `*${p.name}* kaget ketika uang jajannya tiba-tiba berpindah ke tanganmu.`,
      `Kamu menjalankan aksi nekat dan berhasil membawa kabur uang *${p.name}*.`,
      `Rencana rahasiamu berhasil, meski *${p.name}* mulai memasang wajah curiga.`,
      `Kamu merampok uang *${p.name}* lalu pura-pura tidak tahu apa-apa.`
    ][Math.floor(Math.random() * 5)]
    return m.reply(
      `╭─❏「 🦹 RAMPOK 」❏\n│ 🦹 *AKSI BERHASIL*\n╰─━━━━━━━━━━━━━━─\n\n` +
      `${story}\n\n` +
      `💰 *Uang*: +Rp ${hasil.toLocaleString()}\n💔 *Love*: -5\n📈 *EXP*: +20\n` +
      `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}\n─━━━━━━━━━━━━━━─`
    )
  }

  // === NONTON LV20 ===
  if (action === 'nonton') {
    let err = cekLevel(p, 20, 'Nonton')
    if(err) return m.reply(err)
    if(cekCD('nonton', 10800000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 3 jam\n╰─━━━━━━━━━━━━━━─`)
    applyActivityLove(p, 12)
    let up = addExp(p, 18)
    user.cooldown.nonton = Date.now()
    saveDB(wdb)

    const judul = ['🎬 NONTON BARENG','🍿 MOVIE DATE','📺 MARATON FILM','🌃 BIOSKOP ROMANTIS']
    const isi = [
      `Nonton ${['Anime','Horror','Romance','Action','Komedi'][Math.floor(Math.random()*5)]} sama *${p.name}*\nKalian ketawa bareng terus`,
      `*${p.name}* nyender pas nonton ${waktu.toLowerCase()}\nFilmnya seru, suasana makin enak`,
      `Maraton film bareng *${p.name}*\nBeli popcorn 2 ember 😂`,
      `*${p.name}* nutup mata pas scene serem\nTerus pegang tangan kamu`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(
      `╭─❏「 ${judulRand} 」❏\n` +
      `│ 🍿 *MOMEN NONTON*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${isiRand}\n\n` +
      `💌 *Love* : +${getActivityLoveAmount(12)}\n` +
      `📈 *EXP* : +18\n` +
      `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
      `\n─━━━━━━━━━━━━━━─`
    )
  }

  // === SWIM LV60 ===
  if (action === 'swim') {
    let err = cekLevel(p, 20, 'Swim')
    if(err) return m.reply(err)
    if(cekCD('swim', 14400000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 4 jam\n╰─━━━━━━━━━━━━━━─`)
    applyActivityLove(p, 20)
    let up = addExp(p, 50)
    user.cooldown.swim = Date.now()
    saveDB(wdb)

    const judul = ['🏊 RENANG BARENG','🌊 PANTAI ROMANTIS','☀️ LIBURAN BERDUA']
    const isi = [
      `Renang bareng *${p.name}* di pantai ${waktu.toLowerCase()}\nSaling cipratin air terus ketawa`,
      `*${p.name}* ngajarin kamu renang\nPegangannya erat banget`,
      `Main pasir sama *${p.name}*\nBikin istana pasir terus foto-foto`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(
      `╭─❏「 ${judulRand} 」❏\n` +
      `│ 🌊 *MOMEN BARENG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${isiRand}\n\n` +
      `💌 *Love* : +${getActivityLoveAmount(20)}\n` +
      `📈 *EXP* : +50\n` +
      `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
      `\n─━━━━━━━━━━━━━━─`
    )
  }

  // === BELI CINCIN ===
  if (action === 'belicincin') {
    let no = parseInt(args[1]) - 1
    let jenis = args[2]?.toLowerCase()
    if(isNaN(no) ||!user.harem[no]) return m.reply(`╭─❏「 ❌ SALAH 」❏\n\nContoh: ${usedPrefix}rship belicincin 1 gold\n╰─━━━━━━━━━━━━━━─`)
    let p = user.harem[no]
    if(p.menikah) return m.reply(`╭─❏「 ❌ UDAH 」❏\n\nUdah nikah\n╰─━━━━━━━━━━━━━━─`)

    const ring = CINCIN_SHOP[jenis]
    if (!ring) return m.reply(`Pilih jenis cincin dari ${usedPrefix}rship cincin.`)
    if (user.bank < ring.price) return m.reply(`╭─❏「 ❌ BANK 」❏\n\nButuh Rp ${ring.price.toLocaleString('id-ID')} di bank RPG.\n╰─━━━━━━━━━━━━━━─`)

    user.bank -= ring.price
    p.cincin = ring.name
    saveDB(wdb)

    return m.reply(
      `╭─❏「 💎 BELI CINCIN 」❏\n` +
      `│ 💍 *Pembelian Berhasil*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Berhasil beli ${ring.icon} ${ring.name} untuk ${p.name}\n\n` +
      `💰 *Bank RPG* : -Rp ${ring.price.toLocaleString('id-ID')}\n` +
      `💍 *Cincin* : ${ring.icon} ${ring.name}\n\n` +
      `Sekarang bisa nikah\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  // === NIKAH LV40 HARUS PAKE CINCIN ===
  if (action === 'nikah') {
    let err = cekLevel(p, 40, 'Nikah')
    if(err) return m.reply(err)
    if (p.menikah) return m.reply(`╭─❏「 ❌ UDAH 」❏\n\nUdah nikah\n╰─━━━━━━━━━━━━━━─`)
    if (!p.cincin) return m.reply(`╭─❏「 ❌ CINCIN 」❏\n\nBeli cincin dulu:.rship cincin lalu .rship belicincin ${no + 1} <jenis>\n╰─━━━━━━━━━━━━━━─`)
    if (p.love < 90) return m.reply(`╭─❏「 ❌ LOVE 」❏\n\nLove ${p.love}%. Minimal 90%\n╰─━━━━━━━━━━━━━━─`)
    p.menikah = true
    user.dateStats.totalNikah++
    saveDB(wdb)

    return m.reply(
      `╭─❏「 💍 NIKAH 」❏\n` +
      `│ 💕 *PERNIKAHAN BERHASIL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Selamat menikah dengan ${p.name}!\n\n` +
      `💍 *Cincin* : ${p.cincin}\n` +
      `💕 *Status* : Sekarang jadi Suami/Istri\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  // === WOHOO LV40 ===
  if (action === 'wohoo') {
    let err = cekLevel(p, 40, 'Wohoo')
    if(err) return m.reply(err)
    if(cekCD('wohoo', 21600000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 6 jam\n╰─━━━━━━━━━━━━━━─`)
    applyActivityLove(p, 25)
    let up = addExp(p, 60)
    user.dateStats.wohoo++
    user.cooldown.wohoo = Date.now()
    saveDB(wdb)

    const judul = ['🌙 MALAM ROMANTIS','💞 QUALITY TIME','✨ WAKTU BERDUA','🔥 MOMEN PANAS','💋 PRIVAT TIME']
    const isi = [
      `Waktu berdua sama *${p.name}*\nNonton, makan, dan ngobrol santai`,
      `Cuma berdua di kamar, lampu redup`,
      `*${p.name}* manja banget malem ini\nBisik-bisik dan ketawa kecil`,
      `Quality time berdua sama *${p.name}*\nGaada yg ganggu, full perhatian`
    ]
    const judulRand = judul[Math.floor(Math.random() * judul.length)]
    const isiRand = isi[Math.floor(Math.random() * isi.length)]

    return m.reply(
      `╭─❏「 ${judulRand} 」❏\n` +
      `│ 💞 *MOMEN BERDUA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${isiRand}\n\n` +
      `💌 *Love* : +${getActivityLoveAmount(25)}\n` +
      `📈 *EXP* : +60\n` +
      `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
      `\n─━━━━━━━━━━━━━━─`
    )
  }

  // === ANAK LV40 ===
  if (action === 'anak') {
    let err = cekLevel(p, 50, 'Anak')
    if(err) return m.reply(err)
    if (!p.menikah) return m.reply(`╭─❏「 ❌ NIKAH 」❏\n\nHarus nikah dulu\n╰─━━━━━━━━━━━━━━─`)
    if (p.love < 70) return m.reply(`╭─❏「 ❌ LOVE 」❏\n\nLove minimal 90%\n╰─━━━━━━━━━━━━━━─`)
    if(cekCD('anak', 86400000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 24 jam\n╰─━━━━━━━━━━━━━━─`)
    let jenis = Math.random() < 0.5? 'Laki-laki' : 'Perempuan'
    let namaAnak = args.slice(2).join(' ') || `Bayi ${p.name}`
    user.kids.push({ nama: namaAnak, jenis, umur: 0, careCount: 0, ortu: p.name })
    addExp(p, 40)
    user.cooldown.anak = Date.now()
    saveDB(wdb)

    return m.reply(
      `╭─❏「 👶 ANAK 」❏\n` +
      `│ 👶 *KELUARGA BERTAMBAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Kamu dan ${p.name} punya anak!\n\n` +
      `${getGenderEmoji(jenis === 'Laki-laki'? 'cowok' : 'cewek')} ${namaAnak} - ${jenis}\n` +
      `📈 *EXP* : +40\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  // === DUEL LV80 ===
  if (action === 'duel') {
    let err = cekLevel(p, 1, 'Duel')
    if(err) return m.reply(err)
    if(cekCD('duel', 21600000) > 0) return m.reply(`╭─❏「 ⏰ COOLDOWN 」❏\n\nTunggu 6 jam\n╰─━━━━━━━━━━━━━━─`)
    let win = Math.random() < 0.5
    user.cooldown.duel = Date.now()

    if(win){
      let up = addExp(p, 40)
      p.love = Math.max(0, p.love - 5)
      user.dateStats.duelWin++
      saveDB(wdb)

      return m.reply(
        `╭─❏「 ⚔️ DUEL RELATIONSHIP 」❏\n` +
        `│ 🏆 *KAMU MENANG!*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Kamu berhasil mengalahkan *${p.name}* dalam duel.\n\n` +
        `🥺 *${p.name}* : "Ih kamu tega banget ngalahin aku!"\n\n` +
        `💔 *Love* : -5\n` +
        `📈 *EXP* : +40\n` +
        `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
        `\n─━━━━━━━━━━━━━━─`
      )
    } else {
      let hadiah = Math.floor(Math.random() * 50000) + 25000
      hadiah = scaleDifficultyIncome(user, hadiah)
      user.bank += hadiah
      applyActivityLove(p, 15)
      let up = addExp(p, 60)
      saveDB(wdb)

      return m.reply(
        `╭─❏「 ⚔️ DUEL RELATIONSHIP 」❏\n` +
        `│ 🎉 *${p.name.toUpperCase()} MENANG!*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `*${p.name}* berhasil mengalahkanmu dalam duel.\n\n` +
        `😆 *${p.name}* : "Horeee! Aku lebih kuat dari kamu!" (Bangga & Senang)\n\n` +
        `💖 *Love* : +${getActivityLoveAmount(15)}\n` +
        `📈 *EXP* : +60\n` +
        `💰 *Hadiah* : +Rp ${hadiah.toLocaleString()}\n` +
        `${up ? `🎉 *LEVEL UP!* Lv.${p.level}\n` : ''}` +
        `\n─━━━━━━━━━━━━━━─`
      )
    }
  }
  
    // === DETAIL PASANGAN ===
  if (action === 'detail') {
    let no = parseInt(args[1]) - 1
    if(isNaN(no) ||!user.harem[no]) return m.reply(`╭─❏「 ❌ SALAH 」❏\n\nContoh:.rship detail 1\n╰─━━━━━━━━━━━━━━─`)
    let p = user.harem[no]
    if (applyPartnerExp(p, 0)) await saveDB(wdb)
    let need = (p.level || 1) * 200

    let cap = `╭─❏「 📋 DETAIL ${p.name.toUpperCase()} 」❏\n`
    cap += `│ ${getGenderEmoji(p.gender)} *${p.name}*\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `> ↳ 📊 Level : Lv.${p.level} ${getTitle(p.level, p.customTitle)}\n`
    cap += `> ↳ 📈 EXP : ${p.exp || 0}/${need}\n`
    cap += `> ↳ 💌 Love : ${p.love}% ${bar(p.love)}\n`
    cap += `> ↳ 😊 Mood : ${getMood(p.love)}\n`
    cap += `> ↳ 💍 Status : ${p.menikah ? 'Menikah' : 'Pacaran'}\n`
    cap += `> ↳ 💎 Cincin : ${p.cincin ? `${getRingIcon(p.cincin)} ${normalizeRingName(p.cincin)}` : 'Belum ada'}\n\n`
    cap += `🛍️ *Beli cincin*\n`
    cap += `> ↳ ${usedPrefix}rship cincin\n`
    cap += `> ↳ ${usedPrefix}rship belicincin ${no + 1} <silver|gold|topaz|amethyst|ruby|sapphire|emerald|platinum|diamond|jade>`
    cap += `\n\n─━━━━━━━━━━━━━━─`

    return m.reply(cap)
  }

}

handler.help = ['rship', 'rship command', 'rship cd', 'rship lamar <nama> <gender> <mahar>', 'rship kid info', 'rship child info', 'rship kid guide', 'rship child guide', 'kidcare', 'childcare', 'rship kid adopt [list|<no>|yes|no]', 'rship kid adopt <no-anak> @user <biaya>', 'rship kid rename custody <no-anak> <nama>', 'rship kid return <no-anak>', 'rship anak adopsi <no-anak> @user <biaya>', 'rship anak asuh terima/tolak', 'rship all <no pasangan/all>', 'rship urus <pasangan/all> <anak/all>', 'rship mantan list', 'rship makam list', 'rship shelter list', 'rship shelter retrieve <no>', 'rship exspouse/ex', 'rship cerai/divorce <no>', 'rship custody <tipe> <anak> [@user]', 'rship balikan <no>', 'rship makam', 'rship revive <no>']
handler.tags = ['rpg']
handler.command = ['rship', 'rsh', 'kidcare', 'childcare']
handler.group = true
export default handler