import similarity from 'similarity'
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {
  if (!m.text) return false

  let id = 'tebakml-' + m.chat
  this.game = this.game || {}

  if (!(id in this.game)) return false

  const session = this.game[id]
  const json = session[1]
  const jawaban = json.jawaban.toLowerCase().trim()
  const text = m.text.toLowerCase().trim()

  const msgId = session[0]?.key?.id || session[0]?.id
  const isQuotedFromBot = m.quoted && m.quoted.fromMe && (m.quoted.id === msgId || !msgId)

  if (/^\.?hgml$/i.test(text)) return false

  if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
    clearTimeout(this.game[id][3])
    delete this.game[id]
    await m.reply('*Yah menyerah 😔*')
    return true
  }

  if (text === jawaban) {
    global.db.data.users[m.sender].exp += this.game[id][2]
    await m.reply(`✅ *Benar!*\n+${this.game[id][2]} XP`)
    clearTimeout(this.game[id][3])
    delete this.game[id]
    return true
  } else if (similarity(text, jawaban) >= threshold) {
    await m.reply('*Dikit lagi!*')
    return true
  } else if (isQuotedFromBot) {
    await m.reply('*Salah!*')
    return true
  }

  return false
}

export default handler