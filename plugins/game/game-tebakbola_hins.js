let handler = async (m, { conn }) => {
    conn.tebakbola = conn.tebakbola || {}
    let id = m.chat
    
    if (!(id in conn.tebakbola)) return m.reply('❌ Tidak ada soal tebak bola')

    let game = conn.tebakbola[id]
    if (game[1].hint) return m.reply('_❗ bantuan sudah digunakan_')

    game[1].hint = true
    let jwb = game[1].jawaban
    let hint = jwb
        .split('')
        .map((v, i) => (i < 2 || v === ' ' ? v : '_'))
        .join(' ')

    m.reply(`*Bantuan (Huruf Awal):*\n\`${hint}\``)
}

handler.limit = true
handler.command = /^hbola$/i

export default handler