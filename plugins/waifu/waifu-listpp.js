import { loadDB } from '../../lib/waifuHelper.js'

let handler = async (m) => {
  const db = loadDB()
  const pending = db.pendingPP || {}

  const entries = Object.values(pending)
  if (!entries.length) {
    return m.reply('✅ Tidak ada permintaan PP yang pending')
  }

  let text = '*📋 DAFTAR PP PENDING*\n\n'

  entries.forEach((v, i) => {
    const num = v.userJid.split('@')[0]
    text +=
      `${i + 1}. 🧩 *${v.charName}*\n` +
      `   🆔 UID  : ${v.charId}\n` +
      `   👤 User : ${num}\n\n`
  })

  text +=
    '_Gunakan perintah:_\n' +
    '• *.waifuterimapp <uid>*\n' +
    '• *.waifutolakpp <uid>*'

  m.reply(text)
}

handler.command = ['waifulistpp', 'listpp']
handler.tags = ['waifu']
handler.help = ['waifulistpp']
handler.owner = true

export default handler