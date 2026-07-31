let handler = async (m, { conn }) => {
    conn.tebakanime = conn.tebakanime || {}
    let id = m.chat
    
    if (!(id in conn.tebakanime)) return m.reply('❌ Tidak ada soal tebak anime')

    let game = conn.tebakanime[id]
    if (game[1].hint) return m.reply('❗ Hint sudah digunakan')

    game[1].hint = true
    let jwb = game[1].real
    
    let hint = jwb.split('').map(v => {
        if (v === ' ') return ' '
        return Math.random() > 0.4 ? '_' : v
    }).join(' ')

    m.reply(`\`\`\`${hint}\`\`\``)
}

handler.limit = true
handler.command = /^hanime$/i

export default handler