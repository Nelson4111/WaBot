import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { args, conn }) => {
  const db = loadDB()
  const d = db.pendingPP[args[0]]
  if (!d) return m.reply('Data tidak ada')

  delete db.pendingPP[args[0]]
  saveDB(db)

  conn.sendMessage(d.userJid, { text: 'PP ditolak' })
  m.reply('❌ Ditolak')
}

handler.command = ['tolakpp']
handler.tags = ['waifu']
handler.help = ['tolakpp <uid>']
handler.owner = true
export default handler