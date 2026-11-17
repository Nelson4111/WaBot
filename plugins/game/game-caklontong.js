import fs from 'fs'
import { sendGameResult } from './game-result.js'
let timeout = 120000
let poin = 4999
const scorePoint = 1
const CAKLONTONG_IMAGE_BACKUP_URL = 'https://c.termai.cc/i128/pMx.jpg'
const CAKLONTONG_IMAGE = fs.readFileSync(new URL('../../media/games/pMx.jpg', import.meta.url))

let handler = async (m, { conn, usedPrefix = '.', args = [] }) => {
    conn.caklontong = conn.caklontong ? conn.caklontong : {}
    let id = m.chat

    const subcommand = args[0]?.toLowerCase()
    if (['score', 'poin', 'skor'].includes(subcommand)) {
        const score = Number(global.db.data.users[m.sender]?.caklontongScore) || 0
        return m.reply(`╭─〔 🎭 CAK LONTONG SCORE 〕\n> Skor kamu saat ini: *${score} poin*\n╰───────────────`)
    }

    if (subcommand === 'top') {
        const leaderboard = Object.entries(global.db.data.users || {})
            .map(([jid, user]) => ({ jid, score: Number(user?.caklontongScore) || 0, name: user?.caklontongName || user?.name }))
            .filter(user => user.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        if (!leaderboard.length) return m.reply(`🏆 Belum ada skor Cak Lontong.\nMulai dengan *${usedPrefix}caklontong*`)
        const rows = leaderboard.map((user, index) => `> ${index + 1}. ${user.name || user.jid.split('@')[0]} — *${user.score} poin*`).join('\n')
        return m.reply(`╭─〔 🏆 CAK LONTONG TOP 10 〕\n${rows}\n╰───────────────`)
    }

    if (id in conn.caklontong) return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.caklontong[id][0])
    let src = JSON.parse(fs.readFileSync('./json/caklontong.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `╭─〔 🎭 C A K  L O N T O N G 〕\n`
    caption += `│ 🃏 *TEKA-TEKI KOCAK!*\n`
    caption += `╰───────────────\n\n`
    caption += `> ${json.soal}\n\n`
    caption += `*╭ 〔 ⏱ ᴘᴇʀᴍᴀɪɴᴀɴ 〕*\n`
    caption += `*┆* ⟡ Waktu : *${timeout / 1000} detik*\n`
    caption += `*┆* ✧ Hadiah : *${poin} XP + ${scorePoint} poin*\n`
    caption += `*┆* 🆘 Bantuan : *${usedPrefix}calo* atau tombol 🆘\n`
    caption += `*╰───────────────*\n\n`
    caption += `> Jawab langsung dengan membalas pesan soal ini.`

    let msg
    const buttons = [['🆘 Bantuan Cak Lontong', `${usedPrefix}calo`], ['🏆 Cek Skor', `${usedPrefix}caklontong score`]]
    if (typeof conn.sendButtonV2 === 'function') {
        msg = await conn.sendButtonV2(m.chat, {
            title: '🎭 Cak Lontong',
            subtitle: 'Teka-teki khas humor Indonesia',
            text: caption,
            footer: `${global.namebot || 'Avelia'} • Cak Lontong`,
            buffer: CAKLONTONG_IMAGE,
            buttons
        }, m)
    } else {
        msg = await conn.sendMessage(m.chat, { image: CAKLONTONG_IMAGE, caption }, { quoted: m })
    }

    conn.caklontong[id] = [
        msg,
        json,
        poin,
        setTimeout(async () => {
            const activeSession = conn.caklontong[id]
            if (!activeSession) return
            delete conn.caklontong[id]
            await sendGameResult(conn, {
                chat: m.chat,
                text: `╭─〔 ⏰ WAKTU HABIS 〕\n> Jawabannya adalah *${json.jawaban}*\n> ${json.deskripsi || ''}\n╰───────────────`,
                image: CAKLONTONG_IMAGE,
                title: '⏰ Cak Lontong Selesai',
                subtitle: 'Terima kasih sudah bermain!',
                footer: `${global.namebot || 'Avelia'} • Cak Lontong`,
                buttons: [
                    ['🔄 Main Lagi', `${usedPrefix}caklontong`],
                    ['🏆 Cek Skor', `${usedPrefix}caklontong score`]
                ],
                quoted: activeSession[0]
            })
        }, timeout),
        scorePoint,
        usedPrefix
    ]
}
handler.help = ['caklontong [score|top]']
handler.tags = ['game']
handler.command = /^caklontong$/i
handler.onlyprem = true
handler.game = true
export default handler