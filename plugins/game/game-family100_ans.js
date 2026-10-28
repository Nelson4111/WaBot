import similarity from 'similarity'
import { awardFamily100Mvp } from './game-family100-score.js'

const threshold = 0.72 // semakin tinggi semakin mirip

function clean(s = '') {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

export async function before(m) {
    this.game = this.game ? this.game : {}
    let id = 'family100_' + m.chat
    if (!(id in this.game)) return true
    if (!m.text) return true
    if (/^[./#!]\w+/.test(m.text.trim())) return true

    let room = this.game[id]
    room.participants = room.participants || []
    room.surrenderVotes = room.surrenderVotes || []
    let text = clean(m.text)
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text.trim())

    if (isSurrender) {
        const isCreator = room.creator === m.sender
        const isParticipant = room.participants.includes(m.sender)
        if (!isCreator && !isParticipant) {
            await m.reply('Kamu belum menjawab di permainan ini, jadi tidak bisa ikut voting menyerah.')
            return true
        }

        if (!room.surrenderVotes.includes(m.sender)) room.surrenderVotes.push(m.sender)

        const requiredVotes = Math.ceil(room.participants.length * 2 / 3)
        const participantVotes = room.surrenderVotes.filter(voter => room.participants.includes(voter)).length
        if (requiredVotes === 0 || participantVotes >= requiredVotes) {
            await finishGame.call(this, m, id, room, true)
            return true
        }

        const voteMessage = `🏳️ Permintaan menyerah tercatat (${participantVotes}/${requiredVotes} suara pemain yang sudah menjawab).`
        await m.reply(voteMessage)
        return true
    }

    let index = room.jawaban.findIndex(j => clean(j) === text)
    if (index < 0) {
        let uncomplete = room.jawaban.filter((_, i) => !room.terjawab[i])
        if (uncomplete.length > 0) {
            let sim = Math.max(...uncomplete.map(j => similarity(clean(j), text)))
            if (sim >= threshold) m.reply('🔍 *Dikit lagi!*')
        }
        return true
    }

    if (room.terjawab[index]) return true

    let user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    room.terjawab[index] = m.sender
    if (!room.participants.includes(m.sender)) room.participants.push(m.sender)
    user.exp = (user.exp || 0) + room.winScore
    user.family100Score = (Number(user.family100Score) || 0) + (room.answerPoint || 1)
    user.family100Name = m.pushName || user.family100Name

    let isWin = room.terjawab.every(v => v)
    const mvp = isWin ? awardFamily100Mvp(room) : null

    let answersList = room.jawaban.map((j, i) => {
        if (isWin || room.terjawab[i]) {
            let userJid = room.terjawab[i] ? (this.decodeJid ? this.decodeJid(room.terjawab[i]) : room.terjawab[i]) : null
            let userTag = userJid ? `@${userJid.split('@')[0]}` : ''
            return `> ${i + 1}. ${j} ${userJid ? '👤 ' + userTag : ''}`
        }
        return null
    }).filter(Boolean).join('\n')

    let caption = `╭─❏「 FAMILY 100 」❏\n`
    caption += `│ 🧩 *${room.soal}*\n`
    caption += `╰─━━━━━━━━━━━━━━─\n\n`

    caption += `📋 *STATUS JAWABAN*\n`
    caption += `> ↳ Terdapat *${room.jawaban.length}* jawaban\n`

    if (isWin) {
        caption += `> ↳ 🎉 *SEMUA JAWABAN TERJAWAB!*\n\n`
    } else {
        caption += `\n`
    }

    caption += `${answersList}\n`

    if (mvp) caption += `\n🏆 *MVP:* ${mvp.name} (+2 poin)\n`

    if (!isWin && !isSurrender) {
        caption += `\n> ↳ ⭐ +${room.answerPoint || 1} poin dan +${room.winScore} XP tiap jawaban benar\n`
    }

    caption += `\n─━━━━━━━━━━━━━━─`

    let mentions = room.terjawab.filter(Boolean).map(v => this.decodeJid ? this.decodeJid(v) : v)

    let q = global.forder || global.ftoko || m
    let msg = await this.sendMessage(m.chat, {
        text: caption,
        mentions: mentions
    }, { quoted: q })

    room.msg = msg

    if (isWin) {
        if (room.timeout) clearTimeout(room.timeout)
        delete this.game[id]
    }

    return true
}

async function finishGame(m, id, room, isSurrender) {
    const mvp = awardFamily100Mvp(room)
    const answersList = room.jawaban.map((answer, index) => {
        const respondent = room.terjawab[index]
        const userJid = respondent ? (this.decodeJid ? this.decodeJid(respondent) : respondent) : null
        const userTag = userJid ? ` 👤 @${userJid.split('@')[0]}` : ''
        return `> ${index + 1}. ${answer}${userTag}`
    }).join('\n')
    const mentions = room.terjawab.filter(Boolean).map(jid => this.decodeJid ? this.decodeJid(jid) : jid)

    const caption = `╭─❏「 FAMILY 100 」❏\n` +
        `│ 🧩 *${room.soal}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${isSurrender ? '🏳️ *MENYERAH! Suara pemain mencukupi.*' : '🎉 *SEMUA JAWABAN TERJAWAB!*'}\n\n` +
        `📋 *JAWABAN*\n${answersList}\n\n` +
        (mvp ? `🏆 *MVP:* ${mvp.name} (+2 poin)\n\n` : '') +
        `─━━━━━━━━━━━━━━─`

    const quoted = global.forder || global.ftoko || m
    await this.sendMessage(m.chat, { text: caption, mentions }, { quoted })
    if (room.timeout) clearTimeout(room.timeout)
    delete this.game[id]
}