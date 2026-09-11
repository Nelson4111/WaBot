import fs from 'fs'

const FAMILY100_IMAGE = 'https://c.termai.cc/i129/q4f.jpg'
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

    let caption = `╭─❏「 FAMILY 100 」❏\n`
    caption += `│ 🧩 *JAWAB SOAL DI BAWAH INI!*\n`
    caption += `╰─━━━━━━━━━━━━━━─\n\n`

    caption += `🧩 *PERTANYAAN*\n`
    caption += `> ↳ ${json.soal}\n\n`

    caption += `📋 *INFORMASI PERMAINAN*\n`
    caption += `> ↳ Terdapat *${json.jawaban.length}* jawaban\n`
    caption += `> ↳ ⏱️ Waktu : *5 menit*\n`
    caption += `> ↳ 🆘 Ketik *menyerah* untuk mengakhiri permainan\n`
    caption += `> ↳ ⭐ +${winScore} XP tiap jawaban benar\n\n`

    caption += `─━━━━━━━━━━━━━━─`

    let msg = await this.sendMessage(m.chat, {
        image: { url: FAMILY100_IMAGE },
        caption
    }, { quoted: m })

    let timeout = setTimeout(() => {
        if (!this.game[id]) return

        this.reply(
            m.chat,
            `╭─❏「 ⏰ FAMILY 100 」❏\n` +
            `│ ⏰ *Waktu habis!*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `📋 *JAWABAN*\n` +
            `> • ${json.jawaban.join('\n> • ')}\n\n` +
            `─━━━━━━━━━━━━━━─`,
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