import fs from 'fs'
import { awardFamily100Mvp } from './game-family100-score.js'

const FAMILY100_IMAGE = 'https://c.termai.cc/i129/q4f.jpg'
const winScore = 4999
const answerPoint = 1
const GAME_TIME = 1000 * 60 * 5

async function handler(m, { args = [] }) {
    const subcommand = args[0]?.toLowerCase()

    if (['score', 'poin'].includes(subcommand)) {
        const score = Number(global.db.data.users[m.sender]?.family100Score) || 0
        return m.reply(`🏅 Skor Family100 kamu: *${score} poin*`)
    }

    if (subcommand === 'top') {
        const leaderboard = Object.entries(global.db.data.users)
            .filter(([, user]) => Number.isFinite(user?.family100Score) && user.family100Score > 0)
            .sort(([, first], [, second]) => second.family100Score - first.family100Score)
            .slice(0, 10)

        if (!leaderboard.length) return m.reply('Belum ada skor Family100.')

        const rows = leaderboard.map(([jid, user], index) => {
            const name = user.family100Name || user.name || jid.split('@')[0]
            return `> ${index + 1}. ${name} — *${user.family100Score} poin*`
        })
        return m.reply(`🏆 *TOP 10 FAMILY100*\n\n${rows.join('\n')}`)
    }

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
    caption += `> ↳ 🆘 Ketik *nyerah* untuk meminta menyerah (perlu persetujuan pemain)\n`
    caption += `> ↳ ⭐ +${answerPoint} poin dan +${winScore} XP tiap jawaban benar\n\n`
    caption += `> ↳ 🏆 MVP dengan jawaban terbanyak mendapat +2 poin (jika tidak seri)\n\n`

    caption += `─━━━━━━━━━━━━━━─`

    let msg = await this.sendMessage(m.chat, {
        image: { url: FAMILY100_IMAGE },
        caption
    }, { quoted: m })

    let timeout = setTimeout(() => {
        if (!this.game[id]) return

        const mvp = awardFamily100Mvp(this.game[id])
        this.reply(
            m.chat,
            `╭─❏「 ⏰ FAMILY 100 」❏\n` +
            `│ ⏰ *Waktu habis!*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `📋 *JAWABAN*\n` +
            `> • ${json.jawaban.join('\n> • ')}\n\n` +
            (mvp ? `🏆 *MVP:* ${mvp.name} (+2 poin)\n\n` : '') +
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
        answerPoint,
        creator: m.sender,
        participants: [],
        surrenderVotes: [],
        timeout
    }
}

handler.help = ['family100', 'f100', 'fam100', 'fam'].map(v => `${v} [score|poin|top]`)
handler.tags = ['game']
handler.command = /^(family100|f100|fam100|fam)$/i
handler.onlyprem = true
handler.game = true

export default handler