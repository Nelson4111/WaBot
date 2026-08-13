import { loadDB } from '../../lib/waifuHelper.js'
import { generateProfileCard } from '../../lib/cardGenerator.js'
import { createHash } from 'crypto'

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
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    who = conn.decodeJid(who)

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
        if (pasangan.length === 1) {
            let dur = formatDuration(Date.now() - pasangan[0].nikahTime)
            partnerText = `@${pasangan[0].jid.split('@')[0]} (${dur})`
        } else {
            partnerText = '\n' + pasangan.map((p, i) => {
                let dur = formatDuration(Date.now() - p.nikahTime)
                return `  ${i + 1}. @${p.jid.split('@')[0]} (${dur})`
            }).join('\n')
        }
    } else {
        const couple = wdb.couples?.[who]
        if (couple) partnerText = couple.charName
    }

    let sn = createHash('md5').update(who).digest('hex')
    
    let caption = `乂 *U S E R - P R O F I L E* 乂\n
◈ *Nama* : ${name || username}
◈ *Umur* : ${age} Tahun
◈ *Uang Cash* : Rp ${uang.toLocaleString('id-ID')}
◈ *Uang Bank* : Rp ${(user.bank || 0).toLocaleString('id-ID')}
◈ *Pasangan* : ${partnerText}
◈ *Number* : @${who.split('@')[0]}
◈ *SN Key* : ${sn}\n
『 REGISTERED : ${registered ? '✅' : '❌'} 』`

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