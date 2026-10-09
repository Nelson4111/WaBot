import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

let handler = async (m, { conn, groupMetadata }) => {
    let users = global.db.data.users
    let settings = global.db.data.settings[conn.user.jid]
    
    let sortedDonors = filterLeaderboardUsers(Object.entries(users), conn, ([jid]) => jid)
        .filter(([_, data]) => data.totalDonasi > 0)
        .sort((a, b) => b[1].totalDonasi - a[1].totalDonasi)
        .slice(0, 10) 

    let totalGlobal = settings.totalDonasi || 0
    let userDonation = users[m.sender]?.totalDonasi || 0
    
    let teks = `╭─❏「 📊 TOP DONASI 」❏\n`
    teks += `│ 📊 *PAPAN PERINGKAT DONASI*\n`
    teks += `│ 💰 Total Terkumpul : *Rp ${totalGlobal.toLocaleString()}*\n`
    teks += `╰─━━━━━━━━━━━━━━─\n\n`

    teks += `📌 *LIST DONATUR*\n`
    teks += `> ↳ Top 10 Donatur Avelia.\n\n`
    
    let mentionsData = []
    
    if (sortedDonors.length === 0) {
        teks += `> ↳ _Belum ada donatur saat ini._`
    } else {
        teks += sortedDonors.map(([jid, data], i) => {
            let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'
            let nameDisplay = ''
            
            if (data.namaDonasi) {
                nameDisplay = `*${data.namaDonasi}*` // Tidak di-tag, aman secara privasi
            } else {
                const identity = getLeaderboardUserIdentity(jid, { conn, groupMetadata })
                nameDisplay = identity.display
                if (identity.mention) mentionsData.push(identity.mention)
            }
            
            return `${medal} ${nameDisplay} - *Rp ${data.totalDonasi.toLocaleString()}*`
        }).join('\n')
    }

    teks += `\n\n💰 *DONASI KAMU*\n`
    teks += `> ↳ Total : *Rp ${userDonation.toLocaleString()}*\n`
    teks += `> ↳ Terima kasih kepada semuanya yang telah mendukung bot!\n\n`

    teks += `─━━━━━━━━━━━━━━─`

    conn.sendMessage(m.chat, { text: teks, mentions: mentionsData }, { quoted: m })
}

handler.help = ['topdonasi']
handler.tags = ['main']
handler.command = /^(topdonasi)$/i

export default handler