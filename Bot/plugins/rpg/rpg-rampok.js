import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './bank.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const wdb = loadDB()
    let userRPG = wdb.users[m.sender]?.rpg

    if (!userRPG) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan.adventure')

    let cooldown = 86400000 // 1 hari
    if (userRPG.lastrob === undefined) userRPG.lastrob = 0
    let timers = (cooldown - (new Date() - userRPG.lastrob))
    if (new Date() - userRPG.lastrob < cooldown) {
        let jam = Math.floor(timers / 3600000)
        let menit = Math.floor((timers % 3600000) / 60000)
        return m.reply(`🕵️ Tunggu selama *${jam} jam ${menit} menit* lagi untuk merampok.`)
    }

    let who = m.quoted? m.quoted.sender : false
    if (!who) return m.reply(`Balas (reply) pesan orang yang ingin dirampok!`)
    if (who === m.sender) return m.reply('🗿')

    // CEK GUILD
    let myGuild = Object.values(wdb.guilds || {}).find(g => g.members.includes(m.sender))
    let targetGuild = Object.values(wdb.guilds || {}).find(g => g.members.includes(who))
    if(myGuild && targetGuild && myGuild.name === targetGuild.name){
        return m.reply('❌ Sesama anggota guild tidak bisa saling rampok!')
    }

    let dataTarget = getUserRPG(wdb, who)
    let target = dataTarget.rpg
    if(!target) return m.reply('❌ Target belum punya data RPG.')
    if(target.kartuBeku) return m.reply('❌ Target kartunya sedang beku.')

    let targetBank = target.bank || 0
    let userBank = userRPG.bank || 0 // AMBIL DARI BANK BUKAN UANG SAKU
    if (targetBank < 50000) return m.reply('Bank target terlalu sedikit. Minimal Rp 50.000')

    try {
        userRPG.lastrob = new Date() * 1
        let tierTarget = BANK_TIERS[target.bankTier || 0]
        let keamanan = tierTarget.keamanan
        let peluangSukses = Math.max(0.15, 0.8 - (keamanan * 0.04))
        let chance = Math.random()

        if (chance < peluangSukses) {
            // BERHASIL - ambil 5% - 30% dari bank target
            let persenAmbil = 0.05 + (Math.random() * 0.25)
            let robAmount = Math.floor(targetBank * persenAmbil * (1 - tierTarget.asuransi))

            target.bank -= robAmount
            userRPG.bank += robAmount // LANGSUNG MASUK BANK

            // TRACKING CRIME
            if(!wdb.crime) wdb.crime = {}
            if(!wdb.crime[m.sender]) wdb.crime[m.sender] = { rampok: 0, begal: 0, bunuh: 0, total: 0 }
            wdb.crime[m.sender].rampok += 1
            wdb.crime[m.sender].total += 1

            target.riwayat.unshift(`-Rp ${robAmount.toLocaleString()} Dirampok @${m.sender.split('@')[0]}`)
            userRPG.riwayat.unshift(`+Rp ${robAmount.toLocaleString()} Rampok @${who.split('@')[0]}`)

            m.reply(`*BERHASIL!* 🕵️💰\nKamu merampok *@${who.split('@')[0]}* sebesar *Rp ${robAmount.toLocaleString()}*\n\n💳 *Uang langsung masuk ke Saldo Bank kamu*\n🔒 Keamanan Target: ${tierTarget.fasilitas.find(f=>f.includes('Penjaga'))}`, null, { mentions: [who] })
        } else {
            // GAGAL - DENDA 50% DARI SALDO BANK SENDIRI MASUK KE BANK TARGET
            let denda = Math.floor(userBank * 0.5)
            if(denda < 10000) denda = 10000 // minimal denda 10k
            if(userBank < denda) return m.reply(`❌ Saldo bank kamu tidak cukup untuk denda. Butuh Rp ${denda.toLocaleString()}`)

            userRPG.bank -= denda // POTONG DARI BANK KAMU
            target.bank += denda // MASUK KE BANK TARGET

            target.riwayat.unshift(`+Rp ${denda.toLocaleString()} Denda Rampok dari @${m.sender.split('@')[0]}`)
            userRPG.riwayat.unshift(`-Rp ${denda.toLocaleString()} Denda Gagal Rampok @${who.split('@')[0]}`)

            m.reply(`🚓 *TERTANGKAP!* 👮\nKamu gagal merampok dan didenda *50% dari saldo bank = Rp ${denda.toLocaleString()}*\n\n💳 *Denda langsung masuk ke Saldo Bank @${who.split('@')[0]}*\n🕵️ Cooldown reset 1 hari.`, null, { mentions: [who] })
        }

        saveDB(wdb)

    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan.')
    }
}

handler.help = ['rampok (reply target)']
handler.tags = ['rpg']
handler.command = ['rampok']
handler.group = true

export default handler