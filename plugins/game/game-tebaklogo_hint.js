let handler = async (m, { conn }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'tebaklogo-' + m.chat
    if (!(id in conn.game)) return
    let json = conn.game[id][1]
    m.reply('Clue : ' + '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```' + '\n\n_*Jangan Balas Chat Ini Tapi Balas Soalnya*_')
}
handler.command = /^hlogo$/i
handler.limit = true
handler.desc = 'Memberikan petunjuk atau bocoran huruf untuk kuis tebak tebaklogo.'
handler.tutorial = [
  '.hlogo',
  'Gunakan perintah ini saat kesulitan menjawab kuis tebaklogo di grup'
]

export default handler