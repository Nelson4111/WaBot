import { loadDB, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
    const wdb = loadDB()
    if(!wdb.crime) return m.reply('📋 Belum ada data kriminal di kota ini')

    let crimeList = Object.entries(wdb.crime)
      .filter(([jid, data]) => data.total > 0)
      .sort((a, b) => b[1].total - a[1].total)
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
        cap += `│ 💀 Total : *${data.total}x Kejahatan*\n`
        cap += `│ 🕵️${data.rampok} 🏴‍☠️${data.begal} 🔪${data.bunuh}\n`
        if(rank < crimeList.length) cap += `├─────────────────────\n`
    }

    cap += `╰───────────────────────╯\n`
    cap += `\n⚠️ *WASPADA! JANGAN DEKATI MEREKA*`

    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', { contextInfo: { mentionedJid: mentioned } })
}

handler.help = ['buronan']
handler.tags = ['rpg']
handler.command = ['buronan', 'mostwanted', 'topkriminal', 'dpo'] // ganti dari 'wanted'
handler.group = true
export default handler