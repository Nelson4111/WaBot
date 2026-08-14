let handler = m => m

handler.before = async function (m, { conn, isBotAdmin }) {
    if (m.isBaileys) return false
    
    const isBlacklisted = global.db.data.blacklist?.includes(m.sender)
    if (!isBlacklisted) return false

    if (m.isGroup) {
        await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
        if (isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            await m.reply(`❌ @${m.sender.split('@')[0]} kamu di blacklist dan telah terkick!`)
        } else {
            await m.reply(`❌ @${m.sender.split('@')[0]} kamu di blacklist!`)
        }
    } else {
        await m.reply('❌ Kamu diblacklist dari menggunakan bot!')
    }
    return true
}

export default handler
