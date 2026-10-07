import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS, calculateBankRobberyLoss, getBankEffectiveSecurity, getBankGuardName, getBankRobberySuccessChance } from './rpg-bank.js'
import { isAfk } from '../../lib/afkHelper.js'
import { computeCrimeScore } from '../../lib/crimeHelper.js'
import { ensurePrisonCell, registerPrisoner } from '../../lib/prisonHelper.js'
import { adjustCrimeSuccessChance, getCrimeRestriction, scaleDifficultyCooldown, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { tryPremiumProtection } from '../../lib/rpgPremium.js'

let handler = async (m, { conn }) => {
    const wdb = loadDB()
    let userRPG = wdb.users[m.sender]?.rpg
    if (!userRPG) return m.reply('❌ Kamu belum punya data RPG. Mulai dengan *.adventure*')
    const actorRestriction = getCrimeRestriction(userRPG)
    if (actorRestriction) return m.reply(actorRestriction)
    if (!Array.isArray(userRPG.riwayat)) userRPG.riwayat = []

    // CEK PENJARA
    if (userRPG.penjara && Date.now() - userRPG.penjara < userRPG.lamaPenjara) {
        const previousCell = userRPG.sel
        ensurePrisonCell(wdb, m.sender)
        if (userRPG.sel !== previousCell) saveDB(wdb)
        let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        let tebusan = userRPG.tebusan || 4000000
        return m.reply(`🚔 *KAMU DI PENJARA SEL ${userRPG.sel}*\nSisa: *${jam}j ${menit}m*\nTebusan: *Rp ${tebusan.toLocaleString()}*\n\nKetik *.tebus*`)
    }

    // COOLDOWN 1 HARI
    let cd = scaleDifficultyCooldown(userRPG, 86400000)
    if (!userRPG.lastrob) userRPG.lastrob = 0
    let sisa = cd - (Date.now() - userRPG.lastrob)
    if (sisa > 0) {
        const totalMenit = Math.ceil(sisa / 60000)
        const jam = Math.floor(totalMenit / 60)
        const menit = totalMenit % 60
        return m.reply(`⏳ *COOLDOWN RAMPOK*\nTunggu *${jam}j ${menit}m* lagi`)
    }

    let who = m.mentionedJid?.[0] || m.quoted?.sender
    if (!who) return m.reply(`❌ Tag atau reply pesan target yg mau dirampok`)
    if (who === m.sender) return m.reply('🗿 Ga bisa rampok diri sendiri')
    const senderUser = (global.db?.data?.users || {})[m.sender] || wdb.users?.[m.sender] || {}
    const targetUser = (global.db?.data?.users || {})[who] || wdb.users?.[who] || {}
    if (isAfk(senderUser)) return m.reply('❌ Kamu sedang AFK. Nonaktifkan dulu status AFK sebelum melakukan aksi kriminal.')
    if (isAfk(targetUser)) return m.reply('❌ Target sedang AFK dan tidak bisa dijadikan sasaran tindakan kriminal.')

    let target = getUserRPG(wdb, who).rpg
    if(!target) return m.reply('❌ Target belum punya data RPG')
    const targetRestriction = getCrimeRestriction(target, { target: true })
    if (targetRestriction) return m.reply(targetRestriction)
    if (Number(target.darah) <= 0) return m.reply(`💀 Target masih mati. Gunakan *.heal* pada target terlebih dahulu.`)
    if (!Array.isArray(target.riwayat)) target.riwayat = []
    if(target.kartuBeku) return m.reply('❌ Kartu bank target sedang beku')

    let bankTarget = target.bank || 0
    if (bankTarget < 50000) return m.reply('❌ Bank target terlalu sedikit. Minimal Rp 50.000')
    if (tryPremiumProtection(who, 'rampok')) {
        userRPG.lastrob = Date.now()
        await saveDB(wdb)
        return m.reply('🛡️ Aksi rampok gagal: Premium Protection target aktif. Cooldown rampok kamu tetap berlaku; saldo bank target aman.')
    }

    userRPG.lastrob = Date.now()
    let tier = BANK_TIERS[target.bankTier] || BANK_TIERS[0]
    let penjaga = getBankGuardName(tier)
    let keamananEfektif = getBankEffectiveSecurity(tier)
    let bonusBenteng = tier.fasilitas.includes('Benteng Kristal') ? ' (termasuk bonus Benteng Kristal +5)' : ''
    let peluang = getBankRobberySuccessChance(tier)
    let roll = Math.random()

    // INIT CRIME
    wdb.crime = wdb.crime || {}
    wdb.crime[m.sender] = wdb.crime[m.sender] || { copet: 0, rampok: 0, jarah: 0, culik: 0, begal: 0, bunuh: 0, total: 0 }

    if (roll >= adjustCrimeSuccessChance(userRPG, peluang)) {
    // GAGAL = LANGSUNG PENJARA 4 JAM
    wdb.penjara = wdb.penjara || []
        userRPG.penjara = Date.now()
        userRPG.lamaPenjara = 14400000 // 4 jam
        userRPG.tebusan = 4000000 // 4jt
        userRPG.kasus = '🕵️ Rampok'
        userRPG.sel = registerPrisoner(wdb, m.sender)

    wdb.crime[m.sender].total = computeCrimeScore(wdb.crime[m.sender])
    userRPG.riwayat.unshift(`🚔 Ditangkap saat rampok @${who.split('@')[0]}`)

    saveDB(wdb)
    let txt = `╭─❏「 🚓 RAMPOK GAGAL 」❏\n`
    txt += `│ 🚓 *PERAMPOKAN GAGAL*\n`
    txt += `│ 👤 Perampok : @${m.sender.split('@')[0]}\n`
    txt += `│ 🎯 Target : @${who.split('@')[0]}\n`
    txt += `╰─━━━━━━━━━━━━━━─\n\n`

    txt += `🛡️ *PERTAHANAN BANK TARGET*\n`
    txt += `> ↳ Keamanan : *${keamananEfektif}*${bonusBenteng}\n\n`

    txt += `🚨 *HASIL KEJADIAN*\n`
    txt += `> ↳ 🛡️ ${penjaga} menahan perampok dan membunyikan alarm.\n`
    txt += userRPG.sel
        ? `> ↳ 🚨 Polisi datang; perampok tertangkap dan masuk *PENJARA SEL ${userRPG.sel}* selama *4 jam*.\n> ↳ 💰 Tebusan: *Rp 4.000.000*.\n\n`
        : `> ↳ 🛡️ Perlindungan mantan napi mencegahmu masuk penjara.\n\n`

    txt += `─━━━━━━━━━━━━━━─`
    return conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })
}

