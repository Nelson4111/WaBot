import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Format: ${usedPrefix + command} <key>`)
  const key = text.trim().toLowerCase()
  
  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.list || !chat.list[key]) {
    return m.reply(`❌ Tidak ada command kustom *${usedPrefix + key}* di grup ini.`)
  }
  
  const entry = chat.list[key]
  if (entry.type === 'media' && entry.filePath) {
    if (fs.existsSync(entry.filePath)) {
      try {
        fs.unlinkSync(entry.filePath)
      } catch (e) {
        console.error(e)
      }
    }
  }
  
  delete chat.list[key]
  m.reply(`✅ Command kustom *${usedPrefix + key}* berhasil dihapus.`)
}

handler.help = ['dellist <key>']
handler.tags = ['group']
handler.command = /^(dellist|delstore|delcmd)$/i
handler.group = true
handler.admin = true

export default handler;
