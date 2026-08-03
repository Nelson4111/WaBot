import { loadDB } from '../../lib/waifuHelper.js'
import { generateProfileCard } from '../../lib/cardGenerator.js'

const formatDuration = (ms) => {
    let seconds = Math.floor(ms / 1000)
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)
    let days = Math.floor(hours / 24)
    if (days > 0) return `${days} Hari`
    if (hours > 0) return `${hours} Jam`
    return `${minutes} Menit`
}

let handler = async (m, { conn }) => {
    // Hanya pakai mentionedJid jika user secara eksplisit mention seseorang di teks pesan
    let hasMention = /(@\d{5,})/.test(m.text || '')
    let rawWho = (hasMention && m.mentionedJid?.[0]) || (m.fromMe ? conn.user.jid : m.sender)
    let who = conn.decodeJid(rawWho)

    let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
    try { pp = await conn.profilePictureUrl(who, 'image') } catch {}

    let user = global.db.data.users[who] || {}
    let { name, registered = false, age = '-', role = 'User', limit = 0, exp = 0, premiumTime = 0, pasangan = [] } = user
    let username = registered ? name || conn.getName(who) : conn.getName(who)

    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')
    if (owners.includes(who)) role = 'Owner'

    let status = premiumTime > 0 ? 'Premium' : 'Free'

    const wdb = loadDB()
    const uang = wdb.money?.[who] || 0

    let partnerText = '💔 Jomblo'
    if (pasangan && pasangan.length > 0) {
        partnerText = pasangan.map(p => {
            let dur = formatDuration(Date.now() - p.nikahTime)
            return `@${p.jid.split('@')[0]} (${dur})`
        }).join(', ')
    } else {
        const couple = wdb.couples?.[who]
        if (couple) partnerText = couple.charName
    }

    // Caption teks (pasangan & number tetap di caption karena tidak muat di kartu)
    let caption = `乂 *U S E R - P R O F I L E* 乂\n\n◈ *Pasangan* : ${partnerText}\n◈ *Number* : @${who.split('@')[0]}\n\n『 REGISTERED : ${registered ? '✅' : '❌'} 』`

    let mentions = [who]
    if (pasangan && pasangan.length > 0) pasangan.forEach(p => mentions.push(p.jid))

    // Generate kartu gambar lokal
    let cardBuf
    try {
        cardBuf = await generateProfileCard({ avatarUrl: pp, username, role, status, exp, limit, uang, registered })
    } catch (e) {
        console.error('[ProfileCard] Gagal generate kartu:', e.message)
    }

    if (cardBuf) {
        await conn.sendMessage(m.chat, { image: cardBuf, caption, mentions }, { quoted: m })
    } else {
        // Fallback ke foto profil biasa jika generate gagal
        await conn.sendFile(m.chat, pp, 'profile.jpg', caption, m, false, { mentions })
    }
}

handler.help = ['profile', 'me']
handler.tags = ['info']
handler.command = /^(profile|me|profil)$/i

export default handler