import fs from 'fs'
import { loadDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, usedPrefix: _p }) => {
    let d = new Date(new Date + 3600000)
    let locale = 'id-ID'
    let tanggal = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let hari = d.toLocaleDateString(locale, { weekday: 'long' })
    let jam = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

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
│ 𖥔  ʟɪᴍɪᴛ ꜰᴇᴀᴛᴜʀᴇ : Ⓛ
╰ 𖥔  ᴘʀᴇᴍɪᴜᴍ ꜰᴇᴀᴛᴜʀᴇ : Ⓟ

╭──「 *ᴀʙᴏᴜᴛ* 」✦
│ 𖥔  ᴛᴀɴɢɢᴀʟ : ${tanggal}
│ 𖥔  ʜᴀʀɪ : ${hari}
│ 𖥔  ᴊᴀᴍ : ${jam} WIB
╰──

╭──「 *sᴛɪᴄᴋᴇʀ ᴍᴇɴᴜ* 」─✦
│ ⟡ .8ball  
│ ⟡ .attp  
│ ⟡ .avatar  
│ ⟡ .brat <text>  Ⓛ
│ ⟡ .bratcolor <teks>|<warna>  Ⓛ
│ ⟡ .brathd <text>  Ⓛ
│ ⟡ .bratvid <teks>  Ⓛ
│ ⟡ .cuddle  
│ ⟡ .emojigif <emoji>  Ⓛ
│ ⟡ .emojimix  Ⓛ
│ ⟡ .feed  
│ ⟡ .fox_girl  
│ ⟡ .gasm  
│ ⟡ .gecg  
│ ⟡ .gifsticker <query>,<jumlah>  
│ ⟡ .goose  
│ ⟡ .hug  
│ ⟡ .kiss  
│ ⟡ .lewd  
│ ⟡ .lizard  
│ ⟡ .meow  
│ ⟡ .neko  
│ ⟡ .ngif  
│ ⟡ .pat  
│ ⟡ .qc <text>  Ⓛ
│ ⟡ .qc2 <warna>  Ⓛ
│ ⟡ .slap  
│ ⟡ .smeme <teks atas>|<teks bawah>  Ⓛ
│ ⟡ .smug  
│ ⟡ .spank  
│ ⟡ .sticker [packname|author]  
│ ⟡ .stickerly <link>  Ⓛ
│ ⟡ .stickerlysearch <keyword>  Ⓛ
│ ⟡ .stickerlysearch <query>  
│ ⟡ .stickersearch <query>  Ⓛ
│ ⟡ .stikwiki <kata kunci>  Ⓛ
│ ⟡ .telestick <url> Ⓟ 
│ ⟡ .tickle  
│ ⟡ .toimg (reply)  Ⓛ
│ ⟡ .tovideo  Ⓛ
│ ⟡ .ttp  
│ ⟡ .v3  
│ ⟡ .waifu  
│ ⟡ .wallpaper  
│ ⟡ .wm <packname>|<author>  
│ ⟡ .woof  
╰──
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

handler.command = /^menusticker$/i
handler.help = ["menusticker"]
handler.tags = ["main"]

export default handler