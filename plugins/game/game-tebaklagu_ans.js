import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
    if (!m.text) return !0
    let id = m.chat
    this.tebaklagu = this.tebaklagu || {}

    if (!(id in this.tebaklagu)) return !0
    if (!m.quoted || !m.quoted.fromMe || m.quoted.id !== this.tebaklagu[id][0].id) return !0

    let json = this.tebaklagu[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let text = m.text.toLowerCase().trim()

    if (/^\.?hlagu$/i.test(text)) return !0

    if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
        clearTimeout(this.tebaklagu[id][3])
        delete this.tebaklagu[id]
        return m.reply('*Yah menyerah 😔*')
    }

    if (text === jawaban) {
        let user = global.db.data.users[m.sender]
        user.exp += this.tebaklagu[id][2]
        user.limit += 5 
        m.reply(`✅ *Benar!*\n+${this.tebaklagu[id][2]} XP\n+5 Limit`)
        clearTimeout(this.tebaklagu[id][3])
        delete this.tebaklagu[id]
    } else if (similarity(text, jawaban) >= threshold) {
        m.reply('*Dikit lagi!*')
    } else {
        m.reply('*Salah!*')
    }

    return !0
}