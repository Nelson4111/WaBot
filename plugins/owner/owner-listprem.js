let handler = async (m, { conn, args }) => {
    // Mengambil semua user yang berstatus premium
    let users = global.db.data.users
    let premiumUsers = Object.keys(users).filter(jid => users[jid].premiumTime > 0)
    
    if (premiumUsers.length === 0) return m.reply("❌ Tidak ada user premium saat ini.")

    // Sorting berdasarkan waktu kadaluarsa terdekat
    premiumUsers.sort((a, b) => users[b].premiumTime - users[a].premiumTime)

    let txt = `🌟 *DAFTAR USER PREMIUM* 🌟\n`
    txt += `Total: ${premiumUsers.length} User\n\n`

    for (let i = 0; i < premiumUsers.length; i++) {
        let jid = premiumUsers[i]
        let name = users[jid].name || "User"
        let remain = users[jid].premiumTime - new Date().getTime()
        
        txt += `┌ *${i + 1}. ${name}*\n`
        txt += `┊ ID: @${jid.split('@')[0]}\n`
        txt += `┊ Sisa: ${remain > 0 ? clockString(remain) : 'Expired'}\n`
        txt += `└───────────────\n\n`
    }

    // Mengirim pesan dengan mention agar nama terlihat
    conn.sendMessage(m.chat, { 
        text: txt, 
        mentions: premiumUsers 
    }, { quoted: m })
}

handler.help = ['premlist', 'cekprem']
handler.tags = ['info']
handler.command = /^(premlist|cekprem|listprem)$/i

export default handler

function clockString(ms) {
    let days = Math.floor(ms / (24 * 60 * 60 * 1000))
    let daysms = ms % (24 * 60 * 60 * 1000)
    let hours = Math.floor(daysms / (60 * 60 * 1000))
    let hoursms = ms % (60 * 60 * 1000)
    let minutes = Math.floor(hoursms / (60 * 1000))
    let sec = Math.floor((hoursms % (60 * 1000)) / 1000)
    
    let result = ""
    if (days > 0) result += `${days}h `
    if (hours > 0) result += `${hours}j `
    if (minutes > 0) result += `${minutes}m `
    if (sec > 0) result += `${sec}s`
    
    return result.trim()
}