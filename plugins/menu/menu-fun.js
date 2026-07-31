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

╭──「 *ғᴜɴ ᴍᴇɴᴜ* 」─✦
│ ⟡ .alay
│ ⟡ .alimcek
│ ⟡ .angka
│ ⟡ .anjingcek
│ ⟡ .apakah
│ ⟡ .babicek
│ ⟡ .baikcek
│ ⟡ .bapercek
│ ⟡ .bebancek
│ ⟡ .begocek
│ ⟡ .benarkah
│ ⟡ .bisakah
│ ⟡ .cantikcek
│ ⟡ .cekalim
│ ⟡ .cekanjing
│ ⟡ .cekbabi
│ ⟡ .cekbaik
│ ⟡ .cekbaper
│ ⟡ .cekbeban
│ ⟡ .cekbego
│ ⟡ .cekcantik
│ ⟡ .cekfakboy
│ ⟡ .cekfakgirl
│ ⟡ .cekfemboy
│ ⟡ .cekganteng
│ ⟡ .cekgay
│ ⟡ .cekgoblok
│ ⟡ .cekharam
│ ⟡ .cekjago
│ ⟡ .cekjahat
│ ⟡ .cekjelek
│ ⟡ .cekkeren
│ ⟡ .cekkhodam
│ ⟡ .cekkontol
│ ⟡ .cekkul
│ ⟡ .ceklesbi
│ ⟡ .cekmemek
│ ⟡ .ceknolep
│ ⟡ .cekpakboy
│ ⟡ .cekpakgirl
│ ⟡ .cekpasarkas
│ ⟡ .cekpinter
│ ⟡ .ceksange
│ ⟡ .ceksuhu
│ ⟡ .cektt
│ ⟡ .cekwibu
│ ⟡ .demorse
│ ⟡ .dimanakah
│ ⟡ .fakboycek
│ ⟡ .fakgirlcek
│ ⟡ .femboycek
│ ⟡ .gaycek
│ ⟡ .goblokcek
│ ⟡ .haramcek
│ ⟡ .jadian
│ ⟡ .jagocek
│ ⟡ .jahatcek
│ ⟡ .jelekcek
│ ⟡ .kapankah
│ ⟡ .kematian
│ ⟡ .kerang
│ ⟡ .kerangajaib
│ ⟡ .kerencek
│ ⟡ .kulcek
│ ⟡ .lesbicek
│ ⟡ .mimpi
│ ⟡ .morse
│ ⟡ .moveon
│ ⟡ .nolepcek
│ ⟡ .pakboycek
│ ⟡ .pakgirlcek
│ ⟡ .pantun
│ ⟡ .pasarkascek
│ ⟡ .pintercek
│ ⟡ .ramal
│ ⟡ .rate
│ ⟡ .sangecek
│ ⟡ .seberapagila
│ ⟡ .sertifikatcinta
│ ⟡ .sertifikatlemot
│ ⟡ .sipaling
│ ⟡ .soundmeme
│ ⟡ .suhucek
│ ⟡ .suitpvp
│ ⟡ .suratcinta
│ ⟡ .tebakumur
│ ⟡ .top
│ ⟡ .wibucek
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

handler.command = /^menufun$/i
handler.help = ["menufun"]
handler.tags = ["main"]

export default handler