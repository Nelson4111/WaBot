let handler = async (m, { conn }) => {
    conn.tebaklagu = conn.tebaklagu || {}
    let id = m.chat
    
    if (!(id in conn.tebaklagu)) return m.reply('❌ Tidak ada soal tebak lagu')

    let game = conn.tebaklagu[id]
    if (game[1].hint) return m.reply('❗ bantuan sudah digunakan')

    game[1].hint = true
    let jwb = game[1].real
    
    let hint = jwb.split('').map(v => {
        if (v === ' ') return ' '
        return Math.random() > 0.4 ? '_' : v
    }).join(' ')

    m.reply(`\`\`\`${hint}\`\`\``)
}

handler.limit = true
handler.command = /^hlagu$/i

export default handler