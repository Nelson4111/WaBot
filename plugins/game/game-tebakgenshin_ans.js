import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/TEBAK GENSHIN/i.test(m.quoted.text)) return !0
    this.tebakgenshin = this.tebakgenshin ? this.tebakgenshin : {}
    if (!(id in this.tebakgenshin)) return m.reply('Soal itu telah berakhir')
    
    if (m.quoted.id == this.tebakgenshin[id][0].id) {
        let json = JSON.parse(JSON.stringify(this.tebakgenshin[id][1]))
        if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += this.tebakgenshin[id][2]
            await this.reply(m.chat, `*Selamat!* Jawaban kamu benar!\n\n✨ *Jawaban:* ${json.jawaban}\n🎁 *Hadiah:* +${this.tebakgenshin[id][2]} XP`, m)
            clearTimeout(this.tebakgenshin[id][3])
            delete this.tebakgenshin[id]
        } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
            m.reply(`*Dikit lagi!*`)
        } else {
            m.reply(`*Salah!*`)
        }
    }
    return !0
}

export const exp = 0
