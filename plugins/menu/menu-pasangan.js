import fs from 'fs'
import { loadDB } from '../../lib/waifuHelper.js'

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
    let prems = premiumTime > 0 ? 'ᴘʀᴇᴍɪᴜᴍ' : 'ғʀᴇᴇ'

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

╭──「 *ᴍᴇɴᴜ • ᴘᴀsᴀɴɢᴀɴ & ʀᴏᴍᴀɴsᴀ* 」✦
│ 💍 ${_p}lamar @user
│ 💍 ${_p}nikah @user
│ 💍 ${_p}tembak @user
│ ✅ ${_p}terima
│ ❌ ${_p}tolak
│ 💔 ${_p}cerai @user
│ 💕 ${_p}pasangan / ${_p}ceknikah
│ 🍿 ${_p}kencan
│ 🛒 ${_p}belicincin
│ 🎁 ${_p}hadiah @user <jumlah>
│ 🖼️ ${_p}kartunikah / ${_p}bukunikah
│
│ 💘 ${_p}jodoh / ${_p}jodohku (Tag Random Jodoh)
│ 💖 ${_p}cekisihati @user
│ 👩‍❤️‍👨 ${_p}jodohin @u1 @u2 / ${_p}cekjodoh
│ 🤫 ${_p}selingkuh @user
│ 🔮 ${_p}pelet @user
│ 💬 ${_p}bucin
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

handler.help = ['menupasangan']
handler.tags = ['main']
handler.command = /^(menupasangan)$/i

export default handler