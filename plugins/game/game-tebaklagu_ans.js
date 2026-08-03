import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
    if (!m.text) return false
    let id = m.chat
    this.tebaklagu = this.tebaklagu || {}

    if (!(id in this.tebaklagu)) return false
    let msgId = this.tebaklagu[id][0]?.key?.id || this.tebaklagu[id][0]?.id
    if (!m.quoted || !m.quoted.fromMe || m.quoted.id !== msgId) return false

    let json = this.tebaklagu[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let text = m.text.toLowerCase().trim()

    if (/^\.?hlagu$/i.test(text)) return false

    if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
        clearTimeout(this.tebaklagu[id][3])
        delete this.tebaklagu[id]
        await m.reply('*Yah menyerah 😔*')
        return true
    }

    if (text === jawaban) {
        let user = global.db.data.users[m.sender]
        user.exp += this.tebaklagu[id][2]
        user.limit += 5 
        await m.reply(`✅ *Benar!*\n+${this.tebaklagu[id][2]} XP\n+5 Limit`)
        clearTimeout(this.tebaklagu[id][3])
        delete this.tebaklagu[id]
    } else if (similarity(text, jawaban) >= threshold) {
        await m.reply('*Dikit lagi!*')
    } else {
        await m.reply('*Salah!*')
    }

    return true
}