import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
    if (!m.text) return false
    let id = 'tebaklirik-' + m.chat
    if (!m.quoted || !m.quoted.fromMe) return false
    this.game = this.game ? this.game : {}
    if (!(id in this.game)) return false

    let msgId = this.game[id][0]?.key?.id || this.game[id][0]?.id
    if (m.quoted.id == msgId) {
        let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
        if (isSurrender) {
            clearTimeout(this.game[id][3])
            delete this.game[id]
            await m.reply('*Yah Menyerah :( !*')
            return true
        }
        let json = JSON.parse(JSON.stringify(this.game[id][1]))
        if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += this.game[id][2]
            await m.reply(`*Benar!*\n+${this.game[id][2]} XP`)
            clearTimeout(this.game[id][3])
            delete this.game[id]
        } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
            await m.reply(`*Dikit Lagi!*`)
        } else {
            await m.reply(`*Salah!*`)
        }
        return true
    }
    return false
}

export const exp = 0