import fs from 'fs'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakkota = conn.tebakkota ? conn.tebakkota : {}
    let id = m.chat
    if (id in conn.tebakkota) {
        conn.reply(m.chat, 'Masih ada soal yang belum terjawab di chat ini', conn.tebakkota[id][0])
        throw false
    }

    let src = JSON.parse(fs.readFileSync('./json/tebakkota.json'))
    let json = src[Math.floor(Math.random() * src.length)]
    
    let caption = `
🎮 *TEBAK KOTA* 🎮

*Pertanyaan:*
${json.pertanyaan}

Timeout: *${(timeout / 1000).toFixed(0)} detik*
Bonus: *${poin} XP*

Ketik *${usedPrefix}hkota* untuk bantuan!

_Balas pesan ini untuk menjawab!_
`.trim()

    conn.tebakkota[id] = [
        await conn.reply(m.chat, caption, m),
        json, poin,
        setTimeout(() => {
            if (conn.tebakkota[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah: *${json.jawaban}*`, conn.tebakkota[id][0])
            delete conn.tebakkota[id]
        }, timeout)
    ]
}

handler.help = ['tebakkota']
handler.tags = ['game']
handler.command = ['tebakkota']

export default handler
