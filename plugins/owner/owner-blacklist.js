import fs from 'fs'

let handler = async (m, { conn, text, isOwner, isAdmin }) => {
    // Cek permission: hanya owner atau admin grup
    if (!isOwner && !isAdmin) return m.reply('❌ Hanya owner atau admin grup yang bisa menggunakan fitur ini!')

    if (!text && !m.quoted) return m.reply('Contoh:\n• .blacklist (reply pesan user)\n• .blacklist 6281234567890')

    // Ambil target JID dari reply atau nomor
    let who
    if (m.quoted) who = m.quoted.sender
    else if (text) who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' // hanya nomor

    // Ambil database blacklist
    let db = global.db.data
    db.blacklist = db.blacklist || []

    if (db.blacklist.includes(who)) return m.reply('❌ User ini sudah diblacklist!')

    db.blacklist.push(who)

    fs.writeFileSync('./lib/database/blacklist.json', JSON.stringify(db.blacklist, null, 2))

    m.reply(`✅ Berhasil menambahkan user ke blacklist:\n@${who.split('@')[0]}`, null, { mentions: [who] })
}

handler.help = ['blacklist <reply|nomor>']
handler.tags = ['owner']
handler.command = /^blacklist$/i
handler.group = true
export default handler