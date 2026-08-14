import fs from 'fs'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
    conn.game = conn.game || {}

    let id = 'tebakgame-' + m.chat
    if (id in conn.game)
        return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.game[id][0])

    let src = JSON.parse(fs.readFileSync('./json/tebakgame.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]

    let caption = `
Logo apakah ini?

⏱ Timeout *${(timeout / 1000).toFixed(0)} detik*
💡 Ketik ${usedPrefix}hgame untuk bantuan
🎁 Bonus: ${poin} XP
`.trim()

    let msg = await conn.sendFile(
        m.chat,
        json.img,
        'tebakgame.jpg',
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
                    `⏰ Waktu habis!\nJawabannya adalah *${json.jawaban}*`,
                    msg
                )
                delete conn.game[id]
            }
        }, timeout)
    ]
}

handler.help = ['tebakgame']
handler.tags = ['game']
handler.command = /^tebakgame$/i
handler.onlyprem = true
handler.game = true

/* ===============================
   INI YANG PALING PENTING
   HANDLER JAWABAN
================================ */
handler.before = async (m, { conn }) => {
    if (!m.text) return

    conn.game = conn.game || {}
    let id = 'tebakgame-' + m.chat
    if (!(id in conn.game)) return

    let [msg, json, poin, timer] = conn.game[id]

    let jawaban = json.jawaban.toLowerCase().trim()
    let teks = m.text.toLowerCase().trim()

    if (teks === jawaban) {
        clearTimeout(timer)

        await conn.reply(
            m.chat,
            `✅ *BENAR!*\n\n🎉 Jawaban: *${json.jawaban}*\n✨ +${poin} XP`,
            msg
        )

        delete conn.game[id]
    }
}

export default handler