import similarity from 'similarity'
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {
    if (!m.text) return false
    let id = m.chat
    this.tebakangka = this.tebakangka || {}

    if (!(id in this.tebakangka)) return false
    let msgId = this.tebakangka[id][0]?.key?.id || this.tebakangka[id][0]?.id
    if (!m.quoted || !m.quoted.fromMe || m.quoted.id !== msgId) return false

    let json = this.tebakangka[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let text = m.text.toLowerCase().trim()

    if (/^\.?hangka$/i.test(text)) return false

    if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
        clearTimeout(this.tebakangka[id][3])
        delete this.tebakangka[id]
        await m.reply('*Yah menyerah 😔*')
        return true
    }

    if (text === jawaban) {
        let user = global.db.data.users[m.sender]
        user.exp += this.tebakangka[id][2]
        user.limit += 5 
        await m.reply(`✅ *Benar!*\n+${this.tebakangka[id][2]} XP\n+5 Limit`)
        clearTimeout(this.tebakangka[id][3])
        delete this.tebakangka[id]
    } else if (similarity(text, jawaban) >= threshold) {
        await m.reply('*Dikit lagi!*')
    } else {
        await m.reply('*Salah!*')
    }

    return true
}

export default handler