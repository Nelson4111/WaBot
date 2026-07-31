import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
  if (!m.text) return !0

  let id = 'tebakml-' + m.chat
  this.game = this.game || {}

  if (!(id in this.game)) return !0

  let json = this.game[id][1]
  let jawaban = json.jawaban.toLowerCase().trim()
  let text = m.text.toLowerCase().trim()

  if (/^\.?hgml$/i.test(text)) return !0

  if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
    clearTimeout(this.game[id][3])
    delete this.game[id]
    return m.reply('*Yah menyerah 😔*')
  }

  if (text === jawaban) {
    global.db.data.users[m.sender].exp += this.game[id][2]
    m.reply(`✅ *Benar!*\n+${this.game[id][2]} XP`)
    clearTimeout(this.game[id][3])
    delete this.game[id]
  } else if (similarity(text, jawaban) >= threshold) {
    m.reply('*Dikit lagi!*')
  }

  return !0
}

export const exp = 0