let handler = async (m, { conn, args }) => {
    let who
    let amount

    // --- 1. PENENTUAN TARGET (WHO) ---
    if (m.quoted) {
        who = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]
    } else if (args[0]) {
        let cleanNumber = args[0].replace(/[^0-9]/g, '')
        if (cleanNumber.length > 5) {
            who = cleanNumber + '@s.whatsapp.net'
        }
    }

    // --- 2. PENENTUAN JUMLAH (AMOUNT) ---
    if (m.quoted) {
        amount = parseInt(args[0])
    } else {
        amount = parseInt(args[args.length - 1])
    }

    // --- 3. VALIDASI & FIX LID KE JID ---
    if (!who) throw 'Target tidak ditemukan! Tag orangnya atau ketik nomornya.'
    
    if (who.endsWith('@lid')) {
        let jidDariLid = Object.keys(global.db.data.users).find(key => key.includes(who.split('@')[0]) && key.endsWith('@s.whatsapp.net'))
        if (jidDariLid) {
            who = jidDariLid
        }
    }

    if (!amount || isNaN(amount)) throw 'Masukkan jumlah limit yang valid!'

    // --- 4. EKSEKUSI DATABASE ---
    let users = global.db.data.users
    if (!users[who]) {
        users[who] = {
            limit: 0,
            exp: 0,
            registered: false
        }
    }

    // Mengurangi limit (memastikan hasil tidak negatif)
    users[who].limit -= amount
    if (users[who].limit < 0) users[who].limit = 0

    // --- 5. RESPONSE ---
    let nomorAsli = who.split('@')[0]
    let pesan = `Limit Berhasil Dikurangi\n\n` +
                `User: @${nomorAsli}\n` +
                `Dikurangi: ${amount}\n` +
                `Sisa Limit: ${users[who].limit}`
    
    conn.sendMessage(m.chat, { 
        text: pesan, 
        mentions: [who] 
    }, { quoted: m })
}

handler.help = ['dellimit']
handler.tags = ['owner']
handler.command = /^(dellimit)$/i
handler.rowner = true

export default handler