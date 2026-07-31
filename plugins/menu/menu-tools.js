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

╭──「 *ᴛᴏᴏʟs ᴍᴇɴᴜ* 」─✦
│ ⟡ .amdata  
│ ⟡ .animecheck  Ⓛ
│ ⟡ .animefinder  
│ ⟡ .breach <email>  Ⓛ
│ ⟡ .catbox  Ⓛ
│ ⟡ .ccgen <type> <jumlah>  
│ ⟡ .cekhost  
│ ⟡ .cekidch  
│ ⟡ .cekidch2 <link>  
│ ⟡ .cekmail <token>  Ⓛ
│ ⟡ .cekqr  Ⓛ
│ ⟡ .cekresi <no resi>|<ekspedisi>  Ⓛ
│ ⟡ .checkhost  
│ ⟡ .chord <judul lagu>  Ⓛ
│ ⟡ .codegen <lang> <model> <prompt>  Ⓛ
│ ⟡ .convertcode  Ⓛ
│ ⟡ .copy email/token <isi>  Ⓛ
│ ⟡ .cuaca  
│ ⟡ .decode  
│ ⟡ .demorse  
│ ⟡ .detectbug  Ⓛ
│ ⟡ .ekspedisilist  
│ ⟡ .encode  
│ ⟡ .enhance  
│ ⟡ .explaincode  Ⓛ
│ ⟡ .fakektp  
│ ⟡ .fstik Ⓟ 
│ ⟡ .getcode <url>  
│ ⟡ .gsmarena <nama hp>  
│ ⟡ .hd  Ⓛ
│ ⟡ .hdvid Ⓟ Ⓛ
│ ⟡ .hdvideo Ⓟ Ⓛ
│ ⟡ .identifyanime  Ⓛ
│ ⟡ .igstalk  Ⓛ
│ ⟡ .imagesolve  Ⓛ
│ ⟡ .imgtools <type>  Ⓛ
│ ⟡ .ip  Ⓛ
│ ⟡ .jadwaltv  
│ ⟡ .jarak dari|ke  
│ ⟡ .mikutalk <teks>  Ⓛ
│ ⟡ .morse  
│ ⟡ .nik <nomor>  
│ ⟡ .numbgen  
│ ⟡ .ocr  
│ ⟡ .pesanmail <id>  Ⓛ
│ ⟡ .promptcode  Ⓛ
│ ⟡ .qr <teks>  
│ ⟡ .read  
│ ⟡ .readmore <teks>|<teks>  
│ ⟡ .redirect  
│ ⟡ .remini  Ⓛ
│ ⟡ .removebg  
│ ⟡ .rvo  Ⓛ
│ ⟡ .s2c <url>  
│ ⟡ .searchcode <query>  
│ ⟡ .shareteks teks  Ⓛ
│ ⟡ .spamwa <number>|<mesage>|<no of messages>  Ⓛ
│ ⟡ .ssweb <url>  Ⓛ
│ ⟡ .swgc  
│ ⟡ .tembox [prefix]  Ⓛ
│ ⟡ .temboxcek <token>  Ⓛ
│ ⟡ .tempmail  Ⓛ
│ ⟡ .toaudio  Ⓛ
│ ⟡ .tomp3  Ⓛ
│ ⟡ .tourl  
│ ⟡ .transcibe url-video-yt  Ⓛ
│ ⟡ .translate *ᴛᴇxᴛ* │ ⟡ .unblur  Ⓛ
│ ⟡ .unblur mild  Ⓛ
│ ⟡ .upload  
│ ⟡ .upscale  Ⓛ
│ ⟡ .upswgc  
│ ⟡ .waifufilterlist  Ⓛ
│ ⟡ .waifuhtm [filter]  Ⓛ
│ ⟡ .waifutagger  Ⓛ
│ ⟡ .whatanime  Ⓛ
│ ⟡ .wt  Ⓛ
│ ⟡ .yts <query>  Ⓛ
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

handler.command = /^menutools$/i
handler.help = ["menutools"]
handler.tags = ["main"]

export default handler