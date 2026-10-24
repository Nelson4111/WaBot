import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isAfk } from '../../lib/afkHelper.js'
import { computeCrimeScore } from '../../lib/crimeHelper.js'
import { ensurePrisonCell, registerPrisoner } from '../../lib/prisonHelper.js'
import { adjustCrimeSuccessChance, applyProtectedCrimeAttemptPenalty, getCrimeRestriction, isProtectedCrimeTarget, scaleDifficultyCooldown, scaleDifficultyCrimeLoss, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { formatPremiumProtectionMessage, tryPremiumProtection } from '../../lib/rpgPremium.js'
import { createRpgCrimeRecord } from '../../lib/rpgCrimeAction.js'
import { getRpgCrimeStory } from '../../lib/rpgCrimeStories.js'
import { sendRpgHealPrompt, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let userRPG = wdb.users[m.sender]?.rpg
  if (!userRPG) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum punya data RPG')

  const actorRestriction = getCrimeRestriction(userRPG)
  if (actorRestriction) {
    if (actorRestriction.includes('.heal')) return sendRpgHealPrompt(conn, m, { text: actorRestriction, usedPrefix })
    return m.reply(actorRestriction)
  }

  if (!Array.isArray(userRPG.riwayat)) userRPG.riwayat = []

  // CEK PENJARA
  if (userRPG.penjara && Date.now() - userRPG.penjara < userRPG.lamaPenjara) {
    const previousCell = userRPG.sel
    ensurePrisonCell(wdb, m.sender)
    if (userRPG.sel !== previousCell) saveDB(wdb)

    let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    let tebusan = userRPG.tebusan || 1000000

    return m.reply(
      `╭─❏「 🚔 STATUS PENJARA 」❏\n` +
      `│ 🔒 Kamu sedang menjalani hukuman di sel ${userRPG.sel}.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `⏳ *Sisa Hukuman:* ${jam}j ${menit}m\n` +
      `💰 *Tebusan:* Rp ${tebusan.toLocaleString()}\n\n` +
      `📝 *CARA MENEBUS*\n` +
      `> ↳ Ketik *.penjara tebus*`
    )
  }

  // COOLDOWN 10 MENIT
  let cd = scaleDifficultyCooldown(userRPG, 300000)
  if (!userRPG.lastcopet) userRPG.lastcopet = 0
  let sisa = cd - (Date.now() - userRPG.lastcopet)

  if (sisa > 0) {
    let menit = Math.floor(sisa / 60000)
    let detik = Math.floor((sisa % 60000) / 1000)

    return m.reply(
      `╭─❏「 ⏳ COOLDOWN COPET 」❏\n` +
      `│ 🤏 Kamu belum bisa melakukan aksi copet lagi.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tunggu *${menit}m ${detik}d* lagi.`
    )
  }

  let who = m.mentionedJid?.[0] || m.quoted?.sender
  if (!who) return m.reply(`❌ Tag atau reply pesan target yg mau dicopet`)
  if (who === m.sender) return m.reply('❌ Ga bisa copet diri sendiri')

  const senderUser = (global.db?.data?.users || {})[m.sender] || wdb.users?.[m.sender] || {}
  const targetUser = (global.db?.data?.users || {})[who] || wdb.users?.[who] || {}

  if (isAfk(senderUser)) return m.reply('❌ Kamu sedang AFK. Nonaktifkan dulu status AFK sebelum melakukan aksi kriminal.')
  if (isAfk(targetUser)) return m.reply('❌ Target sedang AFK dan tidak bisa dijadikan sasaran tindakan kriminal.')

  let target = getUserRPG(wdb, who).rpg
  if (!target) return m.reply('❌ Target belum punya data RPG')

  const targetRestriction = getCrimeRestriction(target, { target: true })
  if (targetRestriction) return m.reply(targetRestriction)

  if (Number(target.darah) <= 0) {
    return sendRpgHealPrompt(conn, m, {
      text: `💀 Target masih mati.`,
      usedPrefix,
      target: who,
      mentions: [who]
    })
  }

  if (!target.riwayat) target.riwayat = []

  let uangTarget = wdb.money[who] || 0
  if (uangTarget < 1000) return m.reply('❌ Target terlalu miskin. Minimal Rp 1.000')

  const protectedCrimeTarget = isProtectedCrimeTarget(who)
  if (!protectedCrimeTarget && tryPremiumProtection(who, 'copet', Date.now(), m.sender)) {
    userRPG.lastcopet = Date.now()
    await saveDB(wdb)

    return m.reply(formatPremiumProtectionMessage(
      'copet',
      'Uang target tetap aman.'
    ))
  }

  userRPG.lastcopet = Date.now()
  let gagal = Math.random() >= adjustCrimeSuccessChance(userRPG, 0.6, who)
  let story = getRpgCrimeStory('copet', gagal ? 'failure' : 'success')

  // INIT CRIME
  wdb.crime = wdb.crime || {}
  wdb.crime[m.sender] = createRpgCrimeRecord(wdb.crime[m.sender] || {})

  if (gagal) {
    userRPG.gagalCopet = (userRPG.gagalCopet || 0) + 1
    let denda = protectedCrimeTarget
      ? applyProtectedCrimeAttemptPenalty(wdb, m.sender, who)
      : Math.max(1000, Math.floor((wdb.money[m.sender] || 0) * 0.05))

    if (denda > 0) {
      if (!protectedCrimeTarget) {
        wdb.money[m.sender] -= denda
        wdb.money[who] += denda
      }
    }

    wdb.crime[m.sender].total = computeCrimeScore(wdb.crime[m.sender])

    target.riwayat.unshift(`+Rp ${denda.toLocaleString()} Denda copet dari @${m.sender.split('@')[0]}`)
    userRPG.riwayat.unshift(`-Rp ${denda.toLocaleString()} Gagal copet @${who.split('@')[0]}`)

    // GAGAL 2X = PENJARA 1 JAM
    if (userRPG.gagalCopet >= 2) {
      wdb.penjara = wdb.penjara || []
      userRPG.penjara = Date.now()
      userRPG.lamaPenjara = 3600000 // 1 jam
      userRPG.tebusan = 1000000 // 1jt
      userRPG.kasus = '🤏 Copet'
      userRPG.sel = registerPrisoner(wdb, m.sender)
      userRPG.gagalCopet = 0
      saveDB(wdb)

      if (!userRPG.sel) {
        return m.reply(
          `╭─❏「 ⚠️ AKSI COPET GAGAL 」❏\n` +
          `│ 💸 Denda: Rp ${denda.toLocaleString('id-ID')}\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Perlindungan mantan napi mencegahmu masuk penjara.`
        )
      }

      return m.reply(
        `╭─❏「 🚔 KETANGKEP POLISI! 」❏\n` +
        `│ 🤏 Kasus: Copet gagal 2x berturut-turut.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${story}\n\n` +
        `⚖️ *HUKUMAN*\n` +
        `> ↳ Lokasi: Penjara Sel ${userRPG.sel}\n` +
        `> ↳ Durasi: 1 jam\n` +
        `> ↳ Tebusan: Rp 1.000.000\n\n` +
        `📝 *CARA MENEBUS*\n` +
        `> ↳ Ketik *.penjara tebus*`
      )
    }

    saveDB(wdb)

    let txt = `╭─❏「 🤏 COPET GAGAL 」❏\n`
    txt += `│ ⚠️ AKSI KRIMINAL GAGAL\n`
    txt += `╰─━━━━━━━━━━━━━━─\n\n`
    txt += `👤 *Pelaku:* @${m.sender.split('@')[0]}\n`
    txt += `🎯 *Target:* @${who.split('@')[0]}\n`
    txt += `💸 *Denda:* Rp ${denda.toLocaleString()}\n`
    txt += `🚨 *Strike:* ${userRPG.gagalCopet}/2\n\n`
    txt += `─━━━━━━━━━━━━━━─\n`
    txt += `${story}`

    return conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })
  }

  // SUKSES
  userRPG.gagalCopet = 0
  let hasil = Math.min(uangTarget, scaleDifficultyCrimeLoss(target, scaleDifficultyIncome(userRPG, Math.floor(Math.random() * 5000) + 1000)))

  wdb.money[who] -= hasil
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + hasil

  wdb.crime[m.sender].copet = (Number(wdb.crime[m.sender].copet) || 0) + 1
  wdb.crime[m.sender].total = computeCrimeScore(wdb.crime[m.sender])

  target.riwayat.unshift(`-Rp ${hasil.toLocaleString()} Dicopet @${m.sender.split('@')[0]}`)
  userRPG.riwayat.unshift(`+Rp ${hasil.toLocaleString()} Copet @${who.split('@')[0]}`)
  saveDB(wdb)

  let txt = `╭─❏「 ✅ COPET BERHASIL 」❏\n`
  txt += `│ 🤏 AKSI KRIMINAL BERHASIL\n`
  txt += `╰─━━━━━━━━━━━━━━─\n\n`
  txt += `👤 *Pelaku:* @${m.sender.split('@')[0]}\n`
  txt += `🎯 *Korban:* @${who.split('@')[0]}\n`
  txt += `💰 *Jarahan:* Rp ${hasil.toLocaleString()}\n\n`
  txt += `─━━━━━━━━━━━━━━─\n`
  txt += `${story}\n\n`
  txt += `💡 *INFORMASI*\n`
  txt += `> ↳ Cek *.buronan* untuk melihat DPO.`

  conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })
}

handler.help = ['copet (reply)']
handler.tags = ['rpg']
handler.command = /^(copet)$/i
handler.alias = ['copet']
handler.group = true
export default handler