import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
    if (!m.text) return !0
    let id = m.chat
    this.tebakbola = this.tebakbola || {}

    if (!(id in this.tebakbola)) return !0
    if (!m.quoted || !m.quoted.fromMe || m.quoted.id !== this.tebakbola[id][0].id) return !0

    let json = this.tebakbola[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let text = m.text.toLowerCase().trim()

    if (/^\.?hbola$/i.test(text)) return !0

    if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
        clearTimeout(this.tebakbola[id][3])
        delete this.tebakbola[id]
        return m.reply('*Yah menyerah 😔*')
    }

    if (text === jawaban) {
        global.db.data.users[m.sender].exp += this.tebakbola[id][2]
        m.reply(`✅ *Benar!*\n+${this.tebakbola[id][2]} XP`)
        clearTimeout(this.tebakbola[id][3])
        delete this.tebakbola[id]
    } else if (similarity(text, jawaban) >= threshold) {
        m.reply('*Dikit lagi!*')
    } else {
        m.reply('*Salah!*')
    }

    return !0
}