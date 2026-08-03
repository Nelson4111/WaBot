import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
    if (!m.text) return false
    let id = m.chat
    this.tebakff = this.tebakff || {}

    if (!(id in this.tebakff)) return false
    
    let msgId = this.tebakff[id][0]?.key?.id || this.tebakff[id][0]?.id
    if (!m.quoted || !m.quoted.fromMe || m.quoted.id !== msgId) return false

    let json = this.tebakff[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let text = m.text.toLowerCase().trim()

    if (/^\.?hff$/i.test(text)) return false

    if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
        clearTimeout(this.tebakff[id][3])
        delete this.tebakff[id]
        await m.reply('*Yah menyerah 😔*')
        return true
    }

    if (text === jawaban) {
        global.db.data.users[m.sender].exp += this.tebakff[id][2]
        await m.reply(`✅ *Benar!*\n+${this.tebakff[id][2]} XP`)
        clearTimeout(this.tebakff[id][3])
        delete this.tebakff[id]
    } else if (similarity(text, jawaban) >= threshold) {
        await m.reply('*Dikit lagi!*')
    } else {
        await m.reply('*Salah!*')
    }

    return true
}