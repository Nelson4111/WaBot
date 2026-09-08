import { getChatData } from '../../lib/totalchat.js'

let handler = async (m, { isAdmin, isOwner }) => {
  if (!m.isGroup) return
  if (!(isAdmin || isOwner)) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator grup.\n*╰───────────────*')
  }

  const gid = m.chat
  const allChatData = getChatData()

  if (allChatData[gid]) {
    delete allChatData[gid]
    return m.reply('*╭  〔 ❖ ʀ ᴇ ꜱ ᴇ ᴛ  ꜱ ᴛ ᴀ ᴛ ɪ ꜱ ᴛ ɪ ᴋ 〕*\n> Seluruh data statistik aktivitas chat grup berhasil di-reset ke nol ✦\n*╰───────────────*')
  } else {
    return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Belum ada data statistik aktivitas chat di grup ini.\n*╰───────────────*')
  }
}

handler.help = ['resetchat']
handler.tags = ['group']
handler.command = /^resetchat$/i
handler.group = true
handler.admin = true

export default handler
