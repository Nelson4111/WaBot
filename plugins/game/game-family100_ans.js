import similarity from 'similarity'

const threshold = 0.72 // semakin tinggi semakin mirip

function clean(s = '') {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

export async function before(m) {
    this.game = this.game ? this.game : {}
    let id = 'family100_' + m.chat
    if (!(id in this.game)) return true
    if (!m.text) return true

    let room = this.game[id]
    let text = clean(m.text)
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text.trim())

    if (!isSurrender) {
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
        user.exp = (user.exp || 0) + room.winScore
    }

    let isWin = room.terjawab.every(v => v)

    let answersList = room.jawaban.map((j, i) => {
        if (isWin || isSurrender || room.terjawab[i]) {
            let userJid = room.terjawab[i]
            let userName = userJid ? (this.getName ? this.getName(userJid) : userJid.split('@')[0]) : ''
            return `(${i + 1}) ${j} ${userJid ? '👤 _' + userName + '_' : ''}`
        }
        return null
    }).filter(Boolean).join('\n')

    let caption = `
*Soal:* ${room.soal}
Terdapat *${room.jawaban.length}* jawaban
${isWin ? '*🎉 SEMUA JAWABAN TERJAWAB!*' : isSurrender ? '*🏳️ MENYERAH!*' : ''}

${answersList}

${isWin || isSurrender ? '' : `+${room.winScore} XP tiap jawaban benar`}
`.trim()

    let mentions = room.terjawab.filter(Boolean)

    let q = global.forder || global.ftoko || m
    let msg = await this.sendMessage(m.chat, {
        text: caption,
        mentions: mentions
    }, { quoted: q })

    room.msg = msg

    // clear timer 
    if (isWin || isSurrender) {
        if (room.timeout) clearTimeout(room.timeout)
        delete this.game[id]
    }

    return true
}