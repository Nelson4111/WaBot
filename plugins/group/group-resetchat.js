import { getChatData } from '../../lib/totalchat.js'

let handler = async (m, { isAdmin, isOwner }) => {
    if (!m.isGroup) return
    if (!(isAdmin || isOwner)) return m.reply('❌ Admin only')

    let gid = m.chat
    let allChatData = getChatData()

    if (allChatData[gid]) {
        delete allChatData[gid]
        m.reply('✅ Statistik chat group berhasil di-reset')
    } else {
        m.reply('📭 Belum ada data statistik di grup ini.')
    }
}

handler.help = ['resetchat']
handler.tags = ['group']
handler.command = /^resetchat$/i
handler.group = true

export default handler
