import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/TEBAK KOTA/i.test(m.quoted.text)) return !0
    this.tebakkota = this.tebakkota ? this.tebakkota : {}
    if (!(id in this.tebakkota)) return m.reply('Soal itu telah berakhir')
    
    let msgId = this.tebakkota[id][0]?.key?.id || this.tebakkota[id][0]?.id
    if (m.quoted.id == msgId) {
        let json = JSON.parse(JSON.stringify(this.tebakkota[id][1]))
        if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += this.tebakkota[id][2]
            await this.reply(m.chat, `*Selamat!* Jawaban kamu benar!\n\n✨ *Jawaban:* ${json.jawaban}\n🎁 *Hadiah:* +${this.tebakkota[id][2]} XP`, m)
            clearTimeout(this.tebakkota[id][3])
            delete this.tebakkota[id]
        } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
            m.reply(`*Dikit lagi!*`)
        } else {
            m.reply(`*Salah!*`)
        }
    }
    return !0
}

export const exp = 0
