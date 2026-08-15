import similarity from 'similarity'
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {
    let id = m.chat
    this.tebakgenshin = this.tebakgenshin || {}
    if (!(id in this.tebakgenshin)) return false
    if (!m.text) return false

    if (/^[./#!]\w+/.test(m.text.trim())) return false

    const session = this.tebakgenshin[id]
    if (!session || !session[1]) return false

    const json = session[1]
    const jawaban = (json.jawaban || '').toLowerCase().trim()
    const text = m.text.toLowerCase().trim()
    if (!jawaban) return false

    const msgId = session[0]?.key?.id || session[0]?.id
    const isQuotedFromBot = m.quoted && m.quoted.fromMe && (m.quoted.id === msgId || !msgId)

    if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
        clearTimeout(session[3])
        delete this.tebakgenshin[id]
        await this.reply(m.chat, `*Yah Menyerah! :(*\nJawabannya: *${json.jawaban}*`, m)
        return true
    }

    if (text === jawaban) {
        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + session[2]

        await this.reply(m.chat, `🎉 *BENAR!* Jawaban kamu benar!\n\n✨ *Jawaban:* ${json.jawaban}\n🎁 *Hadiah:* +${session[2]} XP`, m)
        clearTimeout(session[3])
        delete this.tebakgenshin[id]
        return true
    } else if (similarity(text, jawaban) >= threshold) {
        await this.reply(m.chat, `🔍 *Dikit lagi!*`, m)
        return true
    } else if (isQuotedFromBot) {
        await this.reply(m.chat, `❌ *Salah!*`, m)
        return true
    }

    return false
}

export default handler
