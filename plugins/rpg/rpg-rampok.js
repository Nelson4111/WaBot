import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './rpg-bank.js'

let handler = async (m, { conn }) => {
    const wdb = loadDB()
    let userRPG = wdb.users[m.sender]?.rpg
    if (!userRPG) return m.reply('❌ Kamu belum punya data RPG. Mulai dengan *.adventure*')
    if(!userRPG.riwayat) userRPG.riwayat = []

    // CEK PENJARA GLOBAL
    if (userRPG.penjara && Date.now() - userRPG.penjara < userRPG.lamaPenjara) {
        let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        let tebusan = userRPG.tebusan || 4000000
        return m.reply(`🚔 *KAMU DI PENJARA SEL ${userRPG.sel}*\nSisa: *${jam}j ${menit}m*\nTebusan: *Rp ${tebusan.toLocaleString()}*\n\nKetik *.tebus*`)
    }

    // COOLDOWN 1 HARI
    let cd = 86400000
    if (!userRPG.lastrob) userRPG.lastrob = 0
    let sisa = cd - (Date.now() - userRPG.lastrob)
    if (sisa > 0) {
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        return m.reply(`⏳ *COOLDOWN*\nTunggu *${jam}j ${menit}m* lagi untuk merampok`)
    }

    let who = m.quoted?.sender
    if (!who) return m.reply(`❌ Reply pesan target yg mau dirampok`)
    if (who === m.sender) return m.reply('🗿 Ga bisa rampok diri sendiri')

    let target = getUserRPG(wdb, who).rpg
    if(!target) return m.reply('❌ Target belum punya data RPG')
    if(!target.riwayat) target.riwayat = []
    if(target.kartuBeku) return m.reply('❌ Target kartunya sedang beku')

    let bankTarget = target.bank || 0
    if (bankTarget < 50000) return m.reply('❌ Bank target terlalu sedikit. Minimal Rp 50.000')

    userRPG.lastrob = Date.now()
    let tier = BANK_TIERS[target.bankTier || 0]
    let peluang = Math.max(0.15, 0.8 - (tier.keamanan * 0.04))
    let roll = Math.random()

    wdb.crime = wdb.crime || {}
    wdb.crime[m.sender] = wdb.crime[m.sender] || { copet: 0, rampok: 0, begal: 0, bunuh: 0, total: 0 }

    if (roll >= peluang) {
        // GAGAL = LANGSUNG PENJARA 4 JAM
        wdb.penjara = wdb.penjara || []
        let sel = wdb.penjara.length + 1
        userRPG.penjara = Date.now()
        userRPG.lamaPenjara = 14400000 // 4 jam
        userRPG.tebusan = 4000000 // 4jt
        userRPG.sel = sel
        wdb.penjara.push(m.sender)

        wdb.crime[m.sender].rampok += 1
        wdb.crime[m.sender].total += 1
        userRPG.riwayat.unshift(`🚔 Ditangkap saat rampok @${who.split('@')[0]}`)

        saveDB(wdb)
        let txt = `┌───❏「 🚓 RAMPOK GAGAL 」❏\n`
        txt += `│ 👤 Perampok: @${m.sender.split('@')[0]}\n`
        txt += `│ 🎯 Target: @${who.split('@')[0]}\n`
        txt += `│ ⚰️ Ketahuan polisi\n`
        txt += `│ 🚔 Masuk *PENJARA SEL ${sel}* selama *4 jam*\n`
        txt += `│ 💰 Tebusan: *Rp 4.000.000*\n`
        txt += `└───────────────────`
        return conn.reply(m.chat, txt, m, { mentions: [who] })
    }

    // SUKSES
    let persen = 0.05 + (Math.random() * 0.25)
    let hasil = Math.max(10000, Math.floor(bankTarget * persen * (1 - tier.asuransi)))

    target.bank -= hasil
    userRPG.bank += hasil

    wdb.crime[m.sender].rampok += 1
    wdb.crime[m.sender].total += 1

    target.riwayat.unshift(`-Rp ${hasil.toLocaleString()} Dirampok @${m.sender.split('@')[0]}`)
    userRPG.riwayat.unshift(`+Rp ${hasil.toLocaleString()} Rampok @${who.split('@')[0]}`)
    saveDB(wdb)

    let txt = `┌───❏「 🕵️ RAMPOK BERHASIL 」❏\n`
    txt += `│ 👤 Perampok: @${m.sender.split('@')[0]}\n`
    txt += `│ 🎯 Target: @${who.split('@')[0]}\n`
    txt += `│ 💰 Jarahan: Rp ${hasil.toLocaleString()}\n`
    txt += `└───────────────────\n`
    txt += `\n💡 Cek *.buronan* untuk lihat riwayat kriminalmu`

    conn.reply(m.chat, txt, m, { mentions: [who] })
}
handler.help = ['rampok (reply)']
handler.tags = ['rpg']
handler.command = ['rampok']
handler.group = true
export default handler