import similarity from 'similarity'
const threshold = 0.72

function cleanText(str = '') {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

let handler = m => m

handler.before = async function (m) {
    if (!m.text) return false
    if (/^[./#!]\w+/.test(m.text.trim())) return false

    let id = m.chat
    this.tebakangka = this.tebakangka || {}

    if (!(id in this.tebakangka)) return false
    const session = this.tebakangka[id]
    if (!session || !session[1]) return false

    let json = session[1]
    let jawab = (json.jawaban || '').toLowerCase().trim()
    let text = m.text.toLowerCase().trim()
    if (!jawab) return false

    const msgId = session[0]?.key?.id || session[0]?.id
    const isQuotedFromBot = m.quoted && m.quoted.fromMe && (m.quoted.id === msgId || !msgId)

    const isCorrect = cleanText(text) === cleanText(jawab)
    const isSimilar = similarity(cleanText(text), cleanText(jawab)) >= threshold
    const isSurrender = /^((me)?nyerah|surr?ender)$/i.test(text)

    if (isSurrender) {
        clearTimeout(session[3])
        delete this.tebakangka[id]
        await m.reply('*Yah Menyerah! :(*\nJawabannya: *' + jawab + '*')
        return true
    }

    if (isCorrect) {
        let user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        user.exp = (user.exp || 0) + (session[2] || 1000)
        user.limit = (user.limit || 0) + 5 
        await m.reply(`✅ *BENAR!*\n\nJawaban: *${jawab}*\n+${session[2] || 1000} XP\n+5 Limit`)
        clearTimeout(session[3])
        delete this.tebakangka[id]
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

export default handler