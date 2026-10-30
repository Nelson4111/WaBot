import { addRpgMoney } from '../../lib/rpgMoney.js'
import { addRpgExp, getUserRPG, initLadang, loadDB, saveDB } from '../../lib/waifuHelper.js'
import {
  formatCropWiltedAppreciation,
  getCropReadyDuration,
  removeWiltedCrops
} from '../../lib/rpgFarming.js'
import { scaleDifficultyCooldown, scaleDifficultyHarvest, scaleDifficultyIncome, scaleDifficultyXP } from '../../lib/rpgDifficulty.js'
import { applyBloodlineBuff, applyBloodlineYield } from '../../lib/rpgCharacterData.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { sendRpgButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { getGroupTotemBuff } from '../../lib/rpg-totemData.js'
import {
  dapatkanHasil,
  getHasilDisplay,
  getHewan,
  migrateHasilTernakInventory
} from '../../lib/rpg-libternakData.js'
import { bibit } from './rpg-panen.js'
import { attemptRpgIllegalAction, formatRpgIllegalResult, saveFailedRpgIllegalAction } from '../../lib/rpgIlegal.js'

function formatName(value) {
  return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

function addExperience(user, amount) {
  return addRpgExp(user, amount)
}

const handler = async (m, { conn, command, text, usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const args = String(text || '').trim().toLowerCase().split(/\s+/).filter(Boolean)
  const illegalText = args[0] === 'ilegal' ? args[0] : ''
  const isFarmCommand = command?.toLowerCase() === 'farm'
  const isGuide = isFarmCommand && ['guide', 'panduan'].includes(args[0])
  const isCommandList = isFarmCommand && (
    args.length === 0 || ['command', 'commands', 'cmd', 'menu'].includes(args[0])
  )

  if (isCommandList) {
    return m.reply(
      `╭─❏「 📋 FARM COMMAND 」❏\n` +
      `│ 🌾 FARM & KEBUN\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ${prefix}farm guide\n` +
      `> ${prefix}farm command\n` +
      `> ${prefix}farming\n` +
      `> ${prefix}farm collect\n` +
      `> ${prefix}farming ilegal\n` +
      `> ${prefix}tanam <bibit>\n` +
      `> ${prefix}tanam list\n` +
      `> ${prefix}tanam guide\n` +
      `> ${prefix}tanam command\n` +
      `> ${prefix}tanam <bibit> ulang <jumlah>\n` +
      `> ${prefix}ladang\n` +
      `> ${prefix}panen\n` +
      `> ${prefix}kebun\n` +
      `> ${prefix}koperasi\n` +
      `> ${prefix}koperasi jual <no/nama> <jumlah/all>\n\n` +
      `🐄 TERNAK\n` +
      `> ${prefix}peternakan\n` +
      `> ${prefix}ternak kandang\n` +
      `> ${prefix}ternak status\n` +
      `> ${prefix}ternak list <dasar|langka|epik|legenda|all>\n` +
      `> ${prefix}ternak hybrid\n` +
      `> ${prefix}ternak command\n` +
      `> ${prefix}ternak beli <hewan> <jumlah>\n` +
      `> ${prefix}ternak ambil <hewan>\n` +
      `> ${prefix}ternak sembelih <hewan> <jumlah>\n` +
      `> ${prefix}ternak jual <item> <jumlah>\n` +
      `> ${prefix}kawin <hewan1> <hewan2>\n` +
      `> ${prefix}kawin proses / batal\n` +
      `> ${prefix}kawin guide\n` +
      `> ${prefix}icu [auto]\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const isCollect = command?.toLowerCase() === 'farming' ||
    ['collect', 'all', 'panen'].includes(args[0]) ||
    Boolean(illegalText)

  if (isFarmCommand && args.length && !isGuide && !isCollect &&
      !['command', 'commands', 'cmd', 'menu'].includes(args[0])) {
    return m.reply(`Gunakan *${prefix}farm* untuk daftar command atau *${prefix}farm guide* untuk panduan farming.`)
  }
  if ((command?.toLowerCase() === 'farming' || illegalText) && args.length && !illegalText &&
      !['collect', 'all', 'panen'].includes(args[0])) {
    return m.reply(`Gunakan *${prefix}farming ilegal* untuk mencoba usaha ilegal farming.`)
  }
  if (illegalText && args.length > 1) {
    return m.reply(`Gunakan *${prefix}farming ilegal* untuk mencoba usaha ilegal farming.`)
  }

  if (!isCollect || isGuide) {
    const guide =
      `╭─❏「 🌾 FARMING 」❏\n` +
      `│ 🌱 *KEBUN & PETERNAKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Farming mengurus kebun dan peternakan. Tanaman yang sudah matang dipanen, sementara ternak menghasilkan produk yang masuk ke inventory. Hasil ternak bisa dikumpulkan kembali setiap 2 menit; hewan tetap hidup saat hasilnya diambil.\n\n` +
      `📌 *CARA BERKEBUN*\n` +
      `> ↳ Tanam bibit: *${prefix}tanam wortel*\n` +
      `> ↳ Cek tanaman: *${prefix}ladang*\n` +
      `> ↳ Panen satu tanaman: *${prefix}panen*\n` +
      `> ↳ Lihat hasil tersimpan: *${prefix}kebun*\n` +
      `> ↳ Jual hasil kebun: *${prefix}koperasi jual all*\n\n` +
      `🐄 *CARA BETERNAK*\n` +
      `> ↳ Beli dan lihat hewan: *${prefix}ternak list*\n` +
      `> ↳ Kawinkan hewan untuk menemukan hybrid: *${prefix}kawin <hewan1> <hewan2>*\n` +
      `> ↳ Ambil hasil satu hewan: *${prefix}ternak ambil <hewan>*\n` +
      `> ↳ Sembelih hewan: *${prefix}ternak sembelih <hewan> <jumlah>*\n` +
      `> ↳ Cek kandang: *${prefix}ternak kandang*\n\n` +
      `🌾 *KUMPULKAN HASIL*\n` +
      `> ↳ Panen tanaman siap dan ambil hasil semua ternak: *${prefix}farming*\n` +
      `> ↳ Alternatif: *${prefix}farm collect*\n` +
      `> ↳ Hasil ternak dapat dijual lewat *${prefix}ternak jual <item> <jumlah>* atau *${prefix}restoran jual <item> <jumlah>*.\n` +
      `> ↳ Bahan ternak yang tersedia bisa diolah lewat *${prefix}masak*; cek resep dengan *${prefix}dapur resep*.\n` +
      `> ↳ Semua stok tersimpan di *${prefix}gudang*.\n\n` +
      `⚠️ *${prefix}farming ilegal* mengambil hasil secara ilegal, memberi hasil ×1,5 dan +1 poin kriminal; ada risiko gagal atau tertangkap.\n\n` +
      `─━━━━━━━━━━━━━━─`
    return sendRpgButtons(conn, {
      chat: m.chat,
      text: guide,
      title: '🌾 PANDUAN FARMING',
      subtitle: 'Kelola kebun dan peternakanmu',
      buttons: [
        ['🌾 Panen & ambil hasil', `${prefix}farming`],
        ['🏡 Lihat ladang', `${prefix}ladang`]
      ],
      quoted: m,
      reply: fallbackText => m.reply(fallbackText)
    })
  }

  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return sendRpgRegistrationPrompt(conn, m, prefix, '❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const user = initLadang(account.rpg)
  user.inventory = user.inventory && typeof user.inventory === 'object' ? user.inventory : {}
  user.ternak = user.ternak && typeof user.ternak === 'object' ? user.ternak : {}
  let legacyMigrationChanged = false
  for (const key of ['uang', 'money']) {
    const amount = Number(user.inventory[key]) || 0
    if (amount <= 0) continue
    db.money[m.sender] = addRpgMoney(db.money[m.sender], amount)
    delete user.inventory[key]
    legacyMigrationChanged = true
  }
  const legacyExp = Number(user.inventory.exp) || 0
  if (legacyExp > 0) {
    addExperience(user, legacyExp)
    delete user.inventory.exp
    legacyMigrationChanged = true
  }
  if (Number(user.inventory.diamond) > 0) {
    user.inventory.berlian = (Number(user.inventory.berlian) || 0) + Number(user.inventory.diamond)
    delete user.inventory.diamond
    legacyMigrationChanged = true
  }
  if (Number(user.berlian) > 0) {
    user.inventory.berlian = (Number(user.inventory.berlian) || 0) + Number(user.berlian)
    delete user.berlian
    legacyMigrationChanged = true
  }
  for (let slot = 1; slot <= user.maxLadang; slot++) {
    if (user.ladang[slot]?.jenis === 'diamond') {
      user.ladang[slot].jenis = 'berlian'
      legacyMigrationChanged = true
    }
  }
  const migrated = migrateHasilTernakInventory(user.inventory)
  user.inventory = migrated.inventory

  const now = Date.now()
  const livestockCooldown = Math.floor(
    scaleDifficultyCooldown(user, 2 * 60 * 1000) *
    getGroupTotemBuff(db.data, m.chat, 'livestock', 'cooldown')
  )
  let illegalMultiplier = 1
  let illegalResult = null
  if (illegalText) {
    illegalResult = attemptRpgIllegalAction({
      db,
      jid: m.sender,
      user,
      activity: 'farming',
      cooldownDuration: livestockCooldown,
      cooldownField: null,
      now
    })
    if (illegalResult.status !== 'success') {
      if (['failed', 'caught', 'protected'].includes(illegalResult.status)) await saveFailedRpgIllegalAction(db)
      return m.reply(formatRpgIllegalResult(illegalResult))
    }
    illegalMultiplier = illegalResult.rewardMultiplier
  }
  const cropResults = new Map()
  const replantCounts = new Map()
  const livestockResults = new Map()
  const livestockCooldowns = new Map()
  const { crops: wiltedCrops, appreciation: cropAppreciation } =
    removeWiltedCrops(user, db, m.sender, bibit, now)
  let cropCount = 0
  let livestockCount = 0
  let cropBaseExp = 0
  let livestockBaseExp = 0
  let bonusXp = 0
  let moneyEarned = 0
  let mutated = legacyMigrationChanged || migrated.changed || wiltedCrops.length > 0 || Boolean(illegalText)
  const wiltedInfo = formatCropWiltedAppreciation(wiltedCrops, cropAppreciation, formatName)

  const addCropItem = (itemId, amount) => {
    if (itemId === 'money') {
      const incomeBuff = getGroupTotemBuff(db.data, m.chat, 'farming', 'income')
      const earned = Math.floor(scaleDifficultyIncome(user, amount) * incomeBuff * illegalMultiplier)
      db.money[m.sender] = addRpgMoney(db.money[m.sender], earned)
      moneyEarned += Number(earned) || 0
      return
    }
    if (itemId === 'exp') {
      const xpBuff = getGroupTotemBuff(db.data, m.chat, 'farming', 'xp')
      const earnedXp = Math.floor(scaleDifficultyXP(user, amount) * xpBuff * illegalMultiplier)
      addExperience(user, earnedXp)
      bonusXp += earnedXp
      return
    }
    user.inventory[itemId] = (Number(user.inventory[itemId]) || 0) + amount
  }

  const applyCropYield = amount => {
    let harvested = scaleDifficultyHarvest(user, applyBloodlineYield(user, 'farmingYield', amount))
    if (isRpgEventActive('bountiful_harvest')) {
      harvested = Math.floor(harvested * 1.5)
      if (Math.random() < 0.25) harvested++
    }
    if (isRpgEventActive('crop_blight')) harvested = Math.max(1, Math.floor(harvested * 0.7))
    harvested = Math.max(1, Math.floor(harvested * getGroupTotemBuff(db.data, m.chat, 'farming', 'yield')))
    return illegalText ? Math.ceil(harvested * illegalMultiplier) : harvested
  }

  for (let slot = 1; slot <= user.maxLadang; slot++) {
    const crop = user.ladang[slot]
    if (!crop) continue
    const seed = bibit[crop.jenis]
    if (!seed) continue
    const fallbackDuration = scaleDifficultyCooldown(user, seed.waktu)
    const remaining = getCropReadyDuration(crop, seed, fallbackDuration) - (now - crop.waktuTanam)
    if (remaining > 0) continue

    const harvested = applyCropYield(seed.hasil.jumlah)
    addCropItem(seed.hasil.item, harvested)
    if (seed.hasil.item !== 'money' && seed.hasil.item !== 'exp') {
      const previous = cropResults.get(seed.hasil.item) || { emoji: seed.emoji, amount: 0 }
      previous.amount += harvested
      cropResults.set(seed.hasil.item, previous)
    }
    cropBaseExp += seed.exp
    replantCounts.set(crop.jenis, (replantCounts.get(crop.jenis) || 0) + 1)
    delete user.ladang[slot]
    cropCount++
    mutated = true
  }

  const diseaseFactor = isRpgEventActive('livestock_disease') ? 0.7 : 1
  const livestockYieldBuff = getGroupTotemBuff(db.data, m.chat, 'livestock', 'yield')
  const livestockXpBuff = getGroupTotemBuff(db.data, m.chat, 'livestock', 'xp')
  if (!user.lastLivestockHarvest || typeof user.lastLivestockHarvest !== 'object' || Array.isArray(user.lastLivestockHarvest)) {
    user.lastLivestockHarvest = {}
  }
  for (const [animalKey, rawQuantity] of Object.entries(user.ternak)) {
    const quantity = Math.floor(Number(rawQuantity) || 0)
    if (quantity <= 0) continue
    const animal = getHewan(animalKey)
    if (!animal) continue
    const remaining = livestockCooldown - (now - (Number(user.lastLivestockHarvest[animalKey]) || 0))
    if (!illegalText && remaining > 0) {
      livestockCooldowns.set(animalKey, {
        name: animal.nama,
        emoji: animal.emoji,
        seconds: Math.ceil(remaining / 1000)
      })
      continue
    }
    const production = Math.ceil(Math.max(1, Math.floor(quantity * diseaseFactor * livestockYieldBuff)) * illegalMultiplier)
    const resultKey = dapatkanHasil(animal).ambil
    const display = getHasilDisplay(resultKey)
    user.inventory[display.key] = (Number(user.inventory[display.key]) || 0) + production
    const previous = livestockResults.get(display.key) || { ...display, amount: 0 }
    previous.amount += production
    livestockResults.set(display.key, previous)
    livestockBaseExp += Math.floor(scaleDifficultyXP(user, animal.exp * production) * livestockXpBuff)
    livestockCount += quantity
    user.lastLivestockHarvest[animalKey] = now
    mutated = true
  }

  let cropXp = 0
  if (cropBaseExp > 0) {
    cropXp = Math.floor(
      applyBloodlineBuff(user, 'xp', scaleDifficultyXP(user, cropBaseExp)) *
      getGroupTotemBuff(db.data, m.chat, 'farming', 'xp') *
      illegalMultiplier
    )
    addExperience(user, cropXp)
  }
  const livestockXp = illegalText ? Math.floor(livestockBaseExp * illegalMultiplier) : livestockBaseExp
  if (livestockXp > 0) addExperience(user, livestockXp)

  if (mutated || cropXp || livestockXp || moneyEarned) await saveDB(db)
  if (cropCount === 0 && livestockCount === 0) {
    return m.reply(
      `╭─❏「 🌾 FARMING 」❏\n` +
      `│ ⏳ *BELUM ADA HASIL SIAP DIAMBIL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tanaman yang belum matang tetap tumbuh; hasil ternak akan terkumpul saat farming dijalankan.\n` +
      `${illegalText ? `> ↳ ⚠️ Usaha ilegal berhasil: hasil siap ×${illegalMultiplier} | 💀 +1 poin kriminal (aktif ${illegalResult.activeCrimeScore}).\n` : ''}` +
      `${wiltedInfo ? `${wiltedInfo}\n\n` : ''}` +
      `${livestockCooldowns.size ? `> ↳ Hasil ternak berikutnya siap dalam ${Math.min(...[...livestockCooldowns.values()].map(item => item.seconds))} detik.\n` : ''}` +
      `> ↳ Cek ladang: *${prefix}ladang*\n` +
      `> ↳ Cek ternak: *${prefix}ternak kandang*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const totalXp = cropXp + livestockXp + bonusXp
  let resultText =
    `╭─❏「 🌾 HASIL FARMING 」❏\n` +
    `│ 🌱 *KEBUN & PETERNAKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📦 *HASIL PANEN*\n`
  resultText += cropResults.size
    ? [...cropResults].map(([item, result]) => `> ↳ ${result.emoji} ${formatName(item)} ×${result.amount.toLocaleString()}\n`).join('')
    : `> ↳ Belum ada tanaman siap panen.\n`
  resultText += `> ↳ ✅ Tanaman dipanen: ${cropCount} slot\n\n`
  resultText += `🐄 *HASIL TERNAK*\n`
  resultText += livestockResults.size
    ? [...livestockResults.values()].map(result => `> ↳ ${result.emoji} ${result.nama} ×${result.amount.toLocaleString()}\n`).join('')
    : `> ↳ Belum memiliki ternak yang menghasilkan.\n`
  resultText += `> ↳ 🐾 Jumlah ternak diproses: ${livestockCount}\n`
  if (livestockResults.size) {
    resultText += `> ↳ ⏳ Hasil ternak berikutnya tersedia dalam ${Math.ceil(livestockCooldown / 1000)} detik.\n`
  }
  if (livestockCooldowns.size) {
    resultText += [...livestockCooldowns.values()]
      .map(animal => `> ↳ ⏳ ${animal.emoji} ${animal.name}: ${animal.seconds} detik lagi\n`)
      .join('')
  }
  if (wiltedCrops.length) resultText += `> ↳ 🥀 Tanaman layu: ${wiltedCrops.length}\n`
  if (illegalText) resultText += `> ↳ ⚠️ Usaha ilegal berhasil: hasil ×${illegalMultiplier} | 💀 +1 poin kriminal (aktif ${illegalResult.activeCrimeScore})\n`
  if (wiltedInfo) resultText += `\n${wiltedInfo}\n`
  resultText += `\n✨ *HASIL RPG*\n` +
    `> ↳ ✨ EXP: +${totalXp.toLocaleString()}\n` +
    (moneyEarned ? `> ↳ 💰 Uang dari panen: +Rp ${moneyEarned.toLocaleString()}\n` : '') +
    `> ↳ 📊 Level: Lv.${user.level || 1}\n\n` +
    `─━━━━━━━━━━━━━━─`

  const replantRows = [...replantCounts].map(([seed, quantity]) => ({
    title: `${bibit[seed].emoji} Tanam ${formatName(seed)} ×${quantity}`,
    description: `Tanam kembali ${quantity} slot`,
    id: `${prefix}tanam ${seed} ulang ${quantity}`
  }))
  const buttons = [
    ...(replantRows.length ? [] : [['🌱 Buka menu tanam', `${prefix}tanam`]]),
    ['🎒 Buka Tas', `${prefix}bag`]
  ]
  return sendRpgButtons(conn, {
    chat: m.chat,
    text: resultText,
    title: '🌾 FARMING BERHASIL',
    subtitle: 'Panen dan hasil ternak sudah masuk inventory',
    thumbnailUrl: 'https://c.termai.cc/i171/wYyN.jpg',
    sections: replantRows.length ? [{ title: '🌱 Tanam kembali bibit yang dipanen', rows: replantRows }] : undefined,
    buttons,
    fallbackText: [
      resultText,
      ...(replantRows.length
        ? ['', '🌱 *TANAM KEMBALI*', ...replantRows.map(row => `> ↳ ${row.title}: *${row.id}*`)]
        : [])
    ].join('\n'),
    quoted: m,
    reply: fallbackText => m.reply(fallbackText)
  })
}

handler.help = ['farm', 'farm guide', 'farm command', 'farming', 'farm collect']
handler.tags = ['rpg']
handler.command = /^(farm|farming)$/i
handler.group = true

export default handler
