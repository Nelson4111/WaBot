import fs from 'fs'
import { loadDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, usedPrefix: _p }) => {
    let wib = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    let d = new Date(wib)
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

╭──「 *ᴏᴡɴᴇʀ ᴍᴇɴᴜ* 」─✦
│ ⟡ .addlimit  
│ ⟡ .addmoney  
│ ⟡ .addowner  
│ ⟡ .addprem  
│ ⟡ .addsewa  
│ ⟡ .autotyping [on/off]  
│ ⟡ .backup  
│ ⟡ .balas <nomor|pesan>  
│ ⟡ .balas-img <nomor|pesan>  
│ ⟡ .banchat  
│ ⟡ .banned  
│ ⟡ .bcgc <teks>  
│ ⟡ .blacklist <reply|nomor>  
│ ⟡ .broadcast <teks>  
│ ⟡ .cap  
│ ⟡ .checkerror  
│ ⟡ .clearchat  
│ ⟡ .clearsesi  
│ ⟡ .deleteplugin <namafile>  
│ ⟡ .deletesesi  
│ ⟡ .deleteuser  
│ ⟡ .dellimit  
│ ⟡ .delowner  
│ ⟡ .delprem  
│ ⟡ .delsesi  
│ ⟡ .delsewa  
│ ⟡ .disable <option>  
│ ⟡ .enable <option>  
│ ⟡ .getdb  
│ ⟡ .getplugin <text>  
│ ⟡ .getsession  
│ ⟡ .joingc <link>  
│ ⟡ .leavegc  
│ ⟡ .listblacklist  
│ ⟡ .listcap  
│ ⟡ .listgc  
│ ⟡ .listowner  
│ ⟡ .listplugin  
│ ⟡ .listsewa  
│ ⟡ .msgch Ⓟ 
│ ⟡ .o-tagall  
│ ⟡ .o+ @user  
│ ⟡ .oadd @user  
│ ⟡ .out  
│ ⟡ .owner  
│ ⟡ .public  
│ ⟡ .pushkontak  
│ ⟡ .resetlimit  
│ ⟡ .restart  
│ ⟡ .saveplugin  
│ ⟡ .self  
│ ⟡ .sendgc <idgrup> <pesan>  
│ ⟡ .setbio  
│ ⟡ .setredeem  
│ ⟡ .simulate <event> [@mention]  
│ ⟡ .unban  
│ ⟡ .unbanchat  
│ ⟡ .unblacklist <reply|nomor>  
│ ⟡ .uncap  
│ ⟡ .undefined  
│ ⟡ .up-pb  
│ ⟡ .upsw  
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

handler.command = /^menuowner$/i
handler.help = ["menuowner"]
handler.tags = ["main"]

export default handler
