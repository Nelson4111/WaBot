import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { args, conn }) => {
  const db = loadDB()
  const d = db.pendingPP[args[0]]
  if (!d) return m.reply('Data tidak ada')

  delete db.pendingPP[args[0]]
  saveDB(db)

  conn.sendMessage(d.userJid, { text: `❌ Foto profil untuk waifu *${d.charName}* ditolak oleh owner.` })
  m.reply('❌ Permintaan ganti PP waifu ditolak.')
}

handler.command = ['waifutolakpp', 'tolakpp']
handler.tags = ['waifu']
handler.help = ['waifutolakpp <uid>']
handler.owner = true
export default handler