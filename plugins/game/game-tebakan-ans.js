import similarity from 'similarity'
const threshold = 0.72

function cleanText(str = '') {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

export async function before(m) {
    if (!m.text) return true
    if (/^[./#!]\w+/.test(m.text.trim())) return true

    let id = 'tebaktebakan-' + m.chat
    this.game = this.game || {}
    if (!(id in this.game)) return true

    const session = this.game[id]
    if (!session || !session[1]) return true

    const json = session[1]
    const jawab = (json.jawaban || '').trim()
    if (!jawab) return true

    const isQuotedFromBot = m.quoted && m.quoted.fromMe
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

    return true
}
export const exp = 0