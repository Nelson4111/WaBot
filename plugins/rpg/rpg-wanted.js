import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, args }) => {
    const wdb = loadDB()

    // RESET COMMAND BUAT ADMIN
    if(args[0] === 'reset' && m.isGroup && m.sender === conn.user.jid){
        wdb.crime = {}
        saveDB(wdb)
        return m.reply('✅ Data buronan di reset')
    }

    if(!wdb.crime || Object.keys(wdb.crime).length === 0)
        return m.reply('📋 Belum ada data kriminal di kota ini')

    let crimeList = Object.entries(wdb.crime)
    .filter(([jid, data]) => data && Number(data.total) > 0)
    .sort((a, b) => Number(b[1].total) - Number(a[1].total))
    .slice(0, 10)

    if(crimeList.length === 0) return m.reply('📋 Belum ada kriminal di kota ini')

    let cap = `╭───「 🚨 MOST WANTED 」───╮\n`
    cap += `│ *TOP 10 BURONAN KOTA* │\n`
    cap += `╰───────────────────────╯\n\n`

    let mentioned = []
    for(let i = 0; i < crimeList.length; i++){
        let [jid, data] = crimeList[i]
        mentioned.push(jid)

        let rank = i + 1
        let medal = rank === 1? '👑' : rank === 2? '🥈' : rank === 3? '🥉' : ` ${rank}.`

        cap += `${medal} @${jid.split('@')[0]}\n`
        cap += `│ 💀 Total : *${Number(data.total)}x Kejahatan*\n`
        cap += `│ 🕵️${data.rampok || 0} 🏴‍☠️${data.begal || 0} 🔪${data.bunuh || 0} 🤏${data.copet || 0}\n`
        if(rank < crimeList.length) cap += `├─────────────────────\n`
    }

    cap += `╰───────────────────────╯\n`
    cap += `\n⚠️ *WASPADA! JANGAN DEKATI MEREKA*`
    cap += `\n\n💡 *.buronan reset* - Reset data buronan`

    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', { contextInfo: { mentionedJid: mentioned } })
}

handler.help = ['buronan']
handler.tags = ['rpg']
handler.command = ['buronan', 'mostwanted', 'topkriminal', 'dpo']
handler.group = true
export default handler