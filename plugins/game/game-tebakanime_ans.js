import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
    if (!m.text) return !0
    let id = m.chat
    this.tebakanime = this.tebakanime || {}

    if (!(id in this.tebakanime)) return !0
    if (!m.quoted || !m.quoted.fromMe || m.quoted.id !== this.tebakanime[id][0].id) return !0

    let json = this.tebakanime[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let text = m.text.toLowerCase().trim()

    if (/^\.?hanime$/i.test(text)) return !0

    if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
        clearTimeout(this.tebakanime[id][3])
        delete this.tebakanime[id]
        return m.reply('*Yah menyerah 😔*')
    }

    if (text === jawaban) {
        let user = global.db.data.users[m.sender]
        user.exp += this.tebakanime[id][2]
        user.limit += 5 // Menambah 5 limit
        m.reply(`✅ *Benar!*\n+${this.tebakanime[id][2]} XP\n+5 Limit`)
        clearTimeout(this.tebakanime[id][3])
        delete this.tebakanime[id]
    } else if (similarity(text, jawaban) >= threshold) {
        m.reply('*Dikit lagi!*')
    } else {
        m.reply('*Salah!*')
    }

    return !0
}