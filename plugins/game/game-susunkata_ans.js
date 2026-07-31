import similarity from 'similarity'
import { loadDB, saveDB } from '../../lib/waifuHelper.js'

const THRESHOLD = 0.72

function cleanText(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

export async function before(m) {
  if (!m.text) return true
  if (/^[./#!]\w+/.test(m.text.trim())) return true

  this.game = this.game || {}
  const id = 'susunkata-' + m.chat
  if (!(id in this.game)) return true

  const session = this.game[id]
  if (!session || !session[1]) return true

  const [msg, data, timeout] = session
  const jawab = (data.jawaban || '').trim()
  if (!jawab) return true

  const isQuotedFromBot = m.quoted && m.quoted.fromMe
  const isCorrect = cleanText(m.text) === cleanText(jawab)
  const isSimilar = similarity(cleanText(m.text), cleanText(jawab)) >= THRESHOLD
  const isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text.trim())

  if (isSurrender) {
    clearTimeout(timeout)
    delete this.game[id]
    await m.reply('*Yah Menyerah! :(*\nJawabannya: *' + jawab + '*')
    return true
  }

  if (isCorrect) {
    clearTimeout(timeout)
    delete this.game[id]
    const db = loadDB()
    if (!db.money) db.money = {}
    db.money[m.sender] = (db.money[m.sender] || 0) + (data.reward || 1000)
    saveDB(db)
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    global.db.data.users[m.sender].limit = (global.db.data.users[m.sender].limit || 0) + (data.limit || 1)

    await m.reply(
      `🎉 *BENAR!*\n\n` +
      `Jawaban: *${data.jawaban}*\n\n` +
      `Hadiah:\n` +
      `• Rp ${(data.reward || 1000).toLocaleString('id-ID')}\n` +
      `• ${data.limit || 1} Limit\n\n` +
      `Saldo: Rp ${db.money[m.sender].toLocaleString('id-ID')}\n` +
      `Limit: ${global.db.data.users[m.sender].limit}`
    )
    return true
  }

  if (isSimilar) {
    await m.reply('🔍 *Dikit Lagi!*')
    return true
  }

  if (isQuotedFromBot) {
    await m.reply('❌ *Jawaban Salah!*')
    return true
  }

  return true
}

export const exp = 0