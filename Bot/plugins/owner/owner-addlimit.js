let handler = async (m, { conn, args }) => {
    let who
    let amount

    if (!m.quoted && !args[0]) {
        let caption = `*Format Penggunaan Salah!*\n\n` +
                      `• *Reply Pesan:* .addlimit 10\n` +
                      `• *Gunakan Nomor:* .addlimit 628123456 10`
        return m.reply(caption)
    }

    if (m.quoted) {
        who = m.quoted.sender
        amount = parseInt(args[0])
    } else if (args[0] && args[1]) {
        let cleanNumber = args[0].replace(/[^0-9]/g, '')
        if (cleanNumber.length > 5) {
            who = cleanNumber + '@s.whatsapp.net'
            amount = parseInt(args[1])
        }
    }

    if (!who || isNaN(amount)) {
        let caption = `*Format Penggunaan Salah!*\n\n` +
                      `• *Reply Pesan:* .addlimit 10\n` +
                      `• *Gunakan Nomor:* .addlimit 628123456 10`
        return m.reply(caption)
    }
    
    if (who.endsWith('@lid')) {
        let jidDariLid = Object.keys(global.db.data.users).find(key => key.includes(who.split('@')[0]) && key.endsWith('@s.whatsapp.net'))
        if (jidDariLid) who = jidDariLid
    }

    let users = global.db.data.users
    if (!users[who]) {
        users[who] = {
            limit: 0,
            exp: 0,
            registered: false
        }
    }

    users[who].limit += amount

    let nomorAsli = who.split('@')[0]
    let pesan = `✅ *Limit Berhasil Ditambahkan*\n\n` +
                `User: @${nomorAsli}\n` +
                `Tambahan: ${amount}\n` +
                `Total Limit: ${users[who].limit}`
    
    conn.sendMessage(m.chat, { 
        text: pesan, 
        mentions: [who] 
    }, { quoted: m })
}

handler.help = ['addlimit']
handler.tags = ['owner']
handler.command = /^addlimit$/i
handler.owner = true

export default handler