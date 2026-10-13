import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { isPremiumUser } from './rpg-bank.js'
import { CINCIN_SHOP, getRingIcon, normalizeRingName } from '../../lib/pasanganHelper.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { registerPrisoner } from '../../lib/prisonHelper.js'
import {
  CHILD_ACTIVITIES,
  CHILD_FACILITIES,
  CHILD_LOSS_STORIES,
  CHILD_NEGLECT,
  CHILD_RUNAWAY_STORIES,
  CHILD_STAGES,
  RSHIP_COOLDOWN_NAMES as cooldownNames,
  RSHIP_GIFT_LIST as GIFT_LIST,
  RSHIP_ACTIVITY_COOLDOWNS as activityCooldowns,
  RSHIP_BATCH_ACTIVITY_RULES as batchActivityRules
} from '../../lib/rpgRshipData.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.money) wdb.money = {}
  let uData = getUserRPG(wdb, m.sender)
  let user = wdb.users[m.sender]?.rpg || uData?.rpg || uData
  if (!user) return m.reply(`╭─❏「 ❌ ERROR 」❏\n├ Ketik .adventure dulu buat daftar RPG.\n╰─━━━━━━━━━━━━━━─`)
  if (user.bank === undefined) user.bank = 0
  if (!wdb.users[m.sender]) wdb.users[m.sender] = { rpg: user }
  if (!wdb.users[m.sender].rpg) wdb.users[m.sender].rpg = user

  if (!user.harem) user.harem = []
  if (!user.ex) user.ex = []
  if (!user.graveyard) user.graveyard = []
  if (!user.kids) user.kids = []
  if (!user.cooldown) user.cooldown = {}
  if (!user.dateStats) user.dateStats = { totalDate: 0, totalNikah: 0, selingkuh: 0, kill: 0, duelWin: 0, urusAnak: 0, wohoo: 0 }


  let args = text ? text.trim().split(/\s+/) : []
  let action = args[0]?.toLowerCase()
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

  const initializeChildState = child => {
    if (child.lastCaredAt == null || !Number.isFinite(Number(child.lastCaredAt))) {
      child.lastCaredAt = now
      childStateChanged = true
    }
    if (!child.activityCooldowns || typeof child.activityCooldowns !== 'object') {
      child.activityCooldowns = {}
      childStateChanged = true
    }
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
    const adult = careCount >= CHILD_STAGES[CHILD_STAGES.length - 1].care
    const young = stage === CHILD_STAGES[0] || stage === CHILD_STAGES[1]
    if (!adult && !young) continue

    const eligibleAt = Number(child.lastCaredAt) + (adult ? CHILD_NEGLECT.gracePeriod : 0)
    const checkedAt = Number(child.lastNeglectCheckAt) || eligibleAt
    if (now < eligibleAt + CHILD_NEGLECT.checkPeriod || now < checkedAt + CHILD_NEGLECT.checkPeriod) continue
    const elapsedPeriods = Math.floor((now - Math.max(eligibleAt, checkedAt)) / CHILD_NEGLECT.checkPeriod)
    if (elapsedPeriods < 1) continue
    child.lastNeglectCheckAt = Math.max(eligibleAt, checkedAt) + elapsedPeriods * CHILD_NEGLECT.checkPeriod
    childStateChanged = true

    const chance = adult ? CHILD_NEGLECT.adultEscapeChance : CHILD_NEGLECT.youngChildLossChance
    if (Math.random() >= 1 - Math.pow(1 - chance, elapsedPeriods)) continue

    user.kids.splice(index, 1)
    if (!adult) {
      const story = CHILD_LOSS_STORIES[Math.floor(Math.random() * CHILD_LOSS_STORIES.length)]
      childEvents.push(
        `╭─❏「 💔 ANAK HILANG 」❏\n` +
        `│ 👶 STATUS ANAK\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ *${child.nama} hilang.*\n` +
        `> ${story}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
      childStateChanged = true
      continue
    }

    const story = CHILD_RUNAWAY_STORIES[Math.floor(Math.random() * CHILD_RUNAWAY_STORIES.length)]
    const alreadyImprisoned = user.penjara && now - Number(user.penjara) < (Number(user.lamaPenjara) || 0)
    if (!alreadyImprisoned) {
      user.penjara = now
      user.lamaPenjara = 2 * 60 * 60 * 1000
      user.tebusan = 2000000
      user.kasus = '🚔 Penelantaran anak'
      user.sel = registerPrisoner(wdb, m.sender)
    }
    if (!Array.isArray(user.riwayat)) user.riwayat = []
    user.riwayat.unshift(`🚔 Anak dewasa ${child.nama} melaporkan penelantaran`)
    childEvents.push(
      `╭─❏「 🚨 ANAK KABUR 」❏\n` +
      `│ 👶 LAPORAN PENELANTARAN ANAK\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *${child.nama} kabur dari rumah.*\n` +
      `> ${story}\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `🚔 *STATUS HUKUM*\n\n` +
      `> ↳ ${alreadyImprisoned ? 'Kasus ini tercatat saat kamu sedang menjalani hukuman.' : user.sel ? `Kamu dipenjara 2 jam di sel ${user.sel} atas kasus penelantaran anak.\n> ↳ Tebusan: Rp 2.000.000.` : 'Pihak berwenang memproses laporan; perlindungan yang aktif mencegah penahanan.'}\n\n` +
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

  const cekCD = (key, durasi) => {
    const legacyKeys = Object.keys(user.cooldown).filter(storedKey => storedKey.startsWith(key) && /^\d+$/.test(storedKey.slice(key.length)))
    const last = Math.max(0, ...[key, ...legacyKeys].map(storedKey => Number(user.cooldown[storedKey]) || 0))
    let sisa = scaleDifficultyCooldown(user, durasi) - (Date.now() - last)
    return sisa > 0 ? Math.ceil(sisa / 1000) : 0
  }

  const addExp = (partner, amount) => {
    const eventMultiplier = (isRpgEventActive('love_season') ? 1.5 : 1) *
      (isRpgEventActive('cold_war') ? 0.7 : 1)
    partner.exp = (Number(partner.exp) || 0) + Math.floor(amount * eventMultiplier)
    const needed = (Number(partner.level) || 1) * 200
    if (partner.exp < needed) return false
    partner.exp -= needed
    partner.level = (Number(partner.level) || 1) + 1
    partner.love = Math.min(100, (Number(partner.love) || 0) + 5)
    partner.waitTitleUp = true
    return true
  }

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

─━━━━━━━━━━━━━━─`

    return m.reply(cap)
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

💕 *DASAR*
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

─━━━━━━━━━━━━━━─

🎭 *AKTIVITAS PASANGAN*
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

💍 *KELUARGA & HADIAH*
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

💔 *LAINNYA*
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

─━━━━━━━━━━━━━━─`

    return m.reply(cap)
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
  let cap = `╭─❏「 🎁 DAFTAR 50 HADIAH 」❏\n`
  cap += `│ 🎁 *DAFTAR HADIAH*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `💝 *50 HADIAH UNTUK PASANGAN*\n`
  cap += `> ↳ Hadiah memakai saldo bank dan menaikkan Love pasangan.\n\n`

  GIFT_LIST.forEach((g, i) => {
    cap += `*${i + 1}. ${g.desc} ${g.emoji}*\n`
    cap += `> ↳ Buy: Rp ${g.harga.toLocaleString()}\n`
    cap += `> ↳ XP: +${g.exp.toLocaleString()}\n`
    cap += `> ↳ Love: +${g.love}\n\n`
  })

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `📌 *CARA PAKAI*\n`
  cap += `> ↳ Item: ${usedPrefix}rship gift item 5 2\n`
  cap += `> ↳ Nama: ${usedPrefix}rship gift item baju 1\n`
  cap += `> ↳ Uang: ${usedPrefix}rship gift money 50000000 1\n\n`

  cap += `─━━━━━━━━━━━━━━─`

  return m.reply(cap)
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
> ↳ Moveout: ${usedPrefix}rship kid moveout <pasangan> <anak>

─━━━━━━━━━━━━━━─

⚖️ *HAK ASUH SETELAH BERPISAH*
> ↳ Joint: semua anak tetap diasuh bersama.
> ↳ Sole: pilih anak yang kamu asuh; sisanya diasuh mantan (atau panti jika kill).
> ↳ Foster: tag pemain lain; anak pindah hanya setelah dia menerima.
> ↳ Spouse: semua anak diasuh mantan pasangan; tidak tersedia saat kill.
> ↳ Orphaned: anak pilihan masuk daftar panti asuhan.
> ↳ Format: ${usedPrefix}rship custody <tipe> <all|1,2> [@user]
> ↳ Anak asuh foster/hak asuh mandiri: ${usedPrefix}rship kid <aktivitas> custody <anak>

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
> ↳ Menjalankan seluruh 9 aktivitas sekaligus.

─━━━━━━━━━━━━━━─

✏️ *PENGELOLAAN ANAK*
> ↳ ${usedPrefix}rship kid rename <pasangan> <anak> <nama baru>
> ↳ ${usedPrefix}rship kid moveout <pasangan> <anak>
> ↳ Moveout hanya berlaku untuk anak dewasa dan memerlukan konfirmasi.

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
      : independentKids.filter((_, childIndex) => childIndex === Number(childSelector) - 1)
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
if (action === 'urus') args = ['kid', 'urus', ...args.slice(1)]
const kidSubcommand = action === 'kid' || action === 'urus' ||
  (action === 'anak' && args[1] &&
    !['adopsi', 'jual', 'jualanak', 'buang', 'buanganak', 'bunuh', 'bunuhanak'].includes(args[1].toLowerCase()) &&
    !/^\d+$/.test(args[1]))


if (kidSubcommand) {
  const sub = args[1]?.toLowerCase()
  const confirmationWord = args[2]?.toLowerCase()
  const facilityType = facilityAliases[sub]

  if (!sub || ['guide', 'panduan'].includes(sub)) return m.reply(kidGuide())
  if (['command', 'commands', 'cmd'].includes(sub)) return m.reply(kidCommandGuide())
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
      const parentIndex = user.harem.findIndex(partner => partner.name === child.ortu)
      const partnerChildIndex = user.kids.filter(entry => entry.ortu === child.ortu).indexOf(child) + 1
      const careCount = getChildCareCount(child)
      const facility = child.facility ? ` • 🏠 ${CHILD_FACILITIES[child.facility.type]?.label || child.facility.type}` : ''
      const custody = child.custody?.type
        ? ` • ⚖️ Hak asuh ${child.custody.type}${child.custody.custodianName ? ` (${child.custody.custodianName})` : ''}`
        : ''
      const originalParents = Array.isArray(child.biologicalParents) && child.biologicalParents.length
        ? `\n> ↳ Orang tua kandung: ${child.biologicalParents.join(' & ')}`
        : ''
      return `*${index + 1}. ${getGenderEmoji(child.jenis === 'Laki-laki' ? 'cowok' : 'cewek')} ${child.nama}*\n` +
        `> ↳ ${parentIndex >= 0 ? `Pasangan ${parentIndex + 1}` : 'Orang tua'}: ${child.ortu}\n` +
        `> ↳ Anak ke-${partnerChildIndex} • ${getChildStage(careCount).name}${facility}${custody}\n` +
        `> ↳ Asuhan: ${getChildProgress(careCount)}${originalParents}`
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
    target.child.nama = newName
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 ✅ NAMA ANAK DIPERBARUI 」❏\n` +
      `│ ✏️ PERUBAHAN NAMA BERHASIL\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> 👤 Pasangan: ${target.partner.name}\n` +
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
  if (!eligible.length) return m.reply(
    `╭─❏「 ⚠️ ANAK TIDAK TERSEDIA 」❏
│ 👶 STATUS PENGASUHAN
╰─━━━━━━━━━━━━━━─

Tidak ada anak yang dapat melakukan aktivitas saat ini.

─━━━━━━━━━━━━━━─

📌 *KETERANGAN*
> ↳ Anak mungkin sudah dewasa, sedang berada di daycare, atau aktivitasnya masih cooldown.

─━━━━━━━━━━━━━━─`
  )
  if (eligible.length !== targets.length) {
    const unavailable = targets.length - eligible.length
    if (!isBatchCare && args[3]?.toLowerCase() !== 'all') return m.reply(
      `╭─❏「 ⚠️ AKTIVITAS BELUM TERSEDIA 」❏
│ 👶 STATUS AKTIVITAS
╰─━━━━━━━━━━━━━━─

Anak sedang tidak tersedia atau aktivitasnya masih cooldown.

─━━━━━━━━━━━━━━─`
    )
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
    const childStories = []
    for (const [name, rule] of actions) {
      child.activityCooldowns[name] = now
      child.love = Math.min(100, (Number(child.love) || 0) + rule.love)
      if (target.partnerIndex >= 0) {
        const previousUps = levelUps.get(partner.name) || 0
        if (addExp(partner, rule.exp)) levelUps.set(partner.name, previousUps + 1)
      }
      childStories.push(`${rule.emoji} ${rule.label}`)
    }
    child.careCount = getChildCareCount(child) + 1
    child.umur = child.careCount / 10
    child.lastKidActivityAt = now
    child.lastCaredAt = now
    child.lastNeglectCheckAt = now
    user.dateStats.urusAnak = (Number(user.dateStats.urusAnak) || 0) + 1
    completed.push(`*${child.nama}* (${partner.name}): ${childStories.join(', ')}`)
  }
  await saveDB(wdb)
  const totalUps = [...levelUps.values()].reduce((sum, value) => sum + value, 0)
  const costLine = totalCost ? `\n> ↳ Biaya: -Rp ${totalCost.toLocaleString('id-ID')}` : ''
  const levelLine = totalUps ? `\n> ↳ Level pasangan naik ${totalUps} kali` : ''
  return m.reply(
    `╭─❏「 👶 PENGASUHAN ANAK 」❏
│ ${isBatchCare ? '✨ SEMUA AKTIVITAS PENGASUHAN' : `💗 ${activity.label.toUpperCase()}`}
╰─━━━━━━━━━━━━━━─

> ${isBatchCare ? '✅ Semua 9 aktivitas pengasuhan selesai.' : `✅ Aktivitas ${activity.label} selesai.`}

${completed.join('\n')}${costLine}${levelLine}

─━━━━━━━━━━━━━━─

⏳ *WAKTU COOLDOWN*
> ↳ ${isBatchCare ? 'Cooldown pengasuhan anak: 4 jam.' : `Cooldown pengasuhan: ${formatRemaining(CHILD_NEGLECT.careCooldown / 1000)}.`}

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

📌 *ALTERNATIF*
> ↳ ${usedPrefix}rship anak adopsi <no>
> ↳ Pengalihan pengasuhan memerlukan konfirmasi dan mengurangi love pasangan.

─━━━━━━━━━━━━━━─`
  )
}

if (action === 'anak' && args[1]?.toLowerCase() === 'adopsi') {
  const answer = args[2]?.toLowerCase()
  const pending = user.pendingChildAdoption
  if (['yes', 'ya', 'iya'].includes(answer)) {
    if (!pending || Date.now() - Number(pending.createdAt || 0) > 5 * 60 * 1000) {
      delete user.pendingChildAdoption
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 ❌ KONFIRMASI KEDALUWARSA 」❏\n` +
        `│ Konfirmasi pengalihan pengasuhan tidak ditemukan atau sudah kedaluwarsa.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }
    const child = user.kids[pending.index]
    if (!child || child.nama !== pending.name) {
      delete user.pendingChildAdoption
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 ❌ DATA ANAK BERUBAH 」❏\n` +
        `│ Pengalihan pengasuhan dibatalkan karena data anak tidak lagi sesuai.\n` +
        `╰─━━━━━━━━━━━━━━─`
      )
    }
    user.kids.splice(pending.index, 1)
    const parent = user.harem.find(partner => partner.name === child.ortu)
    if (parent) parent.love = Math.max(0, (Number(parent.love) || 0) - 50)
    delete user.pendingChildAdoption
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 👶 PENGASUHAN ANAK 」❏\n` +
      `│ ✅ PENGASUHAN DIALIHKAN\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> 👶 Anak: ${child.nama}\n` +
      `> ↳ Telah dialihkan ke keluarga yang siap mengasuh.\n` +
      `${parent ? `> 💗 Love ${parent.name} berkurang 50 (${parent.love}/100).\n` : ''}\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  if (['no', 'tidak', 'batal', 'cancel'].includes(answer)) {
    if (pending) delete user.pendingChildAdoption
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 ❌ PENGALIHAN DIBATALKAN 」❏\n` +
      `│ Konfirmasi pengalihan pengasuhan berhasil dibatalkan.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }
  const index = Number(args[2]) - 1
  const child = user.kids[index]
  if (!child) return m.reply(
    `╭─❏「 ❌ ANAK TIDAK DITEMUKAN 」❏\n` +
    `│ Periksa kembali nomor anak yang dipilih.\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *DAFTAR ANAK*\n` +
    `> ↳ ${usedPrefix}rship kid info`
  )
  if (pending && Date.now() - Number(pending.createdAt || 0) <= 5 * 60 * 1000) {
    return m.reply(
      `╭─❏「 ⚠️ KONFIRMASI MASIH AKTIF 」❏\n` +
      `│ Selesaikan konfirmasi pengasuhan yang sebelumnya.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ✅ ${usedPrefix}rship anak adopsi yes\n` +
      `> ↳ Setujui pengalihan pengasuhan.\n` +
      `> ❌ ${usedPrefix}rship anak adopsi no\n` +
      `> ↳ Batalkan pengalihan pengasuhan.`
    )
  }
  user.pendingChildAdoption = { index, name: child.nama, createdAt: Date.now() }
  await saveDB(wdb)
  return m.reply(
    `╭─❏「 ⚠️ KONFIRMASI PENGASUHAN 」❏\n` +
    `│ 👶 *${child.nama}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Apakah kamu ingin mengalihkan pengasuhan anak ini ke keluarga lain?\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `📊 *DAMPAK PENGALIHAN*\n` +
    `> ↳ Love pasangan ${child.ortu} akan berkurang 50.\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `📌 *KONFIRMASI*\n` +
    `> ✅ ${usedPrefix}rship anak adopsi yes\n` +
    `> ↳ Setujui pengalihan pengasuhan.\n` +
    `> ❌ ${usedPrefix}rship anak adopsi no\n` +
    `> ↳ Batalkan pengalihan pengasuhan (batas 5 menit).`
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
    if (addExp(partner, rule.exp)) levelUps++
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
    .map(([name, activities]) => `> ↳ *${name}*: ${activities.join(', ')}`)
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

  // MODE LIST:.rship gift list
  if(tipe === 'list'){
    let cap = `╭─❏「 🎁 DAFTAR 50 HADIAH 」❏\n`
    cap += `│ 🎁 *DAFTAR HADIAH*\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    GIFT_LIST.forEach((g, i) => {
      cap += `*${g.emoji} ${i+1}. ${g.desc}*\n`
      cap += `> ↳ Harga: Rp ${g.harga.toLocaleString()}\n`
      cap += `> ↳ EXP: ${g.exp.toLocaleString()}\n\n`
    })

    cap += `─━━━━━━━━━━━━━━─\n\n`
    cap += `📌 *CARA PAKAI*\n`
    cap += `> ↳ Item: .rship gift item 5 2\n`
    cap += `> ↳ Nama: .rship gift item baju 1\n`
    cap += `> ↳ Uang: .rship gift money 50000000\n\n`
    cap += `📌 *TARGET PASANGAN*\n`
    cap += `> ↳ Nomor: .rship gift 2 item 5 1\n`
    cap += `> ↳ Nama: .rship gift NamaPasangan item baju 1\n\n`
    cap += `─━━━━━━━━━━━━━━─`

    return m.reply(cap)
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

    let exp = Math.floor(jumlah / 1000)
    let love = Math.min(100, Math.floor(jumlah / 10000000))
    let cooldown = scaleDifficultyCooldown(user, Math.min(86400000, Math.floor(jumlah / 100000) * 60000))

    user.bank -= jumlah
    p.love = Math.min(100, p.love + love)
    p.exp = (p.exp || 0) + exp
    let up = false
    let need = p.level * 500
    if(p.exp >= need){ p.exp -= need; p.level++; up = true }

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

    user.bank -= totalHarga
    p.love = Math.min(100, p.love + totalLove)
    p.exp = (p.exp || 0) + totalExp
    let up = false
    let need = p.level * 500
    if(p.exp >= need){ p.exp -= need; p.level++; up = true }

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

handler.help = ['rship', 'rship command', 'rship lamar <nama> <gender> <mahar>', 'rship kid info', 'rship kid guide', 'rship kid command', 'rship all <no pasangan/all>', 'rship urus <pasangan/all> <anak/all>', 'rship mantan/ex/exspouse', 'rship cerai/divorce <no>', 'rship custody <tipe> <anak> [@user]', 'rship balikan <no>', 'rship makam', 'rship revive <no>']
handler.tags = ['rpg']
handler.command = ['rship']
handler.group = true
export default handler