import { generateWelcomeCard } from '../../lib/cardGenerator.js'

let handler = async (m, { conn, command, text, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('❌ Perintah ini hanya dapat digunakan di dalam grup!')
    if (!isAdmin && !isOwner) return m.reply('❌ Perintah ini khusus untuk Admin Grup / Owner Bot!')

    let targetUser = m.mentionedJid?.[0] || m.sender
    let isWelcome = /welcome/i.test(command)
    let chat = global.db.data.chats[m.chat] || {}

    m.reply(`⏳ *Simulasi ${isWelcome ? 'Welcome' : 'Goodbye'} Card...*`)

    // Panggil event handler utama via participantsUpdate
    try {
        await conn.participantsUpdate({
            id: m.chat,
            participants: [targetUser],
            action: isWelcome ? 'add' : 'remove'
        })
    } catch (e) {
        console.error('[TestWelcome] Error:', e)
    }

    // Jika fitur welcome grup sedang mati, tampilkan pesan petunjuk
    if (!chat.welcome) {
        m.reply(`💡 *Info:* Fitur welcome grup saat ini *NONAKTIF*.\nKetik *#welcome 1* untuk mengaktifkan welcome otomatis saat ada member join/keluar.`)
    }
}

handler.help = ['teswelcome [@user]', 'tesbye [@user]']
handler.tags = ['group']
handler.command = /^(tes|test)(welcome|bye|leave|goodbye)$/i
handler.group = true
handler.admin = true

export default handler
