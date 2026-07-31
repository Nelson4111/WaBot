let handler = async (m, { conn }) => {
    let db = global.db.data
    db.blacklist = db.blacklist || []

    if (!db.blacklist.length) return m.reply('❌ Belum ada user yang diblacklist!')

    // Buat list dengan tag
    let list = db.blacklist.map((jid, i) => `${i + 1}. @${jid.split('@')[0]}`).join('\n')

    let text = `📋 *LIST BLACKLIST*\n\n${list}`

    await m.reply(text, null, { mentions: db.blacklist })
}

handler.help = ['listblacklist']
handler.tags = ['owner']
handler.command = /^listblacklist$/i
export default handler