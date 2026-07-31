let handler = async (m, { conn }) => {
    conn.tebakff = conn.tebakff || {}
    let id = m.chat
    
    if (!(id in conn.tebakff)) return m.reply('❌ Tidak ada soal tebakff')

    let game = conn.tebakff[id]
    if (game[1].hint) return m.reply('❗ Bantuan sudah digunakan')

    game[1].hint = true
    let jwb = game[1].jawaban
    let hint = jwb
        .split('')
        .map((v, i) => (i < 2 ? v : '_'))
        .join(' ')

    m.reply(`*Bantuan (2 Huruf Awal):*\n\`${hint}\``)
}

handler.limit = true
handler.command = /^hff$/i

export default handler