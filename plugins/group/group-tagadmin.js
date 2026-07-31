let handler = async (m, { conn, participants }) => {
    if (!m.isGroup)
        return m.reply('❌ Perintah ini khusus group')

    // ambil admin group
    let admins = participants
        .filter(p => p.admin)
        .map(p => p.id)

    if (!admins.length)
        return m.reply('❌ Tidak ada admin terdeteksi')

    let text = `📣 *TAG ADMIN GROUP*\n\n`
    let mentions = []

    let i = 1
    for (let jid of admins) {
        text += `${i}. @${jid.split('@')[0]}\n`
        mentions.push(jid)
        i++
    }

    text += `\n⚠️ Silakan admin merespon pesan ini`

    return conn.sendMessage(m.chat, {
        text,
        mentions
    }, { quoted: m })
}

handler.help = ['tagadmin']
handler.tags = ['group']
handler.command = /^tagadmin$/i

export default handler