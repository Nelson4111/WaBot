import fs from 'fs'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, command, usedPrefix }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'tebakvtuber-' + m.chat
    if (id in conn.game) return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.game[id][0])
    let src = JSON.parse(fs.readFileSync('./json/tebakvtuber.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
${json.deskripsi}

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hvtuber untuk bantuan
Ketik *nyerah* untuk menyerah
Bonus: ${poin} XP

*Note:* Balas/Reply pesan ini untuk menjawab!
`.trim()
    conn.game[id] = [
        await conn.sendMessage(m.chat, { image: { url: json.img }, fileName: 'tebakvtuber.jpg', mimetype: 'image/jpeg', caption: caption }, { quoted: m }),
        json, poin,
        setTimeout(() => {
            if (conn.game[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.game[id][0])
            delete conn.game[id]
        }, timeout)
    ]
}
handler.help = ['tebakvtuber']
handler.tags = ['game']
handler.command = /^tebakvtuber$/i
handler.game = true

export default handler