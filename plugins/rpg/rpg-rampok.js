import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const wdb = loadDB()
    let userRPG = wdb.users[m.sender]?.rpg
    
    if (!userRPG) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan .adventure')
    
    let cooldown = 600000 
    if (userRPG.lastrob === undefined) userRPG.lastrob = 0
    let timers = (cooldown - (new Date() - userRPG.lastrob))
    if (new Date() - userRPG.lastrob < cooldown) return m.reply(`🕵️ Tunggu selama *${Math.ceil(timers / 60000)} menit* lagi.`)

    let who = m.quoted ? m.quoted.sender : false

    if (!who) return m.reply(`Balas (reply) pesan orang yang ingin dirampok!`)
    if (who === m.sender) return m.reply('🗿')

    let targetMoney = wdb.money[who] || 0
    let userMoney = wdb.money[m.sender] || 0

    if (targetMoney < 1000) return m.reply('Target terlalu miskin. 💸')

    try {
        userRPG.lastrob = new Date() * 1
        
        let chance = Math.random()
        
        if (chance > 0.5) {
            let robAmount = Math.floor(Math.random() * (targetMoney * 0.3))
            wdb.money[who] -= robAmount
            wdb.money[m.sender] += robAmount
            
            m.reply(`*BERHASIL!* 🕵️\nKamu merampok *@${who.split('@')[0]}* sebesar *Rp ${robAmount.toLocaleString()}*!`, null, { mentions: [who] })
        } else {
            let denda = Math.floor(userMoney * 0.2)
            wdb.money[m.sender] -= denda
            
            m.reply(`🚓 *TERTANGKAP!* 👮\nKamu gagal merampok dan didenda sebesar *Rp ${denda.toLocaleString()}*.`)
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