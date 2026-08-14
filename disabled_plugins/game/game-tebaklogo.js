import fs from 'fs'

const timeout = 120000
const poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
    conn.game = conn.game ? conn.game : {}

    let id = 'tebaklogo-' + m.chat
    if (id in conn.game)
        return conn.reply(m.chat, '❌ Masih ada soal belum terjawab!', conn.game[id][0])

    let src = JSON.parse(fs.readFileSync('./json/tebaklogo.json'))
    let json = src[Math.floor(Math.random() * src.length)]

    let caption = `
${json.deskripsi}

⏱ Timeout *${timeout / 1000} detik*
💡 Ketik *${usedPrefix}hlogo* untuk bantuan
🎁 Bonus: *${poin} XP*
`.trim()

    let msg = await conn.sendFile(
        m.chat,
        json.img,
        'tebaklogo.jpg',
        caption,
        m
    )

    conn.game[id] = [
        msg,
        json,
        poin,
        setTimeout(() => {
            if (conn.game[id]) {
                conn.reply(
                    m.chat,
                    `⏰ *Waktu Habis!*\nJawabannya: *${json.jawaban}*`,
                    msg
                )
                delete conn.game[id]
            }
        }, timeout)
    ]
}

handler.before = async function (m) {
    if (!m.text) return
    let conn = this

    conn.game = conn.game ? conn.game : {}
    let id = 'tebaklogo-' + m.chat
    if (!(id in conn.game)) return

    let [, json, poin, timer] = conn.game[id]

    let teks = m.text.toLowerCase().trim()
    let jawaban = json.jawaban.toLowerCase().trim()

    // abaikan command
    if (teks.startsWith('.') || teks.startsWith('/')) return

    if (teks === jawaban) {
        clearTimeout(timer)
        delete conn.game[id]

        global.db.data.users[m.sender].exp += poin

        return conn.reply(
            m.chat,
            `✅ *BENAR!*\n+${poin} XP`,
            m
        )
    }
}

handler.help = ['tebaklogo']
handler.tags = ['game']
handler.command = /^tebaklogo$/i
handler.game = true
handler.onlyprem = true

export default handler