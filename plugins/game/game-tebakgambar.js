import fs from 'fs'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, command, usedPrefix }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'tebakgambar-' + m.chat

    if (id in conn.game)
        return conn.reply(
            m.chat,
            `╭─❏「 🖼️ TEBAK GAMBAR 」❏\n` +
            `│ ⏳ *Masih ada soal belum terjawab di chat ini.*\n` +
            `╰─━━━━━━━━━━━━━━─`,
            conn.game[id][0]
        )

    let src = JSON.parse(fs.readFileSync('./json/tebakgambar.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]

    let caption = `╭─❏「 🖼️ TEBAK GAMBAR 」❏\n`
    caption += `│ 🖼️ APA ARTI DARI GAMBAR INI?`
    caption += `╰─━━━━━━━━━━━━━━─\n\n`

    caption += `🖼️ ${json.deskripsi}\n\n`

    caption += `📋 *INFORMASI PERMAINAN*\n`
    caption += `> ↳ ⏱️ Timeout : *${(timeout / 1000).toFixed(2)} detik*\n`
    caption += `> ↳ 💡 Ketik *${usedPrefix}hgamb* untuk bantuan\n`
    caption += `> ↳ ⭐ Bonus : ${poin} XP\n\n`

    caption += `─━━━━━━━━━━━━━━─`

    conn.game[id] = [
        await conn.sendMessage(
            m.chat,
            {
                image: { url: json.img },
                fileName: 'tebakgambar.jpg',
                mimetype: 'image/jpeg',
                caption: caption
            },
            { quoted: m }
        ),
        json,
        poin,
        setTimeout(() => {
            if (conn.game[id])
                conn.reply(
                    m.chat,
                    `╭─❏「 ⏰ TEBAK GAMBAR 」❏\n` +
                    `│ ⏰ *Waktu habis!*\n` +
                    `╰─━━━━━━━━━━━━━━─\n\n` +
                    `📋 *JAWABAN*\n` +
                    `> ↳ *${json.jawaban}*\n\n` +
                    `─━━━━━━━━━━━━━━─`,
                    conn.game[id][0]
                )
            delete conn.game[id]
        }, timeout)
    ]
}

handler.help = ['tebakgambar']
handler.tags = ['game']
handler.command = /^tebakgambar$/i

handler.onlyprem = true
handler.game = true

export default handler