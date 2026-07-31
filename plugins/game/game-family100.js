import fs from 'fs'

const winScore = 4999
const GAME_TIME = 1000 * 60 * 5 

async function handler(m) {
    this.game = this.game ? this.game : {}

    let id = 'family100_' + m.chat
    if (id in this.game)
        return this.reply(
            m.chat,
            '⏳ Masih ada kuis Family100 yang berjalan!',
            this.game[id].msg
        )

    let src = JSON.parse(fs.readFileSync('./json/family100.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]

    let caption = `
*Soal:* ${json.soal}
Terdapat *${json.jawaban.length}* jawaban
⏱️ Waktu: *5 menit*
🆘 Ketik *menyerah* untuk mengakhiri permainan
+${winScore} XP tiap jawaban benar
`.trim()

    let msg = await m.reply(caption)

    let timeout = setTimeout(() => {
        if (!this.game[id]) return

        this.reply(
            m.chat,
            `⏰ *Waktu habis!*\n\nJawaban:\n- ${json.jawaban.join('\n- ')}`,
            msg
        )

        delete this.game[id]
    }, GAME_TIME)

    this.game[id] = {
        id,
        msg,
        soal: json.soal,
        jawaban: json.jawaban.map(v => v.toLowerCase()),
        terjawab: Array.from(json.jawaban, () => false),
        winScore,
        timeout
    }
}

handler.help = ['family100']
handler.tags = ['game']
handler.command = /^family100$/i
handler.onlyprem = true
handler.game = true

export default handler