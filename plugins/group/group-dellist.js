import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ◈ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ 〕*\n> Contoh: *${usedPrefix + command} <kata_kunci>*\n*╰───────────────*`)
  }
  const key = text.trim().toLowerCase()
  
  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.list || !chat.list[key]) {
    return m.reply(`*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Tidak ditemukan katalog kustom dengan kata kunci *${usedPrefix + key}* di grup ini.\n*╰───────────────*`)
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
  return m.reply(`*╭  〔 ❖ ʜ ᴀ ᴘ ᴜ ꜱ  ᴋ ᴀ ᴛ ᴀ ʟ ᴏ ɢ 〕*\n> Kata kunci *${usedPrefix + key}* telah berhasil dihapus dari direktori grup ✦\n*╰───────────────*`)
}

handler.help = ['dellist <key>']
handler.tags = ['group']
handler.command = /^(dellist|delstore|delcmd)$/i
handler.group = true
handler.admin = true

export default handler
