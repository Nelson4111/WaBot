import fs from 'fs'
import { loadDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
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
    let prems = premiumTime > 0 ? 'ᴘʀᴇᴍɪᴜᴍ' : 'ғʀᴇᴇ'

    let moneytrackFeatures = Object.values(global.plugins)
        .filter(p => !p.disabled && p.tags && (p.tags.includes('moneytrack') || p.tags.includes('uang')))
        .flatMap(p => (Array.isArray(p.help) ? p.help : [p.help]).map(cmd => ({
            cmd: p.prefix ? cmd : _p + cmd,
            limit: p.limit,
            premium: p.premium
        })))
        .sort((a, b) => a.cmd.localeCompare(b.cmd))
        .map(v => `│ 𖥔 ${v.cmd} ${v.premium ? 'Ⓟ' : ''}${v.limit ? 'Ⓛ' : ''}`)
        .join('\n')

    let videoMenu = null
    try {
        const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
        videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
    } catch { videoMenu = null }

    let menuText = `
[ ⛩️ ]───[ *_ɪɴғᴏ • ᴜsᴇʀ_* ]───✦
╭ 𖥔  ɴᴀᴍᴀ : ${name}
│ 𖥔  ʀᴏʟᴇ : ${role}
│ 𖥔  ᴜꜱᴇʀ : ${prems}
│ 𖥔  ʟɪᴍɪᴛ : ${limit}
╰ 𖥔  ᴍᴏɴᴇʏ : ${uang.toLocaleString('id-ID')}

[ ⛩️ ]───[ *_ɪɴғᴏ • ʙᴏᴛ_* ]───✦
╭ 𖥔  ɴᴀᴍᴀ ʙᴏᴛ : ${global.namebot}
│ 𖥔  ᴠᴇʀsɪ : ${global.versi}
│ 𖥔  ᴄʀᴇᴀᴛᴏʀ : ${global.author}
│ 𖥔  ᴍᴏᴅᴇ : Public
╰

╭──「 *ᴀʙᴏᴜᴛ* 」✦
│ 𖥔  ᴛᴀɴɢɢᴀʟ : ${tanggal}
│ 𖥔  ʜᴀʀɪ : ${hari}
│ 𖥔  ᴊᴀᴍ : ${jam} WIB
╰──

╭──「 *ᴍᴇɴᴜ • ᴍᴏɴᴇʏᴛʀᴀᴄᴋ* 」─✦
${moneytrackFeatures}
╰──

_Terima kasih sudah menggunakan ${global.namebot}_
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

handler.help = ['menumoneytrack']
handler.tags = ['main']
handler.command = /^(menumoneytrack|menumt|moneymenu)$/i

export default handler
