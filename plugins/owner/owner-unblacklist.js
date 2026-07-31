import fs from 'fs'

let handler = async (m, { conn, text, isOwner, isAdmin }) => {
    // Cek permission
    if (!isOwner && !isAdmin) return m.reply('❌ Hanya owner atau admin grup yang bisa menggunakan fitur ini!')

    if (!text && !m.quoted) return m.reply('Contoh:\n• .unblacklist (reply pesan user)\n• .unblacklist 6281234567890')

    // Ambil target JID dari reply atau nomor
    let who
    if (m.quoted) who = m.quoted.sender
    else if (text) who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' // hanya nomor

    let db = global.db.data
    db.blacklist = db.blacklist || []

    if (!db.blacklist.includes(who)) return m.reply('❌ User ini tidak ada di blacklist!')

    db.blacklist = db.blacklist.filter(jid => jid !== who)

    fs.writeFileSync('./lib/database/blacklist.json', JSON.stringify(db.blacklist, null, 2))

    m.reply(`✅ Berhasil menghapus user dari blacklist:\n@${who.split('@')[0]}`, null, { mentions: [who] })
}

handler.help = ['unblacklist <reply|nomor>']
handler.tags = ['owner']
handler.command = /^unblacklist$/i
handler.group = true
export default handler