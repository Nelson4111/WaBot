let handler = async (m, { conn }) => {
    conn.tebaksurah = conn.tebaksurah || {}
    let id = m.chat
    
    if (!(id in conn.tebaksurah)) return m.reply('❌ Tidak ada soal tebak surah')

    let game = conn.tebaksurah[id]
    if (game[1].hint) return m.reply('❗ Bantuan sudah digunakan')

    game[1].hint = true
    let jwb = game[1].real
    
    let hint = jwb.split('').map(v => {
        if (v === ' ') return ' '
        return Math.random() > 0.4 ? '_' : v
    }).join(' ')

    m.reply(`\`\`\`${hint}\`\`\``)
}

handler.limit = true
handler.command = /^hsurah$/i

export default handler