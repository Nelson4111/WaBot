let handler = async (m, { conn, usedPrefix }) => {
  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.list || Object.keys(chat.list).length === 0) {
    return m.reply(`📦 Belum ada command kustom yang disimpan di grup ini.\nGunakan *${usedPrefix}setlist* untuk membuat command baru.`)
  }
  
  const listKeys = Object.keys(chat.list).sort()
  let txt = `📋 *Daftar Command Kustom Grup ini:*\n\n`
  listKeys.forEach((key, index) => {
    const entry = chat.list[key]
    const typeStr = entry.type === 'media' ? `[Media: ${entry.mime.split('/')[0]}]` : '[Teks]'
    txt += `${index + 1}. *${usedPrefix + key}* _${typeStr}_\n`
  })
  
  m.reply(txt.trim())
}

handler.help = ['liststore']
handler.tags = ['group']
handler.command = /^(liststore|storelist|listcmd|list)$/i
handler.group = true

export default handler;
