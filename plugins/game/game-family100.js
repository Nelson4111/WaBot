import fs from 'fs'
import { awardFamily100Mvp } from './game-family100-score.js'
import { getFamily100CooldownRemaining, startFamily100Cooldown } from './game-family100-state.js'
import { sendGameResult } from './game-result.js'
import { sendThumbnailButtonCard } from '../../lib/thumbnailButtonCard.js'

const FAMILY100_IMAGE_BACKUP_URL = 'https://c.termai.cc/i129/q4f.jpg'
const FAMILY100_IMAGE = fs.readFileSync(new URL('../../media/games/q4f.jpg', import.meta.url))
const winScore = 4999
const answerPoint = 1
const GAME_TIME = 1000 * 60 * 5
const TIME_WARNING = 1000 * 60

function formatTimeRemaining(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000))
    const minutes = Math.floor(seconds / 60)
    return minutes ? `${minutes} menit ${seconds % 60} detik` : `${seconds} detik`
}

function getRoomStatus(room, now = Date.now()) {
    const answered = room.terjawab
        .map((answerer, index) => answerer ? { answer: room.jawaban[index], answerer, index } : null)
        .filter(Boolean)
    const remaining = Math.max(0, room.startedAt + GAME_TIME - now)
    const answers = answered.length
        ? answered.map(({ answer, answerer, index }) => {
            const jid = typeof answerer === 'string' ? answerer : null
            return `> ${index + 1}. ${answer}${jid ? ` — @${jid.split('@')[0]}` : ''}`
        }).join('\n')
        : '> Belum ada jawaban yang ditemukan.'

    return `╭─❏「 📊 STATUS FAMILY 100 」❏\n` +
           `│ ⏰ *Waktu habis!*\n` +
           `╰─━━━━━━━━━━━━━━─\n\n` +
        `> 🧩 *${room.soal}*\n` +
        `─━━━━━━━━━━━━━━─\n\n` +
        `⟡ Jawaban ditemukan: *${answered.length}/${room.jawaban.length}*\n` +
        `⏱️ Waktu tersisa: *${formatTimeRemaining(remaining)}*\n\n` +
        `📋 *JAWABAN TERJAWAB*\n${answers}\n\n` +
        `─━━━━━━━━━━━━━━─`
}

async function handler(m, { args = [], conn = this, usedPrefix = '.' }) {
    const subcommand = args[0]?.toLowerCase()

    if (subcommand === 'info') {
        const room = this.game?.['family100_' + m.chat]
        if (!room) return m.reply('Tidak ada permainan Family 100 yang sedang berjalan di chat ini.')

        const mentions = room.terjawab
            .filter(Boolean)
            .filter(answerer => typeof answerer === 'string')
        return conn.sendMessage(m.chat, {
            text: getRoomStatus(room),
            mentions
        }, { quoted: m })
    }

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

    const cooldownRemaining = getFamily100CooldownRemaining(this.game, m.chat)
    if (cooldownRemaining > 0) {
        return m.reply(`⏳ Tunggu ${Math.ceil(cooldownRemaining / 1000)} detik sebelum memulai Family100 lagi.`)
    }

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
    caption += `> ↳ 🆘 Voting *nyerah* tersedia setelah 1 menit dan perlu persetujuan pemain\n`
    caption += `> ↳ ⏳ Tunggu 10 detik setelah game selesai untuk mulai lagi\n`
    caption += `> ↳ ⭐ +${answerPoint} poin dan +${winScore} XP tiap jawaban benar\n\n`
    caption += `> ↳ 🏆 MVP dengan jawaban terbanyak mendapat +2 poin (jika tidak seri)\n\n`

    caption += `─━━━━━━━━━━━━━━─`

    const buttons = [
        ['📊 Cek Status', `${usedPrefix}fam info`],
        ['🏆 Cek Skor', `${usedPrefix}fam score`]
    ]
    const msg = await sendThumbnailButtonCard(conn, {
        chat: m.chat,
        title: '🧩 FAMILY 100',
        subtitle: 'Temukan semua jawaban bersama!',
        text: caption,
        footer: `${global.namebot || 'Avelia'} • Family 100`,
        thumbnail: FAMILY100_IMAGE,
        buttons,
        quoted: m
    })

    const reminderTimeout = setTimeout(() => {
        if (!this.game[id]) return
        this.reply(
            m.chat,
            `╭─❏「 ⏳ FAMILY 100 」❏\n` +
            `│ ⏰ *Sisa Waktu!*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> Jika tidak ada jawaban baru, permainan berakhir dalam *${formatTimeRemaining(TIME_WARNING)}*.\n` +
            `> Ketik *${usedPrefix}fam info* untuk melihat status permainan.\n` +
            `─━━━━━━━━━━━━━━─`,
            msg
        )
    }, GAME_TIME - TIME_WARNING)

    let timeout = setTimeout(async () => {
        const room = this.game[id]
        if (!room) return

        clearTimeout(room.reminderTimeout)
        const mvp = awardFamily100Mvp(room)
        startFamily100Cooldown(this.game, m.chat)
        delete this.game[id]
        await sendGameResult(this, {
            chat: m.chat,
            text: `╭─❏「 ⏰ FAMILY 100 」❏\n` +
                `│ ⏰ *Waktu habis!*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `📋 *JAWABAN*\n` +
                `> • ${json.jawaban.join('\n> • ')}\n\n` +
                (mvp ? `🏆 *MVP:* ${mvp.name} (+2 poin)\n\n` : '') +
                `─━━━━━━━━━━━━━━─`,
            image: FAMILY100_IMAGE,
            title: '⏰ Family 100 Selesai',
            subtitle: 'Terima kasih sudah bermain!',
            footer: `${global.namebot || 'Avelia'} • Family 100`,
            buttons: [
                ['🔄 Main Lagi', `${usedPrefix}fam`],
                ['🏆 Cek Skor', `${usedPrefix}fam score`]
            ],
            quoted: msg
        })
    }, GAME_TIME)

    this.game[id] = {
        id,
        msg,
        soal: json.soal,
        jawaban: json.jawaban.map(v => v.toLowerCase()),
        terjawab: Array.from(json.jawaban, () => false),
        winScore,
        answerPoint,
        startedAt: Date.now(),
        usedPrefix,
        creator: m.sender,
        participants: [],
        surrenderVotes: [],
        reminderTimeout,
        timeout
    }
}

handler.help = ['family100', 'f100', 'fam100', 'fam'].map(v => `${v} [info|score|poin|top]`)
handler.tags = ['game']
handler.command = /^(family100|f100|fam100|fam)$/i
handler.onlyprem = true
handler.game = true

handler.desc = 'Memulai permainan kuis survei Family 100 bersama anggota grup lainnya.'
handler.tutorial = [
  '.family100',
  'Jawab survei bersama-sama di grup'
]

export default handler