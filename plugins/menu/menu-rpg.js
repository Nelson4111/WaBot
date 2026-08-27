import fs from 'fs'
import { loadDB } from '../../lib/waifuHelper.js'
import { getGreeting } from '../../lib/style.js'

let handler = async (m, { conn, usedPrefix: _p }) => {
    let wib = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    let d = new Date(wib)
    let locale = 'id-ID'
    let tanggal = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let hari = d.toLocaleDateString(locale, { weekday: 'long' })
    let jam = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })

    let user = global.db.data.users[m.sender] || {}
    const wdb = loadDB()
    const uang = wdb.money?.[m.sender] || 0
    let { limit = 0, role = 'User', name = m.pushName, premiumTime = 0 } = user
    let prems = premiumTime > 0 ? 'Premium Ⓟ' : 'Free Ⓛ'
    let greeting = getGreeting(name, d.getHours())

    // CEK APA DI PENJARA
    let userRPG = wdb.users?.[m.sender]?.rpg
    let diPenjara = false
    let infoPenjara = ''
    if (userRPG?.penjara && Date.now() - userRPG.penjara < userRPG.lamaPenjara) {
        diPenjara = true
        let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
        let jamSisa = Math.floor(sisa / 3600000)
        let menitSisa = Math.floor((sisa % 3600000) / 60000)
        infoPenjara = `〔 ⚠️ *KAMU DI PENJARA* 〕\n⟡ *Sel* : ${userRPG.sel}\n⟡ *Sisa Waktu* : ${jamSisa}j ${menitSisa}m\n⟡ *Tebusan* : Rp ${userRPG.tebusan.toLocaleString('id-ID')}\n⟡ _Semua command RPG diblokir. Minta teman *.tebus @kamu* atau tunggu bebas._\n\n`
    }

    let rpgFeatures = ''
    if (diPenjara) {
        rpgFeatures = `⟡ 🔒 Semua command RPG dikunci sampai kamu bebas dari penjara.`
    } else {
        rpgFeatures = Object.values(global.plugins)
            .filter(p => !p.disabled && p.tags && p.tags.includes('rpg'))
            .flatMap(p => (Array.isArray(p.help) ? p.help : [p.help]).map(cmd => ({
                cmd: p.prefix ? cmd : _p + cmd,
                limit: p.limit,
                premium: p.premium
            })))
            .sort((a, b) => a.cmd.localeCompare(b.cmd))
            .map(v => `│ ⟡ ${v.cmd} ${v.premium ? 'Ⓟ' : ''}${v.limit ? 'Ⓛ' : ''}`)
            .join('\n')
    }

    let videoMenu = null
    try {
        const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
        videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
    } catch { videoMenu = null }

    let menuText = `
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
   〔 ✦ *RPG ADVENTURE MENU* 〕
> ${greeting}
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆

${infoPenjara}┌──〔 ✦ *PROFIL PENGGUNA* 〕
│ ⟡ *Nama* : ${name}
│ ⟡ *Role* : ${role}
│ ⟡ *Status* : ${prems}
│ ⟡ *Limit* : ${limit}
│ ⟡ *Saldo* : Rp ${uang.toLocaleString('id-ID')}
└────────────────────────

┌──〔 ✦ *WAKTU & TANGGAL* 〕
│ ⟡ *Tanggal* : ${tanggal}
│ ⟡ *Hari* : ${hari}
│ ⟡ *Jam* : ${jam} WIB
└────────────────────────

┌──〔 ✦ *DAFTAR PERINTAH* 〕
${rpgFeatures}
└────────────────────────

· · ─ ─ ✦ ─ ─ · ·
> _Terima kasih sudah menggunakan ${global.namebot}_
`.trim()

    let contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterName: `「 ${global.namebot} 」`,
            newsletterJid: global.ch
        }
    }

    if (videoMenu) {
        await conn.sendMessage(m.chat, {
            video: { url: videoMenu },
            gifPlayback: true,
            caption: menuText,
            footer: global.namebot,
            mentions: [m.sender],
            contextInfo
        }, { quoted: m })
    } else {
        await conn.sendMessage(m.chat, {
            text: menuText,
            footer: global.namebot,
            mentions: [m.sender],
            contextInfo
        }, { quoted: m })
    }
}

handler.command = /^menurpg$/i
handler.help = ["menurpg"]
handler.tags = ["main"]

export default handler