import similarity from 'similarity'
const threshold = 0.72

function cleanText(str = '') {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

export async function before(m) {
    if (!m.text) return false
    if (/^[./#!]\w+/.test(m.text.trim())) return false

    let id = 'tebakkpop-' + m.chat
    this.game = this.game || {}
    if (!(id in this.game)) return false

    const session = this.game[id]
    if (!session || !session[1]) return false

    const json = session[1]
    const jawab = (json.jawaban || '').trim()
    if (!jawab) return false

    const msgId = session[0]?.key?.id || session[0]?.id
    const isQuotedFromBot = m.quoted && m.quoted.fromMe && (m.quoted.id === msgId || !msgId)

    const isCorrect = cleanText(m.text) === cleanText(jawab)
    const isSimilar = similarity(cleanText(m.text), cleanText(jawab)) >= threshold
    const isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text.trim())

    if (isSurrender) {
        clearTimeout(session[3])
        delete this.game[id]
        await m.reply('*Yah Menyerah! :(*\nJawabannya: *' + jawab + '*')
        return true
    }

    if (isCorrect) {
        const rewardExp = session[2] || 1000
        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + rewardExp

        await m.reply(`🎉 *BENAR!*\n\nJawaban: *${jawab}*\n+${rewardExp} XP`)
        clearTimeout(session[3])
        delete this.game[id]
        return true
    } else if (isSimilar) {
        await m.reply('🔍 *Dikit Lagi!*')
        return true
    } else if (isQuotedFromBot) {
        await m.reply('❌ *Salah!*')
        return true
    }

    return false
}

export const exp = 0