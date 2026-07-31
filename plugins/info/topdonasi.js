let handler = async (m, { conn }) => {
    let users = global.db.data.users
    let settings = global.db.data.settings[conn.user.jid]
    
    let sortedDonors = Object.entries(users)
        .filter(([_, data]) => data.totalDonasi > 0)
        .sort((a, b) => b[1].totalDonasi - a[1].totalDonasi)
        .slice(0, 10) 

    let totalGlobal = settings.totalDonasi || 0
    
    let teks = `📊 *PAPAN PERINGKAT DONASI*\n`
    teks += `Total Terkumpul: *Rp ${totalGlobal.toLocaleString()}*\n\n`
    
    if (sortedDonors.length === 0) {
        teks += `_Belum ada donatur saat ini._`
    } else {
        teks += sortedDonors.map(([jid, data], i) => {
            let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
            return `${medal} @${jid.split('@')[0]} - *Rp ${data.totalDonasi.toLocaleString()}*`
        }).join('\n')
    }

    teks += `\n\nTerima kasih kepada semuanya yang telah mendukung bot!`

    conn.sendMessage(m.chat, { text: teks, mentions: sortedDonors.map(v => v[0]) }, { quoted: m })
}

handler.help = ['topdonasi']
handler.tags = ['main']
handler.command = /^(topdonasi)$/i

export default handler