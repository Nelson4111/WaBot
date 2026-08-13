import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const wdb = loadDB()
    let userRPG = wdb.users[m.sender]?.rpg
    
    if (!userRPG) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan .adventure')
    
    let userMoney = wdb.money[m.sender] || 0
    if (userRPG.lastcasino === undefined) userRPG.lastcasino = 0

    let cooldown = 60000 
    let timers = (cooldown - (new Date() - userRPG.lastcasino))
    if (new Date() - userRPG.lastcasino < cooldown) return m.reply(`✨ Tunggu selama *${Math.ceil(timers / 1000)} detik* lagi untuk bermain kembali.`)

    let bet = args[0]
    if (!bet || isNaN(bet)) return m.reply(`Masukan jumlah uang yang ingin ditaruhkan!\nContoh: *${usedPrefix + command} 1000*`)
    bet = parseInt(bet)
    
    if (bet < 100) return m.reply('❌ Minimal taruhan adalah Rp 100')
    if (userMoney < bet) return m.reply('❌ Uang di saku kamu tidak cukup!')

    try {
        let emojis = ["🎰", "🔔", "💎", "🍋", "🍒", "💰", "⭐", "🍀", "🍇"]
        
        let a = emojis[Math.floor(Math.random() * emojis.length)]
        let b = emojis[Math.floor(Math.random() * emojis.length)]
        let c = emojis[Math.floor(Math.random() * emojis.length)]
        let d = emojis[Math.floor(Math.random() * emojis.length)]
        let e = emojis[Math.floor(Math.random() * emojis.length)]
        let f = emojis[Math.floor(Math.random() * emojis.length)]
        let g = emojis[Math.floor(Math.random() * emojis.length)]
        let h = emojis[Math.floor(Math.random() * emojis.length)]
        let i = emojis[Math.floor(Math.random() * emojis.length)]
        
        let result = `
[ 🎰 | RPG CASINO ]
──────────────
  ${a} | ${b} | ${c}
  ${d} | ${e} | ${f} <<
  ${g} | ${h} | ${i}
──────────────
`.trim()

        if (d === e && e === f) {
            let menang = bet * 10
            wdb.money[m.sender] += menang
            m.reply(`${result}\n\n*JACKPOT!!!* 🏆\nKamu menang besar! Uang saku bertambah: *+Rp ${menang.toLocaleString()}*`)
        } else if (d === e || e === f || d === f) {
            let menang = Math.ceil(bet * 1.5)
            wdb.money[m.sender] += menang
            m.reply(`${result}\n\n*MENANG!* 🎉\nUang saku bertambah: *+Rp ${menang.toLocaleString()}*`)
        } else {
            wdb.money[m.sender] -= bet
            m.reply(`${result}\n\n*KALAH* 💀\nUang saku berkurang: *-Rp ${bet.toLocaleString()}*`)
        }

        userRPG.lastcasino = new Date() * 1
        saveDB(wdb)

    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan teknis di meja judi.')
    }
}

handler.help = ['casino <jumlah>']
handler.tags = ['rpg']
handler.command = ['casino']
handler.group = true

export default handler