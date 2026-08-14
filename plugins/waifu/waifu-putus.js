import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m) => {
  const db = loadDB()
  const c = db.couples[m.sender]
  if (!c) return m.reply('❌ Belum punya pasangan')

  const charName = c.charName

  delete db.chars?.[c.charId]   // hapus data karakter jika ada
  delete db.couples[m.sender]   // hapus data pasangan
  saveDB(db)

  m.reply(`💔 Kamu telah putus dengan *${charName}*`)
}

handler.command = ['putus']
handler.tags = ['waifu']

// ===== HELP =====
handler.help = ['putus']

export default handler