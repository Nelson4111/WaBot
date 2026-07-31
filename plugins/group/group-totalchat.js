import { getChatData } from '../../lib/totalchat.js'

let handler = async (m, { conn }) => {
    let gid = m.chat
    let allChatData = getChatData() 
    let groupData = allChatData[gid] || {}

    let data = Object.entries(groupData)
        .map(([jid, total]) => ({ jid, total }))
        .filter(v => 
            v.jid.endsWith('@s.whatsapp.net') && 
            !v.jid.includes(':') && 
            !v.jid.includes('lid') && 
            v.total > 0
        )
        .sort((a, b) => b.total - a.total)
        .slice(0, 100)

    if (data.length === 0)
        return m.reply('📭 Belum ada statistik chat.')

    let text = `━━━ 『 📊 TOP 100 』 ━━━\n\n`
    let mentions = []
    
    data.forEach((v, i) => {
        let tag = v.jid.split('@')[0]
        text += `${i + 1}. @${tag}  ➔  *${v.total}* pesan\n`
        mentions.push(v.jid)
    })

    return conn.sendMessage(m.chat, {
        text: text.trim(),
        mentions
    }, { quoted: m })
}

handler.help = ['totalchat']
handler.tags = ['group']
handler.command = /^(totalchat|gcstat)$/i
handler.group = true

export default handler