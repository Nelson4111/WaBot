import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { args, conn }) => {
  const db = loadDB()

  if (!db.pendingPP) db.pendingPP = {}
  if (!db.profilePP) db.profilePP = {}

  // === AMBIL UID ===
  let uid = args[0]

  // Jika tidak ada argumen, coba dari reply
  if (!uid && m.quoted) {
    const q = m.quoted.text || ''
    const match = q.match(/UID\s*[:\-]\s*(\d+)/i)
    if (match) uid = match[1]
  }

  if (!uid) {
    return m.reply(
      '❌ Masukkan UID atau reply pesan permintaan PP\n\n' +
      'Contoh:\n.terimapp 123456'
    )
  }

  const data = db.pendingPP[uid]
  if (!data) return m.reply('❌ Data pending PP tidak ditemukan')

  // === SET PP ===
  db.profilePP[uid] = data.url
  delete db.pendingPP[uid]
  saveDB(db)

  // === NOTIF USER ===
  try {
    await conn.sendMessage(
      data.userJid,
      { text: `✅ PP pasangan *${data.charName}* telah disetujui owner` }
    )
  } catch {}

  m.reply(
    `✅ *PP Disetujui*\n` +
    `👤 Karakter : ${data.charName}\n` +
    `🆔 UID      : ${uid}`
  )
}

handler.command = ['terimapp']
handler.tags = ['waifu']
handler.help = ['terimapp <uid>']
handler.owner = true

export default handler