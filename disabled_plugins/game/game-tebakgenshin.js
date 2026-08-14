import fs from 'fs'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakgenshin = conn.tebakgenshin ? conn.tebakgenshin : {}
    let id = m.chat
    if (id in conn.tebakgenshin) {
        conn.reply(m.chat, 'Masih ada soal yang belum terjawab di chat ini', conn.tebakgenshin[id][0])
        throw false
    }

    let src = JSON.parse(fs.readFileSync('./json/tebakgenshin.json'))
    let json = src[Math.floor(Math.random() * src.length)]
    
    let caption = `
🎮 *TEBAK GENSHIN* 🎮

Siapakah nama character ini?

Timeout: *${(timeout / 1000).toFixed(0)} detik*
Bonus: *${poin} XP*

Ketik *${usedPrefix}hgenshin* untuk bantuan!

_Balas gambar ini untuk menjawab!_
`.trim()

    conn.tebakgenshin[id] = [
        await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption }, { quoted: m }),
        json, poin,
        setTimeout(() => {
            if (conn.tebakgenshin[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah: *${json.jawaban}*`, conn.tebakgenshin[id][0])
            delete conn.tebakgenshin[id]
        }, timeout)
    ]
}

handler.help = ['tebakgenshin']
handler.tags = ['game']
handler.command = ['tebakgenshin']
handler.limit = false

export default handler
