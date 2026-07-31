import PhoneNumber from 'awesome-phonenumber'
import { loadDB } from '../../lib/waifuHelper.js'

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
    let who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)
    let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'

    try {
        pp = await conn.profilePictureUrl(who, 'image')
    } catch {}

    let user = global.db.data.users[who] || {}
    let { name, registered = false, age = '-', role = 'User', limit = 0, exp = 0, premiumTime = 0, pasangan = [] } = user
    let username = registered ? name || conn.getName(who) : conn.getName(who)

    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')
    if (owners.includes(who)) role = 'Owner'

    let status = premiumTime > 0 ? 'Premium' : 'Free'
    let regStatus = registered ? '✅' : '❌'

    const wdb = loadDB()
    const uang = wdb.money?.[who] || 0

    let partnerText = '💔 Jomblo'
    if (pasangan && pasangan.length > 0) {
        partnerText = pasangan.map(p => {
            let pName = conn.getName(p.jid)
            let dur = formatDuration(Date.now() - p.nikahTime)
            return `@${p.jid.split('@')[0]} (${dur})`
        }).join(', ')
    } else {
        const couple = wdb.couples?.[who]
        if (couple) partnerText = couple.charName
    }

    let text = `
乂 *U S E R - P R O F I L E* 乂

◈ *Name* : ${username}
◈ *Age* : ${age}
◈ *Role* : ${role}
◈ *Status* : ${status}
◈ *Uang* : Rp ${uang.toLocaleString('id-ID')}
◈ *Limit* : ${limit}
◈ *Exp* : ${exp}
◈ *Pasangan* : ${partnerText}
◈ *Number* : ${PhoneNumber('+' + who.split('@')[0]).getNumber('international')}

『 REGISTERED : ${regStatus} 』
`.trim()

    let mentions = [who]
    if (pasangan && pasangan.length > 0) {
        pasangan.forEach(p => mentions.push(p.jid))
    }

    await conn.sendFile(m.chat, pp, 'profile.jpg', text, m, false, { mentions })
}

handler.help = ['profile', 'me']
handler.tags = ['info']
handler.command = /^(profile|me|profil)$/i

export default handler