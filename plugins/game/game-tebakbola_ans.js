import similarity from 'similarity'
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {
    if (!m.text) return false
    let id = m.chat
    this.tebakbola = this.tebakbola || {}

    if (!(id in this.tebakbola)) return false
    let msgId = this.tebakbola[id][0]?.key?.id || this.tebakbola[id][0]?.id
    if (!m.quoted || !m.quoted.fromMe || m.quoted.id !== msgId) return false

    let json = this.tebakbola[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let text = m.text.toLowerCase().trim()

    if (/^\.?hbola$/i.test(text)) return false

    if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
        clearTimeout(this.tebakbola[id][3])
        delete this.tebakbola[id]
        await m.reply('*Yah menyerah 😔*')
        return true
    }

    if (text === jawaban) {
        global.db.data.users[m.sender].exp += this.tebakbola[id][2]
        await m.reply(`✅ *Benar!*\n+${this.tebakbola[id][2]} XP`)
        clearTimeout(this.tebakbola[id][3])
        delete this.tebakbola[id]
    } else if (similarity(text, jawaban) >= threshold) {
        await m.reply('*Dikit lagi!*')
    } else {
        await m.reply('*Salah!*')
    }

    return true
}

export default handler