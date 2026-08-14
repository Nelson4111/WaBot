import fs from 'fs'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan : {}
    let id = m.chat
    if (id in conn.tebakhewan) {
        conn.reply(m.chat, 'Masih ada soal yang belum terjawab di chat ini', conn.tebakhewan[id][0])
        throw false
    }

    let src = JSON.parse(fs.readFileSync('./json/tebakhewan.json'))
    let json = src[Math.floor(Math.random() * src.length)]
    
    let caption = `
🎮 *TEBAK HEWAN* 🎮

*Pertanyaan:*
${json.pertanyaan}

Timeout: *${(timeout / 1000).toFixed(0)} detik*
Bonus: *${poin} XP*
Ketik *${usedPrefix}hhewan* untuk bantuan!

_Balas pesan ini untuk menjawab!_
`.trim()

    conn.tebakhewan[id] = [
        await conn.reply(m.chat, caption, m),
        json, poin,
        setTimeout(() => {
            if (conn.tebakhewan[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah: *${json.jawaban}*`, conn.tebakhewan[id][0])
            delete conn.tebakhewan[id]
        }, timeout)
    ]
}

handler.help = ['tebakhewan']
handler.tags = ['game']
handler.command = ['tebakhewan']
handler.limit = true

export default handler