// SUKSES
let persen = 0.05 + (Math.random() * 0.25) // 5% - 30%
let hasil = scaleDifficultyIncome(userRPG, calculateBankRobberyLoss(bankTarget, persen, tier))

target.bank -= hasil
userRPG.bank = (userRPG.bank || 0) + hasil

wdb.crime[m.sender].rampok = (Number(wdb.crime[m.sender].rampok) || 0) + 1
wdb.crime[m.sender].total = computeCrimeScore(wdb.crime[m.sender])

target.riwayat.unshift(`-Rp ${hasil.toLocaleString()} Dirampok @${m.sender.split('@')[0]}`)
userRPG.riwayat.unshift(`+Rp ${hasil.toLocaleString()} Rampok @${who.split('@')[0]}`)
saveDB(wdb)

let txt = `╭─❏「 🕵️ RAMPOK BERHASIL 」❏\n`
txt += `│ 🕵️ *PERAMPOKAN BERHASIL*\n`
txt += `│ 👤 Perampok : @${m.sender.split('@')[0]}\n`
txt += `│ 🎯 Target : @${who.split('@')[0]}\n`
txt += `╰─━━━━━━━━━━━━━━─\n\n`

txt += `🛡️ *PERTAHANAN BANK TARGET*\n`
txt += `> ↳ Keamanan : *${keamananEfektif}*${bonusBenteng}\n\n`

txt += `💰 *HASIL PERAMPOKAN*\n`
txt += `> ↳ 💰 Jarahan : Rp ${hasil.toLocaleString()} *${(persen*100).toFixed(1)}%*\n`
txt += `> ↳ ⚠️ Perampok berhasil melumpuhkan ${penjaga} dan menerobos masuk.\n`
txt += `> ↳ 🛡️ Asuransi Target : ${(tier.asuransi*100).toFixed(0)}%\n\n`

txt += `─━━━━━━━━━━━━━━─`

    conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })
}
handler.help = ['rampok (reply)']
handler.tags = ['rpg']
handler.command = /^(rampok)$/i
handler.alias = ['rampok']
handler.group = true
export default handler