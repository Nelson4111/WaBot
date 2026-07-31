import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
    if (!m.text) return !0
    let id = m.chat
    this.tebakff = this.tebakff || {}

    if (!(id in this.tebakff)) return !0
    
    // WAJIB REPLY SOAL
    if (!m.quoted || !m.quoted.fromMe || m.quoted.id !== this.tebakff[id][0].id) return !0

    let json = this.tebakff[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let text = m.text.toLowerCase().trim()

    if (/^\.?hff$/i.test(text)) return !0

    if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
        clearTimeout(this.tebakff[id][3])
        delete this.tebakff[id]
        return m.reply('*Yah menyerah 😔*')
    }

    if (text === jawaban) {
        global.db.data.users[m.sender].exp += this.tebakff[id][2]
        m.reply(`✅ *Benar!*\n+${this.tebakff[id][2]} XP`)
        clearTimeout(this.tebakff[id][3])
        delete this.tebakff[id]
    } else if (similarity(text, jawaban) >= threshold) {
        m.reply('*Dikit lagi!*')
    } else {
        m.reply('*Salah!*')
    }

    return !0
}