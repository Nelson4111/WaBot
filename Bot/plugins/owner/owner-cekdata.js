let handler = async (m, { conn, text }) => {
    let who
    if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    } else {
        who = m.chat
    }
    
    if (!who && text) {
        let num = text.replace(/[^0-9]/g, '')
        if (num) who = num + '@s.whatsapp.net'
    }

    if (!who) return m.reply('Tag/Reply targetnya atau masukkan nomornya!')
    who = conn.decodeJid(who)

    let user = global.db.data.users[who]
    if (!user) return m.reply(`Data pengguna tidak ditemukan di database untuk JID: ${who}`)

    let output = {}
    output[who] = user
    m.reply(JSON.stringify(output, null, 2))
}
handler.help = ['cekdata']
handler.tags = ['owner']
handler.command = /^(cekdata|cekuser)$/i
handler.owner = true

export default handler
