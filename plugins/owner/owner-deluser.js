let handler = async (m, { conn, text }) => {
    let usersToDelete = []

    // 1. Ambil dari tag (mention)
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        usersToDelete.push(...m.mentionedJid)
    }

    // 2. Ambil dari pesan yang di-reply (quoted)
    if (m.quoted) {
        usersToDelete.push(m.quoted.sender)
    }

    // 3. Ambil dari nomor yang diketik manual
    if (text) {
        let numbers = text.replace(/[^0-9]/g, ' ').split(/\s+/).filter(v => v.length > 5)
        for (let num of numbers) {
            usersToDelete.push(num + '@s.whatsapp.net')
        }
    }

    // Bersihkan duplikat
    usersToDelete = [...new Set(usersToDelete)]

    if (usersToDelete.length === 0) {
        return conn.reply(m.chat, `*❏ DELETE USER*\n\nTag user, tulis nomor, atau balas chat member yang ingin dihapus datanya dari database.`, m)
    }

    let deletedList = []
    let notFoundList = []

    for (let user of usersToDelete) {
        let userData = global.db.data.users[user]
        
        if (userData) {
            // Cek ringkasan data yang dihapus
            let info = []
            if (userData.level !== undefined) info.push(`Lvl: ${userData.level}`)
            if (userData.money !== undefined) info.push(`Uang: ${userData.money}`)
            if (userData.limit !== undefined) info.push(`Limit: ${userData.limit}`)
            
            let dataSummary = info.length > 0 ? `(${info.join(', ')})` : `(Menghapus ${Object.keys(userData).length} record data)`
            
            delete global.db.data.users[user]
            deletedList.push(`- @${user.split('@')[0]} ${dataSummary}`)
        } else {
            notFoundList.push(`- @${user.split('@')[0]} (Tidak ada di database)`)
        }
    }

    let replyMsg = `*❏ HASIL DELETE USER*\n\n`
    if (deletedList.length > 0) {
        replyMsg += `✅ *Berhasil dihapus:*\n${deletedList.join('\n')}\n\n`
    }
    if (notFoundList.length > 0) {
        replyMsg += `❌ *Gagal (Data Kosong):*\n${notFoundList.join('\n')}`
    }

    conn.reply(m.chat, replyMsg.trim(), m, { 
        contextInfo: { 
            mentionedJid: usersToDelete 
        } 
    })
}

handler.help = ['deleteuser']
handler.tags = ['owner']
handler.command = /^(d(el)?(ete)?u(ser)?|ha?pu?su(ser)?)$/i
handler.owner = true

export default handler
