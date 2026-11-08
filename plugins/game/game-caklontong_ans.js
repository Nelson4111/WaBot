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
    this.caklontong = this.caklontong || {}
    if (!(id in this.caklontong)) return false

    const session = this.caklontong[id]
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
        delete this.caklontong[id]
        await m.reply(`*Yah Menyerah! :(*\nJawabannya: *${jawab}*\n${json.deskripsi || ''}`)
        return true
    }

    if (isCorrect) {
        const rewardExp = session[2] || 1000
        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + rewardExp
        global.db.data.users[m.sender].caklontongScore = (Number(global.db.data.users[m.sender].caklontongScore) || 0) + (session[4] || 1)
        global.db.data.users[m.sender].caklontongName = m.pushName || global.db.data.users[m.sender].caklontongName

        await this.reply(m.chat, `╭─〔 🎉 B E N A R 〕\n> ✧ +${rewardExp} XP\n> ⟡ +${session[4] || 1} poin Cak Lontong\n> ${json.deskripsi || ''}\n╰───────────────\n\n🏆 Skor sekarang: *${global.db.data.users[m.sender].caklontongScore} poin*\nCek dengan *.caklontong score*`, m)
        clearTimeout(session[3])
        delete this.caklontong[id]
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