let handler = async (m, { conn }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'tebakgambar-' + m.chat
    if (!(id in conn.game)) throw false
    let json = conn.game[id][1]
    m.reply('Clue : ' + '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```' + '\n\n_*Jangan Balas Chat Ini Tapi Balas Soalnya*_')
}
handler.command = /^hgamb$/i
handler.limit = true
handler.desc = 'Memberikan petunjuk atau bocoran huruf untuk kuis tebak tebakgambar.'
handler.tutorial = [
  '.hgamb',
  'Gunakan perintah ini saat kesulitan menjawab kuis tebakgambar di grup'
]

export default handler